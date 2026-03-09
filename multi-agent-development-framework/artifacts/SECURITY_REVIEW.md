# Security Review

> **Security Agent Output** — Security assessment findings and recommendations. Fill out during build phase.

---

## Header

| Field | Value |
|-------|-------|
| **Version** | `1.0.0` |
| **Date** | `YYYY-MM-DD` |
| **Review Scope** | `Full application` / `API only` / `Frontend only` |
| **Overall Risk Rating** | `Low` / `Medium` / `High` / `Critical` |

---

## Executive Summary

*One paragraph summarizing the security posture, key findings, and recommended actions.*

> The application was reviewed for common vulnerabilities including authentication, input validation, and dependency risks. [X] critical, [Y] high, and [Z] medium findings were identified. The most significant issues include [brief list]. Immediate remediation is recommended for [top 2-3 items]. Overall risk is rated as [Low/Medium/High].

---

## Findings

| ID | Severity | Category | Location | Description | Remediation | Status |
|----|----------|----------|----------|-------------|-------------|--------|
| SEC-001 | Critical | Auth | `auth/login.ts` | Hardcoded JWT secret | Move to env var, rotate secret | Open |
| SEC-002 | High | Input | `api/users.ts` | No SQL injection protection | Use parameterized queries | Open |
| SEC-003 | Medium | Deps | `package.json` | Outdated `lodash` with known vuln | Upgrade to 4.17.21+ | Fixed |
| SEC-004 | Low | Headers | `server.ts` | Missing CSP header | Add Content-Security-Policy | Accepted |

*Severity: Critical | High | Medium | Low*  
*Status: Open | Fixed | Accepted (risk accepted with justification)*

---

## Authentication & Authorization Review

| Check | Status | Notes |
|-------|--------|------|
| Passwords hashed (bcrypt/argon2) | ✅ / ❌ | |
| JWT/Token storage secure | ✅ / ❌ | |
| Session timeout configured | ✅ / ❌ | |
| Role-based access enforced | ✅ / ❌ | |
| Password reset flow secure | ✅ / ❌ | |
| MFA available (if required) | ✅ / ❌ | |

### Findings

- *[Detail any auth/authz issues]*

---

## Input Validation Review

| Check | Status | Notes |
|-------|--------|------|
| All user input validated | ✅ / ❌ | |
| SQL injection prevented | ✅ / ❌ | |
| XSS prevention (output encoding) | ✅ / ❌ | |
| File upload validation | ✅ / ❌ | |
| Request size limits | ✅ / ❌ | |
| Schema validation (e.g., Zod, Joi) | ✅ / ❌ | |

### Findings

- *[Detail any input validation issues]*

---

## Dependency Audit

| Field | Value |
|-------|-------|
| **Tool Used** | `npm audit` / `Snyk` / `Dependabot` / `OWASP Dependency-Check` |
| **Findings Count** | Critical: X, High: Y, Medium: Z, Low: N |
| **Critical Dependencies** | List packages with critical vulns |

### Audit Output (Summary)

```
# npm audit summary
critical: 0
high: 2
medium: 5
low: 12
```

### Action Items

| Package | Issue | Fix |
|---------|-------|-----|
| `axios` | CVE-2023-XXXX | Upgrade to 1.6.0+ |

---

## Secrets Management Review

| Check | Status | Notes |
|-------|--------|------|
| No secrets in source code | ✅ / ❌ | |
| Secrets in env vars / vault | ✅ / ❌ | |
| .env in .gitignore | ✅ / ❌ | |
| No secrets in logs | ✅ / ❌ | |
| API keys rotated | ✅ / ❌ | |

### Findings

- *[Detail any secrets management issues]*

---

## CORS / CSP / Headers Review

| Header | Configured | Value/Notes |
|--------|------------|-------------|
| `Access-Control-Allow-Origin` | ✅ / ❌ | |
| `Content-Security-Policy` | ✅ / ❌ | |
| `X-Content-Type-Options` | ✅ / ❌ | `nosniff` |
| `X-Frame-Options` | ✅ / ❌ | `DENY` or `SAMEORIGIN` |
| `Strict-Transport-Security` | ✅ / ❌ | `max-age=31536000` |
| `Referrer-Policy` | ✅ / ❌ | |

### Findings

- *[Detail any header/CORS/CSP issues]*

---

## OWASP Top 10 Checklist

| # | Category | Status | Notes |
|---|----------|--------|-------|
| A01 | Broken Access Control | ✅ / ❌ | |
| A02 | Cryptographic Failures | ✅ / ❌ | |
| A03 | Injection | ✅ / ❌ | |
| A04 | Insecure Design | ✅ / ❌ | |
| A05 | Security Misconfiguration | ✅ / ❌ | |
| A06 | Vulnerable Components | ✅ / ❌ | |
| A07 | Auth/Session Failures | ✅ / ❌ | |
| A08 | Software/Data Integrity | ✅ / ❌ | |
| A09 | Logging/Monitoring | ✅ / ❌ | |
| A10 | SSRF | ✅ / ❌ | |

---

## Recommendations

### Priority 1 (Immediate)

1. *[Critical fix 1]*
2. *[Critical fix 2]*

### Priority 2 (Within 2 weeks)

1. *[High-priority fix 1]*
2. *[High-priority fix 2]*

### Priority 3 (Next quarter)

1. *[Medium-priority improvement 1]*
2. *[Medium-priority improvement 2]*

---

## Instructions for Security Agent

1. Replace all placeholder values with actual findings.
2. Run dependency audit and populate Dependency Audit section.
3. Ensure every finding has ID, Severity, Remediation, and Status.
4. Complete OWASP Top 10 checklist for the review scope.
5. Prioritize recommendations by impact and effort.
