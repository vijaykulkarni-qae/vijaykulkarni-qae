# Blueprint: axe-core + Playwright — Accessibility Testing

> **Tool Combo** @axe-core/playwright · Playwright · TypeScript/JavaScript
> **Testing Types** WCAG 2.1 AA Compliance · Per-Page Scanning · Component-Level Scanning
> **Difficulty** Beginner–Intermediate

---

## 1 Overview

axe-core is the industry-standard accessibility rules engine maintained by Deque Systems. When integrated with Playwright via `@axe-core/playwright`, it enables automated WCAG compliance scanning within existing end-to-end test suites — catching violations in real browser rendering contexts including Shadow DOM, iframes, and dynamically loaded content.

This blueprint produces a production-ready accessibility testing framework that:

- Integrates **AxeBuilder** into Playwright tests for per-page and component-level scanning.
- Enforces **WCAG 2.1 AA** with configurable rule sets and severity gating.
- Captures **screenshots** alongside violations for visual evidence.
- Generates **HTML reports** with violation details and remediation hints.
- Runs in **GitHub Actions** with an accessibility gate (fail on critical/serious).
- Works alongside existing Playwright functional test suites without duplication.

---

## 2 Prerequisites

| Requirement | Version | Purpose |
|---|---|---|
| Node.js | ≥ 18 | Runtime |
| Playwright | ≥ 1.40 | Browser automation |
| @axe-core/playwright | ≥ 4.8 | Accessibility scanning |
| axe-html-reporter | ≥ 2.2 | HTML report generation |
| TypeScript | ≥ 5.0 (optional) | Type safety |

### Install

```bash
npm init -y
npm install -D @playwright/test @axe-core/playwright axe-html-reporter

# Install browsers
npx playwright install --with-deps chromium
```

### package.json Scripts

```json
{
  "scripts": {
    "test:a11y": "npx playwright test --project=accessibility",
    "test:a11y:ui": "npx playwright test --project=accessibility --ui",
    "test:a11y:report": "npx playwright show-report reports/a11y"
  }
}
```

---

## 3 Architecture

### 3.1 Project Structure

```
accessibility-tests/
├── tests/
│   ├── a11y/
│   │   ├── homepage.a11y.spec.ts       # per-page scan
│   │   ├── dashboard.a11y.spec.ts
│   │   ├── forms.a11y.spec.ts
│   │   ├── navigation.a11y.spec.ts
│   │   └── components.a11y.spec.ts     # component-level scan
│   └── e2e/
│       └── ...                          # existing functional tests
├── lib/
│   ├── a11y-helpers.ts                  # AxeBuilder factory + assertions
│   ├── a11y-reporter.ts                 # HTML report generator
│   ├── a11y-config.ts                   # rule sets & severity mapping
│   └── page-objects/
│       └── ...                          # shared page objects
├── reports/
│   ├── a11y/                            # Playwright HTML report
│   ├── a11y-html/                       # axe HTML violation reports
│   └── screenshots/                     # violation screenshots
├── playwright.config.ts
├── .github/
│   └── workflows/
│       └── a11y-test.yml
├── package.json
└── README.md
```

### 3.2 Scanning Strategy

```
┌─────────────────────────────────────┐
│         Page-Level Scan             │
│  Full page accessibility audit      │
│  (every route in the application)   │
└────────────┬────────────────────────┘
             │
┌────────────▼────────────────────────┐
│       Component-Level Scan          │
│  Targeted scan of individual        │
│  components (forms, modals, navs)   │
└────────────┬────────────────────────┘
             │
┌────────────▼────────────────────────┐
│      Interaction-Based Scan         │
│  Scan after state changes           │
│  (open modal, expand accordion)     │
└─────────────────────────────────────┘
```

---

## 4 Core Patterns

### 4.1 AxeBuilder Factory with Defaults

