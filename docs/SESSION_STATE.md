# Session State - QQQ Frontend Material Dashboard

**Last Updated:** 2026-01-15
**Branch:** `feature/fix-visual-regressions-128`
**Version:** `0.40.0-SNAPSHOT`

## Current Status

**ROUND 6 FIXES COMPLETE (ALL 5 ISSUES)** - Ready for Darin to test.

## What Was Done This Session

### Issue #128 Visual Regressions - Round 6

Fixed 5 regressions reported by Darin (compared to develop branch):

| Issue | Root Cause | Fix |
|-------|------------|-----|
| Sidenav double-highlight | CSS hover rules added in `064e86d` conflicted with JS hover | Removed CSS rules (lines 949-953) |
| Chip border radius changed | `shape.borderRadius: 8` vs MUI default 4 | Changed default to 4 |
| Menu padding increased | MuiMenuItem override set 8px vs menuItem.ts's ~5px | Removed override |
| View field height reduced | Button typography changed (lineHeight 1.5→1.75, fontWeight 300→500) | Reverted to develop values |
| Button color change | Button CSS scoped to `.qqq-themed` class (develop was unscoped) | Removed `.qqq-themed` scoping from button rules |

### Files Modified

| File | Change |
|------|--------|
| `src/qqq/styles/qqq-override-styles.css` | Removed sidenav hover CSS; removed `.qqq-themed` scoping from button rules |
| `src/qqq/utils/createDynamicTheme.ts` | Fixed borderRadius default (4), removed MuiMenuItem, fixed button typography |
| `src/qqq/utils/themeUtils.ts` | Fixed DEFAULT_THEME borderRadius and button typography |
| `e2e/tests/round6-regressions.spec.ts` | Added 10 tests for Round 6 fixes (including Issue 5) |

## Test Status

| Suite | Tests | Status |
|-------|-------|--------|
| Playwright themed | 26 | PASS |
| Round 6 regression tests | 10 | PASS |

## Next Steps

1. Commit Round 6 fixes
2. Darin to test on branch `feature/fix-visual-regressions-128`
3. If approved, create PR to merge into develop

## GitHub Issue

https://github.com/QRun-IO/qqq-frontend-material-dashboard/issues/128

## QQQ #923 license alignment — 2026-09-30

Owner-approved first-party Apache-2.0 declarations now align across source headers, Maven/npm metadata and current contributor/theme documentation. Attribution, third-party notices, dependency pins and executable source are preserved. The license delta passed independent review. QQQ #937 adds bounded waits before existing saved-view background assertions; production behavior is unchanged. Browser verification requires the HTTPS frontend on port 3001 (proxy 8001), CIRCLECI=true and QQQ_SELENIUM_HEADLESS=true. Publish a new candidate only after validation, review and release gates pass. Earlier work recorded above is unchanged.

## QQQ #939/#940 dependency security — 2026-09-30

Isolated patch from `f80d76bffa1a9ba24a304a056eb5d9df606d4ab7`: Jackson BOM 2.21.7, root Axios <1 override 0.34.0 and webpack-dev-middleware override 7.4.6. The published middleware backport preserves the APIs/options used by CRA 5.0.1 and dev-server 4.15.2; its Node >=18.12/webpack 5 requirements fit this project's Node >=20 and webpack 5.105.4. Local verification passed 22 Maven units, 54 JS tests, security regressions, Material serialization and the production build (source-map warnings retained). Full dev-server tests rejected all 27 traversal probes while preserving assets, proxy/service-worker/history hooks, HMR and rebuilds; actual root/subpath `npm start` checks also passed. Evidence: `qqq-license-923/evidence/alignment/material-security-940/` in the coordinating workspace. No UI source or runtime modernization is included.

Fresh full and production-only npm audits both report 0 High/0 Critical; remaining totals are 15 Moderate/12 Low and 5 Moderate respectively. The old subpath disclosure baseline is retained; the middleware fix rejects traversal even though CRA still strips PUBLIC_URL's slash. The existing CRA source-overlay `_stats` mismatch reproduced identically before/after and is not fixed here. Public frontend-core 0.40.19-SNAPSHOT still pins Axios 0.33.0 outside this root override; #902 is separately coordinated. Independent review, full browser/hosted gates, GitHub alert reconciliation, RC2 integration and publication remain with the coordinator.
