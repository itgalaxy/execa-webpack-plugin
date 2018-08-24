# execa-webpack-plugin

[![NPM version](https://img.shields.io/npm/v/execa-webpack-plugin.svg)](https://www.npmjs.org/package/execa-webpack-plugin)
[![Travis Build Status](https://img.shields.io/travis/itgalaxy/execa-webpack-plugin/master.svg?label=build)](https://travis-ci.org/itgalaxy/execa-webpack-plugin)
[![dependencies Status](https://david-dm.org/itgalaxy/execa-webpack-plugin/status.svg)](https://david-dm.org/itgalaxy/execa-webpack-plugin)
[![devDependencies Status](https://david-dm.org/itgalaxy/execa-webpack-plugin/dev-status.svg)](https://david-dm.org/itgalaxy/execa-webpack-plugin?type=dev)
[![Greenkeeper badge](https://badges.greenkeeper.io/itgalaxy/execa-webpack-plugin.svg)](https://greenkeeper.io)

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

|         Name          |    Type     |         Default         | Description                                                                                                                                   |
| :-------------------: | :---------: | :---------------------: | :-------------------------------------------------------------------------------------------------------------------------------------------- |
| **`on(NameOfEvent)`** |  `{Array}`  |          `[]`           | Array of scripts to execute on the event.                                                                                                     |  |
|      **`bail`**       | `{Boolean}` | `compiler.options.bail` | Report the first error as a hard error instead of tolerating it.                                                                              |
|       **`dev`**       | `{Boolean}` |         `true`          | Switch for development environments. This causes scripts to execute once. Useful for running HMR on webpack-dev-server or webpack watch mode. |
|    **`logLevel`**     |  `string`   |         `warn`          | Enable logging.                                                                                                                               |

### `on(NameOfEvent)`

List of [events](https://webpack.js.org/api/compiler-hooks/).
Name of event contain - `on` + event name (first character in upper case).
Examples: `onBeforeRun`, `onRun`, `onWatchRun`, `onCompile` and etc.

```js
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
];
```

### `bail`

```js
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
];
```

### `dev`

If you want to run command(s) in `watch` mode every time you can set `dev` option to false.

```js
[
  new ExecaPlugin({
    dev: false,
    onBeforeRun: [
      {
        args: ["build"],
        cmd: "del"
      }
    ]
  })
];
```

### `logLevel`

Supports log [levels](https://github.com/webpack-contrib/webpack-log#level).

```js
[
  new ExecaPlugin({
    logLevel: "info",
    onBeforeRun: [
      {
        args: ["build"],
        cmd: "del"
      }
    ]
  })
];
```

## Thanks

- [execa](https://github.com/sindresorhus/execa) - API.

## [Changelog](CHANGELOG.md)

## [License](LICENSE)
