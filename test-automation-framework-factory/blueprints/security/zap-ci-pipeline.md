# Blueprint: OWASP ZAP — DAST in CI/CD Pipeline

> **Tool Combo** OWASP ZAP (Docker) · GitHub Actions · OpenAPI/Swagger
> **Testing Types** Baseline Scan · Full Scan · API Scan · Authenticated Scan
> **Difficulty** Intermediate–Advanced

---

## 1 Overview

OWASP ZAP (Zed Attack Proxy) is the world's most widely used open-source DAST (Dynamic Application Security Testing) tool. It actively probes a running application for vulnerabilities — injection, XSS, broken authentication, misconfigurations, and more — without access to source code.

This blueprint produces a production-ready security testing pipeline that:

- Runs **three scan types**: baseline (passive), full (active), and API (spec-driven).
- Uses the official **`ghcr.io/zaproxy/zaproxy`** Docker image for reproducible execution.
- Configures **authenticated scanning** (form-based and token-based).
- Suppresses false positives with a `.zap-rules` file and alert filters.
- Imports **OpenAPI/Swagger** specs for API-aware scanning.
- Integrates into **GitHub Actions** with SARIF upload and threshold-based gating.
- Handles **AJAX spider** for SPAs and session management for stateful apps.

---

## 2 Prerequisites

| Requirement | Version | Purpose |
|---|---|---|
| Docker | latest | Run ZAP in container |
| Docker Compose | latest | Orchestrate ZAP + target app |
| OWASP ZAP Docker | `ghcr.io/zaproxy/zaproxy:stable` | Scanner image |
| OpenAPI/Swagger spec | 3.x / 2.0 | API scan input |
| GitHub Actions | — | CI/CD pipeline |
| Target application | running | Scan target |

### Verify Installation

```bash
docker pull ghcr.io/zaproxy/zaproxy:stable
docker run --rm ghcr.io/zaproxy/zaproxy:stable zap.sh -version
```

---

## 3 Architecture

### 3.1 Project Structure

```
security-tests/
├── zap/
│   ├── rules/
│   │   └── .zap-rules            # false positive suppression
│   ├── policies/
│   │   └── custom-scan-policy.policy  # scan policy XML
│   ├── contexts/
│   │   ├── web-app.context       # web app context (auth + session)
│   │   └── api.context           # API context
│   ├── auth/
│   │   ├── form-auth.js          # form-based authentication script
│   │   └── token-auth.js         # token-based authentication script
│   └── scripts/
│       └── scan-runner.sh        # orchestration wrapper
├── specs/
│   └── openapi.yaml              # OpenAPI spec for API scanning
├── reports/
│   ├── baseline-report.html
│   ├── full-report.html
│   ├── api-report.html
│   └── report.sarif              # SARIF for GitHub Security tab
├── docker-compose.yml            # ZAP + target app
├── .github/
│   └── workflows/
│       └── security-scan.yml
└── README.md
```

### 3.2 Scan Types Decision Tree

```
  ┌─────────────────────────────┐
  │  Which scan to run?         │
  └──────────┬──────────────────┘
             │
  ┌──────────▼──────────────┐
  │  PR / Branch Push?      │──Yes──▶ Baseline Scan (passive, ~2 min)
  └──────────┬──────────────┘
             │ No
  ┌──────────▼──────────────┐
  │  Merge to main/release? │──Yes──▶ Full Scan (active, ~30-60 min)
  └──────────┬──────────────┘
             │ No
  ┌──────────▼──────────────┐
  │  API-only target?       │──Yes──▶ API Scan (spec-driven, ~10-20 min)
  └─────────────────────────┘
```

---

## 4 Core Patterns

### 4.1 Baseline Scan (Passive)

Fast, non-invasive — only analyses responses without sending attack payloads.

```bash
docker run --rm \
  -v $(pwd)/reports:/zap/wrk:rw \
  -v $(pwd)/zap/rules/.zap-rules:/zap/wrk/.zap-rules:ro \
  ghcr.io/zaproxy/zaproxy:stable \
  zap-baseline.py \
    -t http://target-app:3000 \
    -r baseline-report.html \
    -J baseline-report.json \
    -w baseline-report.md \
    -c .zap-rules \
    -I  # don't fail on warnings, only errors
```

