const cluster = require("cluster");
const os = require("os");

if (cluster.isMaster) {
  console.log("Master process is running");
  const numWorkers = 1 || os.cpus().length;
  //   const numCPUs = os.cpus().length; // Get the number of CPU cores
  console.log(`Master ${process.pid} is running`);
  console.log(`Forking for ${numWorkers} CPUs`);
  for (let i = 0; i < numWorkers; i++) {
    cluster.fork(); // Fork a worker for each CPU core
  }

  cluster.on("exit", (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died`);
  });
} else {
  console.log(`Worker ${process.pid} started`);
  // Your existing app code goes here
  const express = require("express");
  const dotenv = require("dotenv");
  const cookieParser = require("cookie-parser");
  const methodOverride = require("method-override");
  const rateLimit = require("express-rate-limit");
  const { connectDB } = require("./utils/db");
  const { redis } = require("./utils/redis");
  const morgan = require("morgan");

  // ---------- Config ----------
  const path = require("path");
  require("dotenv").config({ path: path.resolve(__dirname, ".env.v1") });
  const app = express();

  // ---------- Basic Middleware ----------
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use(methodOverride("_method"));
  app.use(morgan("dev"));

  // ---------- Database Connections ----------
  connectDB();

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
  const server = app.listen(PORT, () =>
    console.log(`✅ FlashFast v1 running on http://localhost:${PORT}`)
  );

  // Optional: Log errors at socket level
  server.on("error", (err) => {
    console.error("[SERVER ERROR]", err);
  });
}
