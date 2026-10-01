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
