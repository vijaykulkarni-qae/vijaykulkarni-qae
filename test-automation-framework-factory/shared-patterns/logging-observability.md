# Logging & Observability Pattern

Structured logging and observability for all TAFF-generated frameworks. When a test fails in CI at 3 AM, logs and artifacts are the only debugging tools available.

## Core Principles

1. **Structured logging** — JSON format, machine-parseable, human-readable fallback
2. **Correlation IDs** — trace a single test execution across services
3. **Right log level** — too noisy is as bad as too quiet
4. **Artifacts on failure** — screenshots, network logs, console output automatically collected

---

## Log Levels — When to Use Each

| Level | When | Example |
|---|---|---|
| `DEBUG` | Individual test steps, element interactions | `Clicking submit button` |
| `INFO` | Test lifecycle events, setup/teardown | `Test started: checkout.spec.ts` |
| `WARN` | Retries, non-fatal issues, slow operations | `Retrying click (attempt 2/3)` |
| `ERROR` | Test failures, unexpected exceptions | `Element not found: #submit-btn` |

**Rule**: CI runs at `INFO`. Local dev runs at `DEBUG`. Never log at `DEBUG` in production smoke tests.

---

## TypeScript — pino (structured JSON logger)

```typescript
import pino from 'pino';
import { v4 as uuid } from 'uuid';

const LOG_LEVEL = process.env.LOG_LEVEL || (process.env.CI ? 'info' : 'debug');

export function createTestLogger(testName: string) {
  const correlationId = uuid();

  const logger = pino({
    level: LOG_LEVEL,
    transport: process.env.CI
      ? undefined
      : { target: 'pino-pretty', options: { colorize: true } },
    base: {
      correlationId,
      testName,
      env: process.env.TEST_ENV || 'local',
      worker: process.env.TEST_WORKER_INDEX || '0',
    },
  });

  return { logger, correlationId };
}

// Usage in Playwright fixture
import { test as base } from '@playwright/test';

export const test = base.extend<{ log: pino.Logger }>({
  log: async ({}, use, testInfo) => {
    const { logger } = createTestLogger(testInfo.title);
    logger.info({ status: 'started' }, 'Test started');
    await use(logger);
    logger.info({ status: testInfo.status }, 'Test finished');
  },
});

// Usage in test
test('checkout flow', async ({ page, log }) => {
  log.debug('Navigating to cart');
  await page.goto('/cart');

  log.debug({ itemCount: 3 }, 'Adding items');
  await page.click('#checkout');

  log.info('Checkout completed successfully');
});
```

### JSON output (CI)

```json
{"level":"info","correlationId":"a1b2c3d4","testName":"checkout flow","status":"started","msg":"Test started"}
{"level":"debug","correlationId":"a1b2c3d4","testName":"checkout flow","msg":"Navigating to cart"}
{"level":"info","correlationId":"a1b2c3d4","testName":"checkout flow","msg":"Checkout completed successfully"}
```

---

## Java — SLF4J + Logback (structured)

### logback-test.xml

```xml
<configuration>
  <appender name="CONSOLE" class="ch.qos.logback.core.ConsoleAppender">
    <encoder class="net.logstash.logback.encoder.LogstashEncoder">
      <includeMdcKeyName>correlationId</includeMdcKeyName>
      <includeMdcKeyName>testName</includeMdcKeyName>
    </encoder>
  </appender>

  <appender name="FILE" class="ch.qos.logback.core.FileAppender">
    <file>logs/test-execution.log</file>
    <encoder class="net.logstash.logback.encoder.LogstashEncoder"/>
  </appender>

  <root level="${LOG_LEVEL:-INFO}">
    <appender-ref ref="CONSOLE"/>
    <appender-ref ref="FILE"/>
  </root>
</configuration>
```

### TestLogger.java

```java
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import java.util.UUID;

public class TestLogger {
    private static final Logger log = LoggerFactory.getLogger(TestLogger.class);

    public static void initTest(String testName) {
        MDC.put("correlationId", UUID.randomUUID().toString());
        MDC.put("testName", testName);
        log.info("Test started");
    }

    public static void step(String message) {
        log.debug(message);
    }

    public static void endTest(String status) {
        log.info("Test finished with status: {}", status);
        MDC.clear();
    }
}

// Usage in base test
public abstract class BaseTest {
    @BeforeMethod
    public void logSetup(Method method) {
        TestLogger.initTest(method.getName());
    }

    @AfterMethod
    public void logTeardown(ITestResult result) {
        String status = result.isSuccess() ? "PASSED" : "FAILED";
        TestLogger.endTest(status);
    }
}
```

