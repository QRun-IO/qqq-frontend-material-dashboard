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

import {AdornmentType} from "@qrunio/qqq-frontend-core/lib/model/metaData/AdornmentType";
import {QFieldMetaData} from "@qrunio/qqq-frontend-core/lib/model/metaData/QFieldMetaData";
import {QFieldType} from "@qrunio/qqq-frontend-core/lib/model/metaData/QFieldType";
import {FieldPossibleValueProps} from "qqq/models/fields/FieldPossibleValueProps";
import * as Yup from "yup";


type DisabledFields = { [fieldName: string]: boolean } | string[];

type DynamicFormFieldType = "number" | "datetime-local" | "password" | "time" | "date" | "file" | "checkbox" | "text" | "ace"

//////////////////////////////////////
// type returned by getDynamicField //
//////////////////////////////////////
export interface DynamicFormFieldDefinition
{
   fieldMetaData: QFieldMetaData;
   name: string;
   label: string;
   isRequired: boolean;
   isEditable: boolean;
   type: DynamicFormFieldType;
   displayFormat?: string;
   possibleValueProps?: FieldPossibleValueProps;
   omitFromQDynamicForm?: boolean;
}

////////////////////////////////////////////////////////////////////////////////////////////////
// type returned by getFormData:  associative arrays of field definitions and yup validations //
////////////////////////////////////////////////////////////////////////////////////////////////
export interface FormDataDefinition
{
   dynamicFormFields: Record<string, DynamicFormFieldDefinition>,
   formValidations: Record<string, Yup.BaseSchema>
}

/*******************************************************************************
 ** Meta-data to represent a single field in a table.
 **
 *******************************************************************************/
class DynamicFormUtils
{

   /*******************************************************************************
    **
    *******************************************************************************/
   public static getFormData(qqqFormFields: QFieldMetaData[], disabledFields?: DisabledFields): FormDataDefinition
   {
      const dynamicFormFields: Record<string, DynamicFormFieldDefinition> = {};
      const formValidations: Record<string, Yup.BaseSchema> = {};

      qqqFormFields.forEach((field) =>
      {
         dynamicFormFields[field.name] = this.getDynamicField(field, disabledFields);
         formValidations[field.name] = this.getValidationForField(field, disabledFields);
      });

      return {dynamicFormFields, formValidations};
   }


   /*******************************************************************************
    **
    *******************************************************************************/
   public static getDynamicField(field: QFieldMetaData, disabledFields?: DisabledFields): DynamicFormFieldDefinition
   {
      let fieldType: string;
      switch (field.type.toString())
      {
         case QFieldType.DECIMAL:
         case QFieldType.INTEGER:
            fieldType = "number";
            break;
         case QFieldType.DATE_TIME:
            fieldType = "datetime-local";
            break;
         case QFieldType.PASSWORD:
         case QFieldType.TIME:
         case QFieldType.DATE:
            fieldType = field.type.toString();
            break;
         case QFieldType.BLOB:
            fieldType = "file";
            break;
         case QFieldType.BOOLEAN:
            fieldType = "checkbox";
            break;
         case QFieldType.TEXT:
         case QFieldType.HTML:
         case QFieldType.STRING:
         default:
            fieldType = "text";
      }

      let more: any = {};
      if (field.hasAdornment(AdornmentType.CODE_EDITOR))
      {
         fieldType = "ace";
         const values = field.getAdornment(AdornmentType.CODE_EDITOR).values;
         if (values.has("languageMode"))
         {
            more.languageMode = values.get("languageMode");
         }
      }

      ////////////////////////////////////////////////////////////
      // this feels right, but... might be cases where it isn't //
      ////////////////////////////////////////////////////////////
      const effectiveIsEditable = field.isEditable && !this.isFieldDynamicallyDisabled(field.name, disabledFields);
      const effectivelyIsRequired = field.isRequired && effectiveIsEditable;

      let label = field.label ? field.label : field.name;
      label += effectivelyIsRequired ? " *" : "";

      return ({
         fieldMetaData: field,
         name: field.name,
         label: label,
         isRequired: effectivelyIsRequired,
         isEditable: effectiveIsEditable,
         type: fieldType,
         displayFormat: field.displayFormat,
         // todo invalidMsg: "Zipcode is not valid (e.g. 70000).",
         ...more
      });
   }


