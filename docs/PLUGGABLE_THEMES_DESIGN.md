# Pluggable Themes Design Document

## Executive Summary

This document outlines the architecture changes needed to support pluggable themes in the QQQ Frontend Material Dashboard. Currently, theming is tightly coupled to the Material Dashboard 2 PRO template with hardcoded values scattered across components. A pluggable theme system would allow designers to provide new colors, spacing, typography, and icons that can be applied without code changes.

---

## Current State Assessment

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         QQQ Backend                              │
│  QBrandingMetaData: companyName, logo, icon, accentColor        │
└─────────────────────────┬───────────────────────────────────────┘
                          │ /metaData endpoint
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                    qqq-frontend-core                             │
│  Pure data layer - NO styling, just TypeScript models           │
│  Exports: QBrandingMetaData, QIcon, Banner classes              │
└─────────────────────────┬───────────────────────────────────────┘
                          │ npm dependency
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│              qqq-frontend-material-dashboard                     │
│  MUI ThemeProvider + 55 component style overrides               │
│  src/qqq/assets/theme/base/ (colors, typography, shadows)       │
│  src/qqq/styles/qqq-override-styles.css (900+ lines)            │
└─────────────────────────────────────────────────────────────────┘
```

### What Exists Today

| Layer | Theming Capability | Limitations |
|-------|-------------------|-------------|
| **Backend** | `QBrandingMetaData.accentColor`, logo, icon | Single color only, no palette |
| **Core** | Passes branding metadata through | No theme utilities |
| **Dashboard** | Full MUI theme with design tokens | Hardcoded, not runtime-swappable |

### Design Token Locations (Dashboard)

| Token Type | File | Status |
|------------|------|--------|
| Colors | `src/qqq/assets/theme/base/colors.ts` | Centralized but static |
| Typography | `src/qqq/assets/theme/base/typography.ts` | Font family hardcoded |
| Shadows | `src/qqq/assets/theme/base/boxShadows.ts` | Tied to color tokens |
| Borders | `src/qqq/assets/theme/base/borders.ts` | Minimal customization |
| Breakpoints | `src/qqq/assets/theme/base/breakpoints.ts` | Standard MUI |
| Components | `src/qqq/assets/theme/components/*.ts` | 55 files with style overrides |

### Current Problems

1. **Hardcoded Colors Outside Theme**
   - `qqq-override-styles.css`: 900+ lines with colors like `rgb(52, 71, 103)`, `#757575`
   - Components with inline colors: `#606060`, `#C0C0C0`, `rgba(255,255,255,1)`
   - No CSS custom properties for runtime switching

2. **No Runtime Theme Switching**
   - Dark theme directory exists (`theme-dark/`) but is never used
   - `darkMode` state in context but no toggle mechanism
   - Theme is compiled into the build

3. **Font/Icon Lock-in**
   - Font: "SF Pro Display, Roboto" hardcoded in typography.ts
   - Icons: Material Icons loaded from Google CDN in index.html
   - No mechanism to swap icon sets

4. **Spacing Inconsistency**
   - Mix of `pxToRem()`, raw pixels, and rem values
   - No centralized spacing scale (4px, 8px, 16px, etc.)

---

## Proposed Architecture

### Option A: CSS Custom Properties (Recommended)

Runtime-swappable themes via CSS variables injected from backend metadata.

```
┌─────────────────────────────────────────────────────────────────┐
│                         QQQ Backend                              │
│  QThemeMetaData: palette, typography, spacing, icons, shadows   │
└─────────────────────────┬───────────────────────────────────────┘
                          │ /metaData endpoint (expanded)
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                    qqq-frontend-core                             │
│  + QThemeMetaData class with full design token structure        │
│  + ThemeUtils for CSS variable generation                       │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│              qqq-frontend-material-dashboard                     │
│  ThemeProvider injects CSS variables to :root                   │
│  All components consume var(--qqq-color-primary) etc.           │
│  MUI theme reads from CSS variables                             │
└─────────────────────────────────────────────────────────────────┘
```

**Pros:** Runtime switching, no rebuild needed, designer-friendly
**Cons:** Larger refactor, must update all components

### Option B: Build-Time Theme Packages

Separate npm packages per theme, selected at build time.

```
@qrunio/theme-default
@qrunio/theme-dark
@qrunio/theme-corporate
```

**Pros:** Smaller runtime, tree-shaking
**Cons:** Requires rebuild for theme changes, more packages to maintain

### Option C: Hybrid (Recommended for Phase 1)

1. Centralize all tokens into CSS variables
2. Load default theme at build time
3. Allow runtime overrides via backend metadata for key values (colors, logo)

---

## Detailed Design: CSS Custom Properties Approach

### 1. Design Token Schema

```typescript
// qqq-frontend-core: src/model/metaData/QThemeMetaData.ts
export interface QThemeMetaData {
   name: string;

   palette: {
      primary: ColorScale;      // main, light, dark, contrastText
      secondary: ColorScale;
      error: ColorScale;
      warning: ColorScale;
      info: ColorScale;
      success: ColorScale;
      background: {
         default: string;
         paper: string;
         sidebar: string;
      };
      text: {
         primary: string;
         secondary: string;
         disabled: string;
      };
      divider: string;
      grey: Record<50|100|200|300|400|500|600|700|800|900, string>;
   };

   typography: {
      fontFamily: string;
      fontFamilyMono: string;
      fontSize: number;          // base size in px
      fontWeightLight: number;
      fontWeightRegular: number;
      fontWeightMedium: number;
      fontWeightBold: number;
      h1: TypographyVariant;
      h2: TypographyVariant;
      // ... h3-h6, body1, body2, caption, button
   };

   spacing: {
      unit: number;              // base unit (default 8)
      scale: number[];           // multipliers [0, 1, 2, 3, 4, 6, 8, 12, 16, 24]
   };

   shape: {
      borderRadiusSmall: string;
      borderRadiusMedium: string;
      borderRadiusLarge: string;
   };

   shadows: {
      none: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
   };

   icons: {
      provider: 'material' | 'fontawesome' | 'custom';
      cdnUrl?: string;
      customIconMap?: Record<string, string>;  // icon name -> SVG path
   };
}

interface ColorScale {
   main: string;
   light: string;
   dark: string;
   contrastText: string;
}

interface TypographyVariant {
   fontSize: string;
   fontWeight: number;
   lineHeight: number;
   letterSpacing?: string;
}
```

### 2. CSS Variable Injection

```typescript
// qqq-frontend-dashboard: src/qqq/theme/ThemeInjector.ts
export function injectThemeVariables(theme: QThemeMetaData): void {
   const root = document.documentElement;

   // Colors
   root.style.setProperty('--qqq-color-primary', theme.palette.primary.main);
   root.style.setProperty('--qqq-color-primary-light', theme.palette.primary.light);
   root.style.setProperty('--qqq-color-primary-dark', theme.palette.primary.dark);
   root.style.setProperty('--qqq-color-primary-contrast', theme.palette.primary.contrastText);
   // ... all palette colors

   // Typography
   root.style.setProperty('--qqq-font-family', theme.typography.fontFamily);
   root.style.setProperty('--qqq-font-size-base', `${theme.typography.fontSize}px`);
   // ... all typography tokens

   // Spacing
   theme.spacing.scale.forEach((mult, i) => {
      root.style.setProperty(`--qqq-spacing-${i}`, `${mult * theme.spacing.unit}px`);
   });

   // Shadows, borders, etc.
}
```

### 3. MUI Theme Integration

```typescript
// qqq-frontend-dashboard: src/qqq/theme/createQqqTheme.ts
export function createQqqTheme(): Theme {
   return createTheme({
      palette: {
         primary: {
            main: 'var(--qqq-color-primary)',
            light: 'var(--qqq-color-primary-light)',
            dark: 'var(--qqq-color-primary-dark)',
            contrastText: 'var(--qqq-color-primary-contrast)',
         },
         // ... other palette entries
      },
      typography: {
         fontFamily: 'var(--qqq-font-family)',
         fontSize: 14,  // MUI needs number, CSS var used in components
      },
      spacing: (factor: number) => `var(--qqq-spacing-${factor})`,
      // ... shape, shadows
   });
}
```

### 4. Component Migration Pattern

**Before:**
```tsx
<Box sx={{
   backgroundColor: colors.background.default,
   color: "#757575",
   padding: "16px"
}}>
```

**After:**
```tsx
<Box sx={{
   backgroundColor: 'var(--qqq-bg-default)',
   color: 'var(--qqq-text-secondary)',
   padding: 'var(--qqq-spacing-2)'
}}>
```

---

## Work Breakdown

### Phase 1: Theme Package Foundation

| Task | Repo | Effort |
|------|------|--------|
| Create `@qrunio/qqq-theme-default` package | NEW repo | M |
| Define `QQQTheme` TypeScript interface | theme-default | S |
| Extract current colors/typography into default theme | theme-default | M |
| Build `injectTheme()` CSS variable utility | theme-default | M |
| Build `createTheme()` factory with deep merge | theme-default | S |
| Add light/dark presets | theme-default | S |

### Phase 2: Dashboard Integration

| Task | Files Affected | Effort |
|------|----------------|--------|
| Add `@qrunio/qqq-theme-default` dependency | package.json | S |
| Update `App.tsx` to call `injectTheme()` on load | App.tsx | S |
| Refactor `colors.ts` to read from CSS variables | 1 file | M |
| Refactor `typography.ts` to read from CSS variables | 1 file | S |
| Refactor `boxShadows.ts` to read from CSS variables | 1 file | S |
| Update MUI theme to use CSS variable references | Theme/index.ts | M |

### Phase 3: Token Migration (Dashboard)

| Task | Files Affected | Effort |
|------|----------------|--------|
| Migrate 55 component override files to CSS vars | components/*.ts | L |
| Refactor `qqq-override-styles.css` to use variables | 1 file (900 lines) | L |
| Audit and fix hardcoded colors in TSX components | ~50 components | XL |
| Remove unused `theme-dark/` directory | cleanup | S |

### Phase 4: Icon System (Optional)

| Task | Effort |
|------|--------|
| Add icon provider config to theme interface | S |
| Abstract icon loading in dashboard | M |
| Support Material, FontAwesome, custom SVG | L |
| Remove hardcoded CDN link from index.html | S |

### Phase 5: Dark Mode

| Task | Effort |
|------|--------|
| Create dark preset in theme-default | M |
| Add theme toggle to dashboard UI | S |
| Persist preference to localStorage | S |
| Wire up existing `darkMode` context state | S |

---

## Files Requiring Changes

### NEW: @qrunio/qqq-theme-default (new package)
- `src/types.ts` - QQQTheme interface definition
- `src/default-theme.ts` - Default token values (extracted from dashboard)
- `src/presets/light.ts` - Light mode preset
- `src/presets/dark.ts` - Dark mode preset
- `src/utils/injectTheme.ts` - CSS variable injection
- `src/utils/createTheme.ts` - Theme factory with deep merge
- `src/index.ts` - Public exports

### qqq-frontend-material-dashboard
- `package.json` - Add @qrunio/qqq-theme-default dependency
- `src/App.tsx` - Call injectTheme() on load
- `src/qqq/assets/theme/base/colors.ts` - Read from CSS vars
- `src/qqq/assets/theme/base/typography.ts` - Read from CSS vars
- `src/qqq/assets/theme/base/boxShadows.ts` - Read from CSS vars
- `src/qqq/components/legacy/Theme/index.ts` - Use CSS var references in MUI theme
- `src/qqq/assets/theme/components/*.ts` (55 files) - Use CSS vars
- `src/qqq/styles/qqq-override-styles.css` - Use CSS vars (900 lines)
- `src/qqq/components/**/*.tsx` (~50 files with hardcoded values)
- `src/qqq/context/index.tsx` - Wire up theme switching
- `public/index.html` - Remove hardcoded font CDN (optional, Phase 4)
- `src/qqq/assets/theme-dark/` - DELETE (unused)

### qqq-frontend-core (minimal changes)
- No changes required for Phase 1-3
- `QBrandingMetaData` already supports `accentColor` for runtime overrides

### qqq (backend) - optional
- No changes required unless runtime theme config is desired
- Existing `QBrandingMetaData.accentColor` sufficient for branding overrides

---

## Hardcoded Values Inventory

### Colors Found in Components (Must Fix)

| Color | Location | Should Be |
|-------|----------|-----------|
| `#757575` | SavedViews, Breadcrumbs, QHierarchyAutoComplete | `--qqq-text-secondary` |
| `#606060` | QHierarchyAutoComplete | `--qqq-text-disabled` |
| `#C0C0C0` | QHierarchyAutoComplete | `--qqq-text-disabled` |
| `#FFFFFF` | Multiple components | `--qqq-bg-paper` |
| `rgb(52, 71, 103)` | qqq-override-styles.css | `--qqq-text-primary` |
| `rgb(123, 128, 154)` | qqq-override-styles.css | `--qqq-text-secondary` |
| `#e91e63` | colors.ts (primary) | `--qqq-color-primary` |

