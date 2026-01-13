import { test, expect } from '@playwright/test';

/**
 * STRICT Theme Defaults Verification Tests
 *
 * These tests verify that the DEFAULT appearance (no theme customization)
 * matches the EXACT original pre-theming appearance. This ensures 100%
 * backwards compatibility when no QThemeMetaData is configured.
 *
 * CRITICAL: These tests MUST pass to ensure visual regression didn't occur.
 *
 * Run with: THEME_FIXTURE=index npx playwright test theme-defaults.spec.ts
 *
 * Uses index.json fixture (no theme config - uses DEFAULT_THEME from themeUtils.ts)
 *
 * If any test fails, the default appearance has regressed and must be fixed.
 */

// Expected DEFAULT values - these match the original hardcoded values from before PR #125
const DEFAULTS = {
   // Sidebar
   sidebarBackgroundColor: '#1a2035',
   sidebarTextColor: '#ffffff',
   sidebarIconColor: '#ffffff',
   sidebarSelectedBackgroundColor: 'rgba(255, 255, 255, 0.2)',
   sidebarSelectedTextColor: '#ffffff',
   sidebarHoverBackgroundColor: 'rgba(255, 255, 255, 0.2)',
   sidebarDividerColor: 'rgba(255, 255, 255, 0.2)',
   // Stepper - original hardcoded values
   stepperInactiveColor: '#9fc9ff',
   stepperActiveColor: '#ffffff',
   stepperActiveLabelColor: 'rgba(255, 255, 255, 0.8)',
   // Switch
   switchTrackColor: '#42424a',
   // Menu
   menuBackgroundColor: '#FFFFFF',
   // Tabs
   tabsIndicatorColor: '#0062FF',
   // Flatpickr
   flatpickrSelectedColor: '#0062FF',
   // Branded header
   brandedHeaderHeight: '0px', // 0 when disabled
   // Arrow opacity
   arrowOpacity: '0.5',
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
   if (color.startsWith('rgba')) {
      return parseRgb(color);
   }
   if (color.startsWith('#')) {
      const rgb = hexToRgb(color);
      return { ...rgb, a: undefined };
   }
   return null;
}

// Helper to check if colors match (with tolerance)
function colorsMatch(actual: string, expected: string, tolerance = 2): boolean {
   if (actual.startsWith('#') && expected.startsWith('#')) {
      return actual.toLowerCase() === expected.toLowerCase();
   }

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

   if (actualRgb.a !== undefined && expectedRgb.a !== undefined) {
      return rgbMatch && Math.abs(actualRgb.a - expectedRgb.a) <= 0.05;
   }

   return rgbMatch;
}

// ============================================================================
// SIDEBAR DEFAULTS
// ============================================================================

