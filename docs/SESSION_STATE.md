# Session State - QQQ Frontend Material Dashboard

**Last Updated:** 2026-01-16
**Branch:** `release/0.36.0`
**Version:** `0.36.0-RC.4`

## Current Status

**RC.4 PUBLISHED** - Theming feature reverted, visual regression tests added.

Issue #128 required reverting the pluggable themes feature due to visual regressions that couldn't be fixed incrementally. The revert removes all theming code and restores original MUI styling.

## What Was Done This Session

1. Cherry-picked 5 commits from `feature/revert-theming-128` to `release/0.36.0`
2. Resolved merge conflicts (stepper, sidenav, MDButton, CSS files)
3. Published RC.4 via CI (pipeline #1392)
4. Added visual regression tests (18 Playwright screenshot tests)
5. Created Docker-based snapshot generation script
6. Published blog post to daily developers blog

## Cherry-Picked Commits

| Commit | Description |
|--------|-------------|
| `c65dd77` | revert: remove pluggable themes feature (#128) |
| `668f172` | test: add visual regression tests for unthemed baseline (#128) |
| `5bfd0c6` | test: add Docker-based snapshot generation for CI compatibility (#128) |
| `1ba88ba` | fix: regenerate snapshots with servers running inside Docker (#128) |
| `6e78104` | docs: add visual regression testing blog post |

## Visual Regression Testing

18 Playwright screenshot tests covering home page, sidebar, nav bar, buttons, typography, cards. Snapshots generated via Docker to match CI environment (Linux fonts).

```bash
# Regenerate snapshots after visual changes
./scripts/update-snapshots.sh
```

## Next Steps

1. Integration testing of RC.4 with downstream apps
2. QA validation of reverted appearance
3. Final 0.36.0 release when ready
4. Re-implement theming with different approach (future work)

## Branches

| Branch | Purpose | Status |
|--------|---------|--------|
| `release/0.36.0` | Current release candidate | RC.4 published |
| `develop` | Main development | At 0.40.0-SNAPSHOT |
| `feature/revert-theming-128` | Theming revert work | Complete, cherry-picked |

## Test Status

| Suite | Tests | Status |
|-------|-------|--------|
| Playwright visual regression | 18 | PASS |
| Selenium fixture-based | ~100 | PASS |
