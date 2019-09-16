"use strict";

const execa = require("execa");

class CommandRunner {
  constructor(options) {
    this.options = options;
  }

  static buildError(error, command) {
    const { cmd, args } = command;

    return new Error(
      `Command "${cmd}${args.length > 0 ? ` ${args.join(" ")}` : ""}" return "${
        error.message
      }"`
    );
  }

  handleResult(result) {
    if (!result) {
      return;
    }

    const { stdout, stderr } = result;

    if (stdout) {
      this.options.logger.info(
        `The output of the process on stdout: ${stdout}`
      );
    }

    if (stderr) {
      this.options.logger.warn(
        `The output of the process on stderr: ${stderr}`
      );
    }
  }

  handleError(error, command) {
    this.options.logger.error(CommandRunner.buildError(error, command));

    if (this.options.bail) {
      throw error;
    }
  }

  run(command, isAsync, asArg) {
    const { cmd, args = [], options = {} } = command;

    options.stdio = ["ignore", "pipe", "pipe"];

    this.options.logger.info(
      `Run command "${cmd}${args.length > 0 ? ` ${args.join(" ")}` : ""}" ${
        asArg ? "(the result will be used as an argument)" : ""
      }`
    );

    if (isAsync) {
      return execa(cmd, args, options)
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
      result = execa.sync(cmd, args, options);
    } catch (error) {
      this.handleError(error, command);
    }

    this.handleResult(result, cmd, args);

    return result;
  }
}

module.exports = CommandRunner;
