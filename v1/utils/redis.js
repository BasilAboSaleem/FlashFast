const Redis = require("ioredis");

const redis = new Redis({
  host: process.env.REDIS_HOST || "equipped-stallion-13425.upstash.io",
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || "ATRxAAIncDJjNzRiY2I0NmUzMDk0N2RhYTA2ODA2MTk5MmJkNDZmOXAyMTM0MjU",
  tls: {}, // ضروري للاتصال بـ Upstash Cloud
});

redis.on("connect", () => {
  console.log("✅ Redis connected successfully (v1)");
});

redis.on("error", (err) => {
  console.error("❌ Redis connection error (v1):", err);
});

module.exports = redis;
