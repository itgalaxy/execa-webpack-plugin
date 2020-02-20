"use strict";

function removeCWD(str) {
  const isWin = process.platform === "win32";
  let cwd = process.cwd();

  console.log(str);

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
        .slice(0, 2)
        .join("\n")
    )
  );
