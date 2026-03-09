# Blueprint: Playwright + TypeScript — UI/E2E Testing

> **Tool**: Playwright | **Language**: TypeScript | **Domain**: UI/E2E Testing
> **Version**: Playwright 1.49+ | Node 20+ | TypeScript 5.3+
> **Last Updated**: 2026-03-09

---

## 1. Overview

This blueprint produces a production-ready UI/E2E test automation framework using Playwright's native `@playwright/test` runner with TypeScript. The architecture is fixture-based — every shared concern (auth, page objects, test data, API context) is injected through Playwright's fixture system rather than through inheritance or global state.

### Target Use Cases

- Cross-browser E2E regression suites (Chromium, Firefox, WebKit)
- Visual regression testing with `toHaveScreenshot()`
- API hybrid testing (UI + API setup/teardown via `request` fixture)
- Component-level interaction testing
- Accessibility auditing alongside functional tests

### Key Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Test runner | `@playwright/test` (native) | Built-in parallelism, fixtures, assertions, tracing — no need for Jest/Mocha |
| Page object injection | Fixtures, not constructors | Eliminates manual wiring; fixtures compose naturally and support scoping |
| Locator strategy | `data-testid` preferred | Decoupled from CSS/text; survives refactors; Playwright has `getByTestId()` |
| Assertion library | `@playwright/test` built-in `expect` | Auto-retrying assertions (`toBeVisible`, `toHaveText`) eliminate explicit waits |
| API mocking | `page.route()` | In-process interception; no external proxy; per-test isolation |
| Visual testing | `toHaveScreenshot()` | Built-in pixel comparison with threshold; golden images in VCS |

---

## 2. Prerequisites

### System Requirements

| Requirement | Version | Notes |
|-------------|---------|-------|
| Node.js | 20 LTS+ | Required for ESM support and Playwright compatibility |
| npm / pnpm | Latest | pnpm preferred for speed and disk efficiency |
| TypeScript | 5.3+ | Satisfies `@playwright/test` type requirements |
| Playwright | 1.49+ | Install browsers via `npx playwright install --with-deps` |
| Git | 2.40+ | For VCS of golden screenshots |

### Installation

```bash
npm init -y
npm install -D @playwright/test typescript @types/node
npm install -D allure-playwright allure-commandline
npx playwright install --with-deps chromium firefox webkit
npx tsc --init
```

---

## 3. Architecture

### Folder Structure

```
project-root/
├── playwright.config.ts              # Central configuration
├── tsconfig.json
├── package.json
├── .env.local                        # Local overrides (gitignored)
├── .env.staging
├── .env.production
│
├── src/
│   ├── fixtures/
│   │   ├── base.fixture.ts           # Extends test with custom fixtures
│   │   ├── auth.fixture.ts           # Authenticated page/context fixtures
│   │   └── index.ts                  # Merged fixture export
│   │
│   ├── pages/
│   │   ├── base.page.ts              # Abstract base with common actions
│   │   ├── login.page.ts
│   │   ├── dashboard.page.ts
│   │   ├── settings.page.ts
│   │   └── components/
│   │       ├── navbar.component.ts
│   │       ├── modal.component.ts
│   │       └── table.component.ts
│   │
│   ├── api/
│   │   ├── api-client.ts             # APIRequestContext wrapper
│   │   └── endpoints/
│   │       ├── users.api.ts
│   │       └── auth.api.ts
│   │
│   ├── data/
│   │   ├── factories/
│   │   │   ├── user.factory.ts
│   │   │   └── product.factory.ts
│   │   ├── fixtures/                  # Static test data JSON
│   │   │   └── users.json
│   │   └── types.ts                  # Shared data interfaces
│   │
│   ├── utils/
│   │   ├── env.ts                    # Environment config loader
│   │   ├── logger.ts                 # Structured logging
│   │   ├── retry.ts                  # Custom retry helpers
│   │   └── waits.ts                  # Polling/condition utilities
│   │
│   └── mocks/
│       ├── handlers.ts               # Route handler definitions
│       └── responses/
│           └── user-list.json
│
├── tests/
│   ├── e2e/
│   │   ├── auth/
│   │   │   ├── login.spec.ts
│   │   │   └── logout.spec.ts
│   │   ├── dashboard/
│   │   │   └── dashboard.spec.ts
│   │   └── settings/
│   │       └── settings.spec.ts
│   ├── visual/
│   │   └── screenshots.spec.ts
│   └── smoke/
│       └── health-check.spec.ts
│
├── .github/
│   └── workflows/
│       └── playwright.yml
│
├── docker/
│   ├── Dockerfile
│   └── docker-compose.yml
│
└── test-results/                     # Gitignored — artifacts
    ├── screenshots/
    ├── videos/
    ├── traces/
    └── allure-results/
```

