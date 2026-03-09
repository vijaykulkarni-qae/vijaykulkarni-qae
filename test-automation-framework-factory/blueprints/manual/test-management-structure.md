# Blueprint: Structured Manual Test Management (Tool-Agnostic)

> **Approach** Template-driven · Requirement-traceable · Phase-gated
> **Testing Types** Smoke · Regression · Exploratory · UAT
> **Difficulty** Beginner–Intermediate

---

## 1 Overview

Not every test can or should be automated. Manual testing remains essential for exploratory testing, usability evaluation, visual verification, and user acceptance testing (UAT). Without structure, manual efforts become ad-hoc and untraceable — this blueprint provides a complete, tool-agnostic framework of templates, conventions, and processes that bring the same rigour to manual testing as automation frameworks bring to scripted tests.

This blueprint produces a production-ready manual test management system that:

- Provides **standardised templates** for test cases, defect reports, execution runs, and summary reports.
- Enforces a **naming convention** (`TC-[MODULE]-[NUMBER]`) for universal identification.
- Maintains a **traceability matrix** linking requirements → test cases → execution results.
- Defines **entry/exit criteria** for each test phase (smoke, regression, UAT).
- Includes **exploratory testing charters** and **UAT sign-off** templates.
- Works with any tool — spreadsheets, Jira/Xray, TestRail, Azure DevOps, or plain Markdown.

---

## 2 Prerequisites

| Requirement | Purpose |
|---|---|
| Test management tool OR spreadsheets | Store and track test artifacts |
| Requirements/user stories | Source for traceability |
| Access to test environment | Execute tests against a deployed build |
| Defect tracking system | Log and track bugs |
| Stakeholder availability | UAT sign-off |

No specific software is mandated — all templates below work in Excel, Google Sheets, Notion, Confluence, TestRail, Zephyr, or plain Markdown files.

---

## 3 Architecture

### 3.1 Artifact Structure

```
test-management/
├── templates/
│   ├── test-case-template.md
│   ├── test-suite-index.md
│   ├── execution-run-sheet.md
│   ├── defect-report-template.md
│   ├── test-summary-report.md
│   ├── traceability-matrix.md
│   ├── exploratory-charter.md
│   ├── uat-sign-off.md
│   ├── smoke-checklist.md
│   ├── regression-checklist.md
│   └── test-data-requirements.md
├── definitions/
│   ├── priority-severity.md
│   └── entry-exit-criteria.md
└── README.md
```

### 3.2 Process Flow

```
Requirements               Test Design              Execution           Reporting
  ┌──────┐              ┌──────────────┐         ┌────────────┐      ┌──────────┐
  │ REQ  │──────────▶   │ Test Cases   │─────▶   │ Run Sheet  │──▶   │ Summary  │
  │ docs │              │ (TC-MOD-###) │         │ (per build)│      │ Report   │
  └──────┘              └──────┬───────┘         └─────┬──────┘      └─────┬────┘
                               │                       │                   │
                        ┌──────▼───────┐         ┌─────▼──────┐      ┌────▼─────┐
                        │ Traceability │         │ Defect     │      │ Sign-off │
                        │ Matrix       │         │ Reports    │      │ (UAT)    │
                        └──────────────┘         └────────────┘      └──────────┘
```

---

## 4 Core Patterns

### 4.1 Test Case Template

Every test case follows this structure:

| Field | Description | Example |
|---|---|---|
| **ID** | Unique identifier following naming convention | `TC-AUTH-001` |
| **Title** | Concise description of what is being tested | Successful login with valid credentials |
| **Module** | Feature area / component | Authentication |
| **Priority** | Execution priority (P1–P4) | P1 |
| **Test Type** | Smoke / Regression / Exploratory / UAT | Smoke, Regression |
| **Preconditions** | State required before execution | User account exists; user is on login page |
| **Test Data** | Specific data needed | Username: `testuser@example.com`, Password: `ValidP@ss1` |
| **Linked Requirement** | Traceability to requirement/story | REQ-AUTH-010 / US-42 |
| **Created By** | Author | V. Kumar |
| **Last Updated** | Date of last revision | 2026-03-09 |

**Steps:**

