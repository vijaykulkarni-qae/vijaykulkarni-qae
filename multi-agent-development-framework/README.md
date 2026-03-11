# Multi-Agent Development Framework (MADF) v2.0

## What Is This?

A structured, artifact-driven, self-improving framework for building software with AI in Cursor IDE. **13 specialized agents** collaborate like a real development team — 3 for planning, 5 for building, 3 for lifecycle management, 1 orchestrator, 1 CTO.

MADF v2.0 integrates an **infrastructure automation layer** (inspired by Everything Claude Code) with **event hooks**, **reusable skills**, **universal coding rules**, and **confidence-scored learning** — so agents don't just follow a process, they're backed by automated quality gates and operational safety nets.

The AI will **never guess**. It asks until it fully understands, then says "We're aligned. I'll proceed." Only then does work begin.

---

## Quick Setup

```
1. Copy cursor-rules/*.mdc  →  your-project/.cursor/rules/
2. Copy artifacts/*.md       →  your-project/artifacts/
3. Open in Cursor IDE
4. Say: "I want to build [your idea]. Read PROJECT_STATE.md and begin."
```

---

## The 9 Agents

| # | Agent | Phase | What It Produces |
|---|-------|-------|-----------------|
| 0 | **Orchestrator** | Always active | PROJECT_STATE.md updates, routing, gate validation |
| 1 | **Product Strategy Lead** | Planning | MVP_PLAN.md |
| 2 | **Systems Blueprint Architect** | Planning | SYSTEM_BLUEPRINT.md + DECISIONS.md |
| 3 | **UX & Interface Designer** | Planning | UX_SPEC.md |
| 4 | **Backend Agent** | Building | Code + API_CONTRACT.md |
| 5 | **Frontend Agent** | Building | Code + COMPONENT_SPEC.md |
| 6 | **Testing Agent** | Building | Tests + TEST_PLAN.md |
| 7 | **Security Agent** | Building | SECURITY_REVIEW.md |
| 8 | **DevOps Agent** | Building | CI/CD configs + DEPLOYMENT_GUIDE.md |

---

## Full Worked Example: From Vague Idea to Production

This walkthrough starts with a **deliberately vague** request — the kind you'd actually type. It shows how the AI extracts what it needs through targeted questions, confirms alignment, and only THEN begins work.

---

### PHASE 0 → 1: Discovery (The AI Digs Until It Understands)

**You type:**
> "I want to build something for managing stuff in my small business. Like tracking things. Can you help?"

**AI (Orchestrator):**
> I see PROJECT_STATE.md is at Phase 0. Before anything, I need to understand what you need. Activating Product Strategy Lead.

