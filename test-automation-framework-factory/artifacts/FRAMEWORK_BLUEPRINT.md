# Framework Blueprint

> **Produced by**: Framework Architect
> **Consumed by**: Domain Builders, Infrastructure Agent, Quality Gate
> **Updated**: Phase 2 output
>
> Last updated: [DATE] | Phase: 2 | Status: [Draft/Approved]

---

## Selected Tool

**Tool**: [TOOL_NAME]
**Version**: [VERSION]
**Blueprint**: [blueprints/category/blueprint-file.md]

## Shared Patterns Applied

| Pattern | File | Customization |
|---------|------|--------------|
| Config Management | `shared-patterns/config-management.md` | [None / custom notes] |
| Reporting | `shared-patterns/reporting.md` | [Format: Allure / HTML] |
| CI/CD Integration | `shared-patterns/ci-cd-integration.md` | [Platform: GitHub Actions / Jenkins] |
| [ADDITIONAL_PATTERN] | [FILE] | [NOTES] |

## Architecture

```
[FRAMEWORK_NAME]/
├── src/
│   ├── config/           ← Environment configuration
│   ├── pages/            ← Page objects (UI) / endpoints (API)
│   ├── utils/            ← Utilities, helpers, custom assertions
│   ├── data/             ← Test data factories and fixtures
│   └── reporting/        ← Custom reporting helpers
├── tests/
│   ├── smoke/            ← Smoke test suite
│   ├── regression/       ← Full regression suite
│   └── [CATEGORY]/       ← Additional test categories
├── config/
│   ├── local.env
│   ├── staging.env
│   └── production.env
├── docker/
│   ├── Dockerfile
│   └── docker-compose.yml
├── .github/workflows/    ← CI/CD pipeline
├── reports/              ← Generated reports (gitignored)
├── [CONFIG_FILE]         ← Framework config (playwright.config.ts, pom.xml, etc.)
├── package.json          ← Dependencies (or pom.xml, requirements.txt)
└── README.md
```

## Core Modules

| Module | Purpose | Blueprint Reference |
|--------|---------|-------------------|
| [MODULE_NAME] | [PURPOSE] | [Blueprint section] |

## Customizations from Blueprint

| Blueprint Default | Custom Change | Reason |
|-------------------|--------------|--------|
| [DEFAULT] | [CHANGE] | [REASON] |

## Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| [PACKAGE] | [VERSION] | [PURPOSE] |

## Configuration Plan

| Config Key | Description | Default | Per-Environment |
|-----------|-------------|---------|----------------|
| [KEY] | [DESC] | [DEFAULT] | [Yes/No] |

## Quality Checklist

Derived from blueprint + requirements:

- [ ] [CHECKLIST_ITEM_1]
- [ ] [CHECKLIST_ITEM_2]
- [ ] [CHECKLIST_ITEM_3]