| Step # | Action | Expected Result | Actual Result | Status |
|---|---|---|---|---|
| 1 | Navigate to `/login` | Login page displays with email and password fields | | |
| 2 | Enter valid email in the email field | Email is accepted, no validation error | | |
| 3 | Enter valid password in the password field | Password is masked, no validation error | | |
| 4 | Click "Sign In" button | User is redirected to `/dashboard`; welcome message displays | | |
| 5 | Verify session token in browser dev tools | Auth cookie / token is set with secure flags | | |

**Postconditions:** User is authenticated and on the dashboard.

---

### 4.2 Naming Convention

```
TC-[MODULE]-[NUMBER]

Where:
  TC     = Test Case prefix
  MODULE = 2-5 letter module abbreviation
  NUMBER = Zero-padded sequential number (001–999)
```

**Module Abbreviations:**

| Module | Abbreviation | Example IDs |
|---|---|---|
| Authentication | AUTH | TC-AUTH-001 |
| User Management | USER | TC-USER-001 |
| Dashboard | DASH | TC-DASH-001 |
| Search | SRCH | TC-SRCH-001 |
| Payments | PAY | TC-PAY-001 |
| Notifications | NOTIF | TC-NOTIF-001 |
| Settings | SET | TC-SET-001 |
| Reports | RPT | TC-RPT-001 |
| API | API | TC-API-001 |
| Admin | ADMIN | TC-ADMIN-001 |

**Related Naming Conventions:**

| Artifact | Pattern | Example |
|---|---|---|
| Test Case | `TC-[MODULE]-[###]` | TC-AUTH-001 |
| Defect | `DEF-[MODULE]-[###]` | DEF-AUTH-042 |
| Test Suite | `TS-[MODULE]-[TYPE]` | TS-AUTH-REGRESSION |
| Test Run | `TR-[BUILD]-[DATE]` | TR-v2.1.0-20260309 |
| Requirement | `REQ-[MODULE]-[###]` | REQ-AUTH-010 |

---

### 4.3 Test Suite Organisation

#### By Feature Module

| Suite ID | Suite Name | Module | Test Count | Types Included |
|---|---|---|---|---|
| TS-AUTH-SMOKE | Auth Smoke Suite | AUTH | 5 | Smoke |
| TS-AUTH-REGRESSION | Auth Regression Suite | AUTH | 25 | Regression |
| TS-PAY-SMOKE | Payments Smoke Suite | PAY | 8 | Smoke |
| TS-PAY-REGRESSION | Payments Regression Suite | PAY | 40 | Regression |
| TS-DASH-REGRESSION | Dashboard Regression Suite | DASH | 15 | Regression |

#### By Test Type

| Type | Purpose | When to Run | Typical Size |
|---|---|---|---|
| **Smoke** | Verify critical paths work after deployment | Every build / deploy | 10–20 cases |
| **Regression** | Verify existing functionality not broken | Every sprint / release | 50–200 cases |
| **Exploratory** | Discover unknown issues through unscripted investigation | Ad-hoc, per charter | N/A (time-boxed) |
| **UAT** | Validate business requirements with stakeholders | Pre-release | 20–50 cases |

---

### 4.4 Traceability Matrix

| Requirement ID | Requirement Description | Test Case IDs | Execution Status | Defects |
|---|---|---|---|---|
| REQ-AUTH-010 | User can log in with email/password | TC-AUTH-001, TC-AUTH-002, TC-AUTH-003 | 2 Pass, 1 Fail | DEF-AUTH-042 |
| REQ-AUTH-020 | Password reset via email link | TC-AUTH-010, TC-AUTH-011 | 2 Pass | — |
| REQ-PAY-001 | Process credit card payment | TC-PAY-001, TC-PAY-002, TC-PAY-003, TC-PAY-004 | 3 Pass, 1 Blocked | DEF-PAY-008 |
| REQ-SRCH-005 | Full-text search returns relevant results | TC-SRCH-001, TC-SRCH-002 | 2 Pass | — |
| REQ-NOTIF-001 | Email notification on order completion | TC-NOTIF-001 | 1 Not Run | — |

**Coverage Metrics:**

```
Total Requirements:      25
Requirements with TCs:   23 (92%)
Requirements without:     2 (8%)  ← coverage gap
Total Test Cases:        85
Executed:                72 (85%)
Not Executed:            13 (15%)
```

---

### 4.5 Test Execution Run Sheet

**Run Header:**

