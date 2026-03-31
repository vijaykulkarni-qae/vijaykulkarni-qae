---
name: visual-qa
description: "Browser-based QA testing using Playwright. Open a real browser, test flows visually, find bugs, generate regression tests. Inspired by gstack /qa."
origin: MADF+gstack
---

# Visual QA — Browser Testing Skill

Test your app through a real browser. See what users see. Find what unit tests miss.

## When to Use

- After building frontend features (Phase 4b)
- Before G4 gate validation (feature completeness)
- Before G5 gate (all P0 complete)
- After any UI-related bug fix
- When unit/integration tests pass but something "looks wrong"

## Philosophy: Boil the Lake

AI makes the marginal cost of visual verification near-zero. When you can open a browser and verify every flow in minutes — do it. Don't ship based on green tests alone. **See it work.**

## Prerequisites

- Playwright installed (`npm i -D @playwright/test && npx playwright install`)
- App running locally (dev server)
- `artifacts/UX_SPEC.md` for expected flows
- `artifacts/API_CONTRACT.md` for expected data

## The QA Process

### Step 1: Identify What to Test

Read these sources to determine test scope:

| Source | What It Tells You |
|--------|-------------------|
| `git diff main...HEAD` | What changed — code paths to focus on |
| `artifacts/UX_SPEC.md` | Expected user flows and screen inventory |
| `PROJECT_STATE.md` Feature Tracker | Which features are built and ready |

**Diff-aware mode**: If there's a git diff, focus on pages/flows affected by the diff.
**Full mode**: No diff → test all P0 flows systematically.

### Step 2: Launch Browser & Test

For each flow identified in Step 1:

```
1. Navigate to the page
2. Verify layout renders correctly (no broken layouts, missing elements)
3. Complete the happy path (fill forms, click buttons, verify results)
4. Test the error path (invalid inputs, empty states, network errors)
5. Check loading states (are there spinners/skeletons?)
6. Check responsive behavior (resize viewport: 375px, 768px, 1280px)
7. Check console for errors (JavaScript errors, failed network requests)
8. Screenshot each state for evidence
```

### Step 3: Document Findings

For each bug found:

```markdown
### BUG-XXX: [Short title]
- **Page**: /path/to/page
- **Steps**: 1. Navigate to... 2. Click... 3. Observe...
- **Expected**: [from UX_SPEC]
- **Actual**: [what happened]
- **Severity**: Critical / High / Medium / Low
- **Screenshot**: [description or path]
- **Console errors**: [if any]
```

### Step 4: Fix with Atomic Commits

For each bug:
1. Fix the issue (minimal change)
2. One commit per fix — fully bisectable
3. Re-verify the fix in the browser
4. Generate a regression test (see below)

### Step 5: Generate Regression Tests

For every bug fixed, write a Playwright E2E test that:
1. Reproduces the exact failure scenario
2. Verifies the fix works
3. Prevents regression

```typescript
// Example: regression test for BUG-001
test('BUG-001: form submission shows success message', async ({ page }) => {
  await page.goto('/submit');
  await page.fill('[data-testid="name"]', 'Test User');
  await page.click('[data-testid="submit"]');
  await expect(page.locator('[data-testid="success"]')).toBeVisible();
});
```

## Browser Handoff Pattern

When the AI cannot proceed (CAPTCHA, MFA, auth wall, complex visual judgment):

1. **Pause** — "I've hit [obstacle]. I need you to handle this."
2. **State the URL and context** — "I'm on /admin/settings. I need you to complete the 2FA prompt."
3. **Wait** — User handles the obstacle
4. **Resume** — "Thanks. Continuing from /admin/settings."

This is human-AI co-testing. The AI handles the repetitive flows; the human handles what requires judgment or authentication.

## Modes

| Mode | When | Duration | Coverage |
|------|------|----------|----------|
| **Quick Smoke** | After small change | 30 seconds | Affected page only |
| **Diff-Aware** | After PR/feature | 2-5 minutes | Pages affected by diff |
| **Full Systematic** | Before release | 5-15 minutes | All P0 user flows |
| **Regression** | After bug fix | 1-2 minutes | Run existing regression suite |

## Integration with MADF Gates

| Gate | Visual QA Requirement |
|------|----------------------|
| G4 (per feature) | Diff-aware QA on the feature's flows. No Critical/High visual bugs. |
| G5 (all P0) | Full systematic QA across all P0 flows. All regression tests pass. |
| G6 (deploy) | Quick smoke on staging URL after deployment. |

## Output

After QA session, produce a structured report:

```markdown
# Visual QA Report — [Date]

## Summary
- Pages tested: [N]
- Bugs found: [N] (Critical: X, High: X, Medium: X, Low: X)
- Bugs fixed: [N]
- Regression tests generated: [N]
- Console errors observed: [N]

## Bugs Found & Fixed
[BUG-001, BUG-002, ...]

## Flows Verified
[✓] Login flow — happy + error paths
[✓] Dashboard — all KPI cards render
[✓] Form submission — validation, success, error states
[ ] Mobile responsive — NOT TESTED (no mobile flows in UX_SPEC)

## Remaining Issues
[List any unfixed bugs with severity and reason for deferral]
```

## Anti-Patterns

- **Testing without UX_SPEC** — you won't know what's "correct" vs "broken"
- **Fixing bugs without regression tests** — the bug will return
- **Testing only the happy path** — error and empty states are where most bugs hide
- **Batch-committing fixes** — one commit per fix, always
- **Skipping console errors** — JavaScript errors are bugs, even if the page "looks fine"
