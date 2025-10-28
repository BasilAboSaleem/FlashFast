-Commerce Flash Sale System\*\*

**Real-Life Context:**

Your company runs flash sales (like Black Friday) where 100,000+ users try to purchase limited inventory (1,000 items) within 5 minutes.

**Your Mission:**

Build a backend system that handles:

- Product inventory management
- Purchase requests from thousands of concurrent users
- Payment processing queue
- Real-time stock updates to users

**Features to Implement & Compare:**

1\. **Request Handling Pattern** (Pick 2 to implement & compare):

- Synchronous HTTP request-response
- Asynchronous message queue (RabbitMQ/Redis)
- Server-Sent Events for stock updates

2\. **Execution Architecture** (Implement BOTH):

- Single\-threaded event loop (Node.js/Python asyncio)
- Multi-threaded/Multi-process (Go/Java/Python)

3\. **Load Distribution** (Pick 2\):

- Round-robin load balancer
- Least connections algorithm
- Consistent hashing for session affinity

**Analysis Requirements:**

- Which pattern prevents overselling inventory?
- Performance under 10,000 concurrent requests
- Latency comparison (p50, p95, p99)
- Resource usage (CPU, memory)

---

**Submission Structure**

Your submission must include the following in a **single ZIP file**:

**Project Structure**

```text
your-name-backend-project/
├── README.md                # Overview & setup instructions
├── ARCHITECTURE.md          # System design document
├── ANALYSIS_REPORT.pdf      # Your comparative analysis
├── demo-video.mp4           # 5-minute demo
├── src/                     # Source code
│   ├── implementation-1/    # First approach
│   ├── implementation-2/    # Second approach
│   └── load-balancer/       # Proxy/LB code
├── tests/                   # Load testing scripts
│   ├── load-test-1.js       # Test for approach 1
│   ├── load-test-2.js       # Test for approach 2
│   └── results/             # Raw results (CSV/JSON)
├── benchmarks/              # Performance graphs
│   ├── latency-comparison.png
│   ├── throughput-comparison.png
│   └── resource-usage.png
└── docker-compose.yml       # Easy setup

```

---

**Detailed Deliverables**

1. **README.md**

- Scenario chosen and why
- Tech stack used
- Setup instructions (must run with (docker-compose up))
- How to run load tests
- Brief architecture overview

2. **ARCHITECTURE.md**

- System architecture diagram (draw.io/Lucidchart)
- OSI model layer breakdown of your protocols Sequence diagrams for key flows
- Design decisions and trade-offs
- Why you chose specific patterns

3. **Source Code**

- Two working implementations of different approaches
- Clean, commented code
- Proper error handling
- Configuration files (don't hardcode values)
- Load balancer/proxy implementation

**Code Quality Checklist:**

- [ ] Follows language best practices
- [ ] Proper logging (timestamps, levels)
- [ ] Environment variables for config
- [ ] Handles edge cases (network failures, timeouts)
- [ ] Graceful shutdown

4. **ANALYSIS_REPORT.pdf**
   This is the most important deliverable\! Structure:

**Section 1: Methodology**

- How you tested (tools: k6, Apache Bench, JMeter, wrk)
- Test scenarios (load profiles)
- Hardware specs
- Test duration and repetitions

**Section 2: Quantitative Analysis**
Create comparison tables like:
| Metric | Approach 1 | Approach 2 | Winner |
|----------------------|------------|------------|-------------|
| Avg Latency (ms) | 45 | 23 | Approach 2 |
| P95 Latency (ms) | 120 | 67 | Approach 2 |
| P99 Latency (ms) | 340 | 210 | Approach 2 |
| Throughput (req/s) | 8,500 | 12,000 | Approach 2 |
| CPU Usage (%) | 65 | 82 | Approach 1 |
| Memory (MB) | 450 | 680 | Approach 1 |
| Error Rate (%) | 0.1 | 0.05 | Approach 2 |

Include graphs:

- Latency over time
- Throughput under increasing load
- Resource utilization
- Response time distribution (histogram)

**Section 3: Qualitative Analysis**

- When would you use Approach 1?
- When would you use Approach 2?
- Scalability limitations discovered
- Real\-world considerations (cost, maintenance, complexity)
- What surprised you during testing?

**Section 4: Lessons Learned**

- What went wrong and how you fixed it
- What you'd do differently
- How course concepts applied
- Future improvements

**5 Demo Video**
5-minute screen recording

- Show both implementations running
- Run a load test live
- Walk through key code sections
- Show performance graphs
- Explain your findings
  **Tools:** Loom, OBS Studio, or Zoom recording

6 **Load Testing Scripts**

- Automated, reproducible tests
- Multiple scenarios (normal, peak, stress)
- Results exported to CSV/JSON
- Clear instructions to run

---

**Submission Guidelines**

**Deadline: \[Instructor sets date \- 2 weeks from start\]**

**How to Submit:**
1\. Create a ZIP file named: (LASTNAME_FIRSTNAME_backend_project.zip
2\. Upload to course platform
3\. File size limit: 500MB (use Git LFS for large files, or link to YouTube for video)
4\. Include a (submission-checklist.md) with this:

markdown

#### Submission Checklist

- [ ] README.md with setup instructions
- [ ] ARCHITECTURE.md with diagrams
- [ ] ANALYSIS_REPORT.pdf with graphs
- [ ] demo\-video.mp4 (or YouTube link)
- [ ] Source code for 2+ implementations
- [ ] Load balancer/proxy code
- [ ] Load testing scripts
- [ ] docker\-compose.yml
- [ ] Test results (CSV/JSON files)
- [ ] All graphs as PNG/PDF

---

**Getting Started Tips**

1\. **Week 1: Build & Test**

- Days 1-2: Setup environment, pick scenario
- Days 3-5: Implement first approach
- Days 6-7: Implement second approach \+ basic tests

2\. **Week 2: Analyze & Document**

- Days 8-10: Load testing, collect metrics
- Days 11-12: Write analysis report
- Days 13-14: Create video, polish documentation

3\. **Tech Stack Suggestions:**

- **Languages:** Python (FastAPI/Flask), Node.js (Express), Go, Java (Spring Boot)
- **Load Testing:** k6 (recommended), Apache JMeter, wrk, Locust
- **Protocols:** nginx (reverse proxy), HAProxy, Envoy
- **Message Queues:** Redis, RabbitMQ, Kafka
- **Databases:** PostgreSQL, MongoDB, Redis
- **Containerization:** Docker, docker\-compose

4\. **Common Mistakes to Avoid:**
X Testing on your laptop only (use cloud VMs for realistic results)
X Not warming up the system before benchmarks
X Hardcoding values instead of using config files
X Focusing only on happy path (test failures\!)
X Making the video too long or too technical
