# QQQ Pluggable Theme System - Testing Guide

**Version:** 0.36.0-SNAPSHOT
**Date:** 2026-01-03

## Overview

The QQQ dashboard now supports runtime theme customization via CSS custom properties. Theme configuration is defined in Java and automatically injected as `--qqq-*` CSS variables.

## Dependencies

```xml
<dependency>
    <groupId>com.kingsrook.qqq</groupId>
    <artifactId>qqq-backend-core</artifactId>
    <version>0.36.0-SNAPSHOT</version>
</dependency>
```

## Basic Configuration

Add theme configuration to your QInstance:

```java
MaterialDashboardThemeMetaData theme = new MaterialDashboardThemeMetaData()
   // Core colors
   .withPrimaryColor("#1976D2")
   .withSecondaryColor("#9C27B0")
   .withBackgroundColor("#F5F5F5")
   .withSurfaceColor("#FFFFFF")
   .withTextPrimary("#212121")
   .withTextSecondary("#757575")

   // Status colors
   .withErrorColor("#D32F2F")
   .withWarningColor("#F57C00")
   .withSuccessColor("#388E3C")
   .withInfoColor("#1976D2")

   // Sidebar
   .withSidebarBackgroundColor("#1E1E2D")
   .withSidebarTextColor("#FFFFFF")
   .withSidebarIconColor("#FFFFFF")

   // Tables
   .withTableHeaderBackgroundColor("#F5F5F5")
   .withTableHeaderTextColor("#212121")

   // Typography
   .withFontFamily("Inter, sans-serif")
   .withTypographyH1FontSize("2.5rem")
   .withTypographyH1FontWeight(700)

   // Sizing
   .withBorderRadius("8px")
   .withDensity("comfortable");

qInstance.withSupplementalMetaData(theme);
```

## Available Properties

### Core Colors
| Property | CSS Variable | Default |
|----------|--------------|---------|
| `primaryColor` | `--qqq-primary-color` | `#0062FF` |
| `secondaryColor` | `--qqq-secondary-color` | `#7b809a` |
| `backgroundColor` | `--qqq-background-color` | `#f0f2f5` |
| `surfaceColor` | `--qqq-surface-color` | `#ffffff` |
| `textPrimary` | `--qqq-text-primary` | `#344767` |
| `textSecondary` | `--qqq-text-secondary` | `#7b809a` |

### Status Colors
| Property | CSS Variable | Default |
|----------|--------------|---------|
| `errorColor` | `--qqq-error-color` | `#F44335` |
| `warningColor` | `--qqq-warning-color` | `#fb8c00` |
| `successColor` | `--qqq-success-color` | `#4CAF50` |
| `infoColor` | `--qqq-info-color` | `#0062FF` |

### Sidebar
| Property | CSS Variable |
|----------|--------------|
| `sidebarBackgroundColor` | `--qqq-sidebar-background-color` |
| `sidebarTextColor` | `--qqq-sidebar-text-color` |
| `sidebarIconColor` | `--qqq-sidebar-icon-color` |
| `sidebarSelectedBackgroundColor` | `--qqq-sidebar-selected-background-color` |
| `sidebarSelectedTextColor` | `--qqq-sidebar-selected-text-color` |
| `sidebarHoverBackgroundColor` | `--qqq-sidebar-hover-background-color` |
| `sidebarDividerColor` | `--qqq-sidebar-divider-color` |

### Tables
| Property | CSS Variable |
|----------|--------------|
| `tableHeaderBackgroundColor` | `--qqq-table-header-background-color` |
| `tableHeaderTextColor` | `--qqq-table-header-text-color` |
| `tableRowHoverColor` | `--qqq-table-row-hover-color` |
| `tableRowSelectedColor` | `--qqq-table-row-selected-color` |
| `tableBorderColor` | `--qqq-table-border-color` |