```typescript
// lib/a11y-helpers.ts
import { Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import type { AxeResults, Result } from 'axe-core';

export interface A11yScanOptions {
  include?: string[];
  exclude?: string[];
  disableRules?: string[];
  tags?: string[];
}

const DEFAULT_TAGS = ['wcag2a', 'wcag2aa', 'wcag21aa'];

export async function scanPage(
  page: Page,
  options: A11yScanOptions = {}
): Promise<AxeResults> {
  let builder = new AxeBuilder({ page }).withTags(options.tags ?? DEFAULT_TAGS);

  if (options.include?.length) {
    for (const selector of options.include) {
      builder = builder.include(selector);
    }
  }

  if (options.exclude?.length) {
    for (const selector of options.exclude) {
      builder = builder.exclude(selector);
    }
  }

  if (options.disableRules?.length) {
    builder = builder.disableRules(options.disableRules);
  }

  return builder.analyze();
}

export function filterBySeverity(
  violations: Result[],
  minImpact: 'critical' | 'serious' | 'moderate' | 'minor' = 'moderate'
): Result[] {
  const severity: Record<string, number> = {
    minor: 0,
    moderate: 1,
    serious: 2,
    critical: 3,
  };
  const threshold = severity[minImpact];
  return violations.filter(
    (v) => severity[v.impact ?? 'minor'] >= threshold
  );
}

export function formatViolations(violations: Result[]): string {
  if (violations.length === 0) return 'No accessibility violations found.';

  return violations
    .map((v) => {
      const nodes = v.nodes
        .map(
          (n) =>
            `    - ${n.html}\n      Fix: ${n.failureSummary?.replace(/\n/g, '\n           ')}`
        )
        .join('\n');
      return `[${v.impact?.toUpperCase()}] ${v.id}: ${v.help}\n  URL: ${v.helpUrl}\n  Elements (${v.nodes.length}):\n${nodes}`;
    })
    .join('\n\n');
}
```

### 4.2 Accessibility Configuration

```typescript
// lib/a11y-config.ts

export const WCAG_RULE_SETS = {
  wcag2aa: ['wcag2a', 'wcag2aa', 'wcag21aa'],
  wcag2aaa: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag2aaa'],
  bestPractice: ['best-practice'],
  all: ['wcag2a', 'wcag2aa', 'wcag21aa', 'best-practice'],
};

export const GLOBAL_EXCLUSIONS = [
  '#third-party-widget',
  '.analytics-beacon',
];

export const SEVERITY_GATE = {
  ci: ['critical', 'serious'] as const,
  full: ['critical', 'serious', 'moderate'] as const,
};

export const PAGES_TO_SCAN = [
  { name: 'Homepage', path: '/' },
  { name: 'Login', path: '/login' },
  { name: 'Dashboard', path: '/dashboard' },
  { name: 'Settings', path: '/settings' },
  { name: 'Profile', path: '/profile' },
  { name: 'Search Results', path: '/search?q=test' },
];
```

### 4.3 Per-Page Scanning Pattern

```typescript
// tests/a11y/homepage.a11y.spec.ts
import { test, expect } from '@playwright/test';
import { scanPage, filterBySeverity, formatViolations } from '../../lib/a11y-helpers';
import { generateA11yReport } from '../../lib/a11y-reporter';

test.describe('Homepage Accessibility', () => {
  test('should have no critical or serious violations', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const results = await scanPage(page);
    const blocking = filterBySeverity(results.violations, 'serious');

    if (blocking.length > 0) {
      await page.screenshot({
        path: `reports/screenshots/homepage-violations.png`,
        fullPage: true,
      });
    }

    await generateA11yReport(results, 'homepage');

    expect(
      blocking,
      `Found ${blocking.length} blocking a11y violations:\n${formatViolations(blocking)}`
    ).toHaveLength(0);
  });

  test('should have no violations after interacting with nav menu', async ({ page }) => {
    await page.goto('/');
    await page.click('[aria-label="Open menu"]');
    await page.waitForSelector('nav[aria-expanded="true"]');

    const results = await scanPage(page, {
      include: ['nav[role="navigation"]'],
    });

    const blocking = filterBySeverity(results.violations, 'serious');
    expect(blocking).toHaveLength(0);
  });
});
```

### 4.4 Component-Level Scanning

