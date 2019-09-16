# execa-webpack-plugin

[![NPM version](https://img.shields.io/npm/v/execa-webpack-plugin.svg)](https://www.npmjs.org/package/execa-webpack-plugin)
[![Travis Build Status](https://img.shields.io/travis/itgalaxy/execa-webpack-plugin/master.svg?label=build)](https://travis-ci.org/itgalaxy/execa-webpack-plugin)
[![dependencies Status](https://david-dm.org/itgalaxy/execa-webpack-plugin/status.svg)](https://david-dm.org/itgalaxy/execa-webpack-plugin)
[![devDependencies Status](https://david-dm.org/itgalaxy/execa-webpack-plugin/dev-status.svg)](https://david-dm.org/itgalaxy/execa-webpack-plugin?type=dev)

A better `child_process` for `webpack`.

## Installation

```shell
npm i -D execa-webpack-plugin
```

## Usage

**webpack.config.js**

```js
const ExecaPlugin = require("execa-webpack-plugin");

module.exports = {
  plugins: [
    new ExecaPlugin({
      onBeforeRun: [
        {
          args: ["build"],
          cmd: "del",
          options: {
            cwd: process.cwd()
          }
        }
      ]
    })
  ]
};
```

Note: [list of command options](https://github.com/sindresorhus/execa#options).

## Options

|         Name         |    Type     |         Default         | Description                                                                                                                                   |
| :------------------: | :---------: | :---------------------: | :-------------------------------------------------------------------------------------------------------------------------------------------- |
| **`on(NameOfHook)`** |  `{Array}`  |          `[]`           | Array of commands to execute on the hook.                                                                                                     |  |
|      **`bail`**      | `{Boolean}` | `compiler.options.bail` | Report the first error as a hard error instead of tolerating it.                                                                              |
|      **`dev`**       | `{Boolean}` |         `true`          | Switch for development environments. This causes scripts to execute once. Useful for running HMR on webpack-dev-server or webpack watch mode. |

### `on(NameOfHook)`

List of [hooks](https://webpack.js.org/api/compiler-hooks/).
The name of hook contains: `on` + hook name (first character in upper case).
Examples: `onBeforeRun`, `onRun`, `onWatchRun`, `onCompile` and etc.

**webpack.config.js**

```js
module.exports = {
  plugins: [
    [
      new ExecaPlugin({
        onBeforeRun: [
          {
            args: ["build"],
            cmd: "del"
          }
        ],
        onCompile: [
          {
            args: ["check"],
            cmd: "command"
          }
        ],
        // Support nested command
        onDone: [
          {
            args: [
              {
                args: ["arg"],
                cmd: "command-return-argument"
              },
              "other-argument",
              {
                args: ["arg"],
                cmd: "command-return-other-argument"
              }
            ],
            cmd: "command"
          }
        ]
      })
    ]
  ]
};
```

### `bail`

Fail out on the first error instead of tolerating it. To enable it:

**webpack.config.js**

```js
module.exports = {
  plugins: [
    [
      new ExecaPlugin({
        bail: true,
        onBeforeRun: [
          {
            args: ["build"],
            cmd: "del"
          }
        ]
      })
    ]
  ]
};
```

### `dev`

If you want to run command(s) in `watch` mode every time you can set `dev` option to false.

**webpack.config.js**

```js
module.exports = {
  plugins: [
    new ExecaPlugin({
      dev: false,
      onBeforeRun: [
        {
          args: ["build"],
          cmd: "del"
        }
      ]
    })
  ]
};
```

## Examples

### Set logger level

**webpack.config.js**

```js
module.exports = {
  infrastructureLogging: {
    level: "warn"
  },
  plugins: [
    new ExecaPlugin({
      onBeforeRun: [
        {
          args: ["build"],
          cmd: "del"
        }
      ]
    })
  ]
};
```

## Thanks

- [execa](https://github.com/sindresorhus/execa) - API.

## [Changelog](CHANGELOG.md)

## [License](LICENSE)