### 4.2 Full Scan (Active)

Comprehensive active scanning — sends attack payloads to discover vulnerabilities.

```bash
docker run --rm \
  -v $(pwd)/reports:/zap/wrk:rw \
  -v $(pwd)/zap/rules/.zap-rules:/zap/wrk/.zap-rules:ro \
  -v $(pwd)/zap/policies:/home/zap/.ZAP/policies:ro \
  ghcr.io/zaproxy/zaproxy:stable \
  zap-full-scan.py \
    -t http://target-app:3000 \
    -r full-report.html \
    -J full-report.json \
    -x full-report.xml \
    -c .zap-rules \
    -p custom-scan-policy \
    -m 60 \
    -j   # use AJAX spider for SPAs
```

### 4.3 API Scan (Spec-Driven)

Scans API endpoints defined in an OpenAPI/Swagger specification.

```bash
docker run --rm \
  -v $(pwd)/reports:/zap/wrk:rw \
  -v $(pwd)/specs:/zap/specs:ro \
  -v $(pwd)/zap/rules/.zap-rules:/zap/wrk/.zap-rules:ro \
  ghcr.io/zaproxy/zaproxy:stable \
  zap-api-scan.py \
    -t /zap/specs/openapi.yaml \
    -f openapi \
    -r api-report.html \
    -J api-report.json \
    -c .zap-rules \
    -S   # safe mode — no active injection
```

For active API scanning (with attack payloads):

```bash
docker run --rm \
  -v $(pwd)/reports:/zap/wrk:rw \
  -v $(pwd)/specs:/zap/specs:ro \
  ghcr.io/zaproxy/zaproxy:stable \
  zap-api-scan.py \
    -t /zap/specs/openapi.yaml \
    -f openapi \
    -r api-report.html \
    -J api-report.json
    # no -S flag → active scanning enabled
```

### 4.4 False Positive Suppression (.zap-rules)

```
# .zap-rules
# Format: <rule-id> <action> <url-regex> <parameter> <evidence>
# Actions: IGNORE, WARN, FAIL

# Ignore CSP header warnings on health endpoint
10038	IGNORE	http://target-app:3000/health	
# Downgrade cookie-without-SameSite on API (stateless)
10054	WARN	http://target-app:3000/api/.*	
# Always fail on SQL Injection
40018	FAIL	
# Always fail on XSS
40012	FAIL	
# Ignore X-Content-Type-Options on static assets
10021	IGNORE	http://target-app:3000/static/.*	
```

### 4.5 Alert Filters (Programmatic)

When using ZAP's automation framework or API:

```yaml
# automation-framework.yaml (excerpt)
jobs:
  - type: alertFilter
    parameters: {}
    rules:
      - ruleId: 10038
        newRisk: "Info"
        urlRegex: ".*/health"
        enabled: true
      - ruleId: 10054
        newRisk: "False Positive"
        urlRegex: ".*/api/.*"
        enabled: true
```

### 4.6 Authenticated Scanning — Form-Based

```javascript
// zap/auth/form-auth.js
// ZAP Authentication Script (ECMAScript)
function authenticate(helper, paramsValues, credentials) {
    var loginUrl = paramsValues.get("loginUrl");
    var csrfUrl  = paramsValues.get("csrfUrl");

    var csrfPage = helper.prepareMessage();
    csrfPage.setRequestHeader(
        new org.parosproxy.paros.network.HttpRequestHeader(
            org.parosproxy.paros.network.HttpRequestHeader.GET,
            new java.net.URI(csrfUrl, false), "HTTP/1.1"
        )
    );
    helper.sendAndReceive(csrfPage, false);
    var csrfToken = helper.getParam(csrfPage, "HtmlPage", "csrf_token");

    var loginMsg = helper.prepareMessage();
    var requestBody = "username=" + encodeURIComponent(credentials.getParam("username"))
        + "&password=" + encodeURIComponent(credentials.getParam("password"))
        + "&_csrf=" + encodeURIComponent(csrfToken);

    loginMsg.setRequestHeader(
        new org.parosproxy.paros.network.HttpRequestHeader(
            org.parosproxy.paros.network.HttpRequestHeader.POST,
            new java.net.URI(loginUrl, false), "HTTP/1.1"
        )
    );
    loginMsg.setRequestBody(requestBody);
    loginMsg.getRequestHeader().setContentLength(loginMsg.getRequestBody().length());
    helper.sendAndReceive(loginMsg, false);

    return loginMsg;
}

function getRequiredParamsNames() { return ["loginUrl", "csrfUrl"]; }
function getOptionalParamsNames() { return []; }
function getCredentialsParamsNames() { return ["username", "password"]; }
```

