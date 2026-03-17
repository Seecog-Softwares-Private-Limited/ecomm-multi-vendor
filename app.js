#!/usr/bin/env node
/**
 * Entry point to run the Next.js application.
 * Usage: node app.js [dev|start]
 *   start (default) - start production server (next start; run "npm run build" first)
 *   dev             - start development server (next dev)
 */

import { spawn } from "child_process";
import { createInterface } from "readline";
import { createReadStream, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname);

// Load .env or properties.env into process.env
function loadEnv() {
  const envPath = resolve(root, ".env");
  const fallbackPath = resolve(root, "properties.env");
  const path = existsSync(envPath) ? envPath : existsSync(fallbackPath) ? fallbackPath : null;

  if (!path) return Promise.resolve();

  return new Promise((resolvePromise) => {
    const rl = createInterface({
      input: createReadStream(path),
      crlfDelay: Infinity,
    });

    rl.on("line", (line) => {
      line = line.trim();
      if (!line || line.startsWith("#")) return;

      const i = line.indexOf("=");
      if (i === -1) return;

      const key = line.slice(0, i).trim();
      let value = line.slice(i + 1).trim();

      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1).replace(/\\n/g, "\n");
      }

      if (!process.env[key]) process.env[key] = value;
    });

    rl.on("close", resolvePromise);
  });
}

async function main() {
  await loadEnv();

  const port = process.env.PORT;
  if (!port || !String(port).trim()) {
    console.error("PORT must be set in .env or properties.env");
    process.exit(1);
  }

  const host = process.env.HOSTNAME || "0.0.0.0";

  // node app.js      -> start
  // node app.js dev  -> dev
  // node app.js start-> start
  const mode = process.argv[2] === "dev" ? "dev" : "start";

  const env = {
    ...process.env,
    FORCE_COLOR: "1",
    PORT: String(port),
    HOSTNAME: host,
  };

  const npxCmd = process.platform === "win32" ? "npx.cmd" : "npx";

  const child = spawn(npxCmd, ["next", mode, "-H", host, "-p", String(port)], {
    stdio: "inherit",
    cwd: root,
    env,
  });

  child.on("error", (err) => {
    console.error("Failed to start Next.js:", err);
    process.exit(1);
  });

  child.on("exit", (code) => {
    process.exit(code ?? 0);
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});