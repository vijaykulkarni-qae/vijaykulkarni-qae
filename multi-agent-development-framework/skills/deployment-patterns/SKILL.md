---
name: deployment-patterns
description: "Deployment strategies, Docker patterns, CI/CD pipelines, health checks, rollbacks."
origin: MADF+ECC
---

# Deployment Patterns

Structured patterns for the DevOps Agent (08) during Phase 5. Covers deployment strategies, containerization, CI/CD, monitoring, and rollback procedures.

## When to Activate

- Setting up CI/CD pipelines (Phase 5)
- Dockerizing an application
- Choosing a deployment strategy
- Configuring health checks and monitoring
- Planning rollback procedures

## Deployment Strategies

| Strategy | Risk | Downtime | Best For |
|----------|------|----------|----------|
| **Rolling** | Low | Zero | Standard web apps, stateless services |
| **Blue-Green** | Low | Zero | Apps requiring instant rollback |
| **Canary** | Medium | Zero | High-traffic apps, gradual rollout |
| **Recreate** | High | Brief | Dev/staging, stateful apps requiring clean restart |

### Decision Guide
- MVP / first deployment → **Rolling** (simplest)
- Need instant rollback → **Blue-Green**
- High user count, risk-averse → **Canary**
- Database migration with downtime → **Recreate** (staging only)

## Docker Best Practices

```dockerfile
# Multi-stage build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3000
USER node
CMD ["node", "dist/server.js"]
```

Key rules:
- Use multi-stage builds to minimize image size
- Run as non-root user (`USER node`)
- Use `.dockerignore` to exclude `node_modules`, `.git`, tests
- Pin base image versions (e.g., `node:20-alpine`, not `node:latest`)
- Use `npm ci` for reproducible installs

## Health Check Endpoints

Every deployed application must expose:

| Endpoint | Purpose | Response |
|----------|---------|----------|
| `GET /health` | Basic liveness | `{ "status": "ok" }` |
| `GET /ready` | Readiness (DB connected, services up) | `{ "status": "ready", "checks": {...} }` |

## CI/CD Pipeline Stages

```
1. Install     → npm ci
2. Lint        → npm run lint
3. Type Check  → npx tsc --noEmit
4. Unit Tests  → npm test -- --coverage
5. Build       → npm run build
6. Security    → npm audit, secret scan
7. E2E Tests   → npx playwright test
8. Deploy      → Rolling/Blue-Green/Canary
9. Smoke Test  → Hit /health endpoint
10. Notify     → Slack/email on success or failure
```

## Rollback Procedure

Document in DEPLOYMENT_GUIDE.md:
1. **Detect** — health check failure, error rate spike, user report
2. **Decide** — rollback vs. hotfix (SEV-1/2 = rollback, SEV-3/4 = hotfix)
3. **Execute** — `git revert` + redeploy OR switch blue/green
4. **Verify** — confirm rollback is stable via health checks
5. **Document** — log incident in DECISIONS.md, trigger Learning Agent

## Integration with MADF

- DevOps Agent (08) loads this skill during Phase 5
- DEPLOYMENT_GUIDE.md must include rollback procedure
- G6 gate requires: CI pipeline green + deployment documented + environments configured
- Reactive Maintenance Agent (10) follows the rollback procedure for production incidents