### 4.7 Authenticated Scanning — Token/Bearer

```javascript
// zap/auth/token-auth.js
function authenticate(helper, paramsValues, credentials) {
    var loginUrl = paramsValues.get("loginUrl");
    var loginMsg = helper.prepareMessage();

    var requestBody = JSON.stringify({
        username: credentials.getParam("username"),
        password: credentials.getParam("password")
    });

    loginMsg.setRequestHeader(
        new org.parosproxy.paros.network.HttpRequestHeader(
            org.parosproxy.paros.network.HttpRequestHeader.POST,
            new java.net.URI(loginUrl, false), "HTTP/1.1"
        )
    );
    loginMsg.getRequestHeader().setHeader("Content-Type", "application/json");
    loginMsg.setRequestBody(requestBody);
    loginMsg.getRequestHeader().setContentLength(loginMsg.getRequestBody().length());
    helper.sendAndReceive(loginMsg, false);

    var responseBody = loginMsg.getResponseBody().toString();
    var token = JSON.parse(responseBody).token;

    // Store token for subsequent requests
    var scripts = org.zaproxy.zap.extension.script.ScriptVars;
    scripts.setGlobalVar("auth.token", token);

    return loginMsg;
}

function getRequiredParamsNames() { return ["loginUrl"]; }
function getOptionalParamsNames() { return []; }
function getCredentialsParamsNames() { return ["username", "password"]; }
```

### 4.8 Session Management Configuration

Context XML snippet for session handling:

```xml
<!-- zap/contexts/web-app.context (excerpt) -->
<context>
  <name>Web Application</name>
  <desc>Authenticated web app context</desc>
  <inscope>true</inscope>
  <incregexes>http://target-app:3000.*</incregexes>
  <excregexes>http://target-app:3000/logout.*</excregexes>
  <tech>
    <include>Db.PostgreSQL</include>
    <include>Language.JavaScript</include>
    <include>OS.Linux</include>
  </tech>
  <authentication>
    <type>2</type> <!-- script-based -->
    <loggedin>\Qlogout\E</loggedin>
    <loggedout>\Qlogin\E</loggedout>
  </authentication>
  <session>
    <type>0</type> <!-- cookie-based -->
  </session>
</context>
```

### 4.9 AJAX Spider for SPAs

The AJAX spider drives a real browser to discover client-side routes in Single Page Applications:

```bash
docker run --rm \
  -v $(pwd)/reports:/zap/wrk:rw \
  ghcr.io/zaproxy/zaproxy:stable \
  zap-full-scan.py \
    -t http://target-app:3000 \
    -r full-report.html \
    -j           # enable AJAX spider
    -m 90        # max scan duration in minutes
```

Automation framework configuration:

```yaml
jobs:
  - type: spider
    parameters:
      maxDuration: 5
      url: http://target-app:3000
  - type: spiderAjax
    parameters:
      maxDuration: 10
      url: http://target-app:3000
      browserId: firefox-headless
  - type: activeScan
    parameters:
      maxScanDurationInMins: 60
```

### 4.10 Scan Policy Configuration

