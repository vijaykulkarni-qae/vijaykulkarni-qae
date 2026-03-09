# CI/CD Integration Pattern

Standard CI pipeline patterns for all TAFF-generated frameworks. Every framework ships with ready-to-use pipeline configs for GitHub Actions, Jenkins, and GitLab CI.

## Common Principles

1. **Tests run on every PR** — no merge without green tests
2. **Parallel execution** — split tests across jobs for speed
3. **Artifacts on failure** — reports, screenshots, logs uploaded automatically
4. **Caching** — dependencies cached across runs
5. **Retry on infra flake** — network timeouts retry once, not test logic failures

---

## GitHub Actions

### Full workflow

```yaml
# .github/workflows/tests.yml
name: Test Suite

on:
  pull_request:
    branches: [main, develop]
  push:
    branches: [main]
  schedule:
    - cron: '0 6 * * 1-5'  # weekday morning smoke tests

env:
  TEST_ENV: staging
  CI: true

jobs:
  test:
    runs-on: ubuntu-latest
    timeout-minutes: 30
    strategy:
      fail-fast: false
      matrix:
        shard: [1, 2, 3, 4]
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Install browsers
        run: npx playwright install --with-deps chromium

      - name: Run tests (shard ${{ matrix.shard }}/4)
        run: npx playwright test --shard=${{ matrix.shard }}/4
        env:
          API_TOKEN: ${{ secrets.API_TOKEN }}

      - name: Upload results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: test-results-${{ matrix.shard }}
          path: |
            allure-results/
            test-results/
          retention-days: 7

  report:
    needs: test
    if: always()
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Download all results
        uses: actions/download-artifact@v4
        with:
          pattern: test-results-*
          merge-multiple: true
          path: allure-results/

      - name: Restore Allure history
        uses: actions/cache@v4
        with:
          path: allure-report/history
          key: allure-history-${{ github.ref }}

      - name: Generate report
        run: |
          npm install -g allure-commandline
          cp -r allure-report/history allure-results/history || true
          allure generate allure-results -o allure-report --clean

      - name: Upload report
        uses: actions/upload-artifact@v4
        with:
          name: allure-report
          path: allure-report/
          retention-days: 30

      - name: Notify Slack on failure
        if: failure()
        run: |
          curl -X POST "$SLACK_WEBHOOK_URL" \
            -H 'Content-Type: application/json' \
            -d '{"text":"🔴 Tests failed on ${{ github.ref_name }} — ${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}"}'
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
```

---

## Jenkins — Declarative Pipeline

```groovy
// Jenkinsfile
pipeline {
    agent any
    options {
        timeout(time: 30, unit: 'MINUTES')
        retry(1)
    }
    environment {
        TEST_ENV = 'staging'
        API_TOKEN = credentials('api-token-secret-id')
    }
    stages {
        stage('Setup') {
            steps {
                sh 'npm ci'
                sh 'npx playwright install --with-deps chromium'
            }
        }
        stage('Test') {
            parallel {
                stage('Shard 1') {
                    steps { sh 'npx playwright test --shard=1/3' }
                }
                stage('Shard 2') {
                    steps { sh 'npx playwright test --shard=2/3' }
                }
                stage('Shard 3') {
                    steps { sh 'npx playwright test --shard=3/3' }
                }
            }
        }
        stage('Report') {
            steps {
                allure includeProperties: false,
                       jdk: '',
                       results: [[path: 'allure-results']]
            }
        }
    }
    post {
        always {
            archiveArtifacts artifacts: 'test-results/**,allure-results/**',
                            allowEmptyArchive: true
            junit 'test-results/*.xml'
        }
        failure {
            slackSend channel: '#test-alerts',
                      color: 'danger',
                      message: "Tests failed: ${env.JOB_NAME} #${env.BUILD_NUMBER}\n${env.BUILD_URL}"
        }
    }
}
```

---

## GitLab CI

```yaml
# .gitlab-ci.yml
stages:
  - test
  - report

variables:
  TEST_ENV: staging
  CI: "true"

.test-base:
  image: mcr.microsoft.com/playwright:v1.48.0-jammy
  stage: test
  before_script:
    - npm ci --cache .npm
  cache:
    key: ${CI_COMMIT_REF_SLUG}
    paths:
      - .npm/
      - node_modules/
  artifacts:
    when: always
    paths:
      - allure-results/
      - test-results/
    expire_in: 7 days

test-shard-1:
  extends: .test-base
  script: npx playwright test --shard=1/3

test-shard-2:
  extends: .test-base
  script: npx playwright test --shard=2/3

test-shard-3:
  extends: .test-base
  script: npx playwright test --shard=3/3

generate-report:
  stage: report
  when: always
  dependencies:
    - test-shard-1
    - test-shard-2
    - test-shard-3
  image: node:20-slim
  script:
    - npm install -g allure-commandline
    - allure generate allure-results -o allure-report --clean
  artifacts:
    paths:
      - allure-report/
    expire_in: 30 days
```

---

## Common CI Patterns

### Test Splitting Strategies

| Strategy | How | When |
|---|---|---|
| File-based sharding | `--shard=N/M` (Playwright, Jest) | Default for most frameworks |
| Tag-based splitting | `@smoke` in one job, `@regression` in another | When you need priority tiers |
| Duration-based | Split by historical run time (Knapsack, split-tests) | For balanced shard times |

### Retry on Infrastructure Flake

```yaml
# GitHub Actions — retry the full job
jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      fail-fast: false
    steps:
      - name: Run tests
        uses: nick-fields/retry@v3
        with:
          timeout_minutes: 20
          max_attempts: 2
          command: npx playwright test
```

### Dependency Caching

```yaml
# GitHub Actions — npm cache
- uses: actions/setup-node@v4
  with:
    node-version: 20
    cache: 'npm'

# Maven cache
- uses: actions/cache@v4
  with:
    path: ~/.m2/repository
    key: maven-${{ hashFiles('**/pom.xml') }}

# pip cache
- uses: actions/cache@v4
  with:
    path: ~/.cache/pip
    key: pip-${{ hashFiles('**/requirements.txt') }}
```

### Result Aggregation

When tests run across shards, aggregate results before reporting:

```bash
# Download all shard artifacts into one directory, then generate a single report
allure generate combined-allure-results/ -o allure-report --clean
```

---

## Email Notification (Alternative to Slack)

```yaml
# GitHub Actions
- name: Send failure email
  if: failure()
  uses: dawidd6/action-send-mail@v3
  with:
    server_address: smtp.gmail.com
    server_port: 465
    username: ${{ secrets.EMAIL_USER }}
    password: ${{ secrets.EMAIL_PASS }}
    subject: "Test Failure — ${{ github.repository }} (${{ github.ref_name }})"
    to: team@company.com
    body: "Tests failed. View run: ${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}"
```

---

## Checklist

Every generated framework MUST:

- [ ] Include a GitHub Actions workflow (default CI)
- [ ] Support sharded parallel execution in CI
- [ ] Upload failure artifacts (screenshots, reports) on every run
- [ ] Cache dependencies to reduce CI run time
- [ ] Include Slack notification (opt-in via secret)
- [ ] Set job timeout to prevent hung pipelines
- [ ] Use `fail-fast: false` so all shards complete even if one fails