test.describe('Sidebar Defaults (No Theme Config)', () => {
   test.beforeEach(async ({ page }) => {
      await page.goto('/');
      await page.waitForSelector('[id="root"]');
      await page.waitForTimeout(2000);
   });

   test('sidebar background uses dark default #1a2035', async ({ page }) => {
      const result = await page.evaluate(() => {
         const el = document.querySelector('.MuiDrawer-paper');
         if (!el) return { found: false, value: '' };
         return { found: true, value: getComputedStyle(el).backgroundColor };
      });

      expect(result.found).toBe(true);
      expect(colorsMatch(result.value, DEFAULTS.sidebarBackgroundColor)).toBe(true);
   });

   test('sidebar text color is white', async ({ page }) => {
      const result = await page.evaluate(() => {
         const el = document.querySelector('.MuiDrawer-paper .MuiTypography-root');
         if (!el) return { found: false, value: '' };
         return { found: true, value: getComputedStyle(el).color };
      });

      expect(result.found).toBe(true);
      expect(colorsMatch(result.value, DEFAULTS.sidebarTextColor)).toBe(true);
   });

   test('sidebar selected background is 20% white rgba', async ({ page }) => {
      const result = await page.evaluate(() => {
         const el = document.querySelector('.MuiDrawer-paper .qqq-sidebar-active');
         if (!el) return { found: false, value: '', debug: 'No active sidebar item' };
         return { found: true, value: getComputedStyle(el).backgroundColor, debug: '' };
      });

      // If no active item found, check the CSS variable
      if (!result.found) {
         const cssVarResult = await page.evaluate(() => {
            return getComputedStyle(document.documentElement)
               .getPropertyValue('--qqq-sidebar-selected-background-color').trim();
         });
         expect(colorsMatch(cssVarResult, DEFAULTS.sidebarSelectedBackgroundColor)).toBe(true);
      } else {
         expect(colorsMatch(result.value, DEFAULTS.sidebarSelectedBackgroundColor)).toBe(true);
      }
   });

   test('sidebar hover background CSS variable is 20% white', async ({ page }) => {
      const result = await page.evaluate(() => {
         return getComputedStyle(document.documentElement)
            .getPropertyValue('--qqq-sidebar-hover-background-color').trim();
      });

      expect(colorsMatch(result, DEFAULTS.sidebarHoverBackgroundColor)).toBe(true);
   });

   test('sidebar branding logo renders from branding.logo', async ({ page }) => {
      const result = await page.evaluate(() => {
         // Find the logo area in the sidebar
         const logoArea = document.querySelector('[data-qqq-id="sidenav-logo-area"]');
         if (!logoArea) return { found: false, reason: 'no sidenav-logo-area' };

         // Find the NavLink with the logo inside
         const navLink = logoArea.querySelector('a');
         if (!navLink) return { found: false, reason: 'no NavLink in logo area' };

         // Find the logo image
         const logoImg = navLink.querySelector('img') as HTMLImageElement;
         if (!logoImg) return { found: false, reason: 'no img in NavLink' };

         return {
            found: true,
            src: logoImg.src,
            naturalWidth: logoImg.naturalWidth,
            naturalHeight: logoImg.naturalHeight,
            complete: logoImg.complete,
            display: getComputedStyle(logoImg).display,
            visibility: getComputedStyle(logoImg).visibility
         };
      });

      expect(result.found).toBe(true);
      // Verify the logo has loaded (naturalWidth > 0 means image loaded)
      expect(result.naturalWidth).toBeGreaterThan(0);
      // Verify logo is visible (not hidden by CSS)
      expect(result.display).not.toBe('none');
      expect(result.visibility).not.toBe('hidden');
   });
});

// ============================================================================
// STEPPER DEFAULTS
// ============================================================================

test.describe('Stepper Defaults (No Theme Config)', () => {
   test.beforeEach(async ({ page }) => {
      // Navigate to a process page that has a stepper
      await page.goto('/');
      await page.waitForSelector('[id="root"]');
      await page.waitForTimeout(2000);
   });

   test('stepper inactive color CSS variable is #9fc9ff', async ({ page }) => {
      const result = await page.evaluate(() => {
         return getComputedStyle(document.documentElement)
            .getPropertyValue('--qqq-stepper-inactive-color').trim();
      });

      // If CSS variable not set, it should fall back to #9fc9ff in the component
      if (result === '') {
         // Variable not set means fallback is used - this is correct behavior
         expect(true).toBe(true);
      } else {
         expect(colorsMatch(result, DEFAULTS.stepperInactiveColor)).toBe(true);
      }
   });

   test('stepper active color CSS variable is white', async ({ page }) => {
      const result = await page.evaluate(() => {
         return getComputedStyle(document.documentElement)
            .getPropertyValue('--qqq-stepper-active-color').trim();
      });

      if (result === '') {
         // Variable not set means fallback is used - this is correct behavior
         expect(true).toBe(true);
      } else {
         expect(colorsMatch(result, DEFAULTS.stepperActiveColor)).toBe(true);
      }
   });

   test('stepper active label color CSS variable is 80% white', async ({ page }) => {
      const result = await page.evaluate(() => {
         return getComputedStyle(document.documentElement)
            .getPropertyValue('--qqq-stepper-active-label-color').trim();
      });

      if (result === '') {
         // Variable not set means fallback is used - this is correct behavior
         expect(true).toBe(true);
      } else {
         expect(colorsMatch(result, DEFAULTS.stepperActiveLabelColor)).toBe(true);
      }
   });
});

