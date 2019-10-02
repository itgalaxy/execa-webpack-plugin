#!/usr/bin/env node

"use strict";

const path = require("path");

const dir = path.join(__dirname, "../other-other-dir");

setTimeout(() => {
  process.stdout.write(dir);
}, 1500);
