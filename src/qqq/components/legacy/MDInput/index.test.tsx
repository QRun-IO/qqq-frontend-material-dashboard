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

import {expect, it} from "@jest/globals";
import {ThemeProvider} from "@mui/material/styles";
import React from "react";
import {createRoot} from "react-dom/client";
import {act} from "react-dom/test-utils";
import theme from "qqq/components/legacy/Theme";
import MDInput from "./index";

/*******************************************************************************
 ** A disabled field must receive native input semantics as well as styling.
 *******************************************************************************/
it("updates native disabled state when the form metadata changes", () =>
{
   (globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
   const host = document.createElement("div");
   document.body.appendChild(host);
   const root = createRoot(host);
   const render = (disabled: boolean) => act(() => root.render(<ThemeProvider theme={theme}>
      <MDInput name="createDate" type="datetime-local" disabled={disabled} />
   </ThemeProvider>));
   try
   {
      render(true);
      expect(host.querySelector("input").disabled).toBe(true);
      host.querySelector("input").focus();
      expect(document.activeElement).not.toBe(host.querySelector("input"));
      render(false);
      expect(host.querySelector("input").disabled).toBe(false);
      host.querySelector("input").focus();
      expect(document.activeElement).toBe(host.querySelector("input"));
      render(true);
      expect(host.querySelector("input").disabled).toBe(true);
   }
   finally
   {
      act(() => root.unmount());
      host.remove();
   }
});
