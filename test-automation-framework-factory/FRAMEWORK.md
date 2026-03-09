# Test Automation Framework Factory (TAFF) v1.0

> **Purpose**: A meta-framework that generates production-ready test automation frameworks using AI agents. Instead of building one framework at a time, TAFF encodes expert knowledge into blueprints, shared patterns, and decision matrices — then orchestrates specialized AI agents to generate complete, deployable testing frameworks on demand.

---

## Table of Contents

1. [Philosophy](#philosophy)
2. [Architecture Overview](#architecture-overview)
3. [The 16 Agents](#the-16-agents)
4. [CTO Agent & Model Routing](#cto-agent--model-routing)
5. [Workflow: 4 Phases](#workflow-4-phases)
6. [Blueprint System](#blueprint-system)
7. [Shared Patterns](#shared-patterns)
8. [Decision Matrices](#decision-matrices)
9. [Artifact Contracts](#artifact-contracts)
10. [Learning & Self-Improvement](#learning--self-improvement)
11. [Maintenance Agents](#maintenance-agents)
12. [Alignment & Clarity Protocol](#alignment--clarity-protocol)
13. [How to Use This Framework](#how-to-use-this-framework)
14. [File Structure Reference](#file-structure-reference)

---

## Philosophy

### Why a Factory?

Building one test automation framework is a project. Building a system that can generate *any* testing framework — UI, API, security, performance, accessibility, manual test management — is a capability multiplier.

### Core Principles

| # | Principle | Why It Matters |
|---|-----------|----------------|
| 1 | **Blueprints over improvisation** | Expert knowledge is codified, not reinvented each time. A Playwright blueprint contains the patterns a senior SDET would apply. |
| 2 | **Shared patterns, not duplication** | Config management, reporting, CI/CD integration, logging — these are solved once and reused across all frameworks. |
| 3 | **Decision matrices over guessing** | "Which UI tool should I use?" has a structured answer based on project constraints, not opinion. |
| 4 | **Production-ready, not prototype** | Generated frameworks include parallel execution, retry logic, reporting, CI/CD, Docker — not just a skeleton with 3 tests. |
| 5 | **Full lifecycle** | Frameworks don't just get created. They get maintained, upgraded, and evolved. Maintenance agents handle this. |
| 6 | **Self-improving** | Every framework generated makes the factory smarter. Lessons feed back into blueprints and patterns. |

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                          HUMAN (CEO)                                │
│               Business decisions, tool preferences                  │
└───────────────────────────────┬─────────────────────────────────────┘
                                │
┌───────────────────────────────▼─────────────────────────────────────┐
│                      CTO AGENT (Chief Architect)                    │
│   Industry standards · Tool validation · Model routing · Research   │
└───────────────────────────────┬─────────────────────────────────────┘
                                │
┌───────────────────────────────▼─────────────────────────────────────┐
│                    FACTORY ORCHESTRATOR                              │
│         Routes, coordinates, validates, tracks state                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ANALYSIS (Phase 1)     DESIGN (Phase 2)     BUILD (Phase 3)       │
│  ┌──────────────┐       ┌──────────────┐     ┌──────────────┐     │
│  │ Requirements │       │ Framework    │     │ UI Builder   │     │
│  │ Analyst      │─────▶│ Architect    │─┬──▶│              │     │
│  └──────────────┘       └──────────────┘ │   └──────────────┘     │
│                                           │   ┌──────────────┐     │
│                                           ├──▶│ API Builder  │     │
│                                           │   └──────────────┘     │
│                                           │   ┌──────────────┐     │
│                                           ├──▶│ Perf Builder │     │
│                                           │   └──────────────┘     │
│                                           │   ┌──────────────┐     │
│                                           ├──▶│ Sec Builder  │     │
│                                           │   └──────────────┘     │
│                                           │   ┌──────────────┐     │
│                                           ├──▶│ A11y Builder │     │
│                                           │   └──────────────┘     │
│                                           │   ┌──────────────┐     │
│                                           └──▶│Manual Builder│     │
│                                               └──────┬───────┘     │
│                                                      │              │
│  VALIDATE (Phase 4)     LIFECYCLE                    │              │
│  ┌──────────────┐       ┌──────────────┐             │              │
│  │ Quality Gate │◀──────│Infrastructure│◀────────────┘              │
│  └──────┬───────┘       │ Agent        │                           │
│         │               └──────────────┘                           │
│  ┌──────▼───────┐       ┌──────────────┐                           │
│  │Documentation │       │ Learning     │                           │
│  │ Agent        │       │ Agent        │                           │
│  └──────────────┘       ├──────────────┤                           │
│                         │ Reactive     │                           │
│                         │ Maintenance  │                           │
│                         ├──────────────┤                           │
│                         │ Proactive    │                           │
│                         │ Evolution    │                           │
│                         └──────────────┘                           │
└─────────────────────────────────────────────────────────────────────┘
```

---

## The 16 Agents

### CTO Agent — Chief Technical Architect

| Property | Value |
|----------|-------|
| **Role** | Technical authority over generated frameworks |
| **Reads** | Blueprints, shared patterns, industry sources, agent-learnings/ |
| **Produces** | Technical decisions, tool validations, model routing, rule approvals |
| **Activates** | At phase transitions, tool selection, quality validation |

Verifies generated frameworks follow current industry best practices. Conducts web research on tools, validates blueprint accuracy, manages model routing, and approves Learning Agent's rule update proposals.

### Factory Orchestrator

| Property | Value |
|----------|-------|
| **Role** | Workflow coordinator for framework generation |
| **Reads** | `FACTORY_STATE.md`, all artifacts, decision matrices |
| **Produces** | Updates to `FACTORY_STATE.md` |
| **Activates** | Every conversation — determines state and routes |

Manages the 4-phase generation workflow. Routes requirements to the analyst, designs to the architect, builds to domain builders, and validation to the quality gate. Enforces alignment protocol.

### Requirements Analyst

| Property | Value |
|----------|-------|
| **Phase** | 1 — Analysis |
| **Reads** | User requirements, decision matrices |
| **Produces** | `FRAMEWORK_REQUIREMENTS.md` |
| **Exit Criteria** | Testing type, tech stack, CI/CD needs, scale requirements, team constraints documented |

Translates vague "I need automation" into structured requirements: what type of testing, what tools, what scale, what CI/CD, what team skill level.

### Framework Architect

| Property | Value |
|----------|-------|
| **Phase** | 2 — Design |
| **Reads** | `FRAMEWORK_REQUIREMENTS.md`, decision matrices, relevant blueprints |
| **Produces** | `FRAMEWORK_BLUEPRINT.md`, `TOOL_DECISIONS.md` |
| **Exit Criteria** | Tool selected, architecture designed, patterns chosen, folder structure planned |

Uses decision matrices to select tools, selects the appropriate blueprint, customizes the architecture based on requirements, and plans the framework structure.

### Domain Builders (6 agents)

Each handles a specific testing domain. They read the blueprint + shared patterns and generate the complete framework code.

| Builder | Domain | Blueprint Source | Key Output |
|---------|--------|-----------------|------------|
| **UI Automation Builder** | UI/E2E testing | `blueprints/ui/` | Page objects, test suites, visual testing, parallel config |
| **API Testing Builder** | REST/GraphQL API testing | `blueprints/api/` | Request builders, schema validation, contract tests, auth flows |
| **Performance Builder** | Load/stress/soak testing | `blueprints/performance/` | Scenarios, thresholds, ramp patterns, monitoring integration |
| **Security Builder** | DAST/dependency scanning | `blueprints/security/` | ZAP config, scan profiles, CI pipeline, vulnerability reports |
| **Accessibility Builder** | WCAG compliance testing | `blueprints/accessibility/` | Axe integration, rule config, violation reports, CI checks |
| **Manual Testing Builder** | Test case management | `blueprints/manual/` | Templates, checklists, traceability matrix, reporting |

### Infrastructure Agent

| Property | Value |
|----------|-------|
| **Phase** | 3 — Build (cross-cutting) |
| **Reads** | `FRAMEWORK_BLUEPRINT.md`, shared patterns |
| **Produces** | CI/CD configs, Docker files, reporting setup, environment configs |

Generates the infrastructure layer that wraps every framework: CI/CD pipeline, Docker containerization, reporting dashboard, environment configuration.

### Quality Gate Agent

| Property | Value |
|----------|-------|
| **Phase** | 4 — Validate |
| **Reads** | Generated framework code, `FRAMEWORK_BLUEPRINT.md`, relevant blueprint |
| **Produces** | `VALIDATION_REPORT.md` |

Validates the generated framework against the blueprint: Does it have all required components? Do tests run? Is parallel execution configured? Is reporting working? Is CI/CD integrated?

### Documentation Agent

| Property | Value |
|----------|-------|
| **Phase** | 4 — Validate |
| **Reads** | Generated framework, `FRAMEWORK_REQUIREMENTS.md`, `FRAMEWORK_BLUEPRINT.md` |
| **Produces** | README.md, setup guide, contribution guide for the generated framework |

Creates comprehensive documentation for the generated framework so any team member can understand, use, and extend it.

### Learning & Retrospective Agent

| Property | Value |
|----------|-------|
| **Phase** | Lifecycle |
| **Reads** | All artifacts, agent-learnings/, LESSONS_LEARNED.md |
| **Produces** | Lessons, pattern updates, rule change proposals |

Same self-improvement system as MADF. Captures lessons from every framework generation, detects patterns, proposes blueprint/pattern updates.

### Reactive Maintenance Agent

| Property | Value |
|----------|-------|
| **Phase** | Lifecycle |
| **Activates** | When a generated framework has bugs, broken tests, or CI failures |
| **Produces** | Fixes, incident reports, root cause analyses |

Fixes issues in generated frameworks: broken selectors, flaky tests, CI pipeline failures, dependency conflicts.

### Proactive Evolution Agent

| Property | Value |
|----------|-------|
| **Phase** | Lifecycle |
| **Activates** | For upgrades, new patterns, tool migrations in generated frameworks |
| **Produces** | Upgraded framework code, migration guides, new pattern implementations |

Evolves generated frameworks: Playwright version upgrades, new shared patterns, tool migrations (e.g., Cypress → Playwright), adding new test categories.

---

## CTO Agent & Model Routing

### Model Assignments

| Agent | Default Model | Rationale |
|-------|--------------|-----------|
| CTO Agent | Claude Opus 4.6 (thinking) | Deep reasoning for tool validation, standards |
| Factory Orchestrator | Claude Opus 4.6 | Workflow coordination, state management |
| Requirements Analyst | Claude Opus 4.6 | Needs to extract structure from vague requirements |
| Framework Architect | Claude Opus 4.6 (thinking) | Architecture decisions, blueprint selection |
| Domain Builders (all 6) | Claude Sonnet | Code generation from blueprints is pattern-based |
| Infrastructure Agent | Claude Sonnet | CI/CD/Docker config is pattern-based |
| Quality Gate Agent | Claude Opus 4.6 | Validation requires analytical comparison |
| Documentation Agent | Claude Sonnet | Documentation follows established templates |
| Learning Agent | Claude Opus 4.6 | Pattern detection needs strong reasoning |
| Reactive Maintenance | Claude Sonnet | Targeted fixes |
| Proactive Evolution | Claude Opus 4.6 | Migration planning needs deep analysis |

---

## Workflow: 4 Phases

```
Phase 1: ANALYZE        Phase 2: DESIGN          Phase 3: BUILD           Phase 4: VALIDATE
Requirements        ──▶  Architecture         ──▶  Framework Code      ──▶  Quality + Docs
Analyst                   Architect                  Domain Builder(s)        Quality Gate
                                                     + Infrastructure         + Documentation
FRAMEWORK_              FRAMEWORK_BLUEPRINT     Generated code +           VALIDATION_REPORT
REQUIREMENTS.md         + TOOL_DECISIONS.md     configs                    + README
         │                      │                      │                      │
         └──[G1: CTO review]──┘└──[G2: CTO review]──┘└──[G3: CTO review]──┘
```

### Phase 1: Analyze

Requirements Analyst asks:
- What type of testing? (UI, API, Performance, Security, Accessibility, Manual, or combination)
- What application stack? (Web, mobile, desktop, API-only)
- What language/framework preference?
- What CI/CD platform?
- What scale? (Team size, number of tests, parallel execution needs)
- What existing tools/infrastructure?
- What compliance needs?

Output: `FRAMEWORK_REQUIREMENTS.md`

### Phase 2: Design

Framework Architect:
1. Consults decision matrices to select optimal tools
2. Loads relevant blueprint(s)
3. Selects applicable shared patterns
4. Designs framework architecture customized for requirements
5. Plans folder structure and module organization

Output: `FRAMEWORK_BLUEPRINT.md` + `TOOL_DECISIONS.md`

### Phase 3: Build

Domain Builder(s) + Infrastructure Agent:
1. Domain builder reads blueprint + shared patterns
2. Generates framework skeleton (folder structure, dependencies, configs)
3. Implements core patterns (page objects, test data, auth, reporting)
4. Creates example tests demonstrating each pattern
5. Infrastructure Agent adds CI/CD, Docker, reporting

Output: Complete framework code

### Phase 4: Validate

Quality Gate Agent + Documentation Agent:
1. Quality Gate validates against blueprint checklist
2. Verifies tests run successfully
3. Documentation Agent generates README and guides
4. CTO reviews for industry alignment

Output: `VALIDATION_REPORT.md` + framework documentation

---

## Blueprint System

Blueprints are detailed, opinionated guides that encode expert knowledge for specific tool+language combinations. They are NOT code templates — they are architectural specifications that a Domain Builder follows to generate production-ready code.

### Blueprint Structure

Every blueprint contains:

1. **Overview**: What this blueprint produces, target use cases
2. **Prerequisites**: Required tools, versions, system requirements
3. **Architecture**: Folder structure, module organization, dependency graph
4. **Core Patterns**: Design patterns specific to this tool (POM for Selenium, fixtures for Playwright, etc.)
5. **Configuration**: Framework config, test runner config, environment management
6. **Test Data Management**: Factories, fixtures, database seeding, cleanup
7. **Reporting**: Report generation, screenshot/video capture, failure artifacts
8. **Parallel Execution**: Configuration for concurrent test runs
9. **CI/CD Integration**: Pipeline configuration specific to this tool
10. **Docker Setup**: Containerized execution environment
11. **Quality Checklist**: Validation criteria for the generated framework

### Available Blueprints

| Category | Blueprint | Tool + Language |
|----------|-----------|----------------|
| UI | `blueprints/ui/playwright-typescript.md` | Playwright + TypeScript |
| UI | `blueprints/ui/cypress-typescript.md` | Cypress + TypeScript |
| UI | `blueprints/ui/selenium-java.md` | Selenium + Java (based on production framework) |
| API | `blueprints/api/supertest-typescript.md` | SuperTest + TypeScript |
| API | `blueprints/api/pytest-python.md` | pytest + Python (requests) |
| Performance | `blueprints/performance/k6-javascript.md` | k6 + JavaScript |
| Performance | `blueprints/performance/locust-python.md` | Locust + Python |
| Security | `blueprints/security/zap-ci-pipeline.md` | OWASP ZAP + CI Pipeline |
| Accessibility | `blueprints/accessibility/axe-playwright.md` | axe-core + Playwright |
| Manual | `blueprints/manual/test-management-structure.md` | Structured manual testing |

---

## Shared Patterns

Cross-cutting concerns that apply to ALL frameworks, regardless of tool or testing type. These are solved once and reused.

| Pattern | File | What It Covers |
|---------|------|---------------|
| Config Management | `shared-patterns/config-management.md` | Environment-based config, secrets, overrides |
| Reporting | `shared-patterns/reporting.md` | Allure, HTML, custom reports, failure artifacts |
| CI/CD Integration | `shared-patterns/ci-cd-integration.md` | GitHub Actions, Jenkins, GitLab CI patterns |
| Test Data Management | `shared-patterns/test-data-management.md` | Factories, fixtures, seeding, cleanup |
| Parallel Execution | `shared-patterns/parallel-execution.md` | Thread safety, sharding, resource isolation |
| Logging & Observability | `shared-patterns/logging-observability.md` | Structured logs, trace IDs, debug artifacts |
| Docker Containerization | `shared-patterns/docker-containerization.md` | Multi-stage builds, browser images, compose |
| Retry & Stability | `shared-patterns/retry-stability.md` | Flaky test handling, retry strategies, wait patterns |
| Auth Patterns | `shared-patterns/auth-patterns.md` | Token management, session handling, multi-user |

---

## Decision Matrices

Structured guides for selecting the right tool based on project constraints. Used by the Framework Architect in Phase 2.

| Matrix | File | Dimensions |
|--------|------|-----------|
| UI Tool Selection | `decision-matrices/ui-tool-selection.md` | Speed, browser support, mobile, team skill, community |
| API Tool Selection | `decision-matrices/api-tool-selection.md` | Language, protocol (REST/GraphQL/gRPC), features |
| Performance Tool Selection | `decision-matrices/performance-tool-selection.md` | Protocol, scripting, distributed, reporting |
| CI Platform Selection | `decision-matrices/ci-platform-selection.md` | Cost, integration, parallelism, artifacts |

---

## Artifact Contracts

| Artifact | Producer | Consumers |
|----------|----------|-----------|
| `FACTORY_STATE.md` | Factory Orchestrator | ALL agents |
| `FRAMEWORK_REQUIREMENTS.md` | Requirements Analyst | Framework Architect, Domain Builders |
| `FRAMEWORK_BLUEPRINT.md` | Framework Architect | Domain Builders, Infrastructure, Quality Gate |
| `TOOL_DECISIONS.md` | Framework Architect | ALL agents |
| `VALIDATION_REPORT.md` | Quality Gate Agent | CTO, Documentation Agent |
| `LESSONS_LEARNED.md` | Learning Agent | ALL agents |

---

## Learning & Self-Improvement

Same system as MADF, adapted for framework generation:

### Per-Agent Learning Files

Every agent has `agent-learnings/[agent]-learnings.md`. Read before every task, appended after every task.

### What Gets Captured

- Blueprint gaps: "Playwright blueprint didn't include API mocking pattern — needed for project X"
- Tool selection corrections: "Chose k6 but project needed distributed load testing — should have recommended Locust"
- Pattern improvements: "Retry pattern didn't handle network-level flakes — added connection retry"
- Quality gate findings: "Generated framework was missing Docker setup — added to builder checklist"

### Feedback Loop

```
Framework generated → Quality Gate finds gaps → Learning Agent captures lesson
    → If blueprint gap → Propose blueprint update (CTO approves)
    → If pattern gap → Propose pattern update (CTO approves)
    → If decision matrix gap → Propose matrix update (CTO approves)
    → Agent is permanently smarter
```

---

## Maintenance Agents

### Reactive Maintenance

Handles issues in generated frameworks:
- Test failures due to application changes (broken selectors, API changes)
- CI pipeline failures (dependency conflicts, browser version mismatches)
- Flaky tests (timing issues, resource contention)
- Tool bugs (framework-specific workarounds)

### Proactive Evolution

Handles planned improvements:
- Tool version upgrades (Playwright 1.x → 2.x)
- New shared pattern adoption
- Adding test types to existing frameworks (e.g., adding accessibility to a UI framework)
- Migrating between tools (Cypress → Playwright)
- Performance tuning (parallel execution optimization)

---

## Alignment & Clarity Protocol

Same as MADF — applies to all TAFF agents:

**Golden Rule: When confidence < 80% → STOP → ASK → CONFIRM → PROCEED**

1. Pre-Work Alignment: Summarize → list context → state output → flag ambiguities → wait
2. Assumption Protocol: Minor → tag, continue. Major → STOP AND ASK.
3. Mid-Work Check-ins: At 50%, show progress and confirm direction
4. Post-Work Confidence: HIGH / MEDIUM / LOW signal
5. Escalation chain: Agent → Orchestrator → CTO → Human

---

## How to Use This Framework

### Generating a New Framework

1. Start a conversation: "I need a test automation framework for [description]"
2. Factory Orchestrator activates → routes to Requirements Analyst
3. Requirements Analyst asks clarifying questions → produces `FRAMEWORK_REQUIREMENTS.md`
4. Framework Architect selects tools, blueprint, patterns → produces `FRAMEWORK_BLUEPRINT.md`
5. Domain Builder(s) generate the complete framework code
6. Infrastructure Agent adds CI/CD, Docker, reporting
7. Quality Gate validates → Documentation Agent generates docs
8. You have a production-ready framework

### Maintaining an Existing Framework

- "Fix this flaky test" → Reactive Maintenance Agent
- "Upgrade Playwright to latest" → Proactive Evolution Agent
- "Add API testing to our UI framework" → Requirements Analyst (mini cycle)

### Extending the Factory

- New tool support: Create a new blueprint in the appropriate category
- New testing type: Create a new Domain Builder agent + blueprints
- New shared concern: Add to shared-patterns/

---

## File Structure Reference

```
test-framework-factory/
├── FRAMEWORK.md                          ← This file
├── README.md                             ← Quick-start + worked example
├── MASTER_PROMPT.md                      ← Single prompt to recreate
│
├── cursor-rules/                         ← Agent behavior definitions
│   ├── cto-agent.mdc
│   ├── 00-factory-orchestrator.mdc
│   ├── 01-requirements-analyst.mdc
│   ├── 02-framework-architect.mdc
│   ├── 03a-ui-builder.mdc
│   ├── 03b-api-builder.mdc
│   ├── 03c-performance-builder.mdc
│   ├── 03d-security-builder.mdc
│   ├── 03e-accessibility-builder.mdc
│   ├── 03f-manual-testing-builder.mdc
│   ├── 04-infrastructure-agent.mdc
│   ├── 05-quality-gate.mdc
│   ├── 06-documentation-agent.mdc
│   ├── 07-learning-agent.mdc
│   ├── 08-reactive-maintenance.mdc
│   └── 09-proactive-evolution.mdc
│
├── blueprints/                           ← Expert knowledge per tool
│   ├── ui/
│   │   ├── playwright-typescript.md
│   │   ├── cypress-typescript.md
│   │   └── selenium-java.md
│   ├── api/
│   │   ├── supertest-typescript.md
│   │   └── pytest-python.md
│   ├── performance/
│   │   ├── k6-javascript.md
│   │   └── locust-python.md
│   ├── security/
│   │   └── zap-ci-pipeline.md
│   ├── accessibility/
│   │   └── axe-playwright.md
│   └── manual/
│       └── test-management-structure.md
│
├── shared-patterns/                      ← Cross-cutting concerns
│   ├── config-management.md
│   ├── reporting.md
│   ├── ci-cd-integration.md
│   ├── test-data-management.md
│   ├── parallel-execution.md
│   ├── logging-observability.md
│   ├── docker-containerization.md
│   ├── retry-stability.md
│   └── auth-patterns.md
│
├── decision-matrices/                    ← Tool selection guides
│   ├── ui-tool-selection.md
│   ├── api-tool-selection.md
│   ├── performance-tool-selection.md
│   └── ci-platform-selection.md
│
├── artifacts/                            ← Runtime state (per generation)
│   ├── FACTORY_STATE.md
│   ├── FRAMEWORK_REQUIREMENTS.md
│   ├── FRAMEWORK_BLUEPRINT.md
│   ├── TOOL_DECISIONS.md
│   ├── VALIDATION_REPORT.md
│   └── LESSONS_LEARNED.md
│
├── agent-learnings/                      ← Per-agent learning files
│   └── [agent]-learnings.md (16 files)
│
└── positioning/                          ← Resume & interview materials
    ├── github-strategy.md
    ├── resume-lines.md
    └── interview-narratives.md
```

---

**Remember**: Blueprints are your expert knowledge. Shared patterns prevent duplication. Decision matrices prevent guessing. The Learning Agent makes it all smarter over time.
