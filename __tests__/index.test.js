"use strict";

const execa = require("execa");
const path = require("path");
const fs = require("fs");
const webpack = require("webpack");
const tempy = require("tempy");
const ExecaPlugin = require("../src/ExecaWebpackPlugin");
const { normalizeErrors, getErrors, getWarnings } = require("./helpers");

const resourcesDir = path.join(__dirname, "resources");

jest.setTimeout(30000);

let logs = [];

function getConfig(pluginOptions = {}) {
  return {
    entry: path.join(resourcesDir, "app.js"),
    mode: "development",
    output: {
      filename: "bundle.js",
      path: tempy.directory()
    },
    plugins: [
      new ExecaPlugin(pluginOptions),
      {
        apply(compiler) {
          compiler.hooks.infrastructureLog.tap(
            "ExecaWebpackTest",
            (name, type, args) => {
              if (type === "error") {
                // eslint-disable-next-line no-param-reassign
                args = normalizeErrors(args);
              }

              console.log(args);

              logs.push([name, type, normalizeErrors(args)]);

              return false;
            }
          );
        }
      }
    ]
  };
}

function compile(options) {
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
  } catch (error) {
    console.log(error);
  }
}

function unlinkSyncSafe(dir) {
  try {
    fs.rmdirSync(dir);
  } catch (error) {
    console.log(error);
  }
}

