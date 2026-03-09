# Autonomous QA - Project Overview

> **A comprehensive, enterprise-grade test automation platform with AI-powered insights, real-time execution monitoring, and Docker containerization support.**

## 🎯 Quick Facts

- **Status**: Production Ready ✅
- **Total Endpoints**: 127 REST APIs across 14 route modules
- **Database**: PostgreSQL with Prisma ORM (19 tables)
- **AI Providers**: 9 providers supported (OpenAI, Claude, Gemini, Groq, Ollama, Mistral, Cohere, LocalAI, Custom)
- **Frontend**: React 18 + TypeScript with 152+ components
- **Backend Services**: 66 modular services
- **NPM Packages**: 89 unique (47 root prod + 8 root dev + 28 frontend prod + 15 frontend dev, deduplicated)
- **Middleware**: 11 comprehensive middleware layers
- **Test Coverage**: Backend 85%+ (4,787 tests), Frontend 70%+ (3,791 tests)
- **Docker Support**: Full multi-container orchestration
- **PWA**: Installable Progressive Web App
- **Documentation**: 20+ comprehensive guides
- **React Contexts**: 7 state management contexts

---

## 🆕 Recent Additions (December 2025)

### Scheduler Revamp - CronJobManager (December 5, 2025)
- **Status**: ✅ COMPLETED - Replaced polling-based scheduler with precise event-driven cron scheduling
- **Problem Solved**: 30-second polling was inefficient and imprecise for scheduled test execution
- **Solution**: Implemented `CronJobManager` using node-cron for exact second-level execution
- **New Service**: `backend/services/cronJobManager.js` (580+ lines)
  - ✅ **Precise Timing**: Executes at exact scheduled second (no polling delay)
  - ✅ **PostgreSQL Advisory Locks**: Multi-server safety for distributed deployments
  - ✅ **Missed Job Detection**: Recovers jobs missed during server downtime
  - ✅ **Dynamic Job Management**: Add/update/remove jobs without server restart
  - ✅ **Graceful Shutdown**: Properly stops all cron jobs on server termination
  - ✅ **HTML Entity Decoding**: Handles encoded timezone and cron expressions
- **Architecture**:
  - Event-driven (no polling) - zero CPU overhead when idle
  - In-memory cron jobs synced with PostgreSQL on startup
  - Route hooks for real-time job synchronization (create/update/delete/toggle)
  - Backward compatible - no API changes required
- **Integration Points**:
  - `backend/server.js` - CronJobManager initialization on startup
  - `backend/routes/scheduleRoutes.js` - Hooks after CRUD operations
- **Industry Pattern**: Follows AWS CloudWatch Events, GitHub Actions scheduler architecture
- **Migration**: Seamless - existing schedules automatically loaded on server restart

### Webhook URL Fix (December 5, 2025)
- **Status**: ✅ COMPLETED - Fixed Allure report URLs in webhook notifications
- **Problem**: Webhook notifications used `FRONTEND_URL` for report links (incorrect)
- **Solution**: Added `BACKEND_URL` environment variable for proper report URL generation
- **Files Modified**:
  - `backend/services/webhookPayloadBuilder.js` - Uses `BACKEND_URL` for report URLs
  - `env.example` - Added `BACKEND_URL` configuration
- **Report URL Format**: `${BACKEND_URL}/api/reports/${runId}/#`

### Licenses Update (December 5, 2025)
- **Status**: ✅ COMPLETED - Updated About section with all 89 dependencies
- **Previous**: 70 packages tracked
- **Current**: 89 packages tracked (19 new additions)
- **New Packages Added**: node-cron, cron-parser, bull, ioredis, date-fns, react-js-cron, exceljs, he, @hello-pangea/dnd, and more
- **Script**: `npm run pwa:licenses` regenerates license data

### Production Optimization Guide (December 5, 2025)
- **Status**: ✅ COMPLETED - Comprehensive documentation and code enhancements
- **New Documentation**:
  - `PRODUCTION_OPTIMIZATION_GUIDE.md` - Lessons learned, patterns, checklists
  - `docs/ERD.md` - Database entity relationship diagram with Mermaid
  - `docs/BACKEND_ARCHITECTURE.md` - Backend service layer documentation
  - Updated `docs/API_DOCUMENTATION.md` - Added Schedule API, Webhook API, Auth examples
- **Code Enhancements**:
  - `backend/utils/logger.js` - Structured logging utility (environment-aware, JSON/human format)
  - `frontend/src/utils/api.ts` - Integrated retry logic with exponential backoff
  - `backend/services/ai/providers/BaseAIProvider.js` - Added retry + circuit breaker pattern
  - Updated `OpenAIProvider.js` and `GeminiProvider.js` with automatic retry
- **Key Features**:
  - ✅ Exponential backoff retry for transient failures
  - ✅ Circuit breaker pattern for AI providers (auto-disable after 5 failures)
  - ✅ Structured logging with log levels (error, warn, info, debug)
  - ✅ Request timing and external service call logging
  - ✅ Complete ERD with 19 tables and relationships
  - ✅ Full backend architecture documentation (66 services, 14 route modules)
- **Lessons Learned Document**:
  - HTML entity encoding/decoding patterns
  - Import path verification rules
  - PowerShell vs bash syntax
  - Route mounting order requirements
  - App.locals for service sharing
  - Incremental testing strategy

---

## 🆕 Recent Additions (November 2025)

### Webhook Notification System (November 23, 2025)
- **Status**: ✅ COMPLETED - Field-based webhook notifications for test execution
- **New Feature**: Send test results to external services (Google Chat, Slack, Teams, Discord, custom endpoints)
- **Services**:
  - `backend/services/webhookService.js` - Field-based payload building, fire-and-forget notifications
  - 17 configurable fields across 4 categories (Essential, Test Results, Execution Details, Additional)
  - Default fields pre-selected for optimal out-of-box experience
- **API Routes**: 6 endpoints in `backend/routes/webhookRoutes.js` (admin-only)
  - `GET /api/webhooks` - List user's webhooks
  - `POST /api/webhooks` - Create webhook with field selection
  - `PUT /api/webhooks/:id` - Update webhook configuration
  - `DELETE /api/webhooks/:id` - Delete webhook
  - `POST /api/webhooks/test` - Test webhook with sample data
  - `GET /api/webhooks/fields` - Get field definitions and categories
- **Database**: New `WebhookConfig` model (19th table in Prisma schema)
- **Frontend**:
  - `WebhookManagement.tsx` - Admin settings tab with CRUD operations
  - `WebhookModal.tsx` - Configuration modal with field selector
  - Collapsible category groups (Essential, Test Results, Execution Details, Additional)
  - Real-time JSON preview (editable)
  - Copy all variables button
  - Test webhook before saving
  - Uses common components: `Modal`, `Input`, `Checkbox`, `Button`, `ConfirmDialog`
- **Integration**: Automatically sends notifications for:
  - Single test executions (`atomicExecutionService.js`)
  - Bulk test executions (`atomicBulkExecutionService.js`)
  - Scheduled test executions (via `cronJobManager.js`)
