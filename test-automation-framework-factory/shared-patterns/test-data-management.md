# Test Data Management Pattern

Strategies for creating, isolating, and cleaning up test data across all TAFF-generated frameworks. Tests that share or leak data are the #1 cause of flakiness.

## Core Principles

1. **Each test owns its data** — create what you need, clean what you created
2. **No test depends on another test's data** — run in any order, any subset
3. **API over UI for data setup** — 10x faster, more reliable
4. **Deterministic but unique** — predictable structure, unique identifiers

---

## Factory Pattern — Dynamic Test Data

Generate unique, realistic test data per test run using faker libraries.

### TypeScript (faker.js)

```typescript
import { faker } from '@faker-js/faker';

export class UserFactory {
  static create(overrides: Partial<User> = {}): User {
    return {
      email: faker.internet.email({ provider: 'testmail.com' }),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      password: faker.internet.password({ length: 12 }),
      phone: faker.phone.number(),
      ...overrides,
    };
  }

  static createAdmin(overrides: Partial<User> = {}): User {
    return this.create({ role: 'admin', ...overrides });
  }

  static createBatch(count: number): User[] {
    return Array.from({ length: count }, () => this.create());
  }
}

// Usage in tests
const user = UserFactory.create({ firstName: 'TestUser' });
const admin = UserFactory.createAdmin();
```

### Java (javafaker)

```java
public class UserFactory {
    private static final Faker faker = new Faker();

    public static User create() {
        return User.builder()
            .email(faker.internet().emailAddress("test"))
            .firstName(faker.name().firstName())
            .lastName(faker.name().lastName())
            .password(faker.internet().password(12, 20))
            .phone(faker.phoneNumber().phoneNumber())
            .build();
    }

    public static User createWithRole(String role) {
        User user = create();
        user.setRole(role);
        return user;
    }
}
```

### Python (faker)

```python
from faker import Faker
from dataclasses import dataclass, field

fake = Faker()

@dataclass
class UserFactory:
    email: str = field(default_factory=lambda: fake.email())
    first_name: str = field(default_factory=lambda: fake.first_name())
    last_name: str = field(default_factory=lambda: fake.last_name())
    password: str = field(default_factory=lambda: fake.password(length=12))

    @classmethod
    def create(cls, **overrides):
        return cls(**{**cls().__dict__, **overrides})

    @classmethod
    def create_admin(cls, **overrides):
        return cls.create(role="admin", **overrides)

# Usage
user = UserFactory.create(first_name="TestUser")
```

---

## Fixture Files — Static Test Data

Use for stable reference data that doesn't change between runs.

### Directory structure

```
test-data/
  ├── users/
  │   ├── valid-users.json
  │   └── invalid-users.csv
  ├── products/
  │   └── catalog.yaml
  └── schemas/
      └── api-responses.json
```

### TypeScript — load fixtures

```typescript
import { readFileSync } from 'fs';
import path from 'path';

export function loadFixture<T>(relativePath: string): T {
  const fullPath = path.resolve(__dirname, '../test-data', relativePath);
  const raw = readFileSync(fullPath, 'utf-8');
  return JSON.parse(raw) as T;
}

// Usage
const users = loadFixture<User[]>('users/valid-users.json');
```

### Python — load fixtures

```python
import json
import csv
from pathlib import Path

FIXTURE_DIR = Path(__file__).parent / "test-data"

def load_json(relative_path: str):
    return json.loads((FIXTURE_DIR / relative_path).read_text())

def load_csv(relative_path: str) -> list[dict]:
    with open(FIXTURE_DIR / relative_path) as f:
        return list(csv.DictReader(f))

# Usage
users = load_json("users/valid-users.json")
```

---

## API-Based Data Setup

Create test data via API calls, not UI interactions. Faster, more reliable, skips UI fragility.

### TypeScript

