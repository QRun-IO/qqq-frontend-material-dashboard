/*
 * QQQ - Low-code Application Framework for Engineers.
 * Copyright (C) 2021-2024.  Kingsrook, LLC
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

import {describe, expect, it} from "@jest/globals";
import {buildPostHogScriptUrl} from "./PostHogAnalyticsProvider";

describe("buildPostHogScriptUrl", () =>
{
   it("should rewrite direct PostHog hosts to the asset host", () =>
   {
      expect(buildPostHogScriptUrl("https://us.i.posthog.com", "https://app.example.com")).toBe("https://us-assets.i.posthog.com/static/array.js");
   });


   it("should preserve same-origin proxy prefixes", () =>
   {
      expect(buildPostHogScriptUrl("/_posthog", "https://app.example.com")).toBe("https://app.example.com/_posthog/static/array.js");
   });


   it("should preserve an existing script asset path", () =>
   {
      expect(buildPostHogScriptUrl("https://eu.i.posthog.com/static/array.js?x=1", "https://app.example.com")).toBe("https://eu-assets.i.posthog.com/static/array.js");
   });
});
