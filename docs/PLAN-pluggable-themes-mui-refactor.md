# PLAN: Pluggable Themes - MUI ThemeProvider Refactor

## Overview

Refactor the pluggable themes implementation from CSS-variable-override approach to MUI ThemeProvider-first approach. The goal is to eliminate the 1200-line CSS override file by letting MUI style its own components correctly from the start.

## Git Branch Surgery

### Current State
- `develop` branch contains 42 commits of CSS variable theme work (since 0.35.0)
- All commits have been pushed to `origin/develop`
- Commit `759581b` is the version bump to 0.36.0-SNAPSHOT (clean base)
- Commit `f807698` is the 0.35.0 release

### Target State
- CSS variable work preserved on `feature/pluggable-themes-v1-css-vars`
- `develop` reset to `759581b` (0.36.0-SNAPSHOT, pre-theme work)
- New `feature/pluggable-themes-v2-mui` branch for MUI refactor

### Step 1: Create Branch to Preserve CSS Variable Work
```bash
# From develop (which has all the CSS var work)
git checkout develop
git checkout -b feature/pluggable-themes-v1-css-vars

# Push to origin to preserve it
git push -u origin feature/pluggable-themes-v1-css-vars
```

### Step 2: Reset develop to Pre-Theme State
```bash
# Switch back to develop
git checkout develop

# Reset to the version bump commit (before any theme work)
git reset --hard 759581b

# Force push to origin (CAUTION: coordinate with team first)
git push --force-with-lease origin develop
```

### Step 3: Create MUI Refactor Branch
```bash
# Create new feature branch from clean develop
git checkout -b feature/pluggable-themes-v2-mui

# Push to origin
git push -u origin feature/pluggable-themes-v2-mui
```

### Verification
```bash
# Verify develop is clean
git log --oneline develop -5
# Should show: 759581b as HEAD

# Verify v1 branch has all the CSS var work
git log --oneline feature/pluggable-themes-v1-css-vars -5
# Should show: 385130a (chore: ignore Playwright test artifacts) as HEAD

# Verify v2 branch is ready for new work
git log --oneline feature/pluggable-themes-v2-mui -5
# Should show: 759581b as HEAD
```

---

## Implementation Phases

### Phase 1: Infrastructure Setup (Day 1)

#### 1.1 Copy Essential Files from v1 Branch
Files to bring over (they contain valuable work):
```
src/qqq/utils/themeUtils.ts          # DEFAULT_THEME, helper functions
src/test/java/com/kingsrook/qqq/frontend/materialdashboard/selenium/tests/ThemeIT.java
src/test/java/com/kingsrook/qqq/frontend/materialdashboard/selenium/tests/ThemeComponentRenderingIT.java
src/test/java/com/kingsrook/qqq/frontend/materialdashboard/selenium/tests/ThemeMuiComponentIT.java
src/test/resources/fixtures/metaData/withFullCustomTheme.json
src/test/resources/fixtures/metaData/withBrandedHeader.json
src/test/resources/fixtures/metaData/withCompactDensity.json
docs/blog-drafts/*                    # Blog posts for reference
```

```bash
# From feature/pluggable-themes-v2-mui
git checkout feature/pluggable-themes-v1-css-vars -- src/qqq/utils/themeUtils.ts
git checkout feature/pluggable-themes-v1-css-vars -- "src/test/java/com/kingsrook/qqq/frontend/materialdashboard/selenium/tests/Theme*.java"
git checkout feature/pluggable-themes-v1-css-vars -- "src/test/resources/fixtures/metaData/with*.json"
git checkout feature/pluggable-themes-v1-css-vars -- docs/blog-drafts/
```

#### 1.2 Create createDynamicTheme.ts
New file: `src/qqq/utils/createDynamicTheme.ts`

