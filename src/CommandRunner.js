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

  static buildError(error, command) {
    const { cmd } = command;
    const args = command.args || [];

    return new Error(
      `Command "${cmd}${args.length > 0 ? ` ${args.join(" ")}` : ""}" return ${
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

  handleError(error, command) {
    this.log.error(CommandRunner.buildError(error, command));

    if (this.options.bail) {
      throw error;
    }
  }

  run(command, async) {
    const { cmd } = command;
    const args = command.args || [];
    const opts = command.opts || {};

    opts.stdio = ["ignore", "pipe", "pipe"];

    this.log.info(
      `Run command "${cmd}${args.length > 0 ? ` ${args.join(" ")}` : ""}"`
    );

    if (async) {
      return execa(cmd, args, opts)
        .then(asyncResult => {
          this.handleResult(asyncResult);

          return asyncResult;
        })
        .catch(error => {
          this.handleError(error, command);
        });
    }

    let result = null;

    try {
      result = execa.sync(cmd, args, opts);
    } catch (error) {
      this.handleError(error, command);
    }

    this.handleResult(result, cmd, args);

    return result.stdout;
  }
}

module.exports = CommandRunner;
