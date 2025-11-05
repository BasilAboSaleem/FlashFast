# 🧪 Load Testing Analysis Report — Flash Sale API

Date: November 2025
Test Tool: k6
Duration: 5 minutes (1m ramp-up → 3m sustain → 1m ramp-down)
Virtual Users (VUs): 2000
Endpoints Tested: GET /flashsale-events
Goal: Compare performance between

---

**First round of tests**

- The first round tests give us very bad result

```
   http_req_duration
    ✗ 'p(95)<500' p(95)=30.67s
    ✗ 'p(99)<1200' p(99)=34.81s

```

- we do more tests and find that endpoint that doesn't rely on Database is doing great like "/"endpoint

```
  ✗ 'p(95)<500' p(95)=1.97s
  ✗ 'p(99)<1200' p(99)=5.19s

```

- After that we serve the DB from local docker file instead of using free online DB provider and the tests was rapidly improved

```
 ✗ 'p(95)<500' p(95)=1.97s
 ✗ 'p(99)<1200' p(99)=5.19s
```

---

## **Second round of tests**

Approach 1: Single Node.js server

Approach 2: Two Node.js servers behind Nginx (load balanced)

### 🧰 Section 1 — Methodology

**Tools Used**

Load testing: k6

Containerization: Docker & docker-compose

Reverse proxy: Nginx

Runtime: Node.js

**Test Scenario**

Each test simulated 2000 concurrent users accessing the GET /flashsale-events endpoint.
Ramp pattern:

`k6 run --vus 2000 --duration 4m tests/load-test-get-v2.js --summary-export=tests/results/load2-get-summary.json`

**Stages used in test script:**

```
stages: [
  { duration: "1m", target: 2000 },
  { duration: "3m", target: 2000 },
  { duration: "1m", target: 0 },
]
```

**Hardware Specs**
| Server | CPU (Before) | CPU (After) | RAM (Before) | RAM (After) |
|-------------------------|--------------|-------------|--------------|-------------|
| Server 1 (Single Node) | 5% | 23% | 74% | 78% |
| Server 2 (Nginx + 2 Nodes) | 11% | 88% | 67% | 74% |

Both environments ran on equivalent hardware with Docker containers.

📊 Section 2 — Quantitative Analysis
Metric Approach 1 (Single Node.js) Approach 2 (Nginx + 2 Nodes) Winner
| Metric | Approach 1 (Single Node.js) | Approach 2 (Nginx + 2 Nodes) | Winner |
|-------------------------|-----------------------------|--------------------------------------|--------------|
| Avg Latency (ms) | 2544.35 | 75.84 _(3072.29 true response)_ | Approach 2 |
| P90 Latency (ms) | 3633.42 | 75.57 | Approach 2 |
| P95 Latency (ms) | 3816.65 | 132.10 | Approach 2 |
| Throughput (req/s) | 749.67 | 4961.27 | Approach 2 |
| Error Rate (%) | 23.9% | 98.7% | Approach 1 |
| CPU After (%) | 23% | 88% | Approach 1 |
| RAM After (%) | 78% | 74% | Slightly Approach 2 |

🧩 Note: The second system reported far higher throughput, but the majority of those requests failed, indicating misconfiguration or saturation rather than true scalability.

**Summary**
1️⃣ Latency Comparison
Single Node.js: Stable, predictable curve around 2.5–3.8 seconds.
Nginx setup: Most responses failed or returned immediately with very short duration values (~75 ms median).

2️⃣ Throughput & Error Rate
Nginx + 2 servers: 4961 req/s but 98.7% failure rate.
Single Node.js: 750 req/s with 76% success rate — more consistent under load.

3️⃣ Resource Utilization
Nginx setup heavily CPU-bound (88%), likely from connection overhead and load-balancing contention.
Memory utilization comparable on both setups.

### **💡 Section 3 — Qualitative Analysis**

**When to Use Approach 1 (Single Node.js)**

- For moderate traffic or early-stage systems.
- When simplicity and reliability are preferred.
- Easier debugging, less operational complexity.

**When to Use Approach 2 (Nginx + Multiple Nodes)**

- When horizontal scaling is needed — after validating configuration.
- Recommended once Nginx is tuned for concurrency and Node.js instances are stateless.
- Requires health checks, retry policies, and proper keep-alive handling.

**Scalability Limitations**

- Approach 1: Limited by single-threaded Node.js event loop; CPU bottleneck occurs around a few thousand RPS.
- Approach 2: Scales better in theory, but requires tuning:
  - Increase worker_connections in nginx.conf
  - Ensure ulimit -n (file descriptors) is high
  - Balance keepalive & proxy buffer settings

**Real-World Considerations**

- Approach 1: Lower maintenance cost, less moving parts.
- Approach 2: Higher infrastructure and operational complexity (multiple containers, health checks, Nginx config).

**Observations / Surprises**

- 98% failure rate in the Nginx scenario suggests saturation or timeout misconfiguration.
- Latency readings under 100 ms were misleading because they corresponded to failed or prematurely closed requests.

### 🧭 Section 4 — Lessons Learned

1. High concurrency quickly exposes misconfigurations.
   Ensure OS limits and Nginx parameters (worker_connections, keepalive_timeout, proxy_read_timeout) are properly tuned.
2. Success rate matters more than raw throughput.
   A system returning errors at 98% success loss is not scaling effectively.
3. Horizontal scaling requires readiness probes and backpressure handling.
   Nginx should monitor backend health before routing requests.
4. Load testing helps identify bottlenecks early.
   Even a simple flash sale endpoint can fail under 2k VUs if not properly tuned.

#### 🔍 Section 5 — Future Improvements

- Add distributed Redis caching layer for flash sale data.
- Introduce asynchronous queue for writes (e.g., Kafka or RabbitMQ).
- Tune Nginx and Node parameters incrementally with smaller VU counts.
- Implement auto-scaling based on request latency and error thresholds.
- Add metrics collection (Grafana + Prometheus) for real-time visibility.

#### 🏁 Summary

| Category              | Winner                      | Reason                                    |
| --------------------- | --------------------------- | ----------------------------------------- |
| Reliability           | Single Node.js              | Far fewer request failures                |
| Raw Throughput        | Nginx + 2 Nodes             | Higher req/s but unstable                 |
| Resource Efficiency   | Single Node.js              | Lower CPU, stable memory                  |
| Scalability Potential | Nginx + 2 Nodes             | With proper tuning                        |
| Overall Stability     | Single Node.js (Approach 1) | Balanced performance under sustained load |

#### **Final Verdict:**

The single Node.js server delivered more stable results under high concurrency, while the Nginx + 2-node setup demonstrated potential scalability but failed due to configuration or saturation issues.
For production readiness, focus next on tuning the load balancer and ensuring backend health monitoring before scaling horizontally.
