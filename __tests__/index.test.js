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
    mode: "development",
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
  } catch (ignoreError) {
    // Nothing
  }
}

function unlinkSyncSafe(dir) {
  try {
    fs.unlinkSync(dir);
  } catch (ignoreError) {
    // Nothing
  }
}

describe("execa-webpack-plugin", () => {
  const dir = path.join(__dirname, "dir");
  const otherDir = path.join(__dirname, "other-dir");

  it("should throw error when `onBuildStart`, `onBuildEnd` and `onBuildExit` options are empty", () =>
    expect(() => run()).toThrow());

  it("should works with `onBuildStart` option", () => {
    expect.assertions(2);
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
    expect.assertions(2);

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
    expect.assertions(2);

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
    expect.assertions(2);

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
    expect.assertions(2);

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
    expect.assertions(2);

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
    expect.assertions(1);

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

  it("should throw error with `bail: true` option (async)", () => {
    expect.assertions(1);

    let catchError = null;

    return run({
      bail: true,
      logLevel: "silent",
      onBuildExit: [
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

  it("should works and output 'stdout' and 'stderr' with `logLevel: 'info'` command (async)", () =>
    run({
      logLevel: "info",
      onBuildExit: [
        {
          args: [path.join(resourcesDir, "cli-stdout-stderr.js")],
          cmd: "node"
        }
      ]
    }));

  it("should works with nested commands", () => {
    expect.assertions(2);

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

  it("should works with deep nested commands", () => {
    expect.assertions(2);

    mkdirSyncSafe(dir);

    expect(fs.statSync(dir).isDirectory()).toBe(true);

    return run({
      onBuildStart: [
        {
          args: [
            {
              args: [
                {
                  args: [path.join(resourcesDir, "nested-nested.js")],
                  cmd: "node"
                }
              ],
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

  it("should works with multiple nested commands", () => {
    expect.assertions(4);

    mkdirSyncSafe(dir);
    mkdirSyncSafe(otherDir);

    expect(fs.statSync(dir).isDirectory()).toBe(true);
    expect(fs.statSync(otherDir).isDirectory()).toBe(true);

    return run({
      onBuildStart: [
        {
          args: [
            {
              args: [path.join(resourcesDir, "nested.js")],
              cmd: "node"
            },
            {
              args: [path.join(resourcesDir, "nested-other.js")],
              cmd: "node"
            }
          ],
          cmd: "del"
        }
      ]
    }).then(() => {
      expect(() => fs.statSync(dir)).toThrow();
      expect(() => fs.statSync(otherDir)).toThrow();

      unlinkSyncSafe(dir);
      unlinkSyncSafe(otherDir);

      return Promise.resolve();
    });
  });

  it("should works with nested commands (async)", () => {
    expect.assertions(2);

    mkdirSyncSafe(dir);

    expect(fs.statSync(dir).isDirectory()).toBe(true);

    return run({
      onBuildExit: [
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

  it("should works with deep nested commands (async)", () => {
    expect.assertions(2);

    mkdirSyncSafe(dir);

    expect(fs.statSync(dir).isDirectory()).toBe(true);

    return run({
      onBuildExit: [
        {
          args: [
            {
              args: [
                {
                  args: [path.join(resourcesDir, "nested-nested.js")],
                  cmd: "node"
                }
              ],
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

  it("should works with multiple nested commands (async)", () => {
    expect.assertions(4);

    mkdirSyncSafe(dir);
    mkdirSyncSafe(otherDir);

    expect(fs.statSync(dir).isDirectory()).toBe(true);
    expect(fs.statSync(otherDir).isDirectory()).toBe(true);

    return run({
      onBuildExit: [
        {
          args: [
            {
              args: [path.join(resourcesDir, "nested.js")],
              cmd: "node"
            },
            {
              args: [path.join(resourcesDir, "nested-other.js")],
              cmd: "node"
            }
          ],
          cmd: "del"
        }
      ]
    }).then(() => {
      expect(() => fs.statSync(dir)).toThrow();
      expect(() => fs.statSync(otherDir)).toThrow();

      unlinkSyncSafe(dir);
      unlinkSyncSafe(otherDir);

      return Promise.resolve();
    });
  });

  it("should works when nested commands return nothing and 'bail: false'", () => {
    expect.assertions(1);

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

  it("should works when nested commands return nothing and 'bail: false' (async)", () => {
    expect.assertions(1);

    let catchError = null;

    return run({
      bail: false,
      logLevel: "silent",
      onBuildExit: [
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
