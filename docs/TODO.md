# TODO - QQQ Frontend Material Dashboard

**Last Updated:** 2026-01-10

## Active Tasks

### Playwright Consolidation (branch: `feature/consolidate-playwright-tests`)

**Phase 1: Fix CI** - IN PROGRESS
- [x] Create feature branch
- [x] Enhance fixture-server.js with static file serving + SPA fallback
- [x] Update playwright.config.ts with CI/local conditional config
- [x] Update CircleCI config with `PUBLIC_URL=/ npm run build`
- [ ] Debug CI timeout issue (static serving works but tests timeout)
- [ ] Test in actual CI environment
- [ ] Merge to develop

**Phase 2: Port Selenium Tests** - MOSTLY COMPLETE
- [x] Port QueryScreenIT (13 tests - 12 active, 1 skipped)
- [x] Port BulkEditIT (1 test - strict workflow)
- [x] Port app navigation tests (6 tests)
- [x] Port SavedReportIT (1 test)
- [ ] Port SavedViewsIT
- [ ] Port remaining Selenium tests

**Phase 3: Remove Selenium** - NOT STARTED
- [ ] Delete `src/test/java/**/selenium/`
- [ ] Remove Selenium dependencies from pom.xml
- [ ] Simplify run-tests.sh

## Completed (Recent)

- [x] **Strict test assertions** - All ported tests use explicit step verification
- [x] **Boolean filter tests** - Fixed and enabled (equals yes/no/is empty)
- [x] **QueryScreen helper class** - Robust filter builder methods
- [x] **Process step state tracking** - fixture-server.js handles multi-POST flows
- [x] **Rebase to 0.40.0-SNAPSHOT** - Branch updated from 0.36.0

## Test Status

| Suite | Tests | Status |
|-------|-------|--------|
| Playwright e2e | 46 | PASS (1 skipped) |
| Selenium fixture-based | 115 | PASS (not ported) |
| Java unit | 3 | PASS |

## Skipped Tests

- `multi-criteria query with OR` - Needs multi-row filter builder support
