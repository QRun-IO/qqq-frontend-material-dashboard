# PLAN: Fix CI Playwright Tests

## Goal

Fix Playwright e2e tests failing in CircleCI due to webserver timeout.

## Problem

The React dev server (`npm start`) times out in CI because webpack compilation takes >120s in the Playwright Docker container.

## Approach

Combine the fixture server to serve both:
1. Static React build (from `build/` directory)
2. API fixtures (from `src/test/resources/fixtures/`)

This eliminates the need for a proxy and speeds up startup.

## Changes Made

1. **package.json** - Added `serve` package (may not be needed now)
2. **e2e/fixture-server.js** - Added static file serving for React build
3. **playwright.config.ts** - Simplified to use single server on port 8001
4. **.circleci/config.yml** - Added `npm run build` step before tests

## Current Status: IN PROGRESS

Tests still fail locally - React app renders blank page. Need to debug:
- Check if all required API endpoints are mocked
- Verify static file paths resolve correctly
- Check browser console for JS errors

## Next Steps

1. Run fixture server manually, open browser, check console errors
2. Compare working Selenium setup to see what's different
3. May need to add more API endpoint stubs to fixture-server.js
4. Test with `npx playwright test --debug` for interactive debugging
