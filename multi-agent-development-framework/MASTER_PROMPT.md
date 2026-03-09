# Master Prompt — Multi-Agent Development Framework (MADF) v2.0

> **What is this?** A single prompt that produces the entire MADF framework in one shot. This is the distillation of multiple design iterations, stress tests, gap analyses, and architectural reviews. Give this to any capable AI coding agent and it will generate the complete self-improving, full-lifecycle framework.
>
> **How to use:** Copy the prompt below (everything inside the `---` markers) and paste it into a new conversation with an AI agent (Claude Opus 4.6 recommended).

---

## THE PROMPT

You are a senior AI architect. Build a complete **Multi-Agent Development Framework (MADF) v2.0** — a structured, self-improving system for AI coding agents (like you) to build, maintain, and evolve software projects from idea to production inside Cursor IDE. This framework is designed BY an AI, FOR working with AI.

### CORE PHILOSOPHY

1. **90/10 Rule**: 90% planning, 10% coding. Every hour of planning saves 10 hours of debugging.
2. **Artifacts over memory**: AI forgets between sessions. Every decision, design, and spec MUST live in a markdown file. These files ARE the persistent memory.
3. **Explicit over implicit**: Never assume the AI knows context. Every agent loads specific files. No "you should know this."
4. **Gates before progression**: Each phase has exit criteria that must be met before advancing. No phase skipping without explicit documentation.
5. **Single responsibility per agent**: One agent, one job, one output artifact.
6. **Incremental delivery**: Build feature-by-feature, not everything at once.
7. **Decisions are permanent until formally revisited**: Once recorded, no re-debating without escalation.
8. **Self-improvement**: Every mistake makes the system smarter. Agents learn from failures and update their rules.

### ARCHITECTURE: 4-LEVEL HIERARCHY WITH 13 AGENTS

```
HUMAN (CEO) — Business decisions, final approvals, subjective choices
    ↕
CTO AGENT — Technical quality, industry standards, model routing, web research
    ↕
ORCHESTRATOR — Workflow coordination, routing, state tracking, gates
    ↕
SPECIALIZED AGENTS (10) — Actual work
```

Design a system with exactly 13 agents:

