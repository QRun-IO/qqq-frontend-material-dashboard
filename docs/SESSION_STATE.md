# Session State - QQQ Frontend Material Dashboard

**Last Updated:** 2026-01-10
**Branch:** `develop`
**Version:** `0.36.0-SNAPSHOT`

## Current Status

**IN PROGRESS:** Fixing CI Playwright test failures.

The `publish_snapshot` workflow (pipeline #1361) failed because the React dev server times out in CI (120s not enough for webpack compilation).

## What Was Done This Session

1. Diagnosed CI failure - webserver timeout in `playwright_tests` job
2. Added `serve` package for static file serving
3. Modified `e2e/fixture-server.js` to serve both static React build AND API fixtures
4. Updated `playwright.config.ts` to use single combined server
5. Updated `.circleci/config.yml` to run `npm run build` before tests
6. Tests still fail locally - React app renders blank page (debugging needed)

## Files Modified (Uncommitted)

- `package.json` - Added serve dependency
- `package-lock.json` - Updated
- `e2e/fixture-server.js` - Added static file serving
- `playwright.config.ts` - Simplified to single server
- `.circleci/config.yml` - Added build step

## Next Steps (Resume Here)

1. **Debug blank page issue:**
   - Run `node e2e/fixture-server.js` manually
   - Open http://localhost:8001 in browser
   - Check browser console for JavaScript errors
   - May need to add missing API endpoint stubs

2. **Compare with Selenium setup:**
   - Selenium tests work - check what's different
   - Look at `QSeleniumJavalin.java` for endpoint list

3. **Test with Playwright debug mode:**
   - `npx playwright test --debug`
   - Step through to see what requests fail

4. **Once tests pass locally:**
   - Commit and push
   - Monitor CI pipeline

## Test Status

| Suite | Tests | Status |
|-------|-------|--------|
| Playwright e2e | 26 | FAILING (blank page) |
| Selenium fixture-based | 115 | PASS |
| Java unit | 3 | PASS |

## Quick Reference

```bash
# Build React app (required before Playwright tests)
npm run build

# Run fixture server manually for debugging
node e2e/fixture-server.js

# Run Playwright in debug mode
npx playwright test --debug

# Run single test
npx playwright test --grep "primaryColor"
```

## Plan Document

See `docs/PLAN-ci-playwright-fix.md` for detailed approach.
