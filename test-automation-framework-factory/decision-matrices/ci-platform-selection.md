# CI/CD Platform Selection Matrix

> **TAFF Decision Matrix** | Last Updated: March 2026
> Use this matrix to select the optimal CI/CD platform for test automation pipelines based on infrastructure, budget, and integration needs.

---

## Platforms Compared

| ID | Platform | Hosting Model | Latest Stable (2026) |
|----|----------|---------------|----------------------|
| GH | GitHub Actions | Cloud (GitHub-hosted) + Self-hosted runners | GA |
| JK | Jenkins | Self-hosted (primary) | 2.450+ / LTS |
| GL | GitLab CI | Cloud (GitLab.com) + Self-managed | 17.x |
| AZ | Azure DevOps | Cloud + Azure DevOps Server | Azure DevOps Services |
| CC | CircleCI | Cloud + Self-hosted runner | Cloud 2.x |
| BK | Buildkite | Hybrid (cloud orchestrator + self-hosted agents) | 3.x |

---

## Scoring Dimensions (1–5 scale)

| # | Dimension | Weight | GH | JK | GL | AZ | CC | BK |
|---|-----------|--------|----|----|----|----|----|----|
| 1 | Cost / Free Tier | 7 | 5 | 4 | 4 | 4 | 3 | 3 |
| 2 | Setup Complexity (5 = easiest) | 7 | 5 | 1 | 4 | 3 | 4 | 3 |
| 3 | Parallelism & Concurrency | 8 | 4 | 5 | 4 | 4 | 5 | 5 |
| 4 | Artifact Handling | 6 | 4 | 3 | 5 | 5 | 4 | 3 |
| 5 | Secret Management | 7 | 4 | 3 | 5 | 5 | 4 | 4 |
| 6 | Docker Support | 7 | 5 | 4 | 5 | 4 | 5 | 5 |
| 7 | Matrix Builds | 6 | 5 | 3 | 4 | 3 | 4 | 4 |
| 8 | Marketplace / Plugins | 6 | 5 | 5 | 3 | 4 | 3 | 3 |
| 9 | Self-Hosted Option | 6 | 4 | 5 | 5 | 4 | 3 | 5 |
| 10 | YAML Config Quality | 5 | 4 | 2 | 5 | 3 | 4 | 4 |
| 11 | Caching | 7 | 4 | 2 | 4 | 3 | 5 | 4 |
| 12 | Notification Integrations | 5 | 4 | 4 | 4 | 4 | 3 | 4 |
| 13 | Security Scanning Integration | 6 | 4 | 3 | 5 | 4 | 3 | 3 |

### Unweighted Totals

| Platform | Raw Total (/65) |
|----------|-----------------|
| **GitHub Actions** | **57** |
| **Jenkins** | **44** |
| **GitLab CI** | **57** |
| **Azure DevOps** | **50** |
| **CircleCI** | **50** |
| **Buildkite** | **50** |

### Weighted Totals

| Platform | Weighted Score (/415) |
|----------|----------------------|
| **GitHub Actions** | **367** |
| **Jenkins** | **280** |
| **GitLab CI** | **370** |
| **Azure DevOps** | **321** |
| **CircleCI** | **328** |
| **Buildkite** | **329** |

---

## Scoring Rationale

### Cost / Free Tier
- **GH (5):** 2,000 free minutes/month (private); unlimited for public repos. Generous for OSS and small teams.
- **JK (4):** Free OSS; cost is infrastructure (self-hosted servers) and maintenance labor.
- **GL (4):** 400 CI/CD minutes/month on free tier; shared runners available. Self-managed is free OSS.
- **AZ (4):** 1 free parallel job with 1,800 minutes/month; generous for small teams.
- **CC (3):** Free tier limited to 6,000 build minutes/month; paid tiers scale quickly.
- **BK (3):** Free for small teams (up to 3 agents); per-user pricing beyond that.

### Setup Complexity
- **GH (5):** Drop a YAML file in `.github/workflows/` — zero infrastructure to manage.
- **GL (4):** `.gitlab-ci.yml` in repo root; shared runners available immediately on GitLab.com.
- **CC (4):** `.circleci/config.yml` with intuitive orbs for common setups.
- **AZ (3):** `azure-pipelines.yml` or classic editor; more concepts to learn (stages, environments, service connections).
- **BK (3):** Simple `pipeline.yml` but requires self-managed agent setup.
- **JK (1):** Requires server installation, plugin management, Groovy Jenkinsfile syntax, and ongoing maintenance.

### Parallelism & Concurrency
- **CC (5):** Test splitting with `circleci tests split` for automatic parallelism; up to 30x parallelism.
- **BK (5):** Unlimited parallel agents (you provision them); dynamic pipelines scale horizontally.
- **JK (5):** Unlimited with enough agents; Pipeline `parallel` directive and matrix builds.
- **GH (4):** Matrix strategy with `max-parallel`; limited by concurrent job quota (20 for free, 500 for enterprise).
- **GL (4):** `parallel:` keyword splits jobs; limited by runner availability on shared fleet.
- **AZ (4):** Parallel jobs available; limited by purchased parallel job slots.

