# Multi-Agent Development Framework (MADF) v2.0

> **Purpose**: A structured, artifact-driven, self-improving framework for building and maintaining software projects using AI agents in Cursor IDE. Designed by an AI, for working with AI.

---

## Table of Contents

1. [Philosophy](#philosophy)
2. [Architecture Overview](#architecture-overview)
3. [What Changed From the Original 7-Agent System](#what-changed)
4. [The 13 Agents](#the-13-agents)
5. [CTO Agent & Model Routing](#cto-agent--model-routing)
6. [Learning & Self-Improvement System](#learning--self-improvement-system)
7. [Maintenance Agents](#maintenance-agents)
8. [Workflow Phases & Gates](#workflow-phases--gates)
9. [Artifact Contracts](#artifact-contracts)
10. [State Management](#state-management)
11. [Feedback Loops & Error Recovery](#feedback-loops--error-recovery)
12. [Alignment & Clarity Protocol](#alignment--clarity-protocol)
13. [Cross-Cutting Concerns — Scalability, Concurrency & Engineering Excellence](#cross-cutting-concerns)
14. [How to Use This Framework](#how-to-use-this-framework)
15. [Anti-Patterns to Avoid](#anti-patterns-to-avoid)
16. [Domain-Specific Extensions](#domain-specific-extensions)

---

## Philosophy

### The 90/10 Rule

Spend **90% of time planning** and **10% coding**. This isn't just a ratio — it's a survival strategy. Every hour of planning saves 10 hours of debugging. Every decision documented now prevents 5 decisions re-debated later.

### Core Principles

| # | Principle | Why It Matters for AI Agents |
|---|-----------|------------------------------|
| 1 | **Artifacts over memory** | AI forgets between sessions. Markdown files persist. Every decision, design, and spec lives in a file. |
| 2 | **Explicit over implicit** | Never assume the AI knows context. Every agent prompt loads specific files. No "you should know this." |
| 3 | **Gates before progression** | Don't code until the plan is validated. Don't deploy until tests pass. Each phase has an exit criteria. |
| 4 | **Single responsibility per agent** | One agent, one job, one output artifact. Clean boundaries prevent scope creep. |
| 5 | **Incremental delivery** | Build feature-by-feature, not everything at once. Each increment is plannable, buildable, testable. |
| 6 | **Decisions are permanent until revisited** | Once a choice is recorded in DECISIONS.md, no agent re-debates it without explicit escalation. |
| 7 | **Context bundling** | Each agent receives ONLY what it needs — not a dump of everything. Focused context = better output. |

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                          HUMAN (CEO)                                │
│         Business decisions, final approvals, subjective choices     │
└───────────────────────────────┬─────────────────────────────────────┘
                                │
┌───────────────────────────────▼─────────────────────────────────────┐
│                      CTO AGENT (Chief Architect)                    │
│   Technical quality · Industry standards · Model routing · Research │
└───────────────────────────────┬─────────────────────────────────────┘
                                │
┌───────────────────────────────▼─────────────────────────────────────┐
│                        ORCHESTRATOR AGENT                           │
│            (Always active — routes, validates, tracks)              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  PLANNING (1-3)        BUILDING (4-5)        LIFECYCLE (Any)       │
│  ┌─────────────┐       ┌──────────────┐      ┌──────────────┐     │
│  │ Product      │─art─▶│ Backend      │      │ Learning &   │     │
│  │ Strategy     │       │ Agent        │      │ Retrospective│     │
│  │ → MVP_PLAN   │       │ → Code + API │      │ → Lessons    │     │
│  └──────┬──────┘       └──────┬───────┘      └──────────────┘     │
│         │                      │                                    │
│  ┌──────▼──────┐       ┌──────▼───────┐      ┌──────────────┐     │
│  │ Blueprint   │─art─▶│ Frontend     │      │ Reactive     │     │
│  │ Architect   │       │ Agent        │      │ Maintenance  │     │
│  │ → BLUEPRINT │       │ → Components │      │ → Bug fixes  │     │
│  └──────┬──────┘       └──────┬───────┘      └──────────────┘     │
│         │                      │                                    │
│  ┌──────▼──────┐       ┌──────▼───────┐      ┌──────────────┐     │
│  │ UX Designer │       │ Testing      │      │ Proactive    │     │
│  │ → UX_SPEC   │─art─▶│ Agent        │      │ Evolution    │     │
│  └─────────────┘       │ → Tests      │      │ → Upgrades   │     │
│                         └──────┬───────┘      └──────────────┘     │
│                                │                                    │
│                         ┌──────▼───────┐                           │
│                         │ Security     │                           │
│                         │ → REVIEW     │                           │
│                         └──────┬───────┘                           │
│                                │                                    │
│                         ┌──────▼───────┐                           │
│                         │ DevOps       │                           │
│                         │ → Pipeline   │                           │
│                         └──────────────┘                           │
│                                                                     │
│  ◄──── FEEDBACK LOOPS ────►  ◄──── SELF-IMPROVEMENT ────►         │
│  Escalation chain: Agent → Orchestrator → CTO → Human             │
│  Learning: Every gate, escalation, rejection → Learning Agent      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## What Changed From the Original 7-Agent System {#what-changed}

### Added: Orchestrator Agent (CRITICAL)

**Problem**: The original system had 7 agents but no coordinator. Who decides when planning is done? Who resolves conflicts between backend and frontend? Who tracks what phase we're in?

**Solution**: The Orchestrator is always active. It reads `PROJECT_STATE.md`, determines the current phase, activates the right agent role, validates outputs, and manages phase transitions. Without it, the system is headless.

### Added: DevOps & Infrastructure Agent

**Problem**: The original system builds code but has no plan for how it gets deployed, monitored, or maintained. CI/CD, Docker, environment configs, and monitoring are critical — they can't be an afterthought.

**Solution**: A dedicated DevOps Agent handles infrastructure-as-code, CI/CD pipelines, deployment configs, environment management, and observability setup.

### Enhanced: Feedback Loops

**Problem**: The original system is linear — plan then code. But what happens when the Backend Agent discovers the database schema from the Blueprint won't support a required query pattern? In the original system, you're stuck.

**Solution**: Any coding agent can file an "escalation" back to a planning agent through the Orchestrator. The Orchestrator logs the issue in DECISIONS.md and re-activates the relevant planning agent for a targeted revision.

### Enhanced: Artifact Contracts

**Problem**: The original system doesn't define what each agent produces or what the next agent needs. This leads to "I built what I thought you meant" problems.

**Solution**: Every agent has a defined INPUT (what files to read) and OUTPUT (what artifact to produce, in what format). The artifact templates are standardized.

### Enhanced: Validation Gates

**Problem**: Nothing prevents moving from planning to coding with an incomplete plan. The result is rework.

**Solution**: Each phase has explicit exit criteria. The Orchestrator checks these before allowing progression.

### Enhanced: State Management

**Problem**: Between sessions, all context is lost. The AI doesn't know what was decided yesterday.

**Solution**: `PROJECT_STATE.md` is the single source of truth. Updated after every phase. Read first by every agent. This IS your persistent memory.

---

## The 13 Agents

### CTO Agent: Chief Technical Architect

| Property | Value |
|----------|-------|
| **Role** | Technical authority, industry standards, model routing, web research |
| **Reads** | ALL artifacts, agent-learnings/, industry sources |
| **Produces** | Technical decisions, model routing assignments, rule update approvals |
| **Activates** | At every gate transition, on technical escalations, on tool/tech decisions |
| **Key Rule** | Guides the Orchestrator; never bypasses it. Escalates business decisions to Human. |

**Responsibilities**:
- Review all artifacts for technical quality at gate transitions
- Verify tool/tech recommendations against current industry standards via web research
- Assign AI models to agents based on task complexity (model routing)
- Approve or reject rule update proposals from the Learning Agent
- Escalate business/subjective decisions to the Human (CEO)

### Agent 0: Orchestrator (Always Active)

| Property | Value |
|----------|-------|
| **Role** | Coordinator, router, validator, state manager |
| **Reads** | `PROJECT_STATE.md`, `DECISIONS.md`, all artifact files |
| **Produces** | Updates to `PROJECT_STATE.md` |
| **Activates** | At the start of EVERY conversation |
| **Key Rule** | Never writes code. Only manages workflow, validates artifacts, and delegates. |

**Responsibilities**:
- Read project state and determine current phase
- Route tasks to the appropriate agent
- Consult CTO Agent at gate transitions and for technical escalations
- Validate agent outputs against exit criteria
- Manage phase transitions (planning → building → deploying)
- Handle escalations from coding agents back to planning
- Trigger Learning Agent after gates, escalations, rejections, and incidents
- Remind agents to load their learning file when activating them
- Maintain the decision log
- Provide the user with clear status updates

### Agent 1: Product Strategy Lead

| Property | Value |
|----------|-------|
| **Phase** | Planning (Phase 1) |
| **Reads** | User requirements (conversation), existing PROJECT_STATE.md |
| **Produces** | `artifacts/MVP_PLAN.md` |
| **Exit Criteria** | Problem defined, audience identified, features prioritized (P0/P1/P2), success metrics listed |

**What It Does**: Translates a rough idea into a focused MVP plan. Defines the problem, target audience, core features (prioritized), out-of-scope items, and measurable success metrics. Keeps the project focused — kills feature creep before it starts.

**Key Output Sections**: Problem Statement, Target Users, Feature Priority Matrix (P0 = must-have, P1 = should-have, P2 = nice-to-have), Success Metrics, Out of Scope, Assumptions & Risks.

### Agent 2: Systems Blueprint Architect

| Property | Value |
|----------|-------|
| **Phase** | Planning (Phase 2) |
| **Reads** | `artifacts/MVP_PLAN.md` |
| **Produces** | `artifacts/SYSTEM_BLUEPRINT.md` |
| **Exit Criteria** | Tech stack chosen (with rationale), data model defined, API surface designed, scalability approach documented |

**What It Does**: Designs the technical backbone. Chooses the tech stack (with trade-off analysis), designs the data model, maps out APIs, plans for scalability, and documents infrastructure requirements. Every technical decision includes a "why" in DECISIONS.md.

**Key Output Sections**: Tech Stack (with rationale), System Architecture Diagram, Data Model (entities + relationships), API Surface (endpoints, methods, payloads), Third-Party Integrations, Scalability Strategy, Infrastructure Requirements.

### Agent 3: Experience & Interface Designer

| Property | Value |
|----------|-------|
| **Phase** | Planning (Phase 3) |
| **Reads** | `artifacts/MVP_PLAN.md`, `artifacts/SYSTEM_BLUEPRINT.md` |
| **Produces** | `artifacts/UX_SPEC.md` |
| **Exit Criteria** | User flows mapped, screen inventory complete, component list defined, interaction patterns documented |

**What It Does**: Turns goals into intuitive interfaces. Creates user stories, maps user flows (happy path + error states), defines screen layouts, specifies component hierarchy, and documents interaction patterns. Ensures users can complete tasks without friction.

**Key Output Sections**: User Stories (As a... I want... So that...), User Flow Diagrams, Screen Inventory, Component Hierarchy, Interaction Patterns (loading, error, empty states), Responsive Breakpoints, Accessibility Requirements.

### Agent 4: Backend Agent

| Property | Value |
|----------|-------|
| **Phase** | Building (Phase 4a) |
| **Reads** | `artifacts/SYSTEM_BLUEPRINT.md`, `artifacts/MVP_PLAN.md` |
| **Produces** | Application code + `artifacts/API_CONTRACT.md` |
| **Exit Criteria** | All P0 APIs implemented, database schema created, auth working, API contract documented |

**What It Does**: Builds the server-side foundation. Creates database schemas, implements APIs, handles authentication/authorization, writes business logic, and produces a clean API contract that the Frontend Agent can code against.

**Key Rules**: Follow the Blueprint exactly. If you need to deviate, escalate to the Orchestrator. Every API endpoint must be documented in API_CONTRACT.md before the Frontend Agent begins.

### Agent 5: Frontend Agent

| Property | Value |
|----------|-------|
| **Phase** | Building (Phase 4b) |
| **Reads** | `artifacts/UX_SPEC.md`, `artifacts/API_CONTRACT.md`, `artifacts/SYSTEM_BLUEPRINT.md` |
| **Produces** | Application code + `artifacts/COMPONENT_SPEC.md` |
| **Exit Criteria** | All P0 screens built, API integration working, responsive design implemented, loading/error states handled |

**What It Does**: Brings the UX spec to life. Builds components matching the design system, integrates with backend APIs using the contract, handles all UI states (loading, error, empty, success), and ensures responsive behavior.

**Key Rules**: Code against the API_CONTRACT.md — not against assumptions. If an API is missing or wrong, escalate to the Orchestrator. Match the UX_SPEC pixel-for-pixel.

### Agent 6: Testing Agent

| Property | Value |
|----------|-------|
| **Phase** | Building (Phase 4c) |
| **Reads** | `artifacts/MVP_PLAN.md`, `artifacts/API_CONTRACT.md`, `artifacts/COMPONENT_SPEC.md`, all source code |
| **Produces** | Test code + `artifacts/TEST_PLAN.md` |
| **Exit Criteria** | Unit tests for critical paths, integration tests for API endpoints, E2E tests for P0 user flows, coverage report generated |

**What It Does**: Protects the build. Writes unit tests for business logic, integration tests for API contracts, and E2E tests for critical user flows. Runs tests, reports coverage, and flags regressions. Documents the test strategy so anyone can understand what's covered and what's not.

**Key Rules**: Test behavior, not implementation. Every P0 feature must have at least one happy-path and one error-path test. Test the API contract independently from the UI.

### Agent 7: Security & Risk Agent

| Property | Value |
|----------|-------|
| **Phase** | Building (Phase 4d) |
| **Reads** | All source code, `artifacts/SYSTEM_BLUEPRINT.md`, `artifacts/API_CONTRACT.md`, dependency files |
| **Produces** | `artifacts/SECURITY_REVIEW.md` |
| **Exit Criteria** | Auth flow validated, input validation checked, dependency audit done, OWASP top 10 reviewed, secrets handling verified |

**What It Does**: Ensures the product is safe. Reviews authentication and authorization logic, checks for injection vulnerabilities, audits dependencies, validates secrets management, reviews CORS/CSP headers, and flags issues with severity ratings (Critical/High/Medium/Low).

**Key Rules**: No security issue is "too small." Every finding gets logged with severity, location, and remediation steps. Critical and High issues block deployment.

### Agent 8: DevOps & Infrastructure Agent (NEW)

| Property | Value |
|----------|-------|
| **Phase** | Building (Phase 5) |
| **Reads** | `artifacts/SYSTEM_BLUEPRINT.md`, `artifacts/SECURITY_REVIEW.md`, all source code |
| **Produces** | CI/CD configs, Dockerfiles, infra configs + `artifacts/DEPLOYMENT_GUIDE.md` |
| **Exit Criteria** | CI pipeline running, Docker configs working, environment variables documented, deployment process documented |

**What It Does**: Makes the app deployable. Sets up CI/CD pipelines, creates Docker/container configs, manages environment variables, configures monitoring/logging, and documents the deployment process. Ensures the app can go from code to production reliably.

**Key Rules**: Every environment variable must be documented. Secrets must never be committed. The deployment process must be reproducible with a single command.

### Agent 9: Learning & Retrospective Agent

| Property | Value |
|----------|-------|
| **Phase** | Lifecycle (any phase) |
| **Reads** | All artifacts, `agent-learnings/`, `DECISIONS.md`, conversation history |
| **Produces** | `artifacts/LESSONS_LEARNED.md`, updates to `agent-learnings/*.md` |
| **Activates** | After every gate transition, escalation, rejection, incident, project end |
| **Key Rule** | Never updates agent `.mdc` rules without CTO approval. |

**What It Does**: Captures what worked and what failed, detects recurring patterns, and proposes rule updates to make agents smarter over time. Maintains per-agent learning files and a central cross-agent lessons log.

### Agent 10: Reactive Maintenance Agent

| Property | Value |
|----------|-------|
| **Phase** | Lifecycle (post-build) |
| **Reads** | `PROJECT_STATE.md`, `DEPLOYMENT_GUIDE.md`, `SECURITY_REVIEW.md`, `agent-learnings/reactive-maintenance-learnings.md` |
| **Produces** | Bug fixes, incident reports, root cause analyses |
| **Activates** | On production incidents, critical bugs, security vulnerabilities, performance crises |
| **Key Rule** | Minimal changes only for hotfixes. Fix the bug, nothing else. |

**What It Does**: Triages and fixes urgent issues. Follows a structured protocol: Triage → Isolate → Fix → Test → Security Check → Deploy → Document → Merge Back. Produces root cause analyses for SEV-1/SEV-2 incidents.

### Agent 11: Proactive Evolution Agent

| Property | Value |
|----------|-------|
| **Phase** | Lifecycle (post-build) |
| **Reads** | `PROJECT_STATE.md`, `DECISIONS.md`, `SYSTEM_BLUEPRINT.md`, `LESSONS_LEARNED.md`, `agent-learnings/proactive-evolution-learnings.md` |
| **Produces** | Upgraded code, refactored modules, new features, migration scripts |
| **Activates** | On dependency upgrades, refactoring, post-MVP features, tech debt resolution, migrations |
| **Key Rule** | Never evolve without a rollback plan. Never refactor and add features simultaneously. |

**What It Does**: Keeps the project healthy through planned improvements. Handles dependency upgrades (patch → minor → major), code refactoring, post-MVP feature additions, database migrations, tech debt resolution, and performance optimization.

---

## CTO Agent & Model Routing

The CTO Agent sits above the Orchestrator in the technical hierarchy. It does NOT manage workflow — that's the Orchestrator's job. The CTO ensures technical excellence.

### Hierarchy

```
HUMAN (CEO) — "Should we build feature X?" / "Accept this risk?" / "Pick design A or B?"
    ↕
CTO AGENT — "Is this architecture scalable?" / "Is this the right tool?" / "Assign Opus to this agent"
    ↕
ORCHESTRATOR — "Route to Backend Agent" / "Gate G2 passed" / "Trigger Learning Agent"
    ↕
AGENTS — Actual work
```

### Model Routing

The CTO Agent assigns AI models based on task complexity:

| Agent | Default Model | Rationale |
|-------|--------------|-----------|
| CTO Agent | Claude Opus 4.6 (thinking) | Deepest reasoning for architecture and standards |
| Orchestrator | Claude Opus 4.6 | Strong reasoning for workflow coordination |
| Product Strategy | Claude Opus 4.6 | Creative + analytical thinking for scoping |
| Blueprint Architect | Claude Opus 4.6 (thinking) | Architecture decisions need deepest reasoning |
| UX Designer | Claude Sonnet | Design output is pattern-based |
| Backend Agent | Claude Sonnet | Code generation is well-defined by specs |
| Frontend Agent | Claude Sonnet | Component building is pattern-based |
| Testing Agent | Claude Sonnet | Test writing follows established patterns |
| Security Agent | Claude Opus 4.6 | Security requires deep analytical thinking |
| DevOps Agent | Claude Sonnet | Infrastructure config is pattern-based |
| Learning Agent | Claude Opus 4.6 | Pattern detection needs strong reasoning |
| Reactive Maintenance | Claude Sonnet | Debugging is focused and targeted |
| Proactive Evolution | Claude Opus 4.6 | Migration/upgrade planning needs analysis |

The CTO can override defaults when task complexity warrants it.

### Escalation Chain

```
Agent hits uncertainty → Orchestrator (workflow decision?)
    → YES: Orchestrator handles
    → NO (technical decision): Escalate to CTO Agent
        → CTO can resolve? → YES: CTO decides, Orchestrator routes
        → NO (business decision): Escalate to Human
```

---

## Learning & Self-Improvement System

MADF is a self-improving framework. Every mistake makes the system smarter.

### Per-Agent Learning Files

Every agent has a learning file in `agent-learnings/`:
- Loaded at the start of every task (as part of Context Loading)
- Appended after every task completion
- Contains structured lessons with root cause analysis

### Central Lessons Learned

`artifacts/LESSONS_LEARNED.md` aggregates cross-agent patterns:
- Cross-Agent Patterns: Recurring issues detected across multiple agents
- Rule Updates Applied: Changes made to `.mdc` rules based on evidence
- Open Proposals: Rule changes awaiting CTO approval

### How It Works

```
1. Agent completes work → Self-improvement step:
   - Scan own learning file for related entries
   - Log new lessons if applicable
   
2. Gate transition → Learning Agent activated:
   - Mini retrospective: what went well, what didn't
   - Pattern detection: is this a recurring issue?
   
3. Pattern detected → Learning Agent proposes rule update:
   - Drafts exact text change to agent's .mdc file
   - Submits to CTO Agent for approval
   
4. CTO approves → Rule updated:
   - .mdc file modified
   - Logged in LESSONS_LEARNED.md
   - Agent is now permanently smarter
```

---

## Maintenance Agents

Post-launch, the system doesn't stop. Two maintenance agents handle ongoing lifecycle:

### Reactive Maintenance (Agent 10)

Handles urgent, unplanned work:
- **SEV-1 (Critical)**: System down, data loss, breach → Immediate response
- **SEV-2 (High)**: Major feature broken → Response within hours
- **SEV-3 (Medium)**: Feature degraded → Next sprint
- **SEV-4 (Low)**: Cosmetic, edge case → Backlog

Follows a structured hotfix protocol with mandatory root cause analysis for SEV-1/SEV-2.

### Proactive Evolution (Agent 11)

Handles planned improvements:
- **Dependency upgrades**: Patch → Minor → Major, with risk assessment
- **Refactoring**: Behavior-preserving structural improvements
- **New features**: Post-MVP additions following standard Phase 4 cycle
- **Tech debt**: Resolving items from DECISIONS.md TECH_DEBT section
- **Performance optimization**: Profile-first, measure-before-and-after
- **Migrations**: Forward-only, expand/contract pattern for zero downtime

---

## Workflow Phases & Gates

```
Phase 0          Phase 1           Phase 2            Phase 3
INIT        ──▶  PRODUCT STRATEGY  ──▶ SYSTEM BLUEPRINT ──▶ UX DESIGN
(Orchestrator)   (Agent 1)            (Agent 2)            (Agent 3)
                 ┌─────────────┐      ┌──────────────┐     ┌──────────┐
                 │ MVP_PLAN.md │      │SYSTEM_BLUEPRINT│    │UX_SPEC.md│
                 └──────┬──────┘      └──────┬───────┘     └────┬─────┘
                        │ GATE: User         │ GATE: User       │ GATE: User
                        │ approves plan      │ approves arch    │ approves UX
                        ▼                    ▼                  ▼
                 ┌──────────────────────────────────────────────────────┐
                 │                   Phase 4: BUILD                     │
                 │  For each P0 feature (then P1, then P2):            │
                 │                                                      │
                 │  4a. Backend Agent  ──▶ 4b. Frontend Agent          │
                 │          │                      │                    │
                 │          ▼                      ▼                    │
                 │  4c. Testing Agent  ──▶ 4d. Security Agent          │
                 │                                                      │
                 │  GATE: Tests pass + No critical security issues      │
                 └────────────────────────┬────────────────────────────┘
                                          │
                                          ▼
                                   Phase 5: DEVOPS
                                   (Agent 8)
                                   ┌──────────────────┐
                                   │DEPLOYMENT_GUIDE.md│
                                   └────────┬─────────┘
                                            │ GATE: Pipeline green
                                            │ + Security approved
                                            ▼
                                   Phase 6: LAUNCH
                                   (Orchestrator)
                                   Final checklist + deploy
```

### Gate Definitions

| Gate | Between | Exit Criteria | Who Validates |
|------|---------|---------------|---------------|
| G1 | Phase 1 → 2 | MVP_PLAN.md complete, features prioritized, user approved | Orchestrator + User |
| G2 | Phase 2 → 3 | SYSTEM_BLUEPRINT.md complete, tech stack decided, data model defined, user approved | Orchestrator + User |
| G3 | Phase 3 → 4 | UX_SPEC.md complete, all P0 flows mapped, user approved | Orchestrator + User |
| G4 | Per feature | Feature code complete, tests pass, no critical security issues | Testing + Security Agents |
| G5 | Phase 4 → 5 | All P0 features built and tested, security review complete | Orchestrator |
| G6 | Phase 5 → 6 | CI/CD green, deployment documented, environments configured | DevOps Agent |

---

## Artifact Contracts

Every agent produces a specific artifact. These artifacts ARE the shared memory between agents and sessions.

| Artifact | Producer | Consumers | Format |
|----------|----------|-----------|--------|
| `PROJECT_STATE.md` | Orchestrator | ALL agents | Phase tracker, decision log, blockers |
| `artifacts/MVP_PLAN.md` | Product Strategy | Blueprint, Backend, Testing | Problem, users, features, metrics |
| `artifacts/SYSTEM_BLUEPRINT.md` | Blueprint Architect | Backend, Frontend, DevOps, Security | Tech stack, data model, APIs, infra |
| `artifacts/UX_SPEC.md` | UX Designer | Frontend | User flows, screens, components |
| `artifacts/API_CONTRACT.md` | Backend | Frontend, Testing | Endpoints, methods, payloads, responses |
| `artifacts/COMPONENT_SPEC.md` | Frontend | Testing | Component tree, state management, props |
| `artifacts/TEST_PLAN.md` | Testing | Orchestrator | Strategy, coverage, results |
| `artifacts/SECURITY_REVIEW.md` | Security | DevOps, Orchestrator | Findings, severity, remediation |
| `artifacts/DEPLOYMENT_GUIDE.md` | DevOps | Orchestrator | Pipeline, configs, runbook |
| `DECISIONS.md` | Any agent (via Orchestrator) | ALL agents | ADR format: context, decision, rationale |

### Artifact Rules

1. **First creation replaces the template** — When an agent fills out an artifact for the first time, replace all placeholder values with real content. This is NOT a revision — it's the initial creation.
2. **After first creation: never delete, only append or revise** — Once an artifact has real content, it grows over time. Mark outdated sections with `[REVISED: date]` rather than deleting them.
3. **Every artifact has a version header** — `Last updated: date | Phase: X | Status: Draft/Approved`
4. **Cross-reference, don't duplicate** — If Backend needs info from the Blueprint, reference the section, don't copy-paste it.
5. **User approval required for planning artifacts** — MVP_PLAN, SYSTEM_BLUEPRINT, and UX_SPEC require explicit user sign-off before coding begins.

---

## State Management

### PROJECT_STATE.md Structure

```markdown
# Project State

## Current Phase
Phase: [0-6]
Active Agent: [agent name]
Status: [in-progress / waiting-for-approval / blocked]

## Progress Tracker
| Phase | Agent | Artifact | Status |
|-------|-------|----------|--------|
| 1 | Product Strategy | MVP_PLAN.md | Approved |
| 2 | Blueprint Architect | SYSTEM_BLUEPRINT.md | In Progress |
| 3 | UX Designer | UX_SPEC.md | Not Started |
| ... | ... | ... | ... |

## Feature Tracker (Phase 4+)
| Feature | Priority | Backend | Frontend | Tests | Security | Status |
|---------|----------|---------|----------|-------|----------|--------|
| User Auth | P0 | Done | In Progress | Not Started | Not Started | Building |
| Dashboard | P0 | Not Started | Not Started | Not Started | Not Started | Queued |

## Active Blockers
- [blocker description, escalation status]

## Key Decisions Made
- [link to DECISIONS.md entries]
```

### State Update Protocol

1. **Start of every conversation**: Orchestrator reads PROJECT_STATE.md FIRST
2. **After every agent completes work**: Orchestrator updates the relevant row
3. **On phase transition**: Orchestrator updates Current Phase and validates gate criteria
4. **On escalation**: Orchestrator logs blocker, pauses current work, re-activates planning agent

---

## Feedback Loops & Error Recovery

### Escalation Protocol

When a coding agent discovers a planning issue:

```
1. Coding Agent identifies issue
   → "The data model can't support the search feature as designed"

2. Agent documents the issue with:
   - What was attempted
   - Why it failed
   - What needs to change in the planning artifact
   - Suggested fix (optional)

3. Orchestrator receives escalation
   → Logs in DECISIONS.md
   → Pauses current build phase
   → Re-activates relevant planning agent with TARGETED scope
   → "Revise section 3.2 of SYSTEM_BLUEPRINT.md: data model for search"

4. Planning agent makes targeted revision
   → Updates artifact with [REVISED] tag
   → Documents rationale in DECISIONS.md

5. Orchestrator validates revision
   → Resumes build phase
   → Updates PROJECT_STATE.md
```

### Common Recovery Scenarios

| Scenario | Action |
|----------|--------|
| API contract mismatch (Frontend vs Backend) | Orchestrator syncs both agents against API_CONTRACT.md |
| Missing feature in plan (discovered during build) | Escalate to Product Strategy for P0/P1/P2 classification |
| Tech stack limitation discovered | Escalate to Blueprint Architect for targeted revision |
| Security vulnerability in architecture | Security Agent escalates; Blueprint Architect revises |
| Test reveals broken user flow | Testing Agent escalates; UX Designer revises flow |

---

## Alignment & Clarity Protocol

This is the most important section of this framework. Everything else is useless if the AI builds the wrong thing.

### The Golden Rule

> **When in doubt: STOP → ASK → CONFIRM → PROCEED**

Every agent, every phase, every task. No exceptions.

### When to STOP and ASK

| Situation | What to Do |
|-----------|-----------|
| Requirement is vague | Ask for specifics. "What does [X] mean to you?" |
| Multiple valid interpretations | Present options: "I see approach A and B. A does [X], B does [Y]." |
| Missing information | Ask for it. "I need to know [X] before I can proceed." |
| Conflict between artifacts | Flag it: "MVP_PLAN says [X] but BLUEPRINT says [Y]. Which is correct?" |
| Acceptance criteria is untestable | Ask: "How would I verify that [criterion] is met?" |
| Scope feels too large | Ask: "Should I build all of this now, or focus on [subset]?" |
| You're less than 80% confident | STOP. State the uncertainty. Ask. |

### Pre-Work Alignment (Mandatory for Every Agent)

Before producing ANY output, every agent MUST:

1. **Summarize understanding** — "I'll build [X] using [Y], producing [Z]."
2. **List context files** — "I'll read MVP_PLAN, BLUEPRINT, and API_CONTRACT."
3. **Flag ambiguities** — "I'm unsure about [specific thing]."
4. **Ask for confirmation** — "Does this match your expectations?"
5. **Wait** — Do NOT proceed until the user confirms.

### Assumption Handling

| Assumption Type | Action |
|----------------|--------|
| **Minor** (naming convention, formatting) | Tag as `[ASSUMPTION]`, continue, verify at end |
| **Medium** (component structure, test approach) | Tag as `[ASSUMPTION]`, mention in mid-work check-in |
| **Major** (architecture, data model, user flow, security) | **STOP AND ASK. No exceptions.** |

### Post-Work Confidence Signal

After every artifact or significant code delivery:

```
CONFIDENCE: HIGH / MEDIUM / LOW

HIGH   = "Specs were clear, I followed them precisely. Ready for review."
MEDIUM = "I made judgment calls on [X, Y]. Please review those sections."
LOW    = "I'm unsure about [X]. Let's discuss before proceeding."
```

This tells the user WHERE to focus their review time.

### Regular Audits

| When | What |
|------|------|
| Every gate transition | Cross-check ALL artifacts for consistency |
| Start of new session | Summarize state, ask "still accurate?" |
| Every 2 features in Phase 4 | API_CONTRACT ↔ COMPONENT_SPEC ↔ UX_SPEC ↔ code |
| After any escalation/revision | Check all downstream artifacts |
| User returns after break | Full state review |

---

## Cross-Cutting Concerns — Scalability, Concurrency & Engineering Excellence

These concerns span MULTIPLE agents. Every agent must be aware of them. The Blueprint Architect decides the strategy; coding agents implement it.

### 1. Concurrency & Race Conditions

| Concern | Who Handles It | Strategy |
|---------|---------------|----------|
| Concurrent database writes to same row | Backend Agent | Optimistic locking (version column) or pessimistic locking (SELECT FOR UPDATE). Document choice in DECISIONS.md. |
| Double-submit on forms | Frontend Agent | Disable submit button on click + idempotency key. Backend rejects duplicate idempotency keys. |
| Stale reads after writes | Backend + Frontend | Return updated resource in write response. Frontend updates local state from response, not from stale cache. |
| Race condition in multi-step workflows | Backend Agent | Use database transactions. If distributed, use saga pattern. Document in SYSTEM_BLUEPRINT.md. |
| Concurrent user sessions | Security Agent | Define session strategy (single session vs. multi-device). Implement token revocation. |

**Blueprint Architect must decide**: Optimistic vs. pessimistic locking, transaction isolation level, distributed vs. local transactions. Log as ADR.

### 2. Database Performance & Scalability

| Concern | Who Handles It | Strategy |
|---------|---------------|----------|
| N+1 query problems | Backend Agent | Use eager loading / joins / DataLoader pattern. Profile queries during development. |
| Missing indexes | Backend Agent | Add indexes on foreign keys, commonly filtered/sorted columns, and unique constraints. Document in SYSTEM_BLUEPRINT.md data model. |
| Connection pooling | Backend Agent + DevOps | Configure pool size based on expected concurrency. Don't open/close connections per request. |
| Query performance | Backend Agent | Set query timeout. Log slow queries (>200ms). Add EXPLAIN ANALYZE for complex queries. |
| Data migration (zero-downtime) | Backend + DevOps | Forward-only migrations. Add columns as nullable first, backfill, then add constraints. Never rename/drop columns in one step. |
| Large dataset pagination | Backend Agent | Cursor-based pagination for large/infinite lists. Offset-based only for small, bounded datasets. |
| Read replicas | Blueprint Architect | For read-heavy apps: route writes to primary, reads to replica. Document in SYSTEM_BLUEPRINT.md if needed for MVP. |

### 3. Caching Strategy

| Layer | What to Cache | TTL | Invalidation |
|-------|--------------|-----|-------------|
| **HTTP** (CDN/Browser) | Static assets, public API responses | Long (1h-1d) for assets, short (30s-5m) for API | Cache-busting via content hash for assets; Cache-Control headers for API |
| **Application** (Redis/In-memory) | Session data, computed results, rate limit counters | Varies by data type | Invalidate on write. Use cache-aside pattern: read cache → miss → read DB → populate cache. |
| **Database** (Query cache) | Frequently executed identical queries | Short (1-5 min) | Automatic invalidation on table write |

**Blueprint Architect must decide**: Do we need a cache layer for MVP? If yes, Redis vs. in-memory. Log as ADR. Backend Agent implements. Frontend Agent implements client-side caching (SWR/React Query stale-while-revalidate).

### 4. Idempotency

Every write API endpoint must handle the case where the same request is sent twice (network retry, user double-click, webhook replay).

| Approach | When to Use |
|----------|-------------|
| **Idempotency key** (client sends UUID in header) | Payment processing, order creation, any non-retriable-safe operation |
| **Upsert / ON CONFLICT** | Create-or-update operations where natural key exists |
| **Database unique constraints** | Prevent duplicate records (email, username, order ID) |
| **Conditional updates** (If-Match / ETag) | Update operations where version conflicts matter |

**Backend Agent**: Every POST/PUT endpoint must document its idempotency behavior in API_CONTRACT.md.
**Frontend Agent**: Send idempotency key for critical mutations. Disable submit buttons during pending requests.

### 5. Error Handling & Resilience

| Pattern | What It Solves | Who Implements |
|---------|---------------|----------------|
| **Circuit breaker** | Prevents cascading failures when a dependency is down | Backend Agent (for external API calls, DB connections) |
| **Retry with exponential backoff** | Transient failures (network blips, rate limits) | Backend Agent (outbound calls), Frontend Agent (API calls) |
| **Graceful degradation** | App works (reduced functionality) when a service is down | Frontend Agent (show cached data, disable features) |
| **Dead letter queue** | Failed async jobs don't disappear | Backend Agent (for background jobs, webhooks) |
| **Health checks** | Know when a service is unhealthy before users notice | Backend Agent (/health endpoint), DevOps Agent (monitoring) |
| **Timeout everywhere** | Prevents threads/connections hanging forever | Backend Agent (DB queries, HTTP calls), Frontend Agent (API calls) |

### 6. Performance Testing

| Type | When | Who | Tool Examples |
|------|------|-----|---------------|
| **Load testing** | After P0 features built, before launch | Testing Agent | k6, Artillery, Locust |
| **Stress testing** | After load testing baseline established | Testing Agent | Same tools, higher concurrency |
| **Soak testing** | Before production launch (long-running) | Testing Agent + DevOps | 2-4 hour sustained load |
| **API benchmarking** | Per-endpoint after implementation | Backend Agent | autocannon, wrk, hey |

**Testing Agent must define**: Target response times (p50, p95, p99), max concurrent users, throughput targets. Document in TEST_PLAN.md.

### 7. Technical Debt Tracking

Technical debt is inevitable. Track it instead of ignoring it.

```markdown
## TECH_DEBT section in DECISIONS.md

| ID | Description | Severity | Created | Sprint to Fix | Status |
|----|-------------|----------|---------|---------------|--------|
| TD-001 | Auth uses simple JWT without refresh token rotation | Medium | Phase 4a | Post-MVP | Open |
| TD-002 | N+1 query in dashboard endpoint | Low | Phase 4a | Sprint 2 | Open |
```

**Rules**:
- Any agent can log technical debt during their work
- Severity: Critical (fix before launch), Medium (fix within 2 sprints), Low (fix when convenient)
- Critical tech debt is treated like a security finding — blocks launch
- Review debt list at every phase transition

### 8. Hotfix Protocol

When a critical bug is found in production during active feature development:

```
1. STOP current feature work (Orchestrator pauses)
2. Branch from production (not from feature branch)
3. Fix → Test → Security check (compressed cycle, skip planning)
4. Deploy hotfix to production
5. Cherry-pick/merge fix back into development branch
6. Resume feature work
7. Log incident in DECISIONS.md as ADR
```

The Orchestrator tracks hotfixes as blockers in PROJECT_STATE.md and ensures the fix is merged back before the next feature deployment.

---

## How to Use This Framework

### For a New Project

1. **Copy the bootstrap template** into your new project directory:
   ```
   your-project/
   ├── .cursor/rules/          ← Copy cursor-rules/*.mdc here
   ├── PROJECT_STATE.md        ← Copy from artifacts/PROJECT_STATE.md
   ├── DECISIONS.md            ← Start empty from template
   └── artifacts/              ← Created as agents produce them
   ```

2. **Start a conversation** with: "I want to build [your idea]. Read PROJECT_STATE.md and begin Phase 1."

3. **The Orchestrator activates** — reads state, determines you're in Phase 0, and activates the Product Strategy Agent.

4. **Follow the gates** — Don't rush through planning. Review each artifact. Approve explicitly before moving on.

5. **For each coding phase** — Specify which feature you're building: "Build the User Authentication feature (P0)."

### Invoking a Specific Agent

You can directly invoke any agent by referencing it:

| Say This | Agent Activated |
|----------|----------------|
| "Plan the product / Define the MVP" | Product Strategy Lead |
| "Design the architecture / Plan the tech stack" | Systems Blueprint Architect |
| "Design the UI / Map user flows" | Experience & Interface Designer |
| "Build the backend / Create the API" | Backend Agent |
| "Build the frontend / Create the UI" | Frontend Agent |
| "Write tests / Check coverage" | Testing Agent |
| "Security review / Audit the code" | Security & Risk Agent |
| "Set up CI/CD / Configure deployment" | DevOps Agent |
| "What's the status / What's next" | Orchestrator |

### Between Sessions

The AI doesn't remember previous conversations. But the artifacts do. At the start of every new session:

1. Say: "Read PROJECT_STATE.md and continue where we left off"
2. The Orchestrator reads state, loads relevant artifacts, and picks up exactly where you stopped
3. All decisions are in DECISIONS.md — no re-debating

---

## Anti-Patterns to Avoid

| Anti-Pattern | Why It Fails | Do This Instead |
|-------------|-------------|-----------------|
| **Skipping planning** ("just start coding") | You'll rewrite 3x. Planning is cheaper than debugging. | Complete all 3 planning phases before any code. |
| **Mega-prompts** ("build me the whole app") | AI can't hold everything in context. Quality drops. | One feature at a time, one agent at a time. |
| **No state file** | Next session, the AI has zero memory. You start over. | Always maintain PROJECT_STATE.md. |
| **Ignoring gates** | Coding against incomplete plans = guaranteed rework. | Get explicit approval at every gate. |
| **Multiple agents in one prompt** | Conflicting responsibilities, confused output. | One agent role per conversation turn. |
| **Not documenting decisions** | Same debate happens every session. | Every "why" goes into DECISIONS.md immediately. |
| **Editing artifacts directly** | Breaks the agent → artifact → consumer chain. | Always go through the producing agent. |
| **Skipping security review** | Vulnerabilities in production are 100x more expensive. | Security Agent reviews every feature before deployment. |

---

## File Structure Reference

```
your-project/
├── .cursor/
│   └── rules/
│       ├── cto-agent.mdc              ← Always active: technical authority
│       ├── 00-orchestrator.mdc        ← Always active: manages state
│       ├── 01-product-strategy.mdc    ← Planning: MVP definition
│       ├── 02-system-blueprint.mdc    ← Planning: Architecture
│       ├── 03-ux-designer.mdc         ← Planning: Interface design
│       ├── 04-backend.mdc             ← Building: Server-side code
│       ├── 05-frontend.mdc            ← Building: Client-side code
│       ├── 06-testing.mdc             ← Building: Test coverage
│       ├── 07-security.mdc            ← Building: Security audit
│       ├── 08-devops.mdc              ← Building: Deployment
│       ├── 09-learning.mdc            ← Lifecycle: Self-improvement
│       ├── 10-reactive-maintenance.mdc ← Lifecycle: Bug fixes, incidents
│       └── 11-proactive-evolution.mdc ← Lifecycle: Upgrades, refactoring
├── PROJECT_STATE.md                   ← Current phase, progress, blockers
├── DECISIONS.md                       ← Architecture Decision Records
├── artifacts/
│   ├── MVP_PLAN.md                    ← Phase 1 output
│   ├── SYSTEM_BLUEPRINT.md            ← Phase 2 output
│   ├── UX_SPEC.md                     ← Phase 3 output
│   ├── API_CONTRACT.md                ← Phase 4a output
│   ├── COMPONENT_SPEC.md              ← Phase 4b output
│   ├── TEST_PLAN.md                   ← Phase 4c output
│   ├── SECURITY_REVIEW.md             ← Phase 4d output
│   ├── DEPLOYMENT_GUIDE.md            ← Phase 5 output
│   ├── LESSONS_LEARNED.md             ← Cross-agent lessons (Learning Agent)
│   └── DOMAIN_EXTENSION.md            ← Domain-specific additions (optional)
├── agent-learnings/                   ← Per-agent learning files
│   ├── orchestrator-learnings.md
│   ├── product-strategy-learnings.md
│   ├── blueprint-architect-learnings.md
│   ├── ux-designer-learnings.md
│   ├── backend-learnings.md
│   ├── frontend-learnings.md
│   ├── testing-learnings.md
│   ├── security-learnings.md
│   ├── devops-learnings.md
│   ├── cto-learnings.md
│   ├── learning-agent-learnings.md
│   ├── reactive-maintenance-learnings.md
│   └── proactive-evolution-learnings.md
└── src/                               ← Your actual application code
```

---

## Quick Reference Card

```
START → Orchestrator reads PROJECT_STATE.md
      → Phase 1: Product Strategy → MVP_PLAN.md → [USER APPROVES] → [CTO reviews G1]
      → Phase 2: Blueprint Architect → SYSTEM_BLUEPRINT.md → [CTO reviews tech] → [USER APPROVES] → [CTO reviews G2]
      → Phase 3: UX Designer → UX_SPEC.md → [USER APPROVES] → [CTO reviews G3]
      → Phase 4: For each feature:
          → 4a: Backend → code + API_CONTRACT.md
          → 4b: Frontend → code + COMPONENT_SPEC.md
          → 4c: Testing → tests + TEST_PLAN.md
          → 4d: Security → SECURITY_REVIEW.md
          → [GATE: Tests pass + No critical issues] → [CTO reviews G4]
          → Learning Agent: mini retrospective
      → Phase 5: DevOps → CI/CD + DEPLOYMENT_GUIDE.md → [CTO reviews G6]
      → Phase 6: Launch → Final checklist → DEPLOY
      → Learning Agent: Full project retrospective

POST-LAUNCH:
      → Bug/incident → Reactive Maintenance Agent → fix → root cause analysis → Learning Agent
      → Upgrade/refactor → Proactive Evolution Agent → plan → execute → verify
```

---

## Domain-Specific Extensions

The base framework covers general web application development. For specialized domains, add a **Domain Extension** — a supplemental checklist and pattern set that augments (not replaces) the existing agents.

### When to Use an Extension

If the project involves any of these, create a domain extension during Phase 2 (Architecture):

| Domain | Indicators | Key Concerns |
|--------|-----------|-------------|
| **AI / ML** | LLM APIs, embeddings, RAG, model training | Prompt injection, token cost management, streaming responses, multi-tenant data isolation, output safety |
| **Fintech / Payments** | Stripe, payment processing, wallets, ledgers | PCI compliance, double-spend prevention, audit trails, financial transaction idempotency, reconciliation |
| **Healthcare** | Patient data, medical records, clinical workflows | HIPAA compliance, PHI encryption, audit logging, consent management, data retention policies |
| **E-commerce** | Product catalogs, carts, orders, inventory | Inventory race conditions, payment atomicity, order state machines, tax calculation, shipping integration |
| **Real-time / Collaborative** | WebSockets, live cursors, multiplayer, chat | Conflict resolution (CRDT/OT), connection lifecycle, presence, message ordering, offline sync |
| **IoT / Edge** | Device communication, telemetry, firmware | Protocol selection (MQTT/CoAP), device auth, OTA updates, intermittent connectivity, data aggregation |

### How to Create an Extension

1. During Phase 2, the Blueprint Architect identifies if a domain extension is needed
2. Create a file: `artifacts/DOMAIN_EXTENSION.md` with:
   - **Domain**: Which domain this covers
   - **Additional Security Checklist**: Items the Security Agent must audit beyond OWASP
   - **Additional Backend Patterns**: Domain-specific patterns the Backend Agent must follow
   - **Additional Frontend Patterns**: Domain-specific UI patterns
   - **Additional Test Scenarios**: Domain-specific test cases the Testing Agent must cover
   - **Compliance Requirements**: Regulatory or industry standards that apply
3. The Orchestrator loads this extension alongside the standard agent rules
4. Each agent checks the extension for domain-specific additions to their standard checklist

### Example: AI Application Extension

```markdown
# DOMAIN_EXTENSION.md — AI / LLM Application

## Additional Security Checklist
- [ ] Prompt injection testing (system prompt override attempts)
- [ ] Multi-tenant RAG isolation (user A cannot access user B's embeddings)
- [ ] Token/cost abuse prevention (input length limits, rate limiting per user)
- [ ] Output content safety filtering
- [ ] AI provider API key rotation policy

## Additional Backend Patterns
- Streaming: Use SSE for LLM token streaming (not WebSockets)
- Embeddings: Batch embed operations, don't embed per-request
- RAG: Chunk size 500 tokens / 100 overlap, top-k=5 retrieval
- Cost tracking: Log token usage per request, per user, per model

## Additional Frontend Patterns
- Streaming text: Render tokens incrementally, not after full response
- Loading UX: Show typing indicator during AI generation
- Error handling: Distinguish between "AI error" and "system error"

## Additional Test Scenarios
- Prompt injection: Test 10+ known injection patterns
- RAG accuracy: Test retrieval relevance with known document/question pairs
- Streaming: Test partial response rendering, connection drop mid-stream
- Rate limiting: Verify enforcement at tier boundaries
```

---

**Remember**: Artifacts are your memory. Gates are your quality. The Orchestrator is your coordinator. Trust the process.
