# TODO - QQQ Frontend Material Dashboard

**Last Updated:** 2026-01-14

## In Progress

### Issue #128: Visual Regressions - READY FOR REVIEW

**Branch:** `feature/fix-visual-regressions-128`
**Status:** All fixes complete, waiting on Darin to test

- [x] Round 1-3: Add `.qqq-themed` class toggle, scope CSS overrides
- [x] Round 4: Add CSS variable fallbacks to all `var(--qqq-*)` instances
- [x] Round 5: Align ALL typography fallbacks with `typography.ts`
- [x] Verify all 39 e2e tests pass (26 themed + 13 unthemed)
- [x] Triple-check all 32 typography values against source of truth
- [x] Commit typography fixes
- [ ] **WAITING:** Darin to test and approve
- [ ] Create PR to merge into develop
- [ ] Publish snapshot after merge

---

### CI Playwright Timeout (Separate Issue)

**Branch:** `fix/ci-playwright-timeout`
**Status:** Parked - lower priority than visual regressions

- [x] Diagnosed: webserver timeout (120s not enough for webpack)
- [ ] Debug blank page issue in combined fixture server
- [ ] Test locally until passing
- [ ] Merge to develop

## Completed (Recent)

- [x] **Issue #128 Round 5** - Typography fallbacks aligned with typography.ts
- [x] **Issue #128 Round 4** - CSS variable fallbacks added
- [x] **Issue #128 Round 3** - Scoped CSS to `.qqq-themed` class
- [x] **39 Playwright tests passing** (26 themed + 13 unthemed)
- [x] **PR #127 merged** - Playwright e2e test integration
- [x] **PR #125 merged** - Pluggable themes + CSS selectors system

## Test Status

| Suite | Tests | Status |
|-------|-------|--------|
| Playwright themed | 26 | PASS |
| Playwright unthemed | 13 | PASS |

## Known Issues

- CI Playwright tests may timeout (WIP fix on separate branch)
- `seleniumwithqapplication` tests require full QQQ backend (hang locally)

## QQQ #923 license alignment — 2026-09-30

Owner-approved first-party Apache-2.0 declarations now align across source headers, Maven/npm metadata and current contributor/theme documentation. Attribution, third-party notices, dependency pins and executable source are preserved. The license delta passed independent review. QQQ #937 adds bounded waits before existing saved-view background assertions; production behavior is unchanged. Browser verification requires the HTTPS frontend on port 3001 (proxy 8001), CIRCLECI=true and QQQ_SELENIUM_HEADLESS=true. Publish a new candidate only after validation, review and release gates pass. Earlier work recorded above is unchanged.

## QQQ #939/#940 dependency security — 2026-09-30

- [x] Verify public Jackson 2.21.7/Axios 0.34.0 artifacts and middleware 7.4.6 backport; update BOM, overrides and their lock entries/transitive development dependencies.
- [x] Preserve vulnerable Jackson/Axios baselines; pass security regressions, 22 Maven units, 54 JS tests, Material serialization and production build.
- [x] Reproduce subpath disclosure on 5.3.4; verify the 7.4.6 override blocks all 27 full-server probes while preserving assets/hooks/HMR/rebuilds and actual root/subpath npm start. Rerun JS/build/audits: 0 High/0 Critical; preserve existing overlay defect evidence and remaining Moderate/Low tracking.
- [ ] Coordinator: independently review/integrate this patch, reconcile GitHub alerts under #940/#892, coordinate frontend-core's own Axios pin under #902, and rerun RC2 browser/hosted/release gates before publication.


## Public frontend-core integration — 2026-09-30

- [x] Verify public frontend-core 0.40.20-SNAPSHOT, pin its exact registry version/integrity and independently review the dependency delta.
- [x] Pass the integrated 54 JavaScript tests, production build and 121 Maven/Selenium tests without failures, skips or retries; preserve remaining Moderate/Low audit findings.
- [ ] Pass hosted PR checks, reconcile alerts and integrate the accepted changes into the RC2 draft while retaining #892 and the other release gates.
