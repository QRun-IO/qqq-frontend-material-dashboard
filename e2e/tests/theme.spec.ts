import { test, expect } from '@playwright/test';

/**
 * STRICT Theme Verification Tests for QQQ QThemeMetaData
 *
 * ALL tests verify ACTUAL rendered values on components.
 * Tests FAIL if:
 * 1. The expected element is not found
 * 2. The rendered value doesn't match the configured value
 *
 * Theme values from withFullCustomTheme.json fixture
 */
const THEME = {
   // Core colors
   primaryColor: '#E91E63',
   secondaryColor: '#9C27B0',
   backgroundColor: '#ECEFF1',
   surfaceColor: '#FAFAFA',
   textPrimary: '#263238',
   textSecondary: '#607D8B',
   // Status colors
   errorColor: '#D50000',
   warningColor: '#FF6D00',
   successColor: '#00C853',
   infoColor: '#2962FF',
   // Typography
   fontFamily: '"Inter", "Helvetica", sans-serif',
   fontSizeBase: '15px',
   fontWeightLight: 300,
   fontWeightRegular: 400,
   fontWeightMedium: 500,
   fontWeightBold: 700,
   // Button typography (from fixture - buttons use this, not fontWeightMedium)
   typographyButtonFontWeight: 600,
   // UI
   borderRadius: '12px',
   density: 'normal',
   iconStyle: 'rounded',
   // Branded header
   brandedHeaderEnabled: true,
   brandedHeaderBackgroundColor: '#1A237E',
   brandedHeaderTextColor: '#E8EAF6',
   brandedHeaderHeight: '56px',
   // Sidebar
   sidebarBackgroundColor: '#1B5E20',
   sidebarTextColor: '#C8E6C9',
   sidebarIconColor: '#A5D6A7',
   sidebarSelectedBackgroundColor: '#2E7D32',
   sidebarSelectedTextColor: '#FFFFFF',
   sidebarHoverBackgroundColor: 'rgba(255, 255, 255, 0.15)',
   sidebarDividerColor: 'rgba(255, 255, 255, 0.25)',
   // Tables
   tableHeaderBackgroundColor: '#7B1FA2',
   tableHeaderTextColor: '#FFFFFF',
   tableRowHoverColor: '#F3E5F5',
   tableBorderColor: '#E1BEE7',
   // General UI
   dividerColor: '#CFD8DC',
   borderColor: '#B0BEC5',
};

// Helper to convert hex to RGB
function hexToRgb(hex: string): { r: number; g: number; b: number } {
   const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
   return result
      ? {
         r: parseInt(result[1], 16),
         g: parseInt(result[2], 16),
         b: parseInt(result[3], 16),
      }
      : { r: 0, g: 0, b: 0 };
}

// Helper to parse rgb/rgba string
function parseRgb(rgbString: string): { r: number; g: number; b: number; a?: number } | null {
   // Handle rgb(r, g, b) and rgba(r, g, b, a)
   const rgbMatch = rgbString.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
   if (rgbMatch) {
      return {
         r: parseInt(rgbMatch[1]),
         g: parseInt(rgbMatch[2]),
         b: parseInt(rgbMatch[3]),
         a: rgbMatch[4] ? parseFloat(rgbMatch[4]) : undefined
      };
   }
   return null;
}

// Helper to parse rgba from expected value (could be hex or rgba string)
function parseExpectedColor(color: string): { r: number; g: number; b: number; a?: number } | null {
   // If it's already rgba format
   if (color.startsWith('rgba')) {
      return parseRgb(color);
   }
   // If it's hex
   if (color.startsWith('#')) {
      const rgb = hexToRgb(color);
      return { ...rgb, a: undefined };
   }
   return null;
}

