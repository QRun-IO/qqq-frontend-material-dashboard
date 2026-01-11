import { test, expect } from '@playwright/test';

/**
 * Bulk Edit Tests - Strict version
 *
 * Tests the bulk edit process workflow with explicit verification of each step:
 * - Edit Values screen must show
 * - Review screen must show
 * - Result screen must show with success message
 */

test.describe('Bulk Edit Process', () => {
   test.beforeEach(async ({ page }) => {
      await page.goto('/testApp/person');
      await page.waitForSelector('[id="root"]');
      // Wait for grid to fully load with data
      await page.waitForSelector('.MuiDataGrid-cell', { timeout: 30000 });
   });

   test('bulk edit workflow - strict step verification', async ({ page }) => {
      // STEP 1: Select records
      // Click selection button
      const selectionButton = page.getByRole('button', { name: /selection/i });
      await expect(selectionButton).toBeVisible({ timeout: 5000 });
      await selectionButton.click();

      // Select "This page"
      const thisPageOption = page.getByRole('menuitem', { name: /this page/i });
      await expect(thisPageOption).toBeVisible({ timeout: 5000 });
      await thisPageOption.click();

      // Verify selection message appears
      await expect(page.getByText(/\d+ records on this page are selected/)).toBeVisible({ timeout: 5000 });

      // STEP 2: Open bulk edit
      const actionsButton = page.getByRole('button', { name: /actions/i });
      await expect(actionsButton).toBeVisible({ timeout: 5000 });
      await actionsButton.click();

      const bulkEditMenuItem = page.getByRole('menuitem', { name: /bulk edit/i });
      await expect(bulkEditMenuItem).toBeVisible({ timeout: 5000 });
      await bulkEditMenuItem.click();

      // STEP 3: EDIT VALUES SCREEN - must be visible
      await expect(page.getByText('Person Bulk Edit: Edit Values')).toBeVisible({ timeout: 10000 });

      // Verify stepper shows EDIT VALUES as active
      const stepper = page.locator('.MuiStepper-root');
      await expect(stepper).toBeVisible();

      // Enable firstName field
      const firstNameSwitch = page.locator('#bulkEditSwitch-firstName');
      await expect(firstNameSwitch).toBeVisible({ timeout: 5000 });
      await firstNameSwitch.click();

      // Fill in first name value
      const firstNameInput = page.locator('input[name="firstName"]');
      await expect(firstNameInput).toBeVisible({ timeout: 5000 });
      await firstNameInput.fill('BulkTestName');

      // Click Next to proceed to Review
      const nextButton = page.getByRole('button', { name: /next/i });
      await expect(nextButton).toBeVisible();
      await nextButton.click();

      // STEP 4: REVIEW SCREEN (Validation Options) - must be visible
      await expect(page.getByText('Person Bulk Edit: Review')).toBeVisible({ timeout: 15000 });

      // Verify validation options are shown
      await expect(page.getByText('How would you like to proceed?')).toBeVisible({ timeout: 5000 });
      await expect(page.getByText('Input: 5 Person records.')).toBeVisible({ timeout: 5000 });

      // "Perform Validation" should be selected by default
      const performValidationRadio = page.getByRole('radio', { name: /perform validation/i });
      await expect(performValidationRadio).toBeVisible();

      // Click Next to proceed to validation summary
      const reviewNextButton = page.getByRole('button', { name: /next/i });
      await expect(reviewNextButton).toBeVisible();
      await reviewNextButton.click();

      // STEP 5: VALIDATION SUMMARY - must be visible
      // After validation runs, we should see the summary
      await expect(page.getByText(/Person records will be edited/)).toBeVisible({ timeout: 15000 });

      // Click Submit
      const submitButton = page.getByRole('button', { name: /submit/i });
      await expect(submitButton).toBeVisible({ timeout: 5000 });
      await submitButton.click();

      // STEP 6: RESULT SCREEN - must be visible
      await expect(page.getByText('Person Bulk Edit: Result')).toBeVisible({ timeout: 15000 });

      // Verify success messages
      await expect(page.getByText(/Person records were processed/)).toBeVisible({ timeout: 5000 });
      await expect(page.getByText(/Person records were edited/)).toBeVisible({ timeout: 5000 });

      // Close the dialog
      const closeButton = page.getByRole('button', { name: /close/i });
      await expect(closeButton).toBeVisible();
      await closeButton.click();

      // Verify we're back on the query screen
      await expect(page.locator('.MuiDataGrid-root')).toBeVisible({ timeout: 5000 });
   });
});