- **Features**:
  - ✅ Field-based selection (users choose which data to include)
  - ✅ Auto-generated JSON with `{{placeholders}}`
  - ✅ Manual JSON editing supported
  - ✅ Multiple active webhooks (notify all)
  - ✅ Fire-and-forget (non-blocking, never fails test execution)
  - ✅ Test button with sample data
  - ✅ Admin-only access
  - ✅ Dark mode support
- **Industry Pattern**: Zapier, n8n, GitHub Webhooks (template-driven, user-configured)
- **Payload Example**:
  ```json
  {
    "testName": "Login Flow Test",
    "status": "passed",
    "reportUrl": "https://...",
    "totalTests": 25,
    "passedTests": 25,
    "failedTests": 0,
    "skippedTests": 0,
    "triggeredBy": "John Doe",
    "executionType": "scheduled",
    "completedAt": "2025-11-23T09:30:00Z"
  }
  ```

### AI Chat Intent Detection (November 22, 2025)
- **Status**: ✅ COMPLETED - AI assistant now properly distinguishes questions from modifications
- **Fix**: Updated AI prompts to detect intent (analysis vs modification)
- **Frontend**: Uses common components (Alert, ButtonGroup, Badge) for Accept/Reject UI
- **UX Pattern**: Matches Cursor AI / GitHub Copilot industry standard
- **Behavior**:
  - ✅ Questions (what/how/why) → Chat response only, no code changes
  - ✅ Modifications (change/update/add) → Shows Accept/Reject buttons
  - ✅ User confirmation required before applying changes
- **Components Used**:
  - `Alert` - For pending modification alerts
  - `ButtonGroup` - For Accept/Reject buttons
  - `Badge` - For "Analysis" vs "Code Changes" visual distinction
- **Documentation**: See `AI-CHAT-FIX-COMPLETE.md`

### KPI Fields Implementation (November 20, 2025)
- **Status**: ✅ COMPLETED - Dashboard KPIs now update correctly
- **Fix**: Added 4 columns to `test_runs` table: `totalTests`, `passedTests`, `failedTests`, `skippedTests`
- **Impact**: All execution types (single, bulk, scheduled) now correctly save test statistics
- **Industry Standard**: Dual storage pattern - columns for fast queries + JSON metadata for flexibility
- **Database Migration**: Applied with `npx prisma db push` (no data loss)
- **Documentation**: See `KPI-FIELDS-IMPLEMENTATION.md` for complete details

### Scheduled Test Execution (Production-Ready Event-Driven Scheduler)
- **New Feature**: Automated test scheduling with node-cron + Visual Cron Builder
- **Services**:
  - `backend/services/scheduleService.js` - CRUD operations, native HTML entity decoding, user-friendly error messages, `getSchedule()` alias
  - `backend/services/cronJobManager.js` - Event-driven cron scheduling with node-cron (580+ lines)
    - ✅ **Precise timing**: Executes at exact scheduled second
    - ✅ **PostgreSQL advisory locks**: Multi-server safety
    - ✅ **Missed job detection**: Recovers jobs after server restart
    - ✅ **Dynamic management**: Add/update/remove without restart
  - `backend/services/executionScheduler.js` - Legacy polling scheduler (deprecated, kept for reference)
  - `backend/services/systemUserService.js` - Dedicated "System" user for scheduled executions (referential integrity)
- **API Routes**: 9 endpoints in `backend/routes/scheduleRoutes.js` with HTML entity decoding
  - `GET /api/schedules` - List all schedules with filters
  - `POST /api/schedules` - Create new schedule (decodes HTML entities from cron input)
  - `GET /api/schedules/:id` - Get schedule details
  - `PUT /api/schedules/:id` - Update schedule (decodes HTML entities)
  - `DELETE /api/schedules/:id` - Delete schedule (prevents deletion of running schedules)
  - `POST /api/schedules/:id/toggle` - Enable/disable schedule
  - `POST /api/schedules/:id/trigger` - Manual trigger (fixed to work correctly)
  - `GET /api/schedules/statistics` - Queue and schedule statistics
  - `POST /api/schedules/validate-cron` - Validate cron expressions (decodes HTML entities)
- **Database**: New `ScheduledExecution` model (18th table in Prisma schema)
- **Frontend**:
  - `ScheduledTestsPage.tsx` - Main management UI with filters, search, auto-refresh, professional delete confirmation
  - `CreateScheduleModal.tsx` - **Visual Cron Builder** with `react-js-cron` (industry standard)
    - ✅ Dropdown-based cron builder (no error-prone text input)
    - ✅ 4 quick preset buttons (Every 15min, Hourly, Daily 2AM, Weekdays 9AM)
    - ✅ Real-time validation with human-readable preview
    - ✅ IST (Asia/Kolkata) as default timezone with 10 timezone options (flag emojis)
    - ✅ Dark mode support via custom CSS
    - ✅ **Recurring toggle**: Choose between recurring or one-time schedules
  - `TestReorderList.tsx` - Drag-and-drop test ordering for sequential execution
  - `ConfirmDialog.tsx` - Reusable professional confirmation dialog component
  - Dashboard integration: 3-column Quick Actions layout with "Scheduled Tests" card
  - Sidebar: New "Scheduled Tests" menu item
- **Technology Stack**:
  - **node-cron v4.2.1** - Precise event-driven scheduling (no polling overhead)
  - **cron-parser v4.9.0** - Cron expression validation (no `currentDate` to avoid CronDate errors)
  - **cronstrue v2.50.0** - Human-readable cron descriptions
  - **react-js-cron v5.2.0** - Industry-standard visual cron builder (used by enterprise apps)
- **Architecture Decision**:
  - ✅ Event-driven scheduling (zero CPU when idle)
  - ✅ PostgreSQL advisory locks for multi-server deployments
  - ✅ No Redis required (simpler deployment, lower cost)
  - ✅ Missed job detection on startup
  - ✅ Graceful shutdown with proper cleanup
- **HTML Entity Handling**:
  - ✅ Native JavaScript decoding (NO external library - proven pattern from code editor)
  - ✅ Decodes `*/5` (encoded as `*&#x2F;5`) and all special characters
  - ✅ Applied in `scheduleService.js` and `scheduleRoutes.js`
- **Features**:
  - ✅ Visual cron builder prevents user input errors (follows GitHub Actions, AWS EventBridge pattern)
  - ✅ Event-driven scheduling with node-cron (precise second-level execution)
  - ✅ PostgreSQL advisory locks for distributed deployments
  - ✅ Missed job detection and recovery on startup
  - ✅ Dynamic job management without server restart
  - ✅ Automatic next-run calculation with timezone support
  - ✅ Delete protection (cannot delete running schedules)
  - ✅ Custom execution order (drag-and-drop for sequential mode)
  - ✅ Timezone-aware scheduling (IST default + 10 timezones with flag emojis)
  - ✅ Cron validation with next 5 run previews
  - ✅ User-friendly error messages (no technical jargon)
  - ✅ Real-time statistics (running schedules, completed runs)
  - ✅ HTML entity decoding for timezone and cron display
  - ✅ Graceful shutdown with proper job cleanup
