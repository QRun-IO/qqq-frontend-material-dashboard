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


import {QFieldMetaData} from "@qrunio/qqq-frontend-core/lib/model/metaData/QFieldMetaData";
import {QFieldType} from "@qrunio/qqq-frontend-core/lib/model/metaData/QFieldType";
import {QRecord} from "@qrunio/qqq-frontend-core/lib/model/QRecord";

export type ValueType = "defaultValue" | "column";

/***************************************************************************
 ** model of a single field that's part of a bulk-load profile/mapping
 ***************************************************************************/
export class BulkLoadField
{
   field: QFieldMetaData;
   tableStructure: BulkLoadTableStructure;

   valueType: ValueType;
   columnIndex?: number;
   headerName?: string = null;
   defaultValue?: any = null;
   doValueMapping: boolean = false;
   clearIfEmpty?: boolean = false;

   wideLayoutIndexPath: number[] = [];

   error: string = null;
   warning: string = null;

   key: string;


   /***************************************************************************
    **
    ***************************************************************************/
   constructor(field: QFieldMetaData, tableStructure: BulkLoadTableStructure, valueType: ValueType = "column", columnIndex?: number, headerName?: string, defaultValue?: any, doValueMapping?: boolean, wideLayoutIndexPath: number[] = [], error: string = null, warning: string = null, clearIfEmpty?: boolean)
   {
      this.field = field;
      this.tableStructure = tableStructure;
      this.valueType = valueType;
      this.columnIndex = columnIndex;
      this.headerName = headerName;
      this.defaultValue = defaultValue;
      this.doValueMapping = doValueMapping;
      this.wideLayoutIndexPath = wideLayoutIndexPath;
      this.error = error;
      this.warning = warning;
      this.key = new Date().getTime().toString();
      this.clearIfEmpty = clearIfEmpty ?? false;
   }


   /***************************************************************************
    **
    ***************************************************************************/
   public static clone(source: BulkLoadField): BulkLoadField
   {
      return (new BulkLoadField(source.field, source.tableStructure, source.valueType, source.columnIndex, source.headerName, source.defaultValue, source.doValueMapping, source.wideLayoutIndexPath, source.error, source.warning, source.clearIfEmpty));
   }


   /***************************************************************************
    **
    ***************************************************************************/
   public getQualifiedName(): string
   {
      if (this.tableStructure.isMain)
      {
         return this.field.name;
      }

      return this.tableStructure.associationPath + "." + this.field.name;
   }


   /***************************************************************************
    **
    ***************************************************************************/
   public getQualifiedNameWithWideSuffix(): string
   {
      let wideLayoutSuffix = "";
      if (this.wideLayoutIndexPath.length > 0)
      {
         wideLayoutSuffix = "." + this.wideLayoutIndexPath.map(i => i + 1).join(".");
      }

      if (this.tableStructure.isMain)
      {
         return this.field.name + wideLayoutSuffix;
      }

      return this.tableStructure.associationPath + "." + this.field.name + wideLayoutSuffix;
   }


   /***************************************************************************
    **
    ***************************************************************************/
   public getKey(): string
   {
      let wideLayoutSuffix = "";
      if (this.wideLayoutIndexPath.length > 0)
      {
         wideLayoutSuffix = "." + this.wideLayoutIndexPath.map(i => i + 1).join(".");
      }

      if (this.tableStructure.isMain)
      {
         return this.field.name + wideLayoutSuffix + this.key;
      }

      return this.tableStructure.associationPath + "." + this.field.name + wideLayoutSuffix + this.key;
   }


   /***************************************************************************
    **
    ***************************************************************************/
   public getQualifiedLabel(): string
   {
      let wideLayoutSuffix = "";
      if (this.wideLayoutIndexPath.length > 0)
      {
         wideLayoutSuffix = " (" + this.wideLayoutIndexPath.map(i => i + 1).join(", ") + ")";
      }

      if (this.tableStructure.isMain)
      {
         return this.field.label + wideLayoutSuffix;
      }

      return this.tableStructure.label + ": " + this.field.label + wideLayoutSuffix;
   }

