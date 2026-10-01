/*
 * QQQ - Low-code Application Framework for Engineers.
 * Copyright (C) 2021-2022.  Kingsrook, LLC
 * 651 N Broad St Ste 205 # 6917 | Middletown DE 19709 | United States
 * contact@kingsrook.com
 * https://github.com/Kingsrook/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {QInstance} from "@qrunio/qqq-frontend-core/lib/model/metaData/QInstance";
import {GoogleOAuthProvider} from "@react-oauth/google";
import React from "react";
import {GoogleDriveFolderPicker} from "qqq/components/processes/GoogleDriveFolderPicker";

interface Props
{
   showDefaultFoldersView: boolean;
   showSharedDrivesView: boolean;
   qInstance: QInstance;
}

export function GoogleDriveFolderPickerWrapper({showDefaultFoldersView, showSharedDrivesView, qInstance}: Props): JSX.Element
{
   const clientId = qInstance.environmentValues.get("GOOGLE_APP_CLIENT_ID") || process.env.REACT_APP_GOOGLE_APP_CLIENT_ID;

   return (
      <GoogleOAuthProvider clientId={clientId}>
         <GoogleDriveFolderPicker showDefaultFoldersView={showDefaultFoldersView} showSharedDrivesView={showSharedDrivesView} qInstance={qInstance} />
      </GoogleOAuthProvider>
   );
}

GoogleDriveFolderPickerWrapper.defaultProps = {
   showDefaultFoldersView: true,
   showSharedDrivesView: true
};
