# Blueprint: k6 + JavaScript — Load / Stress / Soak Testing

> **Tool Combo** k6 (Grafana) · JavaScript ES6 · InfluxDB · Grafana
> **Testing Types** Load · Stress · Soak · Spike · Smoke
> **Difficulty** Intermediate

---

## 1 Overview

k6 is a developer-centric, open-source load-testing tool that scripts virtual-user (VU) behaviour in plain JavaScript (ES6). It compiles to Go for high-throughput execution and ships with first-class support for HTTP, WebSockets, gRPC, and browser-level protocols.

This blueprint produces a production-ready performance test framework that:

- Defines **five canonical load profiles** (smoke, load, stress, soak, spike).
- Uses **scenario-based architecture** with `options.scenarios{}` for fine-grained executor control.
- Emits custom metrics, enforces thresholds with auto-abort, and publishes results to InfluxDB + Grafana.
- Runs in Docker via the official `grafana/k6` image.
- Integrates into GitHub Actions with threshold-based pass/fail gating.

---

## 2 Prerequisites

| Requirement | Version | Purpose |
|---|---|---|
| k6 | ≥ 0.50 | Test runner |
| Node.js | ≥ 18 (optional) | Bundling via webpack/esbuild for npm libs |
| Docker & Docker Compose | latest | Containerised execution + InfluxDB/Grafana stack |
| InfluxDB | 1.8 (OSS) | Time-series metric storage |
| Grafana | ≥ 10 | Dashboard visualisation |
| GitHub Actions | — | CI/CD pipeline |

### Install k6

```bash
# macOS
brew install k6

# Windows (choco)
choco install k6

# Docker (no install needed)
docker run --rm grafana/k6 version
```

---

## 3 Architecture

### 3.1 Project Structure

```
performance-tests/
├── scripts/
│   ├── smoke.js                 # 1 VU, 1 min
│   ├── load.js                  # target VUs, 10 min
│   ├── stress.js                # 2× target VUs, 15 min
│   ├── soak.js                  # target VUs, 1 hour
│   ├── spike.js                 # 10× target VUs, 2 min
│   └── scenarios/
│       ├── api-health.js        # per-endpoint scenario
│       ├── user-journey.js      # multi-step flow
│       └── websocket-feed.js    # WS-based scenario
├── lib/
│   ├── config.js                # centralised options & thresholds
│   ├── helpers.js               # reusable request builders
│   ├── metrics.js               # custom Trend/Counter/Rate/Gauge
│   └── data.js                  # SharedArray + CSV loaders
├── data/
│   ├── users.csv                # parameterised user credentials
│   └── payloads.json            # request body templates
├── reports/
│   └── summary.html             # handleSummary() output
├── docker-compose.yml           # k6 + InfluxDB + Grafana
├── grafana/
│   └── dashboards/
│       └── k6-dashboard.json    # pre-built Grafana dashboard
├── .github/
│   └── workflows/
│       └── perf-test.yml        # GitHub Actions workflow
└── README.md
```

### 3.2 VU Lifecycle

k6 executes code in four distinct lifecycle stages:

```
┌─────────────────────────────────────────────────┐
│  init code   → Runs once per VU at parse time   │
│               (file-level scope, no HTTP)        │
├─────────────────────────────────────────────────┤
│  setup()     → Runs once before all VUs start   │
│               (fetch auth tokens, seed data)     │
├─────────────────────────────────────────────────┤
│  default()   → Runs repeatedly per VU           │
│               (the actual test scenario)         │
├─────────────────────────────────────────────────┤
│  teardown()  → Runs once after all VUs finish   │
│               (cleanup resources)                │
└─────────────────────────────────────────────────┘
```

```javascript
// init — parsed once per VU; no network calls allowed
import http from 'k6/http';
import { SharedArray } from 'k6/data';

const users = new SharedArray('users', function () {
  return JSON.parse(open('./data/users.json'));
});

export function setup() {
  const res = http.post(`${__ENV.BASE_URL}/auth/login`, JSON.stringify({
    username: 'setup-user',
    password: 'setup-pass',
  }), { headers: { 'Content-Type': 'application/json' } });
  return { token: res.json('token') };
}

export default function (data) {
  const params = {
    headers: { Authorization: `Bearer ${data.token}` },
  };
  http.get(`${__ENV.BASE_URL}/api/resource`, params);
}

export function teardown(data) {
  http.post(`${__ENV.BASE_URL}/auth/logout`, null, {
    headers: { Authorization: `Bearer ${data.token}` },
  });
}
```

---

## 4 Core Patterns

### 4.1 Scenario-Based Options Configuration

