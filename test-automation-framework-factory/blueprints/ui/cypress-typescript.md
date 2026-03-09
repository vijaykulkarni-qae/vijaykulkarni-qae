# Blueprint: Cypress + TypeScript — UI/E2E Testing

> **Tool**: Cypress | **Language**: TypeScript | **Domain**: UI/E2E Testing
> **Version**: Cypress 13+ | Node 20+ | TypeScript 5.3+
> **Last Updated**: 2026-03-09

---

## 1. Overview

This blueprint produces a production-ready UI/E2E test automation framework using Cypress with TypeScript. Cypress runs tests inside the browser, providing native access to the DOM, network layer, and application state. The architecture uses custom commands for reusability, `cy.session()` for auth state caching, and `cy.intercept()` for network control.

### Target Use Cases

- E2E regression testing for web applications (Chromium-family and Firefox)
- Component testing with `cy.mount()`
- Network stubbing and assertion with `cy.intercept()`
- Time-travel debugging with DOM snapshots
- API-driven test setup via `cy.request()`

### Key Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Test runner | Cypress native (`cypress run`) | Integrated runner with time-travel, automatic waiting, built-in retries |
| Auth caching | `cy.session()` | Caches auth state across specs; avoids re-login per test |
| Locator strategy | `data-cy` attributes | Cypress convention; decoupled from styling; `cy.get('[data-cy=...]')` |
| Network control | `cy.intercept()` | Native request interception; stub, spy, or modify in-flight |
| Reporting | `cypress-mochawesome-reporter` | Rich HTML reports with screenshots; merges spec results |
| Parallel execution | Cypress Cloud or sorry-cypress | Spec-level parallelism across CI machines; load balancing |
| TypeScript | `@cypress/webpack-preprocessor` or native (Cypress 13+) | Type-safe commands, page objects, and test code |

---

## 2. Prerequisites

### System Requirements

| Requirement | Version | Notes |
|-------------|---------|-------|
| Node.js | 20 LTS+ | Cypress requires Node 18+ |
| npm / yarn | Latest | npm or yarn for dependency management |
| TypeScript | 5.3+ | Via `tsconfig.json` in cypress/ |
| Cypress | 13+ | Native TypeScript support (no preprocessor needed) |
| Chrome / Edge / Firefox | Latest | At least one browser for local execution |

### Installation

```bash
npm init -y
npm install -D cypress typescript @types/node
npm install -D cypress-mochawesome-reporter mochawesome-merge
npm install -D @faker-js/faker
npx cypress open   # First-time scaffold
```

---

## 3. Architecture

### Folder Structure

```
project-root/
├── cypress.config.ts                  # Central configuration
├── tsconfig.json                      # Root TS config
├── package.json
├── .env.local
├── .env.staging
├── .env.production
│
├── cypress/
│   ├── tsconfig.json                  # Cypress-specific TS config
│   │
│   ├── e2e/
│   │   ├── auth/
│   │   │   ├── login.cy.ts
│   │   │   └── logout.cy.ts
│   │   ├── dashboard/
│   │   │   └── dashboard.cy.ts
│   │   ├── settings/
│   │   │   └── settings.cy.ts
│   │   └── smoke/
│   │       └── health-check.cy.ts
│   │
│   ├── support/
│   │   ├── commands.ts                # Custom Cypress commands
│   │   ├── e2e.ts                     # Support file loaded before each spec
│   │   ├── auth.commands.ts           # Auth-specific commands
│   │   ├── api.commands.ts            # API helper commands
│   │   └── types.d.ts                 # Type augmentation for custom commands
│   │
│   ├── pages/
│   │   ├── base.page.ts
│   │   ├── login.page.ts
│   │   ├── dashboard.page.ts
│   │   └── settings.page.ts
│   │
│   ├── fixtures/
│   │   ├── users.json                 # Static test data
│   │   ├── products.json
│   │   └── api-responses/
│   │       ├── user-list.json
│   │       └── error-response.json
│   │
│   ├── factories/
│   │   ├── user.factory.ts
│   │   └── product.factory.ts
│   │
│   ├── utils/
│   │   ├── env.ts                     # Environment config loader
│   │   ├── selectors.ts               # Centralized selector map
│   │   └── helpers.ts                 # Reusable test helpers
│   │
│   ├── downloads/                     # Downloaded files during tests
│   ├── screenshots/                   # Auto-captured on failure
│   └── videos/                        # Recorded per spec
│
├── reports/
│   └── mochawesome/                   # Generated HTML reports
│
├── .github/
│   └── workflows/
│       └── cypress.yml
│
└── docker/
    ├── Dockerfile
    └── docker-compose.yml
```

