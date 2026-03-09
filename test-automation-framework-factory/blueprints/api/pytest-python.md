# Blueprint: pytest + Python (requests) — API Testing

> **Tool**: pytest + requests | **Language**: Python 3.11+ | **Domain**: REST API Testing
> **Validation**: Pydantic v2 | **Parallel**: pytest-xdist | **Reporting**: Allure + pytest-html
> **Last Updated**: 2026-03-09

---

## 1. Overview

This blueprint produces a production-ready REST API test automation framework using pytest with the `requests` library. The architecture leverages pytest's powerful fixture system with `conftest.py` scoping for setup/teardown at session, module, class, and function levels. Pydantic v2 provides runtime schema validation, and `factory_boy` generates dynamic test data.

### Target Use Cases

- REST API regression testing (CRUD, auth, error handling, edge cases)
- Schema/contract validation with Pydantic models
- Data-driven testing with `pytest.mark.parametrize`
- Multi-environment execution (local, staging, production)
- Smoke/regression suite organization with custom markers

### Key Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| HTTP client | `requests.Session` | Battle-tested, session-based (keeps cookies/auth), connection pooling |
| Test runner | pytest | De-facto Python standard; fixtures, markers, parametrize, plugins |
| Schema validation | Pydantic v2 | Python-native type validation; excellent error messages; auto-generates JSON Schema |
| Test data | `factory_boy` + Faker | Declarative factories; lazy attributes; sequences; traits |
| Parallel execution | `pytest-xdist` | Distributes tests across workers; `--dist loadfile` for balanced distribution |
| Reporting | `allure-pytest` + `pytest-html` | Allure for rich interactive reports; pytest-html for lightweight CI summaries |
| Config | `python-dotenv` + Pydantic `BaseSettings` | Type-safe config with environment variable overrides and `.env` file support |
| Markers | Custom (`smoke`, `regression`, `critical`) | Selective execution; organized test suites without separate config files |

---

## 2. Prerequisites

### System Requirements

| Requirement | Version | Notes |
|-------------|---------|-------|
| Python | 3.11+ | Type hint improvements, `tomllib` built-in |
| pip / poetry | Latest | poetry preferred for lockfile + virtual env management |
| pytest | 8+ | Latest features and plugin compatibility |
| allure-commandline | Latest | For generating Allure HTML reports |

### Installation

```bash
# With poetry (recommended)
poetry init
poetry add --group dev pytest pytest-xdist pytest-html pytest-ordering
poetry add --group dev allure-pytest
poetry add --group dev requests pydantic python-dotenv
poetry add --group dev factory-boy faker
poetry add --group dev httpx  # async alternative (optional)

# With pip
pip install pytest pytest-xdist pytest-html allure-pytest
pip install requests pydantic python-dotenv
pip install factory-boy faker
```

### requirements-dev.txt

```
pytest>=8.0.0
pytest-xdist>=3.5.0
pytest-html>=4.1.0
pytest-ordering>=0.6
allure-pytest>=2.13.0
requests>=2.31.0
pydantic>=2.6.0
pydantic-settings>=2.1.0
python-dotenv>=1.0.0
factory-boy>=3.3.0
faker>=22.0.0
```

---

## 3. Architecture

### Folder Structure

