---
name: database-migrations
description: "Safe database migration patterns — forward-only, expand/contract, zero-downtime schema changes."
origin: MADF+ECC
---

# Database Migration Patterns

Safe patterns for schema evolution. Used by Backend Agent (04) during Phase 4a and Proactive Evolution Agent (11) for post-launch schema changes.

## When to Activate

- Creating initial database schema (Phase 4a)
- Modifying schema for new features
- Post-launch schema evolution (Agent 11)
- Database migration during platform migration

## Core Principles

1. **Forward-only** — never write destructive "down" migrations
2. **Expand/contract** — add new → migrate data → remove old (separate deployments)
3. **Backward compatible** — old code must work with new schema during rollout
4. **Tested** — verify data integrity after every migration
5. **Documented** — update SYSTEM_BLUEPRINT.md data model after migration

## The Expand/Contract Pattern (Zero-Downtime)

```
Step 1: EXPAND — Add new columns/tables (nullable, no constraints)
  Deploy: Code writes to BOTH old and new

Step 2: MIGRATE — Backfill data from old to new
  Deploy: Code reads from new, writes to both

Step 3: CONTRACT — Add constraints, drop old columns
  Deploy: Code only uses new schema
```

Each step is a separate deployment. If anything fails, only that step rolls back.

## Safe Migration Checklist

### Adding a Column
- [ ] New column is nullable OR has a default value
- [ ] No NOT NULL constraint until data is backfilled
- [ ] Index added if column will be filtered/sorted

### Renaming a Column
- [ ] Add new column (nullable)
- [ ] Deploy code that writes to both old and new
- [ ] Backfill data from old to new
- [ ] Deploy code that reads from new only
- [ ] Drop old column in a later migration

### Removing a Column
- [ ] Verify no code references the column
- [ ] Deploy code that no longer reads/writes the column
- [ ] Drop the column in a separate migration

### Adding an Index
- [ ] Use `CREATE INDEX CONCURRENTLY` (PostgreSQL) to avoid table locks
- [ ] Verify query performance improvement with EXPLAIN ANALYZE

## Dangerous Operations (Require CTO Review)

| Operation | Risk | Mitigation |
|-----------|------|-----------|
| Dropping a column | Data loss | Verify no code references; backup first |
| Changing column type | Data loss/corruption | Add new column, migrate, drop old |
| Adding NOT NULL | Blocks on large tables | Add nullable, backfill, then add constraint |
| Renaming a table | Breaks all references | Add new table, migrate, drop old |

## ORM-Specific Patterns

### Prisma
```bash
npx prisma migrate dev --name add-user-role    # Development
npx prisma migrate deploy                       # Production
```

### Drizzle
```bash
npx drizzle-kit generate                        # Generate migration
npx drizzle-kit migrate                         # Apply migration
```

## Integration with MADF

- Backend Agent (04) follows these patterns for all schema work in Phase 4a
- Every schema change is documented in SYSTEM_BLUEPRINT.md data model section
- Schema-breaking changes require CTO Agent review (escalation trigger)
- Proactive Evolution Agent (11) uses expand/contract for post-launch migrations
- DECISIONS.md logs migration strategy choices as ADRs
