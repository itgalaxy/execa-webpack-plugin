"use strict";

const webpack = require("webpack");
const path = require("path");
const tempy = require("tempy");
const fs = require("fs");
const ExecaPlugin = require("../src/ExecaWebpackPlugin");

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

  it("should throw error on `on*` options are empty (no events)", () =>
    expect(() => run()).toThrow());

  it("should throw error invalid `onFooBar` option (no events)", () =>
    expect(() =>
      run({
        onFooBar: [
          {
            args: [path.join(resourcesDir, "nothing.js")],
            cmd: "node"
          }
        ]
      })
    ).toThrow());

  it("should works with `on*` options", () =>
    run({
      onAdditionalPass: [
        {
          args: [path.join(resourcesDir, "nothing.js")],
          cmd: "node"
        }
      ],
      onAfterCompile: [
        {
          args: [path.join(resourcesDir, "nothing.js")],
          cmd: "node"
        }
      ],
      onAfterEmit: [
        {
          args: [path.join(resourcesDir, "nothing.js")],
          cmd: "node"
        }
      ],
      onBeforeCompile: [
        {
          args: [path.join(resourcesDir, "nothing.js")],
          cmd: "node"
        }
      ],
      onBeforeRun: [
        {
          args: [path.join(resourcesDir, "nothing.js")],
          cmd: "node"
        }
      ],
      onCompilation: [
        {
          args: [path.join(resourcesDir, "nothing.js")],
          cmd: "node"
        }
      ],
      onCompile: [
        {
          args: [path.join(resourcesDir, "nothing.js")],
          cmd: "node"
        }
      ],
      onContextModuleFactory: [
        {
          args: [path.join(resourcesDir, "nothing.js")],
          cmd: "node"
        }
      ],
      onDone: [
        {
          args: [path.join(resourcesDir, "nothing.js")],
          cmd: "node"
        }
      ], // in `webpack@3` is sync
      onEmit: [
        {
          args: [path.join(resourcesDir, "nothing.js")],
          cmd: "node"
        }
      ],
      onFailed: [
        {
          args: [path.join(resourcesDir, "nothing.js")],
          cmd: "node"
        }
      ],
      onInvalid: [
        {
          args: [path.join(resourcesDir, "nothing.js")],
          cmd: "node"
        }
      ],
      onMake: [
        {
          args: [path.join(resourcesDir, "nothing.js")],
          cmd: "node"
        }
      ],
      onNormalModuleFactory: [
        {
          args: [path.join(resourcesDir, "nothing.js")],
          cmd: "node"
        }
      ],
      onRun: [
        {
          args: [path.join(resourcesDir, "nothing.js")],
          cmd: "node"
        }
      ],
      onShouldEmit: [
        {
          args: [path.join(resourcesDir, "nothing.js")],
          cmd: "node"
        }
      ],
      onThisCompilation: [
        {
          args: [path.join(resourcesDir, "nothing.js")],
          cmd: "node"
        }
      ],
      onWatchClose: [
        {
          args: [path.join(resourcesDir, "nothing.js")],
          cmd: "node"
        }
      ],
      onWatchRun: [
        {
          args: [path.join(resourcesDir, "nothing.js")],
          cmd: "node"
        }
      ],

      // Will be remove in `webpack@5`
      /* eslint-disable sort-keys */
      onEnvironment: [
        {
          args: [path.join(resourcesDir, "nothing.js")],
          cmd: "node"
        }
      ],
      onAfterEnvironment: [
        {
          args: [path.join(resourcesDir, "nothing.js")],
          cmd: "node"
        }
      ],
      onAfterPlugins: [
        {
          args: [path.join(resourcesDir, "nothing.js")],
          cmd: "node"
        }
      ],
      onAfterResolvers: [
        {
          args: [path.join(resourcesDir, "nothing.js")],
          cmd: "node"
        }
      ],
      onEntryOption: [
        {
          args: [path.join(resourcesDir, "nothing.js")],
          cmd: "node"
        }
      ]
      /* eslint-enable sort-keys */
    }));

  // Need found ways how check `this.eventMap.onCompile` on empty
  it("should works with `onCompile` option (sync event)", () => {
    expect.assertions(2);
    mkdirSyncSafe(dir);

    expect(fs.statSync(dir).isDirectory()).toBe(true);

    return run({
      onCompile: [
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

  it("should works with `onCompile` option with empty argument (sync event) ", () => {
    expect.assertions(2);

    mkdirSyncSafe(dir);

    expect(fs.statSync(dir).isDirectory()).toBe(true);

    return run({
      onCompile: [
        {
          args: [dir, "", [], {}],
          cmd: "del"
        }
      ]
    }).then(() => {
      expect(() => fs.statSync(dir)).toThrow();

      unlinkSyncSafe(dir);

      return Promise.resolve();
    });
  });

  it("should works with `onCompile` and `dev` is `false` option (sync event)", () => {
    expect.assertions(2);

    mkdirSyncSafe(dir);

    expect(fs.statSync(dir).isDirectory()).toBe(true);

    return run({
      dev: false,
      onCompile: [
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

  // Need found ways how check `this.eventMap.onDone` on empty
  it("should works with `onDone` option (async event)", () => {
    expect.assertions(2);

    mkdirSyncSafe(dir);

    expect(fs.statSync(dir).isDirectory()).toBe(true);

    return run({
      onDone: [
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

  it("should works with `onDone` option with empty argument (async event) ", () => {
    expect.assertions(2);

    mkdirSyncSafe(dir);

    expect(fs.statSync(dir).isDirectory()).toBe(true);

    return run({
      onDone: [
        {
          args: [dir, "", [], {}],
          cmd: "del"
        }
      ]
    }).then(() => {
      expect(() => fs.statSync(dir)).toThrow();

      unlinkSyncSafe(dir);

      return Promise.resolve();
    });
  });

  it("should works with `onDone` and `dev` is `false` options (async event)", () => {
    expect.assertions(2);

    mkdirSyncSafe(dir);

    expect(fs.statSync(dir).isDirectory()).toBe(true);

    return run({
      dev: false,
      onDone: [
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

  it("should throw error with `bail: true` option (sync event)", () => {
    expect.assertions(1);

    let catchError = null;

    return run({
      bail: true,
      logLevel: "silent",
      onCompile: [
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

  it("should throw error with `bail: true` option (async event)", () => {
    expect.assertions(1);

    let catchError = null;

    return run({
      bail: true,
      logLevel: "silent",
      onDone: [
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

  it("should not throw error with `bail: false` option (sync event)", () => {
    expect.assertions(1);

    let catchError = null;

    return run({
      bail: false,
      logLevel: "silent",
      onCompile: [
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
        expect(catchError).toBeNull();

        return Promise.resolve();
      });
  });

  it("should not throw error with `bail: false` option (async event)", () => {
    expect.assertions(1);

    let catchError = null;

    return run({
      bail: false,
      logLevel: "silent",
      onDone: [
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
        expect(catchError).toBeNull();

        return Promise.resolve();
      });
  });

  it("should works and output 'stdout' and 'stderr' with `logLevel: 'info'` command (sync event)", () =>
    run({
      logLevel: "info",
      onCompile: [
        {
          args: [path.join(resourcesDir, "cli-stdout-stderr.js")],
          cmd: "node"
        }
      ]
    }));

  it("should works and output 'stdout' and 'stderr' with `logLevel: 'info'` command (async event)", () =>
    run({
      logLevel: "info",
      onDone: [
        {
          args: [path.join(resourcesDir, "cli-stdout-stderr.js")],
          cmd: "node"
        }
      ]
    }));

  it("should works with nested commands (sync event)", () => {
    expect.assertions(2);

    mkdirSyncSafe(dir);

    expect(fs.statSync(dir).isDirectory()).toBe(true);

    return run({
      onCompile: [
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

  it("should works with deep nested commands (sync event)", () => {
    expect.assertions(2);

    mkdirSyncSafe(dir);

    expect(fs.statSync(dir).isDirectory()).toBe(true);

    return run({
      onCompile: [
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

  it("should works with multiple nested commands(sync event)", () => {
    expect.assertions(4);

    mkdirSyncSafe(dir);
    mkdirSyncSafe(otherDir);

    expect(fs.statSync(dir).isDirectory()).toBe(true);
    expect(fs.statSync(otherDir).isDirectory()).toBe(true);

    return run({
      onCompile: [
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

  it("should works with nested commands (async event)", () => {
    expect.assertions(2);

    mkdirSyncSafe(dir);

    expect(fs.statSync(dir).isDirectory()).toBe(true);

    return run({
      onDone: [
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

  it("should works with deep nested commands (async event)", () => {
    expect.assertions(2);

    mkdirSyncSafe(dir);

    expect(fs.statSync(dir).isDirectory()).toBe(true);

    return run({
      onDone: [
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

  it("should works with multiple nested commands (async event)", () => {
    expect.assertions(4);

    mkdirSyncSafe(dir);
    mkdirSyncSafe(otherDir);

    expect(fs.statSync(dir).isDirectory()).toBe(true);
    expect(fs.statSync(otherDir).isDirectory()).toBe(true);

    return run({
      onDone: [
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

  it("should works when nested commands return nothing and 'bail: false' (sync event)", () => {
    expect.assertions(1);

    let catchError = null;

    return run({
      bail: false,
      logLevel: "silent",
      onCompile: [
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

  it("should works when nested commands return nothing and 'bail: false' (async event)", () => {
    expect.assertions(1);

    let catchError = null;

    return run({
      bail: false,
      logLevel: "silent",
      onDone: [
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
