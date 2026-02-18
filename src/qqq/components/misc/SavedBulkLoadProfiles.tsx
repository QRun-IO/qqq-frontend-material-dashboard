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

import {QController} from "@qrunio/qqq-frontend-core/lib/controllers/QController";
import {QInstance} from "@qrunio/qqq-frontend-core/lib/model/metaData/QInstance";
import {QTableMetaData} from "@qrunio/qqq-frontend-core/lib/model/metaData/QTableMetaData";
import {QJobComplete} from "@qrunio/qqq-frontend-core/lib/model/processes/QJobComplete";
import {QJobError} from "@qrunio/qqq-frontend-core/lib/model/processes/QJobError";
import {QRecord} from "@qrunio/qqq-frontend-core/lib/model/QRecord";
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
import FormData from "form-data";
import QContext from "QContext";
import colors from "qqq/assets/theme/base/colors";
import {QCancelButton, QDeleteButton, QSaveButton} from "qqq/components/buttons/DefaultButtons";
import {BulkLoadMapping, BulkLoadTableStructure, FileDescription} from "qqq/models/processes/BulkLoadModels";
import Client from "qqq/utils/qqq/Client";
import {SavedBulkLoadProfileUtils} from "qqq/utils/qqq/SavedBulkLoadProfileUtils";
import React, {useContext, useEffect, useRef, useState} from "react";
import {useLocation} from "react-router-dom";

interface Props
{
   metaData: QInstance,
   tableMetaData: QTableMetaData,
   tableStructure: BulkLoadTableStructure,
   currentSavedBulkLoadProfileRecord: QRecord,
   currentMapping: BulkLoadMapping,
   bulkLoadProfileOnChangeCallback?: (record: QRecord | null) => void,
   allowSelectingProfile?: boolean,
   fileDescription?: FileDescription,
   bulkLoadProfileResetToSuggestedMappingCallback?: () => void,
   isBulkEdit?: boolean;
}

SavedBulkLoadProfiles.defaultProps = {
   allowSelectingProfile: true
};

const qController = Client.getInstance();

/***************************************************************************
 ** menu-button, text elements, and modal(s) that let you work with saved
 ** bulk-load profiles.
 ***************************************************************************/
