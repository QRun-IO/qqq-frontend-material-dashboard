export type RgbColor = { r: number; g: number; b: number; a?: number };

/**
 * Utility functions to help with assertions in theme tests
 */

export function hexToRgb(hex: string): { r: number; g: number; b: number } | null
{
   const normalized = hex.trim().replace(/^#/, "");
   if (!/^[a-f\d]+$/i.test(normalized))
   {
      return null;
   }

   let rHex: string;
   let gHex: string;
   let bHex: string;

   if (normalized.length === 3)
   {
      rHex = normalized[0] + normalized[0];
      gHex = normalized[1] + normalized[1];
      bHex = normalized[2] + normalized[2];
   }
   else if (normalized.length === 6 || normalized.length === 8)
   {
      // Ignore alpha channel for 8-digit hex values (#RRGGBBAA).
      rHex = normalized.slice(0, 2);
      gHex = normalized.slice(2, 4);
      bHex = normalized.slice(4, 6);
   }
   else
   {
      return null;
   }

   return {
      r: parseInt(rHex, 16),
      g: parseInt(gHex, 16),
      b: parseInt(bHex, 16),
   };
}

export function parseRgb(rgbString: string): RgbColor | null
{
   const rgbMatch = rgbString.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
   if (rgbMatch)
   {
      return {
         r: parseInt(rgbMatch[1]),
         g: parseInt(rgbMatch[2]),
         b: parseInt(rgbMatch[3]),
         a: rgbMatch[4] ? parseFloat(rgbMatch[4]) : undefined,
      };
   }
   return null;
}

function parseColor(color: string): RgbColor | null
{
   if (color.startsWith("rgb"))
   {
      return parseRgb(color);
   }
   if (color.startsWith("#"))
   {
      const rgb = hexToRgb(color);
      return rgb ? {...rgb, a: undefined} : null;
   }
   return null;
}

export function colorsMatch(actual: string, expected: string, tolerance = 2): boolean
{
   if (actual.startsWith("#") && expected.startsWith("#"))
   {
      return actual.toLowerCase() === expected.toLowerCase();
   }

   const actualRgb = parseColor(actual);
   const expectedRgb = parseColor(expected);
   if (!actualRgb || !expectedRgb)
   {
      return false;
   }

   const rgbMatch = (
      Math.abs(actualRgb.r - expectedRgb.r) <= tolerance &&
      Math.abs(actualRgb.g - expectedRgb.g) <= tolerance &&
      Math.abs(actualRgb.b - expectedRgb.b) <= tolerance
   );

   if (actualRgb.a !== undefined && expectedRgb.a !== undefined)
   {
      return rgbMatch && Math.abs(actualRgb.a - expectedRgb.a) <= 0.05;
   }

   return rgbMatch;
}

export function isTransparentOrNearlyTransparent(color: string): boolean
{
   if (color === "transparent" || color === "rgba(0, 0, 0, 0)")
   {
      return true;
   }

   const rgb = parseRgb(color);
   return !!(rgb && rgb.a !== undefined && rgb.a < 0.1);
}
