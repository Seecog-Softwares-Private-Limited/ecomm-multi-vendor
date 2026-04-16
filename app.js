#!/usr/bin/env node
/**
 * Entry point to run the Next.js application.
 * Usage: node app.js [dev|start]
 *   start (default) - production: runs `next build` if `.next/BUILD_ID` is missing, then `next start`
 *   dev               - development server (`next dev`)
 *
 * Opt-out of automatic build (e.g. low RAM): SKIP_AUTO_BUILD=1 — then missing build falls back to dev.
 * Heavy builds: NODE_OPTIONS="--max-old-space-size=2048" node app.js start
 *
 * Listen address: defaults to 0.0.0.0 (all interfaces). Optional: BIND_HOST or LISTEN_HOST.
 * Do not use the OS variable HOSTNAME for binding — on Linux it is the machine name and nginx
 * (proxy_pass http://127.0.0.1:PORT) will often get 502 because nothing is listening on loopback.
 */

import { spawn, execSync, spawnSync } from "child_process";
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

  const bindRaw = process.env.BIND_HOST || process.env.LISTEN_HOST || "0.0.0.0";
  const host = String(bindRaw).trim() || "0.0.0.0";

  // node app.js      -> start (build if needed, then next start); node app.js dev -> dev
  let mode = process.argv[2] === "dev" ? "dev" : "start";
  const buildIdPath = resolve(root, ".next", "BUILD_ID");
  if (mode === "start" && !existsSync(buildIdPath)) {
    if (process.env.SKIP_AUTO_BUILD === "1") {
      console.log(
        "No production build found and SKIP_AUTO_BUILD=1. Starting in development mode instead."
      );
      mode = "dev";
    } else {
      console.log("No production build found. Running `next build` once, then starting production server…");
      const buildEnv = { ...process.env, FORCE_COLOR: "1" };
      const buildResult = spawnSync("npx", ["next", "build"], {
        stdio: "inherit",
        cwd: root,
        env: buildEnv,
        shell: process.platform === "win32",
      });
      if (buildResult.error) {
        console.error("next build failed to start:", buildResult.error);
        process.exit(1);
      }
      if (buildResult.status !== 0) {
        console.error("next build exited with code", buildResult.status);
        process.exit(buildResult.status ?? 1);
      }
      if (!existsSync(buildIdPath)) {
        console.error("Build finished but .next/BUILD_ID is still missing.");
        process.exit(1);
      }
    }
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