### Dependency Graph

```
cypress.config.ts
    └── cypress/support/e2e.ts (loaded before each spec)
            ├── commands.ts → auth.commands.ts, api.commands.ts
            └── imports error handlers, global hooks

cypress/e2e/**/*.cy.ts
    ├── import pages/* (page objects)
    ├── import factories/* (test data)
    └── use custom commands via cy.*
```

---

## 4. Core Patterns

### 4.1 Custom Commands

```typescript
// cypress/support/commands.ts
Cypress.Commands.add('getByCy', (selector: string) => {
  return cy.get(`[data-cy="${selector}"]`);
});

Cypress.Commands.add('shouldBeVisible', { prevSubject: 'element' }, (subject) => {
  cy.wrap(subject).should('be.visible');
});

Cypress.Commands.add('fillForm', (formData: Record<string, string>) => {
  Object.entries(formData).forEach(([field, value]) => {
    cy.getByCy(field).clear().type(value);
  });
});
```

### 4.2 Type Augmentation for Commands

```typescript
// cypress/support/types.d.ts
declare namespace Cypress {
  interface Chainable {
    getByCy(selector: string): Chainable<JQuery<HTMLElement>>;
    shouldBeVisible(): Chainable<JQuery<HTMLElement>>;
    fillForm(formData: Record<string, string>): Chainable<void>;
    login(email: string, password: string): Chainable<void>;
    apiLogin(email: string, password: string): Chainable<void>;
    createUserViaAPI(userData: Record<string, unknown>): Chainable<string>;
  }
}
```

### 4.3 Auth with cy.session()

```typescript
// cypress/support/auth.commands.ts
Cypress.Commands.add('login', (email: string, password: string) => {
  cy.session(
    [email, password],
    () => {
      cy.visit('/login');
      cy.getByCy('email-input').type(email);
      cy.getByCy('password-input').type(password);
      cy.getByCy('login-button').click();
      cy.url().should('include', '/dashboard');
    },
    {
      validate() {
        cy.getCookie('session_token').should('exist');
      },
    }
  );
});

Cypress.Commands.add('apiLogin', (email: string, password: string) => {
  cy.session(
    ['api', email, password],
    () => {
      cy.request('POST', '/api/auth/login', { email, password }).then((resp) => {
        window.localStorage.setItem('auth_token', resp.body.token);
      });
    },
    {
      validate() {
        cy.window().its('localStorage.auth_token').should('exist');
      },
    }
  );
});
```

### 4.4 Page Object Pattern (Cypress Adaptation)

Cypress page objects return `cy` chains rather than `Promise<void>` — they work with Cypress's command queue.

```typescript
// cypress/pages/base.page.ts
export abstract class BasePage {
  abstract readonly url: string;

  visit(): void {
    cy.visit(this.url);
  }

  protected getByCy(selector: string): Cypress.Chainable<JQuery<HTMLElement>> {
    return cy.get(`[data-cy="${selector}"]`);
  }

  protected getByRole(role: string, name: string): Cypress.Chainable<JQuery<HTMLElement>> {
    return cy.contains(`[role="${role}"]`, name);
  }
}
```

```typescript
// cypress/pages/login.page.ts
import { BasePage } from './base.page';

export class LoginPage extends BasePage {
  readonly url = '/login';

  typeEmail(email: string): this {
    this.getByCy('email-input').clear().type(email);
    return this;
  }

  typePassword(password: string): this {
    this.getByCy('password-input').clear().type(password);
    return this;
  }

  submit(): void {
    this.getByCy('login-button').click();
  }

  login(email: string, password: string): void {
    this.typeEmail(email).typePassword(password);
    this.submit();
  }

  assertErrorMessage(message: string): void {
    this.getByCy('login-error').should('have.text', message);
  }

  assertOnDashboard(): void {
    cy.url().should('include', '/dashboard');
  }
}
```

