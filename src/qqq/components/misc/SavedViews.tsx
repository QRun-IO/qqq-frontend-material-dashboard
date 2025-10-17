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

import {Alert, Button} from "@mui/material";
import Box from "@mui/material/Box";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Divider from "@mui/material/Divider";
import Icon from "@mui/material/Icon";
import ListItemIcon from "@mui/material/ListItemIcon";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import {TooltipProps} from "@mui/material/Tooltip/Tooltip";
import {QController} from "@qrunio/qqq-frontend-core/lib/controllers/QController";
import {QInstance} from "@qrunio/qqq-frontend-core/lib/model/metaData/QInstance";
import {QTableMetaData} from "@qrunio/qqq-frontend-core/lib/model/metaData/QTableMetaData";
import {QJobComplete} from "@qrunio/qqq-frontend-core/lib/model/processes/QJobComplete";
import {QJobError} from "@qrunio/qqq-frontend-core/lib/model/processes/QJobError";
import {QRecord} from "@qrunio/qqq-frontend-core/lib/model/QRecord";
import FormData from "form-data";
import QContext from "QContext";
import colors from "qqq/assets/theme/base/colors";
import {QCancelButton, QDeleteButton, QSaveButton} from "qqq/components/buttons/DefaultButtons";
import RecordQueryView from "qqq/models/query/RecordQueryView";
import {QueryScreenUsage} from "qqq/pages/records/query/RecordQuery";
import FilterUtils from "qqq/utils/qqq/FilterUtils";
import {SavedViewUtils} from "qqq/utils/qqq/SavedViewUtils";
import React, {useContext, useEffect, useRef, useState} from "react";
import {useLocation, useNavigate} from "react-router-dom";

interface Props
{
   qController: QController;
   metaData: QInstance;
   tableMetaData: QTableMetaData;
   currentSavedView: QRecord;
   tableDefaultView: RecordQueryView;
   view?: RecordQueryView;
   viewAsJson?: string;
   viewOnChangeCallback?: (selectedSavedViewId: number) => void;
   loadingSavedView: boolean;
   queryScreenUsage: QueryScreenUsage;
}

