#!/usr/bin/env node
/**
 * Entry point to run the Next.js application.
 * Usage: node app.js [dev|start]
 *   start (default) — production: `next start` only. Requires a pre-built `.next` (no build on server).
 *   dev — development server (`next dev`).
 *
 * Deploy without npm/build ON the server:
 *   Run scripts/build-linux-server-bundle.sh (WSL/Linux) → dist/ecomm-linux-server-bundle.tar.gz
 *   Extract on the server, add .env, run `node app.js start` (server needs Node only, no npm ci).
 *
 * Listen address: defaults to 0.0.0.0. Optional: BIND_HOST or LISTEN_HOST.
 */

import { spawn, execSync } from "child_process";
import { createInterface } from "readline";
import { createReadStream, existsSync } from "fs";
import { resolve, dirname, join } from "path";
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

  const bindRaw = process.env.BIND_HOST || process.env.LISTEN_HOST || "0.0.0.0";
  const host = String(bindRaw).trim() || "0.0.0.0";

  // node app.js start — requires .next from an off-server `npm run build`; node app.js dev — no build needed
  let mode = process.argv[2] === "dev" ? "dev" : "start";
  const buildIdPath = resolve(root, ".next", "BUILD_ID");
  if (mode === "start" && !existsSync(buildIdPath)) {
    console.error(`
No production build (.next/BUILD_ID) found in: ${root}

This server is configured to NOT run "next build" here. Do this instead:
  1. On your computer or CI: npm ci && npm run build
  2. Deploy this folder including the entire .next/ directory (and node_modules, package.json, app/, src/, prisma/, etc.)
  3. Then start with: node app.js start   (or npm start)

For local development without a build: node app.js dev
`);
    process.exit(1);
  }

  const env = {
    ...process.env,
    FORCE_COLOR: "1",
    PORT: String(port),
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

  const nextCli = join(root, "node_modules", "next", "dist", "bin", "next");
  const portArg = String(port).replace(/\D/g, "") || String(port);
  const hostArg = /^[\w.\-:]+$/.test(host) ? host : "0.0.0.0";

  let child;
  if (existsSync(nextCli)) {
    child = spawn(process.execPath, [nextCli, mode, "-H", hostArg, "-p", portArg], spawnOpts);
  } else if (isWin) {
    const cmd = `npx next ${mode} -H ${hostArg} -p ${portArg}`;
    child = spawn(cmd, { ...spawnOpts, shell: true });
  } else if (mode === "dev") {
    child = spawn("npx", ["next", mode, "-H", hostArg, "-p", portArg], { ...spawnOpts, shell: false });
  } else {
    console.error(`
Missing: ${nextCli}

Linux production does not use "npx next" (avoids npm registry timeouts on servers).
Install dependencies on this host (npm ci) or deploy node_modules from GitHub Actions.
`);
    process.exit(1);
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