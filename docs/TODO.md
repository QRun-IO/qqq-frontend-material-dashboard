# TODO - QQQ Frontend Material Dashboard

**Last Updated:** 2026-01-14

## Active Tasks

### Final 0.36.0 Release

- [x] PR #129 merged - theme CSS variable fallback fixes
- [x] RC.2 published to Maven Central
- [x] Verified JAR contains updated JS
- [x] Daily build log published
- [ ] Integration testing with downstream apps
- [ ] QA validation
- [ ] Final release

### CI Playwright Timeout Fix (Paused)

Branch: `fix/ci-playwright-timeout`

- [x] Diagnosed issue: webserver timeout in CI (120s not enough)
- [x] Added `serve` package
- [x] Modified fixture-server.js to serve static files
- [x] Updated playwright.config.ts
- [x] Updated CircleCI config
- [ ] **Debug blank page issue** (React app not rendering)
- [ ] Test locally until Playwright tests pass
- [ ] Merge to develop

## Completed (Recent)

- [x] **0.36.0-RC.2 published** - Theme hotfix
- [x] **PR #129 merged** - CSS variable fallback fixes (10 files)
- [x] **30 default theme tests added** - Prevent future regressions
- [x] **PR #127 merged** - Playwright e2e test integration
- [x] **PR #125 merged** - Pluggable themes + CSS selectors
- [x] **PR #123 merged** - Virtual fields support
- [x] **PR #122 merged** - Form adjusters

## Test Status

| Suite | Tests | Status |
|-------|-------|--------|
| Playwright e2e | 56 | PASS |
| Selenium fixture-based | 115 | PASS |
| Java unit | 3 | PASS |

## Known Issues

- CI Playwright tests on `develop` may timeout (WIP fix on branch)
- `seleniumwithqapplication` tests hang locally (require full QQQ backend)
