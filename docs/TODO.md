# TODO - QQQ Frontend Material Dashboard

**Last Updated:** 2026-01-24

## In Progress

- [ ] PR #136 - Base path detection fix (awaiting review)
  - Branch: `feature/134-base-path-detection-bug`
  - Closes issue #134

## Open Items

- [ ] Review dependabot PR #135 - lodash bump
- [ ] Address npm audit vulnerabilities (9 total: 2 critical, 1 high, 6 moderate)

## Completed (Recent)

- [x] Issue #134 - Base path detection bug
  - Fixed `detectBasePath()` returning wrong path for root deployments
  - Removed unreliable Strategy 3 (single-segment path detection)
  - Added 25 unit tests for PathUtils
  - PR #136 created and pushed
- [x] PR #131 - Auth module enhancements (merged)
- [x] Feature #364 - Customizable table action menus (merged)
- [x] Feature #365 - Tables belonging to multiple apps (merged)
- [x] Update qqq-frontend-core to 0.40.4-SNAPSHOT
