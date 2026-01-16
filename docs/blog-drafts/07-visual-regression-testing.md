# Visual Regression Testing with Playwright and Docker

Added visual regression tests to the material dashboard today. 18 Playwright screenshot tests covering the home page, sidebar, nav bar, buttons, typography, cards—the usual suspects.

Ran into the classic problem: screenshots generated on my Mac don't match CI because fonts render differently on Linux. 1-2px height differences on everything. Tried bumping tolerance but that defeats the purpose.

The fix was running the entire stack inside Docker—not just Playwright, but the fixture server and React dev server too. Wrote a script that spins up the same container CI uses (`mcr.microsoft.com/playwright:v1.57.0-jammy`), starts everything inside, and regenerates the baselines.

```bash
./scripts/update-snapshots.sh
```

Run that after any visual changes, commit the updated snapshots, and CI will pass. All 18 tests run in about 90 seconds with 1% pixel tolerance.

The snapshots live in `e2e/snapshots/`. Tests are in `e2e/tests/visual-regression.spec.ts`.
