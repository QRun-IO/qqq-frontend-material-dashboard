# Session State - QQQ Frontend Material Dashboard

**Last Updated:** 2026-01-16
**Branch:** `develop`
**Version:** `0.40.0-SNAPSHOT`

## Current Status

**DEVELOP RESET** - develop branch reset to RC4 base, theme code removed, version bumped to 0.40.0-SNAPSHOT.

Both `release/0.36.0` (RC.4) and `develop` now have the theming revert and visual regression tests. Clean linear history achieved via force push.

## What Was Done This Session

1. Cherry-picked 5 commits from `feature/revert-theming-128` to `release/0.36.0`
2. Resolved merge conflicts (stepper, sidenav, MDButton, CSS files)
3. Published RC.4 via CI (pipeline #1392)
4. Reset `develop` to RC4 base via force push (cleaner than merge)
5. Bumped develop version to `0.40.0-SNAPSHOT`

## Branch State

| Branch | Version | Theme Code | Status |
|--------|---------|------------|--------|
| `release/0.36.0` | `0.36.0-RC.4` | Removed | RC published |
| `develop` | `0.40.0-SNAPSHOT` | Removed | Reset from RC4 |

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

## Test Status

| Suite | Tests | Status |
|-------|-------|--------|
| Playwright visual regression | 18 | PASS |
| Selenium fixture-based | ~100 | PASS |