```xml
<!-- zap/policies/custom-scan-policy.policy -->
<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<configuration>
    <policy>custom-scan-policy</policy>
    <scanner>
        <level>MEDIUM</level>
        <strength>MEDIUM</strength>
    </scanner>
    <plugins>
        <!-- SQL Injection: HIGH strength -->
        <plugin>
            <id>40018</id>
            <enabled>true</enabled>
            <level>HIGH</level>
            <strength>HIGH</strength>
        </plugin>
        <!-- XSS Reflected: HIGH strength -->
        <plugin>
            <id>40012</id>
            <enabled>true</enabled>
            <level>HIGH</level>
            <strength>HIGH</strength>
        </plugin>
        <!-- XSS Persistent: HIGH strength -->
        <plugin>
            <id>40014</id>
            <enabled>true</enabled>
            <level>HIGH</level>
            <strength>HIGH</strength>
        </plugin>
        <!-- Path Traversal: MEDIUM -->
        <plugin>
            <id>6</id>
            <enabled>true</enabled>
            <level>MEDIUM</level>
            <strength>MEDIUM</strength>
        </plugin>
        <!-- LDAP Injection: disabled (not applicable) -->
        <plugin>
            <id>40015</id>
            <enabled>false</enabled>
        </plugin>
    </plugins>
</configuration>
```

---

## 5 Configuration

### 5.1 Threshold Configuration

ZAP scripts exit with specific codes based on alert risk levels:

| Exit Code | Meaning |
|---|---|
| 0 | No alerts above threshold |
| 1 | FAIL alerts found |
| 2 | WARN alerts found |
| 3 | Runtime error |

Control behaviour in the `.zap-rules` file (§4.4) and the `-I` flag:

```bash
# Fail only on FAIL-level rules (ignore WARNs)
zap-baseline.py -t http://target -c .zap-rules -I

# Fail on both WARN and FAIL
zap-baseline.py -t http://target -c .zap-rules
```

### 5.2 OpenAPI/Swagger Import

```yaml
# specs/openapi.yaml (minimal example)
openapi: 3.0.3
info:
  title: Target API
  version: 1.0.0
servers:
  - url: http://target-app:3000
paths:
  /api/users:
    get:
      summary: List users
      security:
        - bearerAuth: []
    post:
      summary: Create user
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                name:
                  type: string
                email:
                  type: string
components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
```

---

## 6 Reporting

### 6.1 Report Formats

```bash
# HTML report (human-readable)
-r report.html

# JSON report (machine-parseable)
-J report.json

# XML report
-x report.xml

# Markdown report
-w report.md
```

### 6.2 SARIF Output for GitHub Security Tab

Generate SARIF and upload to GitHub's code scanning dashboard:

```bash
docker run --rm \
  -v $(pwd)/reports:/zap/wrk:rw \
  ghcr.io/zaproxy/zaproxy:stable \
  zap-baseline.py \
    -t http://target-app:3000 \
    -r baseline-report.html \
    -J baseline-report.json
```

