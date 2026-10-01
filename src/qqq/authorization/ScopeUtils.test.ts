/*
 * QQQ - Low-code Application Framework for Engineers.
 * Copyright (C) 2021-2022.  Kingsrook, LLC
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

import {hasScope} from "./ScopeUtils";

describe("OAuth scopes", () =>
{
   const driveScope = "https://www.googleapis.com/auth/drive";

   it("accepts the exact scope among granted scopes", () =>
   {
      expect(hasScope(driveScope, driveScope)).toBe(true);
      expect(hasScope(`openid profile ${driveScope} email`, driveScope)).toBe(true);
   });

   it("rejects missing scopes and substring lookalikes", () =>
   {
      for (const scope of ["", "openid profile", `${driveScope}.readonly`, `https://example.com/${driveScope}`, `${driveScope}.example.com`])
      {
         expect(hasScope(scope, driveScope)).toBe(false);
      }
   });
});
