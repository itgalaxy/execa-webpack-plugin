# Change Log

All notable changes to this project will be documented in this file.

This project adheres to [Semantic Versioning](http://semver.org).

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
