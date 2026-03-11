---
name: strategic-compact
description: "Context management — when to compact, what survives, how to preserve state across compactions."
origin: MADF+ECC
---

# Strategic Compaction

Suggests manual compaction at logical workflow boundaries rather than relying on arbitrary auto-compaction that can interrupt mid-task.

## When to Activate

- Running long sessions approaching context limits
- Working on multi-phase MADF tasks (Planning → Building → Testing)
- Switching between unrelated features within Phase 4
- After completing a major milestone
- When responses slow down or become less coherent

## Why Strategic Over Auto Compaction?

Auto-compaction triggers at arbitrary points:
- Often mid-implementation, losing important context
- No awareness of MADF phase boundaries
- Can interrupt complex multi-step operations

Strategic compaction at logical boundaries:
- After planning, before building — compact research, keep the plan
- After completing a feature — fresh start for the next one
- Before major context shifts — clear exploration context

## Compaction Decision Guide

| MADF Phase Transition | Compact? | Why |
|-----------------------|----------|-----|
| Phase 1 → 2 (Strategy → Blueprint) | **Yes** | Strategy Q&A is bulky; MVP_PLAN.md is the distilled output |
| Phase 2 → 3 (Blueprint → UX) | **Yes** | Architecture decisions are in SYSTEM_BLUEPRINT.md |
| Phase 3 → 4 (UX → Build) | **Yes** | All planning context is now in artifact files |
| Between features in Phase 4 | **Yes** | Fresh context for each feature |
| Mid-implementation of a feature | **No** | Losing variable names, file paths, partial state is costly |
| After debugging | **Yes** | Debug traces pollute context for unrelated work |
| After a failed approach | **Yes** | Clear dead-end reasoning before trying new approach |
| Phase 4 → 5 (Build → DevOps) | **Yes** | Coding context not needed for infra setup |

## What Survives vs. What Is Lost

| Survives Compaction | Lost in Compaction |
|--------------------|-------------------|
| Cursor rules (.mdc files) | Intermediate reasoning and analysis |
| TodoWrite task list | File contents previously read |
| All files on disk (artifacts, code) | Multi-step conversation context |
| PROJECT_STATE.md | Tool call history |
| Git state (commits, branches) | Nuanced preferences stated verbally |
| Agent learning files | Current session observations |

## Best Practices

1. **Compact after planning** — once plan is finalized in artifacts, compact to start fresh
2. **Compact after debugging** — clear error-resolution context before continuing
3. **Don't compact mid-implementation** — preserve context for related changes
4. **Write before compacting** — save important context to files or PROJECT_STATE.md first
5. **Use `/compact` with a summary** — add a custom message: "Focus on implementing User Auth backend next"
6. **The Orchestrator should suggest compaction** at every MADF phase transition
