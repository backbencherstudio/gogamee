module.exports = {
  apps: [
    {
      name: "gogamee-web",
      script: "node_modules/next/dist/bin/next",
      args: "start",
      cwd: process.cwd(),
      instances: "max", // Uses all available CPU cores (2 cores)
      exec_mode: "cluster",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      error_file: "./logs/web-error.log",
      out_file: "./logs/web-out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      merge_logs: true,
      autorestart: true,
      max_memory_restart: "2G", // Give each Next.js instance up to 2GB RAM
      watch: false,
    },
    {
      name: "gogamee-worker",
      script: "node_modules/tsx/dist/cli.mjs",
      args: "worker.ts",
      node_args: "--env-file=.env",
      cwd: process.cwd(),
      instances: 1, // Keep worker to 1 instance to avoid race conditions with queues
      exec_mode: "fork", // Worker should run in fork mode
      env: {
        NODE_ENV: "production",
      },
      error_file: "./logs/worker-error.log",
      out_file: "./logs/worker-out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      merge_logs: true,
      autorestart: true,
      max_memory_restart: "1G", // Limit worker memory to 1GB
    },
  ],
};
