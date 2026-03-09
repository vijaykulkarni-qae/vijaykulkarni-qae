# Architecture Decision Records (ADRs)

> **Format:** Each decision is captured as an ADR. Decisions are numbered sequentially (ADR-001, ADR-002, ...). ADRs are **never deleted**—only deprecated when superseded. Every significant tech choice and architecture decision gets an entry.

---

## ADR Template

```markdown
## ADR-XXX: [TITLE]

| Field | Value |
|-------|-------|
| **ID** | ADR-XXX |
| **Date** | [YYYY-MM-DD] |
| **Status** | Proposed / Accepted / Revised / Deprecated |

### Context
[What is the situation? What forces are at play? What constraints exist?]

### Decision
[What was decided? Be specific and actionable.]

### Rationale
[Why was this decision made? What evidence or reasoning supports it?]

### Alternatives Considered
| Alternative | Pros | Cons | Why Not Chosen |
|-------------|------|------|----------------|
| [Option A] | ... | ... | ... |
| [Option B] | ... | ... | ... |

### Consequences
- **Positive:** [List benefits]
- **Negative:** [List trade-offs or risks]
- **Neutral:** [List follow-on decisions or documentation needed]
```

---

## Example Entry

## ADR-001: Use PostgreSQL as Primary Database

| Field | Value |
|-------|-------|
| **ID** | ADR-001 |
| **Date** | 2025-01-15 |
| **Status** | Accepted |

### Context
The application requires a relational database for transactional data, user management, and reporting. We need ACID compliance, good JSON support for flexible schemas, and strong ecosystem tooling. Budget allows for managed database services.

### Decision
Use PostgreSQL 15+ as the primary database. Deploy via managed service (e.g., AWS RDS, Supabase, or Neon) in production.

### Rationale
PostgreSQL offers robust ACID guarantees, excellent JSON/JSONB support for hybrid relational-document use cases, mature tooling, and wide cloud provider support. It scales well for our expected load (10K–100K users) without requiring NoSQL complexity.

### Alternatives Considered

| Alternative | Pros | Cons | Why Not Chosen |
|-------------|------|------|----------------|
| MySQL | Familiar, widely used | Weaker JSON support, licensing concerns | JSON requirements favor PostgreSQL |
| MongoDB | Flexible schema, horizontal scaling | No ACID across documents, operational complexity | Transactional requirements need relational model |
| SQLite | Simple, zero config | Not suitable for multi-user production | Production deployment requirement |

### Consequences
- **Positive:** Strong consistency, rich query capabilities, good ORM support (Prisma, TypeORM)
- **Negative:** Vertical scaling limits; may need read replicas or sharding at very high scale
- **Neutral:** Requires backup and migration strategy (document in SYSTEM_BLUEPRINT.md)

---

## ADR Log

| ADR ID | Title | Status | Date |
|--------|-------|--------|------|
| ADR-001 | Use PostgreSQL as Primary Database | Accepted | 2025-01-15 |
| ADR-002 | [TITLE] | [STATUS] | [DATE] |

---

## Rules for Producing Agents

1. **Number sequentially:** Next ADR = ADR-002, ADR-003, etc.
2. **Never delete:** If a decision is reversed, create a new ADR that deprecates the old one and mark the old ADR status as "Deprecated."
3. **Every tech choice:** Framework, database, auth provider, hosting, API design patterns—all get an ADR.
4. **Reference in other artifacts:** SYSTEM_BLUEPRINT.md and MVP_PLAN.md should link to relevant ADRs.
5. **Status lifecycle:** Proposed → Accepted (or Revised → Accepted) or Deprecated.