```
project-root/
├── pyproject.toml                     # Project config + pytest settings
├── requirements-dev.txt               # Pip fallback
├── .env.local
├── .env.staging
├── .env.production
│
├── src/
│   ├── __init__.py
│   │
│   ├── client/
│   │   ├── __init__.py
│   │   ├── api_client.py              # requests.Session wrapper with auth + logging
│   │   ├── request_builder.py         # Fluent request construction
│   │   └── response_wrapper.py        # Typed response with validation helpers
│   │
│   ├── auth/
│   │   ├── __init__.py
│   │   ├── auth_manager.py            # Token acquire/cache/refresh
│   │   └── strategies.py              # JWT, Basic, API Key strategies
│   │
│   ├── models/
│   │   ├── __init__.py
│   │   ├── user.py                    # Pydantic models for User endpoints
│   │   ├── auth.py                    # Pydantic models for Auth endpoints
│   │   ├── error.py                   # Error response models
│   │   └── common.py                  # Shared models (pagination, timestamps)
│   │
│   ├── data/
│   │   ├── __init__.py
│   │   ├── factories.py               # factory_boy factories
│   │   └── providers.py               # Custom Faker providers
│   │
│   ├── config/
│   │   ├── __init__.py
│   │   ├── settings.py                # Pydantic BaseSettings config
│   │   └── constants.py               # API paths, timeouts
│   │
│   └── utils/
│       ├── __init__.py
│       ├── logger.py                  # Structured logging setup
│       ├── assertions.py              # Custom assertion helpers with allure steps
│       ├── allure_helpers.py          # Allure step/attachment decorators
│       └── cleanup.py                 # Resource cleanup tracker
│
├── tests/
│   ├── __init__.py
│   ├── conftest.py                    # Root conftest: session-scoped fixtures
│   │
│   ├── auth/
│   │   ├── __init__.py
│   │   ├── conftest.py                # Auth-specific fixtures
│   │   ├── test_login.py
│   │   ├── test_token_refresh.py
│   │   └── test_permissions.py
│   │
│   ├── users/
│   │   ├── __init__.py
│   │   ├── conftest.py                # User-specific fixtures (create/cleanup user)
│   │   ├── test_create_user.py
│   │   ├── test_get_user.py
│   │   ├── test_update_user.py
│   │   ├── test_delete_user.py
│   │   └── test_list_users.py
│   │
│   ├── errors/
│   │   ├── __init__.py
│   │   ├── test_validation_errors.py
│   │   ├── test_not_found.py
│   │   └── test_rate_limiting.py
│   │
│   └── schemas/
│       ├── __init__.py
│       └── test_contract_validation.py
│
├── .github/
│   └── workflows/
│       └── api-tests.yml
│
├── docker/
│   ├── Dockerfile
│   └── docker-compose.yml
│
└── reports/                           # Gitignored
    ├── allure-results/
    └── html/
```

### Dependency Graph

```
tests/**/*.py
├── conftest.py (root) → src/client/api_client.py, src/config/settings.py
│   └── conftest.py (per-module) → src/data/factories.py, src/auth/auth_manager.py
├── src/models/*.py (Pydantic validation)
└── src/utils/assertions.py, src/utils/allure_helpers.py
```

---

## 4. Core Patterns

### 4.1 Pydantic BaseSettings Configuration

```python
# src/config/settings.py
from pydantic_settings import BaseSettings
from pydantic import Field
from functools import lru_cache
import os

class Settings(BaseSettings):
    api_base_url: str = Field(default="http://localhost:3000")
    test_user_email: str = Field(default="test@example.com")
    test_user_password: str = Field(default="password")
    admin_email: str = Field(default="admin@example.com")
    admin_password: str = Field(default="admin")
    request_timeout: int = Field(default=10)
    retry_count: int = Field(default=2)
    environment: str = Field(default="local")

    model_config = {
        "env_file": f".env.{os.getenv('TEST_ENV', 'local')}",
        "env_file_encoding": "utf-8",
        "extra": "ignore",
    }

@lru_cache
def get_settings() -> Settings:
    return Settings()
```

### 4.2 API Client (requests.Session Wrapper)

```python
# src/client/api_client.py
import requests
import logging
import time
from typing import Any, Optional
from src.config.settings import get_settings
from src.auth.auth_manager import AuthManager

logger = logging.getLogger(__name__)

class ApiClient:
    def __init__(self, base_url: Optional[str] = None, auth: bool = True):
        self.base_url = base_url or get_settings().api_base_url
        self.session = requests.Session()
        self.session.headers.update({
            "Content-Type": "application/json",
            "Accept": "application/json",
        })
        self._auth_manager = AuthManager() if auth else None
        self.session.timeout = get_settings().request_timeout

    def _ensure_auth(self) -> None:
        if self._auth_manager:
            token = self._auth_manager.get_token()
            self.session.headers["Authorization"] = f"Bearer {token}"

    def get(self, path: str, params: Optional[dict] = None, **kwargs) -> requests.Response:
        return self._request("GET", path, params=params, **kwargs)

    def post(self, path: str, json: Any = None, **kwargs) -> requests.Response:
        return self._request("POST", path, json=json, **kwargs)

    def put(self, path: str, json: Any = None, **kwargs) -> requests.Response:
        return self._request("PUT", path, json=json, **kwargs)

    def patch(self, path: str, json: Any = None, **kwargs) -> requests.Response:
        return self._request("PATCH", path, json=json, **kwargs)

    def delete(self, path: str, **kwargs) -> requests.Response:
        return self._request("DELETE", path, **kwargs)

    def _request(self, method: str, path: str, **kwargs) -> requests.Response:
        self._ensure_auth()
        url = f"{self.base_url}{path}"
        start = time.time()

        logger.info(f"→ {method} {url}")
        if "json" in kwargs and kwargs["json"]:
            logger.debug(f"  Body: {kwargs['json']}")

        response = self.session.request(method, url, **kwargs)
        duration_ms = int((time.time() - start) * 1000)

        log_level = logging.WARNING if response.status_code >= 400 else logging.INFO
        logger.log(log_level, f"← {response.status_code} {method} {url} ({duration_ms}ms)")

        return response

    def close(self) -> None:
        self.session.close()
```

