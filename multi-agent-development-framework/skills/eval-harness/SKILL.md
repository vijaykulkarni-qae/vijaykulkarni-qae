---
name: eval-harness
description: "Eval-Driven Development — define pass/fail criteria before coding, measure agent reliability with pass@k metrics."
origin: MADF+ECC
---

# Eval Harness — Eval-Driven Development

Treats evals as the "unit tests of AI-assisted development." Define expected behavior BEFORE implementation, run evals continuously, track reliability.

## When to Activate

- Defining success criteria for a new feature (Phase 4)
- Measuring quality of agent outputs at gate transitions
- Creating regression test suites for prompt or workflow changes
- Benchmarking agent performance across sessions

## Eval Types

### Capability Evals
Test if a feature can do what it should:
```
[CAPABILITY EVAL: user-auth]
Task: User registration and login flow
Success Criteria:
  - [ ] User can register with email/password
  - [ ] User can login with valid credentials
  - [ ] Invalid credentials are rejected with proper error
  - [ ] Sessions persist across page reloads
  - [ ] Logout clears session
```

### Regression Evals
Ensure changes don't break existing functionality:
```
[REGRESSION EVAL: user-auth]
Tests:
  - public-routes-accessible: PASS/FAIL
  - api-responses-unchanged: PASS/FAIL
  - database-schema-compatible: PASS/FAIL
Result: X/Y passed
```

## Grader Types

| Grader | When to Use | Example |
|--------|------------|---------|
| **Code-based** | Deterministic checks | `npm test && echo PASS` |
| **Rule-based** | Regex/schema constraints | Validate API response schema |
| **Model-based** | Open-ended quality assessment | "Is this code well-structured?" |
| **Human** | Subjective or security-critical | UX review, security audit |

## Metrics

- **pass@1**: First-attempt success rate
- **pass@3**: Success within 3 attempts (practical reliability)
- **pass^3**: All 3 consecutive attempts succeed (stability test)

Targets:
- Capability evals: pass@3 >= 90%
- Regression evals: pass^3 = 100% for release-critical paths

## Workflow

```
1. DEFINE (before coding)  → Create eval definition
2. IMPLEMENT               → Write code to pass evals
3. EVALUATE                → Run evals, record results
4. REPORT                  → Generate pass/fail report
```

## Integration with MADF

- Eval definitions can be created during Phase 3 (UX) for user-facing features
- G4 gate can incorporate eval results alongside standard test coverage
- The Learning Agent should track pass@k trends across sessions
- Eval reports are stored in `artifacts/` alongside other gate artifacts
