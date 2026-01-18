# Session State - QQQ Frontend Material Dashboard

**Last Updated:** 2026-01-18
**Branch:** `feature/371-Anonymous-auth-module`
**Version:** `0.40.0-SNAPSHOT`

## Current Status

**PR #131** - Open, includes three auth-related fixes. Awaiting review from @darinkelkhoff.

## Commits on Branch

```
8a312ce fix(oauth2): call backend logout endpoint to invalidate session
035785d feat(oauth2): read scopes from backend metadata
9f77479 docs: update session state after OAuth2 scopes implementation
da11406 docs: update session state and documentation
787b965 fix(ci): update Playwright tests to run visual regression tests
1bc0723 feat(auth): fetch user info after anonymous authentication
76d8d4d feat(e2e): add dual-platform visual regression snapshots
```

## Issues Addressed

| Issue | Title | Status |
|-------|-------|--------|
| #371 | Anonymous auth manageSession | In PR #131 |
| #374 | OAuth2 configurable scopes | In PR #131 |
| #375 | Backend logout call | In PR #131 |

## Next Steps

1. Wait for PR #131 approval from @darinkelkhoff
2. Merge to develop (auto-closes #371, #374, #375)
