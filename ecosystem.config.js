module.exports = {
  apps: [
    {
      name: "erp-backend",
      script: "app.js",
      cwd: "X:/2026/ERP/backend",
      instances: 1,
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: "development"
      }
    },
    {
      name: "erp-frontend",
      script: "node_modules/next/dist/bin/next",
      args: "dev",
      cwd: "X:/2026/ERP/frontend",
      instances: 1,
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: "development"
      }
    }
  ]
};