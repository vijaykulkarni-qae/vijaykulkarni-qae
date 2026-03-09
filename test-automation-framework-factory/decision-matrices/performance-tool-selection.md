# Performance Testing Tool Selection Matrix

> **TAFF Decision Matrix** | Last Updated: March 2026
> Use this matrix to select the optimal performance/load testing tool based on protocol needs, team skills, and infrastructure constraints.

---

## Tools Compared

| ID | Tool | Scripting Language | Engine | Latest Stable (2026) |
|----|------|--------------------|--------|----------------------|
| K6 | k6 | JavaScript | Go | 0.54+ |
| LO | Locust | Python | Python (gevent) | 2.31+ |
| JM | JMeter | GUI / XML (Groovy scripting) | Java | 5.7+ |
| GA | Gatling | Scala / Java / Kotlin | JVM (Akka/Netty) | 3.12+ |
| AR | Artillery | YAML + JavaScript | Node.js | 2.x |
| VE | Vegeta | CLI flags / Go library | Go | 12.x |

---

## Scoring Dimensions (1–5 scale)

| # | Dimension | Weight | K6 | LO | JM | GA | AR | VE |
|---|-----------|--------|----|----|----|----|----|----|
| 1 | Scripting Language Accessibility | 8 | 5 | 5 | 2 | 3 | 4 | 2 |
| 2 | Learning Curve (5 = easiest) | 7 | 5 | 4 | 3 | 2 | 4 | 4 |
| 3 | Distributed Execution | 8 | 4 | 5 | 5 | 4 | 3 | 3 |
| 4 | Protocol Support (HTTP, WS, gRPC) | 7 | 5 | 3 | 5 | 4 | 4 | 2 |
| 5 | Real-Time Monitoring / Dashboard | 7 | 5 | 4 | 3 | 4 | 3 | 2 |
| 6 | CI/CD Integration | 8 | 5 | 4 | 3 | 4 | 5 | 4 |
| 7 | Resource Efficiency | 7 | 5 | 4 | 2 | 4 | 3 | 5 |
| 8 | Cloud Offerings | 5 | 5 | 3 | 3 | 5 | 4 | 1 |
| 9 | Reporting Quality | 6 | 4 | 3 | 4 | 5 | 3 | 2 |
| 10 | Scripting Flexibility | 6 | 4 | 5 | 3 | 4 | 3 | 2 |
| 11 | Community Size & Support | 6 | 5 | 4 | 5 | 3 | 3 | 2 |

### Unweighted Totals

| Tool | Raw Total (/55) |
|------|-----------------|
| **k6** | **52** |
| **Locust** | **44** |
| **JMeter** | **38** |
| **Gatling** | **42** |
| **Artillery** | **39** |
| **Vegeta** | **29** |

### Weighted Totals

| Tool | Weighted Score (/385) |
|------|----------------------|
| **k6** | **363** |
| **Locust** | **312** |
| **JMeter** | **263** |
| **Gatling** | **294** |
| **Artillery** | **273** |
| **Vegeta** | **206** |

---

## Scoring Rationale

### Scripting Language Accessibility
- **K6 (5):** Standard JavaScript/ES6 — familiar to most web developers.
- **LO (5):** Python — widely known, low-ceremony test definitions with decorators.
- **AR (4):** YAML for scenario definition + JS for custom logic; accessible but less flexible.
- **GA (3):** Scala DSL is powerful but unfamiliar to many; Java/Kotlin DSL (Gatling 3.9+) improves this.
- **JM (2):** GUI-based; Groovy scripting for custom logic is poorly documented.
- **VE (2):** CLI tool with limited scripting; Go library API for advanced use requires Go expertise.

### Distributed Execution
- **LO (5):** Built-in master/worker architecture; `--master` and `--worker` flags with zero config.
- **JM (5):** Mature distributed mode; JMeter server nodes well-documented for decades.
- **K6 (4):** k6-operator for Kubernetes; k6 Cloud handles distribution transparently. OSS requires orchestration.
- **GA (4):** Gatling Enterprise (formerly FrontLine) provides distributed; OSS is single-machine.
- **AR (3):** `artillery run --platform aws:ecs` for cloud distribution; less mature for self-hosted.
- **VE (3):** No built-in distribution; wrap with shell scripts across machines.