```typescript
// tests/a11y/components.a11y.spec.ts
import { test, expect } from '@playwright/test';
import { scanPage, filterBySeverity, formatViolations } from '../../lib/a11y-helpers';

test.describe('Component Accessibility', () => {
  test('login form is accessible', async ({ page }) => {
    await page.goto('/login');

    const results = await scanPage(page, {
      include: ['form#login-form'],
    });

    expect(results.violations, formatViolations(results.violations)).toHaveLength(0);
  });

  test('modal dialog is accessible when open', async ({ page }) => {
    await page.goto('/dashboard');
    await page.click('[data-testid="open-modal"]');
    await page.waitForSelector('[role="dialog"]');

    const results = await scanPage(page, {
      include: ['[role="dialog"]'],
    });

    const blocking = filterBySeverity(results.violations, 'serious');
    expect(blocking).toHaveLength(0);
  });

  test('data table is accessible', async ({ page }) => {
    await page.goto('/dashboard');

    const results = await scanPage(page, {
      include: ['table.data-grid'],
    });

    expect(results.violations, formatViolations(results.violations)).toHaveLength(0);
  });

  test('dropdown menu is accessible when expanded', async ({ page }) => {
    await page.goto('/');
    await page.click('[aria-haspopup="listbox"]');
    await page.waitForSelector('[role="listbox"]');

    const results = await scanPage(page, {
      include: ['[role="listbox"]'],
    });

    expect(results.violations).toHaveLength(0);
  });
});
```

### 4.5 Data-Driven Multi-Page Scan

```typescript
// tests/a11y/all-pages.a11y.spec.ts
import { test, expect } from '@playwright/test';
import { scanPage, filterBySeverity, formatViolations } from '../../lib/a11y-helpers';
import { generateA11yReport } from '../../lib/a11y-reporter';
import { PAGES_TO_SCAN, SEVERITY_GATE } from '../../lib/a11y-config';

for (const pageConfig of PAGES_TO_SCAN) {
  test(`${pageConfig.name} (${pageConfig.path}) has no critical/serious violations`, async ({
    page,
  }) => {
    await page.goto(pageConfig.path);
    await page.waitForLoadState('networkidle');

    const results = await scanPage(page);
    const blocking = filterBySeverity(results.violations, 'serious');

    if (blocking.length > 0) {
      const safeName = pageConfig.name.toLowerCase().replace(/\s+/g, '-');
      await page.screenshot({
        path: `reports/screenshots/${safeName}-violations.png`,
        fullPage: true,
      });
    }

    await generateA11yReport(results, pageConfig.name);

    expect(
      blocking,
      `${pageConfig.name}: ${blocking.length} blocking violations\n${formatViolations(blocking)}`
    ).toHaveLength(0);
  });
}
```

### 4.6 HTML Report Generator

```typescript
// lib/a11y-reporter.ts
import { createHtmlReport } from 'axe-html-reporter';
import type { AxeResults } from 'axe-core';
import * as fs from 'fs';
import * as path from 'path';

const REPORT_DIR = path.resolve(__dirname, '..', 'reports', 'a11y-html');

export async function generateA11yReport(
  results: AxeResults,
  pageName: string
): Promise<string> {
  fs.mkdirSync(REPORT_DIR, { recursive: true });

  const safeName = pageName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const fileName = `${safeName}-a11y-report.html`;

  createHtmlReport({
    results,
    options: {
      outputDir: REPORT_DIR,
      reportFileName: fileName,
    },
  });

  return path.join(REPORT_DIR, fileName);
}
```

### 4.7 iFrame Handling

```typescript
test('iframe content is accessible', async ({ page }) => {
  await page.goto('/page-with-iframe');

  // axe-core scans iframes by default when same-origin
  const results = await scanPage(page);
  expect(filterBySeverity(results.violations, 'serious')).toHaveLength(0);

  // For cross-origin iframes, scan within the frame context
  const frame = page.frameLocator('#external-widget');
  // Note: AxeBuilder works on Page, not Frame — navigate into iframe URL directly
  const iframePage = await page.context().newPage();
  const iframeSrc = await page.locator('#external-widget').getAttribute('src');
  if (iframeSrc) {
    await iframePage.goto(iframeSrc);
    const iframeResults = await scanPage(iframePage);
    expect(filterBySeverity(iframeResults.violations, 'serious')).toHaveLength(0);
    await iframePage.close();
  }
});
```

### 4.8 Color Contrast & Keyboard Navigation

