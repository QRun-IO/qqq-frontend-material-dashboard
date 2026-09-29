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

import {QInstance} from "@qrunio/qqq-frontend-core/lib/model/metaData/QInstance";
import {colors} from "@mui/material";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import {useGoogleLogin} from "@react-oauth/google";
import {useFormikContext} from "formik";
import React, {useEffect, useState} from "react";
import useDrivePicker from "react-google-drive-picker";
import {hasScope} from "qqq/authorization/ScopeUtils";
import MDTypography from "qqq/components/legacy/MDTypography";

interface Props
{
   showDefaultFoldersView: boolean;
   showSharedDrivesView: boolean;
   qInstance: QInstance;
}

export function GoogleDriveFolderPicker({showDefaultFoldersView, showSharedDrivesView, qInstance}: Props): JSX.Element
{
   const clientId = qInstance.environmentValues.get("GOOGLE_APP_CLIENT_ID") || process.env.REACT_APP_GOOGLE_APP_CLIENT_ID;
   const appApiKey = qInstance.environmentValues.get("GOOGLE_APP_API_KEY") || process.env.REACT_APP_GOOGLE_APP_API_KEY;
   if(!clientId)
   {
      console.error("Missing environmentValue GOOGLE_APP_CLIENT_ID")
   }
   if(!appApiKey)
   {
      console.error("Missing environmentValue GOOGLE_APP_API_KEY")
   }

   const [ selectedGoogleFolderName, setSelectedGoogleFolderName ] = useState(null as string);
   const [ selectedGoogleFolderId, setSelectedGoogleFolderId ] = useState(null as string);
   const [ googleToken, setGoogleToken ] = useState(null as string); // maybe get from cookie/local-storage
   const [ errorMessage, setErrorMessage ] = useState(null as string);

   const [ openPicker, authResponse ] = useDrivePicker();

   const formikProps = useFormikContext();

   const loginOrOpenPicker = (token: string) =>
   {
      if(token)
      {
         handleOpenPicker(token);
      }
      else
      {
         login();
      }
   };

   const driveScope = "https://www.googleapis.com/auth/drive"
   const login = useGoogleLogin({
      scope: driveScope,
      onSuccess: tokenResponse =>
      {
         if(!hasScope(tokenResponse.scope, driveScope))
         {
            setErrorMessage("You must allow access to Google Drive after you sign in.  Please try again.")
            return;
         }
         else
         {
            setErrorMessage(null)
         }

         setGoogleToken(tokenResponse.access_token)
         handleOpenPicker(tokenResponse.access_token);
      }
   });

   const handleOpenPicker = (token: string) =>
   {
      // @ts-ignore
      const google = window.google
      const customViewsArray: any[] = [];

      if(showDefaultFoldersView)
      {
         customViewsArray.push(new google.picker.DocsView(google.picker.ViewId.FOLDERS)
            .setIncludeFolders(true)
            .setMode(google.picker.DocsViewMode.LIST)
            .setSelectFolderEnabled(true));
      }

      if(showSharedDrivesView)
      {
         customViewsArray.push(new google.picker.DocsView(google.picker.ViewId.FOLDERS)
            .setEnableDrives(true)
            .setIncludeFolders(true)
            .setMode(google.picker.DocsViewMode.LIST)
            .setSelectFolderEnabled(true));
      }

      openPicker({
         clientId: clientId,
         developerKey: appApiKey,
         viewId: "FOLDERS",
         token: token, // pass oauth token in case you already have one
         disableDefaultView: (customViewsArray.length > 0), // if we have any custom views, then disable the default.
         showUploadView: false,
         showUploadFolders: false,
         supportDrives: true,
         multiselect: false,
         setSelectFolderEnabled: true,
         setIncludeFolders: true,
         customViews: customViewsArray,
         callbackFunction: (data) =>
         {
            if (data.action === "cancel")
            {
               console.log("User clicked cancel/close button");
               setSelectedGoogleFolderId(null);
               setSelectedGoogleFolderName(null);
            }
            else if (data.action === "picked")
            {
               console.log(data);
               const mimeType = data.docs[0].mimeType;
               if(mimeType === "application/vnd.google-apps.folder")
               {
                  setSelectedGoogleFolderId(data.docs[0].id);
                  setSelectedGoogleFolderName(data.docs[0].name);
                  setErrorMessage(null)
               }
               else
               {
                  setSelectedGoogleFolderId(null);
                  setSelectedGoogleFolderName(null);
                  setErrorMessage("You selected a file, but a folder is required.")
               }
            }
            else
            {
               console.log("Called with un-recognized action:");
               console.log(data);
            }
         },
      });
   };

   useEffect(() =>
   {
      formikProps.setFieldValue("googleDriveAccessToken", googleToken);
      formikProps.setFieldValue("googleDriveFolderId", selectedGoogleFolderId);
      formikProps.setFieldValue("googleDriveFolderName", selectedGoogleFolderName);
   }, [selectedGoogleFolderId, selectedGoogleFolderName])

   return (
      <Grid item xs={12} sm={6}>
         <Box mb={1.5}>
            <Box display="flex" alignItems="center">
               <Button variant="outlined" onClick={() => loginOrOpenPicker(googleToken)}>
                  <span style={{color: colors.lightBlue[500]}}>Select Google Drive Folder</span>
               </Button>
               <Box ml={1} fontSize={"1rem"}>
                  {selectedGoogleFolderName}
               </Box>
            </Box>
            <Box mt={0.75}>
               <MDTypography component="div" variant="caption" color="error" fontWeight="regular">
                  <div className="fieldErrorMessage">{errorMessage}</div>
               </MDTypography>
            </Box>
         </Box>
      </Grid>
   );
}

GoogleDriveFolderPicker.defaultProps = {
   showDefaultFoldersView: true,
   showSharedDrivesView: true
};
