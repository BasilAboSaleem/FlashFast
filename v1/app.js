const express = require("express");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const methodOverride = require("method-override");
const rateLimit = require("express-rate-limit");
const { connectDB } = require("./utils/db");
const { redis } = require("./utils/redis");

// ---------- Config ----------
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env.v1') });// 👈 download the correct environment file
const app = express(); 

// ---------- Basic Middleware ----------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(methodOverride("_method"));

// ---------- Rate Limiter ----------
app.use(
  rateLimit({
    windowMs: 1000, // per second
    max: 50, // maximum 50 requests
    message: "Too many requests, please slow down.",
  })
);

// ---------- Database Connections ----------
connectDB();
redis.on("connect", () => console.log("✅ Redis connected"));
redis.on("error", (err) => console.error("❌ Redis error:", err));

// ---------- Routes ----------
const authRoutes = require("./routes/auth");
const productRoutes = require("./routes/product");
const flashSaleEventRoutes = require("./routes/flashSaleEvent");
const flashSaleRoutes = require("./routes/flashSale");
const orderRoutes = require("./routes/orderRoutes");

app.use("/auth", authRoutes);
app.use("/products", productRoutes);
app.use("/flashsale-events", flashSaleEventRoutes);
app.use("/flashsale", flashSaleRoutes);
app.use("/orders", orderRoutes);

app.get("/", (req, res) => {
  res.send("🚀 FlashFast v1 (Synchronous HTTP) is running...");
});

// ---------- Start Server ----------
const PORT = process.env.PORT || 3001;
app.listen(PORT, () =>
  console.log(`✅ FlashFast v1 running on http://localhost:${PORT}`)
);
