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

- `src/App.tsx` - Main app, authentication, route generation from metadata, theme provider
- `src/QContext.tsx` - Global state (accentColor, tableMetaData, modalStack, branding)
- `src/qqq/utils/qqq/Client.ts` - Singleton wrapper for `@qrunio/qqq-frontend-core` API client

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

## Theming Architecture

### Current State

Theme configuration is centralized in `src/qqq/assets/theme/` with MUI's `createTheme()`:

- `base/colors.ts` - Full color palette
- `base/typography.ts` - Font system (SF Pro Display/Roboto)
- `components/*.ts` - Per-component MUI overrides

The theme is created in `src/qqq/components/legacy/Theme.ts` and applied via `<ThemeProvider>` in App.tsx.

### Runtime Customization

Limited runtime theming via `QBrandingMetaData` from backend:
- `accentColor` - Applied to `QContext.accentColor`
- `logo`, `icon` - Sidebar and favicon
- `appName` - Display name

### Known Issues for Theming Work

1. **Hardcoded colors scattered in components** - Search for `#[0-9a-fA-F]{3,6}`, `rgb(`, `rgba(` in TSX files
2. **~900 lines of CSS overrides** in `src/qqq/styles/qqq-override-styles.css`
3. **Unused dark theme** - `src/qqq/assets/theme-dark/` exists but is never loaded
4. **No CSS custom properties** - Theme is compile-time only

### Pluggable Themes Design

See `docs/PLUGGABLE_THEMES_DESIGN.md` for the comprehensive plan to implement runtime-swappable themes via CSS custom properties and a new `@qrunio/qqq-theme-default` package.

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

### What the Overlay Does vs. What Theming Would Do

| Capability | Overlay (Current) | Pluggable Themes (Proposed) |
|------------|-------------------|----------------------------|
| Logo/icon | Yes | Yes |
| Single accent color | Yes | Yes |
| Full color palette | No | Yes |
| Typography/fonts | No | Yes |
| Spacing system | No | Yes |
| Component styles | No | Yes |
| Dark mode | No | Yes |
| Runtime switching | Partial (accentColor) | Full |

The overlay system handles **branding assets** (logos, icons). The pluggable themes design in `docs/PLUGGABLE_THEMES_DESIGN.md` addresses **comprehensive styling** (colors, typography, shadows, component overrides) that goes beyond what the overlay can provide.
