---
name: stride-threat-model
description: "STRIDE threat modeling + OWASP Top 10 audit with confidence-gated findings and exploit scenarios. Inspired by gstack /cso."
origin: MADF+gstack
---

# STRIDE Threat Model — Security Audit Skill

Systematic threat modeling that thinks like an attacker. Every finding includes a concrete exploit scenario.

## When to Use

- During Phase 4d (Security Agent's audit)
- Before G5 gate validation
- When adding auth, payments, file uploads, or any trust boundary
- When integrating third-party services
- After discovering a vulnerability (expand scope)
- On request: `/cso` or `/security`

## Philosophy

Security testing is adversarial thinking. Don't just check boxes — ask: "If I were a determined attacker with access to [X], what would I try?" Every finding must include a concrete exploit scenario, not just a category label.

## STRIDE Categories

| Category | Threat | Question to Ask |
|----------|--------|-----------------|
| **S**poofing | Identity | Can an attacker pretend to be someone else? |
| **T**ampering | Data integrity | Can data be modified in transit or at rest? |
| **R**epudiation | Audit trail | Can actions be performed without evidence? |
| **I**nformation Disclosure | Confidentiality | Can sensitive data leak to unauthorized users? |
| **D**enial of Service | Availability | Can the system be made unavailable? |
| **E**levation of Privilege | Authorization | Can a user gain permissions they shouldn't have? |

## The Audit Process

### Step 1: Map the Attack Surface

Before auditing code, build a threat map:

```markdown
## Attack Surface Map

### Trust Boundaries
- [ ] Browser ↔ API (untrusted → trusted)
- [ ] API ↔ Database (trusted → trusted, but SQL injection risk)
- [ ] API ↔ Third-party service (trusted → semi-trusted)
- [ ] Admin panel ↔ API (elevated trust)

### Data Flows
- [ ] User input → API → Database (injection path)
- [ ] File upload → Storage → Serving (file traversal path)
- [ ] Auth token → Cookie/Header → Validation (spoofing path)
- [ ] API response → Client rendering (XSS path)

### Assets to Protect
- [ ] User credentials (passwords, tokens)
- [ ] PII (names, emails, phone numbers)
- [ ] Financial data (if applicable)
- [ ] Business logic (pricing, permissions)
- [ ] Infrastructure secrets (API keys, DB credentials)
```

### Step 2: OWASP Top 10 Audit

For each OWASP category, check systematically:

| # | Category | Key Checks |
|---|----------|-----------|
| A01 | Broken Access Control | IDOR, missing auth on endpoints, privilege escalation, CORS misconfiguration |
| A02 | Cryptographic Failures | Weak hashing, plaintext secrets, missing HTTPS, insecure token generation |
| A03 | Injection | SQL, NoSQL, OS command, LDAP, XSS (stored, reflected, DOM) |
| A04 | Insecure Design | Missing rate limiting, business logic flaws, missing account lockout |
| A05 | Security Misconfiguration | Default credentials, verbose errors, missing headers, unnecessary features |
| A06 | Vulnerable Components | Known CVEs in dependencies, outdated packages |
| A07 | Auth Failures | Brute force, credential stuffing, weak password policy, missing MFA |
| A08 | Data Integrity Failures | Insecure deserialization, missing integrity checks on updates |
| A09 | Logging Failures | Missing audit trail, PII in logs, no alerting on security events |
| A10 | SSRF | Server-side requests with user-controlled URLs |

### Step 3: STRIDE Analysis Per Component

For each major component (auth, API, file handling, etc.):

```markdown
### Component: [Authentication]

| STRIDE | Threat | Exploit Scenario | Severity | Confidence |
|--------|--------|-----------------|----------|------------|
| Spoofing | JWT without expiry | Attacker steals token from localStorage, uses it indefinitely. No rotation means token works until secret changes. | Critical | 9/10 |
| Tampering | Unsigned session data | Attacker modifies client-side session cookie to change user role from "user" to "admin". | High | 8/10 |
| Repudiation | No audit log on admin actions | Admin deletes user data, no record exists. User disputes, no evidence. | Medium | 7/10 |
```

### Step 4: Confidence Gate

**Only report findings with confidence ≥ 8/10.**

| Confidence | Meaning | Action |
|-----------|---------|--------|
| 9-10 | Verified — you can demonstrate the exploit | Report as confirmed |
| 8 | High confidence — code clearly shows the vulnerability | Report with evidence |
| 6-7 | Likely — pattern suggests vulnerability but can't confirm | Flag for manual review, don't report as finding |
| ≤ 5 | Possible — theoretical risk without code evidence | Do NOT report |

### Step 5: False Positive Tracking

Maintain a false positive log to avoid re-flagging known non-issues:

```markdown
## Known False Positives
| Pattern | Reason Not a Risk | Date Added |
|---------|-------------------|------------|
| CSP missing on /api/* | API endpoints return JSON, not HTML — CSP not applicable | 2026-01-15 |
| console.log in test files | Test-only, not production code | 2026-01-15 |
```

## Finding Format

Every finding MUST include:

```markdown
### [FINDING-ID]: [Title]
- **STRIDE Category**: [S/T/R/I/D/E]
- **OWASP Category**: [A01-A10]
- **Severity**: Critical / High / Medium / Low
- **Confidence**: [8-10]/10
- **Location**: `file:line` — exact code reference
- **Exploit Scenario**: [Step-by-step: how an attacker would exploit this]
- **Evidence**: [Code snippet showing the vulnerability]
- **Remediation**: [Specific fix with code example]
- **Status**: Open / Fixed / Accepted Risk
```

## Integration with MADF

| MADF Component | STRIDE Integration |
|----------------|-------------------|
| Security Agent (07) | Runs STRIDE as primary methodology |
| SECURITY_REVIEW.md | Includes STRIDE section with attack surface map |
| G4 Gate | No Critical/High findings with confidence ≥ 8 |
| G5 Gate | Full STRIDE audit completed, all Critical/High resolved |
| Learning Agent | Tracks false positives and recurring patterns |

## Anti-Patterns

- **Checkbox auditing** — checking categories without thinking adversarially
- **Reporting low-confidence findings** — noise drowns out real issues
- **Generic remediation** — "fix this vulnerability" without specific code changes
- **Ignoring business logic** — STRIDE is about YOUR app's logic, not just OWASP generics
- **No exploit scenario** — if you can't explain how to exploit it, it might not be real