   /***************************************************************************
    **
    ***************************************************************************/
   public isMany(): boolean
   {
      return this.tableStructure && this.tableStructure.isMany;
   }
}


/***************************************************************************
 ** this is a type defined in qqq backend - a representation of a bulk-load
 ** table - e.g., how it fits into qqq - and of note - how child / association
 ** tables are nested too.
 ***************************************************************************/
export interface BulkLoadTableStructure
{
   isMain: boolean;
   isMany: boolean;
   tableName: string;
   label: string;
   associationPath: string;
   fields: QFieldMetaData[];
   associations: BulkLoadTableStructure[];
   isBulkEdit: boolean;
   possibleKeyFields: string[];
   keyFields?: string;
}


/*******************************************************************************
 ** this is the internal data structure that the UI works with - but notably,
 ** is not how we send it to the backend or how backend saves profiles -- see
 ** BulkLoadProfile for that.
 *******************************************************************************/
export class BulkLoadMapping
{
   fields: { [qualifiedName: string]: BulkLoadField } = {};
   fieldsByTablePrefix: { [prefix: string]: { [qualifiedFieldName: string]: BulkLoadField } } = {};
   tablesByPath: { [path: string]: BulkLoadTableStructure } = {};

   requiredFields: BulkLoadField[] = [];
   additionalFields: BulkLoadField[] = [];
   unusedFields: BulkLoadField[] = [];

   valueMappings: { [fieldName: string]: { [fileValue: string]: any } } = {};

   isBulkEdit: boolean;
   keyFields: string;
   hasHeaderRow: boolean;
   layout: string;

   /***************************************************************************
    **
    ***************************************************************************/
   constructor(tableStructure: BulkLoadTableStructure)
   {
      if (tableStructure)
      {
         this.processTableStructure(tableStructure);

         if (!tableStructure.associations)
         {
            this.layout = "FLAT";
         }
      }

      this.isBulkEdit = tableStructure.isBulkEdit;
      this.keyFields = tableStructure.keyFields;
      this.hasHeaderRow = true;
   }


   /***************************************************************************
    **
    ***************************************************************************/
   public processTableStructure(tableStructure: BulkLoadTableStructure)
   {
      const prefix = tableStructure.isMain ? "" : tableStructure.associationPath;
      this.fieldsByTablePrefix[prefix] = {};
      this.tablesByPath[prefix] = tableStructure;
      this.isBulkEdit = tableStructure.isBulkEdit;
      this.keyFields = tableStructure.keyFields;

      for (let field of tableStructure.fields)
      {
         // todo delete this - backend should only give it to us if editable: if (field.isEditable)
         {
            const bulkLoadField = new BulkLoadField(field, tableStructure);
            const qualifiedName = bulkLoadField.getQualifiedName();
            this.fields[qualifiedName] = bulkLoadField;
            this.fieldsByTablePrefix[prefix][qualifiedName] = bulkLoadField;

            if (this.isBulkEdit)
            {
               if (this.keyFields == null)
               {
                  this.unusedFields.push(bulkLoadField);
               }
               else
               {
                  const keyFields = this.keyFields.split("|");
                  if (keyFields.includes(qualifiedName))
                  {
                     this.requiredFields.push(bulkLoadField);
                  }
                  else
                  {
                     this.unusedFields.push(bulkLoadField);
                  }
               }
            }
            else
            {
               if (tableStructure.isMain && field.isRequired)
               {
                  this.requiredFields.push(bulkLoadField);
               }
               else
               {
                  this.unusedFields.push(bulkLoadField);
               }
            }
         }
      }

      for (let associatedTableStructure of tableStructure.associations ?? [])
      {
         this.processTableStructure(associatedTableStructure);
      }
   }