- **Integration**: Seamless integration with existing `atomicBulkExecutionService` for test execution

### AST-Based Markdown Parser (Industry Standard)
- **New Service**: `backend/services/astMarkdownParser.js` (310 lines)
- **Purpose**: Parse AI-generated markdown descriptions for Excel exports
- **Technology**: Unified v11.0.4 + Remark v11.0.0 (MDAST - Markdown Abstract Syntax Tree)
- **Benefits**:
  - ✅ Removes ALL markdown formatting (`**bold**`, `### headers`, `1. lists`) safely
  - ✅ Preserves formulas (`=SUM(A1:A10)`) and special characters (`<>&"'`)
  - ✅ Handles edge cases (code blocks, tables, nested lists)
  - ✅ Mirrors `astPlaywrightParser.js` architecture for consistency
- **Dependencies Added**:
  - `unified@^11.0.4` - Core AST processor framework
  - `remark-parse@^11.0.0` - Markdown to MDAST parser
  - `remark-gfm@^4.0.0` - GitHub Flavored Markdown support
  - `mdast-util-to-string@^4.0.0` - Safe plain text extraction

### Excel Export Enhancements
- **Service**: `backend/services/excelExportService.js`
- **Improvements**:
  - Replaced 70+ lines of custom regex parser with industry-standard AST parser
  - Async/await properly implemented throughout
  - Multi-sheet workbook generation with folder hierarchy
  - Clean, formatted output with proper column structure

### Universal Drag-Drop System (December 2024)
- **Problem Solved**: Deprecated `react-beautiful-dnd` causing broken drag-drop, no search/pagination for 25+ test scenarios
- **User Requirement**: "Search for test at position #26 and drag it to position #5 with smooth auto-scroll"
- **Solution**: Upgraded to `@hello-pangea/dnd` (industry-standard community fork) with comprehensive enhancements
- **New Component**: `frontend/src/components/common/StrictModeDroppable.tsx` - React 18 StrictMode-compatible wrapper
- **Enhanced Component**: `frontend/src/components/modals/TestReorderList.tsx` - Complete rewrite with:
  - ✅ **Infinite Scroll**: IntersectionObserver API, 25-item batches, efficient rendering for 200+ tests
  - ✅ **Smart Search**: Debounced filtering (300ms), real-time results count
  - ✅ **Jump-to-Position**: Search → Click "Jump" → Auto-scroll → 3-second highlight pulse
  - ✅ **Auto-Scroll**: 50px edge detection, 60fps smooth scroll (requestAnimationFrame)
  - ✅ **Accessibility**: WCAG 2.1 AA compliant, keyboard navigation (Tab + Space + Arrows)
  - ✅ **Mobile Support**: Touch drag built-in
- **Technology Stack**:
  - **@hello-pangea/dnd v16.5.0** - Community fork with React 18 + StrictMode support
  - Removed deprecated `react-beautiful-dnd v13.1.1`
  - Native Web APIs: IntersectionObserver, requestAnimationFrame
- **Use Cases**:
  - Test scheduling: Define custom execution order for sequential runs
  - Flow management: Organize scenarios within folders (future enhancement)
  - Bulk operations: Reorder 50-200+ tests efficiently
- **Performance**: Handles 200+ items without lag, only renders visible items
- **Pattern**: Industry-standard delayed mount pattern for StrictMode compatibility

---

## 📊 Project Statistics

### API Endpoints
**Total Backend APIs: 127 endpoints** (excluding backup files)

#### Breakdown by Module:

| Module | Endpoints | Description |
|--------|-----------|-------------|
| **AI Routes** | 22 | Provider management, script analysis/modification, knowledge base, model search |
| **Flow Routes** | 17 | CRUD operations, clone, move, reorder, file management, upload, export |
| **System Routes** | 15 | Metrics, screenshots, bulletproof validation, performance benchmarks, reports |
| **Schedule Routes** | 9 | Scheduled test execution management, CRUD, trigger, toggle, statistics, cron validation |
| **Execution Routes** | 9 | Flow execution (single & bulk), run queries, status tracking, statistics |
| **Settings Routes** | 8 | App settings, file uploads (logo, icons, backgrounds, themes) |
| **Cleanup Routes** | 7 | Data retention policies, artifact cleanup, orphan detection, scheduled cleanups |
| **User Routes** | 7 | User management, audit logs, modules, profile management |
| **Webhook Routes** | 7 | Webhook notification management, CRUD, test, field definitions (admin-only) |
| **Folder Routes** | 7 | Folder CRUD, clone, move operations, metadata management |
| **Auth Routes** | 6 | Login, signup, logout, profile, current user, password reset |
| **Recording Routes** | 5 | Playwright codegen integration, recording management, diagnostics |
| **Health Routes** | 4 | Container health checks, readiness probes, database/service status |
| **Tag Routes** | 4 | Tag extraction, management, and test organization |

---

## 🏗️ Technology Stack

### Backend
- **Runtime**: Node.js v16+
- **Framework**: Express.js v5.1.0
- **Language**: JavaScript (ES6+)
- **API Architecture**: RESTful APIs with WebSocket support
- **Real-time Communication**: Socket.IO v4.7.5
- **Authentication**: JWT (JSON Web Tokens) with bcryptjs
- **File Upload**: Multer v1.4.5
- **Excel Generation**: ExcelJS v4.4.0 (folder scenario exports, multi-sheet workbooks)
- **Markdown Parsing**: Unified v11.0.4, Remark v11.0.0 (AST-based markdown processing)
  - Industry-standard MDAST (Markdown Abstract Syntax Tree) parser
  - GitHub Flavored Markdown (GFM) support via remark-gfm v4.0.0
  - Safe plain text extraction via mdast-util-to-string v4.0.0
  - Mirrors Babel AST architecture for JavaScript parsing consistency
- **Job Scheduling**: CronJobManager with node-cron (Event-driven, precise timing)
  - node-cron v4.2.1 for exact second-level execution
  - PostgreSQL advisory locks for multi-server safety
  - Missed job detection on startup
  - Dynamic job management (add/update/remove without restart)
  - Cron parsing: cron-parser v4.9.0, cronstrue v2.50.0
  - **Architecture**: Zero polling overhead, event-driven execution
- **Security**: Helmet v7.1.0, Express Rate Limit v7.1.5
- **Validation**: Express Validator v7.2.1
- **Process Management**: Child processes for Playwright execution

#### Key Backend Services (66 services):
- **Atomic Services**: Transaction-based CRUD operations with rollback (9 services)
- **Execution Services**: Single & bulk test execution with real-time progress
- **Scheduling Services**:
  - `scheduleService.js` - CRUD operations, validation, duplicate detection, statistics
  - `cronJobManager.js` - Event-driven cron scheduling with node-cron (primary)
  - `executionScheduler.js` - Legacy polling scheduler (deprecated)
