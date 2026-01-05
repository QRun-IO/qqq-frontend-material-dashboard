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

import {AdornmentType} from "@qrunio/qqq-frontend-core/lib/model/metaData/AdornmentType";
import {QFieldMetaData} from "@qrunio/qqq-frontend-core/lib/model/metaData/QFieldMetaData";
import {QFieldType} from "@qrunio/qqq-frontend-core/lib/model/metaData/QFieldType";
import {QInstance} from "@qrunio/qqq-frontend-core/lib/model/metaData/QInstance";
import {QTableMetaData} from "@qrunio/qqq-frontend-core/lib/model/metaData/QTableMetaData";
import {QTableVariant} from "@qrunio/qqq-frontend-core/lib/model/metaData/QTableVariant";
import {QRecord} from "@qrunio/qqq-frontend-core/lib/model/QRecord";
import Tooltip from "@mui/material/Tooltip/Tooltip";
import {GridColDef, GridRowsProp, MuiEvent} from "@mui/x-data-grid-pro";
import {GridColumnHeaderParams} from "@mui/x-data-grid/models/params/gridColumnHeaderParams";
import HelpContent, {hasHelpContent} from "qqq/components/misc/HelpContent";
import {generateTableHeaderId} from "qqq/utils/qqqIdUtils";
import ValueUtils from "qqq/utils/qqq/ValueUtils";
import React from "react";
import {Link, NavigateFunction} from "react-router-dom";


export default class DataGridUtils
{
   /*******************************************************************************
    **
    *******************************************************************************/
   public static handleRowClick = (path: string, event: MuiEvent<React.MouseEvent>, gridMouseDownX: number, gridMouseDownY: number, navigate: NavigateFunction, instance: any) =>
   {
      ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
      // strategy for when to trigger or not trigger a row click:                                                      //
      // To avoid a drag-event that highlighted text in a cell:                                                        //
      // - we capture the x & y upon mouse-down - then compare them in this method (which fires when the mouse is up)  //
      //   if they are more than 5 pixels away from the mouse-down, then assume it's a drag, not a click.              //
      // - avoid clicking the row upon double-click, by setting a 500ms timer here - and in the onDoubleClick handler, //
      //   cancelling the timer.                                                                                       //
      // - also avoid a click, then click-again-and-start-dragging, by always cancelling the timer in mouse-down.      //
      // All in, these seem to have good results - the only downside being the half-second delay...                    //
      ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
      const diff = Math.max(Math.abs(event.clientX - gridMouseDownX), Math.abs(event.clientY - gridMouseDownY));
      if (diff < 5)
      {
         console.log("clearing timeout");
         clearTimeout(instance.current.timer);
         instance.current.timer = setTimeout(() =>
         {
            navigate(path);
         }, 100);
      }
      else
      {
         console.log(`row-click mouse-up happened ${diff} x or y pixels away from the mouse-down - so not considering it a click.`);
      }
   };

   /*******************************************************************************
    **
    *******************************************************************************/
   public static makeRows = (results: QRecord[], tableMetaData: QTableMetaData, tableVariant?: QTableVariant, allowEmptyId = false, maxValueLength: number = 2048): GridRowsProp[] =>
   {
      function trimValue(value: any, maxLength: number)
      {
         if(typeof value == "string" && maxLength)
         {
            if(value.length > maxLength)
            {
               return (value.substring(0, maxLength) + "...");
            }
         }

         return value;
      }

      const fields = [...tableMetaData.fields.values()];
      const rows = [] as any[];
      let rowIndex = 0;
      results.forEach((record: QRecord) =>
      {
         const row: any = {};
         row.__rowIndex = rowIndex++;

         fields.forEach((field) =>
         {
            row[field.name] = trimValue(ValueUtils.getDisplayValue(field, record, "query", undefined, tableVariant), maxValueLength);
         });

         if (tableMetaData.exposedJoins)
         {
            for (let i = 0; i < tableMetaData.exposedJoins.length; i++)
            {
               const join = tableMetaData.exposedJoins[i];

               if (join?.joinTable?.fields?.values())
               {
                  const fields = [...join.joinTable.fields.values()];
                  fields.forEach((field) =>
                  {
                     let fieldName = join.joinTable.name + "." + field.name;
                     row[fieldName] = trimValue(ValueUtils.getDisplayValue(field, record, "query", fieldName, tableVariant), maxValueLength);
                  });
               }
            }
         }

         if (!row["id"])
         {
            row["id"] = record.values.get(tableMetaData.primaryKeyField) ?? row[tableMetaData.primaryKeyField];
            if (row["id"] === null || row["id"] === undefined)
            {
               /////////////////////////////////////////////////////////////////////////////////////////
               // DataGrid gets very upset about a null or undefined here, so, try to make it happier //
               /////////////////////////////////////////////////////////////////////////////////////////
               if (!allowEmptyId)
               {
                  row["id"] = "--";
               }
            }
         }

         rows.push(row);
      });

      return (rows);
   };

