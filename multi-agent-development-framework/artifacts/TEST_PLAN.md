# Test Plan

> **Testing Agent Output** — Test strategy and inventory. Fill out during build phase.

---

## Header

| Field | Value |
|-------|-------|
| **Version** | `1.0.0` |
| **Date** | `YYYY-MM-DD` |
| **Framework** | `Jest` / `Vitest` / `Cypress` / `Playwright` / `Pytest` |
| **Coverage Targets** | Unit: `80%`, Integration: `70%`, E2E: Critical paths |

---

## Testing Strategy

| Layer | Tool | Scope | When to Use |
|-------|------|-------|-------------|
| **Unit** | Jest / Vitest / Pytest | Pure functions, components, utilities | Logic in isolation, no I/O |
| **Integration** | Jest + MSW / Supertest / pytest | API handlers, DB, external services | Multiple units together |
| **E2E** | Cypress / Playwright | Full user flows in browser | Critical paths, smoke tests |

### What Goes Where

- **Unit**: Business logic, form validation, data transformers, pure components
- **Integration**: API endpoints, database operations, auth flows
- **E2E**: Login → Dashboard → Create item → Logout; checkout flow; signup flow

---

## Test Inventory

| Test Suite | Type | What It Tests | Status | Coverage |
|------------|------|---------------|--------|----------|
| `auth.test.ts` | Unit | Login validation, token parsing | ✅ Ready | 85% |
| `api/users.test.ts` | Integration | User CRUD endpoints | ✅ Ready | 78% |
| `e2e/checkout.spec.ts` | E2E | Full checkout flow | 🔄 In Progress | N/A |
| `components/Button.test.tsx` | Unit | Button variants, clicks | ✅ Ready | 100% |
| `utils/format.test.ts` | Unit | Date/currency formatters | ✅ Ready | 95% |

*Status: ✅ Ready | 🔄 In Progress | ⏳ Planned | ❌ Blocked*

---

## Critical Path Tests (P0)

### P0-1: User Authentication

| Scenario | Type | Description | Status |
|----------|------|-------------|--------|
| Valid login | E2E | User logs in with correct credentials, redirected to dashboard | ✅ |
| Invalid login | E2E | Wrong password shows error, no redirect | ✅ |
| Session expiry | Integration | Expired token returns 401, user redirected to login | 🔄 |
| Logout | E2E | Logout clears session, redirects to home | ✅ |

### P0-2: [Feature Name]

| Scenario | Type | Description | Status |
|----------|------|-------------|--------|
| Create item | E2E | User creates item, sees it in list | ✅ |
| Edit item | E2E | User edits item, changes persist | 🔄 |
| Delete item | E2E | User deletes item, confirmation required | ⏳ |

### P0-3: [Another Critical Feature]

*[Same structure]*

---

## Test Data Management

| Aspect | Approach |
|--------|----------|
| **Unit Tests** | Inline mocks, factory functions (e.g., `createMockUser()`) |
| **Integration Tests** | Seed DB with fixtures, reset between tests |
| **E2E Tests** | Dedicated test user, isolated test data, cleanup after run |
| **Sensitive Data** | Never use real credentials; use env vars for test accounts |

### Fixture Locations

- `tests/fixtures/users.json`
- `tests/factories/userFactory.ts`

---

## CI Integration

| Stage | Command | When |
|-------|---------|------|
| **On PR** | `npm run test:unit` | Every push |
| **On PR** | `npm run test:integration` | Every push (requires test DB) |
| **On Merge** | `npm run test:e2e` | Main branch, or nightly |
| **Coverage Report** | `npm run test:coverage` | Upload to Codecov/Coveralls |

### Pipeline Config

```yaml
# Example: GitHub Actions
- name: Run unit tests
  run: npm run test:unit -- --coverage
- name: Run integration tests
  run: npm run test:integration
  env:
    DATABASE_URL: ${{ secrets.TEST_DB_URL }}
```

---

## Coverage Report

| Metric | Target | Current |
|--------|--------|---------|
| **Statements** | 80% | _% |
| **Branches** | 75% | _% |
| **Functions** | 80% | _% |
| **Lines** | 80% | _% |

### Low Coverage Areas

| File/Module | Coverage | Reason |
|-------------|----------|--------|
| `legacy/utils.js` | 45% | Legacy code, refactor planned |
| `api/admin.ts` | 60% | Requires elevated permissions |

---

## Known Gaps and Risks

| Gap | Risk | Mitigation |
|-----|------|------------|
| No E2E for mobile viewport | Mobile bugs may slip | Add viewport tests in next sprint |
| Payment flow not fully mocked | Flaky E2E | Use Stripe test mode, add retries |
| Third-party API untested | Integration failures | Add contract tests |

---

## Regression Tests

| Suite | Scope | Run Frequency |
|-------|-------|---------------|
| **Smoke** | Core flows (login, home, key pages) | Every deploy |
| **Full Regression** | All E2E scenarios | Pre-release, weekly |
| **Visual Regression** | UI snapshots (if applicable) | On demand |

---

## Instructions for Testing Agent

1. Replace all placeholder values with actual test details.
2. Ensure Test Inventory covers all test files in the project.
3. Document every P0 critical path with scenarios.
4. Keep Coverage Report updated from CI.
5. Add Known Gaps as they are discovered.
