/*
 * QQQ - Low-code Application Framework for Engineers.
 * Copyright (C) 2021-2026.  Kingsrook, LLC
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

import {Typography} from "@mui/material";
import Alert from "@mui/material/Alert";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Grid from "@mui/material/Grid";
import Icon from "@mui/material/Icon";
import Menu from "@mui/material/Menu";
import Modal from "@mui/material/Modal";
import {Capability} from "@qrunio/qqq-frontend-core/lib/model/metaData/Capability";
import {QProcessMetaData} from "@qrunio/qqq-frontend-core/lib/model/metaData/QProcessMetaData";
import {QMenu} from "@qrunio/qqq-frontend-core/lib/model/metaData/QMenu";
import {QTableMetaData} from "@qrunio/qqq-frontend-core/lib/model/metaData/QTableMetaData";
import QContext from "QContext";
import {preferredColorNameInfoOrPrimary} from "qqq/assets/theme/functions/preferInfoColorToPrimaryColor";
import {QActionsMenuButton, QCancelButton, QDeleteButton, QEditButton, QSaveButton} from "qqq/components/buttons/DefaultButtons";
import MDButton from "qqq/components/legacy/MDButton";
import {GotoRecordButton} from "qqq/components/misc/GotoRecordDialog";
import {RecordViewAdditionalMenus, RecordViewMenuItem, ItemsShownInMenu, RecordViewMenuActions} from "qqq/components/view/RecordViewMenus";
import BaseLayout from "qqq/layouts/BaseLayout";
import ProcessRun from "qqq/pages/processes/ProcessRun";
import RecordScreenBody from "qqq/pages/records/RecordScreenBody";
import {RecordScreenMode} from "qqq/pages/records/RecordScreenContext";
import RecordScreenSection from "qqq/pages/records/RecordScreenSection";
import {useRecordScreen} from "qqq/pages/records/useRecordScreen";
import Client from "qqq/utils/qqq/Client";
import HtmlUtils from "qqq/utils/HtmlUtils";
import ValueUtils from "qqq/utils/qqq/ValueUtils";
import {QFieldType} from "@qrunio/qqq-frontend-core/lib/model/metaData/QFieldType";
import {sanitizeId} from "qqq/utils/qqqIdUtils";
import React, {useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState} from "react";
import {useLocation, useNavigate, useParams} from "react-router-dom";
import RecordScreenModal from "qqq/pages/records/RecordScreenModal";
import AuditBody from "qqq/components/audits/AuditBody";
import ShareModal from "qqq/components/sharing/ShareModal";


interface Props
{
   table: QTableMetaData;
   mode?: RecordScreenMode;
   isCopy?: boolean;
   launchProcess?: QProcessMetaData;
}


/***************************************************************************
 ** Unified Record Screen: view, edit, and create modes in one component.
 ** Fields stay in the same grid positions across mode transitions.
 ***************************************************************************/
