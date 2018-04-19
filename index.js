"use strict";

const execa = require("execa");
const weblog = require("webpack-log");

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

class ChildProcessWebpackPlugin {
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
      throw new TypeError("No events found");
    }

    this.log = weblog({
      level: this.options.logLevel,
      name: "execa-webpack-plugin"
    });
  }

  static buildError(error, process) {
    const { cmd } = process;
    const args = process.args || [];

    return new Error(
      `Process "${cmd}${args.length > 0 ? ` ${args.join(" ")}` : ""}" return ${
        error.message
      }`
    );
  }

  handleResult(result) {
    const { stdout, stderr } = result;

    if (stdout) {
      this.log.info(stdout);
    }

    if (stderr) {
      this.log.warn(stderr);
    }
  }

  handleError(error, process) {
    this.log.error(ChildProcessWebpackPlugin.buildError(error, process));

    if (this.options.bail) {
      throw error;
    }
  }

  runCommand(process, async) {
    const { cmd } = process;
    const args = process.args || [];
    const opts = process.opts || {};

    opts.stdio = ["ignore", "pipe", "pipe"];

    this.log.info(
      `Run process "${cmd}${args.length > 0 ? ` ${args.join(" ")}` : ""}"`
    );

    if (async) {
      return execa(cmd, args, opts)
        .then(asyncResult => {
          this.handleResult(asyncResult);

          return asyncResult;
        })
        .catch(error => {
          this.handleError(error, process);
        });
    }

    let result = null;

    try {
      result = execa.sync(cmd, args, opts);
    } catch (error) {
      this.handleError(error, process);
    }

    this.handleResult(result, cmd, args);

    return result.stdout;
  }

  execute(processes, async) {
    const results = [];

    processes.forEach(process => {
      const args = process.args || [];

      args.forEach((arg, index) => {
        if (typeof arg === "object" && Boolean(arg)) {
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
            item => (item[0].stdout ? item[0].stdout : item)
          );

          return this.runCommand(process, async);
        });
      } else {
        result = this.runCommand(process);
      }

      results.push(result);
    });

    return async
      ? Promise.all(results).catch(error => {
          this.handleError(error, process);
        })
      : results;
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

module.exports = ChildProcessWebpackPlugin;