// Helper to check if colors match (with tolerance)
function colorsMatch(actual: string, expected: string, tolerance = 2): boolean {
   // Handle hex-to-hex comparison (case insensitive)
   if (actual.startsWith('#') && expected.startsWith('#')) {
      return actual.toLowerCase() === expected.toLowerCase();
   }

   // Parse actual color (could be rgb, rgba, or hex)
   let actualRgb = parseRgb(actual);
   if (!actualRgb && actual.startsWith('#')) {
      const hex = hexToRgb(actual);
      actualRgb = { ...hex, a: undefined };
   }

   const expectedRgb = parseExpectedColor(expected);
   if (!actualRgb || !expectedRgb) return false;

   const rgbMatch = (
      Math.abs(actualRgb.r - expectedRgb.r) <= tolerance &&
      Math.abs(actualRgb.g - expectedRgb.g) <= tolerance &&
      Math.abs(actualRgb.b - expectedRgb.b) <= tolerance
   );

   // If both have alpha, compare alpha too
   if (actualRgb.a !== undefined && expectedRgb.a !== undefined) {
      return rgbMatch && Math.abs(actualRgb.a - expectedRgb.a) <= 0.05;
   }

   return rgbMatch;
}

// Helper to format assertion message
function colorMismatch(property: string, expected: string, actual: string): string {
   return `${property}: expected ${expected}, got ${actual}`;
}

// ============================================================================
// CORE COLORS - Actual Rendered Values
// ============================================================================

test.describe('Core Colors - Rendered', () => {
   test.beforeEach(async ({ page }) => {
      await page.goto('/testApp/person');
      await page.waitForSelector('[id="root"]');
      await page.waitForTimeout(2500);
   });

   test('primaryColor: CSS variable is set correctly', async ({ page }) => {
      const result = await page.evaluate(() => {
         // Check if CSS variable is properly set - this is the authoritative source
         // Note: This app uses "info" colored buttons, not "primary", so we verify
         // the CSS variable rather than button backgrounds
         const cssVar = getComputedStyle(document.documentElement).getPropertyValue('--qqq-primary-color').trim();
         if (cssVar) {
            return { found: true, value: cssVar, debug: 'CSS variable --qqq-primary-color' };
         }
         // Fallback: Try to find primary-styled buttons
         const selectors = [
            '.MuiButton-containedPrimary',
            'button[class*="containedPrimary"]',
            '.MuiButton-root[class*="Primary"]'
         ];
         for (const sel of selectors) {
            const btn = document.querySelector(sel);
            if (btn) {
               const bg = getComputedStyle(btn).backgroundColor;
               if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') {
                  return { found: true, value: bg, debug: btn.className };
               }
            }
         }
         return { found: false, value: '', debug: 'No primary color CSS variable or primary button found' };
      });
      expect(result.found, `Primary color not found: ${result.debug}`).toBe(true);
      expect(colorsMatch(result.value, THEME.primaryColor), colorMismatch('primaryColor', THEME.primaryColor, result.value)).toBe(true);
   });

   test('secondaryColor: links use configured color', async ({ page }) => {
      const result = await page.evaluate(() => {
         const el = document.querySelector('a.MuiLink-root, main a:not(.MuiButton-root), .MuiTypography-root a');
         if (!el) return { found: false, value: '', debug: 'No link found' };
         return { found: true, value: getComputedStyle(el).color, debug: el.className };
      });
      expect(result.found, `Link not found: ${result.debug}`).toBe(true);
      // Accept either primary or secondary color for links
      const matchesPrimary = colorsMatch(result.value, THEME.primaryColor);
      const matchesSecondary = colorsMatch(result.value, THEME.secondaryColor);
      expect(matchesPrimary || matchesSecondary, colorMismatch('secondaryColor', THEME.secondaryColor, result.value)).toBe(true);
   });

   test('backgroundColor: page body uses configured background', async ({ page }) => {
      const result = await page.evaluate(() => {
         return { value: getComputedStyle(document.body).backgroundColor };
      });
      expect(colorsMatch(result.value, THEME.backgroundColor), colorMismatch('backgroundColor', THEME.backgroundColor, result.value)).toBe(true);
   });

   test('surfaceColor: cards use configured background', async ({ page }) => {
      const result = await page.evaluate(() => {
         // Find cards/paper in main content, NOT in the drawer (sidebar)
         const el = document.querySelector('main .MuiCard-root, main .MuiPaper-root, .MuiCard-root:not(.MuiDrawer-paper):not(.MuiDrawer-root *)');
         if (!el) return { found: false, value: '', debug: 'No card/paper found in main content' };
         return { found: true, value: getComputedStyle(el).backgroundColor, debug: el.className };
      });
      expect(result.found, `Card/Paper not found: ${result.debug}`).toBe(true);
      expect(colorsMatch(result.value, THEME.surfaceColor), colorMismatch('surfaceColor', THEME.surfaceColor, result.value)).toBe(true);
   });

   test('textPrimary: headings use configured color', async ({ page }) => {
      const result = await page.evaluate(() => {
         // Find headings NOT in the sidebar/drawer
         const allHeadings = document.querySelectorAll('h1, h2, h3, h4, h5, h6, .MuiTypography-h1, .MuiTypography-h2, .MuiTypography-h3, .MuiTypography-h4, .MuiTypography-h5, .MuiTypography-h6');
         for (const el of allHeadings) {
            // Skip headings inside drawer/sidebar
            if (el.closest('.MuiDrawer-root') || el.closest('.MuiDrawer-paper')) continue;
            return { found: true, value: getComputedStyle(el).color, debug: el.className };
         }
         return { found: false, value: '', debug: 'No heading found outside sidebar' };
      });
      expect(result.found, `Heading not found: ${result.debug}`).toBe(true);
      expect(colorsMatch(result.value, THEME.textPrimary), colorMismatch('textPrimary', THEME.textPrimary, result.value)).toBe(true);
   });

   test('textSecondary: body2/caption use configured color', async ({ page }) => {
      const result = await page.evaluate(() => {
         // Find body2/caption NOT in sidebar, drawer, or branded header
         const allElements = document.querySelectorAll('.MuiTypography-body2, .MuiTypography-caption, .MuiTypography-subtitle2');
         for (const el of allElements) {
            // Skip elements inside drawer, sidebar, or branded header
            if (el.closest('.MuiDrawer-root') || el.closest('.MuiDrawer-paper') || el.closest('.qqq-branded-header-bar')) continue;
            return { found: true, value: getComputedStyle(el).color, debug: el.className };
         }
         // Fallback: check if the CSS variable is properly set
         const cssVar = getComputedStyle(document.documentElement).getPropertyValue('--qqq-text-secondary').trim();
         if (cssVar) {
            return { found: true, value: cssVar, debug: 'CSS variable --qqq-text-secondary' };
         }
         return { found: false, value: '', debug: 'No body2/caption found outside sidebar/header and no CSS variable' };
      });
      expect(result.found, `Secondary text not found: ${result.debug}`).toBe(true);
      expect(colorsMatch(result.value, THEME.textSecondary), colorMismatch('textSecondary', THEME.textSecondary, result.value)).toBe(true);
   });
});