- **Monitoring Services**: System health, performance metrics, error tracking, regression prevention
- **AI Services**: Multi-provider support (9 providers: OpenAI, Claude, Gemini, Groq, Ollama, Mistral, Cohere, LocalAI, Custom)
- **Recording Services**: Playwright codegen integration, AST parsing (JavaScript & Markdown), streaming watcher
- **Parser Services**: 
  - `astPlaywrightParser.js` - Babel-based JavaScript AST parsing for Playwright scripts
  - `astMarkdownParser.js` - Remark-based Markdown AST parsing for AI descriptions
- **Excel Export Services**: Multi-sheet workbook generation with AST-based markdown parsing
- **Allure Services**: Test report generation, enrichment, categorization (7 service modules)
- **Cleanup Services**: Automated data retention, artifact cleanup, orphan detection
- **Audit Services**: Comprehensive audit logging, user activity tracking
- **Configuration Services**: Centralized configuration management

### Frontend
- **Framework**: React v18.2.0
- **Language**: TypeScript v4.9.5
- **UI Components**: Headless UI v1.7.18, Heroicons v2.0.18, 152+ custom components
- **Styling**: TailwindCSS v3.4.1, PostCSS v8.4.35
- **Charts**: Recharts v2.12.0
- **Routing**: React Router DOM v6.22.3
- **Real-time**: Socket.IO Client v4.7.5
- **Drag & Drop**: @hello-pangea/dnd v18.0.1 (React 18 + StrictMode compatible)
- **Build Tool**: React Scripts v5.0.1
- **Icons**: Lucide React v0.553.0
- **PWA**: Service Worker, offline support, installable app
- **Testing**: Jest, React Testing Library, Playwright E2E, MSW (Mock Service Worker)
- **Accessibility**: ARIA support, keyboard navigation, screen reader optimization
- **Security**: DOMPurify for XSS prevention, CSRF token handling

### Database
- **Primary DB**: PostgreSQL v16+ (pg v8.16.3)
- **ORM**: Prisma v6.15.0 (@prisma/client)
- **Schema Management**: Prisma migrations
- **Caching**: Redis (optional, not required for scheduling or sessions)
- **Fallback**: File-based JSON storage (legacy support)

#### Database Models (19 tables):
- `User` - User accounts with role-based access (admin/user/viewer)
- `Project` - Top-level project organization
- `Folder` - Hierarchical folder structure with path-based organization, UI customization (color, icon), system folder flag
- `TestFlow` - Test scenarios/flows with versioning and upload file management
- `TestFlowVersion` - Complete version history with change tracking
- `TestRun` - Execution history with artifacts and cleanup tracking
- `BulkRunFlow` - Junction table for bulk execution tracking
- `TestRunStep` - Individual step execution results
- `TestAsset` - Screenshots, videos, and test artifacts
- `Deviation` - Test deviations with AI analysis
- `ScheduledExecution` - Scheduled test execution configurations with cron, timezone, custom ordering
- `WebhookConfig` - (NEW) Webhook notification configurations with field-based payload selection
- `Flow` - Legacy flow model (backward compatibility)
- `FlowStep` - Legacy step model
- `Session` - User session management
- `AuditLog` - Comprehensive user action auditing
- `Module` - Modular feature configuration
- `AppSettings` - Application-wide settings (key-value store)
- `AIProvider` - AI provider configurations with encrypted API keys

### Testing & Reporting
- **Test Framework**: Playwright v1.55.0 (@playwright/test)
- **Test Runner**: Playwright Test
- **Reporting**: Allure Playwright v2.9.2, Allure Commandline v2.25.0
- **Unit Testing**: Jest (configured)
- **Test Orchestration**: Custom atomic execution engine

### DevOps & Tools
- **Containerization**: Docker & Docker Compose (multi-container setup)
- **Services**: PostgreSQL, Redis, Ollama (local AI), LocalAI support
- **Concurrency**: Concurrently v9.2.0 (dev server management)
- **Scheduling**: Node-cron v4.2.1 (automated cleanup tasks)
- **File System**: Node.js fs/promises (async operations)
- **Pattern Matching**: Glob v11.0.3
- **HTTP Client**: Axios v1.12.1, Node Fetch v3.3.2
- **Encryption**: Custom encryption service for API keys (AES-256)
- **Version Control**: Git
- **Deployment**: AWS-ready with production deployment guide
- **Build Tools**: React Scripts, Sharp (image optimization)

---

## 📁 Architecture Overview

### High-Level Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React + TypeScript)             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Components, Pages, Context, Real-time Updates       │   │
│  └──────────────────────────────────────────────────────┘   │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTP/REST + WebSocket
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              Backend (Express.js + Node.js)                  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Routes (127 endpoints across 14 modules)           │   │
│  │  ├─ AI (22), Flow (17), System (15), Schedule (9) │   │
│  │  ├─ Execution (9), Settings (8), Cleanup (7)       │   │
│  │  ├─ User (7), Webhook (7), Folder (7), Auth (6)   │   │
│  │  ├─ Recording (5), Health (4), Tag (4)             │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Middleware (11 layers)                              │   │
│  │  ├─ Authentication (JWT)                            │   │
│  │  ├─ Authorization (Role-based)                      │   │
│  │  ├─ CSRF Protection (Double Submit Cookie)          │   │
│  │  ├─ Audit Logging (User activity)                   │   │
│  │  ├─ Validation, Error Handling                      │   │
│  │  ├─ Security (Helmet, Rate Limiting)                │   │
│  │  ├─ API Enhancements (Compression, Monitoring)      │   │
│  │  ├─ Caching (Response caching)                      │   │
│  │  ├─ Compression (Gzip/Brotli)                       │   │
│  │  ├─ Health Check (Container probes)                 │   │
│  │  ├─ Request Logger (Structured logging)             │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Services (66 Business Logic Services)              │   │
│  │  ├─ Atomic Services (9 with rollback)               │   │
│  │  ├─ Execution Services (Single & Bulk)              │   │
│  │  ├─ AI Services (13 files, 9 providers)             │   │
│  │  ├─ Allure Services (7 modules)                     │   │
│  │  ├─ Recording Services (Playwright integration)     │   │
│  │  ├─ Monitoring Services (Health, Performance)       │   │
│  │  ├─ Cleanup Services (Data retention)               │   │
│  │  ├─ Audit Services (Activity tracking)              │   │
│  └──────────────────────────────────────────────────────┘   │
└──────────────────────┬──────────────────────────────────────┘
                       │ Prisma ORM
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              Database (PostgreSQL 16)                        │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  19 Tables: User, Project, Folder, TestFlow,        │   │
│  │  TestFlowVersion, TestRun, BulkRunFlow, TestRunStep,│   │
│  │  TestAsset, Deviation, ScheduledExecution,          │   │
│  │  WebhookConfig, Flow, FlowStep, Session, AuditLog,  │   │
│  │  Module, AppSettings, AIProvider                    │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│            Caching Layer (Optional)                          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Redis: Session management, API caching             │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│            External Integrations                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  • Playwright (Test Recording & Execution)           │   │
│  │  • Allure (Test Reporting & Enrichment)              │   │
│  │  • AI Providers (9 providers: OpenAI, Claude,        │   │
│  │    Gemini, Groq, Ollama, Mistral, Cohere,            │   │
│  │    LocalAI, Custom)                                   │   │
│  │  • Docker (PostgreSQL, Redis, Ollama containers)     │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Backend Route Organization (14 Route Modules)

