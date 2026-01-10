# TODO - QQQ Frontend Material Dashboard

**Last Updated:** 2026-01-10

## Active Tasks

None - all tasks complete.

## Completed (Recent)

- [x] **PR #127 merged** - Playwright e2e test integration
- [x] **Playwright tests integrated** - 26 tests from v1 branch
- [x] **run-tests.sh improved** - Unified script for Playwright + Selenium
- [x] **CircleCI config updated** - Playwright job added to pipelines
- [x] **Snapshot published** - publish_snapshot workflow passed
- [x] **Old branches cleaned up** - Deleted v1/v2 theme branches
- [x] **GitHub discussion updated** - Added QFMD changes to #340

## Completed (Prior)

- [x] Pluggable themes system (PR #125)
- [x] CSS selectors system (PR #125)
- [x] Virtual fields support (PR #123)
- [x] Form adjusters (PR #122)
- [x] CookiesProvider fix
- [x] chromedriver fix

## Test Status

| Suite | Tests | Status |
|-------|-------|--------|
| Playwright e2e | 26 | PASS |
| Selenium fixture-based | 115 | PASS |
| Java unit | 3 | PASS |
| Selenium full-server | 19 | Blocked (infrastructure) |

## Known Issues

- `seleniumwithqapplication` tests hang locally (require full QQQ backend)
