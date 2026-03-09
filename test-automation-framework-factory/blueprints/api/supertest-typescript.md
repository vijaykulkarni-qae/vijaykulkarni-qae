# Blueprint: SuperTest + TypeScript — API Testing

> **Tool**: SuperTest | **Language**: TypeScript | **Domain**: REST API Testing
> **Runner**: Jest 29+ or Vitest 1+ | **Validation**: Zod | Node 20+
> **Last Updated**: 2026-03-09

---

## 1. Overview

This blueprint produces a production-ready REST API test automation framework using SuperTest with TypeScript. SuperTest wraps an HTTP server (or remote URL) and provides a fluent assertion API. The framework uses Zod for runtime schema validation, a factory pattern for test data, and JWT token management with automatic refresh.

### Target Use Cases

- REST API regression testing (CRUD operations, auth flows, error handling)
- Schema validation (response shape + types enforced at runtime)
- Contract testing (API responses match documented contracts)
- Auth flow testing (login, token refresh, permission checks)
- Performance baseline assertions (response time thresholds)

### Key Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| HTTP client | SuperTest | Fluent API, chainable assertions, supports both live servers and Express app instances |
| Test runner | Jest (default) or Vitest | Jest: mature ecosystem, snapshots, mocking. Vitest: faster, ESM-native, Jest-compatible API |
| Schema validation | Zod | TypeScript-first; infers types from schemas; excellent error messages |
| Auth management | Custom `AuthManager` class | Acquires token once, caches it, refreshes on 401; thread-safe for parallel workers |
| Test data | Factory functions with `@faker-js/faker` | Dynamic, unique data per test run; no stale fixtures |
| Logging | Custom request/response interceptor | Every API call logged with method, URL, status, duration; attached to Allure |
| Config | `dotenv` + typed config object | Environment-specific `.env` files; typed access with defaults |

---

## 2. Prerequisites

### System Requirements

| Requirement | Version | Notes |
|-------------|---------|-------|
| Node.js | 20 LTS+ | ESM support, native fetch (for comparison) |
| npm / pnpm | Latest | pnpm preferred |
| TypeScript | 5.3+ | Strict mode enabled |
| Jest | 29+ | Or Vitest 1+ as alternative runner |
| SuperTest | 6+ | HTTP assertion library |

### Installation

```bash
npm init -y
npm install -D typescript @types/node ts-jest jest @types/jest
npm install -D supertest @types/supertest
npm install -D zod @faker-js/faker dotenv
npm install -D allure-js-commons allure-jest
```

---

## 3. Architecture

### Folder Structure

```
project-root/
├── jest.config.ts                     # Jest configuration
├── tsconfig.json
├── package.json
├── .env.local
├── .env.staging
├── .env.production
│
├── src/
│   ├── client/
│   │   ├── api-client.ts              # SuperTest wrapper with auth + logging
│   │   ├── request-builder.ts         # Fluent request builder
│   │   ├── response-validator.ts      # Status code + schema + timing validation
│   │   └── interceptors/
│   │       ├── logging.interceptor.ts # Request/response logging
│   │       └── retry.interceptor.ts   # Retry on transient failures
│   │
│   ├── auth/
│   │   ├── auth-manager.ts            # Token acquire/cache/refresh
│   │   ├── auth-strategies.ts         # JWT, Basic, API Key strategies
│   │   └── types.ts                   # Auth-related types
│   │
│   ├── schemas/
│   │   ├── user.schema.ts             # Zod schemas for User endpoints
│   │   ├── auth.schema.ts             # Zod schemas for Auth endpoints
│   │   ├── error.schema.ts            # Zod schemas for error responses
│   │   └── common.schema.ts           # Shared schemas (pagination, timestamps)
│   │
│   ├── data/
│   │   ├── factories/
│   │   │   ├── user.factory.ts
│   │   │   ├── product.factory.ts
│   │   │   └── order.factory.ts
│   │   ├── fixtures/
│   │   │   └── static-data.json
│   │   └── types.ts
│   │
│   ├── config/
│   │   ├── env.ts                     # Environment config loader
│   │   └── constants.ts               # API paths, timeouts, retry config
│   │
│   ├── utils/
│   │   ├── logger.ts                  # Structured logger
│   │   ├── allure-helpers.ts          # Allure step/attachment utilities
│   │   ├── assertions.ts             # Custom assertion helpers
│   │   └── cleanup.ts                # Test data cleanup utilities
│   │
│   └── types/
│       ├── api.types.ts               # Request/response type definitions
│       └── global.d.ts                # Jest global type extensions
│
├── tests/
│   ├── setup/
│   │   ├── global-setup.ts            # One-time setup (auth token, seed data)
│   │   ├── global-teardown.ts         # Cleanup seeded data
│   │   └── test-setup.ts              # Per-file setup (jest beforeAll)
│   │
│   ├── auth/
│   │   ├── login.test.ts
│   │   ├── token-refresh.test.ts
│   │   └── permissions.test.ts
│   │
│   ├── users/
│   │   ├── create-user.test.ts
│   │   ├── get-user.test.ts
│   │   ├── update-user.test.ts
│   │   ├── delete-user.test.ts
│   │   └── list-users.test.ts
│   │
│   ├── errors/
│   │   ├── validation-errors.test.ts
│   │   ├── not-found.test.ts
│   │   └── rate-limiting.test.ts
│   │
│   └── schemas/
│       └── contract-validation.test.ts
│
├── .github/
│   └── workflows/
│       └── api-tests.yml
│
├── docker/
│   ├── Dockerfile
│   └── docker-compose.yml
│
└── reports/                           # Gitignored
    └── allure-results/
```

