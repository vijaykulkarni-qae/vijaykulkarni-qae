# MADF Quick Commands Reference

Quick invocation shortcuts for common MADF workflows. Use these phrases to activate specific agents or skills without remembering the full agent hierarchy.

---

## Phase Management

| Command | What It Does | Agent Activated |
|---------|-------------|----------------|
| `/status` | Report current phase, progress, blockers | Orchestrator (00) |
| `/plan` | Define or review the MVP plan | Product Strategy (01) |
| `/blueprint` | Design system architecture and tech stack | Blueprint Architect (02) |
| `/ux` | Design user flows, screens, components | UX Designer (03) |
| `/review` | CTO technical quality review | CTO Agent |
| `/learn` | Run retrospective, capture lessons | Learning Agent (09) |

## Build Phase

| Command | What It Does | Agent Activated |
|---------|-------------|----------------|
| `/build-backend` | Build server-side code for a feature | Backend Agent (04) |
| `/build-frontend` | Build client-side code for a feature | Frontend Agent (05) |
| `/test` | Write tests using TDD workflow | Testing Agent (06) |
| `/security` | Full OWASP security audit | Security Agent (07) |
| `/deploy` | Set up CI/CD and deployment | DevOps Agent (08) |

## Quality & Verification

| Command | What It Does | Skill/Agent |
|---------|-------------|-------------|
| `/verify` | Run 6-phase verification loop (Build → Type → Lint → Test → Security → Diff) | verification-loop skill |
| `/search` | Research existing solutions before coding | search-first skill |
| `/tdd` | Follow TDD workflow (RED → GREEN → IMPROVE) | tdd-workflow skill |
| `/eval` | Define and run eval-driven development checks | eval-harness skill |

## Lifecycle Management

| Command | What It Does | Agent Activated |
|---------|-------------|----------------|
| `/fix` | Triage and fix a bug (SEV-1 to SEV-4) | Reactive Maintenance (10) |
| `/evolve` | Planned upgrade, refactor, or new feature | Proactive Evolution (11) |
| `/compact` | Strategic context compaction at phase boundary | strategic-compact skill |

## Session Management

| Command | What It Does |
|---------|-------------|
| `/continue` | "Read PROJECT_STATE.md and continue where we left off" |
| `/gate` | "Check if current gate criteria (G1–G6) are met" |
| `/escalate` | "Escalate current issue through the chain: Agent → Orchestrator → CTO → Human" |
| `/decisions` | "Show recent entries from DECISIONS.md" |
| `/debt` | "Show technical debt items from DECISIONS.md TECH_DEBT section" |

---

## Usage Example

Instead of saying:
> "I want to activate the Backend Agent to build the User Authentication feature. Please read the SYSTEM_BLUEPRINT.md and API_CONTRACT.md first."

You can say:
> "/build-backend User Authentication"

The Orchestrator will:
1. Verify you're in Phase 4 (Build) and G3 has passed
2. Load the Backend Agent's cursor rule and learning file
3. Load the search-first and development-workflow skills
4. Begin the alignment protocol for User Authentication

---

## Combining Commands

Commands can be chained for common workflows:

**Start a new feature build:**
```
/search → /build-backend → /build-frontend → /test → /verify → /security
```

**Debug and fix a production issue:**
```
/fix → /verify → /learn
```

**Upgrade a dependency:**
```
/evolve → /verify → /security → /deploy
```
