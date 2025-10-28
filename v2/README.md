# ⚡ FlashFast v2 – Asynchronous Queue Version

## 📘 Overview

**FlashFast v2** is the enhanced version of the FlashFast backend system, designed to handle extreme concurrency during flash sales using **asynchronous job processing** and **real-time updates**.

Unlike v1 (synchronous HTTP), this version leverages **Redis Queue (Bull)** to decouple the purchase process from the main request-response cycle, ensuring smooth handling of high traffic and preventing overselling.

---

## 🧩 Core Idea

During flash sales, thousands of users try to buy limited-stock products simultaneously. Handling all those operations synchronously can overload the system.

To solve this, **v2 introduces a queue system**:

1. When a purchase request arrives, it’s **added to a Redis queue** instead of being processed immediately.
2. A **Worker** consumes the jobs asynchronously, updating stock and creating orders safely.
3. **Socket.io** broadcasts real-time stock updates to all connected clients.

This architecture ensures:

* No overselling.
* Efficient concurrency management.
* Smooth user experience even under massive load.

---

## 🧱 Tech Stack

| Component               | Technology              |
| ----------------------- | ----------------------- |
| Language                | Node.js (Express.js)    |
| Database                | MongoDB (Mongoose ORM)  |
| Queue / Cache           | Redis (Bull Queue)      |
| Real-Time Communication | Socket.io               |
| Load Balancer           | Nginx                   |
| Containerization        | Docker & Docker Compose |

---

## 🗂 Folder Structure

```
v2/
├── app.js                     # Express setup
├── server.js                  # Main server with Socket.io & Worker integration
├── controllers/               # Core business logic (Auth, Product, FlashSale, Order)
├── routes/                    # Route definitions
├── models/                    # Mongoose models (User, Product, Order, FlashSaleEvent)
├── queues/                    # Bull queue setup (purchaseQueue.js)
├── workers/                   # Background job processors (purchaseWorker.js)
├── utils/                     # DB and Redis connection helpers
├── views/                     # Test pages (testStock.html)
├── middlewares/               # Authentication, validation, etc.
├── .env.v2                    # Environment variables
└── README.md                  # This file
```

---

## ⚙️ Setup Instructions

### 1️⃣ Environment Setup

Create a file named `.env.v2` inside the `v2/` directory:

```bash
PORT=3002
MONGO_URL=mongodb+srv://<username>:<password>@cluster.mongodb.net/flashfast
REDIS_URL=redis://localhost:6379
JWT_SECRET=your_jwt_secret
```

> ⚠️ If running multiple backend instances, use the same MongoDB & Redis connections.

---

### 2️⃣ Start Docker Services

```bash
docker-compose up -d
```

This starts MongoDB and Redis containers.

---

### 3️⃣ Install Dependencies

```bash
cd v2
npm install
```

---

### 4️⃣ Run the Application

#### Instance 1

```bash
set PORT=3001 && npm run start:v2
```

#### Instance 2

```bash
set PORT=3002 && npm run start:v2
```

---

### 5️⃣ Start Nginx Load Balancer

Edit `nginx.conf` in the project root:

```nginx
upstream flashfast_backend {
    server 127.0.0.1:3001;
    server 127.0.0.1:3002;
}

server {
    listen 80;
    server_name localhost;

    location / {
        proxy_pass http://flashfast_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Then start Nginx:

```bash
start nginx -c C:\path\to\project\nginx.conf
```

---

### 6️⃣ Test Real-Time Stock Updates

* Open `testStock.html` in multiple browser tabs.
* Perform purchases.
* Watch real-time stock updates broadcast to all connected clients.

---

## 🧠 Worker Logic Summary

The `purchaseWorker.js` processes queued jobs asynchronously:

* Validates the flash sale event and product.
* Performs **atomic stock decrement** using MongoDB’s `$inc` and `$gte`.
* Creates an order after successful stock deduction.
* Emits **real-time stock updates** using Socket.io.

Example Log Output:

```
🛠️ Processing purchase job: 12 by user 65fe...
🚀 Job started: 12
✅ Order 6742a created successfully
📡 Stock update emitted for product 34ab3
🎉 Job 12 completed
```

---

## 📦 Key Features

* 🚀 Asynchronous Purchase Processing (Bull Queue)
* 🔄 Real-Time Stock Updates (Socket.io)
* 💪 Atomic Inventory Updates (MongoDB)
* 🧾 Order Persistence
* ⚡ Horizontal Scaling via Nginx Load Balancer
* 🧰 Docker Support for MongoDB + Redis
* 🧠 Robust Logging for each job

---

## 📊 Load Balancing & Scalability

* Two backend instances (on ports 3000 & 3001) managed by Nginx.
* Requests distributed evenly (Round-robin) or by least connections.
* Shared Redis Queue ensures coordinated job processing across instances.
* Horizontal scaling achieved by simply adding more backend instances.

---

## 🧪 Testing and Performance Evaluation

1. Run **stress tests** using `k6` or `autocannon`.
2. Measure:

   * Request throughput (RPS)
   * Job queue latency
   * MongoDB response times
   * CPU and memory usage
3. Compare results with **v1** (HTTP version) to show efficiency gains.

Expected Outcomes:

* ✅ No overselling
* ✅ Lower latency for heavy load
* ✅ Stable throughput under 10,000+ concurrent requests

---

## 🏁 Conclusion

**FlashFast v2** successfully demonstrates:

* The power of asynchronous queue-based design.
* Real-time synchronization using WebSockets.
* Horizontal scalability with Nginx.
* Safe and consistent flash sale order handling under extreme load.

---

### 👤 Authors

**Basil Abu Saleem && Mohammed Salim**
Backend Engineer | Node.js | MongoDB | Redis
Built as part of the *Mastering Backend Engineering & Performance Optimization* program (Gaza Sky Geeks, 2025).