### Fonts
| Current | Location | Should Be |
|---------|----------|-----------|
| SF Pro Display, Roboto | typography.ts | `--qqq-font-family` |
| Material Icons | index.html CDN | Configurable icon provider |

---

## Recommended Approach

**Start with Phase 1 + 2** to establish the CSS variable foundation. This provides immediate value:

1. All colors centralized and documented
2. Easy theme preview by editing CSS variables in dev tools
3. Foundation for runtime theme switching
4. Designer can provide a JSON theme file

**Defer Phase 4 (Icons)** unless custom icons are a hard requirement.

---

## Decisions

1. **Theme file format:** TypeScript - provides type safety, IDE autocomplete, and compile-time validation.

2. **Per-SPA theming:** No - themes apply to Material Dashboard only.

3. **Theme editor UI:** Not planned.

4. **CSS-in-JS vs CSS files:** Standardize on MUI's `sx` prop with CSS variables. Migrate `qqq-override-styles.css` over time.

---

## Theme Storage Recommendation

### Recommended: Compile-Time Theme Package

Following the existing QQQ ecosystem pattern (where `qqq-frontend-core` is a separate npm package), themes should be **separate npm packages** selected at compile time.

```
┌─────────────────────────────────────────────────────────────────┐
│                  @qrunio/qqq-theme-default                       │
│  - QQQTheme interface definition                                 │
│  - Default theme (current Material Dashboard colors)             │
│  - Theme utility functions                                       │
└─────────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              │               │               │
              ▼               ▼               ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│ @acme/qqq-theme │ │ @corp/qqq-theme │ │ Local theme.ts  │
│  Corporate blue │ │  Brand colors   │ │  (simple case)  │
└─────────────────┘ └─────────────────┘ └─────────────────┘
              │               │               │
              └───────────────┼───────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│              qqq-frontend-material-dashboard                     │
│  import { theme } from '@acme/qqq-theme';                        │
│  // or: import { theme } from './themes/local-theme';            │
└─────────────────────────────────────────────────────────────────┘
```

