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

  execute(processes, async) {
    const results = [];

    processes.forEach(process => {
      const args = process.args || [];

      args.forEach((arg, index) => {
        if (
          typeof arg === "object" &&
          Boolean(arg) &&
          Object.keys(arg).length > 0
        ) {
          const commandResult = this.execute([arg], async);

          process.args[index] = Array.isArray(commandResult)
            ? commandResult[0]
            : commandResult;
        } else {
          process.args[index] = async ? Promise.resolve(arg) : arg;
        }
      });

      let result = null;

      if (async) {
        result = Promise.all(args).then(resolvedArgs => {
          process.args = resolvedArgs.map(
            item => (item[0] && item[0].stdout ? item[0].stdout : item)
          );

          return new CommandRunner(this.options).run(process, async);
        });
      } else {
        result = new CommandRunner(this.options).run(process, async);
      }

      results.push(result);
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