### Dependency Graph

```
tests/**/*.test.ts
├── import { apiClient } from src/client/api-client.ts
│   ├── auth-manager.ts (handles Authorization header)
│   └── logging.interceptor.ts (logs every request/response)
├── import schemas from src/schemas/*.ts (Zod validation)
├── import factories from src/data/factories/*.ts
└── import { env } from src/config/env.ts
```

---

## 4. Core Patterns

### 4.1 API Client (SuperTest Wrapper)

```typescript
// src/client/api-client.ts
import supertest, { SuperTest, Test } from 'supertest';
import { env } from '../config/env';
import { AuthManager } from '../auth/auth-manager';
import { logRequest, logResponse } from './interceptors/logging.interceptor';

export class ApiClient {
  private agent: SuperTest<Test>;
  private authManager: AuthManager;

  constructor(baseUrl?: string) {
    this.agent = supertest(baseUrl || env.apiBaseUrl);
    this.authManager = new AuthManager();
  }

  async get(path: string, options: RequestOptions = {}) {
    const token = options.auth !== false ? await this.authManager.getToken() : undefined;
    const startTime = Date.now();

    logRequest('GET', path);
    const response = await this.agent
      .get(path)
      .set(this.buildHeaders(token, options.headers))
      .query(options.query || {});

    logResponse('GET', path, response.status, Date.now() - startTime);
    return response;
  }

  async post(path: string, body: unknown, options: RequestOptions = {}) {
    const token = options.auth !== false ? await this.authManager.getToken() : undefined;
    const startTime = Date.now();

    logRequest('POST', path, body);
    const response = await this.agent
      .post(path)
      .set(this.buildHeaders(token, options.headers))
      .send(body);

    logResponse('POST', path, response.status, Date.now() - startTime);
    return response;
  }

  async put(path: string, body: unknown, options: RequestOptions = {}) {
    const token = options.auth !== false ? await this.authManager.getToken() : undefined;
    const startTime = Date.now();

    logRequest('PUT', path, body);
    const response = await this.agent
      .put(path)
      .set(this.buildHeaders(token, options.headers))
      .send(body);

    logResponse('PUT', path, response.status, Date.now() - startTime);
    return response;
  }

  async delete(path: string, options: RequestOptions = {}) {
    const token = options.auth !== false ? await this.authManager.getToken() : undefined;
    const startTime = Date.now();

    logRequest('DELETE', path);
    const response = await this.agent
      .delete(path)
      .set(this.buildHeaders(token, options.headers));

    logResponse('DELETE', path, response.status, Date.now() - startTime);
    return response;
  }

  private buildHeaders(token?: string, extra?: Record<string, string>): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return { ...headers, ...extra };
  }
}

interface RequestOptions {
  auth?: boolean;
  headers?: Record<string, string>;
  query?: Record<string, string | number>;
}

export const apiClient = new ApiClient();
```