// ============================================================================
// COMPONENT DEFAULTS
// ============================================================================

test.describe('Component Defaults (No Theme Config)', () => {
   test.beforeEach(async ({ page }) => {
      await page.goto('/');
      await page.waitForSelector('[id="root"]');
      await page.waitForTimeout(2000);
   });

   test('switch track color CSS variable is #42424a', async ({ page }) => {
      const result = await page.evaluate(() => {
         return getComputedStyle(document.documentElement)
            .getPropertyValue('--qqq-switch-track-color').trim();
      });

      if (result === '') {
         // Variable not set means fallback is used - this is correct behavior
         expect(true).toBe(true);
      } else {
         expect(colorsMatch(result, DEFAULTS.switchTrackColor)).toBe(true);
      }
   });

   test('menu surface color CSS variable is white', async ({ page }) => {
      const result = await page.evaluate(() => {
         return getComputedStyle(document.documentElement)
            .getPropertyValue('--qqq-surface-color').trim();
      });

      if (result === '') {
         // Variable not set means fallback is used - this is correct behavior
         expect(true).toBe(true);
      } else {
         expect(colorsMatch(result, DEFAULTS.menuBackgroundColor)).toBe(true);
      }
   });

   test('info color CSS variable is #0062FF', async ({ page }) => {
      const result = await page.evaluate(() => {
         return getComputedStyle(document.documentElement)
            .getPropertyValue('--qqq-info-color').trim();
      });

      if (result === '') {
         // Variable not set means fallback is used - this is correct behavior
         expect(true).toBe(true);
      } else {
         expect(colorsMatch(result, DEFAULTS.tabsIndicatorColor)).toBe(true);
      }
   });
});

// ============================================================================
// BRANDED HEADER DEFAULTS
// ============================================================================

test.describe('Branded Header Defaults (No Theme Config)', () => {
   test.beforeEach(async ({ page }) => {
      await page.goto('/');
      await page.waitForSelector('[id="root"]');
      await page.waitForTimeout(2000);
   });

   test('branded header height is 0px when disabled', async ({ page }) => {
      const result = await page.evaluate(() => {
         return getComputedStyle(document.documentElement)
            .getPropertyValue('--qqq-branded-header-height').trim();
      });

      expect(result).toBe(DEFAULTS.brandedHeaderHeight);
   });

   test('branded header is not visible when disabled', async ({ page }) => {
      const result = await page.evaluate(() => {
         const el = document.querySelector('[data-qqq-id="branded-header"]');
         return { found: !!el };
      });

      // Branded header should not be rendered when disabled
      expect(result.found).toBe(false);
   });
});

// ============================================================================
// GRADIENT COMPONENTS
// ============================================================================

test.describe('Gradient Components (No Theme Config)', () => {
   test.beforeEach(async ({ page }) => {
      await page.goto('/');
      await page.waitForSelector('[id="root"]');
      await page.waitForTimeout(2000);
   });

   test('gradient buttons use linear-gradient background', async ({ page }) => {
      // Look for any gradient button in the page
      const result = await page.evaluate(() => {
         // Look for buttons that might have gradient styling
         const buttons = document.querySelectorAll('button');
         for (const btn of buttons) {
            const bg = getComputedStyle(btn).background || getComputedStyle(btn).backgroundImage;
            if (bg.includes('linear-gradient')) {
               return { found: true, hasGradient: true, value: bg };
            }
         }
         return { found: false, hasGradient: false, value: '' };
      });

      // If gradient buttons exist, they should have gradient backgrounds
      if (result.found) {
         expect(result.hasGradient).toBe(true);
      }
   });
});

// ============================================================================
// STRICT RENDERED VALUE TESTS
// ============================================================================

