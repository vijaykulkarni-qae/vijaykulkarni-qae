# Deployment Guide

> **DevOps Agent Output** — Deployment procedures and operational runbook. Fill out during build phase.

---

## Header

| Field | Value |
|-------|-------|
| **Version** | `1.0.0` |
| **Date** | `YYYY-MM-DD` |
| **Target Platform** | `AWS` / `GCP` / `Azure` / `Vercel` / `Docker` / `Kubernetes` |

---

## Prerequisites

| Requirement | Details |
|-------------|---------|
| **Tools** | Docker, kubectl, AWS CLI (or platform-specific CLI) |
| **Access** | IAM roles, repo access, deployment keys |
| **Credentials** | Stored in secrets manager / CI secrets |

### Required Access

- [ ] Cloud provider console access
- [ ] CI/CD pipeline (e.g., GitHub Actions) permissions
- [ ] Container registry push access
- [ ] Database migration permissions

---

## Environment Configuration

| Variable | Description | Required | Default | Example |
|----------|-------------|----------|---------|---------|
| `NODE_ENV` | Environment mode | Yes | `development` | `production` |
| `DATABASE_URL` | Database connection string | Yes | - | `postgresql://user:pass@host:5432/db` |
| `API_BASE_URL` | Backend API URL | Yes | - | `https://api.example.com` |
| `JWT_SECRET` | JWT signing secret | Yes | - | *(from secrets)* |
| `LOG_LEVEL` | Logging verbosity | No | `info` | `debug` |
| `PORT` | Server port | No | `3000` | `8080` |

---

## Architecture Diagram (Deployment View)

```
                    ┌─────────────────┐
                    │   Load Balancer │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
              ▼              ▼              ▼
       ┌──────────┐   ┌──────────┐   ┌──────────┐
       │  App     │   │  App     │   │  App     │
       │  Pod 1   │   │  Pod 2   │   │  Pod 3   │
       └────┬─────┘   └────┬─────┘   └────┬─────┘
            │              │              │
            └──────────────┼──────────────┘
                           │
                    ┌──────▼──────┐
                    │  Database   │
                    │  (RDS/Cloud)│
                    └─────────────┘
```

*Replace with actual architecture (e.g., Mermaid diagram, ASCII, or link to diagram)*

---

## CI/CD Pipeline

### Stages

| Stage | Trigger | Actions |
|-------|---------|---------|
| **Build** | Push to main / PR | Install deps, build, run unit tests |
| **Test** | After build | Integration tests, lint, security scan |
| **Deploy (Staging)** | Merge to main | Build image, push to registry, deploy to staging |
| **Deploy (Prod)** | Manual / Tag | Same as staging, deploy to prod with approval |

### Pipeline Config (Example)

```yaml
# GitHub Actions / GitLab CI
stages:
  - build
  - test
  - deploy-staging
  - deploy-prod  # manual

build:
  - npm ci
  - npm run build

test:
  - npm run test:unit
  - npm run test:integration

deploy-staging:
  - docker build -t app:$CI_COMMIT_SHA .
  - docker push registry/app:$CI_COMMIT_SHA
  - kubectl set image deployment/app app=registry/app:$CI_COMMIT_SHA -n staging
```

---

## Docker / Container Configuration

### Dockerfile

```dockerfile
# Multi-stage build example
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3000
CMD ["node", "dist/index.js"]
```

### Docker Compose (Local)

```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/app
    depends_on:
      - db
  db:
    image: postgres:15
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
      POSTGRES_DB: app
    volumes:
      - pgdata:/var/lib/postgresql/data
volumes:
  pgdata:
```

---

## Deployment Steps

### Development

1. Clone repo: `git clone <repo-url> && cd <repo>`
2. Copy env: `cp .env.example .env`
3. Install: `npm install`
4. Start DB: `docker compose up -d db`
5. Run migrations: `npm run db:migrate`
6. Start app: `npm run dev`

### Staging

1. Ensure CI pipeline passed
2. Merge to `main` (or trigger deploy workflow)
3. Verify staging URL: `https://staging.example.com`
4. Run smoke tests
5. Notify team of new staging deploy

### Production

1. Create release tag: `git tag v1.2.3`
2. Push tag: `git push origin v1.2.3`
3. Trigger prod deployment (manual approval in CI)
4. Monitor deployment logs
5. Verify health endpoint: `curl https://api.example.com/health`
6. Run smoke tests
7. Update status page / changelog

---

## Rollback Procedure

### Quick Rollback (Kubernetes)

```bash
kubectl rollout undo deployment/app -n production
```

### Rollback to Specific Version

```bash
kubectl set image deployment/app app=registry/app:v1.2.2 -n production
kubectl rollout status deployment/app -n production
```

### Database Rollback

```bash
npm run db:rollback  # If using migration tool with rollback support
```

### Post-Rollback Checklist

- [ ] Verify app is serving traffic
- [ ] Check error logs
- [ ] Notify stakeholders
- [ ] Create incident ticket
- [ ] Schedule post-mortem if needed

---

## Monitoring & Alerts

| Metric | Tool | Alert Threshold |
|--------|------|-----------------|
| CPU | CloudWatch / Prometheus | > 80% for 5 min |
| Memory | CloudWatch / Prometheus | > 85% |
| Error rate | Datadog / Sentry | > 1% |
| Latency p99 | APM | > 2s |
| Uptime | UptimeRobot / Pingdom | Down for 2 min |

### Health Check Endpoint

```
GET /health
Response 200: { "status": "ok", "timestamp": "..." }
```

### Dashboards

- [ ] Application metrics (requests, errors, latency)
- [ ] Infrastructure (CPU, memory, disk)
- [ ] Business metrics (if applicable)

---

## Troubleshooting

### Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| App won't start | Missing env vars | Check `.env`, verify all required vars set |
| DB connection failed | Wrong URL / network | Verify DATABASE_URL, check security groups |
| 502 Bad Gateway | App crashed / not ready | Check pod logs, increase readiness probe timeout |
| High memory | Memory leak | Restart pods, profile app |
| Slow responses | DB queries / cold start | Add indexes, warm up instances |

### Log Locations

| Environment | Location |
|-------------|----------|
| Local | `stdout` / `logs/` |
| Staging | CloudWatch Log Group `/app/staging` |
| Production | CloudWatch Log Group `/app/production` |

### Useful Commands

```bash
# View logs
kubectl logs -f deployment/app -n production

# Describe pod (events)
kubectl describe pod <pod-name> -n production

# Exec into container
kubectl exec -it <pod-name> -n production -- /bin/sh
```

---

## Runbook

### Operational Procedures

#### Deploy New Version

1. Follow [Production Deployment Steps](#production) above
2. Monitor for 15 minutes post-deploy
3. If issues: execute [Rollback Procedure](#rollback-procedure)

#### Scale Up

```bash
kubectl scale deployment/app --replicas=5 -n production
```

#### Restart Application

```bash
kubectl rollout restart deployment/app -n production
```

#### Clear Cache (if applicable)

```bash
# Example: Redis
redis-cli FLUSHDB
```

#### Emergency Contact

| Role | Contact |
|------|---------|
| On-call DevOps | [Slack #oncall] |
| Escalation | [Team lead] |

---

## Instructions for DevOps Agent

1. Replace all placeholder values with actual deployment details.
2. Ensure Environment Configuration matches real env vars.
3. Update Architecture Diagram to reflect actual infrastructure.
4. Add platform-specific commands (AWS, GCP, etc.) as needed.
5. Keep Runbook procedures tested and up to date.
