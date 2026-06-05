const fs = require("node:fs");
const path = require("node:path");

const rootDir = path.resolve(__dirname, "..");
const lockfiles = ["package-lock.json", "yarn.lock"];

for (const lockfile of lockfiles) {
  fs.rmSync(path.join(rootDir, lockfile), { force: true });
}

const userAgent = process.env.npm_config_user_agent || "";
const execPath = process.env.npm_execpath || "";
const isPnpm = userAgent.startsWith("pnpm/") || execPath.toLowerCase().includes("pnpm");

if (!isPnpm) {
  console.error("Use pnpm instead");
  process.exit(1);
}