describe("execa-webpack-plugin", () => {
  const dir = path.join(__dirname, "dir");
  const nestedDir = path.join(dir, "nested");
  const otherDir = path.join(__dirname, "other-dir");
  const otherOtherDir = path.join(__dirname, "other-dir");

  beforeEach(() => {
    logs = [];
  });

  it("should throw error on 'on*' options are empty (no events)", async () => {
    expect.assertions(2);

    try {
      await compile();
    } catch (error) {
      // eslint-disable-next-line jest/no-try-expect
      expect(error).toMatchSnapshot();
    }

    expect(logs).toMatchSnapshot("logs");
  });

  it("should throw error invalid 'onFooBar' option (no hooks)", async () => {
    expect.assertions(2);

    try {
      await compile({
        onFooBar: [
          {
            args: [path.join(resourcesDir, "nothing.js")],
            cmd: "node"
          }
        ]
      });
    } catch (error) {
      // eslint-disable-next-line jest/no-try-expect
      expect(error).toMatchSnapshot();
    }

    expect(logs).toMatchSnapshot("logs");
  });

  it("should throw error on 'infrastructureLog' hook", async () => {
    expect.assertions(2);

    try {
      await compile({
        onInfrastructureLog: [
          {
            args: [path.join(resourcesDir, "nothing.js")],
            cmd: "node"
          }
        ]
      });
    } catch (error) {
      // eslint-disable-next-line jest/no-try-expect
      expect(error).toMatchSnapshot();
    }

    expect(logs).toMatchSnapshot("logs");
  });

  it("should output warning on empty hook", async () => {
    await compile({
      onCompile: []
    });

    expect(logs).toMatchSnapshot("logs");
  });

  it("should work with 'on*' options", async () => {
    const stats = await compile({
      onShouldEmit: [
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
      ],
      onAdditionalPass: [
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
      onRun: [
        {
          args: [path.join(resourcesDir, "nothing.js")],
          cmd: "node"
        }
      ],
      onEmit: [
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

      onThisCompilation: [
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
      onNormalModuleFactory: [
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

      onBeforeCompile: [
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
      onMake: [
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

      onWatchRun: [
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
      onWatchClose: [
        {
          args: [path.join(resourcesDir, "nothing.js")],
          cmd: "node"
        }
      ],

      // Will be remove in `webpack@5`
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
    });

    expect(logs).toMatchSnapshot("logs");
    expect(getErrors(stats)).toMatchSnapshot("errors");
    expect(getWarnings(stats)).toMatchSnapshot("warnings");

    return stats;
  });

  it("many arguments in hook (sync hook)", async () => {
    const stats = await compile({
      onThisCompilation: [
        {
          args: [path.join(resourcesDir, "nothing.js")],
          cmd: "node"
        }
      ]
    });

    expect(logs).toMatchSnapshot("logs");
    expect(getErrors(stats)).toMatchSnapshot("errors");
    expect(getWarnings(stats)).toMatchSnapshot("warnings");
  });

  it("many arguments in hook (async hook)", async () => {
    const stats = await compile({
      onAssetEmitted: [
        {
          args: [path.join(resourcesDir, "nothing.js")],
          cmd: "node"
        }
      ]
    });

    expect(logs).toMatchSnapshot("logs");
    expect(getErrors(stats)).toMatchSnapshot("errors");
    expect(getWarnings(stats)).toMatchSnapshot("warnings");
  });

  it("should work with 'onCompile' option (sync hook)", async () => {
    mkdirSyncSafe(dir);

    expect(fs.statSync(dir).isDirectory()).toBe(true);

    const stats = await compile({
      onCompile: [
        {
          args: [dir],
          cmd: "del"
        }
      ]
    });

    expect(logs).toMatchSnapshot("logs");
    expect(getErrors(stats)).toMatchSnapshot("errors");
    expect(getWarnings(stats)).toMatchSnapshot("warnings");
    expect(() => fs.statSync(dir)).toThrow(
      /ENOENT: no such file or directory, stat/
    );

    unlinkSyncSafe(dir);
  });

  it("should work with 'onCompile' and 'dev' is 'false' option (sync hook)", async () => {
    mkdirSyncSafe(dir);

    expect(fs.statSync(dir).isDirectory()).toBe(true);

    const stats = await compile({
      dev: false,
      onCompile: [
        {
          args: [dir],
          cmd: "del"
        }
      ]
    });

    expect(logs).toMatchSnapshot("logs");
    expect(getErrors(stats)).toMatchSnapshot("errors");
    expect(getWarnings(stats)).toMatchSnapshot("warnings");
    expect(() => fs.statSync(dir)).toThrow(
      /ENOENT: no such file or directory, stat/
    );

    unlinkSyncSafe(dir);
  });

  it("should work with 'onDone' option (async hook)", async () => {
    mkdirSyncSafe(dir);

    expect(fs.statSync(dir).isDirectory()).toBe(true);

    const stats = await compile({
      onDone: [
        {
          args: [dir],
          cmd: "del"
        }
      ]
    });

    expect(logs).toMatchSnapshot("logs");
    expect(getErrors(stats)).toMatchSnapshot("errors");
    expect(getWarnings(stats)).toMatchSnapshot("warnings");
    expect(() => fs.statSync(dir)).toThrow(/ENOENT: no such file or directory/);

    unlinkSyncSafe(dir);
  });

  it("should work with 'onDone' and 'dev' is 'false' options (async hook)", async () => {
    mkdirSyncSafe(dir);

    expect(fs.statSync(dir).isDirectory()).toBe(true);

    const stats = await compile({
      dev: false,
      onDone: [
        {
          args: [dir],
          cmd: "del"
        }
      ]
    });

    expect(logs).toMatchSnapshot("logs");
    expect(getErrors(stats)).toMatchSnapshot("errors");
    expect(getWarnings(stats)).toMatchSnapshot("warnings");
    expect(() => fs.statSync(dir)).toThrow(
      /ENOENT: no such file or directory, stat/
    );

    unlinkSyncSafe(dir);
  });

  it("should throw error with 'bail: true' option (sync hook)", async () => {
    expect.assertions(2);

    try {
      await compile({
        bail: true,
        onDone: [
          {
            cmd: "not-found"
          }
        ]
      });
    } catch (error) {
      // eslint-disable-next-line jest/no-try-expect
      expect(error).toMatchSnapshot();
    }

    expect(logs).toMatchSnapshot("logs");
  });

  it("should throw error with 'bail: true' option (async hook)", async () => {
    expect.assertions(2);

    try {
      await compile({
        bail: true,
        onDone: [
          {
            cmd: "not-found"
          }
        ]
      });
    } catch (error) {
      // eslint-disable-next-line jest/no-try-expect
      expect(error).toMatchSnapshot();
    }

    expect(logs).toMatchSnapshot("logs");
  });

  it("should not throw error with 'bail: false' option (sync hook)", async () => {
    const stats = await compile({
      bail: false,
      onCompile: [
        {
          cmd: "not-found"
        }
      ]
    });

    expect(logs).toMatchSnapshot("logs");
    expect(getErrors(stats)).toMatchSnapshot("errors");
    expect(getWarnings(stats)).toMatchSnapshot("warnings");
  });

  it("should not throw error with 'bail: false' option (async hook)", async () => {
    const stats = await compile({
      bail: false,
      onDone: [
        {
          cmd: "not-found"
        }
      ]
    });

    expect(logs).toMatchSnapshot("logs");
    expect(getErrors(stats)).toMatchSnapshot("errors");
    expect(getWarnings(stats)).toMatchSnapshot("warnings");
  });

  it("should work and output 'stdout' and 'stderr' (sync hook)", async () => {
    const stats = await compile({
      onCompile: [
        {
          args: [path.join(resourcesDir, "cli-stdout-stderr.js")],
          cmd: "node"
        }
      ]
    });

    expect(logs).toMatchSnapshot("logs");
    expect(getErrors(stats)).toMatchSnapshot("errors");
    expect(getWarnings(stats)).toMatchSnapshot("warnings");
  });

  it("should work and output 'stdout' and 'stderr' (async hook)", async () => {
    const stats = await compile({
      onDone: [
        {
          args: [path.join(resourcesDir, "cli-stdout-stderr.js")],
          cmd: "node"
        }
      ]
    });

    expect(logs).toMatchSnapshot("logs");
    expect(getErrors(stats)).toMatchSnapshot("errors");
    expect(getWarnings(stats)).toMatchSnapshot("warnings");
  });

  it("should work with nested commands (sync hook)", async () => {
    mkdirSyncSafe(dir);

    expect(fs.statSync(dir).isDirectory()).toBe(true);

    const stats = await compile({
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
    });

    expect(logs).toMatchSnapshot("logs");
    expect(getErrors(stats)).toMatchSnapshot("errors");
    expect(getWarnings(stats)).toMatchSnapshot("warnings");
    expect(() => fs.statSync(dir)).toThrow(
      /ENOENT: no such file or directory, stat/
    );

    unlinkSyncSafe(dir);
  });

  it("should work with deep nested commands (sync hook)", async () => {
    mkdirSyncSafe(dir);

    expect(fs.statSync(dir).isDirectory()).toBe(true);

    const stats = await compile({
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
    });

    expect(logs).toMatchSnapshot("logs");
    expect(getErrors(stats)).toMatchSnapshot("errors");
    expect(getWarnings(stats)).toMatchSnapshot("warnings");
    expect(() => fs.statSync(dir)).toThrow(
      /ENOENT: no such file or directory, stat/
    );

    unlinkSyncSafe(dir);
  });

  it("should work with multiple nested commands (sync hook)", async () => {
    mkdirSyncSafe(dir);
    mkdirSyncSafe(otherDir);

    expect(fs.statSync(dir).isDirectory()).toBe(true);
    expect(fs.statSync(otherDir).isDirectory()).toBe(true);

    const stats = await compile({
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
    });

    expect(logs).toMatchSnapshot("logs");
    expect(getErrors(stats)).toMatchSnapshot("errors");
    expect(getWarnings(stats)).toMatchSnapshot("warnings");
    expect(() => fs.statSync(dir)).toThrow(
      /ENOENT: no such file or directory, stat/
    );
    expect(() => fs.statSync(otherDir)).toThrow(
      /ENOENT: no such file or directory, stat/
    );

    unlinkSyncSafe(dir);
    unlinkSyncSafe(otherDir);
  });

  it("should work with nested commands (async hook)", async () => {
    mkdirSyncSafe(dir);

    expect(fs.statSync(dir).isDirectory()).toBe(true);

    const stats = await compile({
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
    });

    expect(logs).toMatchSnapshot("logs");
    expect(getErrors(stats)).toMatchSnapshot("errors");
    expect(getWarnings(stats)).toMatchSnapshot("warnings");
    expect(() => fs.statSync(dir)).toThrow(
      /ENOENT: no such file or directory, stat/
    );

    unlinkSyncSafe(dir);
  });

  it("should work with deep nested commands (async hook)", async () => {
    mkdirSyncSafe(dir);

    expect(fs.statSync(dir).isDirectory()).toBe(true);

    const stats = await compile({
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
    });

    expect(logs).toMatchSnapshot("logs");
    expect(getErrors(stats)).toMatchSnapshot("errors");
    expect(getWarnings(stats)).toMatchSnapshot("warnings");
    expect(() => fs.statSync(dir)).toThrow(
      /ENOENT: no such file or directory, stat/
    );

    unlinkSyncSafe(dir);
  });

  it("should work with multiple nested commands (async hook)", async () => {
    mkdirSyncSafe(dir);
    mkdirSyncSafe(otherDir);
    mkdirSyncSafe(otherOtherDir);

    expect(fs.statSync(dir).isDirectory()).toBe(true);
    expect(fs.statSync(otherDir).isDirectory()).toBe(true);
    expect(fs.statSync(otherOtherDir).isDirectory()).toBe(true);

    const stats = await compile({
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
            },
            {
              args: [path.join(resourcesDir, "nested-other-other.js")],
              cmd: "node"
            }
          ],
          cmd: "del"
        }
      ]
    });

    // Not a best solution, temporary
    expect(logs.sort()).toMatchSnapshot("logs");
    expect(getErrors(stats)).toMatchSnapshot("errors");
    expect(getWarnings(stats)).toMatchSnapshot("warnings");
    expect(() => fs.statSync(dir)).toThrow(
      /ENOENT: no such file or directory, stat/
    );
    expect(() => fs.statSync(otherDir)).toThrow(
      /ENOENT: no such file or directory, stat/
    );
    expect(() => fs.statSync(otherOtherDir)).toThrow(
      /ENOENT: no such file or directory, stat/
    );

    unlinkSyncSafe(dir);
    unlinkSyncSafe(otherDir);
    unlinkSyncSafe(otherOtherDir);
  });

  it("should work when nested commands return nothing and 'bail: false' (sync hook)", async () => {
    const stats = await compile({
      bail: false,
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
    });

    expect(logs).toMatchSnapshot("logs");
    expect(getErrors(stats)).toMatchSnapshot("errors");
    expect(getWarnings(stats)).toMatchSnapshot("warnings");
  });

  it("should work when nested commands return nothing and 'bail: false' (async hook)", async () => {
    const stats = await compile({
      bail: false,
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
    });

    expect(logs).toMatchSnapshot("logs");
    expect(getErrors(stats)).toMatchSnapshot("errors");
    expect(getWarnings(stats)).toMatchSnapshot("warnings");
  });

  it("should work with options (sync hook)", async () => {
    mkdirSyncSafe(dir);
    mkdirSyncSafe(nestedDir);

    expect(fs.statSync(dir).isDirectory()).toBe(true);
    expect(fs.statSync(nestedDir).isDirectory()).toBe(true);

    const stats = await compile({
      onCompile: [
        {
          args: [nestedDir],
          cmd: "del",
          options: {
            cwd: dir
          }
        }
      ]
    });

    expect(logs).toMatchSnapshot("logs");
    expect(getErrors(stats)).toMatchSnapshot("errors");
    expect(getWarnings(stats)).toMatchSnapshot("warnings");
    expect(() => fs.statSync(nestedDir)).toThrow(
      /ENOENT: no such file or directory, stat/
    );

    unlinkSyncSafe(dir);
  });

  it.only("should work with options (async hook)", async () => {
    mkdirSyncSafe(dir);
    mkdirSyncSafe(nestedDir);

    expect(fs.statSync(dir).isDirectory()).toBe(true);
    expect(fs.statSync(nestedDir).isDirectory()).toBe(true);

    const stats = await compile({
      onDone: [
        {
          args: [nestedDir],
          cmd: "rmdir",
          options: {
            cwd: dir
          }
        }
      ]
    });

    expect(logs).toMatchSnapshot("logs");
    expect(getErrors(stats)).toMatchSnapshot("errors");
    expect(getWarnings(stats)).toMatchSnapshot("warnings");
    expect(() => fs.statSync(nestedDir)).toThrow(
      /ENOENT: no such file or directory, stat/
    );

    unlinkSyncSafe(dir);
  });
});
