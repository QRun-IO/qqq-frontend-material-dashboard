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
import {QInstance} from "@qrunio/qqq-frontend-core/lib/model/metaData/QInstance";
import {QTableMetaData} from "@qrunio/qqq-frontend-core/lib/model/metaData/QTableMetaData";
import {QRecord} from "@qrunio/qqq-frontend-core/lib/model/QRecord";
import Box from "@mui/material/Box";
import Icon from "@mui/material/Icon";
import colors from "qqq/assets/theme/base/colors";
import QDynamicFormField from "qqq/components/forms/DynamicFormField";
import SavedBulkLoadProfiles from "qqq/components/misc/SavedBulkLoadProfiles";
import {BulkLoadMapping, BulkLoadProfile, BulkLoadTableStructure, FileDescription, Wrapper} from "qqq/models/processes/BulkLoadModels";
import {SubFormPreSubmitCallbackResultType} from "qqq/pages/processes/ProcessRun";
import React, {forwardRef, useEffect, useImperativeHandle, useReducer, useState} from "react";

interface BulkLoadValueMappingFormProps
{
   processValues: any,
   setActiveStepLabel: (label: string) => void,
   tableMetaData: QTableMetaData,
   metaData: QInstance,
   formFields: any[]
}


/***************************************************************************
 ** process component used in bulk-load - on a screen that gets looped for
 ** each field whose values are being mapped.
 ***************************************************************************/
