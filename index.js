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

  execute(childProcesses) {
    const results = [];

    childProcesses.forEach(childProcess => {
      const { cmd } = childProcess;
      let { args, opts } = childProcess;
      let hasFailedNestedChildProcess = false;

      if (!args) {
        args = [];
      }

      args.forEach((arg, index) => {
        if (typeof arg === "object" && Boolean(arg)) {
          const nestedResults = this.execute([arg]);
          const [result] = nestedResults;

          if (!result || !result.stdout) {
            hasFailedNestedChildProcess = true;
          } else {
            args[index] = result.stdout;
          }
        }
      });

      let result = null;

      if (hasFailedNestedChildProcess) {
        results.push(result);

        return;
      }

      if (!opts) {
        opts = {};
      }

      opts.stdio = ["ignore", "pipe", "pipe"];

      this.log.info(
        `Run process "${cmd}${args.length > 0 ? ` ${args.join(" ")}` : ""}"`
      );

      try {
        result = execa.sync(cmd, args, opts);
      } catch (error) {
        this.log.error(
          new Error(
            `Process "${cmd}${
              args.length > 0 ? ` ${args.join(" ")}` : ""
            }" return ${error.message}`
          )
        );

        if (this.options.bail) {
          throw error;
        }
      }

      if (result) {
        const { stdout, stderr } = result;

        if (stdout) {
          this.log.info(result.stdout);
        }

        if (stderr) {
          this.log.warn(result.stderr);
        }
      }

      results.push(result);
    });

    return results;
  }

  apply(compiler) {
    if (this.options.bail === null) {
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

      if (compiler.hooks) {
        // Information: `beforeRun.asyncTap` in future major
        compiler.hooks.compile.tap(plugin, compileFn);
      } else {
        compiler.plugin("compile", compileFn);
      }
    }

    if (this.options.onBuildEnd.length > 0) {
      const afterEmitFn = (compilation, callback) => {
        this.execute(this.options.onBuildEnd);

        if (this.options.dev) {
          this.options.onBuildEnd = [];
        }

        callback();
      };

      if (compiler.hooks) {
        compiler.hooks.afterEmit.tapAsync(plugin, afterEmitFn);
      } else {
        compiler.plugin("after-emit", afterEmitFn);
      }
    }

    if (this.options.onBuildExit.length > 0) {
      const doneFn = () => {
        this.execute(this.options.onBuildExit);

        if (this.options.dev) {
          this.options.onBuildExit = [];
        }
      };

      if (compiler.hooks) {
        // Information: `asyncTap` in future major
        compiler.hooks.done.tap(plugin, doneFn);
      } else {
        compiler.plugin("done", doneFn);
      }
    }
  }
}

module.exports = ChildProcessWebpackPlugin;
