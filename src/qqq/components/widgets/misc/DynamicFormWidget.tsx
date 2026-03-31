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
import {QWidgetMetaData} from "@qrunio/qqq-frontend-core/lib/model/metaData/QWidgetMetaData";
import {QRecord} from "@qrunio/qqq-frontend-core/lib/model/QRecord";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import {FormikContextType, useFormikContext} from "formik";
import DynamicFormUtils, {DynamicFormFieldDefinition} from "qqq/components/forms/DynamicFormUtils";
import Widget from "qqq/components/widgets/Widget";
import RecordScreenField from "qqq/pages/records/RecordScreenField";
import RecordScreenContext, {RecordScreenMode} from "qqq/pages/records/RecordScreenContext";
import Client from "qqq/utils/qqq/Client";
import React, {useContext, useEffect, useState} from "react";


/*******************************************************************************
 ** component props
 *******************************************************************************/
interface DynamicFormWidgetProps
{
   isEditable: boolean;
   widgetMetaData: QWidgetMetaData;
   widgetData: any;
   record: QRecord;
   recordValues: { [name: string]: any };
   onSaveCallback?: (values: { [name: string]: any }) => void;
   mode?: RecordScreenMode;
}


/*******************************************************************************
 ** default values for props
 *******************************************************************************/
DynamicFormWidget.defaultProps = {
   onSaveCallback: null
};


/*******************************************************************************
 ** Component to display a dynamic form - e.g., on a record edit or view screen,
 ** or even within a process.
 *******************************************************************************/
