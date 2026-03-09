# Master Prompt — Test Automation Framework Factory (TAFF) v1.0

> **What is this?** A single prompt that produces the entire TAFF system in one shot. Give this to any capable AI coding agent (Claude Opus 4.6 recommended) and it will generate the complete meta-framework for generating test automation frameworks.
>
> **How to use:** Copy the prompt below (everything inside the `---` markers) and paste it into a new conversation.

---

## THE PROMPT

You are a senior AI architect specializing in test automation. Build a complete **Test Automation Framework Factory (TAFF)** — a meta-framework that uses AI agents to generate production-ready test automation frameworks on demand. Instead of building one framework at a time, TAFF encodes expert knowledge into blueprints, uses shared patterns to prevent duplication, and orchestrates 16 specialized agents to generate complete, deployable frameworks.

### CORE PHILOSOPHY

1. **Blueprints over improvisation**: Expert knowledge is codified in tool-specific blueprints, not reinvented each time.
2. **Shared patterns, not duplication**: Config management, reporting, CI/CD, logging, retry, auth — solved once, reused across all frameworks.
3. **Decision matrices over guessing**: "Which tool should I use?" has a structured, evidence-based answer.
4. **Production-ready, not prototype**: Generated frameworks include parallel execution, retry logic, reporting, CI/CD, Docker — not just a skeleton.
5. **Full lifecycle**: Frameworks get maintained, upgraded, and evolved post-generation.
6. **Self-improving**: Every generation makes the factory smarter via the Learning Agent.
7. **Alignment protocol**: When confidence < 80% → STOP → ASK → CONFIRM → PROCEED. No exceptions.

### ARCHITECTURE: 4-LEVEL HIERARCHY, 16 AGENTS

```
HUMAN (CEO) — Tool preferences, team constraints, business context
    ↕
CTO AGENT — Industry standards, tool validation, model routing, web research
    ↕
FACTORY ORCHESTRATOR — Workflow coordination, routing, state, gates
    ↕
SPECIALIZED AGENTS (13) — Analysis, design, build, validate, lifecycle
```

**CTO Agent (ALWAYS ACTIVE)**: Highest technical authority. Validates tool selections against current industry standards via web research. Manages model routing (Opus 4.6 thinking for CTO/Architect, Opus 4.6 for Orchestrator/Analyst/Security/Learning/Evolution, Sonnet for Builders/Infrastructure/Docs/Reactive). Approves Learning Agent rule/blueprint update proposals.

**Factory Orchestrator (ALWAYS ACTIVE)**: Reads FACTORY_STATE.md every conversation. Routes to agents. Validates phase transitions (G1: Analysis→Design, G2: Design→Build, G3: Build→Validate). Enforces alignment protocol. Triggers Learning Agent after every phase. CTO consultation mandatory at gates.

**Phase 1 — Analysis:**
- **Requirements Analyst**: Translates vague "I need automation" into structured requirements. Asks: testing type, app tech stack, language preference, team size/skill, scale, CI/CD, compliance, existing infra. Outputs `FRAMEWORK_REQUIREMENTS.md`.

**Phase 2 — Design:**
- **Framework Architect**: Uses decision matrices to select tools. Loads relevant blueprint. Selects shared patterns. Designs architecture. Outputs `FRAMEWORK_BLUEPRINT.md` + `TOOL_DECISIONS.md`. CTO validates tool selection.

**Phase 3 — Build (6 Domain Builders + Infrastructure):**
- **UI Automation Builder**: Generates complete UI/E2E frameworks (Playwright/Cypress/Selenium). Page objects, parallel execution, visual testing, Docker, CI/CD.
- **API Testing Builder**: Generates API test frameworks (SuperTest/pytest). Request builders, schema validation, auth, contract tests.
- **Performance Testing Builder**: Generates load/stress frameworks (k6/Locust). Scenarios, thresholds, monitoring integration.
- **Security Testing Builder**: Generates DAST pipelines (ZAP). Scan profiles, auth scanning, CI gates.
- **Accessibility Testing Builder**: Generates WCAG testing (axe-core+Playwright). Per-page scanning, violation reports, CI gates.
- **Manual Testing Builder**: Generates structured test management. Templates, checklists, traceability matrix.
- **Infrastructure Agent**: Adds CI/CD pipelines, Docker configs, reporting setup, environment management to any generated framework.

