# TODO - QQQ Frontend Material Dashboard

**Last Updated:** 2026-01-16

## Active Tasks

### Final 0.36.0 Release

- [x] Issue #128 - Revert pluggable themes feature
- [x] Visual regression tests added (18 Playwright screenshot tests)
- [x] Docker-based snapshot generation script
- [x] RC.4 published to Maven Central
- [x] Reset develop to RC4 base
- [ ] Integration testing with downstream apps
- [ ] QA validation of reverted appearance
- [ ] Final release

## Completed (This Session)

- [x] **Cherry-pick theming revert to release/0.36.0**
- [x] **Resolve merge conflicts** (stepper, sidenav, MDButton, CSS)
- [x] **Publish RC.4** (pipeline #1392)
- [x] **Reset develop branch** (force push from RC4 base)
- [x] **Bump develop to 0.40.0-SNAPSHOT**

## Test Status

| Suite | Tests | Status |
|-------|-------|--------|
| Playwright visual regression | 18 | PASS |
| Selenium fixture-based | ~100 | PASS |

## Future Work

- Re-implement theming with different approach
- Consider server-side theme compilation vs runtime CSS variables
