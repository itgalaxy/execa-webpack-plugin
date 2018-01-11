"use strict";

const webpack = require("webpack");
const path = require("path");
const tempy = require("tempy");
const fs = require("fs");
const ExecaPlugin = require("..");

const resourcesDir = path.join(__dirname, "resources");

function getConfig(options = {}) {
  return {
    entry: path.join(resourcesDir, "app.js"),
    output: {
      filename: "bundle.js",
      path: tempy.directory()
    },
    plugins: [new ExecaPlugin(options)]
  };
}

function run(options) {
  const compiler = webpack(getConfig(options));

  return new Promise((resolve, reject) => {
    compiler.run((error, stats) => {
      if (error) {
        return reject(error);
      }

      return resolve(stats);
    });
  });
}

/* eslint-disable no-sync */

function mkdirSyncSafe(dir) {
  try {
    fs.mkdirSync(dir);
    // eslint-disable-next-line unicorn/catch-error-name
  } catch (ignoreError) {
    // Nothing
  }
}

function unlinkSyncSafe(dir) {
  try {
    fs.unlinkSync(dir);
    // eslint-disable-next-line unicorn/catch-error-name
  } catch (ignoreError) {
    // Nothing
  }
}

describe("execa-webpack-plugin", () => {
  const dir = path.join(__dirname, "dir");

  it("should throw error when `onBuildStart`, `onBuildEnd` and `onBuildExit` options are empty", () =>
    expect(() => run()).toThrow());

  it("should works with `onBuildStart` option", () => {
    mkdirSyncSafe(dir);

    expect(fs.statSync(dir).isDirectory()).toBe(true);

    return run({
      onBuildStart: [
        {
          args: [dir],
          cmd: "del"
        }
      ]
    }).then(() => {
      expect(() => fs.statSync(dir)).toThrow();

      unlinkSyncSafe(dir);

      return Promise.resolve();
    });
  });

  it("should works with `onBuildStart` and `dev` is `false` option", () => {
    mkdirSyncSafe(dir);

    expect(fs.statSync(dir).isDirectory()).toBe(true);

    return run({
      dev: false,
      onBuildStart: [
        {
          args: [dir],
          cmd: "del"
        }
      ]
    }).then(() => {
      expect(() => fs.statSync(dir)).toThrow();

      unlinkSyncSafe(dir);

      return Promise.resolve();
    });
  });

  it("should works with `onBuildEnd` option", () => {
    mkdirSyncSafe(dir);

    expect(fs.statSync(dir).isDirectory()).toBe(true);

    return run({
      onBuildEnd: [
        {
          args: [dir],
          cmd: "del"
        }
      ]
    }).then(() => {
      expect(() => fs.statSync(dir)).toThrow();

      unlinkSyncSafe(dir);

      return Promise.resolve();
    });
  });

  it("should works with `onBuildEnd` and `dev` is `false` options", () => {
    mkdirSyncSafe(dir);

    expect(fs.statSync(dir).isDirectory()).toBe(true);

    return run({
      dev: false,
      onBuildEnd: [
        {
          args: [dir],
          cmd: "del"
        }
      ]
    }).then(() => {
      expect(() => fs.statSync(dir)).toThrow();

      unlinkSyncSafe(dir);

      return Promise.resolve();
    });
  });

  it("should works with `onBuildExit` option", () => {
    mkdirSyncSafe(dir);

    expect(fs.statSync(dir).isDirectory()).toBe(true);

    return run({
      onBuildExit: [
        {
          args: [dir],
          cmd: "del"
        }
      ]
    }).then(() => {
      expect(() => fs.statSync(dir)).toThrow();

      unlinkSyncSafe(dir);

      return Promise.resolve();
    });
  });

  it("should works with `onBuildExit` and `dev` is `false` options", () => {
    mkdirSyncSafe(dir);

    expect(fs.statSync(dir).isDirectory()).toBe(true);

    return run({
      dev: false,
      onBuildExit: [
        {
          args: [dir],
          cmd: "del"
        }
      ]
    }).then(() => {
      expect(() => fs.statSync(dir)).toThrow();

      unlinkSyncSafe(dir);

      return Promise.resolve();
    });
  });

  it("should throw error with `bail: true` option", () => {
    let catchError = null;

    return run({
      bail: true,
      logLevel: "silent",
      onBuildStart: [
        {
          cmd: "not-found"
        }
      ]
    })
      .catch(error => {
        catchError = error;

        return Promise.resolve();
      })
      .then(() => {
        // execa not return error instanceOf Error
        // expect(catchError).toBeInstanceOf(Error);
        expect(catchError).not.toBeNull();

        return Promise.resolve();
      });
  });

  it("should works and output 'stdout' and 'stderr' with `logLevel: 'info'` command", () =>
    run({
      logLevel: "info",
      onBuildStart: [
        {
          args: [path.join(resourcesDir, "cli-stdout-stderr.js")],
          cmd: "node"
        }
      ]
    }));

  it("should works with nested commands", () => {
    mkdirSyncSafe(dir);

    expect(fs.statSync(dir).isDirectory()).toBe(true);

    return run({
      onBuildStart: [
        {
          args: [
            {
              args: [path.join(resourcesDir, "nested.js")],
              cmd: "node"
            }
          ],
          cmd: "del"
        }
      ]
    }).then(() => {
      expect(() => fs.statSync(dir)).toThrow();

      unlinkSyncSafe(dir);

      return Promise.resolve();
    });
  });

  it("should works when nested commands return nothing and 'bail: false'", () => {
    let catchError = null;

    return run({
      bail: false,
      logLevel: "silent",
      onBuildStart: [
        {
          args: [
            {
              args: [path.join(resourcesDir, "nothing.js")],
              cmd: "node"
            }
          ],
          cmd: "del"
        }
      ]
    })
      .catch(error => {
        catchError = error;

        return Promise.resolve();
      })
      .then(() => {
        expect(catchError).toBeNull();

        return Promise.resolve();
      });
  });
});
