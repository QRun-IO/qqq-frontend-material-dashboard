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

import {QExposedJoin} from "@qrunio/qqq-frontend-core/lib/model/metaData/QExposedJoin";
import {QFieldMetaData} from "@qrunio/qqq-frontend-core/lib/model/metaData/QFieldMetaData";
import {QTableMetaData} from "@qrunio/qqq-frontend-core/lib/model/metaData/QTableMetaData";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import FormControlLabel from "@mui/material/FormControlLabel";
import Icon from "@mui/material/Icon";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List/List";
import ListItem, {ListItemProps} from "@mui/material/ListItem/ListItem";
import Menu from "@mui/material/Menu";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";
import React, {useMemo, useState} from "react";

interface FieldListMenuProps
{
   idPrefix: string,
   heading?: string,
   placeholder?: string,
   tableMetaData: QTableMetaData,
   showTableHeaderEvenIfNoExposedJoins: boolean,
   fieldNamesToHide?: string[],
   buttonProps: any,
   buttonChildren: JSX.Element | string,
   isModeSelectOne?: boolean,
   handleSelectedField?: (field: QFieldMetaData, table: QTableMetaData) => void,
   isModeToggle?: boolean,
   toggleStates?: { [fieldName: string]: boolean },
   handleToggleField?: (field: QFieldMetaData, table: QTableMetaData, newValue: boolean) => void,
   fieldEndAdornment?: JSX.Element,
   handleAdornmentClick?: (field: QFieldMetaData, table: QTableMetaData, event: React.MouseEvent<any>) => void,
   omitExposedJoins?: string[]
}

FieldListMenu.defaultProps = {
   showTableHeaderEvenIfNoExposedJoins: false,
   isModeSelectOne: false,
   isModeToggle: false,
};

interface TableWithFields
{
   table?: QTableMetaData;
   fields: QFieldMetaData[];
}

/*******************************************************************************
 ** Component to render a list of fields from a table (and its join tables)
 ** which can be interacted with...
 *******************************************************************************/