### 4.3 Auth Manager

```python
# src/auth/auth_manager.py
import requests
import time
import threading
from src.config.settings import get_settings

class AuthManager:
    _lock = threading.Lock()

    def __init__(self):
        self._token: str | None = None
        self._expiry: float = 0

    def get_token(self) -> str:
        if self._token and time.time() < self._expiry - 30:
            return self._token

        with self._lock:
            if self._token and time.time() < self._expiry - 30:
                return self._token
            return self._acquire_token()

    def _acquire_token(self) -> str:
        settings = get_settings()
        response = requests.post(
            f"{settings.api_base_url}/auth/login",
            json={"email": settings.test_user_email, "password": settings.test_user_password},
        )
        response.raise_for_status()
        data = response.json()
        self._token = data["accessToken"]
        self._expiry = time.time() + data.get("expiresIn", 3600)
        return self._token

    def invalidate(self) -> None:
        self._token = None
        self._expiry = 0
```

### 4.4 Pydantic Schema Validation

```python
# src/models/user.py
from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from enum import Enum

class UserRole(str, Enum):
    USER = "user"
    ADMIN = "admin"
    MODERATOR = "moderator"

class UserResponse(BaseModel):
    id: str
    email: EmailStr
    first_name: str = Field(min_length=1)
    last_name: str = Field(min_length=1)
    role: UserRole
    created_at: datetime
    updated_at: datetime

class CreateUserRequest(BaseModel):
    email: EmailStr
    first_name: str = Field(min_length=1)
    last_name: str = Field(min_length=1)
    password: str = Field(min_length=8)
    role: UserRole = UserRole.USER

class UserListResponse(BaseModel):
    data: list[UserResponse]
    pagination: "PaginationMeta"

class PaginationMeta(BaseModel):
    page: int = Field(gt=0)
    page_size: int = Field(gt=0)
    total_count: int = Field(ge=0)
    total_pages: int = Field(ge=0)
```

```python
# src/models/error.py
from pydantic import BaseModel
from typing import Optional

class ErrorDetail(BaseModel):
    field: str
    message: str

class ErrorBody(BaseModel):
    code: str
    message: str
    details: Optional[list[ErrorDetail]] = None

class ErrorResponse(BaseModel):
    error: ErrorBody
```

### 4.5 Conftest.py — Fixture Scoping

```python
# tests/conftest.py (root)
import pytest
from src.client.api_client import ApiClient
from src.config.settings import get_settings

@pytest.fixture(scope="session")
def settings():
    """Session-scoped settings — loaded once for the entire test run."""
    return get_settings()

@pytest.fixture(scope="session")
def api(settings) -> ApiClient:
    """Session-scoped authenticated API client — reuses connection pool."""
    client = ApiClient(base_url=settings.api_base_url)
    yield client
    client.close()

@pytest.fixture(scope="session")
def unauth_api(settings) -> ApiClient:
    """Session-scoped unauthenticated API client."""
    client = ApiClient(base_url=settings.api_base_url, auth=False)
    yield client
    client.close()

@pytest.fixture(scope="session")
def admin_api(settings) -> ApiClient:
    """Session-scoped admin API client."""
    client = ApiClient(base_url=settings.api_base_url)
    # Override with admin credentials
    client._auth_manager._acquire_admin_token()
    yield client
    client.close()

def pytest_configure(config):
    """Register custom markers."""
    config.addinivalue_line("markers", "smoke: Smoke test subset")
    config.addinivalue_line("markers", "regression: Full regression suite")
    config.addinivalue_line("markers", "critical: Business-critical tests")
    config.addinivalue_line("markers", "slow: Tests that take >5 seconds")
```

