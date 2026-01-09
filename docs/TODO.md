# TODO - Pluggable Themes + CSS Selectors

**Last Updated:** 2026-01-07

## Active Tasks

- [ ] **me-health team testing** - Awaiting validation before PR
- [ ] **Create PR to develop** - After testing complete
- [ ] **Update version** - Change to `0.36.0-SNAPSHOT` before merge

## Recently Completed

- [x] **Hardcoded color conversion** - All ~33 instances across 16 files (commit `5340c03`)
  - All CSS variables have proper fallback values for 100% backwards compatibility
  - Build passes, all 88 theme tests pass
  - CI pipeline #1340 passed

- [x] **Feature snapshot published** - Tag `publish-ad8453d`
- [x] **JAR build verified** - Contains correct JS (`main.2f9c1ea9.js`)

## Completed

- [x] **Convert hardcoded colors to CSS variables** (16 files, ~33 instances)
  - See `docs/TODO-hardcoded-colors.md` for detailed list
  - Priority 1: Widget components (user-facing) - DONE
  - Priority 2: Bulk load components - DONE
  - Priority 3: Theme components - DONE
  - Priority 4: Legacy components - DONE

- [x] **Fix #314**: CSS variables not consumed by components
- [x] **Process screens theming**: Stepper and process components use CSS variables
- [x] Phase 1: Theme infrastructure (CSS variables, themeUtils.ts)
- [x] Phase 2: MUI component overrides migration
- [x] Phase 3: Component CSS variable consumption
- [x] Phase 4: Selenium theme tests (88 tests pass)
- [x] **CSS Selectors**: All major UI elements have `data-qqq-id` attributes
- [x] **Gradient buttons use CSS variables**
- [x] **Icon boxes use CSS variables**

## Test Status

| Test Suite | Tests | Status |
|------------|-------|--------|
| ThemeMuiComponentIT | 27 | PASS |
| ThemeIT | 33 | PASS |
| Other Theme Tests | 28 | PASS |
| **Total** | **88** | **PASS** |

## Version

`0.36.0-pluggable-themes-css-selectors-SNAPSHOT`
