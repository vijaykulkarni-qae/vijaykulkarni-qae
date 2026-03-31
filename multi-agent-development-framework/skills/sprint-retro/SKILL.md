---
name: sprint-retro
description: "Quantitative sprint retrospective with git metrics, test ratios, shipping velocity, and hotspot analysis. Inspired by gstack /retro."
origin: MADF+gstack
---

# Sprint Retro — Metrics-Driven Retrospective

Retrospectives backed by data, not just feelings. Git metrics + MADF gate data + test health = actionable insights.

## When to Use

- End of each sprint/week
- After project completion (full retrospective)
- After G6 gate (launch retro)
- On request: `/retro`

## Data Sources

### 1. Git Metrics (Automated)

```bash
# Commits this period
git log --since="1 week ago" --oneline | wc -l

# Lines added/removed
git log --since="1 week ago" --numstat --pretty="" | awk '{add+=$1; del+=$2} END {print "+"add, "-"del}'

# Files changed
git log --since="1 week ago" --name-only --pretty="" | sort -u | wc -l

# Hotspot files (most frequently changed)
git log --since="1 week ago" --name-only --pretty="" | sort | uniq -c | sort -rn | head -10

# Commit frequency by hour
git log --since="1 week ago" --format='%H' | sort | uniq -c | sort -rn | head -5
```

### 2. Test Health (Automated)

```bash
# Test count and pass rate
npm test 2>&1 | tail -5

# Coverage percentage
npm run coverage 2>&1 | grep "All files"

# Test-to-code ratio
find src -name "*.test.*" -o -name "*.spec.*" | wc -l  # test files
find src -not -name "*.test.*" -not -name "*.spec.*" -name "*.ts" -o -name "*.tsx" | wc -l  # source files
```

### 3. MADF Gate Data (From PROJECT_STATE.md)

- Gate pass rates (first-attempt vs retries)
- Escalations count and reasons
- Phase durations
- Blocker history

### 4. Security & Quality (From Artifacts)

- SECURITY_REVIEW.md — findings resolved vs open
- DECISIONS.md — tech debt items status
- agent-learnings/ — new lessons captured

## The Retrospective

### Section 1: Velocity Dashboard

```markdown
## Sprint Velocity — [Date Range]

| Metric | This Sprint | Last Sprint | Trend |
|--------|------------|-------------|-------|
| Commits | 47 | 38 | ↑ +24% |
| Lines Added | 3,241 | 2,890 | ↑ +12% |
| Lines Removed | 1,102 | 780 | ↑ +41% |
| Net LOC | +2,139 | +2,110 | → Stable |
| Files Changed | 34 | 28 | ↑ +21% |
| Features Completed | 3 | 2 | ↑ |
| Bugs Fixed | 5 | 3 | ↑ |
```

### Section 2: Test Health

```markdown
## Test Health

| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| Total Tests | 156 | — | — |
| Pass Rate | 99.4% | 100% | ⚠ 1 flaky |
| Coverage | 84% | ≥80% | ✓ |
| Test:Code Ratio | 1:2.3 | ≥1:3 | ✓ |
| New Tests This Sprint | +18 | — | — |
| Regression Tests | +5 | — | — |

### Flaky Tests (Investigate)
- `auth.test.ts:42` — intermittent timeout (3rd time this month)
```

### Section 3: Quality Gate Analysis

```markdown
## Gate Performance

| Gate | Attempts | First-Pass | Retry Rate |
|------|----------|------------|------------|
| G1 (Plan) | 1 | ✓ | 0% |
| G2 (Architecture) | 2 | ✗ | 50% — CTO flagged missing caching strategy |
| G4 (Feature: Auth) | 1 | ✓ | 0% |
| G4 (Feature: Dashboard) | 2 | ✗ | 50% — security finding blocked |

### Escalations: 2
1. Backend→CTO: Database schema change needed mid-build
2. Security→Human: Third-party SDK collects PII without disclosure

### Lessons Captured: 4 new entries
```

### Section 4: Hotspot Analysis

```markdown
## Hotspot Files (Most Changed)

| # | File | Changes | Why |
|---|------|---------|-----|
| 1 | src/api/auth.ts | 12 | Auth rework — expected |
| 2 | src/components/Dashboard.tsx | 8 | Feature iteration — OK |
| 3 | src/utils/formatters.ts | 7 | ⚠ Utility churn — may need refactor |
| 4 | prisma/schema.prisma | 6 | Schema evolution — expected |

### Files to Watch
- `formatters.ts` changed 7 times → stabilize the API or extract into a library
```

### Section 5: What Worked / What Didn't

```markdown
## What Worked
- [Data-driven observations, not opinions]
- G4 first-pass rate for Auth = 100% — thorough UX_SPEC paid off
- Test coverage increased from 78% to 84% — TDD workflow is working

## What Didn't Work
- G2 required retry — caching strategy was an afterthought
- 2 escalations both related to third-party integrations — add vendor review to Phase 2

## Action Items
- [ ] Add "Vendor/SDK Review" section to SYSTEM_BLUEPRINT.md template
- [ ] Investigate flaky auth test (3rd occurrence)
- [ ] Stabilize formatters.ts utility API
```

## Output

Save to `artifacts/RETRO_[DATE].md` and append summary to `artifacts/LESSONS_LEARNED.md`.

## Integration with MADF

| MADF Component | Retro Integration |
|---------------|-------------------|
| Learning Agent (09) | Runs this skill as part of its retrospective |
| LESSONS_LEARNED.md | Retro findings feed into cross-agent patterns |
| PROJECT_STATE.md | Sprint metrics logged in session history |
| DECISIONS.md | Action items become tech debt entries |
