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


import {GridPinnedColumns} from "@mui/x-data-grid-pro";
import {QFieldMetaData} from "@qrunio/qqq-frontend-core/lib/model/metaData/QFieldMetaData";
import {QTableMetaData} from "@qrunio/qqq-frontend-core/lib/model/metaData/QTableMetaData";
import DataGridUtils from "qqq/utils/DataGridUtils";
import TableUtils from "qqq/utils/qqq/TableUtils";

/*******************************************************************************
 ** member object
 *******************************************************************************/
export interface Column
{
   name: string;
   isVisible: boolean;
   width: number;
   pinned?: "left" | "right";
}

/*******************************************************************************
 ** Model for all info we'll store about columns on a query screen.
 *******************************************************************************/
export default class QQueryColumns
{
   columns: Column[] = [];

   /*******************************************************************************
    ** factory function - build a QQueryColumns object from JSON (string or parsed object).
    **
    ** input json is must look like if you JSON.stringify this class - that is:
    ** {columns: [{name:"",isVisible:true,width:0,pinned:"left"},{}...]}
    *******************************************************************************/
   public static buildFromJSON = (json: string | any): QQueryColumns =>
   {
      const queryColumns = new QQueryColumns();

      if (typeof json == "string")
      {
         json = JSON.parse(json);
      }

      queryColumns.columns = json.columns;

      return (queryColumns);
   };


   /*******************************************************************************
    ** factory function - build a default QQueryColumns object for a table
    **
    *******************************************************************************/
   public static buildDefaultForTable = (table: QTableMetaData): QQueryColumns =>
   {
      const queryColumns = new QQueryColumns();

      queryColumns.columns = [];
      queryColumns.columns.push({name: "__check__", isVisible: true, width: 100, pinned: "left"});

      const fields = this.getSortedFieldsFromTable(table);
      fields.forEach((field) =>
      {
         const column: Column = {name: field.name, isVisible: true, width: DataGridUtils.getColumnWidthForField(field, table)};

         if (field.name == table.primaryKeyField)
         {
            column.pinned = "left";

            //////////////////////////////////////////////////
            // insert the primary key field after __check__ //
            //////////////////////////////////////////////////
            queryColumns.columns.splice(1, 0, column);
         }
         else
         {
            queryColumns.columns.push(column);
         }
      });

      table.exposedJoins?.forEach((exposedJoin) =>
      {
         const joinFields = this.getSortedFieldsFromTable(exposedJoin.joinTable);
         joinFields.forEach((field) =>
         {
            const column: Column = {name: `${exposedJoin.joinTable.name}.${field.name}`, isVisible: false, width: DataGridUtils.getColumnWidthForField(field, null)};
            queryColumns.columns.push(column);
         });
      });

      return (queryColumns);
   };


   /*******************************************************************************
    **
    *******************************************************************************/
   public addColumnForNewField = (table: QTableMetaData, fieldName: string, defaultVisibilityIfInMainTable: boolean): void =>
   {
      const [field, tableForField] = TableUtils.getFieldAndTable(table, fieldName)

      if(!field)
      {
         console.warn(`Couldn't find field ${fieldName} in tableMetaData - so not adding a column for it`);
      }

      let column: Column;
      if(tableForField.name == table.name)
      {
         column = {name: field.name, isVisible: defaultVisibilityIfInMainTable, width: DataGridUtils.getColumnWidthForField(field, table)};
      }
      else
      {
         column = {name: `${tableForField.name}.${field.name}`, isVisible: false, width: DataGridUtils.getColumnWidthForField(field, null)};
      }

      this.columns.push(column);
   }


   /*******************************************************************************
    **
    *******************************************************************************/
   public deleteColumnForOldField = (table: QTableMetaData, fieldName: string): void =>
   {
      for (let i = 0; i < this.columns.length; i++)
      {
         if(this.columns[i].name == fieldName)
         {
            this.columns.splice(i, 1);
            return;
         }
      }

      console.log(`Couldn't find column to be deleted, for name [${fieldName}]`);
   }


   /*******************************************************************************
    **
    *******************************************************************************/
   private static getSortedFieldsFromTable(table: QTableMetaData)
   {
      const fields: QFieldMetaData[] = [];
      table.fields.forEach((field) => fields.push(field));
      table.virtualFields?.forEach((virtualField) =>
      {
         if (virtualField.isQuerySelectable)
         {
            fields.push(virtualField);
         }
      });

      fields.sort((a: QFieldMetaData, b: QFieldMetaData) =>
      {
         return a.name.localeCompare(b.name);
      });
      return fields;
   }


   /*******************************************************************************
    **
    *******************************************************************************/
   public getVisibleColumnCount(): number
   {
      let rs = 0;
      for (let i = 0; i < this.columns.length; i++)
      {
         if(this.columns[i].name == "__check__")
         {
            continue;
         }

         if(this.columns[i].isVisible)
         {
            rs++;
         }
      }
      return (rs);
   }


   /*******************************************************************************
    **
    *******************************************************************************/
   public getVisibilityToggleStates(): { [name: string]: boolean }
   {
      const rs: {[name: string]: boolean} = {};
      for (let i = 0; i < this.columns.length; i++)
      {
         rs[this.columns[i].name] = this.columns[i].isVisible;
      }
      return (rs);
   }


   /*******************************************************************************
    **
    *******************************************************************************/
   public setIsVisible(name: string, isVisible: boolean)
   {
      for (let i = 0; i < this.columns.length; i++)
      {
         if(this.columns[i].name == name)
         {
            this.columns[i].isVisible = isVisible;
            break;
         }
      }
   }


