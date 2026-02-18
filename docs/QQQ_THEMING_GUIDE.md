# QQQ Theming System Guide

This document explains the QQQ pluggable theming system for AI assistants and developers.

## Architecture Overview

QQQ uses a **backend-driven theming model**:

1. **Java Backend**: Define theme in `MaterialDashboardThemeMetaData` object
2. **Frontend Model**: TypeScript `MaterialDashboardThemeMetaData` interface mirrors Java class
3. **Frontend Dashboard**: `themeUtils.ts` injects CSS custom properties at runtime

Theme data flows: `MaterialDashboardThemeMetaData.java` → `/metaData` API → `MaterialDashboardThemeMetaData.ts` → CSS variables (`--qqq-*`)

## Configuring a Theme (Java Backend)

Create a `MaterialDashboardThemeMetaData` instance using fluent setters:

```java
MaterialDashboardThemeMetaData theme = new MaterialDashboardThemeMetaData()
   .withPrimaryColor("#1976D2")
   .withSidebarBackgroundColor("#1E1E2D");

qInstance.add(theme);
```

All properties are optional. Omitted properties use frontend defaults.

---

## Available Theme Properties

### Core Color Palette

| Property | Purpose | Example |
|----------|---------|---------|
| `primaryColor` | Main brand color (buttons, links, highlights) | `#1976D2` |
| `secondaryColor` | Secondary accent color | `#9C27B0` |
| `backgroundColor` | Page/app background | `#F5F5F5` |
| `surfaceColor` | Card/panel backgrounds | `#FFFFFF` |
| `textPrimary` | Primary text color | `#212121` |
| `textSecondary` | Muted/secondary text | `#757575` |
| `errorColor` | Error states | `#D32F2F` |
| `warningColor` | Warning states | `#F57C00` |
| `successColor` | Success states | `#388E3C` |
| `infoColor` | Info states | `#1976D2` |

### Typography - Base Settings

| Property | Purpose | Example |
|----------|---------|---------|
| `fontFamily` | Primary body font stack | `"Inter", "Roboto", sans-serif` |
| `headerFontFamily` | Heading font stack | `"Poppins", "Roboto", sans-serif` |
| `monoFontFamily` | Monospace font stack | `"JetBrains Mono", monospace` |
| `fontSizeBase` | Base font size | `14px` |
| `fontWeightLight` | Light weight value | `300` |
| `fontWeightRegular` | Regular weight value | `400` |
| `fontWeightMedium` | Medium weight value | `500` |
| `fontWeightBold` | Bold weight value | `700` |

### Typography Variants

Each variant (h1-h6, body1, body2, button, caption) has 5 properties:
- `FontSize` - e.g., `2.5rem`
- `FontWeight` - e.g., `700`
- `LineHeight` - e.g., `1.2`
- `LetterSpacing` - e.g., `-0.02em`
- `TextTransform` - e.g., `none`, `uppercase`

**Property naming pattern:** `typography{Variant}{Property}`

Examples:
- `typographyH1FontSize`, `typographyH1FontWeight`, `typographyH1LineHeight`
- `typographyBody1FontSize`, `typographyButtonTextTransform`

**Available variants:** `H1`, `H2`, `H3`, `H4`, `H5`, `H6`, `Body1`, `Body2`, `Button`, `Caption`

### Sizing & Density

| Property | Purpose | Values/Example |
|----------|---------|----------------|
| `borderRadius` | Default corner radius | `8px` |
| `density` | UI density | `compact`, `normal`, `comfortable` |

### Asset Paths

| Property | Purpose |
|----------|---------|
| `logoPath` | Main logo (sidebar, login) |
| `iconPath` | Small icon (favicon base) |
| `faviconPath` | Browser favicon |

### Icon Style

| Property | Values |
|----------|--------|
| `iconStyle` | `filled`, `outlined`, `rounded`, `sharp`, `two-tone` |

### Branded Header Bar

Optional banner at viewport top, above the main navigation.

| Property | Purpose | Example |
|----------|---------|---------|
| `brandedHeaderEnabled` | Toggle visibility | `true` / `false` |
| `brandedHeaderBackgroundColor` | Banner background | `#0D47A1` |
| `brandedHeaderTextColor` | Banner text color | `#FFFFFF` |
| `brandedHeaderLogoPath` | Logo image path | `/header-logo.png` |
| `brandedHeaderLogoAltText` | Logo alt text | `Company Logo` |
| `brandedHeaderHeight` | Banner height | `48px` |
| `brandedHeaderTagline` | Optional tagline text | `Enterprise Platform` |

### App Bar (Top Navigation)

| Property | Purpose |
|----------|---------|
| `appBarBackgroundColor` | NavBar background |
| `appBarTextColor` | NavBar text/icons |

### Sidebar Navigation

