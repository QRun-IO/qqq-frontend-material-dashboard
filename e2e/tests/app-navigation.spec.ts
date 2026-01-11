import { test, expect } from '@playwright/test';

/**
 * App Navigation Tests - Strict version
 *
 * Tests for app pages and high-level navigation with explicit verification
 * of each element and step. Uses role-based and structure-based selectors.
 */

test.describe('App Navigation', () => {
   test.beforeEach(async ({ page }) => {
      await page.goto('/testApp');
      await page.waitForSelector('[id="root"]');
   });

   test('app home page displays correctly', async ({ page }) => {
      // STRICT: Verify sidebar drawer is visible
      const sidebar = page.locator('.MuiDrawer-paper');
      await expect(sidebar).toBeVisible({ timeout: 10000 });

      // STRICT: Verify app name link in sidebar
      const sidebarAppLink = sidebar.getByRole('link', { name: 'Full Theme Test App' });
      await expect(sidebarAppLink).toBeVisible({ timeout: 5000 });

      // STRICT: Verify main content heading shows app name
      const mainHeading = page.locator('h3').filter({ hasText: 'Full Theme Test App' });
      await expect(mainHeading).toBeVisible({ timeout: 5000 });

      // STRICT: Verify "Data" section is visible
      await expect(page.locator('h6').filter({ hasText: 'Data' })).toBeVisible();

      // STRICT: Verify Person table card is visible in main content
      const personCard = page.getByRole('link', { name: /Person.*total records/ });
      await expect(personCard).toBeVisible({ timeout: 5000 });
   });

   test('navigate from app page to table page', async ({ page }) => {
      // Wait for sidebar to be visible
      const sidebar = page.locator('.MuiDrawer-paper');
      await expect(sidebar).toBeVisible({ timeout: 10000 });

      // STRICT: Click on Person table card in main content
      const personCard = page.getByRole('link', { name: /Person.*total records/ });
      await expect(personCard).toBeVisible({ timeout: 5000 });
      await personCard.click();

      // STRICT: Verify we navigated to person table - wait for data grid
      const dataGrid = page.locator('.MuiDataGrid-root');
      await expect(dataGrid).toBeVisible({ timeout: 15000 });

      // STRICT: Verify URL changed to person table
      await expect(page).toHaveURL(/.*\/person/);

      // STRICT: Verify breadcrumb shows Full Theme Test App
      const breadcrumbs = page.locator('.MuiBreadcrumbs-root');
      await expect(breadcrumbs).toContainText('Full Theme Test App');

      // STRICT: Verify page heading shows Person
      const heading = page.locator('h3').filter({ hasText: 'Person' });
      await expect(heading).toBeVisible({ timeout: 5000 });
   });

   test('breadcrumb navigation works', async ({ page }) => {
      // Navigate directly to person table
      await page.goto('/testApp/person');
      await page.waitForSelector('[id="root"]');

      // STRICT: Wait for data grid to confirm we're on table page
      const dataGrid = page.locator('.MuiDataGrid-root');
      await expect(dataGrid).toBeVisible({ timeout: 15000 });

      // STRICT: Verify breadcrumbs are visible
      const breadcrumbs = page.locator('.MuiBreadcrumbs-root');
      await expect(breadcrumbs).toBeVisible();

      // STRICT: Click home icon in breadcrumbs
      const homeLink = breadcrumbs.getByRole('link').first();
      await expect(homeLink).toBeVisible();
      await homeLink.click();

      // STRICT: Verify we navigated - should see app home content
      await expect(page.locator('h3').filter({ hasText: 'Full Theme Test App' })).toBeVisible({ timeout: 10000 });
   });
});

test.describe('Sidebar Navigation', () => {
   test('sidebar shows correct app structure', async ({ page }) => {
      await page.goto('/testApp/person');
      await page.waitForSelector('[id="root"]');

      // STRICT: Wait for data grid to confirm page loaded
      const dataGrid = page.locator('.MuiDataGrid-root');
      await expect(dataGrid).toBeVisible({ timeout: 15000 });

      // STRICT: Verify sidebar drawer is visible
      const sidebar = page.locator('.MuiDrawer-paper');
      await expect(sidebar).toBeVisible();

      // STRICT: Verify app name in sidebar as a link
      const appLink = sidebar.getByRole('link', { name: 'Full Theme Test App' });
      await expect(appLink).toBeVisible();

      // STRICT: Verify user section exists
      await expect(sidebar).toContainText('Anonymous');
   });

   test('logout button is visible and correct', async ({ page }) => {
      await page.goto('/testApp/person');
      await page.waitForSelector('[id="root"]');

      // Wait for sidebar to load
      const sidebar = page.locator('.MuiDrawer-paper');
      await expect(sidebar).toBeVisible({ timeout: 10000 });

      // STRICT: Verify logout button exists with exact role and name
      const logoutButton = sidebar.getByRole('button', { name: /log out/i });
      await expect(logoutButton).toBeVisible({ timeout: 5000 });
   });

   test('sidebar app link navigates correctly', async ({ page }) => {
      // Start at person table
      await page.goto('/testApp/person');
      await page.waitForSelector('[id="root"]');

      // STRICT: Wait for data grid
      const dataGrid = page.locator('.MuiDataGrid-root');
      await expect(dataGrid).toBeVisible({ timeout: 15000 });

      // STRICT: Find and click app link in sidebar
      const sidebar = page.locator('.MuiDrawer-paper');
      const appLink = sidebar.getByRole('link', { name: 'Full Theme Test App' });
      await expect(appLink).toBeVisible({ timeout: 5000 });
      await appLink.click();

      // STRICT: Verify navigation occurred - should see app home page
      await expect(page.locator('h3').filter({ hasText: 'Full Theme Test App' })).toBeVisible({ timeout: 10000 });

      // STRICT: Verify Person card is visible (app home shows table cards)
      const personCard = page.getByRole('link', { name: /Person.*total records/ });
      await expect(personCard).toBeVisible({ timeout: 5000 });
   });
});
