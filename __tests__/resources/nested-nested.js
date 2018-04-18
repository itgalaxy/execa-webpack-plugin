#!/usr/bin/env node

"use strict";

const path = require("path");

const nested = path.join(__dirname, "nested.js");

process.stdout.write(nested);