function SavedViews({qController, metaData, tableMetaData, currentSavedView, tableDefaultView, view, viewAsJson, viewOnChangeCallback, loadingSavedView, queryScreenUsage}: Props): JSX.Element
{
   const navigate = useNavigate();

   const [savedViews, setSavedViews] = useState([] as QRecord[]);
   const [yourSavedViews, setYourSavedViews] = useState([] as QRecord[]);
   const [viewsSharedWithYou, setViewsSharedWithYou] = useState([] as QRecord[]);
   const [savedViewsMenu, setSavedViewsMenu] = useState(null);
   const [savedViewsHaveLoaded, setSavedViewsHaveLoaded] = useState(false);
   const [isSubmitting, setIsSubmitting] = useState(false);

   const [saveFilterPopupOpen, setSaveFilterPopupOpen] = useState(false);
   const [isSaveFilterAs, setIsSaveFilterAs] = useState(false);
   const [isRenameFilter, setIsRenameFilter] = useState(false);
   const [isDeleteFilter, setIsDeleteFilter] = useState(false);
   const [savedViewNameInputValue, setSavedViewNameInputValue] = useState(null as string);
   const [popupAlertContent, setPopupAlertContent] = useState("");

   const anchorRef = useRef<HTMLDivElement>(null);
   const location = useLocation();
   const [saveOptionsOpen, setSaveOptionsOpen] = useState(false);

   const SAVE_OPTION = "Save...";
   const DUPLICATE_OPTION = "Duplicate...";
   const RENAME_OPTION = "Rename...";
   const DELETE_OPTION = "Delete...";
   const CLEAR_OPTION = "New View";
   const NEW_REPORT_OPTION = "Create Report from Current View";

   const {accentColor, accentColorLight, userId: currentUserId} = useContext(QContext);

   /////////////////////////////////////////////////////////////////////////////////////////////
   // this component is used by <RecordQuery> - but that component has different usages -     //
   // e.g., the full-fledged query screen, but also, within other screens (e.g., a modal      //
   // under the FilterAndColumnsSetupWidget).  So, there are some behaviors we only want when //
   // we're on the full-fledged query screen, such as changing the URL with saved view ids.   //
   /////////////////////////////////////////////////////////////////////////////////////////////
   const isQueryScreen = queryScreenUsage == "queryScreen";

   const openSavedViewsMenu = (event: any) => setSavedViewsMenu(event.currentTarget);
   const closeSavedViewsMenu = () => setSavedViewsMenu(null);

   //////////////////////////////////////////////////////////////////////////
   // load filters on first run, then monitor location or metadata changes //
   //////////////////////////////////////////////////////////////////////////
   useEffect(() =>
   {
      loadSavedViews()
         .then(() =>
         {
            setSavedViewsHaveLoaded(true);
         });
   }, [location, tableMetaData]);


   const baseView = currentSavedView ? JSON.parse(currentSavedView.values.get("viewJson")) as RecordQueryView : tableDefaultView;
   const viewDiffs = SavedViewUtils.diffViews(tableMetaData, baseView, view);
   let viewIsModified = false;
   if (viewDiffs.length > 0)
   {
      viewIsModified = true;
   }

   /*******************************************************************************
    ** make request to load all saved filters from backend
    *******************************************************************************/
   async function loadSavedViews()
   {
      if (!tableMetaData)
      {
         return;
      }

      const formData = new FormData();
      formData.append("tableName", tableMetaData.name);

      let savedViews = await makeSavedViewRequest("querySavedView", formData);
      setSavedViews(savedViews);

      const yourSavedViews: QRecord[] = [];
      const viewsSharedWithYou: QRecord[] = [];
      for (let i = 0; i < savedViews.length; i++)
      {
         const record = savedViews[i];
         if (record.values.get("userId") == currentUserId)
         {
            yourSavedViews.push(record);
         }
         else
         {
            viewsSharedWithYou.push(record);
         }
      }
      setYourSavedViews(yourSavedViews);
      setViewsSharedWithYou(viewsSharedWithYou);
   }


   /*******************************************************************************
    ** fired when a saved record is clicked from the dropdown
    *******************************************************************************/
   const handleSavedViewRecordOnClick = async (record: QRecord) =>
   {
      setSaveFilterPopupOpen(false);
      closeSavedViewsMenu();
      viewOnChangeCallback(record.values.get("id"));
      if (isQueryScreen)
      {
         navigate(`${metaData.getTablePathByName(tableMetaData.name)}/savedView/${record.values.get("id")}`);
      }
   };


   /*******************************************************************************
    ** fired when a save option is selected from the save... button/dropdown combo
    *******************************************************************************/
   const handleDropdownOptionClick = (optionName: string) =>
   {
      setSaveOptionsOpen(false);
      setPopupAlertContent("");
      closeSavedViewsMenu();
      setSaveFilterPopupOpen(true);
      setIsSaveFilterAs(false);
      setIsRenameFilter(false);
      setIsDeleteFilter(false);

      switch (optionName)
      {
         case SAVE_OPTION:
            if (currentSavedView == null)
            {
               setSavedViewNameInputValue("");
            }
            break;
         case DUPLICATE_OPTION:
            setSavedViewNameInputValue("");
            setIsSaveFilterAs(true);
            break;
         case CLEAR_OPTION:
            setSaveFilterPopupOpen(false);
            viewOnChangeCallback(null);
            if (isQueryScreen)
            {
               navigate(metaData.getTablePathByName(tableMetaData.name));
            }
            break;
         case RENAME_OPTION:
            if (currentSavedView != null)
            {
               setSavedViewNameInputValue(currentSavedView.values.get("label"));
            }
            setIsRenameFilter(true);
            break;
         case DELETE_OPTION:
            setIsDeleteFilter(true);
            break;
         case NEW_REPORT_OPTION:
            createNewReport();
            break;
      }
   };


   /*******************************************************************************
    **
    *******************************************************************************/
   function createNewReport()
   {
      const defaultValues: { [key: string]: any } = {};
      defaultValues.tableName = tableMetaData.name;

      let filterForBackend = JSON.parse(JSON.stringify(view.queryFilter));
      filterForBackend = FilterUtils.prepQueryFilterForBackend(tableMetaData, filterForBackend);

      defaultValues.queryFilterJson = JSON.stringify(filterForBackend);
      defaultValues.columnsJson = JSON.stringify(view.queryColumns);
      navigate(`${metaData.getTablePathByName("savedReport")}/create#defaultValues=${encodeURIComponent(JSON.stringify(defaultValues))}`);
   }


   /*******************************************************************************
    ** fired when save or delete button saved on confirmation dialogs
    *******************************************************************************/
   async function handleFilterDialogButtonOnClick()
   {
      try
      {
         setPopupAlertContent("");
         setIsSubmitting(true);

         const formData = new FormData();
         if (isDeleteFilter)
         {
            formData.append("id", currentSavedView.values.get("id"));
            await makeSavedViewRequest("deleteSavedView", formData);

            setSaveFilterPopupOpen(false);
            setSaveOptionsOpen(false);

            await (async () =>
            {
               handleDropdownOptionClick(CLEAR_OPTION);
            })();
         }
         else
         {
            formData.append("tableName", tableMetaData.name);

            /////////////////////////////////////////////////////////////////////////////////////////////////
            // clone view via json serialization/deserialization                                           //
            // then replace the viewJson in it with a copy that has had its possible values changed to ids //
            // then stringify that for the backend                                                         //
            /////////////////////////////////////////////////////////////////////////////////////////////////
            const viewObject = JSON.parse(JSON.stringify(view));
            viewObject.queryFilter = JSON.parse(JSON.stringify(FilterUtils.convertFilterPossibleValuesToIds(viewObject.queryFilter)));
            viewObject.queryFilter = FilterUtils.prepQueryFilterForBackend(tableMetaData, viewObject.queryFilter);

            ////////////////////////////////////////////////////////////////////////////
            // strip away incomplete filters too, just for cleaner saved view filters //
            ////////////////////////////////////////////////////////////////////////////
            FilterUtils.stripAwayIncompleteCriteria(viewObject.queryFilter);

            formData.append("viewJson", JSON.stringify(viewObject));

            if (isSaveFilterAs || isRenameFilter || currentSavedView == null)
            {
               formData.append("label", savedViewNameInputValue);
               if (currentSavedView != null && isRenameFilter)
               {
                  formData.append("id", currentSavedView.values.get("id"));
               }
            }
            else
            {
               formData.append("id", currentSavedView.values.get("id"));
               formData.append("label", currentSavedView?.values.get("label"));
            }
            const recordList = await makeSavedViewRequest("storeSavedView", formData);
            await (async () =>
            {
               if (recordList && recordList.length > 0)
               {
                  setSavedViewsHaveLoaded(false);
                  loadSavedViews();
                  handleSavedViewRecordOnClick(recordList[0]);
               }
            })();
         }

         setSaveFilterPopupOpen(false);
         setSaveOptionsOpen(false);
      }
      catch (e: any)
      {
         let message = JSON.stringify(e);
         if (typeof e == "string")
         {
            message = e;
         }
         else if (typeof e == "object" && e.message)
         {
            message = e.message;
         }

         setPopupAlertContent(message);
         console.log(`Setting error: ${message}`);
      }
      finally
      {
         setIsSubmitting(false);
      }
   }


   /*******************************************************************************
    ** hides/shows the save options
    *******************************************************************************/
   const handleToggleSaveOptions = () =>
   {
      setSaveOptionsOpen((prevOpen) => !prevOpen);
   };


   /*******************************************************************************
    ** closes save options menu (on clickaway)
    *******************************************************************************/
   const handleSaveOptionsMenuClose = (event: Event) =>
   {
      if (anchorRef.current && anchorRef.current.contains(event.target as HTMLElement))
      {
         return;
      }

      setSaveOptionsOpen(false);
   };


   /*******************************************************************************
    ** stores the current dialog input text to state
    *******************************************************************************/
   const handleSaveFilterInputChange = (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) =>
   {
      setSavedViewNameInputValue(event.target.value);
   };


   /*******************************************************************************
    ** closes current dialog
    *******************************************************************************/
   const handleSaveFilterPopupClose = () =>
   {
      setSaveFilterPopupOpen(false);
   };


   /*******************************************************************************
    ** make a request to the backend for various savedView processes
    *******************************************************************************/
   async function makeSavedViewRequest(processName: string, formData: FormData): Promise<QRecord[]>
   {
      /////////////////////////
      // fetch saved filters //
      /////////////////////////
      let savedViews = [] as QRecord[];
      try
      {
         //////////////////////////////////////////////////////////////////
         // we don't want this job to go async, so, pass a large timeout //
         //////////////////////////////////////////////////////////////////
         formData.append(QController.STEP_TIMEOUT_MILLIS_PARAM_NAME, 60 * 1000);
         const processResult = await qController.processInit(processName, formData, qController.defaultMultipartFormDataHeaders());
         if (processResult instanceof QJobError)
         {
            const jobError = processResult as QJobError;
            throw (jobError.error);
         }
         else
         {
            const result = processResult as QJobComplete;
            if (result.values.savedViewList)
            {
               for (let i = 0; i < result.values.savedViewList.length; i++)
               {
                  const qRecord = new QRecord(result.values.savedViewList[i]);
                  savedViews.push(qRecord);
               }
            }
         }
      }
      catch (e)
      {
         throw (e);
      }

      return (savedViews);
   }

   const hasStorePermission = metaData?.processes.has("storeSavedView");
   const hasDeletePermission = metaData?.processes.has("deleteSavedView");
   const hasQueryPermission = metaData?.processes.has("querySavedView");
   const hasSavedReportsPermission = metaData?.tables.has("savedReport");

   const tooltipMaxWidth = (maxWidth: string) =>
   {
      return ({
         slotProps: {
            tooltip: {
               sx: {
                  maxWidth: maxWidth
               }
            }
         }
      });
   };

   const menuTooltipAttribs = {...tooltipMaxWidth("250px"), placement: "left", enterDelay: 1000} as TooltipProps;

   let disabledBecauseNotOwner = false;
   let notOwnerTooltipText = null;
   if (currentSavedView && currentSavedView.values.get("userId") != currentUserId)
   {
      disabledBecauseNotOwner = true;
      notOwnerTooltipText = "You may not save changes to this view, because you are not its owner.";
   }

   const renderSavedViewsMenu = tableMetaData && (
      <Menu
         anchorEl={savedViewsMenu}
         anchorOrigin={{vertical: "bottom", horizontal: "left",}}
         transformOrigin={{vertical: "top", horizontal: "left",}}
         open={Boolean(savedViewsMenu)}
         onClose={closeSavedViewsMenu}
         keepMounted
         PaperProps={{style: {maxHeight: "calc(100vh - 200px)", minWidth: "300px"}}}
      >
         {
            isQueryScreen &&
            <MenuItem sx={{width: "300px"}} disabled style={{"opacity": "initial"}}><b>View Actions</b></MenuItem>
         }
         {
            isQueryScreen && hasStorePermission &&
            <Tooltip {...menuTooltipAttribs} title={notOwnerTooltipText ?? <>Save your current filters, columns and settings, for quick re-use at a later time.<br /><br />You will be prompted to enter a name if you choose this option.</>}>
               <span>
                  <MenuItem disabled={disabledBecauseNotOwner} onClick={() => handleDropdownOptionClick(SAVE_OPTION)}>
                     <ListItemIcon><Icon>save</Icon></ListItemIcon>
                     {currentSavedView ? "Save..." : "Save As..."}
                  </MenuItem>
               </span>
            </Tooltip>
         }
         {
            isQueryScreen && hasStorePermission && currentSavedView != null &&
            <Tooltip {...menuTooltipAttribs} title={notOwnerTooltipText ?? "Change the name for this saved view."}>
               <span>
                  <MenuItem disabled={currentSavedView === null || disabledBecauseNotOwner} onClick={() => handleDropdownOptionClick(RENAME_OPTION)}>
                     <ListItemIcon><Icon>edit</Icon></ListItemIcon>
                     Rename...
                  </MenuItem>
               </span>
            </Tooltip>
         }
         {
            isQueryScreen && hasStorePermission && currentSavedView != null &&
            <Tooltip {...menuTooltipAttribs} title="Save a new copy this view, with a different name, separate from the original.">
               <span>
                  <MenuItem disabled={currentSavedView === null} onClick={() => handleDropdownOptionClick(DUPLICATE_OPTION)}>
                     <ListItemIcon><Icon>content_copy</Icon></ListItemIcon>
                     Save As...
                  </MenuItem>
               </span>
            </Tooltip>
         }
         {
            isQueryScreen && hasDeletePermission && currentSavedView != null &&
            <Tooltip {...menuTooltipAttribs} title={notOwnerTooltipText ?? "Delete this saved view."}>
               <span>
                  <MenuItem disabled={currentSavedView === null || disabledBecauseNotOwner} onClick={() => handleDropdownOptionClick(DELETE_OPTION)}>
                     <ListItemIcon><Icon>delete</Icon></ListItemIcon>
                     Delete...
                  </MenuItem>
               </span>
            </Tooltip>
         }
         {
            isQueryScreen &&
            <Tooltip {...menuTooltipAttribs} title="Create a new view of this table, resetting the filters and columns to their defaults.">
               <span>
                  <MenuItem onClick={() => handleDropdownOptionClick(CLEAR_OPTION)}>
                     <ListItemIcon><Icon>monitor</Icon></ListItemIcon>
                     New View
                  </MenuItem>
               </span>
            </Tooltip>
         }
         {
            isQueryScreen && hasSavedReportsPermission &&
            <Tooltip {...menuTooltipAttribs} title="Create a new Saved Report using your current view of this table as a starting point.">
               <span>
                  <MenuItem onClick={() => handleDropdownOptionClick(NEW_REPORT_OPTION)}>
                     <ListItemIcon><Icon>article</Icon></ListItemIcon>
                     Create Report from Current View
                  </MenuItem>
               </span>
            </Tooltip>
         }
         {
            isQueryScreen && <Divider />
         }
         <MenuItem disabled style={{"opacity": "initial"}}><b>Your Saved Views</b></MenuItem>
         {
            yourSavedViews && yourSavedViews.length > 0 ? (
               yourSavedViews.map((record: QRecord, index: number) =>
                  <MenuItem sx={{paddingLeft: "50px"}} key={`savedFiler-${index}`} onClick={() => handleSavedViewRecordOnClick(record)}>
                     {record.values.get("label")}
                  </MenuItem>
               )
            ) : (
               <MenuItem disabled sx={{opacity: "1 !important"}}>
                  <i>You do not have any saved views for this table.</i>
               </MenuItem>
            )
         }
         <MenuItem disabled style={{"opacity": "initial"}}><b>Views Shared with you</b></MenuItem>
         {
            viewsSharedWithYou && viewsSharedWithYou.length > 0 ? (
               viewsSharedWithYou.map((record: QRecord, index: number) =>
                  <MenuItem sx={{paddingLeft: "50px"}} key={`savedFiler-${index}`} onClick={() => handleSavedViewRecordOnClick(record)}>
                     {record.values.get("label")}
                  </MenuItem>
               )
            ) : (
               <MenuItem disabled sx={{opacity: "1 !important"}}>
                  <i>You do not have any views shared with you for this table.</i>
               </MenuItem>
            )
         }
      </Menu>
   );

   let buttonText = "Views";
   let buttonBackground = "none";
   let buttonBorder = colors.grayLines.main;
   let buttonColor = colors.gray.main;

   if (currentSavedView)
   {
      if (viewIsModified)
      {
         buttonBackground = accentColorLight;
         buttonBorder = buttonBackground;
         buttonColor = accentColor;
      }
      else
      {
         buttonBackground = accentColor;
         buttonBorder = buttonBackground;
         buttonColor = "#FFFFFF";
      }
   }

   const buttonStyles = {
      border: `1px solid ${buttonBorder}`,
      backgroundColor: buttonBackground,
      color: buttonColor,
      "&:focus:not(:hover)": {
         color: buttonColor,
         backgroundColor: buttonBackground,
      },
      "&:hover": {
         color: buttonColor,
         backgroundColor: buttonBackground,
      }
   };

   /*******************************************************************************
    **
    *******************************************************************************/
   function isSaveButtonDisabled(): boolean
   {
      if (isSubmitting)
      {
         return (true);
      }

      const haveInputText = (savedViewNameInputValue != null && savedViewNameInputValue.trim() != "");

      if (isSaveFilterAs || isRenameFilter || currentSavedView == null)
      {
         if (!haveInputText)
         {
            return (true);
         }
      }

      return (false);
   }

   const linkButtonStyle = {
      minWidth: "unset",
      textTransform: "none",
      fontSize: "0.875rem",
      fontWeight: "500",
      padding: "0.5rem"
   };

   return (
      hasQueryPermission && tableMetaData ? (
         <>
            <Box order="1" mr={"0.5rem"}>
               <Button
                  onClick={openSavedViewsMenu}
                  sx={{
                     borderRadius: "0.75rem",
                     textTransform: "none",
                     fontWeight: 500,
                     fontSize: "0.875rem",
                     p: "0.5rem",
                     ...buttonStyles
                  }}
               >
                  <Icon sx={{mr: "0.5rem"}}>save</Icon>
                  {buttonText}
                  <Icon sx={{ml: "0.5rem"}}>keyboard_arrow_down</Icon>
               </Button>
               {renderSavedViewsMenu}
            </Box>
            <Box order="3" display="flex" justifyContent="center" flexDirection="column">
               <Box pl={2} pr={2} sx={{display: "flex", alignItems: "center"}}>
                  {
                     !currentSavedView && viewIsModified && <>
                        {
                           isQueryScreen && <>
                              <Tooltip {...tooltipMaxWidth("24rem")} sx={{cursor: "pointer"}} title={<>
                                 <b>Unsaved Changes</b>
                                 <ul style={{padding: "0.5rem 1rem"}}>
                                    {
                                       viewDiffs.map((s: string, i: number) => <li key={i}>{s}</li>)
                                    }
                                 </ul>
                              </>}>
                                 <Button disableRipple={true} sx={linkButtonStyle} onClick={() => handleDropdownOptionClick(SAVE_OPTION)}>Save View As&hellip;</Button>
                              </Tooltip>

                              {/* vertical rule */}
                              <Box display="inline-block" borderLeft={`1px solid ${colors.grayLines.main}`} height="1rem" width="1px" position="relative" />
                           </>
                        }

                        <Button disableRipple={true} sx={{color: colors.gray.main, ...linkButtonStyle}} onClick={() => handleDropdownOptionClick(CLEAR_OPTION)}>Reset All Changes</Button>
                     </>
                  }
                  {
                     isQueryScreen && currentSavedView && viewIsModified && <>
                        <Tooltip {...tooltipMaxWidth("24rem")} sx={{cursor: "pointer"}} title={<>
                           <b>Unsaved Changes</b>
                           <ul style={{padding: "0.5rem 1rem"}}>
                              {
                                 viewDiffs.map((s: string, i: number) => <li key={i}>{s}</li>)
                              }
                           </ul>
                           {
                              notOwnerTooltipText && <i>{notOwnerTooltipText}</i>
                           }
                        </>}>
                           <Box display="inline" sx={{...linkButtonStyle, p: 0, cursor: "default", position: "relative", top: "-1px"}}>{viewDiffs.length} Unsaved Change{viewDiffs.length == 1 ? "" : "s"}</Box>
                        </Tooltip>

                        {disabledBecauseNotOwner ? <>&nbsp;&nbsp;</> : <Button disableRipple={true} sx={linkButtonStyle} onClick={() => handleDropdownOptionClick(SAVE_OPTION)}>Save&hellip;</Button>}

                        {/* vertical rule */}
                        <Box display="inline-block" borderLeft={`1px solid ${colors.grayLines.main}`} height="1rem" width="1px" position="relative" />

                        <Button disableRipple={true} sx={{color: colors.gray.main, ...linkButtonStyle}} onClick={() => handleSavedViewRecordOnClick(currentSavedView)}>Reset All Changes</Button>
                     </>
                  }
                  {
                     !isQueryScreen && currentSavedView &&
                     <Box>
                        <Box display="inline-block" fontSize="0.875rem" fontWeight="500" sx={{position: "relative", top: "-1px"}}>
                           {currentSavedView.values.get("label")}
                        </Box>

                        {
                           viewIsModified &&
                           <>
                              <Tooltip {...tooltipMaxWidth("24rem")} sx={{cursor: "pointer"}} title={<>
                                 <b>Changes</b>
                                 <ul style={{padding: "0.5rem 1rem"}}>
                                    {
                                       viewDiffs.map((s: string, i: number) => <li key={i}>{s}</li>)
                                    }
                                 </ul>
                              </>}>
                                 <Box display="inline" ml="0.25rem" mr="0.25rem" sx={{...linkButtonStyle, p: 0, cursor: "default", position: "relative", top: "-1px"}}>with {viewDiffs.length} Change{viewDiffs.length == 1 ? "" : "s"}</Box>
                              </Tooltip>
                              <Button disableRipple={true} sx={{color: colors.gray.main, ...linkButtonStyle}} onClick={() => handleSavedViewRecordOnClick(currentSavedView)}>Reset Changes</Button>
                           </>
                        }

                        {/* vertical rule */}
                        <Box display="inline-block" ml="0.25rem" borderLeft={`1px solid ${colors.grayLines.main}`} height="1rem" width="1px" position="relative" />
                        <Button disableRipple={true} sx={{color: colors.gray.main, ...linkButtonStyle}} onClick={() => handleDropdownOptionClick(CLEAR_OPTION)}>Reset to New View</Button>
                     </Box>
                  }
               </Box>
            </Box>
            {
               <Dialog
                  open={saveFilterPopupOpen}
                  onClose={handleSaveFilterPopupClose}
                  aria-labelledby="alert-dialog-title"
                  aria-describedby="alert-dialog-description"
                  onKeyPress={(e) =>
                  {
                     ////////////////////////////////////////////////////
                     // make user actually hit delete button           //
                     // but for other modes, let Enter submit the form //
                     ////////////////////////////////////////////////////
                     if (e.key == "Enter" && !isDeleteFilter)
                     {
                        handleFilterDialogButtonOnClick();
                     }
                  }}
               >
                  {
                     currentSavedView ? (
                        isDeleteFilter ? (
                           <DialogTitle id="alert-dialog-title">Delete View</DialogTitle>
                        ) : (
                           isSaveFilterAs ? (
                              <DialogTitle id="alert-dialog-title">Save View As</DialogTitle>
                           ) : (
                              isRenameFilter ? (
                                 <DialogTitle id="alert-dialog-title">Rename View</DialogTitle>
                              ) : (
                                 <DialogTitle id="alert-dialog-title">Update Existing View</DialogTitle>
                              )
                           )
                        )
                     ) : (
                        <DialogTitle id="alert-dialog-title">Save New View</DialogTitle>
                     )
                  }
                  <DialogContent sx={{width: "500px"}}>
                     {popupAlertContent ? (
                        <Box mb={1}>
                           <Alert severity="error" onClose={() => setPopupAlertContent("")}>{popupAlertContent}</Alert>
                        </Box>
                     ) : ("")}
                     {
                        (!currentSavedView || isSaveFilterAs || isRenameFilter) && !isDeleteFilter ? (
                           <Box>
                              {
                                 isSaveFilterAs ? (
                                    <Box mb={3}>Enter a name for this new saved view.</Box>
                                 ) : (
                                    <Box mb={3}>Enter a new name for this saved view.</Box>
                                 )
                              }
                              <TextField
                                 autoFocus
                                 name="custom-delimiter-value"
                                 placeholder="View Name"
                                 inputProps={{width: "100%", maxLength: 100}}
                                 value={savedViewNameInputValue}
                                 sx={{width: "100%"}}
                                 onChange={handleSaveFilterInputChange}
                                 onFocus={event =>
                                 {
                                    event.target.select();
                                 }}
                              />
                           </Box>
                        ) : (
                           isDeleteFilter ? (
                              <Box>Are you sure you want to delete the view {`'${currentSavedView?.values.get("label")}'`}?</Box>
                           ) : (
                              <Box>Are you sure you want to update the view {`'${currentSavedView?.values.get("label")}'`}?</Box>
                           )
                        )
                     }
                  </DialogContent>
                  <DialogActions>
                     <QCancelButton onClickHandler={handleSaveFilterPopupClose} disabled={false} />
                     {
                        isDeleteFilter ?
                           <QDeleteButton onClickHandler={handleFilterDialogButtonOnClick} disabled={isSubmitting} />
                           :
                           <QSaveButton label="Save" onClickHandler={handleFilterDialogButtonOnClick} disabled={isSaveButtonDisabled()} />
                     }
                  </DialogActions>
               </Dialog>
            }
         </>
      ) : null
   );
}

export default SavedViews;
