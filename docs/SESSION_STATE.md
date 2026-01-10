# Session State - QQQ Frontend Material Dashboard

**Last Updated:** 2026-01-10
**Branch:** `develop`
**Version:** `0.36.0-SNAPSHOT`

## Current Status

**CI IS FAILING** - `publish_snapshot` workflow (pipeline #1361) fails due to Playwright webserver timeout.

Work in progress on branch: `fix/ci-playwright-timeout`

## Problem

The React dev server (`npm start`) times out in CI because webpack compilation takes >120s in the Playwright Docker container.

## WIP Branch: fix/ci-playwright-timeout

Contains attempted fix:
1. Combined fixture server to serve both static React build AND API fixtures
2. Added `npm run build` step to CircleCI before Playwright tests
3. Simplified playwright.config.ts to use single server

**Status:** Tests still fail locally - React app renders blank page. Debugging needed.

## Next Steps (Resume Here)

1. Checkout the WIP branch: `git checkout fix/ci-playwright-timeout`
2. Debug why React app renders blank:
   - Run `node e2e/fixture-server.js` manually
   - Open http://localhost:8001 in browser
   - Check browser console for JavaScript errors
3. Compare with working Selenium setup (QSeleniumJavalin.java)
4. Add missing API endpoint stubs to fixture-server.js
5. Once tests pass locally, push and merge to develop

## Quick Reference

```bash
# Switch to WIP branch
git checkout fix/ci-playwright-timeout

# Build React app (required before Playwright tests)
npm run build

# Run fixture server manually for debugging
node e2e/fixture-server.js

# Run Playwright in debug mode
npx playwright test --debug
```

## Test Status (on develop)

| Suite | Tests | Status |
|-------|-------|--------|
| Playwright e2e | 26 | FAILING (CI timeout) |
| Selenium fixture-based | 115 | PASS |
| Java unit | 3 | PASS |