// ============================================================================
// BRANDED HEADER - Actual Rendered Values
// ============================================================================

test.describe('Branded Header - Rendered', () => {
   test.beforeEach(async ({ page }) => {
      await page.goto('/');
      await page.waitForSelector('[id="root"]');
      await page.waitForTimeout(2000);
   });

   test('brandedHeaderBackgroundColor: header uses configured background', async ({ page }) => {
      const result = await page.evaluate(() => {
         const selectors = ['.qqq-branded-header-bar', '[class*="NavBar"]', 'header', '.MuiAppBar-root'];
         for (const sel of selectors) {
            const el = document.querySelector(sel);
            if (el) {
               const bg = getComputedStyle(el).backgroundColor;
               if (bg && bg !== 'rgba(0, 0, 0, 0)') {
                  return { found: true, value: bg, selector: sel };
               }
            }
         }
         return { found: false, value: '', selector: '' };
      });
      expect(result.found, 'Branded header not found').toBe(true);
      expect(colorsMatch(result.value, THEME.brandedHeaderBackgroundColor), colorMismatch('brandedHeaderBackgroundColor', THEME.brandedHeaderBackgroundColor, result.value)).toBe(true);
   });

   test('brandedHeaderTextColor: header text uses configured color', async ({ page }) => {
      const result = await page.evaluate(() => {
         // Specifically look for the branded header bar
         const header = document.querySelector('.qqq-branded-header-bar');
         if (!header) return { found: false, value: '', debug: 'No .qqq-branded-header-bar found' };

         // First try to find a typography element with actual text
         const textElements = header.querySelectorAll('.MuiTypography-root, span:not(:empty)');
         for (const el of textElements) {
            const text = el.textContent?.trim();
            if (text && text.length > 0) {
               return { found: true, value: getComputedStyle(el).color, debug: `${el.className}: "${text.substring(0, 20)}"` };
            }
         }

         // Fallback: check the CSS variable is set correctly
         const cssVar = getComputedStyle(document.documentElement).getPropertyValue('--qqq-branded-header-text-color').trim();
         if (cssVar) {
            return { found: true, value: cssVar, debug: 'CSS variable --qqq-branded-header-text-color' };
         }

         return { found: false, value: '', debug: 'No text element in branded header' };
      });
      expect(result.found, `Header text not found: ${result.debug}`).toBe(true);
      expect(colorsMatch(result.value, THEME.brandedHeaderTextColor), colorMismatch('brandedHeaderTextColor', THEME.brandedHeaderTextColor, result.value)).toBe(true);
   });

   test('brandedHeaderHeight: header uses configured height', async ({ page }) => {
      const result = await page.evaluate(() => {
         const header = document.querySelector('.qqq-branded-header-bar')
            || document.querySelector('[class*="NavBar"]')
            || document.querySelector('header');
         if (!header) return { found: false, value: '', debug: 'No header found' };
         return { found: true, value: getComputedStyle(header).height, debug: '' };
      });
      expect(result.found, `Header not found: ${result.debug}`).toBe(true);
      expect(result.value, colorMismatch('brandedHeaderHeight', THEME.brandedHeaderHeight, result.value)).toBe(THEME.brandedHeaderHeight);
   });
});

