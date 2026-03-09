# Retry & Stability Pattern

Patterns for making tests reliable without masking real failures. Flaky tests erode trust faster than missing tests.

## Guiding Philosophy

- **Fix the root cause first** — retry is a safety net, not a solution
- **Explicit waits over sleeps** — wait for a condition, not an arbitrary duration
- **Categorize flakiness** — timing, data, environment, or test coupling
- **Quarantine the chronic** — isolate unfixable flakes, don't disable them

---

## Retry Strategies

### Playwright — built-in retries

```typescript
// playwright.config.ts
export default defineConfig({
  retries: process.env.CI ? 2 : 0,  // retry twice in CI, never locally
  expect: {
    timeout: 10000,  // assertion auto-retry timeout
  },
});
```

Playwright auto-retries assertions (like `expect(locator).toBeVisible()`) within the timeout — this is NOT the same as re-running the whole test.

### pytest — pytest-rerunfailures

```bash
pip install pytest-rerunfailures
```

```bash
pytest --reruns 2 --reruns-delay 5  # re-run failed tests twice, 5s delay
```

Or per-test:

```python
import pytest

@pytest.mark.flaky(reruns=2, reruns_delay=3)
def test_sometimes_slow_api():
    response = api.get("/data")
    assert response.status_code == 200
```

### TestNG (Java) — IRetryAnalyzer

```java
public class RetryAnalyzer implements IRetryAnalyzer {
    private int attempt = 0;
    private static final int MAX_RETRIES = 2;

    @Override
    public boolean retry(ITestResult result) {
        if (attempt < MAX_RETRIES) {
            attempt++;
            return true;
        }
        return false;
    }
}

// Apply to tests
@Test(retryAnalyzer = RetryAnalyzer.class)
public void testCheckout() { /* ... */ }

// Or apply globally via listener
@Listeners(RetryListener.class)
public class BaseTest { }
```

### JUnit 5 — custom extension

```java
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
@ExtendWith(RetryExtension.class)
public @interface RetryOnFailure { int maxAttempts() default 2; }

public class RetryExtension implements TestExecutionExceptionHandler {
    @Override
    public void handleTestExecutionException(ExtensionContext ctx, Throwable throwable) throws Throwable {
        RetryOnFailure annotation = ctx.getRequiredTestMethod().getAnnotation(RetryOnFailure.class);
        int maxAttempts = annotation != null ? annotation.maxAttempts() : 1;
        // retry logic with attempt tracking via ExtensionContext.Store
        throw throwable;
    }
}
```

---

## Wait Patterns

### Explicit waits (PREFERRED)

Wait for a specific condition to become true:

```typescript
// Playwright — auto-waiting is built in
await page.click('#submit');  // waits for element to be actionable
await expect(page.locator('.success')).toBeVisible({ timeout: 15000 });
```

```java
// Selenium — WebDriverWait
WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(15));
wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("success")));
```

```python
# Selenium (Python)
wait = WebDriverWait(driver, 15)
wait.until(EC.visibility_of_element_located((By.ID, "success")))
```

### Polling — custom condition

```typescript
// Playwright — poll for API readiness
await expect.poll(async () => {
  const resp = await request.get('/api/health');
  return resp.status();
}, { intervals: [1000, 2000, 5000], timeout: 30000 }).toBe(200);
```

```python
# Python — tenacity for API polling
from tenacity import retry, stop_after_delay, wait_exponential

@retry(stop=stop_after_delay(30), wait=wait_exponential(multiplier=1, max=10))
def wait_for_api():
    resp = requests.get(f"{config.api_url}/health")
    assert resp.status_code == 200
```

### Anti-Patterns — NEVER DO THESE

```typescript
// BAD: Fixed sleep — wastes time or isn't long enough
await page.waitForTimeout(5000);
Thread.sleep(5000);
time.sleep(5)

// BAD: Implicit waits — apply globally, hide real issues
driver.manage().timeouts().implicitlyWait(Duration.ofSeconds(10));

// BAD: Retry loop without backoff
while (!element.isDisplayed()) { /* tight loop burns CPU */ }
```

---

## Network Stability

### Retry on network errors

```typescript
// TypeScript — retry API calls on transient errors
async function resilientApiCall<T>(fn: () => Promise<T>, maxRetries = 3): Promise<T> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      const isTransient = error.message?.includes('ECONNRESET')
        || error.message?.includes('ETIMEDOUT')
        || error.message?.includes('503');
      if (!isTransient || attempt === maxRetries) throw error;
      await new Promise(r => setTimeout(r, attempt * 2000));
    }
  }
  throw new Error('Unreachable');
}
```