```typescript
import { APIRequestContext } from '@playwright/test';

export class TestDataApi {
  constructor(private api: APIRequestContext) {}

  async createUser(data: Partial<User> = {}): Promise<User & { id: string }> {
    const user = UserFactory.create(data);
    const response = await this.api.post('/api/users', { data: user });
    expect(response.ok()).toBeTruthy();
    return response.json();
  }

  async deleteUser(id: string): Promise<void> {
    await this.api.delete(`/api/users/${id}`);
  }

  async createProduct(data: Partial<Product> = {}): Promise<Product> {
    const product = ProductFactory.create(data);
    const response = await this.api.post('/api/products', { data: product });
    return response.json();
  }
}

// Usage in test
test('user can edit profile', async ({ page, request }) => {
  const api = new TestDataApi(request);
  const user = await api.createUser();

  await page.goto(`/users/${user.id}/edit`);
  // ... test logic ...

  await api.deleteUser(user.id);  // cleanup
});
```

### Python

```python
import requests
from config import config

class TestDataApi:
    def __init__(self):
        self.base = config.api_url
        self.session = requests.Session()
        self.session.headers["Authorization"] = f"Bearer {config.api_token}"

    def create_user(self, **overrides) -> dict:
        user = UserFactory.create(**overrides)
        resp = self.session.post(f"{self.base}/users", json=user.__dict__)
        resp.raise_for_status()
        return resp.json()

    def delete_user(self, user_id: str):
        self.session.delete(f"{self.base}/users/{user_id}")
```

---

## Database Seeding and Teardown

For integration tests that need direct database access.

### Transaction rollback (preferred)

Wrap each test in a transaction, roll back after — zero residual data.

```python
# Python — pytest + SQLAlchemy
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import Session

@pytest.fixture
def db_session():
    engine = create_engine(config.db_connection)
    connection = engine.connect()
    transaction = connection.begin()
    session = Session(bind=connection)

    yield session

    session.close()
    transaction.rollback()
    connection.close()
```

### Java — Spring @Transactional

```java
@SpringBootTest
@Transactional  // auto-rollback after each test
public class UserRepositoryTest {
    @Autowired private UserRepository repo;

    @Test
    void createsUser() {
        User user = UserFactory.create();
        User saved = repo.save(user);
        assertThat(saved.getId()).isNotNull();
        // rolled back automatically — no cleanup needed
    }
}
```

---

## Data Isolation Per Test

| Strategy | How | Best For |
|---|---|---|
| Unique identifiers | Prefix/suffix with test run ID | API/UI tests |
| Transaction rollback | Wrap in transaction, rollback | Database/integration tests |
| Dedicated namespace | Per-test schema or tenant | Multi-tenant apps |
| Ephemeral environment | Spin up fresh instance per suite | Full isolation (expensive) |

### Unique identifier pattern

```typescript
const testRunId = `test-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

const user = UserFactory.create({
  email: `${testRunId}@testmail.com`,
  firstName: `Test_${testRunId}`,
});
```

---

## Cleanup Strategies

### After-each cleanup (recommended)

```typescript
test.describe('Product management', () => {
  const createdIds: string[] = [];

  test.afterEach(async ({ request }) => {
    const api = new TestDataApi(request);
    for (const id of createdIds) {
      await api.deleteProduct(id).catch(() => {});
    }
    createdIds.length = 0;
  });

  test('creates a product', async ({ request }) => {
    const api = new TestDataApi(request);
    const product = await api.createProduct();
    createdIds.push(product.id);
    // ... assertions ...
  });
});
```

### Global teardown (safety net)

```typescript
// global-teardown.ts
export default async function globalTeardown() {
  const api = new TestDataApi(await request.newContext());
  await api.cleanupTestData({ prefix: 'test-' });
}
```

---

## Environment-Specific Data

| Environment | Data Strategy |
|---|---|
| Local | Factories generate everything, seeded DB optional |
| Staging | API-created data with cleanup, shared reference data exists |
| Prod | Read-only smoke tests, no data creation |

---

## Checklist

Every generated framework MUST:

- [ ] Include a factory class per domain entity
- [ ] Support fixture file loading (JSON at minimum)
- [ ] Use API-based setup for UI tests (not UI-based setup)
- [ ] Clean up created data after each test
- [ ] Generate unique identifiers per test run
- [ ] Never rely on pre-existing data that other tests may modify
- [ ] Include a global teardown safety net