---

## Python — structlog (structured)

```python
import structlog
import uuid
import os

structlog.configure(
    processors=[
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.add_log_level,
        structlog.processors.JSONRenderer() if os.getenv("CI") else structlog.dev.ConsoleRenderer(),
    ],
    wrapper_class=structlog.BoundLogger,
    cache_logger_on_first_use=True,
)

def create_test_logger(test_name: str):
    correlation_id = str(uuid.uuid4())
    return structlog.get_logger().bind(
        correlation_id=correlation_id,
        test_name=test_name,
        env=os.getenv("TEST_ENV", "local"),
    )

# conftest.py
import pytest

@pytest.fixture(autouse=True)
def test_logger(request):
    log = create_test_logger(request.node.name)
    log.info("test_started")
    yield log
    log.info("test_finished", status="passed" if request.node.rep_call.passed else "failed")
```

---

## Correlation IDs

Every test execution gets a unique correlation ID. Pass it through:

```
Test → API requests → Application logs → Database queries
```

### Injecting into API requests

```typescript
// TypeScript (Playwright)
const { logger, correlationId } = createTestLogger(testInfo.title);

await page.setExtraHTTPHeaders({
  'X-Correlation-Id': correlationId,
  'X-Test-Name': testInfo.title,
});
```

```java
// Java (RestAssured)
given()
    .header("X-Correlation-Id", MDC.get("correlationId"))
    .header("X-Test-Name", MDC.get("testName"))
    .get("/api/users");
```

This allows searching application logs by correlation ID when a test fails.

---

## Debug Artifact Generation

### Network log capture (Playwright)

```typescript
test.beforeEach(async ({ page }, testInfo) => {
  const requests: string[] = [];

  page.on('request', req =>
    requests.push(`>> ${req.method()} ${req.url()}`)
  );
  page.on('response', res =>
    requests.push(`<< ${res.status()} ${res.url()}`)
  );

  testInfo['_networkLog'] = requests;
});

test.afterEach(async ({}, testInfo) => {
  const networkLog = testInfo['_networkLog'] as string[];
  if (testInfo.status !== testInfo.expectedStatus && networkLog?.length) {
    await testInfo.attach('network-log', {
      body: networkLog.join('\n'),
      contentType: 'text/plain',
    });
  }
});
```

---

## Log Aggregation Patterns

| Stack | Components | Best For |
|---|---|---|
| **ELK** | Elasticsearch + Logstash + Kibana | Large orgs, existing ELK |
| **Loki + Grafana** | Lightweight log aggregation | Cloud-native, low overhead |
| **CloudWatch** | AWS-native | AWS-hosted CI/CD |

### Shipping logs from CI (Loki example)

```yaml
# GitHub Actions
- name: Push logs to Loki
  if: always()
  run: |
    cat logs/test-execution.log | promtail \
      --client.url="$LOKI_URL/loki/api/v1/push" \
      --stdin \
      --client.external-labels="job=tests,branch=${{ github.ref_name }},run=${{ github.run_id }}"
```

---

## Test Execution Timeline

Generate a visual timeline of test execution for debugging slow suites:

```typescript
// timeline-reporter.ts
class TimelineReporter implements Reporter {
  private events: { test: string; start: number; end: number; status: string }[] = [];

  onTestEnd(test: TestCase, result: TestResult) {
    this.events.push({
      test: test.title,
      start: result.startTime.getTime(),
      end: result.startTime.getTime() + result.duration,
      status: result.status,
    });
  }

  onEnd() {
    writeFileSync('timeline.json', JSON.stringify(this.events, null, 2));
  }
}
```

---

## Checklist

Every generated framework MUST:

- [ ] Use structured (JSON) logging in CI, pretty-print locally
- [ ] Assign a correlation ID per test execution
- [ ] Log test start/end with status at INFO level
- [ ] Capture network logs and console output on failure
- [ ] Attach all debug artifacts to the test report
- [ ] Support configurable log levels via environment variable
- [ ] Include a log file output for CI artifact collection
