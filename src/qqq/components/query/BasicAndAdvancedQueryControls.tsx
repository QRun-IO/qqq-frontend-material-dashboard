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


import {QFieldMetaData} from "@qrunio/qqq-frontend-core/lib/model/metaData/QFieldMetaData";
import {QFieldType} from "@qrunio/qqq-frontend-core/lib/model/metaData/QFieldType";
import {QInstance} from "@qrunio/qqq-frontend-core/lib/model/metaData/QInstance";
import {QTableMetaData} from "@qrunio/qqq-frontend-core/lib/model/metaData/QTableMetaData";
import {QTableSection} from "@qrunio/qqq-frontend-core/lib/model/metaData/QTableSection";
import {QCriteriaOperator} from "@qrunio/qqq-frontend-core/lib/model/query/QCriteriaOperator";
import {QFilterCriteria} from "@qrunio/qqq-frontend-core/lib/model/query/QFilterCriteria";
import {QFilterOrderBy} from "@qrunio/qqq-frontend-core/lib/model/query/QFilterOrderBy";
import {QQueryFilter} from "@qrunio/qqq-frontend-core/lib/model/query/QQueryFilter";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Icon from "@mui/material/Icon";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Tooltip from "@mui/material/Tooltip";
import {GridApiPro} from "@mui/x-data-grid-pro/models/gridApiPro";
import QContext from "QContext";
import colors from "qqq/assets/theme/base/colors";
import {QCancelButton, QSaveButton} from "qqq/components/buttons/DefaultButtons";
import AdvancedQueryPreview from "qqq/components/query/AdvancedQueryPreview";
import {QFilterCriteriaWithId} from "qqq/components/query/CustomFilterPanel";
import FieldListMenu from "qqq/components/query/FieldListMenu";
import {validateCriteria} from "qqq/components/query/FilterCriteriaRow";
import QuickFilter, {quickFilterButtonStyles} from "qqq/components/query/QuickFilter";
import XIcon from "qqq/components/query/XIcon";
import {QueryScreenUsage} from "qqq/pages/records/query/RecordQuery";
import FilterUtils from "qqq/utils/qqq/FilterUtils";
import TableUtils from "qqq/utils/qqq/TableUtils";
import React, {forwardRef, useContext, useImperativeHandle, useReducer, useState} from "react";

interface BasicAndAdvancedQueryControlsProps
{
   metaData: QInstance;
   tableMetaData: QTableMetaData;

   savedViewsComponent: JSX.Element;
   columnMenuComponent: JSX.Element;

   quickFilterFieldNames: string[];
   setQuickFilterFieldNames: (names: string[]) => void;

   queryFilter: QQueryFilter;
   setQueryFilter: (queryFilter: QQueryFilter) => void;

   gridApiRef: React.MutableRefObject<GridApiPro>;

   /////////////////////////////////////////////////////////////////////////////////////////////
   // this prop is used as a way to recognize changes in the query filter internal structure, //
   // since the queryFilter object (reference) doesn't get updated                            //
   /////////////////////////////////////////////////////////////////////////////////////////////
   queryFilterJSON: string;

   queryScreenUsage: QueryScreenUsage;

   allowVariables?: boolean;

   mode: string;
   setMode: (mode: string) => void;

   omitExposedJoins?: string[];
}

let debounceTimeout: string | number | NodeJS.Timeout;


/*******************************************************************************
 ** function to generate an element that says how a filter is sorted.
 *******************************************************************************/
export function getCurrentSortIndicator(queryFilter: QQueryFilter, tableMetaData: QTableMetaData, toggleSortDirection: (event: React.MouseEvent<HTMLSpanElement, MouseEvent>) => void)
{
   if (queryFilter && queryFilter.orderBys && queryFilter.orderBys.length > 0)
   {
      const orderBy = queryFilter.orderBys[0];
      const orderByFieldName = orderBy.fieldName;
      const [field, fieldTable] = TableUtils.getFieldAndTable(tableMetaData, orderByFieldName);
      const fieldLabel = fieldTable.name == tableMetaData.name ? field.label : `${fieldTable.label}: ${field.label}`;
      return <>Sort: {fieldLabel} <Icon onClick={toggleSortDirection} sx={{ml: "0.5rem"}}>{orderBy.isAscending ? "arrow_upward" : "arrow_downward"}</Icon></>;
   }
   else
   {
      return <>Sort...</>;
   }
}