### 4.2 Auth Manager (Token Acquire/Cache/Refresh)

```typescript
// src/auth/auth-manager.ts
import supertest from 'supertest';
import { env } from '../config/env';

export class AuthManager {
  private token: string | null = null;
  private tokenExpiry: number = 0;
  private refreshPromise: Promise<string> | null = null;

  async getToken(): Promise<string> {
    if (this.token && Date.now() < this.tokenExpiry - 30_000) {
      return this.token;
    }

    if (this.refreshPromise) return this.refreshPromise;

    this.refreshPromise = this.acquireToken();
    try {
      this.token = await this.refreshPromise;
      return this.token;
    } finally {
      this.refreshPromise = null;
    }
  }

  private async acquireToken(): Promise<string> {
    const response = await supertest(env.apiBaseUrl)
      .post('/auth/login')
      .send({ email: env.testUserEmail, password: env.testUserPassword })
      .expect(200);

    this.tokenExpiry = Date.now() + (response.body.expiresIn * 1000);
    return response.body.accessToken;
  }

  invalidate(): void {
    this.token = null;
    this.tokenExpiry = 0;
  }
}
```

### 4.3 Zod Schema Validation

```typescript
// src/schemas/user.schema.ts
import { z } from 'zod';

export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  role: z.enum(['user', 'admin', 'moderator']),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const UserListSchema = z.object({
  data: z.array(UserSchema),
  pagination: z.object({
    page: z.number().int().positive(),
    pageSize: z.number().int().positive(),
    totalCount: z.number().int().nonnegative(),
    totalPages: z.number().int().nonnegative(),
  }),
});

export const CreateUserRequestSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  password: z.string().min(8),
  role: z.enum(['user', 'admin']).optional().default('user'),
});

export type User = z.infer<typeof UserSchema>;
export type CreateUserRequest = z.infer<typeof CreateUserRequestSchema>;
```

```typescript
// src/schemas/error.schema.ts
import { z } from 'zod';

export const ErrorResponseSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.array(z.object({
      field: z.string(),
      message: z.string(),
    })).optional(),
  }),
});

export const ValidationErrorSchema = ErrorResponseSchema.extend({
  error: ErrorResponseSchema.shape.error.extend({
    details: z.array(z.object({
      field: z.string(),
      message: z.string(),
    })).min(1),
  }),
});
```

### 4.4 Request/Response Logging Interceptor

```typescript
// src/client/interceptors/logging.interceptor.ts
import { logger } from '../../utils/logger';

export function logRequest(method: string, path: string, body?: unknown): void {
  logger.info(`→ ${method} ${path}`, {
    method,
    path,
    body: body ? JSON.stringify(body).substring(0, 500) : undefined,
  });
}

export function logResponse(method: string, path: string, status: number, durationMs: number): void {
  const level = status >= 400 ? 'warn' : 'info';
  logger[level](`← ${status} ${method} ${path} (${durationMs}ms)`, {
    method,
    path,
    status,
    durationMs,
  });
}
```

### 4.5 CRUD Test Examples

