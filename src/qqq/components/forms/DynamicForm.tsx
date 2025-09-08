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

import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import {AdornmentType} from "@qrunio/qqq-frontend-core/lib/model/metaData/AdornmentType";
import {QFieldMetaData} from "@qrunio/qqq-frontend-core/lib/model/metaData/QFieldMetaData";
import {QRecord} from "@qrunio/qqq-frontend-core/lib/model/QRecord";
import {FormikErrors, FormikTouched, FormikValues, useFormikContext} from "formik";
import QDynamicFormField from "qqq/components/forms/DynamicFormField";
import DynamicFormUtils, {DynamicFormFieldDefinition} from "qqq/components/forms/DynamicFormUtils";
import DynamicSelect from "qqq/components/forms/DynamicSelect";
import FileInputField from "qqq/components/forms/FileInputField";
import MDTypography from "qqq/components/legacy/MDTypography";
import HelpContent from "qqq/components/misc/HelpContent";
import Client from "qqq/utils/qqq/Client";
import React, {useEffect, useState} from "react";

const qController = Client.getInstance();

interface Props
{
   ////////////////////////////////////////////////////////
   // an optional h5 to be output at the top of the form //
   ////////////////////////////////////////////////////////
   formLabel?: string;

   /////////////////////////////////////////////////////////////////////////////////////////
   // the fields (as QFMD dynamic-form objects) along with formik errors & touched states //
   // by default, all fields given here will be rendered - but - if fieldNamesToInclude   //
   // is given, then only that subset of fields are rendered.                             //
   /////////////////////////////////////////////////////////////////////////////////////////
   formData:
      {
         formFields: Record<string, DynamicFormFieldDefinition>;
         errors: Record<string, string> | FormikErrors<FormikValues>;
         touched: Record<string, boolean> | FormikTouched<FormikValues>;
      };

   ////////////////////////////////////////////////////
   // optional array of which field names to include //
   ////////////////////////////////////////////////////
   fieldNamesToInclude?: string[];

   /////////////////////////////////////////////////////////////////////////////
   // indicator of whether or not the form is in bulkEditMode (default false) //
   /////////////////////////////////////////////////////////////////////////////
   bulkEditMode?: boolean;

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////////
   // when in bulkEditMode, a 'switch change' callback, to tell parent that a bulk-edit switch has been flipped //
   ///////////////////////////////////////////////////////////////////////////////////////////////////////////////
   bulkEditSwitchChangeHandler?: any;

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
   // a QRecord with values for the form - although - those values (apparently?) are only used in file-type inputs. //
   // todo - eliminate this usage if we can?                                                                        //
   ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
   record?: QRecord;

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
   // array of "roles" used by helpContent system, to decide which help content in the field to display on this screen. //
   ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
   helpRoles?: string[];

   /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
   // prefix put in front of field name for generating "helpHelp" (e.g., clue to user about what help content key to use) //
   /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
   helpContentKeyPrefix?: string;

   //////////////////////////////////////////////////////////////////////////////////////////////////////////////
   // optional callback for changing the definitions of fields, e.g., if they're owned by the parent component //
   // e.g., for use-case where a single page has multiple instances of this component, and where an on-change  //
   // handler in one might impact another.  for simple use-case (single form on page), omit this.              //
   //////////////////////////////////////////////////////////////////////////////////////////////////////////////
   setFormFields?: (formFields: { [key: string]: DynamicFormFieldDefinition }) => void;

   ////////////////////////////////////////////////////////////////////////
   // unique identifier for the process (if being used within a process) //
   ////////////////////////////////////////////////////////////////////////
   processUUID?: string;
}

/***************************************************************************
 * Standard form component used in QFMD.
 ***************************************************************************/