/*******************************************************************************
 ** Component to provide the basic & advanced query-filter controls for the
 ** RecordQueryOrig screen.
 **
 ** Done as a forwardRef, so RecordQueryOrig can call some functions, e.g., when user
 ** does things on that screen, that we need to know about in here.
 *******************************************************************************/
const BasicAndAdvancedQueryControls = forwardRef((props: BasicAndAdvancedQueryControlsProps, ref) =>
{
   const {metaData, tableMetaData, savedViewsComponent, columnMenuComponent, quickFilterFieldNames, setQuickFilterFieldNames, setQueryFilter, queryFilter, gridApiRef, queryFilterJSON, mode, setMode, queryScreenUsage} = props;

   /////////////////////
   // state variables //
   /////////////////////
   const [defaultQuickFilterFieldNames, setDefaultQuickFilterFieldNames] = useState(getDefaultQuickFilterFieldNames(tableMetaData));
   const [defaultQuickFilterFieldNameMap, setDefaultQuickFilterFieldNameMap] = useState(Object.fromEntries(defaultQuickFilterFieldNames.map(k => [k, true])));
   const [addQuickFilterMenu, setAddQuickFilterMenu] = useState(null);
   const [addQuickFilterOpenCounter, setAddQuickFilterOpenCounter] = useState(0);
   const [showClearFiltersWarning, setShowClearFiltersWarning] = useState(false);
   const [mouseOverElement, setMouseOverElement] = useState(null as string);
   const [, forceUpdate] = useReducer((x) => x + 1, 0);

   const {accentColor} = useContext(QContext);

   /////////////////////////////////////////////////
   // temporary, until we implement sub-filtering //
   /////////////////////////////////////////////////
   const [isQueryTooComplex, setIsQueryTooComplex] = useState(false);

   //////////////////////////////////////////////////////////////////////////////////
   // make some functions available to our parent - so it can tell us to do things //
   //////////////////////////////////////////////////////////////////////////////////
   useImperativeHandle(ref, () =>
   {
      return {
         ensureAllFilterCriteriaAreActiveQuickFilters(currentFilter: QQueryFilter, reason: string)
         {
            ensureAllFilterCriteriaAreActiveQuickFilters(tableMetaData, currentFilter, reason);
         },
         addField(fieldName: string)
         {
            addQuickFilterField({fieldName: fieldName}, "columnMenu");
         },
         getCurrentMode()
         {
            return (mode);
         }
      };
   });


   /*******************************************************************************
    **
    *******************************************************************************/
   function handleMouseOverElement(name: string)
   {
      setMouseOverElement(name);
   }


   /*******************************************************************************
    **
    *******************************************************************************/
   function handleMouseOutElement()
   {
      setMouseOverElement(null);
   }


   /*******************************************************************************
    ** for a given field, set its default operator for quick-filter dropdowns.
    *******************************************************************************/
   function getDefaultOperatorForField(field: QFieldMetaData)
   {
      // todo - sometimes i want contains instead of equals on strings (client.name, for example...)
      let defaultOperator = field?.possibleValueSourceName ? QCriteriaOperator.IN : QCriteriaOperator.EQUALS;
      if (field?.type == QFieldType.DATE_TIME)
      {
         defaultOperator = QCriteriaOperator.GREATER_THAN;
      }
      else if (field?.type == QFieldType.BOOLEAN)
      {
         /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
         // for booleans, if we set a default, since none of them have values, then they are ALWAYS selected, which isn't what we want. //
         /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
         defaultOperator = null;
      }
      return defaultOperator;
   }


   /*******************************************************************************
    ** Callback passed into the QuickFilter component, to update the criteria
    ** after user makes changes to it or to clear it out.
    *******************************************************************************/
   const updateQuickCriteria = (newCriteria: QFilterCriteria, needDebounce = false, doClearCriteria = false) =>
   {
      let found = false;
      let foundIndex = null;
      for (let i = 0; i < queryFilter?.criteria?.length; i++)
      {
         if (queryFilter.criteria[i].fieldName == newCriteria.fieldName)
         {
            queryFilter.criteria[i] = newCriteria;
            found = true;
            foundIndex = i;
            break;
         }
      }

      if (doClearCriteria)
      {
         if (found)
         {
            queryFilter.criteria.splice(foundIndex, 1);
            setQueryFilter(queryFilter);
         }
         return;
      }

      if (!found)
      {
         if (!queryFilter.criteria)
         {
            queryFilter.criteria = [];
         }
         queryFilter.criteria.push(newCriteria);
         found = true;
      }

      if (found)
      {
         clearTimeout(debounceTimeout);
         debounceTimeout = setTimeout(() =>
         {
            setQueryFilter(queryFilter);
         }, needDebounce ? 500 : 1);

         forceUpdate();
      }
   };


   /*******************************************************************************
    ** Get the QFilterCriteriaWithId object to pass in to the QuickFilter component
    ** for a given field name.
    *******************************************************************************/
   const getQuickCriteriaParam = (fieldName: string): QFilterCriteriaWithId | null | "tooComplex" =>
   {
      const matches: QFilterCriteriaWithId[] = [];
      for (let i = 0; i < queryFilter?.criteria?.length; i++)
      {
         if (queryFilter.criteria[i].fieldName == fieldName)
         {
            matches.push(queryFilter.criteria[i] as QFilterCriteriaWithId);
         }
      }

      if (matches.length == 0)
      {
         return (null);
      }
      else if (matches.length == 1)
      {
         return (matches[0]);
      }
      else
      {
         return "tooComplex";
      }
   };


   /*******************************************************************************
    ** Event handler for QuickFilter component, to remove a quick filter field from
    ** the screen.
    *******************************************************************************/
   const handleRemoveQuickFilterField = (fieldName: string): void =>
   {
      const index = quickFilterFieldNames.indexOf(fieldName);
      if (index >= 0)
      {
         //////////////////////////////////////
         // remove this field from the query //
         //////////////////////////////////////
         const criteria = new QFilterCriteria(fieldName, null, []);
         updateQuickCriteria(criteria, false, true);

         quickFilterFieldNames.splice(index, 1);
         setQuickFilterFieldNames(quickFilterFieldNames);
      }
   };


   /*******************************************************************************
    ** Event handler for button that opens the add-quick-filter menu
    *******************************************************************************/
   const openAddQuickFilterMenu = (event: any) =>
   {
      setAddQuickFilterMenu(event.currentTarget);
      setAddQuickFilterOpenCounter(addQuickFilterOpenCounter + 1);
   };


   /*******************************************************************************
    ** Handle closing the add-quick-filter menu
    *******************************************************************************/
   const closeAddQuickFilterMenu = () =>
   {
      setAddQuickFilterMenu(null);
   };


   /*******************************************************************************
    ** Add a quick-filter field to the screen, from either the user selecting one,
    ** or from a new query being activated, etc.
    *******************************************************************************/
   const addQuickFilterField = (newValue: any, reason: "blur" | "modeToggleClicked" | "defaultFilterLoaded" | "savedFilterSelected" | "columnMenu" | "activatedView" | string) =>
   {
      console.log(`Adding quick filter field as: ${JSON.stringify(newValue)}`);
      if (reason == "blur")
      {
         //////////////////////////////////////////////////////////////////
         // this keeps a click out of the menu from selecting the option //
         //////////////////////////////////////////////////////////////////
         return;
      }

      const fieldName = newValue ? newValue.fieldName : null;
      if (fieldName)
      {
         ////////////////////////////////////////////////////////////////////////////////////////////////////
         // don't add the field if it's already on active quick-filter or one of the default quick-filters //
         ////////////////////////////////////////////////////////////////////////////////////////////////////
         if (quickFilterFieldNames.indexOf(fieldName) == -1 && !defaultQuickFilterFieldNameMap[fieldName])
         {
            /////////////////////////////////
            // add the field if we need to //
            /////////////////////////////////
            quickFilterFieldNames.push(fieldName);
            setQuickFilterFieldNames(quickFilterFieldNames);

            ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
            // only do this when user has added the field (e.g., not when adding it because of a selected view or filter-in-url) //
            ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
            if (reason != "modeToggleClicked" && reason != "defaultFilterLoaded" && reason != "savedFilterSelected" && reason != "activatedView")
            {
               setTimeout(() => document.getElementById(`quickFilter.${fieldName}`)?.click(), 5);
            }
         }
         else
         {
            //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
            // if field was already on-screen, but user clicked an option from the columnMenu, then open the quick-filter field //
            //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
            if (reason == "columnMenu")
            {
               setTimeout(() => document.getElementById(`quickFilter.${fieldName}`)?.click(), 5);
            }
         }

         closeAddQuickFilterMenu();
      }
   };


   /*******************************************************************************
    **
    *******************************************************************************/
   const handleFieldListMenuSelection = (field: QFieldMetaData, table: QTableMetaData): void =>
   {
      let fullFieldName = field.name;
      if (table && table.name != tableMetaData.name)
      {
         fullFieldName = `${table.name}.${field.name}`;
      }

      addQuickFilterField({fieldName: fullFieldName}, "selectedFromAddFilterMenu");
   };


   /*******************************************************************************
    ** event handler for the Filter Builder button - e.g., opens the parent's grid's
    ** filter panel
    *******************************************************************************/
   const openFilterBuilder = (e: React.MouseEvent<HTMLAnchorElement> | React.MouseEvent<HTMLButtonElement>) =>
   {
      if (!isQueryTooComplex)
      {
         gridApiRef.current.showFilterPanel();
      }
   };


   /*******************************************************************************
    ** event handler for the clear-filters modal
    *******************************************************************************/
   const handleClearFiltersAction = (event: React.KeyboardEvent<HTMLDivElement>, isYesButton: boolean = false) =>
   {
      if (isYesButton || event.key == "Enter")
      {
         setShowClearFiltersWarning(false);
         setQueryFilter(new QQueryFilter([], queryFilter.orderBys));
      }
   };


   /*******************************************************************************
    **
    *******************************************************************************/
   const removeCriteriaByIndex = (index: number) =>
   {
      queryFilter.criteria.splice(index, 1);
      setQueryFilter(queryFilter);
   };


   /*******************************************************************************
    ** event handler for toggling between modes - basic & advanced.
    *******************************************************************************/
   const modeToggleClicked = (newValue: string | null) =>
   {
      if (newValue)
      {
         if (newValue == "basic")
         {
            ////////////////////////////////////////////////////////////////////////////////
            // we're always allowed to go to advanced -                                   //
            // but if we're trying to go to basic, make sure the filter isn't too complex //
            ////////////////////////////////////////////////////////////////////////////////
            const {canFilterWorkAsBasic} = FilterUtils.canFilterWorkAsBasic(tableMetaData, queryFilter);
            if (!canFilterWorkAsBasic)
            {
               console.log("Query cannot work as basic - so - not allowing toggle to basic.");
               return;
            }

            ////////////////////////////////////////////////////////////////////////////////////////////////
            // when going to basic, make sure all fields in the current query are active as quick-filters //
            ////////////////////////////////////////////////////////////////////////////////////////////////
            if (queryFilter && queryFilter.criteria)
            {
               ensureAllFilterCriteriaAreActiveQuickFilters(tableMetaData, queryFilter, "modeToggleClicked", "basic");
            }
         }

         //////////////////////////////////////////////////////////////////////////////////////
         // note - this is a callback to the parent - as it is responsible for this state... //
         //////////////////////////////////////////////////////////////////////////////////////
         setMode(newValue);
      }
   };


   /*******************************************************************************
    ** make sure that all fields in the current query are on-screen as quick-filters
    ** (that is, if the query can be basic)
    *******************************************************************************/
   const ensureAllFilterCriteriaAreActiveQuickFilters = (tableMetaData: QTableMetaData, queryFilter: QQueryFilter, reason: "modeToggleClicked" | "defaultFilterLoaded" | "savedFilterSelected" | string, newMode?: string) =>
   {
      if (!tableMetaData || !queryFilter)
      {
         return;
      }

      //////////////////////////////////////////////
      // set a flag if the query is 'too complex' //
      //////////////////////////////////////////////
      setIsQueryTooComplex(queryFilter.subFilters?.length > 0);

      const {canFilterWorkAsBasic} = FilterUtils.canFilterWorkAsBasic(tableMetaData, queryFilter);
      if (!canFilterWorkAsBasic)
      {
         console.log("query is too complex for basic - so - switching to advanced");
         modeToggleClicked("advanced");
         forceUpdate();
         return;
      }

      const modeToUse = newMode ?? mode;
      if (modeToUse == "basic")
      {
         for (let i = 0; i < queryFilter?.criteria?.length; i++)
         {
            const criteria = queryFilter.criteria[i];
            if (criteria && criteria.fieldName)
            {
               addQuickFilterField(criteria, reason);
            }
         }
      }
   };


   /*******************************************************************************
    ** count how many valid criteria are in the query - for showing badge
    *******************************************************************************/
   const countValidCriteria = (queryFilter: QQueryFilter): number =>
   {
      let count = 0;
      for (let i = 0; i < queryFilter?.criteria?.length; i++)
      {
         const {criteriaIsValid} = validateCriteria(queryFilter.criteria[i], null);
         if (criteriaIsValid)
         {
            count++;
         }
      }

      /////////////////////////////////////////////////////////////
      // recursively add any children filters to the total count //
      /////////////////////////////////////////////////////////////
      for (let i = 0; i < queryFilter.subFilters?.length; i++)
      {
         count += countValidCriteria(queryFilter.subFilters[i]);
      }

      return count;
   };


   /*******************************************************************************
    ** Event handler for setting the sort from that menu
    *******************************************************************************/
   const handleSetSort = (field: QFieldMetaData, table: QTableMetaData, isAscending: boolean = true): void =>
   {
      const fullFieldName = table && table.name != tableMetaData.name ? `${table.name}.${field.name}` : field.name;
      queryFilter.orderBys = [new QFilterOrderBy(fullFieldName, isAscending)];

      setQueryFilter(queryFilter);
      forceUpdate();
   };


   /*******************************************************************************
    ** event handler for a click on a field's up or down arrow in the sort menu
    *******************************************************************************/
   const handleSetSortArrowClick = (field: QFieldMetaData, table: QTableMetaData, event: any): void =>
   {
      event.stopPropagation();

      ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
      // make sure this is an event handler for one of our icons (not something else in the dom here in our end-adornments) //
      ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
      const isAscending = event.target.innerHTML == "arrow_upward";
      const isDescending = event.target.innerHTML == "arrow_downward";
      if (isAscending || isDescending)
      {
         handleSetSort(field, table, isAscending);
      }
   };


   /*******************************************************************************
    ** event handler for clicking the current sort up/down arrow, to toggle direction.
    *******************************************************************************/
   function toggleSortDirection(event: React.MouseEvent<HTMLSpanElement, MouseEvent>): void
   {
      event.stopPropagation();
      try
      {
         queryFilter.orderBys[0].isAscending = !queryFilter.orderBys[0].isAscending;
         setQueryFilter(queryFilter);
         forceUpdate();
      }
      catch (e)
      {
         console.log(`Error toggling sort: ${e}`);
      }
   }

   /////////////////////////////////
   // set up the sort menu button //
   /////////////////////////////////
   let sortButtonContents = getCurrentSortIndicator(queryFilter, tableMetaData, toggleSortDirection);

   ////////////////////////////////////////////////////////////////////////////////////////////////////////////
   // this is being used as a version of like forcing that we get re-rendered if the query filter changes... //
   ////////////////////////////////////////////////////////////////////////////////////////////////////////////
   const [lastIndex, setLastIndex] = useState(queryFilterJSON);
   if (queryFilterJSON != lastIndex)
   {
      ensureAllFilterCriteriaAreActiveQuickFilters(tableMetaData, queryFilter, "defaultFilterLoaded");
      setLastIndex(queryFilterJSON);
   }

   ///////////////////////////////////////////////////
   // set some status flags based on current filter //
   ///////////////////////////////////////////////////
   const hasValidFilters = queryFilter && countValidCriteria(queryFilter) > 0;
   const {canFilterWorkAsBasic, canFilterWorkAsAdvanced, reasonsWhyItCannot} = FilterUtils.canFilterWorkAsBasic(tableMetaData, queryFilter);
   let reasonWhyBasicIsDisabled = null;
   if (canFilterWorkAsAdvanced && reasonsWhyItCannot && reasonsWhyItCannot.length > 0)
   {
      reasonWhyBasicIsDisabled = <>
         Your current Filter cannot be managed using Basic mode because:
         <ul style={{marginLeft: "1rem"}}>
            {reasonsWhyItCannot.map((reason, i) => <li key={i}>{reason}</li>)}
         </ul>
      </>;
   }
   if (isQueryTooComplex)
   {
      reasonWhyBasicIsDisabled = <>
         Your current Filter is too complex to modify because it contains Sub-filters.
      </>;
   }

   const borderGray = colors.grayLines.main;

   const sortMenuComponent = (
      <FieldListMenu
         idPrefix="sort"
         tableMetaData={tableMetaData}
         placeholder="Search Fields"
         buttonProps={{disableRipple: true, sx: {textTransform: "none", color: colors.gray.main, paddingRight: 0}}}
         buttonChildren={sortButtonContents}
         isModeSelectOne={true}
         handleSelectedField={handleSetSort}
         fieldEndAdornment={<Box whiteSpace="nowrap"><Icon>arrow_upward</Icon><Icon>arrow_downward</Icon></Box>}
         handleAdornmentClick={handleSetSortArrowClick}
         omitExposedJoins={props.omitExposedJoins}
      />);

   const filterBuilderMouseEvents =
      {
         onMouseOver: () => handleMouseOverElement("filterBuilderButton"),
         onMouseOut: () => handleMouseOutElement()
      };

   return (
      <Box pb={mode == "advanced" ? "0.25rem" : "0"}>

         {/* First row:  Saved Views button (with Columns button in the middle of it), then space-between, then basic|advanced toggle */}
         <Box display="flex" justifyContent="space-between" pt={"0.5rem"} pb={"0.5rem"}>
            <Box display="flex">
               {savedViewsComponent}
               {columnMenuComponent}
            </Box>
            <Box>
               <Tooltip title={reasonWhyBasicIsDisabled}>
                  <ToggleButtonGroup
                     value={mode}
                     exclusive
                     onChange={(event, newValue) => modeToggleClicked(newValue)}
                     size="small"
                     sx={{pl: 0.5, width: "10rem"}}
                  >
                     <ToggleButton value="basic" disabled={!canFilterWorkAsBasic}>Basic</ToggleButton>
                     <ToggleButton value="advanced">Advanced</ToggleButton>
                  </ToggleButtonGroup>
               </Tooltip>
            </Box>
         </Box>

         {/* Second row:  Basic or advanced mode - with sort-by control on the right (of each) */}
         <Box pb={"0.25rem"}>
            {
               ///////////////////////////////////////////////////////////////////////////////////
               // basic mode - wrapping-list of fields & add-field button, then sort-by control //
               ///////////////////////////////////////////////////////////////////////////////////
               mode == "basic" &&
               <Box display="flex" alignItems="flex-start" flexShrink={1} flexGrow={1}>
                  <Box width="100px" flexShrink={1} flexGrow={1}>
                     <>
                        {
                           tableMetaData && defaultQuickFilterFieldNames?.map((fieldName) =>
                           {
                              const [field] = TableUtils.getFieldAndTable(tableMetaData, fieldName);
                              let defaultOperator = getDefaultOperatorForField(field);

                              return (<QuickFilter
                                 key={fieldName}
                                 allowVariables={props.allowVariables}
                                 fullFieldName={fieldName}
                                 tableMetaData={tableMetaData}
                                 updateCriteria={updateQuickCriteria}
                                 criteriaParam={getQuickCriteriaParam(fieldName)}
                                 fieldMetaData={field}
                                 defaultOperator={defaultOperator}
                                 queryScreenUsage={queryScreenUsage}
                                 handleRemoveQuickFilterField={null} />);
                           })
                        }
                        {/* vertical rule */}
                        <Box display="inline-block" borderLeft={`1px solid ${borderGray}`} height="1.75rem" width="1px" marginRight="0.5rem" position="relative" top="0.5rem" />
                        {
                           tableMetaData && quickFilterFieldNames?.map((fieldName) =>
                           {
                              const [field] = TableUtils.getFieldAndTable(tableMetaData, fieldName);
                              let defaultOperator = getDefaultOperatorForField(field);

                              return (defaultQuickFilterFieldNameMap[fieldName] ? null : <QuickFilter
                                 key={fieldName}
                                 fullFieldName={fieldName}
                                 tableMetaData={tableMetaData}
                                 updateCriteria={updateQuickCriteria}
                                 criteriaParam={getQuickCriteriaParam(fieldName)}
                                 fieldMetaData={field}
                                 allowVariables={props.allowVariables}
                                 defaultOperator={defaultOperator}
                                 queryScreenUsage={queryScreenUsage}
                                 handleRemoveQuickFilterField={handleRemoveQuickFilterField} />);
                           })
                        }
                        {
                           tableMetaData && <FieldListMenu
                              key={JSON.stringify(quickFilterFieldNames)} // use a unique key each time we open it, because we don't want the user's last selection to stick.
                              idPrefix="addQuickFilter"
                              tableMetaData={tableMetaData}
                              fieldNamesToHide={[...(defaultQuickFilterFieldNames ?? []), ...(quickFilterFieldNames ?? [])]}
                              placeholder="Search Fields"
                              buttonProps={{sx: quickFilterButtonStyles, startIcon: (<Icon>add</Icon>)}}
                              buttonChildren={"Add Filter"}
                              isModeSelectOne={true}
                              handleSelectedField={handleFieldListMenuSelection}
                              omitExposedJoins={props.omitExposedJoins}
                           />
                        }
                     </>
                  </Box>
                  <Box>
                     {sortMenuComponent}
                  </Box>
               </Box>
            }
            {
               //////////////////////////////////////////////////////////////////////////////////////////////////////////////
               // advanced mode - 2 rows - one for Filter Builder button & sort control, 2nd row for the filter-detail box //
               //////////////////////////////////////////////////////////////////////////////////////////////////////////////
               metaData && tableMetaData && mode == "advanced" &&
               <Box borderRadius="0.75rem" border={`1px solid ${borderGray}`}>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                     <Box p="0.5rem">
                        <Tooltip enterDelay={500} title="Build an advanced Filter" placement="top">
                           <>
                              <Button
                                 className="filterBuilderButton"
                                 onClick={(e) => openFilterBuilder(e)}
                                 {...filterBuilderMouseEvents}
                                 startIcon={<Icon>build</Icon>}
                                 sx={{borderRadius: "0.75rem", padding: "0.5rem", pl: "1rem", fontSize: "0.875rem", fontWeight: 500, border: `1px solid ${accentColor}`, textTransform: "none"}}
                              >
                                 Filter Builder
                                 {
                                    countValidCriteria(queryFilter) > 0 &&
                                    <Box {...filterBuilderMouseEvents} sx={{backgroundColor: accentColor, marginLeft: "0.25rem", minWidth: "1rem", fontSize: "0.75rem"}} borderRadius="50%" color="#FFFFFF" position="relative" top="-2px" className="filterBuilderCountBadge">
                                       {countValidCriteria(queryFilter)}
                                    </Box>
                                 }
                              </Button>
                              {
                                 hasValidFilters && mouseOverElement == "filterBuilderButton" && <span {...filterBuilderMouseEvents} className="filterBuilderXIcon"><XIcon shade="accent" position="default" onClick={() => setShowClearFiltersWarning(true)} /></span>
                              }
                           </>
                        </Tooltip>
                        <Dialog open={showClearFiltersWarning} onClose={() => setShowClearFiltersWarning(false)} onKeyPress={(e) => handleClearFiltersAction(e)}>
                           <DialogTitle id="alert-dialog-title">Confirm</DialogTitle>
                           <DialogContent>
                              <DialogContentText>Are you sure you want to remove all conditions from the current filter?</DialogContentText>
                           </DialogContent>
                           <DialogActions>
                              <QCancelButton label="No" disabled={false} onClickHandler={() => setShowClearFiltersWarning(false)} />
                              <QSaveButton label="Yes" iconName="check" disabled={false} onClickHandler={() => handleClearFiltersAction(null, true)} />
                           </DialogActions>
                        </Dialog>
                     </Box>
                     <Box pr={"0.5rem"}>
                        {sortMenuComponent}
                     </Box>
                  </Box>
                  <AdvancedQueryPreview tableMetaData={tableMetaData} queryFilter={queryFilter} isEditable={true} isQueryTooComplex={isQueryTooComplex} removeCriteriaByIndexCallback={removeCriteriaByIndex} />
               </Box>
            }
         </Box>
      </Box>
   );
});

