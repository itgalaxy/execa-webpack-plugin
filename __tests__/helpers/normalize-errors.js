"use strict";

function removeCWD(str) {
  const isWin = process.platform === "win32";
  let cwd = process.cwd();

  if (/ENOENT/.test(str)) {
    // eslint-disable-next-line no-param-reassign
    str = str.replace(/return .+/, 'return "ENOENT"');
  }

  if (isWin) {
    // eslint-disable-next-line no-param-reassign, unicorn/prefer-replace-all
    str = str.replace(/\\/g, "/");
    // eslint-disable-next-line unicorn/prefer-replace-all
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
