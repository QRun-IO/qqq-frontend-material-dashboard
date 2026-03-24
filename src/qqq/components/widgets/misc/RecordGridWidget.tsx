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

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Icon from "@mui/material/Icon";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip/Tooltip";
import Typography from "@mui/material/Typography";
import {DataGridPro, GridCallbackDetails, GridDensity, GridEventListener, GridRenderCellParams, GridRowParams, GridToolbarContainer, MuiEvent, useGridApiContext, useGridApiEventHandler} from "@mui/x-data-grid-pro";
import {QTableMetaData} from "@qrunio/qqq-frontend-core/lib/model/metaData/QTableMetaData";
import {QWidgetMetaData} from "@qrunio/qqq-frontend-core/lib/model/metaData/QWidgetMetaData";
import {QRecord} from "@qrunio/qqq-frontend-core/lib/model/QRecord";
import Widget, {AddNewRecordButton, LabelComponent, WidgetData} from "qqq/components/widgets/Widget";
import DataGridUtils from "qqq/utils/DataGridUtils";
import HtmlUtils from "qqq/utils/HtmlUtils";
import Client from "qqq/utils/qqq/Client";
import ValueUtils from "qqq/utils/qqq/ValueUtils";
import React, {useEffect, useRef, useState} from "react";
import {Link, useNavigate} from "react-router-dom";

export interface ChildRecordListData extends WidgetData
{
   title?: string;
   queryOutput?: { records: { values: any, displayValues?: any } [] };
   childTableMetaData?: QTableMetaData | object;
   tablePath?: string;
   viewAllLink?: string;
   totalRows?: number;
   canAddChildRecord?: boolean;
   defaultValuesForNewChildRecords?: { [fieldName: string]: any };
   disabledFieldsForNewChildRecords?: { [fieldName: string]: any };
   defaultValuesForNewChildRecordsFromParentFields?: { [fieldName: string]: string };
   omitFieldNames?: string[];
}

interface Props
{
   widgetMetaData: QWidgetMetaData,
   data: ChildRecordListData,
   addNewRecordCallback?: () => void,
   disableRowClick: boolean,
   allowRecordEdit: boolean,
   editRecordCallback?: (rowIndex: number) => void,
   allowRecordDelete: boolean,
   deleteRecordCallback?: (rowIndex: number) => void,
   gridOnly?: boolean,
   gridDensity?: GridDensity,
   parentRecord?: QRecord
}

RecordGridWidget.defaultProps =
   {
      disableRowClick: false,
      allowRecordEdit: false,
      allowRecordDelete: false,
      gridOnly: false,
   };

const qController = Client.getInstance();