```typescript
import { createTheme, Theme } from "@mui/material";
import { MaterialDashboardThemeMetaData } from "qqq/models/metadata/MaterialDashboardThemeMetaData";
import { DEFAULT_THEME } from "./themeUtils";

export function createDynamicTheme(themeData?: MaterialDashboardThemeMetaData): Theme {
   // Merge with defaults
   const theme = { ...DEFAULT_THEME, ...filterUndefined(themeData) };

   return createTheme({
      palette: {
         primary: { main: theme.primaryColor },
         secondary: { main: theme.secondaryColor },
         background: {
            default: theme.backgroundColor,
            paper: theme.surfaceColor,
         },
         text: {
            primary: theme.textPrimary,
            secondary: theme.textSecondary,
         },
         error: { main: theme.errorColor },
         warning: { main: theme.warningColor },
         success: { main: theme.successColor },
         info: { main: theme.infoColor },
      },
      typography: {
         fontFamily: theme.fontFamily,
         h1: {
            fontSize: theme.typographyH1FontSize,
            fontWeight: theme.typographyH1FontWeight,
            lineHeight: theme.typographyH1LineHeight,
            letterSpacing: theme.typographyH1LetterSpacing,
         },
         // ... h2-h6, body1, body2, button, caption
      },
      shape: {
         borderRadius: parseInt(theme.borderRadius) || 8,
      },
      components: {
         // Component overrides go here - see Phase 2
      },
   });
}

function filterUndefined(obj?: Record<string, unknown>): Record<string, unknown> {
   if (!obj) return {};
   return Object.fromEntries(
      Object.entries(obj).filter(([_, v]) => v !== undefined)
   );
}
```

#### 1.3 Create injectIslandVariables.ts
New file: `src/qqq/utils/injectIslandVariables.ts`

This injects CSS variables ONLY for sidebar, branded header, and non-MUI components.

```typescript
import { MaterialDashboardThemeMetaData } from "qqq/models/metadata/MaterialDashboardThemeMetaData";
import { DEFAULT_THEME } from "./themeUtils";

const CSS_VAR_PREFIX = "--qqq-";

export function injectIslandVariables(themeData?: MaterialDashboardThemeMetaData): void {
   const root = document.documentElement;
   const theme = { ...DEFAULT_THEME, ...filterUndefined(themeData) };

   // Sidebar island
   setVar(root, "sidebar-background-color", theme.sidebarBackgroundColor);
   setVar(root, "sidebar-text-color", theme.sidebarTextColor);
   setVar(root, "sidebar-icon-color", theme.sidebarIconColor);
   setVar(root, "sidebar-selected-background-color", theme.sidebarSelectedBackgroundColor);
   setVar(root, "sidebar-selected-text-color", theme.sidebarSelectedTextColor);
   setVar(root, "sidebar-hover-background-color", theme.sidebarHoverBackgroundColor);
   setVar(root, "sidebar-divider-color", theme.sidebarDividerColor);

   // Branded header island
   setVar(root, "branded-header-background-color", theme.brandedHeaderBackgroundColor);
   setVar(root, "branded-header-text-color", theme.brandedHeaderTextColor);
   setVar(root, "branded-header-height", theme.brandedHeaderHeight);

   // DataGrid (has its own theming needs)
   setVar(root, "table-header-background-color", theme.tableHeaderBackgroundColor);
   setVar(root, "table-header-text-color", theme.tableHeaderTextColor);
   setVar(root, "table-row-hover-color", theme.tableRowHoverColor);
   setVar(root, "table-row-selected-color", theme.tableRowSelectedColor);
   setVar(root, "table-border-color", theme.tableBorderColor);

   // Icon style (for material icons variant selection)
   setVar(root, "icon-style", theme.iconStyle);
}

function setVar(root: HTMLElement, name: string, value: unknown): void {
   if (value != null) {
      root.style.setProperty(`${CSS_VAR_PREFIX}${name}`, String(value));
   }
}
```

#### 1.4 Update App.tsx Theme Integration
Modify `src/App.tsx` to use the new theme builder:

```typescript
// Old imports
import { injectThemeVariables } from "qqq/utils/themeUtils";
import { createQqqTheme } from "qqq/components/legacy/Theme";

// New imports
import { createDynamicTheme } from "qqq/utils/createDynamicTheme";
import { injectIslandVariables } from "qqq/utils/injectIslandVariables";

// In the metadata loading effect:
useEffect(() => {
   // ... existing metadata loading ...

   // OLD:
   // injectThemeVariables(metaData.theme);
   // setTheme(createQqqTheme());

   // NEW:
   const muiTheme = createDynamicTheme(metaData.theme);
   setTheme(muiTheme);
   injectIslandVariables(metaData.theme);

}, [metaData]);
```

---

### Phase 2: Migrate Component Overrides (Days 1-2)

The goal is to move component styling from CSS overrides into MUI's theme.components.

#### 2.1 Component Override Migration Order

