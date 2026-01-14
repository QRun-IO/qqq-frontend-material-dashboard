# TODO - QQQ Frontend Material Dashboard

**Last Updated:** 2026-01-14

## Active Tasks

### Issue #128: Visual Regressions - READY FOR REVIEW

**Branch:** `feature/fix-visual-regressions-128`
**Status:** Fixes complete, waiting on Darin to test

- [x] Remove early return in `injectIslandVariables.ts`
- [x] Add `hasExplicitTheme` flag to `createDynamicTheme.ts`
- [x] Add `:not(.MuiAppBar-root)` to CSS surfaceColor rule
- [x] Apply fontSizeBase to body element
- [x] Change sidebar hover opacity 0.1 -> 0.2
- [x] Create 15 unthemed regression tests
- [x] Verify all 26 themed tests pass
- [x] Commit and push to feature branch
- [x] Update issue #128 with testing instructions
- [ ] **WAITING:** Darin to test and approve
- [ ] Publish feature build (if requested)
- [ ] Create PR to merge into develop

---

### CI Playwright Timeout (Separate Issue)

**Branch:** `fix/ci-playwright-timeout`
**Status:** Parked - lower priority than visual regressions

- [x] Diagnosed: webserver timeout (120s not enough for webpack)
- [ ] Debug blank page issue in combined fixture server
- [ ] Test locally until passing
- [ ] Merge to develop

## Completed (Recent)

- [x] **Issue #128 fixes** - All visual regressions resolved
- [x] **41 Playwright tests passing** (26 themed + 15 unthemed)
- [x] **PR #127 merged** - Playwright e2e test integration
- [x] **PR #125 merged** - Pluggable themes + CSS selectors system

## Test Status

| Suite | Tests | Status |
|-------|-------|--------|
| Playwright themed | 26 | PASS |
| Playwright unthemed | 15 | PASS |
| Selenium fixture-based | 115 | PASS |
| Java unit | 3 | PASS |

## Known Issues

- CI Playwright tests may timeout (WIP fix on separate branch)
- `seleniumwithqapplication` tests require full QQQ backend (hang locally)