#### 1. **System Routes** (`/api/system/...`) - 15 endpoints
- Performance metrics and benchmarking
- Screenshot serving and management
- Bulletproof validation
- Regression prevention
- Allure report generation and management
- Error logging and tracking
- System status and diagnostics

#### 2. **Health Routes** (`/api/health`, `/api/ready`, `/api/live`) - 4 endpoints
- Container health checks (Docker HEALTHCHECK)
- Readiness probes (K8s ready)
- Liveness probes (K8s live)
- Database and service connectivity checks

#### 3. **Flow Routes** (`/api/flows/...`) - 16 endpoints
- Complete CRUD operations with atomic transactions
- Flow cloning and moving between folders
- Step-level reordering
- File content editing (atomic saves with rollback)
- Scenario file uploads (CSV, JSON, data files)
- Flow export and import
- Upload file management (presence checks, cleanup)

#### 4. **AI Routes** (`/api/ai/...`) - 22 endpoints
- Provider discovery and configuration (9 providers)
- Model search and testing (per-provider)
- Ollama auto-setup and model installation
- Provider toggle and primary selection
- Script analysis and modification
- Knowledge base management (CRUD operations)
- Knowledge base file uploads and syncing
- Usage tracking (per-provider and global)
- AI-powered test script generation

#### 5. **Execution Routes** (`/api/flows/:id/run`, `/api/execute/bulk`, `/api/runs/...`) - 9 endpoints
- Single flow execution (atomic with rollback)
- Bulk execution by tag (parallel/sequential modes)
- Run status tracking and real-time updates
- Execution history and statistics
- Run detail retrieval with steps and artifacts
- Execution monitoring and progress tracking

#### 6. **Folder Routes** (`/api/folders/...`) - 6 endpoints
- Folder CRUD operations with atomic transactions
- Folder cloning (recursive with all flows)
- Move scenarios between folders
- Hierarchical folder management
- Folder metadata and path resolution

#### 7. **User Routes** (`/api/users/...`, `/api/audit-logs`, `/api/modules`) - 7 endpoints
- User management (CRUD) with role-based access
- Password reset and profile updates
- Audit log tracking and retrieval
- Module configuration and feature toggles
- User activity monitoring

#### 8. **Auth Routes** (`/api/auth/...`) - 6 endpoints
- User authentication (login/logout with JWT)
- User registration with validation
- Profile management and updates
- Current user retrieval
- Password reset and recovery
- Session management

#### 9. **Settings Routes** (`/api/settings/...`, `/api/upload/...`) - 8 endpoints
- Application settings management (CRUD)
- File uploads (logos, icons, backgrounds, themes)
- Settings retrieval by category
- Bulk settings updates
- Settings validation and sanitization

#### 10. **Tag Routes** (`/api/tags/...`) - 3 endpoints
- Tag extraction from test files (AST parsing)
- Tag management for test organization
- Tag-based flow filtering and search

#### 11. **Recording Routes** (`/api/record/...`) - 5 endpoints
- Playwright codegen integration
- Recording start/stop/status management
- Recording diagnostics and troubleshooting
- Streaming recording watcher (real-time updates)
- File-first recording with AST parsing

#### 12. **Cleanup Routes** (`/api/cleanup/...`) - 7 endpoints
- Data retention policy management
- Artifact cleanup (screenshots, videos, reports)
- Orphaned data detection and removal
- Scheduled cleanup configuration
- Cleanup preview (dry-run mode)
- Manual cleanup triggers
- Cleanup history and statistics

#### 13. **Schedule Routes** (`/api/schedules/...`) - 9 endpoints
- Scheduled test execution management (CRUD)
- Cron expression validation
- Manual schedule triggers
- Schedule statistics and monitoring
- Enable/disable schedules
- Next run calculation with timezone support

#### 14. **Webhook Routes** (`/api/webhooks/...`) - 6 endpoints (Admin-only)
- Webhook configuration management (CRUD)
- Field-based payload selection (17 available fields)
- Test webhook with sample data
- Get field definitions and categories
- Support for multiple active webhooks
- Integration with all execution types (single, bulk, scheduled)

---

## 🔑 Key Features Implemented

### 1. **Test Management**
- ✅ Create, read, update, delete test flows
- ✅ Hierarchical folder organization
- ✅ Drag-and-drop reordering
- ✅ Flow cloning and templating
- ✅ Tag-based organization

### 2. **Test Recording**
- ✅ Playwright codegen integration
- ✅ Real-time step streaming
- ✅ AST parsing for step extraction
- ✅ File upload support for data-driven tests

### 3. **Test Execution**
- ✅ Single flow execution (atomic)
- ✅ Bulk execution by tag (parallel/sequential)
- ✅ Real-time progress via WebSockets
- ✅ Screenshot and video recording
- ✅ Allure report generation
- ✅ Execution history tracking

### 4. **AI-Powered Features**
- ✅ Multi-provider support (8 providers)
- ✅ Script analysis and modification
- ✅ Knowledge base integration
- ✅ Usage tracking and quota monitoring
- ✅ Provider auto-configuration (Ollama)

### 5. **Security & Authentication**
- ✅ JWT-based authentication
- ✅ Role-based access control (admin/user)
- ✅ API key encryption
- ✅ Rate limiting
- ✅ Security headers (Helmet)
- ✅ Audit logging

### 6. **Monitoring & Observability**
- ✅ System health checks (Docker healthchecks, K8s probes)
- ✅ Performance metrics and benchmarking
- ✅ Error tracking (frontend & backend)
- ✅ Bulletproof validation
- ✅ Regression prevention
- ✅ Real-time execution monitoring
- ✅ Audit logging (all user actions)

### 7. **Developer Experience**
- ✅ Hot reload (React + Node)
- ✅ Concurrent dev servers
- ✅ Docker Compose for local development
- ✅ Comprehensive error handling with stack traces
- ✅ API versioning support
- ✅ Request/response logging
- ✅ TypeScript in frontend
- ✅ Extensive documentation (20+ guides)

### 8. **Data Management & Cleanup**
- ✅ Automated data retention policies
- ✅ Artifact cleanup (screenshots, videos, reports)
- ✅ Orphaned data detection
- ✅ Scheduled cleanup tasks (node-cron)
- ✅ Manual cleanup triggers
- ✅ Cleanup preview (dry-run mode)
- ✅ Cleanup history tracking