### 4.5 cy.intercept() for Network Control

```typescript
// Stub a response
cy.intercept('GET', '/api/users*', { fixture: 'api-responses/user-list.json' }).as('getUsers');

// Spy on a request (no modification)
cy.intercept('POST', '/api/orders').as('createOrder');
cy.getByCy('submit-order').click();
cy.wait('@createOrder').its('response.statusCode').should('eq', 201);

// Modify response on the fly
cy.intercept('GET', '/api/products', (req) => {
  req.reply((res) => {
    res.body.products = res.body.products.slice(0, 5);
    res.send();
  });
});

// Simulate error
cy.intercept('GET', '/api/dashboard', { statusCode: 500, body: { error: 'Server Error' } });
```

### 4.6 Test Structure

```typescript
// cypress/e2e/auth/login.cy.ts
import { LoginPage } from '../../pages/login.page';
import { createUser } from '../../factories/user.factory';

describe('Login', () => {
  const loginPage = new LoginPage();

  beforeEach(() => {
    loginPage.visit();
  });

  it('should login with valid credentials', () => {
    loginPage.login(Cypress.env('TEST_USER_EMAIL'), Cypress.env('TEST_USER_PASSWORD'));
    loginPage.assertOnDashboard();
  });

  it('should show error for invalid credentials', () => {
    loginPage.login('bad@example.com', 'wrong');
    loginPage.assertErrorMessage('Invalid email or password');
  });

  it('should validate required fields', () => {
    loginPage.submit();
    cy.getByCy('email-error').should('be.visible');
    cy.getByCy('password-error').should('be.visible');
  });

  it('should persist session with cy.session()', () => {
    cy.login(Cypress.env('TEST_USER_EMAIL'), Cypress.env('TEST_USER_PASSWORD'));
    cy.visit('/dashboard');
    cy.url().should('include', '/dashboard');
  });
});
```

---

## 5. Configuration

### cypress.config.ts

```typescript
import { defineConfig } from 'cypress';
import dotenv from 'dotenv';
import path from 'path';

const ENV = process.env.TEST_ENV || 'local';
dotenv.config({ path: path.resolve(`.env.${ENV}`) });

export default defineConfig({
  e2e: {
    baseUrl: process.env.BASE_URL || 'http://localhost:3000',
    specPattern: 'cypress/e2e/**/*.cy.ts',
    supportFile: 'cypress/support/e2e.ts',
    viewportWidth: 1280,
    viewportHeight: 720,
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 15000,
    video: true,
    screenshotOnRunFailure: true,
    retries: {
      runMode: 2,
      openMode: 0,
    },
    experimentalRunAllSpecs: true,
    setupNodeEvents(on, config) {
      require('cypress-mochawesome-reporter/plugin')(on);

      config.env = {
        ...config.env,
        TEST_USER_EMAIL: process.env.TEST_USER_EMAIL,
        TEST_USER_PASSWORD: process.env.TEST_USER_PASSWORD,
        API_URL: process.env.API_URL,
      };
      return config;
    },
  },
  env: {
    TEST_ENV: ENV,
  },
});
```

### cypress/tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "types": ["cypress", "node"],
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "baseUrl": ".",
    "paths": {
      "@pages/*": ["pages/*"],
      "@factories/*": ["factories/*"],
      "@utils/*": ["utils/*"]
    }
  },
  "include": ["**/*.ts"]
}
```

---

## 6. Test Data Management

### Fixture Files (Static)

```json
// cypress/fixtures/users.json
{
  "validUser": {
    "email": "testuser@example.com",
    "password": "Test@12345"
  },
  "adminUser": {
    "email": "admin@example.com",
    "password": "Admin@12345",
    "role": "admin"
  }
}
```

### Factory Pattern (Dynamic)

```typescript
// cypress/factories/user.factory.ts
import { faker } from '@faker-js/faker';