   /***************************************************************************
    ** take a saved bulk load profile - and convert it into a working bulkLoadMapping
    ** for the frontend to use!
    ***************************************************************************/
   public static fromSavedProfileRecord(tableStructure: BulkLoadTableStructure, profileRecord: QRecord): BulkLoadMapping
   {
      const bulkLoadProfile = JSON.parse(profileRecord.values.get("mappingJson")) as BulkLoadProfile;
      return BulkLoadMapping.fromBulkLoadProfile(tableStructure, bulkLoadProfile);
   }


   /***************************************************************************
    ** take a saved bulk load profile - and convert it into a working bulkLoadMapping
    ** for the frontend to use!
    ***************************************************************************/
   public static fromBulkLoadProfile(tableStructure: BulkLoadTableStructure, bulkLoadProfile: BulkLoadProfile, processName?: string): BulkLoadMapping
   {
      const bulkLoadMapping = new BulkLoadMapping(tableStructure);

      if (bulkLoadProfile.version == "v1")
      {
         bulkLoadMapping.isBulkEdit = bulkLoadProfile.isBulkEdit;
         bulkLoadMapping.hasHeaderRow = bulkLoadProfile.hasHeaderRow;
         bulkLoadMapping.layout = bulkLoadProfile.layout;
         bulkLoadMapping.keyFields = bulkLoadProfile.keyFields;

         ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
         // function to get a bulkLoadMapping field by its (full) name - whether that's in the required fields list,   //
         // or it's an additional field, in which case, we'll go through the addField method to move what list it's in //
         ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
         function getBulkLoadFieldMovingFromUnusedToActiveIfNeeded(bulkLoadMapping: BulkLoadMapping, name: string): BulkLoadField
         {
            let wideIndex: number = null;
            if (name.match(/,\d+$/))
            {
               wideIndex = Number(name.match(/\d+$/));
               name = name.replace(/,\d+$/, "");
            }

            for (let field of bulkLoadMapping.requiredFields)
            {
               if (field.getQualifiedName() == name)
               {
                  return (field);
               }
            }

            for (let field of bulkLoadMapping.unusedFields)
            {
               if (field.getQualifiedName() == name)
               {
                  const addedField = bulkLoadMapping.addField(field, wideIndex);
                  return (addedField);
               }
            }
         }

         //////////////////////////////////////////////////////////////////
         // loop over fields in the profile - adding them to the mapping //
         //////////////////////////////////////////////////////////////////
         for (let bulkLoadProfileField of ((bulkLoadProfile.fieldList ?? []) as BulkLoadProfileField[]))
         {
            const bulkLoadField = getBulkLoadFieldMovingFromUnusedToActiveIfNeeded(bulkLoadMapping, bulkLoadProfileField.fieldName);
            if (!bulkLoadField)
            {
               console.log(`Couldn't find bulk-load-field by name from profile record [${bulkLoadProfileField.fieldName}]`);
               continue;
            }

            if ((bulkLoadProfileField.columnIndex != null && bulkLoadProfileField.columnIndex != undefined) || (bulkLoadProfileField.headerName != null && bulkLoadProfileField.headerName != undefined))
            {
               bulkLoadField.valueType = "column";
               bulkLoadField.doValueMapping = bulkLoadProfileField.doValueMapping;
               bulkLoadField.clearIfEmpty = bulkLoadProfileField.clearIfEmpty;
               bulkLoadField.headerName = bulkLoadProfileField.headerName;
               bulkLoadField.columnIndex = bulkLoadProfileField.columnIndex;

               if (bulkLoadProfileField.valueMappings)
               {
                  bulkLoadMapping.valueMappings[bulkLoadProfileField.fieldName] = {};
                  for (let fileValue in bulkLoadProfileField.valueMappings)
                  {
                     ////////////////////////////////////////////////////
                     // frontend wants string values here, so, string. //
                     ////////////////////////////////////////////////////
                     bulkLoadMapping.valueMappings[bulkLoadProfileField.fieldName][String(fileValue)] = bulkLoadProfileField.valueMappings[fileValue];
                  }
               }
            }
            else
            {
               bulkLoadField.valueType = "defaultValue";
               bulkLoadField.defaultValue = bulkLoadProfileField.defaultValue;
            }
         }

         if (!bulkLoadMapping.keyFields && tableStructure.possibleKeyFields?.length > 0)
         {
            ////////////////////////////////////////////////////////////////////////////////////////////////
            // look at each of the possible key fields, compare with the fields in the bulk load profile, //
            // on the first one that matches, use that as the default bulk load mapping key field         //
            ////////////////////////////////////////////////////////////////////////////////////////////////
            for (let keyField of tableStructure.possibleKeyFields)
            {
               const parts = keyField.split("|");
               const allPartsMatch = parts.every(part =>
                  (bulkLoadProfile.fieldList ?? []).some((field: BulkLoadProfileField) =>
                     field.fieldName === part
                  )
               );

               if (allPartsMatch)
               {
                  bulkLoadMapping.keyFields = keyField;
                  break; // stop after the first valid match
               }
            }
         }

         return (bulkLoadMapping);
      }
      else
      {
         throw ("Unexpected version for bulk load profile: " + bulkLoadProfile.version);
      }
   }


