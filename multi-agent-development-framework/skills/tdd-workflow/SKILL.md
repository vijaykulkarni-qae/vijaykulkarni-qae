---
name: tdd-workflow
description: "Test-Driven Development workflow with patterns for unit, integration, and E2E tests. 80%+ coverage target."
origin: MADF+ECC
---

# Test-Driven Development Workflow

Ensures all code development follows TDD principles. Loaded by the Testing Agent (06) and referenced by Backend (04) and Frontend (05) agents.

## When to Activate

- Writing new features or functionality
- Fixing bugs
- Refactoring existing code
- Adding API endpoints
- Creating new components

## The TDD Cycle

```
Step 1: Write User Journeys
  "As a [role], I want to [action], so that [benefit]"

Step 2: Generate Test Cases
  Write comprehensive tests for each journey

Step 3: Run Tests → They Should FAIL (RED)

Step 4: Write Minimal Code to Pass (GREEN)

Step 5: Run Tests → They Should PASS

Step 6: Refactor (IMPROVE)
  Clean up while keeping tests green

Step 7: Verify Coverage (80%+ minimum)
```

## Test Types Required

### Unit Tests
- Individual functions and utilities
- Component logic (isolated)
- Pure functions, helpers
- Pattern: Arrange → Act → Assert

### Integration Tests
- API endpoints (request → response)
- Database operations (CRUD)
- Service interactions
- Auth flow validation

### E2E Tests (Playwright)
- Critical P0 user flows (happy path + error path)
- Complete workflows end-to-end
- See `skills/e2e-testing/SKILL.md` for Playwright patterns

## Coverage Requirements

- **Minimum**: 80% coverage (unit + integration + E2E combined)
- **All edge cases** covered (null, undefined, empty, boundary values)
- **Error scenarios** tested (network failure, invalid input, auth failure)
- **Every P0 feature** must have at least one happy-path and one error-path test

## Test File Organization

```
src/
├── components/
│   ├── Button/
│   │   ├── Button.tsx
│   │   └── Button.test.tsx         ← Unit tests co-located
├── app/api/
│   └── users/
│       ├── route.ts
│       └── route.test.ts           ← Integration tests co-located
└── e2e/
    ├── auth.spec.ts                ← E2E tests in dedicated directory
    ├── dashboard.spec.ts
    └── user-management.spec.ts
```

## Common Mistakes to Avoid

- Testing implementation details instead of behavior
- Brittle selectors (use `data-testid`, semantic selectors)
- Tests that depend on each other (each test must be independent)
- Mocking too much (integration tests should hit real services where possible)
- Skipping error path tests

## Integration with MADF

- Testing Agent (06) loads this skill for Phase 4c work
- G4 gate requires: tests passing + coverage >= 80%
- Verification-loop skill runs test suite as Phase 4 of its 6-phase check
