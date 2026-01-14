# Session State - QQQ Frontend Material Dashboard

**Last Updated:** 2026-01-14
**Branch:** `feature/fix-visual-regressions-128`
**Version:** `0.40.0-SNAPSHOT`

## Current Status

**READY FOR REVIEW** - Visual regression fixes complete, waiting on Darin to test.

### Latest Commit
`3f49959` - fix: restore unthemed app styling to match pre-PR-125 behavior (#128)

### GitHub Issue
Issue #128 - Comment added notifying Darin fixes are ready for testing.
https://github.com/QRun-IO/qqq-frontend-material-dashboard/issues/128#issuecomment-3750384565

## What Was Fixed (Issue #128)

| Issue | Root Cause | Fix |
|-------|------------|-----|
| Sidebar lost colors | Early return in `injectIslandVariables.ts` | Removed early return - CSS vars always injected |
| Navbar/breadcrumb white | MuiPaper surfaceColor applied to all Paper | Added `hasExplicitTheme` flag + CSS `:not(.MuiAppBar-root)` |
| fontSizeBase not applied | Missing from MuiCssBaseline body styles | Added `fontSize: theme.fontSizeBase` to body |
| Sidebar hover opacity | Default was 0.1 | Changed to 0.2 in `themeUtils.ts` |

## Files Modified

- `src/qqq/utils/injectIslandVariables.ts` - Removed early return
- `src/qqq/utils/createDynamicTheme.ts` - Added hasExplicitTheme, fontSizeBase to body
- `src/qqq/styles/qqq-override-styles.css` - Added `:not(.MuiAppBar-root)` selector
- `src/qqq/utils/themeUtils.ts` - Changed hover opacity 0.1 -> 0.2
- `e2e/tests/unthemed-regression.spec.ts` - NEW: 15 unthemed tests
- `package.json` - Added e2e:themed, e2e:unthemed, e2e:all scripts
- `playwright.config.ts` - THEME_FIXTURE env var support

## Test Status

| Suite | Tests | Status |
|-------|-------|--------|
| Playwright themed | 26 | PASS |
| Playwright unthemed | 15 | PASS |
| Selenium fixture-based | 115 | PASS |
| Java unit | 3 | PASS |

## Next Steps (Resume Here)

1. **Wait for Darin's response** on issue #128
2. If requested, publish feature build for testing
3. After approval, create PR to merge into `develop`
4. Address any CI Playwright timeout issues (separate branch `fix/ci-playwright-timeout`)

## Quick Commands

```bash
# Switch to this branch
git checkout feature/fix-visual-regressions-128

# Run themed tests
npm run e2e:themed

# Run unthemed tests
npm run e2e:unthemed

# Run all Playwright tests
npm run e2e:all
```
