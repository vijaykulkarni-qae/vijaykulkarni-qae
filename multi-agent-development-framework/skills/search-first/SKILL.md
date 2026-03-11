---
name: search-first
description: "Research-before-coding workflow. Search for existing solutions before writing custom code."
origin: MADF+ECC
---

# Search-First — Research Before You Code

Systematizes the "search for existing solutions before implementing" workflow. Mandatory for all coding agents in MADF Phase 4+.

## When to Use

- Starting a new feature that likely has existing solutions
- Adding a dependency or integration
- Before creating a new utility, helper, or abstraction
- During Phase 2 (Blueprint) for tech stack decisions

## The 5-Step Workflow

```
1. NEED ANALYSIS
   Define what functionality is needed
   Identify language/framework constraints

2. PARALLEL SEARCH
   ┌──────────┐ ┌──────────┐ ┌──────────┐
   │ Codebase │ │  Package │ │  GitHub  │
   │  Search  │ │ Registry │ │  Search  │
   └──────────┘ └──────────┘ └──────────┘

3. EVALUATE
   Score candidates on: functionality, maintenance,
   community, docs, license, dependencies

4. DECIDE
   ┌─────────┐  ┌──────────┐  ┌─────────┐
   │  Adopt  │  │  Extend  │  │  Build  │
   │  as-is  │  │  / Wrap  │  │  Custom │
   └─────────┘  └──────────┘  └─────────┘

5. IMPLEMENT
   Install package / Write minimal custom code
```

## Decision Matrix

| Signal | Action |
|--------|--------|
| Exact match, well-maintained, MIT/Apache | **Adopt** — install and use directly |
| Partial match, good foundation | **Extend** — install + write thin wrapper |
| Multiple weak matches | **Compose** — combine 2–3 small packages |
| Nothing suitable found | **Build** — write custom, informed by research |

## Quick Checklist (Before Writing Any New Code)

0. Does this already exist in the repo? → `rg` through modules/tests
1. Is this a common problem? → Search npm / PyPI
2. Is there an MCP server for this? → Check MCP configs
3. Is there a reference implementation on GitHub? → `gh search code`
4. Can I port/adapt an existing approach?

## Integration with MADF Agents

| Agent | How to Use Search-First |
|-------|------------------------|
| Blueprint Architect (02) | Research tech stack options before ADR decisions |
| Backend Agent (04) | Search for libraries before writing utilities |
| Frontend Agent (05) | Search for component libraries before building UI |
| DevOps Agent (08) | Search for CI/CD templates, Docker patterns |
| Proactive Evolution (11) | Research before upgrading or migrating |

## Anti-Patterns

- **Jumping to code** without checking if a solution exists
- **Over-customizing** a library so heavily it loses its benefits
- **Dependency bloat** — installing a massive package for one small feature
- **Ignoring maintenance status** — adopting an abandoned library
