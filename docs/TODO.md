# TODO - QQQ Frontend Material Dashboard

**Last Updated:** 2026-01-17

## Active Tasks

### Issue #371 - Anonymous Auth Module
- [x] Add `manageSession` call after anonymous authentication
- [x] Set logged-in user from session values
- [x] Create PR #131
- [ ] **WAITING:** Review approval from @darinkelkhoff
- [ ] Merge to develop

### Dual-Platform Visual Regression
- [x] Update `playwright.config.ts` with `{platform}` in snapshot path
- [x] Rename `update-snapshots.sh` to `update-snapshots-linux.sh`
- [x] Create `update-snapshots-mac.sh` for local macOS snapshots
- [x] Generate Linux snapshots in `e2e/snapshots/.../linux/`
- [x] Generate macOS snapshots in `e2e/snapshots/.../darwin/`
- [x] Remove obsolete `theme-defaults.spec.ts`
- [x] Update CircleCI config
- [x] Verify CI passes (Pipeline #1397)

## Completed (This Session)

- [x] Implemented dual-platform visual regression snapshots
- [x] Added anonymous auth user info fetch
- [x] Fixed CircleCI Playwright test configuration
- [x] Created and pushed PR #131

## Test Status

| Suite | Tests | Status |
|-------|-------|--------|
| Playwright visual regression | 18 | PASS (both platforms) |
| Selenium fixture-based | ~100 | PASS |

## Future Work

- Re-implement theming with different approach
- Consider server-side theme compilation vs runtime CSS variables