export default function FieldListMenu({idPrefix, heading, placeholder, tableMetaData, showTableHeaderEvenIfNoExposedJoins, buttonProps, buttonChildren, isModeSelectOne, fieldNamesToHide, handleSelectedField, isModeToggle, toggleStates, handleToggleField, fieldEndAdornment, handleAdornmentClick, omitExposedJoins}: FieldListMenuProps): JSX.Element
{
   const [menuAnchorElement, setMenuAnchorElement] = useState(null);
   const [searchText, setSearchText] = useState("");
   const [focusedIndex, setFocusedIndex] = useState(null as number);

   const [fieldsByTable, setFieldsByTable] = useState([] as TableWithFields[]);
   const [collapsedTables, setCollapsedTables] = useState({} as { [tableName: string]: boolean });

   const [lastMouseOverXY, setLastMouseOverXY] = useState({x: 0, y: 0});
   const [timeOfLastArrow, setTimeOfLastArrow] = useState(0);

   const availableExposedJoins = useMemo(() =>
   {
      const rs: QExposedJoin[] = []
      for(let exposedJoin of tableMetaData.exposedJoins ?? [])
      {
         if(omitExposedJoins?.indexOf(exposedJoin.joinTable.name) > -1)
         {
            continue;
         }
         rs.push(exposedJoin);
      }
      return (rs);
   }, [tableMetaData, omitExposedJoins]);

   //////////////////
   // check usages //
   //////////////////
   if (isModeSelectOne)
   {
      if (!handleSelectedField)
      {
         throw ("In FieldListMenu, if isModeSelectOne=true, then a callback for handleSelectedField must be provided.");
      }
   }

   if (isModeToggle)
   {
      if (!toggleStates)
      {
         throw ("In FieldListMenu, if isModeToggle=true, then a model for toggleStates must be provided.");
      }
      if (!handleToggleField)
      {
         throw ("In FieldListMenu, if isModeToggle=true, then a callback for handleToggleField must be provided.");
      }
   }

   /////////////////////
   // init some stuff //
   /////////////////////
   if (fieldsByTable.length == 0)
   {
      collapsedTables[tableMetaData.name] = false;

      if (availableExposedJoins?.length > 0)
      {
         /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
         // if we have exposed joins, put the table meta data with its fields, and then all of the join tables & fields too //
         /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
         fieldsByTable.push({table: tableMetaData, fields: getTableFieldsAsAlphabeticalArray(tableMetaData)});

         for (let i = 0; i < availableExposedJoins?.length; i++)
         {
            const joinTable = availableExposedJoins[i].joinTable;
            fieldsByTable.push({table: joinTable, fields: getTableFieldsAsAlphabeticalArray(joinTable)});

            collapsedTables[joinTable.name] = false;
         }
      }
      else
      {
         ///////////////////////////////////////////////////////////
         // no exposed joins - just the table (w/o its meta-data) //
         ///////////////////////////////////////////////////////////
         fieldsByTable.push({fields: getTableFieldsAsAlphabeticalArray(tableMetaData)});
      }

      setFieldsByTable(fieldsByTable);
      setCollapsedTables(collapsedTables);
   }


   /*******************************************************************************
    **
    *******************************************************************************/
   function getTableFieldsAsAlphabeticalArray(table: QTableMetaData): QFieldMetaData[]
   {
      const fields: QFieldMetaData[] = [];
      table.fields.forEach(field =>
      {
         let fullFieldName = field.name;
         if (table.name != tableMetaData.name)
         {
            fullFieldName = `${table.name}.${field.name}`;
         }

         if (fieldNamesToHide && fieldNamesToHide.indexOf(fullFieldName) > -1)
         {
            return;
         }
         fields.push(field);
      });
      fields.sort((a, b) => a.label.localeCompare(b.label));
      return (fields);
   }

   const fieldsByTableToShow: TableWithFields[] = [];
   let maxFieldIndex = 0;
   fieldsByTable.forEach((tableWithFields) =>
   {
      let fieldsToShowForThisTable = tableWithFields.fields.filter(doesFieldMatchSearchText);
      if (fieldsToShowForThisTable.length > 0)
      {
         fieldsByTableToShow.push({table: tableWithFields.table, fields: fieldsToShowForThisTable});
         maxFieldIndex += fieldsToShowForThisTable.length;
      }
   });


   /*******************************************************************************
    **
    *******************************************************************************/
   function getShownFieldAndTableByIndex(targetIndex: number): { field: QFieldMetaData, table: QTableMetaData }
   {
      let index = -1;
      for (let i = 0; i < fieldsByTableToShow.length; i++)
      {
         const tableWithField = fieldsByTableToShow[i];
         for (let j = 0; j < tableWithField.fields.length; j++)
         {
            index++;

            if (index == targetIndex)
            {
               return {field: tableWithField.fields[j], table: tableWithField.table};
            }
         }
      }

      return (null);
   }


   /*******************************************************************************
    ** event handler for keys presses
    *******************************************************************************/
   function keyDown(event: any)
   {
      // console.log(`Event key: ${event.key}`);
      setTimeout(() => document.getElementById(`field-list-dropdown-${idPrefix}-textField`).focus());

      if (isModeSelectOne && event.key == "Enter" && focusedIndex != null)
      {
         setTimeout(() =>
         {
            event.stopPropagation();
            closeMenu();

            const {field, table} = getShownFieldAndTableByIndex(focusedIndex);
            if (field)
            {
               handleSelectedField(field, table ?? tableMetaData);
            }
         });
         return;
      }

      const keyOffsetMap: { [key: string]: number } = {
         "End": 10000,
         "Home": -10000,
         "ArrowDown": 1,
         "ArrowUp": -1,
         "PageDown": 5,
         "PageUp": -5,
      };

      const offset = keyOffsetMap[event.key];
      if (offset)
      {
         event.stopPropagation();
         setTimeOfLastArrow(new Date().getTime());

         if (isModeSelectOne)
         {
            let startIndex = focusedIndex;
            if (offset > 0)
            {
               /////////////////
               // a down move //
               /////////////////
               if (startIndex == null)
               {
                  startIndex = -1;
               }

               let goalIndex = startIndex + offset;
               if (goalIndex > maxFieldIndex - 1)
               {
                  goalIndex = maxFieldIndex - 1;
               }

               doSetFocusedIndex(goalIndex, true);
            }
            else
            {
               ////////////////
               // an up move //
               ////////////////
               let goalIndex = startIndex + offset;
               if (goalIndex < 0)
               {
                  goalIndex = 0;
               }

               doSetFocusedIndex(goalIndex, true);
            }
         }
      }
   }


   /*******************************************************************************
    **
    *******************************************************************************/
   function doSetFocusedIndex(i: number, tryToScrollIntoView: boolean): void
   {
      if (isModeSelectOne)
      {
         setFocusedIndex(i);
         console.log(`Setting index to ${i}`);

         if (tryToScrollIntoView)
         {
            const element = document.getElementById(`field-list-dropdown-${idPrefix}-${i}`);
            element?.scrollIntoView({block: "center"});
         }
      }
   }


   /*******************************************************************************
    **
    *******************************************************************************/
   function setFocusedField(field: QFieldMetaData, table: QTableMetaData, tryToScrollIntoView: boolean)
   {
      let index = -1;
      for (let i = 0; i < fieldsByTableToShow.length; i++)
      {
         const tableWithField = fieldsByTableToShow[i];
         for (let j = 0; j < tableWithField.fields.length; j++)
         {
            const loopField = tableWithField.fields[j];
            index++;

            const tableMatches = (table == null || table.name == tableWithField.table.name);
            if (tableMatches && field.name == loopField.name)
            {
               doSetFocusedIndex(index, tryToScrollIntoView);
               return;
            }
         }
      }
   }


   /*******************************************************************************
    ** event handler for mouse-over the menu
    *******************************************************************************/
   function handleMouseOver(event: React.MouseEvent<HTMLAnchorElement> | React.MouseEvent<HTMLDivElement> | React.MouseEvent<HTMLLIElement>, field: QFieldMetaData, table: QTableMetaData)
   {
      //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
      // so we're trying to fix the case where, if you put your mouse over an element, but then press up/down arrows,                                     //
      // where the mouse will become over a different element after the scroll, and the focus will follow the mouse instead of keyboard.                  //
      // the last x/y isn't really useful, because the mouse generally isn't left exactly where it was when the mouse-over happened (edge of the element) //
      // but the keyboard last-arrow time that we capture, that's what's actually being useful in here                                                    //
      //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
      if (event.clientX == lastMouseOverXY.x && event.clientY == lastMouseOverXY.y)
      {
         // console.log("mouse didn't move, so, doesn't count");
         return;
      }

      const now = new Date().getTime();
      // console.log(`Compare now [${now}] to last arrow [${timeOfLastArrow}] (diff: [${now - timeOfLastArrow}])`);
      if (now < timeOfLastArrow + 300)
      {
         // console.log("An arrow event happened less than 300 mills ago, so doesn't count.");
         return;
      }

      // console.log("yay, mouse over...");
      setFocusedField(field, table, false);
      setLastMouseOverXY({x: event.clientX, y: event.clientY});
   }


   /*******************************************************************************
    ** event handler for text input changes
    *******************************************************************************/
   function updateSearch(event: React.ChangeEvent<HTMLInputElement>)
   {
      setSearchText(event?.target?.value ?? "");
      doSetFocusedIndex(0, true);
   }


   /*******************************************************************************
    **
    *******************************************************************************/
   function doesFieldMatchSearchText(field: QFieldMetaData): boolean
   {
      if (searchText == "")
      {
         return (true);
      }

      const columnLabelMinusTable = field.label.replace(/.*: /, "");
      if (columnLabelMinusTable.toLowerCase().startsWith(searchText.toLowerCase()))
      {
         return (true);
      }

      try
      {
         ////////////////////////////////////////////////////////////
         // try to match word-boundary followed by the filter text //
         // e.g., "name" would match "First Name" or "Last Name"   //
         ////////////////////////////////////////////////////////////
         const re = new RegExp("\\b" + searchText.toLowerCase());
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
         if (columnLabelMinusTable.toLowerCase().startsWith(searchText.toLowerCase()))
         {
            return (true);
         }
      }

      const tableLabel = field.label.replace(/:.*/, "");
      if (tableLabel)
      {
         try
         {
            ////////////////////////////////////////////////////////////
            // try to match word-boundary followed by the filter text //
            // e.g., "name" would match "First Name" or "Last Name"   //
            ////////////////////////////////////////////////////////////
            const re = new RegExp("\\b" + searchText.toLowerCase());
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
            if (tableLabel.toLowerCase().startsWith(searchText.toLowerCase()))
            {
               return (true);
            }
         }
      }

      return (false);
   }


   /*******************************************************************************
    **
    *******************************************************************************/
   function openMenu(event: any)
   {
      setFocusedIndex(null);
      setMenuAnchorElement(event.currentTarget);
      setTimeout(() =>
      {
         document.getElementById(`field-list-dropdown-${idPrefix}-textField`).focus();
         doSetFocusedIndex(0, true);
      });
   }


   /*******************************************************************************
    **
    *******************************************************************************/
   function closeMenu()
   {
      setMenuAnchorElement(null);
   }


   /*******************************************************************************
    ** Event handler for toggling a field in toggle mode
    *******************************************************************************/
   function handleFieldToggle(event: React.ChangeEvent<HTMLInputElement>, field: QFieldMetaData, table: QTableMetaData)
   {
      event.stopPropagation();
      handleToggleField(field, table, event.target.checked);
   }


   /*******************************************************************************
    ** Event handler for toggling a table in toggle mode
    *******************************************************************************/
   function handleTableToggle(event: React.ChangeEvent<HTMLInputElement>, table: QTableMetaData)
   {
      event.stopPropagation();

      const fieldsList = [...table.fields.values()];
      for (let i = 0; i < fieldsList.length; i++)
      {
         const field = fieldsList[i];
         if (doesFieldMatchSearchText(field))
         {
            handleToggleField(field, table, event.target.checked);
         }
      }
   }


   /////////////////////////////////////////////////////////
   // compute the table-level toggle state & count values //
   /////////////////////////////////////////////////////////
   const tableToggleStates: { [tableName: string]: boolean } = {};
   const tableToggleCounts: { [tableName: string]: number } = {};

   if (isModeToggle)
   {
      const {allOn, count} = getTableToggleState(tableMetaData, true);
      tableToggleStates[tableMetaData.name] = allOn;
      tableToggleCounts[tableMetaData.name] = count;

      for (let i = 0; i < availableExposedJoins?.length; i++)
      {
         const join = availableExposedJoins[i];
         const {allOn, count} = getTableToggleState(join.joinTable, false);
         tableToggleStates[join.joinTable.name] = allOn;
         tableToggleCounts[join.joinTable.name] = count;
      }
   }


   /*******************************************************************************
    **
    *******************************************************************************/
   function getTableToggleState(table: QTableMetaData, isMainTable: boolean): { allOn: boolean, count: number }
   {
      const fieldsList = [...table.fields.values()];
      let allOn = true;
      let count = 0;
      for (let i = 0; i < fieldsList.length; i++)
      {
         const field = fieldsList[i];
         const name = isMainTable ? field.name : `${table.name}.${field.name}`;
         if (!toggleStates[name])
         {
            allOn = false;
         }
         else
         {
            count++;
         }
      }

      return ({allOn: allOn, count: count});
   }


   /*******************************************************************************
    **
    *******************************************************************************/
   function toggleCollapsedTable(tableName: string)
   {
      collapsedTables[tableName] = !collapsedTables[tableName];
      setCollapsedTables(Object.assign({}, collapsedTables));
   }


   /*******************************************************************************
    **
    *******************************************************************************/
   function doHandleAdornmentClick(field: QFieldMetaData, table: QTableMetaData, event: React.MouseEvent<any>)
   {
      console.log("In doHandleAdornmentClick");
      closeMenu();
      handleAdornmentClick(field, table, event);
   }


   let index = -1;
   const textFieldId = `field-list-dropdown-${idPrefix}-textField`;
   let listItemPadding = isModeToggle ? "0.125rem" : "0.5rem";

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////////
   // for z-indexes, we set each table header to i+1, then the fields in that table to i (so they go behind it) //
   // then we increment i by 2 for the next table (so the next header goes above the previous header)           //
   // this fixes a thing where, if one table's name wrapped to 2 lines, then when the next table below it would //
   // come up, if it was only 1 line, then the second line from the previous one would bleed through.           //
   ///////////////////////////////////////////////////////////////////////////////////////////////////////////////
   let zIndex = 1;

   return (
      <>
         <Button onClick={openMenu} {...buttonProps}>
            {buttonChildren}
         </Button>
         <Menu
            anchorEl={menuAnchorElement}
            anchorOrigin={{vertical: "bottom", horizontal: "left"}}
            transformOrigin={{vertical: "top", horizontal: "left"}}
            open={menuAnchorElement != null}
            onClose={closeMenu}
            onKeyDown={keyDown} // this is added here so arrow-key-up/down events don't make the whole menu become "focused" (blue outline).  it works.
            keepMounted
         >
            <Box width={isModeToggle ? "305px" : "265px"} borderRadius={2} className={`fieldListMenuBody fieldListMenuBody-${idPrefix}`}>
               {
                  heading &&
                  <Box px={1} py={0.5} fontWeight={"700"}>
                     {heading}
                  </Box>
               }
               <Box p={1} pt={0.5}>
                  <TextField id={textFieldId} variant="outlined" placeholder={placeholder ?? "Search Fields"} fullWidth value={searchText} onChange={updateSearch} onKeyDown={keyDown} inputProps={{sx: {pr: "2rem"}}} />
                  {
                     searchText != "" && <IconButton sx={{position: "absolute", right: "0.5rem", top: "0.5rem"}} onClick={() =>
                     {
                        updateSearch(null);
                        document.getElementById(textFieldId).focus();
                     }}><Icon fontSize="small">close</Icon></IconButton>
                  }
               </Box>
               <Box maxHeight={"445px"} overflow="auto" mr={"-0.5rem"} sx={{scrollbarGutter: "stable"}}>
                  <List sx={{px: "0.5rem", cursor: "default"}}>
                     {
                        fieldsByTableToShow.map((tableWithFields) =>
                        {
                           let headerContents = null;
                           const headerTable = tableWithFields.table || tableMetaData;
                           if (tableWithFields.table || showTableHeaderEvenIfNoExposedJoins)
                           {
                              headerContents = (<b>{headerTable.label} Fields</b>);
                           }

                           if (isModeToggle)
                           {
                              headerContents = (<FormControlLabel
                                 sx={{display: "flex", alignItems: "flex-start", "& .MuiFormControlLabel-label": {lineHeight: "1.4", fontWeight: "500 !important"}}}
                                 control={<Switch
                                    size="small"
                                    sx={{top: "1px"}}
                                    checked={tableToggleStates[headerTable.name]}
                                    onChange={(event) => handleTableToggle(event, headerTable)}
                                 />}
                                 label={<span style={{marginTop: "0.25rem", display: "inline-block"}}><b>{headerTable.label} Fields</b>&nbsp;<span style={{fontWeight: 400}}>({tableToggleCounts[headerTable.name]})</span></span>} />);
                           }

                           if (isModeToggle)
                           {
                              headerContents = (
                                 <>
                                    <IconButton
                                       onClick={() => toggleCollapsedTable(headerTable.name)}
                                       sx={{justifyContent: "flex-start", fontSize: "0.875rem", pt: 0.5, pb: 0, mr: "0.25rem"}}
                                       disableRipple={true}
                                    >
                                       <Icon sx={{fontSize: "1.5rem !important", position: "relative", top: "2px"}}>{collapsedTables[headerTable.name] ? "expand_less" : "expand_more"}</Icon>
                                    </IconButton>
                                    {headerContents}
                                 </>
                              );
                           }

                           let marginLeft = "unset";
                           if (isModeToggle)
                           {
                              marginLeft = "-1rem";
                           }

                           zIndex += 2;

                           return (
                              <React.Fragment key={tableWithFields.table?.name ?? "theTable"}>
                                 <>
                                    {headerContents && <ListItem sx={{position: "sticky", top: -1, zIndex: zIndex + 1, padding: listItemPadding, ml: marginLeft, display: "flex", alignItems: "flex-start", backgroundImage: "linear-gradient(to bottom, rgba(255,255,255,1), rgba(255,255,255,1) 90%, rgba(255,255,255,0))"}}>{headerContents}</ListItem>}
                                    {
                                       tableWithFields.fields.map((field) =>
                                       {
                                          index++;
                                          const key = `${tableWithFields.table?.name}-${field.name}`;

                                          if (collapsedTables[headerTable.name])
                                          {
                                             return (<React.Fragment key={key} />);
                                          }

                                          let style = {};
                                          if (index == focusedIndex)
                                          {
                                             style = {backgroundColor: "#EFEFEF"};
                                          }

                                          const onClick: ListItemProps = {};
                                          if (isModeSelectOne)
                                          {
                                             onClick.onClick = () =>
                                             {
                                                closeMenu();
                                                handleSelectedField(field, tableWithFields.table ?? tableMetaData);
                                             };
                                          }

                                          let label: JSX.Element | string = field.label;
                                          const fullFieldName = tableWithFields.table && tableWithFields.table.name != tableMetaData.name ? `${tableWithFields.table.name}.${field.name}` : field.name;

                                          if (fieldEndAdornment)
                                          {
                                             label = <Box width="100%" display="inline-flex" justifyContent="space-between">
                                                {label}
                                                <Box onClick={(event) => doHandleAdornmentClick(field, tableWithFields.table, event)}>
                                                   {fieldEndAdornment}
                                                </Box>
                                             </Box>;
                                          }

                                          let contents = <>{label}</>;
                                          let paddingLeft = "0.5rem";

                                          if (isModeToggle)
                                          {
                                             contents = (<FormControlLabel
                                                sx={{display: "flex", alignItems: "flex-start", "& .MuiFormControlLabel-label": {lineHeight: "1.4", color: "#606060", fontWeight: "500 !important"}}}
                                                control={<Switch
                                                   size="small"
                                                   sx={{top: "-3px"}}
                                                   checked={toggleStates[fullFieldName]}
                                                   onChange={(event) => handleFieldToggle(event, field, tableWithFields.table)}
                                                />}
                                                label={label} />);
                                             paddingLeft = "2.5rem";
                                          }

                                          return <ListItem
                                             key={key}
                                             id={`field-list-dropdown-${idPrefix}-${index}`}
                                             sx={{color: "#757575", p: 1, borderRadius: ".5rem", padding: listItemPadding, pl: paddingLeft, scrollMarginTop: "3rem", zIndex: zIndex, background: "#FFFFFF", ...style}}
                                             onMouseOver={(event) => handleMouseOver(event, field, tableWithFields.table)}
                                             {...onClick}
                                          >{contents}</ListItem>;
                                       })
                                    }
                                 </>
                              </React.Fragment>
                           );
                        })
                     }
                     {
                        index == -1 && <ListItem sx={{p: "0.5rem"}}><i>No fields found.</i></ListItem>
                     }
                  </List>
               </Box>
            </Box>
         </Menu>
      </>
   );
}
