"use strict";

const normalizeErrors = require("./normalize-errors");

module.exports = stats => normalizeErrors(stats.compilation.warnings);