   /*******************************************************************************
    **
    *******************************************************************************/
   public static setupGridColumns = (tableMetaData: QTableMetaData, linkBase: string = "", metaData?: QInstance, columnSort: "bySection" | "alphabetical" = "alphabetical", includeExposedJoinTables: string[] = undefined): GridColDef[] =>
   {
      const columns = [] as GridColDef[];
      this.addColumnsForTable(tableMetaData, linkBase, columns, columnSort, null, null);

      if (metaData)
      {
         if (tableMetaData.exposedJoins)
         {
            for (let i = 0; i < tableMetaData.exposedJoins.length; i++)
            {
               const join = tableMetaData.exposedJoins[i];
               let joinTableName = join.joinTable.name;
               if (metaData.tables.has(joinTableName) && metaData.tables.get(joinTableName).readPermission && (includeExposedJoinTables === undefined || includeExposedJoinTables.indexOf(joinTableName) > -1))
               {
                  let joinLinkBase = null;
                  joinLinkBase = metaData.getTablePath(join.joinTable);
                  if (joinLinkBase)
                  {
                     joinLinkBase += joinLinkBase.endsWith("/") ? "" : "/";
                  }

                  if (join?.joinTable?.fields?.values())
                  {
                     this.addColumnsForTable(join.joinTable, joinLinkBase, columns, columnSort, joinTableName + ".", join.label + ": ");
                  }
               }
            }
         }
      }

      return (columns);
   };


   /*******************************************************************************
    **
    *******************************************************************************/
   private static addColumnsForTable(tableMetaData: QTableMetaData, linkBase: string, columns: GridColDef[], columnSort: "bySection" | "alphabetical" = "alphabetical", namePrefix?: string, labelPrefix?: string)
   {
      const sortedKeys: string[] = [];

      ////////////////////////////////////////////////////////////////////////
      // this sorted by sections - e.g., manual sorting by the meta-data... //
      ////////////////////////////////////////////////////////////////////////
      if (columnSort === "bySection")
      {
         for (let i = 0; i < tableMetaData.sections.length; i++)
         {
            const section = tableMetaData.sections[i];
            if (!section.fieldNames)
            {
               continue;
            }

            for (let j = 0; j < section.fieldNames.length; j++)
            {
               sortedKeys.push(section.fieldNames[j]);
            }
         }
      }
      else // columnSort = "alphabetical"
      {
         ///////////////////////////
         // sort by labels... mmm //
         ///////////////////////////
         sortedKeys.push(...tableMetaData.fields.keys());
         sortedKeys.sort((a: string, b: string): number =>
         {
            return (tableMetaData.fields.get(a).label.localeCompare(tableMetaData.fields.get(b).label));
         });
      }

      sortedKeys.forEach((key) =>
      {
         const field = tableMetaData.fields.get(key);
         if (!field)
         {
            return;
         }
         if (field.isHeavy)
         {
            if (field.type == QFieldType.BLOB)
            {
               ////////////////////////////////////////////////////////
               // assume we DO want heavy blobs - as download links. //
               ////////////////////////////////////////////////////////
            }
            else
            {
               ///////////////////////////////////////////////////
               // otherwise, skip heavy fields on query screen. //
               ///////////////////////////////////////////////////
               return;
            }
         }

         const column = this.makeColumnFromField(field, tableMetaData, namePrefix, labelPrefix);

         if (key === tableMetaData.primaryKeyField && linkBase && namePrefix == null)
         {
            columns.splice(0, 0, column);
         }
         else
         {
            columns.push(column);
         }

         if (key === tableMetaData.primaryKeyField && linkBase)
         {
            column.renderCell = (cellValues: any) => (
               cellValues.value ? <Link to={`${linkBase}${encodeURIComponent(cellValues.value)}`} onClick={(e) => e.stopPropagation()}>{cellValues.value}</Link> : ""
            );
         }
      });
   }


