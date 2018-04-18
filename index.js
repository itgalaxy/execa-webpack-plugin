"use strict";

const execa = require("execa");
const weblog = require("webpack-log");

class ChildProcessWebpackPlugin {
  constructor(options) {
    const defaultOptions = {
      bail: null,
      dev: true,
      logLevel: "warn",
      onBuildEnd: [],
      onBuildExit: [],
      onBuildStart: []
    };

    this.options = Object.assign(defaultOptions, options);

    if (
      this.options.onBuildStart.length === 0 &&
      this.options.onBuildEnd.length === 0 &&
      this.options.onBuildExit.length === 0
    ) {
      throw new TypeError(
        "One of `onBuildStart`, `onBuildEnd` or `onBuildExit` should be not empty"
      );
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
    if (!result) {
      return;
    }

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

    if (this.options.onBuildStart.length > 0) {
      const compileFn = () => {
        this.execute(this.options.onBuildStart);

        if (this.options.dev) {
          this.options.onBuildStart = [];
        }
      };

      /* istanbul ignore else */
      if (compiler.hooks) {
        // Information: `beforeRun.asyncTap` in future major
        compiler.hooks.compile.tap(plugin, compileFn);
      } else {
        compiler.plugin("compile", compileFn);
      }
    }

    if (this.options.onBuildEnd.length > 0) {
      const afterEmitFn = (compilation, callback) => {
        const done = error => {
          if (this.options.dev) {
            this.options.onBuildEnd = [];
          }

          callback(error);
        };

        this.execute(this.options.onBuildEnd, true)
          // eslint-disable-next-line promise/no-callback-in-promise
          .then(() => done())
          // eslint-disable-next-line promise/no-callback-in-promise
          .catch(error => done(error));
      };

      /* istanbul ignore else */
      if (compiler.hooks) {
        compiler.hooks.afterEmit.tapAsync(plugin, afterEmitFn);
      } else {
        compiler.plugin("after-emit", afterEmitFn);
      }
    }

    if (this.options.onBuildExit.length > 0) {
      const doneFn = (stats, callback) => {
        // eslint-disable-next-line consistent-return
        const done = error => {
          if (this.options.dev) {
            this.options.onBuildExit = [];
          }

          if (callback) {
            return callback(error);
          }
        };

        this.execute(this.options.onBuildExit, true)
          // eslint-disable-next-line promise/no-callback-in-promise
          .then(() => done())
          // eslint-disable-next-line promise/no-callback-in-promise
          .catch(error => done(error));
      };

      /* istanbul ignore else */
      if (compiler.hooks) {
        // Information: `asyncTap` in future major
        compiler.hooks.done.tapAsync(plugin, doneFn);
      } else {
        compiler.plugin("done", doneFn);
      }
    }
  }
}

module.exports = ChildProcessWebpackPlugin;