export interface User {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  role: string;
}

export function createUser(overrides: Partial<User> = {}): User {
  return {
    email: faker.internet.email(),
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    password: `Test@${faker.string.alphanumeric(8)}`,
    role: 'user',
    ...overrides,
  };
}
```

### API-Based Setup

```typescript
// cypress/support/api.commands.ts
Cypress.Commands.add('createUserViaAPI', (userData: Record<string, unknown>) => {
  return cy.request({
    method: 'POST',
    url: `${Cypress.env('API_URL')}/users`,
    body: userData,
    headers: {
      Authorization: `Bearer ${Cypress.env('ADMIN_TOKEN')}`,
    },
  }).then((response) => response.body.id);
});
```

---

## 7. Reporting

### Mochawesome Setup

```typescript
// In cypress.config.ts setupNodeEvents:
require('cypress-mochawesome-reporter/plugin')(on);

// In cypress/support/e2e.ts:
import 'cypress-mochawesome-reporter/register';
```

### Reporter Configuration

```json
// In package.json or reporterOptions in config:
{
  "reporter": "cypress-mochawesome-reporter",
  "reporterOptions": {
    "reportDir": "reports/mochawesome",
    "charts": true,
    "reportPageTitle": "E2E Test Results",
    "embeddedScreenshots": true,
    "inlineAssets": true,
    "overwrite": false,
    "html": true,
    "json": true
  }
}
```

### Failure Artifacts

- **Screenshots**: Automatically captured on failure; embedded in Mochawesome HTML
- **Videos**: Recorded per spec file; stored in `cypress/videos/`
- **Cypress Cloud**: Dashboard shows test replay, error screenshots, and grouping

---

## 8. Parallel Execution

### Cypress Cloud (Managed)

```bash
# Record key in CI env vars
npx cypress run --record --key $CYPRESS_RECORD_KEY --parallel --ci-build-id $BUILD_ID
```

Cypress Cloud handles spec distribution, load balancing, and result aggregation.

### sorry-cypress (Self-Hosted Alternative)

```yaml
# docker-compose.sorry-cypress.yml
version: '3.8'
services:
  director:
    image: agoldis/sorry-cypress-director
    ports: ['1234:1234']
    environment:
      DASHBOARD_URL: http://dashboard:8080

  api:
    image: agoldis/sorry-cypress-api
    ports: ['4000:4000']

  dashboard:
    image: agoldis/sorry-cypress-dashboard
    ports: ['8080:8080']
```

```bash
# Point Cypress to sorry-cypress director
CYPRESS_API_URL=http://localhost:1234 npx cypress run --record --parallel --ci-build-id $BUILD_ID
```

### Spec-Level Parallelism

Cypress parallelizes at the spec file level — each CI machine picks the next available spec. Group related tests into spec files of similar duration for balanced distribution.

---

## 9. CI/CD Integration

### GitHub Actions Workflow

```yaml
# .github/workflows/cypress.yml
name: Cypress Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  CI: true
  TEST_ENV: staging

