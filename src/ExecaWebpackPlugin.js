"use strict";

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

function firstToLowerCase(str) {
  return str.slice(0, 1).toLowerCase() + str.slice(1);
}

function getStdout(result) {
  return result && typeof result.stdout !== "undefined" ? result.stdout : "";
}

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

  runCommands(commands, isAsync) {
    const optionsForCommand = { bail: this.options.bail, logger: this.logger };

    const runCommand = (command, asArg = false) => {
      if (!command.args) {
        command.args = [];
      }

      command.args = command.args.map(arg => {
        if (arg !== null && typeof arg === "object") {
          const argResult = runCommand(arg, true);

          if (isAsync) {
            return argResult.then(returnedValue => getStdout(returnedValue));
          }

          return getStdout(argResult);
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

    const results = commands.map(command => runCommand(command));

    return isAsync ? Promise.all(results) : results;
  }

  apply(compiler) {
    if (typeof this.options.bail !== "boolean") {
      this.options.bail = compiler.options.bail;
    }

    this.logger = compiler.getInfrastructureLogger(this.constructor.name);

    Object.keys(this.hookMap).forEach(hook => {
      const webpackHook = firstToLowerCase(hook.slice(2));
      const isAsyncHook = hookTypeMap[hook];

      if (!compiler.hooks[webpackHook]) {
        throw new Error(`The hook "${webpackHook}" not found`);
      }

      if (webpackHook === "infrastructureLog") {
        throw new Error(`Do not use "${webpackHook}" hook`);
      }

      compiler.hooks[webpackHook][isAsyncHook ? "tapAsync" : "tap"](
        { name: this.constructor.name },
        (...args) => {
          this.logger.log(`Running the "${webpackHook}" hook`);

          // eslint-disable-next-line consistent-return
          const doneFn = error => {
            this.logger.log(`The "${webpackHook}" hook completed`);

            if (this.options.dev) {
              this.hookMap[hook] = [];
            }

            if (isAsyncHook) {
              const callback = args[args.length - 1];

              return callback(error || null);
            }

            if (error) {
              throw error;
            }
          };

          if (this.hookMap[hook].length === 0) {
            this.logger.warn(`No commands found for "${webpackHook}" hook`);

            return doneFn();
          }

          if (isAsyncHook) {
            return this.runCommands(this.hookMap[hook], true)
              .then(() => doneFn())
              .catch(error => doneFn(error));
          }

          try {
            this.runCommands(this.hookMap[hook], false);
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
