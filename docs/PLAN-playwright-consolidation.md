# Plan: Consolidate Test Infrastructure to Playwright

## Goal

Consolidate from dual test frameworks (Playwright + Selenium) to Playwright-only, fixing CI timeout and simplifying the architecture.

## Current State

| Component | Technology | Count |
|-----------|------------|-------|
| Playwright | TypeScript | 46 tests (strict assertions) |
| Selenium | Java/JUnit | ~115 tests (15 IT classes) |
| Node.js fixture server | fixture-server.js | For Playwright |
| Java Javalin mock | QSeleniumJavalin.java | For Selenium |

**CI Issue:** React dev server takes >120s to compile in Docker, exceeding Playwright's webserver timeout.

## Approach

**Phased migration** - Fix CI first, then incrementally port Selenium tests to Playwright.

### Phase 1: Fix CI (IN PROGRESS)

**Strategy:** Enhance fixture-server.js to serve static React build + API fixtures from single server in CI.

**Changes:**

1. **e2e/fixture-server.js** - Add static file serving with SPA fallback when `BUILD_DIR` env var is set
2. **playwright.config.ts** - Conditional config: single server in CI, dual servers locally
3. **.circleci/config.yml** - Add `npm run build` step before Playwright tests

**Status:** WIP - Static file serving implemented but tests timeout in CI mode. Needs debugging.

### Phase 2: Port Critical Selenium Tests (COMPLETE)

Ported tests:
- QueryScreenIT (13 tests) - Query filtering, boolean operators
- BulkEditIT (1 test) - Bulk edit workflow with strict step verification
- App navigation (6 tests) - Sidebar, breadcrumbs, navigation

### Phase 3: Remove Selenium Infrastructure (Future)

- Delete `src/test/java/**/selenium/`
- Remove Selenium dependencies from pom.xml
- Simplify run-tests.sh

## Test Status

| Suite | Passed | Skipped | Notes |
|-------|--------|---------|-------|
| theme.spec.ts | 26 | 0 | Theme CSS variables |
| query-screen.spec.ts | 12 | 1 | OR filter skipped |
| bulk-edit.spec.ts | 1 | 0 | Full workflow |
| app-navigation.spec.ts | 6 | 0 | Navigation tests |
| saved-report.spec.ts | 1 | 0 | Report creation |
| **Total** | **46** | **1** | |

## Files Modified

| File | Purpose |
|------|---------|
| `e2e/lib/query-screen.ts` | QueryScreen helper class |
| `e2e/tests/bulk-edit.spec.ts` | Strict bulk edit test |
| `e2e/tests/app-navigation.spec.ts` | Navigation tests |
| `e2e/tests/query-screen.spec.ts` | Query filter tests |
| `e2e/fixture-server.js` | Process step state tracking |

## Key Technical Discoveries

1. **Process step progression** requires `nextStep` field in fixture responses
2. **MUI Autocomplete inputs** don't have `type="text"` attribute - use `input` selector
3. **Filter popup behavior**: Escape cancels, clicking outside applies
4. **Role-based selectors** preferred over CSS class selectors for stability
5. **Regex patterns** need `\s+` for variable spacing in query strings

## Next Steps

1. Debug CI timeout issue with static file serving
2. Port remaining Selenium tests as time permits
3. Remove Selenium infrastructure once fully migrated
