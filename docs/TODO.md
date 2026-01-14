# TODO - QQQ Frontend Material Dashboard

**Last Updated:** 2026-01-14

## Active Tasks

### Issue #128: Visual Regressions - READY FOR REVIEW

**Branch:** `feature/fix-visual-regressions-128`
**Status:** All fixes complete, waiting on Darin to test

- [x] Round 1-3: Add `.qqq-themed` class toggle, scope CSS overrides
- [x] Round 4: Add CSS variable fallbacks to all `var(--qqq-*)` instances
- [x] Round 5: Align ALL typography fallbacks with `typography.ts`
- [x] Verify all 39 e2e tests pass (26 themed + 13 unthemed)
- [x] Triple-check all 32 typography values against source of truth
- [x] Commit typography fixes
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

- [x] **Issue #128 Round 5** - Typography fallbacks aligned with typography.ts
- [x] **Issue #128 Round 4** - CSS variable fallbacks added
- [x] **Issue #128 Round 3** - Scoped CSS to `.qqq-themed` class
- [x] **39 Playwright tests passing** (26 themed + 13 unthemed)
- [x] **PR #127 merged** - Playwright e2e test integration
- [x] **PR #125 merged** - Pluggable themes + CSS selectors system

## Test Status

| Suite | Tests | Status |
|-------|-------|--------|
| Playwright themed | 26 | PASS |
| Playwright unthemed | 13 | PASS |

## Known Issues

- CI Playwright tests may timeout (WIP fix on separate branch)
- `seleniumwithqapplication` tests require full QQQ backend (hang locally)