### Why This Approach

| Consideration | Compile-Time Package | Runtime/Backend |
|---------------|---------------------|-----------------|
| **Type safety** | Full TypeScript checking | Requires runtime validation |
| **Bundle size** | Tree-shaking, only used tokens | Must load all possible values |
| **Consistency with QQQ** | Matches qqq-frontend-core pattern | Different pattern |
| **Designer workflow** | Edit TS, rebuild, see changes | More complex tooling needed |
| **Versioning** | npm semver, lockfile | Must version in backend |
| **Multi-tenant** | One build per tenant | Single build, runtime switch |

### Theme Package Structure

```
@qrunio/qqq-theme-default/
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts              # Main export
│   ├── types.ts              # QQQTheme interface
│   ├── default-theme.ts      # Default token values
│   ├── utils/
│   │   ├── createTheme.ts    # Theme factory function
│   │   └── cssVariables.ts   # CSS var injection utilities
│   └── presets/
│       ├── light.ts          # Light mode preset
│       └── dark.ts           # Dark mode preset
└── dist/                     # Compiled output
```

### Usage in Dashboard

```typescript
// Option A: Use default theme
import { defaultTheme, injectTheme } from '@qrunio/qqq-theme-default';
injectTheme(defaultTheme);

// Option B: Use custom theme package
import { theme } from '@acme/qqq-theme-corporate';
import { injectTheme } from '@qrunio/qqq-theme-default';
injectTheme(theme);

// Option C: Local theme file (simple customization)
import { createTheme, injectTheme } from '@qrunio/qqq-theme-default';
const theme = createTheme({
   palette: {
      primary: { main: '#1976D2' },  // Override just what you need
   },
});
injectTheme(theme);
```

### Configuring Theme at Build Time

In `package.json` or build config:

```json
{
   "qqq": {
      "theme": "@acme/qqq-theme-corporate"
   }
}
```

Or via environment variable:

```bash
QQQ_THEME=@acme/qqq-theme-corporate npm run build
```

### Simple Case: Local Theme File

For projects that don't need a separate package:

```
qqq-frontend-material-dashboard/
└── src/
    └── themes/
        └── custom-theme.ts    # Local overrides
```

```typescript
// src/themes/custom-theme.ts
import { createTheme } from '@qrunio/qqq-theme-default';

export const theme = createTheme({
   name: 'custom',
   palette: {
      primary: { main: '#2196F3', light: '#64B5F6', dark: '#1976D2', contrastText: '#FFFFFF' },
      secondary: { main: '#FF9800', light: '#FFB74D', dark: '#F57C00', contrastText: '#000000' },
   },
   typography: {
      fontFamily: '"Inter", "Helvetica", "Arial", sans-serif',
   },
});
```

### Backend Branding Override (Optional Enhancement)

For runtime customization of specific values (logo, accent color), the existing `QBrandingMetaData` can override compile-time theme values:

