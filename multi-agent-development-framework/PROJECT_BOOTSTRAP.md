# Project Bootstrap Guide — Multi-Agent Development Framework

## Quick Start (5 Minutes)

### Step 1: Create Your Project Directory

```
mkdir my-project && cd my-project
```

### Step 2: Copy Framework Files

Copy these from the framework template into your project:

```
my-project/
├── .cursor/
│   └── rules/                      ← Copy ALL .mdc files from cursor-rules/
│       ├── cto-agent.mdc
│       ├── 00-orchestrator.mdc
│       ├── 01-product-strategy.mdc
│       ├── 02-system-blueprint.mdc
│       ├── 03-ux-designer.mdc
│       ├── 04-backend.mdc
│       ├── 05-frontend.mdc
│       ├── 06-testing.mdc
│       ├── 07-security.mdc
│       ├── 08-devops.mdc
│       ├── 09-learning.mdc
│       ├── 10-reactive-maintenance.mdc
│       ├── 11-proactive-evolution.mdc
│       ├── 12-coding-standards.mdc   ← NEW: universal coding rules
│       ├── 13-git-workflow.mdc       ← NEW: conventional commits
│       ├── 14-development-workflow.mdc ← NEW: Research→Plan→TDD→Review→Commit
│       └── 15-performance-optimization.mdc ← NEW: cost/model management
├── hooks/                          ← Copy hooks/ directory
│   ├── hooks.json                    ← Event hook configuration
│   └── scripts/                      ← 7 Node.js hook scripts
├── skills/                         ← Copy skills/ directory
│   ├── verification-loop/SKILL.md    ← 6-phase quality gate
│   ├── search-first/SKILL.md        ← Research before coding
│   ├── strategic-compact/SKILL.md   ← Context management
│   ├── tdd-workflow/SKILL.md        ← TDD patterns
│   ├── eval-harness/SKILL.md        ← Eval-driven development
│   ├── e2e-testing/SKILL.md         ← Playwright patterns
│   ├── deployment-patterns/SKILL.md ← CI/CD and deployment
│   └── database-migrations/SKILL.md ← Safe schema evolution
├── artifacts/                      ← Copy ALL .md files from artifacts/
│   ├── MVP_PLAN.md ... DEPLOYMENT_GUIDE.md
│   ├── LESSONS_LEARNED.md
│   └── DOMAIN_EXTENSION.md
├── agent-learnings/                ← Copy agent-learnings/ directory
│   ├── orchestrator-learnings.md ... proactive-evolution-learnings.md
├── COMMANDS.md                     ← NEW: quick command reference
├── PROJECT_STATE.md                ← Copy from artifacts/PROJECT_STATE.md
└── DECISIONS.md                    ← Copy from artifacts/DECISIONS.md
```

### Step 3: Initialize Git

```
git init
git add .
git commit -m "Initialize project with MADF (Multi-Agent Development Framework)"
```

### Step 4: Open in Cursor IDE

```
cursor .
```

### Step 5: Start Your First Conversation

Open a new chat and say:

> "I want to build [describe your project idea in 2-3 sentences]. Read PROJECT_STATE.md and begin Phase 1."

The Orchestrator will activate, read the state, and kick off the Product Strategy phase.

---

## The Workflow (What Happens Next)

### Phase 1: Product Strategy
**You say**: "I want to build [your idea]"
**AI does**: Asks clarifying questions, then fills out `artifacts/MVP_PLAN.md`
**You do**: Review the plan. Approve or request changes.
**Duration**: 1 conversation (15-30 minutes)

### Phase 2: System Blueprint
**You say**: "Plan approved. Design the architecture."
**AI does**: Reads MVP_PLAN.md, fills out `artifacts/SYSTEM_BLUEPRINT.md` and `DECISIONS.md`
**You do**: Review tech stack, data model, API design. Approve or request changes.
**Duration**: 1 conversation (20-40 minutes)

### Phase 3: UX Design
**You say**: "Architecture approved. Design the user interface."
**AI does**: Reads MVP_PLAN + BLUEPRINT, fills out `artifacts/UX_SPEC.md`
**You do**: Review flows, screens, components. Approve or request changes.
**Duration**: 1 conversation (20-40 minutes)

### Phase 4: Build (Per Feature)
**You say**: "Build [Feature Name] - start with backend."
**AI does**: Implements code following the specs, updates API_CONTRACT.md
**You say**: "Now build the frontend for [Feature Name]."
**AI does**: Codes against UX_SPEC + API_CONTRACT
**Continue**: Testing → Security Review → Next Feature
**Duration**: 1-3 conversations per feature

### Phase 5: DevOps
**You say**: "Set up CI/CD and deployment."
**AI does**: Creates pipeline, Docker configs, fills out DEPLOYMENT_GUIDE.md
**Duration**: 1 conversation

### Phase 6: Launch
**You say**: "Run the final checklist."
**AI does**: Validates all gates, confirms readiness
**Duration**: 1 conversation

---

## Helpful Commands for Each Session

### Starting a New Session (Continuing Work)
> "Read PROJECT_STATE.md and continue where we left off."

### Checking Status
> "What's our current status? What's been completed and what's next?"

### Switching Agents Mid-Session
> "Pause backend work. I need a security review of what we've built so far."

### Escalating an Issue
> "The data model can't support [specific issue]. We need to revise the blueprint."

### Reviewing an Artifact
> "Show me the current state of API_CONTRACT.md."

---

## Tips for Maximum Efficiency

1. **One feature at a time.** Don't say "build everything." Say "build User Authentication."
2. **Review artifacts carefully.** 10 minutes reviewing a plan saves 2 hours of rework.
3. **Approve explicitly.** Say "Approved, move to next phase" — don't leave it ambiguous.
4. **Keep sessions focused.** One agent role per conversation turn. Don't mix backend and frontend in one prompt.
5. **Trust the gates.** If the Orchestrator says a gate isn't passed, fix the issue instead of bypassing it.
6. **Update state between sessions.** If you made manual changes, tell the AI at the start of the next session.
7. **Use DECISIONS.md.** When you make a choice ("let's use PostgreSQL"), it should be recorded. This prevents re-debating.

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| AI doesn't know the current state | Say: "Read PROJECT_STATE.md first" |
| AI is working on wrong phase | Say: "We're in Phase [X]. Read PROJECT_STATE.md and switch to [agent]." |
| Artifacts are out of sync | Say: "Review and sync all artifacts against the current codebase." |
| AI is over-engineering | Say: "This is MVP. Keep it simple. Refer to MVP_PLAN.md P0 features only." |
| AI skips a phase | Say: "We haven't passed Gate [X] yet. Complete [missing criteria] first." |
| Need to change a planning decision | Say: "I need to revise [specific thing] in [artifact]. Escalate to [planning agent]." |