| Field | Value |
|---|---|
| Run ID | TR-v2.1.0-20260309 |
| Build Version | v2.1.0-rc1 |
| Environment | Staging |
| Executed By | V. Kumar |
| Date | 2026-03-09 |
| Run Type | Regression |
| Entry Criteria Met? | Yes |

**Execution Log:**

| # | Test Case ID | Title | Priority | Status | Defect ID | Notes |
|---|---|---|---|---|---|---|
| 1 | TC-AUTH-001 | Login with valid credentials | P1 | Pass | — | |
| 2 | TC-AUTH-002 | Login with invalid password | P1 | Pass | — | |
| 3 | TC-AUTH-003 | Login with locked account | P2 | Fail | DEF-AUTH-042 | Error message not displayed |
| 4 | TC-PAY-001 | Process Visa payment | P1 | Pass | — | |
| 5 | TC-PAY-002 | Process expired card | P2 | Blocked | — | Payment gateway down |
| 6 | TC-DASH-001 | Dashboard loads after login | P1 | Pass | — | |

**Run Summary:**

| Metric | Count | Percentage |
|---|---|---|
| Total | 85 | 100% |
| Pass | 72 | 85% |
| Fail | 5 | 6% |
| Blocked | 3 | 4% |
| Not Run | 5 | 6% |

---

### 4.6 Defect Report Template

| Field | Value |
|---|---|
| **Defect ID** | DEF-AUTH-042 |
| **Title** | Locked account login shows generic error instead of account-locked message |
| **Severity** | Major (S2) |
| **Priority** | P1 |
| **Module** | Authentication |
| **Found In Build** | v2.1.0-rc1 |
| **Environment** | Staging |
| **Reported By** | V. Kumar |
| **Date Reported** | 2026-03-09 |
| **Assigned To** | J. Developer |
| **Status** | Open |
| **Linked Test Case** | TC-AUTH-003 |
| **Linked Requirement** | REQ-AUTH-010 |

**Steps to Reproduce:**

1. Create a user account and lock it (5 failed login attempts).
2. Navigate to `/login`.
3. Enter the locked account's email and correct password.
4. Click "Sign In".

**Expected Result:**
Error message: "Your account has been locked. Please contact support or reset your password."

**Actual Result:**
Generic error message: "Login failed. Please try again." — no indication the account is locked.

**Screenshots:**

| Screenshot | Description |
|---|---|
| `defect-auth-042-actual.png` | Generic error message displayed |
| `defect-auth-042-expected.png` | Mockup of expected locked-account message |

**Additional Information:**
- Browser: Chrome 120, Firefox 121 (reproduced in both)
- The server returns HTTP 423 (Locked) but the front-end maps all 4xx errors to the same message.

---

### 4.7 Test Summary Report

**Report Header:**

| Field | Value |
|---|---|
| Project | MyApp v2.1.0 |
| Test Phase | System Testing — Regression |
| Build | v2.1.0-rc1 |
| Environment | Staging |
| Period | 2026-03-07 to 2026-03-09 |
| Prepared By | V. Kumar |

**Execution Summary:**

| Metric | Count | % |
|---|---|---|
| Total Test Cases | 85 | 100% |
| Passed | 72 | 85% |
| Failed | 5 | 6% |
| Blocked | 3 | 4% |
| Not Run | 5 | 6% |

**Defect Summary:**

| Severity | Open | In Progress | Resolved | Closed | Total |
|---|---|---|---|---|---|
| Critical (S1) | 0 | 0 | 0 | 0 | 0 |
| Major (S2) | 1 | 1 | 0 | 0 | 2 |
| Minor (S3) | 2 | 0 | 1 | 0 | 3 |
| Trivial (S4) | 0 | 0 | 0 | 1 | 1 |
| **Total** | **3** | **1** | **1** | **1** | **6** |

**Requirement Coverage:**

| Metric | Count | % |
|---|---|---|
| Total Requirements | 25 | 100% |
| Covered by Test Cases | 23 | 92% |
| Fully Passed | 20 | 80% |
| Partially Passed | 3 | 12% |
| Not Covered | 2 | 8% |

**Risk Assessment:**
- 2 uncovered requirements (REQ-NOTIF-003, REQ-RPT-005) — scheduled for next sprint.
- 1 open Major defect (DEF-AUTH-042) — blocks release if not fixed.
- 3 blocked tests due to payment gateway outage — re-execution scheduled for 2026-03-10.