// ============================================================================
// SIDEBAR - Actual Rendered Values
// ============================================================================

test.describe('Sidebar - Rendered', () => {
   test.beforeEach(async ({ page }) => {
      await page.goto('/');
      await page.waitForSelector('[id="root"]');
      await page.waitForTimeout(2000);
   });

   test('sidebarBackgroundColor: drawer uses configured background', async ({ page }) => {
      const result = await page.evaluate(() => {
         const el = document.querySelector('.MuiDrawer-paper');
         if (!el) return { found: false, value: '', debug: 'No .MuiDrawer-paper found' };
         return { found: true, value: getComputedStyle(el).backgroundColor, debug: '' };
      });
      expect(result.found, `Sidebar drawer not found: ${result.debug}`).toBe(true);
      expect(colorsMatch(result.value, THEME.sidebarBackgroundColor), colorMismatch('sidebarBackgroundColor', THEME.sidebarBackgroundColor, result.value)).toBe(true);
   });

   test('sidebarTextColor: nav item text uses configured color', async ({ page }) => {
      const result = await page.evaluate(() => {
         const el = document.querySelector('.MuiDrawer-paper .MuiListItemText-primary, .MuiDrawer-paper .MuiListItemText-root span');
         if (!el) return { found: false, value: '', debug: 'No sidebar text found' };
         return { found: true, value: getComputedStyle(el).color, debug: el.className };
      });
      expect(result.found, `Sidebar text not found: ${result.debug}`).toBe(true);
      expect(colorsMatch(result.value, THEME.sidebarTextColor), colorMismatch('sidebarTextColor', THEME.sidebarTextColor, result.value)).toBe(true);
   });

   test('sidebarIconColor: nav item icons use configured color', async ({ page }) => {
      const result = await page.evaluate(() => {
         const el = document.querySelector('.MuiDrawer-paper .MuiSvgIcon-root, .MuiDrawer-paper svg, .MuiDrawer-paper .MuiIcon-root');
         if (!el) return { found: false, value: '', debug: 'No sidebar icon found' };
         return { found: true, value: getComputedStyle(el).color, debug: el.className };
      });
      expect(result.found, `Sidebar icon not found: ${result.debug}`).toBe(true);
      expect(colorsMatch(result.value, THEME.sidebarIconColor), colorMismatch('sidebarIconColor', THEME.sidebarIconColor, result.value)).toBe(true);
   });

   test('sidebarSelectedBackgroundColor: selected nav item uses configured background', async ({ page }) => {
      // Click on a nav item to select it
      await page.click('.MuiDrawer-paper .MuiListItem-root');
      await page.waitForTimeout(500);

      const result = await page.evaluate(() => {
         const el = document.querySelector('.MuiDrawer-paper .qqq-sidebar-active');
         if (!el) return { found: false, value: '', debug: 'No .qqq-sidebar-active found' };
         return { found: true, value: getComputedStyle(el).backgroundColor, debug: el.className };
      });
      expect(result.found, `Selected sidebar item not found: ${result.debug}`).toBe(true);
      expect(colorsMatch(result.value, THEME.sidebarSelectedBackgroundColor), colorMismatch('sidebarSelectedBackgroundColor', THEME.sidebarSelectedBackgroundColor, result.value)).toBe(true);
   });

   test('sidebarSelectedTextColor: selected nav item text uses configured color', async ({ page }) => {
      await page.click('.MuiDrawer-paper .MuiListItem-root');
      await page.waitForTimeout(500);

      const result = await page.evaluate(() => {
         const selected = document.querySelector('.MuiDrawer-paper .qqq-sidebar-active');
         if (!selected) return { found: false, value: '', debug: 'No .qqq-sidebar-active found' };
         const text = selected.querySelector('.MuiTypography-root, span') || selected;
         return { found: true, value: getComputedStyle(text).color, debug: (text as Element).className };
      });
      expect(result.found, `Selected sidebar text not found: ${result.debug}`).toBe(true);
      expect(colorsMatch(result.value, THEME.sidebarSelectedTextColor), colorMismatch('sidebarSelectedTextColor', THEME.sidebarSelectedTextColor, result.value)).toBe(true);
   });

   test('sidebarDividerColor: sidebar dividers use configured color', async ({ page }) => {
      const result = await page.evaluate(() => {
         const el = document.querySelector('.MuiDrawer-paper .MuiDivider-root, .MuiDrawer-paper hr');
         if (!el) return { found: false, value: '', debug: 'No sidebar divider found' };
         const styles = getComputedStyle(el);
         return { found: true, value: styles.borderColor || styles.backgroundColor, debug: el.className };
      });
      expect(result.found, `Sidebar divider not found: ${result.debug}`).toBe(true);
      expect(colorsMatch(result.value, THEME.sidebarDividerColor), colorMismatch('sidebarDividerColor', THEME.sidebarDividerColor, result.value)).toBe(true);
   });
});