   /***************************************************************************
    ** take a working bulkLoadMapping from the frontend, and convert it to a
    ** BulkLoadProfile for the backend / for us to save.
    ***************************************************************************/
   public toProfile(): { haveErrors: boolean, profile: BulkLoadProfile }
   {
      let haveErrors = false;
      const profile = new BulkLoadProfile();

      profile.version = "v1";
      profile.hasHeaderRow = this.hasHeaderRow;
      profile.layout = this.layout;
      profile.isBulkEdit = this.isBulkEdit;
      profile.keyFields = this.keyFields;

      for (let bulkLoadField of [...this.requiredFields, ...this.additionalFields])
      {
         let fullFieldName = (bulkLoadField.tableStructure.isMain ? "" : bulkLoadField.tableStructure.associationPath + ".") + bulkLoadField.field.name;
         if (bulkLoadField.wideLayoutIndexPath != null && bulkLoadField.wideLayoutIndexPath != undefined && bulkLoadField.wideLayoutIndexPath.length)
         {
            fullFieldName += "," + bulkLoadField.wideLayoutIndexPath.join(".");
         }

         bulkLoadField.error = null;
         if (bulkLoadField.valueType == "column")
         {
            if (bulkLoadField.columnIndex == undefined || bulkLoadField.columnIndex == null)
            {
               haveErrors = true;
               bulkLoadField.error = "You must select a column.";
            }
            else
            {
               const field: BulkLoadProfileField = {fieldName: fullFieldName, columnIndex: bulkLoadField.columnIndex, headerName: bulkLoadField.headerName, doValueMapping: bulkLoadField.doValueMapping, clearIfEmpty: bulkLoadField.clearIfEmpty};

               if (this.valueMappings[fullFieldName])
               {
                  field.valueMappings = this.valueMappings[fullFieldName];
               }

               profile.fieldList.push(field);
            }
         }
         else if (bulkLoadField.valueType == "defaultValue")
         {
            if (bulkLoadField.defaultValue == undefined || bulkLoadField.defaultValue == null || bulkLoadField.defaultValue == "")
            {
               haveErrors = true;
               bulkLoadField.error = "A value is required.";
            }
            else
            {
               profile.fieldList.push({fieldName: fullFieldName, defaultValue: bulkLoadField.defaultValue});
            }
         }
      }

      return {haveErrors, profile};
   }


