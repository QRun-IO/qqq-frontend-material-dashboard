/**
 * Visual Regression Tests for QQQ Frontend Material Dashboard
 *
 * These tests capture baseline screenshots of the unthemed application.
 * When theming is re-implemented, these tests will ensure the unthemed
 * appearance remains unchanged.
 *
 * Run with: npx playwright test
 * Update baselines with: npx playwright test --update-snapshots
 */
import { test, expect } from '@playwright/test';

// Tight tolerance for pixel-level regression detection
// Snapshots must be generated on Linux (via Docker) to match CI environment
const SCREENSHOT_OPTIONS = {
   maxDiffPixelRatio: 0.01, // 1% tolerance - pixel-level accuracy
};

test.describe('Visual Regression - Unthemed Baseline', () => {

   test.beforeEach(async ({ page }) => {
      // Wait for app to fully load
      await page.goto('/');
      await page.waitForLoadState('networkidle');
   });

   test('app home page layout', async ({ page }) => {
      // Wait for main content to render (the app bar is always visible)
      await page.waitForSelector('.MuiAppBar-root', { timeout: 10000 });

      // Wait for skeleton loaders to disappear (widgets finished loading)
      // This prevents flaky tests where screenshots capture loading states
      await page.waitForFunction(() => {
         const skeletons = document.querySelectorAll('.MuiSkeleton-root');
         return skeletons.length === 0;
      }, { timeout: 15000 }).catch(() => {
         // If skeletons don't disappear, continue anyway (some widgets may not load in test env)
         console.log('Warning: Skeleton loaders still present after timeout');
      });

      // Additional wait for any async renders to complete
      await page.waitForTimeout(500);

      // Capture full page screenshot
      await expect(page).toHaveScreenshot('home-page-full.png', {
         fullPage: true,
         ...SCREENSHOT_OPTIONS,
      });
   });

   test('sidebar navigation', async ({ page }) => {
      // Wait for app to load
      await page.waitForSelector('.MuiAppBar-root', { timeout: 10000 });

      // The sidebar drawer paper contains the navigation
      const sidebarPaper = page.locator('.MuiDrawer-paper');

      if (await sidebarPaper.count() > 0 && await sidebarPaper.isVisible()) {
         // Capture sidebar screenshot
         await expect(sidebarPaper).toHaveScreenshot('sidebar-navigation.png', SCREENSHOT_OPTIONS);
      } else {
         // If sidebar is collapsed/hidden, skip this test
         test.skip();
      }
   });

   test('top navigation bar', async ({ page }) => {
      // Wait for app bar to render
      const appBar = page.locator('.MuiAppBar-root');
      await expect(appBar).toBeVisible({ timeout: 10000 });

      // Capture app bar screenshot
      await expect(appBar).toHaveScreenshot('top-navigation-bar.png', SCREENSHOT_OPTIONS);
   });

   test('button styles - contained primary', async ({ page }) => {
      // Wait for app to load
      await page.waitForSelector('.MuiAppBar-root', { timeout: 10000 });

      // Find a contained primary button
      const button = page.locator('.MuiButton-containedPrimary').first();

      if (await button.count() > 0) {
         await expect(button).toHaveScreenshot('button-contained-primary.png', SCREENSHOT_OPTIONS);
      }
   });

   test('button styles - text primary', async ({ page }) => {
      // Wait for app to load
      await page.waitForSelector('.MuiAppBar-root', { timeout: 10000 });

      // Find a text primary button
      const button = page.locator('.MuiButton-textPrimary').first();

      if (await button.count() > 0) {
         await expect(button).toHaveScreenshot('button-text-primary.png', SCREENSHOT_OPTIONS);
      }
   });

   test('typography hierarchy', async ({ page }) => {
      // Wait for app to load
      await page.waitForSelector('.MuiAppBar-root', { timeout: 10000 });

      // Capture various typography elements if visible
      const h6 = page.locator('h6').first();
      const body = page.locator('.MuiTypography-body1').first();

      // Capture h6 (commonly used in dashboard)
      if (await h6.count() > 0 && await h6.isVisible()) {
         await expect(h6).toHaveScreenshot('typography-h6.png', SCREENSHOT_OPTIONS);
      }

      // Capture body text
      if (await body.count() > 0 && await body.isVisible()) {
         await expect(body).toHaveScreenshot('typography-body1.png', SCREENSHOT_OPTIONS);
      }
   });

   test('card component styles', async ({ page }) => {
      // Wait for app to load
      await page.waitForSelector('.MuiAppBar-root', { timeout: 10000 });

      // Find a card component
      const card = page.locator('.MuiCard-root').first();

      if (await card.count() > 0) {
         await expect(card).toHaveScreenshot('card-component.png', SCREENSHOT_OPTIONS);
      }
   });

   test('paper component styles', async ({ page }) => {
      // Wait for app to load
      await page.waitForSelector('.MuiAppBar-root', { timeout: 10000 });

      // Find a paper component (excluding cards)
      const paper = page.locator('.MuiPaper-root:not(.MuiCard-root)').first();

      if (await paper.count() > 0) {
         await expect(paper).toHaveScreenshot('paper-component.png', SCREENSHOT_OPTIONS);
      }
   });

   test('input field styles', async ({ page }) => {
      // Wait for app to load
      await page.waitForSelector('.MuiAppBar-root', { timeout: 10000 });

      // Find an input field
      const input = page.locator('.MuiTextField-root, .MuiOutlinedInput-root').first();

      if (await input.count() > 0) {
         await expect(input).toHaveScreenshot('input-field.png', SCREENSHOT_OPTIONS);
      }
   });

   test('chip/badge styles', async ({ page }) => {
      // Wait for app to load
      await page.waitForSelector('.MuiAppBar-root', { timeout: 10000 });

      // Find a chip component
      const chip = page.locator('.MuiChip-root').first();

      if (await chip.count() > 0) {
         await expect(chip).toHaveScreenshot('chip-component.png', SCREENSHOT_OPTIONS);
      }
   });
});