```python
# tests/users/conftest.py
import pytest
from src.data.factories import UserFactory

@pytest.fixture
def user_payload():
    """Generate a fresh user payload for each test."""
    return UserFactory.build_payload()

@pytest.fixture
def created_user(api, user_payload):
    """Create a user via API and clean up after test."""
    response = api.post("/api/users", json=user_payload)
    assert response.status_code == 201
    user_data = response.json()
    yield user_data
    api.delete(f"/api/users/{user_data['id']}")
```

### 4.6 Factory Boy Factories

```python
# src/data/factories.py
import factory
from faker import Faker
from src.models.user import CreateUserRequest, UserRole

fake = Faker()

class UserFactory(factory.Factory):
    class Meta:
        model = dict

    email = factory.LazyFunction(fake.email)
    first_name = factory.LazyFunction(fake.first_name)
    last_name = factory.LazyFunction(fake.last_name)
    password = factory.LazyFunction(lambda: f"Test@{fake.password(length=10)}")
    role = UserRole.USER

    @classmethod
    def build_payload(cls, **kwargs) -> dict:
        """Build a payload dict suitable for API requests."""
        return cls.build(**kwargs)

    @classmethod
    def build_admin_payload(cls, **kwargs) -> dict:
        return cls.build(role=UserRole.ADMIN, **kwargs)

    @classmethod
    def build_batch_payloads(cls, count: int, **kwargs) -> list[dict]:
        return cls.build_batch(count, **kwargs)


class ProductFactory(factory.Factory):
    class Meta:
        model = dict

    name = factory.LazyFunction(fake.catch_phrase)
    description = factory.LazyFunction(lambda: fake.text(max_nb_chars=200))
    price = factory.LazyFunction(lambda: round(fake.pyfloat(min_value=1, max_value=999), 2))
    sku = factory.Sequence(lambda n: f"SKU-{n:06d}")
```

### 4.7 Test Examples

```python
# tests/users/test_create_user.py
import pytest
import allure
from src.models.user import UserResponse
from src.models.error import ErrorResponse
from src.data.factories import UserFactory

@allure.suite("Users")
@allure.feature("Create User")
class TestCreateUser:

    @pytest.mark.smoke
    @pytest.mark.critical
    @allure.severity(allure.severity_level.CRITICAL)
    @allure.title("Create user with valid data")
    def test_create_user_success(self, api, user_payload):
        response = api.post("/api/users", json=user_payload)

        assert response.status_code == 201
        user = UserResponse.model_validate(response.json())
        assert user.email == user_payload["email"]
        assert user.first_name == user_payload["first_name"]

        # Cleanup
        api.delete(f"/api/users/{user.id}")

    @allure.title("Reject missing required fields")
    def test_create_user_missing_fields(self, api):
        response = api.post("/api/users", json={"email": "partial@test.com"})

        assert response.status_code == 400
        error = ErrorResponse.model_validate(response.json())
        assert error.error.details is not None
        field_names = [d.field for d in error.error.details]
        assert "first_name" in field_names
        assert "last_name" in field_names
        assert "password" in field_names

    @allure.title("Reject duplicate email")
    def test_create_user_duplicate_email(self, api, created_user):
        payload = UserFactory.build_payload(email=created_user["email"])
        response = api.post("/api/users", json=payload)

        assert response.status_code == 409
        error = ErrorResponse.model_validate(response.json())
        assert error.error.code == "DUPLICATE_EMAIL"

    @pytest.mark.parametrize("invalid_email", [
        "not-an-email",
        "@missing-local.com",
        "missing-domain@",
        "",
        "spaces in@email.com",
    ])
    @allure.title("Reject invalid email format: {invalid_email}")
    def test_create_user_invalid_email(self, api, user_payload, invalid_email):
        user_payload["email"] = invalid_email
        response = api.post("/api/users", json=user_payload)

        assert response.status_code == 400

    @pytest.mark.parametrize("weak_password", ["short", "1234567", ""])
    @allure.title("Reject weak password: {weak_password}")
    def test_create_user_weak_password(self, api, user_payload, weak_password):
        user_payload["password"] = weak_password
        response = api.post("/api/users", json=user_payload)

        assert response.status_code == 400

    @allure.title("Response time within acceptable threshold")
    def test_create_user_response_time(self, api, user_payload):
        response = api.post("/api/users", json=user_payload)

        assert response.status_code == 201
        assert response.elapsed.total_seconds() < 2.0

        api.delete(f"/api/users/{response.json()['id']}")
```

