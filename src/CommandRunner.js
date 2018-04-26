"use strict";

const execa = require("execa");
const weblog = require("webpack-log");

class CommandRunner {
  constructor(options) {
    this.options = options;
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
    this.log.error(CommandRunner.buildError(error, process));

    if (this.options.bail) {
      throw error;
    }
  }

  run(process, async) {
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
}

module.exports = CommandRunner;
