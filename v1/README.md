# ⚡ FlashFast – E-Commerce Flash Sale System  
### Version 1 – HTTP Synchronous Implementation  

---

## 📘 Overview
**FlashFast** is a backend system for managing **E-Commerce Flash Sales** — events where a limited stock of products is sold at high speed to many customers.  
This first version (v1) implements the system using **traditional HTTP requests (synchronous)** to establish a baseline for performance comparison against the asynchronous (queue-based) version later.  

---

## 🚀 Tech Stack
- **Node.js + Express.js** – Backend framework  
- **MongoDB (Mongoose)** – Main database  
- **Redis** – Cache / ready for async version  
- **JWT (jsonwebtoken)** – Authentication  
- **Docker** – Containerized MongoDB & Redis services  
- **Postman** – API testing  

---

## 🧩 Core Features (Version 1)

| Feature | Description | Status |
|----------|--------------|--------|
| **User Authentication** | Register & login with JWT | ✅ |
| **Products Management** | Admins can create and list products | ✅ |
| **Flash Sale Events** | Admins can create timed sale events for specific products | ✅ |
| **Purchase Flow** | Customers can purchase a product during an active flash sale (synchronous) | ✅ |
| **Orders** | Users can view their own orders | ✅ |
| **Role-based Access Control** | Admin vs Customer permissions enforced | ✅ |
| **Redis Connection** | Active and ready for async version | ✅ |

---

## 🧱 Data Models

### 🧍 User
| Field | Type | Description |
|--------|------|-------------|
| `name` | String | User name |
| `email` | String | Unique email |
| `password` | String | Hashed password |
| `role` | String | Either `admin` or `customer` |

---

### 📦 Product
| Field | Type | Description |
|--------|------|-------------|
| `name` | String | Product name |
| `price` | Number | Product price |
| `stock` | Number | Base stock (outside flash sale) |

---

### ⚡ FlashSaleEvent
| Field | Type | Description |
|--------|------|-------------|
| `product` | ObjectId (ref: Product) | Product being sold |
| `startTime` | Date | Start of flash sale |
| `endTime` | Date | End of flash sale |
| `availableStock` | Number | Remaining quantity during event |
| `soldQuantity` | Number | Total sold units |
| `isActive` | Boolean | Whether event is active |

---

### 🧾 Order
| Field | Type | Description |
|--------|------|-------------|
| `user` | ObjectId (ref: User) | Who placed the order |
| `product` | ObjectId (ref: Product) | Product purchased |
| `quantity` | Number | Amount purchased |
| `totalPrice` | Number | Calculated from product price × quantity |
| `status` | String | e.g. `confirmed` |

---

## 🔐 Authentication & Authorization

| Role | Permissions |
|------|--------------|
| **Admin** | Create products, create flash sale events |
| **Customer** | Purchase during flash sale, view own orders |

- Auth implemented via JWT in headers:  
  `Authorization: Bearer <token>`

---

## 🧭 API Routes (Version 1)

### Auth Routes
| Method | Endpoint | Description | Role |
|---------|-----------|-------------|------|
| `POST` | `/auth/register` | Register new user | Public |
| `POST` | `/auth/login` | Login and get token | Public |

---

### Product Routes
| Method | Endpoint | Description | Role |
|---------|-----------|-------------|------|
| `POST` | `/products` | Create new product | Admin |
| `GET` | `/products` | List all products | Public |

---

### Flash Sale Event Routes
| Method | Endpoint | Description | Role |
|---------|-----------|-------------|------|
| `POST` | `/flashsale-events` | Create a new flash sale event | Admin |
| `GET` | `/flashsale-events` | List all flash sale events | Public |

---

### Purchase Route
| Method | Endpoint | Description | Role |
|---------|-----------|-------------|------|
| `POST` | `/flashsale/:eventId/purchase` | Purchase a product in flash sale | Customer |

#### Example Request Body:
```json
{
  "quantity": 1
}
```

---

### Orders Route
| Method | Endpoint | Description | Role |
|---------|-----------|-------------|------|
| `GET` | `/orders/my` | View logged-in user’s orders | Customer |

---

## ⚙️ How to Run the Project

### 1. Clone the Repository
```bash
git clone https://github.com/BasilAboSaleem/FlashFast
cd flashfast-backend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment
Create `.env` file:
```bash
PORT=3001
MONGO_URI=mongodb://localhost:27017/flashfast
JWT_SECRET=your_jwt_secret
REDIS_HOST=localhost
REDIS_PORT=6379
```

### 4. Start Services via Docker
```bash
docker-compose up -d
```

### 5. Run Server
```bash
npm run dev
```

---

## 🧪 Testing Flow (via Postman)

1. **Register Admin**
   - `POST /auth/register`
2. **Login as Admin**
   - Save token
3. **Create Product**
   - `POST /products`
4. **Create Flash Sale Event**
   - `POST /flashsale-events`
5. **Register & Login Customer**
6. **Purchase Product**
   - `POST /flashsale/:eventId/purchase`
7. **View Orders**
   - `GET /orders/my`

---

## 📊 Version 1 Summary

| Area | Status |
|-------|--------|
| Core Models | ✅ Complete |
| Controllers & Routes | ✅ Complete |
| Authentication | ✅ Done |
| Authorization | ✅ Done |
| Redis Connection | ✅ Configured |
| Purchase Logic | ✅ Tested |
| Postman Tests | ✅ Passed |
| Performance Benchmark | 🚫 Will be done in Version 2 |

---

## ⚡ Next Steps – Version 2 (Async / High-Concurrency)
In the next version, the system will:
- Process purchases using **Queues (Bull / Redis Streams)**  
- Handle **high concurrency safely**  
- Implement **Redis caching** for performance  
- Compare benchmark results between synchronous and asynchronous implementations  

---

## 👨‍💻 Author
**Basil Abu Saleem && Mohammed Salim**  
Backend Developer – FlashFast Project (Final Project, Mastering Backend Engineering & Performance Optimization Training)

---

## 🏁 Status
✅ **Version 1 Completed and Fully Tested**  
🔜 Next: **Version 2 – Asynchronous Queue Implementation**