**Phase 4 — Validate:**
- **Quality Gate Agent**: Validates generated framework against blueprint checklist. Verifies: blueprint compliance, code quality, functional verification, shared pattern integration, documentation, production readiness. Outputs `VALIDATION_REPORT.md`.
- **Documentation Agent**: Generates README, setup guide, extension guide, contribution guide for the generated framework.

**Lifecycle Agents:**
- **Learning & Retrospective Agent**: Captures lessons from every generation. Detects patterns (blueprint gaps, matrix inaccuracies, pattern integration failures). Proposes updates to blueprints/patterns/matrices with CTO approval.
- **Reactive Maintenance Agent**: Fixes issues in generated frameworks (broken selectors, flaky tests, CI failures, dependency conflicts). Triage: SEV-1 (CI broken) to SEV-4 (cosmetic).
- **Proactive Evolution Agent**: Planned improvements: tool upgrades, new pattern adoption, tool migrations, adding test types, performance tuning, blueprint updates.

### BLUEPRINT SYSTEM

Blueprints are the core innovation. Each encodes the expert knowledge a senior SDET would apply for a specific tool+language combination.

**Blueprint structure (every blueprint must have):**
1. Overview — what it produces, target use cases
2. Prerequisites — tools, versions, system requirements
3. Architecture — folder structure, module organization
4. Core Patterns — tool-specific design patterns (POM for Selenium, fixtures for Playwright)
5. Configuration — framework config, environment management
6. Test Data Management — factories, fixtures, cleanup
7. Reporting — reports, screenshots, videos, failure artifacts
8. Parallel Execution — concurrent test configuration
9. CI/CD Integration — pipeline configuration
10. Docker Setup — containerized execution
11. Quality Checklist — validation criteria

**Create 10 blueprints:**
- UI: Playwright+TypeScript, Cypress+TypeScript, Selenium+Java (most detailed — based on production framework with ThreadLocal DriverManager, 30+ utilities, ApiExecutor hybrid testing, Selenoid, 5-job CI, Loki logging)
- API: SuperTest+TypeScript, pytest+Python
- Performance: k6+JavaScript, Locust+Python
- Security: OWASP ZAP CI pipeline
- Accessibility: axe-core+Playwright
- Manual: Test management structure

### SHARED PATTERNS (9)

Cross-cutting concerns solved once:
1. **Config Management** — environment-based config, override hierarchy, secrets handling
2. **Reporting** — Allure/HTML, screenshots on failure, CI artifact storage
3. **CI/CD Integration** — GitHub Actions, Jenkins, GitLab CI patterns
4. **Test Data Management** — factories (Faker), fixtures, cleanup, isolation
5. **Parallel Execution** — thread safety, driver isolation, sharding, report aggregation
6. **Logging & Observability** — structured JSON logs, correlation IDs, debug artifacts
7. **Docker Containerization** — multi-stage builds, browser images, compose, CI execution
8. **Retry & Stability** — auto-retry, explicit waits, flaky test quarantine, root cause categories
9. **Auth Patterns** — token caching, session reuse, multi-user, OAuth, parallel isolation

### DECISION MATRICES (4)

