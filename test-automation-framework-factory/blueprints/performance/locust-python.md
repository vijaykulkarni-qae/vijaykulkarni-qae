# Blueprint: Locust + Python — Load Testing

> **Tool Combo** Locust · Python 3.10+ · Docker Compose (distributed mode)
> **Testing Types** Load · Stress · Soak · Spike · Smoke
> **Difficulty** Intermediate

---

## 1 Overview

Locust is a Python-based, event-driven load-testing framework that models user behaviour as plain Python code. It scales horizontally through a master-worker architecture and provides a real-time web UI for monitoring. Because test scenarios are regular Python, you get the full ecosystem — `requests`, `faker`, database drivers, custom assertions — without a DSL.

This blueprint produces a production-ready performance test framework that:

- Implements the **User class + TaskSet** pattern with weighted `@task` decorators.
- Defines **five load profiles** (smoke, load, stress, soak, spike) via custom `LoadTestShape` classes.
- Supports **distributed execution** with Docker Compose (1 master + N workers).
- Outputs CSV/JSON stats and integrates with external monitoring via event hooks.
- Runs headless in GitHub Actions with threshold-based pass/fail gating.

---

## 2 Prerequisites

| Requirement | Version | Purpose |
|---|---|---|
| Python | ≥ 3.10 | Runtime |
| Locust | ≥ 2.20 | Load test framework |
| Docker & Docker Compose | latest | Distributed execution |
| pip / Poetry | latest | Dependency management |
| GitHub Actions | — | CI/CD pipeline |

### Install

```bash
pip install locust

# Verify
locust --version
```

### requirements.txt

```
locust>=2.20
faker>=20.0
gevent>=23.0
```

---

## 3 Architecture

### 3.1 Project Structure

```
performance-tests/
├── locustfiles/
│   ├── locustfile.py            # default entrypoint
│   ├── api_users.py             # REST API user classes
│   ├── ws_users.py              # WebSocket user classes
│   └── composite.py             # multi-user-type scenario
├── shapes/
│   ├── smoke_shape.py           # 1 user, 1 min
│   ├── load_shape.py            # target users, 10 min
│   ├── stress_shape.py          # 2× target, 15 min
│   ├── soak_shape.py            # target users, 1 hour
│   └── spike_shape.py           # 10× target, 2 min burst
├── lib/
│   ├── config.py                # environment config loader
│   ├── data_feeder.py           # CSV/JSON data providers
│   ├── custom_metrics.py        # event hooks for external metrics
│   └── helpers.py               # reusable request builders
├── data/
│   ├── users.csv                # parameterised credentials
│   └── payloads.json            # request body templates
├── reports/                     # generated stats
│   ├── stats.csv
│   ├── failures.csv
│   └── exceptions.csv
├── docker-compose.yml           # master + workers
├── Dockerfile                   # custom Locust image
├── .github/
│   └── workflows/
│       └── perf-test.yml
├── requirements.txt
└── README.md
```

### 3.2 User ↔ TaskSet Relationship

```
┌──────────────────────────────────────┐
│ HttpUser (host, wait_time, weight)   │
│                                      │
│  ┌────────────────────────────────┐  │
│  │  @task(3) browse_products()    │  │
│  │  @task(2) view_product()       │  │
│  │  @task(1) add_to_cart()        │  │
│  └────────────────────────────────┘  │
│                                      │
│  on_start()  → login / setup        │
│  on_stop()   → logout / cleanup     │
└──────────────────────────────────────┘
```

---

## 4 Core Patterns

### 4.1 Basic User Class with Weighted Tasks

