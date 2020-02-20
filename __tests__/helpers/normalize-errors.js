"use strict";

function removeCWD(str) {
  const isWin = process.platform === "win32";
  let cwd = process.cwd();

  if (isWin) {
    // eslint-disable-next-line no-param-reassign,
    str = str.replaceAll("\\", "/");
    cwd = cwd.replaceAll("\\", "/");
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
