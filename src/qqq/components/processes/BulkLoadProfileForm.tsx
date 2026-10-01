/*
 * QQQ - Low-code Application Framework for Engineers.
 * Copyright (C) 2021-2024.  Kingsrook, LLC
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
import {QTableMetaData} from "@qrunio/qqq-frontend-core/lib/model/metaData/QTableMetaData";
import {QRecord} from "@qrunio/qqq-frontend-core/lib/model/QRecord";
import Box from "@mui/material/Box";
import SavedBulkLoadProfiles from "qqq/components/misc/SavedBulkLoadProfiles";
import {BulkLoadMapping, BulkLoadProfile, BulkLoadTableStructure, FileDescription, Wrapper} from "qqq/models/processes/BulkLoadModels";
import {SubFormPreSubmitCallbackResultType} from "qqq/pages/processes/ProcessRun";
import React, {forwardRef, useImperativeHandle, useState} from "react";

interface BulkLoadValueMappingFormProps
{
   processValues: any,
   tableMetaData: QTableMetaData,
   metaData: QInstance
}


/***************************************************************************
 ** For review & result screens of bulk load - this process component shows
 ** the SavedBulkLoadProfiles button.
 ***************************************************************************/
const BulkLoadProfileForm = forwardRef(({processValues, tableMetaData, metaData}: BulkLoadValueMappingFormProps, ref) =>
{
   const savedBulkLoadProfileRecordProcessValue = processValues.savedBulkLoadProfileRecord;
   const [savedBulkLoadProfileRecord, setSavedBulkLoadProfileRecord] = useState(savedBulkLoadProfileRecordProcessValue == null ? null : new QRecord(savedBulkLoadProfileRecordProcessValue));

   const [tableStructure] = useState(processValues.tableStructure as BulkLoadTableStructure);

   const [bulkLoadProfile, setBulkLoadProfile] = useState(processValues.bulkLoadProfile as BulkLoadProfile);
   const [currentMapping, setCurrentMapping] = useState(BulkLoadMapping.fromBulkLoadProfile(tableStructure, bulkLoadProfile));
   const [wrappedCurrentSavedBulkLoadProfile] = useState(new Wrapper<QRecord>(savedBulkLoadProfileRecord));

   const [fileDescription] = useState(new FileDescription(processValues.headerValues, processValues.headerLetters, processValues.bodyValuesPreview));
   fileDescription.setHasHeaderRow(currentMapping.hasHeaderRow);

   useImperativeHandle(ref, () =>
   {
      return {
         preSubmit(): SubFormPreSubmitCallbackResultType
         {
            const values: { [name: string]: any } = {};
            values["savedBulkLoadProfileId"] = wrappedCurrentSavedBulkLoadProfile.get()?.values?.get("id");

            return ({maySubmit: true, values});
         }
      };
   });


   /***************************************************************************
    **
    ***************************************************************************/
   function bulkLoadProfileOnChangeCallback(profileRecord: QRecord | null)
   {
      setSavedBulkLoadProfileRecord(profileRecord);
      wrappedCurrentSavedBulkLoadProfile.set(profileRecord);

      const newBulkLoadMapping = BulkLoadMapping.fromSavedProfileRecord(tableStructure, profileRecord);
      setCurrentMapping(newBulkLoadMapping);
   }


   return (<Box>

      <Box py="1rem" display="flex">
         <SavedBulkLoadProfiles
            metaData={metaData}
            tableMetaData={tableMetaData}
            tableStructure={tableStructure}
            currentSavedBulkLoadProfileRecord={savedBulkLoadProfileRecord}
            currentMapping={currentMapping}
            allowSelectingProfile={false}
            fileDescription={fileDescription}
            bulkLoadProfileOnChangeCallback={bulkLoadProfileOnChangeCallback}
            isBulkEdit={processValues.isBulkEdit}
         />
      </Box>

   </Box>);
});

export default BulkLoadProfileForm;
