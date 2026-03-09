# Project State Tracker

> **Single source of truth** across all agent sessions. Update this file at the start and end of every session.

---

## Header

| Field | Value |
|-------|-------|
| **Project Name** | [PROJECT_NAME] |
| **Created** | [DATE] |
| **Last Updated** | [DATE] |

---

## Current Phase

| Field | Value |
|-------|-------|
| **Phase** | [0-6] |
| **Active Agent** | [AGENT_NAME] |
| **Status** | [Not Started / In Progress / Blocked / Complete] |

**Phase Reference:**
- 0: Project Init
- 1: Product Strategy (MVP Plan)
- 2: Blueprint Architecture
- 3: UX Design
- 4: Build (4a: Backend → 4b: Frontend → 4c: Testing → 4d: Security — per feature)
- 5: DevOps (CI/CD, Deployment, Infrastructure)
- 6: Launch & Handoff

---

## Progress Tracker

| Phase | Agent | Artifact | Status |
|-------|-------|----------|--------|
| 0 | Orchestrator | Project Init | [ ] Not Started / [ ] In Progress / [ ] Complete |
| 1 | Product Strategy | MVP_PLAN.md | [ ] Not Started / [ ] In Progress / [ ] Complete |
| 2 | Blueprint Architect | SYSTEM_BLUEPRINT.md | [ ] Not Started / [ ] In Progress / [ ] Complete |
| 3 | UX Designer | UX_SPEC.md | [ ] Not Started / [ ] In Progress / [ ] Complete |
| 4a | Backend Agent | Code + API_CONTRACT.md | [ ] Not Started / [ ] In Progress / [ ] Complete |
| 4b | Frontend Agent | Code + COMPONENT_SPEC.md | [ ] Not Started / [ ] In Progress / [ ] Complete |
| 4c | Testing Agent | Tests + TEST_PLAN.md | [ ] Not Started / [ ] In Progress / [ ] Complete |
| 4d | Security Agent | SECURITY_REVIEW.md | [ ] Not Started / [ ] In Progress / [ ] Complete |
| 5 | DevOps Agent | CI/CD + DEPLOYMENT_GUIDE.md | [ ] Not Started / [ ] In Progress / [ ] Complete |
| 6 | Orchestrator | Launch Checklist | [ ] Not Started / [ ] In Progress / [ ] Complete |

---

## Feature Tracker (Phase 4+)

*Populate when development begins. Track each feature across workstreams.*

| Feature | Priority | Backend | Frontend | Tests | Security | Status |
|---------|----------|---------|----------|-------|----------|--------|
| [FEATURE_1] | [P0/P1/P2] | [ ] | [ ] | [ ] | [ ] | [ ] Not Started / [ ] In Progress / [ ] Complete |
| [FEATURE_2] | [P0/P1/P2] | [ ] | [ ] | [ ] | [ ] | [ ] Not Started / [ ] In Progress / [ ] Complete |
| [FEATURE_3] | [P0/P1/P2] | [ ] | [ ] | [ ] | [ ] | [ ] Not Started / [ ] In Progress / [ ] Complete |

*Legend: [ ] = Not Started, [x] = Complete*

---

## Active Blockers

| ID | Description | Blocking | Raised By | Raised Date |
|----|-------------|----------|-----------|-------------|
| B-001 | [BLOCKER_DESCRIPTION] | [PHASE/FEATURE] | [AGENT] | [DATE] |

*Remove blockers when resolved.*

---

## Key Decisions Made

*Link to DECISIONS.md for full context.*

| ADR ID | Summary | Status |
|--------|---------|--------|
| [ADR-001] | [BRIEF_SUMMARY] | [Accepted/Proposed] |
| [ADR-002] | [BRIEF_SUMMARY] | [Accepted/Proposed] |

---

## Session Log

| Date | What Was Done | What's Next |
|------|---------------|-------------|
| [DATE] | [ACTIONS_COMPLETED] | [NEXT_STEPS] |
| [DATE] | [ACTIONS_COMPLETED] | [NEXT_STEPS] |

*Append a new row at the end of each session.*

---

*Producing Agent Instructions:*
- Update **Last Updated** and **Current Phase** at session start.
- Append to **Session Log** at session end.
- Add/remove **Active Blockers** as they arise or resolve.
- Keep **Progress Tracker** and **Feature Tracker** current.