### Dependency Graph

```
playwright.config.ts
    └── src/fixtures/index.ts (merged test export)
            ├── base.fixture.ts → pages/*, utils/*
            └── auth.fixture.ts → api/auth.api.ts, data/factories/*

tests/**/*.spec.ts
    └── import { test, expect } from src/fixtures/index.ts
```

---

## 4. Core Patterns

### 4.1 Fixture-Based Architecture

Every shared concern is a Playwright fixture. Tests declare what they need; the framework provides it.

```typescript
// src/fixtures/base.fixture.ts
import { test as base, Page } from '@playwright/test';
import { DashboardPage } from '../pages/dashboard.page';
import { LoginPage } from '../pages/login.page';
import { ApiClient } from '../api/api-client';

type CustomFixtures = {
  loginPage: LoginPage;
  dashboardPage: DashboardPage;
  apiClient: ApiClient;
};

export const test = base.extend<CustomFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  dashboardPage: async ({ page }, use) => {
    await use(new DashboardPage(page));
  },
  apiClient: async ({ request }, use) => {
    await use(new ApiClient(request));
  },
});
```

### 4.2 Auth Fixture with storageState

```typescript
// src/fixtures/auth.fixture.ts
import { test as base } from './base.fixture';
import path from 'path';

const STORAGE_STATE = path.resolve('.auth/user.json');

export const test = base.extend({
  storageState: STORAGE_STATE,
});

// Global setup to create auth state once
// global-setup.ts
async function globalSetup() {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto(process.env.BASE_URL + '/login');
  await page.getByTestId('email-input').fill(process.env.TEST_USER_EMAIL!);
  await page.getByTestId('password-input').fill(process.env.TEST_USER_PASSWORD!);
  await page.getByTestId('login-button').click();
  await page.waitForURL('**/dashboard');
  await context.storageState({ path: STORAGE_STATE });
  await browser.close();
}
```

### 4.3 Page Object Model

```typescript
// src/pages/base.page.ts
import { Page, Locator, expect } from '@playwright/test';

export abstract class BasePage {
  constructor(protected readonly page: Page) {}

  abstract readonly url: string;

  async navigate(): Promise<void> {
    await this.page.goto(this.url);
  }

  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
  }

  protected getByTestId(testId: string): Locator {
    return this.page.getByTestId(testId);
  }

  protected async clickAndWaitForNavigation(locator: Locator): Promise<void> {
    await Promise.all([
      this.page.waitForURL('**'),
      locator.click(),
    ]);
  }
}
```

```typescript
// src/pages/login.page.ts
import { expect } from '@playwright/test';
import { BasePage } from './base.page';

export class LoginPage extends BasePage {
  readonly url = '/login';

  private readonly emailInput = this.getByTestId('email-input');
  private readonly passwordInput = this.getByTestId('password-input');
  private readonly submitButton = this.getByTestId('login-button');
  private readonly errorMessage = this.getByTestId('login-error');

  async login(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  async expectErrorMessage(message: string): Promise<void> {
    await expect(this.errorMessage).toHaveText(message);
  }
}
```

### 4.4 test.describe / test Pattern

```typescript
// tests/e2e/auth/login.spec.ts
import { test, expect } from '../../../src/fixtures';

test.describe('Login', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.navigate();
  });

  test('successful login redirects to dashboard', async ({ loginPage, page }) => {
    await loginPage.login('user@example.com', 'password123');
    await expect(page).toHaveURL(/.*dashboard/);
  });

  test('invalid credentials show error', async ({ loginPage }) => {
    await loginPage.login('bad@example.com', 'wrong');
    await loginPage.expectErrorMessage('Invalid email or password');
  });

  test('empty form shows validation errors', async ({ loginPage, page }) => {
    await page.getByTestId('login-button').click();
    await expect(page.getByTestId('email-error')).toBeVisible();
  });
});
```

### 4.5 API Mocking with page.route()

```typescript
// src/mocks/handlers.ts
import { Page } from '@playwright/test';
import userList from './responses/user-list.json';

export async function mockUserListAPI(page: Page): Promise<void> {
  await page.route('**/api/users*', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(userList),
    });
  });
}

export async function mockAPIError(page: Page, url: string, status: number): Promise<void> {
  await page.route(url, (route) => {
    route.fulfill({
      status,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'Mocked error', code: status }),
    });
  });
}
```

### 4.6 Visual Comparison