```python
# tests/users/test_list_users.py
import pytest
import allure
from src.models.user import UserListResponse

@allure.suite("Users")
@allure.feature("List Users")
class TestListUsers:

    @pytest.mark.smoke
    @allure.title("List users with pagination")
    def test_list_users_paginated(self, api):
        response = api.get("/api/users", params={"page": 1, "pageSize": 10})

        assert response.status_code == 200
        result = UserListResponse.model_validate(response.json())
        assert len(result.data) <= 10
        assert result.pagination.page == 1

    @pytest.mark.parametrize("page_size", [1, 5, 10, 50])
    @allure.title("Paginate with page_size={page_size}")
    def test_list_users_various_page_sizes(self, api, page_size):
        response = api.get("/api/users", params={"page": 1, "pageSize": page_size})

        assert response.status_code == 200
        result = UserListResponse.model_validate(response.json())
        assert len(result.data) <= page_size

    @allure.title("Unauthorized access returns 401")
    def test_list_users_unauthorized(self, unauth_api):
        response = unauth_api.get("/api/users")
        assert response.status_code == 401
```

### 4.8 Custom Assertion Helpers

```python
# src/utils/assertions.py
import allure
from requests import Response
from pydantic import BaseModel
from typing import Type, TypeVar

T = TypeVar("T", bound=BaseModel)

def assert_status(response: Response, expected: int, message: str = "") -> None:
    """Assert HTTP status code with descriptive failure."""
    assert response.status_code == expected, (
        f"{message + ': ' if message else ''}"
        f"Expected {expected}, got {response.status_code}. "
        f"Body: {response.text[:500]}"
    )

def assert_schema(response: Response, schema: Type[T], message: str = "") -> T:
    """Validate response body against Pydantic schema, return parsed model."""
    with allure.step(f"Validate response against {schema.__name__}"):
        return schema.model_validate(response.json())

def assert_response_time(response: Response, max_seconds: float = 2.0) -> None:
    """Assert response time is within threshold."""
    actual = response.elapsed.total_seconds()
    assert actual < max_seconds, (
        f"Response too slow: {actual:.2f}s (max: {max_seconds}s)"
    )

def assert_error_code(response: Response, expected_code: str) -> None:
    """Assert error response contains expected error code."""
    body = response.json()
    assert body.get("error", {}).get("code") == expected_code, (
        f"Expected error code '{expected_code}', got: {body}"
    )
```

---

## 5. Configuration

### pyproject.toml

```toml
[tool.pytest.ini_options]
testpaths = ["tests"]
python_files = ["test_*.py"]
python_classes = ["Test*"]
python_functions = ["test_*"]
markers = [
    "smoke: Smoke test subset — runs on every PR",
    "regression: Full regression suite — runs nightly",
    "critical: Business-critical tests — blocks deployment",
    "slow: Tests that take >5 seconds",
]
addopts = [
    "--strict-markers",
    "--tb=short",
    "-v",
    "--alluredir=reports/allure-results",
]
log_cli = true
log_cli_level = "INFO"
log_cli_format = "%(asctime)s [%(levelname)8s] %(name)s: %(message)s"
log_cli_date_format = "%Y-%m-%d %H:%M:%S"
```

### Running with Markers

```bash
# Smoke tests only
pytest -m smoke

# Regression (excludes slow)
pytest -m "regression and not slow"

# Critical tests only
pytest -m critical

# Specific module
pytest tests/users/ -v
```

---

## 6. Test Data Management

### factory_boy Integration

See section 4.6 above for factory definitions.

### Data Cleanup Pattern

```python
# src/utils/cleanup.py
import logging
from typing import Protocol

logger = logging.getLogger(__name__)

class ApiClientProtocol(Protocol):
    def delete(self, path: str, **kwargs) -> any: ...

class ResourceTracker:
    def __init__(self):
        self._resources: list[tuple[str, str]] = []

    def track(self, path: str, resource_id: str) -> None:
        self._resources.append((path, resource_id))

    def cleanup(self, api: ApiClientProtocol) -> None:
        for path, resource_id in reversed(self._resources):
            try:
                api.delete(f"{path}/{resource_id}")
                logger.info(f"Cleaned up: {path}/{resource_id}")
            except Exception as e:
                logger.warning(f"Cleanup failed for {path}/{resource_id}: {e}")
        self._resources.clear()
```