function QDynamicForm({formData, formLabel, fieldNamesToInclude, bulkEditMode, bulkEditSwitchChangeHandler, record, helpRoles, helpContentKeyPrefix, setFormFields, processUUID}: Props): JSX.Element
{
   const {formFields: origFormFields, errors, touched} = formData;
   const {setFieldValue, values} = useFormikContext<Record<string, any>>();

   const [formAdjustmentCounter, setFormAdjustmentCounter] = useState(0);

   const [formFields, localSetFormFields] = useState(origFormFields as { [key: string]: DynamicFormFieldDefinition });
   if (!setFormFields)
   {
      ///////////////////////////////////////////////////////////////////////////////////
      // if caller did not supply a setFormFields callback, then use our own local one //
      ///////////////////////////////////////////////////////////////////////////////////
      setFormFields = localSetFormFields;
   }

   /***************************************************************************
    * event handler for bulk-edit switch - passes through to prop callback
    ***************************************************************************/
   const bulkEditSwitchChanged = (name: string, value: boolean) =>
   {
      if (bulkEditSwitchChangeHandler)
      {
         bulkEditSwitchChangeHandler(name, value);
      }
      else
      {
         console.log("No prop bulkEditSwitchChangeHandler was given.");
      }
   };


   /***************************************************************************
    * test if a field should be included on this form.  true if the prop
    * fieldNamesToInclude is not given, or if it includes this name.
    ***************************************************************************/
   const includeField = (name: string): boolean =>
   {
      return (fieldNamesToInclude == undefined || fieldNamesToInclude.indexOf(name) > -1);
   };


   /////////////////////////////////////////
   // run on-load handlers if we have any //
   /////////////////////////////////////////
   useEffect(() =>
   {
      for (let fieldName in formFields)
      {
         if (!includeField(fieldName))
         {
            continue;
         }

         const field = formFields[fieldName];
         const materialDashboardFieldMetaData = field.fieldMetaData?.supplementalFieldMetaData?.get("materialDashboard");
         if (materialDashboardFieldMetaData?.onLoadFormAdjuster)
         {
            //////////////////////////////////////////////////////////////////////////////////////////////////////////
            // todo consider cases with multiple - do they need to list a sequenceNo? do they need to run serially? //
            //////////////////////////////////////////////////////////////////////////////////////////////////////////
            considerRunningFormAdjuster("onLoad", fieldName, values[fieldName]);
         }
      }
   }, []);


   /***************************************************************************
    **
    ***************************************************************************/
   const handleFieldChange = async (fieldName: string, newValue: any) =>
   {
      const field = formFields[fieldName];
      if (!field)
      {
         return;
      }

      //////////////////////////////////////////////////////////////////////
      // map possible-value objects to ids - also capture their labels... //
      //////////////////////////////////////////////////////////////////////
      let actualNewValue = newValue;
      let possibleValueLabel: string = null;
      if (field.possibleValueProps)
      {
         actualNewValue = newValue ? newValue.id : null;
         possibleValueLabel = newValue ? newValue.label : null;
      }

      /////////////////////////////////////////////////////////////////////////////////////////////
      // make sure formik has the value - and that we capture the possible-value label if needed //
      /////////////////////////////////////////////////////////////////////////////////////////////
      setFieldValue(fieldName, actualNewValue);
      if (field.possibleValueProps)
      {
         field.possibleValueProps.initialDisplayValue = possibleValueLabel;
      }

      ///////////////////////////////////////////
      // run onChange adjuster if there is one //
      ///////////////////////////////////////////
      considerRunningFormAdjuster("onChange", fieldName, actualNewValue);
   };


   /***************************************************************************
    **
    ***************************************************************************/
   const considerRunningFormAdjuster = async (event: "onChange" | "onLoad", fieldName: string, newValue: any) =>
   {
      const field = formFields[fieldName];
      if (!field)
      {
         return;
      }

      const materialDashboardFieldMetaData = field.fieldMetaData?.supplementalFieldMetaData?.get("materialDashboard");
      const adjuster = event == "onChange" ? materialDashboardFieldMetaData?.onChangeFormAdjuster : materialDashboardFieldMetaData?.onLoadFormAdjuster;
      if (!adjuster)
      {
         return;
      }

      console.log(`Running form adjuster for field ${fieldName} ${event} (value is: ${newValue})`);

      //////////////////////////////////////////////////////////////////
      // disable fields temporarily while waiting on backend response //
      //////////////////////////////////////////////////////////////////
      const fieldNamesToTempDisable: string[] = materialDashboardFieldMetaData?.fieldsToDisableWhileRunningAdjusters ?? [];
      const previousIsEditableValues: { [key: string]: boolean } = {};
      if (fieldNamesToTempDisable.length > 0)
      {
         for (let oldFieldName in formFields)
         {
            if (fieldNamesToTempDisable.indexOf(oldFieldName) > -1)
            {
               previousIsEditableValues[oldFieldName] = formFields[oldFieldName].isEditable;
               formFields[oldFieldName].isEditable = false;
            }
         }

         setFormAdjustmentCounter(formAdjustmentCounter + 1);
         setFormFields({...formFields});
      }

      ////////////////////////////////////////////////////
      // build request to backend for field adjustments //
      ////////////////////////////////////////////////////
      const postBody = new FormData();
      postBody.append("event", event);
      postBody.append("fieldName", fieldName);
      postBody.append("newValue", newValue);
      postBody.append("allValues", JSON.stringify(values));
      const response = await qController.axiosRequest(
         {
            method: "post",
            url: `/material-dashboard-backend/form-adjuster/${encodeURIComponent(materialDashboardFieldMetaData.formAdjusterIdentifier)}/${event}`,
            data: postBody,
            headers: qController.defaultMultipartFormDataHeaders()
         });
      console.debug("Form adjuster response: " + JSON.stringify(response));

      ////////////////////////////////////////////////////
      // un-disable any temp disabled fields from above //
      ////////////////////////////////////////////////////
      if (fieldNamesToTempDisable.length > 0)
      {
         for (let oldFieldName in formFields)
         {
            if (fieldNamesToTempDisable.indexOf(oldFieldName) > -1)
            {
               formFields[oldFieldName].isEditable = previousIsEditableValues[oldFieldName];
            }
         }
         setFormFields({...formFields});
      }

      ///////////////////////////////////////////////////
      // replace field definitions, if we have updates //
      ///////////////////////////////////////////////////
      const updatedFields: { [fieldName: string]: QFieldMetaData } = response.updatedFieldMetaData;
      if (updatedFields)
      {
         for (let updatedFieldName in updatedFields)
         {
            const updatedField = new QFieldMetaData(updatedFields[updatedFieldName]);
            const dynamicField = DynamicFormUtils.getDynamicField(updatedField); // todo dynamicallyDisabledFields? second param...

            const dynamicFieldInObject: Record<string, DynamicFormFieldDefinition> = {};
            dynamicFieldInObject[updatedFieldName] = dynamicField;
            let tableName = null;
            let processName = null;
            let displayValues = new Map();

            DynamicFormUtils.addPossibleValueProps(dynamicFieldInObject, [updatedFields[updatedFieldName]], tableName, processName, displayValues);
            for (let oldFieldName in formFields)
            {
               if (oldFieldName == updatedFieldName)
               {
                  formFields[updatedFieldName] = dynamicField;
               }
            }
         }

         setFormAdjustmentCounter(formAdjustmentCounter + 2);
         setFormFields({...formFields});
      }

      /////////////////////////
      // update field values //
      /////////////////////////
      const updatedFieldValues: { [fieldName: string]: any } = response?.updatedFieldValues ?? {};
      for (let fieldNameToUpdate in updatedFieldValues)
      {
         setFieldValue(fieldNameToUpdate, updatedFieldValues[fieldNameToUpdate]);
         ///////////////////////////////////////////////////////////////////////////////////////
         // todo - track if a pvs field gets a value, but not a display value, and fetch it?? //
         ///////////////////////////////////////////////////////////////////////////////////////
      }

      /////////////////////////////////////////////////
      // set display values in PVS's if we have them //
      /////////////////////////////////////////////////
      const updatedFieldDisplayValues: { [fieldName: string]: any } = response?.updatedFieldDisplayValues ?? {};
      for (let fieldNameToUpdate in updatedFieldDisplayValues)
      {
         const fieldToUpdate = formFields[fieldNameToUpdate];
         if (fieldToUpdate?.possibleValueProps)
         {
            fieldToUpdate.possibleValueProps.initialDisplayValue = updatedFieldDisplayValues[fieldNameToUpdate];
         }
      }

      ////////////////////////////////////////
      // clear field values if we have them //
      ////////////////////////////////////////
      const fieldsToClear: string[] = response?.fieldsToClear ?? [];
      for (let fieldToClear of fieldsToClear)
      {
         setFieldValue(fieldToClear, "");
      }
   };


   return (
      <Box>
         <Box lineHeight={0}>
            <MDTypography variant="h5">{formLabel}</MDTypography>
         </Box>
         <Box mt={1.625}>
            <Grid container lg={12} display="flex" spacing={3}>
               {formFields
                  && Object.keys(formFields).length > 0
                  && Object.keys(formFields).map((fieldName: any) =>
                  {
                     if (!includeField(fieldName))
                     {
                        return null;
                     }

                     const field = formFields[fieldName];
                     if (field.omitFromQDynamicForm)
                     {
                        return null;
                     }

                     const visibilityClassName = "field-wrapper " + (field.fieldMetaData?.isHidden ? "is-hidden" : "is-visible");

                     if (values[fieldName] === undefined)
                     {
                        values[fieldName] = "";
                     }

                     let formattedHelpContent = <HelpContent helpContents={field?.fieldMetaData?.helpContents} roles={helpRoles} helpContentKey={`${helpContentKeyPrefix ?? ""}field:${fieldName}`} />;
                     if (formattedHelpContent)
                     {
                        formattedHelpContent = <Box color="#757575" fontSize="0.875rem" mt="-0.25rem">{formattedHelpContent}</Box>;
                     }

                     const labelElement = <DynamicFormFieldLabel name={field.name} label={field.label} />;

                     let itemLG = (field?.fieldMetaData?.gridColumns && field?.fieldMetaData?.gridColumns > 0) ? field.fieldMetaData.gridColumns : 6;
                     let itemXS = 12;
                     let itemSM = 6;

                     /////////////
                     // files!! //
                     /////////////
                     if (field.type === "file")
                     {
                        const fileUploadAdornment = field.fieldMetaData?.getAdornment(AdornmentType.FILE_UPLOAD);
                        const width = fileUploadAdornment?.values?.get("width") ?? "half";

                        if (width == "full")
                        {
                           itemSM = 12;
                           itemLG = 12;
                        }

                        return (
                           <Grid item className={visibilityClassName} lg={itemLG} xs={itemXS} sm={itemSM} flexDirection="column" key={fieldName + "-" + formAdjustmentCounter}>
                              {labelElement}
                              <FileInputField field={field} record={record} errorMessage={errors[fieldName]} />
                           </Grid>
                        );
                     }

                     else if (field.possibleValueProps)
                     {
                        ///////////////////////
                        // possible values!! //
                        ///////////////////////
                        const otherValuesMap = field.possibleValueProps.otherValues ?? new Map<string, any>();
                        Object.keys(values).forEach((key) =>
                        {
                           otherValuesMap.set(key, values[key]);
                        });

                        return (
                           <Grid item className={visibilityClassName} lg={itemLG} xs={itemXS} sm={itemSM} key={fieldName + "-" + formAdjustmentCounter}>
                              {labelElement}
                              <DynamicSelect
                                 fieldPossibleValueProps={field.possibleValueProps}
                                 isEditable={field.isEditable}
                                 fieldLabel=""
                                 initialValue={values[fieldName]}
                                 bulkEditMode={bulkEditMode}
                                 bulkEditSwitchChangeHandler={bulkEditSwitchChanged}
                                 otherValues={otherValuesMap}
                                 useCase="form"
                                 onChange={(newValue: any) => handleFieldChange(fieldName, newValue)}
                                 processUUID={processUUID}
                              />
                              {formattedHelpContent}
                           </Grid>
                        );
                     }

                     ///////////////////////
                     // everything else!! //
                     ///////////////////////
                     return (
                        <Grid item className={visibilityClassName} lg={itemLG} xs={itemXS} sm={itemSM} key={fieldName + "-" + formAdjustmentCounter}>
                           {labelElement}
                           <QDynamicFormField
                              id={field.name}
                              type={field.type}
                              label=""
                              isEditable={field.isEditable}
                              name={fieldName}
                              displayFormat={field.displayFormat}
                              value={values[fieldName]}
                              error={errors[fieldName] && touched[fieldName]}
                              bulkEditMode={bulkEditMode}
                              bulkEditSwitchChangeHandler={bulkEditSwitchChanged}
                              success={`${values[fieldName]}` !== "" && !errors[fieldName] && touched[fieldName]}
                              formFieldObject={field}
                              onChangeCallback={(newValue) => handleFieldChange(fieldName, newValue)}
                           />
                           {formattedHelpContent}
                        </Grid>
                     );
                  })}
            </Grid>
         </Box>
      </Box>
   );
}

QDynamicForm.defaultProps = {
   formLabel: undefined,
   bulkEditMode: false,
   helpRoles: ["ALL_SCREENS"],
   bulkEditSwitchChangeHandler: () =>
   {
   },
};


interface DynamicFormFieldLabelProps
{
   name: string;
   label: string;
}

export function DynamicFormFieldLabel({name, label}: DynamicFormFieldLabelProps): JSX.Element
{
   return (<Box fontSize="1rem" fontWeight="500" marginBottom="0.25rem">
      <label htmlFor={name}>{label}</label>
   </Box>);
}


export default QDynamicForm;
