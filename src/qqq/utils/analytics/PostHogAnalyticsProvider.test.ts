/*
 * QQQ - Low-code Application Framework for Engineers.
 * Copyright (C) 2021-2024.  Kingsrook, LLC
 * 651 N Broad St Ste 205 # 6917 | Middletown DE 19709 | United States
 * contact@kingsrook.com
 * https://github.com/Kingsrook/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
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
