# Reporting Pattern

Unified reporting strategy for all TAFF-generated frameworks. Every framework ships with Allure-compatible reporting, failure artifacts, and CI notification hooks.

## Reporting Stack

| Layer | Tool | Purpose |
|---|---|---|
| Core reporter | Allure | Cross-language, rich UI, history/trends |
| Backup report | HTML (built-in) | Offline, no server needed |
| Failure artifacts | Screenshots, video, logs | Debugging without reproduction |
| Notification | Slack webhook / email | Instant failure alerts |

---

## Allure Setup

### TypeScript (Playwright)

```bash
npm install -D allure-playwright allure-commandline
```

```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  reporter: [
    ['list'],
    ['allure-playwright', { outputFolder: 'allure-results' }],
    ['html', { outputFolder: 'html-report', open: 'never' }],
  ],
  use: {
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
  },
});
```

Generate and open:

```bash
npx allure generate allure-results -o allure-report --clean
npx allure open allure-report
```

### Java (TestNG + Allure)

```xml
<!-- pom.xml -->
<dependency>
  <groupId>io.qameta.allure</groupId>
  <artifactId>allure-testng</artifactId>
  <version>2.25.0</version>
</dependency>
<dependency>
  <groupId>io.qameta.allure</groupId>
  <artifactId>allure-selenide</artifactId>
  <version>2.25.0</version>
</dependency>
```

```java
@Listeners({AllureTestNg.class})
public class BaseTest {

    @Attachment(value = "Screenshot", type = "image/png")
    public byte[] captureScreenshot(WebDriver driver) {
        return ((TakesScreenshot) driver).getScreenshotAs(OutputType.BYTES);
    }

    @AfterMethod
    public void afterMethod(ITestResult result) {
        if (result.getStatus() == ITestResult.FAILURE) {
            captureScreenshot(DriverManager.getDriver());
        }
    }
}
```

### Python (pytest + allure-pytest)

```bash
pip install allure-pytest
```

```python
# conftest.py
import allure
import pytest

@pytest.hookimpl(tryfirst=True, hookwrapper=True)
def pytest_runtest_makereport(item, call):
    outcome = yield
    report = outcome.get_result()
    if report.when == "call" and report.failed:
        page = item.funcargs.get("page")
        if page:
            screenshot = page.screenshot()
            allure.attach(screenshot, name="failure-screenshot",
                         attachment_type=allure.attachment_type.PNG)
```

```bash
pytest --alluredir=allure-results
allure serve allure-results
```

---

## Screenshots on Failure

### Playwright (built-in)

Configured via `playwright.config.ts` — `screenshot: 'only-on-failure'` attaches automatically to both HTML and Allure reports.

### Selenium (Java)

```java
public class ScreenshotUtil {
    public static void captureOnFailure(WebDriver driver, String testName) {
        byte[] screenshot = ((TakesScreenshot) driver).getScreenshotAs(OutputType.BYTES);
        String path = "target/screenshots/" + testName + "_"
            + Instant.now().toEpochMilli() + ".png";
        Files.write(Path.of(path), screenshot);
        Allure.addAttachment("Failure Screenshot", "image/png",
            new ByteArrayInputStream(screenshot), ".png");
    }
}
```

### Selenium (Python)

```python
def capture_on_failure(driver, test_name):
    path = f"reports/screenshots/{test_name}_{int(time.time())}.png"
    driver.save_screenshot(path)
    allure.attach.file(path, name="Failure Screenshot",
                       attachment_type=allure.attachment_type.PNG)
```

---

## Video Recording

| Tool | Video Support | Configuration |
|---|---|---|
| Playwright | Built-in | `video: 'retain-on-failure'` |
| Cypress | Built-in | `video: true` in cypress.config |
| Selenium | Requires Selenium Grid + video recorder | `SE_RECORD_VIDEO=true` in docker-compose |

### Playwright video attachment

```typescript
// Automatic — configured in playwright.config.ts
// Videos appear in test-results/<test-name>/ directory
// Allure attaches them automatically when using allure-playwright
```

---

## Failure Artifact Collection

Every test failure MUST produce:

```
test-results/
  └── <test-name>/
      ├── screenshot.png       # viewport at failure
      ├── video.webm           # full recording (if enabled)
      ├── trace.zip            # Playwright trace (if enabled)
      ├── console-logs.txt     # browser console output
      └── dom-snapshot.html    # page HTML at failure
```

### DOM snapshot (Playwright)

```typescript
import { test } from '@playwright/test';

test.afterEach(async ({ page }, testInfo) => {
  if (testInfo.status !== testInfo.expectedStatus) {
    const html = await page.content();
    await testInfo.attach('dom-snapshot', { body: html, contentType: 'text/html' });
    const consoleLogs = testInfo.attachments; // collected via page.on('console')
  }
});
```

### Console log collector (Playwright)

```typescript
test.beforeEach(async ({ page }, testInfo) => {
  const logs: string[] = [];
  page.on('console', msg => logs.push(`[${msg.type()}] ${msg.text()}`));
  page.on('pageerror', err => logs.push(`[ERROR] ${err.message}`));

  // attach after test
  testInfo['_consoleLogs'] = logs;
});

test.afterEach(async ({}, testInfo) => {
  const logs = testInfo['_consoleLogs'] as string[];
  if (logs?.length) {
    await testInfo.attach('console-logs', {
      body: logs.join('\n'), contentType: 'text/plain',
    });
  }
});
```

---

## Report History and Trends

Allure supports trend tracking across runs by preserving the `history` directory:

```bash
# Before generating a new report, copy previous history
cp -r allure-report/history allure-results/history 2>/dev/null || true
allure generate allure-results -o allure-report --clean
```

In CI, persist `allure-report/history` as an artifact and restore it before the next run.

### GitHub Actions example

```yaml
- name: Restore Allure history
  uses: actions/cache@v4
  with:
    path: allure-report/history
    key: allure-history-${{ github.ref }}

- name: Generate Allure report
  run: |
    cp -r allure-report/history allure-results/history || true
    npx allure generate allure-results -o allure-report --clean

- name: Upload report
  uses: actions/upload-artifact@v4
  with:
    name: allure-report
    path: allure-report/
```

---

## Slack Notification on Failure

```typescript
// notify-slack.ts — run as post-test script
import fetch from 'node-fetch';

interface TestSummary { total: number; passed: number; failed: number; url: string; }

export async function notifySlack(summary: TestSummary) {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  if (!webhookUrl || summary.failed === 0) return;

  await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: `🔴 Test Run Failed: ${summary.failed}/${summary.total} tests failed`,
      blocks: [{
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Test Results*\n✅ Passed: ${summary.passed}\n❌ Failed: ${summary.failed}\n<${summary.url}|View Report>`,
        },
      }],
    }),
  });
}
```

---

## CI Artifact Storage

Every CI pipeline MUST upload these artifacts:

| Artifact | Retention | Purpose |
|---|---|---|
| `allure-report/` | 30 days | Full interactive report |
| `html-report/` | 30 days | Offline backup report |
| `test-results/` | 7 days | Raw failure artifacts |
| `allure-results/` | 7 days | Raw data for re-generation |

---

## Checklist

Every generated framework MUST:

- [ ] Generate Allure results by default
- [ ] Capture screenshots on every failure automatically
- [ ] Attach failure artifacts (screenshot, console logs, DOM) to the report
- [ ] Ship a `generate-report` npm/maven/pytest script
- [ ] Include Slack notification script (opt-in via `SLACK_WEBHOOK_URL`)
- [ ] Preserve Allure history for trend tracking in CI
