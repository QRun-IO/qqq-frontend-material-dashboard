import { Page, expect } from '@playwright/test';

/**
 * Helper class for interacting with the query screen in Playwright tests.
 * Mirrors the QueryScreenLib.java from Selenium tests.
 */
export class QueryScreen {
   constructor(private page: Page) {}

   /**
    * Wait for the query grid to load (column headers visible).
    */
   async waitForQueryToHaveRan() {
      // Wait for column headers first (always present when grid loads)
      await this.page.waitForSelector('.MuiDataGrid-columnHeader', { timeout: 30000 });
      // Then wait for data cells (indicates query has completed)
      await this.page.waitForSelector('.MuiDataGrid-cell', { timeout: 30000 });
   }

   /**
    * Navigate to a table and wait for breadcrumb.
    */
   async gotoTable(path: string, expectedBreadcrumb: string) {
      await this.page.goto(path);
      await this.page.waitForSelector(`[id="root"]`);
      await this.page.waitForTimeout(1000);
      // Wait for breadcrumb to contain expected text
      await expect(this.page.locator('.MuiBreadcrumbs-root, h1, h2, h3')).toContainText(expectedBreadcrumb, { timeout: 30000 });
   }

   /**
    * Switch to advanced filter mode.
    */
   async gotoAdvancedMode() {
      await this.page.click('button:has-text("ADVANCED")');
      await this.page.waitForSelector('button:has-text("FILTER BUILDER")');
   }

   /**
    * Switch to basic filter mode.
    */
   async gotoBasicMode() {
      await this.page.click('button:has-text("BASIC")');
      await this.page.waitForSelector('button:has-text("ADD FILTER")');
   }

   /**
    * Click the filter builder button.
    */
   async clickFilterBuilderButton() {
      await this.page.click('button:has-text("FILTER BUILDER")');
   }

   /**
    * Add a filter condition in advanced mode.
    * Uses label-based input selection for reliability.
    */
   async addAdvancedQueryFilterInput(
      index: number,
      fieldLabel: string,
      operator: string,
      value: string | null,
      booleanOperator: string | null
   ) {
      // Find the filter popup - contains ADD CONDITION button
      const filterPopup = this.page.locator('.MuiPaper-root').filter({ has: this.page.locator('button:has-text("ADD CONDITION")') });
      await filterPopup.waitFor({ state: 'visible', timeout: 5000 });

      // For additional conditions (index > 0), click Add condition first
      if (index > 0) {
         await filterPopup.getByRole('button', { name: /add condition/i }).click();
         await this.page.waitForTimeout(500);

         // Set the boolean operator (And/Or) if specified
         if (booleanOperator) {
            // The boolean selector is a combobox - find the last one since we just added a row
            const booleanInputs = await filterPopup.locator('input[aria-label]').all();
            // Look for the And/Or dropdown - it's usually the first input of the new row
            for (const input of booleanInputs) {
               const label = await input.getAttribute('aria-label');
               if (label && (label.includes('And') || label.includes('Or'))) {
                  await input.click();
                  await this.page.waitForTimeout(100);
                  await this.page.getByRole('option', { name: booleanOperator, exact: true }).click();
                  await this.page.waitForTimeout(100);
                  break;
               }
            }
         }
      }

      // Click on the Field dropdown (labeled "Field")
      // Use nth() to get the correct row's field input
      const fieldInput = filterPopup.locator('input').nth(index === 0 ? 0 : index > 0 ? index * 3 : 0);

      // Try clicking on the first available text input if labeled approach fails
      const allInputs = await filterPopup.locator('input').all();

      // For single condition (index=0), use first input for Field
      // Get inputs in order: Field, Operator, (optional Value)
      if (allInputs.length > 0) {
         // Click and fill Field
         await allInputs[0].click();
         await this.page.waitForTimeout(200);
         await allInputs[0].fill(fieldLabel);
         await this.page.waitForTimeout(300);
         // Select from dropdown - click the first matching option
         const fieldOptions = await this.page.locator('[role="option"]').all();
         if (fieldOptions.length > 0) {
            await fieldOptions[0].click();
         }
         await this.page.waitForTimeout(300);
      }

      // Re-fetch inputs after field selection (new inputs may appear)
      const updatedInputs = await filterPopup.locator('input').all();

      // Click and fill Operator (second input after field selection)
      if (updatedInputs.length > 1) {
         await updatedInputs[1].click();
         await this.page.waitForTimeout(200);
         await updatedInputs[1].fill(operator);
         await this.page.waitForTimeout(300);
         // Select from dropdown - click the first matching option
         const opOptions = await this.page.locator('[role="option"]').all();
         if (opOptions.length > 0) {
            await opOptions[0].click();
         }
         await this.page.waitForTimeout(300);
      }

      // Fill Value if provided (third input, appears for some operators)
      if (value) {
         const valueInputs = await filterPopup.locator('input').all();
         if (valueInputs.length > 2) {
            await valueInputs[2].click();
            await valueInputs[2].fill(value);
            await this.page.waitForTimeout(200);
         }
      }
   }