```typescript
// At app load, after theme injection
if (qInstance.branding?.accentColor) {
   document.documentElement.style.setProperty(
      '--qqq-color-primary',
      qInstance.branding.accentColor
   );
}
```

This provides a hybrid: full theme at compile time, minor branding tweaks at runtime.

---

## Implementation Guide

This section provides step-by-step instructions for implementing the pluggable themes system.

### Step 1: Create the Theme Package

Create a new repository `qqq-theme-default` with the following structure:

#### 1.1 Package Configuration

```json
// package.json
{
   "name": "@qrunio/qqq-theme-default",
   "version": "1.0.0",
   "description": "Default theme for QQQ Frontend Material Dashboard",
   "main": "dist/index.js",
   "types": "dist/index.d.ts",
   "files": ["dist"],
   "scripts": {
      "build": "tsc",
      "prepublishOnly": "npm run build"
   },
   "peerDependencies": {
      "typescript": ">=4.9.0"
   },
   "devDependencies": {
      "typescript": "^4.9.4"
   },
   "repository": {
      "type": "git",
      "url": "https://github.com/QRun-IO/qqq-theme-default.git"
   },
   "license": "AGPL-3.0"
}
```

```json
// tsconfig.json
{
   "compilerOptions": {
      "target": "ES2020",
      "module": "ESNext",
      "moduleResolution": "node",
      "declaration": true,
      "declarationMap": true,
      "sourceMap": true,
      "outDir": "./dist",
      "strict": true,
      "esModuleInterop": true,
      "skipLibCheck": true,
      "forceConsistentCasingInFileNames": true
   },
   "include": ["src/**/*"],
   "exclude": ["node_modules", "dist"]
}
```

#### 1.2 Complete Type Definitions

```typescript
// src/types.ts

/**
 * Color scale with main color and variants for different states.
 */
export interface ColorScale {
   main: string;
   light: string;
   dark: string;
   contrastText: string;
}

/**
 * Typography variant configuration for headings, body text, etc.
 */
export interface TypographyVariant {
   fontSize: string;
   fontWeight: number;
   lineHeight: number;
   letterSpacing?: string;
   textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
}

/**
 * Grey scale from 50 (lightest) to 900 (darkest).
 */
export interface GreyScale {
   50: string;
   100: string;
   200: string;
   300: string;
   400: string;
   500: string;
   600: string;
   700: string;
   800: string;
   900: string;
}

/**
 * Complete color palette for the theme.
 */
export interface ThemePalette {
   primary: ColorScale;
   secondary: ColorScale;
   error: ColorScale;
   warning: ColorScale;
   info: ColorScale;
   success: ColorScale;
   background: {
      default: string;
      paper: string;
      sidebar: string;
      card: string;
   };
   text: {
      primary: string;
      secondary: string;
      disabled: string;
      hint: string;
   };
   divider: string;
   grey: GreyScale;
   action: {
      active: string;
      hover: string;
      selected: string;
      disabled: string;
      disabledBackground: string;
   };
}

/**
 * Typography configuration including font families and all variants.
 */
export interface ThemeTypography {
   fontFamily: string;
   fontFamilyMono: string;
   fontSize: number;
   fontWeightLight: number;
   fontWeightRegular: number;
   fontWeightMedium: number;
   fontWeightBold: number;
   h1: TypographyVariant;
   h2: TypographyVariant;
   h3: TypographyVariant;
   h4: TypographyVariant;
   h5: TypographyVariant;
   h6: TypographyVariant;
   subtitle1: TypographyVariant;
   subtitle2: TypographyVariant;
   body1: TypographyVariant;
   body2: TypographyVariant;
   button: TypographyVariant;
   caption: TypographyVariant;
   overline: TypographyVariant;
}

/**
 * Spacing configuration with base unit and scale multipliers.
 */
export interface ThemeSpacing {
   unit: number;
   scale: number[];
}

/**
 * Border radius configuration.
 */
export interface ThemeShape {
   borderRadiusNone: string;
   borderRadiusSmall: string;
   borderRadiusMedium: string;
   borderRadiusLarge: string;
   borderRadiusFull: string;
}

/**
 * Shadow configuration for elevation levels.
 */
export interface ThemeShadows {
   none: string;
   xs: string;
   sm: string;
   md: string;
   lg: string;
   xl: string;
   xxl: string;
   inset: string;
}

/**
 * Icon provider configuration.
 */
export interface ThemeIcons {
   provider: 'material' | 'fontawesome' | 'custom';
   cdnUrl?: string;
   fontFamily?: string;
   customIconMap?: Record<string, string>;
}

/**
 * Complete QQQ theme configuration.
 */
export interface QQQTheme {
   name: string;
   mode: 'light' | 'dark';
   palette: ThemePalette;
   typography: ThemeTypography;
   spacing: ThemeSpacing;
   shape: ThemeShape;
   shadows: ThemeShadows;
   icons: ThemeIcons;
}

/**
 * Partial theme for overriding specific values.
 * Uses deep partial to allow nested partial objects.
 */
export type DeepPartial<T> = {
   [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type PartialQQQTheme = DeepPartial<QQQTheme>;
```

#### 1.3 Default Theme Values

