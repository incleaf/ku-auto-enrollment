module.exports = {
  apps: [
    {
      name: "API",
      script: "ts-node",
      args: "index.ts",
      autorestart: true,
      watch: true,
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
    }
  ]
};