```python
# locustfiles/api_users.py
from locust import HttpUser, task, between, tag

class APIUser(HttpUser):
    """Simulates a typical API consumer."""

    wait_time = between(1, 3)
    host = ""  # set via --host or env var

    def on_start(self):
        """Authenticate once per simulated user."""
        resp = self.client.post("/auth/login", json={
            "username": "test-user",
            "password": "test-pass",
        })
        self.token = resp.json().get("token", "")
        self.client.headers.update({"Authorization": f"Bearer {self.token}"})

    def on_stop(self):
        self.client.post("/auth/logout")

    @task(5)
    @tag("read")
    def list_resources(self):
        with self.client.get("/api/resources", catch_response=True) as resp:
            if resp.status_code != 200:
                resp.failure(f"Expected 200, got {resp.status_code}")
            elif not resp.json():
                resp.failure("Empty response body")

    @task(3)
    @tag("read")
    def get_single_resource(self):
        resource_id = self._random_id()
        self.client.get(f"/api/resources/{resource_id}", name="/api/resources/[id]")

    @task(1)
    @tag("write")
    def create_resource(self):
        self.client.post("/api/resources", json={
            "name": f"item-{self._random_id()}",
            "value": 42,
        })

    def _random_id(self):
        import random
        return random.randint(1, 1000)
```

### 4.2 TaskSet Pattern (Nested Behaviour)

```python
from locust import HttpUser, TaskSet, task, between

class BrowseBehaviour(TaskSet):
    @task(3)
    def view_catalogue(self):
        self.client.get("/catalogue")

    @task(1)
    def view_item(self):
        self.client.get("/catalogue/item/1", name="/catalogue/item/[id]")

    @task(1)
    def stop_browsing(self):
        self.interrupt()  # return to parent

class CheckoutBehaviour(TaskSet):
    @task
    def add_to_cart(self):
        self.client.post("/cart", json={"item_id": 1, "qty": 1})

    @task
    def checkout(self):
        self.client.post("/checkout")
        self.interrupt()

class ECommerceUser(HttpUser):
    wait_time = between(1, 5)
    tasks = {BrowseBehaviour: 3, CheckoutBehaviour: 1}
```

### 4.3 Custom LoadTestShape Classes

```python
# shapes/load_shape.py
from locust import LoadTestShape
import os

TARGET_USERS = int(os.environ.get("TARGET_USERS", 50))

class LoadProfile(LoadTestShape):
    """Ramp to target over 2 min → hold 6 min → ramp down 2 min."""

    stages = [
        {"duration": 120,  "users": TARGET_USERS, "spawn_rate": TARGET_USERS / 120},
        {"duration": 480,  "users": TARGET_USERS, "spawn_rate": 1},
        {"duration": 600,  "users": 0,            "spawn_rate": TARGET_USERS / 120},
    ]

    def tick(self):
        run_time = self.get_run_time()
        for stage in self.stages:
            if run_time < stage["duration"]:
                return (stage["users"], stage["spawn_rate"])
        return None  # stop test
```

```python
# shapes/smoke_shape.py
from locust import LoadTestShape

class SmokeProfile(LoadTestShape):
    """1 user for 1 minute."""

    def tick(self):
        if self.get_run_time() < 60:
            return (1, 1)
        return None
```

```python
# shapes/stress_shape.py
from locust import LoadTestShape
import os

TARGET_USERS = int(os.environ.get("TARGET_USERS", 50))

class StressProfile(LoadTestShape):
    """Ramp to 2× target over 3 min → hold 9 min → ramp down 3 min."""

    peak = TARGET_USERS * 2

    stages = [
        {"duration": 180,  "users": peak, "spawn_rate": peak / 180},
        {"duration": 720,  "users": peak, "spawn_rate": 1},
        {"duration": 900,  "users": 0,    "spawn_rate": peak / 180},
    ]

    def tick(self):
        run_time = self.get_run_time()
        for stage in self.stages:
            if run_time < stage["duration"]:
                return (stage["users"], stage["spawn_rate"])
        return None
```

