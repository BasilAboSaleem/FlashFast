import Redis from "ioredis";

const redis = new Redis({
  host: process.env.REDIS_HOST || "equipped-stallion-13425.upstash.io",
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || "ATRxAAIncDJjNzRiY2I0NmUzMDk0N2RhYTA2ODA2MTk5MmJkNDZmOXAyMTM0MjU",
  tls: process.env.REDIS_HOST ? {} : undefined, 
});


redis.on("connect", () => console.log("✅ Redis connected"));
redis.on("error", (err) => console.error("❌ Redis error:", err));
