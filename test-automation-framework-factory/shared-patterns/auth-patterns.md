# Auth Patterns

Authentication handling for test frameworks. Auth is the most common cross-cutting concern — every test needs it, and getting it wrong causes cascading failures.

## Core Principles

1. **Authenticate via API, not UI** — logging in through the UI is slow and fragile
2. **Cache tokens per session** — don't re-authenticate before every test
3. **Isolate auth per worker** — parallel tests need separate sessions
4. **Never hardcode credentials** — inject via environment variables / CI secrets

---

## Token-Based Auth (JWT / Bearer)

Acquire a token once, reuse across tests, refresh when expired.

### TypeScript (Playwright)

```typescript
import { test as base, APIRequestContext } from '@playwright/test';

type AuthFixtures = {
  authToken: string;
  authenticatedRequest: APIRequestContext;
};

export const test = base.extend<{}, AuthFixtures>({
  authToken: [async ({ playwright }, use) => {
    const api = await playwright.request.newContext();
    const response = await api.post('/api/auth/login', {
      data: {
        email: process.env.TEST_USER_EMAIL,
        password: process.env.TEST_USER_PASSWORD,
      },
    });
    const { token } = await response.json();
    await use(token);
    await api.dispose();
  }, { scope: 'worker' }],

  authenticatedRequest: [async ({ playwright, authToken }, use) => {
    const api = await playwright.request.newContext({
      extraHTTPHeaders: { Authorization: `Bearer ${authToken}` },
    });
    await use(api);
    await api.dispose();
  }, { scope: 'worker' }],
});
```

### Java

```java
public class AuthManager {
    private static final ThreadLocal<String> token = new ThreadLocal<>();
    private static final ThreadLocal<Instant> expiry = new ThreadLocal<>();

    public static String getToken() {
        if (token.get() == null || Instant.now().isAfter(expiry.get())) {
            refreshToken();
        }
        return token.get();
    }

    private static void refreshToken() {
        String response = given()
            .contentType(ContentType.JSON)
            .body(Map.of(
                "email", ConfigManager.get().resolve("TEST_USER_EMAIL", ""),
                "password", ConfigManager.get().resolve("TEST_USER_PASSWORD", "")
            ))
            .post(ConfigManager.get().baseUrl() + "/api/auth/login")
            .then().statusCode(200)
            .extract().body().asString();

        JsonObject json = JsonParser.parseString(response).getAsJsonObject();
        token.set(json.get("token").getAsString());
        expiry.set(Instant.now().plusSeconds(3500));  // refresh 100s before 1hr expiry
    }
}
```

### Python

```python
import requests
from functools import lru_cache
from config import config

class AuthManager:
    _token: str | None = None
    _expiry: float = 0

    @classmethod
    def get_token(cls) -> str:
        if cls._token is None or time.time() > cls._expiry:
            cls._refresh()
        return cls._token

    @classmethod
    def _refresh(cls):
        resp = requests.post(f"{config.api_url}/auth/login", json={
            "email": config.test_user_email,
            "password": config.test_user_password,
        })
        resp.raise_for_status()
        data = resp.json()
        cls._token = data["token"]
        cls._expiry = time.time() + 3500

    @classmethod
    def get_session(cls) -> requests.Session:
        session = requests.Session()
        session.headers["Authorization"] = f"Bearer {cls.get_token()}"
        return session
```

---

## Session-Based Auth (Cookies)

Login via API and reuse cookies/session state across tests.

### Playwright — storageState

```typescript
// auth.setup.ts — runs once before all tests
import { test as setup } from '@playwright/test';

const authFile = 'playwright/.auth/user.json';

setup('authenticate', async ({ page }) => {
  await page.goto('/login');
  await page.fill('#email', process.env.TEST_USER_EMAIL!);
  await page.fill('#password', process.env.TEST_USER_PASSWORD!);
  await page.click('#login-btn');
  await page.waitForURL('/dashboard');

  await page.context().storageState({ path: authFile });
});
```

```typescript
// playwright.config.ts
export default defineConfig({
  projects: [
    { name: 'auth-setup', testMatch: /auth\.setup\.ts/ },
    {
      name: 'tests',
      dependencies: ['auth-setup'],
      use: { storageState: 'playwright/.auth/user.json' },
    },
  ],
});
```

Every test in the `tests` project starts already logged in — no login step needed.

### Selenium — reuse cookies

```java
public class SessionManager {
    private static Set<Cookie> cachedCookies;

    public static void loginAndCacheCookies(WebDriver driver) {
        driver.get(ConfigManager.get().baseUrl() + "/login");
        driver.findElement(By.id("email")).sendKeys(System.getenv("TEST_USER_EMAIL"));
        driver.findElement(By.id("password")).sendKeys(System.getenv("TEST_USER_PASSWORD"));
        driver.findElement(By.id("login-btn")).click();
        new WebDriverWait(driver, Duration.ofSeconds(10))
            .until(ExpectedConditions.urlContains("/dashboard"));
        cachedCookies = driver.manage().getCookies();
    }

    public static void restoreSession(WebDriver driver) {
        driver.get(ConfigManager.get().baseUrl());
        cachedCookies.forEach(cookie -> driver.manage().addCookie(cookie));
        driver.navigate().refresh();
    }
}
```

### Python — requests.Session

