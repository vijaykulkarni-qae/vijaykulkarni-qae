# API Contract

> **Backend Agent Output** — The API contract that Frontend codes against. Fill out during build phase.

---

## Header

| Field | Value |
|-------|-------|
| **Version** | `1.0.0` |
| **Date** | `YYYY-MM-DD` |
| **Base URL** | `https://api.example.com` |
| **Auth Scheme** | `Bearer Token` / `API Key` / `OAuth 2.0` / `None` |

---

## Global Conventions

### Response Format

```json
{
  "success": true,
  "data": {},
  "meta": {
    "timestamp": "ISO8601",
    "requestId": "uuid"
  }
}
```

### Error Format

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message",
    "details": []
  },
  "meta": {
    "timestamp": "ISO8601",
    "requestId": "uuid"
  }
}
```

### Pagination Format

```json
{
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### Auth Header Format

```
Authorization: Bearer <token>
```

*Or for API Key:*
```
X-API-Key: <api_key>
```

---

## API Groups / Features

### Feature: [Feature Name]

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/resource` | List resources |
| `POST` | `/resource` | Create resource |
| `GET` | `/resource/:id` | Get single resource |
| `PUT` | `/resource/:id` | Update resource |
| `DELETE` | `/resource/:id` | Delete resource |

---

#### Endpoint: [Method] [Path]

| Field | Value |
|-------|-------|
| **Method** | `GET` / `POST` / `PUT` / `PATCH` / `DELETE` |
| **Path** | `/resource/:id` |
| **Description** | One-line description of what this endpoint does |
| **Auth Required** | `Yes` / `No` |

**Request Headers**

| Header | Required | Description |
|--------|----------|-------------|
| `Authorization` | Yes | Bearer token |
| `Content-Type` | Yes (for body) | `application/json` |

**Request Body** (if applicable)

```json
{
  "field1": "value",
  "field2": 123,
  "nested": {
    "key": "value"
  }
}
```

**Response 200**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "field1": "value",
    "createdAt": "2025-01-01T00:00:00Z"
  }
}
```

**Error Responses**

| Status | Condition | Response Body |
|--------|-----------|---------------|
| `400` | Invalid request body | `{ "error": { "code": "VALIDATION_ERROR", "message": "..." } }` |
| `401` | Missing/invalid token | `{ "error": { "code": "UNAUTHORIZED", "message": "..." } }` |
| `403` | Insufficient permissions | `{ "error": { "code": "FORBIDDEN", "message": "..." } }` |
| `404` | Resource not found | `{ "error": { "code": "NOT_FOUND", "message": "..." } }` |
| `429` | Rate limit exceeded | `{ "error": { "code": "RATE_LIMITED", "message": "..." } }` |

**Example cURL**

```bash
curl -X GET "https://api.example.com/resource/123" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json"
```

---

*[Repeat Endpoint detail block for each endpoint in this feature]*

---

### Feature: [Another Feature Name]

*[Same structure as above]*

---

## Rate Limiting

| Limit Type | Value | Window |
|------------|-------|--------|
| **Per User** | `100` requests | per minute |
| **Per IP** | `1000` requests | per minute |
| **Response Headers** | `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset` |

---

## Versioning Strategy

| Strategy | Details |
|----------|---------|
| **Approach** | URL path (`/v1/...`) / Header (`Accept: application/vnd.api+json;version=1`) |
| **Deprecation** | Minimum 6 months notice, `Deprecation` header on deprecated endpoints |
| **Current Version** | `v1` |

---

## Instructions for Backend Agent

1. Replace all placeholder values with actual API details.
2. Add one section per API group/feature.
3. For each endpoint, include the full detail block (Method, Path, Description, Auth, Headers, Body, Response, Errors, cURL).
4. Update rate limits and versioning to match your implementation.
