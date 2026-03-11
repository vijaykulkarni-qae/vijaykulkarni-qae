---
name: verification-loop
description: "6-phase quality verification system. Run before gate validation (G4/G5) and before PRs."
origin: MADF+ECC
---

# Verification Loop

A comprehensive 6-phase verification system that produces a structured pass/fail report. Integrates with MADF gates G4 and G5.

## When to Use

- Before G4 gate validation (per-feature completion)
- Before G5 gate validation (all P0 features done)
- Before creating a pull request
- After refactoring
- After any significant code change

## The 6 Phases

### Phase 1: Build Verification
```bash
npm run build 2>&1 | tail -20
# OR: pnpm build / yarn build / python -m py_compile
```
If build fails, **STOP and fix** before continuing.

### Phase 2: Type Check
```bash
# TypeScript
npx tsc --noEmit 2>&1 | head -30

# Python
pyright . 2>&1 | head -30
```
Report all type errors. Fix critical ones before continuing.

### Phase 3: Lint Check
```bash
# JavaScript/TypeScript
npm run lint 2>&1 | head -30

# Python
ruff check . 2>&1 | head -30
```

### Phase 4: Test Suite
```bash
npm run test -- --coverage 2>&1 | tail -50
```
Report: Total tests, Passed, Failed, Coverage %.
Target: **80% minimum coverage** (MADF standard).

### Phase 5: Security Scan
```bash
# Check for hardcoded secrets
grep -rn "sk-\|api_key\|password\s*=" --include="*.ts" --include="*.js" src/
# Check for console.log
grep -rn "console.log" --include="*.ts" --include="*.tsx" src/
```

### Phase 6: Diff Review
```bash
git diff --stat
git diff HEAD~1 --name-only
```
Review each changed file for unintended changes, missing error handling, edge cases.

## Output Format

```
VERIFICATION REPORT
==================
Build:     [PASS/FAIL]
Types:     [PASS/FAIL] (X errors)
Lint:      [PASS/FAIL] (X warnings)
Tests:     [PASS/FAIL] (X/Y passed, Z% coverage)
Security:  [PASS/FAIL] (X issues)
Diff:      [X files changed]

Overall:   [READY/NOT READY] for G4/PR

Issues to Fix:
1. ...
2. ...
```

## Integration with MADF Gates

| Gate | Required Result |
|------|----------------|
| G4 (per feature) | All phases PASS, coverage >= 80%, 0 critical security issues |
| G5 (all P0 done) | All G4 reports PASS, full security review complete |
| G6 (DevOps) | CI pipeline runs this verification automatically |

## Continuous Mode

For long sessions, run verification:
- After completing each function or component
- Before moving to the next feature
- Every ~15 minutes during active development
