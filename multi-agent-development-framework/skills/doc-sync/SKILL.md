---
name: doc-sync
description: "Auto-sync all documentation to match shipped code. Catches stale READMEs, drifted artifacts, outdated guides. Inspired by gstack /document-release."
origin: MADF+gstack
---

# Doc Sync — Documentation Freshness

Code changes. Docs don't update themselves. This skill reads the diff and updates every document that drifted.

## When to Use

- At G6 gate (before launch) — mandatory
- After any significant feature merge
- After architecture changes that affect deployment or API
- On request: `/doc-sync`

## What Gets Checked

| Document | What Drifts | How to Detect |
|----------|------------|---------------|
| `README.md` | Setup instructions, feature list, tech stack | Compare claimed features vs actual code |
| `artifacts/API_CONTRACT.md` | Endpoint list, request/response shapes | Compare documented endpoints vs actual routes |
| `artifacts/DEPLOYMENT_GUIDE.md` | Env vars, deploy commands, prerequisites | Compare documented vars vs actual .env.example |
| `artifacts/SYSTEM_BLUEPRINT.md` | Tech stack, architecture decisions | Compare documented stack vs package.json/dependencies |
| `artifacts/COMPONENT_SPEC.md` | Component tree, props, state | Compare documented components vs actual component files |
| `DECISIONS.md` | Tech debt status, ADR accuracy | Check if referenced code still exists |
| `PROJECT_STATE.md` | Phase, feature status | Verify against actual completion state |

## The Process

### Step 1: Read the Diff

```bash
# What changed since last doc-sync or last release
git log --since="last release" --name-only --pretty="" | sort -u
# OR
git diff main...HEAD --name-only
```

### Step 2: Cross-Reference Each Document

For each document, check if any of the changed files invalidate its content:

```markdown
## Staleness Check

| Document | Changed Files That Affect It | Status |
|----------|------------------------------|--------|
| API_CONTRACT.md | src/routes/users.ts (new endpoint added) | STALE |
| DEPLOYMENT_GUIDE.md | .env.example (new DATABASE_URL var) | STALE |
| README.md | package.json (new dependency) | STALE |
| COMPONENT_SPEC.md | — | CURRENT |
| SYSTEM_BLUEPRINT.md | — | CURRENT |
```

### Step 3: Auto-Update Objective Content

For factual, non-subjective content — auto-update:

- New environment variables → add to DEPLOYMENT_GUIDE.md
- New API endpoints → add to API_CONTRACT.md
- New dependencies → update tech stack in README/BLUEPRINT
- Renamed files/paths → update all references
- Removed features → remove from documentation

### Step 4: Flag Subjective Changes

For changes that need human judgment — ask:

- Architecture description changes
- Feature explanations
- Setup instruction rewording
- Anything that involves "how to explain this"

### Step 5: Verify No Orphans

Check for documentation that references things that no longer exist:

```bash
# Find documented endpoints that don't exist in code
# Find documented env vars not in .env.example
# Find documented components that were deleted
# Find links to files that were moved/removed
```

## Output

```markdown
# Doc Sync Report — [Date]

## Documents Updated
- API_CONTRACT.md — added POST /api/v2/reports endpoint
- DEPLOYMENT_GUIDE.md — added REDIS_URL environment variable
- README.md — updated dependency list

## Documents Current (No Changes Needed)
- COMPONENT_SPEC.md
- SYSTEM_BLUEPRINT.md
- UX_SPEC.md

## Orphaned References Found
- DEPLOYMENT_GUIDE.md references `start-workers.sh` — file deleted in commit abc123
- README.md mentions "Slack integration" — feature was removed

## Changes Requiring Human Review
- README.md project description — does the new reports feature change how you'd describe the product?
```

## Integration with MADF

| MADF Component | Doc Sync Integration |
|---------------|---------------------|
| G6 Gate | Doc sync MUST run before launch. All docs must be CURRENT. |
| DevOps Agent (08) | Triggers doc sync after deployment setup |
| Proactive Evolution (11) | Triggers doc sync after feature additions |
| `/ship` equivalent | Auto-invoked before PR creation |
