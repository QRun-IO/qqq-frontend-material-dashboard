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


import {ApiVersion} from "@qrunio/qqq-frontend-core/lib/controllers/QControllerV1";
import {QTableMetaData} from "@qrunio/qqq-frontend-core/lib/model/metaData/QTableMetaData";
import {QWidgetMetaData} from "@qrunio/qqq-frontend-core/lib/model/metaData/QWidgetMetaData";
import {QCriteriaOperator} from "@qrunio/qqq-frontend-core/lib/model/query/QCriteriaOperator";
import {QFilterCriteria} from "@qrunio/qqq-frontend-core/lib/model/query/QFilterCriteria";
import {QQueryFilter} from "@qrunio/qqq-frontend-core/lib/model/query/QQueryFilter";
import {Alert, Collapse} from "@mui/material";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Modal from "@mui/material/Modal";
import Tooltip from "@mui/material/Tooltip/Tooltip";
import QContext from "QContext";
import colors from "qqq/assets/theme/base/colors";
import {QCancelButton, QSaveButton} from "qqq/components/buttons/DefaultButtons";
import HelpContent, {hasHelpContent} from "qqq/components/misc/HelpContent";
import AdvancedQueryPreview from "qqq/components/query/AdvancedQueryPreview";
import {getCurrentSortIndicator} from "qqq/components/query/BasicAndAdvancedQueryControls";
import Widget, {HeaderLinkButtonComponent} from "qqq/components/widgets/Widget";
import QQueryColumns, {Column} from "qqq/models/query/QQueryColumns";
import RecordQuery from "qqq/pages/records/query/RecordQuery";
import Client from "qqq/utils/qqq/Client";
import FilterUtils from "qqq/utils/qqq/FilterUtils";
import TableUtils from "qqq/utils/qqq/TableUtils";
import React, {useContext, useEffect, useMemo, useRef, useState} from "react";
import {buttonSX, unborderedButtonSX} from "qqq/components/widgets/misc/RowBuilderWidget";

interface FilterAndColumnsSetupWidgetProps
{
   isEditable: boolean,
   widgetMetaData: QWidgetMetaData,
   widgetData: any,
   recordValues: { [name: string]: any },
   onSaveCallback?: (values: { [name: string]: any }) => void,
   label?: string
}

FilterAndColumnsSetupWidget.defaultProps = {
   onSaveCallback: null
};


const qController = Client.getInstance();
const qControllerV1 = Client.getInstanceV1();

/*******************************************************************************
 ** Component for editing the main setup of a report - that is: filter & columns
 *******************************************************************************/