**Recommendation:**
Conditional Go — release after DEF-AUTH-042 is resolved and blocked tests are re-executed.

---

### 4.8 Smoke Test Checklist

**Purpose:** Rapid verification that the build is stable enough for further testing.

| # | Check | Module | Expected | Pass/Fail |
|---|---|---|---|---|
| 1 | Application URL is accessible | INFRA | HTTP 200 on homepage | |
| 2 | Login with valid credentials | AUTH | Redirect to dashboard | |
| 3 | Create a new record | CORE | Record saved, confirmation shown | |
| 4 | Search for existing record | SRCH | Results returned within 3s | |
| 5 | Edit an existing record | CORE | Changes saved successfully | |
| 6 | Delete a record | CORE | Record removed, confirmation shown | |
| 7 | Process a payment | PAY | Payment succeeds, receipt generated | |
| 8 | Send a notification | NOTIF | Notification delivered | |
| 9 | View a report | RPT | Report renders with data | |
| 10 | Logout | AUTH | Session terminated, redirect to login | |

**Verdict:** Pass / Fail (if any item fails → Reject Build)

---

### 4.9 Regression Test Checklist

**Purpose:** Verify that new changes have not broken existing functionality.

| # | Area | Test Suite | Case Count | Executed | Passed | Failed | Blocked |
|---|---|---|---|---|---|---|---|
| 1 | Authentication | TS-AUTH-REGRESSION | 25 | | | | |
| 2 | User Management | TS-USER-REGRESSION | 18 | | | | |
| 3 | Dashboard | TS-DASH-REGRESSION | 15 | | | | |
| 4 | Search | TS-SRCH-REGRESSION | 12 | | | | |
| 5 | Payments | TS-PAY-REGRESSION | 40 | | | | |
| 6 | Notifications | TS-NOTIF-REGRESSION | 10 | | | | |
| 7 | Settings | TS-SET-REGRESSION | 8 | | | | |
| 8 | Reports | TS-RPT-REGRESSION | 12 | | | | |
| **Total** | | | **140** | | | | |

---

### 4.10 Exploratory Testing Charter

| Field | Value |
|---|---|
| **Charter ID** | EXP-AUTH-001 |
| **Charter Title** | Explore authentication edge cases |
| **Module** | Authentication |
| **Tester** | V. Kumar |
| **Time Box** | 60 minutes |
| **Date** | 2026-03-09 |

**Mission:**
Explore the authentication module's behaviour under unusual inputs, rapid actions, and boundary conditions to discover issues not covered by scripted test cases.

**Areas to Explore:**
- SQL injection / XSS in email and password fields
- Unicode / emoji in username and password
- Rapid repeated login attempts (rate limiting)
- Concurrent sessions from multiple browsers
- Session behaviour after token expiry
- Browser back-button after logout

**Notes / Observations:**

| Time | Observation | Severity | Defect Filed? |
|---|---|---|---|
| 0:05 | Unicode in password accepted — login succeeds | Info | No |
| 0:15 | 50 rapid login attempts → no rate limiting triggered | Major | DEF-AUTH-050 |
| 0:25 | Back button after logout shows cached dashboard | Minor | DEF-AUTH-051 |
| 0:40 | Token expiry shows blank page instead of redirect | Serious | DEF-AUTH-052 |

**Debrief:**
- 3 defects filed; 1 Serious, 1 Major, 1 Minor
- Rate limiting is absent — recommend adding before release
- Session invalidation needs hardening

---

### 4.11 UAT Sign-Off Template

| Field | Value |
|---|---|
| **Project** | MyApp v2.1.0 |
| **UAT Phase** | Pre-Release UAT |
| **Environment** | UAT (uat.example.com) |
| **Build** | v2.1.0-rc2 |
| **Period** | 2026-03-10 to 2026-03-12 |

**Business Scenarios Verified:**

| # | Business Scenario | Req ID | Tester | Status | Comments |
|---|---|---|---|---|---|
| 1 | New customer registration and first purchase | REQ-USER-001, REQ-PAY-001 | Business Analyst A | Pass | |
| 2 | Returning customer with saved payment method | REQ-PAY-005 | Business Analyst A | Pass | |
| 3 | Admin creates promotional discount | REQ-ADMIN-010 | Product Owner | Pass | |
| 4 | Customer receives order confirmation email | REQ-NOTIF-001 | Business Analyst B | Fail | Email delayed by 15 min |
| 5 | Monthly sales report generation | REQ-RPT-001 | Finance Lead | Pass | |

