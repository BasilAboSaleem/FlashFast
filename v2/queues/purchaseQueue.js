// v2/queues/purchaseQueue.js
const Queue = require("bull");
const redis = require("../utils/redis");

const purchaseQueue = new Queue("purchaseQueue", {
  redis: {
    host: process.env.REDIS_HOST || "127.0.0.1",
    port: process.env.REDIS_PORT || 6379,
  },
});

// Log queue events (for debugging)
purchaseQueue.on("waiting", (jobId) => console.log(`⏳ Job waiting: ${jobId}`));
purchaseQueue.on("active", (job) => console.log(`🚀 Job started: ${job.id}`));
purchaseQueue.on("completed", (job) =>
  console.log(`✅ Job completed: ${job.id}`)
);
purchaseQueue.on("failed", (job, err) =>
  console.log(`❌ Job failed ${job.id}: ${err.message}`)
);

module.exports = purchaseQueue;