```typescript
// tests/visual/screenshots.spec.ts
import { test, expect } from '../../src/fixtures';

test.describe('Visual Regression', () => {
  test('dashboard matches golden screenshot', async ({ dashboardPage, page }) => {
    await dashboardPage.navigate();
    await expect(page).toHaveScreenshot('dashboard.png', {
      maxDiffPixelRatio: 0.01,
      animations: 'disabled',
    });
  });

  test('login page responsive layout', async ({ loginPage, page }) => {
    await loginPage.navigate();
    await page.setViewportSize({ width: 375, height: 812 });
    await expect(page).toHaveScreenshot('login-mobile.png');
  });
});
```

---

## 5. Configuration

### playwright.config.ts

```typescript
import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

const ENV = process.env.TEST_ENV || 'local';
dotenv.config({ path: path.resolve(`.env.${ENV}`) });

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  expect: { timeout: 5_000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? '50%' : undefined,
  reporter: [
    ['html', { open: 'never' }],
    ['allure-playwright'],
    ['json', { outputFile: 'test-results/results.json' }],
  ],
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10_000,
    navigationTimeout: 15_000,
  },
  projects: [
    {
      name: 'setup',
      testMatch: /global-setup\.ts/,
      teardown: 'teardown',
    },
    {
      name: 'teardown',
      testMatch: /global-teardown\.ts/,
    },
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], storageState: '.auth/user.json' },
      dependencies: ['setup'],
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'], storageState: '.auth/user.json' },
      dependencies: ['setup'],
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'], storageState: '.auth/user.json' },
      dependencies: ['setup'],
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'], storageState: '.auth/user.json' },
      dependencies: ['setup'],
    },
  ],
});
```

### Environment Config

```typescript
// src/utils/env.ts
import dotenv from 'dotenv';
import path from 'path';

export interface EnvConfig {
  baseUrl: string;
  apiUrl: string;
  testUserEmail: string;
  testUserPassword: string;
  timeout: number;
}

export function loadEnv(env?: string): EnvConfig {
  const target = env || process.env.TEST_ENV || 'local';
  dotenv.config({ path: path.resolve(`.env.${target}`) });

  return {
    baseUrl: process.env.BASE_URL || 'http://localhost:3000',
    apiUrl: process.env.API_URL || 'http://localhost:3000/api',
    testUserEmail: process.env.TEST_USER_EMAIL || 'test@example.com',
    testUserPassword: process.env.TEST_USER_PASSWORD || 'password',
    timeout: Number(process.env.TIMEOUT) || 30000,
  };
}
```

---

## 6. Test Data Management

### Factory Pattern

```typescript
// src/data/factories/user.factory.ts
import { faker } from '@faker-js/faker';
import { User } from '../types';

export function createUser(overrides: Partial<User> = {}): User {
  return {
    email: faker.internet.email(),
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    password: faker.internet.password({ length: 12, memorable: false }),
    role: 'user',
    ...overrides,
  };
}

export function createAdminUser(overrides: Partial<User> = {}): User {
  return createUser({ role: 'admin', ...overrides });
}
```

### API-Based Setup/Teardown

```typescript
// src/api/api-client.ts
import { APIRequestContext } from '@playwright/test';

export class ApiClient {
  constructor(private readonly request: APIRequestContext) {}

  async createUser(data: Record<string, unknown>): Promise<string> {
    const response = await this.request.post('/api/users', { data });
    const body = await response.json();
    return body.id;
  }

  async deleteUser(userId: string): Promise<void> {
    await this.request.delete(`/api/users/${userId}`);
  }
}
```

Tests use API to set up preconditions instead of navigating through the UI — faster and more stable.

---

## 7. Reporting

### Allure Integration

```bash
# Install
npm install -D allure-playwright allure-commandline

# Generate report after run
npx allure generate test-results/allure-results --clean -o test-results/allure-report
npx allure open test-results/allure-report
```

### Custom Allure Annotations

```typescript
import { test } from '../../src/fixtures';
import { allure } from 'allure-playwright';

test('checkout flow', async ({ page }) => {
  await allure.suite('E-Commerce');
  await allure.severity('critical');
  await allure.feature('Checkout');
  await allure.story('Complete purchase');
  // ... test steps
});
```

### Failure Artifacts

Configured in `playwright.config.ts`:
- **Screenshots**: Captured on failure automatically — attached to HTML report
- **Videos**: Retained on failure — useful for debugging intermittent issues
- **Traces**: Captured on first retry — Playwright Trace Viewer shows DOM snapshots, network calls, console logs

---

## 8. Parallel Execution

### Local Parallelism

```typescript
// playwright.config.ts
{
  fullyParallel: true,       // Run tests within a file in parallel
  workers: undefined,         // Defaults to half of CPU cores
}
```

### CI Sharding

Split the full test suite across N CI jobs for faster pipelines:

