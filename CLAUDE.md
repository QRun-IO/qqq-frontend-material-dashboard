# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

```bash
# Install dependencies (required due to peer dependency conflicts)
npm run install:legacy

# Development server (http://localhost:3000)
npm start

# Production build
npm run build

# Full Maven build (frontend + Java packaging)
mvn clean package -Pci

# Run tests
npm test

# Type checking
npm run type-check

# Linting
npm run lint
npm run lint:fix
```

## Architecture Overview

This is a **metadata-driven React dashboard** that dynamically generates UI from QQQ backend metadata. The backend defines tables, processes, and apps; this frontend renders them without per-entity frontend code.

### Data Flow

```
QQQ Backend (Java)
    │
    ▼ /metaData endpoint
@qrunio/qqq-frontend-core (npm)
    │ TypeScript models (QInstance, QTableMetaData, etc.)
    ▼
qqq-frontend-material-dashboard
    │ Dynamic route generation
    ▼
MUI components + generated screens
```

### Key Entry Points

- `src/App.tsx` - Main app, authentication, route generation from metadata
- `src/QContext.tsx` - Global state (accentColor, tableMetaData, modalStack, branding)
- `src/qqq/utils/qqq/Client.ts` - Singleton wrapper for `@qrunio/qqq-frontend-core` API client
- `src/qqq/components/legacy/Theme.ts` - MUI theme configuration

### Source Structure

```
src/qqq/
├── assets/theme/          # MUI theme tokens (colors, typography, shadows)
│   ├── base/              # Design tokens: colors.ts, typography.ts, boxShadows.ts
│   └── components/        # 55 MUI component style overrides
├── components/
│   ├── horseshoe/         # Core layout: SideNav, NavBar, Footer, Breadcrumbs
│   ├── forms/             # DynamicForm, EntityForm, field components
│   ├── widgets/           # Dashboard widgets, charts, statistics
│   ├── query/             # Table filtering components
│   └── legacy/            # Material Dashboard 2 PRO base components, Theme.ts
├── pages/
│   ├── apps/              # App home pages
│   ├── records/           # CRUD screens: query/, create/, edit/, view/
│   └── processes/         # ProcessRun, ReportRun
├── authorization/         # Auth0, OAuth2, Anonymous auth modules
├── context/               # MaterialUIControllerProvider
├── styles/                # qqq-override-styles.css, globals.scss
└── utils/qqq/             # Client.ts, ProcessUtils, TableUtils
```

### Route Generation

Routes are dynamically created from `QInstance.appTree` metadata in `App.tsx`:

- Apps become sidebar navigation entries
- Tables get CRUD routes: `/app/{table}`, `/app/{table}/create`, `/app/{table}/:id`, `/app/{table}/:id/edit`
- Processes get execution routes under their parent table or app

## Cross-Repository Dependencies

This project is part of a three-repo system:

| Repository | Artifact | Current Version |
|------------|----------|-----------------|
| qqq (backend-core) | `com.kingsrook.qqq:qqq-backend-core` | `0.36.0` |
| qqq-frontend-core | `@qrunio/qqq-frontend-core` | `1.4.2` |
| qqq-frontend-material-dashboard | `com.kingsrook.qqq:qqq-frontend-material-dashboard` | `0.36.0-RC.4` |

**Dependency order for commits/publishes:** backend-core → frontend-core → dashboard

## Dependencies

### Core Dependencies

- `@qrunio/qqq-frontend-core` - QQQ data models and API client (no UI)
- `@mui/material` 5.11.1 - Component library
- `@mui/x-data-grid-pro` - Data grid (requires license key)
- `react-router-dom` 6.x - Routing

### Authentication

- `@auth0/auth0-react` - Auth0 integration
- `oidc-client-ts` + `react-oidc-context` - OAuth2/OIDC

### Peer Dependency Note

This project requires `--legacy-peer-deps` due to React 18 conflicts with some MUI dependencies. Always use `npm run install:legacy` for installation.

## Environment Variables

```env
REACT_APP_QQQ_API_BASE_URL=https://your-qqq-server.com/api
REACT_APP_MATERIAL_UI_LICENSE_KEY=your-mui-license
REACT_APP_AUTH0_DOMAIN=your-domain.auth0.com
REACT_APP_AUTH0_CLIENT_ID=your-client-id
```

## Context Providers

The app uses two main context providers:

1. **MaterialUIControllerProvider** (`src/qqq/context/index.tsx`)
   - `miniSidenav`, `sidenavColor`, `darkMode`, `direction`

2. **QContext** (`src/QContext.tsx`)
   - `accentColor`, `accentColorLight` - Theme colors
   - `tableMetaData`, `tableProcesses` - Current table context
   - `modalStack` - Nested modal management
   - `branding` - Backend branding metadata
   - `pathToLabelMap` - Route breadcrumb labels

## Working with QQQ Backend

The dashboard expects a QQQ backend serving:
- `GET /metaData` - Returns `QInstance` with apps, tables, processes, branding
- `GET /qqq/v1/*` - CRUD operations, process execution

The `Client.ts` singleton handles all API communication and 401 redirects to logout.

## Backend Asset Overlay System

QQQ backend supports a `material-dashboard-overlay/` directory for serving custom static assets (logos, icons, images) alongside the dashboard.

### How It Works

