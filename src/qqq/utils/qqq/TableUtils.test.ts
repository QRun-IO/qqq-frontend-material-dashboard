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

import {QTableMetaData} from "@qrunio/qqq-frontend-core/lib/model/metaData/QTableMetaData";
import {QInstance} from "@qrunio/qqq-frontend-core/lib/model/metaData/QInstance";
import TableUtils from "./TableUtils";

/*******************************************************************************
 ** Full relationship metadata remains available for writes; automatic reads use
 ** only paths the metadata permits. The HTTP endpoint still enforces access.
 *******************************************************************************/
describe("automatic joined read permissions", () =>
{
   /*******************************************************************************
    ** Existing model constructors and a reversed two-hop exposed path.
    *******************************************************************************/
   function fixture()
   {
      const metaData = new QInstance({tables: Object.fromEntries(["person", "pet", "toy", "owner"].map(name => [name,
         {name, label: name, readPermission: true, insertPermission: true, fields: {id: {name: "id", type: "INTEGER"}}, exposedJoins: []}]))});
      const table = metaData.tables.get("person");
      table.exposedJoins = [
         {label: "Pets", isMany: true, joinTable: metaData.tables.get("pet"), joinPath: [{name: "personPet", type: "ONE_TO_MANY", leftTable: "person", rightTable: "pet"}]},
         {label: "Toys", isMany: true, joinTable: metaData.tables.get("toy"), joinPath: [
            {name: "petPerson", type: "MANY_TO_ONE", leftTable: "pet", rightTable: "person"},
            {name: "toyPet", type: "MANY_TO_ONE", leftTable: "toy", rightTable: "pet"}]},
         {label: "Owner", isMany: false, joinTable: metaData.tables.get("owner"), joinPath: [{name: "personOwner", type: "MANY_TO_ONE", leftTable: "person", rightTable: "owner"}]}
      ];
      return {metaData, table};
   }

   it("omits unreadable target and intermediate reads while retaining authorized writes and metadata", () =>
   {
      const {metaData, table} = fixture();
      metaData.tables.get("pet").readPermission = false;
      const originalJoins = table.exposedJoins;
      const originalPath = table.exposedJoins[1].joinPath;
      const visible = new Set(["pet", "toy", "owner"]);
      const joins = TableUtils.getQueryJoins(table, visible, metaData);
      expect(joins.map(join => join.joinTable)).toEqual(["owner"]);
      expect(joins[0]).toMatchObject({select: true, type: "LEFT", joinName: "personOwner"});
      expect(table.exposedJoins).toBe(originalJoins);
      expect(table.exposedJoins).toHaveLength(3);
      expect(table.exposedJoins[1].joinPath).toBe(originalPath);
      expect(table.exposedJoins[0].joinTable.insertPermission).toBe(true);
      expect(Array.from(visible)).toEqual(["pet", "toy", "owner"]);
   });

   it("restores the same reversed path when the intermediate becomes readable", () =>
   {
      const {metaData, table} = fixture();
      const visible = new Set(["toy"]);
      metaData.tables.get("pet").readPermission = false;
      expect(TableUtils.getQueryJoins(table, visible, metaData)).toEqual([]);
      metaData.tables.get("pet").readPermission = true;
      metaData.tables.get("pet").isHidden = true;
      expect(TableUtils.getQueryJoins(table, visible, metaData).map(join => join.joinTable)).toEqual(["toy"]);
      metaData.tables.delete("pet");
      expect(TableUtils.getQueryJoins(table, visible, metaData)).toEqual([]);
   });

   it("requires separate embedded and canonical target permission", () =>
   {
      const {metaData, table} = fixture();
      const canonical = metaData.tables.get("pet");
      const embedded = new QTableMetaData({name: "pet", readPermission: false, insertPermission: true});
      table.exposedJoins[0].joinTable = embedded;
      const visible = new Set(["pet"]);
      expect(TableUtils.getQueryJoins(table, visible, metaData)).toEqual([]);
      embedded.readPermission = true;
      canonical.readPermission = false;
      expect(TableUtils.getQueryJoins(table, visible, metaData)).toEqual([]);
      canonical.readPermission = true;
      expect(TableUtils.getQueryJoins(table, visible, metaData).map(join => join.joinTable)).toEqual(["pet"]);
      metaData.tables.delete("pet");
      expect(TableUtils.getQueryJoins(table, visible, metaData)).toEqual([]);
      expect(embedded.insertPermission).toBe(true);
   });

   it("waits for global metadata and never requires a second base-table grant", () =>
   {
      const {metaData, table} = fixture();
      const visible = new Set(["pet"]);
      expect(TableUtils.getQueryJoins(table, visible, null)).toEqual([]);
      metaData.tables.delete("person");
      expect(TableUtils.getQueryJoins(table, visible, metaData).map(join => join.joinTable)).toEqual(["pet"]);
   });
});
