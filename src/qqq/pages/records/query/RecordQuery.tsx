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

import {Alert, Box, Collapse, Menu, Typography} from "@mui/material";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Divider from "@mui/material/Divider";
import Icon from "@mui/material/Icon";
import IconButton from "@mui/material/IconButton";
import LinearProgress from "@mui/material/LinearProgress";
import MenuItem from "@mui/material/MenuItem";
import Modal from "@mui/material/Modal";
import Tooltip from "@mui/material/Tooltip";
import {ColumnHeaderFilterIconButtonProps, DataGridPro, GridCallbackDetails, GridColDef, GridColumnHeaderParams, GridColumnMenuContainer, GridColumnMenuProps, GridColumnOrderChangeParams, GridColumnPinningMenuItems, GridColumnResizeParams, GridColumnVisibilityModel, GridDensity, GridEventListener, GridPinnedColumns, gridPreferencePanelStateSelector, GridPreferencePanelsValue, GridRowId, GridRowParams, GridRowsProp, GridSelectionModel, GridSortItem, GridSortModel, GridState, GridToolbarContainer, GridToolbarDensitySelector, HideGridColMenuItem, MuiEvent, SortGridMenuItems, useGridApiContext, useGridApiEventHandler, useGridApiRef, useGridSelector} from "@mui/x-data-grid-pro";
import {GridRowModel} from "@mui/x-data-grid/models/gridRows";
import {QController} from "@qrunio/qqq-frontend-core/lib/controllers/QController";
import {ApiVersion} from "@qrunio/qqq-frontend-core/lib/controllers/QControllerV1";
import {Capability} from "@qrunio/qqq-frontend-core/lib/model/metaData/Capability";
import {QFieldMetaData} from "@qrunio/qqq-frontend-core/lib/model/metaData/QFieldMetaData";
import {QFieldType} from "@qrunio/qqq-frontend-core/lib/model/metaData/QFieldType";
import {QInstance} from "@qrunio/qqq-frontend-core/lib/model/metaData/QInstance";
import {QProcessMetaData} from "@qrunio/qqq-frontend-core/lib/model/metaData/QProcessMetaData";
import {QTableMetaData} from "@qrunio/qqq-frontend-core/lib/model/metaData/QTableMetaData";
import {QTableVariant} from "@qrunio/qqq-frontend-core/lib/model/metaData/QTableVariant";
import {QJobComplete} from "@qrunio/qqq-frontend-core/lib/model/processes/QJobComplete";
import {QJobError} from "@qrunio/qqq-frontend-core/lib/model/processes/QJobError";
import {QRecord} from "@qrunio/qqq-frontend-core/lib/model/QRecord";
import {QCriteriaOperator} from "@qrunio/qqq-frontend-core/lib/model/query/QCriteriaOperator";
import {QFilterCriteria} from "@qrunio/qqq-frontend-core/lib/model/query/QFilterCriteria";
import {QFilterOrderBy} from "@qrunio/qqq-frontend-core/lib/model/query/QFilterOrderBy";
import {QQueryFilter} from "@qrunio/qqq-frontend-core/lib/model/query/QQueryFilter";
import FormData from "form-data";
import QContext from "QContext";
import colors from "qqq/assets/theme/base/colors";
import {QCancelButton, QCreateNewButton} from "qqq/components/buttons/DefaultButtons";
import MenuButton from "qqq/components/buttons/MenuButton";
import ErrorBoundary from "qqq/components/misc/ErrorBoundary";
import {GotoRecordButton} from "qqq/components/misc/GotoRecordDialog";
import SavedViews from "qqq/components/misc/SavedViews";
import BasicAndAdvancedQueryControls from "qqq/components/query/BasicAndAdvancedQueryControls";
import {CustomFilterPanel} from "qqq/components/query/CustomFilterPanel";
import CustomPaginationComponent from "qqq/components/query/CustomPaginationComponent";
import ExportMenuItem from "qqq/components/query/ExportMenuItem";
import FieldListMenu from "qqq/components/query/FieldListMenu";
import {validateCriteria} from "qqq/components/query/FilterCriteriaRow";
import QueryScreenActionMenu from "qqq/components/query/QueryScreenActionMenu";
import SelectionSubsetDialog from "qqq/components/query/SelectionSubsetDialog";
import TableVariantDialog from "qqq/components/query/TableVariantDialog";
import useSavedViews from "qqq/components/query/useSavedViews";
import CustomWidthTooltip from "qqq/components/tooltips/CustomWidthTooltip";
import BaseLayout from "qqq/layouts/BaseLayout";
import {LoadingState} from "qqq/models/LoadingState";
import QQueryColumns, {PreLoadQueryColumns} from "qqq/models/query/QQueryColumns";
import RecordQueryView from "qqq/models/query/RecordQueryView";
import ProcessRun from "qqq/pages/processes/ProcessRun";
import ColumnStats from "qqq/pages/records/query/ColumnStats";
import DataGridUtils from "qqq/utils/DataGridUtils";
import {AnalyticsModel} from "qqq/utils/GoogleAnalyticsUtils";
import Client from "qqq/utils/qqq/Client";
import FilterUtils from "qqq/utils/qqq/FilterUtils";
import ProcessUtils from "qqq/utils/qqq/ProcessUtils";
import {SavedViewUtils} from "qqq/utils/qqq/SavedViewUtils";
import TableUtils from "qqq/utils/qqq/TableUtils";
import ValueUtils from "qqq/utils/qqq/ValueUtils";
import React, {forwardRef, useContext, useEffect, useImperativeHandle, useReducer, useRef, useState} from "react";
import {useLocation, useNavigate, useSearchParams} from "react-router-dom";

const CURRENT_SAVED_VIEW_ID_LOCAL_STORAGE_KEY_ROOT = "qqq.currentSavedViewId";
const DENSITY_LOCAL_STORAGE_KEY_ROOT = "qqq.density";
const VIEW_LOCAL_STORAGE_KEY_ROOT = "qqq.recordQueryView";

export const TABLE_VARIANT_LOCAL_STORAGE_KEY_ROOT = "qqq.tableVariant";
export type QueryScreenUsage = "queryScreen" | "reportSetup"

interface Props
{
   table?: QTableMetaData,
   apiVersion?: ApiVersion,
   launchProcess?: QProcessMetaData,
   usage?: QueryScreenUsage,
   isModal?: boolean,
   isPreview?: boolean,
   initialQueryFilter?: QQueryFilter,
   initialColumns?: QQueryColumns,
   allowVariables?: boolean,
   omitExposedJoins?: string[]
}

///////////////////////////////////////////////////////
// define possible values for our pageState variable //
///////////////////////////////////////////////////////
type PageState = "initial" | "loadingMetaData" | "loadedMetaData" | "loadingView" | "loadedView" | "preparingGrid" | "ready" | "error";

const qController = Client.getInstance();
const qControllerV1 = Client.getInstanceV1();

/*******************************************************************************
 ** function to produce standard version of the screen while we're "loading"
 ** like the main table meta data etc.
 *******************************************************************************/
const getLoadingScreen = (isModal: boolean) =>
{
   return (<Box>&nbsp;</Box>);
};


/***************************************************************************
 * The exported version of RecordQuery that pages & other components use here,
 * is actually a wrapper around the true component (RecordQueryInner).
 * The wrapper adds an ErrorBoundary, with an alert with a link that *tries* to fix
 * issues that we've seen (e.g., when a bad filter gets put into local storage).
 ***************************************************************************/
const RecordQuery = forwardRef((props: Props, ref) =>
{

   /***************************************************************************
    * try to fix issues by removing the current view from local storage
    * and reloading the page.  It fixes some issues at least!
    ***************************************************************************/
   const fixIt = () =>
   {
      //////////////////////////////////////////////////////////////////
      // remove the current view and saved-view-id from local storage //
      //////////////////////////////////////////////////////////////////
      localStorage.removeItem(`${VIEW_LOCAL_STORAGE_KEY_ROOT}.${props.table?.name}`);
      localStorage.removeItem(`${CURRENT_SAVED_VIEW_ID_LOCAL_STORAGE_KEY_ROOT}.${props.table?.name}`);

      ////////////////////////////////////////////////////////////////////////////////////
      // if the URL looks like we're using a saved view, try to navigate away from that //
      ////////////////////////////////////////////////////////////////////////////////////
      if (location.href.indexOf("/savedView/") > -1)
      {
         location.href = location.href.replace(/\/savedView\/.*/, "");
      }
      else
      {
         ///////////////////////////////
         // else just reload the page //
         ///////////////////////////////
         location.reload();
      }
   };

   const errorElement = <Box>
      <h3>Error</h3>
      <Alert severity="error">
         An error occurred loading this page. You may try to <a href="#" onClick={fixIt}>click here to fix it</a>.
      </Alert>
   </Box>;

   const body = <ErrorBoundary errorElement={errorElement}>
      <RecordQueryInner {...props} ref={ref} />
   </ErrorBoundary>;

   if (props.isModal)
   {
      return (body);
   }

   return (<BaseLayout>{body}</BaseLayout>);
});


/*******************************************************************************
 ** QQQ Record Query Screen component.
 **
 ** Yuge component.  The best.  Lots of very smart people are saying so.
 *******************************************************************************/