**Open Issues:**

| Defect ID | Title | Severity | Impact on Go-Live |
|---|---|---|---|
| DEF-NOTIF-010 | Order confirmation email delayed | Minor | Acceptable — monitoring in place |

**Sign-Off:**

| Role | Name | Decision | Signature | Date |
|---|---|---|---|---|
| Product Owner | A. Manager | **Go** | __________ | 2026-03-12 |
| QA Lead | V. Kumar | **Go** | __________ | 2026-03-12 |
| Business Analyst | B. Analyst | **Go** | __________ | 2026-03-12 |
| Dev Lead | J. Developer | **Go** | __________ | 2026-03-12 |

**Decision:** **GO** — All critical and major scenarios pass. One minor issue accepted with monitoring.

---

## 5 Configuration

### 5.1 Priority Definitions

| Priority | Label | Description | SLA for Execution |
|---|---|---|---|
| **P1** | Critical | Must-test for every build — blocks release if not executed | Same day as build |
| **P2** | High | Core functionality — must complete within sprint | Within 2 days |
| **P3** | Medium | Important but not blocking — regression candidates | Within the sprint |
| **P4** | Low | Nice-to-have, edge cases, cosmetic validations | Next available cycle |

### 5.2 Severity Definitions

| Severity | Code | Label | Description | Examples |
|---|---|---|---|---|
| **S1** | Critical | Showstopper | Application crash, data loss, security breach, no workaround | Login completely broken, payment charges wrong amount |
| **S2** | Major | Significant | Core feature broken with workaround, or data integrity issue | Cannot reset password (workaround: admin reset) |
| **S3** | Minor | Moderate | Non-core feature broken, cosmetic issue with functional impact | Sorting doesn't work on one column, alignment off on mobile |
| **S4** | Trivial | Cosmetic | UI polish, typos, minor visual inconsistencies, no functional impact | Typo in footer, slightly off padding on one page |

### 5.3 Priority × Severity Response Matrix

| | S1 Critical | S2 Major | S3 Minor | S4 Trivial |
|---|---|---|---|---|
| **P1** | Fix immediately — blocks release | Fix before release | Fix if time permits | Backlog |
| **P2** | Fix before release | Fix in current sprint | Schedule for next sprint | Backlog |
| **P3** | Fix in current sprint | Schedule for next sprint | Backlog | Backlog |
| **P4** | Schedule for next sprint | Backlog | Backlog | Won't fix (optional) |

---

## 6 Reporting

### 6.1 Test Summary Report Contents

Every test summary report must include:

1. **Header** — project, build, environment, date range, author
2. **Execution Summary** — total / pass / fail / blocked / not-run with percentages
3. **Defect Summary** — count by severity × status (open, in-progress, resolved, closed)
4. **Requirement Coverage** — % requirements covered by test cases, % passing
5. **Risk Assessment** — uncovered areas, open critical/major defects, blocked tests
6. **Recommendation** — Go / No-Go / Conditional Go with justification

### 6.2 Metrics to Track Over Time

| Metric | Formula | Target |
|---|---|---|
| Test Case Pass Rate | (Passed / Executed) × 100 | ≥ 95% for release |
| Requirement Coverage | (Reqs with TCs / Total Reqs) × 100 | 100% |
| Defect Discovery Rate | Defects found / Test cases executed | Decreasing trend |
| Defect Leakage Rate | Production defects / Total defects found | < 5% |
| Test Execution Progress | Executed / Total planned × 100 | 100% by exit date |
| Blocked Test Ratio | Blocked / Total × 100 | < 5% |

---

## 7 CI/CD Integration

Manual testing is inherently human-driven, but it integrates with CI/CD through process gates:

### 7.1 Pipeline Integration Points

```
┌─────────┐    ┌──────────┐    ┌────────────┐    ┌──────────┐    ┌──────────┐
│  Build   │──▶│ Auto     │──▶│  Manual    │──▶│  UAT     │──▶│ Release  │
│          │   │ Tests    │   │  Testing   │   │  Sign-off│   │          │
└─────────┘   └──────────┘   └────────────┘   └──────────┘   └──────────┘
                  Gate 1          Gate 2          Gate 3          Gate 4

Gate 1: All automated tests pass
Gate 2: Smoke checklist passes (entry criteria for regression)
Gate 3: Regression pass rate ≥ 95%, no open S1/S2
Gate 4: UAT sign-off obtained from all stakeholders
```