```bash
# Job 1 of 4
npx playwright test --shard=1/4

# Job 2 of 4
npx playwright test --shard=2/4
```

### Isolation Model

- Each test gets a fresh `BrowserContext` (cookies, localStorage, session are isolated)
- `page` fixture creates a new page per test within that context
- No shared mutable state between tests — tests can run in any order

---

## 9. CI/CD Integration

### GitHub Actions Workflow

```yaml
# .github/workflows/playwright.yml
name: Playwright Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  CI: true
  TEST_ENV: staging

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      fail-fast: false
      matrix:
        shard: [1, 2, 3, 4]
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - run: npm ci

      - run: npx playwright install --with-deps

      - name: Run Playwright tests (shard ${{ matrix.shard }}/4)
        run: npx playwright test --shard=${{ matrix.shard }}/4

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: test-results-${{ matrix.shard }}
          path: |
            test-results/
            playwright-report/
          retention-days: 14

  report:
    needs: test
    if: always()
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Download all shard results
        uses: actions/download-artifact@v4
        with:
          pattern: test-results-*
          merge-multiple: true
          path: all-results

      - name: Generate Allure report
        run: |
          npm install -g allure-commandline
          allure generate all-results/allure-results --clean -o allure-report

      - name: Deploy report to GitHub Pages
        uses: peaceiris/actions-gh-pages@v4
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: allure-report
```

---

## 10. Docker Setup

### Dockerfile

```dockerfile
FROM mcr.microsoft.com/playwright:v1.49.0-noble

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

RUN npx playwright install --with-deps

CMD ["npx", "playwright", "test"]
```

### docker-compose.yml

```yaml
version: '3.8'

services:
  playwright:
    build:
      context: .
      dockerfile: docker/Dockerfile
    environment:
      - CI=true
      - TEST_ENV=staging
      - BASE_URL=http://app:3000
    volumes:
      - ./test-results:/app/test-results
    depends_on:
      - app
    networks:
      - test-network

  app:
    image: your-app:latest
    ports:
      - "3000:3000"
    networks:
      - test-network

networks:
  test-network:
    driver: bridge
```

### Running in Docker

```bash
# Build and run
docker compose -f docker/docker-compose.yml up --build --exit-code-from playwright

# Run with sharding
docker compose -f docker/docker-compose.yml run playwright npx playwright test --shard=1/2
```

---

## 11. Quality Checklist

The generated framework is production-ready when ALL items pass:

### Structure

- [ ] Folder structure matches the architecture section
- [ ] `tsconfig.json` has strict mode enabled
- [ ] All imports use path aliases or relative paths consistently
- [ ] No circular dependencies

### Core

- [ ] `BasePage` abstract class with common actions exists
- [ ] At least 3 page objects demonstrating the pattern
- [ ] Fixtures extend `@playwright/test` correctly with proper typing
- [ ] Auth fixture produces reusable `storageState`
- [ ] `data-testid` locators used as primary strategy

### Configuration

- [ ] `playwright.config.ts` has multi-browser projects (Chromium, Firefox, WebKit)
- [ ] Environment-based config with `.env` files
- [ ] Timeouts configured (global, action, navigation, expect)
- [ ] `forbidOnly` enabled in CI
- [ ] Retries enabled in CI (0 locally)

### Testing

- [ ] At least 5 E2E test specs with `test.describe` / `test` pattern
- [ ] At least 1 visual regression test with `toHaveScreenshot()`
- [ ] At least 1 test demonstrating `page.route()` API mocking
- [ ] Tests use factory-generated data, not hardcoded values
- [ ] Tests are independent — no ordering dependencies

### Reliability

- [ ] Auto-retrying assertions used (`toBeVisible`, `toHaveText`, not manual waits)
- [ ] No hardcoded `page.waitForTimeout()` calls
- [ ] `trace: 'on-first-retry'` configured for debugging failures
- [ ] Screenshots captured on failure
- [ ] Videos retained on failure

### Infrastructure

- [ ] Allure reporting configured and generating reports
- [ ] GitHub Actions workflow with sharding (4 shards)
- [ ] Dockerfile using `mcr.microsoft.com/playwright` image
- [ ] `docker-compose.yml` for local containerized execution
- [ ] CI uploads artifacts (traces, screenshots, videos, reports)

### Parallel Execution

- [ ] `fullyParallel: true` in config
- [ ] Workers configured for CI (`'50%'`)
- [ ] Sharding configured in CI workflow
- [ ] No shared mutable state between tests

---

**Blueprint Owner**: UI Automation Builder
**Consumers**: Quality Gate Agent (validation), Infrastructure Agent (CI/CD/Docker), Documentation Agent (README)