   /***************************************************************************
    **
    ***************************************************************************/
   public addField(bulkLoadField: BulkLoadField, specifiedWideIndex?: number): BulkLoadField
   {
      if (bulkLoadField.isMany() && this.layout == "WIDE")
      {
         let index: number;
         if (specifiedWideIndex != null && specifiedWideIndex != undefined)
         {
            index = specifiedWideIndex;
         }
         else
         {
            ///////////////////////////////////////////////
            // find the max index for this field already //
            ///////////////////////////////////////////////
            let maxIndex = -1;
            for (let existingField of [...this.requiredFields, ...this.additionalFields])
            {
               if (existingField.getQualifiedName() == bulkLoadField.getQualifiedName())
               {
                  const thisIndex = existingField.wideLayoutIndexPath[0];
                  if (thisIndex != null && thisIndex != undefined && thisIndex > maxIndex)
                  {
                     maxIndex = thisIndex;
                  }
               }
            }
            index = maxIndex + 1;
         }

         const cloneField = BulkLoadField.clone(bulkLoadField);
         cloneField.wideLayoutIndexPath = [index];
         this.additionalFields.push(cloneField);
         return (cloneField);
      }
      else
      {
         this.additionalFields.push(bulkLoadField);
         return (bulkLoadField);
      }
   }

   /***************************************************************************
    **
    ***************************************************************************/
   public removeField(toRemove: BulkLoadField): void
   {
      const newAdditionalFields: BulkLoadField[] = [];
      for (let bulkLoadField of this.additionalFields)
      {
         if (bulkLoadField.getQualifiedNameWithWideSuffix() != toRemove.getQualifiedNameWithWideSuffix())
         {
            newAdditionalFields.push(bulkLoadField);
         }
      }

      this.additionalFields = newAdditionalFields;
   }


   /***************************************************************************
    **
    ***************************************************************************/
   public switchLayout(newLayout: string): void
   {
      const newAdditionalFields: BulkLoadField[] = [];
      let anyChanges = false;

      if ("WIDE" != newLayout)
      {
         ////////////////////////////////////////////////////////////////////////////////////////////////////////
         // if going to a layout other than WIDE, make sure there aren't any fields with a wideLayoutIndexPath //
         ////////////////////////////////////////////////////////////////////////////////////////////////////////
         const namesWhereOneWideLayoutIndexHasBeenFound: { [name: string]: boolean } = {};
         for (let existingField of this.additionalFields)
         {
            if (existingField.wideLayoutIndexPath.length > 0)
            {
               const name = existingField.getQualifiedName();
               if (namesWhereOneWideLayoutIndexHasBeenFound[name])
               {
                  /////////////////////////////////////////////////////////////////////////////////////////////////////////
                  // in this case, we're on like the 2nd or 3rd instance of, say, Line Item: SKU - so - just discard it. //
                  /////////////////////////////////////////////////////////////////////////////////////////////////////////
                  anyChanges = true;
               }
               else
               {
                  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                  // else, this is the 1st instance of, say, Line Item: SKU - so mark that we've found it - and keep this field //
                  // (that is, put it in the new array), but with no index path                                                 //
                  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                  namesWhereOneWideLayoutIndexHasBeenFound[name] = true;
                  const newField = BulkLoadField.clone(existingField);
                  newField.wideLayoutIndexPath = [];
                  newAdditionalFields.push(newField);
                  anyChanges = true;
               }
            }
            else
            {
               //////////////////////////////////////////////////////
               // else, non-wide-path fields, just get added as-is //
               //////////////////////////////////////////////////////
               newAdditionalFields.push(existingField);
            }
         }
      }
      else
      {
         ///////////////////////////////////////////////////////////////////////////////////////////////
         // if going to WIDE layout, then any field from a child table needs a wide-layout-index-path //
         ///////////////////////////////////////////////////////////////////////////////////////////////
         for (let existingField of this.additionalFields)
         {
            if (existingField.tableStructure.isMain)
            {
               ////////////////////////////////////////////
               // fields from main table come over as-is //
               ////////////////////////////////////////////
               newAdditionalFields.push(existingField);
            }
            else
            {
               /////////////////////////////////////////////////////////////////////////////////////////////
               // fields from child tables get a wideLayoutIndexPath (and we're assuming just 1 for each) //
               /////////////////////////////////////////////////////////////////////////////////////////////
               const newField = BulkLoadField.clone(existingField);
               newField.wideLayoutIndexPath = [0];
               newAdditionalFields.push(newField);
               anyChanges = true;
            }
         }
      }

      if (anyChanges)
      {
         this.additionalFields = newAdditionalFields;
      }

      this.layout = newLayout;
   }


