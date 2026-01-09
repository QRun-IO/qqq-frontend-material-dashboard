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

- `src/App.tsx` - Main app, authentication, route generation from metadata, theme provider, BrandedHeaderBar
- `src/QContext.tsx` - Global state (accentColor, tableMetaData, modalStack, branding)
- `src/qqq/utils/qqq/Client.ts` - Singleton wrapper for `@qrunio/qqq-frontend-core` API client
- `src/qqq/utils/themeUtils.ts` - Theme CSS variable injection and font loading

### Source Structure

```
src/qqq/
├── assets/theme/          # MUI theme tokens (colors, typography, shadows)
│   ├── base/              # Design tokens: colors.ts, typography.ts, boxShadows.ts
│   └── components/        # 55 MUI component style overrides
├── components/
│   ├── horseshoe/         # Core layout: SideNav, NavBar, Footer, Breadcrumbs, BrandedHeaderBar
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

## Pluggable Themes System (Implemented)

### Overview

The dashboard supports **runtime theme customization** via CSS custom properties. Theme configuration is defined in `QThemeMetaData` on the Java backend and injected as `--qqq-*` CSS variables by `themeUtils.ts`.

### Theme Configuration (Java Backend)

```java
qInstance.setTheme(new QThemeMetaData()
   .withPrimaryColor("#1976D2")
   .withSidebarBackgroundColor("#1E1E2D")
   .withBrandedHeaderEnabled(true)
   .withBrandedHeaderTagline("My Application"));
```

### Available Theme Properties (60+)

| Category | Properties |
|----------|------------|
| **Core Colors** | `primaryColor`, `secondaryColor`, `backgroundColor`, `surfaceColor`, `textPrimary`, `textSecondary`, `errorColor`, `warningColor`, `successColor`, `infoColor` |
| **Typography Base** | `fontFamily`, `headerFontFamily`, `monoFontFamily`, `fontSizeBase`, `fontWeightLight`, `fontWeightRegular`, `fontWeightMedium`, `fontWeightBold` |
| **Typography Variants** | `typographyH1FontSize`, `typographyH1FontWeight`, `typographyH1LineHeight`, `typographyH1LetterSpacing`, `typographyH1TextTransform` (same pattern for H2-H6, Body1, Body2, Button, Caption) |
| **Branded Header** | `brandedHeaderEnabled`, `brandedHeaderBackgroundColor`, `brandedHeaderTextColor`, `brandedHeaderLogoPath`, `brandedHeaderLogoAltText`, `brandedHeaderHeight`, `brandedHeaderTagline` |
| **App Bar** | `appBarBackgroundColor`, `appBarTextColor` |
| **Sidebar** | `sidebarBackgroundColor`, `sidebarTextColor`, `sidebarIconColor`, `sidebarSelectedBackgroundColor`, `sidebarSelectedTextColor`, `sidebarHoverBackgroundColor`, `sidebarDividerColor` |
| **Tables** | `tableHeaderBackgroundColor`, `tableHeaderTextColor`, `tableRowHoverColor`, `tableRowSelectedColor`, `tableBorderColor` |
| **General** | `dividerColor`, `borderColor`, `cardBorderColor`, `borderRadius`, `density`, `iconStyle` |
| **Assets** | `logoPath`, `iconPath`, `faviconPath` |
| **Custom** | `customCss` (raw CSS injection) |

### CSS Variables

All properties become CSS variables with `--qqq-` prefix:
- `primaryColor` → `--qqq-primary-color`
- `sidebarBackgroundColor` → `--qqq-sidebar-background-color`

Additional generated variables:
- Grey scale: `--qqq-grey-100` through `--qqq-grey-900`
- Charts: `--qqq-chart-grid-color`, `--qqq-chart-text-color`, `--qqq-chart-background-color`
- Links: `--qqq-link-color`
- Spacing: `--qqq-spacing-base`, `--qqq-spacing-small`, `--qqq-spacing-medium`, `--qqq-spacing-large`
- Actions: `--qqq-action-active`, `--qqq-action-hover`, `--qqq-action-selected`, `--qqq-action-disabled`
- Status variants: `--qqq-info-light`, `--qqq-info-dark`, etc.

Component-specific variables (override via customCss):
- Stepper: `--qqq-stepper-inactive-color`
- Tooltip: `--qqq-tooltip-background-color`, `--qqq-tooltip-text-color`, `--qqq-tooltip-shadow`
- Inputs: `--qqq-input-border-color`
- Menu: `--qqq-menu-hover-color`
- Switch: `--qqq-switch-track-color`

### Key Files

- `src/qqq/utils/themeUtils.ts` - CSS variable injection, font loading
- `src/qqq/components/horseshoe/BrandedHeaderBar.tsx` - Optional header banner
- `src/qqq/styles/qqq-override-styles.css` - CSS variable overrides for MUI components

### Documentation

- `docs/QQQ_THEMING_GUIDE.md` - Complete theming reference for LLMs/developers
- `docs/QQQ_CSS_SELECTORS_GUIDE.md` - CSS selector reference for targeting UI elements

## CSS Selectors System (Implemented)

### Overview

All major UI elements have stable `data-qqq-id` attributes for targeted styling via `QThemeMetaData.customCss`. IDs are generated from element names using `sanitizeId()` which converts to lowercase and replaces non-alphanumeric characters with hyphens.

### Key Files

- `src/qqq/utils/qqqIdUtils.ts` - ID sanitization utilities
- `src/qqq/context/QqqIdContext.tsx` - Optional scope context provider

### Selector Patterns

| Element | Pattern | Example |
|---------|---------|---------|
| Buttons | `button-{text}` | `button-save` |
| Icon buttons | `button-icon-{icon}` | `button-icon-delete` |
| Menu items | `menu-item-{text}` | `menu-item-bulk-edit` |
| Nav items | `sidenav-{name}` | `sidenav-orders` |
| Inputs | `input-{field}` | `input-first-name` |
| Selects | `select-{field}` | `select-status` |
| Table headers | `table-header-{field}` | `table-header-order-id` |
| Record view | `record-view-{element}-{table}` | `record-view-header-orders` |
| Record create | `record-create-{element}-{table}` | `record-create-title-person` |
| Record edit | `record-edit-{element}-{table}` | `record-edit-avatar-customer` |
| Sections | `record-section-{name}` | `record-section-identity` |
| Form sections | `form-section-{name}` | `form-section-details` |
| Sidebar items | `sidebar-item-{name}` | `sidebar-item-identity` |
| Table cards | `table-card-{name}` | `table-card-orders` |
| Process cards | `process-card-{name}` | `process-card-bulk-load` |
| App headers | `app-header-{name}` | `app-header-inventory` |

### Example CSS Usage

```css
/* Hide delete menu item */
[data-qqq-id="menu-item-delete"] { display: none; }