### Protocol Support
- **K6 (5):** HTTP/1.1, HTTP/2, WebSocket, gRPC, Redis, SQL via extensions.
- **JM (5):** HTTP, FTP, JDBC, LDAP, JMS, SOAP, TCP, WebSocket — broadest protocol set.
- **GA (4):** HTTP, WebSocket, JMS, MQTT; gRPC via community plugin.
- **AR (4):** HTTP, WebSocket, Socket.IO, Kinesis; gRPC via plugin.
- **LO (3):** HTTP-native; WebSocket and gRPC require custom `User` classes.
- **VE (2):** HTTP only; designed as a pure HTTP load generator.

### Real-Time Monitoring
- **K6 (5):** Native Grafana + Prometheus integration; `--out` flag streams to InfluxDB, Datadog, New Relic, Grafana Cloud.
- **LO (4):** Built-in web UI with real-time charts; exportable to TimescaleDB or Grafana.
- **GA (4):** Gatling Enterprise offers real-time dashboards; OSS generates post-run HTML reports.
- **JM (3):** Real-time via Backend Listener (InfluxDB + Grafana); native GUI graphs are limited.
- **AR (3):** Real-time output to console; Datadog/Splunk integration via plugins.
- **VE (2):** Outputs raw results to stdout; requires external tooling for visualization.

### Resource Efficiency
- **VE (5):** Go binary, minimal memory — can saturate network before exhausting CPU.
- **K6 (5):** Go runtime, single binary ~30MB. Handles 10k+ VUs on a single machine.
- **LO (4):** gevent-based concurrency is efficient for I/O; better than thread-per-user models.
- **GA (4):** Akka actor model is memory-efficient for high concurrency on JVM.
- **AR (3):** Node.js event loop handles concurrency but heavier than Go for raw throughput.
- **JM (2):** Thread-per-virtual-user model; 1000 VUs ≈ 1000 threads ≈ 2-4GB RAM.

---

## Decision Flowchart

```
START
  │
  ▼
┌─────────────────────────────────┐
│ Need distributed load testing   │
│ across multiple machines?       │
└──────┬──────────────┬───────────┘
       │ YES          │ NO
       ▼              ▼
┌──────────────┐  ┌───────────────────────────┐
│ Team knows   │  │ Team primarily knows      │
│ Python?      │  │ Python?                   │
└──┬────────┬──┘  └──────┬──────────┬─────────┘
   │ YES    │ NO         │ YES      │ NO
   ▼        ▼            ▼          ▼
┌───────┐ ┌────────┐ ┌───────┐ ┌──────────────────────┐
│Locust │ │Need    │ │Locust │ │ Need protocols       │
│       │ │proto-  │ │       │ │ beyond HTTP?          │
└───────┘ │cols    │ └───────┘ │ (WS, gRPC, JMS)      │
          │beyond  │           └──────┬──────────┬─────┘
          │HTTP?   │                  │ YES      │ NO
          └┬────┬──┘                  ▼          ▼
           │YES │NO            ┌──────────┐ ┌────────────────┐
           ▼    ▼              │ k6 or    │ │ Need real-time │
     ┌─────────┐┌────────┐    │ JMeter   │ │ dashboard?     │
     │ JMeter  ││ k6 or  │    └──────────┘ └──┬──────────┬──┘
     │ or k6   ││ Locust │                    │ YES      │ NO
     └─────────┘│(K8s)   │                    ▼          ▼
                └────────┘             ┌──────────┐ ┌────────┐
                                       │ k6 +     │ │ k6 or  │
                                       │ Grafana  │ │ Vegeta │
                                       └──────────┘ └────────┘
```

---

## When to Choose Each Tool