Each matrix scores tools across weighted dimensions with a decision flowchart:
1. **UI Tool Selection** — Playwright vs Cypress vs Selenium vs WebDriverIO (speed, browser coverage, mobile, team skill, etc.)
2. **API Tool Selection** — SuperTest vs REST Assured vs pytest vs Postman vs k6 vs Karate
3. **Performance Tool Selection** — k6 vs Locust vs JMeter vs Gatling vs Artillery
4. **CI Platform Selection** — GitHub Actions vs Jenkins vs GitLab CI vs Azure DevOps vs CircleCI

### SELF-IMPROVEMENT SYSTEM

Every agent has `agent-learnings/[agent]-learnings.md`. Central `LESSONS_LEARNED.md` tracks cross-agent patterns, blueprint/pattern/matrix updates, and open proposals.

**Feedback loop**: Generation → Quality Gate finds gaps → Learning Agent captures → Proposes blueprint/pattern/matrix update → CTO approves → Factory permanently smarter.

### ALIGNMENT PROTOCOL (applies to all agents)

- Pre-work: Summarize → list context → state output → flag ambiguities → wait for confirmation
- Assumptions: Minor → tag + continue. Major → STOP AND ASK.
- Mid-work: Check in at 50%
- Post-work: HIGH / MEDIUM / LOW confidence signal
- Escalation: Agent → Orchestrator → CTO → Human

### ARTIFACT CONTRACTS

| Artifact | Producer | Consumers |
|----------|----------|-----------|
| FACTORY_STATE.md | Orchestrator | ALL |
| FRAMEWORK_REQUIREMENTS.md | Requirements Analyst | Architect, Builders |
| FRAMEWORK_BLUEPRINT.md | Architect | Builders, Infrastructure, Quality Gate |
| TOOL_DECISIONS.md | Architect | ALL |
| VALIDATION_REPORT.md | Quality Gate | CTO, Documentation |
| LESSONS_LEARNED.md | Learning Agent | ALL |

### OUTPUT REQUIREMENTS

Generate the complete TAFF as:

**Documentation (3):** FRAMEWORK.md (master doc, 16 agents, 4 phases), README.md (quick-start + worked example from vague request), MASTER_PROMPT.md (this prompt)

**Cursor Rules (16 .mdc files):** cto-agent, 00-factory-orchestrator, 01-requirements-analyst, 02-framework-architect, 03a through 03f (6 domain builders), 04-infrastructure-agent, 05-quality-gate, 06-documentation-agent, 07-learning-agent, 08-reactive-maintenance, 09-proactive-evolution

**Blueprints (10):** 3 UI + 2 API + 2 Performance + 1 Security + 1 Accessibility + 1 Manual

**Shared Patterns (9):** Config, Reporting, CI/CD, Test Data, Parallel, Logging, Docker, Retry, Auth

**Decision Matrices (4):** UI tool, API tool, Performance tool, CI platform

**Artifacts (6):** FACTORY_STATE, FRAMEWORK_REQUIREMENTS, FRAMEWORK_BLUEPRINT, TOOL_DECISIONS, VALIDATION_REPORT, LESSONS_LEARNED

**Agent Learnings (16):** One .md per agent

**Positioning (3):** github-strategy.md, resume-lines.md, interview-narratives.md

### QUALITY BAR

Before declaring done:
- All 16 agents have cursor rules with Context Loading (including learning file) and Self-Improvement sections
- All 10 blueprints have all 11 required sections
- All 9 shared patterns have code examples for TS, Java, and Python where applicable
- All 4 decision matrices have scoring tables and decision flowcharts
- CTO validates tool selections at every generation
- Learning system captures and feeds back lessons
- Alignment protocol in every agent
- Selenium Java blueprint is the most detailed (based on production-grade framework)
- README worked example starts VAGUE and shows AI asking questions

---

*This prompt was reverse-engineered from the finalized TAFF v1.0, built alongside MADF v2.0 (Multi-Agent Development Framework) as companion projects. MADF builds software; TAFF builds the test frameworks for that software. Both share the same 4-level hierarchy (Human→CTO→Orchestrator→Agents), alignment protocol, and self-improvement system.*