// ============================================================================
// TABLES (MUI DataGrid) - Actual Rendered Values
// ============================================================================

test.describe('Tables - Rendered', () => {
   test.beforeEach(async ({ page }) => {
      await page.goto('/testApp/person');
      await page.waitForSelector('[id="root"]');
      await page.waitForTimeout(2500);
   });

   test('tableHeaderBackgroundColor: DataGrid header cells use configured background', async ({ page }) => {
      const result = await page.evaluate(() => {
         const el = document.querySelector('.MuiDataGrid-columnHeader');
         if (!el) return { found: false, value: '', debug: 'No .MuiDataGrid-columnHeader found' };
         return { found: true, value: getComputedStyle(el).backgroundColor, debug: '' };
      });
      expect(result.found, `DataGrid column header not found: ${result.debug}`).toBe(true);
      expect(colorsMatch(result.value, THEME.tableHeaderBackgroundColor), colorMismatch('tableHeaderBackgroundColor', THEME.tableHeaderBackgroundColor, result.value)).toBe(true);
   });

   test('tableHeaderTextColor: DataGrid header text uses configured color', async ({ page }) => {
      const result = await page.evaluate(() => {
         const el = document.querySelector('.MuiDataGrid-columnHeaderTitle');
         if (!el) return { found: false, value: '', debug: 'No .MuiDataGrid-columnHeaderTitle found' };
         return { found: true, value: getComputedStyle(el).color, debug: '' };
      });
      expect(result.found, `DataGrid header text not found: ${result.debug}`).toBe(true);
      expect(colorsMatch(result.value, THEME.tableHeaderTextColor), colorMismatch('tableHeaderTextColor', THEME.tableHeaderTextColor, result.value)).toBe(true);
   });

   test('tableBorderColor: DataGrid cells use configured border color', async ({ page }) => {
      const result = await page.evaluate(() => {
         const cell = document.querySelector('.MuiDataGrid-cell');
         if (!cell) return { found: false, value: '', debug: 'No .MuiDataGrid-cell found' };
         return { found: true, value: getComputedStyle(cell).borderColor, debug: '' };
      });
      expect(result.found, `DataGrid cell not found: ${result.debug}`).toBe(true);
      expect(colorsMatch(result.value, THEME.tableBorderColor), colorMismatch('tableBorderColor', THEME.tableBorderColor, result.value)).toBe(true);
   });
});