```typescript
// src/default-theme.ts
import { QQQTheme } from './types';

/**
 * Default theme extracted from Material Dashboard 2 PRO.
 * These values match the current production colors.
 */
export const defaultTheme: QQQTheme = {
   name: 'default',
   mode: 'light',

   palette: {
      primary: {
         main: '#e91e63',
         light: '#ec407a',
         dark: '#c2185b',
         contrastText: '#ffffff',
      },
      secondary: {
         main: '#7b809a',
         light: '#9ea3b8',
         dark: '#565a6e',
         contrastText: '#ffffff',
      },
      error: {
         main: '#F44335',
         light: '#ef5350',
         dark: '#c62828',
         contrastText: '#ffffff',
      },
      warning: {
         main: '#fb8c00',
         light: '#ffa726',
         dark: '#ef6c00',
         contrastText: '#ffffff',
      },
      info: {
         main: '#0062FF',
         light: '#2196f3',
         dark: '#0043b0',
         contrastText: '#ffffff',
      },
      success: {
         main: '#4CAF50',
         light: '#66bb6a',
         dark: '#388e3c',
         contrastText: '#ffffff',
      },
      background: {
         default: '#f0f2f5',
         paper: '#ffffff',
         sidebar: '#1a1f37',
         card: '#ffffff',
      },
      text: {
         primary: '#344767',
         secondary: '#7b809a',
         disabled: '#c0c0c0',
         hint: '#9e9e9e',
      },
      divider: '#e0e0e0',
      grey: {
         50: '#fafafa',
         100: '#f5f5f5',
         200: '#eeeeee',
         300: '#e0e0e0',
         400: '#bdbdbd',
         500: '#9e9e9e',
         600: '#757575',
         700: '#616161',
         800: '#424242',
         900: '#212121',
      },
      action: {
         active: 'rgba(0, 0, 0, 0.54)',
         hover: 'rgba(0, 0, 0, 0.04)',
         selected: 'rgba(0, 0, 0, 0.08)',
         disabled: 'rgba(0, 0, 0, 0.26)',
         disabledBackground: 'rgba(0, 0, 0, 0.12)',
      },
   },

   typography: {
      fontFamily: '"SF Pro Display", "Roboto", "Helvetica", "Arial", sans-serif',
      fontFamilyMono: '"SF Mono", "Roboto Mono", "Consolas", monospace',
      fontSize: 14,
      fontWeightLight: 300,
      fontWeightRegular: 400,
      fontWeightMedium: 600,
      fontWeightBold: 700,
      h1: { fontSize: '3rem', fontWeight: 700, lineHeight: 1.25 },
      h2: { fontSize: '2.25rem', fontWeight: 700, lineHeight: 1.3 },
      h3: { fontSize: '1.875rem', fontWeight: 700, lineHeight: 1.375 },
      h4: { fontSize: '1.5rem', fontWeight: 700, lineHeight: 1.375 },
      h5: { fontSize: '1.25rem', fontWeight: 700, lineHeight: 1.375 },
      h6: { fontSize: '1rem', fontWeight: 700, lineHeight: 1.625 },
      subtitle1: { fontSize: '1rem', fontWeight: 400, lineHeight: 1.75 },
      subtitle2: { fontSize: '0.875rem', fontWeight: 500, lineHeight: 1.57 },
      body1: { fontSize: '1rem', fontWeight: 400, lineHeight: 1.5 },
      body2: { fontSize: '0.875rem', fontWeight: 400, lineHeight: 1.43 },
      button: { fontSize: '0.875rem', fontWeight: 700, lineHeight: 1.5, textTransform: 'uppercase' },
      caption: { fontSize: '0.75rem', fontWeight: 400, lineHeight: 1.66 },
      overline: { fontSize: '0.75rem', fontWeight: 400, lineHeight: 2.66, textTransform: 'uppercase' },
   },

   spacing: {
      unit: 8,
      scale: [0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24, 32, 40, 48],
   },

   shape: {
      borderRadiusNone: '0',
      borderRadiusSmall: '0.25rem',
      borderRadiusMedium: '0.5rem',
      borderRadiusLarge: '0.75rem',
      borderRadiusFull: '9999px',
   },

   shadows: {
      none: 'none',
      xs: '0 2px 4px -1px rgba(0,0,0,0.06), 0 1px 2px -1px rgba(0,0,0,0.03)',
      sm: '0 4px 6px -1px rgba(0,0,0,0.07), 0 2px 4px -1px rgba(0,0,0,0.04)',
      md: '0 10px 15px -3px rgba(0,0,0,0.08), 0 4px 6px -2px rgba(0,0,0,0.04)',
      lg: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
      xl: '0 25px 50px -12px rgba(0,0,0,0.25)',
      xxl: '0 35px 60px -15px rgba(0,0,0,0.3)',
      inset: 'inset 0 2px 4px 0 rgba(0,0,0,0.06)',
   },

   icons: {
      provider: 'material',
      cdnUrl: 'https://fonts.googleapis.com/css?family=Material+Icons|Material+Icons+Outlined|Material+Icons+Two+Tone|Material+Icons+Round|Material+Icons+Sharp',
      fontFamily: 'Material Icons',
   },
};
```

#### 1.4 Theme Utilities

```typescript
// src/utils/deepMerge.ts

/**
 * Deep merge two objects, with source values overriding target.
 */
export function deepMerge<T extends object>(target: T, source: Partial<T>): T {
   const result = { ...target };

   for (const key in source) {
      if (source.hasOwnProperty(key)) {
         const sourceValue = source[key];
         const targetValue = target[key];

         if (
            sourceValue !== null &&
            typeof sourceValue === 'object' &&
            !Array.isArray(sourceValue) &&
            targetValue !== null &&
            typeof targetValue === 'object' &&
            !Array.isArray(targetValue)
         ) {
            (result as any)[key] = deepMerge(targetValue, sourceValue as any);
         } else if (sourceValue !== undefined) {
            (result as any)[key] = sourceValue;
         }
      }
   }

   return result;
}
```

```typescript
// src/utils/createTheme.ts
import { QQQTheme, PartialQQQTheme } from '../types';
import { defaultTheme } from '../default-theme';
import { deepMerge } from './deepMerge';

/**
 * Create a theme by merging overrides with the default theme.
 *
 * @param overrides - Partial theme object with values to override
 * @returns Complete QQQTheme with defaults + overrides
 *
 * @example
 * const myTheme = createTheme({
 *    name: 'corporate',
 *    palette: {
 *       primary: { main: '#1976D2' }
 *    }
 * });
 */
export function createTheme(overrides: PartialQQQTheme = {}): QQQTheme {
   return deepMerge(defaultTheme, overrides as Partial<QQQTheme>);
}
```

