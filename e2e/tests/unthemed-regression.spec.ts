import { test, expect } from '@playwright/test';

/**
 * STRICT Visual Regression Tests for UNTHEMED Apps (Issue #128)
 *
 * These tests verify that apps WITHOUT a backend theme look correct.
 * Run with: THEME_FIXTURE=index npm run e2e
 *
 * Tests verify:
 * 1. Sidebar has correct DEFAULT_THEME colors (dark background, white text)
 * 2. Navbar/AppBar is NOT white (transparent, not affected by surfaceColor)
 * 3. CSS variables are injected with DEFAULT_THEME values
 * 4. Cards/Paper get surfaceColor but AppBar does not
 */

// DEFAULT_THEME values from src/qqq/utils/themeUtils.ts
// These must match the values in themeUtils.ts to restore pre-PR-125 appearance
const DEFAULT_THEME = {
   // Core colors
   primaryColor: '#0062FF',
   backgroundColor: '#f0f2f5',
   surfaceColor: '#ffffff',
   // Sidebar (dark gray matching original gradients.dark.main)
   sidebarBackgroundColor: '#42424a',
   sidebarTextColor: '#ffffff',
   sidebarIconColor: '#ffffff',
   sidebarSelectedBackgroundColor: 'rgba(255, 255, 255, 0.2)',
   sidebarSelectedTextColor: '#ffffff',
   sidebarHoverBackgroundColor: 'rgba(255, 255, 255, 0.2)',
   // Typography (matching original typography.ts)
   fontFamily: '"SF Pro Display", "Roboto", "Helvetica", "Arial", sans-serif',
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

// Helper to check if colors match (with tolerance)
function colorsMatch(actual: string, expected: string, tolerance = 5): boolean {
   if (actual.startsWith('#') && expected.startsWith('#')) {
      return actual.toLowerCase() === expected.toLowerCase();
   }

   let actualRgb = parseRgb(actual);
   if (!actualRgb && actual.startsWith('#')) {
      const hex = hexToRgb(actual);
      actualRgb = { ...hex, a: undefined };
   }

   let expectedRgb = parseRgb(expected);
   if (!expectedRgb && expected.startsWith('#')) {
      const hex = hexToRgb(expected);
      expectedRgb = { ...hex, a: undefined };
   }

   if (!actualRgb || !expectedRgb) return false;

   return (
      Math.abs(actualRgb.r - expectedRgb.r) <= tolerance &&
      Math.abs(actualRgb.g - expectedRgb.g) <= tolerance &&
      Math.abs(actualRgb.b - expectedRgb.b) <= tolerance
   );
}

// Helper to check if color is transparent or nearly transparent
function isTransparentOrNearlyTransparent(color: string): boolean {
   if (color === 'transparent' || color === 'rgba(0, 0, 0, 0)') {
      return true;
   }
   const rgb = parseRgb(color);
   if (rgb && rgb.a !== undefined && rgb.a < 0.1) {
      return true;
   }
   return false;
}

// Helper to check if color is NOT white (surfaceColor)
function isNotWhite(color: string): boolean {
   // Check if transparent
   if (isTransparentOrNearlyTransparent(color)) {
      return true;
   }
   // Check if NOT white (#ffffff or rgb(255,255,255))
   const actualRgb = parseRgb(color);
   if (!actualRgb) {
      if (color.startsWith('#')) {
         const hex = hexToRgb(color);
         return !(hex.r > 250 && hex.g > 250 && hex.b > 250);
      }
      return true;
   }
   // Allow some tolerance - if it's close to white, it's a problem
   return !(actualRgb.r > 250 && actualRgb.g > 250 && actualRgb.b > 250);
}

// Helper to check if a background (which may be a gradient) contains a color
function backgroundContainsColor(background: string, expectedColor: string, tolerance = 5): boolean {
   // Extract all rgb/rgba values from the background string
   const rgbMatches = background.matchAll(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/g);
   const expectedRgb = expectedColor.startsWith('#') ? hexToRgb(expectedColor) : parseRgb(expectedColor);
   if (!expectedRgb) return false;

   for (const match of rgbMatches) {
      const r = parseInt(match[1]);
      const g = parseInt(match[2]);
      const b = parseInt(match[3]);
      if (
         Math.abs(r - expectedRgb.r) <= tolerance &&
         Math.abs(g - expectedRgb.g) <= tolerance &&
         Math.abs(b - expectedRgb.b) <= tolerance
      ) {
         return true;
      }
   }
   return false;
}

// ============================================================================
// CSS VARIABLES - Verify they are NOT injected for unthemed apps
// CSS variables are 100% optional - CSS uses fallback values
// ============================================================================

test.describe('Unthemed App - CSS Variables Are Optional', () => {
   test.beforeEach(async ({ page }) => {
      await page.goto('/');
      await page.waitForSelector('[id="root"]');
      await page.waitForTimeout(2000);
   });

   test('no --qqq-* CSS variables are injected when no theme is configured', async ({ page }) => {
      const result = await page.evaluate(() => {
         const root = document.documentElement;
         const style = getComputedStyle(root);
         return {
            sidebarBg: style.getPropertyValue('--qqq-sidebar-background-color').trim(),
            sidebarText: style.getPropertyValue('--qqq-sidebar-text-color').trim(),
            surfaceColor: style.getPropertyValue('--qqq-surface-color').trim(),
            primaryColor: style.getPropertyValue('--qqq-primary-color').trim(),
         };
      });
      // All CSS variables should be empty (not injected) for unthemed apps
      expect(result.sidebarBg, 'CSS variable should not be injected for unthemed app').toBe('');
      expect(result.sidebarText, 'CSS variable should not be injected for unthemed app').toBe('');
      expect(result.surfaceColor, 'CSS variable should not be injected for unthemed app').toBe('');
      expect(result.primaryColor, 'CSS variable should not be injected for unthemed app').toBe('');
   });

   test('body does NOT have .qqq-themed class when no theme is configured', async ({ page }) => {
      const hasClass = await page.evaluate(() => {
         return document.body.classList.contains('qqq-themed');
      });
      expect(hasClass, 'Body should not have .qqq-themed class for unthemed app').toBe(false);
   });
});

// ============================================================================
// SIDEBAR - Verify dark theme colors via CSS fallbacks
// ============================================================================

test.describe('Unthemed App - Sidebar Colors', () => {
   test.beforeEach(async ({ page }) => {
      await page.goto('/');
      await page.waitForSelector('[id="root"]');
      await page.waitForTimeout(2000);
   });

   test('sidebar has dark background via CSS fallback', async ({ page }) => {
      const result = await page.evaluate(() => {
         const el = document.querySelector('.MuiDrawer-paper');
         if (!el) return { found: false, value: '', debug: 'No .MuiDrawer-paper found' };
         // Use 'background' not 'backgroundColor' because gradients set background-image
         return { found: true, value: getComputedStyle(el).background, debug: '' };
      });
      expect(result.found, `Sidebar not found: ${result.debug}`).toBe(true);
      // Check that the background contains the expected dark color (gradient includes #42424a)
      expect(
         backgroundContainsColor(result.value, DEFAULT_THEME.sidebarBackgroundColor),
         `Sidebar background should contain ${DEFAULT_THEME.sidebarBackgroundColor}, got ${result.value}`
      ).toBe(true);
   });

   test('sidebar text is white from DEFAULT_THEME', async ({ page }) => {
      const result = await page.evaluate(() => {
         const el = document.querySelector('.MuiDrawer-paper .MuiListItemText-primary, .MuiDrawer-paper .MuiTypography-root');
         if (!el) return { found: false, value: '', debug: 'No sidebar text found' };
         return { found: true, value: getComputedStyle(el).color, debug: el.className };
      });
      expect(result.found, `Sidebar text not found: ${result.debug}`).toBe(true);
      expect(
         colorsMatch(result.value, DEFAULT_THEME.sidebarTextColor),
         `Sidebar text color: expected ${DEFAULT_THEME.sidebarTextColor}, got ${result.value}`
      ).toBe(true);
   });

   test('sidebar icons are white from DEFAULT_THEME', async ({ page }) => {
      const result = await page.evaluate(() => {
         const el = document.querySelector('.MuiDrawer-paper .MuiIcon-root, .MuiDrawer-paper .material-icons');
         if (!el) return { found: false, value: '', debug: 'No sidebar icon found' };
         return { found: true, value: getComputedStyle(el).color, debug: el.className };
      });
      expect(result.found, `Sidebar icon not found: ${result.debug}`).toBe(true);
      expect(
         colorsMatch(result.value, DEFAULT_THEME.sidebarIconColor),
         `Sidebar icon color: expected ${DEFAULT_THEME.sidebarIconColor}, got ${result.value}`
      ).toBe(true);
   });
});

// ============================================================================
// NAVBAR/APPBAR - Verify NOT white (Issue #128 regression)
// ============================================================================

test.describe('Unthemed App - Navbar NOT White (Issue #128)', () => {
   test.beforeEach(async ({ page }) => {
      await page.goto('/');
      await page.waitForSelector('[id="root"]');
      await page.waitForTimeout(2000);
   });

   test('CRITICAL: AppBar background is NOT white/surfaceColor', async ({ page }) => {
      const result = await page.evaluate(() => {
         const appBar = document.querySelector('.MuiAppBar-root');
         if (!appBar) return { found: false, value: '', debug: 'No .MuiAppBar-root found' };
         return { found: true, value: getComputedStyle(appBar).backgroundColor, debug: '' };
      });
      expect(result.found, `AppBar not found: ${result.debug}`).toBe(true);
      expect(
         isNotWhite(result.value),
         `REGRESSION: AppBar background is white (${result.value}). Should be transparent or non-white.`
      ).toBe(true);
   });

   test('CRITICAL: Breadcrumb area is NOT white', async ({ page }) => {
      const result = await page.evaluate(() => {
         // Find the breadcrumb container or navbar area
         const selectors = [
            '.MuiBreadcrumbs-root',
            '.MuiToolbar-root',
            '.MuiAppBar-root .MuiBox-root'
         ];
         for (const sel of selectors) {
            const el = document.querySelector(sel);
            if (el) {
               const bg = getComputedStyle(el).backgroundColor;
               return { found: true, value: bg, selector: sel };
            }
         }
         return { found: false, value: '', selector: '' };
      });
      expect(result.found, 'Breadcrumb/toolbar area not found').toBe(true);
      expect(
         isNotWhite(result.value),
         `REGRESSION: Breadcrumb area (${result.selector}) is white (${result.value}). Should not be white.`
      ).toBe(true);
   });

   test('AppBar does not have --qqq-surface-color applied', async ({ page }) => {
      const result = await page.evaluate(() => {
         const appBar = document.querySelector('.MuiAppBar-root');
         if (!appBar) return { found: false, isSurfaceColor: false, value: '' };
         const bg = getComputedStyle(appBar).backgroundColor;
         // Check if it matches surfaceColor (#ffffff)
         const isSurfaceColor = bg === 'rgb(255, 255, 255)' || bg === '#ffffff';
         return { found: true, isSurfaceColor, value: bg };
      });
      expect(result.found, 'AppBar not found').toBe(true);
      expect(
         result.isSurfaceColor,
         `REGRESSION: AppBar has surfaceColor (#ffffff) applied. Value: ${result.value}`
      ).toBe(false);
   });
});

// ============================================================================
// CARDS/PAPER - Verify surfaceColor IS applied (but not to AppBar)
// ============================================================================

test.describe('Unthemed App - Cards Use Surface Color', () => {
   test.beforeEach(async ({ page }) => {
      await page.goto('/testApp/person');
      await page.waitForSelector('[id="root"]');
      await page.waitForTimeout(2500);
   });

   test('Cards in main content use surfaceColor', async ({ page }) => {
      const result = await page.evaluate(() => {
         // Find a card in main content, NOT in drawer/sidebar
         const el = document.querySelector('main .MuiCard-root, .MuiCard-root:not(.MuiDrawer-paper *)');
         if (!el) return { found: false, value: '', debug: 'No card found in main content' };
         return { found: true, value: getComputedStyle(el).backgroundColor, debug: el.className };
      });
      expect(result.found, `Card not found: ${result.debug}`).toBe(true);
      expect(
         colorsMatch(result.value, DEFAULT_THEME.surfaceColor),
         `Card background: expected ${DEFAULT_THEME.surfaceColor}, got ${result.value}`
      ).toBe(true);
   });
});

// ============================================================================
// BRANDED HEADER - Verify NOT shown when disabled
// ============================================================================

test.describe('Unthemed App - Branded Header Disabled', () => {
   test.beforeEach(async ({ page }) => {
      await page.goto('/');
      await page.waitForSelector('[id="root"]');
      await page.waitForTimeout(2000);
   });

   test('branded header is not visible when not configured', async ({ page }) => {
      const result = await page.evaluate(() => {
         const header = document.querySelector('.qqq-branded-header-bar');
         if (!header) return { exists: false, height: '0' };
         const height = getComputedStyle(header).height;
         const display = getComputedStyle(header).display;
         return { exists: true, height, display };
      });
      // Either the element doesn't exist, or it has 0 height, or it's hidden
      const isHidden = !result.exists ||
         result.height === '0px' ||
         result.height === '0' ||
         result.display === 'none';
      expect(isHidden, `Branded header should not be visible. Height: ${result.height}`).toBe(true);
   });

   test('--qqq-branded-header-height is not set (CSS fallback to 0px)', async ({ page }) => {
      const result = await page.evaluate(() => {
         const value = getComputedStyle(document.documentElement)
            .getPropertyValue('--qqq-branded-header-height').trim();
         return { value };
      });
      // CSS variable should be empty (not injected) - CSS fallback handles it
      expect(
         result.value === '' || result.value === '0px' || result.value === '0',
         `--qqq-branded-header-height should be empty or 0px, got ${result.value}`
      ).toBe(true);
   });

   test('sidebar does not overhang content area', async ({ page }) => {
      const result = await page.evaluate(() => {
         const sidebar = document.querySelector('.MuiDrawer-paper');
         // Try multiple selectors for main content area
         const mainContent = document.querySelector('main') ||
            document.querySelector('[class*="content"]') ||
            document.querySelector('.MuiBox-root > .MuiBox-root');
         if (!sidebar) {
            return { found: false, sidebarTop: 0, contentTop: 0, debug: 'No sidebar found' };
         }
         const sidebarRect = sidebar.getBoundingClientRect();
         // If we can't find main content, just verify sidebar starts at top (no overhang)
         if (!mainContent) {
            // Sidebar should start at or near the top of viewport
            return {
               found: true,
               sidebarTop: sidebarRect.top,
               contentTop: 0,
               isAligned: sidebarRect.top <= 100, // Should be near top
               debug: 'Using viewport top as reference'
            };
         }
         const contentRect = mainContent.getBoundingClientRect();
         return {
            found: true,
            sidebarTop: sidebarRect.top,
            contentTop: contentRect.top,
            // Sidebar should start at same level or below content
            isAligned: sidebarRect.top <= contentRect.top + 50,
            debug: 'Found main content'
         };
      });
      expect(result.found, `Sidebar not found: ${result.debug}`).toBe(true);
      expect(
         result.isAligned,
         `Sidebar overhang: sidebar top (${result.sidebarTop}) should align with content top (${result.contentTop}). Debug: ${result.debug}`
      ).toBe(true);
   });
});

// ============================================================================
// DIAGNOSTIC - Output actual values for debugging
// ============================================================================

test.describe('Unthemed App - Diagnostic Dump', () => {
   test('output all CSS variables and rendered values', async ({ page }) => {
      await page.goto('/');
      await page.waitForSelector('[id="root"]');
      await page.waitForTimeout(2000);

      const diagnostics = await page.evaluate(() => {
         const root = document.documentElement;
         const getVar = (name: string) => getComputedStyle(root).getPropertyValue(name).trim();
         const getBg = (selector: string) => {
            const el = document.querySelector(selector);
            return el ? getComputedStyle(el).backgroundColor : 'NOT FOUND';
         };
         const getColor = (selector: string) => {
            const el = document.querySelector(selector);
            return el ? getComputedStyle(el).color : 'NOT FOUND';
         };

         return {
            cssVariables: {
               '--qqq-sidebar-background-color': getVar('--qqq-sidebar-background-color'),
               '--qqq-sidebar-text-color': getVar('--qqq-sidebar-text-color'),
               '--qqq-surface-color': getVar('--qqq-surface-color'),
               '--qqq-primary-color': getVar('--qqq-primary-color'),
               '--qqq-branded-header-height': getVar('--qqq-branded-header-height'),
               '--qqq-branded-header-enabled': getVar('--qqq-branded-header-enabled'),
            },
            renderedValues: {
               sidebarBackground: getBg('.MuiDrawer-paper'),
               sidebarText: getColor('.MuiDrawer-paper .MuiTypography-root'),
               appBarBackground: getBg('.MuiAppBar-root'),
               toolbarBackground: getBg('.MuiToolbar-root'),
               cardBackground: getBg('.MuiCard-root'),
               bodyBackground: getBg('body'),
            }
         };
      });

      console.log('=== UNTHEMED APP DIAGNOSTIC ===');
      console.log(JSON.stringify(diagnostics, null, 2));
      console.log('===============================');

      // This test always passes - diagnostic only
      expect(true).toBe(true);
   });
});