### 9. **PWA & Mobile Support**
- ✅ Progressive Web App (installable)
- ✅ Service Worker for offline support
- ✅ Mobile-responsive design
- ✅ Touch-friendly interactions
- ✅ Mobile menu and navigation
- ✅ Adaptive backgrounds and themes

### 10. **Containerization & Deployment**
- ✅ Docker multi-stage builds
- ✅ Docker Compose orchestration
- ✅ PostgreSQL container
- ✅ Redis caching container
- ✅ Ollama AI container (local LLM)
- ✅ LocalAI support
- ✅ Health checks and readiness probes
- ✅ AWS deployment guide
- ✅ Production-ready configuration

---

## 📦 Project Structure

```
autonomous-qa/
├── backend/                    # Node.js/Express backend
│   ├── routes/                # 14 route modules (127 endpoints)
│   │   ├── aiRoutes.js       # AI providers (22 endpoints)
│   │   ├── flowRoutes.js     # Flow CRUD (16 endpoints)
│   │   ├── systemRoutes.js   # System metrics (15 endpoints)
│   │   ├── executionRoutes.js # Execution (9 endpoints)
│   │   ├── settingsRoutes.js # Settings (8 endpoints)
│   │   ├── cleanupRoutes.js  # Data retention (7 endpoints)
│   │   ├── userRoutes.js     # Users (7 endpoints)
│   │   ├── authRoutes.js     # Auth (6 endpoints)
│   │   ├── folderRoutes.js   # Folders (6 endpoints)
│   │   ├── recordingRoutes.js # Recording (5 endpoints)
│   │   ├── healthRoutes.js   # Health checks (4 endpoints)
│   │   └── tagRoutes.js      # Tags (3 endpoints)
│   ├── services/             # Business logic (66 services)
│   │   ├── atomic*/          # 9 atomic services with rollback
│   │   ├── ai/               # AI services (13 files)
│   │   │   ├── globalAIService.js
│   │   │   ├── providers/    # 9 AI providers + base
│   │   │   ├── knowledgeBaseManager.js
│   │   │   ├── providerRegistryService.js
│   │   │   ├── aiStepExtractor.js
│   │   │   └── usageTracker.js
│   │   ├── allure/           # Allure services (7 modules)
│   │   ├── configuration/    # Config repository
│   │   ├── database.js       # Prisma service
│   │   ├── execution.js      # Test execution
│   │   ├── cleanupService.js # Data retention
│   │   ├── auditService.js   # Audit logging
│   │   ├── recordingService.js
│   │   ├── monitoringService.js
│   │   └── ...
│   ├── middleware/           # Request processing (11 middleware)
│   │   ├── authMiddleware.js       # JWT authentication
│   │   ├── auditMiddleware.js      # Audit logging
│   │   ├── csrfProtection.js       # CSRF tokens
│   │   ├── errorHandler.js         # Global errors
│   │   ├── validation.js           # Request validation
│   │   ├── apiEnhancements.js      # API monitoring
│   │   ├── securityEnhancements.js # Helmet, rate limiting
│   │   ├── caching.js              # Response caching
│   │   ├── compression.js          # Gzip/Brotli compression
│   │   ├── healthCheck.js          # Container health probes
│   │   └── requestLogger.js        # Structured request logging
│   ├── config/               # Configuration
│   │   ├── paths.js          # Path resolution
│   │   └── playwright.config.js
│   ├── scheduler/            # Scheduled tasks
│   │   └── cleanupScheduler.js
│   └── server.js             # Main server file
├── frontend/                 # React/TypeScript frontend
│   ├── src/
│   │   ├── components/       # React components (152+)
│   │   │   ├── common/       # 50+ reusable components
│   │   │   ├── settings/     # Settings pages
│   │   │   ├── errors/       # Error pages
│   │   │   └── ...
│   │   ├── context/          # State management (7 contexts)
│   │   ├── contexts/         # Additional contexts
│   │   ├── hooks/            # Custom React hooks (5+)
│   │   ├── utils/            # Utility functions
│   │   ├── mocks/            # MSW mock handlers
│   │   ├── test/             # Test utilities
│   │   ├── data/             # Static data (licenses)
│   │   └── App.tsx           # Main app component
│   ├── public/               # Static assets
│   │   ├── icons/            # PWA icons
│   │   ├── svg/              # 115 SVG files
│   │   ├── manifest.json     # PWA manifest
│   │   ├── service-worker.js # Service worker
│   │   └── offline.html      # Offline fallback
│   └── e2e/                  # E2E tests
├── recordings/               # Generated Playwright scripts
├── data/                     # File-based storage
│   ├── flows/                # Flow JSON files
│   ├── screenshots/          # Test screenshots
│   └── knowledge-base/       # AI knowledge base
├── allure-reports/           # Generated test reports
├── allure-results/           # Allure test results
├── prisma/                   # Database schema & migrations
│   └── schema.prisma         # 19 tables definition
├── tests/                    # Test files
├── docker/                   # Docker configurations
│   ├── backend/              # Backend Dockerfile
│   └── frontend/             # Frontend Dockerfile + nginx
├── scripts/                  # Utility scripts
├── docs/                     # Documentation (20+ guides)
├── ssl/                      # SSL certificates (optional)
├── temp-uploads/             # Temporary upload storage
├── docker-compose.yml        # Main compose file
├── docker-compose.dev.yml    # Development compose
├── docker-compose.prod.yml   # Production compose
├── package.json              # Root dependencies
├── README.md                 # Project documentation
└── PROJECT_OVERVIEW.md       # This file
```

---

## 🚀 Recent Major Implementations

### Phase 1-3: Foundation
- PostgreSQL database integration
- Prisma ORM setup
- File-first recording system
- AST parsing for Playwright scripts

### Phase 4-5: Execution & Reporting
- Atomic execution engine
- Bulk execution by tag
- Allure report integration
- WebSocket real-time updates

### Phase 6-7: Monitoring & Enhancement
- System monitoring service
- Performance benchmarking
- API enhancements (compression, versioning)
- Security enhancements (headers, rate limiting)

### Phase 8: AI Integration
- Multi-provider AI support (9 providers)
- Script analysis and modification
- Knowledge base management with file uploads
- Usage tracking per-provider
- Ollama auto-setup and model installation
- LocalAI integration

### Phase 9: Refactoring & Enhancement
- Modular route structure (108 endpoints organized into 12 modules)
- Atomic services architecture (9 atomic services)
- File upload management with cleanup
- Tag-based test organization
- Data retention and cleanup system
- CSRF protection implementation
- Audit middleware for compliance

### Phase 10: Testing & Quality
- Frontend unit testing (Jest + React Testing Library)
- E2E testing (Playwright)
- Integration testing
- Accessibility testing (jest-axe, axe-core)
- Mock Service Worker (MSW) for API mocking
- Test coverage reports
- 50+ component tests

### Phase 11: PWA & Mobile
- Progressive Web App implementation
- Service Worker for offline support
- Mobile-responsive design
- Touch-friendly UI components
- Adaptive layouts and themes
- Mobile menu system
- Performance optimization

