const express = require("express");
const cookieParser = require("cookie-parser");
const methodOverride = require("method-override");
const rateLimit = require("express-rate-limit");
const path = require("path");
const { connectDB } = require("./utils/db");
const redis = require("./utils/redis");
const morgan = require("morgan");

// Load environment variables for v2
require("dotenv").config({ path: path.resolve(__dirname, ".env.v2") });

const app = express();

// ---------- Basic Middleware ----------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "views")));
app.use(morgan("dev"));
// ---------- Rate Limiter ----------
// app.use(
//   rateLimit({
//     windowMs: 1000, // per second
//     max: 50,
//     message: "Too many requests, please slow down.",
//   })
// );

// ---------- Database Connections ----------
connectDB();
// redis.on("connect", () => console.log("✅ Redis connected"));
// redis.on("error", (err) => console.error("❌ Redis error:", err));

// ---------- Routes ----------
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const flashSaleRoutes = require("./routes/flashSaleRoutes");
const orderRoutes = require("./routes/orderRoutes");
const flashSaleEventRoutes = require("./routes/flashSaleEventRoutes");

app.use("/api/flashsale-events", flashSaleEventRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/flashsale", flashSaleRoutes);
app.use("/api/orders", orderRoutes);

app.get("/testStock", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "testStock.html"));
});
app.get("/", (req, res) => {
  res.send("🚀 FlashFast v2 (Asynchronous Queue) is running...");
});

module.exports = app;
