# TODO - Pluggable Themes

**Last Updated:** 2026-01-04

## Active Tasks

- [ ] **Await me-health team feedback**
  - Snapshot `0.36.0-pluggable-themes-SNAPSHOT` published to Maven Central
  - They need to run `mvn clean package -U` to pull latest

- [ ] **Prepare PR for develop branch**
  - Once me-health confirms theming works
  - Update version back to `0.36.0-SNAPSHOT` before merge

## Completed

- [x] Phase 1: Create theme builder infrastructure
- [x] Phase 2: Migrate component overrides to MUI theme
- [x] Phase 3: Make components use CSS variables
  - [x] Fix sidebar to use CSS variables
  - [x] Fix input fields to use CSS variables
  - [x] Fix menu to use CSS variables
  - [x] Fix branded header rendering
- [x] Phase 4: Run theme tests and validate (60 tests pass)
- [x] **Fix sidebar selected text/icon color CSS specificity**
  - Added icon selectors to selected text color rule
  - Both text AND icons now use `sidebarSelectedTextColor` when selected
- [x] **Add base typography font-size variable**
  - `body` and `html` now use `--qqq-font-size-base`
- [x] **Publish feature branch snapshot**
  - Version: `0.36.0-pluggable-themes-SNAPSHOT`
  - Deployed to Maven Central snapshots

## Test Status

| Test Suite | Tests | Status |
|------------|-------|--------|
| ThemeMuiComponentIT | 27 | PASS |
| ThemeIT | 33 | PASS |
| **Total** | **60** | **PASS** |
