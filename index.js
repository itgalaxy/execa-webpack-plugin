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

          if (!result.stdout) {
            hasFailedNestedChildProcess = true;

            const error = new Error(
              `Nested process "${arg.cmd} ${arg.args.join(
                " "
              )}" did not return anything`
            );

            this.log.error(error);

            if (this.options.bail) {
              throw error;
            }
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
        this.log.error(error);

        if (this.options.bail) {
          throw error;
        }
      }

      const { stdout, stderr } = result;

      if (stdout) {
        this.log.info(result.stdout);
      }

      if (stderr) {
        this.log.warn(result.stderr);
      }

      results.push(result);
    });

    return results;
  }

  apply(compiler) {
    if (this.options.bail === null) {
      this.options.bail = compiler.options.bail;
    }

    compiler.plugin("compile", () => {
      if (this.options.onBuildStart.length > 0) {
        this.execute(this.options.onBuildStart);

        if (this.options.dev) {
          this.options.onBuildStart = [];
        }
      }
    });

    compiler.plugin("after-emit", (compilation, callback) => {
      if (this.options.onBuildEnd.length > 0) {
        this.execute(this.options.onBuildEnd);

        if (this.options.dev) {
          this.options.onBuildEnd = [];
        }
      }

      callback();
    });

    compiler.plugin("done", () => {
      if (this.options.onBuildExit.length > 0) {
        this.execute(this.options.onBuildExit);

        if (this.options.dev) {
          this.options.onBuildExit = [];
        }
      }
    });
  }
}

module.exports = ChildProcessWebpackPlugin;
