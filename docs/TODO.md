# TODO - QQQ Frontend Material Dashboard

**Last Updated:** 2026-01-10

## Active Tasks

### Fix CI Playwright Tests (WIP on branch `fix/ci-playwright-timeout`)

- [x] Diagnosed issue: webserver timeout in CI (120s not enough)
- [x] Added `serve` package
- [x] Modified fixture-server.js to serve static files
- [x] Updated playwright.config.ts
- [x] Updated CircleCI config
- [ ] **Debug blank page issue** (React app not rendering)
- [ ] Test locally until Playwright tests pass
- [ ] Merge to develop

## Completed (Recent)

- [x] **PR #127 merged** - Playwright e2e test integration
- [x] **Playwright tests integrated** - 26 tests from v1 branch
- [x] **run-tests.sh improved** - Unified script for Playwright + Selenium
- [x] **CircleCI config updated** - Playwright job added to pipelines

## Test Status

| Suite | Tests | Status |
|-------|-------|--------|
| Playwright e2e | 26 | FAILING (CI timeout) |
| Selenium fixture-based | 115 | PASS |
| Java unit | 3 | PASS |

## Known Issues

- CI Playwright tests fail - webserver timeout (WIP fix on branch)
- `seleniumwithqapplication` tests hang locally (require full QQQ backend)