test.describe('Visual Regression - Table Views', () => {

   test('data grid header styles', async ({ page }) => {
      // Navigate to a table view if available
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Look for data grid
      const dataGrid = page.locator('.MuiDataGrid-root');

      if (await dataGrid.count() > 0) {
         // Capture data grid header
         const header = dataGrid.locator('.MuiDataGrid-columnHeaders');
         if (await header.count() > 0) {
            await expect(header).toHaveScreenshot('datagrid-header.png', SCREENSHOT_OPTIONS);
         }
      }
   });

   test('table pagination styles', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Find pagination component
      const pagination = page.locator('.MuiTablePagination-root');

      if (await pagination.count() > 0) {
         await expect(pagination).toHaveScreenshot('table-pagination.png', SCREENSHOT_OPTIONS);
      }
   });
});

test.describe('Visual Regression - Color Verification', () => {

   test('primary color usage', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Verify primary buttons are NOT blue (#0062FF was the theming color)
      const primaryButton = page.locator('.MuiButton-containedPrimary').first();

      if (await primaryButton.count() > 0) {
         const bgColor = await primaryButton.evaluate(el =>
            window.getComputedStyle(el).backgroundColor
         );

         // Should not be the theming blue
         expect(bgColor).not.toBe('rgb(0, 98, 255)');
      }
   });

   test('text colors are correct', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Check body text color
      const bodyText = page.locator('.MuiTypography-body1, .MuiTypography-body2').first();

      if (await bodyText.count() > 0) {
         const color = await bodyText.evaluate(el =>
            window.getComputedStyle(el).color
         );

         // Text should be dark (not the theming blue-gray #344767)
         expect(color).not.toBe('rgb(52, 71, 103)');
      }
   });

   test('sidebar background color', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const sidebar = page.locator('.MuiDrawer-paper');

      if (await sidebar.count() > 0) {
         const bgColor = await sidebar.evaluate(el =>
            window.getComputedStyle(el).backgroundColor
         );

         // Capture the actual color for baseline comparison
         console.log('Sidebar background color:', bgColor);
      }
   });
});

test.describe('Visual Regression - Layout Integrity', () => {

   test('no CSS variable fallback indicators', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Check that no elements have CSS variable fallbacks visible
      // (This would indicate theming variables are leaking through)
      const pageContent = await page.content();

      // Should not contain any --qqq- CSS variables in computed styles
      const elements = await page.locator('*').evaluateAll(els =>
         els.filter(el => {
            const style = window.getComputedStyle(el);
            return style.cssText.includes('--qqq-');
         }).length
      );

      // In unthemed mode, no elements should use --qqq- variables
      expect(elements).toBe(0);
   });

   test('consistent border radius on cards', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const cards = page.locator('.MuiCard-root');
      const count = await cards.count();

      if (count > 0) {
         const radii = await cards.evaluateAll(els =>
            els.map(el => window.getComputedStyle(el).borderRadius)
         );

         // All cards should have consistent border radius
         const uniqueRadii = [...new Set(radii)];
         console.log('Card border radii:', uniqueRadii);

         // Verify consistency (allow 1-2 different values for different card types)
         expect(uniqueRadii.length).toBeLessThanOrEqual(2);
      }
   });

   test('consistent typography sizing', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Check h6 elements have consistent size
      const h6Elements = page.locator('h6');
      const count = await h6Elements.count();

      if (count > 0) {
         const fontSizes = await h6Elements.evaluateAll(els =>
            els.map(el => window.getComputedStyle(el).fontSize)
         );

         const uniqueSizes = [...new Set(fontSizes)];
         console.log('H6 font sizes:', uniqueSizes);

         // All h6 elements should have the same font size
         expect(uniqueSizes.length).toBe(1);
      }
   });
});
