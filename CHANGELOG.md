# Change Log

All notable changes to this project will be documented in this file.

This project adheres to [Semantic Versioning](http://semver.org).

## 2.0.0 - 2018-04-19

* Changed: remove `webpack@2` and `webpack@3` support.
* Removed: `onBuildStart`, `onBuildEnd` and `onBuildExit` options. Use new events `onCompile`, `onAfterEmit` and `onDone` options.

## 1.1.0 - 2018-04-18

* Feature: run `onBuildEnd` and `onBuildExit` in async mode for `webpack@4`.

## 1.0.6 - 2018-03-15

* Chore: minimum required `execa` version is now `^0.10.0`.

## 1.0.5 - 2018-03-07

* Refactor: reduce memory usage and increase performance.

## 1.0.4 - 2018-02-27

* Fixed: compatibility with `webpack >= 4.0.0`.
* Fixed: add `webpack` in `peerDependencies`.

## 1.0.3 - 2018-01-15

* Chore: minimum required `execa` version is now `^0.9.0`.

## 1.0.2 - 2018-01-11

* Chore: simplify error handling.
* Tests: improve code coverage.

## 1.0.1 - 2017-12-22

* Fixed: remove unnecessary output `stdout:` and `stderr:`.

## 1.0.0 - 2017-12-22

* Chore: public initial release.