```typescript
test('color contrast meets WCAG AA ratio', async ({ page }) => {
  await page.goto('/');

  const results = await scanPage(page, {
    // color-contrast is included in wcag2aa by default
    // Explicitly run only contrast check for focused testing:
    tags: ['wcag2aa'],
  });

  const contrastIssues = results.violations.filter(
    (v) => v.id === 'color-contrast'
  );

  expect(
    contrastIssues,
    `Found ${contrastIssues.length} color contrast violations:\n${formatViolations(contrastIssues)}`
  ).toHaveLength(0);
});

test('all interactive elements are keyboard accessible', async ({ page }) => {
  await page.goto('/');

  const interactiveElements = await page.locator(
    'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
  ).all();

  for (const el of interactiveElements) {
    await el.focus();
    const isFocused = await el.evaluate(
      (node) => document.activeElement === node
    );
    const isVisible = await el.isVisible();

    if (isVisible) {
      expect(isFocused, `Element not keyboard focusable: ${await el.innerHTML()}`).toBe(true);

      const outlineOrBorder = await el.evaluate((node) => {
        const styles = window.getComputedStyle(node, ':focus');
        return styles.outline !== 'none' || styles.boxShadow !== 'none';
      });
      expect(outlineOrBorder, 'Focused element has no visible focus indicator').toBe(true);
    }
  }
});
```

### 4.9 Custom axe Rules Configuration

```typescript
import AxeBuilder from '@axe-core/playwright';

test('scan with custom axe configuration', async ({ page }) => {
  await page.goto('/');

  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .disableRules(['region', 'landmark-one-main'])  // disable specific rules
    .options({
      rules: {
        'color-contrast': { enabled: true },
        'link-name': { enabled: true },
        'image-alt': { enabled: true },
      },
    })
    .analyze();

  expect(filterBySeverity(results.violations, 'serious')).toHaveLength(0);
});
```

---

## 5 Configuration

### Playwright Config

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  outputDir: './reports/test-results',
  reporter: [
    ['html', { open: 'never', outputFolder: 'reports/a11y' }],
    ['json', { outputFile: 'reports/a11y-results.json' }],
    ['list'],
  ],
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'accessibility',
      testMatch: '**/*.a11y.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
      },
    },
    {
      name: 'accessibility-mobile',
      testMatch: '**/*.a11y.spec.ts',
      use: {
        ...devices['iPhone 14'],
      },
    },
  ],
});
```

---

## 6 Reporting

### 6.1 Report Outputs

| Report | Location | Description |
|---|---|---|
| Playwright HTML | `reports/a11y/` | Test results with pass/fail per spec |
| axe HTML | `reports/a11y-html/` | Per-page violation details with element highlights |
| Screenshots | `reports/screenshots/` | Full-page captures when violations found |
| JSON | `reports/a11y-results.json` | Machine-readable results for CI parsing |

### 6.2 Violation Report Content

Each axe HTML report includes:

- **Violation ID** and WCAG criteria reference
- **Impact** severity (critical / serious / moderate / minor)
- **Affected elements** with HTML snippets
- **Failure summary** describing the exact issue
- **Remediation hints** with fix suggestions
- **Help URL** linking to Deque's detailed documentation

### 6.3 Custom Summary in CI Output

```typescript
// lib/a11y-helpers.ts (addition)
export function printSummary(results: AxeResults, pageName: string): void {
  const counts = {
    critical: 0,
    serious: 0,
    moderate: 0,
    minor: 0,
  };

  for (const v of results.violations) {
    const impact = v.impact as keyof typeof counts;
    if (impact in counts) counts[impact]++;
  }

  console.log(`\n=== A11y Summary: ${pageName} ===`);
  console.log(`  Violations: ${results.violations.length}`);
  console.log(`  Passes:     ${results.passes.length}`);
  console.log(`  Critical:   ${counts.critical}`);
  console.log(`  Serious:    ${counts.serious}`);
  console.log(`  Moderate:   ${counts.moderate}`);
  console.log(`  Minor:      ${counts.minor}`);
  console.log(`  Incomplete: ${results.incomplete.length}`);
}
```

---

## 7 CI/CD Integration

### GitHub Actions Workflow

```yaml
# .github/workflows/a11y-test.yml
name: Accessibility Tests

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  accessibility:
    name: WCAG 2.1 AA Compliance
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install Dependencies
        run: npm ci

      - name: Install Playwright Browsers
        run: npx playwright install --with-deps chromium

      - name: Start Application
        run: |
          npm run build
          npm run start &
          npx wait-on http://localhost:3000 --timeout 30000

      - name: Run Accessibility Tests
        run: npx playwright test --project=accessibility
        env:
          BASE_URL: http://localhost:3000

      - name: Upload A11y Reports
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: accessibility-reports
          path: |
            reports/a11y/
            reports/a11y-html/
            reports/screenshots/
            reports/a11y-results.json

      - name: A11y Gate — Fail on Critical/Serious
        if: always()
        run: |
          if [ -f reports/a11y-results.json ]; then
            node -e "
              const fs = require('fs');
              const results = JSON.parse(fs.readFileSync('reports/a11y-results.json', 'utf8'));
              const failed = results.suites
                ? results.suites.flatMap(s => s.specs).filter(s => s.ok === false).length
                : 0;
              if (failed > 0) {
                console.error('::error::' + failed + ' accessibility tests failed');
                process.exit(1);
              }
              console.log('All accessibility tests passed.');
            "
          fi