### Artifact Handling
- **GL (5):** Built-in artifact passing between stages; integrated container registry and package registry.
- **AZ (5):** Azure Artifacts built-in; universal packages, npm, NuGet, Maven, pip feeds.
- **GH (4):** `actions/upload-artifact` / `download-artifact`; GitHub Packages for registries.
- **CC (4):** Workspace persistence between jobs; artifact storage with expiration policies.
- **JK (3):** `archiveArtifacts` step; no built-in package registry (requires Artifactory/Nexus).
- **BK (3):** `buildkite-agent artifact upload/download`; integrates with S3/GCS.

### Secret Management
- **GL (5):** Variable masking, protected variables, group-level variables, external vault integration, OIDC.
- **AZ (5):** Azure Key Vault integration, variable groups, pipeline permissions model.
- **GH (4):** Repository/org/environment secrets; OIDC for cloud providers; no native vault.
- **CC (4):** Contexts for grouped secrets; environment variables with restricted access.
- **BK (4):** Agent-level secrets; integrates with AWS SSM, Vault, and custom hooks.
- **JK (3):** Credentials plugin; secrets can leak in logs without careful masking configuration.

### YAML Config Quality
- **GL (5):** Most mature YAML CI; `include`, `extends`, `rules`, `needs` DAG, and multi-project pipelines.
- **GH (4):** Clean syntax; reusable workflows and composite actions. Some verbosity with `uses:` steps.
- **CC (4):** Orbs abstract complexity; YAML anchors and executors reduce duplication.
- **BK (4):** Simple pipeline format; dynamic pipelines via `buildkite-agent pipeline upload`.
- **AZ (3):** Powerful but verbose; templates help but syntax has a steeper learning curve.
- **JK (2):** Jenkinsfile (Groovy DSL) — not YAML; declarative pipeline is cleaner but scripted is complex.

### Security Scanning Integration
- **GL (5):** Built-in SAST, DAST, container scanning, dependency scanning, secret detection — all native.
- **GH (4):** CodeQL, Dependabot, secret scanning; GitHub Advanced Security for enterprise features.
- **AZ (4):** Microsoft Defender for DevOps; integration with Azure Security Center.
- **JK (3):** Via plugins (SonarQube, OWASP ZAP); no native scanning.
- **CC (3):** Orbs for Snyk, SonarCloud; no built-in scanning.
- **BK (3):** Via plugins and agent hooks; no native scanning capabilities.

---

## Decision Flowchart

```
START
  │
  ▼
┌──────────────────────────────────┐
│ Primary source control platform? │
└──┬──────────┬──────────┬─────────┘
   │ GitHub   │ GitLab   │ Other/Mixed
   ▼          ▼          ▼
┌────────┐ ┌────────┐ ┌──────────────────────────┐
│GitHub  │ │GitLab  │ │ Need fully self-hosted   │
│Actions │ │CI      │ │ with maximum flexibility? │
│(start  │ │(start  │ └──────┬──────────┬────────┘
│ here)  │ │ here)  │        │ YES      │ NO
└───┬────┘ └───┬────┘        ▼          ▼
    │          │       ┌──────────┐ ┌────────────────────┐
    ▼          ▼       │ Jenkins  │ │ Enterprise with    │
┌──────────────────┐   │ or       │ │ Azure/MS ecosystem?│
│ Sufficient for   │   │Buildkite │ └──────┬───────┬─────┘
│ your needs?      │   └──────────┘        │ YES   │ NO
│ (parallelism,    │                       ▼       ▼
│  self-hosted,    │               ┌───────────┐ ┌────────────────┐
│  security)       │               │ Azure     │ │ Budget         │
└──┬────────┬──────┘               │ DevOps    │ │ constraints?   │
   │ YES    │ NO                   └───────────┘ └──┬───────┬─────┘
   ▼        ▼                                       │ YES   │ NO
┌──────┐ ┌──────────────────────┐               ┌───────┐┌────────┐
│Stay  │ │ Evaluate:            │               │GitHub ││Circle- │
│with  │ │ • CircleCI (speed)   │               │Actions││CI or   │
│it    │ │ • Buildkite (scale)  │               │(free  ││Build-  │
└──────┘ │ • Jenkins (control)  │               │tier)  ││kite    │
         └──────────────────────┘               └───────┘└────────┘
```

---

## When to Choose Each Platform

### GitHub Actions
Best for **teams already using GitHub** who want zero-infrastructure CI/CD. Ideal for:
- Open-source projects (unlimited free minutes for public repos)
- Small-to-medium teams wanting fast onboarding with no server management
- Projects leveraging the 20,000+ Actions marketplace for pre-built integrations
- Matrix builds across OS + browser + language version combinations
- Teams wanting CI/CD config co-located with code in the same platform

