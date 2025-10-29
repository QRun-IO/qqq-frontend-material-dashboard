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

/**
 * Detects the base path where the SPA is running.
 * Works for both root and sub-paths like /admin, /dashboard, etc.
 * 
 * Detection strategy (in order of reliability):
 * 1. Extract from current script location (most reliable)
 * 2. Extract from known path patterns in current pathname
 * 3. Default to / (root)
 * 
 * @returns The detected base path (e.g., "/admin", "/", "/dashboard")
 */
export function detectBasePath(): string
{
   // Strategy 1: Check current URL path first (most reliable for dev and prod)
   const currentPath = window.location.pathname;
   const parts = currentPath.split("/").filter(p => p);
   
   // If first part is a known SPA path like "admin", "dashboard", etc., use it
   if (parts.length > 0)
   {
      const firstPart = parts[0];
      // You can add more known paths here as needed
      if (["admin", "dashboard", "app", "manager", "console"].includes(firstPart))
      {
         return "/" + firstPart;
      }
   }

   // Strategy 2: Try to extract from the current script's source
   // When served from /admin/static/js/main.abc123.js, extract /admin
   if (document.currentScript && document.currentScript instanceof HTMLScriptElement)
   {
      const src = document.currentScript.src;
      // Match: http://localhost:8000/admin/static/js/main.abc123.js
      // Extract: /admin
      const match = src.match(/^https?:\/\/[^\/]+([\/\w-]*?)\/static\//);
      if (match && match[1])
      {
         return match[1];
      }
   }

   // Default to root
   return "/";
}

/**
 * Logs the detected base path for debugging purposes.
 * Useful for troubleshooting routing and API call issues.
 */
export function logBasePathDetection(): void
{
   const basePath = detectBasePath();
   console.log(`[QQQ] Detected SPA base path: ${basePath}`);
   
   if (basePath !== "/")
   {
      const metadataPath = basePath + "/metaData";
      const dataPath = basePath + "/data/*";
      console.log(`[QQQ] API calls will be directed to: ${metadataPath}, ${dataPath}, etc.`);
      console.log(`[QQQ] React Router will use basename: ${basePath}`);
   }
   else
   {
      console.log("[QQQ] Running at root path - API calls to /metaData, /data/*, etc.");
   }
}

/**
 * Resolves a URL to work with the current SPA base path.
 * 
 * - If the URL is absolute (starts with http:// or https://), returns as-is
 * - If the URL is root-relative (starts with /), prepends the base path
 * - If the URL is already relative or empty, returns as-is
 * 
 * Examples (when basePath is "/admin"):
 * - "/samples-logo2.png" -> "/admin/samples-logo2.png"
 * - "https://example.com/logo.png" -> "https://example.com/logo.png"
 * - "./logo.png" -> "./logo.png"
 * - "" -> ""
 * 
 * @param url The URL to resolve
 * @returns The resolved URL with base path applied if needed
 */
export function resolveAssetUrl(url: string | null | undefined): string
{
   if (!url)
   {
      return "";
   }
   
   // If it's an absolute URL (http/https), return as-is
   if (url.startsWith("http://") || url.startsWith("https://"))
   {
      return url;
   }
   
   // If it's a root-relative path (starts with /), prepend base path
   if (url.startsWith("/"))
   {
      const basePath = detectBasePath();
      if (basePath !== "/")
      {
         return basePath + url;
      }
   }
   
   // Otherwise return as-is (relative paths, data URLs, etc.)
   return url;
}


