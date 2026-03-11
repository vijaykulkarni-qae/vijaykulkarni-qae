---
name: e2e-testing
description: "End-to-end testing patterns with Playwright — Page Object Model, CI/CD integration, flaky test handling."
origin: MADF+ECC
---

# E2E Testing with Playwright

Comprehensive patterns for writing reliable end-to-end tests. Loaded by the Testing Agent (06) for Phase 4c E2E test work.

## When to Activate

- Writing E2E tests for P0 user flows
- Setting up Playwright in a new project
- Fixing flaky E2E tests
- Integrating E2E tests into CI/CD pipeline

## Page Object Model (POM)

Encapsulate page interactions in reusable objects:

```typescript
// pages/LoginPage.ts
export class LoginPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/login');
  }

  async login(email: string, password: string) {
    await this.page.fill('[data-testid="email"]', email);
    await this.page.fill('[data-testid="password"]', password);
    await this.page.click('[data-testid="submit"]');
  }

  async getErrorMessage() {
    return this.page.textContent('[data-testid="error"]');
  }
}
```

```typescript
// e2e/auth.spec.ts
test('user can login', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login('user@test.com', 'password123');
  await expect(page).toHaveURL('/dashboard');
});
```

## Selector Strategy

Prefer resilient selectors (top = best):

1. `data-testid` attributes — most stable
2. Semantic selectors — `getByRole('button', { name: 'Submit' })`
3. Text content — `getByText('Welcome')`
4. CSS class — least stable, avoid

## Test Structure

```
e2e/
├── fixtures/           ← Shared test data, auth states
├── pages/              ← Page Object Models
├── tests/
│   ├── auth.spec.ts    ← One spec per feature area
│   ├── dashboard.spec.ts
│   └── settings.spec.ts
└── playwright.config.ts
```

## Flaky Test Prevention

- Use `await expect().toBeVisible()` instead of `waitForTimeout()`
- Use `page.waitForResponse()` for API-dependent assertions
- Isolate test data — each test creates its own data
- Use `test.describe.serial()` only when order truly matters
- Retry in CI: `retries: 2` in playwright.config.ts

## CI/CD Integration

```yaml
- name: Run E2E Tests
  run: npx playwright test --reporter=html
- name: Upload Report
  if: failure()
  uses: actions/upload-artifact@v4
  with:
    name: playwright-report
    path: playwright-report/
```

## Integration with MADF

- Testing Agent (06) creates E2E tests for all P0 user flows
- Every P0 feature must have at least one happy-path and one error-path E2E test
- G4 gate requires E2E tests passing for the feature under review
- Test results contribute to the VERIFICATION REPORT