function SavedBulkLoadProfiles({metaData, tableMetaData, tableStructure, currentSavedBulkLoadProfileRecord, bulkLoadProfileOnChangeCallback, currentMapping, allowSelectingProfile, fileDescription, bulkLoadProfileResetToSuggestedMappingCallback, isBulkEdit}: Props): JSX.Element
{
   const [yourSavedBulkLoadProfiles, setYourSavedBulkLoadProfiles] = useState([] as QRecord[]);
   const [bulkLoadProfilesSharedWithYou, setBulkLoadProfilesSharedWithYou] = useState([] as QRecord[]);
   const [savedBulkLoadProfilesMenu, setSavedBulkLoadProfilesMenu] = useState(null);
   const [savedBulkLoadProfilesHaveLoaded, setSavedBulkLoadProfilesHaveLoaded] = useState(false);
   const [isSubmitting, setIsSubmitting] = useState(false);

   const [savePopupOpen, setSavePopupOpen] = useState(false);
   const [isSaveAsAction, setIsSaveAsAction] = useState(false);
   const [isRenameAction, setIsRenameAction] = useState(false);
   const [isDeleteAction, setIsDeleteAction] = useState(false);
   const [savedBulkLoadProfileNameInputValue, setSavedBulkLoadProfileNameInputValue] = useState(null as string);
   const [popupAlertContent, setPopupAlertContent] = useState("");

   const [savedSuccessMessage, setSavedSuccessMessage] = useState(null as string);
   const [savedFailedMessage, setSavedFailedMessage] = useState(null as string);

   const anchorRef = useRef<HTMLDivElement>(null);
   const location = useLocation();
   const [saveOptionsOpen, setSaveOptionsOpen] = useState(false);

   const SAVE_OPTION = "Save...";
   const DUPLICATE_OPTION = "Duplicate...";
   const RENAME_OPTION = "Rename...";
   const DELETE_OPTION = "Delete...";
   const CLEAR_OPTION = "New Profile";
   const RESET_TO_SUGGESTION = "Reset to Suggested Mapping";

   const {accentColor, accentColorLight, userId: currentUserId} = useContext(QContext);

   const openSavedBulkLoadProfilesMenu = (event: any) => setSavedBulkLoadProfilesMenu(event.currentTarget);
   const closeSavedBulkLoadProfilesMenu = () => setSavedBulkLoadProfilesMenu(null);

   ////////////////////////////////////////////////////////////////////////
   // load records on first run (if user is allowed to select a profile) //
   ////////////////////////////////////////////////////////////////////////
   useEffect(() =>
   {
      if (allowSelectingProfile)
      {
         loadSavedBulkLoadProfiles()
            .then(() =>
            {
               setSavedBulkLoadProfilesHaveLoaded(true);
            });
      }
   }, []);


   const baseBulkLoadMapping: BulkLoadMapping = currentSavedBulkLoadProfileRecord ? BulkLoadMapping.fromSavedProfileRecord(tableStructure, currentSavedBulkLoadProfileRecord) : new BulkLoadMapping(tableStructure);
   const bulkLoadProfileDiffs: any[] = SavedBulkLoadProfileUtils.diffBulkLoadMappings(tableStructure, fileDescription, baseBulkLoadMapping, currentMapping);
   let bulkLoadProfileIsModified = false;
   if (bulkLoadProfileDiffs.length > 0)
   {
      bulkLoadProfileIsModified = true;
   }

   /*******************************************************************************
    ** make request to load all saved profiles from backend
    *******************************************************************************/
   async function loadSavedBulkLoadProfiles()
   {
      if (!tableMetaData)
      {
         return;
      }

      const formData = new FormData();
      formData.append("tableName", tableMetaData.name);
      formData.append("isBulkEdit", isBulkEdit.toString());

      const savedBulkLoadProfiles = await makeSavedBulkLoadProfileRequest("querySavedBulkLoadProfile", formData);
      const yourSavedBulkLoadProfiles: QRecord[] = [];
      const bulkLoadProfilesSharedWithYou: QRecord[] = [];
      for (let i = 0; i < savedBulkLoadProfiles.length; i++)
      {
         const record = savedBulkLoadProfiles[i];
         if (record.values.get("userId") == currentUserId)
         {
            yourSavedBulkLoadProfiles.push(record);
         }
         else
         {
            bulkLoadProfilesSharedWithYou.push(record);
         }
      }
      setYourSavedBulkLoadProfiles(yourSavedBulkLoadProfiles);
      setBulkLoadProfilesSharedWithYou(bulkLoadProfilesSharedWithYou);
   }


   /*******************************************************************************
    ** fired when a saved record is clicked from the dropdown
    *******************************************************************************/
   const handleSavedBulkLoadProfileRecordOnClick = async (record: QRecord) =>
   {
      setSavePopupOpen(false);
      closeSavedBulkLoadProfilesMenu();

      if (bulkLoadProfileOnChangeCallback)
      {
         bulkLoadProfileOnChangeCallback(record);
      }
   };


   /*******************************************************************************
    ** fired when a save option is selected from the save... button/dropdown combo
    *******************************************************************************/
   const handleDropdownOptionClick = (optionName: string) =>
   {
      setSaveOptionsOpen(false);
      setPopupAlertContent("");
      closeSavedBulkLoadProfilesMenu();
      setSavePopupOpen(true);
      setIsSaveAsAction(false);
      setIsRenameAction(false);
      setIsDeleteAction(false);

      switch (optionName)
      {
         case SAVE_OPTION:
            if (currentSavedBulkLoadProfileRecord == null)
            {
               setSavedBulkLoadProfileNameInputValue("");
            }
            break;
         case DUPLICATE_OPTION:
            setSavedBulkLoadProfileNameInputValue("");
            setIsSaveAsAction(true);
            break;
         case CLEAR_OPTION:
            setSavePopupOpen(false);
            if (bulkLoadProfileOnChangeCallback)
            {
               bulkLoadProfileOnChangeCallback(null);
            }
            break;
         case RESET_TO_SUGGESTION:
            setSavePopupOpen(false);
            if (bulkLoadProfileResetToSuggestedMappingCallback)
            {
               bulkLoadProfileResetToSuggestedMappingCallback();
            }
            break;
         case RENAME_OPTION:
            if (currentSavedBulkLoadProfileRecord != null)
            {
               setSavedBulkLoadProfileNameInputValue(currentSavedBulkLoadProfileRecord.values.get("label"));
            }
            setIsRenameAction(true);
            break;
         case DELETE_OPTION:
            setIsDeleteAction(true);
            break;
      }
   };


   /*******************************************************************************
    ** fired when save or delete button saved on confirmation dialogs
    *******************************************************************************/
   async function handleDialogButtonOnClick()
   {
      try
      {
         setPopupAlertContent("");
         setIsSubmitting(true);

         const formData = new FormData();
         if (isDeleteAction)
         {
            formData.append("id", currentSavedBulkLoadProfileRecord.values.get("id"));
            await makeSavedBulkLoadProfileRequest("deleteSavedBulkLoadProfile", formData);

            setSavePopupOpen(false);
            setSaveOptionsOpen(false);

            await (async () =>
            {
               handleDropdownOptionClick(CLEAR_OPTION);
            })();
         }
         else
         {
            formData.append("tableName", tableMetaData.name);

            /////////////////////////////////////////////////////////////////////////////////////////
            // convert the BulkLoadMapping object to a BulkLoadProfile - the thing that gets saved //
            /////////////////////////////////////////////////////////////////////////////////////////
            const bulkLoadProfile = currentMapping.toProfile();
            const mappingJson = JSON.stringify(bulkLoadProfile.profile);
            formData.append("mappingJson", mappingJson);
            formData.append("isBulkEdit", isBulkEdit.toString());

            if (isSaveAsAction || isRenameAction || currentSavedBulkLoadProfileRecord == null)
            {
               formData.append("label", savedBulkLoadProfileNameInputValue);
               if (currentSavedBulkLoadProfileRecord != null && isRenameAction)
               {
                  formData.append("id", currentSavedBulkLoadProfileRecord.values.get("id"));
               }
            }
            else
            {
               formData.append("id", currentSavedBulkLoadProfileRecord.values.get("id"));
               formData.append("label", currentSavedBulkLoadProfileRecord?.values.get("label"));
            }
            const recordList = await makeSavedBulkLoadProfileRequest("storeSavedBulkLoadProfile", formData);
            await (async () =>
            {
               if (recordList && recordList.length > 0)
               {
                  setSavedBulkLoadProfilesHaveLoaded(false);
                  setSavedSuccessMessage("Profile Saved.");
                  setTimeout(() => setSavedSuccessMessage(null), 2500);

                  if (allowSelectingProfile)
                  {
                     loadSavedBulkLoadProfiles();
                     handleSavedBulkLoadProfileRecordOnClick(recordList[0]);
                  }
                  else
                  {
                     if (bulkLoadProfileOnChangeCallback)
                     {
                        bulkLoadProfileOnChangeCallback(recordList[0]);
                     }
                  }
               }
            })();
         }

         setSavePopupOpen(false);
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
    ** stores the current dialog input text to state
    *******************************************************************************/
   const handleSaveDialogInputChange = (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) =>
   {
      setSavedBulkLoadProfileNameInputValue(event.target.value);
   };


   /*******************************************************************************
    ** closes current dialog
    *******************************************************************************/
   const handleSavePopupClose = () =>
   {
      setSavePopupOpen(false);
   };


   /*******************************************************************************
    ** make a request to the backend for various savedBulkLoadProfile processes
    *******************************************************************************/
   async function makeSavedBulkLoadProfileRequest(processName: string, formData: FormData): Promise<QRecord[]>
   {
      /////////////////////////
      // fetch saved records //
      /////////////////////////
      let savedBulkLoadProfiles = [] as QRecord[];
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
            if (result.values.savedBulkLoadProfileList)
            {
               for (let i = 0; i < result.values.savedBulkLoadProfileList.length; i++)
               {
                  const qRecord = new QRecord(result.values.savedBulkLoadProfileList[i]);
                  savedBulkLoadProfiles.push(qRecord);
               }
            }
         }
      }
      catch (e)
      {
         throw (e);
      }

      return (savedBulkLoadProfiles);
   }

   const bulkAction = isBulkEdit ? "Edit" : "Load";
   const hasStorePermission = metaData?.processes.has("storeSavedBulkLoadProfile");
   const hasDeletePermission = metaData?.processes.has("deleteSavedBulkLoadProfile");
   const hasQueryPermission = metaData?.processes.has("querySavedBulkLoadProfile");

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
   if (currentSavedBulkLoadProfileRecord && currentSavedBulkLoadProfileRecord.values.get("userId") != currentUserId)
   {
      disabledBecauseNotOwner = true;
      notOwnerTooltipText = "You may not save changes to this bulk load profile, because you are not its owner.";
   }

   const menuWidth = "300px";
   const renderSavedBulkLoadProfilesMenu = tableMetaData && (
      <Menu
         anchorEl={savedBulkLoadProfilesMenu}
         anchorOrigin={{vertical: "bottom", horizontal: "left",}}
         transformOrigin={{vertical: "top", horizontal: "left",}}
         open={Boolean(savedBulkLoadProfilesMenu)}
         onClose={closeSavedBulkLoadProfilesMenu}
         keepMounted
         PaperProps={{style: {maxHeight: "calc(100vh - 200px)", minWidth: menuWidth}}}
      >
         {
            <MenuItem sx={{width: menuWidth}} disabled style={{opacity: "initial"}}><b>Bulk {bulkAction} Profile Actions</b></MenuItem>
         }
         {
            !allowSelectingProfile &&
            <MenuItem sx={{width: menuWidth}} disabled style={{opacity: "initial", whiteSpace: "wrap", display: "block"}}>
               {
                  currentSavedBulkLoadProfileRecord ?
                     <span>You are using the bulk {bulkAction.toLowerCase()} profile:<br /><b style={{paddingLeft: "1rem"}}>{currentSavedBulkLoadProfileRecord.values.get("label")}</b><br /><br />You can manage this profile on this screen.</span>
                     : <span>You are not using a saved bulk {bulkAction.toLowerCase()} profile.<br /><br />You can save your profile on this screen.</span>
               }
            </MenuItem>
         }
         {
            !allowSelectingProfile && <Divider />
         }
         {
            hasStorePermission &&
            <Tooltip {...menuTooltipAttribs} title={notOwnerTooltipText ?? <>Save your current mapping, for quick re-use at a later time.<br /><br />You will be prompted to enter a name if you choose this option.</>}>
               <span>
                  <MenuItem disabled={disabledBecauseNotOwner} onClick={() => handleDropdownOptionClick(SAVE_OPTION)}>
                     <ListItemIcon><Icon>save</Icon></ListItemIcon>
                     {currentSavedBulkLoadProfileRecord ? "Save..." : "Save As..."}
                  </MenuItem>
               </span>
            </Tooltip>
         }
         {
            hasStorePermission && currentSavedBulkLoadProfileRecord != null &&
            <Tooltip {...menuTooltipAttribs} title={notOwnerTooltipText ?? "Change the name for this saved bulk {bulkAction.toLowerCase()} profile."}>
               <span>
                  <MenuItem disabled={currentSavedBulkLoadProfileRecord === null || disabledBecauseNotOwner} onClick={() => handleDropdownOptionClick(RENAME_OPTION)}>
                     <ListItemIcon><Icon>edit</Icon></ListItemIcon>
                     Rename...
                  </MenuItem>
               </span>
            </Tooltip>
         }
         {
            hasStorePermission && currentSavedBulkLoadProfileRecord != null &&
            <Tooltip {...menuTooltipAttribs} title="Save a new copy this bulk {bulkAction.toLowerCase()} profile, with a different name, separate from the original.">
               <span>
                  <MenuItem disabled={currentSavedBulkLoadProfileRecord === null} onClick={() => handleDropdownOptionClick(DUPLICATE_OPTION)}>
                     <ListItemIcon><Icon>content_copy</Icon></ListItemIcon>
                     Save As...
                  </MenuItem>
               </span>
            </Tooltip>
         }
         {
            hasDeletePermission && currentSavedBulkLoadProfileRecord != null &&
            <Tooltip {...menuTooltipAttribs} title={notOwnerTooltipText ?? "Delete this saved bulk {bulkAction.toLowerCase()} profile."}>
               <span>
                  <MenuItem disabled={currentSavedBulkLoadProfileRecord === null || disabledBecauseNotOwner} onClick={() => handleDropdownOptionClick(DELETE_OPTION)}>
                     <ListItemIcon><Icon>delete</Icon></ListItemIcon>
                     Delete...
                  </MenuItem>
               </span>
            </Tooltip>
         }
         {
            allowSelectingProfile &&
            <Tooltip {...menuTooltipAttribs} title="Create a new blank bulk {bulkAction.toLowerCase()} profile for this table, removing all mappings.">
               <span>
                  <MenuItem onClick={() => handleDropdownOptionClick(CLEAR_OPTION)}>
                     <ListItemIcon><Icon>monitor</Icon></ListItemIcon>
                     New Bulk {bulkAction} Profile
                  </MenuItem>
               </span>
            </Tooltip>
         }
         {
            allowSelectingProfile &&
            <Box>
               {
                  <Divider />
               }
               <MenuItem disabled style={{"opacity": "initial"}}><b>Your Saved Bulk {bulkAction} Profiles</b></MenuItem>
               {
                  yourSavedBulkLoadProfiles && yourSavedBulkLoadProfiles.length > 0 ? (
                     yourSavedBulkLoadProfiles.map((record: QRecord, index: number) =>
                        <MenuItem sx={{paddingLeft: "50px"}} key={`savedFiler-${index}`} onClick={() => handleSavedBulkLoadProfileRecordOnClick(record)}>
                           {record.values.get("label")}
                        </MenuItem>
                     )
                  ) : (
                     <MenuItem disabled sx={{opacity: "1 !important"}}>
                        <i>You do not have any saved bulk {bulkAction.toLowerCase()} profiles for this table.</i>
                     </MenuItem>
                  )
               }
               <MenuItem disabled style={{"opacity": "initial"}}><b>Bulk {bulkAction} Profiles Shared with you</b></MenuItem>
               {
                  bulkLoadProfilesSharedWithYou && bulkLoadProfilesSharedWithYou.length > 0 ? (
                     bulkLoadProfilesSharedWithYou.map((record: QRecord, index: number) =>
                        <MenuItem sx={{paddingLeft: "50px"}} key={`savedFiler-${index}`} onClick={() => handleSavedBulkLoadProfileRecordOnClick(record)}>
                           {record.values.get("label")}
                        </MenuItem>
                     )
                  ) : (
                     <MenuItem disabled sx={{opacity: "1 !important"}}>
                        <i>You do not have any bulk {bulkAction.toLowerCase()} profiles shared with you for this table.</i>
                     </MenuItem>
                  )
               }
            </Box>
         }
      </Menu>
   );

   let buttonText = `Saved Bulk ${bulkAction} Profiles`;
   let buttonBackground = "none";
   let buttonBorder = colors.grayLines.main;
   let buttonColor = colors.gray.main;

   if (currentSavedBulkLoadProfileRecord)
   {
      if (bulkLoadProfileIsModified)
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

      const haveInputText = (savedBulkLoadProfileNameInputValue != null && savedBulkLoadProfileNameInputValue.trim() != "");

      if (isSaveAsAction || isRenameAction || currentSavedBulkLoadProfileRecord == null)
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
                  onClick={openSavedBulkLoadProfilesMenu}
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
               {renderSavedBulkLoadProfilesMenu}
            </Box>
            <Box order="3" display="flex" justifyContent="center" flexDirection="column">
               <Box pl={2} pr={2} fontSize="0.875rem" sx={{display: "flex", alignItems: "center"}}>
                  {
                     savedSuccessMessage && <Box color={colors.success.main}>{savedSuccessMessage}</Box>
                  }
                  {
                     savedFailedMessage && <Box color={colors.error.main}>{savedFailedMessage}</Box>
                  }
                  {
                     !currentSavedBulkLoadProfileRecord /*&& bulkLoadProfileIsModified*/ && <>
                        {
                           <>
                              <Tooltip {...tooltipMaxWidth("24rem")} sx={{cursor: "pointer"}} title={<>
                                 <b>Unsaved Mapping</b>
                                 <ul style={{padding: "0.5rem 1rem"}}>
                                    <li>You are not using a saved bulk {bulkAction.toLowerCase()} profile.</li>
                                    {
                                       /*bulkLoadProfileDiffs.map((s: string, i: number) => <li key={i}>{s}</li>)*/
                                    }
                                 </ul>
                              </>}>
                                 <Button disableRipple={true} sx={linkButtonStyle} onClick={() => handleDropdownOptionClick(SAVE_OPTION)}>Save Bulk {bulkAction} Profile As&hellip;</Button>
                              </Tooltip>

                              {/* vertical rule */}
                              {allowSelectingProfile && <Box display="inline-block" borderLeft={`1px solid ${colors.grayLines.main}`} height="1rem" width="1px" position="relative" />}
                           </>
                        }

                        {/* for the no-profile use-case, don't give a reset-link on screens other than the first (file mapping) one - which is tied to the allowSelectingProfile attribute */}
                        {allowSelectingProfile && <>
                           <Box pl="0.5rem">Reset to:</Box>
                           <Button disableRipple={true} sx={{color: colors.gray.main, ...linkButtonStyle}} onClick={() => handleDropdownOptionClick(CLEAR_OPTION)}>Empty Mapping</Button>
                           <Box display="inline-block" borderLeft={`1px solid ${colors.grayLines.main}`} height="1rem" width="1px" position="relative" />
                           <Button disableRipple={true} sx={{color: colors.gray.main, ...linkButtonStyle}} onClick={() => handleDropdownOptionClick(RESET_TO_SUGGESTION)}>Suggested Mapping</Button>
                        </>}


                     </>
                  }
                  {
                     currentSavedBulkLoadProfileRecord && bulkLoadProfileIsModified && <>
                        <Tooltip {...tooltipMaxWidth("24rem")} sx={{cursor: "pointer"}} title={<>
                           <b>Unsaved Changes</b>
                           <ul style={{padding: "0.5rem 1rem"}}>
                              {
                                 bulkLoadProfileDiffs.map((s: string, i: number) => <li key={i}>{s}</li>)
                              }
                           </ul>
                           {
                              notOwnerTooltipText && <i>{notOwnerTooltipText}</i>
                           }
                        </>}>
                           <Box display="inline" sx={{...linkButtonStyle, p: 0, cursor: "default", position: "relative", top: "-1px"}}>{bulkLoadProfileDiffs.length} Unsaved Change{bulkLoadProfileDiffs.length == 1 ? "" : "s"}</Box>
                        </Tooltip>

                        {disabledBecauseNotOwner ? <>&nbsp;&nbsp;</> : <Button disableRipple={true} sx={linkButtonStyle} onClick={() => handleDropdownOptionClick(SAVE_OPTION)}>Save&hellip;</Button>}

                        {/* vertical rule */}
                        {/* also, don't give a reset-link on screens other than the first (file mapping) one - which is tied to the allowSelectingProfile attribute */}
                        {/* partly because it isn't correctly resetting the values, but also because, it's a litle unclear that what, it would reset changes from other screens too?? */}
                        {
                           allowSelectingProfile && <>
                              <Box display="inline-block" borderLeft={`1px solid ${colors.grayLines.main}`} height="1rem" width="1px" position="relative" />
                              <Button disableRipple={true} sx={{color: colors.gray.main, ...linkButtonStyle}} onClick={() => handleSavedBulkLoadProfileRecordOnClick(currentSavedBulkLoadProfileRecord)}>Reset All Changes</Button>
                           </>
                        }
                     </>
                  }
               </Box>
            </Box>
            {
               <Dialog
                  open={savePopupOpen}
                  onClose={handleSavePopupClose}
                  aria-labelledby="alert-dialog-title"
                  aria-describedby="alert-dialog-description"
                  onKeyPress={(e) =>
                  {
                     ////////////////////////////////////////////////////
                     // make user actually hit delete button           //
                     // but for other modes, let Enter submit the form //
                     ////////////////////////////////////////////////////
                     if (e.key == "Enter" && !isDeleteAction)
                     {
                        handleDialogButtonOnClick();
                     }
                  }}
               >
                  {
                     currentSavedBulkLoadProfileRecord ? (
                        isDeleteAction ? (
                           <DialogTitle id="alert-dialog-title">Delete Bulk {bulkAction} Profile</DialogTitle>
                        ) : (
                           isSaveAsAction ? (
                              <DialogTitle id="alert-dialog-title">Save Bulk {bulkAction} Profile As</DialogTitle>
                           ) : (
                              isRenameAction ? (
                                 <DialogTitle id="alert-dialog-title">Rename Bulk {bulkAction} Profile</DialogTitle>
                              ) : (
                                 <DialogTitle id="alert-dialog-title">Update Existing Bulk {bulkAction} Profile</DialogTitle>
                              )
                           )
                        )
                     ) : (
                        <DialogTitle id="alert-dialog-title">Save New Bulk {bulkAction} Profile</DialogTitle>
                     )
                  }
                  <DialogContent sx={{width: "500px"}}>
                     {popupAlertContent ? (
                        <Box mb={1}>
                           <Alert severity="error" onClose={() => setPopupAlertContent("")}>{popupAlertContent}</Alert>
                        </Box>
                     ) : ("")}
                     {
                        (!currentSavedBulkLoadProfileRecord || isSaveAsAction || isRenameAction) && !isDeleteAction ? (
                           <Box>
                              {
                                 isSaveAsAction ? (
                                    <Box mb={3}>Enter a name for this new saved bulk {bulkAction.toLowerCase()} profile.</Box>
                                 ) : (
                                    <Box mb={3}>Enter a new name for this saved bulk {bulkAction.toLowerCase()} profile.</Box>
                                 )
                              }
                              <TextField
                                 autoFocus
                                 name="custom-delimiter-value"
                                 placeholder={`Bulk ${bulkAction} Profile Name`}
                                 inputProps={{width: "100%", maxLength: 100}}
                                 value={savedBulkLoadProfileNameInputValue}
                                 sx={{width: "100%"}}
                                 onChange={handleSaveDialogInputChange}
                                 onFocus={event =>
                                 {
                                    event.target.select();
                                 }}
                              />
                           </Box>
                        ) : (
                           isDeleteAction ? (
                              <Box>Are you sure you want to delete the bulk {bulkAction.toLowerCase()} profile {`'${currentSavedBulkLoadProfileRecord?.values.get("label")}'`}?</Box>
                           ) : (
                              <Box>Are you sure you want to update the bulk {bulkAction.toLowerCase()} profile {`'${currentSavedBulkLoadProfileRecord?.values.get("label")}'`}?</Box>
                           )
                        )
                     }
                  </DialogContent>
                  <DialogActions>
                     <QCancelButton onClickHandler={handleSavePopupClose} disabled={false} />
                     {
                        isDeleteAction ?
                           <QDeleteButton onClickHandler={handleDialogButtonOnClick} disabled={isSubmitting} />
                           :
                           <QSaveButton label="Save" onClickHandler={handleDialogButtonOnClick} disabled={isSaveButtonDisabled()} />
                     }
                  </DialogActions>
               </Dialog>
            }
         </>
      ) : null
   );
}

export default SavedBulkLoadProfiles;
