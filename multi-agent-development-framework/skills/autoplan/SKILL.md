---
name: autoplan
description: "Express planning mode — chains Phases 1-3 automatically for smaller features. Surfaces only taste decisions for human approval. Inspired by gstack /autoplan."
origin: MADF+gstack
---

# Autoplan — Express Planning Pipeline

One command to get a fully reviewed plan. CEO review → Design review → Eng review — automatically chained, with only taste decisions surfaced for approval.

## When to Use

- Small-to-medium features where full manual phase-by-phase feels heavy
- Bug fixes that need a quick plan before implementation
- When you want to move fast but still want structured planning
- NOT for: greenfield projects, major architecture changes, or features touching security/payments

## How It Works

Autoplan chains three reviews automatically:

```
User describes feature
    ↓
Phase 1: Product Strategy (auto)
    → Scope check: Is this P0? Does it fit MVP?
    → Generates mini MVP_PLAN section
    ↓
Phase 3: Design Review (auto)
    → Scores 7 design dimensions
    → Auto-resolves scores ≥ 7
    → PAUSES on taste decisions (scores < 7)
    ↓
Phase 2: Eng Review (auto)
    → Architecture fit check
    → Data model impact
    → Test plan sketch
    → Edge cases and failure modes
    ↓
Output: Ready-to-implement plan
```

## Auto-Resolve Rules

These decisions are made automatically (no human input needed):

| Decision Type | Auto-Resolution |
|--------------|-----------------|
| Feature fits existing architecture | Proceed with current patterns |
| Standard CRUD operations | Use existing patterns from COMPONENT_SPEC |
| Test approach for standard features | Unit + integration + E2E per existing strategy |
| API design for new endpoints | Follow API_CONTRACT.md conventions |
| Database schema additions | Follow SYSTEM_BLUEPRINT.md patterns |
| Error handling patterns | Use established error handling from codebase |

## Taste Decisions (Human Required)

These ALWAYS pause for human input:

| Decision Type | Why Human Needed |
|--------------|-----------------|
| New user-facing UI patterns | Aesthetics and UX are subjective |
| Feature scope expansion | Only the human knows business priority |
| Breaking changes to existing APIs | Impact on users requires business judgment |
| New third-party dependencies | Vendor lock-in is a business decision |
| Trade-offs between complexity and completeness | "How far do we go?" is always human |

## Output Format

```markdown
# Autoplan: [Feature Name]

## Scope (from Product Strategy)
- What: [one sentence]
- Why: [user pain or business value]
- P0 scope: [minimal viable version]
- Out of scope: [what we're NOT doing]

## Design (from Design Review)
- Overall score: [X]/70
- Auto-resolved: [N] dimensions
- Taste decisions: [N] — see below

## Architecture (from Eng Review)
- Files to modify: [list]
- New files needed: [list]
- Database changes: [yes/no — details]
- API changes: [new endpoints / modified endpoints]
- Test plan: [N unit, M integration, K E2E]
- Edge cases identified: [list]
- Estimated effort: [S/M/L]

## Taste Decisions (Your Input Needed)
1. [Decision description] — Option A vs Option B
2. [Decision description] — Option A vs Option B

## Ready to Build?
Approve this plan to proceed to Phase 4.
```

## Integration with MADF

- Autoplan updates `PROJECT_STATE.md` to reflect the express planning
- Creates/updates relevant artifacts (MVP_PLAN, UX_SPEC sections)
- Logs decisions in DECISIONS.md
- After approval, proceed directly to Phase 4 (build)
- Gates G1/G2/G3 are considered passed (express mode)

## When NOT to Use Autoplan

- The feature touches authentication or authorization
- The feature requires a new database table with complex relationships
- The feature integrates with a new external service
- The feature changes the deployment architecture
- You're unsure about scope — use full Phase 1 instead