   /*******************************************************************************
    **
    *******************************************************************************/
   public static makeColumnFromField = (field: QFieldMetaData, tableMetaData: QTableMetaData, namePrefix?: string, labelPrefix?: string): GridColDef =>
   {
      let columnType = "string";

      if (field.possibleValueSourceName)
      {
         // noop here
      }
      else
      {
         switch (field.type)
         {
            case QFieldType.DECIMAL:
            case QFieldType.INTEGER:
               columnType = "number";
               break;
            case QFieldType.DATE:
               columnType = "date";
               break;
            case QFieldType.DATE_TIME:
               columnType = "dateTime";
               break;
            case QFieldType.BOOLEAN:
               columnType = "string"; // using boolean gives an odd 'no' for nulls.
               break;
            case QFieldType.BLOB:
               break;
            default:
            // noop - leave as string
         }
      }

      let headerName = labelPrefix ? labelPrefix + field.label : field.label;
      let fieldName = namePrefix ? namePrefix + field.name : field.name;

      const column: GridColDef = {
         field: fieldName,
         type: columnType,
         headerName: headerName,
         width: DataGridUtils.getColumnWidthForField(field, tableMetaData),
         renderCell: null as any,
      };

      column.renderCell = (cellValues: any) => (
         (cellValues.value)
      );

      const helpRoles = ["QUERY_SCREEN", "READ_SCREENS", "ALL_SCREENS"];
      const showHelp = hasHelpContent(field.helpContents, helpRoles); // todo - maybe - take helpHelpActive from context all the way down to here?
      const dataQqqId = generateTableHeaderId(undefined, field.name, headerName);

      if (showHelp)
      {
         const formattedHelpContent = <HelpContent helpContents={field.helpContents} roles={helpRoles} heading={headerName} helpContentKey={`table:${tableMetaData.name};field:${fieldName}`} />;
         column.renderHeader = (params: GridColumnHeaderParams) => (
            <Tooltip title={formattedHelpContent}>
               <div className="MuiDataGrid-columnHeaderTitle" data-qqq-id={dataQqqId} style={{lineHeight: "initial"}}>
                  {headerName}
               </div>
            </Tooltip>
         );
      }
      else
      {
         column.renderHeader = (params: GridColumnHeaderParams) => (
            <div className="MuiDataGrid-columnHeaderTitle" data-qqq-id={dataQqqId} style={{lineHeight: "initial"}}>
               {headerName}
            </div>
         );
      }

      return (column);
   };


   /*******************************************************************************
    **
    *******************************************************************************/
   public static getColumnWidthForField = (field: QFieldMetaData, table?: QTableMetaData): number =>
   {
      if (field.hasAdornment(AdornmentType.SIZE))
      {
         const sizeAdornment = field.getAdornment(AdornmentType.SIZE);
         const width: string = sizeAdornment.getValue("width");
         const widths: Map<string, number> = new Map<string, number>([
            ["small", 100],
            ["medium", 200],
            ["medlarge", 300],
            ["large", 400],
            ["xlarge", 600]
         ]);
         if (widths.has(width))
         {
            return widths.get(width);
         }
         else
         {
            console.log("Unrecognized size.width adornment value: " + width);
         }
      }

      if (field.possibleValueSourceName)
      {
         return (200);
      }

      switch (field.type)
      {
         case QFieldType.DECIMAL:
         case QFieldType.INTEGER:

            if (table && field.name === table.primaryKeyField && field.label.length < 3)
            {
               return (75);
            }

            return (100);
         case QFieldType.DATE:
            return (100);
         case QFieldType.DATE_TIME:
            return (200);
         case QFieldType.BOOLEAN:
            return (75);
      }

      return (200);
   };
}

