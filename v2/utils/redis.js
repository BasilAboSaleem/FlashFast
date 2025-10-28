const Redis = require("ioredis");

const redis = new Redis({
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  tls: {}, // Enable TLS for secure connections (e.g., Upstash)
});

redis.on("connect", () => {
  console.log("✅ Redis connected successfully (v2)");
});

redis.on("error", (err) => {
  console.error("❌ Redis connection error (v2):", err);
});

module.exports = redis;
