"use strict";

const os = require("os");
const pLimit = require("p-limit");
const CommandRunner = require("./CommandRunner");

const hookTypeMap = {
  onShouldEmit: false,
  onDone: true,
  // Only in webpack@5
  afterDone: false,
  onAdditionalPass: true,
  onBeforeRun: true,
  onRun: true,
  onEmit: true,
  onAssetEmitted: true,
  onAfterEmit: true,

  onThisCompilation: false,
  onCompilation: false,
  onNormalModuleFactory: false,
  onContextModuleFactory: false,

  onBeforeCompile: true,
  onCompile: false,
  onMake: true,
  onAfterCompile: true,

  onWatchRun: true,
  onFailed: false,
  onInvalid: false,
  onWatchClose: false,

  onInfrastructureLog: false,

  // Will be remove in `webpack@5`
  onEnvironment: false,
  // Will be remove in `webpack@5`
  onAfterEnvironment: false,
  // Will be remove in `webpack@5`
  onAfterPlugins: false,
  // Will be remove in `webpack@5`
  onAfterResolvers: false,
  // Will be remove in `webpack@5`
  onEntryOption: false
};

class ExecaPlugin {
  constructor(options) {
    const defaultOptions = { bail: null, dev: true };

    this.options = { ...defaultOptions, ...options };
    this.hookMap = {};

    Object.keys(this.options).forEach(option => {
      const isHook = option.startsWith("on");

      if (!isHook) {
        return;
      }

      this.hookMap[option] = this.options[option];
    });

    if (Object.keys(this.hookMap).length === 0) {
      throw new TypeError("No known hooks found");
    }
  }

  static getWebpackHookName(str) {
    const hookName = str.slice(2);

    return hookName.slice(0, 1).toLowerCase() + hookName.slice(1);
  }

  static getConcurrency() {
    // In some cases cpus() returns undefined
    // https://github.com/nodejs/node/issues/19022
    const cpus = os.cpus() || { length: 1 };

    return Math.max(1, cpus.length - 1);
  }

  static getStdout(result) {
    return result && typeof result.stdout !== "undefined" ? result.stdout : "";
  }

  runCommands(hook, isAsync) {
    const optionsForCommand = { bail: this.options.bail, logger: this.logger };

    const runCommand = (command, asArg = false) => {
      if (!command.args) {
        command.args = [];
      }

      command.args = command.args.map(arg => {
        if (arg !== null && typeof arg === "object") {
          const argResult = runCommand(arg, true);

          if (isAsync) {
            return argResult.then(returnedValue =>
              ExecaPlugin.getStdout(returnedValue)
            );
          }

          return ExecaPlugin.getStdout(argResult);
        }

        return arg;
      });

      if (isAsync) {
        return Promise.all(command.args).then(resolvedArgs => {
          command.args = resolvedArgs;

          return new CommandRunner(optionsForCommand).run(
            command,
            isAsync,
            asArg
          );
        });
      }

      return new CommandRunner(optionsForCommand).run(command, isAsync, asArg);
    };

    const concurrency = ExecaPlugin.getConcurrency();
    const limit = pLimit(concurrency);
    const commands = this.hookMap[hook];

    if (commands.length === 0) {
      this.logger.warn(
        `No commands found for the "${ExecaPlugin.getWebpackHookName(
          hook
        )}" hook`
      );

      return [];
    }

    const results = commands
      .filter(command => {
        if (this.options.dev) {
          return Boolean(command.executed) === false;
        }

        return true;
      })
      .map(command => {
        if (isAsync) {
          return limit(() =>
            runCommand(command).then(result => {
              command.executed = true;

              return result;
            })
          );
        }

        const result = runCommand(command);

        command.executed = true;

        return result;
      });

    return isAsync ? Promise.all(results) : results;
  }

  apply(compiler) {
    if (typeof this.options.bail !== "boolean") {
      this.options.bail = compiler.options.bail;
    }

    this.logger = compiler.getInfrastructureLogger(this.constructor.name);

    Object.keys(this.hookMap).forEach(hook => {
      const webpackHook = ExecaPlugin.getWebpackHookName(hook);
      const isAsyncHook = hookTypeMap[hook];

      if (!compiler.hooks[webpackHook]) {
        throw new Error(`The hook "${webpackHook}" not found`);
      }

      if (webpackHook === "infrastructureLog") {
        throw new Error(`Do not use the "${webpackHook}" hook`);
      }

      compiler.hooks[webpackHook][isAsyncHook ? "tapAsync" : "tap"](
        { name: this.constructor.name },
        (...args) => {
          this.logger.log(`Running the "${webpackHook}" hook`);

          // eslint-disable-next-line consistent-return
          const doneFn = error => {
            this.logger.log(`The "${webpackHook}" hook completed`);

            if (isAsyncHook) {
              const callback = args[args.length - 1];

              return callback(error || null);
            }

            if (error) {
              throw error;
            }
          };

          if (isAsyncHook) {
            return this.runCommands(hook, true)
              .then(() => doneFn())
              .catch(error => doneFn(error));
          }

          try {
            this.runCommands(hook, false);
          } catch (error) {
            return doneFn(error);
          }

          return doneFn();
        }
      );
    });
  }
}

module.exports = ExecaPlugin;