### Phase 12: Containerization
- Docker multi-container setup
- PostgreSQL, Redis, Ollama containers
- Docker Compose orchestration
- Health checks and readiness probes
- Production and development configurations
- Volume management for persistence
- Network isolation

---

## 🔧 Configuration

### Environment Variables
- `PORT` - Backend server port (default: 5000)
- `DATABASE_URL` - PostgreSQL connection string (Prisma)
- `JWT_SECRET` - JWT signing key for authentication
- `NODE_ENV` - Environment (development/production/test)
- `DB_PASSWORD` - PostgreSQL password (Docker setup)
- `REDIS_URL` - Redis connection string (optional)
- `BACKEND_URL` - Backend URL for API and Allure report serving (webhook notifications)
- `FRONTEND_URL` - Frontend URL for application links
- `AI_PROVIDER_*` - AI provider API keys (encrypted in DB)
- `ALLURE_RESULTS_DIR` - Allure results directory
- `RECORDINGS_DIR` - Playwright recordings directory

### Database Schema
- Managed via Prisma migrations
- Schema location: `prisma/schema.prisma`
- Supports PostgreSQL 12+ (recommended: PostgreSQL 16)
- 19 tables with full relational integrity
- Cascade deletes for data cleanup
- 33 indexes + 7 unique constraints for performance optimization
- JSONB columns for flexible metadata storage

---

## 📈 Performance Metrics

- **API Response Time**: < 100ms (avg)
- **Execution Performance**: Parallel execution with worker pools
- **Real-time Updates**: WebSocket-based (< 50ms latency)
- **Database Queries**: Optimized with Prisma
- **File Operations**: Async/await throughout
- **Error Handling**: Multi-layer with rollback support

---

## 🧪 Test Coverage Analysis

> **Detailed Analysis**: See `docs/TEST_COVERAGE_ANALYSIS.md` for complete breakdown

### Backend Test Coverage (December 2025)

| Category | Tests | Coverage | Status |
|----------|-------|----------|--------|
| **Total Backend Tests** | 4,787 | 85% avg | ✅ Good |
| **Unit Tests** | 93 files | 4,617 tests | ✅ Comprehensive |
| **Integration Tests** | 8 files | 170 tests | ✅ Route coverage |
| **Skipped Tests** | - | 8 tests | ⏭️ Skipped |

#### Backend Test Structure
```
backend/tests/
├── unit/
│   ├── errors/        (1 test file)
│   ├── middleware/    (11 test files)
│   ├── routes/        (10 test files)
│   ├── scheduler/     (1 test file)
│   ├── services/      (64 test files)
│   └── utils/         (6 test files)
├── integration/
│   └── routes/        (8 test files)
├── mocks/             (3 mock files)
└── helpers/           (4 helper files)
```

#### Files at 100% Coverage (45+ files)
- All atomic services (atomicFlowSaveService, atomicFolderCloneService, etc.)
- All AI providers (ClaudeProvider, GeminiProvider, GroqProvider, etc.)
- Core services (auditService, authService, scheduleService, globalAIService)
- Key middleware (authMiddleware, auditMiddleware, caching, compression)
- All utils (pagination, responseOptimizer, timeoutConfigResolver)

#### Files Needing Work
| Priority | File | Coverage |
|----------|------|----------|
| Critical | AllureEnrichmentService.js | 32.66% |
| Critical | authRoutes.js | 64.28% |
| Medium | atomicParameterService.js | 74.68% |

### Frontend Test Coverage (December 2025)

| Category | Tests | Coverage | Status |
|----------|-------|----------|--------|
| **Total Frontend Tests** | 3,791 | 70% avg | ✅ Good |
| **Component Tests** | 90 files | ~3,200 tests | ✅ Comprehensive |
| **Context Tests** | 6 files | ~200 tests | ✅ State management |
| **Hook Tests** | 5 files | ~150 tests | ✅ Custom hooks |
| **Utility Tests** | 8 files | ~200 tests | ✅ Helper functions |
| **Skipped Tests** | 3 files | 11 tests | ⏭️ Mock limitations |

#### Skipped Frontend Tests (11 total)
- **WebhookModal.test.tsx (9 tests)**: Mocked Input components don't properly trigger React state updates. Component works correctly in production.
- **FlowRecorder.test.tsx (2 tests)**: Complex window.postMessage mocking for recorder window communication.

#### Frontend Test Structure
```
frontend/src/
├── components/
│   ├── __tests__/         (18 test files)
│   ├── common/__tests__/  (58 test files)
│   ├── ai/__tests__/      (1 test file)
│   ├── errors/__tests__/  (1 test file)
│   ├── modals/__tests__/  (3 test files)
│   └── recordings/__tests__/ (1 test file)
├── context/__tests__/     (5 test files)
├── contexts/__tests__/    (1 test file)
├── hooks/__tests__/       (5 test files)
└── utils/__tests__/       (8 test files)
```

#### Files Needing Work
| Priority | File | Coverage |
|----------|------|----------|
| Critical | App.tsx | 0% (no test) |
| Critical | FlowEditor.tsx | 0.61% |
| Critical | TestFlowContext.tsx | 0.87% |
| Critical | GlobalPipelineModal.tsx | 18.03% |
| High | Dashboard.tsx | 46.40% |
| High | AIConfiguration.tsx | 48.22% |

### Running Tests

```bash
# Backend tests with coverage
cd backend && npx jest --coverage

# Individual backend file
cd backend && npx jest tests/unit/services/FILE.test.js --coverage --collectCoverageFrom="services/FILE.js"

# Frontend tests with coverage
cd frontend && npx jest --coverage --testPathIgnorePatterns="e2e"

# Individual frontend file
cd frontend && npx jest --testPathPattern="FILE.test" --coverage
```

---

## 🎯 Use Cases

1. **Test Automation Teams**
   - Record, organize, and execute web tests
   - Generate comprehensive reports
   - Track test execution history

2. **QA Engineers**
   - Create data-driven test scenarios
   - Use AI to enhance test scripts
   - Organize tests by tags and folders

3. **Dev Teams**
   - CI/CD integration via bulk execution
   - Regression testing automation
   - Performance monitoring

4. **Test Managers**
   - Dashboard for test execution stats
   - Audit logs for compliance
   - Allure reports for stakeholders

---

## 📚 Documentation

### Setup & Installation
- **Installation Guide**: `INSTALLATION_GUIDE.md`
- **Quick Start**: `QUICK_START.md`, `START_HERE.md`
- **PostgreSQL Setup**: `POSTGRESQL_SETUP_COMPLETE.md`, `QUICK_START_POSTGRESQL.md`
- **Java Installation**: `INSTALL_JAVA_SIMPLE.md`, `JAVA_INSTALLATION_GUIDE.md`
- **Complete Setup**: `COMPLETE_SETUP_GUIDE.md`

