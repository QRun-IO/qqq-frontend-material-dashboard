# TODO - Pluggable Themes

**Last Updated:** 2026-01-04

## Active Tasks

- [ ] **Debug me-health-portal theme integration issue**
  - me-health team reports seeing "dark Tailwind theme" instead of themed output
  - JAR verified to be correctly built and installed
  - Theme config verified in their codebase

- [ ] **Verify JS bundle contains theme injection code**
  - Need to inspect the bundled JS to confirm `injectIslandVariables` is included
  - Check if createDynamicTheme.ts is bundled correctly

- [ ] **Check if me-health app is caching old resources**
  - May need `mvn clean` on their side
  - Check browser cache / service worker

## Completed

- [x] Phase 1: Create theme builder infrastructure
- [x] Phase 2: Migrate component overrides to MUI theme
- [x] Phase 3: Make components use CSS variables
  - [x] Fix sidebar to use CSS variables
  - [x] Fix input fields to use CSS variables
  - [x] Fix menu to use CSS variables
  - [x] Fix branded header rendering
- [x] Phase 4: Run theme tests and validate (60 tests pass)

## Test Status

| Test Suite | Tests | Status |
|------------|-------|--------|
| ThemeMuiComponentIT | 27 | PASS |
| ThemeIT | 33 | PASS |
| **Total** | **60** | **PASS** |