   /*******************************************************************************
    **
    *******************************************************************************/
   public updateVisibility = (visibilityModel: { [name: string]: boolean }): void =>
   {
      for (let i = 0; i < this.columns.length; i++)
      {
         const name = this.columns[i].name;
         this.columns[i].isVisible = visibilityModel[name];
      }
   };


   /*******************************************************************************
    **
    *******************************************************************************/
   public updateColumnOrder = (names: string[]): void =>
   {
      const newColumns: Column[] = [];
      const rest: Column[] = [];

      for (let i = 0; i < this.columns.length; i++)
      {
         const column = this.columns[i];
         const index = names.indexOf(column.name);
         if (index > -1)
         {
            newColumns[index] = column;
         }
         else
         {
            rest.push(column);
         }
      }

      this.columns = [...newColumns, ...rest];
   };


   /*******************************************************************************
    **
    *******************************************************************************/
   public updateColumnWidth = (name: string, width: number): void =>
   {
      for (let i = 0; i < this.columns.length; i++)
      {
         if (this.columns[i].name == name)
         {
            this.columns[i].width = width;
         }
      }
   };


   /*******************************************************************************
    **
    *******************************************************************************/
   public setPinnedLeftColumns = (names: string[]): void =>
   {
      const leftPins: Column[] = [];
      const rest: Column[] = [];

      for (let i = 0; i < this.columns.length; i++)
      {
         const column = this.columns[i];
         const pinIndex = names ? names.indexOf(column.name) : -1;
         if (pinIndex > -1)
         {
            column.pinned = "left";
            leftPins[pinIndex] = column;
         }
         else
         {
            if (column.pinned == "left")
            {
               column.pinned = undefined;
            }
            rest.push(column);
         }
      }

      this.columns = [...leftPins, ...rest];
   };


   /*******************************************************************************
    **
    *******************************************************************************/
   public setPinnedRightColumns = (names: string[]): void =>
   {
      const rightPins: Column[] = [];
      const rest: Column[] = [];

      for (let i = 0; i < this.columns.length; i++)
      {
         const column = this.columns[i];
         const pinIndex = names ? names.indexOf(column.name) : -1;
         if (pinIndex > -1)
         {
            column.pinned = "right";
            rightPins[pinIndex] = column;
         }
         else
         {
            if (column.pinned == "right")
            {
               column.pinned = undefined;
            }
            rest.push(column);
         }
      }

      this.columns = [...rest, ...rightPins];
   };


   /*******************************************************************************
    **
    *******************************************************************************/
   public getColumnSortValues = (): { [name: string]: number } =>
   {
      const sortValues: { [name: string]: number } = {};
      for (let i = 0; i < this.columns.length; i++)
      {
         sortValues[this.columns[i].name] = i;
      }
      return sortValues;
   };


   /*******************************************************************************
    **
    *******************************************************************************/
   public getColumnWidths = (): { [name: string]: number } =>
   {
      const widths: { [name: string]: number } = {};
      for (let i = 0; i < this.columns.length; i++)
      {
         const column = this.columns[i];
         widths[column.name] = column.width;
      }
      return widths;
   };


   /*******************************************************************************
    **
    *******************************************************************************/
   public toGridPinnedColumns = (): GridPinnedColumns =>
   {
      const gridPinnedColumns: GridPinnedColumns = {left: [], right: []};

      for (let i = 0; i < this.columns.length; i++)
      {
         const column = this.columns[i];
         if (column.pinned == "left")
         {
            gridPinnedColumns.left.push(column.name);
         }
         else if (column.pinned == "right")
         {
            gridPinnedColumns.right.push(column.name);
         }
      }

      return gridPinnedColumns;
   };


   /*******************************************************************************
    **
    *******************************************************************************/
   public toColumnVisibilityModel = (): { [index: string]: boolean } =>
   {
      const columnVisibilityModel: { [index: string]: boolean } = {};

      for (let i = 0; i < this.columns.length; i++)
      {
         const column = this.columns[i];
         columnVisibilityModel[column.name] = column.isVisible;
      }

      return columnVisibilityModel;
   };


   /*******************************************************************************
    ** sort the columns list, so that pinned columns go to the front (left) or back
    ** (right) of the list.
    *******************************************************************************/
   public sortColumnsFixingPinPositions = (): void =>
   {
      /////////////////////////////////////////////////////////////////////////////////////////////
      // do a sort to push pinned-left columns to the start, and pinned-right columns to the end //
      // and otherwise, leave everything alone                                                   //
      /////////////////////////////////////////////////////////////////////////////////////////////
      this.columns = this.columns.sort((a: Column, b: Column) =>
      {
         if(a.pinned == "left" && b.pinned != "left")
         {
            return -1;
         }
         else if(b.pinned == "left" && a.pinned != "left")
         {
            return 1;
         }
         else if(a.pinned == "right" && b.pinned != "right")
         {
            return 1;
         }
         else if(b.pinned == "right" && a.pinned != "right")
         {
            return -1;
         }
         else
         {
            return (0);
         }
      });
   }

}


/*******************************************************************************
 ** subclass of QQueryColumns - used as a marker, to indicate that the table
 ** isn't yet loaded, so it just a placeholder.
 *******************************************************************************/
export class PreLoadQueryColumns extends QQueryColumns
{
}

