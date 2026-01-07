# TODO - Pluggable Themes + CSS Selectors

**Last Updated:** 2026-01-06

## Active Tasks

- [ ] **Optional: Convert hardcoded colors to CSS variables**
  - See `docs/TODO-hardcoded-colors.md` for detailed list (~16 files, ~33 instances)
  - Priority 1: Widget components (user-facing)
  - Priority 2: Bulk load components
  - Priority 3: Theme components
  - Priority 4: Legacy components

- [ ] **Prepare PR for develop branch**
  - Update version back to `0.36.0-SNAPSHOT` before merge

## Recently Completed

- [x] **Feature snapshot published** - Tag `publish-9035122`
- [x] **JAR build verified** - Contains correct JS (`main.2f9c1ea9.js`)

## Completed

- [x] **Fix #314**: CSS variables not consumed by components
  - Fixed `--qqq-sidebar-icon-color` - removed hardcoded colors in SideNavCollapse.ts, SideNavItem.ts
  - Fixed `--qqq-font-size-base` - added `.MuiTypography-root` to CSS rule
- [x] **Process screens theming**: Updated stepper and process components to use CSS variables
  - Stepper: background, icon, connector, label now use `--qqq-stepper-*` and `--qqq-primary-color`
  - ProcessRun, ProcessSummaryResults, ValidationReview: borders and backgrounds now themed

- [x] Phase 1: Theme infrastructure (CSS variables, themeUtils.ts)
- [x] Phase 2: MUI component overrides migration
- [x] Phase 3: Component CSS variable consumption
- [x] Phase 4: Selenium theme tests (60 tests pass)
- [x] **CSS Selectors - Sidenav**: Root, items, collapse, logout
- [x] **CSS Selectors - Buttons**: MDButton text/icon, menu buttons
- [x] **CSS Selectors - Forms**: Inputs, selects, field containers
- [x] **CSS Selectors - Query Screen**: Action menu, views, columns, table headers
- [x] **CSS Selectors - App Home**: Headers, sections, table/process/report cards
- [x] **CSS Selectors - Record View**: Header, avatar, title, actions menu, sections, button bar, delete dialog
- [x] **CSS Selectors - Record Create/Edit**: Header, avatar, title, sections, button bar (via EntityForm)
- [x] **CSS Selectors - Sidebar**: Container, section items
- [x] **Gradient buttons use CSS variables**: MDButtonRoot maps color props to --qqq-* vars
- [x] **Icon boxes use CSS variables**: MiniStatisticsCard, ProcessLinkCard use --qqq-info-color

## Test Status

| Test Suite | Tests | Status |
|------------|-------|--------|
| ThemeMuiComponentIT | 27 | PASS |
| ThemeIT | 33 | PASS |
| **Total** | **60** | **PASS** |

## Version

`0.36.0-pluggable-themes-css-selectors-SNAPSHOT`