export default function RecordScreen({table, mode: propMode, isCopy, launchProcess}: Props): JSX.Element
{
   const {id} = useParams();
   const location = useLocation();
   const navigate = useNavigate();

   const {accentColor, dotMenuOpen, keyboardHelpOpen, modalStack, tableProcesses, setPageHeader, setPageHeaderRightContent} = useContext(QContext);

   // scroll correction: stores field name + Y position before mode switch
   const scrollCorrectionRef = useRef<{fieldName: string; yBefore: number} | null>(null);

   const screen = useRecordScreen(table.name, id, propMode, isCopy, {scrollCorrectionRef});
   const {
      mode, setMode, record, tableMetaData, metaData,
      t1Section, formFieldsBySection,
      loading, notFoundMessage, notAllowedError,
      saveRecord, deleteRecord,
      allTableProcesses, tableVariant,
      setSuccessMessage, setWarningMessage, setErrorMessage,
      showEditChildForm: hookShowEditChildForm, setShowEditChildForm: hookSetShowEditChildForm,
      submitEditChildForm,
   } = screen;

   // If the user navigates via a React Router <Link> while in pushState-edit-mode,
   // React Router processes a navigation (location.key changes) but propMode stays "view"
   // because React Router never knew about /edit. Detect this and exit edit mode.
   useEffect(() =>
   {
      if (mode === "edit" && propMode === "view" && !location.pathname.endsWith("/edit"))
      {
         setMode("view");
      }
   }, [location.key]);

   // Listen for browser back/forward (popstate) to exit edit mode when URL no longer ends with /edit
   // (covers history.back() from cancel, or user pressing browser back button)
   useEffect(() =>
   {
      const handlePopState = () =>
      {
         if (!window.location.pathname.endsWith("/edit") && mode === "edit" && propMode === "view")
         {
            setMode("view");
         }
      };
      window.addEventListener("popstate", handlePopState);
      return () => window.removeEventListener("popstate", handlePopState);
   }, [mode, propMode, setMode]);

   // local UI state
   const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
   const [isDeleteSubmitting, setIsDeleteSubmitting] = useState(false);
   const [actionsMenuAnchorElement, setActionsMenuAnchorElement] = useState(null);
   const [activeModalProcess, setActiveModalProcess] = useState<QProcessMetaData>(null);
   // showEditChildForm comes from hook for edit-mode, or local for view-mode hash navigation.
   // Use hook's state as the canonical source; alias for convenience.
   const showEditChildForm = hookShowEditChildForm;
   const setShowEditChildForm = hookSetShowEditChildForm;
   const [showAudit, setShowAudit] = useState(false);
   const [showShareModal, setShowShareModal] = useState(false);
   const [actionMenu, setActionMenu] = useState(null);
   const [widgetReloadCounter, setWidgetReloadCounter] = useState(0);

   useLayoutEffect(() =>
   {
      if (scrollCorrectionRef.current)
      {
         const {fieldName: corrFieldName, yBefore} = scrollCorrectionRef.current;
         const fieldElAfter = document.querySelector(`[data-field-name='${corrFieldName}']`);
         if (fieldElAfter)
         {
            const yAfter = fieldElAfter.getBoundingClientRect().top;
            const drift = yAfter - yBefore;
            if (Math.abs(drift) > 1)
            {
               // temporarily override smooth scrolling so the correction is instant
               const htmlEl = document.documentElement;
               const prevBehavior = htmlEl.style.scrollBehavior;
               htmlEl.style.scrollBehavior = "auto";
               window.scrollBy(0, drift);
               htmlEl.style.scrollBehavior = prevBehavior;
            }
         }
         scrollCorrectionRef.current = null;
      }
   }, [mode]);

   // ref to the formik submit function for Ctrl+S
   const formikSubmitRef = useRef<() => void>(() =>
   {
   });

   const openActionsMenu = (event: any) => setActionsMenuAnchorElement(event.currentTarget);
   const closeActionsMenu = () => setActionsMenuAnchorElement(null);

   const pathParts = location.pathname.replace(/\/+$/, "").split("/");
   const tableNameForId = tableMetaData ? sanitizeId(tableMetaData.name) : "";
   const isEditing = mode === "edit" || mode === "create";

   // keep h3 page header in sync with mode
   useEffect(() =>
   {
      if (mode === "edit" && tableMetaData && record)
      {
         setPageHeader(`Edit ${tableMetaData.label}: ${record.recordLabel ?? id}`);
      }
      else if (mode === "view" && record)
      {
         setPageHeader(record.recordLabel ?? id);
      }
   }, [mode, tableMetaData, record]);

   /////////////////////////
   // Handle cancel click //
   /////////////////////////
   const handleCancelClicked = () =>
   {
      if (isCopy)
      {
         navigate(location.pathname.replace(/\/copy$/, ""), {replace: true});
      }
      else if (id)
      {
         // capture scroll position before switching back to view mode
         const fieldSections = Array.from(document.querySelectorAll("[data-field-name]"));
         for (const el of fieldSections)
         {
            const rect = el.getBoundingClientRect();
            if (rect.top >= 0 && rect.top < window.innerHeight)
            {
               scrollCorrectionRef.current = {fieldName: el.getAttribute("data-field-name"), yBefore: rect.top};
               break;
            }
         }

         setMode("view");
         if (propMode === "view")
         {
            // edit was entered via pushState — pop the entry cleanly
            window.history.back();
         }
         else
         {
            // direct navigation to /edit URL — replace in place
            window.history.replaceState(null, "", location.pathname.replace(/\/edit$/, ""));
            window.dispatchEvent(new Event("urlchanged"));
         }
      }
      else
      {
         navigate(location.pathname.replace(/\/create$/, ""), {replace: true});
      }
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

         // Ctrl+S / Cmd+S to save in edit mode (works even when focused on inputs)
         if ((e.metaKey || e.ctrlKey) && e.key === "s" && isEditing)
         {
            e.preventDefault();
            formikSubmitRef.current?.();
            return;
         }

         if (validType && !dotMenuOpen && !keyboardHelpOpen && !showAudit && !showEditChildForm && (!modalStack || modalStack.length === 0))
         {
            if (mode === "view")
            {
               if (!e.metaKey && !e.ctrlKey && e.key === "n" && table.capabilities.has(Capability.TABLE_INSERT) && table.insertPermission)
               {
                  e.preventDefault();
                  navigate(pathParts.slice(0, -1).join("/") + "/create");
               }
               else if (!e.metaKey && !e.ctrlKey && e.key === "e" && table.capabilities.has(Capability.TABLE_UPDATE) && table.editPermission)
               {
                  e.preventDefault();
                  enterEditMode();
               }
               else if (!e.metaKey && !e.ctrlKey && e.key === "c" && table.capabilities.has(Capability.TABLE_INSERT) && table.insertPermission)
               {
                  e.preventDefault();
                  navigate("copy");
               }
               else if (!e.metaKey && !e.ctrlKey && e.key === "d" && table.capabilities.has(Capability.TABLE_DELETE) && table.deletePermission)
               {
                  e.preventDefault();
                  setDeleteConfirmationOpen(true);
               }
               else if (!e.metaKey && !e.ctrlKey && e.key === "a" && metaData?.tables?.has("audit"))
               {
                  e.preventDefault();
                  navigate("#audit");
               }
            }
         }
      };

      document.addEventListener("keydown", down);
      return () => document.removeEventListener("keydown", down);
   }, [mode, isEditing, dotMenuOpen, keyboardHelpOpen, modalStack, showEditChildForm, showAudit, metaData, location, deleteConfirmationOpen]);


   /***************************************************************************
    ** process URL hash for audit/createChild/process modals
    ***************************************************************************/
   const qController = Client.getInstance();
   const CREATE_CHILD_KEY = "createChild";

   useEffect(() =>
   {
      const hashParts = location.hash.split("/");

      ////////////////////////////////////////////////////////////////////////////////
      // look for a createChild specification in the hash                           //
      // e.g., person/42#/createChild=address/defaultValues={...}/disabledFields={} //
      ////////////////////////////////////////////////////////////////////////////////
      let foundCreateChild = false;
      for (let i = 0; i < hashParts.length; i++)
      {
         const parts = hashParts[i].split("=");
         if (parts.length > 1 && parts[0] === CREATE_CHILD_KEY)
         {
            foundCreateChild = true;
            const childTableName = parts[1];

            // parse optional defaultValues and disabledFields from subsequent hash parts
            let defaultValues: any = null;
            let disabledFields: any = null;
            for (let j = i + 1; j < hashParts.length; j++)
            {
               const subParts = hashParts[j].split("=");
               if (subParts.length > 1)
               {
                  try
                  {
                     if (subParts[0] === "defaultValues")
                     {
                        defaultValues = JSON.parse(decodeURIComponent(subParts.slice(1).join("=")));
                     }
                     else if (subParts[0] === "disabledFields")
                     {
                        disabledFields = JSON.parse(decodeURIComponent(subParts.slice(1).join("=")));
                     }
                  }
                  catch (e)
                  {
                     console.warn("Error parsing hash param", subParts[0], e);
                  }
               }
            }

            (async () =>
            {
               const childTable = await qController.loadTableMetaData(childTableName);
               setShowEditChildForm({table: childTable, id: null, defaultValues, disabledFields});
            })();
            break;
         }
      }

      if (!foundCreateChild)
      {
         // close any open child form if hash no longer has createChild
         if (showEditChildForm) setShowEditChildForm(null);
      }

      if (hashParts[0] === "#audit")
      {
         setShowAudit(true);
      }
      else
      {
         setShowAudit(false);
      }

      ////////////////////////////////////////////////////////////////////////////////
      // look for a launchProcess specification in the hash                         //
      // e.g., person/42#launchProcess=bulkInsert                                   //
      ////////////////////////////////////////////////////////////////////////////////
      for (let i = 0; i < hashParts.length; i++)
      {
         const parts = hashParts[i].split("=");
         if (parts.length > 1 && parts[0].replace("#", "") === "launchProcess")
         {
            const processName = parts[1];
            (async () =>
            {
               const processMetaData = await qController.loadProcessMetaData(processName);
               setActiveModalProcess(processMetaData);
            })();
            break;
         }
      }
   }, [location.hash]);


   /***************************************************************************
    ** process URL path for modal processes and path-based createChild
    ***************************************************************************/
   useEffect(() =>
   {
      if (mode !== "view") return;

      ////////////////////////////////////////////////////////////////////////////////////////////
      // path-based createChild: e.g., person/42/createChild/address                            //
      ////////////////////////////////////////////////////////////////////////////////////////////
      if (pathParts.length >= 4 && pathParts[pathParts.length - 4] === table.name && pathParts[pathParts.length - 2] === CREATE_CHILD_KEY)
      {
         (async () =>
         {
            const childTable = await qController.loadTableMetaData(pathParts[pathParts.length - 1]);
            setShowEditChildForm({table: childTable, id: null, defaultValues: null, disabledFields: null});
         })();
         return;
      }

      ////////////////////////////////////////////////////////////////////////////////////////////
      // modal process: e.g., person/42/someProcess                                             //
      ////////////////////////////////////////////////////////////////////////////////////////////
      if (allTableProcesses.length > 0 && pathParts.length >= 3)
      {
         if (pathParts[pathParts.length - 3] === table.name)
         {
            const processName = pathParts[pathParts.length - 1];
            const processList = allTableProcesses.filter(p => p.name.endsWith(processName));
            if (processList.length > 0)
            {
               setActiveModalProcess(processList[0]);
            }
         }
      }
   }, [location.pathname, allTableProcesses]);


   /////////////////
   // Delete flow //
   /////////////////
   const handleDelete = async () =>
   {
      setIsDeleteSubmitting(true);
      try
      {
         await deleteRecord();
      }
      catch (error: any)
      {
         setIsDeleteSubmitting(false);
         setDeleteConfirmationOpen(false);
         if (error.message?.toLowerCase().startsWith("warning"))
         {
            const path = pathParts.slice(0, -1).join("/");
            navigate(path, {state: {deleteSuccess: true, warning: error.message}});
         }
         else
         {
            setErrorMessage(error.message);
            HtmlUtils.autoScroll(0);
         }
      }
   };


   ///////////////////////
   // Actions menu data //
   ///////////////////////
   const recordViewMenuActions: RecordViewMenuActions = {
      new: (closeMenu?: () => void) =>
      {
         closeMenu?.();
         navigate(pathParts.slice(0, -1).join("/") + "/create");
      },
      copy: (closeMenu?: () => void) =>
      {
         closeMenu?.();
         navigate("copy");
      },
      edit: (closeMenu?: () => void) =>
      {
         closeMenu?.();
         enterEditMode();
      },
      delete: (closeMenu?: () => void) =>
      {
         closeMenu?.();
         setDeleteConfirmationOpen(true);
         setIsDeleteSubmitting(false);
      },
      developerMode: (closeMenu?: () => void) =>
      {
         closeMenu?.();
         navigate("dev");
      },
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
            navigate(process.name);
            closeActionsMenu();
         }
      },
      downloadFileFromField: (fieldName: string, closeMenu?: () => void) =>
      {
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

         if (closeMenu)
         {
            closeMenu();
         }
      },
      getMetaData: () => metaData,
      getTableProcesses: () => tableProcesses,
      getGenericProcesses: () => [],
   };

   const itemsShownInActionsMenu = new ItemsShownInMenu();


   ///////////////////////////////////////////
   // Actions placement & sidebar metadata //
   ///////////////////////////////////////////
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
               {tableMetaData?.shareableTableMetaData && (
                  <Box mr={2}>
                     <MDButton type="button" color={preferredColorNameInfoOrPrimary()} size="small" onClick={() => setShowShareModal(true)} fullWidth startIcon={<Icon>group_add</Icon>}>
                        Share
                     </MDButton>
                  </Box>
               )}
               {metaData && tableMetaData && <RecordViewAdditionalMenus tableMetaData={tableMetaData} record={record} actions={recordViewMenuActions} />}
               {metaData && tableMetaData && <QActionsMenuButton isOpen={actionsMenuAnchorElement} onClickHandler={openActionsMenu} />}
            </Box>
            <Menu
               anchorEl={actionsMenuAnchorElement}
               anchorOrigin={{vertical: "bottom", horizontal: "right"}}
               transformOrigin={{vertical: "top", horizontal: "right"}}
               open={Boolean(actionsMenuAnchorElement)}
               onClose={closeActionsMenu}
               keepMounted
               data-qqq-id="record-view-actions-menu"
            >
               {actionMenu?.items?.map((item: any, index: number) => (
                  <RecordViewMenuItem key={index} tableMetaData={tableMetaData} menuItem={item} record={record} actions={recordViewMenuActions} closeMenu={closeActionsMenu} itemsShown={itemsShownInActionsMenu} />
               ))}
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
         <Box display="flex" pb="1rem" pr="0.5rem" sx={{visibility: mode === "view" ? "visible" : "hidden"}}>
            {renderRecordViewActions()}
         </Box>
      );
   }, [showRecordViewActionsInlineWithPageTitle, mode, metaData, tableMetaData, record, actionsMenuAnchorElement, actionMenu]);

   useEffect(() =>
   {
      setPageHeaderRightContent?.(pageHeaderRecordViewActions);

      return () => setPageHeaderRightContent?.(null);
   }, [setPageHeaderRightContent, pageHeaderRecordViewActions]);

   /////////////////////
   // Modal callbacks //
   /////////////////////
   const closeModalProcess = (event: object, reason: string) =>
   {
      if (reason === "backdropClick" || reason === "escapeKeyDown") return;

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

   const closeAudit = (event: object, reason: string) =>
   {
      if (reason === "backdropClick") return;
      setShowAudit(false);
      if (location.hash) navigate(location.pathname);
   };

   const closeEditChildForm = (event: object, reason: string) =>
   {
      if (reason === "backdropClick" || reason === "escapeKeyDown") return;
      setShowEditChildForm(null);
      if (location.hash) navigate(location.pathname);

      // trigger widget reload when a view-mode child record was created or updated (server-persisted)
      if ((reason === "recordCreated" || reason === "recordUpdated") && mode === "view")
      {
         setWidgetReloadCounter(c => c + 1);
      }
   };


   /////////////////////////////////////////////////////////////////////////////////////////////
   // when the tableMetaData changes, grab the action menu out of it (or build a default one) //
   /////////////////////////////////////////////////////////////////////////////////////////////
   useEffect(() =>
   {
      let menu: QMenu = null;
      if (metaData && tableMetaData)
      {
         menu = (tableMetaData.menus ?? []).find(m => m.slot == "VIEW_SCREEN_ACTIONS");

         if (!menu)
         {
            menu = new QMenu(
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
      }
      setActionMenu(menu);
   }, [metaData, tableMetaData]);


   /////////////////////////
   // Handle mode switch  //
   /////////////////////////
   const enterEditMode = useCallback((fieldName?: string) =>
   {
      if (table.capabilities.has(Capability.TABLE_UPDATE) && table.editPermission)
      {
         setSuccessMessage(null);
         setWarningMessage(null);
         setErrorMessage(null);
         closeActionsMenu();

         // capture the clicked field's screen position before mode switch
         if (fieldName)
         {
            const fieldEl = document.querySelector(`[data-field-name='${fieldName}']`);
            if (fieldEl)
            {
               scrollCorrectionRef.current = {fieldName, yBefore: fieldEl.getBoundingClientRect().top};
            }
         }

         setMode("edit");
         window.history.pushState(null, "", location.pathname.replace(/\/(edit)?\/?$/, "") + "/edit");
         window.dispatchEvent(new Event("urlchanged"));

         if (fieldName)
         {
            // focus the input after React renders
            setTimeout(() =>
            {
               const input = document.querySelector(`input[name='${fieldName}']`) as HTMLInputElement;
               if (input)
               {
                  input.focus();
               }
               else
               {
                  setTimeout(() =>
                  {
                     const retryInput = document.querySelector(`input[name='${fieldName}']`) as HTMLInputElement;
                     retryInput?.focus();
                  }, 100);
               }
            }, 50);
         }
      }
   }, [table, setMode, location.pathname]);


   /////////////////
   // RENDER      //
   /////////////////
   if (loading)
   {
      return (
         <BaseLayout>
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
               <CircularProgress />
            </Box>
         </BaseLayout>
      );
   }

   if (notFoundMessage)
   {
      return (
         <BaseLayout>
            <Box mb={3}>
               <Alert color="error" sx={{mb: 3}} icon={<Icon>warning</Icon>}>{notFoundMessage}</Alert>
            </Box>
         </BaseLayout>
      );
   }

   if (notAllowedError && !isEditing)
   {
      return (
         <BaseLayout>
            <Box mb={3}>
               <Alert severity="error">{notAllowedError}</Alert>
            </Box>
         </BaseLayout>
      );
   }

   const handleFormikSubmit = async (values: any, actions: any) =>
   {
      actions.setSubmitting(true);
      try
      {
         await saveRecord(values);
      }
      catch (error: any)
      {
         if (error.message?.toLowerCase().startsWith("warning"))
         {
            const path = location.pathname.replace(/\/edit$/, "");
            navigate(path, {state: {updateSuccess: true, warning: error.message}});
         }
         else
         {
            setErrorMessage(error.message);
            HtmlUtils.autoScroll(0);
         }
      }
      finally
      {
         actions.setSubmitting(false);
      }
   };

   ////////////////
   // Main body  //
   ////////////////
   const renderT1Section = (formikProps?: any) =>
   {
      const titleText = mode === "view"
         ? (tableMetaData && record ? `Viewing ${tableMetaData?.label}: ${record?.recordLabel || ""}` : "")
         : mode === "create"
            ? (isCopy ? `Copy ${tableMetaData?.label}: ${record?.recordLabel || ""}` : `Creating New ${tableMetaData?.label}`)
            : `Edit ${tableMetaData?.label}: ${record?.recordLabel || ""}`;

      return (
         <Card id={t1Section?.name} className="recordScreenFieldSection" sx={{scrollMarginTop: "100px", minHeight: "88px", overflow: "visible"}} data-qqq-id={`record-screen-header-${tableNameForId}`}>
            <Box display="flex" p={3} pb={1}>
               <Box mr={1.5}>
                  <Avatar sx={{bgcolor: accentColor}}>
                     <Icon>{tableMetaData?.iconName}</Icon>
                  </Avatar>
               </Box>
               <Box display="flex" justifyContent="space-between" width="100%" alignItems="flex-start" flexWrap={{xs: "wrap", md: "nowrap"}}>
                  <Typography variant="h5" mb="0.5rem" data-qqq-id={`record-screen-title-${tableNameForId}`}>
                     {titleText}
                  </Typography>
                  {!showRecordViewActionsInlineWithPageTitle && (
                     <Box sx={{ml: "auto", visibility: mode === "view" ? "visible" : "hidden"}}>
                        {renderRecordViewActions()}
                     </Box>
                  )}
               </Box>
            </Box>
            {t1Section && (
               <Box p={0} pt={1}>
                  <RecordScreenSection
                     section={t1Section}
                     mode={mode}
                     record={record}
                     formFieldsBySection={formFieldsBySection}
                     tableVariant={tableVariant}
                     onEditIconClick={enterEditMode}
                     isT1={true}
                  />
               </Box>
            )}
         </Card>
      );
   };

   const renderViewModeBottomBar = () =>
   {
      if (mode !== "view" || !tableMetaData || !record) return null;

      const canDelete = table.capabilities.has(Capability.TABLE_DELETE) && table.deletePermission;
      const canEdit = table.capabilities.has(Capability.TABLE_UPDATE) && table.editPermission;

      if (!canDelete && !canEdit) return null;

      return (
         <Box component="div" p={3} className="stickyBottomButtonBar" data-qqq-id={`record-screen-button-bar-${tableNameForId}`}>
            <Grid container justifyContent="flex-end" spacing={3}>
               {canDelete && <QDeleteButton onClickHandler={() =>
               {
                  setDeleteConfirmationOpen(true);
                  setIsDeleteSubmitting(false);
               }} />}
               {canEdit && <QEditButton onClickHandler={() => enterEditMode()} />}
            </Grid>
         </Box>
      );
   };

   const renderEditModeBottomBar = (isSubmitting: boolean) => (
      <Box component="div" p={3} className="stickyBottomButtonBar" data-qqq-id={`record-screen-button-bar-${tableNameForId}`}>
         <Grid container justifyContent="flex-end" spacing={3}>
            <QCancelButton onClickHandler={handleCancelClicked} disabled={isSubmitting} />
            <QSaveButton disabled={isSubmitting || !!notAllowedError} label="Save" iconName="save" />
         </Grid>
      </Box>
   );

   const renderDeleteDialog = () => (
      <Dialog open={deleteConfirmationOpen} onClose={() => setDeleteConfirmationOpen(false)}>
         <DialogTitle>Confirm Deletion</DialogTitle>
         <DialogContent>
            <DialogContentText>Are you sure you want to delete this record?</DialogContentText>
         </DialogContent>
         <DialogActions>
            <Button onClick={() => setDeleteConfirmationOpen(false)}>No</Button>
            <Button onClick={handleDelete} autoFocus disabled={isDeleteSubmitting}>Yes</Button>
         </DialogActions>
      </Dialog>
   );

   const renderModals = () => (
      <>
         {activeModalProcess && (
            <Modal open={true} onClose={closeModalProcess}>
               <div className="modalProcess">
                  <ProcessRun process={activeModalProcess} isModal={true} table={tableMetaData} recordIds={[id]} closeModalHandler={closeModalProcess} />
               </div>
            </Modal>
         )}

         {showEditChildForm && (
            <RecordScreenModal
               open={true}
               onClose={closeEditChildForm}
               tableName={showEditChildForm.table?.name}
               recordId={showEditChildForm.id}
               defaultValues={showEditChildForm.defaultValues}
               disabledFields={showEditChildForm.disabledFields}
               onSubmitCallback={showEditChildForm.widgetName ? submitEditChildForm : null}
               overrideHeading={showEditChildForm.widgetName ? `${showEditChildForm.rowIndex != null ? "Editing" : "Creating New"} ${showEditChildForm.table?.label}` : null}
               saveButtonLabel={showEditChildForm.widgetName ? "OK" : "Save"}
               saveButtonIcon={showEditChildForm.widgetName ? "check" : "save"}
            />
         )}

         {showAudit && tableMetaData && record && (
            <Modal open={showAudit} onClose={closeAudit}>
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
         )}

         {showShareModal && tableMetaData && record && (
            <ShareModal open={showShareModal} onClose={() => setShowShareModal(false)} tableMetaData={tableMetaData} record={record} />
         )}
      </>
   );


   const renderBottomBar = (isSubmitting: boolean): JSX.Element => (
      <>
         {mode === "view" && renderViewModeBottomBar()}
         {isEditing && renderEditModeBottomBar(isSubmitting)}
      </>
   );


   /////////////////////////////////////
   // MAIN RENDER - Formik wraps all  //
   /////////////////////////////////////
   return (
      <BaseLayout>
         <Box className={`recordScreen${mode === "view" ? " recordView" : " recordEdit"}${mode === "create" ? " recordCreate" : ""}${isEditing ? " compactForm" : ""}`} data-qqq-id={`record-screen-${tableNameForId}`}>
            <Grid container>
               <Grid item xs={12}>
                  <Box mb={3}>
                     <Box pb={3}>
                        <RecordScreenBody
                           screen={screen}
                           onSubmit={handleFormikSubmit}
                           formikSubmitRef={formikSubmitRef}
                           renderT1Card={renderT1Section}
                           renderBottomBar={renderBottomBar}
                           showSidebar={showRecordSidebar}
                           widgetReloadCounter={widgetReloadCounter}
                           enterEditMode={enterEditMode}
                        />

                        {renderDeleteDialog()}
                        {renderModals()}
                     </Box>
                  </Box>
               </Grid>
            </Grid>
         </Box>
      </BaseLayout>
   );
}
