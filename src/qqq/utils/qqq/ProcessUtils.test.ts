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

import ProcessUtils from "./ProcessUtils";

describe("Process default values", () =>
{
   it("merges query defaults without mutating caller values", () =>
   {
      const defaults = {greeting: "Hello", keep: "original"};
      expect(ProcessUtils.mergeDefaultValues(defaults, '{"greeting":"Hi","count":2}')).toEqual({greeting: "Hi", keep: "original", count: 2});
      expect(defaults).toEqual({greeting: "Hello", keep: "original"});
   });

   it("keeps attacker property names as own data without changing prototypes", () =>
   {
      const values = ProcessUtils.mergeDefaultValues({}, '{"__proto__":{"injected":"bad"},"constructor":{"prototype":{"injected":"bad"}},"greeting":"Hi"}');
      expect(Object.getPrototypeOf(values)).toBe(Object.prototype);
      expect(values.injected).toBeUndefined();
      expect(Object.keys(values)).toEqual(["__proto__", "constructor", "greeting"]);
      expect(Object.prototype.hasOwnProperty.call(Object.prototype, "injected")).toBe(false);
   });

   it("rejects malformed and non-object query defaults", () =>
   {
      for (const input of ["{", "null", "[]", "1", '"text"'])
      {
         expect(() => ProcessUtils.mergeDefaultValues({}, input)).toThrow();
      }
   });
});