### Jenkins
Best for **organizations requiring full control over build infrastructure**. Ideal for:
- Air-gapped or highly regulated environments where cloud CI is not an option
- Complex pipelines with custom plugins (1,800+ plugins available)
- Teams with dedicated DevOps engineers to manage Jenkins infrastructure
- Legacy projects with existing Jenkinsfile pipelines
- Environments needing maximum parallelism with unlimited self-hosted agents

### GitLab CI
Best for **teams using GitLab** who want an all-in-one DevSecOps platform. Ideal for:
- Organizations wanting source control, CI/CD, container registry, and security scanning unified
- Teams needing built-in SAST/DAST/dependency scanning without third-party tools
- Multi-project pipelines and complex DAG-based workflow dependencies
- Self-managed deployments on Kubernetes via GitLab Helm chart
- Compliance-focused environments leveraging GitLab's audit and approval features

### Azure DevOps
Best for **Microsoft-ecosystem enterprises** with Azure cloud workloads. Ideal for:
- Teams deploying to Azure (native integration with AKS, App Service, Azure Functions)
- Organizations using Azure Boards for work tracking alongside pipelines
- .NET / C# projects with first-class Visual Studio and NuGet integration
- Enterprises needing Azure Key Vault and Managed Identity in pipelines
- Hybrid environments with Azure DevOps Server (on-prem) + Azure DevOps Services (cloud)

### CircleCI
Best for **teams prioritizing build speed and intelligent test splitting**. Ideal for:
- Projects where test parallelism and caching drive significant time savings
- Docker-first workflows — CircleCI's Docker executor is fast and well-optimized
- Teams wanting automatic test splitting across parallel containers by timing data
- Orb-based configuration for rapid setup of common tools (Playwright, k6, Cypress)
- Organizations needing insights dashboards for flaky test detection and pipeline analytics

### Buildkite
Best for **large engineering organizations needing hybrid scale**. Ideal for:
- Companies wanting cloud orchestration but self-hosted build agents (data stays on-prem)
- High-scale monorepos with thousands of daily builds requiring dynamic pipelines
- Teams needing to run builds on specific hardware (GPUs, proprietary devices, test labs)
- Organizations wanting agent clusters on AWS/GCP/Azure with auto-scaling
- Engineering platform teams building custom CI experiences with Buildkite's API

---

## Cost Comparison (2026 Estimates)

| Platform | Free Tier | ~50-person Team / Month |
|----------|-----------|------------------------|
| GitHub Actions | 2,000 min (private), unlimited (public) | $500–1,500 (usage-based) |
| Jenkins | Free (OSS) | $1,000–3,000 (infra + maintenance labor) |
| GitLab CI | 400 min shared runners | $800–2,000 (Premium tier + compute) |
| Azure DevOps | 1,800 min, 1 parallel job | $600–1,500 (parallel jobs + hosted) |
| CircleCI | 6,000 min | $700–2,000 (performance plan) |
| Buildkite | Free ≤3 agents | $1,000–2,500 (per-user + infra) |

*Costs vary significantly based on build frequency, parallelism needs, and self-hosted vs. cloud.*

---

## Test Automation-Specific Considerations

| Concern | Best Platforms | Notes |
|---------|---------------|-------|
| Browser test parallelism | CircleCI, GitHub Actions, Buildkite | CircleCI test-splitting shines; GH matrix strategy is clean |
| Playwright container support | All | Official `mcr.microsoft.com/playwright` Docker image works everywhere |
| Test artifact storage (videos, screenshots) | GitLab CI, Azure DevOps | Built-in artifact viewers; others need S3/external upload |
| Flaky test detection | CircleCI, GitLab CI | Native insights; others need third-party (Allure TestOps, Currents) |
| Test environment provisioning | Jenkins, Buildkite | Agent flexibility for custom environments (Selenium Grid, device farms) |
| OIDC cloud auth (no static secrets) | GitHub Actions, GitLab CI | Cleanest OIDC implementations for AWS/GCP/Azure |

---

## Risk Factors

| Risk | Mitigation |
|------|-----------|
| GitHub Actions vendor lock-in with marketplace Actions | Use composite actions wrapping CLI commands; keep tool-specific logic portable |
| Jenkins maintenance burden | Dedicate 10-20% DevOps capacity; use Jenkins Configuration as Code (JCasC) |
| GitLab CI shared runner quotas | Budget for additional compute minutes or self-manage runners on K8s |
| CircleCI pricing at scale | Monitor usage; consider Buildkite for cost-effective self-hosted at high volume |
| Buildkite requires agent infrastructure | Use auto-scaling stacks (elastic-ci-stack-for-aws); budget for infra ops |

---

## Version History

| Date | Change |
|------|--------|
| 2026-03-10 | Initial matrix created based on 2026 platform capabilities and pricing |
