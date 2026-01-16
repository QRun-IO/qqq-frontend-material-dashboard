# TODO - QQQ Frontend Material Dashboard

**Last Updated:** 2026-01-16

## Active Tasks

### Final 0.36.0 Release

- [x] Issue #128 - Revert pluggable themes feature
- [x] Visual regression tests added (18 Playwright screenshot tests)
- [x] Docker-based snapshot generation script
- [x] RC.4 published to Maven Central
- [x] Blog post published
- [ ] Integration testing with downstream apps
- [ ] QA validation of reverted appearance
- [ ] Final release

## Completed (This Session)

- [x] **Cherry-pick theming revert to release/0.36.0**
- [x] **Resolve merge conflicts** (stepper, sidenav, MDButton, CSS)
- [x] **Add visual regression tests** (18 screenshot tests)
- [x] **Create Docker snapshot script** (`scripts/update-snapshots.sh`)
- [x] **Regenerate snapshots via Docker** (Linux font matching)
- [x] **Publish RC.4** (pipeline #1392)
- [x] **Post to daily developers blog** (https://github.com/orgs/QRun-IO/discussions/370)

## Completed (Previous Sessions)

- [x] **0.36.0-RC.3** - Version bump
- [x] **0.36.0-RC.2** - Theme hotfix (CSS variable fallbacks)
- [x] **PR #129 merged** - CSS variable fallback fixes
- [x] **PR #127 merged** - Playwright e2e test integration
- [x] **PR #125 merged** - Pluggable themes (now reverted)

## Test Status

| Suite | Tests | Status |
|-------|-------|--------|
| Playwright visual regression | 18 | PASS |
| Selenium fixture-based | ~100 | PASS |

## Future Work

- Re-implement theming with different approach
- Consider server-side theme compilation vs runtime CSS variables
