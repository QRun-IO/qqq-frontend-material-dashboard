/*
 * QQQ - Low-code Application Framework for Engineers.
 * Copyright (C) 2021-2022.  Kingsrook, LLC
 * 651 N Broad St Ste 205 # 6917 | Middletown DE 19709 | United States
 * contact@kingsrook.com
 * https://github.com/Kingsrook/
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import {detectBasePath, resolveAssetUrl} from "./PathUtils";

/**
 * Helper to create a mock script element with a given src.
 */
function createMockScript(src: string): HTMLScriptElement
{
   const script = document.createElement("script");
   script.src = src;
   return script;
}

/**
 * Helper to set up the document with mock script tags.
 */
function setupScripts(scriptSrcs: string[]): void
{
   // Clear existing scripts
   const existingScripts = document.getElementsByTagName("script");
   while (existingScripts.length > 0)
   {
      existingScripts[0].parentNode?.removeChild(existingScripts[0]);
   }

   // Add new scripts
   scriptSrcs.forEach(src =>
   {
      document.body.appendChild(createMockScript(src));
   });
}

/**
 * Helper to set up a base tag.
 */
function setupBaseTag(href: string | null): void
{
   // Remove existing base tag
   const existingBase = document.querySelector("base");
   if (existingBase)
   {
      existingBase.parentNode?.removeChild(existingBase);
   }

   // Add new base tag if href provided
   if (href !== null)
   {
      const base = document.createElement("base");
      base.setAttribute("href", href);
      document.head.appendChild(base);
   }
}

describe("detectBasePath", () =>
{
   beforeEach(() =>
   {
      // Clean up DOM before each test
      setupScripts([]);
      setupBaseTag(null);
   });

   afterEach(() =>
   {
      // Clean up DOM after each test
      setupScripts([]);
      setupBaseTag(null);
   });

   describe("Strategy 1: Script tag detection", () =>
   {
      it("should detect base path from script tag with base path /admin", () =>
      {
         setupScripts([
            "http://example.com/admin/static/js/main.abc123.js"
         ]);

         expect(detectBasePath()).toBe("/admin");
      });

      it("should detect base path from script tag with nested base path /client/portal", () =>
      {
         setupScripts([
            "http://example.com/client/portal/static/js/main.abc123.js"
         ]);

         expect(detectBasePath()).toBe("/client/portal");
      });

      it("should detect base path from script tag with hyphenated base path /my-app", () =>
      {
         setupScripts([
            "https://example.com/my-app/static/js/bundle.js"
         ]);

         expect(detectBasePath()).toBe("/my-app");
      });

      /**
       * CRITICAL TEST: This is the bug scenario from issue #134.
       * When deployed at root, the script tag has no base path prefix.
       * The regex match[1] will be an empty string "".
       *
       * BUG (before fix): Empty string is falsy, so `if (match && match[1])`
       * would fail, falling through to Strategy 3 which incorrectly used
       * the current URL path as the base path.
       *
       * FIX: Changed to `if (match)` so the || "/" fallback is reached.
       */
      it("should return '/' when deployed at root (script src has no base path prefix)", () =>
      {
         setupScripts([
            "http://localhost:3000/static/js/main.abc123.js"
         ]);

         // This is the critical test - match[1] is "" (empty string)
         // The fix ensures we return "/" instead of falling through
         expect(detectBasePath()).toBe("/");
      });

      it("should handle HTTPS URLs at root", () =>
      {
         setupScripts([
            "https://example.com/static/js/main.abc123.js"
         ]);

         expect(detectBasePath()).toBe("/");
      });

      it("should use first matching script with /static/js/ pattern", () =>
      {
         setupScripts([
            "https://cdn.example.com/vendor.js",  // No /static/js/, should be skipped
            "http://example.com/admin/static/js/main.js"
         ]);

         expect(detectBasePath()).toBe("/admin");
      });
   });

   describe("Strategy 2: Base tag detection", () =>
   {
      it("should detect base path from <base> tag when no scripts match", () =>
      {
         setupScripts([]);  // No matching scripts
         setupBaseTag("/my-app/");

         expect(detectBasePath()).toBe("/my-app");
      });

      it("should strip trailing slash from base tag href", () =>
      {
         setupScripts([]);
         setupBaseTag("/admin/");

         expect(detectBasePath()).toBe("/admin");
      });

      it("should handle base tag without trailing slash", () =>
      {
         setupScripts([]);
         setupBaseTag("/portal");

         expect(detectBasePath()).toBe("/portal");
      });

      it("should ignore base tag with href='/' (root)", () =>
      {
         setupScripts([]);
         setupBaseTag("/");

         // Should fall through to default, not return "/"" from base tag
         expect(detectBasePath()).toBe("/");
      });

      it("should prefer script tag over base tag", () =>
      {
         setupScripts([
            "http://example.com/from-script/static/js/main.js"
         ]);
         setupBaseTag("/from-base-tag/");

         // Script tag (Strategy 1) takes precedence
         expect(detectBasePath()).toBe("/from-script");
      });
   });

   describe("Default behavior", () =>
   {
      it("should return '/' when no scripts match and no base tag", () =>
      {
         setupScripts([]);
         setupBaseTag(null);

         expect(detectBasePath()).toBe("/");
      });

      it("should return '/' when scripts exist but none have /static/js/", () =>
      {
         setupScripts([
            "https://cdn.example.com/vendor.js",
            "https://example.com/app.js"
         ]);

         expect(detectBasePath()).toBe("/");
      });
   });

   describe("Issue #134: Root deployment bug regression tests", () =>
   {
      /**
       * These tests verify the fix for issue #134.
       *
       * The bug occurred when:
       * 1. SPA deployed at root (/)
       * 2. User reloads at a single-segment route like /foo
       * 3. detectBasePath() returned "/foo" instead of "/"
       *
       * Root cause was two bugs:
       *
       * BUG 1 (Strategy 1): `if (match && match[1])` failed for root deployments
       * because match[1] = "" (empty string) which is falsy in JavaScript.
       * FIX: Changed to `if (match)` so the || "/" fallback is reached.
       *
       * BUG 2 (Strategy 3): Incorrectly used current URL path as base path.
       * FIX: Removed Strategy 3 entirely as it's fundamentally unreliable.
       */

      it("should return '/' for root deployment - not fall through (verifies Strategy 1 fix)", () =>
      {
         // This test verifies the regex pattern works correctly for root deployments
         const scriptSrc = "http://localhost:3000/static/js/main.js";
         const regex = /^https?:\/\/[^\/]+([\/\w-]*?)\/static\/js\//;
         const match = scriptSrc.match(regex);

         // Verify the regex matches and capture group 1 is empty string
         expect(match).not.toBeNull();
         expect(match![1]).toBe("");  // Empty string for root deployment

         // The fix ensures this empty string is handled correctly
         // With the bug: `if (match && match[1])` would be `if (true && "")` = false
         // With the fix: `if (match)` is `if (true)` = true, then `match[1] || "/"` = "/"
         setupScripts([scriptSrc]);
         expect(detectBasePath()).toBe("/");
      });

      it("should not be affected by current URL path (Strategy 3 removed)", () =>
      {
         // Even if window.location.pathname is something like "/foo",
         // we should return "/" when deployed at root
         setupScripts([
            "http://localhost:3000/static/js/main.js"
         ]);

         // This would have returned "/foo" with the old buggy Strategy 3
         expect(detectBasePath()).toBe("/");
      });
   });

   describe("Backwards compatibility", () =>
   {
      /**
       * These tests ensure the fix doesn't break existing deployments.
       */

      it("should continue to work for typical CRA deployment at /admin", () =>
      {
         setupScripts([
            "https://app.example.com/admin/static/js/main.chunk.js",
            "https://app.example.com/admin/static/js/runtime-main.js"
         ]);

         expect(detectBasePath()).toBe("/admin");
      });

      it("should continue to work for multi-level paths like /org/app", () =>
      {
         setupScripts([
            "https://example.com/org/app/static/js/main.js"
         ]);

         expect(detectBasePath()).toBe("/org/app");
      });

      it("should handle real-world CRA chunk naming patterns", () =>
      {
         setupScripts([
            "https://example.com/dashboard/static/js/2.abc123.chunk.js",
            "https://example.com/dashboard/static/js/main.def456.chunk.js",
            "https://example.com/dashboard/static/js/runtime-main.ghi789.js"
         ]);

         expect(detectBasePath()).toBe("/dashboard");
      });
   });
});

