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

import {Alert, Typography} from "@mui/material";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Grid from "@mui/material/Grid";
import Icon from "@mui/material/Icon";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import Modal from "@mui/material/Modal";
import Tooltip from "@mui/material/Tooltip/Tooltip";
import {SxProps} from "@mui/system";
import {QException} from "@qrunio/qqq-frontend-core/lib/exceptions/QException";
import {AdornmentType} from "@qrunio/qqq-frontend-core/lib/model/metaData/AdornmentType";
import {Capability} from "@qrunio/qqq-frontend-core/lib/model/metaData/Capability";
import {QFieldMetaData} from "@qrunio/qqq-frontend-core/lib/model/metaData/QFieldMetaData";
import {QFieldType} from "@qrunio/qqq-frontend-core/lib/model/metaData/QFieldType";
import {QInstance} from "@qrunio/qqq-frontend-core/lib/model/metaData/QInstance";
import {QMenu} from "@qrunio/qqq-frontend-core/lib/model/metaData/QMenu";
import {QProcessMetaData} from "@qrunio/qqq-frontend-core/lib/model/metaData/QProcessMetaData";
import {QTableMetaData} from "@qrunio/qqq-frontend-core/lib/model/metaData/QTableMetaData";
import {QTableSection} from "@qrunio/qqq-frontend-core/lib/model/metaData/QTableSection";
import {QTableVariant} from "@qrunio/qqq-frontend-core/lib/model/metaData/QTableVariant";
import {QRecord} from "@qrunio/qqq-frontend-core/lib/model/QRecord";
import {QueryJoin} from "@qrunio/qqq-frontend-core/lib/model/query/QueryJoin";
import QContext from "QContext";
import colors from "qqq/assets/theme/base/colors";
import {preferredColorNameInfoOrPrimary} from "qqq/assets/theme/functions/preferInfoColorToPrimaryColor";
import {sanitizeId} from "qqq/utils/qqqIdUtils";
import AuditBody from "qqq/components/audits/AuditBody";
import {QActionsMenuButton, QCancelButton, QDeleteButton, QEditButton, standardWidth} from "qqq/components/buttons/DefaultButtons";
import EntityForm from "qqq/components/forms/EntityForm";
import MDButton from "qqq/components/legacy/MDButton";
import {GotoRecordButton} from "qqq/components/misc/GotoRecordDialog";
import HelpContent, {hasHelpContent} from "qqq/components/misc/HelpContent";
import QRecordSidebar from "qqq/components/misc/RecordSidebar";
import ShareModal from "qqq/components/sharing/ShareModal";
import {FieldValueAsWidget} from "qqq/components/view/FieldValueAsWidget";
import {ItemsShownInMenu, RecordViewAdditionalMenus, RecordViewMenuItem} from "qqq/components/view/RecordViewMenus";
import DashboardWidgets from "qqq/components/widgets/DashboardWidgets";
import BaseLayout from "qqq/layouts/BaseLayout";
import ProcessRun from "qqq/pages/processes/ProcessRun";
import HistoryUtils from "qqq/utils/HistoryUtils";
import HtmlUtils from "qqq/utils/HtmlUtils";
import Client from "qqq/utils/qqq/Client";
import ProcessUtils from "qqq/utils/qqq/ProcessUtils";
import TableUtils from "qqq/utils/qqq/TableUtils";
import ValueUtils from "qqq/utils/qqq/ValueUtils";
import React, {useContext, useEffect, useMemo, useState} from "react";
import {useLocation, useNavigate, useParams} from "react-router-dom";

const qController = Client.getInstance();

interface Props
{
   table?: QTableMetaData;
   record?: QRecord;
   launchProcess?: QProcessMetaData;
}

RecordView.defaultProps =
   {
      table: null,
      record: null,
      launchProcess: null,
   };


/////////////////////////////////////////////////////////////////////////////////////////////////////
// define an object that is passed into the components of RecordViewMenu.tsx for getting data from //
// this component, and for making callbacks into this component to perform actions from menus.     //
/////////////////////////////////////////////////////////////////////////////////////////////////////
export interface RecordViewMenuActions
{
   new: () => void;
   copy: () => void;
   edit: () => void;
   developerMode: () => void;
   audit: (closeMenu?: () => void) => void;
   delete: (closeMenu?: () => void) => void;
   runProcess: (processName: string) => void;
   downloadFileFromField: (fieldName: string, closeMenu?: () => void) => void;

   getMetaData: () => QInstance;
   getTableProcesses: () => QProcessMetaData[];
   getGenericProcesses: () => QProcessMetaData[];
}


const TABLE_VARIANT_LOCAL_STORAGE_KEY_ROOT = "qqq.tableVariant";


/*******************************************************************************
 **
 *******************************************************************************/
export function renderSectionOfFields(key: string, fieldNames: string[], tableMetaData: QTableMetaData, helpHelpActive: boolean, record: QRecord, fieldMap?: { [name: string]: QFieldMetaData }, styleOverrides?: { label?: SxProps, value?: SxProps }, tableVariant?: QTableVariant)
{
   return <Grid container lg={12} key={key} display="flex" py={1} pr={2}>
      {
         fieldNames.map((fieldName: string) => 
         {
            let [field, tableForField] = tableMetaData ? TableUtils.getFieldAndTable(tableMetaData, fieldName) : fieldMap ? [fieldMap[fieldName], null] : [null, null];

            if (field == null)
            {
               if (tableMetaData?.virtualFields?.has(fieldName))
               {
                  field = tableMetaData.virtualFields.get(fieldName);
               }
            }

            if (field != null)
            {
               let label = field.label;
               let gridColumns = (field.gridColumns && field.gridColumns > 0) ? field.gridColumns : 12;

               const helpRoles = ["VIEW_SCREEN", "READ_SCREENS", "ALL_SCREENS"];
               const showHelp = helpHelpActive || hasHelpContent(field.helpContents, helpRoles);
               const formattedHelpContent = <HelpContent helpContents={field.helpContents} roles={helpRoles} heading={label} helpContentKey={`table:${tableMetaData?.name};field:${fieldName}`} />;

               const labelElement = <Typography variant="button" textTransform="none" fontWeight="bold" pr={1} color="rgb(52, 71, 103)" sx={{cursor: "default", ...(styleOverrides?.label ?? {})}}>{label}:</Typography>;

               if (field.hasAdornment(AdornmentType.WIDGET))
               {
                  return (<Grid item key={fieldName} lg={gridColumns} flexDirection="column" pr={2}>
                     <FieldValueAsWidget field={field} record={record} />
                  </Grid>);
               }

               return (
                  <Grid item key={fieldName} lg={gridColumns} flexDirection="column" pr={2}>
                     <>
                        {
                           showHelp && formattedHelpContent ? <Tooltip title={formattedHelpContent}>{labelElement}</Tooltip> : labelElement
                        }
                        <div style={{display: "inline-block", width: 0}}>&nbsp;</div>
                        <Typography variant="button" textTransform="none" fontWeight="regular" color="rgb(123, 128, 154)" sx={{...(styleOverrides?.value ?? {})}}>
                           {ValueUtils.getDisplayValue(field, record, "view", fieldName, tableVariant)}
                        </Typography>
                     </>
                  </Grid>
               );
            }
         })
      }
   </Grid>;
}


