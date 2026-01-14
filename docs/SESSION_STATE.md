# Session State - QQQ Frontend Material Dashboard

**Last Updated:** 2026-01-14
**Branch:** `release/0.36.0`
**Version:** `0.36.0-RC.2`

## Current Status

**RC.2 PUBLISHED** - Theme hotfix released to Maven Central.

PR #129 fixed CSS variable fallback regressions from pluggable themes (PR #125). Darin found the issues during downstream integration testing.

## What Was Done This Session

1. Killed hung Claude agent process (PID 78233)
2. Verified RC.2 JAR on Maven Central contains theme fixes
3. Published daily build log entry: https://github.com/orgs/QRun-IO/discussions/366

## Verification Performed

Downloaded `qqq-frontend-material-dashboard-0.36.0-RC.2.jar` from Maven Central and verified:
- Build timestamp: `01-13-2026 22:20` (matches CI pipeline #1373)
- `#9fc9ff` stepper color present (was `rgba(255,255,255,0.5)`)
- `sidebarSelectedBackgroundColor:"rgba(255, 255, 255, 0.2)"` present (was `#0062FF`)

## Next Steps

1. Integration testing of RC.2 with downstream apps
2. QA validation of theme appearance
3. Final 0.36.0 release when ready
4. Address CI Playwright timeout issue (WIP on `fix/ci-playwright-timeout` branch)

## Branches

| Branch | Purpose | Status |
|--------|---------|--------|
| `release/0.36.0` | Current release candidate | RC.2 published |
| `develop` | Main development | At 0.40.0-SNAPSHOT |
| `fix/ci-playwright-timeout` | CI fix WIP | Paused - blank page issue |

## Quick Reference

```bash
# Current branch
git checkout release/0.36.0

# Check published artifact
mvn dependency:get -DgroupId=com.kingsrook.qqq -DartifactId=qqq-frontend-material-dashboard -Dversion=0.36.0-RC.2

# Verify JAR contents
unzip -l ~/.m2/repository/com/kingsrook/qqq/qqq-frontend-material-dashboard/0.36.0-RC.2/*.jar | grep material-dashboard
```

## Test Status

| Suite | Tests | Status |
|-------|-------|--------|
| Playwright e2e | 56 | PASS (26 custom + 30 default theme tests) |
| Selenium fixture-based | 115 | PASS |
| Java unit | 3 | PASS |