```python
import requests
from config import config

class SessionAuth:
    _session: requests.Session | None = None

    @classmethod
    def get_session(cls) -> requests.Session:
        if cls._session is None:
            cls._session = requests.Session()
            cls._session.post(f"{config.base_url}/api/auth/login", json={
                "email": config.test_user_email,
                "password": config.test_user_password,
            })
        return cls._session
```

---

## Multi-User Testing

Test role-based access with user pools.

### User pool definition

```typescript
// test-users.ts
export const TEST_USERS = {
  admin: {
    email: process.env.ADMIN_EMAIL!,
    password: process.env.ADMIN_PASSWORD!,
    role: 'admin',
  },
  editor: {
    email: process.env.EDITOR_EMAIL!,
    password: process.env.EDITOR_PASSWORD!,
    role: 'editor',
  },
  viewer: {
    email: process.env.VIEWER_EMAIL!,
    password: process.env.VIEWER_PASSWORD!,
    role: 'viewer',
  },
} as const;
```

### Role-specific storage states (Playwright)

```typescript
// Generate auth state per role
for (const [role, creds] of Object.entries(TEST_USERS)) {
  setup(`authenticate as ${role}`, async ({ page }) => {
    await page.goto('/login');
    await page.fill('#email', creds.email);
    await page.fill('#password', creds.password);
    await page.click('#login-btn');
    await page.waitForURL('/dashboard');
    await page.context().storageState({ path: `playwright/.auth/${role}.json` });
  });
}

// playwright.config.ts — separate project per role
export default defineConfig({
  projects: [
    { name: 'auth-setup', testMatch: /auth\.setup\.ts/ },
    {
      name: 'admin-tests',
      testMatch: /admin\//,
      dependencies: ['auth-setup'],
      use: { storageState: 'playwright/.auth/admin.json' },
    },
    {
      name: 'viewer-tests',
      testMatch: /viewer\//,
      dependencies: ['auth-setup'],
      use: { storageState: 'playwright/.auth/viewer.json' },
    },
  ],
});
```

---

## Auth in Parallel Execution

Each parallel worker MUST have its own auth session:

| Language | Isolation Mechanism |
|---|---|
| Java | `ThreadLocal<String>` for tokens |
| Playwright | Worker-scoped fixtures (scope: 'worker') |
| Python (xdist) | Session-scoped fixture per worker |

```python
# Python — per-worker auth with xdist
@pytest.fixture(scope="session")
def auth_token():
    resp = requests.post(f"{config.api_url}/auth/login", json={
        "email": config.test_user_email,
        "password": config.test_user_password,
    })
    return resp.json()["token"]
```

With `pytest-xdist`, `scope="session"` means per-worker-session (each worker gets its own).

---

## OAuth / OIDC Handling

OAuth flows involve browser redirects that complicate automation. Strategies:

### Strategy 1: Direct token exchange (preferred)

If the identity provider supports it, use the Resource Owner Password Grant or a test-specific client credentials flow:

```typescript
async function getOAuthToken(): Promise<string> {
  const response = await fetch(`${IDP_URL}/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'password',
      client_id: process.env.OAUTH_CLIENT_ID!,
      client_secret: process.env.OAUTH_CLIENT_SECRET!,
      username: process.env.TEST_USER_EMAIL!,
      password: process.env.TEST_USER_PASSWORD!,
      scope: 'openid profile email',
    }),
  });
  const { access_token } = await response.json();
  return access_token;
}
```

### Strategy 2: Intercept redirect (Playwright)

```typescript
setup('oauth login', async ({ page }) => {
  await page.goto('/login');
  await page.click('#login-with-sso');

  // IDP login page (redirected)
  await page.fill('#username', process.env.TEST_USER_EMAIL!);
  await page.fill('#password', process.env.TEST_USER_PASSWORD!);
  await page.click('#submit');

  // Wait for redirect back to app
  await page.waitForURL('**/dashboard');
  await page.context().storageState({ path: 'playwright/.auth/oauth-user.json' });
});
```

---

## API Key Management

```typescript
// Keys loaded from environment, never from code
const apiKey = process.env.API_KEY;
if (!apiKey) throw new Error('API_KEY environment variable is required');

const response = await request.get('/api/data', {
  headers: { 'X-API-Key': apiKey },
});
```

```yaml
# CI — inject from secrets
env:
  API_KEY: ${{ secrets.API_KEY }}
  OAUTH_CLIENT_SECRET: ${{ secrets.OAUTH_CLIENT_SECRET }}
```

---

## Auth Bypass for Non-Auth Tests

When testing features unrelated to auth, skip login entirely:

### Test-mode endpoint (backend provides a bypass)

```typescript
await request.post('/api/test/impersonate', {
  data: { userId: 'test-user-id' },
  headers: { 'X-Test-Secret': process.env.TEST_BYPASS_SECRET },
});
```

### Mock auth middleware

```typescript
// For unit/component tests, mock the auth layer
vi.mock('../auth', () => ({
  getCurrentUser: () => ({ id: 'test-user', role: 'admin' }),
  isAuthenticated: () => true,
}));
```

---

## Checklist

Every generated framework MUST:

- [ ] Authenticate via API (not UI) as the default strategy
- [ ] Cache auth tokens/sessions per worker (not per test)
- [ ] Support multiple user roles with separate auth states
- [ ] Inject credentials via environment variables only
- [ ] Handle token refresh for long-running suites
- [ ] Document OAuth/SSO handling if applicable
- [ ] Include auth bypass option for non-auth-focused tests
