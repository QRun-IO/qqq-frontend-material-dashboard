# TODO - QQQ Frontend Material Dashboard

**Last Updated:** 2026-01-10

## Active Tasks

### Fix CI Playwright Tests (IN PROGRESS)

- [x] Added `serve` package for static file serving
- [x] Updated playwright.config.ts to use combined server approach
- [x] Updated CircleCI to pre-build React app before tests
- [x] Modified fixture-server.js to serve static files
- [ ] **Debug why React app renders blank page**
- [ ] Test locally with `--debug` flag
- [ ] Check browser console for JS errors
- [ ] Verify all required API endpoints are mocked
- [ ] Push fix once tests pass locally

## Completed (Recent)

- [x] **PR #127 merged** - Playwright e2e test integration
- [x] **Playwright tests integrated** - 26 tests from v1 branch
- [x] **run-tests.sh improved** - Unified script for Playwright + Selenium
- [x] **CircleCI config updated** - Playwright job added to pipelines

## Test Status

| Suite | Tests | Status |
|-------|-------|--------|
| Playwright e2e | 26 | FAILING (blank page) |
| Selenium fixture-based | 115 | PASS |
| Java unit | 3 | PASS |
| Selenium full-server | 19 | Blocked (infrastructure) |

## Known Issues

- CI Playwright tests fail - webserver timeout (being fixed)
- React app renders blank in combined fixture server (debugging)
- `seleniumwithqapplication` tests hang locally (require full QQQ backend)