### k6
Best for **developer-centric teams wanting performance testing in CI/CD**. Ideal for:
- Shift-left performance: run load tests on every PR with threshold-based pass/fail
- Teams comfortable with JavaScript who want code-as-tests (not XML/GUI)
- Projects needing gRPC, WebSocket, and HTTP load in a single tool
- Grafana ecosystem integration (Prometheus, InfluxDB, Grafana Cloud k6)
- Single-machine tests up to ~10k VUs; Kubernetes-based distribution for larger scale

### Locust
Best for **Python teams needing simple distributed load testing**. Ideal for:
- Teams that want to write test scenarios in pure Python with full library access
- Quick ramp-up with minimal boilerplate (`@task` decorators)
- Built-in master/worker distribution with no commercial dependency
- Custom load shapes (step load, spike, soak) via `LoadTestShape` class
- Projects where testers need to embed complex logic (DB lookups, ML inference) in scenarios

### JMeter
Best for **enterprise environments and legacy protocol testing**. Ideal for:
- Organizations with existing JMeter expertise and test plans
- Projects requiring JDBC, JMS, FTP, LDAP, SOAP, or other non-HTTP protocols
- Teams that prefer a GUI for test creation (non-developer performance engineers)
- Regulatory environments where JMeter's 20+ year track record provides confidence
- Distributed testing with JMeter Server across on-prem infrastructure

### Gatling
Best for **JVM teams requiring high-throughput simulations with rich reports**. Ideal for:
- Scala/Java/Kotlin teams wanting type-safe, code-based scenarios
- High-concurrency tests — Akka model handles millions of requests efficiently
- Projects requiring beautiful HTML reports out of the box
- Enterprise needs via Gatling Enterprise (real-time dashboards, CI plugins, cloud distribution)
- Reusing Karate DSL functional tests as Gatling simulations via `karate-gatling`

### Artillery
Best for **Node.js teams and quick YAML-based load scenarios**. Ideal for:
- Teams wanting declarative YAML test definitions with minimal code
- Serverless/cloud-native architectures — `--platform aws:ecs` for distributed runs
- Socket.IO and WebSocket testing for real-time applications
- Quick smoke load tests embedded in CI pipelines
- Teams that prefer config-driven over code-driven performance tests

### Vegeta
Best for **quick, surgical HTTP load testing from the command line**. Ideal for:
- Constant-rate load testing (Vegeta maintains a fixed request rate, unlike ramp-based tools)
- Piping into analysis tools — output formats include JSON, CSV, HDR histogram
- Embedding in shell scripts and Makefiles for lightweight CI gates
- Go teams who want to use Vegeta as a library for custom load generators
- Microservice endpoint benchmarking where overhead must be near zero

---

## Benchmark Reference (2026)

Approximate VUs on a single 4-core / 8GB machine before CPU saturation:

| Tool | Max VUs (HTTP GET) | Memory at Max |
|------|-------------------|---------------|
| k6 | ~12,000 | ~1.5 GB |
| Locust | ~5,000 | ~2 GB |
| JMeter | ~1,500 | ~4 GB |
| Gatling | ~8,000 | ~2 GB |
| Artillery | ~4,000 | ~2.5 GB |
| Vegeta | ~15,000 (rate-based) | ~0.5 GB |

*Benchmarks are approximate and vary with scenario complexity, response sizes, and OS tuning.*

---

## Risk Factors

| Risk | Mitigation |
|------|-----------|
| k6 OSS lacks built-in distributed mode | Use k6-operator on K8s; evaluate Grafana Cloud k6 for managed distribution |
| JMeter thread model limits scale per node | Plan for multi-node grid; consider migrating hot paths to k6 or Gatling |
| Locust web UI is basic for enterprise reporting | Export to Grafana via TimescaleDB; use locust-plugins for enhanced output |
| Gatling Enterprise cost for small teams | Use OSS Gatling with CI-generated HTML reports; upgrade if dashboards needed |
| Vegeta is HTTP-only | Pair with k6 or Locust for WebSocket/gRPC scenarios |

---

## Version History

| Date | Change |
|------|--------|
| 2026-03-10 | Initial matrix created based on 2026 ecosystem benchmarks |