   /***************************************************************************
    **
    ***************************************************************************/
   public getFieldsForColumnIndex(i: number): BulkLoadField[]
   {
      const rs: BulkLoadField[] = [];

      for (let field of [...this.requiredFields, ...this.additionalFields])
      {
         if (field.valueType == "column" && field.columnIndex == i)
         {
            rs.push(field);
         }
      }

      return (rs);
   }


   /***************************************************************************
    **
    ***************************************************************************/
   public handleChangeToKeyFields(newKeyFields: any)
   {
      this.keyFields = newKeyFields;
   }


   /***************************************************************************
    **
    ***************************************************************************/
   public handleChangeToHasHeaderRow(newValue: any, fileDescription: FileDescription)
   {
      const newRequiredFields: BulkLoadField[] = [];
      let anyChangesToRequiredFields = false;

      const newAdditionalFields: BulkLoadField[] = [];
      let anyChangesToAdditionalFields = false;

      ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
      // if we're switching to have header-rows enabled, then make sure that no columns w/ duplicated headers are selected //
      // strategy to do this:  build new lists of both required & additional fields - and track if we had to change any    //
      // column indexes (set to null) - add a warning to them, and only replace the arrays if there were changes.          //
      ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
      if (newValue)
      {
         for (let field of this.requiredFields)
         {
            if (field.valueType == "column" && fileDescription.duplicateHeaderIndexes[field.columnIndex])
            {
               const newField = BulkLoadField.clone(field);
               newField.columnIndex = null;
               newField.warning = "This field was assigned to a column with a duplicated header";
               newRequiredFields.push(newField);
               anyChangesToRequiredFields = true;
            }
            else
            {
               newRequiredFields.push(field);
            }
         }

         for (let field of this.additionalFields)
         {
            if (field.valueType == "column" && fileDescription.duplicateHeaderIndexes[field.columnIndex])
            {
               const newField = BulkLoadField.clone(field);
               newField.columnIndex = null;
               newField.warning = "This field was assigned to a column with a duplicated header";
               newAdditionalFields.push(newField);
               anyChangesToAdditionalFields = true;
            }
            else
            {
               newAdditionalFields.push(field);
            }
         }
      }

      if (anyChangesToRequiredFields)
      {
         this.requiredFields = newRequiredFields;
      }

      if (anyChangesToAdditionalFields)
      {
         this.additionalFields = newAdditionalFields;
      }
   }
}


/***************************************************************************
 ** meta-data about the file that the user uploaded
 ***************************************************************************/
export class FileDescription
{
   headerValues: string[];
   headerLetters: string[];
   bodyValuesPreview: string[][];

   duplicateHeaderIndexes: boolean[];

   // todo - just get this from the profile always - it's not part of the file per-se
   hasHeaderRow: boolean = true;

   /***************************************************************************
    **
    ***************************************************************************/
   constructor(headerValues: string[], headerLetters: string[], bodyValuesPreview: string[][])
   {
      this.headerValues = headerValues;
      this.headerLetters = headerLetters;
      this.bodyValuesPreview = bodyValuesPreview;

      this.duplicateHeaderIndexes = [];
      const usedLabels: { [label: string]: boolean } = {};
      for (let i = 0; i < headerValues.length; i++)
      {
         const label = headerValues[i];
         if (usedLabels[label])
         {
            this.duplicateHeaderIndexes[i] = true;
         }
         usedLabels[label] = true;
      }
   }