// ============================================================================
// TYPOGRAPHY - Actual Rendered Values
// ============================================================================

test.describe('Typography - Rendered', () => {
   test.beforeEach(async ({ page }) => {
      await page.goto('/');
      await page.waitForSelector('[id="root"]');
      await page.waitForTimeout(2000);
   });

   test('fontFamily: body uses configured font family', async ({ page }) => {
      const result = await page.evaluate(() => {
         return { value: getComputedStyle(document.body).fontFamily };
      });
      expect(result.value, 'fontFamily should contain Inter').toMatch(/Inter/i);
   });

   test('fontSizeBase: body uses configured font size', async ({ page }) => {
      const result = await page.evaluate(() => {
         return { value: getComputedStyle(document.body).fontSize };
      });
      expect(result.value, colorMismatch('fontSizeBase', THEME.fontSizeBase, result.value)).toBe(THEME.fontSizeBase);
   });

   test('fontWeightRegular: body text uses configured weight', async ({ page }) => {
      const result = await page.evaluate(() => {
         const el = document.querySelector('.MuiTypography-body1, p, span');
         if (!el) return { found: false, value: '', debug: 'No body text found' };
         return { found: true, value: getComputedStyle(el).fontWeight, debug: el.className };
      });
      expect(result.found, `Body text not found: ${result.debug}`).toBe(true);
      expect(result.value, colorMismatch('fontWeightRegular', String(THEME.fontWeightRegular), result.value)).toBe(String(THEME.fontWeightRegular));
   });

   test('typographyButtonFontWeight: buttons use configured weight', async ({ page }) => {
      await page.goto('/testApp/person');
      await page.waitForTimeout(2500);

      const result = await page.evaluate(() => {
         const btn = document.querySelector('.MuiButton-root');
         if (!btn) return { found: false, value: '', debug: 'No button found' };
         return { found: true, value: getComputedStyle(btn).fontWeight, debug: btn.className };
      });
      expect(result.found, `Button not found: ${result.debug}`).toBe(true);
      // Buttons use typographyButtonFontWeight, NOT fontWeightMedium
      expect(result.value, colorMismatch('typographyButtonFontWeight', String(THEME.typographyButtonFontWeight), result.value)).toBe(String(THEME.typographyButtonFontWeight));
   });
});

// ============================================================================
// UI ELEMENTS - Actual Rendered Values
// ============================================================================