### Fixture-Based Cleanup

```python
# tests/conftest.py (addition)
@pytest.fixture
def resource_tracker(api):
    """Track created resources and clean them up after the test."""
    tracker = ResourceTracker()
    yield tracker
    tracker.cleanup(api)
```

---

## 7. Reporting

### Allure Setup

```bash
# Install allure-pytest (in requirements)
# Results go to reports/allure-results/ via pyproject.toml addopts

# Generate HTML report
allure generate reports/allure-results --clean -o reports/allure-report
allure open reports/allure-report
```

### Allure Decorators in Tests

```python
@allure.suite("Users")
@allure.feature("Create User")
@allure.severity(allure.severity_level.CRITICAL)
@allure.title("Create user with valid data")
@allure.description("Verifies that a user can be created with all required fields")
@allure.link("https://jira.company.com/browse/TC-123", name="Test Case")
def test_create_user_success(self, api, user_payload):
    with allure.step("Send POST /api/users"):
        response = api.post("/api/users", json=user_payload)

    with allure.step("Verify 201 status"):
        assert response.status_code == 201

    with allure.step("Validate response schema"):
        user = UserResponse.model_validate(response.json())

    allure.attach(
        str(response.json()),
        name="Response Body",
        attachment_type=allure.attachment_type.JSON,
    )
```

### pytest-html Lightweight Report

```bash
# Generate HTML report alongside Allure
pytest --html=reports/html/report.html --self-contained-html
```

---

## 8. Parallel Execution

### pytest-xdist Configuration

```bash
# Run with 4 workers
pytest -n 4

# Auto-detect CPU count
pytest -n auto

# Distribute by file (tests in same file stay together)
pytest -n 4 --dist loadfile

# Distribute by class
pytest -n 4 --dist loadscope
```

### Test Isolation for Parallel

1. **Session fixtures**: `api` client with `requests.Session` is session-scoped — each worker gets its own session
2. **Unique data**: Every test uses factory-generated data with unique emails, names
3. **No shared state**: Tests don't rely on data created by other tests
4. **Fixture scoping**: Function-scoped fixtures for anything mutable; session-scoped for read-only config

### Worker Configuration

```toml
# pyproject.toml
[tool.pytest.ini_options]
# Default parallel for CI
addopts = ["-n", "auto", "--dist", "loadfile"]
```

---

## 9. CI/CD Integration

### GitHub Actions Workflow

```yaml
# .github/workflows/api-tests.yml
name: API Tests (pytest)

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]
  schedule:
    - cron: '0 6 * * 1-5'

env:
  TEST_ENV: staging
  API_BASE_URL: ${{ secrets.STAGING_API_URL }}
  TEST_USER_EMAIL: ${{ secrets.TEST_USER_EMAIL }}
  TEST_USER_PASSWORD: ${{ secrets.TEST_USER_PASSWORD }}

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with: { python-version: '3.11' }
      - run: pip install ruff mypy
      - run: ruff check src/ tests/
      - run: mypy src/ --ignore-missing-imports

  smoke:
    needs: lint
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with: { python-version: '3.11', cache: pip }
      - run: pip install -r requirements-dev.txt
      - run: pytest -m smoke -n auto --alluredir=reports/allure-results
      - uses: actions/upload-artifact@v4
        if: always()
        with: { name: smoke-allure, path: reports/allure-results }

  regression:
    needs: smoke
    runs-on: ubuntu-latest
    strategy:
      fail-fast: false
      matrix:
        test-group: [auth, users, errors, schemas]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with: { python-version: '3.11', cache: pip }
      - run: pip install -r requirements-dev.txt

      - name: Run tests (${{ matrix.test-group }})
        run: pytest tests/${{ matrix.test-group }}/ -n auto --alluredir=reports/allure-results

      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: regression-allure-${{ matrix.test-group }}
          path: reports/allure-results

  allure-report:
    needs: regression
    if: always()
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/download-artifact@v4
        with:
          pattern: '*-allure*'
          merge-multiple: true
          path: merged-results
      - run: |
          npm install -g allure-commandline
          allure generate merged-results --clean -o allure-report
      - uses: peaceiris/actions-gh-pages@v4
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: allure-report
```

