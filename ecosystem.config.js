module.exports = {
  apps: [
    {
      name: "KU Enrollment Macro",
      script: "ts-node",
      args: "index.ts",
      autorestart: true,
      watch: false,
      // Delay between restart
      watch_delay: 1000,
      ignore_watch: ["node_modules"],
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "development"
      },
      env_production: {
        NODE_ENV: "production"
      }
    },
    {
      name: "CRON",
      script: "ts-node",
      args: "lolDog.ts",
      instances: 1,
      exec_mode: "fork",
      cron_restart: "*/20 * * * *",
      watch: false,
      autorestart: false
    }
  ]
};
