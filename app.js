const express = require("express");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const methodOverride = require("method-override");
const rateLimit = require("express-rate-limit");
const { connectDB } = require("./utils/db");
const { redis } = require("./utils/redis");

// ---------- Config ----------
dotenv.config();
const app = express();

// ---------- Basic Middleware ----------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(methodOverride("_method"));

// ---------- Rate Limiter ----------
app.use(
  rateLimit({
    windowMs: 1000,       // per second
    max: 50,              // maximum 50 requests
    message: "Too many requests, please slow down.",
  })
);

// ---------- Database Connections ----------
connectDB();
redis.on("connect", () => console.log("✅ Redis connected"));
redis.on("error", (err) => console.error("❌ Redis error:", err));

// ---------- Routes ----------
const authRoutes = require("./routes/auth");

app.use("/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("🚀 FlashFast Sync API is running...");
});

// ---------- Start Server ----------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`✅ FlashFast running on http://localhost:${PORT}`)
);