```

### Integration with Existing Playwright Suites

Add the accessibility project to your existing `playwright.config.ts`:

```typescript
projects: [
  // existing functional tests
  { name: 'e2e-chrome', testMatch: '**/*.e2e.spec.ts', use: devices['Desktop Chrome'] },
  { name: 'e2e-firefox', testMatch: '**/*.e2e.spec.ts', use: devices['Desktop Firefox'] },

  // accessibility tests — run alongside or independently
  { name: 'accessibility', testMatch: '**/*.a11y.spec.ts', use: devices['Desktop Chrome'] },
],
```

Run selectively:

```bash
# Only accessibility tests
npx playwright test --project=accessibility

# Only e2e tests
npx playwright test --project=e2e-chrome

# Everything
npx playwright test
```

---

## 8 Docker Setup

### Dockerfile

```dockerfile
FROM mcr.microsoft.com/playwright:v1.48.0-noble

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

CMD ["npx", "playwright", "test", "--project=accessibility"]
```

### docker-compose.yml

```yaml
version: '3.8'

services:
  target-app:
    image: ${TARGET_IMAGE:-your-app:latest}
    ports:
      - '3000:3000'
    healthcheck:
      test: ['CMD', 'curl', '-f', 'http://localhost:3000/health']
      interval: 5s
      timeout: 3s
      retries: 10

  a11y-tests:
    build: .
    environment:
      BASE_URL: http://target-app:3000
    volumes:
      - ./reports:/app/reports
    depends_on:
      target-app:
        condition: service_healthy
    command: npx playwright test --project=accessibility
```

### Run

```bash
docker compose up --build --abort-on-container-exit a11y-tests

# View reports
open reports/a11y-html/index.html
```

---

## 9 Quality Checklist

### Framework Completeness

- [ ] AxeBuilder factory centralises WCAG 2.1 AA tag configuration
- [ ] Per-page scans cover every route in the application
- [ ] Component-level scans target forms, modals, navigation, tables
- [ ] Interaction-based scans run after state changes (modal open, accordion expand)
- [ ] `include()` and `exclude()` used to scope scans appropriately
- [ ] Severity filtering separates blocking (critical/serious) from advisory (moderate/minor)
- [ ] Screenshots captured automatically when violations are detected

### Production Readiness

- [ ] GitHub Actions runs a11y tests on every PR
- [ ] CI gate fails on critical/serious violations (blocks merge)
- [ ] Moderate/minor violations logged as warnings (non-blocking)
- [ ] HTML reports uploaded as build artifacts with element-level detail
- [ ] Remediation hints included in reports for developer self-service
- [ ] Tests run in both desktop and mobile viewports
- [ ] Accessibility project coexists with functional e2e project in same config

### Accessibility Engineering Best Practices

- [ ] WCAG 2.1 AA is the minimum conformance target
- [ ] Color contrast ratio validated (4.5:1 normal text, 3:1 large text)
- [ ] Keyboard navigation tested for all interactive elements
- [ ] Focus indicators verified as visible on tab
- [ ] ARIA attributes validated (roles, states, properties)
- [ ] iframes scanned when same-origin; cross-origin handled separately
- [ ] Custom rule disabling documented with justification
- [ ] Automated checks complemented with manual testing for subjective criteria