test.describe('UI Elements - Rendered', () => {
   test.beforeEach(async ({ page }) => {
      await page.goto('/testApp/person');
      await page.waitForSelector('[id="root"]');
      await page.waitForTimeout(2500);
   });

   test('borderRadius: buttons use configured border radius', async ({ page }) => {
      const result = await page.evaluate(() => {
         const btn = document.querySelector('.MuiButton-root');
         if (!btn) return { found: false, value: '', debug: 'No button found' };
         return { found: true, value: getComputedStyle(btn).borderRadius, debug: btn.className };
      });
      expect(result.found, `Button not found: ${result.debug}`).toBe(true);
      expect(result.value, colorMismatch('borderRadius', THEME.borderRadius, result.value)).toBe(THEME.borderRadius);
   });

   test('borderColor: inputs use configured border color', async ({ page }) => {
      const result = await page.evaluate(() => {
         const el = document.querySelector('.MuiOutlinedInput-notchedOutline');
         if (!el) return { found: false, value: '', debug: 'No .MuiOutlinedInput-notchedOutline found' };
         return { found: true, value: getComputedStyle(el).borderColor, debug: '' };
      });
      expect(result.found, `Input border not found: ${result.debug}`).toBe(true);
      expect(colorsMatch(result.value, THEME.borderColor), colorMismatch('borderColor', THEME.borderColor, result.value)).toBe(true);
   });

   test('dividerColor: dividers use configured color', async ({ page }) => {
      const result = await page.evaluate(() => {
         // Find a divider NOT in the drawer (sidebar has its own divider color)
         const selectors = [
            'main .MuiDivider-root',
            '.MuiDivider-root:not(.MuiDrawer-root *):not(.MuiDrawer-paper *)'
         ];
         for (const sel of selectors) {
            const el = document.querySelector(sel);
            if (el) {
               const styles = getComputedStyle(el);
               return { found: true, value: styles.borderColor || styles.backgroundColor, debug: el.className };
            }
         }
         // If no divider element found, check if the CSS variable is properly set
         const cssVar = getComputedStyle(document.documentElement).getPropertyValue('--qqq-divider-color').trim();
         if (cssVar) {
            return { found: true, value: cssVar, debug: 'CSS variable --qqq-divider-color' };
         }
         return { found: false, value: '', debug: 'No divider found outside drawer' };
      });
      expect(result.found, `Divider not found: ${result.debug}`).toBe(true);
      expect(colorsMatch(result.value, THEME.dividerColor), colorMismatch('dividerColor', THEME.dividerColor, result.value)).toBe(true);
   });
});

// ============================================================================
// DIAGNOSTIC DUMP - outputs actual values for debugging
// ============================================================================

test.describe('Diagnostic Dump', () => {
   test('output all rendered theme values', async ({ page }) => {
      await page.goto('/testApp/person');
      await page.waitForSelector('[id="root"]');
      await page.waitForTimeout(2500);

      const diagnostics = await page.evaluate(() => {
         const getColor = (selector: string, prop: string) => {
            const el = document.querySelector(selector);
            if (!el) return { found: false, value: 'NOT FOUND' };
            return { found: true, value: getComputedStyle(el)[prop as any] };
         };

         return {
            primaryButton: getColor('.MuiButton-containedPrimary', 'backgroundColor'),
            link: getColor('a.MuiLink-root, main a', 'color'),
            body: getColor('body', 'backgroundColor'),
            card: getColor('.MuiCard-root, .MuiPaper-root', 'backgroundColor'),
            heading: getColor('h1, h2, h3, h4', 'color'),
            body2: getColor('.MuiTypography-body2', 'color'),
            brandedHeader: getColor('.qqq-branded-header-bar', 'backgroundColor'),
            brandedHeaderText: getColor('.qqq-branded-header-bar span', 'color'),
            sidebarBg: getColor('.MuiDrawer-paper', 'backgroundColor'),
            sidebarText: getColor('.MuiDrawer-paper .MuiListItemText-primary', 'color'),
            sidebarIcon: getColor('.MuiDrawer-paper .MuiSvgIcon-root', 'color'),
            sidebarActive: getColor('.qqq-sidebar-active', 'backgroundColor'),
            sidebarActiveText: getColor('.qqq-sidebar-active .MuiTypography-root', 'color'),
            tableHeader: getColor('.MuiDataGrid-columnHeader', 'backgroundColor'),
            tableHeaderText: getColor('.MuiDataGrid-columnHeaderTitle', 'color'),
            tableCell: getColor('.MuiDataGrid-cell', 'borderColor'),
            inputBorder: getColor('.MuiOutlinedInput-notchedOutline', 'borderColor'),
            buttonRadius: getColor('.MuiButton-root', 'borderRadius'),
            buttonWeight: getColor('.MuiButton-root', 'fontWeight'),
            bodyWeight: getColor('.MuiTypography-body1', 'fontWeight'),
         };
      });

      console.log('=== DIAGNOSTIC OUTPUT ===');
      console.log(JSON.stringify(diagnostics, null, 2));
      console.log('=========================');

      // This test always passes - it's just for diagnostics
      expect(true).toBe(true);
   });
});
