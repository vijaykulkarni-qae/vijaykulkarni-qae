# Config Management Pattern

Cross-cutting configuration pattern for all TAFF-generated frameworks. Solves environment switching, secret injection, and override hierarchy once.

## Override Hierarchy

Lowest to highest priority — higher wins:

```
defaults (hardcoded) → config file → .env file → environment variable → CLI argument
```

Every framework MUST respect this order. A CI pipeline sets env vars; a developer overrides via CLI.

## Environment-Based Configuration

All frameworks distinguish at minimum three environments:

| Environment | Purpose | Typical Base URL |
|---|---|---|
| `local` | Developer machine | `http://localhost:3000` |
| `staging` | Pre-production, shared | `https://staging.app.com` |
| `prod` | Production smoke tests only | `https://app.com` |

The active environment is set via `TEST_ENV` (env var) or `--env` (CLI).

---

## TypeScript — dotenv + zod Validation

### .env.local

```ini
TEST_ENV=local
BASE_URL=http://localhost:3000
API_URL=http://localhost:4000/api
TIMEOUT=30000
HEADLESS=false
```

### .env.staging

```ini
TEST_ENV=staging
BASE_URL=https://staging.app.com
API_URL=https://staging.app.com/api
TIMEOUT=60000
HEADLESS=true
```

### config.ts

```typescript
import { z } from 'zod';
import * as dotenv from 'dotenv';
import path from 'path';

const env = process.env.TEST_ENV || 'local';
dotenv.config({ path: path.resolve(`.env.${env}`) });
dotenv.config({ path: '.env' }); // fallback, does NOT override existing vars

const ConfigSchema = z.object({
  TEST_ENV: z.enum(['local', 'staging', 'prod']).default('local'),
  BASE_URL: z.string().url(),
  API_URL: z.string().url(),
  TIMEOUT: z.coerce.number().positive().default(30000),
  HEADLESS: z.coerce.boolean().default(true),
  // secrets — no defaults, must be injected
  API_TOKEN: z.string().optional(),
  DB_CONNECTION: z.string().optional(),
});

export const config = ConfigSchema.parse(process.env);
```

### Usage in tests

```typescript
import { config } from '../config';

test('loads dashboard', async ({ page }) => {
  await page.goto(config.BASE_URL + '/dashboard');
  await page.waitForLoadState('networkidle');
});
```

### CLI override

```bash
TEST_ENV=staging BASE_URL=https://custom.url npx playwright test
```

---

## Java — .properties + System.getProperty

### src/test/resources/config-local.properties

```properties
base.url=http://localhost:8080
api.url=http://localhost:8080/api
timeout=30000
headless=false
```

### src/test/resources/config-staging.properties

```properties
base.url=https://staging.app.com
api.url=https://staging.app.com/api
timeout=60000
headless=true
```

### ConfigManager.java

```java
public final class ConfigManager {
    private static final Properties props = new Properties();
    private static ConfigManager instance;

    private ConfigManager() {
        String env = resolve("TEST_ENV", "local");
        String file = "config-" + env + ".properties";
        try (InputStream is = getClass().getClassLoader().getResourceAsStream(file)) {
            if (is != null) props.load(is);
        } catch (IOException e) {
            throw new UncheckedIOException(e);
        }
    }

    public static synchronized ConfigManager get() {
        if (instance == null) instance = new ConfigManager();
        return instance;
    }

    /** Override hierarchy: system property → env var → properties file → default */
    public String resolve(String key, String defaultValue) {
        String sysProp = System.getProperty(key);
        if (sysProp != null) return sysProp;

        String envVar = System.getenv(key);
        if (envVar != null) return envVar;

        return props.getProperty(key, defaultValue);
    }

    public String baseUrl()  { return resolve("base.url", "http://localhost:8080"); }
    public int    timeout()  { return Integer.parseInt(resolve("timeout", "30000")); }
    public boolean headless() { return Boolean.parseBoolean(resolve("headless", "true")); }
}
```

### CLI override (Maven)

```bash
mvn test -DTEST_ENV=staging -Dbase.url=https://custom.url
```

---

## Python — python-dotenv + pydantic

### .env.local

```ini
TEST_ENV=local
BASE_URL=http://localhost:3000
API_URL=http://localhost:3000/api
TIMEOUT=30000
HEADLESS=false
```

### config.py

```python
from pydantic_settings import BaseSettings
from pydantic import Field
from pathlib import Path
from dotenv import load_dotenv
import os

env = os.getenv("TEST_ENV", "local")
load_dotenv(Path(f".env.{env}"))
load_dotenv(".env")  # fallback, no override

class Config(BaseSettings):
    test_env: str = Field(default="local")
    base_url: str = Field(default="http://localhost:3000")
    api_url: str = Field(default="http://localhost:3000/api")
    timeout: int = Field(default=30000)
    headless: bool = Field(default=True)
    # secrets — injected in CI, optional locally
    api_token: str | None = Field(default=None)
    db_connection: str | None = Field(default=None)

    class Config:
        env_file_encoding = "utf-8"

config = Config()
```

### Usage in tests

```python
from config import config

def test_dashboard(page):
    page.goto(f"{config.base_url}/dashboard")
    assert page.title() != ""
```

### CLI override

```bash
TEST_ENV=staging BASE_URL=https://custom.url pytest
```

---

## Secrets Handling

**Rule: secrets never exist in source control.**

| Where | How |
|---|---|
| Local dev | `.env.local` in `.gitignore`, or OS keychain |
| CI/CD | Repository secrets → injected as env vars |
| Docker | `--env-file` or orchestrator secrets (K8s secrets, AWS SSM) |

### .gitignore (mandatory)

```gitignore
.env
.env.*
!.env.example
*.pem
*.key
credentials.*
```

### .env.example (committed, no real values)

```ini
TEST_ENV=local
BASE_URL=http://localhost:3000
API_TOKEN=<injected-by-ci>
DB_CONNECTION=<injected-by-ci>
```

---

## Config File Format Decision Matrix

| Format | Best For | Tooling |
|---|---|---|
| `.env` | Simple key-value, 12-factor apps | dotenv (all languages) |
| `.properties` | Java ecosystem | Built-in `java.util.Properties` |
| JSON | Structured config, TypeScript | Native `JSON.parse` |
| YAML | Complex nested config, k8s | PyYAML, SnakeYAML, js-yaml |

**TAFF default**: `.env` for flat config + JSON/YAML for complex structures (fixture data, browser matrix).

---

## Validation Checklist

Every generated framework MUST:

- [ ] Fail fast with clear error if required config is missing
- [ ] Log resolved config at DEBUG level on startup (mask secrets)
- [ ] Support env-file switching via `TEST_ENV`
- [ ] Allow env var and CLI overrides without file changes
- [ ] Never commit secrets — `.gitignore` enforced
- [ ] Ship a `.env.example` with placeholder values