| Priority | Component | Current Location | Complexity |
|----------|-----------|------------------|------------|
| 1 | MuiButton | button/contained.ts, button/outlined.ts | Low - already uses CSS vars |
| 2 | MuiCard | card/index.ts | Low |
| 3 | MuiTextField, MuiInput | form/input.ts, form/textField.ts | Medium |
| 4 | MuiTypography | (CSS overrides) | Medium |
| 5 | MuiAppBar | appBar.ts | Low |
| 6 | MuiDivider | divider.ts | Low |
| 7 | MuiTableHead, MuiTableCell | table/*.ts | Medium |
| 8 | MuiStepper, MuiStep* | stepper/*.ts | Medium |
| 9 | MuiTabs, MuiTab | tabs/*.ts | Low |
| 10 | MuiMenu, MuiMenuItem | menu/*.ts | Low |
| 11 | MuiTooltip | tooltip.ts | Low |
| 12 | MuiDialog* | dialog/*.ts | Low |
| 13 | Remaining components | Various | Low-Medium |

#### 2.2 Migration Pattern

For each component:

1. **Read current CSS override** in `qqq-override-styles.css`
2. **Read current component file** in `assets/theme/components/`
3. **Identify which styles need theme values**
4. **Add to createDynamicTheme.ts** components section
5. **Remove from CSS override file**
6. **Run tests** to verify

Example for MuiButton:

```typescript
// In createDynamicTheme.ts components section:
MuiButton: {
   styleOverrides: {
      root: {
         textTransform: 'none',
         borderRadius: theme.borderRadius,
      },
      containedPrimary: {
         backgroundColor: theme.primaryColor,
         color: '#fff',
         '&:hover': {
            backgroundColor: theme.primaryColor,
            filter: 'brightness(0.9)',
         },
      },
      containedSecondary: {
         backgroundColor: theme.secondaryColor,
         color: '#fff',
         '&:hover': {
            backgroundColor: theme.secondaryColor,
            filter: 'brightness(0.9)',
         },
      },
      outlinedPrimary: {
         borderColor: theme.primaryColor,
         color: theme.primaryColor,
         '&:hover': {
            borderColor: theme.primaryColor,
            backgroundColor: `${theme.primaryColor}10`,
         },
      },
   },
},
```

#### 2.3 Files to Modify

| File | Action |
|------|--------|
| `src/qqq/utils/createDynamicTheme.ts` | Add component overrides progressively |
| `src/qqq/assets/theme/components/button/*.ts` | May delete or simplify |
| `src/qqq/assets/theme/components/card/*.ts` | May delete or simplify |
| `src/qqq/assets/theme/components/form/*.ts` | May delete or simplify |
| `src/qqq/assets/theme/components/table/*.ts` | May delete or simplify |
| `src/qqq/assets/theme/components/menu/*.ts` | May delete or simplify |
| `src/qqq/assets/theme/components/stepper/*.ts` | May delete or simplify |
| `src/qqq/assets/theme/components/tabs/*.ts` | May delete or simplify |
| `src/qqq/assets/theme/components/dialog/*.ts` | May delete or simplify |
| `src/qqq/assets/theme/base/colors.ts` | Simplify - remove CSS var getters |
| `src/qqq/components/legacy/Theme.ts` | Simplify or remove |

---

### Phase 3: Reduce CSS Override File (Day 2-3)

#### 3.1 Categorize Current Overrides

The current `qqq-override-styles.css` has ~1213 lines. Categorize:

| Category | Lines (est.) | Action |
|----------|--------------|--------|
| DataGrid-specific | ~300 | Keep (DataGrid has own theming) |
| Sidebar (island) | ~80 | Keep (CSS vars for island) |
| Branded Header (island) | ~30 | Keep (CSS vars for island) |
| MUI component colors | ~400 | DELETE (handled by MUI theme) |
| MUI component spacing/layout | ~200 | Review - some may stay |
| Typography overrides | ~100 | DELETE (handled by MUI theme) |
| Miscellaneous/utility | ~100 | Review case by case |

#### 3.2 Lines to Delete

Search and remove patterns like:
```css
/* DELETE - MUI theme handles this */
.MuiButton-containedPrimary { background-color: var(--qqq-primary-color) !important; }
.MuiTypography-body2:not(...) { color: var(--qqq-text-secondary) !important; }
.MuiCard-root { border-color: var(--qqq-card-border-color) !important; }
```

#### 3.3 Lines to Keep

Keep patterns like:
```css
/* KEEP - DataGrid specific */
.MuiDataGrid-cell { font-size: 0.85rem; }
.MuiDataGrid-columnHeaderTitle { font-size: 0.75rem; }

