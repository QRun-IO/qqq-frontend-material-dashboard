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

import {expect, it, jest} from "@jest/globals";
import {QTableMetaData} from "@qrunio/qqq-frontend-core/lib/model/metaData/QTableMetaData";
import React from "react";
import {createRoot} from "react-dom/client";
import {act} from "react-dom/test-utils";
import FieldListMenu from "./FieldListMenu";

/*******************************************************************************
 ** Revoked and restored query choices must follow current metadata without
 ** changing the relationship descriptor used by authorized creation controls.
 *******************************************************************************/
it("updates joined field choices when omitted paths change", () =>
{
   (globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
   jest.useFakeTimers();
   const scrollIntoView = HTMLElement.prototype.scrollIntoView;
   HTMLElement.prototype.scrollIntoView = jest.fn();
   const table = new QTableMetaData({name: "person", label: "Person", fields: {id: {name: "id", label: "Person ID", type: "INTEGER"}}, exposedJoins: [
      {label: "Pets", isMany: true, joinPath: [], joinTable: {name: "pet", label: "Pet", readPermission: false, insertPermission: true,
         fields: {name: {name: "name", label: "Pet name", type: "STRING"}}}}
   ]});
   const host = document.createElement("div");
   document.body.appendChild(host);
   const root = createRoot(host);
   const selected = jest.fn();
   const render = (omit: string[]) => act(() => root.render(<FieldListMenu idPrefix="live-fields" tableMetaData={table}
      buttonProps={{}} buttonChildren="Choose fields" isModeSelectOne={true} handleSelectedField={selected} omitExposedJoins={omit} />));
   try
   {
      render([]);
      expect(document.querySelector(".fieldListMenuBody-live-fields").textContent).toContain("Pet name");
      act(() => (document.querySelector("[data-qqq-id=\"button-live-fields\"]") as HTMLElement).click());
      act(() => jest.runOnlyPendingTimers());
      act(() =>
      {
         document.querySelector("input").dispatchEvent(new KeyboardEvent("keydown", {key: "End", bubbles: true}));
      });
      act(() => jest.runOnlyPendingTimers());
      render(["pet"]);
      act(() =>
      {
         document.querySelector("input").dispatchEvent(new KeyboardEvent("keydown", {key: "Enter", bubbles: true}));
      });
      act(() => jest.runOnlyPendingTimers());
      expect(selected).not.toHaveBeenCalled();
      expect(document.querySelector(".fieldListMenuBody-live-fields").textContent).not.toContain("Pet name");
      expect(document.querySelector(".fieldListMenuBody-live-fields").textContent).toContain("Person ID");
      render([]);
      expect(document.querySelector(".fieldListMenuBody-live-fields").textContent).toContain("Pet name");
      expect(table.exposedJoins).toHaveLength(1);
      expect(table.exposedJoins[0].joinTable.insertPermission).toBe(true);
   }
   finally
   {
      act(() => root.unmount());
      host.remove();
      jest.useRealTimers();
      HTMLElement.prototype.scrollIntoView = scrollIntoView;
      delete (globalThis as any).IS_REACT_ACT_ENVIRONMENT;
   }
});