/* Style specific table view header */
[data-qqq-id="record-view-header-orders"] {
   background: linear-gradient(to right, #1976D2, #42A5F5);
}

/* Style all sidebar items */
[data-qqq-id^="sidebar-item-"] {
   border-left: 3px solid transparent;
}
```

## Cross-Repository Dependencies

This project is part of a three-repo theming system:

| Repository | Artifact | Current Version |
|------------|----------|-----------------|
| qqq (backend-core) | `com.kingsrook.qqq:qqq-backend-core` | `0.36.0-SNAPSHOT` |
| qqq-frontend-core | `@qrunio/qqq-frontend-core` | `1.4.2-SNAPSHOT` |
| qqq-frontend-material-dashboard | `com.kingsrook.qqq:qqq-frontend-material-dashboard` | `0.36.0-pluggable-themes-css-selectors-SNAPSHOT` |

**Feature branch version:** `0.36.0-pluggable-themes-css-selectors-SNAPSHOT` (for testing pluggable themes + CSS selectors)

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

### What the Overlay Does vs. What Pluggable Themes Does

| Capability | Overlay | Pluggable Themes |
|------------|---------|------------------|
| Logo/icon | Yes | Yes |
| Single accent color | Yes | Yes |
| Full color palette | No | Yes |
| Typography/fonts | No | Yes |
| Spacing system | No | Yes |
| Component styles | No | Yes |
| Dark mode | No | Yes |
| Runtime switching | Partial (accentColor) | Full |

The overlay system handles **branding assets** (logos, icons). Pluggable themes handles **comprehensive styling** (colors, typography, shadows, component overrides).

## Selenium Testing

### Test Architecture

Tests use a two-server setup:
- **React dev server** on port 3001 - serves the dashboard frontend
- **Javalin mock server** on port 8001 - serves fixture JSON responses

```bash
# Start React dev server for tests
PORT=3001 REACT_APP_PROXY_LOCALHOST_PORT=8001 npm start

# Run theme tests (in another terminal)
QQQ_SELENIUM_HEADLESS=true mvn test -Dtest=ThemeIT
```

### CI/CD

CircleCI uses `qqq-orb` which automatically:
1. Starts React dev server on port 3001
2. Waits for server readiness
3. Runs Maven tests with headless Chrome

### Key Test Classes

- `QBaseSeleniumTest` - Base class, starts Javalin on 8001
- `QSeleniumJavalin` - Serves fixture JSON from `src/test/resources/fixtures/`
- `ServerHealthChecker` - Waits for React server readiness
- `ThemeIT` - Tests theme CSS variable injection

### Fixtures

Test fixtures in `src/test/resources/fixtures/metaData/`:
- `index.json` - Default metaData response
- `withFullCustomTheme.json` - Theme with all properties set
- `withBrandedHeader.json` - Theme with branded header enabled

## Session State & Continuity

**IMPORTANT:** Never use `~/.claude/session-state.md`. Always use local repo files.

### On "continue from last session"

Read these files in order:
1. `docs/SESSION_STATE.md` - Current status, branch, recent commits, next steps
2. `docs/TODO.md` - Active and completed tasks
3. This file (`CLAUDE.md`) - Project context

### Current Status (as of 2026-01-09)

| Item | Value |
|------|-------|
| Branch | `develop` |
| Version | `0.36.0-SNAPSHOT` |
| Latest Commit | `9eff022` - fix: add CookiesProvider and use chromedriver for Selenium tests |
| Features Merged | Pluggable themes + CSS selectors (PR #125), Virtual fields (#123), Form adjusters (#122) |

### Recent Bug Fixes

1. **CookiesProvider** - Added missing wrapper in `src/index.tsx` (required by react-cookie v8)
2. **chromedriver** - Changed `chromiumdriver()` to `chromedriver()` in test base classes

### Test Status

| Suite | Tests | Status |
|-------|-------|--------|
| `selenium.*` (fixture-based) | 115 | PASS |
| `seleniumwithqapplication.*` (full QQQ server) | 19 | Infrastructure issue - hangs locally |

The `seleniumwithqapplication` tests require a full QQQ backend server and hang during local execution. They may work in CI.

### Key Documentation Files

| File | Purpose |
|------|---------|
| `docs/SESSION_STATE.md` | Current work status, branch, version, recent commits |
| `docs/TODO.md` | Task tracking for current feature |
| `docs/TODO-hardcoded-colors.md` | Detailed hardcoded color conversion checklist (COMPLETE) |
| `docs/QQQ_THEMING_GUIDE.md` | Complete theming reference |
| `docs/QQQ_CSS_SELECTORS_GUIDE.md` | CSS selector patterns reference |
| `docs/PLAN-css-selectors.md` | CSS selectors implementation plan (COMPLETE) |
| `docs/PLAN-pluggable-themes-mui-refactor.md` | MUI refactor plan (COMPLETE) |

### Hardcoded Color Conversion (COMPLETE)

All ~33 hardcoded `colors.*` and `gradients.*` references converted to CSS variables with proper fallbacks:

| CSS Variable | Fallback | Source |
|--------------|----------|--------|
| `--qqq-border-color` | `#D6D6D6` | `grayLines.main` |
| `--qqq-info-color` | `#0062FF` | `info.main` |
| `--qqq-error-color` | `#F44335` | `error.main` |
| `--qqq-success-color` | `#4CAF50` | `success.main` |
| `--qqq-warning-color` | `#fb8c00` | `warning.main` |
| `--qqq-grey-600` | `#757575` | `grey[600]` |
| `--qqq-switch-track-color` | `#42424a` | `gradients.dark.main` |
| `--qqq-primary-color` | `#e91e63` | `primary.main` |
| `--qqq-secondary-color` | `#7b809a` | `secondary.main` |

### Publishing Snapshots

Use the gitops publish script to create a tagged snapshot:
```bash
/Users/james.maes/.local/bin/gitops-publish.sh
```

This creates a `publish-{commit}` tag that triggers CI/CD to build and publish the JAR.
