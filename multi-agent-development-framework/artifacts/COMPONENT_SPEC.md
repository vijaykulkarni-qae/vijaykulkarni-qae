# Component Specification

> **Frontend Agent Output** — Component architecture and design. Fill out during build phase.

---

## Header

| Field | Value |
|-------|-------|
| **Version** | `1.0.0` |
| **Date** | `YYYY-MM-DD` |
| **Framework** | `React` / `Vue` / `Angular` / `Svelte` |
| **Design System** | `Material UI` / `Tailwind` / `Chakra UI` / `Custom` |

---

## Component Tree

Visual hierarchy of the application structure. Use indentation to show parent-child relationships.

```
App
├── Layout
│   ├── Header
│   │   ├── Logo
│   │   ├── Navigation
│   │   └── UserMenu
│   ├── Sidebar (optional)
│   │   └── NavLinks
│   └── Main
│       └── Outlet / RouterView
├── Pages
│   ├── HomePage
│   │   ├── HeroSection
│   │   └── FeatureList
│   ├── DashboardPage
│   │   ├── StatsCards
│   │   └── DataTable
│   └── SettingsPage
│       └── SettingsForm
└── Shared
    ├── Button
    ├── Modal
    └── Toast
```

---

## State Management Approach

| Aspect | Details |
|--------|---------|
| **Tool** | `Redux` / `Zustand` / `Pinia` / `Context API` / `TanStack Query` |
| **Global State** | What lives in global store (e.g., user, theme, cart) |
| **Local State** | What stays in component state (e.g., form inputs, UI toggles) |
| **Key Stores/Slices** | `auth`, `user`, `theme`, `cart`, etc. |
| **Server State** | How API data is cached (e.g., React Query, SWR) |

---

## Key Components

### Component: [ComponentName]

| Field | Value |
|-------|-------|
| **Name** | `ComponentName` |
| **Purpose** | One-line description of component responsibility |
| **Props/Interface** | `{ prop1: string; prop2?: number; onAction: () => void }` |
| **State** | Local state variables and their types |
| **API Dependencies** | Endpoints this component calls (e.g., `GET /users/:id`) |
| **Child Components** | `ChildA`, `ChildB`, `ChildC` |

---

*[Repeat for each key component]*

---

### Component: [AnotherComponent]

| Field | Value |
|-------|-------|
| **Name** | `AnotherComponent` |
| **Purpose** | ... |
| **Props/Interface** | ... |
| **State** | ... |
| **API Dependencies** | ... |
| **Child Components** | ... |

---

## Routing Table

| Route | Component | Auth Required | Lazy Loaded |
|-------|-----------|---------------|-------------|
| `/` | `HomePage` | No | No |
| `/dashboard` | `DashboardPage` | Yes | Yes |
| `/settings` | `SettingsPage` | Yes | Yes |
| `/login` | `LoginPage` | No | Yes |
| `*` | `NotFoundPage` | No | Yes |

---

## Shared Utilities

### Reusable Hooks

| Hook | Purpose | Returns |
|------|---------|---------|
| `useAuth` | Get current user, login, logout | `{ user, isLoading, login, logout }` |
| `useFetch` | Generic data fetching with cache | `{ data, error, isLoading, refetch }` |
| `useLocalStorage` | Persist value in localStorage | `[value, setValue]` |

### Helpers

| Helper | Purpose |
|--------|---------|
| `formatDate(date)` | Format date for display |
| `validateEmail(email)` | Email validation |
| `cn(...classes)` | Class name merger (e.g., clsx, tailwind-merge) |

---

## Design Tokens

*Use if custom design system; otherwise note "Using [Design System] defaults"*

### Colors

| Token | Value | Usage |
|-------|-------|-------|
| `--color-primary` | `#3B82F6` | Primary actions, links |
| `--color-secondary` | `#64748B` | Secondary text |
| `--color-success` | `#22C55E` | Success states |
| `--color-error` | `#EF4444` | Errors, destructive actions |

### Spacing

| Token | Value | Usage |
|-------|-------|-------|
| `--spacing-xs` | `4px` | Tight spacing |
| `--spacing-sm` | `8px` | Small gaps |
| `--spacing-md` | `16px` | Default padding |
| `--spacing-lg` | `24px` | Section spacing |

### Typography

| Token | Value | Usage |
|-------|-------|-------|
| `--font-sans` | `Inter, system-ui, sans-serif` | Body text |
| `--font-mono` | `Fira Code, monospace` | Code |
| `--text-sm` | `14px` | Small text |
| `--text-base` | `16px` | Body |
| `--text-lg` | `18px` | Headings |

---

## Instructions for Frontend Agent

1. Replace all placeholder values with actual component details.
2. Ensure Component Tree reflects the real app structure.
3. Document every key component with full Props, State, API Dependencies.
4. Keep routing table in sync with router configuration.
5. List all shared hooks and helpers used across the app.