```javascript
// lib/config.js
export const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';
export const TARGET_VUS = parseInt(__ENV.TARGET_VUS) || 50;

export const loadProfiles = {
  smoke: {
    executor: 'constant-vus',
    vus: 1,
    duration: '1m',
    tags: { profile: 'smoke' },
  },
  load: {
    executor: 'ramping-vus',
    startVUs: 0,
    stages: [
      { duration: '2m', target: TARGET_VUS },
      { duration: '6m', target: TARGET_VUS },
      { duration: '2m', target: 0 },
    ],
    tags: { profile: 'load' },
  },
  stress: {
    executor: 'ramping-vus',
    startVUs: 0,
    stages: [
      { duration: '3m', target: TARGET_VUS * 2 },
      { duration: '9m', target: TARGET_VUS * 2 },
      { duration: '3m', target: 0 },
    ],
    tags: { profile: 'stress' },
  },
  soak: {
    executor: 'ramping-vus',
    startVUs: 0,
    stages: [
      { duration: '5m', target: TARGET_VUS },
      { duration: '50m', target: TARGET_VUS },
      { duration: '5m', target: 0 },
    ],
    tags: { profile: 'soak' },
  },
  spike: {
    executor: 'ramping-arrival-rate',
    startRate: 10,
    timeUnit: '1s',
    preAllocatedVUs: TARGET_VUS * 10,
    maxVUs: TARGET_VUS * 15,
    stages: [
      { duration: '10s', target: TARGET_VUS * 10 },
      { duration: '1m', target: TARGET_VUS * 10 },
      { duration: '30s', target: 10 },
    ],
    tags: { profile: 'spike' },
  },
};
```

### 4.2 Custom Metrics

```javascript
// lib/metrics.js
import { Trend, Counter, Rate, Gauge } from 'k6/metrics';

export const apiResponseTime   = new Trend('api_response_time', true);
export const apiRequests       = new Counter('api_requests_total');
export const apiFailureRate    = new Rate('api_failure_rate');
export const activeConnections = new Gauge('active_connections');

// Usage inside default()
// apiResponseTime.add(res.timings.duration);
// apiRequests.add(1);
// apiFailureRate.add(res.status !== 200);
// activeConnections.add(__VU);
```

### 4.3 Threshold Definitions with Auto-Abort

```javascript
export const thresholds = {
  http_req_duration: [
    { threshold: 'p(95)<500',  abortOnFail: true, delayAbortEval: '30s' },
    { threshold: 'p(99)<1500', abortOnFail: false },
  ],
  http_req_failed: [
    { threshold: 'rate<0.05',  abortOnFail: true, delayAbortEval: '20s' },
  ],
  api_response_time: ['p(95)<400'],
  api_failure_rate: ['rate<0.02'],
};
```

### 4.4 Data Parameterisation — SharedArray & CSV

```javascript
// lib/data.js
import { SharedArray } from 'k6/data';
import papaparse from 'https://jslib.k6.io/papaparse/5.1.1/index.js';

export const users = new SharedArray('users', function () {
  const raw = open('../data/users.csv');
  return papaparse.parse(raw, { header: true }).data;
});

export function getRandomUser() {
  return users[Math.floor(Math.random() * users.length)];
}
```

### 4.5 Response Validation with Checks

```javascript
import { check, group } from 'k6';
import http from 'k6/http';
import { apiResponseTime, apiFailureRate, apiRequests } from '../lib/metrics.js';

export default function (data) {
  group('User Login Flow', function () {
    const loginRes = http.post(`${__ENV.BASE_URL}/auth/login`, JSON.stringify({
      username: 'test-user',
      password: 'test-pass',
    }), { headers: { 'Content-Type': 'application/json' } });

    check(loginRes, {
      'login returns 200': (r) => r.status === 200,
      'login has token':   (r) => r.json('token') !== undefined,
      'login under 500ms': (r) => r.timings.duration < 500,
    });

    apiResponseTime.add(loginRes.timings.duration);
    apiRequests.add(1);
    apiFailureRate.add(loginRes.status !== 200);
  });

  group('Fetch Dashboard', function () {
    const dashRes = http.get(`${__ENV.BASE_URL}/api/dashboard`, {
      headers: { Authorization: `Bearer ${data.token}` },
    });

    check(dashRes, {
      'dashboard returns 200': (r) => r.status === 200,
      'dashboard has items':   (r) => r.json('items').length > 0,
    });

    apiResponseTime.add(dashRes.timings.duration);
    apiRequests.add(1);
    apiFailureRate.add(dashRes.status !== 200);
  });
}
```

### 4.6 WebSocket Testing