### 7.2 Entry/Exit Criteria

#### Smoke Testing

| Type | Criteria |
|---|---|
| **Entry** | Build deployed to test environment; automated tests pass; build is tagged |
| **Exit** | All smoke checklist items pass; OR build rejected with defect IDs |

#### Regression Testing

| Type | Criteria |
|---|---|
| **Entry** | Smoke test passes; test data loaded; test environment stable |
| **Exit** | ≥ 95% test cases executed; ≥ 90% pass rate; no open S1 defects; all S2 defects have fix timeline |

#### UAT

| Type | Criteria |
|---|---|
| **Entry** | Regression exit criteria met; UAT environment provisioned; stakeholders available |
| **Exit** | All business-critical scenarios pass; sign-off obtained from all stakeholders; open issues documented with acceptance |

#### Exploratory Testing

| Type | Criteria |
|---|---|
| **Entry** | Smoke test passes; charter approved; tester has domain knowledge |
| **Exit** | Time box completed; observations documented; defects filed; debrief completed |

---

## 8 Docker Setup

Manual testing does not require Docker, but the **test environment** should be containerised for consistency:

```yaml
# docker-compose.yml — Test Environment
version: '3.8'

services:
  app:
    image: ${APP_IMAGE:-your-app:latest}
    ports:
      - '3000:3000'
    environment:
      NODE_ENV: test
      DATABASE_URL: postgres://postgres:postgres@db:5432/testdb
    depends_on:
      db:
        condition: service_healthy

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: testdb
    volumes:
      - ./test-data/seed.sql:/docker-entrypoint-initdb.d/seed.sql
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U postgres']
      interval: 3s
      timeout: 3s
      retries: 5
```

```bash
# Spin up test environment
docker compose up -d

# Verify application health
curl http://localhost:3000/health

# Tear down after testing
docker compose down -v
```

---

## 9 Quality Checklist

### Template Completeness

- [ ] Test case template includes all fields: ID, title, priority, preconditions, steps, expected/actual results, status, linked requirement
- [ ] Naming convention defined and documented (`TC-[MODULE]-[###]`)
- [ ] Module abbreviation table covers all feature areas
- [ ] Traceability matrix links every requirement to test cases
- [ ] Defect report template includes severity, steps to reproduce, expected vs actual, screenshots, environment
- [ ] Test summary report covers execution stats, defect summary, coverage %, risk, recommendation

### Process Completeness

- [ ] Smoke checklist covers critical paths (10–20 items)
- [ ] Regression suites organised by module with case counts
- [ ] Exploratory testing charter template includes mission, areas, time box, observations
- [ ] UAT sign-off template includes business scenarios, open issues, stakeholder signatures
- [ ] Entry/exit criteria defined for every test phase
- [ ] Priority (P1–P4) and severity (S1–S4) definitions documented

### Traceability & Coverage

- [ ] Every requirement has at least one test case
- [ ] Every defect links back to a test case and requirement
- [ ] Coverage gaps are visible in the traceability matrix
- [ ] Test execution status rolls up to requirement-level coverage
- [ ] Metrics tracked over time (pass rate, defect leakage, coverage)

### Test Data Management

- [ ] Test data requirements documented per module
- [ ] Data dependencies identified (e.g., payment tests need sandbox credentials)
- [ ] Data refresh/reset process defined for test environments
- [ ] Sensitive data masked or synthetic in non-production environments
- [ ] Seed scripts or data setup procedures documented

---

## Appendix: Test Data Requirements Template

| Module | Data Needed | Source | Refresh Frequency | Owner |
|---|---|---|---|---|
| AUTH | 10 user accounts (various roles) | Seed script | Per test run | QA Lead |
| PAY | Sandbox credit card numbers | Payment gateway docs | Static | Dev Lead |
| SRCH | 1000 product records | Generated via faker | Weekly | Data Engineer |
| NOTIF | Valid email addresses (Mailhog) | Test config | Per environment | QA Lead |
| RPT | 3 months of transaction history | SQL seed file | Per environment | Data Engineer |