export default function DynamicFormWidget({isEditable, widgetMetaData, widgetData, record, recordValues, onSaveCallback, mode}: DynamicFormWidgetProps): JSX.Element
{
   const {onEditIconClick} = useContext(RecordScreenContext);
   const [fields, setFields] = useState([] as QFieldMetaData[]);

   const [effectiveIsEditable, setEffectiveIsEditable] = useState(isEditable);
   if(widgetMetaData.defaultValues.has("isEditable"))
   {
      const defaultIsEditableValue = widgetMetaData.defaultValues.get("isEditable")
      if(defaultIsEditableValue != effectiveIsEditable)
      {
         setEffectiveIsEditable(defaultIsEditableValue);
      }
   }

   const [dynamicFormFields, setDynamicFormFields] = useState(null as any);
   const [formValidations, setFormValidations] = useState(null as any);

   const [lastKnowFormValues, setLastKnowFormValues] = useState({} as {[name: string]: any});


   //////////////////////////////////////////////////////////////////////////////////////////
   // on initial load, and any time widgetData changes (e.g., if widget gets re-rendered), //
   // figure out what our form fields are                                                  //
   //////////////////////////////////////////////////////////////////////////////////////////
   useEffect(() =>
   {
      setDynamicFormFields({})
      setFormValidations({})

      if(widgetData && widgetData.fieldList)
      {
         const newFields: QFieldMetaData[] = [];
         for (let i = 0; i < widgetData.fieldList.length; i++)
         {
            newFields.push(new QFieldMetaData(widgetData.fieldList[i]));
         }
         setFields(newFields);

         if(newFields.length > 0)
         {
            const recordOfFieldValues = widgetData.recordOfFieldValues ? new QRecord(widgetData.recordOfFieldValues) : null;
            const {dynamicFormFields: newDynamicFormFields, formValidations: newFormValidations} = DynamicFormUtils.getFormData(newFields);
            const defaultDisplayValues = new Map<string,string>(); // todo - seems not right?
            DynamicFormUtils.addPossibleValueProps(newDynamicFormFields, newFields, recordValues.tableName, null, recordOfFieldValues ? recordOfFieldValues.displayValues : defaultDisplayValues);
            setDynamicFormFields(newDynamicFormFields)
            setFormValidations(newFormValidations)
         }

         setLastKnowFormValues({});
      }
      else
      {
         setFields([])
      }
   }, [widgetData]);



   /*******************************************************************************
    **
    *******************************************************************************/
   function checkForFormValueChanges(formikProps: FormikContextType<any>)
   {
      if(!fields || !fields.length)
      {
         return;
      }

      let anyChanged = false;
      for (let i = 0; i < fields.length; i++)
      {
         const name = fields[i].name;
         if(formikProps.values[name] != lastKnowFormValues[name])
         {
            anyChanged = true;
            lastKnowFormValues[name] = formikProps.values[name];
         }
      }

      if(anyChanged)
      {
         const mergedDynamicFormValuesIntoFieldName = widgetData.mergedDynamicFormValuesIntoFieldName;
         if(mergedDynamicFormValuesIntoFieldName && onSaveCallback)
         {
            const onSaveCallbackParam: {[name: string]: any} = {};
            onSaveCallbackParam[mergedDynamicFormValuesIntoFieldName] = JSON.stringify(lastKnowFormValues);
            onSaveCallback(onSaveCallbackParam);
         }
      }
   }


   /*******************************************************************************
    **
    *******************************************************************************/
   function getInitialValue(fieldName: string)
   {
      for (let i = 0; i < fields?.length; i++)
      {
         if(fields[i].name == fieldName && fields[i].defaultValue)
         {
            return (fields[i].defaultValue)
         }
      }

      return (null);
   }


   /*******************************************************************************
    ** Build a record with values for the dynamic form fields — used by
    ** RecordScreenField to display values in both view and edit modes.
    *******************************************************************************/
   function buildFakeRecord(): QRecord
   {
      const fakeRecord = new QRecord(widgetData?.recordOfFieldValues ?? {});
      const mergedDynamicFormValuesIntoFieldName = widgetData?.mergedDynamicFormValuesIntoFieldName;

      if (mergedDynamicFormValuesIntoFieldName && recordValues[mergedDynamicFormValuesIntoFieldName])
      {
         let mergedValues = recordValues[mergedDynamicFormValuesIntoFieldName];
         if (typeof mergedValues === "string")
         {
            try
            {
               mergedValues = JSON.parse(mergedValues);
            }
            catch (e)
            {
               // ignore parse errors
            }
         }
         if (mergedValues && typeof mergedValues === "object")
         {
            for (let i = 0; i < fields?.length; i++)
            {
               const fieldName = fields[i].name;
               if (mergedValues[fieldName] !== undefined)
               {
                  fakeRecord.values.set(fieldName, mergedValues[fieldName]);
               }
            }
         }
      }

      return fakeRecord;
   }


   /*******************************************************************************
    ** Wrapper that tracks Formik value changes and merges them into the parent
    ** field via onSaveCallback (for edit mode only).
    *******************************************************************************/
   function FormValueTracker(): JSX.Element
   {
      const formikProps = useFormikContext();

      // set initial values for dynamic fields in Formik
      if (dynamicFormFields)
      {
         for (let key of Object.keys(dynamicFormFields))
         {
            const initialValue = getInitialValue(dynamicFormFields[key].name);
            if (initialValue != null && (formikProps.values as any)[dynamicFormFields[key].name] === undefined)
            {
               // @ts-ignore
               formikProps.initialValues[dynamicFormFields[key].name] = initialValue;
            }
         }
      }

      if (formikProps.values)
      {
         checkForFormValueChanges(formikProps);
      }

      return null;
   }


   /*******************************************************************************
    ** Render the fields using RecordScreenField for consistent layout.
    *******************************************************************************/
   function renderFields(): JSX.Element
   {
      const effectiveMode: RecordScreenMode = mode ?? (effectiveIsEditable ? "edit" : "view");
      const fakeRecord = buildFakeRecord();

      if (!fields || !fields.length)
      {
         return (
            <Box fontSize="1rem">{widgetData && widgetData.noFieldsMessage}</Box>
         );
      }

      return (
         <Grid container display="flex" spacing={0}>
            {effectiveIsEditable && <FormValueTracker />}
            {fields.map((field) =>
            {
               const formFieldDef: DynamicFormFieldDefinition = dynamicFormFields?.[field.name];
               return (
                  <Grid item key={field.name} xs={12} pt={0}>
                     <RecordScreenField
                        field={field}
                        fieldName={field.name}
                        mode={effectiveMode}
                        record={fakeRecord}
                        formFieldDef={formFieldDef}
                        onEditIconClick={onEditIconClick}
                     />
                  </Grid>
               );
            })}
         </Grid>
      );
   }


   ////////////
   // render //
   ////////////
   return (<Widget widgetMetaData={widgetMetaData}>
      {renderFields()}
   </Widget>);
}