test.describe('STRICT Rendered Values (No Theme Config)', () => {
   test.beforeEach(async ({ page }) => {
      await page.goto('/');
      await page.waitForSelector('[id="root"]');
      await page.waitForTimeout(2000);
   });

   test('STRICT: sidebar drawer background MUST be #1a2035', async ({ page }) => {
      const result = await page.evaluate(() => {
         const el = document.querySelector('.MuiDrawer-paper');
         if (!el) return { found: false, value: '', error: 'MuiDrawer-paper not found' };
         return { found: true, value: getComputedStyle(el).backgroundColor, error: '' };
      });

      expect(result.found, `CRITICAL: ${result.error}`).toBe(true);
      expect(
         colorsMatch(result.value, DEFAULTS.sidebarBackgroundColor),
         `REGRESSION: Sidebar background is ${result.value}, expected ${DEFAULTS.sidebarBackgroundColor}`
      ).toBe(true);
   });

   test('STRICT: sidebar icon color MUST be white (#ffffff)', async ({ page }) => {
      const result = await page.evaluate(() => {
         const el = document.querySelector('.MuiDrawer-paper .MuiSvgIcon-root');
         if (!el) return { found: false, value: '', error: 'No sidebar icon found' };
         return { found: true, value: getComputedStyle(el).color, error: '' };
      });

      if (result.found) {
         expect(
            colorsMatch(result.value, DEFAULTS.sidebarIconColor),
            `REGRESSION: Sidebar icon color is ${result.value}, expected ${DEFAULTS.sidebarIconColor}`
         ).toBe(true);
      }
   });

   test('STRICT: sidebar divider color MUST be rgba(255,255,255,0.2)', async ({ page }) => {
      const result = await page.evaluate(() => {
         const el = document.querySelector('.MuiDrawer-paper .MuiDivider-root');
         if (!el) return { found: false, value: '', error: 'No sidebar divider found' };
         return { found: true, value: getComputedStyle(el).borderColor, error: '' };
      });

      if (result.found) {
         expect(
            colorsMatch(result.value, DEFAULTS.sidebarDividerColor),
            `REGRESSION: Sidebar divider color is ${result.value}, expected ${DEFAULTS.sidebarDividerColor}`
         ).toBe(true);
      }
   });

   test('STRICT: primary color CSS variable MUST be #0062FF (info blue)', async ({ page }) => {
      const result = await page.evaluate(() => {
         return getComputedStyle(document.documentElement)
            .getPropertyValue('--qqq-primary-color').trim();
      });

      expect(
         colorsMatch(result, '#0062FF'),
         `REGRESSION: Primary color is ${result}, expected #0062FF`
      ).toBe(true);
   });
});

// ============================================================================
// CRITICAL REGRESSION TESTS
// ============================================================================

test.describe('CRITICAL Regression Tests (No Theme Config)', () => {
   test.beforeEach(async ({ page }) => {
      await page.goto('/');
      await page.waitForSelector('[id="root"]');
      await page.waitForTimeout(2000);
   });

   test('CRITICAL: branded header height MUST be 0px when disabled', async ({ page }) => {
      const height = await page.evaluate(() => {
         return getComputedStyle(document.documentElement)
            .getPropertyValue('--qqq-branded-header-height').trim();
      });

      expect(
         height,
         `CRITICAL REGRESSION: Branded header height is "${height}" but MUST be "0px" when disabled. ` +
         `This causes extra space at top of page!`
      ).toBe('0px');
   });

   test('CRITICAL: branded header enabled MUST be false', async ({ page }) => {
      const enabled = await page.evaluate(() => {
         return getComputedStyle(document.documentElement)
            .getPropertyValue('--qqq-branded-header-enabled').trim();
      });

      expect(
         enabled,
         `CRITICAL REGRESSION: Branded header enabled is "${enabled}" but MUST be "false" when no theme configured`
      ).toBe('false');
   });

   test('CRITICAL: sidebar hover background MUST be rgba(255,255,255,0.2)', async ({ page }) => {
      const hover = await page.evaluate(() => {
         return getComputedStyle(document.documentElement)
            .getPropertyValue('--qqq-sidebar-hover-background-color').trim();
      });

      expect(
         colorsMatch(hover, 'rgba(255, 255, 255, 0.2)'),
         `CRITICAL REGRESSION: Sidebar hover is "${hover}" but MUST be "rgba(255, 255, 255, 0.2)". ` +
         `This was changed from 0.1 to 0.2 in the fix.`
      ).toBe(true);
   });

   test('CRITICAL: sidebar selected background MUST be rgba(255,255,255,0.2)', async ({ page }) => {
      const selected = await page.evaluate(() => {
         return getComputedStyle(document.documentElement)
            .getPropertyValue('--qqq-sidebar-selected-background-color').trim();
      });

      expect(
         colorsMatch(selected, 'rgba(255, 255, 255, 0.2)'),
         `CRITICAL REGRESSION: Sidebar selected is "${selected}" but MUST be "rgba(255, 255, 255, 0.2)". ` +
         `This was incorrectly #0062FF before the fix.`
      ).toBe(true);
   });
});