```python
# shapes/soak_shape.py
from locust import LoadTestShape
import os

TARGET_USERS = int(os.environ.get("TARGET_USERS", 50))

class SoakProfile(LoadTestShape):
    """Ramp to target over 5 min → hold 50 min → ramp down 5 min."""

    stages = [
        {"duration": 300,   "users": TARGET_USERS, "spawn_rate": TARGET_USERS / 300},
        {"duration": 3300,  "users": TARGET_USERS, "spawn_rate": 1},
        {"duration": 3600,  "users": 0,            "spawn_rate": TARGET_USERS / 300},
    ]

    def tick(self):
        run_time = self.get_run_time()
        for stage in self.stages:
            if run_time < stage["duration"]:
                return (stage["users"], stage["spawn_rate"])
        return None
```

```python
# shapes/spike_shape.py
from locust import LoadTestShape
import os

TARGET_USERS = int(os.environ.get("TARGET_USERS", 50))

class SpikeProfile(LoadTestShape):
    """Instant burst to 10× target for 1 min → immediate drop."""

    peak = TARGET_USERS * 10

    def tick(self):
        run_time = self.get_run_time()
        if run_time < 10:
            return (self.peak, self.peak)  # instant ramp
        elif run_time < 70:
            return (self.peak, 1)          # hold
        elif run_time < 120:
            return (0, self.peak)          # drop
        return None
```

### 4.4 CSV Data Feeding

```python
# lib/data_feeder.py
import csv
import itertools
import os

def load_csv(filename):
    filepath = os.path.join(os.path.dirname(__file__), '..', 'data', filename)
    with open(filepath, 'r') as f:
        return list(csv.DictReader(f))

_users_cycle = None

def get_next_user():
    global _users_cycle
    if _users_cycle is None:
        _users_cycle = itertools.cycle(load_csv('users.csv'))
    return next(_users_cycle)
```

### 4.5 Event Hooks for Custom Metrics

```python
# lib/custom_metrics.py
from locust import events
import time
import logging

logger = logging.getLogger(__name__)

request_log = []

@events.request.add_listener
def on_request(request_type, name, response_time, response_length, response, exception, **kwargs):
    """Capture every request for external analysis."""
    request_log.append({
        "timestamp": time.time(),
        "method": request_type,
        "endpoint": name,
        "response_time_ms": response_time,
        "status_code": getattr(response, "status_code", None),
        "error": str(exception) if exception else None,
    })

@events.test_stop.add_listener
def on_test_stop(environment, **kwargs):
    """Export collected metrics on test completion."""
    import json
    with open("reports/request_log.json", "w") as f:
        json.dump(request_log, f, indent=2)
    logger.info(f"Exported {len(request_log)} request records to reports/request_log.json")

@events.quitting.add_listener
def on_quitting(environment, **kwargs):
    """Fail the process if error rate exceeds threshold."""
    stats = environment.runner.stats.total
    if stats.num_requests == 0:
        return
    fail_ratio = stats.num_failures / stats.num_requests
    if fail_ratio > 0.05:
        logger.error(f"Failure rate {fail_ratio:.2%} exceeds 5% threshold")
        environment.process_exit_code = 1
    if stats.avg_response_time > 500:
        logger.error(f"Avg response time {stats.avg_response_time:.0f}ms exceeds 500ms threshold")
        environment.process_exit_code = 1
```

### 4.6 Configuration Module

```python
# lib/config.py
import os

class Config:
    BASE_URL     = os.environ.get("TARGET_HOST", "http://localhost:3000")
    TARGET_USERS = int(os.environ.get("TARGET_USERS", "50"))
    SPAWN_RATE   = int(os.environ.get("SPAWN_RATE", "10"))
    RUN_TIME     = os.environ.get("RUN_TIME", "10m")
    HEADLESS     = os.environ.get("HEADLESS", "true").lower() == "true"
    CSV_PREFIX   = os.environ.get("CSV_PREFIX", "reports/stats")
    WORKERS      = int(os.environ.get("WORKERS", "4"))
```

---

## 5 Configuration

### 5.1 CLI Execution