1. **Backend setup** (in your QQQ Java project):
   ```
   src/main/resources/material-dashboard-overlay/
   ├── my-logo.png
   ├── my-icon.png
   └── other-assets/
   ```

2. **Branding configuration** (in Java MetaDataProvider):
   ```java
   qInstance.setBranding(new QBrandingMetaData()
      .withLogo("/my-logo.png")
      .withIcon("/my-icon.png")
      .withAccentColor("#1976D2")
      .withAppName("My App"));
   ```

3. **Frontend resolution**: Assets are served at web root, and `resolveAssetUrl()` in `PathUtils.ts` handles base path resolution.

## Testing

### Visual Regression Tests (Playwright)

18 Playwright screenshot tests verify UI appearance doesn't regress. Uses **dual-platform snapshots** for CI (Linux) and local development (macOS).

```bash
# Run visual regression tests (uses platform-appropriate snapshots automatically)
npm run e2e

# Regenerate Linux snapshots (for CI) - requires Docker
./scripts/update-snapshots-linux.sh

# Regenerate macOS snapshots (for local dev)
./scripts/update-snapshots-mac.sh
```

Key files:
- `playwright.config.ts` - Configuration with `{platform}` in snapshot paths
- `e2e/fixture-server.js` - Node.js server for fixture JSON (port 8001)
- `e2e/tests/visual-regression.spec.ts` - 18 screenshot tests
- `e2e/snapshots/.../linux/` - Linux snapshots (for CI)
- `e2e/snapshots/.../darwin/` - macOS snapshots (for local dev)

**Dual-Platform Workflow:** Playwright automatically selects the correct snapshots based on platform. Update both when making visual changes.

### Selenium Integration Tests

Selenium tests use a two-server setup:
- **React dev server** on port 3001 - serves the dashboard frontend
- **Javalin mock server** on port 8001 - serves fixture JSON responses

```bash
# Manual run (requires React server running)
PORT=3001 REACT_APP_PROXY_LOCALHOST_PORT=8001 npm start &
QQQ_SELENIUM_HEADLESS=true mvn test -Dtest="**/selenium/tests/*IT"
```

Key test classes:
- `QBaseSeleniumTest` - Base class, starts Javalin on 8001
- `QSeleniumJavalin` - Serves fixture JSON from `src/test/resources/fixtures/`
- `ServerHealthChecker` - Waits for React server readiness

### Test Fixtures

Located in `src/test/resources/fixtures/metaData/`:
- `index.json` - Default metaData response (used by visual regression tests)

### CI/CD

CircleCI runs both test suites:
- **Playwright tests** - Custom job using `mcr.microsoft.com/playwright:v1.57.0-jammy`
- **Selenium tests** - Via `qqq-orb/mvn_frontend_test_only`

## Session State & Continuity

**IMPORTANT:** Never use `~/.claude/session-state.md`. Always use local repo files.

### On "continue from last session"

Read these files in order:
1. `docs/SESSION_STATE.md` - Current status, branch, recent commits, next steps
2. `docs/TODO.md` - Active and completed tasks
3. This file (`CLAUDE.md`) - Project context

### Current Status (as of 2026-01-18)

| Item | Value |
|------|-------|
<<<<<<< HEAD
| Branch | `feature/371-Anonymous-auth-module` |
| Version | `0.40.0-SNAPSHOT` |
| PR | #131 (awaiting approval from @darinkelkhoff) |
| Issues | #371, #374, #375, #339 (all close on merge) |

### Recent Activity

- **PR #131** - Auth module enhancements (anonymous auth, OAuth2 scopes, logout fixes)
- **Issue #339** - Clear both `sessionUUID` and `sessionId` cookies on logout
- **Issue #375** - Call `/qqq/v1/logout` backend endpoint before client cleanup
- **GitHub Security** - Added `Secure` flag to cookie clearing per code scan
- **qqq-orb v0.6.1** - Fixed version commit skip for feature branches
- **Dual-platform snapshots** - linux/ for CI, darwin/ for local dev
=======
| Branch | `develop` |
| Version | `0.40.0-SNAPSHOT` |
| Release Branch | `release/0.36.0` at `0.36.0-RC.4` |
| Theme Code | Removed from both branches |

### Recent Activity

- **develop reset** - Force pushed from RC4 base for clean history
- **RC.4 Published** - Theming feature reverted, visual regression tests added
- **Issue #128** - Pluggable themes caused visual regressions, reverted entirely
- **18 visual regression tests** - Playwright screenshot tests with Docker-based generation
>>>>>>> b8f8af0 (docs: update session state after develop reset)

### Test Status

| Suite | Tests | Status |
|-------|-------|--------|
| Playwright visual regression | 18 | PASS (both platforms) |
| Selenium fixture-based | ~100 | PASS |

### Pending Work

- Wait for PR #131 approval from @darinkelkhoff
- Merge PR #131 to develop (auto-closes #371, #374, #375, #339)

### Key Documentation Files

| File | Purpose |
|------|---------|
| `docs/SESSION_STATE.md` | Current work status, branch, version, recent commits |
| `docs/TODO.md` | Task tracking for current feature |

### Publishing

Release candidates publish automatically on `release/*` branches via CircleCI `publish_release_candidate` workflow.

Snapshots publish on `develop` via `publish_snapshot` workflow.
