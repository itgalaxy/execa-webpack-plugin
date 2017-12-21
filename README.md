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
      onBuildStart: [
        {
          args: ["build"],
          cmd: "del"
        }
      ]
    })
  ]
};
```

## Options

|        Name        |    Type     |         Default         | Description                                                                                                                                   |
| :----------------: | :---------: | :---------------------: | :-------------------------------------------------------------------------------------------------------------------------------------------- |
| **`onBuildStart`** |  `{Array}`  |          `[]`           | Array of scripts to execute on the initial build.                                                                                             |
|  **`onBuildEnd`**  |  `{Array}`  |          `[]`           | Array of scripts to execute after files are emitted at the end of the compilation.                                                            |
| **`onBuildExit`**  |  `{Array}`  |          `[]`           | array of scripts to execute after webpack's process is complete.                                                                              |
|     **`bail`**     | `{Boolean}` | `compiler.options.bail` | Report the first error as a hard error instead of tolerating it.                                                                              |
|     **`dev`**      | `{Boolean}` |         `true`          | Switch for development environments. This causes scripts to execute once. Useful for running HMR on webpack-dev-server or webpack watch mode. |
|   **`logLevel`**   |  `string`   |         `warn`          | Enable logging.                                                                                                                               |

### `onBuildStart`

```js
[
  new ExecaPlugin({
    onBuildStart: [
      {
        args: ["build"],
        cmd: "del"
      }
    ]
  })
];
```

### `onBuildEnd`

```js
[
  new ExecaPlugin({
    onBuildEnd: [
      {
        args: ["trash"],
        cmd: "del"
      }
    ]
  })
];
```

### `onBuildExit`

```js
[
  new ExecaPlugin({
    onBuildExit: [
      {
        args: ["trash"],
        cmd: "del"
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
    onBuildStart: [
      {
        args: ["build"],
        cmd: "del"
      }
    ]
  })
];
```

### `dev`

```js
[
  new ExecaPlugin({
    dev: true,
    onBuildStart: [
      {
        args: ["build"],
        cmd: "del"
      }
    ]
  })
];
```

### `logLevel`

```js
[
  new ExecaPlugin({
    logLevel: "info",
    onBuildStart: [
      {
        args: ["build"],
        cmd: "del"
      }
    ]
  })
];
```

## Thanks

* [execa](https://github.com/sindresorhus/execa) - api.

## [Changelog](CHANGELOG.md)

## [License](LICENSE)
