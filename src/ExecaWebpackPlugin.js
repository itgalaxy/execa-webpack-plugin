"use strict";

const CommandRunner = require("./CommandRunner");

const eventTypeMap = {
  onAdditionalPass: true,
  onAfterCompile: true,
  onAfterEmit: true,
  onBeforeCompile: true,
  onBeforeRun: true,
  onCompilation: false,
  onCompile: false,
  onContextModuleFactory: false,
  onDone: true,
  onEmit: true,
  onFailed: false,
  onInvalid: false,
  onMake: true,
  onNormalModuleFactory: false,
  onRun: true,
  onShouldEmit: false,
  onThisCompilation: false,
  onWatchClose: false,
  onWatchRun: true,

  // Will be remove in `webpack@5`
  /* eslint-disable sort-keys */
  onEnvironment: false,
  onAfterEnvironment: false,
  onAfterPlugins: false,
  onAfterResolvers: false,
  onEntryOption: false
  /* eslint-enable sort-keys */
};

function firstToLowerCase(str) {
  return str.substr(0, 1).toLowerCase() + str.substr(1);
}

class ExecaWebpackPlugin {
  constructor(options) {
    const defaultOptions = {
      bail: null,
      dev: true,
      logLevel: "warn"
    };

    this.options = Object.assign(defaultOptions, options);
    this.eventMap = {};

    Object.keys(this.options).forEach(eventType => {
      if (eventType.startsWith("on")) {
        this.eventMap[eventType] = this.options[eventType];
      }
    });

    if (Object.keys(this.eventMap).length === 0) {
      throw new TypeError("Known events not found");
    }
  }

  execute(commands, async) {
    const results = [];
    const runCommand = command => {
      if (async) {
        return Promise.all(command.args).then(resolvedArgs => {
          command.args = resolvedArgs.map(
            item => (item[0] && item[0].stdout ? item[0].stdout : item)
          );

          return new CommandRunner(this.options).run(command, async);
        });
      }

      return new CommandRunner(this.options).run(command, async);
    };

    commands.forEach(command => {
      if (command.args) {
        command.args = command.args.map(arg => {
          if (
            typeof arg === "object" &&
            Boolean(arg) &&
            Object.keys(arg).length > 0
          ) {
            const commandResult = this.execute([arg], async);

            return Array.isArray(commandResult)
              ? commandResult[0]
              : commandResult;
          }

          return async ? Promise.resolve(arg) : arg;
        });
      } else {
        command.args = [];
      }

      results.push(runCommand(command));
    });

    return async ? Promise.all(results) : results;
  }

  apply(compiler) {
    if (typeof this.options.bail !== "boolean") {
      this.options.bail = compiler.options.bail;
    }

    const plugin = { name: "ExecaPlugin" };

    Object.keys(this.eventMap).forEach(event => {
      const webpackEvent = firstToLowerCase(event.substr(2));
      const isAsyncEventType = eventTypeMap[event];

      const runCommands = (something, callback) => {
        // eslint-disable-next-line consistent-return
        const doneFn = error => {
          if (this.options.dev) {
            this.eventMap[event] = [];
          }

          if (isAsyncEventType) {
            return callback(error || null);
          }

          if (error) {
            throw error;
          }
        };

        if (isAsyncEventType) {
          this.execute(this.eventMap[event], true)
            .then(() => doneFn())
            .catch(error => doneFn(error));
        } else {
          try {
            this.execute(this.eventMap[event]);
          } catch (error) {
            doneFn(error);
          }

          doneFn();
        }
      };

      compiler.hooks[webpackEvent][isAsyncEventType ? "tapAsync" : "tap"](
        plugin,
        runCommands
      );
    });
  }
}

module.exports = ExecaWebpackPlugin;
