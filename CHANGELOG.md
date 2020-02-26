# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [6.0.1](https://github.com/itgalaxy/execa-webpack-plugin/compare/v6.0.0...v6.0.1) (2020-02-26)


### Bug Fixes

* do not log the `No commands` message in the `dev` mode ([#41](https://github.com/itgalaxy/execa-webpack-plugin/issues/41)) ([a3b56d3](https://github.com/itgalaxy/execa-webpack-plugin/commit/a3b56d3479f11658f5d559bbfdd111b24803740c))
* do not overload system when a hook is async ([#40](https://github.com/itgalaxy/execa-webpack-plugin/issues/40)) ([50260b3](https://github.com/itgalaxy/execa-webpack-plugin/commit/50260b39cec564d6f56e0cbb61790cab64289415))

## 6.0.0 - 2019-12-19

- Fixed: support webpack@5
- Changed: minimum require `execa` version is `4.0.0`.

## 5.0.0 - 2019-10-24

- Changed: minimum require `execa` version is `3.2.0`.
- Changed: minimum require node version is >= 10.13.0.

## 4.0.1 - 2019-10-08

- Fixed: less unnecessary logging.

## 4.0.0 - 2019-09-16

- Changed: the option `logLevel` is removed.
- Changed: use built-in webpack logger.
- Changed: minimum require `webpack` version is `4.37.0`.
- Fixed: throw error on `infrastructureLog` hook.
- Fixed: output warning on empty hook commands.
- Fixed: argument is empty when nested command does't return nothing.
- Fixed: error message.
- Fixed: invalid hook signature for some hook

## 3.0.0 - 2019-06-25

- Changed: minimum require node version is >= 8.9.0.
- Changed: update `execa` to version `2` (some arguments was be renamed, please look [`execa` documentation](https://github.com/sindresorhus/execa)).

## 2.1.2 - 2018-08-29

- Chore: minimum required `execa` version is now `^1.0.0`.

## 2.1.1 - 2018-08-24

- Chore: minimum required `execa` version is now `^0.11.0`.
- Chore: minimum required `webpack-log` version is now `^2.0.0`.

## 2.1.0 - 2018-04-26

- Feature: support options for commands.
- Fix: don't crash when `bail: true` in sync event.

## 2.0.1 - 2018-04-19

- Fix: don't crash when argument is empty (string/array/object).
- Fix: improve output error on empty or invalid event.

## 2.0.0 - 2018-04-19

- Changed: remove `webpack@2` and `webpack@3` support.
- Removed: `onBuildStart`, `onBuildEnd` and `onBuildExit` options. Use new events `onCompile`, `onAfterEmit` and `onDone` options.

## 1.1.0 - 2018-04-18

- Feature: run `onBuildEnd` and `onBuildExit` in async mode for `webpack@4`.

## 1.0.6 - 2018-03-15

- Chore: minimum required `execa` version is now `^0.10.0`.

## 1.0.5 - 2018-03-07

- Refactor: reduce memory usage and increase performance.

## 1.0.4 - 2018-02-27

- Fixed: compatibility with `webpack >= 4.0.0`.
- Fixed: add `webpack` in `peerDependencies`.

## 1.0.3 - 2018-01-15

- Chore: minimum required `execa` version is now `^0.9.0`.

## 1.0.2 - 2018-01-11

- Chore: simplify error handling.
- Tests: improve code coverage.

## 1.0.1 - 2017-12-22

- Fixed: remove unnecessary output `stdout:` and `stderr:`.

## 1.0.0 - 2017-12-22

- Chore: public initial release.