export default function FilterAndColumnsSetupWidget({isEditable: isEditableProp, widgetMetaData, widgetData, recordValues, onSaveCallback, label}: FilterAndColumnsSetupWidgetProps): JSX.Element
{
   const [modalOpen, setModalOpen] = useState(false);
   const [hideColumns] = useState(widgetData?.hideColumns);
   const [hidePreview] = useState(widgetData?.hidePreview);
   const [hideSortBy] = useState(widgetData?.hideSortBy);
   const [isEditable] = useState(widgetData?.overrideIsEditable ?? isEditableProp);
   const [tableMetaData, setTableMetaData] = useState(null as QTableMetaData);

   const [isApiVersioned] = useState(widgetData?.isApiVersioned);
   const [apiVersion, setApiVersion] = useState(null as ApiVersion | null);

   const [filterFieldName] = useState(widgetData?.filterFieldName ?? "queryFilterJson");
   const [columnsFieldName] = useState(widgetData?.columnsFieldName ?? "columnsJson");

   const [alertContent, setAlertContent] = useState(null as string);
   const [warning, setWarning] = useState(null as string);
   const [widgetFailureAlertContent, setWidgetFailureAlertContent] = useState(null as string);

   const omitExposedJoins: string[] = widgetData?.omitExposedJoins ?? [];

   //////////////////////////////////////////////////////////////////////////////////////////////////
   // we'll actually keep 2 copies of the query filter around here -                               //
   // the one in the record (as json) is one that the backend likes (e.g., possible values as ids) //
   // this "frontend" one is one that the frontend can use (possible values as objects w/ labels). //
   //////////////////////////////////////////////////////////////////////////////////////////////////
   const [frontendQueryFilter, setFrontendQueryFilter] = useState(null as QQueryFilter);

   const {helpHelpActive} = useContext(QContext);

   const recordQueryRef = useRef();

   /////////////////////////////
   // load values from record //
   /////////////////////////////
   let columns: QQueryColumns = null;
   let usingDefaultEmptyFilter = false;
   const rawFilterValueFromRecord = recordValues[filterFieldName];
   let queryFilter = rawFilterValueFromRecord &&
      ((typeof rawFilterValueFromRecord == "string" ? JSON.parse(rawFilterValueFromRecord) : rawFilterValueFromRecord) as QQueryFilter);
   const defaultFilterFields = widgetData?.filterDefaultFieldNames;
   if (!queryFilter)
   {
      queryFilter = new QQueryFilter();
      if (defaultFilterFields?.length == 0)
      {
         usingDefaultEmptyFilter = true;
      }
   }
   else
   {
      queryFilter = Object.assign(new QQueryFilter(), queryFilter);
   }

   //////////////////////////////////////////////////////////////////////////////////////////////////////
   // if there are default fields from which a query should be seeded, add/update the filter with them //
   //////////////////////////////////////////////////////////////////////////////////////////////////////
   if (defaultFilterFields?.length > 0)
   {
      defaultFilterFields.forEach((fieldName: string) =>
      {
         ////////////////////////////////////////////////////////////////////////////////////////////
         // if a value for the default field exists, remove the criteria for it in our query first //
         ////////////////////////////////////////////////////////////////////////////////////////////
         queryFilter.criteria = queryFilter.criteria?.filter(c => c.fieldName != fieldName);

         if (recordValues[fieldName])
         {
            queryFilter.addCriteria(new QFilterCriteria(fieldName, QCriteriaOperator.EQUALS, [recordValues[fieldName]]));
         }
      });
   }

   if (recordValues[columnsFieldName])
   {
      columns = QQueryColumns.buildFromJSON(recordValues[columnsFieldName]);
   }

   //////////////////////////////////////////////////////////////////////
   // load tableMetaData initially, and if/when selected table changes //
   //////////////////////////////////////////////////////////////////////
   useEffect(() =>
   {
      ////////////////////////////////////////////////////////////////////////////////////////
      // if a default table name specified, use it, otherwise use it from the record values //
      ////////////////////////////////////////////////////////////////////////////////////////
      let tableName = widgetData?.tableName;
      if (!tableName && recordValues["tableName"] && (tableMetaData == null || tableMetaData.name != recordValues["tableName"]))
      {
         tableName = recordValues["tableName"];
      }

      let version: ApiVersion | null = null;
      if (isApiVersioned)
      {
         let apiName = widgetData?.apiName;
         let apiPath = widgetData?.apiPath;
         let apiVersion = widgetData?.apiVersion;

         if (!apiName && recordValues["apiName"])
         {
            apiName = recordValues["apiName"];
         }

         if (!apiPath && recordValues["apiPath"])
         {
            apiPath = recordValues["apiPath"];
         }

         if (!apiVersion && recordValues["apiVersion"])
         {
            apiVersion = recordValues["apiVersion"];
         }

         if (!apiName || !apiPath || !apiVersion)
         {
            console.log("API Name/Path/Version not set, but widget isApiVersioned, so cannot load table meta data...");
            return;
         }

         version = {name: apiName, path: apiPath, version: apiVersion};
         setApiVersion(version);
      }

      if (tableName)
      {
         (async () =>
         {
            try
            {
               const tableMetaData = await qControllerV1.loadTableMetaData(tableName, version);
               setTableMetaData(tableMetaData);

               const queryFilterForFrontend = Object.assign({}, queryFilter);

               let warnings: string[] = [];
               for (let i = 0; i < queryFilterForFrontend?.criteria?.length; i++)
               {
                  const criteria = queryFilter.criteria[i];
                  let [field, fieldTable] = TableUtils.getFieldAndTable(tableMetaData, criteria.fieldName);
                  if(!field)
                  {
                     warnings.push("Removing non-existing filter field: " + criteria.fieldName);
                     queryFilterForFrontend.criteria.splice(i, 1);
                     i--;
                  }
               }

               await FilterUtils.cleanupValuesInFilerFromQueryString(qController, tableMetaData, queryFilterForFrontend);
               setFrontendQueryFilter(queryFilterForFrontend);

               setWarning(warnings.join("; "));
            }
            catch (e)
            {
               console.log(e);
               //@ts-ignore e.message
               setWidgetFailureAlertContent("Error preparing filter widget: " + (e.message ?? "Details not available."));
            }
         })();
      }
   }, [JSON.stringify(recordValues)]);


   /*******************************************************************************
    **
    *******************************************************************************/
   function openEditor()
   {
      let missingRequiredFields = [] as string[];
      widgetData?.filterDefaultFieldNames?.forEach((fieldName: string) =>
      {
         if (!recordValues[fieldName])
         {
            missingRequiredFields.push(tableMetaData.fields.get(fieldName).label);
         }
      });

      ////////////////////////////////////////////////////////////////////
      // display an alert and return if any required fields are missing //
      ////////////////////////////////////////////////////////////////////
      if (missingRequiredFields.length > 0)
      {
         setAlertContent("The following fields must first be selected to edit the filter: '" + missingRequiredFields.join(", ") + "'");
         return;
      }

      if (widgetData?.tableName || recordValues["tableName"])
      {
         setAlertContent(null);
         setModalOpen(true);
      }
   }


   /*******************************************************************************
    **
    *******************************************************************************/
   function saveClicked()
   {
      if (!onSaveCallback)
      {
         console.log("onSaveCallback was not defined");
         return;
      }

      // @ts-ignore possibly 'undefined'.
      const view = recordQueryRef?.current?.getCurrentView();

      view.queryColumns.sortColumnsFixingPinPositions();

      //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
      // keep the query filter that came from the recordQuery screen as the front-end version (w/ possible value objects) //
      // but prep a copy of it for the backend, to stringify as json in the record being edited                           //
      //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
      setFrontendQueryFilter(view.queryFilter);
      const filter = FilterUtils.prepQueryFilterForBackend(tableMetaData, view.queryFilter);

      const rs: { [key: string]: any } = {};
      rs[filterFieldName] = JSON.stringify(filter);
      rs[columnsFieldName] = JSON.stringify(view.queryColumns);
      onSaveCallback(rs);

      closeEditor();
   }


   /*******************************************************************************
    **
    *******************************************************************************/
   function closeEditor(event?: {}, reason?: "backdropClick" | "escapeKeyDown")
   {
      if (reason == "backdropClick" || reason == "escapeKeyDown")
      {
         return;
      }

      setModalOpen(false);
   }


   /*******************************************************************************
    **
    *******************************************************************************/
   function renderColumn(column: Column): JSX.Element
   {
      const [field, table] = FilterUtils.getField(tableMetaData, column.name);

      if (!column || !column.isVisible || column.name == "__check__" || !field)
      {
         return (<React.Fragment />);
      }

      const tableLabelPart = table.name != tableMetaData.name ? table.label + ": " : "";

      return (<Box mr="0.375rem" mb="0.5rem" border={`1px solid ${colors.grayLines.main}`} borderRadius="0.75rem" p="0.25rem 0.75rem">
         {tableLabelPart}{field.label}
      </Box>);
   }


   /*******************************************************************************
    **
    *******************************************************************************/
   function mayShowQuery(): boolean
   {
      if (tableMetaData)
      {
         if (frontendQueryFilter?.criteria?.length > 0 || frontendQueryFilter?.subFilters?.length > 0)
         {
            return (true);
         }
      }

      return (false);
   }

   /*******************************************************************************
    **
    *******************************************************************************/
   function mayShowColumns(): boolean
   {
      if (tableMetaData)
      {
         for (let i = 0; i < columns?.columns?.length; i++)
         {
            if (columns.columns[i].isVisible && columns.columns[i].name != "__check__")
            {
               return (true);
            }
         }
      }

      return (false);
   }

   const helpRoles = isEditable ? [recordValues["id"] ? "EDIT_SCREEN" : "INSERT_SCREEN", "WRITE_SCREENS", "ALL_SCREENS"] : ["VIEW_SCREEN", "READ_SCREENS", "ALL_SCREENS"];

   /*******************************************************************************
    **
    *******************************************************************************/
   function showHelp(slot: string)
   {
      return (helpHelpActive || hasHelpContent(widgetMetaData?.helpContent?.get(slot), helpRoles));
   }


   /*******************************************************************************
    **
    *******************************************************************************/
   function getHelpContent(slot: string)
   {
      const key = `widget:${widgetMetaData.name};slot:${slot}`;
      return <HelpContent helpContents={widgetMetaData?.helpContent?.get(slot)} roles={helpRoles} helpContentKey={key} />;
   }

   /////////////////////////////////////////////////
   // add link to widget header for opening modal //
   /////////////////////////////////////////////////
   const selectTableFirstTooltipTitle = tableMetaData ? null : `You must select a table${isApiVersioned ? " and API details" : ""} before you can set up your filters${hideColumns ? "" : " and columns"}`;
   const labelAdditionalElementsRight: JSX.Element[] = [];
   if (isEditable)
   {
      if (!hideColumns)
      {
         labelAdditionalElementsRight.push(<HeaderLinkButtonComponent key="filterAndColumnsHeader" label="Edit Filters and Columns" onClickCallback={openEditor} disabled={tableMetaData == null} disabledTooltip={selectTableFirstTooltipTitle} />);
      }
      else
      {
         labelAdditionalElementsRight.push(<HeaderLinkButtonComponent key="filterAndColumnsHeader" label="Edit Filters" onClickCallback={openEditor} disabled={tableMetaData == null} disabledTooltip={selectTableFirstTooltipTitle} />);
      }
   }

   if (widgetFailureAlertContent)
   {
      return (<Widget widgetMetaData={widgetMetaData}>
         <Alert severity="error" sx={{mt: 1.5, mb: 0.5}}>{widgetFailureAlertContent}</Alert>
      </Widget>);
   }

   return (<Widget widgetMetaData={widgetMetaData} labelAdditionalElementsRight={labelAdditionalElementsRight}>
      <React.Fragment>
         {
            showHelp("sectionSubhead") &&
            <Box color={colors.gray.main} pb={"0.5rem"} fontSize={"0.875rem"}>
               {getHelpContent("sectionSubhead")}
            </Box>
         }
         <Collapse in={Boolean(alertContent)}>
            <Alert severity="error" sx={{mt: 1.5, mb: 0.5}} onClose={() => setAlertContent(null)}>{alertContent}</Alert>
         </Collapse>
         <Collapse in={Boolean(warning)}>
            <Alert severity="warning" sx={{mt: 1.5, mb: 0.5}} onClose={() => setWarning(null)}>{warning}</Alert>
         </Collapse>
         <Box pt="0.5rem">
            <Box display="flex" justifyContent="space-between" alignItems="center">
               <h5>{label ?? widgetData.label ?? widgetMetaData.label ?? "Query Filter"}</h5>
               {!hideSortBy && <Box fontSize="0.75rem" fontWeight="700">{mayShowQuery() && getCurrentSortIndicator(frontendQueryFilter, tableMetaData, null)}</Box>}
            </Box>
            {
               mayShowQuery() &&
               <AdvancedQueryPreview tableMetaData={tableMetaData} queryFilter={frontendQueryFilter} isEditable={false} isQueryTooComplex={frontendQueryFilter.subFilters?.length > 0} removeCriteriaByIndexCallback={null} />
            }
            {
               !mayShowQuery() &&
               <Box width="100%" sx={{fontSize: "1rem", background: "#FFFFFF"}} minHeight={"2.5rem"} p={"0.5rem"} pb={"0.125rem"} borderRadius="0.75rem" border={`1px solid ${colors.grayLines.main}`}>
                  {
                     isEditable &&
                     <Tooltip title={selectTableFirstTooltipTitle}>
                        <span><Button disabled={tableMetaData == null} sx={{mb: "0.125rem", ...unborderedButtonSX}} onClick={openEditor}>+ Add Filters</Button></span>
                     </Tooltip>
                  }
                  {
                     !isEditable && <Box color={colors.gray.main}>No filters are configured.</Box>
                  }
               </Box>
            }
         </Box>
         {!hideColumns && (
            <Box pt="1rem">
               <h5>Columns</h5>
               <Box display="flex" flexWrap="wrap" fontSize="1rem">
                  {
                     mayShowColumns() && columns &&
                     columns.columns.map((column, i) => <React.Fragment key={`column-${i}`}>{renderColumn(column)}</React.Fragment>)
                  }
                  {
                     !mayShowColumns() &&
                     <Box width="100%" sx={{fontSize: "1rem", background: "#FFFFFF"}} minHeight={"2.375rem"} p={"0.5rem"} pb={"0.125rem"}>
                        {
                           isEditable &&
                           <Tooltip title={selectTableFirstTooltipTitle}>
                              <span><Button disabled={!recordValues["tableName"]} sx={unborderedButtonSX} onClick={openEditor}>+ Add Columns</Button></span>
                           </Tooltip>
                        }
                        {
                           !isEditable && <Box color={colors.gray.main}>No columns are selected.</Box>
                        }
                     </Box>
                  }
               </Box>
            </Box>
         )}
         {!hidePreview && !isEditable && frontendQueryFilter && tableMetaData && (
            <Box pt="1rem">
               <h5>Preview</h5>
               <RecordQuery
                  allowVariables={widgetData?.allowVariables}
                  ref={recordQueryRef}
                  table={tableMetaData}
                  isPreview={true}
                  usage="reportSetup"
                  isModal={true}
                  initialQueryFilter={frontendQueryFilter}
                  initialColumns={columns}
                  apiVersion={apiVersion}
                  omitExposedJoins={omitExposedJoins}
               />
            </Box>
         )}
         {
            modalOpen &&
            <Modal open={modalOpen} onClose={(event, reason) => closeEditor(event, reason)}>
               <div>
                  <Box sx={{position: "absolute", overflowY: "auto", maxHeight: "100%", width: "100%"}}>
                     <Card sx={{m: "2rem", p: "2rem"}}>
                        <h3>Edit Filters {hideColumns ? "" : " and Columns"}</h3>
                        {
                           showHelp("modalSubheader") &&
                           <Box color={colors.gray.main} pb={"0.5rem"}>
                              {getHelpContent("modalSubheader")}
                           </Box>
                        }
                        {
                           tableMetaData && <RecordQuery
                              allowVariables={widgetData?.allowVariables}
                              ref={recordQueryRef}
                              table={tableMetaData}
                              usage="reportSetup"
                              isModal={true}
                              initialQueryFilter={usingDefaultEmptyFilter ? null : frontendQueryFilter}
                              initialColumns={columns}
                              apiVersion={apiVersion}
                              omitExposedJoins={omitExposedJoins}
                           />
                        }

                        <Box>
                           <Box display="flex" justifyContent="flex-end">
                              <QCancelButton disabled={false} onClickHandler={closeEditor} />
                              <QSaveButton label="OK" iconName="check" disabled={false} onClickHandler={saveClicked} />
                           </Box>
                        </Box>
                     </Card>
                  </Box>
               </div>
            </Modal>
         }
      </React.Fragment>
   </Widget>);
}