| Property | Purpose |
|----------|---------|
| `sidebarBackgroundColor` | Sidebar background |
| `sidebarTextColor` | Sidebar text |
| `sidebarIconColor` | Sidebar icons |
| `sidebarSelectedBackgroundColor` | Selected item background |
| `sidebarSelectedTextColor` | Selected item text |
| `sidebarHoverBackgroundColor` | Hover state background |
| `sidebarDividerColor` | Section dividers |

### Data Tables

| Property | Purpose |
|----------|---------|
| `tableHeaderBackgroundColor` | Header row background |
| `tableHeaderTextColor` | Header text |
| `tableRowHoverColor` | Row hover background |
| `tableRowSelectedColor` | Selected row background |
| `tableBorderColor` | Table borders |

### General UI Elements

| Property | Purpose |
|----------|---------|
| `dividerColor` | Horizontal/vertical dividers |
| `borderColor` | Input/form borders |
| `cardBorderColor` | Card borders |

### Form Inputs

| Property | Purpose |
|----------|---------|
| `inputBorderColor` | Input field border color |

### Custom CSS

| Property | Purpose |
|----------|---------|
| `customCss` | Raw CSS injection for advanced customization |

---

## CSS Variable Reference

All theme properties become CSS custom properties with `--qqq-` prefix using kebab-case:

| Java Property | CSS Variable |
|--------------|--------------|
| `primaryColor` | `--qqq-primary-color` |
| `sidebarBackgroundColor` | `--qqq-sidebar-background-color` |
| `typographyH1FontSize` | `--qqq-typography-h1-font-size` |

**Pattern:** `camelCase` → `--qqq-kebab-case`

### Additional Generated Variables

The frontend also generates these derived variables:

```css
/* Grey scale */
--qqq-grey-100 through --qqq-grey-900

/* Chart colors */
--qqq-chart-grid-color
--qqq-chart-text-color
--qqq-chart-background-color

/* Link color (derived from primaryColor) */
--qqq-link-color

/* Spacing (derived from density) */
--qqq-spacing-base
--qqq-spacing-small
--qqq-spacing-medium
--qqq-spacing-large

/* Action colors */
--qqq-action-active
--qqq-action-hover
--qqq-action-selected
--qqq-action-disabled

/* Status variants (light/dark derived from status colors) */
--qqq-info-light, --qqq-info-dark
--qqq-success-light, --qqq-success-dark
--qqq-warning-light, --qqq-warning-dark
--qqq-error-light, --qqq-error-dark

/* Primary contrast text */
--qqq-primary-contrast-text
```

### Component-Specific Variables

These variables are used by components with fallback values. Override them via `customCss`:

```css
/* Stepper */
--qqq-stepper-inactive-color: #9fc9ff;

/* Tooltip */
--qqq-tooltip-background-color: #ffffff;
--qqq-tooltip-text-color: var(--qqq-text-primary, #344767);
--qqq-tooltip-shadow: 0px 0px 12px rgba(128, 128, 128, 0.40);

/* Form Inputs */
--qqq-input-border-color: #d2d6da;

/* Menu */
--qqq-menu-hover-color: #f0f2f5;

/* Switch */
--qqq-switch-track-color: #bdbdbd;
```

---

## Using CSS Variables in Components

Frontend components use CSS variables with fallbacks:

```css
background-color: var(--qqq-primary-color, #1976D2);
color: var(--qqq-sidebar-text-color, #A2A3B7);
```

The fallback value (after comma) is used if the variable is undefined.

---

## Theme Application Flow

1. Backend serves `MaterialDashboardThemeMetaData` via `/metaData` endpoint
2. Frontend receives theme in `QInstance.theme`
3. `themeUtils.ts` calls `injectThemeVariables(theme)`
4. Function sets CSS custom properties on `:root`
5. Components read values via `var(--qqq-*)` references
6. Icon fonts are dynamically loaded based on `iconStyle`

---

## Minimal vs Complete Configuration

**Minimal** - Override only what differs from defaults:
```java
new MaterialDashboardThemeMetaData()
   .withPrimaryColor("#E91E63")
   .withBrandedHeaderEnabled(true);
```

**Complete** - Specify all properties for full control (see `EXAMPLE_THEME_CONFIGURATION.md`).

---

## Dark Theme Considerations

For dark themes, invert the typical light/dark relationships:
- `backgroundColor`: Dark (e.g., `#121212`)
- `surfaceColor`: Slightly lighter dark (e.g., `#1E1E1E`)
- `textPrimary`: Light (e.g., `#FFFFFF`)
- `primaryColor`: Use lighter/brighter variant for visibility
- Adjust sidebar, table, and border colors accordingly

---

## File Locations

| Repository                      | Key Files |
|---------------------------------|-----------|
| qqq-backend-core                | `MaterialDashboardThemeMetaData.java` |
| qqq-frontend-material-dashboard | `MaterialDashboardThemeMetaData.ts` |
| qqq-frontend-material-dashboard | `themeUtils.ts`, `qqq-override-styles.css` |

---

## Backwards Compatibility

- All properties are optional
- Missing properties use sensible defaults
- Existing applications without theme configuration continue to work unchanged