### Timeout configuration

```typescript
// playwright.config.ts
export default defineConfig({
  timeout: 60000,        // per-test timeout
  expect: { timeout: 10000 },  // per-assertion timeout
  use: {
    actionTimeout: 15000,      // per-action timeout (click, fill, etc.)
    navigationTimeout: 30000,  // page.goto timeout
  },
});
```

---

## Element Stability

### Stale element handling (Selenium)

```java
public WebElement findWithRetry(By locator, int maxAttempts) {
    for (int i = 0; i < maxAttempts; i++) {
        try {
            WebElement element = driver.findElement(locator);
            element.isDisplayed();  // force staleness check
            return element;
        } catch (StaleElementReferenceException e) {
            if (i == maxAttempts - 1) throw e;
        }
    }
    throw new NoSuchElementException("Element not found: " + locator);
}
```

### Animation waits

```typescript
// Wait for CSS animations to complete
await page.locator('.modal').evaluate(el => {
  return new Promise(resolve => {
    const animations = el.getAnimations();
    if (animations.length === 0) resolve(undefined);
    Promise.all(animations.map(a => a.finished)).then(() => resolve(undefined));
  });
});

// Or simpler — wait for stable position
await expect(page.locator('.modal')).toBeVisible();
await page.locator('.modal').click({ force: false }); // default: waits for actionability
```

### Lazy-load waits

```typescript
// Wait for lazy-loaded content
await page.locator('.product-list .item').first().waitFor({ state: 'visible' });
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
await page.waitForLoadState('networkidle');
```

---

## Test Quarantine

Isolate known-flaky tests into a separate pipeline so they don't block releases:

### Tag-based quarantine

```typescript
// Tag flaky tests
test('intermittent payment gateway timeout @quarantine', async ({ page }) => {
  // ...
});

// playwright.config.ts — main pipeline excludes quarantine
export default defineConfig({
  grep: /^(?!.*@quarantine)/,
});

// quarantine.config.ts — separate pipeline
export default defineConfig({
  grep: /@quarantine/,
  retries: 3,
});
```

```python
# Python
@pytest.mark.quarantine
def test_flaky_payment():
    pass

# pytest.ini
# Main run: pytest -m "not quarantine"
# Quarantine run: pytest -m quarantine --reruns 3
```

---

## Flaky Test Detection

Run tests N times and flag inconsistent results:

```bash
# Playwright — repeat each test 5 times
npx playwright test --repeat-each=5 --reporter=json > results.json

# pytest — repeat 5 times
pip install pytest-repeat
pytest --count=5 -x  # stop on first failure
```

### Automated flakiness report

```typescript
// analyze-flakiness.ts
import results from './results.json';

const tests = new Map<string, { pass: number; fail: number }>();
for (const suite of results.suites) {
  for (const spec of suite.specs) {
    const key = spec.title;
    if (!tests.has(key)) tests.set(key, { pass: 0, fail: 0 });
    for (const result of spec.tests) {
      result.status === 'passed' ? tests.get(key)!.pass++ : tests.get(key)!.fail++;
    }
  }
}

for (const [name, counts] of tests) {
  if (counts.fail > 0 && counts.pass > 0) {
    const rate = (counts.fail / (counts.pass + counts.fail) * 100).toFixed(1);
    console.log(`FLAKY (${rate}%): ${name}`);
  }
}
```

---

## Root Cause Categories

| Category | Symptom | Fix |
|---|---|---|
| **Timing** | Passes with retry, fails on first run | Explicit waits, polling |
| **Test data** | Fails when run after specific test | Data isolation, factories |
| **Environment** | Passes locally, fails in CI | Docker, resource limits |
| **Test coupling** | Fails when run alone, passes in suite | Remove shared state |
| **Animation/render** | Fails on click/assert immediately after navigation | Animation waits, actionability checks |
| **Network** | Sporadic timeouts | Retry on transient errors, increase timeouts |

---

## Checklist

Every generated framework MUST:

- [ ] Configure retries in CI (2 retries default), zero retries locally
- [ ] Use explicit waits for all element interactions (no sleeps)
- [ ] Set per-test, per-action, and per-assertion timeouts
- [ ] Include a quarantine tag/mechanism for known-flaky tests
- [ ] Handle stale elements and animation timing
- [ ] Document how to run flakiness detection (`--repeat-each`)