/* KEEP - Sidebar island */
.MuiDrawer-root .MuiListItemText-primary { color: var(--qqq-sidebar-text-color); }

/* KEEP - Layout/structure (not theming) */
.recordQuery .MuiDataGrid-virtualScrollerContent { min-height: calc(100vh - 450px); }
```

#### 3.4 Target Metrics

| Metric | Before | After |
|--------|--------|-------|
| Total lines | 1213 | ~300-400 |
| `!important` count | 82 | ~10-15 |
| `:not()` chains | 19 | ~2-3 |

---

### Phase 4: Testing and Validation (Day 3)

#### 4.1 Playwright Test Execution

```bash
# Start React dev server
PORT=3001 REACT_APP_PROXY_LOCALHOST_PORT=8001 npm start

# In another terminal, run theme tests
QQQ_SELENIUM_HEADLESS=true mvn test -Dtest=ThemeIT
QQQ_SELENIUM_HEADLESS=true mvn test -Dtest=ThemeComponentRenderingIT
QQQ_SELENIUM_HEADLESS=true mvn test -Dtest=ThemeMuiComponentIT
```

#### 4.2 Expected Test Behavior

The tests verify RENDERED colors, not implementation. They should pass with no changes because:
- Tests check `getComputedStyle(element).backgroundColor`
- Whether that color came from CSS vars or MUI theme, the rendered result is the same
- If a test fails, it indicates a regression in the refactor

#### 4.3 Manual Verification Checklist

- [ ] Primary color applies to buttons, links, active states
- [ ] Secondary color applies where expected
- [ ] Background color applies to page background
- [ ] Surface color applies to cards, paper elements
- [ ] Text primary/secondary colors render correctly
- [ ] Sidebar has correct background, text, icon colors
- [ ] Sidebar hover and selected states work
- [ ] Branded header (when enabled) has correct colors
- [ ] DataGrid headers and rows have correct colors
- [ ] Typography variants (h1-h6, body1, body2) look correct
- [ ] Border radius applies to buttons, cards, inputs
- [ ] No visual regressions in existing app screens

#### 4.4 CI Pipeline

Ensure CircleCI runs all tests:
```bash
# Full test suite
mvn verify -Pci
```

---

## File Inventory

### New Files to Create

| File | Purpose                                               |
|------|-------------------------------------------------------|
| `src/qqq/utils/createDynamicTheme.ts` | MUI theme builder from MaterialDashboardThemeMetaData |
| `src/qqq/utils/injectIslandVariables.ts` | CSS vars for sidebar/header islands only              |

### Files to Modify

| File | Changes |
|------|---------|
| `src/App.tsx` | Use new theme builder |
| `src/qqq/utils/themeUtils.ts` | Keep DEFAULT_THEME, remove injectThemeVariables |
| `src/qqq/styles/qqq-override-styles.css` | Delete ~800 lines |
| `src/qqq/assets/theme/base/colors.ts` | Simplify, remove getters |
| `src/qqq/components/legacy/Theme.ts` | Simplify or delete |
| `src/qqq/assets/theme/components/*.ts` | Many files simplified or deleted |

### Files to Delete (Maybe)

| File | Reason |
|------|--------|
| `src/qqq/assets/theme/components/button/contained.ts` | Moved to createDynamicTheme |
| `src/qqq/assets/theme/components/button/outlined.ts` | Moved to createDynamicTheme |
| (evaluate each component file) | |

---

## Success Criteria

1. All 26 Playwright tests pass
2. CSS override file reduced from 1213 to <400 lines
3. `!important` count reduced from 82 to <15
4. Theme data flows directly: MaterialDashboardThemeMetaData -> MUI Theme -> Components
5. No visual regressions in app
6. CI pipeline passes

---

## Rollback Plan

If refactor causes significant issues:
```bash
# The v1 CSS variable approach is preserved
git checkout feature/pluggable-themes-v1-css-vars

# Or cherry-pick specific fixes back
git cherry-pick <commit-hash>
```

---

## Timeline Estimate

| Phase | Duration | Dependencies |
|-------|----------|--------------|
| Git branch surgery | 30 min | None |
| Phase 1: Infrastructure | 4-6 hours | Branch surgery complete |
| Phase 2: Component migration | 8-12 hours | Phase 1 complete |
| Phase 3: CSS reduction | 4-6 hours | Phase 2 complete |
| Phase 4: Testing | 4-6 hours | Phase 3 complete |
| Buffer for issues | 4-8 hours | |
| **Total** | **3-5 days** | |
