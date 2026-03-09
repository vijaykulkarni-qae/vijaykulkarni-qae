# Docker & Containerization Pattern

Container patterns for running test frameworks in reproducible, isolated environments. "Works on my machine" ends here.

## Why Containerize Tests

1. **Reproducibility** — identical browser versions, OS, dependencies across all machines
2. **CI simplicity** — no installing browsers/drivers on CI agents
3. **Isolation** — tests can't pollute the host or other jobs
4. **Scalability** — spin up N containers for N shards

---

## Dockerfile Patterns — Multi-Stage Builds

### TypeScript (Playwright)

```dockerfile
# Stage 1: install dependencies
FROM node:20-slim AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Stage 2: test runner with browsers
FROM mcr.microsoft.com/playwright:v1.48.0-jammy AS runner
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Default command
CMD ["npx", "playwright", "test"]
```

### Java (Maven + Chrome)

```dockerfile
FROM maven:3.9-eclipse-temurin-21 AS deps
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline

FROM deps AS runner
COPY . .

# Install Chrome for Selenium tests
RUN apt-get update && apt-get install -y wget gnupg2 \
    && wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && echo "deb http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/chrome.list \
    && apt-get update && apt-get install -y google-chrome-stable \
    && rm -rf /var/lib/apt/lists/*

CMD ["mvn", "test"]
```

### Python (Playwright)

```dockerfile
FROM python:3.12-slim AS deps
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

FROM mcr.microsoft.com/playwright/python:v1.48.0-jammy AS runner
WORKDIR /app
COPY --from=deps /usr/local/lib/python3.12/site-packages /usr/local/lib/python3.12/site-packages
COPY . .

CMD ["pytest", "--alluredir=allure-results"]
```

---

## Browser Images — Pre-Built Options

| Tool | Image | Browsers Included |
|---|---|---|
| Playwright | `mcr.microsoft.com/playwright:v1.48.0-jammy` | Chromium, Firefox, WebKit |
| Selenium | `selenium/standalone-chrome:latest` | Chrome + ChromeDriver |
| Selenium Grid | `selenium/hub` + `selenium/node-chrome` | Scalable grid |
| Cypress | `cypress/included:13.x` | Electron (Chrome optional) |

---

## docker-compose — Local Test Execution

Run the app + tests + dependencies together:

```yaml
# docker-compose.test.yml
services:
  app:
    build:
      context: ../app
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=test
      - DATABASE_URL=postgresql://test:test@db:5432/testdb
    depends_on:
      db:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 5s
      timeout: 3s
      retries: 10

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: testdb
      POSTGRES_USER: test
      POSTGRES_PASSWORD: test
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U test"]
      interval: 3s
      timeout: 2s
      retries: 5

  tests:
    build:
      context: .
      dockerfile: Dockerfile
    depends_on:
      app:
        condition: service_healthy
    environment:
      - BASE_URL=http://app:3000
      - TEST_ENV=docker
      - CI=true
    volumes:
      - ./allure-results:/app/allure-results
      - ./test-results:/app/test-results
    command: npx playwright test

  selenium-hub:
    image: selenium/hub:latest
    ports:
      - "4442:4442"
      - "4443:4443"
      - "4444:4444"

  chrome-node:
    image: selenium/node-chrome:latest
    shm_size: 2gb
    depends_on:
      - selenium-hub
    environment:
      - SE_EVENT_BUS_HOST=selenium-hub
      - SE_EVENT_BUS_PUBLISH_PORT=4442
      - SE_EVENT_BUS_SUBSCRIBE_PORT=4443
      - SE_NODE_MAX_SESSIONS=4
```

### Run tests

```bash
docker compose -f docker-compose.test.yml up --build --abort-on-container-exit tests
```

---

## CI Docker Execution

### GitHub Actions — container job

```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    container:
      image: mcr.microsoft.com/playwright:v1.48.0-jammy
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npx playwright test
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: test-results
          path: test-results/
```

### GitHub Actions — docker-compose in CI

```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run integration tests
        run: |
          docker compose -f docker-compose.test.yml up --build --abort-on-container-exit tests
          exit_code=$?
          docker compose -f docker-compose.test.yml cp tests:/app/allure-results ./allure-results
          docker compose -f docker-compose.test.yml down -v
          exit $exit_code
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: allure-results
          path: allure-results/
```

---

## Volume Mounts — Reports and Artifacts

Mount volumes so reports survive container shutdown:

```yaml
volumes:
  - ./allure-results:/app/allure-results    # Allure raw data
  - ./test-results:/app/test-results        # Screenshots, videos
  - ./html-report:/app/html-report          # HTML report
  - ./logs:/app/logs                        # Test execution logs
```

For CI without volume mounts, use `docker cp`:

```bash
docker compose cp tests:/app/allure-results ./allure-results
docker compose cp tests:/app/test-results ./test-results
```

---

## Network Configuration

Containers communicate via Docker network names, not `localhost`:

| From | To | URL |
|---|---|---|
| Test container | App container | `http://app:3000` |
| Test container | Selenium Hub | `http://selenium-hub:4444` |
| Test container | Database | `postgresql://db:5432/testdb` |

### Selenium remote driver in Docker

```java
// Java — connect to Selenium Hub in Docker
WebDriver driver = new RemoteWebDriver(
    new URL("http://selenium-hub:4444"),
    new ChromeOptions()
);
```

```python
# Python — connect to Selenium Hub in Docker
driver = webdriver.Remote(
    command_executor="http://selenium-hub:4444",
    options=ChromeOptions()
)
```

---

## Resource Limits

Browser processes are memory-hungry. Set limits to prevent OOM kills:

```yaml
services:
  tests:
    build: .
    deploy:
      resources:
        limits:
          memory: 4g
          cpus: '2.0'
        reservations:
          memory: 2g
    shm_size: 2gb  # critical for Chrome — prevents crashes
```

**Minimum recommendations:**

| Workers | Memory | CPU | shm_size |
|---|---|---|---|
| 1 | 2 GB | 1 | 1 GB |
| 2 | 3 GB | 2 | 2 GB |
| 4 | 6 GB | 4 | 2 GB |

---

## Image Size Optimization

| Technique | Savings | How |
|---|---|---|
| Multi-stage build | 40-60% | Only copy runtime deps to final stage |
| Alpine base | 30-50% | Use `node:20-alpine` (if no browser needed) |
| `npm ci --omit=dev` | 10-30% | Skip dev dependencies in production |
| Layer caching | Build time | Put `COPY package*.json` before `COPY .` |
| `.dockerignore` | 10-20% | Exclude node_modules, .git, test-results |

### .dockerignore

```
node_modules
.git
test-results
allure-results
allure-report
html-report
*.md
.env*
```

---

## Checklist

Every generated framework MUST:

- [ ] Include a Dockerfile with multi-stage build
- [ ] Include a docker-compose.test.yml for local execution
- [ ] Mount volumes for reports/artifacts
- [ ] Use `shm_size: 2gb` for browser containers
- [ ] Document container network URLs (not localhost)
- [ ] Include a `.dockerignore` for build optimization
- [ ] Set resource limits for browser-based tests