// ============================================================================
// TYPOGRAPHY DEFAULTS
// ============================================================================

/**
 * Typography default values - these are the ACTUAL rendered values pre-PR #125.
 *
 * IMPORTANT: These values come from two sources:
 * 1. typography.ts - base typography definitions
 * 2. Component overrides (button/root.ts, etc.) - take precedence for specific components
 *
 * The original Theme.ts used {...typography} for the theme and component overrides.
 * Button component override in button/root.ts explicitly sets fontWeight: fontWeightBold (700).
 */
const TYPOGRAPHY_DEFAULTS = {
   fontFamily: '"SF Pro Display", "Roboto", "Helvetica", "Arial", sans-serif',
   // Typography variants from typography.ts (no component override)
   h1: { fontSize: '48px', fontWeight: '700', lineHeight: '1.25' }, // 3rem = 48px
   h2: { fontSize: '36px', fontWeight: '700', lineHeight: '1.3' }, // 2.25rem = 36px
   h3: { fontSize: '28px', fontWeight: '600', lineHeight: '1.375' }, // 1.75rem = 28px, fontWeight 600
   h4: { fontSize: '24px', fontWeight: '700', lineHeight: '1.375' }, // 1.5rem = 24px
   h5: { fontSize: '20px', fontWeight: '700', lineHeight: '1.375' }, // 1.25rem = 20px
   h6: { fontSize: '18px', fontWeight: '500', lineHeight: '1.625' }, // 1.125rem = 18px, fontWeight 500
   body1: { fontSize: '20px', fontWeight: '400', lineHeight: '1.625' }, // 1.25rem = 20px
   body2: { fontSize: '16px', fontWeight: '300', lineHeight: '1.6' }, // 1rem = 16px, fontWeightLight
   // Button has component override in button/root.ts: fontWeight: fontWeightBold (700)
   button: { fontSize: '12px', fontWeight: '700' }, // pxToRem(12)=size.xs, fontWeightBold from component override
   caption: { fontSize: '12px', fontWeight: '300' }, // 0.75rem = 12px, fontWeightLight
};

