/**
 * PM2 process file — use from project root:
 *   pm2 start ecosystem.config.cjs
 *   pm2 save && pm2 startup   # optional: survive reboot
 *
 * Commerce cleanup runs every 15 minutes via the `commerce-cleanup` cron app.
 * After deploy: pm2 reload ecosystem.config.cjs && pm2 save
 *
 * Requires .env (or properties.env) in this directory with PORT=... matching nginx proxy_pass.
 */
const path = require("path");
const fs = require("fs");

const cwd = path.resolve(__dirname);

/**
 * Persistent upload root OUTSIDE the git/rsync deploy tree.
 * Override with PUBLIC_UPLOAD_ROOT in .env if your host path differs.
 *
 * Default: <project-parent>/data/ecomm-uploads
 * e.g. /home/bitnami/projects/data/ecomm-uploads when app is in
 *      /home/bitnami/projects/ecomm-multi-vendor
 */
function resolveUploadRoot() {
  if (process.env.PUBLIC_UPLOAD_ROOT && String(process.env.PUBLIC_UPLOAD_ROOT).trim()) {
    return path.resolve(String(process.env.PUBLIC_UPLOAD_ROOT).trim());
  }
  // Prefer sibling data dir so `rsync --delete` of the app folder cannot wipe images.
  const sibling = path.resolve(cwd, "..", "data", "ecomm-uploads");
  return sibling;
}

const publicUploadRoot = resolveUploadRoot();
try {
  fs.mkdirSync(publicUploadRoot, { recursive: true });
} catch {
  // Directory may already exist or need root permissions — app mkdir also retries at upload time.
}

module.exports = {
  apps: [
    {
      name: "ecomm",
      cwd,
      script: "app.js",
      args: "start",
      interpreter: "node",
      exec_mode: "fork",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "900M",
      exp_backoff_restart_delay: 2000,
      env: {
        NODE_ENV: "production",
        PUBLIC_UPLOAD_ROOT: publicUploadRoot,
      },
    },
    {
      name: "commerce-cleanup",
      cwd,
      script: "npm",
      args: "run commerce:cleanup",
      interpreter: "none",
      cron_restart: "*/15 * * * *",
      autorestart: false,
      watch: false,
      max_memory_restart: "256M",
      env: {
        NODE_ENV: "production",
        PUBLIC_UPLOAD_ROOT: publicUploadRoot,
      },
    },
  ],
};
