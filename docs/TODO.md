# TODO - QQQ Frontend Material Dashboard

**Last Updated:** 2026-01-14

## Active Tasks

### Issue #128: Visual Regressions - READY FOR REVIEW

**Branch:** `feature/fix-visual-regressions-128`
**Status:** Fixes complete, waiting on Darin to test

- [x] Add `.qqq-themed` class toggle in `injectIslandVariables.ts`
- [x] Scope all CSS override rules to `.qqq-themed`
- [x] Add `/metaData` route to `setupProxy.js` for e2e proxy
- [x] Fix fixture structure (theme under `supplementalInstanceMetaData.theme`)
- [x] Verify all 26 themed tests pass
- [x] Verify all 13 unthemed tests pass
- [x] Commit and push to feature branch
- [x] Post comment on issue #128 for Darin
- [ ] **WAITING:** Darin to test and approve
- [ ] Create PR to merge into develop
- [ ] Publish snapshot after merge

---

### CI Playwright Timeout (Separate Issue)

**Branch:** `fix/ci-playwright-timeout`
**Status:** Parked - lower priority than visual regressions

- [x] Diagnosed: webserver timeout (120s not enough for webpack)
- [ ] Debug blank page issue in combined fixture server
- [ ] Test locally until passing
- [ ] Merge to develop

## Completed (Recent)

- [x] **Issue #128 Round 3** - Scoped CSS to `.qqq-themed` class
- [x] **Issue #128 Round 2** - Fixed surfaceColor, fontSizeBase, hover opacity
- [x] **39 Playwright tests passing** (26 themed + 13 unthemed)
- [x] **PR #127 merged** - Playwright e2e test integration
- [x] **PR #125 merged** - Pluggable themes + CSS selectors system

## Test Status

| Suite | Tests | Status |
|-------|-------|--------|
| Playwright themed | 26 | PASS |
| Playwright unthemed | 13 | PASS |
| Selenium fixture-based | 115 | PASS |
| Java unit | 3 | PASS |

## Known Issues

- CI Playwright tests may timeout (WIP fix on separate branch)
- `seleniumwithqapplication` tests require full QQQ backend (hang locally)