   /*******************************************************************************
    **
    *******************************************************************************/
   public static getValidationForField(field: QFieldMetaData, disabledFields?: DisabledFields): Yup.BaseSchema
   {
      const effectiveIsEditable = field.isEditable && !this.isFieldDynamicallyDisabled(field.name, disabledFields);
      const effectivelyIsRequired = field.isRequired && effectiveIsEditable;

      if (effectivelyIsRequired)
      {
         ////////////////////////////////////////////////////////////////////////////////////////////
         // the "nullable(true)" here doesn't mean that you're allowed to set the field to null... //
         // rather, it's more like "null is how empty will be treated" or some-such...             //
         ////////////////////////////////////////////////////////////////////////////////////////////
         return (Yup.string().required(`${field.label ?? "This field"} is required.`).nullable(true));
      }
      return (null);
   }


   /*******************************************************************************
    * wrapper around addPossibleValueProps to do it for a single field.
    *******************************************************************************/
   public static addPossibleValuePropsToSingleField(dynamicFormField: DynamicFormFieldDefinition, qField: QFieldMetaData, tableName: string, processName: string, displayValues: Map<string, string>)
   {
      const dynamicFormFields: Record<string, DynamicFormFieldDefinition> = {};
      dynamicFormFields[dynamicFormField.name] = dynamicFormField;
      const qFields = [qField];
      DynamicFormUtils.addPossibleValueProps(dynamicFormFields, qFields, tableName, processName, displayValues);
   }


   /*******************************************************************************
    * update several DynamicFormFieldDefinition's with properties that make them
    * behave like possible value objects, based on attributes in QFieldMetaData.
    *******************************************************************************/
   public static addPossibleValueProps(dynamicFormFields: Record<string, DynamicFormFieldDefinition>, qFields: QFieldMetaData[], tableName: string, processName: string, displayValues: Map<string, string>)
   {
      for (let i = 0; i < qFields.length; i++)
      {
         const field = qFields[i];

         if(!dynamicFormFields[field.name])
         {
            continue;
         }

         /////////////////////////////////////////
         // add props for possible value fields //
         /////////////////////////////////////////
         if (field.possibleValueSourceName || field.inlinePossibleValueSource)
         {
            let props: FieldPossibleValueProps =
               {
                  isPossibleValue: true,
                  fieldName: field.name,
                  initialDisplayValue: null
               }

            if (displayValues)
            {
               props.initialDisplayValue = displayValues.get(field.name);
            }

            if(field.inlinePossibleValueSource)
            {
               //////////////////////////////////////////////////////////////////////
               // handle an inline PVS - which is a list of possible value objects //
               //////////////////////////////////////////////////////////////////////
               props.possibleValues = field.inlinePossibleValueSource;
            }
            else if (tableName)
            {
               props.tableName = tableName;
            }
            else if (processName)
            {
               props.processName = processName;
            }
            else
            {
               props.possibleValueSourceName = field.possibleValueSourceName;
            }

            if(field.possibleValueSourceFilter)
            {
               props.possibleValueSourceFilter = field.possibleValueSourceFilter;
            }

            dynamicFormFields[field.name].possibleValueProps = props;
         }
      }
   }


   /*******************************************************************************
    ** private helper - check the disabled fields object (array or map), and return
    ** true iff fieldName is in it.
    *******************************************************************************/
   private static isFieldDynamicallyDisabled(fieldName: string, disabledFields?: DisabledFields): boolean
   {
      if (!disabledFields)
      {
         return (false);
      }

      if (Array.isArray(disabledFields))
      {
         return (disabledFields.indexOf(fieldName) > -1);
      }
      else
      {
         return (disabledFields[fieldName]);
      }
   }


   /***************************************************************************
    * check if a field has the TO_UPPER_CASE behavior on it.
    ***************************************************************************/
   public static isToUpperCase(fieldMetaData: QFieldMetaData): boolean
   {
      return this.hasBehavior(fieldMetaData, "TO_UPPER_CASE");
   }


   /***************************************************************************
    * check if a field has the TO_LOWER_CASE behavior on it.
    ***************************************************************************/
   public static isToLowerCase(fieldMetaData: QFieldMetaData): boolean
   {
      return this.hasBehavior(fieldMetaData, "TO_LOWER_CASE");
   }


   /***************************************************************************
    * check if a field has a specific behavior name on it.
    ***************************************************************************/
   private static hasBehavior(fieldMetaData: QFieldMetaData, behaviorName: string): boolean
   {
      if (fieldMetaData && fieldMetaData.behaviors)
      {
         for (let i = 0; i < fieldMetaData.behaviors.length; i++)
         {
            if (fieldMetaData.behaviors[i] == behaviorName)
            {
               return (true);
            }
         }
      }

      return (false);
   }

}

export default DynamicFormUtils;