```javascript
import ws from 'k6/ws';
import { check } from 'k6';

export function websocketScenario() {
  const url = `${__ENV.WS_URL || 'ws://localhost:3000'}/feed`;
  const params = { tags: { type: 'websocket' } };

  const res = ws.connect(url, params, function (socket) {
    socket.on('open', function () {
      socket.send(JSON.stringify({ action: 'subscribe', channel: 'prices' }));
    });

    socket.on('message', function (msg) {
      const data = JSON.parse(msg);
      check(data, {
        'message has price': (d) => d.price !== undefined,
      });
    });

    socket.on('error', function (e) {
      console.error('WebSocket error:', e.error());
    });

    socket.setTimeout(function () {
      socket.close();
    }, 30000);
  });

  check(res, {
    'ws status is 101': (r) => r && r.status === 101,
  });
}
```

### 4.7 Environment Variables for Targets

```javascript
// All environment-specific values are injected via __ENV
const config = {
  baseUrl:   __ENV.BASE_URL   || 'http://localhost:3000',
  wsUrl:     __ENV.WS_URL     || 'ws://localhost:3000',
  targetVUs: parseInt(__ENV.TARGET_VUS) || 50,
  apiKey:    __ENV.API_KEY    || '',
};

export default config;
```

Pass at runtime:

```bash
k6 run -e BASE_URL=https://staging.example.com -e TARGET_VUS=100 scripts/load.js
```

---

## 5 Configuration

### 5.1 Complete Test Script Example (Load Profile)

```javascript
// scripts/load.js
import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { loadProfiles, thresholds } from '../lib/config.js';
import { apiResponseTime, apiFailureRate, apiRequests } from '../lib/metrics.js';
import { getRandomUser } from '../lib/data.js';
import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js';

export const options = {
  scenarios: {
    load_test: loadProfiles.load,
  },
  thresholds: thresholds,
};

export function setup() {
  const healthCheck = http.get(`${__ENV.BASE_URL}/health`);
  check(healthCheck, { 'target is reachable': (r) => r.status === 200 });
  if (healthCheck.status !== 200) {
    throw new Error('Target application is not healthy — aborting.');
  }
  return {};
}

export default function () {
  const user = getRandomUser();

  group('API - Get Resources', function () {
    const res = http.get(`${__ENV.BASE_URL}/api/resources`, {
      headers: { 'X-API-Key': __ENV.API_KEY },
    });
    check(res, {
      'status is 200':     (r) => r.status === 200,
      'body is not empty': (r) => r.body.length > 0,
    });
    apiResponseTime.add(res.timings.duration);
    apiRequests.add(1);
    apiFailureRate.add(res.status !== 200);
  });

  sleep(Math.random() * 3 + 1);
}

export function handleSummary(data) {
  return {
    'reports/summary.html': htmlReport(data),
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
  };
}
```

### 5.2 Executor Reference

| Executor | Use Case | Key Options |
|---|---|---|
| `constant-vus` | Smoke — fixed concurrency | `vus`, `duration` |
| `ramping-vus` | Load / Stress / Soak — graduated ramp | `startVUs`, `stages[]` |
| `ramping-arrival-rate` | Spike — control request rate independently of VUs | `startRate`, `stages[]`, `preAllocatedVUs`, `maxVUs` |
| `per-vu-iterations` | Functional — each VU runs N times | `vus`, `iterations` |
| `shared-iterations` | Data-driven — total iterations shared across VUs | `vus`, `iterations` |

---

## 6 Reporting

### 6.1 handleSummary() — Custom HTML Reports

```javascript
import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.2/index.js';

export function handleSummary(data) {
  return {
    'reports/summary.html': htmlReport(data),
    'reports/summary.json': JSON.stringify(data, null, 2),
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
  };
}
```

### 6.2 InfluxDB + Grafana Integration

Stream metrics in real time:

```bash
k6 run --out influxdb=http://localhost:8086/k6 scripts/load.js
```