```typescript
// src/utils/injectTheme.ts
import { QQQTheme } from '../types';

/**
 * CSS variable naming convention:
 * --qqq-{category}-{subcategory}-{variant}
 *
 * Examples:
 * --qqq-color-primary-main
 * --qqq-color-text-secondary
 * --qqq-spacing-4
 * --qqq-font-family
 * --qqq-shadow-md
 */

/**
 * Inject theme as CSS custom properties on :root.
 * Call this once at app initialization.
 *
 * @param theme - Complete QQQTheme to inject
 */
export function injectTheme(theme: QQQTheme): void {
   const root = document.documentElement;

   // Palette - Primary
   root.style.setProperty('--qqq-color-primary-main', theme.palette.primary.main);
   root.style.setProperty('--qqq-color-primary-light', theme.palette.primary.light);
   root.style.setProperty('--qqq-color-primary-dark', theme.palette.primary.dark);
   root.style.setProperty('--qqq-color-primary-contrast', theme.palette.primary.contrastText);

   // Palette - Secondary
   root.style.setProperty('--qqq-color-secondary-main', theme.palette.secondary.main);
   root.style.setProperty('--qqq-color-secondary-light', theme.palette.secondary.light);
   root.style.setProperty('--qqq-color-secondary-dark', theme.palette.secondary.dark);
   root.style.setProperty('--qqq-color-secondary-contrast', theme.palette.secondary.contrastText);

   // Palette - Error
   root.style.setProperty('--qqq-color-error-main', theme.palette.error.main);
   root.style.setProperty('--qqq-color-error-light', theme.palette.error.light);
   root.style.setProperty('--qqq-color-error-dark', theme.palette.error.dark);
   root.style.setProperty('--qqq-color-error-contrast', theme.palette.error.contrastText);

   // Palette - Warning
   root.style.setProperty('--qqq-color-warning-main', theme.palette.warning.main);
   root.style.setProperty('--qqq-color-warning-light', theme.palette.warning.light);
   root.style.setProperty('--qqq-color-warning-dark', theme.palette.warning.dark);
   root.style.setProperty('--qqq-color-warning-contrast', theme.palette.warning.contrastText);

   // Palette - Info
   root.style.setProperty('--qqq-color-info-main', theme.palette.info.main);
   root.style.setProperty('--qqq-color-info-light', theme.palette.info.light);
   root.style.setProperty('--qqq-color-info-dark', theme.palette.info.dark);
   root.style.setProperty('--qqq-color-info-contrast', theme.palette.info.contrastText);

   // Palette - Success
   root.style.setProperty('--qqq-color-success-main', theme.palette.success.main);
   root.style.setProperty('--qqq-color-success-light', theme.palette.success.light);
   root.style.setProperty('--qqq-color-success-dark', theme.palette.success.dark);
   root.style.setProperty('--qqq-color-success-contrast', theme.palette.success.contrastText);

   // Palette - Background
   root.style.setProperty('--qqq-color-bg-default', theme.palette.background.default);
   root.style.setProperty('--qqq-color-bg-paper', theme.palette.background.paper);
   root.style.setProperty('--qqq-color-bg-sidebar', theme.palette.background.sidebar);
   root.style.setProperty('--qqq-color-bg-card', theme.palette.background.card);

   // Palette - Text
   root.style.setProperty('--qqq-color-text-primary', theme.palette.text.primary);
   root.style.setProperty('--qqq-color-text-secondary', theme.palette.text.secondary);
   root.style.setProperty('--qqq-color-text-disabled', theme.palette.text.disabled);
   root.style.setProperty('--qqq-color-text-hint', theme.palette.text.hint);

   // Palette - Other
   root.style.setProperty('--qqq-color-divider', theme.palette.divider);

   // Palette - Grey scale
   Object.entries(theme.palette.grey).forEach(([key, value]) => {
      root.style.setProperty(`--qqq-color-grey-${key}`, value);
   });

   // Palette - Action
   root.style.setProperty('--qqq-color-action-active', theme.palette.action.active);
   root.style.setProperty('--qqq-color-action-hover', theme.palette.action.hover);
   root.style.setProperty('--qqq-color-action-selected', theme.palette.action.selected);
   root.style.setProperty('--qqq-color-action-disabled', theme.palette.action.disabled);
   root.style.setProperty('--qqq-color-action-disabled-bg', theme.palette.action.disabledBackground);

   // Typography
   root.style.setProperty('--qqq-font-family', theme.typography.fontFamily);
   root.style.setProperty('--qqq-font-family-mono', theme.typography.fontFamilyMono);
   root.style.setProperty('--qqq-font-size-base', `${theme.typography.fontSize}px`);
   root.style.setProperty('--qqq-font-weight-light', String(theme.typography.fontWeightLight));
   root.style.setProperty('--qqq-font-weight-regular', String(theme.typography.fontWeightRegular));
   root.style.setProperty('--qqq-font-weight-medium', String(theme.typography.fontWeightMedium));
   root.style.setProperty('--qqq-font-weight-bold', String(theme.typography.fontWeightBold));

   // Typography variants
   const typographyVariants = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'subtitle1', 'subtitle2', 'body1', 'body2', 'button', 'caption', 'overline'] as const;
   typographyVariants.forEach((variant) => {
      const config = theme.typography[variant];
      root.style.setProperty(`--qqq-typography-${variant}-size`, config.fontSize);
      root.style.setProperty(`--qqq-typography-${variant}-weight`, String(config.fontWeight));
      root.style.setProperty(`--qqq-typography-${variant}-line-height`, String(config.lineHeight));
      if (config.letterSpacing) {
         root.style.setProperty(`--qqq-typography-${variant}-letter-spacing`, config.letterSpacing);
      }
   });

   // Spacing
   theme.spacing.scale.forEach((multiplier, index) => {
      const value = multiplier * theme.spacing.unit;
      root.style.setProperty(`--qqq-spacing-${index}`, `${value}px`);
   });
   root.style.setProperty('--qqq-spacing-unit', `${theme.spacing.unit}px`);

   // Shape
   root.style.setProperty('--qqq-radius-none', theme.shape.borderRadiusNone);
   root.style.setProperty('--qqq-radius-sm', theme.shape.borderRadiusSmall);
   root.style.setProperty('--qqq-radius-md', theme.shape.borderRadiusMedium);
   root.style.setProperty('--qqq-radius-lg', theme.shape.borderRadiusLarge);
   root.style.setProperty('--qqq-radius-full', theme.shape.borderRadiusFull);

   // Shadows
   root.style.setProperty('--qqq-shadow-none', theme.shadows.none);
   root.style.setProperty('--qqq-shadow-xs', theme.shadows.xs);
   root.style.setProperty('--qqq-shadow-sm', theme.shadows.sm);
   root.style.setProperty('--qqq-shadow-md', theme.shadows.md);
   root.style.setProperty('--qqq-shadow-lg', theme.shadows.lg);
   root.style.setProperty('--qqq-shadow-xl', theme.shadows.xl);
   root.style.setProperty('--qqq-shadow-xxl', theme.shadows.xxl);
   root.style.setProperty('--qqq-shadow-inset', theme.shadows.inset);

   // Icons
   root.style.setProperty('--qqq-icon-font-family', theme.icons.fontFamily || 'Material Icons');

   // Add icon font stylesheet if CDN URL provided
   if (theme.icons.cdnUrl) {
      const existingLink = document.querySelector('link[data-qqq-icons]');
      if (!existingLink) {
         const link = document.createElement('link');
         link.rel = 'stylesheet';
         link.href = theme.icons.cdnUrl;
         link.setAttribute('data-qqq-icons', 'true');
         document.head.appendChild(link);
      }
   }

   // Set theme mode as data attribute for CSS selectors
   root.setAttribute('data-qqq-theme', theme.name);
   root.setAttribute('data-qqq-mode', theme.mode);
}

/**
 * Get current value of a CSS variable.
 */
export function getThemeVariable(name: string): string {
   return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

/**
 * Override a single theme variable at runtime.
 * Useful for backend branding overrides.
 */
export function setThemeVariable(name: string, value: string): void {
   document.documentElement.style.setProperty(name, value);
}
```