   /***************************************************************************
    **
    ***************************************************************************/
   public setHasHeaderRow(hasHeaderRow: boolean)
   {
      this.hasHeaderRow = hasHeaderRow;
   }


   /***************************************************************************
    **
    ***************************************************************************/
   public getColumnNames(): string[]
   {
      if (this.hasHeaderRow)
      {
         return this.headerValues;
      }
      else
      {
         return this.headerLetters.map(l => `Column ${l}`);
      }
   }


   /***************************************************************************
    **
    ***************************************************************************/
   public getPreviewValues(columnIndex: number, fieldType?: QFieldType): string[]
   {
      if (columnIndex == undefined)
      {
         return [];
      }

      function getTypedValue(value: any): string
      {
         if (value == null)
         {
            return "";
         }

         //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
         // this was useful at one point in time when we had an object coming back for xlsx files with many different data types //
         // we'd see a .string attribute, which would have the value we'd want to show.  not using it now, but keep in case      //
         //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
         if (value && value.string)
         {
            switch (fieldType)
            {
               case QFieldType.BOOLEAN:
               {
                  return value.bool;
               }

               case QFieldType.STRING:
               case QFieldType.TEXT:
               case QFieldType.HTML:
               case QFieldType.PASSWORD:
               {
                  return value.string;
               }

               case QFieldType.INTEGER:
               case QFieldType.LONG:
               {
                  return value.integer;
               }
               case QFieldType.DECIMAL:
               {
                  return value.decimal;
               }
               case QFieldType.DATE:
               {
                  return value.date;
               }
               case QFieldType.TIME:
               {
                  return value.time;
               }
               case QFieldType.DATE_TIME:
               {
                  return value.dateTime;
               }
               case QFieldType.BLOB:
                  return ""; // !!
            }
         }

         return (`${value}`);
      }

      const valueArray: string[] = [];

      if (!this.hasHeaderRow)
      {
         const typedValue = getTypedValue(this.headerValues[columnIndex]);
         valueArray.push(typedValue == null ? "" : `${typedValue}`);
      }

      for (let value of this.bodyValuesPreview[columnIndex])
      {
         const typedValue = getTypedValue(value);
         valueArray.push(typedValue == null ? "" : `${typedValue}`);
      }

      return (valueArray);
   }
}


/***************************************************************************
 ** this (BulkLoadProfile & ...Field) is the model of what we save, and is
 ** also what we submit to the backend during the process.
 ***************************************************************************/
export class BulkLoadProfile
{
   version: string;
   fieldList: BulkLoadProfileField[] = [];
   hasHeaderRow: boolean;
   layout: string;
   isBulkEdit: boolean;
   keyFields: string;
}

type BulkLoadProfileField =
   {
      fieldName: string,
      columnIndex?: number,
      headerName?: string,
      defaultValue?: any,
      doValueMapping?: boolean,
      clearIfEmpty?: boolean,
      valueMappings?: { [fileValue: string]: any }
   };


/***************************************************************************
 ** In the bulk load forms, we have some forward-ref callback functions, and
 ** they like to capture/retain a reference when those functions get defined,
 ** so we had some trouble updating objects in those functions.
 **
 ** We "solved" this by creating instances of this class, which get captured,
 ** so then we can replace the wrapped object, and have a better time...
 ***************************************************************************/
export class Wrapper<T>
{
   t: T;

   /***************************************************************************
    **
    ***************************************************************************/
   constructor(t: T)
   {
      this.t = t;
   }


   /***************************************************************************
    **
    ***************************************************************************/
   public get(): T
   {
      return this.t;
   }


   /***************************************************************************
    **
    ***************************************************************************/
   public set(t: T)
   {
      this.t = t;
   }
}

