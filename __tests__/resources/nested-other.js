#!/usr/bin/env node

"use strict";

const path = require("path");

const dir = path.join(__dirname, "../other-dir");

process.stdout.write(dir);
