# TODO - QQQ Frontend Material Dashboard

**Last Updated:** 2026-01-09

## Active Tasks

- [ ] Commit and push Playwright integration changes
- [ ] Verify CI passes on feature branch
- [ ] Merge to develop
- [ ] Clean up old feature branches (`feature/pluggable-themes-v1-css-vars`, `feature/pluggable-themes-v2-mui`, `feature/pluggable-themes-v2-mui-css-selectors`)

## Completed

- [x] **Playwright tests integrated** - 26 tests from v1 branch now in develop
- [x] **run-tests.sh improved** - Unified script for Playwright + Selenium
- [x] **CircleCI config updated** - Playwright job added to pipelines
- [x] **Pushed previous fixes to origin** - CookiesProvider and chromedriver fixes
- [x] **115 selenium tests passing** - All fixture-based tests work

## Test Status

| Suite | Tests | Status |
|-------|-------|--------|
| Playwright e2e | 26 | PASS |
| Selenium fixture-based | 115 | PASS |
| Selenium full-server | 19 | Blocked (infrastructure) |