```bash
# Web UI mode (default http://localhost:8089)
locust -f locustfiles/api_users.py --host=http://localhost:3000

# Headless mode
locust -f locustfiles/api_users.py \
  --host=http://localhost:3000 \
  --headless \
  --users 50 --spawn-rate 10 --run-time 10m \
  --csv=reports/stats --html=reports/report.html

# With custom shape (shape overrides --users/--spawn-rate/--run-time)
locust -f locustfiles/api_users.py,shapes/load_shape.py \
  --host=http://localhost:3000 \
  --headless \
  --csv=reports/stats
```

### 5.2 locust.conf (File-Based Config)

```ini
# locust.conf — lives in project root
locustfile = locustfiles/api_users.py
host = http://localhost:3000
users = 50
spawn-rate = 10
run-time = 10m
headless = true
csv = reports/stats
html = reports/report.html
```

### 5.3 Distributed Mode (CLI)

```bash
# Terminal 1 — Master
locust -f locustfiles/api_users.py --master --host=http://target:3000

# Terminal 2..N — Workers
locust -f locustfiles/api_users.py --worker --master-host=127.0.0.1
```

---

## 6 Reporting

### 6.1 Built-in Outputs

| Output | Flag | Description |
|---|---|---|
| Web UI | (default) | Real-time charts at `http://localhost:8089` |
| CSV | `--csv=prefix` | `prefix_stats.csv`, `prefix_failures.csv`, `prefix_exceptions.csv` |
| HTML | `--html=path` | Self-contained HTML report |
| JSON (stats) | Event hook | Custom export via `@events.test_stop` listener |

### 6.2 Custom Event Listener for External Monitoring

```python
@events.request.add_listener
def push_to_prometheus(request_type, name, response_time, **kwargs):
    """Push metrics to Prometheus pushgateway."""
    from prometheus_client import CollectorRegistry, Histogram, push_to_gateway

    registry = CollectorRegistry()
    h = Histogram('locust_response_time', 'Response time',
                  labelnames=['method', 'endpoint'], registry=registry)
    h.labels(method=request_type, endpoint=name).observe(response_time / 1000)
    push_to_gateway('localhost:9091', job='locust', registry=registry)
```

### 6.3 Threshold Evaluation

Locust does not natively enforce thresholds, so use the `@events.quitting` hook (shown in §4.5) to inspect `environment.runner.stats.total` and set `environment.process_exit_code = 1` to fail the CI job.

Key stats available:

```python
stats = environment.runner.stats.total
stats.avg_response_time
stats.num_requests
stats.num_failures
stats.get_response_time_percentile(0.95)
stats.get_response_time_percentile(0.99)
```

---

## 7 CI/CD Integration

### GitHub Actions Workflow

```yaml
# .github/workflows/perf-test.yml
name: Performance Tests — Locust

on:
  workflow_dispatch:
    inputs:
      profile:
        description: 'Load profile shape'
        required: true
        default: 'smoke'
        type: choice
        options: [smoke, load, stress, soak, spike]
      target_url:
        description: 'Target host URL'
        required: true
        default: 'https://staging.example.com'
      target_users:
        description: 'Target user count'
        required: false
        default: '50'
  pull_request:
    branches: [main]

jobs:
  smoke-on-pr:
    if: github.event_name == 'pull_request'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-python@v5
        with:
          python-version: '3.12'

      - name: Install Dependencies
        run: pip install -r requirements.txt

      - name: Run Locust Smoke Test
        run: |
          locust -f locustfiles/api_users.py,shapes/smoke_shape.py \
            --host=${{ secrets.STAGING_URL }} \
            --headless \
            --csv=reports/stats \
            --html=reports/report.html
        env:
          TARGET_USERS: '1'

      - name: Upload Reports
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: locust-smoke-report
          path: reports/

  profile-test:
    if: github.event_name == 'workflow_dispatch'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-python@v5
        with:
          python-version: '3.12'

      - name: Install Dependencies
        run: pip install -r requirements.txt

      - name: Run Locust ${{ inputs.profile }} Test
        run: |
          locust -f locustfiles/api_users.py,shapes/${{ inputs.profile }}_shape.py \
            --host=${{ inputs.target_url }} \
            --headless \
            --csv=reports/stats \
            --html=reports/report.html
        env:
          TARGET_USERS: ${{ inputs.target_users }}

      - name: Upload Reports
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: locust-${{ inputs.profile }}-report
          path: reports/
```

