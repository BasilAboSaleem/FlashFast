const cluster = require("cluster");
const os = require("os");
const path = require("path");

// Number of CPU cores
const numCPUs = os.cpus().length;

if (cluster.isMaster || cluster.isPrimary) {
  console.log(`🚀 Master process ${process.pid} is running`);
  console.log(`📊 Forking ${numCPUs} workers...`);

  // Fork workers for each CPU core
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  // Listen for dying workers and restart them
  cluster.on("exit", (worker, code, signal) => {
    console.log(
      `❌ Worker ${worker.process.pid} died (${signal || code}). Restarting...`
    );
    cluster.fork();
  });

  // Log when workers come online
  cluster.on("online", (worker) => {
    console.log(`✅ Worker ${worker.process.pid} is online`);
  });

  // Optional: Graceful shutdown
  process.on("SIGTERM", () => {
    console.log("🛑 SIGTERM received. Shutting down gracefully...");
    for (const id in cluster.workers) {
      cluster.workers[id].kill();
    }
  });

  process.on("SIGINT", () => {
    console.log("🛑 SIGINT received. Shutting down gracefully...");
    for (const id in cluster.workers) {
      cluster.workers[id].kill();
    }
    process.exit(0);
  });
} else {
  // Workers share the TCP connection
  // Each worker runs the app.js file
  require("./app.js");
}