   /**
    * Click the clear filter (X) icon in advanced mode.
    */
   async clickAdvancedFilterClearIcon() {
      await this.page.hover('.filterBuilderButton');
      await this.page.click('.filterBuilderXIcon BUTTON');
      await this.page.click('button:has-text("Yes")');
   }

   /**
    * Assert the filter button badge shows a specific count.
    */
   async assertFilterButtonBadge(count: number) {
      await expect(this.page.locator('.filterBuilderCountBadge')).toContainText(String(count));
   }

   /**
    * Add a basic filter by field label.
    */
   async addBasicFilter(fieldLabel: string) {
      await this.page.click('button:has-text("Add Filter")');
      await this.page.click(`.fieldListMenuBody-addQuickFilter li:has-text("${fieldLabel}")`);
      await this.clickBackdrop();
   }

   /**
    * Set a basic filter with field, operator, and value.
    */
   async setBasicFilter(fieldLabel: string, operatorLabel: string, value: string | null) {
      await this.page.click(`button:has-text("${fieldLabel}")`);
      await this.page.waitForTimeout(250);
      await this.page.click('#criteriaOperator');
      await this.page.click(`li:has-text("${operatorLabel}")`);

      if (value) {
         await this.page.click('.filterValuesColumn INPUT');
         await this.page.fill('.filterValuesColumn INPUT', value);
      }

      await this.clickBackdrop();
   }

   /**
    * Set a basic boolean filter (like Is Employed).
    */
   async setBasicBooleanFilter(fieldLabel: string, operatorLabel: string) {
      await this.page.click(`button:has-text("${fieldLabel}")`);
      await this.page.waitForTimeout(250);
      await this.page.click('#criteriaOperator');
      await this.page.click(`li:has-text("${operatorLabel}")`);
      await this.clickBackdrop();
   }

   /**
    * Set a basic filter with possible values (like city dropdown).
    */
   async setBasicFilterPossibleValues(fieldLabel: string, operatorLabel: string, values: string[] | null) {
      await this.page.click(`button:has-text("${fieldLabel}")`);
      await this.page.waitForTimeout(250);
      await this.page.click('#criteriaOperator');
      await this.page.click(`li:has-text("${operatorLabel}")`);

      if (values && values.length > 0) {
         await this.page.click('.filterValuesColumn INPUT');
         for (const value of values) {
            await this.page.click(`.MuiAutocomplete-listbox li:has-text("${value}")`);
         }
      }

      await this.clickBackdrop();
   }

   /**
    * Open criteria paster and paste values.
    */
   async openCriteriaPasterAndPasteValues(fieldName: string, values: string[]) {
      await this.page.click(`button:has-text("${fieldName}")`);
      await this.page.click('#criteriaOperator');
      await this.page.click('li:has-text("is any of")');
      await this.page.waitForTimeout(250);
      await this.page.click('.criteriaPasterButton');
      await this.page.fill('.criteriaPasterTextArea textarea#outlined-multiline-static', values.join('\n'));
   }

   /**
    * Wait for basic filter button to match a regex pattern.
    */
   async waitForBasicFilterButtonMatchingRegex(regex: RegExp) {
      // Look for filter chip buttons in the filter bar area
      await expect(this.page.getByRole('button', { name: regex })).toBeVisible({ timeout: 10000 });
   }

   /**
    * Wait for advanced query string to match a regex pattern.
    */
   async waitForAdvancedQueryStringMatchingRegex(regex: RegExp) {
      await expect(this.page.locator('.advancedQueryString')).toContainText(regex);
   }

   /**
    * Close popups by pressing Escape (cancels filters).
    */
   async clickBackdrop() {
      await this.page.waitForTimeout(200);
      await this.page.keyboard.press('Escape');
      await this.page.waitForTimeout(200);
   }

   /**
    * Close filter popup by clicking outside (applies filters).
    */
   async closeFilterPopup() {
      await this.page.waitForTimeout(200);
      // Click on the sidebar area to close the popup while applying filters
      await this.page.mouse.click(50, 400);
      await this.page.waitForTimeout(300);
   }

   /**
    * Wait for DataGrid cell containing text.
    */
   async waitForDataGridCellContaining(text: string) {
      await expect(this.page.locator('.MuiDataGrid-cell', { hasText: text })).toBeVisible();
   }

   /**
    * Assert saved view name is on screen.
    */
   async assertSavedViewNameOnScreen(savedViewName: string) {
      await expect(this.page.locator('h3', { hasText: savedViewName })).toBeVisible();
   }

   /**
    * Assert chips in the criteria paster.
    */
   async assertFilterPasterChipCounts(expectedValid: number, expectedInvalid: number) {
      const chips = await this.page.locator('.MuiChip-root').all();
      expect(chips.length).toBe(expectedValid + expectedInvalid);

      let validCount = 0;
      let errorCount = 0;
      for (const chip of chips) {
         const classAttr = await chip.getAttribute('class') || '';
         if (classAttr.includes('MuiChip-colorInfo')) {
            validCount++;
         }
         if (classAttr.includes('MuiChip-colorError')) {
            errorCount++;
         }
      }
      expect(validCount).toBe(expectedValid);
      expect(errorCount).toBe(expectedInvalid);
   }
}
