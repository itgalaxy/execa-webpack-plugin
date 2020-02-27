"use strict";

function removeCWD(str) {
  const isWin = process.platform === "win32";
  let cwd = process.cwd();

  if (/(ENOENT|exit code 1: not-found)/.test(str)) {
    // eslint-disable-next-line no-param-reassign
    str = str.replace(/return .+/, 'return "ENOENT"');
  }

  if (isWin) {
    // eslint-disable-next-line no-param-reassign
    str = str.replace(/\\/g, "/");
    cwd = cwd.replace(/\\/g, "/");
  }

  return str.replace(new RegExp(cwd, "g"), "");
}

module.exports = errors =>
  errors.map(error =>
    removeCWD(
      error
        .toString()
        .split("\n")
        .slice(0, 1)
        .join("\n")
    )
  );
