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

  static buildError(error, cmd, args) {
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

  handleError(error, cmd, args) {
    this.log.error(ChildProcessWebpackPlugin.buildError(error, cmd, args));

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
          this.handleError(error, cmd, args);

          return null;
        });
    }

    let result = null;

    try {
      result = execa.sync(cmd, args, opts);
    } catch (error) {
      this.handleError(error);
    }

    this.handleResult(result, cmd, args);

    return result;
  }

  execute(processes, callback) {
    const results = [];
    const hasCallback = Boolean(callback);

    processes.forEach(process => {
      const args = process.args || [];
      let hasFailedNestedChildProcess = false;

      args.forEach((arg, index) => {
        if (typeof arg === "object" && Boolean(arg)) {
          const result = this.runCommand(arg);

          if (!result || !result.stdout) {
            hasFailedNestedChildProcess = true;
          } else {
            args[index] = result.stdout;
          }
        }
      });

      if (hasFailedNestedChildProcess) {
        // eslint-disable-next-line prefer-promise-reject-errors
        results.push(hasCallback ? Promise.reject() : null);

        return;
      }

      const result = this.runCommand(process, hasCallback);

      results.push(result);
    });

    // eslint-disable-next-line promise/no-callback-in-promise
    return hasCallback ? Promise.all(results).then(() => callback()) : results;
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
        const done = () => {
          if (this.options.dev) {
            this.options.onBuildEnd = [];
          }

          callback();
        };

        this.execute(this.options.onBuildEnd);

        return done();
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
        const done = () => {
          if (this.options.dev) {
            this.options.onBuildExit = [];
          }

          if (callback) {
            return callback();
          }
        };

        this.execute(this.options.onBuildExit, done);
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