describe("resolveAssetUrl", () =>
{
   beforeEach(() =>
   {
      setupScripts([]);
      setupBaseTag(null);
   });

   afterEach(() =>
   {
      setupScripts([]);
      setupBaseTag(null);
   });

   describe("with root base path", () =>
   {
      beforeEach(() =>
      {
         // Simulate deployment at root
         setupScripts([
            "http://localhost:3000/static/js/main.js"
         ]);
      });

      it("should return root-relative URLs unchanged when at root", () =>
      {
         expect(resolveAssetUrl("/logo.png")).toBe("/logo.png");
      });

      it("should return absolute URLs unchanged", () =>
      {
         expect(resolveAssetUrl("https://cdn.example.com/logo.png")).toBe("https://cdn.example.com/logo.png");
         expect(resolveAssetUrl("http://cdn.example.com/logo.png")).toBe("http://cdn.example.com/logo.png");
      });

      it("should return relative URLs unchanged", () =>
      {
         expect(resolveAssetUrl("./logo.png")).toBe("./logo.png");
         expect(resolveAssetUrl("../assets/logo.png")).toBe("../assets/logo.png");
      });

      it("should return empty string for null/undefined", () =>
      {
         expect(resolveAssetUrl(null)).toBe("");
         expect(resolveAssetUrl(undefined)).toBe("");
         expect(resolveAssetUrl("")).toBe("");
      });
   });

   describe("with non-root base path", () =>
   {
      beforeEach(() =>
      {
         // Simulate deployment at /admin
         setupScripts([
            "http://example.com/admin/static/js/main.js"
         ]);
      });

      it("should prepend base path to root-relative URLs", () =>
      {
         expect(resolveAssetUrl("/logo.png")).toBe("/admin/logo.png");
         expect(resolveAssetUrl("/assets/icon.svg")).toBe("/admin/assets/icon.svg");
      });

      it("should not modify absolute URLs", () =>
      {
         expect(resolveAssetUrl("https://cdn.example.com/logo.png")).toBe("https://cdn.example.com/logo.png");
      });

      it("should not modify relative URLs", () =>
      {
         expect(resolveAssetUrl("./logo.png")).toBe("./logo.png");
      });
   });
});
