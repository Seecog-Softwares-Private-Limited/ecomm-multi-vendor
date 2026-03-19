#!/usr/bin/env node
/**
 * Entry point to run the Next.js application.
 * Usage: node app.js [dev|start]
 *   start (default) - start production server (next start; run "npm run build" first)
 *   dev             - start development server (next dev)
 */

import { spawn, execSync } from "child_process";
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

  // node app.js      -> start (or dev if no build); node app.js dev -> dev
  let mode = process.argv[2] === "dev" ? "dev" : "start";
  const buildIdPath = resolve(root, ".next", "BUILD_ID");
  if (mode === "start" && !existsSync(buildIdPath)) {
    console.log("No production build found. Starting in development mode instead.");
    mode = "dev";
  }

  const env = {
    ...process.env,
    FORCE_COLOR: "1",
    PORT: String(port),
    HOSTNAME: host,
  };

  const isWin = process.platform === "win32";
  const spawnOpts = { stdio: "inherit", cwd: root, env };

  // On Windows, stale dev processes frequently keep the port busy (EADDRINUSE).
  // Auto-free the configured port before booting to keep `npm run dev` reliable.
  if (isWin) {
    const safePort = String(port).replace(/\D/g, "") || "3000";
    try {
      execSync(
        `powershell -NoProfile -ExecutionPolicy Bypass -Command "Get-NetTCPConnection -LocalPort ${safePort} -State Listen -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }"`,
        { stdio: "ignore" }
      );
    } catch {
      // Ignore: if command fails or nothing is listening, continue startup.
    }
  }

  let child;
  if (isWin) {
    // On Windows use a single command string with shell to avoid EINVAL and DEP0190
    const safePort = String(port).replace(/\D/g, "") || "3000";
    const safeHost = /^[\w.\-:]+$/.test(host) ? host : "0.0.0.0";
    const cmd = `npx next ${mode} -H ${safeHost} -p ${safePort}`;
    child = spawn(cmd, { ...spawnOpts, shell: true });
  } else {
    child = spawn("npx", ["next", mode, "-H", host, "-p", String(port)], spawnOpts);
  }

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