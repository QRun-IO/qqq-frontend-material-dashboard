# Session State - QQQ Frontend Material Dashboard

**Last Updated:** 2026-01-14
**Branch:** `feature/fix-visual-regressions-128`
**Version:** `0.40.0-SNAPSHOT`

## Current Status

**READY FOR REVIEW** - Visual regression fixes complete, waiting on Darin to test.

### Latest Commit
`d4251be` - fix: scope CSS overrides to themed apps only (#128)

### GitHub Issue
Issue #128 - Comment added notifying Darin fixes are ready for testing.
https://github.com/QRun-IO/qqq-frontend-material-dashboard/issues/128

## What Was Fixed (Issue #128 - Round 3)

| Issue | Root Cause | Fix |
|-------|------------|-----|
| Unthemed apps getting CSS overrides | CSS rules applied globally | Scoped all override rules to `.qqq-themed` class |
| e2e tests not receiving theme | `setupProxy.js` missing `/metaData` route | Added `/metaData` route (without wildcard) |
| Theme not parsed by QInstance | Theme at wrong location in fixture JSON | Moved to `supplementalInstanceMetaData.theme` |

### Key Insight
The `QInstance` class in `@qrunio/qqq-frontend-core` only looks for theme at `object.supplementalInstanceMetaData["theme"]`, NOT at root level.

## Files Modified (This Session)

- `src/setupProxy.js` - Added `/metaData` route for e2e test proxy
- `src/test/resources/fixtures/metaData/withFullCustomTheme.json` - Fixed theme location
- `src/qqq/utils/injectIslandVariables.ts` - Added `.qqq-themed` class toggle
- `src/qqq/styles/qqq-override-styles.css` - Scoped rules to `.qqq-themed`

## Test Status

| Suite | Tests | Status |
|-------|-------|--------|
| Playwright themed | 26 | PASS |
| Playwright unthemed | 13 | PASS |
| Selenium fixture-based | 115 | PASS |
| Java unit | 3 | PASS |

## Next Steps (Resume Here)

1. **Wait for Darin's response** on issue #128
2. If approved, create PR to merge into `develop`
3. Publish snapshot after merge
4. Address CI Playwright timeout issues (separate branch `fix/ci-playwright-timeout`)

## Running Locally

```bash
# Unthemed (original MUI styling)
THEME_FIXTURE=index npm run fixture-server &
HTTPS=true PORT=3000 REACT_APP_PROXY_LOCALHOST_PORT=8001 npm start

# Themed (full theme with CSS variables)
THEME_FIXTURE=withFullCustomTheme npm run fixture-server &
HTTPS=true PORT=3000 REACT_APP_PROXY_LOCALHOST_PORT=8001 npm start

# Run all e2e tests
npm run e2e:all
```
