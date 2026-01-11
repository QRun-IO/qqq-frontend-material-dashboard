# Session State - QQQ Frontend Material Dashboard

**Last Updated:** 2026-01-10
**Branch:** `feature/consolidate-playwright-tests`
**Version:** `0.40.0-SNAPSHOT`

## Current Status

**Strict Playwright Tests Complete** - 46 tests passing with explicit assertions. CI fix still WIP.

## Test Results

| Suite | Passed | Skipped | Failed |
|-------|--------|---------|--------|
| Playwright e2e | 46 | 1 | 0 |

### Skipped Tests
- `multi-criteria query with OR` - Needs multi-row filter builder support

## Recent Commits

| Hash | Message |
|------|---------|
| `6fc7ece` | feat(test): add strict Playwright tests for bulk edit, navigation, and query filters |
| `3f7a8ff` | chore: bump to 0.40.0-SNAPSHOT |

## Key Technical Discoveries

1. **Process step `nextStep` field** - Frontend requires this to know which step to render
2. **MUI Autocomplete inputs** - Don't have `type="text"` attribute, use plain `input` selector
3. **Filter popup behavior** - Escape cancels filters, clicking outside applies them
4. **Role-based selectors** - More stable than CSS class selectors
5. **Regex `\s+`** - Needed for variable spacing in query strings

## Files Modified (Uncommitted)

- `.circleci/config.yml` - CI build step (WIP)
- `playwright.config.ts` - CI conditional config (WIP)
- `src/qqq/styles/qqq-override-styles.css` - dividerColor fix
- `src/test/resources/fixtures/metaData/withFullCustomTheme.json` - Test fixture

## Next Steps

1. Debug CI timeout issue with static file serving
2. Port SavedViewsIT and remaining Selenium tests
3. Remove Selenium infrastructure once fully migrated

## Quick Reference

```bash
# Run Playwright tests
npx playwright test

# Run specific test file
npx playwright test e2e/tests/query-screen.spec.ts

# Run with UI debugger
npx playwright test --ui

# Test CI mode locally
npm run build && CI=true npx playwright test
```