jobs:
  cypress:
    runs-on: ubuntu-latest
    strategy:
      fail-fast: false
      matrix:
        containers: [1, 2, 3, 4]
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - run: npm ci

      - name: Run Cypress tests
        uses: cypress-io/github-action@v6
        with:
          start: npm run start:ci
          wait-on: 'http://localhost:3000'
          wait-on-timeout: 120
          record: true
          parallel: true
          group: 'E2E - Chrome'
          browser: chrome
        env:
          CYPRESS_RECORD_KEY: ${{ secrets.CYPRESS_RECORD_KEY }}
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          CYPRESS_TEST_USER_EMAIL: ${{ secrets.TEST_USER_EMAIL }}
          CYPRESS_TEST_USER_PASSWORD: ${{ secrets.TEST_USER_PASSWORD }}

      - name: Upload screenshots
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: cypress-screenshots-${{ matrix.containers }}
          path: cypress/screenshots

      - name: Upload videos
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: cypress-videos-${{ matrix.containers }}
          path: cypress/videos

      - name: Upload Mochawesome report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: mochawesome-report-${{ matrix.containers }}
          path: reports/mochawesome

  merge-reports:
    needs: cypress
    if: always()
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/download-artifact@v4
        with:
          pattern: mochawesome-report-*
          merge-multiple: true
          path: all-reports

      - run: npm ci
      - run: npx mochawesome-merge all-reports/*.json > merged-report.json
      - run: npx marge merged-report.json --reportDir final-report
      - uses: actions/upload-artifact@v4
        with:
          name: merged-test-report
          path: final-report
```

---

## 10. Docker Setup

### Dockerfile

```dockerfile
FROM cypress/included:13.6.0

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ENTRYPOINT ["npx", "cypress", "run"]
```

### docker-compose.yml

```yaml
version: '3.8'

services:
  cypress:
    build:
      context: .
      dockerfile: docker/Dockerfile
    environment:
      - CYPRESS_baseUrl=http://app:3000
      - TEST_ENV=staging
    volumes:
      - ./cypress/screenshots:/app/cypress/screenshots
      - ./cypress/videos:/app/cypress/videos
      - ./reports:/app/reports
    depends_on:
      app:
        condition: service_healthy
    networks:
      - test-network

  app:
    image: your-app:latest
    ports:
      - '3000:3000'
    healthcheck:
      test: ['CMD', 'curl', '-f', 'http://localhost:3000/health']
      interval: 5s
      timeout: 3s
      retries: 10
    networks:
      - test-network

networks:
  test-network:
    driver: bridge
```

### Running in Docker

```bash
# Full suite
docker compose -f docker/docker-compose.yml up --build --exit-code-from cypress

# Specific spec
docker compose -f docker/docker-compose.yml run cypress --spec "cypress/e2e/auth/**"

# With browser selection
docker compose -f docker/docker-compose.yml run cypress --browser firefox
```

---

## 11. Quality Checklist

### Structure

- [ ] Folder structure matches the architecture section
- [ ] `cypress.config.ts` compiles and Cypress opens without errors
- [ ] TypeScript strict mode enabled in `cypress/tsconfig.json`
- [ ] Custom command types declared in `types.d.ts`
- [ ] No `any` types in page objects or commands

### Core

- [ ] `BasePage` class with common actions
- [ ] At least 3 page objects demonstrating the pattern
- [ ] Custom commands registered and typed (`getByCy`, `login`, `fillForm`)
- [ ] `cy.session()` used for auth caching
- [ ] `data-cy` attributes used as primary selector strategy

### Configuration

- [ ] `cypress.config.ts` has environment-based `baseUrl`
- [ ] Retries configured (2 in run mode, 0 in open mode)
- [ ] Timeouts set (command, request, response)
- [ ] Video recording enabled
- [ ] Screenshot on failure enabled

### Testing

- [ ] At least 5 E2E test specs with `describe` / `it` pattern
- [ ] At least 1 test demonstrating `cy.intercept()` stubbing
- [ ] At least 1 test demonstrating `cy.intercept()` spying (`.wait()` + assertion)
- [ ] Tests use factories or fixtures for test data
- [ ] Tests are independent — no ordering dependencies

### Network

- [ ] `cy.intercept()` demonstrated for stubbing responses
- [ ] `cy.intercept()` demonstrated for spying on requests
- [ ] `cy.request()` used for API-based test setup

### Infrastructure

- [ ] `cypress-mochawesome-reporter` configured and generating HTML reports
- [ ] GitHub Actions workflow with parallel strategy (4 containers)
- [ ] Dockerfile using `cypress/included` image
- [ ] `docker-compose.yml` for local containerized execution
- [ ] CI uploads screenshots, videos, and reports as artifacts

### Parallel Execution

- [ ] Parallel execution configured (Cypress Cloud or sorry-cypress)
- [ ] CI matrix strategy with multiple containers
- [ ] Spec files balanced by approximate duration
- [ ] Report merging configured for multi-container runs

---

**Blueprint Owner**: UI Automation Builder
**Consumers**: Quality Gate Agent (validation), Infrastructure Agent (CI/CD/Docker), Documentation Agent (README)