```typescript
// tests/users/create-user.test.ts
import { apiClient } from '../../src/client/api-client';
import { UserSchema, CreateUserRequestSchema } from '../../src/schemas/user.schema';
import { ErrorResponseSchema, ValidationErrorSchema } from '../../src/schemas/error.schema';
import { createUserPayload } from '../../src/data/factories/user.factory';

describe('POST /api/users', () => {
  let createdUserId: string;

  afterEach(async () => {
    if (createdUserId) {
      await apiClient.delete(`/api/users/${createdUserId}`);
      createdUserId = '';
    }
  });

  it('should create a user with valid data', async () => {
    const payload = createUserPayload();

    const response = await apiClient.post('/api/users', payload);

    expect(response.status).toBe(201);
    const parsed = UserSchema.parse(response.body);
    expect(parsed.email).toBe(payload.email);
    expect(parsed.firstName).toBe(payload.firstName);
    createdUserId = parsed.id;
  });

  it('should return 400 for missing required fields', async () => {
    const response = await apiClient.post('/api/users', { email: 'incomplete@test.com' });

    expect(response.status).toBe(400);
    ValidationErrorSchema.parse(response.body);
    expect(response.body.error.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: 'firstName' }),
        expect.objectContaining({ field: 'lastName' }),
        expect.objectContaining({ field: 'password' }),
      ])
    );
  });

  it('should return 409 for duplicate email', async () => {
    const payload = createUserPayload();
    const first = await apiClient.post('/api/users', payload);
    createdUserId = first.body.id;

    const response = await apiClient.post('/api/users', payload);

    expect(response.status).toBe(409);
    ErrorResponseSchema.parse(response.body);
    expect(response.body.error.code).toBe('DUPLICATE_EMAIL');
  });

  it('should validate email format', async () => {
    const payload = createUserPayload({ email: 'not-an-email' });

    const response = await apiClient.post('/api/users', payload);

    expect(response.status).toBe(400);
    expect(response.body.error.details).toEqual(
      expect.arrayContaining([expect.objectContaining({ field: 'email' })])
    );
  });

  it('should respond within acceptable time', async () => {
    const payload = createUserPayload();
    const start = Date.now();

    const response = await apiClient.post('/api/users', payload);
    const duration = Date.now() - start;

    expect(response.status).toBe(201);
    expect(duration).toBeLessThan(2000);
    createdUserId = response.body.id;
  });
});
```

```typescript
// tests/users/get-user.test.ts
import { apiClient } from '../../src/client/api-client';
import { UserSchema, UserListSchema } from '../../src/schemas/user.schema';

describe('GET /api/users', () => {
  it('should return paginated user list', async () => {
    const response = await apiClient.get('/api/users', {
      query: { page: 1, pageSize: 10 },
    });

    expect(response.status).toBe(200);
    const parsed = UserListSchema.parse(response.body);
    expect(parsed.data.length).toBeLessThanOrEqual(10);
    expect(parsed.pagination.page).toBe(1);
  });

  it('should return 404 for non-existent user', async () => {
    const response = await apiClient.get('/api/users/non-existent-id');

    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe('NOT_FOUND');
  });

  it('should return 401 without auth token', async () => {
    const response = await apiClient.get('/api/users', { auth: false });

    expect(response.status).toBe(401);
  });
});
```

---

## 5. Configuration

### Environment Config

```typescript
// src/config/env.ts
import dotenv from 'dotenv';
import path from 'path';

const envName = process.env.TEST_ENV || 'local';
dotenv.config({ path: path.resolve(`.env.${envName}`) });

export const env = {
  apiBaseUrl: process.env.API_BASE_URL || 'http://localhost:3000',
  testUserEmail: process.env.TEST_USER_EMAIL || 'test@example.com',
  testUserPassword: process.env.TEST_USER_PASSWORD || 'password',
  adminEmail: process.env.ADMIN_EMAIL || 'admin@example.com',
  adminPassword: process.env.ADMIN_PASSWORD || 'admin',
  requestTimeout: Number(process.env.REQUEST_TIMEOUT) || 10000,
  retryCount: Number(process.env.RETRY_COUNT) || 2,
  environment: envName,
} as const;
```

### Jest Configuration

```typescript
// jest.config.ts
import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.ts'],
  globalSetup: '<rootDir>/tests/setup/global-setup.ts',
  globalTeardown: '<rootDir>/tests/setup/global-teardown.ts',
  setupFilesAfterSetup: ['<rootDir>/tests/setup/test-setup.ts'],
  reporters: [
    'default',
    ['allure-jest/reporter', { resultsDir: 'reports/allure-results' }],
  ],
  maxWorkers: process.env.CI ? '50%' : '75%',
  testTimeout: 30000,
  verbose: true,
};

export default config;
```

### Constants

