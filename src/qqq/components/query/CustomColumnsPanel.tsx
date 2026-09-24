/*
 * QQQ - Low-code Application Framework for Engineers.
 * Copyright (C) 2021-2023.  Kingsrook, LLC
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

import {QInstance} from "@qrunio/qqq-frontend-core/lib/model/metaData/QInstance";
import {QTableMetaData} from "@qrunio/qqq-frontend-core/lib/model/metaData/QTableMetaData";

import {FormControlLabel, FormGroup} from "@mui/material";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Icon from "@mui/material/Icon";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";
import {GridColDef, GridSlotsComponentsProps, useGridApiContext, useGridSelector} from "@mui/x-data-grid-pro";
import {GridColumnsPanelProps} from "@mui/x-data-grid/components/panel/GridColumnsPanel";
import {gridColumnDefinitionsSelector, gridColumnVisibilityModelSelector} from "@mui/x-data-grid/hooks/features/columns/gridColumnsSelector";
import TableUtils from "qqq/utils/qqq/TableUtils";
import React, {createRef, forwardRef, useEffect, useReducer, useRef, useState} from "react";

declare module "@mui/x-data-grid"
{
   interface ColumnsPanelPropsOverrides
   {
      tableMetaData: QTableMetaData;
      metaData: QInstance;
      initialOpenedGroups: { [name: string]: boolean };
      openGroupsChanger: (openedGroups: { [name: string]: boolean }) => void;
      initialFilterText: string;
      filterTextChanger: (filterText: string) => void;
   }
}

export const CustomColumnsPanel = forwardRef<any, GridColumnsPanelProps>(
   function MyCustomColumnsPanel(props: GridSlotsComponentsProps["columnsPanel"], ref)
   {
      const apiRef = useGridApiContext();
      const columns = useGridSelector(apiRef, gridColumnDefinitionsSelector);
      const columnVisibilityModel = useGridSelector(apiRef, gridColumnVisibilityModelSelector);
      const [, forceUpdate] = useReducer((x) => x + 1, 0);
      const someRef = createRef();

      const textRef = useRef(null);
      const [didInitialFocus, setDidInitialFocus] = useState(false);

      const [openGroups, setOpenGroups] = useState(props.initialOpenedGroups || {});
      const openGroupsBecauseOfFilter = {} as { [name: string]: boolean };
      const [lastScrollTop, setLastScrollTop] = useState(0);
      const [filterText, setFilterText] = useState(props.initialFilterText);

      /////////////////////////////////////////////////////////////////////
      // set up the list of tables - e.g., main table plus exposed joins //
      /////////////////////////////////////////////////////////////////////
      const tables: QTableMetaData[] = [];
      tables.push(props.tableMetaData);

      console.log(`Open groups: ${JSON.stringify(openGroups)}`);

      if (!didInitialFocus)
      {
         if (textRef.current)
         {
            textRef.current.select();
            setDidInitialFocus(true);
         }
      }

      if (props.tableMetaData.exposedJoins)
      {
         for (const exposedJoin of TableUtils.getReadableExposedJoins(props.tableMetaData, props.metaData))
         {
            if (props.metaData.tables.has(exposedJoin.joinTable.name))
            {
               tables.push(exposedJoin.joinTable);
            }
         }
      }

      const isCheckboxColumn = (column: GridColDef): boolean =>
      {
         return (column.headerName == "Checkbox selection");
      };

      const doesColumnMatchFilterText = (column: GridColDef): boolean =>
      {
         if (isCheckboxColumn(column))
         {
            //////////////////////////////////////////
            // let's never show the checkbox column //
            //////////////////////////////////////////
            return (false);
         }

         if (filterText == "")
         {
            return (true);
         }

         const columnLabelMinusTable = column.headerName.replace(/.*: /, "");
         if (columnLabelMinusTable.toLowerCase().startsWith(filterText.toLowerCase()))
         {
            return (true);
         }

         try
         {
            ////////////////////////////////////////////////////////////
            // try to match word-boundary followed by the filter text //
            // e.g., "name" would match "First Name" or "Last Name"   //
            ////////////////////////////////////////////////////////////
            const re = new RegExp("\\b" + filterText.toLowerCase());
            if (columnLabelMinusTable.toLowerCase().match(re))
            {
               return (true);
            }
         }
         catch (e)
         {
            //////////////////////////////////////////////////////////////////////////////////
            // in case text is an invalid regex... well, at least do a starts-with match... //
            //////////////////////////////////////////////////////////////////////////////////
            if (columnLabelMinusTable.toLowerCase().startsWith(filterText.toLowerCase()))
            {
               return (true);
            }
         }

         const tableLabel = column.headerName.replace(/:.*/, "");
         if (tableLabel)
         {
            try
            {
               ////////////////////////////////////////////////////////////
               // try to match word-boundary followed by the filter text //
               // e.g., "name" would match "First Name" or "Last Name"   //
               ////////////////////////////////////////////////////////////
               const re = new RegExp("\\b" + filterText.toLowerCase());
               if (tableLabel.toLowerCase().match(re))
               {
                  return (true);
               }
            }
            catch (e)
            {
               //////////////////////////////////////////////////////////////////////////////////
               // in case text is an invalid regex... well, at least do a starts-with match... //
               //////////////////////////////////////////////////////////////////////////////////
               if (tableLabel.toLowerCase().startsWith(filterText.toLowerCase()))
               {
                  return (true);
               }
            }
         }

         return (false);
      };

      ///////////////////////////////////////////////////////////////////////////////
      // build the map of list of fields, plus counts of columns & visible columns //
      ///////////////////////////////////////////////////////////////////////////////
      const tableFields: { [tableName: string]: GridColDef[] } = {};
      const noOfColumnsByTable: { [name: string]: number } = {};
      const noOfVisibleColumnsByTable: { [name: string]: number } = {};

      for (let i = 0; i < tables.length; i++)
      {
         const tableName = tables[i].name;
         tableFields[tableName] = [];
         noOfColumnsByTable[tableName] = 0;
         noOfVisibleColumnsByTable[tableName] = 0;
      }

      ///////////////////////////////////////////////////////////////////////////////////////////////////////
      // always sort columns by label.  note, in future may offer different sorts - here's where to do it. //
      ///////////////////////////////////////////////////////////////////////////////////////////////////////
      const sortedColumns = [...columns];
      sortedColumns.sort((a, b): number =>
      {
         return a.headerName.localeCompare(b.headerName);
      });

      for (let i = 0; i < sortedColumns.length; i++)
      {
         const column = sortedColumns[i];
         if (isCheckboxColumn(column))
         {
            ////////////////////////////////////////////////////////////////
            // don't count the checkbox or put it in the list for display //
            ////////////////////////////////////////////////////////////////
            continue;
         }

         let tableName = props.tableMetaData.name;
         const fieldName = column.field;
         if (fieldName.indexOf(".") > -1)
         {
            tableName = fieldName.split(".", 2)[0];
         }

         tableFields[tableName].push(column);

         if (doesColumnMatchFilterText(column))
         {
            noOfColumnsByTable[tableName]++;
            if (columnVisibilityModel[column.field] !== false)
            {
               noOfVisibleColumnsByTable[tableName]++;
            }
         }

         if (filterText != "")
         {
            ///////////////////////////////////////////////////////////////////////////////////////////
            // if there's a filter, then force open any groups (tables) with a field that matches it //
            ///////////////////////////////////////////////////////////////////////////////////////////
            if (doesColumnMatchFilterText(column))
            {
               openGroupsBecauseOfFilter[tableName] = true;
            }
         }
      }

      useEffect(() =>
      {
         if (someRef && someRef.current)
         {
            console.log(`Trying to set scroll top to: ${lastScrollTop}`);
            // @ts-ignore
            someRef.current.scrollTop = lastScrollTop;
         }
      }, [lastScrollTop]);

      /*******************************************************************************
       ** event handler for toggling the open/closed status of a group (table)
       *******************************************************************************/
      const toggleColumnGroupOpen = (groupName: string) =>
      {
         /////////////////////////////////////////////////////////////
         // if there's a filter, we don't do the normal toggling... //
         /////////////////////////////////////////////////////////////
         if (filterText != "")
         {
            return;
         }

         openGroups[groupName] = !!!openGroups[groupName];

         const newOpenGroups = JSON.parse(JSON.stringify(openGroups));
         setOpenGroups(newOpenGroups);
         props.openGroupsChanger(newOpenGroups);

         forceUpdate();
      };

      /*******************************************************************************
       ** event handler for toggling visibility state of one column
       *******************************************************************************/
      const onColumnVisibilityChange = (fieldName: string) =>
      {
         // @ts-ignore
         setLastScrollTop(someRef.current.scrollTop);

         apiRef.current.setColumnVisibility(fieldName, columnVisibilityModel[fieldName] === false);
      };

      /*******************************************************************************
       ** event handler for clicking table-visibility switch
       *******************************************************************************/
      const onTableVisibilityClick = (event: React.MouseEvent<HTMLButtonElement>, tableName: string) =>
      {
         event.stopPropagation();

         // @ts-ignore
         setLastScrollTop(someRef.current.scrollTop);

         let newValue = true;
         if (noOfVisibleColumnsByTable[tableName] == noOfColumnsByTable[tableName])
         {
            newValue = false;
         }

         for (let i = 0; i < columns.length; i++)
         {
            const column = columns[i];
            if (isCheckboxColumn(column))
            {
               /////////////////////////////////
               // never turn the checkbox off //
               /////////////////////////////////
               columnVisibilityModel[column.field] = true;
            }
            else
            {
               const fieldName = column.field;
               if (fieldName.indexOf(".") > -1)
               {
                  if (tableName === fieldName.split(".", 2)[0] && doesColumnMatchFilterText(column))
                  {
                     columnVisibilityModel[fieldName] = newValue;
                  }
               }
               else if (tableName == props.tableMetaData.name && doesColumnMatchFilterText(column))
               {
                  columnVisibilityModel[fieldName] = newValue;
               }
            }
         }

         //////////////////////////////////////////////////////////////////////////////
         // not too sure what this is doing... kinda got it from toggleAllColumns in //
         // ./@mui/x-data-grid/components/panel/GridColumnsPanel.js                  //
         //////////////////////////////////////////////////////////////////////////////
         const currentModel = gridColumnVisibilityModelSelector(apiRef);
         const newModel = JSON.parse(JSON.stringify(currentModel));
         apiRef.current.setColumnVisibilityModel(newModel);
      };

      /*******************************************************************************
       ** event handler for reset button - turn on only all columns from main table
       *******************************************************************************/
      const resetClicked = () =>
      {
         // @ts-ignore
         setLastScrollTop(someRef.current.scrollTop);

         for (let i = 0; i < columns.length; i++)
         {
            const column = columns[i];
            const fieldName = column.field;
            if (fieldName.indexOf(".") > -1)
            {
               columnVisibilityModel[fieldName] = false;
            }
            else
            {
               columnVisibilityModel[fieldName] = true;
            }
         }

         const currentModel = gridColumnVisibilityModelSelector(apiRef);
         const newModel = JSON.parse(JSON.stringify(currentModel));
         apiRef.current.setColumnVisibilityModel(newModel);
      };

      const changeFilterText = (newValue: string) =>
      {
         setFilterText(newValue);
         props.filterTextChanger(newValue);
      };

      const filterTextChanged = (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) =>
      {
         changeFilterText(event.target.value);
      };

      return (
         <Box className="custom-columns-panel" style={{width: "350px", height: "450px"}}>
            <Box height="55px" padding="5px" display="flex">
               <TextField inputRef={textRef} id="findColumn" label="Find column" placeholder="Column title" variant="standard" fullWidth={true}
                  value={filterText}
                  onChange={(event) => filterTextChanged(event)}
               ></TextField>
               {
                  filterText != "" && <IconButton sx={{position: "absolute", right: "0", top: "1rem"}} onClick={() =>
                  {
                     changeFilterText("");
                     document.getElementById("findColumn").focus();
                  }}><Icon fontSize="small">close</Icon></IconButton>
               }
            </Box>
            <Box ref={someRef} overflow="auto" height="calc( 100% - 105px )">

               <Stack direction="column" spacing={1} pl="0.5rem">
                  <FormGroup>
                     {tables.map((table: QTableMetaData) =>
                        (
                           <React.Fragment key={table.name}>
                              <IconButton
                                 key={table.name}
                                 size="small"
                                 onClick={() => toggleColumnGroupOpen(table.name)}
                                 sx={{width: "100%", justifyContent: "flex-start", fontSize: "0.875rem", pt: 0.5}}
                                 disableRipple={true}
                              >
                                 <Icon>{filterText != "" ? "horizontal_rule" : openGroups[table.name] ? "expand_more" : "expand_less"}</Icon>
                                 <Box pl={"4px"} position="relative" top="-2px">
                                    <Switch
                                       checked={noOfVisibleColumnsByTable[table.name] == noOfColumnsByTable[table.name] && noOfVisibleColumnsByTable[table.name] > 0}
                                       onClick={(event) => onTableVisibilityClick(event, table.name)}
                                       size="small" />
                                 </Box>
                                 <Box sx={{pl: "0.125rem", fontWeight: "bold"}} textAlign="left">
                                    {table.label} fields&nbsp;
                                    <Box display="inline" fontWeight="200">({noOfVisibleColumnsByTable[table.name]} / {noOfColumnsByTable[table.name]})</Box>
                                 </Box>
                              </IconButton>

                              {(openGroups[table.name] || openGroupsBecauseOfFilter[table.name]) && tableFields[table.name].map((gridColumn: any) =>
                              {
                                 if (doesColumnMatchFilterText(gridColumn))
                                 {
                                    return (
                                       <Box key={gridColumn.field} pl={6}>
                                          <FormControlLabel
                                             sx={{fontWeight: "500 !important", display: "flex", paddingBottom: "0.25rem", alignItems: "flex-start"}}
                                             control={<Switch
                                                checked={columnVisibilityModel[gridColumn.field] !== false}
                                                onChange={() => onColumnVisibilityChange(gridColumn.field)}
                                                size="small" />}
                                             label={<Box pt="0.25rem" lineHeight="1.4">{gridColumn.headerName.replace(/.*: /, "")}</Box>} />
                                       </Box>
                                    );
                                 }
                              }
                              )}
                           </React.Fragment>
                        ))}
                  </FormGroup>
               </Stack>
            </Box>
            <Box height="50px" padding="5px" display="flex" justifyContent="space-between">
               <Button onClick={resetClicked}>Reset</Button>
            </Box>
         </Box>
      );
   }
);