### Typography
| Property | CSS Variable |
|----------|--------------|
| `fontFamily` | `--qqq-font-family` |
| `headerFontFamily` | `--qqq-header-font-family` |
| `monoFontFamily` | `--qqq-mono-font-family` |
| `typographyH1FontSize` | `--qqq-typography-h1-font-size` |
| `typographyH1FontWeight` | `--qqq-typography-h1-font-weight` |
| `typographyH1LineHeight` | `--qqq-typography-h1-line-height` |
| `typographyH1LetterSpacing` | `--qqq-typography-h1-letter-spacing` |

Same pattern for H2-H6, Body1, Body2, Button, Caption.

### General
| Property | CSS Variable | Values |
|----------|--------------|--------|
| `borderRadius` | `--qqq-border-radius` | CSS size (e.g., `8px`) |
| `density` | `--qqq-density` | `compact`, `normal`, `comfortable` |
| `dividerColor` | `--qqq-divider-color` | Hex color |
| `borderColor` | `--qqq-border-color` | Hex color |
| `cardBorderColor` | `--qqq-card-border-color` | Hex color |

### Branded Header
| Property | CSS Variable |
|----------|--------------|
| `brandedHeaderEnabled` | `--qqq-branded-header-enabled` |
| `brandedHeaderBackgroundColor` | `--qqq-branded-header-background-color` |
| `brandedHeaderTextColor` | `--qqq-branded-header-text-color` |
| `brandedHeaderLogoPath` | `--qqq-branded-header-logo-path` |
| `brandedHeaderLogoAltText` | N/A (used in component) |
| `brandedHeaderHeight` | `--qqq-branded-header-height` |
| `brandedHeaderTagline` | N/A (used in component) |

### Assets & Icons
| Property | Values |
|----------|--------|
| `logoPath` | URL to logo image |
| `iconPath` | URL to icon |
| `faviconPath` | URL to favicon |
| `iconStyle` | `filled`, `outlined`, `rounded`, `sharp`, `two-tone` |
| `customCss` | Raw CSS string injected into page |

## Test Cases

### 1. Basic Color Test
```java
new MaterialDashboardThemeMetaData()
   .withPrimaryColor("#FF5722")
   .withSidebarBackgroundColor("#263238");
```
**Verify:** Primary buttons are orange, sidebar is dark blue-gray.

### 2. Typography Test
```java
new MaterialDashboardThemeMetaData()
   .withFontFamily("Georgia, serif")
   .withTypographyH1FontSize("3rem")
   .withTypographyH1FontWeight(800);
```
**Verify:** Page uses serif font, H1 headers are large and bold.

### 3. Branded Header Test
```java
new MaterialDashboardThemeMetaData()
   .withBrandedHeaderEnabled(true)
   .withBrandedHeaderBackgroundColor("#1a237e")
   .withBrandedHeaderTextColor("#ffffff")
   .withBrandedHeaderTagline("My Application")
   .withBrandedHeaderHeight("48px");
```
**Verify:** Fixed header bar appears at top with tagline.

### 4. Density Test
```java
new MaterialDashboardThemeMetaData()
   .withDensity("compact");
```
**Verify:** Reduced spacing throughout the UI.

### 5. DevTools Verification
1. Open browser DevTools
2. Inspect `:root` element
3. Verify `--qqq-*` CSS variables are present with configured values

## Expected Behavior

1. Properties serialize to JSON via `/metaData` endpoint under `supplementalMetaData.theme`
2. Frontend reads theme from metadata response
3. `themeUtils.ts` injects values as CSS custom properties on `:root`
4. MUI components and CSS overrides reference these variables
5. Unset properties fall back to sensible defaults

## Troubleshooting

**Theme not applying:**
- Check `/metaData` response includes `supplementalMetaData.theme`
- Verify CSS variables exist on `:root` in DevTools
- Clear browser cache and hard refresh

**Colors look wrong:**
- Ensure hex colors include `#` prefix
- Verify color format is `#RGB`, `#RRGGBB`, or `#RRGGBBAA`

**Typography not changing:**
- Font family must be available (loaded via Google Fonts or local)
- Check `--qqq-font-family` variable is set correctly
