# PLAN: Fix Visual Regressions (Issue #128) - COMPLETE

**Status:** COMPLETE - Waiting on Darin to test
**Branch:** `feature/fix-visual-regressions-128`
**Commit:** `3f49959`

## Goal
Fix visual regressions in 0.36.0-RC.1 caused by PR #125 pluggable themes so that unthemed apps look identical to pre-PR-125.

## Root Causes Identified

| Issue | Root Cause | Fix Applied |
|-------|------------|-------------|
| Sidebar losing colors | Early return in `injectIslandVariables.ts` | Removed early return |
| Navbar/breadcrumb white | MuiPaper surfaceColor on all Paper | Added `hasExplicitTheme` flag + CSS `:not(.MuiAppBar-root)` |
| fontSizeBase not applied | Missing from body styles | Added to MuiCssBaseline |
| Sidebar hover too subtle | Default was 0.1 opacity | Changed to 0.2 |

## Files Modified

- `src/qqq/utils/injectIslandVariables.ts` - Removed early return
- `src/qqq/utils/createDynamicTheme.ts` - Added hasExplicitTheme, fontSizeBase
- `src/qqq/styles/qqq-override-styles.css` - CSS selector exclusion
- `src/qqq/utils/themeUtils.ts` - Hover opacity 0.1 -> 0.2
- `e2e/tests/unthemed-regression.spec.ts` - 15 new tests

## Test Results

- 26 themed tests: PASS
- 15 unthemed tests: PASS
- 115 Selenium tests: PASS

## Next Steps

1. Wait for Darin's approval
2. Publish feature build if requested
3. Create PR to merge into develop
