# System Blueprint

> **Produced by:** Blueprint Architect Agent  
> **Purpose:** Technical specification for implementation. References MVP_PLAN.md and DECISIONS.md.

---

## Header

| Field | Value |
|-------|-------|
| **Version** | [VERSION] |
| **Date** | [DATE] |
| **Status** | Draft / Approved |

---

## Tech Stack

| Layer | Technology | Version | Rationale | ADR Reference |
|-------|-------------|---------|------------|---------------|
| Frontend | [TECH] | [VERSION] | [WHY] | [ADR-XXX] |
| Backend | [TECH] | [VERSION] | [WHY] | [ADR-XXX] |
| Database | [TECH] | [VERSION] | [WHY] | [ADR-XXX] |
| Auth | [TECH] | [VERSION] | [WHY] | [ADR-XXX] |
| Hosting | [TECH] | [VERSION] | [WHY] | [ADR-XXX] |
| [LAYER] | [TECH] | [VERSION] | [WHY] | [ADR-XXX] |

---

## System Architecture Diagram

```
[ASCII DIAGRAM - Replace with actual architecture]

Example structure:
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Client    │────▶│   API GW    │────▶│   Backend    │
│  (Browser)  │     │  / CDN      │     │   Service    │
└─────────────┘     └─────────────┘     └──────┬──────┘
                                               │
                    ┌──────────────────────────┼──────────────────────────┐
                    │                          │                          │
                    ▼                          ▼                          ▼
             ┌─────────────┐            ┌─────────────┐            ┌─────────────┐
             │  Database   │            │   Cache     │            │   Storage   │
             └─────────────┘            └─────────────┘            └─────────────┘
```

---

## Data Model

### Entity Template

| Field | Value |
|-------|-------|
| **Entity** | [ENTITY_NAME] |
| **Fields** | [FIELD_1]: [TYPE], [FIELD_2]: [TYPE], ... |
| **Relationships** | [RELATIONSHIP_DESCRIPTION] |

### Entities

**Entity: [ENTITY_1]**
- **Fields:** [FIELD]: [TYPE], [FIELD]: [TYPE]
- **Relationships:** [RELATIONSHIP_TO_OTHER_ENTITIES]

**Entity: [ENTITY_2]**
- **Fields:** [FIELD]: [TYPE], [FIELD]: [TYPE]
- **Relationships:** [RELATIONSHIP_TO_OTHER_ENTITIES]

*Add entities for each domain object. Consider ER diagram if complex.*

---

## API Surface Design

*Group by feature. Reference MVP_PLAN feature names.*

### Feature: [FEATURE_NAME]

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/[resource]` | GET | [None/JWT/OAuth] | [DESCRIPTION] |
| `/api/[resource]` | POST | [None/JWT/OAuth] | [DESCRIPTION] |
| `/api/[resource]/:id` | GET | [None/JWT/OAuth] | [DESCRIPTION] |
| `/api/[resource]/:id` | PUT | [None/JWT/OAuth] | [DESCRIPTION] |
| `/api/[resource]/:id` | DELETE | [None/JWT/OAuth] | [DESCRIPTION] |

### Feature: [FEATURE_NAME_2]

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| [ENDPOINT] | [METHOD] | [AUTH] | [DESCRIPTION] |

---

## Authentication & Authorization Strategy

| Aspect | Approach |
|--------|----------|
| **Auth Method** | [JWT / OAuth2 / Session / API Key] |
| **Identity Provider** | [Cognito / Auth0 / Custom / etc.] |
| **Token Storage** | [Cookie / LocalStorage / Memory] |
| **Roles** | [ROLE_1], [ROLE_2], [ROLE_3] |
| **Permission Model** | [RBAC / ABAC / Custom] |
| **Protected Routes** | [LIST_OR_PATTERN] |

---

## Third-Party Integrations

| Integration | Purpose | Auth | ADR Reference |
|-------------|---------|------|---------------|
| [SERVICE_NAME] | [PURPOSE] | [API_KEY/OAuth/etc.] | [ADR-XXX] |
| [SERVICE_NAME] | [PURPOSE] | [API_KEY/OAuth/etc.] | [ADR-XXX] |

---

## Scalability Strategy

| Concern | Strategy |
|---------|----------|
| **Horizontal Scaling** | [STATELESS_SERVICES / KUBERNETES / etc.] |
| **Database** | [READ_REPLICAS / SHARDING / CONNECTION_POOLING] |
| **Caching** | [REDIS / IN_MEMORY / CDN] |
| **Async Processing** | [QUEUE_SERVICE / BACKGROUND_JOBS] |
| **Rate Limiting** | [APPROACH] |

---

## Infrastructure Requirements

| Environment | Resources | Estimated Cost |
|-------------|-----------|----------------|
| Development | [RESOURCES] | [COST_OR_FREE] |
| Staging | [RESOURCES] | [COST] |
| Production | [RESOURCES] | [COST] |

*Include: compute, database, storage, CDN, monitoring.*

---

*Producing Agent Instructions:*
- Ensure every tech choice has a corresponding ADR in DECISIONS.md.
- Keep API design aligned with UX_SPEC user flows.
- Update Data Model when MVP_PLAN features change.