---

## 10. Docker Setup

### Dockerfile

```dockerfile
FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY requirements-dev.txt .
RUN pip install --no-cache-dir -r requirements-dev.txt

COPY . .

CMD ["pytest", "-n", "auto", "--alluredir=reports/allure-results"]
```

### docker-compose.yml

```yaml
version: '3.8'

services:
  api-tests:
    build:
      context: .
      dockerfile: docker/Dockerfile
    environment:
      - TEST_ENV=staging
      - API_BASE_URL=http://api:3000
      - TEST_USER_EMAIL=${TEST_USER_EMAIL}
      - TEST_USER_PASSWORD=${TEST_USER_PASSWORD}
    volumes:
      - ./reports:/app/reports
    depends_on:
      api:
        condition: service_healthy
    networks:
      - test-network

  api:
    image: your-api:latest
    ports:
      - '3000:3000'
    healthcheck:
      test: ['CMD', 'curl', '-f', 'http://localhost:3000/health']
      interval: 5s
      timeout: 3s
      retries: 10
    networks:
      - test-network

networks:
  test-network:
    driver: bridge
```

### Running in Docker

```bash
# Full suite
docker compose -f docker/docker-compose.yml up --build --exit-code-from api-tests

# Smoke only
docker compose -f docker/docker-compose.yml run api-tests pytest -m smoke -n auto

# Specific module
docker compose -f docker/docker-compose.yml run api-tests pytest tests/users/ -v
```

---

## 11. Quality Checklist

### Structure

- [ ] Folder structure matches architecture section
- [ ] `pyproject.toml` has pytest configuration with markers, paths, and allure
- [ ] All `__init__.py` files present
- [ ] No circular imports

### Core

- [ ] `ApiClient` wraps `requests.Session` with auth, logging, and typed methods
- [ ] `AuthManager` acquires, caches, and refreshes tokens (thread-safe with lock)
- [ ] Request/response logging for every API call (method, URL, status, duration)
- [ ] `requests.Session` used for connection pooling

### Schema Validation

- [ ] Pydantic v2 models defined for all response types (success + error)
- [ ] Models used in test assertions (`Model.model_validate(response.json())`)
- [ ] Error response model validates structure, code, and optional details
- [ ] Shared models for pagination, timestamps

### Testing

- [ ] At least 10 test cases covering CRUD operations
- [ ] Auth flow tests (login, unauthorized, permissions)
- [ ] Error response validation (400, 401, 403, 404, 409)
- [ ] `pytest.mark.parametrize` for data-driven tests
- [ ] Custom markers: `smoke`, `regression`, `critical`
- [ ] Response time assertions
- [ ] Tests create and clean up their own data via fixtures

### Configuration

- [ ] Pydantic `BaseSettings` with `.env` file support
- [ ] Environment-specific `.env` files (local, staging, production)
- [ ] Sensitive values from environment variables
- [ ] `@lru_cache` on settings for single-load

### Fixtures

- [ ] Root `conftest.py` with session-scoped fixtures (api client, settings)
- [ ] Module-level `conftest.py` with domain-specific fixtures
- [ ] Function-scoped fixtures for mutable test data
- [ ] Cleanup via fixture teardown (`yield` + delete)

### Infrastructure

- [ ] `allure-pytest` configured and generating results
- [ ] `pytest-html` for lightweight CI reports
- [ ] GitHub Actions workflow with lint → smoke → regression (matrix) → allure report
- [ ] Dockerfile with `python:3.11-slim` image
- [ ] `docker-compose.yml` for containerized execution
- [ ] Linting with `ruff` and type checking with `mypy` in CI

### Parallel Execution

- [ ] `pytest-xdist` configured (`-n auto --dist loadfile`)
- [ ] Tests are isolated — no shared mutable state between workers
- [ ] Factory-generated unique data per test
- [ ] `requests.Session` per worker (session-scoped fixture in xdist = per-worker)

---

**Blueprint Owner**: API Testing Builder
**Consumers**: Quality Gate Agent (validation), Infrastructure Agent (CI/CD/Docker), Documentation Agent (README)