**AI (Product Strategy Lead):**
> I'd love to help, but "managing stuff" and "tracking things" could mean a hundred different products. I need to understand your world before I can plan anything.
>
> Let me start with the basics:
>
> **1. What does your business do?** (Industry, size, what you sell/provide)
> **2. What "stuff" are you tracking today, and how?** (Spreadsheet? Paper? Memory? Another tool that's not working?)
> **3. Who would use this?** (Just you? Your employees? Your customers?)
> **4. What's the pain?** (What breaks, gets lost, or takes too long right now?)

**You say:**
> "I run a small interior design firm, 5 people. We have multiple projects going on with different clients. Right now I track project status in Excel and it's a mess. I forget follow-ups, deadlines slip, and I can't see which projects are overdue at a glance."

**AI (Product Strategy Lead):**
> That's much clearer. So this is a **project tracking tool for your interior design firm.** Let me dig deeper:
>
> **5. What does a "project" look like?** (Does it have phases like Design → Procurement → Installation? Or is it simpler?)
> **6. What information do you track per project?** (Client name, budget, deadline, status, notes?)
> **7. Do your 5 team members need access, or just you?**
> **8. Do clients need to see anything, or is this internal only?**
> **9. Is there a budget for this? Or should I design for minimal hosting cost?**

**You say:**
> "Each project has a client, a budget, a deadline, and goes through phases: Consultation → Design → Client Approval → Procurement → Installation → Handover. I need my team to see their assigned projects. Clients don't need access. Keep costs low."

**AI (Product Strategy Lead):**
> Now I have a solid picture. One more round to make sure I don't build the wrong thing:
>
> **10. When you say "I forget follow-ups" — do you need the system to remind you?** (Email/notification when a deadline is approaching?) Or is just seeing overdue items on a dashboard enough for MVP?
> **11. Do you assign specific team members to specific projects?**
> **12. Is the budget per project something you just record, or do you need to track expenses against it?**

**You say:**
> "Dashboard showing overdue is enough for now, no notifications. Yes, each project has an assigned team member. Just record the budget, don't need expense tracking yet."

**AI (Product Strategy Lead):**
> I now have everything I need. Let me confirm my understanding before I write anything:
>
> ---
>
> **What I understand:**
> - You run a 5-person interior design firm
> - You need a **project tracking dashboard** to replace your Excel mess
> - Each project has: client, assigned team member, budget, deadline, phase (6 phases: Consultation → Design → Approval → Procurement → Installation → Handover)
> - You need: a dashboard showing all projects with status and overdue highlighting
> - Your team needs login access to see their assigned projects
> - Internal only — no client portal
> - Low hosting cost
>
> **What we are NOT building (MVP):**
> - No email/push notifications
> - No expense tracking against budget
> - No client-facing portal
> - No mobile app (responsive web is sufficient)
> - No file uploads (floor plans, photos) — future feature
>
> `[ASSUMPTION]: No file attachments for MVP — you'll continue managing files outside the app.`
> `[ASSUMPTION]: 6 fixed project phases, not customizable in MVP.`
>
> **Is this accurate? Anything I got wrong or missed?**

**You say:**
> "That's exactly right. Also yes, file uploads would be nice later but not now."

**AI (Product Strategy Lead):**
> **We are aligned. I have a complete, clear understanding of your requirements.**
>
> This follows standard industry practice for project management MVPs — focused scope, clear user roles, phased workflow. I'm confident this is buildable and valuable.
>
> **I will now produce MVP_PLAN.md with:**
> - Problem statement
> - 2 user personas (you as the owner, your team member)
> - P0 features (max 5) with acceptance criteria
> - P1/P2 features for future
> - Success metrics
> - Out of scope (explicit)
> - Timeline estimate
>
> Proceeding.

**AI produces `artifacts/MVP_PLAN.md`:**

> **P0 Features (Must-have for MVP):**
>
> | Feature | Acceptance Criteria | Effort |
> |---------|-------------------|--------|
> | Team login (owner + members) | Owner can create accounts. Members login with email/password. | M |
> | Create/edit project | Create project with: client name, team member, budget, deadline, phase. | M |
> | Project dashboard | List all projects. Show: name, phase, assigned to, deadline, overdue badge. Filter by: phase, team member, overdue. | L |
> | Update project phase | One-click to advance project to next phase. Phase history logged. | S |
> | Project detail view | Full project info with notes/activity log. | M |
>
> **CONFIDENCE: HIGH** — Requirements were extracted through thorough questioning. No ambiguity remains.
>
> Please review this plan. Once you approve, we move to Gate G1 → Phase 2 (System Architecture).

---

### PHASE 2: Architecture (AI Asks Before Deciding)

**You say:**
> "Approved. Design the architecture."

**AI (Orchestrator):**
> Gate G1 validated: Problem defined, 2 personas, 5 P0 features with acceptance criteria, metrics listed, out of scope defined, user approved. Moving to Phase 2.

**AI (Blueprint Architect):**
> I've read MVP_PLAN.md. 5 P0 features, 6 users (1 owner + 5 team members), internal tool, low cost.
>
> Before I design, I need to know:
> 1. **Tech preferences?** Any languages/frameworks your team knows? Or should I pick what's fastest to build?
> 2. **Hosting budget?** Free tier acceptable? ($0-5/month) Or can you spend $20-50/month?
> 3. **Do you have a domain name?** Or shall I plan for a subdomain/free hosting URL initially?
>
> My recommendation for this scope:
> - **Next.js** (React + server-side, deploy free on Vercel)
> - **PostgreSQL** (Supabase free tier — 500MB, plenty for this)
> - **NextAuth.js** for authentication
> - **Total hosting cost: $0/month** on free tiers until you outgrow them
>
> This gives you a production-grade app with zero hosting cost to start. Does this direction work?

**You say:**
> "I don't know these technologies but zero cost sounds great. Go with your recommendation."

**AI (Blueprint Architect):**
> **Understood. I'll design the full architecture using Next.js + Supabase PostgreSQL + NextAuth.** All decisions will be logged in DECISIONS.md with rationale so we can revisit if needed.
>
> `[ASSUMPTION]: Owner role has admin privileges (create users, see all projects). Member role sees only assigned projects.`
>
> Is that right — owner sees everything, members see only their own projects?

**You say:**
> "Actually, members should see all projects but only edit their assigned ones."

**AI (Blueprint Architect):**
> Good catch. So:
> - **Owner**: Full access (create/edit/delete all projects, manage users)
> - **Member**: View all projects, edit only assigned ones
>
> This changes the authorization model — I'll design role-based access with view-all, edit-own permissions.
>
> Proceeding with SYSTEM_BLUEPRINT.md.
>
> *[Produces blueprint with data model, API surface, auth strategy, then:]*
>
> **CONFIDENCE: HIGH.** Architecture supports all P0 features, role-based access is clear, hosting is free-tier.
>
> **Key decisions logged:**
> - ADR-001: Next.js (full-stack, free Vercel hosting)
> - ADR-002: Supabase PostgreSQL (managed, free tier, auth built-in)
> - ADR-003: Role-based access (owner=admin, member=view-all-edit-own)
>
> Please review the data model and API surface. These drive everything downstream.

---

### WHEN THE AI DISCOVERS A PROBLEM: Escalation

During build phase, the Backend Agent discovers an issue:

**AI (Backend Agent):**
> I'm implementing the "Update project phase" feature. Per MVP_PLAN, it's "one-click to advance to next phase."
>
> **Problem:** The data model has `current_phase` as a string field. But the acceptance criteria says "phase history logged." I need a `phase_history` table to track when each phase started/ended — this isn't in the blueprint.
>
> **I'm stopping.** This is a data model gap that affects the architecture. Escalating to Orchestrator.

**AI (Orchestrator):**
> Escalation received. Backend Agent needs a `phase_history` table for the phase logging requirement.
>
> This is a targeted blueprint revision — not a full redesign. Routing to Blueprint Architect.

**AI (Blueprint Architect):**
> Adding `ProjectPhaseHistory` table: project_id, phase, started_at, ended_at, changed_by.
>
> Updated SYSTEM_BLUEPRINT.md data model. Logged as ADR-004.
>
> `[REVISED: Added phase history tracking to support "phase history logged" acceptance criteria]`
>
> Backend Agent can resume.

---

### WHEN YOU CHANGE YOUR MIND: Scope Change

**You say:**
> "Actually, I realized we also need to track which vendor/supplier is involved in each project. Can we add that?"

**AI (Orchestrator):**
> Scope change request received. Routing to Product Strategy Lead for P0/P1/P2 classification.

**AI (Product Strategy Lead):**
> Adding vendor tracking. Let me understand the scope:
>
> 1. Is it just a vendor name field on each project? (Simple — P0, small effort)
> 2. Or a full vendor management system with a vendor database? (Complex — P1 or P2)
>
> Which are you thinking?

**You say:**
> "Just a text field for now. Vendor name and phone number on the project."

**AI (Product Strategy Lead):**
> That's a minor addition — two fields on the Project model. I'd classify this as **P0 since it's small and clearly useful.**
>
> Updated MVP_PLAN.md: Added "Vendor info" as two fields in the Create/Edit Project feature.
>
> Blueprint Architect: Please add `vendor_name` (string, nullable) and `vendor_phone` (string, nullable) to the Project entity.
>
> **No phase rollback needed.** This is additive, doesn't break existing work.

---

### HOW A SESSION RESUMES: Context Recovery

**You type (3 days later):**
> "Hey, continue where we left off"

**AI (Orchestrator):**
> Reading PROJECT_STATE.md...
>
> **Current state:**
> - Phase 4 (Build), Feature: "Project Dashboard" — Backend COMPLETE, Frontend IN PROGRESS
> - 3 of 5 P0 features completed: Login, Create/Edit Project, Update Phase
> - 2 remaining: Project Dashboard (in progress), Project Detail View
> - No active blockers
> - Last session: Frontend Agent was building the dashboard view
>
> **Is this still accurate? Did anything change on your end while you were away?**

**You say:**
> "All good. Continue the dashboard frontend."

**AI (Frontend Agent):**
> Resuming dashboard frontend. Reading UX_SPEC.md and API_CONTRACT.md for the project list endpoint.
>
> I'll build the filterable project table with overdue highlighting. Picking up where I left off — component structure was defined, now implementing the filter controls and API integration.

---

## Key Behaviors Demonstrated

| What the AI Does | Why It Matters |
|-------------------|---------------|
| **Asks 12 questions before writing a single line of plan** | Vague → Clear. No guessing. |
| **Summarizes understanding and asks "Is this accurate?"** | Catches misalignment at the cheapest possible moment. |
| **Says "We are aligned. I will now proceed."** | Explicit signal that discovery is complete. |
| **Presents options, not just questions** ("$0 hosting vs $20-50/month") | Helps non-technical users make informed decisions. |
| **Catches user's clarification** (members should see all, edit own) | Doesn't assume authorization model — asks. |
| **Stops and escalates** when data model is incomplete | Doesn't build on a broken foundation. |
| **Handles scope changes** through Product Strategy classification | Doesn't blindly add features or reject them — evaluates. |
| **Recovers context** after 3-day gap from PROJECT_STATE.md | No "remind me what we were doing" — the artifacts remember. |
| **Logs every decision** in DECISIONS.md | No re-debating. Ever. |
| **CONFIDENCE signal** after every delivery | User knows where to focus review time. |

---

## How the AI Decides to Proceed vs. Ask

```
User gives instruction
       │
       ▼
  ┌──────────────────┐
  │ Do I fully        │
  │ understand what   │──── YES ──── Summarize understanding
  │ to build?         │              and confirm: "Is this right?"
  └────────┬─────────┘                      │
           │ NO                             ▼
           ▼                         User confirms?
  ┌──────────────────┐               │         │
  │ Can I identify    │              YES        NO
  │ specific gaps?    │               │         │
  └────────┬─────────┘               ▼         ▼
           │                    "We are       Revise
           ▼                     aligned.     understanding,
  Ask targeted questions         I will       ask again
  (not vague "any              proceed."
   preferences?" but
   specific "X or Y?")
           │
           ▼
     Wait for answer
     (NEVER proceed
      without one)
```

---

## What's New in v2.0 (ECC Integration)

### Event Hooks — Automated Operational Safety
7 hooks fire automatically on IDE events — no manual intervention needed:
- **Session auto-load**: PROJECT_STATE.md and agent learnings loaded on every session start
- **Code quality**: Auto-format, typecheck, console.log warnings after every file edit
- **Security**: Secrets detected in prompts before sending; sensitive file read warnings
- **State persistence**: Session state auto-saved on stop and before compaction

### Skills Library — Reusable Workflow Playbooks
8 skills agents can load on demand:
- `verification-loop`: 6-phase quality gate (Build→Type→Lint→Test→Security→Diff)
- `search-first`: Research existing solutions before writing code
- `tdd-workflow`: TDD patterns with code examples
- `e2e-testing`: Playwright Page Object Model patterns
- `eval-harness`: Eval-driven development with pass@k metrics
- `strategic-compact`: When and how to compact context
- `deployment-patterns`: Docker, CI/CD, rollback procedures
- `database-migrations`: Safe schema evolution patterns

### Universal Coding Rules — Always Active
4 new rules apply to all coding agents:
- Coding standards (immutability, file organization, error handling)
- Git workflow (conventional commits, PR process)
- Development workflow (Research→Plan→TDD→Review→Commit pipeline)
- Performance optimization (model routing, cost awareness, compaction)

### Enhanced Learning — Confidence-Scored
- Lessons now have **confidence scores** (0.3 tentative → 0.9 near-certain)
- **Project vs. global scope** — React patterns stay in React projects
- **Instinct promotion** — lessons seen in 2+ projects auto-promote to global

### Quick Commands
See `COMMANDS.md` for shortcuts like `/verify`, `/search`, `/tdd`, `/fix`, `/evolve`.

---

## How It Works: Complete Example

Here's how MADF v2.0 handles building a feature end-to-end, showing the methodology and infrastructure layers working together.

### You open Cursor and start a session:

```
[sessionStart hook fires automatically]
→ Loads PROJECT_STATE.md
→ Detects: Phase 4, Feature "User Auth", Backend DONE, Frontend IN PROGRESS
→ Loads frontend-learnings.md (2 existing lessons)

Orchestrator: "Resuming Phase 4 — User Auth frontend, in progress.
Last session: Component structure was defined. Ready for API integration.
Is this still accurate?"

You: "Yes, continue."
```

### Frontend Agent builds components:

```
Frontend Agent writes LoginForm.tsx

[afterFileEdit hook fires]
→ Auto-formats with Prettier
→ TypeScript check: 0 errors
→ Warns: "console.log found on line 23"
→ Agent removes the console.log immediately

Frontend Agent continues...
```

### Before G4 gate, verification runs:

```
[verification-loop skill invoked]

VERIFICATION REPORT
==================
Build:     PASS
Types:     PASS (0 errors)
Lint:      PASS (1 warning — non-blocking)
Tests:     PASS (32/32 passed, 87% coverage)
Security:  PASS (0 secrets found)
Diff:      8 files changed

Overall:   READY for G4

CTO reviews: "87% coverage exceeds 80% threshold. G4 passed."
```

### Learning Agent captures a lesson:

```
Learning Agent: Gate G4 passed first attempt.
Lesson captured:
  [LESSON-004] — Frontend auth components worked first try
  Confidence: 0.5 (second successful auth implementation)
  Scope: project
  Status: CAPTURED
```

---

## Files Reference

| File | Purpose | When to Read |
|------|---------|-------------|
| `FRAMEWORK.md` | Complete architecture, all agents, all protocols | Deep reference |
| `PROJECT_BOOTSTRAP.md` | Step-by-step setup guide for a new project | Starting a project |
| `README.md` (this file) | How the framework works, with example | First time |
| `COMMANDS.md` | Quick command shortcuts | Quick reference |
| `agents/*.md` | Detailed spec for each of the 13 agents | Understanding a specific agent |
| `artifacts/*.md` | Templates for each output artifact | Understanding phase outputs |
| `cursor-rules/*.mdc` | The actual Cursor IDE rules (16 total) | Setting up a project |
| `hooks/hooks.json` | Event hook configuration (7 hooks) | Understanding automations |
| `skills/*/SKILL.md` | Reusable workflow skills (8 skills) | Learning specific workflows |
| `agent-learnings/*.md` | Per-agent learning files (13 files) | Reviewing captured lessons |

---

## One-Line Summary

**The AI asks until it understands, confirms before it acts, stops when it's confused, documents every decision so it never forgets — and is backed by automated hooks that enforce quality, catch secrets, and persist state without manual intervention.**