Configure in `docker-compose.yml` (see Docker section) and import the [official k6 Grafana dashboard](https://grafana.com/grafana/dashboards/2587-k6-load-testing-results/) (ID `2587`).

### 6.3 JSON & CSV Output

```bash
k6 run --out json=reports/results.json scripts/load.js
k6 run --out csv=reports/results.csv scripts/load.js
```

---

## 7 CI/CD Integration

### GitHub Actions Workflow

```yaml
# .github/workflows/perf-test.yml
name: Performance Tests

on:
  workflow_dispatch:
    inputs:
      profile:
        description: 'Load profile to run'
        required: true
        default: 'smoke'
        type: choice
        options: [smoke, load, stress, soak, spike]
      target_url:
        description: 'Target base URL'
        required: true
        default: 'https://staging.example.com'
      target_vus:
        description: 'Target VU count'
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

      - name: Run k6 Smoke Test
        uses: grafana/k6-action@v0.3.1
        with:
          filename: scripts/smoke.js
        env:
          BASE_URL: ${{ secrets.STAGING_URL }}
          TARGET_VUS: '1'

      - name: Upload Report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: k6-smoke-report
          path: reports/

  scheduled-profile:
    if: github.event_name == 'workflow_dispatch'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Run k6 ${{ inputs.profile }} Test
        uses: grafana/k6-action@v0.3.1
        with:
          filename: scripts/${{ inputs.profile }}.js
        env:
          BASE_URL: ${{ inputs.target_url }}
          TARGET_VUS: ${{ inputs.target_vus }}

      - name: Upload Report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: k6-${{ inputs.profile }}-report
          path: reports/

      - name: Fail on Threshold Breach
        if: failure()
        run: |
          echo "::error::k6 thresholds breached — see report artifact for details."
          exit 1
```

### Threshold-Based Pass/Fail

k6 exits with code `99` when any threshold is breached. CI pipelines detect this automatically — no custom scripts required.

---

## 8 Docker Setup

### docker-compose.yml

```yaml
version: '3.8'

services:
  influxdb:
    image: influxdb:1.8
    ports:
      - '8086:8086'
    environment:
      INFLUXDB_DB: k6
      INFLUXDB_HTTP_AUTH_ENABLED: 'false'
    volumes:
      - influxdb-data:/var/lib/influxdb

  grafana:
    image: grafana/grafana:latest
    ports:
      - '3001:3000'
    environment:
      GF_SECURITY_ADMIN_USER: admin
      GF_SECURITY_ADMIN_PASSWORD: admin
      GF_AUTH_ANONYMOUS_ENABLED: 'true'
      GF_AUTH_ANONYMOUS_ORG_ROLE: Viewer
    volumes:
      - ./grafana/dashboards:/var/lib/grafana/dashboards
      - grafana-data:/var/lib/grafana
    depends_on:
      - influxdb

  k6:
    image: grafana/k6:latest
    volumes:
      - ./scripts:/scripts
      - ./lib:/lib
      - ./data:/data
      - ./reports:/reports
    environment:
      BASE_URL: ${BASE_URL:-http://host.docker.internal:3000}
      TARGET_VUS: ${TARGET_VUS:-50}
      K6_OUT: influxdb=http://influxdb:8086/k6
    depends_on:
      - influxdb
    command: run /scripts/${PROFILE:-smoke}.js

volumes:
  influxdb-data:
  grafana-data:
```

### Run with Docker

```bash
# Smoke test with live Grafana
docker compose up -d influxdb grafana
docker compose run --rm k6

# Specific profile
PROFILE=stress TARGET_VUS=100 BASE_URL=https://staging.example.com \
  docker compose run --rm k6

# Teardown
docker compose down -v
```

---

## 9 Quality Checklist

### Framework Completeness

- [ ] All 5 load profiles defined and runnable independently
- [ ] `options.scenarios{}` used for every test (never bare `vus`/`duration`)
- [ ] Thresholds defined for `http_req_duration`, `http_req_failed`, and every custom metric
- [ ] `abortOnFail` set on critical thresholds to save CI minutes
- [ ] `handleSummary()` generates HTML and JSON reports
- [ ] `SharedArray` used for all CSV/JSON data (memory-efficient across VUs)
- [ ] `check()` validates every HTTP response (status + body assertions)
- [ ] `group()` wraps logically related requests for transaction-level reporting

### Production Readiness

- [ ] Environment variables externalise all target URLs, VU counts, and secrets
- [ ] No hardcoded credentials in scripts — use `__ENV` or k6 Cloud secrets
- [ ] Docker Compose orchestrates k6 + InfluxDB + Grafana with one command
- [ ] Grafana dashboard auto-provisioned with correct InfluxDB datasource
- [ ] GitHub Actions runs smoke on every PR, full profiles via `workflow_dispatch`
- [ ] CI fails when k6 exit code is `99` (threshold breach)
- [ ] Reports uploaded as build artifacts for post-run analysis

### Performance Engineering Best Practices

- [ ] Smoke test validates scripts work before heavier profiles run
- [ ] Ramp-up and ramp-down periods prevent thundering-herd effects
- [ ] Think time (`sleep()`) simulates realistic user pacing
- [ ] Data parameterisation avoids cache-warming bias
- [ ] WebSocket scenarios use `socket.setTimeout()` to prevent leaks
- [ ] Custom metrics track domain-specific SLAs (e.g., `order_processing_time`)
- [ ] Test results compared against baseline to detect regressions

---

## Quick-Start Command Reference

```bash
# Local smoke test
k6 run -e BASE_URL=http://localhost:3000 scripts/smoke.js

# Local load test with HTML report
k6 run -e BASE_URL=http://localhost:3000 -e TARGET_VUS=50 scripts/load.js

# Stream to InfluxDB
k6 run --out influxdb=http://localhost:8086/k6 scripts/load.js

# Docker full stack
docker compose up -d influxdb grafana
PROFILE=load docker compose run --rm k6
# Open http://localhost:3001 for Grafana dashboard
```
