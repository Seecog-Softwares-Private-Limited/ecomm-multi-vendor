/**
 * PM2 process file — use from project root:
 *   pm2 start ecosystem.config.cjs
 *   pm2 save && pm2 startup   # optional: survive reboot
 *
 * Requires .env (or properties.env) in this directory with PORT=... matching nginx proxy_pass.
 */
const path = require("path");

const cwd = path.resolve(__dirname);

module.exports = {
  apps: [
    {
      name: "ecomm",
      cwd,
      script: "app.js",
      args: "start",
      interpreter: "node",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "900M",
      exp_backoff_restart_delay: 2000,
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