```typescript
// src/config/constants.ts
export const API_PATHS = {
  AUTH: {
    LOGIN: '/auth/login',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
  },
  USERS: {
    BASE: '/api/users',
    BY_ID: (id: string) => `/api/users/${id}`,
  },
  PRODUCTS: {
    BASE: '/api/products',
    BY_ID: (id: string) => `/api/products/${id}`,
  },
} as const;

export const TIMEOUTS = {
  REQUEST: 10_000,
  AUTH_TOKEN_BUFFER: 30_000,
  RETRY_DELAY: 1_000,
} as const;
```

---

## 6. Test Data Management

### Factory Pattern

```typescript
// src/data/factories/user.factory.ts
import { faker } from '@faker-js/faker';
import { CreateUserRequest } from '../../schemas/user.schema';

export function createUserPayload(overrides: Partial<CreateUserRequest> = {}): CreateUserRequest {
  return {
    email: faker.internet.email(),
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    password: `Test@${faker.string.alphanumeric(10)}`,
    role: 'user',
    ...overrides,
  };
}

export function createAdminPayload(overrides: Partial<CreateUserRequest> = {}): CreateUserRequest {
  return createUserPayload({ role: 'admin', ...overrides });
}

export function createBulkUserPayloads(count: number): CreateUserRequest[] {
  return Array.from({ length: count }, () => createUserPayload());
}
```

### Cleanup Utilities

```typescript
// src/utils/cleanup.ts
import { apiClient } from '../client/api-client';
import { logger } from './logger';

const createdResources: Array<{ path: string; id: string }> = [];

export function trackResource(path: string, id: string): void {
  createdResources.push({ path, id });
}

export async function cleanupAll(): Promise<void> {
  for (const resource of createdResources.reverse()) {
    try {
      await apiClient.delete(`${resource.path}/${resource.id}`);
      logger.info(`Cleaned up: ${resource.path}/${resource.id}`);
    } catch (error) {
      logger.warn(`Cleanup failed for ${resource.path}/${resource.id}`, error);
    }
  }
  createdResources.length = 0;
}
```

---

## 7. Reporting

### Allure Integration (Jest)

```bash
npm install -D allure-jest allure-js-commons allure-commandline
```

```typescript
// In jest.config.ts:
reporters: [
  'default',
  ['allure-jest/reporter', { resultsDir: 'reports/allure-results' }],
],
```

### Custom Allure Steps

```typescript
// src/utils/allure-helpers.ts
import { allure } from 'allure-js-commons';

export function step(name: string, fn: () => Promise<void> | void): Promise<void> {
  return allure.step(name, async () => {
    await fn();
  });
}

export function attachJson(name: string, data: unknown): void {
  allure.attachment(name, JSON.stringify(data, null, 2), 'application/json');
}

export function attachText(name: string, text: string): void {
  allure.attachment(name, text, 'text/plain');
}
```

### Report Generation

```bash
# After test run
npx allure generate reports/allure-results --clean -o reports/allure-report
npx allure open reports/allure-report
```

---

## 8. Parallel Execution

### Jest Workers

```typescript
// jest.config.ts
{
  maxWorkers: process.env.CI ? '50%' : '75%',
}
```

Jest runs test files in parallel across workers. Each worker is a separate Node.js process.

### Test Isolation Requirements

1. **Unique test data**: Each test creates its own data via factories — no shared state
2. **Cleanup after each test**: `afterEach` deletes resources created during the test
3. **Independent auth**: AuthManager is instantiated per ApiClient — each worker gets its own token
4. **No shared database state**: Tests don't assume data created by other tests exists

### Parallelism Strategy

| Level | Mechanism | Notes |
|-------|-----------|-------|
| File-level | Jest `--maxWorkers` | Each `.test.ts` runs in its own worker process |
| CI-level | Matrix strategy (2+ jobs) | Split test directories across jobs |

---

## 9. CI/CD Integration

### GitHub Actions Workflow