const BulkLoadValueMappingForm = forwardRef(({processValues, setActiveStepLabel, tableMetaData, metaData, formFields}: BulkLoadValueMappingFormProps, ref) =>
{
   const [field, setField] = useState(processValues.valueMappingField ? new QFieldMetaData(processValues.valueMappingField) : null);
   const [fieldFullName, setFieldFullName] = useState(processValues.valueMappingFullFieldName);
   const [fileValues, setFileValues] = useState((processValues.fileValues ?? []) as string[]);
   const [valueErrors, setValueErrors] = useState({} as { [fileValue: string]: any });

   const [bulkLoadProfile, setBulkLoadProfile] = useState(processValues.bulkLoadProfile as BulkLoadProfile);

   const savedBulkLoadProfileRecordProcessValue = processValues.savedBulkLoadProfileRecord;
   const [savedBulkLoadProfileRecord, setSavedBulkLoadProfileRecord] = useState(savedBulkLoadProfileRecordProcessValue == null ? null : new QRecord(savedBulkLoadProfileRecordProcessValue));
   const [wrappedCurrentSavedBulkLoadProfile] = useState(new Wrapper<QRecord>(savedBulkLoadProfileRecord));

   const [tableStructure] = useState(processValues.tableStructure as BulkLoadTableStructure);

   const [currentMapping, setCurrentMapping] = useState(initializeCurrentBulkLoadMapping());
   const [wrappedBulkLoadMapping] = useState(new Wrapper<BulkLoadMapping>(currentMapping));

   const [fileDescription] = useState(new FileDescription(processValues.headerValues, processValues.headerLetters, processValues.bodyValuesPreview));
   fileDescription.setHasHeaderRow(currentMapping.hasHeaderRow);

   const [, forceUpdate] = useReducer((x) => x + 1, 0);


   /*******************************************************************************
    **
    *******************************************************************************/
   function initializeCurrentBulkLoadMapping(): BulkLoadMapping
   {
      const bulkLoadMapping = BulkLoadMapping.fromBulkLoadProfile(tableStructure, bulkLoadProfile, processValues.name);

      if (!bulkLoadMapping.valueMappings[fieldFullName])
      {
         bulkLoadMapping.valueMappings[fieldFullName] = {};
      }

      return (bulkLoadMapping);
   }

   useEffect(() =>
   {
      if (processValues.valueMappingField)
      {
         setField(new QFieldMetaData(processValues.valueMappingField));
      }
      else
      {
         setField(null);
      }
   }, [processValues.valueMappingField]);


   ////////////////////////////////////////////////////////
   // ref-based callback for integration with ProcessRun //
   ////////////////////////////////////////////////////////
   useImperativeHandle(ref, () =>
   {
      return {
         preSubmit(): SubFormPreSubmitCallbackResultType
         {
            const values: { [name: string]: any } = {};

            let anyErrors = false;
            const mappedValues = currentMapping.valueMappings[fieldFullName];
            if (field.isRequired)
            {
               for (let fileValue of fileValues)
               {
                  valueErrors[fileValue] = null;
                  if (mappedValues[fileValue] == null || mappedValues[fileValue] == undefined || mappedValues[fileValue] == "")
                  {
                     valueErrors[fileValue] = "A value is required for this mapping";
                     anyErrors = true;
                  }
               }
            }

            ///////////////////////////////////////////////////
            // always re-submit the full profile             //
            // note mostly a copy in BulkLoadFileMappingForm //
            ///////////////////////////////////////////////////
            const {haveErrors, profile} = wrappedBulkLoadMapping.get().toProfile();
            values["version"] = profile.version;
            values["fieldListJSON"] = JSON.stringify(profile.fieldList);
            values["savedBulkLoadProfileId"] = wrappedCurrentSavedBulkLoadProfile.get()?.values?.get("id");
            values["layout"] = wrappedBulkLoadMapping.get().layout;
            values["hasHeaderRow"] = wrappedBulkLoadMapping.get().hasHeaderRow;

            values["mappedValuesJSON"] = JSON.stringify(mappedValues);

            return ({maySubmit: !anyErrors, values});
         }
      };
   });

   if (!field)
   {
      //////////////////////////////////////////////////////////////////////////////////////
      // this happens like between steps - render empty rather than a flash of half-stuff //
      //////////////////////////////////////////////////////////////////////////////////////
      return (<Box></Box>);
   }

   /***************************************************************************
    **
    ***************************************************************************/
   function mappedValueChanged(fileValue: string, newValue: any)
   {
      valueErrors[fileValue] = null;
      if (newValue == null)
      {
         delete currentMapping.valueMappings[fieldFullName][fileValue];
      }
      else
      {
         currentMapping.valueMappings[fieldFullName][fileValue] = newValue;
      }
      forceUpdate();
   }


   /***************************************************************************
    **
    ***************************************************************************/
   function bulkLoadProfileOnChangeCallback(profileRecord: QRecord | null)
   {
      setSavedBulkLoadProfileRecord(profileRecord);
      wrappedCurrentSavedBulkLoadProfile.set(profileRecord);

      const newBulkLoadMapping = BulkLoadMapping.fromSavedProfileRecord(tableStructure, profileRecord);
      setCurrentMapping(newBulkLoadMapping);
      wrappedBulkLoadMapping.set(newBulkLoadMapping);
   }


   setActiveStepLabel(`Value Mapping: ${field.label} (${processValues.valueMappingFieldIndex + 1} of ${processValues.fieldNamesToDoValueMapping?.length})`);

   return (<Box>

      <Box py="1rem" display="flex">
         <SavedBulkLoadProfiles
            metaData={metaData}
            tableMetaData={tableMetaData}
            tableStructure={tableStructure}
            currentSavedBulkLoadProfileRecord={savedBulkLoadProfileRecord}
            currentMapping={currentMapping}
            allowSelectingProfile={false}
            bulkLoadProfileOnChangeCallback={bulkLoadProfileOnChangeCallback}
            fileDescription={fileDescription}
            isBulkEdit={processValues.isBulkEdit}
         />
      </Box>

      {
         fileValues.map((fileValue, i) => (
            <Box key={i} py="0.5rem" sx={{borderBottom: "0px solid lightgray", width: "100%", overflow: "auto"}}>
               <Box display="grid" gridTemplateColumns="40% auto 60%" fontSize="1rem" gap="0.5rem">
                  <Box mt="0.5rem" textAlign="right">{fileValue}</Box>
                  <Box mt="0.625rem"><Icon>arrow_forward</Icon></Box>
                  <Box maxWidth="300px">
                     <QDynamicFormField
                        name={`${fieldFullName}.value.${i}`}
                        displayFormat={""}
                        label={""}
                        formFieldObject={formFields[i]}
                        type={formFields[i].type}
                        value={currentMapping.valueMappings[fieldFullName][fileValue]}
                        onChangeCallback={(newValue) => mappedValueChanged(fileValue, newValue)}
                     />
                     {
                        valueErrors[fileValue] &&
                        <Box fontSize={"0.875rem"} mt={"-0.75rem"} color={colors.error.main}>
                           {valueErrors[fileValue]}
                        </Box>
                     }
                  </Box>
               </Box>
            </Box>
         ))
      }
   </Box>);

});


export default BulkLoadValueMappingForm;
