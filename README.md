# Hi, I'm Vijay

**Senior QA Engineer** — 6.5 years of building quality into software, not just finding bugs at the end.

I build tools and frameworks that make QA engineering faster, smarter, and more systematic. Everything here is something I built to solve a real problem I faced in my work.

[LinkedIn](https://www.linkedin.com/in/vijaykulkarni-qae) | vijaykumar.s.kulkarni@gmail.com | Bengaluru, India

---

## The Journey

I started my career in manual testing — writing test cases by hand, clicking through the same flows every day. Over time I moved into automation, then into building frameworks, CI/CD pipelines, security assessments, and eventually full platforms.

But here's what I noticed along the way:

### Phase 1: Building Tools (One Thing at a Time)

When I needed an AI-powered test management platform, I built **Autonomous QA Platform** — a full-stack application with 127 APIs, 8,578 automated tests, and 55,000+ lines of code. When I needed faster test planning, I built **AI Test Case Generator** — a methodology that turns plain-English module descriptions into complete test plans with 28 regression categories.

Both were useful. Both solved real problems. But both were built the same way — one conversation with AI, one task at a time. Product thinking, architecture, frontend, backend, testing, security, DevOps — all done sequentially, like having a 13-person team but only letting one person work at a time.

### Phase 2: The Realization

Building those tools taught me something: **software development is inherently multi-disciplinary**. A platform needs someone thinking about product strategy while someone else designs the architecture while someone else builds the frontend. Doing it sequentially is slow and leads to rework — the backend developer makes assumptions the frontend developer has to undo.

What if AI could work the same way a real team does? Not one AI doing everything, but specialized agents — each one focused on what it does best — collaborating through shared artifacts and clear handoffs.

### Phase 3: Building Frameworks (Multi-Agent Systems)

That insight led to two frameworks:

- **MADF** (Multi-Agent Development Framework) — 13 specialized AI agents that collaborate like a real development team. A product strategist, an architect, frontend and backend developers, a tester, a security engineer, a DevOps engineer — each with clear responsibilities, shared artifacts, and an alignment protocol that ensures no one starts building until they fully understand what's needed. v2.1 adds 15 reusable skills (visual QA with Playwright, STRIDE threat modeling, design review with AI slop detection, post-deploy canary monitoring, sprint retros with git metrics, auto doc-sync, and express planning), event-driven hooks, universal coding rules, and a confidence-scored continuous learning system.

- **TAFF** (Test Automation Framework Factory) — The same multi-agent architecture applied to test framework generation. 16 agents, 10 tool blueprints, 9 shared patterns. Instead of building each test framework from scratch, TAFF encodes expert knowledge into blueprints and uses specialized agents to generate production-ready frameworks for any testing type.

The key difference: MADF and TAFF don't just use AI — they organize AI the way you'd organize a real team. Specialization, coordination, and continuous learning.

---

## Projects

### [Multi-Agent Development Framework (MADF) v2.1](./multi-agent-development-framework/)

A framework for building software with AI — 13 specialized agents collaborating like a real development team. v2.1 adds 7 new workflow skills (visual QA, STRIDE threat modeling, design review with AI slop detection, post-deploy canary monitoring, metrics-driven retros, doc sync, and express planning) plus "Boil the Lake" and "Search Before Building" philosophy principles.

| | |
|---|---|
| **Agents** | 13 (Product Strategy, Architecture, UX, Backend, Frontend, Testing, Security, DevOps, + Lifecycle) |
| **Hierarchy** | Human → CTO Agent → Orchestrator → Specialized Agents |
| **Key Feature** | Alignment protocol — AI asks until it understands, confirms before it acts, stops when confused |
| **Artifacts** | 12 templates (MVP Plan, System Blueprint, API Contract, Test Plan, Security Review, etc.) |
| **Hooks** | 7 event-driven automations (session start/stop, file edit checks, shell safety, context compaction) |
| **Skills** | 15 reusable workflows — `/qa` (visual QA), `/cso` (STRIDE), `/design-review`, `/canary`, `/retro`, `/doc-sync`, `/autoplan`, plus TDD, search-first, verification loop, E2E, deployment, migrations, eval harness, context management |
| **Rules** | 4 universal standards (coding style, git workflow, development pipeline, performance optimization) |
| **Learning** | Confidence-scored lessons (0.3–0.9), project/global scoping, instinct promotion at 0.8+ |
| **Presentation** | [MADF_Framework.pptx](./multi-agent-development-framework/MADF_Framework.pptx) — 8-slide overview deck |

---

### [Test Automation Framework Factory (TAFF)](./test-automation-framework-factory/)

A meta-framework that generates production-ready test automation frameworks using AI agents.

| | |
|---|---|
| **Agents** | 16 (Requirements Analyst, Framework Architect, 6 Domain Builders, Infrastructure, Quality Gate, etc.) |
| **Blueprints** | 10 (Playwright, Cypress, Selenium, SuperTest, pytest, k6, Locust, OWASP ZAP, axe-core, Manual) |
| **Shared Patterns** | 9 (Config, Reporting, CI/CD, Test Data, Parallel Execution, Logging, Docker, Retry, Auth) |
| **Decision Matrices** | 4 (UI tool, API tool, Performance tool, CI platform selection) |
| **Presentation** | [TAFF_Framework.pptx](./test-automation-framework-factory/TAFF_Framework.pptx) — 7-slide overview deck |

---

### [Autonomous QA Platform](./autonomous-qa-platform/)

Full-stack AI-powered test management platform — record, execute, analyze, and schedule web tests.

| | |
|---|---|
| **Scale** | 55,000+ lines of code, 127 REST APIs, 66 services, 19 database tables |
| **Tests** | 8,578 automated tests (85% backend coverage, 70% frontend coverage) |
| **AI** | 9 providers (Claude, OpenAI, Gemini, Groq, Ollama, etc.) with circuit breaker + failover |
| **Stack** | React 18 + TypeScript, Node.js + Express v5, PostgreSQL 16, Docker, AWS |
| **Features** | Playwright recording, AI script editing, real-time WebSocket monitoring, cron scheduling, Allure reports |
| **Presentation** | [Autonomous_QA_Platform.pptx](./autonomous-qa-platform/Autonomous_QA_Platform.pptx) — 8-slide overview deck |

---

### [AI Test Case Generator](./ai-test-case-generator/)

AI-powered QA methodology — describe a module in plain English, get a complete test plan.

| | |
|---|---|
| **Components** | Test Plan Generator, PR Impact Analyzer, Security Test Generator |
| **Output** | 7-sheet Excel workbook with 28 regression categories, formula-driven dashboard |
| **Pipeline** | Voice recordings (NotebookLM) → Knowledge base → AI processing → Structured test plan |
| **Results** | 284+ test scenarios, 65+ security vectors, CRITICAL vulnerability caught before production |
| **Presentation** | [AI_Test_Plan_Generator.pptx](./ai-test-case-generator/AI_Test_Plan_Generator.pptx) — 7-slide overview deck |

---

## What I Work With

**Automation**: Selenium WebDriver 4.x, TestNG, Playwright, Page Object Model, data-driven frameworks
**Languages**: Java (primary), JavaScript, TypeScript
**Testing Types**: Functional, security (XSS, SQL injection, adversarial assessments), performance (JMeter), accessibility (WCAG 2.1 AA)
**CI/CD**: GitHub Actions (5-job pipeline), Selenoid Docker grid, Docker Compose, AWS (S3, CloudFront, ECR)
**AI in Testing**: Multi-agent framework design, prompt engineering, RAG workflows, MCP server integration
**Databases**: PostgreSQL (Prisma ORM), MySQL
**Observability**: Allure Reports (S3 + CloudFront), Grafana + Loki

---

## Professional Background

**Senior QA Engineer** at Digii (EdTech SaaS) — Own quality for the Examination Management System, the most security-critical module. Previously built the Selenium-Java automation framework from scratch, designed the CI/CD pipeline, and automated 12+ modules.

Before that: **QA Engineer** at Paybooks Technologies (HR Tech) — progressed from manual testing to automation over 2.5 years.

Non-CS background (Mechanical Engineering) — 18 national-level awards during college, including a Government of India top-5 project selection.

---

*The AI asks until it understands, confirms before it acts, stops when it's confused, and documents every decision so it never forgets. That's the principle behind everything I build.*