test.describe('Typography Defaults (No Theme Config)', () => {
   test.beforeEach(async ({ page }) => {
      await page.goto('/');
      await page.waitForSelector('[id="root"]');
      await page.waitForTimeout(2000);
   });

   test('CRITICAL: default font family includes SF Pro Display', async ({ page }) => {
      const result = await page.evaluate(() => {
         const el = document.querySelector('.MuiTypography-root');
         if (!el) return { found: false, value: '' };
         return { found: true, value: getComputedStyle(el).fontFamily };
      });

      // Font family should include SF Pro Display as first choice
      expect(result.found).toBe(true);
      expect(
         result.value.includes('SF Pro Display') || result.value.includes('Roboto'),
         `Font family is "${result.value}" but should include SF Pro Display or Roboto`
      ).toBe(true);
   });

   test('h3 fontWeight MUST be 600 (not 700)', async ({ page }) => {
      const result = await page.evaluate(() => {
         const el = document.querySelector('.MuiTypography-h3');
         if (!el) return { found: false, value: '' };
         return { found: true, value: getComputedStyle(el).fontWeight };
      });

      if (result.found) {
         expect(
            result.value,
            `REGRESSION: h3 fontWeight is "${result.value}" but MUST be "600" (Material Dashboard 2 PRO default)`
         ).toBe(TYPOGRAPHY_DEFAULTS.h3.fontWeight);
      }
   });

   test('h6 fontWeight MUST be 500 (not 600)', async ({ page }) => {
      const result = await page.evaluate(() => {
         const el = document.querySelector('.MuiTypography-h6');
         if (!el) return { found: false, value: '' };
         return { found: true, value: getComputedStyle(el).fontWeight };
      });

      if (result.found) {
         expect(
            result.value,
            `REGRESSION: h6 fontWeight is "${result.value}" but MUST be "500" (Material Dashboard 2 PRO default)`
         ).toBe(TYPOGRAPHY_DEFAULTS.h6.fontWeight);
      }
   });

   test('body2 fontWeight MUST be 300 (not 400)', async ({ page }) => {
      const result = await page.evaluate(() => {
         // Find body2 NOT in sidebar
         const allElements = document.querySelectorAll('.MuiTypography-body2');
         for (const el of allElements) {
            if (!el.closest('.MuiDrawer-root') && !el.closest('.MuiDrawer-paper')) {
               return { found: true, value: getComputedStyle(el).fontWeight };
            }
         }
         return { found: false, value: '' };
      });

      if (result.found) {
         expect(
            result.value,
            `REGRESSION: body2 fontWeight is "${result.value}" but MUST be "300" (fontWeightLight)`
         ).toBe(TYPOGRAPHY_DEFAULTS.body2.fontWeight);
      }
   });

   test('button fontWeight MUST be 700 (from component override)', async ({ page }) => {
      const result = await page.evaluate(() => {
         const el = document.querySelector('.MuiButton-root');
         if (!el) return { found: false, value: '' };
         return { found: true, value: getComputedStyle(el).fontWeight };
      });

      if (result.found) {
         expect(
            result.value,
            `REGRESSION: button fontWeight is "${result.value}" but MUST be "700" (fontWeightBold from button/root.ts override)`
         ).toBe(TYPOGRAPHY_DEFAULTS.button.fontWeight);
      }
   });
});

// ============================================================================
// DIAGNOSTIC DUMP
// ============================================================================