export function getDefaultQuickFilterFieldNames(table: QTableMetaData): string[]
{
   const defaultQuickFilterFieldNames: string[] = [];

   //////////////////////////////////////////////////////////////////////////////////////////////////
   // check if there's materialDashboard tableMetaData, and if it has defaultQuickFilterFieldNames //
   //////////////////////////////////////////////////////////////////////////////////////////////////
   const mdbMetaData = table?.supplementalTableMetaData?.get("materialDashboard");
   if (mdbMetaData)
   {
      if (mdbMetaData?.defaultQuickFilterFieldNames?.length)
      {
         for (let i = 0; i < mdbMetaData.defaultQuickFilterFieldNames.length; i++)
         {
            defaultQuickFilterFieldNames.push(mdbMetaData.defaultQuickFilterFieldNames[i]);
         }
      }
   }

   /////////////////////////////////////////////
   // if still none, then look for T1 section //
   /////////////////////////////////////////////
   if (defaultQuickFilterFieldNames.length == 0)
   {
      if (table.sections)
      {
         const t1Sections = table.sections.filter((s: QTableSection) => s.tier == "T1");
         if (t1Sections.length)
         {
            for (let i = 0; i < t1Sections.length; i++)
            {
               if (t1Sections[i].fieldNames)
               {
                  for (let j = 0; j < t1Sections[i].fieldNames.length; j++)
                  {
                     defaultQuickFilterFieldNames.push(t1Sections[i].fieldNames[j]);
                  }
               }
            }
         }
      }
   }

   return (defaultQuickFilterFieldNames);
}

export default BasicAndAdvancedQueryControls;
