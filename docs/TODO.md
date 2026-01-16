# TODO - QQQ Frontend Material Dashboard

**Last Updated:** 2026-01-18

## Active Tasks

### PR #131 - Auth Module Enhancements
- [x] Issue #371: Add `manageSession` call after anonymous authentication
- [x] Issue #374: Read OAuth2 scopes from backend metadata
- [x] Issue #375: Call backend logout endpoint to invalidate session
- [x] Issue #339: Clear both `sessionUUID` and `sessionId` cookies on logout
- [x] Fix logout URL (`/qqq/v1/logout` not `/api/v1/logout`)
- [x] Add `Secure` flag to cookie clearing (GitHub security scan)
- [x] Update qqq-orb to 0.6.1
- [x] Push all changes
- [ ] **WAITING:** Review approval from @darinkelkhoff
- [ ] Merge to develop

<<<<<<< HEAD
## Completed This Session
=======
- [x] Issue #128 - Revert pluggable themes feature
- [x] Visual regression tests added (18 Playwright screenshot tests)
- [x] Docker-based snapshot generation script
- [x] RC.4 published to Maven Central
- [x] Reset develop to RC4 base
- [ ] Integration testing with downstream apps
- [ ] QA validation of reverted appearance
- [ ] Final release
>>>>>>> b8f8af0 (docs: update session state after develop reset)

- [x] Fixed qqq-orb to skip version commits for feature branches
- [x] Fixed ESLint double-quote violation
- [x] Addressed GitHub Advanced Security cookie recommendations
- [x] Updated PR #131 body to include #339
- [x] Triggered feature builds via gitops-publish.sh

<<<<<<< HEAD
## Completed Previously

- [x] Anonymous auth user info fetch
- [x] OAuth2 configurable scopes
- [x] Backend logout call for session invalidation
- [x] Dual-platform Playwright snapshots
- [x] CircleCI config fixes
=======
- [x] **Cherry-pick theming revert to release/0.36.0**
- [x] **Resolve merge conflicts** (stepper, sidenav, MDButton, CSS)
- [x] **Publish RC.4** (pipeline #1392)
- [x] **Reset develop branch** (force push from RC4 base)
- [x] **Bump develop to 0.40.0-SNAPSHOT**

## Test Status

| Suite | Tests | Status |
|-------|-------|--------|
| Playwright visual regression | 18 | PASS |
| Selenium fixture-based | ~100 | PASS |

## Future Work

- Re-implement theming with different approach
- Consider server-side theme compilation vs runtime CSS variables
>>>>>>> b8f8af0 (docs: update session state after develop reset)