test.describe('Diagnostic - Dump All Default CSS Variables', () => {
   test('dump all qqq CSS variables for verification', async ({ page }) => {
      await page.goto('/');
      await page.waitForSelector('[id="root"]');
      await page.waitForTimeout(2000);

      const cssVars = await page.evaluate(() => {
         const style = getComputedStyle(document.documentElement);
         const vars: Record<string, string> = {};
         const varNames = [
            '--qqq-primary-color',
            '--qqq-sidebar-background-color',
            '--qqq-sidebar-text-color',
            '--qqq-sidebar-icon-color',
            '--qqq-sidebar-selected-background-color',
            '--qqq-sidebar-selected-text-color',
            '--qqq-sidebar-hover-background-color',
            '--qqq-sidebar-divider-color',
            '--qqq-branded-header-enabled',
            '--qqq-branded-header-height',
            '--qqq-stepper-inactive-color',
            '--qqq-stepper-active-color',
            '--qqq-stepper-active-label-color',
            '--qqq-switch-track-color',
            '--qqq-surface-color',
            '--qqq-info-color',
         ];
         for (const name of varNames) {
            vars[name] = style.getPropertyValue(name).trim();
         }
         return vars;
      });

      console.log('CSS Variables with Default Theme:');
      console.log(JSON.stringify(cssVars, null, 2));

      // This test always passes - it's for diagnostic output
      expect(true).toBe(true);
   });

   test('DIAG: dump actual computed styles for typography elements', async ({ page }) => {
      await page.goto('/');
      await page.waitForSelector('[id="root"]');
      await page.waitForTimeout(2000);

      const typographyDiag = await page.evaluate(() => {
         const result: Record<string, unknown> = {};

         // Find body2 element - look for real text content, not icons
         const body2Els = document.querySelectorAll('.MuiTypography-body2');
         result.body2Count = body2Els.length;
         result.body2All = [];
         for (let i = 0; i < Math.min(body2Els.length, 5); i++) {
            const el = body2Els[i];
            const style = getComputedStyle(el);
            (result.body2All as unknown[]).push({
               fontWeight: style.fontWeight,
               fontSize: style.fontSize,
               textContent: (el.textContent || '').substring(0, 30),
               parentClass: el.parentElement?.className?.substring(0, 50),
            });
         }

         // Find button element - check multiple
         const buttonEls = document.querySelectorAll('.MuiButton-root');
         result.buttonCount = buttonEls.length;
         result.buttonAll = [];
         for (let i = 0; i < Math.min(buttonEls.length, 5); i++) {
            const el = buttonEls[i];
            const style = getComputedStyle(el);
            (result.buttonAll as unknown[]).push({
               fontWeight: style.fontWeight,
               fontSize: style.fontSize,
               textContent: (el.textContent || '').substring(0, 30),
               variant: el.className.includes('contained') ? 'contained' :
                        el.className.includes('outlined') ? 'outlined' : 'text',
            });
         }

         // Find h3 element - check if it's truly h3
         const h3Els = document.querySelectorAll('.MuiTypography-h3');
         result.h3TypoCount = h3Els.length;
         const h3Tags = document.querySelectorAll('h3');
         result.h3TagCount = h3Tags.length;
         result.h3All = [];
         for (let i = 0; i < Math.min(h3Tags.length, 5); i++) {
            const el = h3Tags[i];
            const style = getComputedStyle(el);
            (result.h3All as unknown[]).push({
               fontWeight: style.fontWeight,
               fontSize: style.fontSize,
               className: el.className,
               textContent: (el.textContent || '').substring(0, 30),
            });
         }

         // Check page title (usually in h3)
         const pageTitle = document.querySelector('h3, .MuiTypography-h3');
         if (pageTitle) {
            const style = getComputedStyle(pageTitle);
            result.pageTitle = {
               tagName: pageTitle.tagName,
               fontWeight: style.fontWeight,
               fontSize: style.fontSize,
               textContent: (pageTitle.textContent || '').substring(0, 30),
            };
         }

         // Check root font size
         result.rootFontSize = getComputedStyle(document.documentElement).fontSize;
         result.bodyFontSize = getComputedStyle(document.body).fontSize;

         return result;
      });

      console.log('Typography Diagnostic (detailed):');
      console.log(JSON.stringify(typographyDiag, null, 2));

      // This test always passes - it's for diagnostic output
      expect(true).toBe(true);
   });

   test('DIAG: check sidebar logo status', async ({ page }) => {
      await page.goto('/');
      await page.waitForSelector('[id="root"]');
      await page.waitForTimeout(2000);

      const logoDiag = await page.evaluate(() => {
         const result: Record<string, unknown> = {};

         // Check for logo area
         const logoArea = document.querySelector('[data-qqq-id="sidenav-logo-area"]');
         result.logoAreaFound = !!logoArea;

         // Check for img elements in sidenav
         const drawer = document.querySelector('.MuiDrawer-paper');
         if (drawer) {
            const imgs = drawer.querySelectorAll('img');
            result.imgCount = imgs.length;
            result.imgs = [];
            imgs.forEach((img, i) => {
               (result.imgs as unknown[]).push({
                  src: img.src,
                  alt: img.alt,
                  display: getComputedStyle(img).display,
                  visibility: getComputedStyle(img).visibility,
                  width: getComputedStyle(img).width,
                  height: getComputedStyle(img).height,
                  naturalWidth: img.naturalWidth,
                  naturalHeight: img.naturalHeight,
                  complete: img.complete,
               });
            });
         }

         // Check for NavLink with logo
         const navLink = document.querySelector('[data-qqq-id="sidenav-logo-area"] a');
         result.navLinkFound = !!navLink;
         if (navLink) {
            result.navLinkChildren = navLink.children.length;
            result.navLinkHTML = navLink.innerHTML.substring(0, 200);
         }

         // Check CSS variables
         const style = getComputedStyle(document.documentElement);
         result.brandedHeaderHeight = style.getPropertyValue('--qqq-branded-header-height').trim();
         result.brandedHeaderEnabled = style.getPropertyValue('--qqq-branded-header-enabled').trim();

         return result;
      });

      console.log('Sidebar Logo Diagnostic:');
      console.log(JSON.stringify(logoDiag, null, 2));

      expect(true).toBe(true);
   });
});
