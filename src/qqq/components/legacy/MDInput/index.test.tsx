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
