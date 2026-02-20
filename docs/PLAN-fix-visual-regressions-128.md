# PLAN: Fix Visual Regressions (Issue #128) - COMPLETE

**Status:** COMPLETE - Waiting on Darin to test
**Branch:** `feature/fix-visual-regressions-128`
**Latest Commit:** `d4251be`

## Goal
Fix visual regressions caused by PR #125 pluggable themes so that unthemed apps look identical to pre-PR-125.

## Solution Summary

The key fix was **scoping CSS override rules to themed apps only**:
1. Added `.qqq-themed` class toggle in `injectIslandVariables.ts`
2. Scoped all CSS rules in `qqq-override-styles.css` to `.qqq-themed`
3. Fixed e2e test infrastructure (`setupProxy.js` missing `/metaData` route)
4. Fixed fixture structure (theme must be under `supplementalInstanceMetaData.theme`)

### Key Insight
`QInstance` class in `@qrunio/qqq-frontend-core` only looks for theme at `object.supplementalInstanceMetaData["theme"]`, NOT at root level.

## Files Modified

| File | Change |
|------|--------|
| `src/qqq/utils/injectIslandVariables.ts` | Added `.qqq-themed` class toggle |
| `src/qqq/styles/qqq-override-styles.css` | Scoped rules to `.qqq-themed` |
| `src/setupProxy.js` | Added `/metaData` route |
| `src/test/resources/fixtures/metaData/withFullCustomTheme.json` | Fixed theme location |

## Test Results

| Suite | Tests | Status |
|-------|-------|--------|
| Playwright themed | 26 | PASS |
| Playwright unthemed | 13 | PASS |
| Selenium fixture-based | 115 | PASS |

## Next Steps

1. Wait for Darin's approval on issue #128
2. Create PR to merge into develop
3. Publish snapshot after merge