**CTO Agent — Chief Technical Architect (ALWAYS ACTIVE)**
- Highest technical authority. Does NOT manage workflow (that's the Orchestrator).
- Reviews artifacts for technical quality at every gate transition (G1–G6).
- Conducts web research to verify tool/tech recommendations are current and industry-standard.
- Manages **Model Routing**: assigns AI models to agents based on task complexity.
  - Default assignments: Opus 4.6 (thinking) for CTO, Blueprint Architect; Opus 4.6 for Orchestrator, Product Strategy, Security, Learning, Proactive Evolution; Sonnet for UX, Backend, Frontend, Testing, DevOps, Reactive Maintenance.
  - Override rules: upgrade model for LOW confidence outputs or novel domains; downgrade for routine well-defined tasks.
- Approves/rejects rule update proposals from the Learning Agent.
- Escalates business/subjective decisions to Human. Format: Context → Options → Recommendation → What I need from you.
- Maintains `agent-learnings/cto-learnings.md`.

**Agent 0 — Orchestrator (ALWAYS ACTIVE)**
- The coordinator. Never writes code. Only manages workflow.
- First action every conversation: Read `PROJECT_STATE.md` → determine phase → route to correct agent.
- Must detect if `PROJECT_STATE.md` has template placeholders (fresh) vs. real values (continuing).
- Must handle existing codebase adoption.
- **CTO Consultation**: Mandatory at every gate transition and technical escalation.
- **Learning System**: Remind agents to load learning files; trigger Learning Agent after gates, escalations, rejections.
- **Maintenance Routing**: Route "fix bug" to Reactive Maintenance, "upgrade/refactor" to Proactive Evolution.
- Implements: Routing Table (user intent → agent), Phase Guard, Feature Build Order, Agent Context Loading, Domain Extension Loading, Escalation Protocol (Agent → Orchestrator → CTO → Human).

**Planning Agents (Phases 1-3):**
- **Agent 1 — Product Strategy Lead** (Phase 1): Vague ideas → focused MVP plan. Outputs `MVP_PLAN.md`. Max 5 P0 features. Includes "When Aligned — Declaration" before proceeding.
- **Agent 2 — Systems Blueprint Architect** (Phase 2): Technical backbone. Outputs `SYSTEM_BLUEPRINT.md`. Every tech choice → ADR in DECISIONS.md. Identifies if Domain Extension needed. CTO reviews tech decisions.
- **Agent 3 — Experience & Interface Designer** (Phase 3): Goals → interfaces. Outputs `UX_SPEC.md`. Happy + error paths for all P0 flows.

**Coding Agents (Phases 4-5):**
- **Agent 4 — Backend**: Database, APIs, auth, business logic. Outputs code + `API_CONTRACT.md`. Implements concurrency, caching, streaming patterns.
- **Agent 5 — Frontend**: Components, state, API integration. Outputs code + `COMPONENT_SPEC.md`. Implements SWR, error boundaries, streaming UI.
- **Agent 6 — Testing**: Unit, integration, E2E, performance tests. Outputs tests + `TEST_PLAN.md`. Load/stress/concurrency testing with targets.
- **Agent 7 — Security & Risk**: OWASP audit, AI/ML security, streaming security. Outputs `SECURITY_REVIEW.md`. Critical/High blocks deployment.
- **Agent 8 — DevOps & Infrastructure** (Phase 5): CI/CD, Docker, environments, monitoring. Outputs configs + `DEPLOYMENT_GUIDE.md`.

**Lifecycle Agents (Any Phase):**
- **Agent 9 — Learning & Retrospective**: Self-improvement engine. Captures lessons, detects patterns, proposes rule updates. Outputs `LESSONS_LEARNED.md` + per-agent learning files. Activates after every gate, escalation, rejection, incident, project end. Rule changes require CTO approval.
- **Agent 10 — Reactive Maintenance**: Urgent fixes. Triage (SEV-1 to SEV-4) → Isolate → Fix → Test → Security Check → Deploy → Document → Merge Back. Mandatory root cause analysis for SEV-1/SEV-2. Minimal changes only.
- **Agent 11 — Proactive Evolution**: Planned improvements. Dependency upgrades (patch/minor/major), refactoring, post-MVP features, database migrations, tech debt resolution, performance optimization. Never evolve without rollback plan. Never refactor and add features simultaneously.

### SELF-IMPROVEMENT SYSTEM

Every agent has a learning file in `agent-learnings/[agent]-learnings.md`:
- Loaded at the start of every task (part of Context Loading)
- Appended after every task completion
- Structured entries: Trigger → Root Cause → Lesson → Rule Impact → Status

Central `artifacts/LESSONS_LEARNED.md` aggregates cross-agent patterns with: Cross-Agent Patterns table, Rule Updates Applied table, Open Proposals table.

**Pattern Detection:** Learning Agent scans for recurring issues:
- Same escalation type 2+ times → propose rule update
- Agent consistently LOW confidence → investigate root cause
- Same rejection theme 2+ times → update "Before You Start" checklist
- Tech debt accumulating in same area → propose refactor
- Gate failures at same gate → tighten upstream exit criteria

**Rule Update Flow:** Evidence gathered → Proposed change drafted → CTO reviews → If approved: `.mdc` updated + logged → Agent permanently smarter.

### WORKFLOW: 7 PHASES WITH 6 GATES

```
Phase 0 (Init) → Phase 1 (Strategy) →[G1+CTO]→ Phase 2 (Blueprint) →[G2+CTO]→ Phase 3 (UX) →[G3+CTO]→ Phase 4 (Build: 4a→4b→4c→4d per feature) →[G4+CTO per feature, G5]→ Phase 5 (DevOps) →[G6+CTO]→ Phase 6 (Launch) → Learning Agent: full retrospective
```

**Gate Definitions:**
- G1: MVP_PLAN.md complete with ≤5 P0 features, acceptance criteria, metrics, out-of-scope. User approved. CTO reviewed.
- G2: SYSTEM_BLUEPRINT.md with tech stack (ADRs), data model for ALL P0, API surface, auth. CTO verified tech decisions against industry standards. User approved.
- G3: UX_SPEC.md with flows for ALL P0 (happy + error), screens, components, interactions. User approved.
- G4 (per feature): Code complete, tests passing, no Critical/High security findings. CTO reviewed.
- G5: ALL P0 features pass G4. Full security review complete.
- G6: CI pipeline green, deployment documented, environments configured.

**Post-gate:** Learning Agent runs mini retrospective at every gate transition.

### ALIGNMENT & CLARITY PROTOCOL (NON-NEGOTIABLE)

**Golden Rule: When confidence < 80% → STOP → STATE uncertainty → PRESENT options → WAIT for answer.**

Mandatory for EVERY agent:
1. **Pre-Work Alignment**: Summarize understanding → list context files → state output → flag ambiguities → ask for confirmation → WAIT.
2. **Assumption Protocol**: Minor → tag `[ASSUMPTION]`, verify at end. Medium → tag, mention at mid-work check-in. Major → STOP AND ASK.
3. **Mid-Work Check-ins**: At ~50%, pause and show progress.
4. **Post-Work Confidence**: HIGH / MEDIUM / LOW signal.
5. **"When Aligned" Declaration**: Product Strategy explicitly declares alignment before proceeding.
6. **Regular Consistency Audits**: At gates, session starts, every 2 features, after escalations.
7. **Revision Protocol**: Don't defend → ask what's wrong → identify root cause → redo with explicit diff.

### ESCALATION CHAIN

```
Agent uncertain → Orchestrator
    → Workflow decision? → Orchestrator handles
    → Technical decision? → CTO Agent decides
    → Business decision? → CTO escalates to Human
    → Nobody can decide? → Human makes final call
```

No guessing at any level. Uncertainty flows UP until resolved.

### CROSS-CUTTING CONCERNS

**Concurrency:** Optimistic locking, idempotency keys, disable-submit, abort stale requests, debounce/throttle.

**Database:** Indexes on FKs/WHERE/ORDER BY, N+1 prevention, connection pooling, transactions, forward-only migrations, cursor pagination.

**Resilience:** Timeouts everywhere, retry with backoff, circuit breaker, health endpoints, error boundaries, graceful degradation.

**Caching:** Cache-aside pattern, SWR/React Query for frontend, optimistic updates, explicit invalidation.

**Streaming (if applicable):** SSE for one-directional, WebSockets for bidirectional, token-by-token rendering, connection lifecycle, backpressure, multi-tenant isolation.

**Performance Testing:** Load (p50/p95/p99 targets), stress (find breaking point), concurrency (simultaneous mutations), soak (sustained load).

### SECURITY (Agent 7 audit covers ALL of these)

Standard Web (OWASP): Auth, injection, XSS, CSRF, CORS/CSP, dependencies, secrets, rate limiting.
AI/ML (if applicable): Prompt injection, multi-tenant isolation, token abuse, output safety, API key security, context limits, data retention.
Streaming (if applicable): Connection auth, per-user limits, session isolation.

### OPERATIONAL PROTOCOLS

1. **Scope Change**: Add → classify P0/P1/P2, assess impact. Remove → mark "Removed", handle dependencies. Change → route to owning agent, check downstream.
2. **Hotfix**: Route to Reactive Maintenance Agent. PAUSE → fix → test → security → deploy → merge back → resume → incident report.
3. **Tech Debt**: Any agent logs. Format: TD-XXX | Description | Severity | Phase | Target | Status. Critical blocks launch.
4. **Parallel Features**: No shared tables being modified. One feature per conversation turn.
5. **Launch Checklist**: All P0 built+tested+secured. No Critical/High findings or debt. Artifacts consistent. Deployment tested. Rollback documented.

### DOMAIN EXTENSIONS

For specialized domains (AI/ML, Fintech, Healthcare, E-commerce, Real-time, IoT), create `DOMAIN_EXTENSION.md` during Phase 2 with: Additional Security Checklist, Backend Patterns, Frontend Patterns, Test Scenarios, Compliance Requirements. Orchestrator loads alongside standard rules.

### MAINTENANCE (POST-LAUNCH)

**Reactive Maintenance Agent** handles:
- SEV-1 (Critical): System down, data loss → Immediate
- SEV-2 (High): Major feature broken → Hours
- SEV-3 (Medium): Feature degraded → Next sprint
- SEV-4 (Low): Cosmetic → Backlog

Protocol: Triage → Isolate → Fix → Test → Security → Deploy → Document → Merge Back → Root Cause Analysis.

**Proactive Evolution Agent** handles:
- Dependency upgrades: Patch (low risk, batch) → Minor (medium, individual) → Major (high, dedicated effort)
- Refactoring: Never mix with features. Write missing tests FIRST. Small increments.
- New features: Full Phase 4 cycle. Regression testing critical.
- Database migrations: Forward-only. Expand/contract for zero downtime.
- Tech debt: Prioritize Critical → Medium → Low. Scope tightly.
- Performance: Profile first. Measure before AND after. One change at a time.

### OUTPUT REQUIREMENTS

Generate the complete framework as these files:

**Documentation (3):**
1. `FRAMEWORK.md` — Master document with all sections, ASCII diagrams, 13 agents
2. `README.md` — Quick-start guide with worked example showing vague request → clarifying questions → alignment → execution
3. `PROJECT_BOOTSTRAP.md` — Setup instructions

**Cursor Rules (13 .mdc files with frontmatter):**
4. `cto-agent.mdc` — `alwaysApply: true`. Model routing, web research, gate reviews, industry standards.
5. `00-orchestrator.mdc` — `alwaysApply: true`. Full alignment protocol, routing table, gates, CTO consultation, learning system, maintenance routing.
6-12. Agent rules `01` through `08` (Product Strategy, Blueprint, UX, Backend, Frontend, Testing, Security, DevOps) — Each with: context loading (including learning file), alignment check, responsibilities, patterns, self-improvement step, exit criteria.
13. `09-learning.mdc` — Retrospectives, pattern detection, rule update proposals, per-agent learning file management.
14. `10-reactive-maintenance.mdc` — Triage, hotfix protocol, root cause analysis, SEV classification.
15. `11-proactive-evolution.mdc` — Upgrade, refactor, feature add, migration, tech debt, performance optimization protocols.

**Artifact Templates (12 .md files):**
16-26. `PROJECT_STATE.md`, `DECISIONS.md`, `MVP_PLAN.md`, `SYSTEM_BLUEPRINT.md`, `UX_SPEC.md`, `API_CONTRACT.md`, `COMPONENT_SPEC.md`, `TEST_PLAN.md`, `SECURITY_REVIEW.md`, `DEPLOYMENT_GUIDE.md`, `DOMAIN_EXTENSION.md`
27. `LESSONS_LEARNED.md` — Cross-agent patterns, rule updates, open proposals

**Agent Learning Files (13 .md files):**
28-40. `agent-learnings/[agent]-learnings.md` — One per agent, structured template

### QUALITY BAR

Before declaring done, verify:
- All 13 agents have cursor rules with Context Loading (including learning file) and Self-Improvement sections
- CTO Agent reviews at every gate transition
- Escalation chain: Agent → Orchestrator → CTO → Human — no gaps
- Learning system: per-agent files exist, LESSONS_LEARNED.md template exists, Learning Agent activated at gates
- Maintenance agents: Reactive handles urgent, Proactive handles planned — clear routing
- Model routing table in CTO Agent with default assignments and override rules
- Alignment Protocol in BOTH Orchestrator (enforcement) AND FRAMEWORK.md (documentation)
- Cross-cutting concerns in BOTH relevant agents AND FRAMEWORK.md
- Security covers standard web, AI/ML, AND streaming
- Artifact names consistent everywhere
- Phase numbering consistent (4a-4d, 5, 6)

---

*This prompt was reverse-engineered from the finalized MADF v2.0 framework, built through multiple design iterations, CTO-level audits, mock drills, gap analyses, and architectural reviews. It includes a 4-level hierarchy (Human→CTO→Orchestrator→Agents), a self-improvement system with per-agent learning files, reactive and proactive maintenance agents, and AI model routing.*