---

## 8 Docker Setup

### Dockerfile

```dockerfile
FROM python:3.12-slim

WORKDIR /locust

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8089 5557

ENTRYPOINT ["locust"]
```

### docker-compose.yml — Distributed Mode

```yaml
version: '3.8'

services:
  master:
    build: .
    ports:
      - '8089:8089'
    volumes:
      - ./reports:/locust/reports
    command: >
      -f /locust/locustfiles/api_users.py,/locust/shapes/${PROFILE:-smoke}_shape.py
      --master
      --host=${TARGET_HOST:-http://host.docker.internal:3000}
      --expect-workers=${WORKERS:-4}
      --headless
      --csv=/locust/reports/stats
      --html=/locust/reports/report.html
    environment:
      TARGET_USERS: ${TARGET_USERS:-50}

  worker:
    build: .
    command: >
      -f /locust/locustfiles/api_users.py,/locust/shapes/${PROFILE:-smoke}_shape.py
      --worker
      --master-host=master
    environment:
      TARGET_USERS: ${TARGET_USERS:-50}
    deploy:
      replicas: ${WORKERS:-4}
    depends_on:
      - master
```

### Run Distributed

```bash
# Smoke test with 4 workers
PROFILE=smoke TARGET_USERS=1 WORKERS=4 docker compose up --build --abort-on-container-exit

# Load test
PROFILE=load TARGET_USERS=100 WORKERS=8 docker compose up --build --scale worker=8 --abort-on-container-exit

# Cleanup
docker compose down
```

---

## 9 Quality Checklist

### Framework Completeness

- [ ] All 5 load profiles implemented as `LoadTestShape` subclasses
- [ ] User classes use `@task(weight)` for realistic traffic distribution
- [ ] `between()` wait times simulate human think time
- [ ] `catch_response=True` used for custom pass/fail assertions
- [ ] `name` parameter used on parameterised URLs to group stats (`/api/item/[id]`)
- [ ] CSV data feeding via `itertools.cycle` for infinite rotation
- [ ] Event hooks capture custom metrics and export to JSON

### Production Readiness

- [ ] Environment variables control host, user count, spawn rate, and run time
- [ ] No hardcoded credentials — use env vars or vault integration
- [ ] Docker Compose supports distributed mode with configurable worker count
- [ ] Headless mode enabled for CI (no web UI dependency)
- [ ] `@events.quitting` hook enforces thresholds and sets exit code
- [ ] CSV and HTML reports generated in every run
- [ ] GitHub Actions runs smoke on PRs, full profiles via `workflow_dispatch`

### Performance Engineering Best Practices

- [ ] Smoke test validates scripts before heavier profiles
- [ ] Shape classes provide deterministic, repeatable load curves
- [ ] Distributed mode scales horizontally for high-concurrency tests
- [ ] `on_start()` / `on_stop()` handle per-user setup/teardown
- [ ] Response time percentiles (p95, p99) checked in threshold hooks
- [ ] Failure ratio threshold prevents silent degradation
- [ ] Test data parameterisation avoids cache bias

---

## Quick-Start Command Reference

```bash
# Install
pip install -r requirements.txt

# Local with web UI
locust -f locustfiles/api_users.py --host=http://localhost:3000

# Headless smoke
locust -f locustfiles/api_users.py,shapes/smoke_shape.py --host=http://localhost:3000 --headless --csv=reports/stats

# Docker distributed load test
PROFILE=load TARGET_USERS=100 docker compose up --build --abort-on-container-exit
```
