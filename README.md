# ⚡ FlashFast – Backend Engineering Final Project

## 📘 Overview
**FlashFast** is an advanced backend system built for handling large-scale **e-commerce flash sales** — inspired by platforms like Amazon’s Lightning Deals and Black Friday events.  
It was developed as part of the **Backend Engineering & Performance Optimization** final project to demonstrate mastery of backend communication patterns, concurrency control, and load balancing.

---

## 🧩 Scenario Chosen: E-Commerce Flash Sale System
### 🎯 Real-Life Context
During a flash sale, **100,000+ users** attempt to purchase **limited stock (1,000 items)** in just a few minutes.  
The system must:
- Handle massive concurrent purchase requests.  
- Prevent overselling inventory.  
- Maintain consistent order creation and inventory states under load.  
- Scale efficiently across multiple instances.

---

## 🏗 Project Architecture
This project includes **two distinct implementations** of the same system for performance comparison:

| Version | Pattern | Description |
|----------|----------|-------------|
| **v1 – Synchronous HTTP** | Request/Response | Classic REST API implementation using HTTP, where all operations (purchase, order creation) happen within the same request cycle. |
| **v2 – Asynchronous Queue** | Redis Queue (Pub/Sub or BullMQ) | Decoupled architecture using Redis as a message queue to process purchases asynchronously and handle high concurrency safely. |

---

## 🧱 Tech Stack
| Component | Technology |
|------------|-------------|
| Language | Node.js (Express.js) |
| Database | MongoDB (Mongoose ORM) |
| Cache / Queue | Redis |
| Reverse Proxy / Load Balancer | Nginx |
| Containerization | Docker & Docker Compose |
| Load Testing Tools | k6 / Apache JMeter |
| Version Control | Git & GitHub |

---

## 🗂 Repository Structure
```
flashfast-backend/
├── v1/                     # Version 1 – Synchronous HTTP
│   ├── app.js
│   ├── controllers/
│   ├── routes/
│   ├── models/
│   ├── middlewares/
│   ├── utils/
|   ├── views/
│   ├── .env.v1
│   └── README.md
│
├── v2/                     # Version 2 – Asynchronous Queue (to be implemented)
│   ├── app.js
│   ├── server.js
│   ├── controllers/
│   ├── routes/
│   ├── queues/
│   ├── workers/
│   ├── utils/
│   │   ├── db.js
│   │   ├── redis.js
│   ├── .env.v2
│   └── README.md
│
├── docker-compose.yml
├── ARCHITECTURE.md         # System architecture diagrams and design decisions
├── ANALYSIS_REPORT.pdf     # Quantitative + qualitative performance comparison
├── README.md               # This file (root-level)
└── .gitignore
```

---

## 🚀 Running the Project

### 🐳 1. Start required services
```bash
docker-compose up -d
```

### ▶️ 2. Run Version 1 (Synchronous HTTP)
```bash
cd v1
npm install
npm run start
```
API base URL: `http://localhost:3001`

### ⚙️ 3. Run Version 2 (Asynchronous Queue)
(After implementation)
```bash
cd v2
npm install
npm run start
```

---

## 📡 Core Features (Both Versions)
- 🔐 User Authentication (JWT)
- 🛍 Product Management (Admin)
- ⚡ Flash Sale Event Scheduling (Admin)
- 💰 Flash Sale Purchase (Customer)
- 📦 Order Creation and Listing
- 🧾 Role-based Access Control
- 🧠 MongoDB Transactions for consistency
- 💾 Redis ready for caching & queues
- 🧰 Dockerized Environment for easy deployment

---

## 📊 Deliverables Overview
| Deliverable | Description |
|--------------|-------------|
| **v1 Implementation** | Complete synchronous HTTP backend |
| **v2 Implementation** | Async queue-based system with Redis |
| **ARCHITECTURE.md** | Diagrams and design decisions |
| **ANALYSIS_REPORT.pdf** | Performance comparison between v1 and v2 |
| **README.md (root)** | Overview and navigation |
| **Video Demo** | 5-minute walkthrough and live performance test |

---

## 🧠 Performance Goals
- Handle 10,000+ concurrent requests with no overselling.
- Maintain low latency (p95 < 200ms for queue version).
- Demonstrate horizontal scalability with Nginx load balancing.
- Collect metrics (latency, throughput, CPU/memory) for both versions.

---

## 🏁 Final Notes
This project demonstrates:
- Deep understanding of **backend communication patterns**.  
- Mastery of **synchronous vs asynchronous** execution models.  
- Practical application of **Redis, MongoDB transactions, and load balancing**.  
- Real-world engineering thinking in **performance analysis and scalability**.

---

### 👤 Author
**Basil Abu Saleem && Mohammed Salim**  
Backend Engineer | Node.js | MongoDB | Redis  
Built as part of the *Mastering Backend Engineering & Performance Optimization* program (Gaza Sky Geeks, 2025).