Convert JSON to SARIF (or use ZAP's built-in SARIF add-on):

```bash
pip install sarif-om
# Use community converter or ZAP add-on for direct SARIF output
```

### 6.3 Report Structure (JSON)

```json
{
  "site": [
    {
      "host": "target-app",
      "port": "3000",
      "alerts": [
        {
          "pluginid": "10038",
          "alertRef": "10038",
          "alert": "Content Security Policy (CSP) Header Not Set",
          "name": "Content Security Policy (CSP) Header Not Set",
          "riskcode": "2",
          "riskdesc": "Medium",
          "confidence": "3",
          "desc": "...",
          "instances": [ { "uri": "...", "method": "GET" } ],
          "count": "5",
          "solution": "...",
          "reference": "..."
        }
      ]
    }
  ]
}
```

---

## 7 CI/CD Integration

### GitHub Actions Workflow

```yaml
# .github/workflows/security-scan.yml
name: Security Scan — OWASP ZAP

on:
  pull_request:
    branches: [main, develop]
  push:
    branches: [main]
  workflow_dispatch:
    inputs:
      scan_type:
        description: 'Scan type'
        required: true
        default: 'baseline'
        type: choice
        options: [baseline, full, api]
      target_url:
        description: 'Target URL'
        required: true
        default: 'https://staging.example.com'

env:
  ZAP_IMAGE: ghcr.io/zaproxy/zaproxy:stable

jobs:
  baseline-scan:
    name: ZAP Baseline (PR Gate)
    if: github.event_name == 'pull_request'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Start Target Application
        run: docker compose up -d target-app
        working-directory: .

      - name: Wait for Target
        run: |
          for i in $(seq 1 30); do
            curl -sf http://localhost:3000/health && break
            sleep 2
          done

      - name: ZAP Baseline Scan
        run: |
          docker run --rm --network host \
            -v ${{ github.workspace }}/reports:/zap/wrk:rw \
            -v ${{ github.workspace }}/zap/rules/.zap-rules:/zap/wrk/.zap-rules:ro \
            ${{ env.ZAP_IMAGE }} \
            zap-baseline.py \
              -t http://localhost:3000 \
              -r baseline-report.html \
              -J baseline-report.json \
              -c .zap-rules \
              -I

      - name: Upload ZAP Report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: zap-baseline-report
          path: reports/

      - name: Check for High/Critical Alerts
        if: always()
        run: |
          if [ -f reports/baseline-report.json ]; then
            HIGH_COUNT=$(python3 -c "
          import json, sys
          data = json.load(open('reports/baseline-report.json'))
          count = sum(1 for site in data.get('site', [])
                      for alert in site.get('alerts', [])
                      if int(alert.get('riskcode', 0)) >= 3)
          print(count)
          ")
            echo "High/Critical alerts: $HIGH_COUNT"
            if [ "$HIGH_COUNT" -gt 0 ]; then
              echo "::error::Found $HIGH_COUNT High/Critical security alerts"
              exit 1
            fi
          fi

  full-scan:
    name: ZAP Full Scan (Main Branch)
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Start Target Application
        run: docker compose up -d target-app

      - name: Wait for Target
        run: |
          for i in $(seq 1 30); do
            curl -sf http://localhost:3000/health && break
            sleep 2
          done

      - name: ZAP Full Scan
        run: |
          docker run --rm --network host \
            -v ${{ github.workspace }}/reports:/zap/wrk:rw \
            -v ${{ github.workspace }}/zap/rules/.zap-rules:/zap/wrk/.zap-rules:ro \
            -v ${{ github.workspace }}/zap/policies:/home/zap/.ZAP/policies:ro \
            ${{ env.ZAP_IMAGE }} \
            zap-full-scan.py \
              -t http://localhost:3000 \
              -r full-report.html \
              -J full-report.json \
              -x full-report.xml \
              -c .zap-rules \
              -p custom-scan-policy \
              -m 60 \
              -j

      - name: Upload Full Scan Report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: zap-full-report
          path: reports/

      - name: Upload SARIF
        if: always()
        uses: github/codeql-action/upload-sarif@v3
        with:
          sarif_file: reports/full-report.json
        continue-on-error: true

  api-scan:
    name: ZAP API Scan
    if: github.event_name == 'workflow_dispatch' && inputs.scan_type == 'api'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Start Target Application
        run: docker compose up -d target-app

      - name: Wait for Target
        run: |
          for i in $(seq 1 30); do
            curl -sf http://localhost:3000/health && break
            sleep 2
          done

      - name: ZAP API Scan
        run: |
          docker run --rm --network host \
            -v ${{ github.workspace }}/reports:/zap/wrk:rw \
            -v ${{ github.workspace }}/specs:/zap/specs:ro \
            -v ${{ github.workspace }}/zap/rules/.zap-rules:/zap/wrk/.zap-rules:ro \
            ${{ env.ZAP_IMAGE }} \
            zap-api-scan.py \
              -t /zap/specs/openapi.yaml \
              -f openapi \
              -r api-report.html \
              -J api-report.json \
              -c .zap-rules

      - name: Upload API Scan Report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: zap-api-report
          path: reports/
```

---

## 8 Docker Setup

### docker-compose.yml — ZAP + Target Application

```yaml
version: '3.8'

services:
  target-app:
    image: ${TARGET_IMAGE:-your-app:latest}
    ports:
      - '3000:3000'
    environment:
      NODE_ENV: test
      DATABASE_URL: postgres://postgres:postgres@db:5432/testdb
    depends_on:
      db:
        condition: service_healthy
    healthcheck:
      test: ['CMD', 'curl', '-f', 'http://localhost:3000/health']
      interval: 5s
      timeout: 3s
      retries: 10

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: testdb
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U postgres']
      interval: 3s
      timeout: 3s
      retries: 5

  zap-baseline:
    image: ghcr.io/zaproxy/zaproxy:stable
    network_mode: host
    volumes:
      - ./reports:/zap/wrk:rw
      - ./zap/rules/.zap-rules:/zap/wrk/.zap-rules:ro
    command: >
      zap-baseline.py
        -t http://localhost:3000
        -r baseline-report.html
        -J baseline-report.json
        -c .zap-rules
        -I
    depends_on:
      target-app:
        condition: service_healthy

  zap-full:
    image: ghcr.io/zaproxy/zaproxy:stable
    network_mode: host
    volumes:
      - ./reports:/zap/wrk:rw
      - ./zap/rules/.zap-rules:/zap/wrk/.zap-rules:ro
      - ./zap/policies:/home/zap/.ZAP/policies:ro
    command: >
      zap-full-scan.py
        -t http://localhost:3000
        -r full-report.html
        -J full-report.json
        -c .zap-rules
        -p custom-scan-policy
        -m 60
        -j
    depends_on:
      target-app:
        condition: service_healthy
    profiles:
      - full

  zap-api:
    image: ghcr.io/zaproxy/zaproxy:stable
    network_mode: host
    volumes:
      - ./reports:/zap/wrk:rw
      - ./specs:/zap/specs:ro
      - ./zap/rules/.zap-rules:/zap/wrk/.zap-rules:ro
    command: >
      zap-api-scan.py
        -t /zap/specs/openapi.yaml
        -f openapi
        -r api-report.html
        -J api-report.json
        -c .zap-rules
    depends_on:
      target-app:
        condition: service_healthy
    profiles:
      - api
```

### Run Scans

```bash
# Baseline scan (default)
docker compose up --abort-on-container-exit zap-baseline

# Full scan
docker compose --profile full up --abort-on-container-exit zap-full

# API scan
docker compose --profile api up --abort-on-container-exit zap-api

# Cleanup
docker compose --profile full --profile api down -v
```

---

## 9 Quality Checklist

### Framework Completeness

- [ ] Baseline, full, and API scan scripts configured and runnable
- [ ] `.zap-rules` file suppresses known false positives with documented justifications
- [ ] Scan policy tunes plugin strength/threshold for the target technology stack
- [ ] OpenAPI spec imported for API scanning with correct server URL
- [ ] Authentication scripts handle both form-based and token-based auth
- [ ] Context files define scope (include/exclude URLs) and session management
- [ ] AJAX spider enabled for SPA targets

### Production Readiness

- [ ] CI runs baseline on every PR (fast gate, ~2 min)
- [ ] CI runs full scan on merge to main (comprehensive, ~30-60 min)
- [ ] API scan available via `workflow_dispatch` for on-demand testing
- [ ] Pipeline fails on High/Critical alerts (exit code check + JSON parsing)
- [ ] SARIF uploaded to GitHub Security tab for developer visibility
- [ ] Reports (HTML, JSON, XML) uploaded as build artifacts
- [ ] Docker Compose orchestrates ZAP + target app + database

### Security Engineering Best Practices

- [ ] False positive suppressions reviewed and approved by security team
- [ ] Scan policy customised — disable irrelevant plugins, increase strength on critical ones
- [ ] Authenticated scans cover post-login attack surface
- [ ] Context excludes logout/signout URLs to maintain session
- [ ] Alert filters separate noise from real findings
- [ ] Baseline scan runs in safe mode (no active attacks on PR environments)
- [ ] Full scan uses AJAX spider for JavaScript-heavy applications
- [ ] Results triaged: High/Critical → block release, Medium → track, Low/Info → backlog
