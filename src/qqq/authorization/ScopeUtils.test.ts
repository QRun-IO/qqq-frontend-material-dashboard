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
