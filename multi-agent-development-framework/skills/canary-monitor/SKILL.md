---
name: canary-monitor
description: "Post-deploy monitoring loop. Watches for console errors, performance regressions, and page failures. Inspired by gstack /canary and /benchmark."
origin: MADF+gstack
---

# Canary Monitor — Post-Deploy Verification

Deploy is not done when the code ships. It's done when production is verified healthy.

## When to Use

- Immediately after deployment (Phase 6 / G6)
- After any production hotfix (Agent 10)
- After infrastructure changes (Agent 11)
- As a scheduled health check

## Prerequisites

- Playwright installed (for browser-based checks)
- Production/staging URL accessible
- `artifacts/DEPLOYMENT_GUIDE.md` for health endpoints
- Baseline metrics (from pre-deploy benchmark, if available)

## The Monitoring Loop

### Cycle 1: Immediate Post-Deploy (0-5 minutes)

```markdown
1. Hit health endpoint (/health, /ready)
   - Expected: 200 OK with service status
   - If fail: ALERT — deployment may have failed

2. Load key pages (homepage, login, dashboard)
   - Check: HTTP status 200
   - Check: No JavaScript console errors
   - Check: Page loads within baseline + 20% tolerance
   - Screenshot each page for evidence

3. Test critical flow (login → primary action → verify)
   - Check: Flow completes successfully
   - Check: Data persists correctly
   - Check: No error states shown

4. Check API endpoints (from API_CONTRACT.md)
   - Hit 3-5 critical endpoints
   - Verify response shapes match contract
   - Check response times
```

### Cycle 2-5: Monitoring Period (5-30 minutes)

Repeat every 5 minutes:

```markdown
1. Health endpoint check
2. Key page load check (any new console errors?)
3. Performance spot-check (load time regression?)
4. Error rate check (if monitoring dashboard available)
```

### Decision Points

| Observation | Action |
|------------|--------|
| All green, 3 consecutive clean cycles | **HEALTHY** — monitoring complete |
| Console errors on one page | Investigate — could be pre-existing or new |
| Health endpoint returns 500 | **ALERT** — check deployment logs, prepare rollback |
| Page load time > 2x baseline | **WARNING** — check for N+1 queries, missing indexes, large payloads |
| Critical flow fails | **ALERT** — rollback immediately, investigate |

## Performance Baseline

Track these metrics before AND after deployment:

| Metric | How to Measure | Healthy Threshold |
|--------|---------------|-------------------|
| Page Load Time | Playwright `page.goto()` duration | < 3s (or baseline + 20%) |
| Time to Interactive | First meaningful paint | < 2s |
| JavaScript Errors | `page.on('console', ...)` filtering errors | 0 new errors |
| Failed Network Requests | `page.on('requestfailed', ...)` | 0 new failures |
| API Response Time | Fetch critical endpoints, measure duration | < 500ms (or baseline + 30%) |
| Bundle Size | Check network transfer | < baseline + 10% |

## Rollback Decision Framework

```
Is the app down or critically broken?
  YES → Rollback immediately. Investigate after.
  NO →
    Is it a performance regression > 50%?
      YES → Rollback. Performance is a feature.
      NO →
        Is it a non-critical visual bug?
          YES → Hotfix forward. Document in LESSONS_LEARNED.md.
          NO →
            Is it a data integrity issue?
              YES → Rollback immediately. Data corruption is unrecoverable.
              NO → Monitor for 30 more minutes. If stable, proceed.
```

## Output Format

```markdown
# Canary Report — [Date] [Time]

## Deployment
- **Version**: [commit hash or tag]
- **Environment**: [production/staging]
- **Deploy time**: [timestamp]

## Health Summary
- Monitoring cycles completed: [N]
- Status: HEALTHY / WARNING / ALERT
- Console errors: [N new]
- Failed requests: [N new]

## Performance
| Metric | Baseline | Current | Delta | Status |
|--------|----------|---------|-------|--------|
| Page Load | 1.2s | 1.3s | +8% | OK |
| API /users | 120ms | 150ms | +25% | OK |
| Bundle Size | 245KB | 248KB | +1.2% | OK |

## Flows Verified
[✓] Login → Dashboard → Primary action
[✓] Health endpoint returns 200
[✓] API contract spot-check (3/3 endpoints)

## Issues Found
[None — or list with severity]

## Decision
PROCEED / ROLLBACK / MONITOR LONGER
```

## Integration with MADF

| MADF Component | Canary Integration |
|---------------|-------------------|
| DevOps Agent (08) | Sets up health endpoints and monitoring config |
| G6 Gate | Canary must show HEALTHY before gate passes |
| Reactive Maintenance (10) | Canary runs after every hotfix |
| Learning Agent (09) | Deploy metrics feed into retrospective |
