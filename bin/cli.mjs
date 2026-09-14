#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const packageRoot = fileURLToPath(new URL("..", import.meta.url));
const require = createRequire(import.meta.url);
const installer = require.resolve("skills/bin/cli.mjs");
const skillName = "ateve-search-api";

const result = spawnSync(
  process.execPath,
  [installer, "add", packageRoot, "--skill", skillName, ...process.argv.slice(2)],
  { stdio: "inherit" },
);

if (result.error) {
  console.error(`Unable to start the skills installer: ${result.error.message}`);
  process.exitCode = 1;
} else {
  process.exitCode = result.status ?? 1;
}