```yaml
# .github/workflows/api-tests.yml
name: API Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  CI: true
  TEST_ENV: staging
  API_BASE_URL: ${{ secrets.STAGING_API_URL }}
  TEST_USER_EMAIL: ${{ secrets.TEST_USER_EMAIL }}
  TEST_USER_PASSWORD: ${{ secrets.TEST_USER_PASSWORD }}

jobs:
  lint-and-typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: npm }
      - run: npm ci
      - run: npx tsc --noEmit
      - run: npx eslint src/ tests/

  api-tests:
    needs: lint-and-typecheck
    runs-on: ubuntu-latest
    strategy:
      fail-fast: false
      matrix:
        test-group: [auth, users, errors, schemas]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: npm }
      - run: npm ci

      - name: Run API tests (${{ matrix.test-group }})
        run: npx jest --testPathPattern="tests/${{ matrix.test-group }}" --maxWorkers=2

      - name: Upload Allure results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: allure-results-${{ matrix.test-group }}
          path: reports/allure-results

  allure-report:
    needs: api-tests
    if: always()
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/download-artifact@v4
        with:
          pattern: allure-results-*
          merge-multiple: true
          path: merged-results
      - run: npm install -g allure-commandline
      - run: allure generate merged-results --clean -o allure-report
      - uses: peaceiris/actions-gh-pages@v4
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: allure-report
```

---

## 10. Docker Setup

### Dockerfile

```dockerfile
FROM node:20-slim

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --production=false

COPY . .

RUN npx tsc --noEmit

CMD ["npx", "jest", "--maxWorkers=2"]
```

### docker-compose.yml

```yaml
version: '3.8'

services:
  api-tests:
    build:
      context: .
      dockerfile: docker/Dockerfile
    environment:
      - CI=true
      - TEST_ENV=staging
      - API_BASE_URL=http://api:3000
      - TEST_USER_EMAIL=${TEST_USER_EMAIL}
      - TEST_USER_PASSWORD=${TEST_USER_PASSWORD}
    volumes:
      - ./reports:/app/reports
    depends_on:
      api:
        condition: service_healthy
    networks:
      - test-network

  api:
    image: your-api:latest
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
docker compose -f docker/docker-compose.yml up --build --exit-code-from api-tests

# Specific test group
docker compose -f docker/docker-compose.yml run api-tests npx jest --testPathPattern="tests/auth"
```

---

## 11. Quality Checklist

### Structure

- [ ] Folder structure matches architecture section
- [ ] `tsconfig.json` has strict mode enabled
- [ ] All imports resolve correctly
- [ ] No circular dependencies

### Core

- [ ] `ApiClient` class wraps SuperTest with auth, logging, and typed methods
- [ ] `AuthManager` acquires, caches, and refreshes tokens
- [ ] Token refresh handles concurrent requests (single refresh in flight)
- [ ] Request/response logging interceptor captures method, URL, status, duration
- [ ] Error handling for network failures and timeouts

### Schema Validation

- [ ] Zod schemas defined for all response types (success + error)
- [ ] Schemas used in test assertions (`Schema.parse(response.body)`)
- [ ] TypeScript types inferred from Zod schemas (not duplicated)
- [ ] Error response schema validates structure and required fields

### Testing

- [ ] At least 10 test cases covering CRUD operations
- [ ] Auth flow tests (login, token refresh, unauthorized access)
- [ ] Error response validation (400, 401, 403, 404, 409, 500)
- [ ] Response time assertions (`expect(duration).toBeLessThan(...)`)
- [ ] Schema validation in every success-path test
- [ ] Tests create and clean up their own data

### Configuration

- [ ] Environment-based config with `.env` files
- [ ] Typed config object with defaults
- [ ] Sensitive values read from environment variables
- [ ] `jest.config.ts` properly configured with timeout, reporters, workers

### Infrastructure

- [ ] Allure reporting configured and generating HTML reports
- [ ] GitHub Actions workflow with matrix strategy (test groups)
- [ ] Dockerfile with Node 20 slim image
- [ ] `docker-compose.yml` for containerized execution
- [ ] CI typecheck + lint step before test execution

### Parallel Execution

- [ ] Jest `maxWorkers` configured for CI
- [ ] Tests are isolated — no shared mutable state between files
- [ ] Unique test data per test via factory pattern
- [ ] Cleanup runs after each test (`afterEach`)

---

**Blueprint Owner**: API Testing Builder
**Consumers**: Quality Gate Agent (validation), Infrastructure Agent (CI/CD/Docker), Documentation Agent (README)