#### 1.5 Package Entry Point

```typescript
// src/index.ts
export { QQQTheme, PartialQQQTheme, ColorScale, TypographyVariant, ThemePalette, ThemeTypography, ThemeSpacing, ThemeShape, ThemeShadows, ThemeIcons, GreyScale } from './types';
export { defaultTheme } from './default-theme';
export { createTheme } from './utils/createTheme';
export { injectTheme, getThemeVariable, setThemeVariable } from './utils/injectTheme';
export { deepMerge } from './utils/deepMerge';

// Presets
export { lightTheme } from './presets/light';
export { darkTheme } from './presets/dark';
```

#### 1.6 Dark Theme Preset

```typescript
// src/presets/light.ts
import { defaultTheme } from '../default-theme';
export const lightTheme = defaultTheme;
```

```typescript
// src/presets/dark.ts
import { QQQTheme } from '../types';
import { createTheme } from '../utils/createTheme';

export const darkTheme: QQQTheme = createTheme({
   name: 'dark',
   mode: 'dark',
   palette: {
      primary: {
         main: '#90caf9',
         light: '#e3f2fd',
         dark: '#42a5f5',
         contrastText: '#000000',
      },
      secondary: {
         main: '#ce93d8',
         light: '#f3e5f5',
         dark: '#ab47bc',
         contrastText: '#000000',
      },
      background: {
         default: '#121212',
         paper: '#1e1e1e',
         sidebar: '#0a0a0a',
         card: '#252525',
      },
      text: {
         primary: '#ffffff',
         secondary: '#b0b0b0',
         disabled: '#6c6c6c',
         hint: '#8c8c8c',
      },
      divider: '#333333',
      action: {
         active: 'rgba(255, 255, 255, 0.56)',
         hover: 'rgba(255, 255, 255, 0.08)',
         selected: 'rgba(255, 255, 255, 0.16)',
         disabled: 'rgba(255, 255, 255, 0.3)',
         disabledBackground: 'rgba(255, 255, 255, 0.12)',
      },
   },
});
```

---

### Step 2: Dashboard Integration

#### 2.1 Install the Theme Package

```bash
# In qqq-frontend-material-dashboard
npm install @qrunio/qqq-theme-default
```

#### 2.2 Update App.tsx

Find the main App component initialization and add theme injection:

```typescript
// src/App.tsx - Add near the top of the file

import { defaultTheme, injectTheme, setThemeVariable } from '@qrunio/qqq-theme-default';

// Inject theme CSS variables before React renders
injectTheme(defaultTheme);

// Later, after loading QInstance metadata:
function applyBrandingOverrides(qInstance: QInstance): void {
   if (qInstance.branding?.accentColor) {
      setThemeVariable('--qqq-color-primary-main', qInstance.branding.accentColor);
   }
}
```

#### 2.3 Refactor colors.ts to Use CSS Variables

```typescript
// src/qqq/assets/theme/base/colors.ts
// BEFORE: Static values
// AFTER: References to CSS variables with fallbacks

const colors = {
   primary: {
      get main() { return 'var(--qqq-color-primary-main, #e91e63)'; },
      get light() { return 'var(--qqq-color-primary-light, #ec407a)'; },
      get dark() { return 'var(--qqq-color-primary-dark, #c2185b)'; },
   },
   // ... repeat for all color categories
   text: {
      get main() { return 'var(--qqq-color-text-primary, #344767)'; },
      get secondary() { return 'var(--qqq-color-text-secondary, #7b809a)'; },
      get disabled() { return 'var(--qqq-color-text-disabled, #c0c0c0)'; },
   },
   background: {
      get default() { return 'var(--qqq-color-bg-default, #f0f2f5)'; },
      get paper() { return 'var(--qqq-color-bg-paper, #ffffff)'; },
   },
};

export default colors;
```

---

### Step 3: Component Migration Checklist

For each component with hardcoded values, apply this pattern:

#### Migration Pattern