/***************************************************************************
 **
 ***************************************************************************/
export function getVisibleJoinTables(tableMetaData: QTableMetaData): Set<string>
{
   const visibleJoinTables = new Set<string>();

   for (let i = 0; i < tableMetaData?.sections.length; i++)
   {
      const section = tableMetaData?.sections[i];
      if (section.isHidden || !section.fieldNames || !section.fieldNames.length)
      {
         continue;
      }

      section.fieldNames.forEach((fieldName) => 
      {
         const [field, tableForField] = TableUtils.getFieldAndTable(tableMetaData, fieldName);
         if (tableForField && tableForField.name != tableMetaData.name)
         {
            visibleJoinTables.add(tableForField.name);
         }
      });
   }

   return (visibleJoinTables);
}


/*******************************************************************************
 ** Record View Screen component.
 *******************************************************************************/
function RecordView({table, record: overrideRecord, launchProcess}: Props): JSX.Element
{
   const {id} = useParams();

   const location = useLocation();
   const navigate = useNavigate();

   const pathParts = location.pathname.replace(/\/+$/, "").split("/");
   const tableName = table.name;
   let tableVariant: QTableVariant = null;

   const tableVariantLocalStorageKey = `${TABLE_VARIANT_LOCAL_STORAGE_KEY_ROOT}.${tableName}`;
   const [asyncLoadInited, setAsyncLoadInited] = useState(false);
   const [sectionFieldElements, setSectionFieldElements] = useState(null as Map<string, JSX.Element[]>);
   const [adornmentFieldsMap, setAdornmentFieldsMap] = useState(new Map<string, boolean>);
   const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
   const [metaData, setMetaData] = useState(null as QInstance);
   const [record, setRecord] = useState(overrideRecord ?? null as QRecord);
   const [tableSections, setTableSections] = useState([] as QTableSection[]);
   const [t1Section, setT1Section] = useState(null as QTableSection);
   const [t1SectionName, setT1SectionName] = useState(null as string);
   const [t1SectionElement, setT1SectionElement] = useState(null as JSX.Element);
   const [nonT1TableSections, setNonT1TableSections] = useState([] as QTableSection[]);
   const [allTableProcesses, setAllTableProcesses] = useState([] as QProcessMetaData[]);
   const [actionsMenuAnchorElement, setActionsMenuAnchorElement] = useState(null);
   const [notFoundMessage, setNotFoundMessage] = useState(null as string);
   const [errorMessage, setErrorMessage] = useState(null as string);
   const [successMessage, setSuccessMessage] = useState(null as string);
   const [warningMessage, setWarningMessage] = useState(null as string);
   const [activeModalProcess, setActiveModalProcess] = useState(null as QProcessMetaData);
   const [reloadCounter, setReloadCounter] = useState(0);

   const [launchingProcess, setLaunchingProcess] = useState(launchProcess);
   const [showEditChildForm, setShowEditChildForm] = useState(null as any);
   const [showAudit, setShowAudit] = useState(false);
   const [showShareModal, setShowShareModal] = useState(false);
   const [collapsibleSectionOpenStates, setCollapsibleSectionOpenStates] = useState({} as Record<string, boolean>)

   const [isDeleteSubmitting, setIsDeleteSubmitting] = useState(false);

   const [actionMenu, setActionMenu] = useState(null as QMenu);

   const openActionsMenu = (event: any) => setActionsMenuAnchorElement(event.currentTarget);
   const closeActionsMenu = () => setActionsMenuAnchorElement(null);

   const {accentColor, setPageHeader, setPageHeaderRightContent, tableMetaData, setTableMetaData, tableProcesses, setTableProcesses, dotMenuOpen, keyboardHelpOpen, modalStack, helpHelpActive, recordAnalytics, userId: currentUserId} = useContext(QContext);

   const CREATE_CHILD_KEY = "createChild";

   if (localStorage.getItem(tableVariantLocalStorageKey))
   {
      tableVariant = JSON.parse(localStorage.getItem(tableVariantLocalStorageKey));
   }

   const reload = () => 
   {
      setSuccessMessage(null);
      setNotFoundMessage(null);
      setErrorMessage(null);
      setAsyncLoadInited(false);
      setTableMetaData(null);
      setRecord(null);
      setT1SectionElement(null);
      setNonT1TableSections([]);
      setTableProcesses([]);
      setTableSections(null);
      setShowAudit(false);
   };

   ///////////////////////
   // Keyboard handling //
   ///////////////////////
   useEffect(() => 
   {
      if (tableMetaData == null)
      {
         (async () => 
         {
            const tableMetaData = await qController.loadTableMetaData(tableName);
            setTableMetaData(tableMetaData);
         })();
      }

      const down = (e: KeyboardEvent) => 
      {
         const type = (e.target as any).type;
         const validType = (type !== "text" && type !== "textarea" && type !== "input" && type !== "search");

         if (validType && !dotMenuOpen && !keyboardHelpOpen && !showAudit && !showEditChildForm && (!modalStack || modalStack.length == 0))
         {
            if (!e.metaKey && !e.ctrlKey && e.key === "n" && table.capabilities.has(Capability.TABLE_INSERT) && table.insertPermission)
            {
               e.preventDefault();
               gotoCreate();
            }
            else if (!e.metaKey && !e.ctrlKey && e.key === "e" && table.capabilities.has(Capability.TABLE_UPDATE) && table.editPermission)
            {
               e.preventDefault();
               navigate("edit");
            }
            else if (!e.metaKey && !e.ctrlKey && e.key === "c" && table.capabilities.has(Capability.TABLE_INSERT) && table.insertPermission)
            {
               e.preventDefault();
               navigate("copy");
            }
            else if (!e.metaKey && !e.ctrlKey && e.key === "d" && table.capabilities.has(Capability.TABLE_DELETE) && table.deletePermission)
            {
               e.preventDefault();
               handleClickDeleteButton();
            }
            else if (!e.metaKey && !e.ctrlKey && e.key === "a" && metaData && metaData.tables.has("audit"))
            {
               e.preventDefault();
               navigate("#audit");
            }
         }
      };

      document.addEventListener("keydown", down);
      return () => 
      {
         document.removeEventListener("keydown", down);
      };
   }, [dotMenuOpen, keyboardHelpOpen, modalStack, showEditChildForm, showAudit, metaData, location]);

   const gotoCreate = () => 
   {
      const path = `${pathParts.slice(0, -1).join("/")}/create`;
      navigate(path);
   };

   const gotoEdit = () => 
   {
      const path = `${pathParts.slice(0, -1).join("/")}/${record.values.get(table.primaryKeyField)}/edit`;
      navigate(path);
   };

   ////////////////////////////////////////////////////////////////////////////////////////////////////
   // monitor location changes - if we've clicked a link from viewing one record to viewing another, //
   // we'll stay in this component, but we'll need to reload all data for the new record.            //
   // if, however, our url looks like a process, then open that process.                             //
   ////////////////////////////////////////////////////////////////////////////////////////////////////
   useEffect(() => 
   {
      try
      {
         const hashParts = location.hash.split("/");

         ///////////////////////////////////////////////////////////////////////////////////////////////
         // the path for a process looks like: .../table/id/process                                   //
         // the path for creating a child record looks like: .../table/id/createChild/:childTableName //
         // the path for creating a child record in a process looks like:                             //
         // .../table/id/processName#/createChild=...                                                 //
         ///////////////////////////////////////////////////////////////////////////////////////////////
         let hasChildRecordKey = pathParts.some(p => p.includes(CREATE_CHILD_KEY));
         if (!hasChildRecordKey)
         {
            hasChildRecordKey = hashParts.some(h => h.includes(CREATE_CHILD_KEY));
         }

         ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
         // if our tableName is in the -3 index, and there is no token for updating child records, try to open process //
         ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
         if (!hasChildRecordKey && pathParts[pathParts.length - 3] === tableName)
         {
            const processName = pathParts[pathParts.length - 1];
            const processList = allTableProcesses.filter(p => p.name.endsWith(processName));
            if (processList.length > 0)
            {
               setActiveModalProcess(processList[0]);
               return;
            }
            else
            {
               console.log(`Couldn't find process named ${processName}`);
            }
         }

         ///////////////////////////////////////////////////////////////////////
         // alternatively, look for a launchProcess specification in the hash //
         // e.g., for non-natively rendered links to open the modal.          //
         ///////////////////////////////////////////////////////////////////////
         for (let i = 0; i < hashParts.length; i++)
         {
            const parts = hashParts[i].split("=");
            if (parts.length > 1 && parts[0] == "launchProcess")
            {
               (async () => 
               {
                  const processMetaData = await qController.loadProcessMetaData(parts[1]);
                  setActiveModalProcess(processMetaData);
               })();
               return;
            }
         }

         ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
         // if our table is in the -4 index, and there's `createChild` in the -2 index, try to open a createChild form //
         // e.g., person/42/createChild/address (to create an address under person 42)                                 //
         ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
         if (pathParts[pathParts.length - 4] === tableName && pathParts[pathParts.length - 2] == CREATE_CHILD_KEY)
         {
            (async () => 
            {
               const childTable = await qController.loadTableMetaData(pathParts[pathParts.length - 1]);
               const childId: any = null; // todo - for editing a child, not just creating one.
               openEditChildForm(childTable, childId, null, null); // todo - defaults & disableds
            })();
            return;
         }

         ////////////////////////////////////////////////////////////////////////////////
         // alternatively, look for a createChild specification in the hash            //
         // e.g., for non-natively rendered links to open the modal.                   //
         // e.g., person/42#createChild=address (to create an address under person 42) //
         ////////////////////////////////////////////////////////////////////////////////
         for (let i = 0; i < hashParts.length; i++)
         {
            const parts = hashParts[i].split("=");
            if (parts.length > 1 && parts[0] == CREATE_CHILD_KEY)
            {
               (async () => 
               {
                  const childTable = await qController.loadTableMetaData(parts[1]);
                  const childId: any = null; // todo - for editing a child, not just creating one.
                  openEditChildForm(childTable, childId, null, null); // todo - defaults & disableds
               })();
               return;
            }
         }

         if (hashParts[0] == "#audit")
         {
            setShowAudit(true);
            return;
         }

         ///////////////////////////////////////////////////////////////////////////////////
         // look for anchor links - e.g., table section names.  return w/ no-op if found. //
         ///////////////////////////////////////////////////////////////////////////////////
         if (tableSections)
         {
            for (let i = 0; i < tableSections.length; i++)
            {
               if ("#" + tableSections[i].name === location.hash)
               {
                  return;
               }
            }
         }
      }
      catch (e)
      {
         console.log(e);
      }

      ///////////////////////////////////////////////////////////////////
      // if we didn't open something, then, assume we need to (re)load //
      ///////////////////////////////////////////////////////////////////
      setActiveModalProcess(null);
      reload();
   }, [location.pathname, location.hash]);


   /***************************************************************************
    * For when the backend didn't specify an action menu on the table, define
    * the default version of that menu.
    *
    * This object is intended to match QMenuDefaultViewScreenActionsMenu in QQQ.
    ***************************************************************************/
   function buildDefaultActionMenu(): QMenu
   {
      return new QMenu(
         {
            label: "Actions",
            icon: {name: "game"},
            slot: "VIEW_SCREEN_ACTIONS",
            items: [
               {
                  itemType: "SUB_LIST", values: {
                     items: [
                        {itemType: "BUILT_IN", values: {option: "NEW"}},
                        {itemType: "BUILT_IN", values: {option: "COPY"}},
                        {itemType: "BUILT_IN", values: {option: "EDIT"}},
                        {itemType: "BUILT_IN", values: {option: "DELETE"}}
                     ]
                  }
               },
               {itemType: "DIVIDER"},
               {itemType: "BUILT_IN", values: {option: "THIS_TABLE_PROCESS_LIST"}},
               {itemType: "DIVIDER"},
               {
                  itemType: "SUB_LIST", values: {
                     items: [
                        {itemType: "BUILT_IN", values: {option: "ALL_TABLES_PROCESS_LIST"}},
                        {itemType: "BUILT_IN", values: {option: "DEVELOPER_MODE"}},
                        {itemType: "BUILT_IN", values: {option: "AUDIT"}}
                     ]
                  }
               }
            ]
         }
      );
   }


   /////////////////////////////////////////////////////////////////////////////////////////////
   // when the tableMetaData changes, grab the action menu out of it (or build a default one) //
   /////////////////////////////////////////////////////////////////////////////////////////////
   useEffect(() => 
   {
      let actionMenu: QMenu = null;
      if (metaData && tableMetaData)
      {
         actionMenu = (tableMetaData.menus ?? []).find(m => m.slot == "VIEW_SCREEN_ACTIONS");

         if (!actionMenu)
         {
            actionMenu = buildDefaultActionMenu();
         }
      }
      setActionMenu(actionMenu);
   }, [metaData, tableMetaData]);


   /*******************************************************************************
    ** get an element (or empty) to use as help content for a section
    *******************************************************************************/
   const getSectionHelp = (section: QTableSection) => 
   {
      const helpRoles = ["VIEW_SCREEN", "READ_SCREENS", "ALL_SCREENS"];
      const formattedHelpContent = <HelpContent helpContents={section.helpContents} roles={helpRoles} helpContentKey={`table:${tableName};section:${section.name}`} />;

      return formattedHelpContent && (
         <Box px={"1.5rem"} fontSize={"0.875rem"} color={colors.blueGray.main}>
            {formattedHelpContent}
         </Box>
      );
   };


   /***************************************************************************
    **
    ***************************************************************************/
   function getGenericProcesses(metaData: QInstance)
   {
      const genericProcesses: QProcessMetaData[] = [];
      const materialDashboardInstanceMetaData = metaData?.supplementalInstanceMetaData?.get("materialDashboard");
      if (materialDashboardInstanceMetaData)
      {
         const processNamesToAddToAllQueryAndViewScreens = materialDashboardInstanceMetaData.processNamesToAddToAllQueryAndViewScreens;
         if (processNamesToAddToAllQueryAndViewScreens)
         {
            for (let processName of processNamesToAddToAllQueryAndViewScreens)
            {
               genericProcesses.push(metaData?.processes?.get(processName));
            }
         }
      }
      else
      {
         ////////////////
         // deprecated //
         ////////////////
         genericProcesses.push(metaData?.processes.get("runRecordScript"));
      }
      return genericProcesses;
   }


   /***************************************************************************
    * for a given section (in this table), make a key to use for local-storage
    * of the section's collapsible state.
    ***************************************************************************/
   function makeCollapsibleSectionOpenStateLocalStorageKey(tableName: string, sectionName: string)
   {
      return `qqq.recordView.collapsibleSectionOpenStates.${tableName}.${sectionName}`;
   }


   ////////////////////////////////////////////////////////////////////////
   // as part of mounting the component, the first time we render, start //
   // an async load of data, then populate state after awaiting for it   //
   ////////////////////////////////////////////////////////////////////////
   if (!asyncLoadInited)
   {
      setAsyncLoadInited(true);

      (async () => 
      {
         /////////////////////////////////////////////////////////////////////
         // load the full table meta-data (the one we took in is a partial) //
         /////////////////////////////////////////////////////////////////////
         const tableMetaData = await qController.loadTableMetaData(tableName);
         setTableMetaData(tableMetaData);

         recordAnalytics({location: window.location, title: "View: " + tableMetaData.label});

         //////////////////////////////////////////////////////////////////
         // load top-level meta-data (e.g., to find processes for table) //
         //////////////////////////////////////////////////////////////////
         const metaData = await qController.loadMetaData();
         setMetaData(metaData);
         ValueUtils.qInstance = metaData;

         ///////////////////////////////////////////////////
         // load the processes to show in the action menu //
         ///////////////////////////////////////////////////
         const processesForTable = ProcessUtils.getProcessesForTable(metaData, tableName);
         processesForTable.sort((a, b) => a.label.localeCompare(b.label));
         setTableProcesses(processesForTable);

         //////////////////////////////////////////////////////
         // load processes that the routing needs to respect //
         //////////////////////////////////////////////////////
         const allTableProcesses = ProcessUtils.getProcessesForTable(metaData, tableName, true); // these include hidden ones (e.g., to find the bulks)
         const genericProcesses = getGenericProcesses(metaData);

         for (let genericProcess of genericProcesses)
         {
            if (genericProcess)
            {
               allTableProcesses.unshift(genericProcess);
            }
         }

         setAllTableProcesses(allTableProcesses);

         if (launchingProcess)
         {
            setLaunchingProcess(null);
            setActiveModalProcess(launchingProcess);
         }

         let queryJoins: QueryJoin[] = null;
         const visibleJoinTables = getVisibleJoinTables(tableMetaData);
         if (visibleJoinTables.size > 0)
         {
            queryJoins = TableUtils.getQueryJoins(tableMetaData, visibleJoinTables);
         }

         /////////////////////
         // load the record //
         /////////////////////
         let record: QRecord;
         try
         {
            ////////////////////////////////////////////////////////////////////////////
            // if the component took in a record object, then we don't need to GET it //
            ////////////////////////////////////////////////////////////////////////////
            if (overrideRecord)
            {
               record = overrideRecord;
            }
            else
            {
               record = await qController.get(tableName, id, tableVariant, null, queryJoins);
            }

            setRecord(record);
            recordAnalytics({category: "tableEvents", action: "view", label: tableMetaData?.label + " / " + record?.recordLabel});
         }
         catch (e)
         {
            const historyPurge = (path: string) => 
            {
               try
               {
                  HistoryUtils.ensurePathNotInHistory(location.pathname);
               }
               catch (e)
               {
                  console.error("Error pushing history: " + e);
               }
            };

            if (e instanceof QException)
            {
               if ((e as QException).status === 404)
               {
                  setNotFoundMessage(`${tableMetaData.label} ${id} could not be found.`);
                  historyPurge(location.pathname);
                  return;
               }
               else if ((e as QException).status === 403)
               {
                  setNotFoundMessage(`You do not have permission to view ${tableMetaData.label} records`);
                  historyPurge(location.pathname);
                  return;
               }
            }
         }

         setPageHeader(record.recordLabel);

         if (!launchingProcess && !activeModalProcess)
         {
            try
            {
               HistoryUtils.push({label: `${tableMetaData?.label}: ${record.recordLabel}`, path: location.pathname, iconName: table.iconName});
            }
            catch (e)
            {
               console.error("Error pushing history: " + e);
            }
         }

         /////////////////////////////////////////////////
         // define the sections, e.g., for the left-bar //
         /////////////////////////////////////////////////
         const tableSections = TableUtils.getSectionsForRecordSidebar(tableMetaData, null, undefined, "RECORD_VIEW");
         setTableSections(tableSections);

         ////////////////////////////////////////////////////
         // make elements with the values for each section //
         ////////////////////////////////////////////////////
         const sectionFieldElements = new Map();
         const nonT1TableSections = [];
         const initialCollapsibleOpenStates: Record<string, boolean> = {};
         for (let i = 0; i < tableSections.length; i++)
         {
            let section = tableSections[i];

            if (section.alternatives?.has("RECORD_VIEW"))
            {
               section = section.alternatives.get("RECORD_VIEW")
            }

            if (section.isHidden)
            {
               continue;
            }

            //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
            // if a section has collapsible metaData that says it IS collapsible, then figure out what the initial open state should be //
            //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
            if (section.collapsible && section.collapsible.isCollapsible)
            {
               ///////////////////////////////////////////////////////////////////////////////////////////////////////////
               // try to read a previous value from local storage.  if it doesn't exist, use the value in the meta-data //
               ///////////////////////////////////////////////////////////////////////////////////////////////////////////
               const lsValue = localStorage.getItem(makeCollapsibleSectionOpenStateLocalStorageKey(tableMetaData.name, section.name));
               if (lsValue != undefined)
               {
                  initialCollapsibleOpenStates[section.name] = (lsValue == "true");
               }
               else
               {
                  initialCollapsibleOpenStates[section.name] = (section.collapsible.initiallyOpen === true);
               }
            }
            else
            {
               /////////////////////////////////////////////////
               // if not collapsible, set open state to true. //
               /////////////////////////////////////////////////
               initialCollapsibleOpenStates[section.name] = true;
            }

            if (section.widgetName)
            {
               ////////////////////////////////////////////////////////////////////////////
               // for a section with a widget name, call the dashboard widgets component //
               ////////////////////////////////////////////////////////////////////////////
               const widgetMetaData = metaData.widgets.get(section.widgetName);
               sectionFieldElements.set(section.name, <DashboardWidgets key={section.name} tableName={tableMetaData.name} widgetMetaDataList={[widgetMetaData]} record={record} entityPrimaryKey={record.values.get(tableMetaData.primaryKeyField)} omitWrappingGridContainer={true} screen="recordView" />);
            }
            else if (section.fieldNames)
            {
               //////////////////////////////////////////////////////////////
               // for a section with field names, render the field values. //
               //////////////////////////////////////////////////////////////
               const fields = renderSectionOfFields(section.name, section.fieldNames, tableMetaData, helpHelpActive, record, undefined, undefined, tableVariant);
               sectionFieldElements.set(section.name, fields);
            }
            else
            {
               ////////////////////////////////////////////////////////////////////
               // else we don't know what goes in the widget, so, assume nothing //
               ////////////////////////////////////////////////////////////////////
               continue;
            }

            if (section.tier === "T1")
            {
               setT1SectionElement(sectionFieldElements.get(section.name));
               setT1SectionName(section.name);
               setT1Section(section);
            }
            else
            {
               nonT1TableSections.push(tableSections[i]);
            }
         }

         setSectionFieldElements(sectionFieldElements);
         setNonT1TableSections(nonT1TableSections);
         setCollapsibleSectionOpenStates(initialCollapsibleOpenStates);

         //////////////////////////////////////////////////////////////////////////////////////////
         // read values from location.state - to display alerts - then, clear those state values //
         // this is an upgrade over where states like this used to be stored in the URL!         //
         //////////////////////////////////////////////////////////////////////////////////////////
         if (location.state)
         {
            let state: any = location.state;
            if (state["createSuccess"] || state["updateSuccess"])
            {
               setSuccessMessage(`${tableMetaData.label} successfully ${state["createSuccess"] ? "created" : "updated"}`);
            }

            if (state["warning"])
            {
               setWarningMessage(state["warning"]);
            }

            delete state["createSuccess"];
            delete state["updateSuccess"];
            delete state["warning"];

            window.history.replaceState(state, "");
         }

      })();
   }

   const handleClickDeleteButton = () => 
   {
      setDeleteConfirmationOpen(true);
      setIsDeleteSubmitting(false);
   };

   const handleDeleteConfirmClose = () => 
   {
      setDeleteConfirmationOpen(false);
   };

   const handleDelete = (event: { preventDefault: () => void }) => 
   {
      setIsDeleteSubmitting(true);
      event?.preventDefault();
      (async () => 
      {
         recordAnalytics({category: "tableEvents", action: "delete", label: tableMetaData?.label + " / " + record?.recordLabel});

         await qController.delete(tableName, id)
            .then(() => 
            {
               setIsDeleteSubmitting(false);
               const path = pathParts.slice(0, -1).join("/");
               navigate(path, {state: {deleteSuccess: true}});
            })
            .catch((error) => 
            {
               setIsDeleteSubmitting(false);
               setDeleteConfirmationOpen(false);
               console.log("Caught:");
               console.log(error);

               if (error.message.toLowerCase().startsWith("warning"))
               {
                  const path = pathParts.slice(0, -1).join("/");
                  navigate(path, {state: {deleteSuccess: true, warning: error.message}});
               }
               else
               {
                  setErrorMessage(error.message);
                  HtmlUtils.autoScroll(0);
               }
            });
      })();
   };

   function processClicked(process: QProcessMetaData)
   {
      openModalProcess(process);
   }


   //////////////////////////////////////////////////////////////////////////////////////////
   // populate the RecordViewMenuActions object - basically callbacks for the menu to use. //
   //////////////////////////////////////////////////////////////////////////////////////////
   const recordViewMenuActions: RecordViewMenuActions =
      {
         new: () => gotoCreate(),
         copy: () => navigate("copy"),
         edit: () => navigate("edit"),
         delete: (closeMenu?: () => void) => 
         {
            closeMenu?.();
            handleClickDeleteButton();
         },
         developerMode: () => navigate("dev"),
         audit: (closeMenu?: () => void) => 
         {
            closeMenu?.();
            navigate("#audit");
         },
         runProcess: (processName: string) => 
         {
            const process = metaData?.processes?.get(processName);
            if (process)
            {
               processClicked(process);
            }
            else
            {
               console.log("No process found for name: [" + processName + "]");
            }
         },
         downloadFileFromField: (fieldName: string, closeMenu?: () => void) => 
         {
            ////////////////////////////////////////////////////////////
            // todo can or should this share more with BlobComponent? //
            ////////////////////////////////////////////////////////////
            const fieldValue = record?.values?.get(fieldName);
            if (fieldName && fieldValue)
            {
               const field = tableMetaData.fields.get(fieldName);
               const url = ValueUtils.getUrlFromBlobOrFileDownloadField(fieldValue, tableVariant, field, record, fieldName);

               if (field.type == QFieldType.BLOB)
               {
                  const fileName = record?.displayValues?.get(fieldName) ?? fieldName;
                  HtmlUtils.downloadUrlViaIFrame(field, url, fileName);
               }
               else
               {
                  window.open(url);
               }
            }

            closeMenu?.();
         },
         getMetaData: () => 
         {
            return metaData;
         },
         getTableProcesses: () => 
         {
            return tableProcesses;
         },
         getGenericProcesses: () => 
         {
            return getGenericProcesses(metaData);
         }
      };

   /////////////////////////////////////////////////////////////////////////////////////////////////
   // build an object to help track what's shown in the actions menu.                             //
   // we tried just passing (new ItemsShownInMenu()) as the prop, but that didn't seem to work... //
   /////////////////////////////////////////////////////////////////////////////////////////////////
   const itemsShownInActionsMenu = new ItemsShownInMenu();


   /*******************************************************************************
    ** function to open the sharing modal
    *******************************************************************************/
   const openShareModal = () => 
   {
      setShowShareModal(true);
   };


   /*******************************************************************************
    ** function to close the sharing modal
    *******************************************************************************/
   const closeShareModal = () => 
   {
      setShowShareModal(false);
   };


   /*******************************************************************************
    ** render the share button (if allowed for table)
    *******************************************************************************/
   const renderShareButton = () => 
   {
      if (tableMetaData && tableMetaData.shareableTableMetaData)
      {
         let shareDisabled = true;
         let disabledTooltipText = "";
         if (tableMetaData.shareableTableMetaData.thisTableOwnerIdFieldName && record)
         {
            const ownerId = record.values.get(tableMetaData.shareableTableMetaData.thisTableOwnerIdFieldName);
            if (ownerId != currentUserId)
            {
               disabledTooltipText = `Only the owner of a ${tableMetaData.label} may share it.`;
               shareDisabled = true;
            }
            else
            {
               disabledTooltipText = "";
               shareDisabled = false;
            }
         }
         else
         {
            shareDisabled = false;
         }

         return (<Box width={standardWidth} mr={2}>
            <Tooltip title={disabledTooltipText}>
               <span>
                  <MDButton id="shareButton" type="button" color={preferredColorNameInfoOrPrimary()} size="small" onClick={() => openShareModal()} fullWidth startIcon={<Icon>group_add</Icon>} disabled={shareDisabled}>
                     Share
                  </MDButton>
               </span>
            </Tooltip>
         </Box>);
      }

      return (<React.Fragment />);
   };


   const openModalProcess = (process: QProcessMetaData = null) => 
   {
      navigate(process.name);
      closeActionsMenu();
   };

   const closeModalProcess = (event: object, reason: string) => 
   {
      if (reason === "backdropClick" || reason === "escapeKeyDown")
      {
         return;
      }

      //////////////////////////////////////////////////////////////////////////
      // when closing a modal process, navigate up to the record being viewed //
      //////////////////////////////////////////////////////////////////////////
      if (location.hash)
      {
         navigate(location.pathname);
      }
      else
      {
         const newPath = location.pathname.split("/");
         newPath.pop();
         navigate(newPath.join("/"));
      }

      setActiveModalProcess(null);
   };

   function openEditChildForm(table: QTableMetaData, id: any = null, defaultValues: any, disabledFields: any)
   {
      const showEditChildForm: any = {};
      showEditChildForm.table = table;
      showEditChildForm.id = id;
      showEditChildForm.defaultValues = defaultValues;
      showEditChildForm.disabledFields = disabledFields;
      setShowEditChildForm(showEditChildForm);
   }

   const closeEditChildForm = (event: object, reason: string) => 
   {
      if (reason === "backdropClick" || reason === "escapeKeyDown")
      {
         return;
      }

      /////////////////////////////////////////////////
      // navigate back up to the record being viewed //
      /////////////////////////////////////////////////
      if (location.hash)
      {
         navigate(location.pathname);
      }
      else
      {
         const newPath = location.pathname.split("/");
         newPath.pop();
         newPath.pop();
         navigate(newPath.join("/"));
      }

      setShowEditChildForm(null);
   };

   const closeAudit = (event: object, reason: string) => 
   {
      if (reason === "backdropClick") // allowing esc here, as it's a non-destructive close || reason === "escapeKeyDown")
      {
         return;
      }

      setShowAudit(false);

      /////////////////////////////////////////////////
      // navigate back up to the record being viewed //
      /////////////////////////////////////////////////
      if (location.hash)
      {
         navigate(location.pathname);
      }
      else
      {
         const newPath = location.pathname.split("/");
         newPath.pop();
         navigate(newPath.join("/"));
      }
   };


   /***************************************************************************
    * handle clicking a section header, to toggle it opened or closed.
    * write the updated value to local storage.
    ***************************************************************************/
   function toggleCollapsibleSectionOpenState(sectionName: string): void
   {
      const newValue = !collapsibleSectionOpenStates[sectionName];
      setCollapsibleSectionOpenStates((prevState) => ({...prevState, [sectionName]: newValue}));
      localStorage.setItem(makeCollapsibleSectionOpenStateLocalStorageKey(tableMetaData.name, sectionName), newValue.toString());
   }

   const tableNameForId = tableMetaData ? sanitizeId(tableMetaData.name) : "";

   const materialDashboardTableMetaData = tableMetaData?.supplementalTableMetaData?.get("materialDashboard");
   const materialDashboardInstanceMetaData = metaData?.supplementalInstanceMetaData?.get("materialDashboard");
   const showRecordSidebar = materialDashboardTableMetaData?.showRecordSidebar !== false;
   const recordViewActionsPlacement = materialDashboardInstanceMetaData?.recordViewActionsPlacement ?? materialDashboardTableMetaData?.recordViewActionsPlacement ?? "IN_IDENTITY_SECTION";
   const showRecordViewActionsInlineWithPageTitle = recordViewActionsPlacement === "INLINE_WITH_PAGE_TITLE";

   const renderRecordViewActions = (boxProps: any = {}) => 
   {
      return (
         <>
            <Box display="flex" {...boxProps}>
               <GotoRecordButton metaData={metaData} tableMetaData={tableMetaData} />
               {renderShareButton()}
               {metaData && tableMetaData && <RecordViewAdditionalMenus tableMetaData={tableMetaData} record={record} actions={recordViewMenuActions} />}
               {metaData && tableMetaData && <QActionsMenuButton isOpen={actionsMenuAnchorElement} onClickHandler={openActionsMenu} />}
            </Box>
            <Menu
               anchorEl={actionsMenuAnchorElement}
               anchorOrigin={{vertical: "bottom", horizontal: "right",}}
               transformOrigin={{vertical: "top", horizontal: "right",}}
               open={Boolean(actionsMenuAnchorElement)}
               onClose={closeActionsMenu}
               keepMounted
               data-qqq-id="record-view-actions-menu"
            >
               {actionMenu?.items.map((item, index) => (<RecordViewMenuItem key={index} tableMetaData={tableMetaData} menuItem={item} record={record} actions={recordViewMenuActions} closeMenu={closeActionsMenu} itemsShown={itemsShownInActionsMenu} />))}
            </Menu>
         </>
      );
   };

   const pageHeaderRecordViewActions = useMemo(() => 
   {
      if (!showRecordViewActionsInlineWithPageTitle)
      {
         return (null);
      }

      return (
         <Box display="flex" pb="1rem" pr="0.5rem">
            {renderRecordViewActions()}
         </Box>
      );
   }, [showRecordViewActionsInlineWithPageTitle, metaData, tableMetaData, record, actionsMenuAnchorElement, actionMenu]);

   useEffect(() => 
   {
      setPageHeaderRightContent?.(pageHeaderRecordViewActions);

      return () => setPageHeaderRightContent?.(null);
   }, [setPageHeaderRightContent, pageHeaderRecordViewActions]);

   return (
      <BaseLayout>
         <Box className="recordView" data-qqq-id={`record-view-${tableNameForId}`}>
            <Grid container>
               <Grid item xs={12}>
                  <Box mb={3}>
                     {
                        notFoundMessage
                           ?
                           <Alert color="error" sx={{mb: 3}} icon={<Icon>warning</Icon>}>{notFoundMessage}</Alert>
                           :
                           <Box pb={3}>
                              {
                                 successMessage ?
                                    <Alert color="success" sx={{mb: 3}} onClose={() => 
                                    {
                                       setSuccessMessage(null);
                                    }}>
                                       {successMessage}
                                    </Alert>
                                    : ("")
                              }
                              {
                                 warningMessage ?
                                    <Alert color="warning" sx={{mb: 3}} icon={<Icon>warning</Icon>} onClose={() => 
                                    {
                                       setWarningMessage(null);
                                    }}>
                                       {warningMessage}
                                    </Alert>
                                    : ("")
                              }
                              {
                                 errorMessage ?
                                    <Alert color="error" sx={{mb: 3}} onClose={() => 
                                    {
                                       setErrorMessage(null);
                                    }}>
                                       {errorMessage}
                                    </Alert>
                                    : ("")
                              }

                              <Grid container spacing={3} flexWrap={{md: "nowrap"}}>
                                 {showRecordSidebar && <Grid item xs={12} lg={3} className="recordSidebar">
                                    <QRecordSidebar tableSections={tableSections} />
                                 </Grid>}
                                 <Grid item xs={12} lg={showRecordSidebar ? 9 : 12} className={showRecordSidebar ? "recordWithSidebar" : ""}>

                                    <Grid container spacing={3}>
                                       <Grid item xs={12} mb={3}>
                                          <Card id={t1SectionName} sx={{scrollMarginTop: "100px", minHeight: "88px"}} data-qqq-id={`record-view-header-${tableNameForId}`}>
                                             <Box display="flex" p={3} pb={1}>
                                                <Box mr={1.5} data-qqq-id={`record-view-avatar-${tableNameForId}`}>
                                                   <Avatar sx={{bgcolor: accentColor}}>
                                                      <Icon>
                                                         {tableMetaData?.iconName}
                                                      </Icon>
                                                   </Avatar>
                                                </Box>
                                                <Box display="flex" justifyContent="space-between" width="100%" alignItems="flex-start" flexWrap={{xs: "wrap", md: "nowrap"}}>
                                                   <Typography variant="h5" mb="0.5rem" data-qqq-id={`record-view-title-${tableNameForId}`}>
                                                      {tableMetaData && record ? `Viewing ${tableMetaData?.label}: ${record?.recordLabel || ""}` : ""}
                                                   </Typography>
                                                   {!showRecordViewActionsInlineWithPageTitle && renderRecordViewActions({ml: "auto"})}
                                                </Box>
                                             </Box>
                                             {t1Section && getSectionHelp(t1Section)}
                                             {t1SectionElement ? (<Box p={3} pt={0}>{t1SectionElement}</Box>) : null}
                                          </Card>
                                       </Grid>
                                    </Grid>
                                    <Grid container spacing={3} pb={4}>
                                       {nonT1TableSections.length > 0 ? nonT1TableSections.map((section: QTableSection) => 
                                       {
                                          ///////////////////////////////////////////////
                                          // render all sections after the T1 section. //
                                          ///////////////////////////////////////////////
                                          const open = collapsibleSectionOpenStates[section.name];

                                          ////////////////////////////////////////////////////////////////////////////
                                          // if the section is a widget, hand off to the DashboardWidgets component //
                                          ////////////////////////////////////////////////////////////////////////////
                                          if (section.widgetName)
                                          {
                                             const widgetMetaData = metaData.widgets.get(section.widgetName);
                                             if (section.collapsible)
                                             {
                                                ///////////////////////////////////////////////////////////////////////////////////
                                                // if the section has collapsible meta-data, then put that meta-data in the      //
                                                // widget meta data. this would overwrite the widget's own collapsible meta-data //
                                                // (which is intentional - the section is more important in this case.           //
                                                ///////////////////////////////////////////////////////////////////////////////////
                                                widgetMetaData.collapsible = section.collapsible;
                                             }

                                             return (
                                                <Grid id={section.name} key={section.name} item lg={widgetMetaData.gridColumns ? widgetMetaData.gridColumns : 12} xs={12} sx={{display: "flex", alignItems: "stretch", flexGrow: 1, scrollMarginTop: "100px"}}>
                                                   <Box width="100%" flexGrow={1} alignItems="stretch">
                                                      <DashboardWidgets
                                                         key={section.name}
                                                         tableName={tableMetaData.name}
                                                         widgetMetaDataList={[widgetMetaData]}
                                                         record={record}
                                                         entityPrimaryKey={record.values.get(tableMetaData.primaryKeyField)}
                                                         omitWrappingGridContainer={true}
                                                         screen="recordView" />
                                                   </Box>
                                                </Grid>
                                             )
                                          }

                                          /////////////////////////////////////////////////////////////////////////////////////////////
                                          // else - not a widget - so render a grid item, with a card, containing the fields         //
                                          // if the section is collapsible, add props to it for a finger cursor and on-click handler //
                                          /////////////////////////////////////////////////////////////////////////////////////////////
                                          const moreHeaderProps = section.collapsible?.isCollapsible ? {sx: {cursor: "pointer"}, onClick: () => toggleCollapsibleSectionOpenState(section.name)} : {}

                                          return (
                                             <React.Fragment key={section.name}>
                                                <Grid id={section.name} key={section.name} item lg={section.gridColumns ?? 12} xs={12} sx={{display: "flex", alignItems: "stretch", scrollMarginTop: "100px"}}>
                                                   <Box width="100%">
                                                      <Card id={section.name} sx={{overflow: "visible", scrollMarginTop: "100px", height: open ? "100%" : "auto"}}>
                                                         <Box display="flex" justifyContent="space-between" alignItems="center" pb={open ? 0 : 1.5} {...moreHeaderProps}>
                                                            <Typography variant="h6" p={3} pb={1}>
                                                               {section.label}
                                                            </Typography>
                                                            {
                                                               section.collapsible?.isCollapsible &&
                                                                  <Box p="0.75rem 0.25rem 0">
                                                                     <IconButton onClick={() => toggleCollapsibleSectionOpenState(section.name)}>
                                                                        <Icon fontSize="large">{open ? "expand_less" : "expand_more"}</Icon>
                                                                     </IconButton>
                                                                  </Box>
                                                            }
                                                         </Box>
                                                         <Box style={{display: open ? "block" : "none"}}>
                                                            {getSectionHelp(section)}
                                                            <Box p={3} pt={0} flexDirection="column">
                                                               {sectionFieldElements.get(section.name)}
                                                            </Box>
                                                         </Box>
                                                      </Card>
                                                   </Box>
                                                </Grid>
                                             </React.Fragment>
                                          )
                                       }
                                       ) : null}
                                    </Grid>
                                    {
                                       ///////////////////////////////////////////////////////////////////////
                                       // sticky bottom button bar w/ delete & edit buttons (if applicable) //
                                       ///////////////////////////////////////////////////////////////////////
                                       tableMetaData && record && ((table.capabilities.has(Capability.TABLE_DELETE) && table.deletePermission) || (table.capabilities.has(Capability.TABLE_UPDATE) && table.editPermission)) &&
                                       <Box component="div" p={3} className={"stickyBottomButtonBar"} data-qqq-id={`record-view-button-bar-${tableNameForId}`}>
                                          <Grid container justifyContent="flex-end" spacing={3}>
                                             {
                                                table.capabilities.has(Capability.TABLE_DELETE) && table.deletePermission && <QDeleteButton onClickHandler={handleClickDeleteButton} />
                                             }
                                             {
                                                table.capabilities.has(Capability.TABLE_UPDATE) && table.editPermission && <QEditButton />
                                             }
                                          </Grid>
                                       </Box>
                                    }

                                 </Grid>
                              </Grid>

                              {/* Delete confirmation Dialog */}
                              <Dialog
                                 open={deleteConfirmationOpen}
                                 onClose={handleDeleteConfirmClose}
                                 aria-labelledby="alert-dialog-title"
                                 aria-describedby="alert-dialog-description"
                                 data-qqq-id="delete-confirmation-dialog"
                              >
                                 <DialogTitle id="alert-dialog-title" data-qqq-id="delete-confirmation-title">Confirm Deletion</DialogTitle>
                                 <DialogContent>
                                    <DialogContentText id="alert-dialog-description" data-qqq-id="delete-confirmation-text">
                                       Are you sure you want to delete this record?
                                    </DialogContentText>
                                 </DialogContent>
                                 <DialogActions data-qqq-id="delete-confirmation-actions">
                                    <Button onClick={handleDeleteConfirmClose} data-qqq-id="button-delete-no">No</Button>
                                    <Button onClick={handleDelete} autoFocus disabled={isDeleteSubmitting} data-qqq-id="button-delete-yes">
                                       Yes
                                    </Button>
                                 </DialogActions>
                              </Dialog>

                              {
                                 activeModalProcess &&
                                 <Modal open={activeModalProcess !== null} onClose={(event, reason) => closeModalProcess(event, reason)}>
                                    <div className="modalProcess">
                                       <ProcessRun process={activeModalProcess} isModal={true} table={tableMetaData} recordIds={[id]} closeModalHandler={closeModalProcess} />
                                    </div>
                                 </Modal>
                              }

                              {
                                 showEditChildForm &&
                                 <Modal open={showEditChildForm !== null} onClose={(event, reason) => closeEditChildForm(event, reason)}>
                                    <div className="modalEditForm">
                                       <EntityForm
                                          isModal={true}
                                          closeModalHandler={closeEditChildForm}
                                          table={showEditChildForm.table}
                                          id={showEditChildForm.id}
                                          defaultValues={showEditChildForm.defaultValues}
                                          disabledFields={showEditChildForm.disabledFields} />
                                    </div>
                                 </Modal>
                              }

                              {
                                 showAudit && tableMetaData && record &&
                                 <Modal open={showAudit} onClose={(event, reason) => closeAudit(event, reason)}>
                                    <div className="audit">
                                       <Box sx={{position: "absolute", overflowY: "auto", maxHeight: "100%", width: "100%"}}>
                                          <Card sx={{my: 5, mx: "auto", pb: 0, maxWidth: "1024px"}}>
                                             <Box component="div">
                                                <AuditBody recordId={id} record={record} tableMetaData={tableMetaData} />
                                                <Box p={3} display="flex" flexDirection="row" justifyContent="flex-end">
                                                   <QCancelButton label="Close" onClickHandler={() => closeAudit(null, null)} disabled={false} />
                                                </Box>
                                             </Box>
                                          </Card>
                                       </Box>
                                    </div>
                                 </Modal>
                              }

                              {
                                 showShareModal && tableMetaData && record &&
                                 <ShareModal open={showShareModal} onClose={closeShareModal} tableMetaData={tableMetaData} record={record}></ShareModal>
                              }

                           </Box>
                     }
                  </Box>
               </Grid>
            </Grid>
         </Box>
      </BaseLayout>
   );
}

export default RecordView;