const RecordQueryInner = forwardRef(({table, apiVersion, usage, isModal, isPreview, allowVariables, initialQueryFilter, initialColumns, omitExposedJoins}: Props, ref) =>
{
   const tableName = table.name;
   const [searchParams] = useSearchParams();

   const [showSuccessfullyDeletedAlert, setShowSuccessfullyDeletedAlert] = useState(false);
   const [errorAlert, setErrorAlert] = useState(null as string);
   const [warningAlert, setWarningAlert] = useState(null as string);
   const [warningAlertList, setWarningAlertList] = useState([] as string[]);
   const [successAlert, setSuccessAlert] = useState(null as string);
   const [infoAlert, setInfoAlert] = useState(null as string);

   const navigate = useNavigate();
   const location = useLocation();
   const pathParts = location.pathname.replace(/\/+$/, "").split("/");

   const [firstRender, setFirstRender] = useState(true);
   const [isFirstRenderAfterChangingTables, setIsFirstRenderAfterChangingTables] = useState(false);

   const [loadedFilterFromInitialFilterParam, setLoadedFilterFromInitialFilterParam] = useState(false);

   const mayWriteLocalStorage = usage == "queryScreen";


   /*******************************************************************************
    **
    *******************************************************************************/
   function localStorageSet(key: string, value: string)
   {
      if (mayWriteLocalStorage)
      {
         localStorage.setItem(key, value);
      }
   }


   /*******************************************************************************
    **
    *******************************************************************************/
   function localStorageRemove(key: string)
   {
      if (mayWriteLocalStorage)
      {
         localStorage.removeItem(key);
      }
   }

   useImperativeHandle(ref, () =>
   {
      return {
         getCurrentView(): RecordQueryView
         {
            return view;
         }
      };
   });

   ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
   // manage "state" being passed from some screens (like delete) into query screen - by grabbing, and then deleting //
   ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
   if (location.state)
   {
      let state: any = location.state;
      if (state["deleteSuccess"])
      {
         setShowSuccessfullyDeletedAlert(true);
         delete state["deleteSuccess"];
      }

      if (state["warning"])
      {
         setWarningAlert(state["warning"]);
         delete state["warning"];
      }

      window.history.replaceState(state, "");
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////
   // look for defaults in the local storage                                                    //
   // note a few of these keys are duplicated in the wrapper where we try to catch & fix errors //
   ///////////////////////////////////////////////////////////////////////////////////////////////
   const currentSavedViewLocalStorageKey = `${CURRENT_SAVED_VIEW_ID_LOCAL_STORAGE_KEY_ROOT}.${tableName}`;
   const tableVariantLocalStorageKey = `${TABLE_VARIANT_LOCAL_STORAGE_KEY_ROOT}.${tableName}`;
   const viewLocalStorageKey = `${VIEW_LOCAL_STORAGE_KEY_ROOT}.${tableName}`;

   /////////////////////////////////////////////////////////////////////////////////////////////////
   // define some default values (e.g., to be used if nothing in local storage or no active view) //
   /////////////////////////////////////////////////////////////////////////////////////////////////
   let defaultSort = [] as GridSortItem[];
   let defaultRowsPerPage = 50;
   let defaultDensity = "standard" as GridDensity;
   let defaultTableVariant: QTableVariant = null;
   let defaultMode = "basic";
   let defaultQueryColumns: QQueryColumns = new PreLoadQueryColumns();
   let defaultView: RecordQueryView = null;

   /////////////////////////////////////
   // set density not to be per-table //
   /////////////////////////////////////
   const densityLocalStorageKey = `${DENSITY_LOCAL_STORAGE_KEY_ROOT}`;

   ///////////////////////////////////////////////////////////////
   // only load things out of local storage on the first render //
   ///////////////////////////////////////////////////////////////
   if (firstRender)
   {
      console.log("This is firstRender, so reading defaults from local storage...");
      if (localStorage.getItem(densityLocalStorageKey))
      {
         defaultDensity = JSON.parse(localStorage.getItem(densityLocalStorageKey));
      }
      if (localStorage.getItem(tableVariantLocalStorageKey))
      {
         defaultTableVariant = JSON.parse(localStorage.getItem(tableVariantLocalStorageKey));
      }
      if (localStorage.getItem(viewLocalStorageKey))
      {
         defaultView = RecordQueryView.buildFromJSON(localStorage.getItem(viewLocalStorageKey));
      }

      setFirstRender(false);
   }

   if (defaultView == null)
   {
      defaultView = new RecordQueryView();
      defaultView.queryFilter = new QQueryFilter();
      defaultView.queryColumns = defaultQueryColumns;
      defaultView.viewIdentity = "empty";
      defaultView.rowsPerPage = defaultRowsPerPage;
      // ... defaultView.quickFilterFieldNames = [];
      defaultView.mode = defaultMode;
   }

   if (firstRender)
   {
      /////////////////////////////////////////////////////////////////////////
      // allow a caller to send in an initial filter & set of columns.       //
      // only to be used on "first render".                                  //
      // JSON.parse(JSON.stringify()) to do deep clone and keep object clean //
      // unclear why not needed on initialColumns...                         //
      /////////////////////////////////////////////////////////////////////////
      if (initialQueryFilter)
      {
         defaultView.queryFilter = JSON.parse(JSON.stringify(initialQueryFilter));
         setLoadedFilterFromInitialFilterParam(true);
      }

      if (initialColumns)
      {
         defaultView.queryColumns = initialColumns;
      }
   }

   /////////////////////////////////////////////////////////////////////////////////////////
   // in case the view is missing any of these attributes, give them a reasonable default //
   /////////////////////////////////////////////////////////////////////////////////////////
   if (!defaultView.rowsPerPage)
   {
      defaultView.rowsPerPage = defaultRowsPerPage;
   }
   if (!defaultView.mode)
   {
      defaultView.mode = defaultMode;
   }
   if (!defaultView.quickFilterFieldNames)
   {
      defaultView.quickFilterFieldNames = [];
   }

   ///////////////////////////////////
   // state models for the DataGrid //
   ///////////////////////////////////
   const [columnSortModel, setColumnSortModel] = useState(defaultSort);
   const [columnVisibilityModel, setColumnVisibilityModel] = useState(defaultQueryColumns.toColumnVisibilityModel());
   const [columnsModel, setColumnsModel] = useState([] as GridColDef[]);
   const [density, setDensity] = useState(defaultDensity);
   const [loading, setLoading] = useState(true);
   const [pageNumber, setPageNumber] = useState(0);
   const [pinnedColumns, setPinnedColumns] = useState(defaultQueryColumns.toGridPinnedColumns());
   const [rowSelectionModel, setRowSelectionModel] = useState<GridSelectionModel>([]);
   const [rows, setRows] = useState([] as GridRowsProp[]);
   const [rowsPerPage, setRowsPerPage] = useState(defaultView.rowsPerPage);
   const [totalRecords, setTotalRecords] = useState(null);
   const gridApiRef = useGridApiRef();

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
   // state of the page - e.g., have we loaded meta data?  what about the initial view?  or are we ready to render records. //
   ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
   const [pageState, setPageState] = useState("initial" as PageState);

   /////////////////////////////////
   // meta-data and derived state //
   /////////////////////////////////
   const [metaData, setMetaData] = useState(null as QInstance);
   const [tableMetaData, setTableMetaData] = useState(null as QTableMetaData);
   const [tableLabel, setTableLabel] = useState("");
   const [tableProcesses, setTableProcesses] = useState([] as QProcessMetaData[]);
   const [allTableProcesses, setAllTableProcesses] = useState([] as QProcessMetaData[]);

   ///////////////////////////////////////////
   // state of the view of the query screen //
   ///////////////////////////////////////////
   const [view, setView] = useState(defaultView);
   const [viewAsJson, setViewAsJson] = useState(JSON.stringify(defaultView));
   const [queryFilter, setQueryFilter] = useState(defaultView.queryFilter);
   const [queryColumns, setQueryColumns] = useState(defaultView.queryColumns);
   const [lastFetchedQFilterJSON, setLastFetchedQFilterJSON] = useState("");
   const [lastFetchedVariant, setLastFetchedVariant] = useState(null);
   const [tableVariant, setTableVariant] = useState(defaultTableVariant);
   const [quickFilterFieldNames, setQuickFilterFieldNames] = useState(defaultView.quickFilterFieldNames);

   //////////////////////////////////////////////
   // misc state... needs grouped & documented //
   //////////////////////////////////////////////
   const [visibleJoinTables, setVisibleJoinTables] = useState(new Set<string>());
   const [distinctRecords, setDistinctRecords] = useState(null);
   const [tableVariantPromptOpen, setTableVariantPromptOpen] = useState(false);
   const [alertContent, setAlertContent] = useState("");
   const [currentSavedView, setCurrentSavedView] = useState(null as QRecord);
   const [viewIdInLocation, setViewIdInLocation] = useState(null as number);
   const [loadingSavedView, setLoadingSavedView] = useState(false);
   const [exportMenuAnchorElement, setExportMenuAnchorElement] = useState(null);
   const [tableDefaultView, setTableDefaultView] = useState(new RecordQueryView());

   /////////////////////////////////////////////////////
   // state related to avoiding accidental row clicks //
   /////////////////////////////////////////////////////
   const [gridMouseDownX, setGridMouseDownX] = useState(0);
   const [gridMouseDownY, setGridMouseDownY] = useState(0);
   const [gridPreferencesWindow, setGridPreferencesWindow] = useState(undefined);

   /////////////////////////////////////////////////////////////
   // state related to selecting records for using in actions //
   /////////////////////////////////////////////////////////////
   const [selectedIds, setSelectedIds] = useState([] as string[]);
   const [distinctRecordsOnPageCount, setDistinctRecordsOnPageCount] = useState(null as number);
   const [selectionSubsetSize, setSelectionSubsetSize] = useState(null as number);
   const [selectionSubsetSizePromptOpen, setSelectionSubsetSizePromptOpen] = useState(false);
   const [selectFullFilterState, setSelectFullFilterState] = useState("n/a" as "n/a" | "checked" | "filter" | "filterSubset");

   //////////////////////////////
   // state used for processes //
   //////////////////////////////
   const [activeModalProcess, setActiveModalProcess] = useState(null as QProcessMetaData);
   const [recordIdsForProcess, setRecordIdsForProcess] = useState([] as string[] | QQueryFilter);

   /////////////////////////////////////////
   // state used for column-stats feature //
   /////////////////////////////////////////
   const [columnStatsFieldName, setColumnStatsFieldName] = useState(null as string);
   const [columnStatsField, setColumnStatsField] = useState(null as QFieldMetaData);
   const [columnStatsFieldTableName, setColumnStatsFieldTableName] = useState(null as string);
   const [filterForColumnStats, setFilterForColumnStats] = useState(null as QQueryFilter);

   ///////////////////////////////////////////////////
   // state used for basic/advanced query component //
   ///////////////////////////////////////////////////
   const [mode, setMode] = useState(defaultView.mode);
   const basicAndAdvancedQueryControlsRef = useRef();

   /////////////////////////////////////////////////////////
   // a timer used to help avoid accidental double-clicks //
   /////////////////////////////////////////////////////////
   const timerInstance = useRef({timer: null});

   //////////////////////////////////////////////////////////////////////////////////////////////////////
   // state used to avoid showing results from an "old" query, that finishes loading after a newer one //
   //////////////////////////////////////////////////////////////////////////////////////////////////////
   const [latestQueryId, setLatestQueryId] = useState(0);
   const [countResults, setCountResults] = useState({} as any);
   const [receivedCountTimestamp, setReceivedCountTimestamp] = useState(new Date());
   const [queryResults, setQueryResults] = useState({} as any);
   const [latestQueryResults, setLatestQueryResults] = useState(null as QRecord[]);
   const [receivedQueryTimestamp, setReceivedQueryTimestamp] = useState(new Date());
   const [queryErrors, setQueryErrors] = useState({} as any);
   const [receivedQueryErrorTimestamp, setReceivedQueryErrorTimestamp] = useState(new Date());

   /////////////////////////////
   // page context references //
   /////////////////////////////
   const {accentColor, accentColorLight, setPageHeader, recordAnalytics, dotMenuOpen, keyboardHelpOpen, modalStack} = useContext(QContext);

   const useSavedViewsResult = useSavedViews({qController, metaData, tableMetaData});

   //////////////////////
   // ole' faithful... //
   //////////////////////
   const [, forceUpdate] = useReducer((x) => x + 1, 0);

   //////////////////////////////////////////////////////////////////
   // we use our own header - so clear out the context page header //
   //////////////////////////////////////////////////////////////////
   useEffect(() =>
   {
      if (!isModal)
      {
         setPageHeader(null);
      }
   }, [isModal, setPageHeader]);

   ///////////////////////////////////////////////////////////////////////////////////////////
   // add a LoadingState object, in case the initial loads (of meta data and view) are slow //
   ///////////////////////////////////////////////////////////////////////////////////////////
   const [pageLoadingState, _] = useState(new LoadingState(forceUpdate));

   /////////////////////////////////////////////////////////////////////////////////
   // use this to make changes to the queryFilter more likely to re-run the query //
   /////////////////////////////////////////////////////////////////////////////////
   const [filterHash, setFilterHash] = useState("");

   ///////////////////////////////////////////////////////////////////////////////////////////
   // handle first render after changing tables - reset state based on defaults from localStorage //
   ///////////////////////////////////////////////////////////////////////////////////////////
   useEffect(() =>
   {
      if (isFirstRenderAfterChangingTables)
      {
         setIsFirstRenderAfterChangingTables(false);
         console.log("This is the first render after changing tables - so - setting state based on 'defaults' from localStorage");
         setView(defaultView);
      }
   }, [isFirstRenderAfterChangingTables, defaultView]);

   ////////////////////////////////////////////////////////////////////////
   // trigger initial update-table call after page-state goes into ready //
   ////////////////////////////////////////////////////////////////////////
   useEffect(() =>
   {
      if (pageState == "ready")
      {
         pageLoadingState.setNotLoading();

         if (!tableVariantPromptOpen)
         {
            updateTable("pageState is now ready");
         }
      }
   }, [pageState, tableVariantPromptOpen]);

   /*******************************************************************************
    ** utility function to get the names of any join tables which are active,
    ** either as a visible column, or as a query criteria
    *******************************************************************************/
   const getVisibleJoinTables = (): Set<string> =>
   {
      const visibleJoinTables = new Set<string>();

      for (let i = 0; i < queryColumns?.columns.length; i++)
      {
         const column = queryColumns.columns[i];
         const fieldName = column.name;
         if (column.isVisible && fieldName.indexOf(".") > -1)
         {
            visibleJoinTables.add(fieldName.split(".")[0]);
         }
      }

      for (let i = 0; i < queryFilter?.criteria?.length; i++)
      {
         const criteria = queryFilter.criteria[i];
         const {criteriaIsValid} = validateCriteria(criteria, null);
         const fieldName = criteria.fieldName;
         if (criteriaIsValid && fieldName && fieldName.indexOf(".") > -1)
         {
            visibleJoinTables.add(fieldName.split(".")[0]);
         }
      }

      return (visibleJoinTables);
   };

   /*******************************************************************************
    **
    *******************************************************************************/
   const isJoinMany = (tableMetaData: QTableMetaData, visibleJoinTables: Set<string>): boolean =>
   {
      if (tableMetaData?.exposedJoins)
      {
         for (let i = 0; i < tableMetaData.exposedJoins.length; i++)
         {
            const join = tableMetaData.exposedJoins[i];
            if (visibleJoinTables.has(join.joinTable.name))
            {
               if (join.isMany)
               {
                  return (true);
               }
            }
         }
      }
      return (false);
   };


   /*******************************************************************************
    **
    *******************************************************************************/
   function openExportMenu(event: any)
   {
      if (!metaData.tables?.get(tableMetaData.name)?.capabilities?.has(Capability.TABLE_EXPORT))
      {
         setAlertContent("Exports are not allowed for this table.");
         return;
      }

      setExportMenuAnchorElement(event.currentTarget);
   }


   /*******************************************************************************
    **
    *******************************************************************************/
   function closeExportMenu()
   {
      setExportMenuAnchorElement(null);
   }


   ///////////////////////////////////////////
   // build the export menu, for the header //
   ///////////////////////////////////////////
   let exportMenu = <></>;
   try
   {
      const exportMenuItemRestProps =
         {
            tableMetaData: tableMetaData,
            totalRecords: totalRecords,
            columnsModel: columnsModel,
            columnVisibilityModel: columnVisibilityModel,
            queryFilter: FilterUtils.prepQueryFilterForBackend(tableMetaData, queryFilter)
         };

      exportMenu = (<>
         <IconButton sx={{p: 0, fontSize: "0.75rem", mb: 1, color: colors.secondary.main, fontVariationSettings: "'wght' 100"}} onClick={openExportMenu}><Icon fontSize="small">save_alt</Icon></IconButton>
         <Menu
            anchorEl={exportMenuAnchorElement}
            anchorOrigin={{vertical: "bottom", horizontal: "center"}}
            transformOrigin={{vertical: "top", horizontal: "center"}}
            open={exportMenuAnchorElement != null}
            onClose={closeExportMenu}
            sx={{top: "0.5rem"}}
            keepMounted>
            <ExportMenuItem format="csv" {...exportMenuItemRestProps} />
            <ExportMenuItem format="xlsx" {...exportMenuItemRestProps} />
            <ExportMenuItem format="json" {...exportMenuItemRestProps} />
         </Menu>
      </>);
   }
   catch (e)
   {
      console.log("Error preparing export menu for page header: " + e);
   }

   /*******************************************************************************
    **
    *******************************************************************************/
   const getPageHeader = (tableMetaData: QTableMetaData, visibleJoinTables: Set<string>, tableVariant: QTableVariant): string | JSX.Element =>
   {
      let label: string = tableMetaData?.label ?? "";

      if (currentSavedView?.values?.get("label"))
      {
         label += " / " + currentSavedView?.values?.get("label");
      }

      if (visibleJoinTables.size > 0)
      {
         let joinLabels = [];
         if (tableMetaData?.exposedJoins)
         {
            for (let i = 0; i < tableMetaData.exposedJoins.length; i++)
            {
               const join = tableMetaData.exposedJoins[i];
               if (visibleJoinTables.has(join.joinTable.name))
               {
                  joinLabels.push(join.label);
               }
            }
         }

         let joinLabelsString = joinLabels.join(", ");
         if (joinLabels.length == 2)
         {
            let lastCommaIndex = joinLabelsString.lastIndexOf(",");
            joinLabelsString = joinLabelsString.substring(0, lastCommaIndex) + " and " + joinLabelsString.substring(lastCommaIndex + 1);
         }
         if (joinLabels.length > 2)
         {
            let lastCommaIndex = joinLabelsString.lastIndexOf(",");
            joinLabelsString = joinLabelsString.substring(0, lastCommaIndex) + ", and " + joinLabelsString.substring(lastCommaIndex + 1);
         }

         let tooltipHTML = <div>
            You are viewing results from the {tableMetaData.label} table joined with {joinLabels.length} other table{joinLabels.length == 1 ? "" : "s"}:
            <ul style={{marginLeft: "1rem"}}>
               {joinLabels.map((name) => <li key={name}>{name}</li>)}
            </ul>
         </div>;

         return (
            <div>
               {label} {exportMenu}
               <CustomWidthTooltip title={tooltipHTML}>
                  <IconButton sx={{ml: "0.5rem", p: 0, fontSize: "0.5rem", mb: 1, color: "#9f9f9f", fontVariationSettings: "'wght' 100"}}><Icon fontSize="small">emergency</Icon></IconButton>
               </CustomWidthTooltip>
               {tableVariant && getTableVariantHeader(tableVariant)}
            </div>);
      }
      else
      {
         return (
            <div>
               {label} {exportMenu}
               {tableVariant && getTableVariantHeader(tableVariant)}
            </div>);
      }
   };

   /*******************************************************************************
    **
    *******************************************************************************/
   const getTableVariantHeader = (tableVariant: QTableVariant) =>
   {
      return (
         <Typography variant="h6" color="text" fontWeight="light">
            {tableMetaData?.variantTableLabel}: {tableVariant?.name}
            <Tooltip title={`Change ${tableMetaData?.variantTableLabel}`}>
               <IconButton onClick={promptForTableVariantSelection} sx={{p: 0, m: 0, ml: .5, mb: .5, color: "#9f9f9f", fontVariationSettings: "'weight' 100"}}><Icon fontSize="small">settings</Icon></IconButton>
            </Tooltip>
         </Typography>
      );
   };

   ///////////////////////
   // Keyboard handling //
   ///////////////////////
   useEffect(() =>
   {
      const down = (e: KeyboardEvent) =>
      {
         const type = (e.target as any).type;
         const validType = (type !== "text" && type !== "textarea" && type !== "input" && type !== "search");

         if (validType && !isModal && !dotMenuOpen && !keyboardHelpOpen && !activeModalProcess && (!modalStack || modalStack.length == 0))
         {
            if (!e.metaKey && !e.ctrlKey && e.key === "n" && table.capabilities.has(Capability.TABLE_INSERT) && table.insertPermission)
            {
               e.preventDefault();
               navigate(`${metaData?.getTablePathByName(tableName)}/create`);
            }
            else if (!e.metaKey && !e.ctrlKey && e.key === "r")
            {
               e.preventDefault();
               updateTable("'r' keyboard event");
            }
            /*
            // disable until we add a ... ref down to let us programmatically open Columns button
            else if (! e.metaKey && !e.ctrlKey && e.key === "c")
            {
               e.preventDefault()
               gridApiRef.current.showPreferences(GridPreferencePanelsValue.columns)
            }
            */
            else if (!e.metaKey && !e.ctrlKey && e.key === "f")
            {
               e.preventDefault();

               // @ts-ignore
               if (basicAndAdvancedQueryControlsRef?.current?.getCurrentMode() == "advanced")
               {
                  gridApiRef.current.showFilterPanel();
               }
            }
         }
      };

      document.addEventListener("keydown", down);
      return () =>
      {
         document.removeEventListener("keydown", down);
      };
   }, [isModal, dotMenuOpen, keyboardHelpOpen, metaData, activeModalProcess, modalStack]);


   /*******************************************************************************
    **
    *******************************************************************************/
   const urlLooksLikeProcess = (): boolean =>
   {
      return (pathParts[pathParts.length - 2] === tableName);
   };

   //////////////////////////////////////////////////////////////////////////////////////////////
   // monitor location changes - if our url looks like a savedView, then load that view, kinda //
   //////////////////////////////////////////////////////////////////////////////////////////////
   useEffect(() =>
   {
      try
      {
         /////////////////////////////////////////////////////////////////
         // the path for a savedView looks like: .../table/savedView/32 //
         // so if path has '/savedView/' get last parsed string         //
         /////////////////////////////////////////////////////////////////
         let currentSavedViewId = null as number;
         if (location.pathname.indexOf("/savedView/") != -1)
         {
            const parts = location.pathname.split("/");
            currentSavedViewId = Number.parseInt(parts[parts.length - 1]);
            setViewIdInLocation(currentSavedViewId);

            /////////////////////////////////////////////////////////////////////////////////////////////
            // in case page-state has already advanced to "ready" (e.g., and we're dealing with a user //
            // hitting back & forth between filters), then do a load of the new saved-view right here  //
            /////////////////////////////////////////////////////////////////////////////////////////////
            if (pageState == "ready")
            {
               handleSavedViewChange(currentSavedViewId);
            }
         }
         else if (!searchParams.has("filter"))
         {
            if (localStorage.getItem(currentSavedViewLocalStorageKey))
            {
               if (usage == "queryScreen")
               {
                  currentSavedViewId = Number.parseInt(localStorage.getItem(currentSavedViewLocalStorageKey));
                  navigate(`${metaData.getTablePathByName(tableName)}/savedView/${currentSavedViewId}`);
               }
            }
            else
            {
               doClearCurrentSavedView();
            }
         }
      }
      catch (e)
      {
         console.log(e);
      }
   }, [location]);


   /*******************************************************************************
    ** set the current view in state & local-storage - but do NOT update any
    ** child-state data.
    *******************************************************************************/
   const doSetView = (view: RecordQueryView): void =>
   {
      setView(view);
      const viewAsJSON = JSON.stringify(view);
      setViewAsJson(viewAsJSON);

      try
      {
         ////////////////////////////////////////////////////////////////////////////////////
         // in case there's an incomplete criteria in the view (e.g., w/o a fieldName),    //
         // don't store that in local storage - we don't want that, it's messy, and it     //
         // has caused fails in the past.  So, clone the view, and strip away such things. //
         ////////////////////////////////////////////////////////////////////////////////////
         const viewForLocalStorage: RecordQueryView = JSON.parse(viewAsJSON);
         if (viewForLocalStorage?.queryFilter?.criteria?.length > 0)
         {
            FilterUtils.stripAwayIncompleteCriteria(viewForLocalStorage.queryFilter);
         }
         localStorageSet(viewLocalStorageKey, JSON.stringify(viewForLocalStorage));
      }
      catch (e)
      {
         console.log("Error storing view in local storage: " + e);
      }
   };


   /*******************************************************************************
    **
    *******************************************************************************/
   const handleColumnVisibilityChange = (columnVisibilityModel: GridColumnVisibilityModel) =>
   {
      setColumnVisibilityModel(columnVisibilityModel);
      queryColumns.updateVisibility(columnVisibilityModel);

      view.queryColumns = queryColumns;
      doSetView(view);

      forceUpdate();
   };


   /*******************************************************************************
    ** function called by columns menu to turn a column on or off
    *******************************************************************************/
   const handleChangeOneColumnVisibility = (field: QFieldMetaData, table: QTableMetaData, newValue: boolean) =>
   {
      ///////////////////////////////////////
      // set the field's value in the view //
      ///////////////////////////////////////
      let fieldName = field.name;
      if (table && table.name != tableMetaData.name)
      {
         fieldName = `${table.name}.${field.name}`;
      }

      view.queryColumns.setIsVisible(fieldName, newValue);

      /////////////////////
      // update the grid //
      /////////////////////
      setColumnVisibilityModel(queryColumns.toColumnVisibilityModel());

      /////////////////////////////////////////////////
      // update the view (e.g., write local storage) //
      /////////////////////////////////////////////////
      doSetView(view);

      ///////////////////
      // ole' faithful //
      ///////////////////
      forceUpdate();
   };


   /*******************************************************************************
    **
    *******************************************************************************/
   const setupGridColumnModels = (metaData: QInstance, tableMetaData: QTableMetaData, queryColumns: QQueryColumns) =>
   {
      let linkBase = metaData.getTablePath(tableMetaData);
      if(linkBase)
      {
         linkBase += linkBase.endsWith("/") ? "" : "/";
      }
      const columns = DataGridUtils.setupGridColumns(tableMetaData, linkBase, metaData, "alphabetical");

      ///////////////////////////////////////////////
      // sort columns based on queryColumns object //
      ///////////////////////////////////////////////
      const columnSortValues = queryColumns.getColumnSortValues();
      columns.sort((a: GridColDef, b: GridColDef) =>
      {
         const aIndex = columnSortValues[a.field];
         const bIndex = columnSortValues[b.field];
         return aIndex - bIndex;
      });

      ///////////////////////////////////////////////////////////////////////
      // if there are column widths (e.g., from local storage), apply them //
      ///////////////////////////////////////////////////////////////////////
      const columnWidths = queryColumns.getColumnWidths();
      for (let i = 0; i < columns.length; i++)
      {
         const width = columnWidths[columns[i].field];
         if (width)
         {
            columns[i].width = width;
         }
      }

      setPinnedColumns(queryColumns.toGridPinnedColumns());
      setColumnVisibilityModel(queryColumns.toColumnVisibilityModel());
      setColumnsModel(columns);
   };


   /*******************************************************************************
    **
    *******************************************************************************/
   const promptForTableVariantSelection = () =>
   {
      setTableVariantPromptOpen(true);
   };


   /*******************************************************************************
    ** return array of table names that need ... added to query
    *******************************************************************************/
   const ensureOrderBysFromJoinTablesAreVisibleTables = (queryFilter: QQueryFilter, visibleJoinTablesParam?: Set<string>): string[] =>
   {
      const rs: string[] = [];
      const vjtToUse = visibleJoinTablesParam ?? visibleJoinTables;

      for (let i = 0; i < queryFilter?.orderBys?.length; i++)
      {
         const fieldName = queryFilter.orderBys[i].fieldName;
         if (fieldName != null && fieldName.indexOf(".") > -1)
         {
            const joinTableName = fieldName.replaceAll(/\..*/g, "");
            if (!vjtToUse.has(joinTableName))
            {
               const [field, fieldTable] = TableUtils.getFieldAndTable(tableMetaData, fieldName);
               handleChangeOneColumnVisibility(field, fieldTable, true);
               rs.push(fieldTable.name);
            }
         }
      }

      return (rs);
   };


   /*******************************************************************************
    ** Opens a new query screen in a new window with the current filter
    *******************************************************************************/
   const openFilterInNewWindow = () =>
   {
      let filterForBackend = JSON.parse(JSON.stringify(view.queryFilter));
      filterForBackend = FilterUtils.prepQueryFilterForBackend(tableMetaData, filterForBackend);
      const url = `${metaData?.getTablePathByName(tableName)}?filter=${encodeURIComponent(JSON.stringify(filterForBackend))}`;
      window.open(url);
   };


   /***************************************************************************
    *
    ***************************************************************************/
   const pushWarningAlert = (newMessage: string) =>
   {
      if (warningAlertList.indexOf(newMessage) == -1)
      {
         setWarningAlertList([...warningAlertList, newMessage]);
      }
   };


   /***************************************************************************
    *
    ***************************************************************************/
   const deleteWarningAlert = (index: number) =>
   {
      warningAlertList.splice(index, 1);
      setWarningAlertList([...warningAlertList]);
   };


   /*******************************************************************************
    ** This is the method that actually executes a query to update the data in the table.
    *******************************************************************************/
   const updateTable = (reason?: string, clearOutCount = true) =>
   {
      if (pageState != "ready")
      {
         console.log(`In updateTable, but pageSate[${pageState}] is not ready, so returning with noop`);
         return;
      }

      if (tableMetaData?.usesVariants && (!tableVariant || tableVariantPromptOpen))
      {
         console.log("In updateTable, but a variant is needed, so returning with noop");
         return;
      }

      /////////////////////////////////////////////////////////////////////////////////////////////////
      // if any values in the query are of type "FilterVariableExpression", display an error showing //
      // that a backend query cannot be made because of missing values for that expression           //
      /////////////////////////////////////////////////////////////////////////////////////////////////
      setWarningAlert(null);
      for (var i = 0; i < queryFilter?.criteria?.length; i++)
      {
         for (var j = 0; j < queryFilter?.criteria[i]?.values?.length; j++)
         {
            const value = queryFilter.criteria[i].values[j];
            if (value?.type == "FilterVariableExpression")
            {
               pushWarningAlert("Cannot perform query because of a missing value for a variable.");
               setLoading(false);
               setRows([]);
               return;
            }
         }
      }

      doRecordAnalytics({category: "tableEvents", action: "query", label: tableMetaData.label});

      console.log(`In updateTable for ${reason} ${JSON.stringify(queryFilter)}`);
      setLoading(true);
      setRows([]);
      (async () =>
      {
         /////////////////////////////////////////////////////////////////////////////////////
         // build filter object to submit to backend count & query endpoints                //
         // copy the orderBys & operator into it - but we'll build its criteria one-by-one, //
         // as clones, as we'll need to tweak them a bit                                    //
         /////////////////////////////////////////////////////////////////////////////////////
         const filterForBackend = FilterUtils.prepQueryFilterForBackend(tableMetaData, queryFilter, pageNumber, rowsPerPage);

         //////////////////////////////////////////
         // figure out joins to use in the query //
         //////////////////////////////////////////
         let queryJoins = null;
         if (tableMetaData?.exposedJoins)
         {
            const visibleJoinTables = getVisibleJoinTables();
            const tablesToAdd = ensureOrderBysFromJoinTablesAreVisibleTables(queryFilter, visibleJoinTables);

            tablesToAdd?.forEach(t => visibleJoinTables.add(t));

            queryJoins = TableUtils.getQueryJoins(tableMetaData, visibleJoinTables);
         }

         //////////////////////////////////////////////////////////////////////////////////////////////////
         // assign a new query id to the query being issued here.  then run both the count & query async //
         // and when they load, store their results associated with this id.                             //
         //////////////////////////////////////////////////////////////////////////////////////////////////
         const thisQueryId = latestQueryId + 1;
         setLatestQueryId(thisQueryId);

         console.log(`Issuing query: ${thisQueryId}`);
         if (tableMetaData.capabilities.has(Capability.TABLE_COUNT))
         {
            if (clearOutCount)
            {
               setTotalRecords(null);
               setDistinctRecords(null);
            }

            let includeDistinct = isJoinMany(tableMetaData, getVisibleJoinTables());
            // qController.count(tableName, filterForBackend, queryJoins, includeDistinct, tableVariant).then(([count, distinctCount]) =>
            qControllerV1.count(tableName, apiVersion, filterForBackend, queryJoins, includeDistinct, tableVariant).then(([count, distinctCount]) =>
            {
               console.log(`Received count results for query ${thisQueryId}: ${count} ${distinctCount}`);
               countResults[thisQueryId] = [];
               countResults[thisQueryId].push(count);
               countResults[thisQueryId].push(distinctCount);
               setCountResults(countResults);
               setReceivedCountTimestamp(new Date());
            });
         }

         if (!tableMetaData.capabilities.has(Capability.TABLE_QUERY))
         {
            console.log("Cannot update table - it does not have QUERY capability.");
            return;
         }

         setLastFetchedQFilterJSON(JSON.stringify(queryFilter));
         setLastFetchedVariant(tableVariant);
         // qController.query(tableName, filterForBackend, queryJoins, tableVariant).then((results) =>
         qControllerV1.query(tableName, apiVersion, filterForBackend, queryJoins, tableVariant).then((results) =>
         {
            console.log(`Received results for query ${thisQueryId}`);
            queryResults[thisQueryId] = results;
            setQueryResults(queryResults);
            setReceivedQueryTimestamp(new Date());
         })
            .catch((error) =>
            {
               console.log(`Received error for query ${thisQueryId}`);
               console.log(error);

               let errorMessage;
               if (error && error.message)
               {
                  errorMessage = error.message;
               }
               else if (error && error.response && error.response.data && error.response.data.error)
               {
                  errorMessage = error.response.data.error;
               }
               else
               {
                  errorMessage = "Unexpected error running query";
               }

               queryErrors[thisQueryId] = errorMessage;
               setQueryErrors(queryErrors);
               setReceivedQueryErrorTimestamp(new Date());

               throw error;
            });
      })();
   };

   /////////////////////////////////////////////////////////////////////////////////////////////////////////////
   // if, after a column was turned on or off, the set of visibleJoinTables is changed, then update the table //
   // check this on each render - it should only be different if there was a change.  note that putting this  //
   // in handleColumnVisibilityChange "didn't work" - it was always "behind by one" (like, maybe data grid    //
   // calls that function before it updates the visible model or some-such).                                  //
   /////////////////////////////////////////////////////////////////////////////////////////////////////////////
   const newVisibleJoinTables = getVisibleJoinTables();
   if (JSON.stringify([...newVisibleJoinTables.keys()]) != JSON.stringify([...visibleJoinTables.keys()]))
   {
      updateTable("visible joins change");
      setVisibleJoinTables(newVisibleJoinTables);
   }

   ///////////////////////////
   // display count results //
   ///////////////////////////
   useEffect(() =>
   {
      if (countResults[latestQueryId] == null || countResults[latestQueryId].length == 0)
      {
         ///////////////////////////////////////////////
         // see same idea in displaying query results //
         ///////////////////////////////////////////////
         console.log(`No count results for id ${latestQueryId}...`);
         return;
      }
      try
      {
         setTotalRecords(countResults[latestQueryId][0]);
         setDistinctRecords(countResults[latestQueryId][1]);
         delete countResults[latestQueryId];
      }
      catch (e)
      {
         console.log(e);
      }
   }, [receivedCountTimestamp]);

   ///////////////////////////
   // display query results //
   ///////////////////////////
   useEffect(() =>
   {
      if (!queryResults[latestQueryId])
      {
         ///////////////////////////////////////////////////////////////////////////////////////////
         // to avoid showing results from an "older" query (e.g., one that was slow, and returned //
         // AFTER a newer one) only ever show results here for the latestQueryId that was issued. //
         ///////////////////////////////////////////////////////////////////////////////////////////
         console.log(`No query results for id ${latestQueryId}...`);
         return;
      }

      console.log(`Outputting results for query ${latestQueryId}...`);
      const results = queryResults[latestQueryId];
      delete queryResults[latestQueryId];
      setLatestQueryResults(results);

      ///////////////////////////////////////////////////////////
      // count how many distinct primary keys are on this page //
      ///////////////////////////////////////////////////////////
      let distinctPrimaryKeySet = new Set<string>();
      for (let i = 0; i < results.length; i++)
      {
         distinctPrimaryKeySet.add(results[i].values.get(tableMetaData.primaryKeyField) as string);
      }
      setDistinctRecordsOnPageCount(distinctPrimaryKeySet.size);

      ////////////////////////////////
      // make the rows for the grid //
      ////////////////////////////////
      const rows = DataGridUtils.makeRows(results, tableMetaData, tableVariant);
      setRows(rows);

      setLoading(false);
      setAlertContent(null);
      forceUpdate();
   }, [receivedQueryTimestamp]);

   /////////////////////////
   // display query error //
   /////////////////////////
   useEffect(() =>
   {
      if (!queryErrors[latestQueryId])
      {
         ///////////////////////////////
         // same logic as for success //
         ///////////////////////////////
         console.log(`No query error for id ${latestQueryId}...`);
         return;
      }

      console.log(`Outputting error for query ${latestQueryId}...`);
      const errorMessage = queryErrors[latestQueryId];
      delete queryErrors[latestQueryId];
      setLoading(false);
      setAlertContent(errorMessage);

   }, [receivedQueryErrorTimestamp]);


   /*******************************************************************************
    ** Event handler from grid - when page number changes
    *******************************************************************************/
   const handlePageNumberChange = (page: number) =>
   {
      setPageNumber(page);
      setLoading(true);
   };

   /*******************************************************************************
    ** Event handler from grid - when rows per page changes
    *******************************************************************************/
   const handleRowsPerPageChange = (size: number) =>
   {
      setRowsPerPage(size);
      setLoading(true);

      view.rowsPerPage = size;
      doSetView(view);
   };

   /*******************************************************************************
    ** event handler from grid - when user changes pins
    *******************************************************************************/
   const handlePinnedColumnsChange = (pinnedColumns: GridPinnedColumns) =>
   {
      setPinnedColumns(pinnedColumns);
      queryColumns.setPinnedLeftColumns(pinnedColumns.left);
      queryColumns.setPinnedRightColumns(pinnedColumns.right);

      view.queryColumns = queryColumns;
      doSetView(view);
   };

   /*******************************************************************************
    ** event handler from grid - when "state" changes - which we use just for density
    *******************************************************************************/
   const handleStateChange = (state: GridState, event: MuiEvent, details: GridCallbackDetails) =>
   {
      if (state && state.density && state.density.value !== density)
      {
         setDensity(state.density.value);
         localStorageSet(densityLocalStorageKey, JSON.stringify(state.density.value));
      }
   };

   /*******************************************************************************
    ** event handler from grid - for when user clicks a row.
    *******************************************************************************/
   const handleRowClick = (params: GridRowParams, event: MuiEvent<React.MouseEvent>, details: GridCallbackDetails) =>
   {
      /////////////////////////////////////////////////////////////////
      // if a grid preference window is open, ignore and reset timer //
      /////////////////////////////////////////////////////////////////
      console.log(gridPreferencesWindow);
      if (gridPreferencesWindow !== undefined)
      {
         clearTimeout(timerInstance.current.timer);
         return;
      }

      let id = encodeURIComponent(params.id);
      if (table.primaryKeyField !== "id")
      {
         id = encodeURIComponent(params.row[tableMetaData.primaryKeyField]);
      }
      const tablePath = `${metaData.getTablePathByName(table.name)}/${id}`;
      DataGridUtils.handleRowClick(tablePath, event, gridMouseDownX, gridMouseDownY, navigate, timerInstance);
   };

   /*******************************************************************************
    ** event handler from grid - for when selection (checked rows) changes.
    *******************************************************************************/
   const handleSelectionChanged = (selectionModel: GridSelectionModel, details: GridCallbackDetails) =>
   {
      ////////////////////////////////////////////////////
      // since we manage this object, we must re-set it //
      ////////////////////////////////////////////////////
      setRowSelectionModel(selectionModel);

      let checkboxesChecked = 0;
      let selectedPrimaryKeys = new Set<string>();
      selectionModel.forEach((value: GridRowId, index: number) =>
      {
         checkboxesChecked++;
         const valueToPush = latestQueryResults[value as number].values.get(tableMetaData.primaryKeyField);
         selectedPrimaryKeys.add(valueToPush as string);
      });
      setSelectedIds([...selectedPrimaryKeys.values()]);

      if (checkboxesChecked === rowsPerPage)
      {
         setSelectFullFilterState("checked");
      }
      else
      {
         setSelectFullFilterState("n/a");
      }
   };

   /*******************************************************************************
    ** event handler from grid - for when the order of columns changes
    *******************************************************************************/
   const handleColumnOrderChange = (columnOrderChangeParams: GridColumnOrderChangeParams) =>
   {
      /////////////////////////////////////////////////////////////////////////////////////
      // get current state from gridApiRef - as the changeParams only have the delta     //
      // and we don't want to worry about being out of sync - just reset fully each time //
      /////////////////////////////////////////////////////////////////////////////////////
      const columnOrdering = gridApiRef.current.state.columns.all;
      queryColumns.updateColumnOrder(columnOrdering);

      view.queryColumns = queryColumns;
      doSetView(view);
   };


   /*******************************************************************************
    ** event handler from grid - for when user resizes a column
    *******************************************************************************/
   const handleColumnResize = (params: GridColumnResizeParams, event: MuiEvent, details: GridCallbackDetails) =>
   {
      queryColumns.updateColumnWidth(params.colDef.field, params.width);

      view.queryColumns = queryColumns;
      doSetView(view);
   };


   /*******************************************************************************
    ** event handler from grid - for when the sort-model changes (e.g., user clicks
    ** a column header to re-sort table).
    *******************************************************************************/
   const handleSortChange = (gridSort: GridSortModel) =>
   {
      ///////////////////////////////////////
      // store the sort model for the grid //
      ///////////////////////////////////////
      setColumnSortModel(gridSort);

      ////////////////////////////////////////////////
      // convert the grid's sort to qqq-filter sort //
      ////////////////////////////////////////////////
      queryFilter.orderBys = [];
      for (let i = 0; i < gridSort?.length; i++)
      {
         const fieldName = gridSort[i].field;
         const isAscending = gridSort[i].sort == "asc";
         queryFilter.orderBys.push(new QFilterOrderBy(fieldName, isAscending));
      }

      //////////////////////////////////////////////////////////
      // set a default order-by, if none is otherwise present //
      //////////////////////////////////////////////////////////
      if (queryFilter.orderBys.length == 0)
      {
         queryFilter.orderBys.push(new QFilterOrderBy(tableMetaData.primaryKeyField, false));
      }

      ////////////////////////////////
      // store the new query filter //
      ////////////////////////////////
      doSetQueryFilter(queryFilter);
   };


   /*******************************************************************************
    **
    *******************************************************************************/
   const handleColumnHeaderClick = (params: GridColumnHeaderParams, event: MuiEvent, details: GridCallbackDetails): void =>
   {
      event.defaultMuiPrevented = true;
   };


   /*******************************************************************************
    ** bigger than doSetView - this method does call doSetView, but then also
    ** updates all other related state on the screen from the view.
    *******************************************************************************/
   const activateView = (view: RecordQueryView): void =>
   {
      /////////////////////////////////////////////////////////////////////////////////////////////
      // pass the 'isFromActivateView' flag into these functions - so that they don't try to set //
      // the filter (or columns) back into the old view.                                         //
      /////////////////////////////////////////////////////////////////////////////////////////////
      doSetQueryFilter(view.queryFilter, true);
      doSetQueryColumns(view.queryColumns, true);

      setRowsPerPage(view.rowsPerPage ?? defaultRowsPerPage);
      setMode(view.mode ?? defaultMode);
      setQuickFilterFieldNames(view.quickFilterFieldNames ?? []); // todo not i think ?? getDefaultQuickFilterFieldNames(tableMetaData));

      //////////////////////////////////////////////////////////////////////////////////////////////////
      // do this last - in case anything in the view got modified in any of those other doSet methods //
      //////////////////////////////////////////////////////////////////////////////////////////////////
      doSetView(view);

      ///////////////////////////////////////////////////////////////////////////////////////////////////////
      // do this in a timeout - so the current view can get set into state properly, before it potentially //
      // gets modified inside these calls (e.g., if a new field gets turned on)                            //
      ///////////////////////////////////////////////////////////////////////////////////////////////////////
      // @ts-ignore
      setTimeout(() => basicAndAdvancedQueryControlsRef?.current?.ensureAllFilterCriteriaAreActiveQuickFilters(view.queryFilter, "activatedView"));
   };


   /*******************************************************************************
    ** Wrapper around setQueryFilter that also puts it in the view, and calls doSetView
    *******************************************************************************/
   const doSetQueryFilter = (queryFilter: QQueryFilter, isFromActivateView = false): void =>
   {
      console.log(`Setting a new query filter: ${JSON.stringify(queryFilter)}`);

      ///////////////////////////////////////////////////
      // when we have a new filter, go back to page 0. //
      ///////////////////////////////////////////////////
      setPageNumber(0);

      ///////////////////////////////////////////////////
      // in case there's no orderBys, set default here //
      ///////////////////////////////////////////////////
      if (!queryFilter.orderBys || queryFilter.orderBys.length == 0)
      {
         queryFilter.orderBys = [new QFilterOrderBy(tableMetaData?.primaryKeyField, false)];
         view.queryFilter = queryFilter;
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////
      // in case the order-by is from a join table, and that table doesn't have any visible fields, //
      // then activate the order-by field itself                                                    //
      ////////////////////////////////////////////////////////////////////////////////////////////////
      ensureOrderBysFromJoinTablesAreVisibleTables(queryFilter);

      //////////////////////////////
      // set the filter state var //
      //////////////////////////////
      setQueryFilter(queryFilter);

      ///////////////////////////////////////////////////////
      // propagate filter's orderBy into grid's sort model //
      ///////////////////////////////////////////////////////
      const gridSort = FilterUtils.getGridSortFromQueryFilter(queryFilter);
      setColumnSortModel(gridSort);

      ///////////////////////////////////////////////
      // put this query filter in the current view //
      ///////////////////////////////////////////////
      if (!isFromActivateView)
      {
         view.queryFilter = queryFilter;
         doSetView(view);
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
      // this force-update causes a re-render that'll see the changed filter hash/json string, and make an updateTable run (if appropriate) //
      ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
      forceUpdate();
   };

   /*******************************************************************************
    ** Wrapper around setQueryColumns that also sets column models for the grid, puts
    ** updated queryColumns in the view, and calls doSetView
    *******************************************************************************/
   const doSetQueryColumns = (queryColumns: QQueryColumns, isFromActivateView = false): void =>
   {
      ///////////////////////////////////////////////////////////////////////////////////////
      // if we didn't get queryColumns from our view, it should be a PreLoadQueryColumns - //
      // so that means we should now replace it with defaults for the table.               //
      ///////////////////////////////////////////////////////////////////////////////////////
      if (queryColumns instanceof PreLoadQueryColumns || queryColumns.columns.length == 0)
      {
         console.log(`Building new default QQueryColumns for table [${tableMetaData.name}]`);
         queryColumns = QQueryColumns.buildDefaultForTable(tableMetaData);
         view.queryColumns = queryColumns;
      }

      setQueryColumns(queryColumns);

      ////////////////////////////////
      // set the DataGridPro models //
      ////////////////////////////////
      setupGridColumnModels(metaData, tableMetaData, queryColumns);
      // const [rowsPerPage, setRowsPerPage] = useState(defaultRowsPerPage);

      ///////////////////////////////////////////
      // put these columns in the current view //
      ///////////////////////////////////////////
      if (!isFromActivateView)
      {
         view.queryColumns = queryColumns;
         doSetView(view);
      }
   };


   /*******************************************************************************
    ** Event handler from BasicAndAdvancedQueryControls for when quickFilterFields change
    ** or other times we need to change them (e.g., activating a view)
    *******************************************************************************/
   const doSetQuickFilterFieldNames = (names: string[]): void =>
   {
      setQuickFilterFieldNames([...(names ?? [])]);

      view.quickFilterFieldNames = names;
      doSetView(view);
   };


   /*******************************************************************************
    ** Wrapper around setMode - places it into the view and state.
    *******************************************************************************/
   const doSetMode = (newValue: string) =>
   {
      setMode(newValue);

      view.mode = newValue;
      doSetView(view);
   };


   /*******************************************************************************
    ** Helper function for launching processes - counts selected records.
    *******************************************************************************/
   const getNoOfSelectedRecords = () =>
   {
      if (selectFullFilterState === "filter")
      {
         if (isJoinMany(tableMetaData, getVisibleJoinTables()))
         {
            return (distinctRecords);
         }
         return (totalRecords);
      }

      return (selectedIds.length);
   };

   /*******************************************************************************
    ** get a query-string to put on the url to indicate what records are going into
    ** a process.
    *******************************************************************************/
   const getRecordsQueryString = () =>
   {
      if (selectFullFilterState === "filter")
      {
         const filterForBackend = FilterUtils.prepQueryFilterForBackend(tableMetaData, queryFilter);
         filterForBackend.skip = 0;
         filterForBackend.limit = null;
         return `?recordsParam=filterJSON&filterJSON=${encodeURIComponent(JSON.stringify(filterForBackend))}`;
      }

      if (selectFullFilterState === "filterSubset")
      {
         const filterForBackend = FilterUtils.prepQueryFilterForBackend(tableMetaData, queryFilter);
         filterForBackend.skip = 0;
         filterForBackend.limit = selectionSubsetSize;
         return `?recordsParam=filterJSON&filterJSON=${encodeURIComponent(JSON.stringify(filterForBackend))}`;
      }

      if (selectedIds.length > 0)
      {
         return `?recordsParam=recordIds&recordIds=${selectedIds.map(r => encodeURIComponent(r)).join(",")}`;
      }

      return "";
   };


   /*******************************************************************************
    ** launch/open a modal process.  Ends up navigating to the process's path w/
    ** records selected via query string.
    *******************************************************************************/
   const openModalProcess = (process: QProcessMetaData = null) =>
   {
      if (selectFullFilterState === "filter")
      {
         const filterForBackend = FilterUtils.prepQueryFilterForBackend(tableMetaData, queryFilter);
         filterForBackend.skip = 0;
         filterForBackend.limit = null;
         setRecordIdsForProcess(filterForBackend);
      }
      else if (selectFullFilterState === "filterSubset")
      {
         const filterForBackend = FilterUtils.prepQueryFilterForBackend(tableMetaData, queryFilter);
         filterForBackend.skip = 0;
         filterForBackend.limit = selectionSubsetSize;
         setRecordIdsForProcess(filterForBackend);
      }
      else if (selectedIds.length > 0)
      {
         setRecordIdsForProcess(selectedIds);
      }
      else
      {
         setRecordIdsForProcess([]);
      }

      navigate(`${metaData?.getTablePathByName(tableName)}/${process.name}${getRecordsQueryString()}`);
   };


   /*******************************************************************************
    ** close callback for modal processes
    *******************************************************************************/
   const closeModalProcess = (event: object, reason: string) =>
   {
      if (reason === "backdropClick" || reason === "escapeKeyDown")
      {
         return;
      }

      /////////////////////////////////////////////////////////////////////////
      // when closing a modal process, navigate up to the table being viewed //
      /////////////////////////////////////////////////////////////////////////
      const newPath = location.pathname.split("/");
      newPath.pop();
      navigate(newPath.join("/"));

      updateTable("close modal process");
   };


   /*******************************************************************************
    ** function to open one of the bulk (insert/edit/delete) processes.
    *******************************************************************************/
   const openBulkProcess = (processNamePart: "Insert" | "Edit" | "Delete" | "EditWithFile", processLabelPart: "Load" | "Edit" | "Delete" | "Edit With File") =>
   {
      const processList = allTableProcesses.filter(p => p.name.endsWith(`.bulk${processNamePart}`));
      if (processList.length > 0)
      {
         openModalProcess(processList[0]);
      }
      else
      {
         setAlertContent(`Could not find Bulk ${processLabelPart} process for this table.`);
      }
   };

   /*******************************************************************************
    ** Event handler for the bulk-load process being selected
    *******************************************************************************/
   const bulkLoadClicked = () =>
   {
      openBulkProcess("Insert", "Load");
   };


   /*******************************************************************************
    ** Event handler for the bulk-edit process being selected
    *******************************************************************************/
   const bulkEditClicked = () =>
   {
      if (getNoOfSelectedRecords() === 0)
      {
         setAlertContent("No records were selected to Bulk Edit.");
         return;
      }
      openBulkProcess("Edit", "Edit");
   };


   /*******************************************************************************
    ** Event handler for the bulk-edit-with-file process being selected
    *******************************************************************************/
   const bulkEditWithFileClicked = () =>
   {
      openBulkProcess("EditWithFile", "Edit With File");
   };


   /*******************************************************************************
    ** Event handler for the bulk-delete process being selected
    *******************************************************************************/
   const bulkDeleteClicked = () =>
   {
      if (getNoOfSelectedRecords() === 0)
      {
         setAlertContent("No records were selected to Bulk Delete.");
         return;
      }
      openBulkProcess("Delete", "Delete");
   };


   /*******************************************************************************
    ** Event handler for selecting a process from the menu
    *******************************************************************************/
   const processClicked = (process: QProcessMetaData) =>
   {
      if (process.minInputRecords != null && process.minInputRecords > 0 && getNoOfSelectedRecords() === 0)
      {
         setAlertContent(`No records were selected for the process: ${process.label}`);
         return;
      }
      else if (process.minInputRecords != null && getNoOfSelectedRecords() < process.minInputRecords)
      {
         setAlertContent(`Too few records were selected for the process: ${process.label}.  A minimum of ${process.minInputRecords} is required.`);
         return;
      }
      else if (process.maxInputRecords != null && getNoOfSelectedRecords() > process.maxInputRecords)
      {
         setAlertContent(`Too many records were selected for the process: ${process.label}.  A maximum of ${process.maxInputRecords} is allowed.`);
         return;
      }

      // todo - let the process specify that it needs initial rows - err if none selected.
      //  alternatively, let a process itself have an initial screen to select rows...
      openModalProcess(process);
   };


   //////////////////////////////////////////////
   // custom pagination component for DataGrid //
   //////////////////////////////////////////////
   function CustomPagination()
   {
      return (<CustomPaginationComponent
         tableMetaData={tableMetaData}
         rows={rows}
         totalRecords={totalRecords}
         distinctRecords={distinctRecords}
         pageNumber={pageNumber}
         rowsPerPage={rowsPerPage}
         loading={loading}
         isJoinMany={isJoinMany(tableMetaData, getVisibleJoinTables())}
         handlePageChange={handlePageNumberChange}
         handleRowsPerPageChange={handleRowsPerPageChange}
      />);
   }

   /////////////////////////////////////////
   // custom loading overlay for DataGrid //
   /////////////////////////////////////////
   function CustomLoadingOverlay()
   {
      return (
         <LinearProgress color="info" />
      );
   }

   /*******************************************************************************
    ** wrapper around setting current saved view (as a QRecord) - which also activates
    ** that view.
    *******************************************************************************/
   const doSetCurrentSavedView = (savedViewRecord: QRecord) =>
   {
      if (savedViewRecord == null)
      {
         console.log("doSetCurrentView called with a null view record - calling doClearCurrentSavedView, and activating tableDefaultView instead.");
         doClearCurrentSavedView();
         activateView(buildTableDefaultView(tableMetaData));
         return;
      }

      setCurrentSavedView(savedViewRecord);

      const viewJson = savedViewRecord.values.get("viewJson");
      const newView = RecordQueryView.buildFromJSON(viewJson);

      activateView(newView);

      ////////////////////////////////////////////////////////////////
      // todo can/should/does this move into the view's "identity"? //
      ////////////////////////////////////////////////////////////////
      localStorageSet(currentSavedViewLocalStorageKey, `${savedViewRecord.values.get("id")}`);
   };


   /*******************************************************************************
    ** wrapper around un-setting current saved view and removing its id from local-stroage
    *******************************************************************************/
   const doClearCurrentSavedView = () =>
   {
      setCurrentSavedView(null);
      localStorageRemove(currentSavedViewLocalStorageKey);
   };


   /*******************************************************************************
    **
    *******************************************************************************/
   const buildTableDefaultView = (tableMetaData: QTableMetaData): RecordQueryView =>
   {
      const newDefaultView = new RecordQueryView();
      newDefaultView.queryFilter = new QQueryFilter([], [new QFilterOrderBy(tableMetaData.primaryKeyField, false)]);
      newDefaultView.queryColumns = QQueryColumns.buildDefaultForTable(tableMetaData);
      newDefaultView.viewIdentity = "empty";
      newDefaultView.rowsPerPage = defaultRowsPerPage;
      newDefaultView.quickFilterFieldNames = [];
      newDefaultView.mode = defaultMode;
      return newDefaultView;
   };

   /*******************************************************************************
    ** event handler for SavedViews component, to handle user selecting a view
    ** (or clearing / selecting new)
    *******************************************************************************/
   const handleSavedViewChange = async (selectedSavedViewId: number) =>
   {
      ////////////////////////////////////////////////////////////////////////////////////////
      // clear warnings if changing views - they should never persist between views, right? //
      // also - this is the callback for the 'reset all changes' link, which should do it.  //
      ////////////////////////////////////////////////////////////////////////////////////////
      setWarningAlertList([]);

      if (selectedSavedViewId != null)
      {
         doRecordAnalytics({category: "tableEvents", action: "activateSavedView", label: tableMetaData.label});

         //////////////////////////////////////////////
         // fetch, then activate the selected filter //
         //////////////////////////////////////////////
         setLoading(true);
         setLoadingSavedView(true);
         const qRecord = await fetchSavedView(selectedSavedViewId);
         setLoading(false);
         setLoadingSavedView(false);
         doSetCurrentSavedView(qRecord);
      }
      else
      {
         /////////////////////////////////
         // this is 'new view' - right? //
         /////////////////////////////////
         doRecordAnalytics({category: "tableEvents", action: "activateNewView", label: tableMetaData.label});

         //////////////////////////////
         // wipe away the saved view //
         //////////////////////////////
         setCurrentSavedView(null);
         localStorageRemove(currentSavedViewLocalStorageKey);

         ///////////////////////////////////////////////
         // activate a new default view for the table //
         ///////////////////////////////////////////////
         activateView(buildTableDefaultView(tableMetaData));
      }
   };

   /*******************************************************************************
    ** utility function to fetch a saved view from the backend.
    *******************************************************************************/
   const fetchSavedView = async (id: number): Promise<QRecord> =>
   {
      let qRecord = null;
      const formData = new FormData();
      formData.append("id", id);
      formData.append(QController.STEP_TIMEOUT_MILLIS_PARAM_NAME, 60 * 1000);
      const processResult = await qController.processInit("querySavedView", formData, qController.defaultMultipartFormDataHeaders());
      if (processResult instanceof QJobError)
      {
         const jobError = processResult as QJobError;
         console.error("Could not retrieve saved view: " + jobError.userFacingError);
         setAlertContent("There was an error loading the selected view.");
      }
      else
      {
         const result = processResult as QJobComplete;
         qRecord = new QRecord(result.values.savedViewList[0]);

         //////////////////////////////////////////////////////////////////////////////
         // make the view json a good and healthy object for the UI here.            //
         // such as, making values be what they'd be in the UI (not necessarily      //
         // what they're like in the backend); similarly, set anything that's unset. //
         //////////////////////////////////////////////////////////////////////////////
         const viewJson = qRecord.values.get("viewJson");
         const newView = RecordQueryView.buildFromJSON(viewJson);

         setWarningAlert(null);
         reconcileCurrentTableMetaDataWithView(newView, "loadingSavedView");

         newView.viewIdentity = "savedView:" + id;

         ///////////////////////////////////////////////////////////////////
         // e.g., translate possible values from ids to objects w/ labels //
         ///////////////////////////////////////////////////////////////////
         await FilterUtils.cleanupValuesInFilerFromQueryString(qController, tableMetaData, newView.queryFilter);

         ///////////////////////////
         // set columns if absent //
         ///////////////////////////
         if (!newView.queryColumns || !newView.queryColumns.columns || newView.queryColumns.columns?.length == 0)
         {
            newView.queryColumns = QQueryColumns.buildDefaultForTable(tableMetaData);
         }

         qRecord.values.set("viewJson", JSON.stringify(newView));
      }

      return (qRecord);
   };


   /*******************************************************************************
    ** after a page-load, or before activating a saved view, make sure that no
    ** fields are missing from its column list, and that no deleted-fields are still
    ** being used.
    *******************************************************************************/
   const reconcileCurrentTableMetaDataWithView = (view: RecordQueryView, useCase: "initialPageLoad" | "loadingSavedView") =>
   {
      let changedView = false;
      const removedFieldNames = new Set<string>();
      const removedFilterReasons = new Set<string>();

      if (view.queryColumns?.columns?.length > 0)
      {
         const fieldNamesInView: { [name: string]: boolean } = {};
         view.queryColumns?.columns?.forEach(column => fieldNamesInView[column.name] = true);
         for (let i = 0; i < tableDefaultView?.queryColumns?.columns.length; i++)
         {
            const currentColumn = tableDefaultView?.queryColumns?.columns[i];
            if (!fieldNamesInView[currentColumn.name])
            {
               console.log(`Adding a new column to this view ${currentColumn.name}`);
               view.queryColumns.addColumnForNewField(tableMetaData, currentColumn.name, useCase == "initialPageLoad");
               changedView = true;
            }
            else
            {
               delete fieldNamesInView[currentColumn.name];
            }
         }

         //////////////////////////////////////////////////////////////
         // delete, from the view, any fields no longer in the table //
         //////////////////////////////////////////////////////////////
         const visibilityToggleStates = view.queryColumns.getVisibilityToggleStates();
         for (let fieldName in fieldNamesInView)
         {
            console.log(`Deleting an old column from this view ${fieldName}`);

            if (visibilityToggleStates[fieldName])
            {
               /////////////////////////////////////////////////////////////////////////////////////////////
               // all available columns in the table (and its joins) are in the view queryColumns object, //
               // but we only want/need to tell a user if a visible one got removed.                      //
               /////////////////////////////////////////////////////////////////////////////////////////////
               removedFieldNames.add(fieldName);
            }

            view.queryColumns.deleteColumnForOldField(tableMetaData, fieldName);
            changedView = true;
         }
      }

      /////////////////////////////////////////
      // look for deleted fields as criteria //
      /////////////////////////////////////////
      for (let i = 0; i < view?.queryFilter?.criteria?.length; i++)
      {
         const fieldName = view.queryFilter.criteria[i].fieldName;
         const [field, fieldTable] = TableUtils.getFieldAndTable(tableMetaData, fieldName);
         if (field == null)
         {
            console.log(`Deleting an old criteria field from this view ${fieldName}`);
            view.queryFilter.criteria.splice(i, 1);
            changedView = true;
            removedFieldNames.add(fieldName);
            i--;
         }
      }
      /////////////////////////////////////////
      // look for deleted fields as orderBys //
      /////////////////////////////////////////
      for (let i = 0; i < view?.queryFilter?.orderBys?.length; i++)
      {
         const fieldName = view.queryFilter.orderBys[i].fieldName;
         const [field, fieldTable] = TableUtils.getFieldAndTable(tableMetaData, fieldName);
         if (field == null)
         {
            console.log(`Deleting an old orderBy field from this view ${fieldName}`);
            view.queryFilter.orderBys.splice(i, 1);
            changedView = true;
            removedFieldNames.add(fieldName);
            i--;
         }
      }

      //////////////////////////////////////////////
      // look for deleted fields as quick-filters //
      //////////////////////////////////////////////
      for (let i = 0; i < view?.quickFilterFieldNames?.length; i++)
      {
         const fieldName = view.quickFilterFieldNames[i];
         const [field, fieldTable] = TableUtils.getFieldAndTable(tableMetaData, fieldName);
         if (field == null)
         {
            console.log(`Deleting an old quikc-filter field from this view ${fieldName}`);
            view.quickFilterFieldNames.splice(i, 1);
            changedView = true;
            removedFieldNames.add(fieldName);
            i--;
         }
      }

      for (let i = 0; i < view?.queryFilter?.criteria?.length; i++)
      {
         const fieldName = view.queryFilter.criteria[i].fieldName;
         const operator = view.queryFilter.criteria[i].operator;
         const [field, fieldTable] = TableUtils.getFieldAndTable(tableMetaData, fieldName);

         /////////////////////////////////////////////////////////////////////////////////////////////////////////////////
         // todo - this could/should be a richer thing, but, this gets past an immediate known case/bug, so going w/ it //
         /////////////////////////////////////////////////////////////////////////////////////////////////////////////////
         if (field?.type == QFieldType.BOOLEAN && operator)
         {
            if ([QCriteriaOperator.EQUALS, QCriteriaOperator.IS_BLANK, QCriteriaOperator.IS_NOT_BLANK].indexOf(operator) == -1)
            {
               console.log(`Deleting a criteria field w/ operator not supported for frontend: ${fieldName}`);
               view.queryFilter.criteria.splice(i, 1);
               changedView = true;
               removedFilterReasons.add(field.label + " has an unsupported operator: " + operator);
               i--;
            }
         }
      }

      if (changedView && useCase == "initialPageLoad")
      {
         activateView(view);
      }

      const removedFieldCount = removedFieldNames.size;
      if (removedFieldCount > 0)
      {
         const plural = removedFieldCount > 1;
         pushWarningAlert(`${removedFieldCount} field${plural ? "s" : ""} that ${plural ? "were" : "was"} part of this view ${plural ? "are" : "is"} no longer in this table, and ${plural ? "were" : "was"} removed from this view (${[...removedFieldNames.values()].join(", ")}).`);
      }

      const removedFilterCount = removedFilterReasons.size;
      if (removedFilterCount > 0)
      {
         const plural = removedFilterCount > 1;
         pushWarningAlert(`${removedFilterCount} filter${plural ? "s" : ""} is misconfigured for this screen and was removed from this view: (Details: ${[...removedFilterReasons.values()].join(", ")}).`);
      }
   };


   /*******************************************************************************
    ** event handler for selecting 'filter' action from columns menu in advanced mode.
    *******************************************************************************/
   const handleColumnMenuAdvancedFilterSelection = (fieldName: string) =>
   {
      const newCriteria = new QFilterCriteria(fieldName, null, []);

      if (!queryFilter.criteria)
      {
         queryFilter.criteria = [];
      }

      const length = queryFilter.criteria.length;
      if (length > 0 && !queryFilter.criteria[length - 1].fieldName)
      {
         /////////////////////////////////////////////////////////////////////////////////
         // if the last criteria in the filter has no field name (e.g., a default state //
         // when there's 1 criteria that's all blank - may happen other times too?),    //
         // then replace that criteria with a new one for this field.                   //
         /////////////////////////////////////////////////////////////////////////////////
         queryFilter.criteria[length - 1] = newCriteria;
      }
      else
      {
         //////////////////////////////////////////////////////////////////////
         // else, add a new criteria for this field onto the end of the list //
         //////////////////////////////////////////////////////////////////////
         queryFilter.criteria.push(newCriteria);
      }

      ///////////////////////////
      // open the filter panel //
      ///////////////////////////
      gridApiRef.current.showPreferences(GridPreferencePanelsValue.filters);
   };


   /*******************************************************************************
    * event handler from columns menu - that copies values from that column (for
    * current page)
    *******************************************************************************/
   const copyPageColumnValues = async (column: GridColDef) =>
   {
      let data = "";
      let counter = 0;
      if (latestQueryResults && latestQueryResults.length)
      {
         let [qFieldMetaData, fieldTable] = TableUtils.getFieldAndTable(tableMetaData, column.field);
         for (let i = 0; i < latestQueryResults.length; i++)
         {
            let record = latestQueryResults[i] as QRecord;
            let value = ValueUtils.getUnadornedValueForDisplay(qFieldMetaData, record.values.get(column.field), record.displayValues.get(column.field));

            const isBlank = (value === null || value === undefined);
            if (isBlank)
            {
               value = "";
            }

            data += value + "\n";
            counter++;
         }

         if (counter > 0)
         {
            await navigator.clipboard.writeText(data);
            setSuccessAlert(`Copied ${counter} ${qFieldMetaData.label} value${counter == 1 ? "" : "s"}.`);
            setTimeout(() => setSuccessAlert(null), 5000);
         }
         else
         {
            setWarningAlert(`There are no ${qFieldMetaData.label} values to copy.`);
            setTimeout(() => setWarningAlert(null), 5000);
         }
      }
   };


   /*******************************************************************************
    ** event handler from columns menu - that copies values from that column for the
    ** full query result (e.g., from the backend) - not just the current page.
    *******************************************************************************/
   const copyFullQueryColumnValues = async (column: GridColDef) =>
   {
      const format = "TSV";

      const materialDashboardInstanceMetaData = metaData.supplementalInstanceMetaData?.get("materialDashboard");
      const limit = materialDashboardInstanceMetaData?.queryScreenCopyFullQueryColumnValuesLimit ?? 100000;

      if (totalRecords > limit)
      {
         setErrorAlert(`The current query contains too many rows to be copied (limit: ${ValueUtils.safeToLocaleString(limit)}).`);
         setTimeout(() => setErrorAlert(null), 5000);
         return;
      }

      let [qFieldMetaData, fieldTable] = TableUtils.getFieldAndTable(tableMetaData, column.field);

      const postBody = new FormData();
      postBody.append("format", format);
      postBody.append("limit", limit);
      postBody.append("omitHeaderRow", true);
      postBody.append("fields", column.field);

      const filterForBackend = FilterUtils.prepQueryFilterForBackend(tableMetaData, queryFilter);
      filterForBackend.skip = 0;
      filterForBackend.limit = null;
      postBody.append("filter", JSON.stringify(filterForBackend));

      setInfoAlert(`Copying ${qFieldMetaData.label} values...`);

      qController.axiosRequest(
         {
            method: "post",
            url: `/data/${encodeURIComponent(tableMetaData.name)}/export?format=${format}&limit=${limit}`,
            data: postBody,
            headers: qController.defaultMultipartFormDataHeaders()
         })
         .then(response =>
         {
            (async () =>
            {
               const numberOfValues = response.split("\n").length - 1;
               if (numberOfValues == 0)
               {
                  setInfoAlert(null);
                  setWarningAlert(`There are no ${qFieldMetaData.label} values to copy`);
                  setTimeout(() => setWarningAlert(null), 5000);
                  return;
               }

               try
               {
                  await navigator.clipboard.writeText(response);
                  setInfoAlert(null);
                  setSuccessAlert(`Copied ${ValueUtils.safeToLocaleString(numberOfValues)} ${qFieldMetaData.label} value${totalRecords == 1 ? "" : "s"}.`);
                  setTimeout(() => setSuccessAlert(null), 5000);
               }
               catch (e)
               {
                  setInfoAlert(null);
                  let message = `${e}`;

                  if (!document.hasFocus())
                  {
                     message = "Keep this window active until the copy is complete.  Details: " + message;
                  }

                  setWarningAlert(`Error copying values: ${message}`);
                  setTimeout(() => setSuccessAlert(null), 5000);
               }
            })();
         })
         .catch(e =>
         {
            console.error(e);
            setInfoAlert(null);
            setWarningAlert(`Error copying values: ${e?.message ?? e}`);
            setTimeout(() => setWarningAlert(null), 5000);
         });
   };


   /*******************************************************************************
    ** event handler from columns menu - to open the column statistics modal
    *******************************************************************************/
   const openColumnStatistics = async (column: GridColDef) =>
   {
      setFilterForColumnStats(FilterUtils.prepQueryFilterForBackend(tableMetaData, queryFilter));
      setColumnStatsFieldName(column.field);

      const [field, fieldTable] = TableUtils.getFieldAndTable(tableMetaData, column.field);
      setColumnStatsField(field);
      setColumnStatsFieldTableName(fieldTable.name);
   };


   /*******************************************************************************
    ** close handler for column stats modal
    *******************************************************************************/
   const closeColumnStats = (event: object, reason: string) =>
   {
      if (reason === "backdropClick" || reason === "escapeKeyDown")
      {
         return;
      }

      setColumnStatsFieldName(null);
      setColumnStatsFieldTableName(null);
      setColumnStatsField(null);
   };


   /////////////////////////////////////////////////
   // custom component for the grid's column-menu //
   // todo - break out into own component/file??  //
   /////////////////////////////////////////////////
   const CustomColumnMenu = forwardRef<HTMLUListElement, GridColumnMenuProps>(
      function GridColumnMenu(props: GridColumnMenuProps, ref)
      {
         const {hideMenu, currentColumn} = props;

         /* see below where this could be used for future additional copy functions
         const [copyMoreMenu, setCopyMoreMenu] = useState(null)
         const openCopyMoreMenu = (event: any) =>
         {
            setCopyMoreMenu(event.currentTarget);
            event.stopPropagation();
         }
         const closeCopyMoreMenu = () => setCopyMoreMenu(null);
         */

         return (
            <GridColumnMenuContainer ref={ref} {...props}>
               <SortGridMenuItems onClick={hideMenu} column={currentColumn!} />

               <MenuItem onClick={(e) =>
               {
                  hideMenu(e);
                  if (mode == "advanced")
                  {
                     handleColumnMenuAdvancedFilterSelection(currentColumn.field);
                  }
                  else
                  {
                     // @ts-ignore
                     basicAndAdvancedQueryControlsRef.current.addField(currentColumn.field);
                  }
               }}>
                  Filter
               </MenuItem>

               <HideGridColMenuItem onClick={hideMenu} column={currentColumn!} />

               <Divider />
               <GridColumnPinningMenuItems onClick={hideMenu} column={currentColumn!} />
               <Divider />

               <Tooltip title={!totalRecords ? "There are no rows to copy from" : null} placement="right">
                  <span>
                     <MenuItem disabled={!totalRecords} onClick={(e) =>
                     {
                        hideMenu(e);
                        copyPageColumnValues(currentColumn);
                     }}>
                        Copy page values
                     </MenuItem>
                  </span>
               </Tooltip>

               <Tooltip title={!totalRecords ? "There are no rows to copy from" : null} placement="right">
                  <span>
                     <MenuItem sx={{justifyContent: "space-between"}} disabled={!totalRecords} onClick={(e) =>
                     {
                        hideMenu(e);
                        copyFullQueryColumnValues(currentColumn);
                     }}>
                        Copy full query values
                     </MenuItem>
                  </span>
               </Tooltip>

               {/* todo - alternative to the two copy options above, and advanced copy mode
               <MenuItem onClick={(e) =>
               {
                  hideMenu(e);
                  setCopyingFieldName(currentColumn.field);
               }}>
                  Copy values...
               </MenuItem>
               */}

               <MenuItem onClick={(e) =>
               {
                  hideMenu(e);
                  openColumnStatistics(currentColumn);
               }}>
                  Column statistics
               </MenuItem>

            </GridColumnMenuContainer>
         );
      });

   /////////////////////////////////////////////////////////////
   // custom component for the column header cells            //
   // where we need custom event handlers for the filter icon //
   // todo - break out into own component/file??              //
   /////////////////////////////////////////////////////////////
   const CustomColumnHeaderFilterIconButton = forwardRef<any, ColumnHeaderFilterIconButtonProps>(
      function ColumnHeaderFilterIconButton(props: ColumnHeaderFilterIconButtonProps, ref)
      {
         let showFilter = false;
         for (let i = 0; i < queryFilter?.criteria?.length; i++)
         {
            const criteria = queryFilter.criteria[i];
            if (criteria.fieldName == props.field && validateCriteria(criteria, null).criteriaIsValid)
            {
               showFilter = true;
            }
         }

         if (showFilter)
         {
            return (<IconButton size="small" sx={{p: "2px"}} onClick={(event) =>
            {
               if (mode == "basic")
               {
                  // @ts-ignore !?
                  basicAndAdvancedQueryControlsRef.current.addField(props.field);
               }
               else
               {
                  gridApiRef.current.showPreferences(GridPreferencePanelsValue.filters);
               }

               event.stopPropagation();
            }}><Icon fontSize="small">filter_alt</Icon></IconButton>);
         }

         return (<></>);
      });

   ////////////////////////////////////////////////
   // custom component for the grid toolbar      //
   // todo - break out into own component/file?? //
   ////////////////////////////////////////////////
   function CustomToolbar()
   {

      /*******************************************************************************
       ** event handler for mouse-down event - helps w/ avoiding accidental clicks into rows
       *******************************************************************************/
      const handleMouseDown: GridEventListener<"cellMouseDown"> = (
         params, // GridRowParams
         event, // MuiEvent<React.MouseEvent<HTMLElement>>
         details, // GridCallbackDetails
      ) =>
      {
         setGridMouseDownX(event.clientX);
         setGridMouseDownY(event.clientY);
         clearTimeout(timerInstance.current.timer);
      };

      /*******************************************************************************
       ** event handler for double-click event - helps w/ avoiding accidental clicks into rows
       *******************************************************************************/
      const handleDoubleClick: GridEventListener<"rowDoubleClick"> = (event: any) =>
      {
         clearTimeout(timerInstance.current.timer);
      };

      const apiRef = useGridApiContext();
      useGridApiEventHandler(apiRef, "cellMouseDown", handleMouseDown);
      useGridApiEventHandler(apiRef, "rowDoubleClick", handleDoubleClick);

      ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
      // keep track of any preference windows that are opened in the toolbar, to allow ignoring clicks away from the window //
      ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
      useEffect(() =>
      {
         const preferencePanelState = useGridSelector(apiRef, gridPreferencePanelStateSelector);
         setGridPreferencesWindow(preferencePanelState.openedPanelValue);
      });

      const joinIsMany = isJoinMany(tableMetaData, visibleJoinTables);

      const selectionMenuOptions: string[] = [];
      selectionMenuOptions.push(`This page (${ValueUtils.safeToLocaleString(distinctRecordsOnPageCount)} ${joinIsMany ? "distinct " : ""}record${distinctRecordsOnPageCount == 1 ? "" : "s"})`);
      selectionMenuOptions.push(`Full query result (${joinIsMany ? ValueUtils.safeToLocaleString(distinctRecords) + ` distinct record${distinctRecords == 1 ? "" : "s"}` : ValueUtils.safeToLocaleString(totalRecords) + ` record${totalRecords == 1 ? "" : "s"}`})`);
      selectionMenuOptions.push(`Subset of the query result ${selectionSubsetSize ? `(${ValueUtils.safeToLocaleString(selectionSubsetSize)} ${joinIsMany ? "distinct " : ""}record${selectionSubsetSize == 1 ? "" : "s"})` : "..."}`);
      selectionMenuOptions.push("Clear selection");


      /*******************************************************************************
       ** util function to check boxes for some or all rows in the grid, in response to
       ** selection menu actions
       *******************************************************************************/
      function programmaticallySelectSomeOrAllRows(max?: number)
      {
         ///////////////////////////////////////////////////////////////////////////////////////////
         // any time the user selects one of the options from our selection menu,                 //
         // we want to check all the boxes on the screen - and - "select" all of the primary keys //
         // unless they did the subset option - then we'll only go up to a 'max' number           //
         ///////////////////////////////////////////////////////////////////////////////////////////
         const rowSelectionModel: GridSelectionModel = [];
         let selectedPrimaryKeys = new Set<string>();
         rows.forEach((value: GridRowModel, index: number) =>
         {
            const primaryKeyValue = latestQueryResults[index].values.get(tableMetaData.primaryKeyField);
            if (max)
            {
               if (selectedPrimaryKeys.size < max)
               {
                  if (!selectedPrimaryKeys.has(primaryKeyValue))
                  {
                     rowSelectionModel.push(value.__rowIndex);
                     selectedPrimaryKeys.add(primaryKeyValue as string);
                  }
               }
            }
            else
            {
               rowSelectionModel.push(value.__rowIndex);
               selectedPrimaryKeys.add(primaryKeyValue as string);
            }
         });
         setRowSelectionModel(rowSelectionModel);
         setSelectedIds([...selectedPrimaryKeys.values()]);
      }


      /*******************************************************************************
       ** event handler (callback) for optiosn in the selection menu
       *******************************************************************************/
      const selectionMenuCallback = (selectedIndex: number) =>
      {
         if (selectedIndex == 0)
         {
            ///////////////
            // this page //
            ///////////////
            programmaticallySelectSomeOrAllRows();
            setSelectFullFilterState("checked");
         }
         else if (selectedIndex == 1)
         {
            ///////////////////////
            // full query result //
            ///////////////////////
            programmaticallySelectSomeOrAllRows();
            setSelectFullFilterState("filter");
         }
         else if (selectedIndex == 2)
         {
            ////////////////////////////
            // subset of query result //
            ////////////////////////////
            setSelectionSubsetSizePromptOpen(true);
         }
         else if (selectedIndex == 3)
         {
            /////////////////////
            // clear selection //
            /////////////////////
            setSelectFullFilterState("n/a");
            setRowSelectionModel([]);
            setSelectedIds([]);
         }
      };

      return (
         <GridToolbarContainer>
            <div>
               <Tooltip title="Refresh Query">
                  <Button id="refresh-button" onClick={() => updateTable("refresh button")} startIcon={<Icon>refresh</Icon>} sx={{pl: "1rem", pr: "0.5rem", minWidth: "unset"}}></Button>
               </Tooltip>
            </div>
            {
               !isPreview && (
                  <div style={{position: "relative"}}>
                     {/* @ts-ignore */}
                     <GridToolbarDensitySelector nonce={undefined} />
                  </div>
               )
            }
            {
               isPreview && (
                  <Tooltip title="Open In New Window">
                     <Button id="open-filter-in-new-window-button" onClick={() => openFilterInNewWindow()} startIcon={<Icon>launch</Icon>} sx={{pl: "1rem", pr: "0.5rem", minWidth: "unset"}}></Button>
                  </Tooltip>
               )
            }

            {
               usage == "queryScreen" &&
               <div style={{zIndex: 10}}>
                  <MenuButton label="Selection" iconName={selectedIds.length == 0 ? "check_box_outline_blank" : "check_box"} disabled={totalRecords == 0} options={selectionMenuOptions} callback={selectionMenuCallback} />
                  <SelectionSubsetDialog isOpen={selectionSubsetSizePromptOpen} initialValue={selectionSubsetSize} closeHandler={(value) =>
                  {
                     setSelectionSubsetSizePromptOpen(false);

                     if (value !== undefined)
                     {
                        if (typeof value === "number" && value > 0)
                        {
                           programmaticallySelectSomeOrAllRows(value);
                           setSelectionSubsetSize(value);
                           setSelectFullFilterState("filterSubset");
                        }
                        else
                        {
                           setAlertContent("Unexpected value: " + value);
                        }
                     }
                  }} />
               </div>
            }

            <div>
               {
                  selectFullFilterState === "checked" && (
                     <div className="selectionTool">
                        The
                        <strong>{` ${selectedIds.length.toLocaleString()} `}</strong>
                        {joinIsMany ? " distinct " : ""}
                        record{selectedIds.length == 1 ? "" : "s"} on this page {selectedIds.length == 1 ? "is" : "are"} selected.
                     </div>
                  )
               }
               {
                  selectFullFilterState === "filter" && (
                     <div className="selectionTool">
                        {
                           (joinIsMany
                              ? (
                                 distinctRecords == 1
                                    ? (<>The <strong>only 1</strong> distinct record matching this query is selected.</>)
                                    : (<>All <strong>{(distinctRecords ? distinctRecords.toLocaleString() : "")}</strong> distinct records matching this query are selected.</>)
                              )
                              : (<>All <strong>{totalRecords ? totalRecords.toLocaleString() : ""}</strong> records matching this query are selected.</>)
                           )
                        }
                     </div>
                  )
               }
               {
                  selectFullFilterState === "filterSubset" && (
                     <div className="selectionTool">
                        The <a onClick={() => setSelectionSubsetSizePromptOpen(true)} style={{cursor: "pointer"}}><strong>first {ValueUtils.safeToLocaleString(selectionSubsetSize)}</strong></a> {joinIsMany ? "distinct" : ""} record{selectionSubsetSize == 1 ? "" : "s"} matching this query {selectionSubsetSize == 1 ? "is" : "are"} selected.
                     </div>
                  )
               }
               {
                  (selectFullFilterState === "n/a" && selectedIds.length > 0) && (
                     <div className="selectionTool">
                        <strong>{ValueUtils.safeToLocaleString(selectedIds.length)}</strong> {joinIsMany ? "distinct" : ""} {selectedIds.length == 1 ? "record is" : "records are"} selected.
                     </div>
                  )
               }
            </div>
            <div className="pagination">
               <CustomPagination />
            </div>
         </GridToolbarContainer>
      );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////
   // for changes in table controls that don't change the count, call to update the table - //
   // but without clearing out totalRecords (so pagination doesn't flash)                   //
   ///////////////////////////////////////////////////////////////////////////////////////////
   useEffect(() =>
   {
      if (latestQueryId > 0)
      {
         ////////////////////////////////////////////////////////////////////////////////////////
         // to avoid both this useEffect and the one below from both doing an "initial query", //
         // only run this one if at least 1 query has already been ran                         //
         ////////////////////////////////////////////////////////////////////////////////////////
         updateTable("useEffect(pageNumber,rowsPerPage)", false);
      }
   }, [pageNumber, rowsPerPage]);

   ////////////////////////////////////////////////////////////
   // scroll to the origin when pageNo or rowsPerPage change //
   ////////////////////////////////////////////////////////////
   useEffect(() =>
   {
      document.documentElement.scrollTop = 0;
      document.scrollingElement.scrollTop = 0;
   }, [pageNumber, rowsPerPage]);

   ////////////////////////////////////////////////////////////////////
   // if user doesn't have read permission, just show an error alert //
   ////////////////////////////////////////////////////////////////////
   if (tableMetaData && !tableMetaData.readPermission)
   {
      return (
         <Alert severity="error">
            You do not have permission to view {tableMetaData?.label} records
         </Alert>
      );
   }


   if (pageState == "ready")
   {
      const filterForBackend = FilterUtils.prepQueryFilterForBackend(tableMetaData, queryFilter);

      ///////////////////////////////////////////////////////////////////////
      // remove the skip & limit (e.g., pagination) from this hash -       //
      // as we have a specific useEffect watching these, specifically      //
      // so we can pass the dont-clear-count flag into updateTable,        //
      // to try to keep the count from flashing back & forth to "Counting" //
      ///////////////////////////////////////////////////////////////////////
      filterForBackend.skip = null;
      filterForBackend.limit = null;

      const newFilterHash = JSON.stringify(filterForBackend);
      if (filterHash != newFilterHash)
      {
         setFilterHash(newFilterHash);
         updateTable("hash change");
      }
   }

   ////////////////////////////////////////////////////////////
   // handle the initial page state -- by fetching meta-data //
   ////////////////////////////////////////////////////////////
   if (pageState == "initial")
   {
      console.log("page state is initial - going to loadingMetaData...");
      setPageState("loadingMetaData");
      pageLoadingState.setLoading();

      (async () =>
      {
         const metaData = await qController.loadMetaData();
         setMetaData(metaData);

         try
         {
            // const tableMetaData = await qController.loadTableMetaData(tableName);
            const tableMetaData = await qControllerV1.loadTableMetaData(tableName, apiVersion);
            setTableMetaData(tableMetaData);
            setTableLabel(tableMetaData.label);

            doRecordAnalytics({location: window.location, title: "Query: " + tableMetaData.label});

            setTableProcesses(ProcessUtils.getProcessesForTable(metaData, tableName)); // these are the ones to show in the dropdown
            setAllTableProcesses(ProcessUtils.getProcessesForTable(metaData, tableName, true)); // these include hidden ones (e.g., to find the bulks)

            ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
            // now that we know the table - build a default view - initially, only used by SavedViews component, for showing if there's anything to be saved. //
            // but also used when user selects new-view from the view menu                                                                                    //
            ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
            const newDefaultView = buildTableDefaultView(tableMetaData);
            setTableDefaultView(newDefaultView);

            setPageState("loadedMetaData");
         }
         catch (e)
         {
            setPageState("error");
            //@ts-ignore e.message
            setAlertContent("Error loading table: " + e?.message ?? "Details not available.");
         }
      })();
   }

   //////////////////////////////////////////////////////////////////////////////////////////////////////
   // handle the secondary page state - after meta-data is in state - by figuring out the current view //
   //////////////////////////////////////////////////////////////////////////////////////////////////////
   if (pageState == "loadedMetaData")
   {
      console.log("page state is loadedMetaData - going to loadingView...");
      setPageState("loadingView");

      (async () =>
      {
         //////////////////////////////////////////////////////////////////////////////////////////////
         // once we've loaded meta data, let's check the location to see if we should open a process //
         //////////////////////////////////////////////////////////////////////////////////////////////
         try
         {
            /////////////////////////////////////////////////////////////////
            // the path for a process looks like: .../table/process        //
            // so if our tableName is in the -2 index, try to open process //
            /////////////////////////////////////////////////////////////////
            if (pathParts[pathParts.length - 2] === tableName)
            {
               const processName = pathParts[pathParts.length - 1];
               const processList = allTableProcesses.filter(p => p.name == processName);
               if (processList.length > 0)
               {
                  setActiveModalProcess(processList[0]);
               }
               else if (metaData?.processes.has(processName))
               {
                  ///////////////////////////////////////////////////////////////////////////////////////
                  // check for generic processes - should this be a specific attribute on the process? //
                  ///////////////////////////////////////////////////////////////////////////////////////
                  setActiveModalProcess(metaData?.processes.get(processName));
               }
               else
               {
                  console.log(`Couldn't find process named ${processName}`);
               }
            }
         }
         catch (e)
         {
            console.log(e);
         }

         if (searchParams && searchParams.has("filter"))
         {
            //////////////////////////////////////////////////////////////////////////////////////
            // if there's a filter in the URL - then set that as the filter in the current view //
            //////////////////////////////////////////////////////////////////////////////////////
            try
            {
               ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
               // todo - some version of "you've browsed back here, so if active view (local-storage) is the same as this, then keep old... //
               ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
               console.log(`history state: ${JSON.stringify(window.history.state)}`);

               ///////////////////////////////////////////////////////////////////////////////////////////////////
               // parse the filter json into a filer object - then clean up values in it (e.g., translate PV's) //
               ///////////////////////////////////////////////////////////////////////////////////////////////////
               const filterJSON = JSON.parse(searchParams.get("filter"));
               const queryFilter = filterJSON as QQueryFilter;

               await FilterUtils.cleanupValuesInFilerFromQueryString(qController, tableMetaData, queryFilter);

               ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
               // so, URLs with filters, they might say NOT_EQUALS - but - everything else we do in here, uses NOT_EQUALS_OR_IS_NULL... //
               ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
               for (let i = 0; i < queryFilter?.criteria?.length; i++)
               {
                  const criteria = queryFilter.criteria[i];
                  if (criteria.operator == QCriteriaOperator.NOT_EQUALS)
                  {
                     criteria.operator = QCriteriaOperator.NOT_EQUALS_OR_IS_NULL;
                  }
               }

               ///////////////////////////////////////////////////////////////////////////////////////////
               // set this new query filter in the view, and activate the full view                     //
               // stuff other than the query filter should "stick" from what user had active previously //
               ///////////////////////////////////////////////////////////////////////////////////////////
               view.queryFilter = queryFilter;
               activateView(view);

               /////////////////////////////////////////////////////////////////////////////////////////////
               // make sure that we clear out any currently saved view - we're no longer in such a state. //
               /////////////////////////////////////////////////////////////////////////////////////////////
               doClearCurrentSavedView();
            }
            catch (e)
            {
               console.error(e);
               setAlertContent("Error parsing filter from URL");
            }
         }
         else if (viewIdInLocation)
         {
            if (view.viewIdentity == `savedView:${viewIdInLocation}`)
            {
               /////////////////////////////////////////////////////////////////////////////////////////////////
               // if the view id in the location is the same as the view that was most-recently active here,  //
               // then we want to act like that old view is active - but - in case the user changed anything, //
               // we want to keep their current settings as the active view - thus - use the current 'view'   //
               // state variable (e.g., from local storage) as the view to be activated.                      //
               /////////////////////////////////////////////////////////////////////////////////////////////////
               console.log(`Initializing view to a (potentially dirty) saved view (id=${viewIdInLocation})`);
               activateView(view);

               /////////////////////////////////////////////////////////////////////////////////////////////////////////
               // now fetch that savedView, and set it in state, but don't activate it - because that would overwrite //
               // anything the user may have changed (e.g., anything in the local-storage/state view).                //
               /////////////////////////////////////////////////////////////////////////////////////////////////////////
               const savedViewRecord = await fetchSavedView(viewIdInLocation);
               setCurrentSavedView(savedViewRecord);
            }
            else
            {
               ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
               // if there's a filterId in the location, but it isn't the last one the user had active, then set that as our active view //
               ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
               console.log(`Initializing view to a clean saved view (id=${viewIdInLocation})`);
               await handleSavedViewChange(viewIdInLocation);
            }
         }
         else
         {
            ///////////////////////////////////////////////////////////////////////////////////////////////
            // if the last time we were on this table, a currentSavedView was written to local storage - //
            // then navigate back to that view's URL - unless - it looks like we're on a process!        //
            ///////////////////////////////////////////////////////////////////////////////////////////////
            if (localStorage.getItem(currentSavedViewLocalStorageKey) && !urlLooksLikeProcess() && !loadedFilterFromInitialFilterParam)
            {
               const currentSavedViewId = Number.parseInt(localStorage.getItem(currentSavedViewLocalStorageKey));
               console.log(`returning to previously active saved view ${currentSavedViewId}`);
               if (usage == "queryScreen")
               {
                  navigate(`${metaData.getTablePathByName(tableName)}/savedView/${currentSavedViewId}`);
               }
               setViewIdInLocation(currentSavedViewId);

               /////////////////////////////////////////////////////////////////////////////////////////////////////
               // return - without activating any view, and actually, reset the pageState back to loadedMetaData, //
               // so the useEffect that monitors location will see the change, and will set viewIdInLocation      //
               // so upon a re-render we'll hit this block again.                                                 //
               /////////////////////////////////////////////////////////////////////////////////////////////////////
               setPageState("loadedMetaData");
               return;
            }

            //////////////////////////////////////////////////////////////////
            // view is ad-hoc - just activate the view that was last active //
            //////////////////////////////////////////////////////////////////
            activateView(view);
         }

         setPageState("loadedView");
      })();
   }

   //////////////////////////////////////////////////////////////////////////////////////////////
   // handle the 3rd page state - after we have the view loaded - prepare the grid for display //
   //////////////////////////////////////////////////////////////////////////////////////////////
   if (pageState == "loadedView")
   {
      console.log("page state is loadedView - going to preparingGrid...");
      setPageState("preparingGrid");

      //////////////////////////////////////////////////////////////////////////////////////////////////////
      // check if any new columns have been added to the table since last time this view was activated... //
      // or if anything in the view is no longer in the table                                             //
      //////////////////////////////////////////////////////////////////////////////////////////////////////
      reconcileCurrentTableMetaDataWithView(view, "initialPageLoad");

      ////////////////////////////////////////////////////////////////////////////////////////
      // this ref may not be defined on the initial render, so, make this call in a timeout //
      ////////////////////////////////////////////////////////////////////////////////////////
      setTimeout(() =>
      {
         // @ts-ignore
         basicAndAdvancedQueryControlsRef?.current?.ensureAllFilterCriteriaAreActiveQuickFilters(view.queryFilter, "defaultFilterLoaded");
      });

      console.log("finished preparing grid, going to page state ready");
      setPageState("ready");

      ////////////////////////////////////////////
      // if we need a variant, show that prompt //
      ////////////////////////////////////////////
      if (tableMetaData?.usesVariants && !tableVariant)
      {
         promptForTableVariantSelection();
      }

      return (getLoadingScreen(isModal));
   }

   ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
   // any time these are out of sync, it means we've navigated to a different table, so we need to reload :allthethings: //
   ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
   if (tableMetaData && tableMetaData.name !== tableName)
   {
      console.log(`Found mis-match between tableMetaData.name and tableName [${tableMetaData.name}]!=[${tableName}] - reload everything.`);
      setPageState("initial");
      setTableMetaData(null);
      setColumnSortModel([]);
      setColumnsModel([]);
      setQueryFilter(new QQueryFilter());
      setQueryColumns(new PreLoadQueryColumns());
      setRows([]);
      setIsFirstRenderAfterChangingTables(true);

      return (getLoadingScreen(isModal));
   }

   /////////////////////////////////////////////////////////////////////////////////////////////
   // if the table doesn't allow QUERY, but does allow GET, don't render a data grid -        //
   // instead, try to just render a Goto Record button, in auto-open, and may-not-close modes //
   /////////////////////////////////////////////////////////////////////////////////////////////
   if (tableMetaData && !tableMetaData.capabilities.has(Capability.TABLE_QUERY) && tableMetaData.capabilities.has(Capability.TABLE_GET))
   {
      if (tableMetaData?.usesVariants && (!tableVariant || tableVariantPromptOpen))
      {
         return (
            <TableVariantDialog table={tableMetaData} isOpen={true} closeHandler={(value: QTableVariant) =>
            {
               setTableVariantPromptOpen(false);
               setTableVariant(value);
            }} />
         );
      }

      ////////////////////////////////////////////////////////////////////////////////////
      // if the table uses variants, then put the variant-selector into the goto dialog //
      ////////////////////////////////////////////////////////////////////////////////////
      let gotoVariantSubHeader = <></>;
      if (tableMetaData?.usesVariants)
      {
         gotoVariantSubHeader = <Box mb={2}>{getTableVariantHeader(tableVariant)}</Box>;
      }

      return (
         <GotoRecordButton metaData={metaData} tableMetaData={tableMetaData} tableVariant={tableVariant} autoOpen={true} buttonVisible={false} mayClose={false} subHeader={gotoVariantSubHeader} />
      );
   }

   //////////////////////////////////////////////
   // render an error screen (alert) if needed //
   //////////////////////////////////////////////
   if (pageState == "error")
   {
      console.log(`page state is ${pageState}... rendering an alert...`);
      const errorBody = <Box py={3}><Alert severity="error">{alertContent}</Alert></Box>;
      return errorBody;
   }

   ///////////////////////////////////////////////////////////
   // render a loading screen if the page state isn't ready //
   ///////////////////////////////////////////////////////////
   if (pageState != "ready")
   {
      console.log(`page state is ${pageState}... no-op while those complete async's run...`);
      return (getLoadingScreen(isModal));
   }

   ///////////////////////////////////////////////////////////////////////////////////////////
   // if the table isn't loaded yet, display loading screen.                                //
   // this shouldn't be possible, to be out-of-sync with pageState, but just as a fail-safe //
   ///////////////////////////////////////////////////////////////////////////////////////////
   if (!tableMetaData)
   {
      return (getLoadingScreen(isModal));
   }

   let savedViewsComponent = null;
   if (metaData && metaData.processes.has("querySavedView"))
   {
      savedViewsComponent = (<SavedViews useSavedViewsResult={useSavedViewsResult} metaData={metaData} tableMetaData={tableMetaData} view={view} viewAsJson={viewAsJson} currentSavedView={currentSavedView} tableDefaultView={tableDefaultView} viewOnChangeCallback={handleSavedViewChange} loadingSavedView={loadingSavedView} queryScreenUsage={usage} />);
   }


   /*******************************************************************************
    **
    *******************************************************************************/
   const buildColumnMenu = () =>
   {
      //////////////////////////////////////////
      // default (no saved view, and "clean") //
      //////////////////////////////////////////
      let buttonBackground = "unset";
      let buttonBorder = colors.grayLines.main + " !important";
      let buttonColor = colors.gray.main;
      let buttonVariant: "outlined" | "contained" | "text" = "outlined";
      let buttonColorName: "secondary" | "primary" = "secondary";
      let buttonState: string = "empty";

      ////////////////////////////////////////////////////////////////////////////////////////////////////////////
      // diff the current view with either the current saved one, if there's one active, else the table default //
      ////////////////////////////////////////////////////////////////////////////////////////////////////////////
      const baseView = currentSavedView ? JSON.parse(currentSavedView.values.get("viewJson")) as RecordQueryView : tableDefaultView;
      const viewDiffs: string[] = [];
      SavedViewUtils.diffColumns(tableMetaData, baseView, view, viewDiffs);

      if (viewDiffs.length == 0 && currentSavedView)
      {
         /////////////////////////////////////////////////////////////////
         // if 's a saved view, and it's "clean", show it in main style //
         /////////////////////////////////////////////////////////////////
         buttonBackground = accentColor;
         buttonBorder = accentColor;
         buttonColor = "#FFFFFF";
         buttonColorName = "primary";
         buttonVariant = "contained";
         buttonState = "clean";
      }
      else if (viewDiffs.length > 0)
      {
         ///////////////////////////////////////////////////
         // else if there are diffs, show alt/light style //
         ///////////////////////////////////////////////////
         buttonBackground = accentColorLight + " !important";
         buttonBorder = accentColorLight + " !important";
         buttonColor = accentColor + " !important";
         buttonColorName = "primary";
         buttonVariant = "contained";
         buttonState = "dirty";
      }

      const columnMenuButtonStyles = {
         borderRadius: "0.75rem",
         border: `1px solid ${buttonBorder}`,
         color: buttonColor,
         textTransform: "none",
         fontWeight: 500,
         fontSize: "0.875rem",
         boxShadow: "none",
         p: "0.5rem",
         backgroundColor: buttonBackground,
         "&:focus:not(:hover)": {
            color: buttonColor,
            backgroundColor: buttonBackground,
         },
         "&:hover": {
            color: buttonColor,
            backgroundColor: buttonBackground,
            boxShadow: "none",
            filter: "unset"
         }
      };

      return (<Box order="2">
         <FieldListMenu
            idPrefix="columns"
            tableMetaData={tableMetaData}
            showTableHeaderEvenIfNoExposedJoins={true}
            omitExposedJoins={omitExposedJoins}
            placeholder="Search Fields"
            buttonProps={{variant: buttonVariant, sx: columnMenuButtonStyles, ["data-button-state"]: buttonState, color: buttonColorName}}
            buttonChildren={<><Icon sx={{mr: "0.5rem"}}>view_week_outline</Icon> Columns ({view.queryColumns.getVisibleColumnCount()}) <Icon sx={{ml: "0.5rem"}}>keyboard_arrow_down</Icon></>}
            isModeToggle={true}
            toggleStates={view.queryColumns.getVisibilityToggleStates()}
            handleToggleField={handleChangeOneColumnVisibility}
         />
      </Box>);
   };


   /***************************************************************************
    **
    ***************************************************************************/
   function doRecordAnalytics(model: AnalyticsModel)
   {
      try
      {
         recordAnalytics(model);
      }
      catch (e)
      {
         console.log(`Error recording analytics: ${e}`);
      }
   }

   //////////////////////////////////////////////////////////////////////////////////////////////////////////
   // these numbers help set the height of the grid (so page won't scroll) based on space above & below it //
   //////////////////////////////////////////////////////////////////////////////////////////////////////////
   let spaceBelowGrid = 40;
   let spaceAboveGrid = 205;
   if (tableMetaData?.usesVariants)
   {
      spaceAboveGrid += 30;
   }

   if (mode == "advanced")
   {
      spaceAboveGrid += 60;
   }

   if (isModal)
   {
      spaceAboveGrid += 130;
   }

   ////////////////////////
   // main screen render //
   ////////////////////////
   const body = (
      <React.Fragment>
         <Box display="flex" justifyContent="space-between">
            <Box>
               <Typography textTransform="capitalize" variant="h3">
                  {pageLoadingState.isLoading() && ""}
                  {pageLoadingState.isLoadingSlow() && "Loading..."}
                  {pageLoadingState.isNotLoading() && !isModal && getPageHeader(tableMetaData, visibleJoinTables, tableVariant)}
               </Typography>
            </Box>
            {
               !isModal &&
               <Box whiteSpace="nowrap">
                  <GotoRecordButton metaData={metaData} tableMetaData={tableMetaData} />
                  <Box display="inline-block" width="150px">
                     {
                        tableMetaData &&
                        <QueryScreenActionMenu
                           metaData={metaData}
                           tableMetaData={tableMetaData}
                           tableProcesses={tableProcesses}
                           bulkLoadClicked={bulkLoadClicked}
                           bulkEditClicked={bulkEditClicked}
                           bulkEditWithFileClicked={bulkEditWithFileClicked}
                           bulkDeleteClicked={bulkDeleteClicked}
                           processClicked={processClicked}
                        />
                     }
                  </Box>
                  {
                     table.capabilities.has(Capability.TABLE_INSERT) && table.insertPermission &&
                     <QCreateNewButton tablePath={metaData?.getTablePathByName(tableName)} />
                  }
               </Box>
            }
         </Box>
         <div className="recordQuery">
            {/*
            // see code in ExportMenuItem that would use this
            <iframe id="exportIFrame" name="exportIFrame">
               <form method="post" target="_self">
                  <input type="hidden" id="authorizationInput" name="Authorization" />
               </form>
            </iframe>
            */}
            <Box mb={3}>
               {
                  alertContent ? (
                     <Collapse in={Boolean(alertContent)}>
                        <Alert severity="error" sx={{mt: 1.5, mb: 0.5}} onClose={() => setAlertContent(null)}>{alertContent}</Alert>
                     </Collapse>
                  ) : null
               }
               {
                  (tableLabel && showSuccessfullyDeletedAlert) ? (
                     <Collapse in={Boolean(showSuccessfullyDeletedAlert)}>
                        <Alert color="success" sx={{mt: 1.5, mb: 0.5}} onClose={() => setShowSuccessfullyDeletedAlert(false)}>{`${tableLabel} successfully deleted`}</Alert>
                     </Collapse>
                  ) : null
               }
               {
                  (successAlert) ? (
                     <Collapse in={Boolean(successAlert)}>
                        <Alert color="success" sx={{mt: 1.5, mb: 0.5}} onClose={() => setSuccessAlert(null)}>{successAlert}</Alert>
                     </Collapse>
                  ) : null
               }
               {
                  (infoAlert) ? (
                     <Collapse in={Boolean(infoAlert)}>
                        <Alert color="info" sx={{mt: 1.5, mb: 0.5}} onClose={() => setInfoAlert(null)} icon={<Icon>info_outline</Icon>}>{infoAlert}</Alert>
                     </Collapse>
                  ) : null
               }
               {
                  (warningAlert) ? (
                     <Collapse in={Boolean(warningAlert)}>
                        <Alert color="warning" icon={<Icon>warning</Icon>} sx={{mt: 1.5, mb: 0.5}} onClose={() => setWarningAlert(null)}>{warningAlert}</Alert>
                     </Collapse>
                  ) : null
               }
               {
                  (errorAlert) ? (
                     <Collapse in={Boolean(errorAlert)}>
                        <Alert color="error" icon={<Icon>error_outline</Icon>} sx={{mt: 1.5, mb: 0.5}} onClose={() => setErrorAlert(null)}>{errorAlert}</Alert>
                     </Collapse>
                  ) : null
               }

               {
                  !isPreview && metaData && tableMetaData &&
                  <BasicAndAdvancedQueryControls
                     ref={basicAndAdvancedQueryControlsRef}
                     metaData={metaData}
                     tableMetaData={tableMetaData}
                     apiVersion={apiVersion}
                     tableVariant={tableVariant}
                     queryFilter={queryFilter}
                     queryFilterJSON={JSON.stringify(queryFilter)}
                     setQueryFilter={doSetQueryFilter}
                     quickFilterFieldNames={quickFilterFieldNames}
                     setQuickFilterFieldNames={doSetQuickFilterFieldNames}
                     gridApiRef={gridApiRef}
                     mode={mode}
                     queryScreenUsage={usage}
                     allowVariables={allowVariables}
                     setMode={doSetMode}
                     savedViewsComponent={savedViewsComponent}
                     columnMenuComponent={buildColumnMenu()}
                     omitExposedJoins={omitExposedJoins}
                     useSavedViewsResult={useSavedViewsResult}
                     viewOnChangeCallback={handleSavedViewChange}
                     currentSavedView={currentSavedView}
                     activeView={view}
                  />
               }

               <Card>
                  <Box height="100%">
                     <DataGridPro
                        apiRef={gridApiRef}
                        components={{
                           Toolbar: CustomToolbar,
                           Pagination: CustomPagination,
                           LoadingOverlay: CustomLoadingOverlay,
                           ColumnMenu: CustomColumnMenu,
                           FilterPanel: CustomFilterPanel,
                           // @ts-ignore - this turns these off, whether TS likes it or not...
                           ColumnsPanel: "", ColumnSortedDescendingIcon: "", ColumnSortedAscendingIcon: "", ColumnUnsortedIcon: "",
                           ColumnHeaderFilterIconButton: CustomColumnHeaderFilterIconButton,
                        }}
                        componentsProps={{
                           filterPanel:
                              {
                                 tableMetaData: tableMetaData,
                                 queryScreenUsage: usage,
                                 metaData: metaData,
                                 queryFilter: queryFilter,
                                 updateFilter: doSetQueryFilter,
                                 allowVariables: allowVariables,
                                 omitExposedJoins: omitExposedJoins,
                              }
                        }}
                        localeText={{
                           columnMenuSortAsc: "Sort ascending",
                           columnMenuSortDesc: "Sort descending",
                        }}
                        pinnedColumns={pinnedColumns}
                        onPinnedColumnsChange={handlePinnedColumnsChange}
                        pagination
                        paginationMode="server"
                        sortingMode="server"
                        filterMode="server"
                        page={pageNumber}
                        checkboxSelection={usage == "queryScreen"}
                        disableSelectionOnClick
                        autoHeight={false}
                        rows={rows}
                        // getRowHeight={() => "auto"} // maybe nice?  wraps values in cells...
                        columns={columnsModel}
                        rowBuffer={10}
                        rowCount={totalRecords === null || totalRecords === undefined ? 0 : totalRecords}
                        onPageSizeChange={handleRowsPerPageChange}
                        onRowClick={usage == "queryScreen" ? handleRowClick : null}
                        onStateChange={handleStateChange}
                        density={density}
                        loading={loading}
                        columnVisibilityModel={columnVisibilityModel}
                        onColumnVisibilityModelChange={handleColumnVisibilityChange}
                        onColumnOrderChange={handleColumnOrderChange}
                        onColumnResize={handleColumnResize}
                        onSelectionModelChange={handleSelectionChanged}
                        onSortModelChange={handleSortChange}
                        sortingOrder={["asc", "desc"]}
                        onColumnHeaderClick={handleColumnHeaderClick}
                        getRowClassName={(params) => (params.indexRelativeToCurrentPage % 2 === 0 ? "even" : "odd")}
                        getRowId={(row) => row.__rowIndex}
                        selectionModel={rowSelectionModel}
                        hideFooterSelectedRowCount={true}
                        sx={{border: 0, height: `calc(100vh - ${spaceAboveGrid + spaceBelowGrid}px)`}}
                     />
                  </Box>
               </Card>
            </Box>

            {
               activeModalProcess && tableMetaData &&
               <Modal open={activeModalProcess !== null} onClose={(event, reason) => closeModalProcess(event, reason)}>
                  <div className="modalProcess">
                     <ProcessRun process={activeModalProcess} isModal={true} table={tableMetaData} recordIds={recordIdsForProcess} closeModalHandler={closeModalProcess} />
                  </div>
               </Modal>
            }

            {
               tableMetaData && tableMetaData.usesVariants &&
               <TableVariantDialog table={tableMetaData} isOpen={tableVariantPromptOpen} closeHandler={(value: QTableVariant) =>
               {
                  setTableVariantPromptOpen(false);
                  setTableVariant(value);
               }} />
            }

            {
               columnStatsFieldName &&
               <Modal open={columnStatsFieldName !== null} onClose={(event, reason) => closeColumnStats(event, reason)}>
                  <div className="columnStatsModal">
                     <Box sx={{position: "absolute", overflowY: "auto", maxHeight: "100%", width: "100%"}}>
                        <Card sx={{my: 5, mx: "auto", pb: 0, maxWidth: "1024px"}}>
                           <Box component="div">
                              <ColumnStats tableMetaData={tableMetaData} fieldMetaData={columnStatsField} fieldTableName={columnStatsFieldTableName} filter={filterForColumnStats} />
                              <Box p={3} display="flex" flexDirection="row" justifyContent="flex-end">
                                 <QCancelButton label="Close" onClickHandler={() => closeColumnStats(null, null)} disabled={false} />
                              </Box>
                           </Box>
                        </Card>
                     </Box>
                  </div>
               </Modal>
            }

            {/* todo - would work with advanced copy-values mode referenced above (should go into its own component probably
               copyingFieldName &&
               <Modal open={copyingFieldName !== null} onClose={(event, reason) => closeCopyingDialog(event, reason)}>
                  <div className="columnStatsModal">
                     <Box sx={{position: "absolute", overflowY: "auto", maxHeight: "100%", width: "100%"}}>
                        <Card sx={{my: 5, mx: "auto", pb: 0, maxWidth: "600px"}}>
                           <Box component="div">
                              <Box p={3}>
                                 <Typography variant="h5">Copy Values</Typography>
                              </Box>
                              <Box p={3} fontSize={14} sx={{
                                 "& .MuiFormGroup-root": {
                                    fontWeight: 700,
                                    paddingBottom: "1rem",
                                 },
                                 "& .MuiFormControlLabel-root": {
                                    minWidth: "200px",
                                    whiteSpace: "nowrap",
                                    "& .MuiFormControlLabel-label": {
                                       fontWeight: 400
                                    }
                                 }
                              }}>
                                 <RadioGroup name="x">
                                    Number of values:
                                    <Box display="flex">
                                       <FormControlLabel value="y" control={<Radio size="small" onChange={(event, checked) => console.log(checked)} checked={true} />} label={"Current page"} />
                                       <FormControlLabel value="z" control={<Radio size="small" onChange={(event, checked) => console.log(checked)} />} label={"Full query result"} />
                                    </Box>
                                 </RadioGroup>
                                 <RadioGroup name="y">
                                    Blank values:
                                    <Box display="flex">
                                       <FormControlLabel value="y" control={<Radio size="small" onChange={(event, checked) => console.log(checked)} checked={true} />} label={"Include blanks"} />
                                       <FormControlLabel value="z" control={<Radio size="small" onChange={(event, checked) => console.log(checked)} />} label={"Omit blanks"} />
                                    </Box>
                                 </RadioGroup>
                                 <RadioGroup name="z">
                                    Duplicated values:
                                    <Box display="flex">
                                       <FormControlLabel value="y" control={<Radio size="small" onChange={(event, checked) => console.log(checked)} checked={true} />} label={"Include all duplicates"} />
                                       <FormControlLabel value="z" control={<Radio size="small" onChange={(event, checked) => console.log(checked)} />} label={"Only include distinct values"} />
                                    </Box>
                                 </RadioGroup>
                              </Box>
                              <Box p={3} display="flex" flexDirection="row" justifyContent="flex-end">
                                 <QCancelButton label="Cancel" onClickHandler={() => closeCopyingDialog(null, null)} disabled={false} />
                                 <QSaveButton label="OK" onClickHandler={() => doCopy()} disabled={false} iconName="check" />
                              </Box>
                           </Box>
                        </Card>
                     </Box>
                  </div>
               </Modal>
            */}
         </div>
      </React.Fragment>
   );

   return body;
});


RecordQuery.defaultProps = {
   table: null,
   apiVersion: null,
   usage: "queryScreen",
   launchProcess: null,
   isModal: false,
   initialQueryFilter: null,
   initialColumns: null,
};


export default RecordQuery;