### Deployment & Docker
- **Docker Quick Start**: `DOCKER-QUICK-START.md`
- **Docker Deployment**: `docs/DOCKER-DEPLOYMENT.md`
- **Docker Troubleshooting**: `docs/DOCKER-TROUBLESHOOTING.md`
- **AWS Production**: `AWS_PRODUCTION_DEPLOYMENT.md`
- **Deployment Ready**: `DEPLOYMENT-READY-SUMMARY.md`

### Development Guides
- **Architecture Design**: `ARCHITECTURE-DESIGN.md`
- **API Documentation**: `docs/API_DOCUMENTATION.md` and `/api/system/status`
- **Code Documentation**: `docs/CODE_DOCUMENTATION.md`
- **Frontend Architecture**: `docs/frontend/FRONTEND_ARCHITECTURE.md`
- **Startup Guide**: `docs/START-APP-GUIDE.md`

### Testing & Quality
- **Testing Guide**: `docs/TESTING-GUIDE.md`
- **Test Suite Documentation**: `docs/TEST_SUITE_DOCUMENTATION.md` ← **NEW** (Complete file-by-file breakdown)
- **Test Coverage Analysis**: `docs/TEST_COVERAGE_ANALYSIS.md` ← **NEW** (Coverage percentages)
- **Unit Test Upgrade Template**: `docs/prompts/PROMPT_TEMPLATE_UNIT_TEST_UPGRADE.md`
- **User Testing Flows**: `docs/USER_TESTING_FLOWS.md`
- **Accessibility Testing**: `docs/ACCESSIBILITY-TESTING-GUIDE.md`

### Feature Guides
- **AI Models Guide**: `docs/AI-MODELS-GUIDE.md`
- **PWA Guide**: `docs/PWA-GUIDE.md`
- **Image Optimization**: `docs/IMAGE-OPTIMIZATION-GUIDE.md`
- **Bundle Optimization**: `docs/BUNDLE-OPTIMIZATION-GUIDE.md`

### Implementation History
- **Phase 1-6**: Mobile, Accessibility, Performance, Testing, Security
- **Phase 8+**: AI Integration, Refactoring, PWA, Containerization
- **Complete Implementation**: `🎉-IMPLEMENTATION-COMPLETE.md`

---

## 🤝 Contributing

The project follows industry-standard practices:
- Modular architecture
- Atomic operations with rollback
- Comprehensive error handling
- Security-first approach
- Real-time communication
- Extensible design

---

## 📝 License

ISC License - See LICENSE file for details

---

**Last Updated**: December 11, 2025 (Tests verified)  
**Version**: 1.0.0  
**Total Lines of Code**: 55,000+ (Backend: ~22K, Frontend: ~33K)  
**Test Coverage**: Backend: 85% (4,779 passing), Frontend: 70% (3,780 passing) - All tests pass ✅  
**Detailed Coverage**: See `docs/TEST_COVERAGE_ANALYSIS.md`  
**Maintainer**: Development Team

---

## 🎖️ Project Highlights

### Technical Excellence
- ✅ **Modular Architecture**: 14 route modules, 66 services, 7 middleware layers
- ✅ **Atomic Operations**: All CRUD operations with transaction rollback support
- ✅ **Type Safety**: TypeScript in frontend, JSDoc in backend
- ✅ **Error Handling**: Multi-layer error handling with comprehensive logging
- ✅ **Real-time Updates**: WebSocket integration for live test monitoring
- ✅ **Security First**: JWT, CSRF, RBAC, rate limiting, audit logging

### Scalability & Performance
- ✅ **Database Optimization**: Indexed tables, JSONB for flexibility, cascade deletes
- ✅ **Caching Strategy**: Redis support for session management
- ✅ **Compression**: Response compression for API efficiency
- ✅ **Containerization**: Docker multi-stage builds with health checks
- ✅ **Horizontal Scaling**: Stateless design ready for load balancing

### Developer Experience
- ✅ **Comprehensive Documentation**: 20+ guides covering all aspects
- ✅ **Hot Reload**: Both frontend and backend support hot reload
- ✅ **Testing**: Unit, integration, E2E, and accessibility testing
- ✅ **Code Quality**: ESLint, Prettier, code coverage reports
- ✅ **Easy Setup**: One-command Docker setup or manual installation

### Production Readiness
- ✅ **Deployment Guides**: Docker Compose, AWS, and manual deployment
- ✅ **Health Checks**: Docker HEALTHCHECK and Kubernetes probes
- ✅ **Monitoring**: System metrics, performance benchmarks, error tracking
- ✅ **Data Retention**: Automated cleanup with configurable policies
- ✅ **Audit Trail**: Complete user activity logging for compliance

### AI Integration
- ✅ **Multi-Provider**: 9 AI providers with fallback support
- ✅ **Auto-Configuration**: Ollama auto-setup with model installation
- ✅ **Knowledge Base**: Uploadable knowledge base for context-aware AI
- ✅ **Usage Tracking**: Per-provider usage monitoring and quota management
- ✅ **Script Analysis**: AI-powered test script analysis and modification

---

## 📊 Key Metrics Summary

| Metric | Value |
|--------|-------|
| **Total API Endpoints** | 127 |
| **Route Modules** | 14 |
| **Backend Services** | 66 |
| **Middleware Layers** | 11 |
| **Database Tables** | 19 |
| **AI Providers** | 9 |
| **Frontend Components** | 152+ |
| **React Contexts** | 7 |
| **Custom Hooks** | 5+ |
| **Backend Test Files** | 101 (93 unit + 8 integration) |
| **Frontend Test Files** | 110 component/context/hook/util tests |
| **Total Backend Tests** | 4,787 (4,779 passed, 8 skipped) |
| **Total Frontend Tests** | 3,791 (3,780 passed, 11 skipped) |
| **Total All Tests** | 8,578 (8,559 passed, 19 skipped) |
| **Documentation Files** | 20+ |
| **SVG Assets** | 115 |
| **NPM Packages** | 89 |
| **Lines of Code** | 55,000+ |

---

## 🚦 Quick Start Commands

### Development
```bash
# Start both frontend and backend
npm run dev

# Or start individually
npm run dev:front  # Frontend only
npm run dev:back   # Backend only
```

### Docker (Recommended)
```bash
# Build and start all containers
docker-compose up -d

# View logs
docker-compose logs -f

# Stop containers
docker-compose down
```

### Testing
```bash
# Frontend tests
cd frontend && npm test

# E2E tests
npm run test:e2e

# Backend tests
npm test
```

### Production Build
```bash
# Build frontend
cd frontend && npm run build

# Start production server
cd backend && node server.js
```

---

## 🔗 Related Resources

- **GitHub Repository**: [Link to repository]
- **Live Demo**: [Link to demo if available]
- **API Documentation**: http://localhost:5000/api/system/status
- **Allure Reports**: http://localhost:5000/allure-reports
- **Docker Hub**: [Link if published]

---

**Built with ❤️ by the Development Team**  
**For questions or support, please refer to the documentation guides.**