| Before | After |
|--------|-------|
| `color: "#757575"` | `color: "var(--qqq-color-text-secondary)"` |
| `backgroundColor: "#f0f2f5"` | `backgroundColor: "var(--qqq-color-bg-default)"` |
| `padding: "16px"` | `padding: "var(--qqq-spacing-2)"` |
| `borderRadius: "8px"` | `borderRadius: "var(--qqq-radius-md)"` |
| `boxShadow: "0 2px 4px..."` | `boxShadow: "var(--qqq-shadow-sm)"` |
| `fontFamily: "Roboto"` | `fontFamily: "var(--qqq-font-family)"` |

#### Files to Migrate (Priority Order)

1. **Base token files** (Phase 2)
   - `src/qqq/assets/theme/base/colors.ts`
   - `src/qqq/assets/theme/base/typography.ts`
   - `src/qqq/assets/theme/base/boxShadows.ts`

2. **MUI theme configuration** (Phase 2)
   - `src/qqq/components/legacy/Theme/index.ts`

3. **Component overrides** (Phase 3)
   - `src/qqq/assets/theme/components/*.ts` (55 files)

4. **CSS override file** (Phase 3)
   - `src/qqq/styles/qqq-override-styles.css`

5. **TSX components with hardcoded values** (Phase 3)
   - Search for: `#[0-9a-fA-F]{3,6}`, `rgb(`, `rgba(` in `src/qqq/components/`

---

### CSS Variable Reference

Complete list of CSS variables injected by `injectTheme()`:

```css
/* Colors - Primary */
--qqq-color-primary-main
--qqq-color-primary-light
--qqq-color-primary-dark
--qqq-color-primary-contrast

/* Colors - Secondary */
--qqq-color-secondary-main
--qqq-color-secondary-light
--qqq-color-secondary-dark
--qqq-color-secondary-contrast

/* Colors - Error/Warning/Info/Success (same pattern) */
--qqq-color-error-main
--qqq-color-warning-main
--qqq-color-info-main
--qqq-color-success-main

/* Colors - Background */
--qqq-color-bg-default
--qqq-color-bg-paper
--qqq-color-bg-sidebar
--qqq-color-bg-card

/* Colors - Text */
--qqq-color-text-primary
--qqq-color-text-secondary
--qqq-color-text-disabled
--qqq-color-text-hint

/* Colors - Grey (50-900) */
--qqq-color-grey-50
--qqq-color-grey-100
--qqq-color-grey-200
--qqq-color-grey-300
--qqq-color-grey-400
--qqq-color-grey-500
--qqq-color-grey-600
--qqq-color-grey-700
--qqq-color-grey-800
--qqq-color-grey-900

/* Colors - Action */
--qqq-color-action-active
--qqq-color-action-hover
--qqq-color-action-selected
--qqq-color-action-disabled
--qqq-color-action-disabled-bg

/* Colors - Other */
--qqq-color-divider

/* Typography */
--qqq-font-family
--qqq-font-family-mono
--qqq-font-size-base
--qqq-font-weight-light
--qqq-font-weight-regular
--qqq-font-weight-medium
--qqq-font-weight-bold

/* Typography Variants (h1-h6, body1, body2, etc.) */
--qqq-typography-h1-size
--qqq-typography-h1-weight
--qqq-typography-h1-line-height
/* ... repeat for all variants */

/* Spacing (0-15 based on scale) */
--qqq-spacing-0   /* 0px */
--qqq-spacing-1   /* 8px */
--qqq-spacing-2   /* 16px */
--qqq-spacing-3   /* 24px */
--qqq-spacing-4   /* 32px */
--qqq-spacing-5   /* 40px */
/* ... etc */
--qqq-spacing-unit

/* Shape */
--qqq-radius-none
--qqq-radius-sm
--qqq-radius-md
--qqq-radius-lg
--qqq-radius-full

/* Shadows */
--qqq-shadow-none
--qqq-shadow-xs
--qqq-shadow-sm
--qqq-shadow-md
--qqq-shadow-lg
--qqq-shadow-xl
--qqq-shadow-xxl
--qqq-shadow-inset

/* Icons */
--qqq-icon-font-family

/* Data attributes on :root */
data-qqq-theme="themeName"
data-qqq-mode="light|dark"
```

---

### Testing Strategy

#### Unit Tests for Theme Package

```typescript
// src/__tests__/createTheme.test.ts
import { createTheme, defaultTheme } from '../index';

describe('createTheme', () => {
   it('returns default theme when no overrides provided', () => {
      const theme = createTheme();
      expect(theme).toEqual(defaultTheme);
   });

   it('deep merges partial overrides', () => {
      const theme = createTheme({
         palette: {
            primary: { main: '#FF0000' }
         }
      });
      expect(theme.palette.primary.main).toBe('#FF0000');
      expect(theme.palette.primary.light).toBe(defaultTheme.palette.primary.light);
   });

   it('preserves nested objects not in overrides', () => {
      const theme = createTheme({ name: 'custom' });
      expect(theme.typography).toEqual(defaultTheme.typography);
   });
});
```

#### Visual Regression Testing

After migration, verify themes work by:
1. Running dashboard with default theme
2. Creating a test theme with drastically different colors
3. Verifying all components pick up new colors
4. Testing dark mode preset

---

## Appendix: Current Theme File Structure

```
src/qqq/assets/
├── theme/                          # Light theme (active)
│   ├── base/
│   │   ├── colors.ts               # Color palette
│   │   ├── typography.ts           # Font system
│   │   ├── boxShadows.ts           # Shadow tokens
│   │   ├── borders.ts              # Border radii
│   │   ├── breakpoints.ts          # Responsive breakpoints
│   │   └── globals.ts              # Global CSS rules
│   ├── components/                 # 55 MUI component overrides
│   │   ├── button/
│   │   ├── card/
│   │   ├── form/
│   │   └── ...
│   └── functions/                  # Helper utilities
│       ├── pxToRem.ts
│       ├── rgba.ts
│       └── ...
├── theme-dark/                     # Dark theme (unused)
│   └── (mirrors theme/ structure)
└── ...

src/qqq/styles/
└── qqq-override-styles.css         # 900+ lines of overrides
```