function RecordGridWidget({widgetMetaData, data, addNewRecordCallback, disableRowClick, allowRecordEdit, editRecordCallback, allowRecordDelete, deleteRecordCallback, gridOnly, gridDensity, parentRecord}: Props): JSX.Element
{
   const instance = useRef({timer: null});
   const [rows, setRows] = useState([]);
   const [records, setRecords] = useState([] as QRecord[]);
   const [columns, setColumns] = useState([]);
   const [allColumns, setAllColumns] = useState([]);
   const [csv, setCsv] = useState(null as string);
   const [fileName, setFileName] = useState(null as string);
   const [gridMouseDownX, setGridMouseDownX] = useState(0);
   const [gridMouseDownY, setGridMouseDownY] = useState(0);
   const [childTableMetaData, setChildTableMetaData] = useState(null as QTableMetaData);
   const navigate = useNavigate();


   /***************************************************************************
    * There's a table meta data object in the widget data - but - the type
    * has evolved over time.  originally, it could have been a QTableMetaData
    * else it could have been object we'd need to pass to the QTableMetaData
    * constructor.
    *
    * Now, we're migrating to have a QFrontendTableMetaData available from the
    * backend (to include full join table objects, as frontend expects) - which,
    * actually will come here as an object off of the widget call.
    *
    * so, all of this method is to just deal with whatever data we have, and
    * return the QTableMetaData object to use.
    *
    * (note, we do set this as a state var (childTableMetaData), but there was
    * an issue w/ the initial render and buttons getting "baked", where that
    * state var wasn't set yet (it's from a useEffect), so we extracted this
    * into a function that can be called for that button-builder
    ***************************************************************************/
   function getTableMetaDataFromWidgetData(data: ChildRecordListData): QTableMetaData
   {
      return data.childFrontendTableMetaData ?
         (data.childFrontendTableMetaData instanceof QTableMetaData ? data.childFrontendTableMetaData as QTableMetaData : new QTableMetaData(data.childFrontendTableMetaData)) :
         (data.childTableMetaData instanceof QTableMetaData ? data.childTableMetaData as QTableMetaData : new QTableMetaData(data.childTableMetaData));
   }


   useEffect(() =>
   {
      (async () =>
      {
         ///////////////////////////////////////////////////////////////////////////////////////////////
         // october 2025, we are migrating from childTableMetaData, which from the backend was not a  //
         // QFrontendTableMetaData - to childFrontendTableMetaData, which is a QFrontendTableMetaData //
         // and as such, contains join tables as actual tables, not just table names.                 //
         ///////////////////////////////////////////////////////////////////////////////////////////////
         if (data && (data.childTableMetaData || data.childFrontendTableMetaData) && data.queryOutput)
         {
            const records: QRecord[] = [];
            const queryOutputRecords = data.queryOutput.records;
            if (queryOutputRecords)
            {
               for (let i = 0; i < queryOutputRecords.length; i++)
               {
                  if (queryOutputRecords[i] instanceof QRecord)
                  {
                     records.push(queryOutputRecords[i] as QRecord);
                  }
                  else
                  {
                     records.push(new QRecord(queryOutputRecords[i]));
                  }
               }
            }

            const tableMetaData = getTableMetaDataFromWidgetData(data);
            setChildTableMetaData(tableMetaData);

            const rows = DataGridUtils.makeRows(records, tableMetaData, undefined, true);

            /////////////////////////////////////////////////////////////////////////////////
            // note - tablePath may be null, if the user doesn't have access to the table. //
            /////////////////////////////////////////////////////////////////////////////////
            const childTablePath = data.tablePath ? data.tablePath + (data.tablePath.endsWith("/") ? "" : "/") : data.tablePath;
            const metaData = await qController.loadMetaData();
            const includeExposedJoinTables: string[] = data.includeExposedJoinTables ?? []
            const columns = DataGridUtils.setupGridColumns(tableMetaData, childTablePath, metaData, "bySection", includeExposedJoinTables);

            if (data.omitFieldNames)
            {
               for (let i = 0; i < columns.length; i++)
               {
                  const column = columns[i];
                  if (data.omitFieldNames.indexOf(column.field) > -1)
                  {
                     columns.splice(i, 1);
                     i--;
                  }
               }
            }

            if(data.onlyIncludeFieldNames)
            {
               for (let i = 0; i < columns.length; i++)
               {
                  const column = columns[i];
                  if (data.onlyIncludeFieldNames.indexOf(column.field) == -1)
                  {
                     columns.splice(i, 1);
                     i--;
                  }
               }
            }

            /////////////////////////////////////////////////////////////////////////////////////////////////////////////
            // capture all-columns to use for the export (before we might splice some away from the on-screen display) //
            /////////////////////////////////////////////////////////////////////////////////////////////////////////////
            const allColumns = [...columns];
            setAllColumns(JSON.parse(JSON.stringify(columns)));

            ////////////////////////////////////////////////////////////////
            // do not not show the foreign-key column of the parent table //
            ////////////////////////////////////////////////////////////////
            if (data.defaultValuesForNewChildRecords)
            {
               for (let i = 0; i < columns.length; i++)
               {
                  if (data.defaultValuesForNewChildRecords[columns[i].field])
                  {
                     columns.splice(i, 1);
                     i--;
                  }
               }
            }

            ////////////////////////////////////
            // add actions cell, if available //
            ////////////////////////////////////
            if (allowRecordEdit || allowRecordDelete)
            {
               columns.unshift({
                  field: "_actions",
                  type: "string",
                  headerName: "Actions",
                  sortable: false,
                  filterable: false,
                  width: allowRecordEdit && allowRecordDelete ? 80 : 50,
                  renderCell: ((params: GridRenderCellParams) =>
                  {
                     return <Box>
                        {allowRecordEdit && <IconButton onClick={(e) =>
                        {
                           e.stopPropagation();
                           editRecordCallback(params.row.__rowIndex);
                        }}><Icon>edit</Icon></IconButton>}
                        {allowRecordDelete && <IconButton onClick={(e) =>
                        {
                           e.stopPropagation();
                           deleteRecordCallback(params.row.__rowIndex);
                        }}><Icon>delete</Icon></IconButton>}
                     </Box>;
                  })
               });
            }

            setRows(rows);
            setRecords(records);
            setColumns(columns);

            let csv = "";
            for (let i = 0; i < allColumns.length; i++)
            {
               csv += `${i > 0 ? "," : ""}"${ValueUtils.cleanForCsv(allColumns[i].headerName)}"`;
            }
            csv += "\n";

            for (let i = 0; i < records.length; i++)
            {
               for (let j = 0; j < allColumns.length; j++)
               {
                  const value = records[i].displayValues.get(allColumns[j].field) ?? records[i].values.get(allColumns[j].field);
                  csv += `${j > 0 ? "," : ""}"${ValueUtils.cleanForCsv(value)}"`;
               }
               csv += "\n";
            }

            const fileName = (data?.label ?? widgetMetaData.label) + " " + ValueUtils.formatDateTimeForFileName(new Date()) + ".csv";

            setCsv(csv);
            setFileName(fileName);
         }
      })();
   }, [JSON.stringify(data?.queryOutput)]);

   ///////////////////
   // view all link //
   ///////////////////
   const labelAdditionalElementsLeft: JSX.Element[] = [];
   if (data && data.viewAllLink)
   {
      labelAdditionalElementsLeft.push(
         <Typography key={"viewAllLink"} variant="body2" p={2} display="inline" fontSize=".875rem" pt="0" position="relative">
            <Link to={data.viewAllLink}>View All</Link>
         </Typography>
      );
   }

   ///////////////////
   // export button //
   ///////////////////
   let isExportDisabled = true;
   let tooltipTitle = "Export";
   if (data && childTableMetaData && data.queryOutput && data.queryOutput.records && data.queryOutput.records.length > 0)
   {
      isExportDisabled = false;

      if (data.totalRows && data.queryOutput.records.length < data.totalRows)
      {
         tooltipTitle = "Export these " + data.queryOutput.records.length + " records.";
         if (data.viewAllLink)
         {
            tooltipTitle += "\nClick View All to export all records.";
         }
      }
   }

   const onExportClick = () =>
   {
      if (csv)
      {
         HtmlUtils.download(fileName, csv);
      }
      else
      {
         alert("There is no data available to export.");
      }
   };

   if (widgetMetaData?.showExportButton)
   {
      labelAdditionalElementsLeft.push(
         <Typography key={"exportButton"} variant="body2" px={0} display="inline" position="relative">
            <Tooltip title={tooltipTitle}><span><Button sx={{px: 1, py: 0, minWidth: "initial"}} onClick={onExportClick} disabled={isExportDisabled}><Icon sx={{color: "#757575", fontSize: 1.25}}>save_alt</Icon></Button></span></Tooltip>
         </Typography>
      );
   }

   ////////////////////
   // add new button //
   ////////////////////
   const labelAdditionalComponentsRight: LabelComponent[] = [];
   if (data && data.canAddChildRecord)
   {
      let disabledFields = data.disabledFieldsForNewChildRecords;
      if (!disabledFields)
      {
         disabledFields = data.defaultValuesForNewChildRecords;
      }

      const defaultValuesForNewChildRecords = data.defaultValuesForNewChildRecords || {};

      ///////////////////////////////////////////////////////////////////////////////////////
      // copy values from specified fields in the parent record down into the child record //
      ///////////////////////////////////////////////////////////////////////////////////////
      if (data.defaultValuesForNewChildRecordsFromParentFields)
      {
         for (let childField in data.defaultValuesForNewChildRecordsFromParentFields)
         {
            const parentField = data.defaultValuesForNewChildRecordsFromParentFields[childField];
            defaultValuesForNewChildRecords[childField] = parentRecord?.values?.get(parentField);
         }
      }

      labelAdditionalComponentsRight.push(new AddNewRecordButton(getTableMetaDataFromWidgetData(data), defaultValuesForNewChildRecords, "Add new", disabledFields, addNewRecordCallback));
   }


   /////////////////////////////////////////////////////////////////
   // if a grid preference window is open, ignore and reset timer //
   /////////////////////////////////////////////////////////////////
   const handleRowClick = (params: GridRowParams, event: MuiEvent<React.MouseEvent>, details: GridCallbackDetails) =>
   {
      if (disableRowClick)
      {
         return;
      }

      (async () =>
      {
         const qInstance = await qController.loadMetaData();
         let tablePath = qInstance.getTablePathByName(childTableMetaData?.name);
         if (tablePath)
         {
            tablePath = `${tablePath}/${params.row[childTableMetaData.primaryKeyField]}`;
            DataGridUtils.handleRowClick(tablePath, event, gridMouseDownX, gridMouseDownY, navigate, instance);
         }
      })();
   };

   /*******************************************************************************
    ** So that we can useGridApiContext to add event handlers for mouse down and
    ** row double-click (to make it so you don't accidentally click into records),
    ** we have to define a grid component, so even though we don't want a custom
    ** toolbar, that's why we have this (and why it returns empty)
    *******************************************************************************/
   function CustomToolbar()
   {
      const handleMouseDown: GridEventListener<"cellMouseDown"> = (params, event, details) =>
      {
         setGridMouseDownX(event.clientX);
         setGridMouseDownY(event.clientY);
         clearTimeout(instance.current.timer);
      };

      const handleDoubleClick: GridEventListener<"rowDoubleClick"> = (event: any) =>
      {
         clearTimeout(instance.current.timer);
      };

      const apiRef = useGridApiContext();
      useGridApiEventHandler(apiRef, "cellMouseDown", handleMouseDown);
      useGridApiEventHandler(apiRef, "rowDoubleClick", handleDoubleClick);

      return (<GridToolbarContainer />);
   }

   let containerPadding = -3;
   if (data?.isInProcess)
   {
      containerPadding = 0;
   }


   const grid = (
      <DataGridPro
         autoHeight
         sx={{
            borderBottom: "none",
            borderLeft: "none",
            borderRight: "none"
         }}
         rows={rows}
         disableSelectionOnClick
         columns={columns}
         rowBuffer={10}
         getRowClassName={(params) => (params.indexRelativeToCurrentPage % 2 === 0 ? "even" : "odd")}
         onRowClick={handleRowClick}
         getRowId={(row) => row.__rowIndex}
         // getRowHeight={() => "auto"} // maybe nice?  wraps values in cells...
         components={{
            Toolbar: CustomToolbar
         }}
         // pinnedColumns={pinnedColumns}
         // onPinnedColumnsChange={handlePinnedColumnsChange}
         // pagination
         // paginationMode="server"
         // rowsPerPageOptions={[20]}
         // sortingMode="server"
         // filterMode="server"
         // page={pageNumber}
         // checkboxSelection
         rowCount={data && data.totalRows}
         // onPageSizeChange={handleRowsPerPageChange}
         // onStateChange={handleStateChange}
         density={gridDensity ?? "standard"}
         // loading={loading}
         // filterModel={filterModel}
         // onFilterModelChange={handleFilterChange}
         // columnVisibilityModel={columnVisibilityModel}
         // onColumnVisibilityModelChange={handleColumnVisibilityChange}
         // onColumnOrderChange={handleColumnOrderChange}
         // onSelectionModelChange={selectionChanged}
         // onSortModelChange={handleSortChange}
         // sortingOrder={[ "asc", "desc" ]}
         // sortModel={columnSortModel}
      />
   );

   if (gridOnly)
   {
      return (grid);
   }

   return (
      <Widget
         widgetMetaData={widgetMetaData}
         widgetData={data}
         labelAdditionalElementsLeft={labelAdditionalElementsLeft}
         labelAdditionalComponentsRight={labelAdditionalComponentsRight}
         labelBoxAdditionalSx={{position: "relative", top: "-0.375rem"}}
      >
         <Box mx={containerPadding} mb={containerPadding}>
            <Box>
               {grid}
            </Box>
         </Box>
      </Widget>
   );
}

export default RecordGridWidget;
