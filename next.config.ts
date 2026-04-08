import type { NextConfig } from "next";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

/**
 * Merge .env then properties.env into process.env (only keys missing/empty).
 * Runs only in Node when Next loads this config — never bundled for Edge/browser.
 * Same behavior as env-loader.mjs (used by app.js).
 */
function applyEnvContent(content: string) {
  for (const line of content.split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i === -1) continue;
    const key = t.slice(0, i).trim();
    if (!key) continue;
    let value = t.slice(i + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1).replace(/\\n/g, "\n");
    }
    const cur = process.env[key];
    if (cur === undefined || cur === "") {
      process.env[key] = value;
    }
  }
}

function loadProjectEnvFiles(cwd: string = process.cwd()) {
  for (const name of [".env", "properties.env"]) {
    const p = resolve(cwd, name);
    if (!existsSync(p)) continue;
    try {
      applyEnvContent(readFileSync(p, "utf8"));
    } catch (e) {
      console.error("[next.config] Failed to read env file:", p, e);
    }
  }
}

loadProjectEnvFiles();

const nextConfig: NextConfig = {
  transpilePackages: ["@mui/material", "@mui/icons-material"],
  // OneDrive sync creates metadata that causes readlink to fail on route group
  // folders like (auth) — disabling auto-clean prevents the EINVAL error on startup.
  cleanDistDir: false,
  // Skip type-checking and linting during build to save memory on low-RAM servers
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  /**
   * Serve /uploads/* via App Route (before filesystem) so KYC PDFs work in production
   * even when public-file handling or cwd differs from dev.
   */
  async rewrites() {
    return [{ source: "/uploads/:path*", destination: "/api/uploads/:path*" }];
  },
  async redirects() {
    return [
      { source: "/superadmin/login.", destination: "/superadmin/login", permanent: false },
    ];
  },
  webpack: (config, { dev }) => {
    // Disable filesystem cache always to reduce memory usage during build
    config.cache = false;
    return config;
  },
};

export default nextConfig;
