# Parallel Execution Pattern

Strategies for running tests concurrently without interference. Parallelism is the primary lever for reducing feedback time — a 60-minute suite becomes 15 minutes across 4 workers.

## Core Principles

1. **Tests are independent** — any test runs in any order, alongside any other test
2. **Resources are isolated** — each worker gets its own driver/session/data
3. **No shared mutable state** — no writing to shared files, databases rows, or global variables
4. **Reports merge cleanly** — parallel results aggregate into one report

---

## Thread/Worker Isolation

### Java — ThreadLocal WebDriver

```java
public class DriverManager {
    private static final ThreadLocal<WebDriver> driver = new ThreadLocal<>();

    public static WebDriver getDriver() {
        return driver.get();
    }

    public static void initDriver() {
        ChromeOptions options = new ChromeOptions();
        if (ConfigManager.get().headless()) {
            options.addArguments("--headless=new");
        }
        driver.set(new ChromeDriver(options));
    }

    public static void quitDriver() {
        if (driver.get() != null) {
            driver.get().quit();
            driver.remove();
        }
    }
}

// Base test class
public abstract class BaseTest {
    @BeforeMethod
    public void setUp() { DriverManager.initDriver(); }

    @AfterMethod
    public void tearDown() { DriverManager.quitDriver(); }
}
```

### TypeScript — Playwright Worker Isolation

Playwright creates isolated browser contexts per test by default:

```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  workers: process.env.CI ? 4 : 2,
  fullyParallel: true,
  use: {
    browserName: 'chromium',
  },
});
```

Each `test()` gets its own `page` and `context` — no shared state between tests.

For shared expensive resources (auth state), use worker-scoped fixtures:

```typescript
import { test as base } from '@playwright/test';

type WorkerFixtures = { authToken: string };

export const test = base.extend<{}, WorkerFixtures>({
  authToken: [async ({}, use) => {
    const token = await fetchAuthToken();
    await use(token);
  }, { scope: 'worker' }],
});
```

### Python — pytest-xdist Worker Isolation

```python
# conftest.py
import pytest
from playwright.sync_api import sync_playwright

@pytest.fixture(scope="session")
def browser():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        yield browser
        browser.close()

@pytest.fixture
def page(browser):
    context = browser.new_context()
    page = context.new_page()
    yield page
    context.close()
```

Each xdist worker gets its own session-scoped browser, and each test gets a fresh context/page.

---

## Tool-Specific Parallel Configuration

### TestNG (Java)

```xml
<!-- testng.xml -->
<suite name="Suite" parallel="methods" thread-count="4">
  <test name="All Tests">
    <packages>
      <package name="com.app.tests"/>
    </packages>
  </test>
</suite>
```

| parallel attribute | Isolates |
|---|---|
| `methods` | Each test method in its own thread |
| `classes` | Each test class in its own thread |
| `tests` | Each `<test>` tag in its own thread |

### JUnit 5 (Java)

```properties
# junit-platform.properties
junit.jupiter.execution.parallel.enabled=true
junit.jupiter.execution.parallel.mode.default=concurrent
junit.jupiter.execution.parallel.config.strategy=fixed
junit.jupiter.execution.parallel.config.fixed.parallelism=4
```

### Jest (TypeScript)

```javascript
// jest.config.js
module.exports = {
  maxWorkers: '50%',     // use half of available CPU cores
  testTimeout: 30000,
};
```

### Playwright (TypeScript)

```typescript
// playwright.config.ts
export default defineConfig({
  workers: process.env.CI ? 4 : 2,
  fullyParallel: true,    // parallelize within spec files too
});
```

### pytest-xdist (Python)

```bash
pytest -n 4                  # 4 parallel workers
pytest -n auto               # auto-detect CPU count
pytest -n 4 --dist loadgroup # group by @pytest.mark.xdist_group
```

---

## CI Sharding — Splitting Across Jobs

When parallel workers on a single machine aren't enough, split across CI jobs.

### Playwright sharding

```yaml
# GitHub Actions
strategy:
  matrix:
    shard: [1, 2, 3, 4]
steps:
  - run: npx playwright test --shard=${{ matrix.shard }}/4
```

### pytest sharding (manual split)

```yaml
strategy:
  matrix:
    group: [1, 2, 3]
steps:
  - run: |
      TESTS=$(find tests/ -name "*.py" | sort | awk "NR % 3 == ${{ matrix.group }} - 1")
      pytest $TESTS
```

### Maven sharding (surefire)

```xml
<plugin>
  <groupId>org.apache.maven.plugins</groupId>
  <artifactId>maven-surefire-plugin</artifactId>
  <configuration>
    <forkCount>4</forkCount>
    <reuseForks>true</reuseForks>
  </configuration>
</plugin>
```

---

## Resource Contention

Shared resources cause failures when accessed concurrently. Solutions:

| Resource | Problem | Solution |
|---|---|---|
| Database rows | Two tests modify same row | Unique data per test (factories) |
| Ports | Two servers bind same port | Dynamic port assignment |
| Files | Two tests write same file | Temp directories per worker |
| Browser profile | Shared cookies/storage | Fresh context per test |
| API rate limits | Too many concurrent calls | Rate limiting in test setup |

### Dynamic port assignment (TypeScript)

```typescript
import getPort from 'get-port';

const port = await getPort();
const server = app.listen(port);
```

### Temp directory per worker (Python)

```python
import tempfile
import pytest

@pytest.fixture
def work_dir():
    with tempfile.TemporaryDirectory() as tmp:
        yield Path(tmp)
```

---

## Test Ordering Independence

Tests MUST NOT depend on execution order. Verify with:

```bash
# Randomize order
pytest --randomly-seed=12345
npx playwright test --repeat-each=1 --reporter=list

# Run single test in isolation
npx playwright test tests/checkout.spec.ts
pytest tests/test_checkout.py::test_payment -x
```

---

## Report Aggregation from Parallel Runs

All shards write to separate `allure-results-*` directories, then merge:

```bash
# Merge results from all shards
mkdir -p combined-results
cp allure-results-*/* combined-results/
allure generate combined-results -o allure-report --clean
```

In CI, use artifact download with merge:

```yaml
- uses: actions/download-artifact@v4
  with:
    pattern: allure-results-*
    merge-multiple: true
    path: combined-results/
```

---

## Worker Count Recommendations

| Environment | Workers | Rationale |
|---|---|---|
| Local dev | 2 | Keep machine responsive |
| CI (2 vCPU) | 2-3 | Match available cores |
| CI (4 vCPU) | 4-6 | 1-1.5x core count for I/O-bound tests |
| CI sharded | 4 jobs × 2 workers | Scale horizontally |

---

## Checklist

Every generated framework MUST:

- [ ] Run tests in parallel by default (minimum 2 workers)
- [ ] Isolate browser/driver per worker (no shared sessions)
- [ ] Use factory-generated unique data (no shared test data)
- [ ] Support CI sharding via config or CLI
- [ ] Aggregate reports from parallel runs into a single report
- [ ] Document how to adjust worker count per environment
