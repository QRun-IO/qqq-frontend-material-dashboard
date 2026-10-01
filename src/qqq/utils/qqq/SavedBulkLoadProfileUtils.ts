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

import {BulkLoadField, BulkLoadMapping, BulkLoadTableStructure, FileDescription} from "qqq/models/processes/BulkLoadModels";

type FieldMapping = { [name: string]: BulkLoadField }

/***************************************************************************
 ** Utillity methods for working with saved bulk load profiles.
 ***************************************************************************/
export class SavedBulkLoadProfileUtils
{
   /***************************************************************************
    **
    ***************************************************************************/
   private static diffFieldContents = (fileDescription: FileDescription, baseFieldsMap: FieldMapping, compareFieldsMap: FieldMapping, orderedFieldArray: BulkLoadField[]): string[] =>
   {
      const rs: string[] = [];

      for (let bulkLoadField of orderedFieldArray)
      {
         const fieldName = bulkLoadField.getQualifiedName()
         const compareField = compareFieldsMap[fieldName];
         const baseField = baseFieldsMap[fieldName];
         if(!compareField)
         {
            continue;
         }

         if (baseField)
         {
            if (baseField.valueType != compareField.valueType)
            {
               /////////////////////////////////////////////////////////////////
               // if we changed from a default value to a column, report that //
               /////////////////////////////////////////////////////////////////
               if (compareField.valueType == "column")
               {
                  const column = fileDescription.getColumnNames()[compareField.columnIndex];
                  rs.push(`Changed ${compareField.getQualifiedLabel()} from using a default value (${baseField.defaultValue}) to using a file column ${column ? `(${column})` : ""}`);
               }
               else if (compareField.valueType == "defaultValue")
               {
                  const column = fileDescription.getColumnNames()[baseField.columnIndex];
                  const value = compareField.defaultValue;
                  rs.push(`Changed ${compareField.getQualifiedLabel()} from using a file column (${column}) to using a default value ${value === undefined ? "" : `(${value})`}`);
               }
            }
            else if (baseField.valueType == compareField.valueType && baseField.valueType == "defaultValue")
            {
               //////////////////////////////////////////////////
               // if we changed the default value, report that //
               //////////////////////////////////////////////////
               if (baseField.defaultValue != compareField.defaultValue)
               {
                  const value = compareField.defaultValue;
                  rs.push(`Changed ${compareField.getQualifiedLabel()} default value from (${baseField.defaultValue}) to ${value === undefined ? "" : `(${value})`}`);
               }
            }
            else if (baseField.valueType == compareField.valueType && baseField.valueType == "column")
            {
               ///////////////////////////////////////////
               // if we changed the column, report that //
               ///////////////////////////////////////////
               let isDiff = false;
               if (fileDescription.hasHeaderRow)
               {
                  if (baseField.headerName != compareField.headerName)
                  {
                     isDiff = true;
                  }
               }
               else
               {
                  if (baseField.columnIndex != compareField.columnIndex)
                  {
                     isDiff = true;
                  }
               }

               if(isDiff)
               {
                  const baseColumn = fileDescription.getColumnNames()[baseField.columnIndex];
                  const compareColumn = fileDescription.getColumnNames()[compareField.columnIndex];
                  rs.push(`Changed ${compareField.getQualifiedLabel()} file column from ${baseColumn ? `(${baseColumn})` : "--"} to ${compareColumn ? `(${compareColumn})` : "--"}`);
               }

               /////////////////////////////////////////////////////////////////////////////////////////////////////
               // if the do-value-mapping field changed, report that (note, only if was and still is column-type) //
               /////////////////////////////////////////////////////////////////////////////////////////////////////
               if ((baseField.doValueMapping == true) != (compareField.doValueMapping == true))
               {
                  rs.push(`Changed ${compareField.getQualifiedLabel()} to ${compareField.doValueMapping ? "" : "not"} map values`);
               }
            }
         }
      }

      return (rs);
   };

   /***************************************************************************
    **
    ***************************************************************************/
   private static diffFieldSets = (baseFieldsMap: FieldMapping, compareFieldsMap: FieldMapping, messagePrefix: string, orderedFieldArray: BulkLoadField[]): string[] =>
   {
      const fieldLabels: string[] = [];

      for (let bulkLoadField of orderedFieldArray)
      {
         const fieldName = bulkLoadField.getQualifiedName()
         const compareField = compareFieldsMap[fieldName];
         if(!compareField)
         {
            continue;
         }

         ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
         // else - we're not checking for changes to individual fields - rather - we're just checking if fields were added or removed. //
         ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
         if (!baseFieldsMap[fieldName])
         {
            fieldLabels.push(compareField.getQualifiedLabel());
         }
      }

      if (fieldLabels.length)
      {
         const s = fieldLabels.length == 1 ? "" : "s";
         return ([`${messagePrefix} mapping${s} for ${fieldLabels.length} field${s}: ${fieldLabels.join(", ")}`]);
      }
      else
      {
         return ([]);
      }
   };


   /***************************************************************************
    **
    ***************************************************************************/
   private static getOrderedActiveFields(mapping: BulkLoadMapping): BulkLoadField[]
   {
      return [...(mapping.requiredFields ?? []), ...(mapping.additionalFields ?? [])]
   }


   /***************************************************************************
    **
    ***************************************************************************/
   private static extractUsedFieldMapFromMapping(mapping: BulkLoadMapping): FieldMapping
   {
      let rs: { [name: string]: BulkLoadField } = {};
      for (let bulkLoadField of this.getOrderedActiveFields(mapping))
      {
         rs[bulkLoadField.getQualifiedNameWithWideSuffix()] = bulkLoadField;
      }
      return (rs);
   }


   /***************************************************************************
    **
    ***************************************************************************/
   private static joinUpToN(values: string[], n: number)
   {
      if(values.length <= n)
      {
         return (values.join(", "));
      }

      const others = values.length - n;
      return (values.slice(0, n-1).join(", ") + ` and ${others} other${others == 1 ? "" : "s"}`);
   }


   /***************************************************************************
    **
    ***************************************************************************/
   private static diffFieldValueMappings(bulkLoadField: BulkLoadField, baseMapping: { [p: string]: any }, activeMapping: { [p: string]: any }): string
   {
      const addedMappings: string[] = [];
      const removedMappings: string[] = [];
      const changedMappings: string[] = [];

      /////////////////////////////
      // look for added mappings //
      /////////////////////////////
      for (let value of Object.keys(activeMapping))
      {
         if(!baseMapping[value])
         {
            addedMappings.push(value);
         }
      }

      ///////////////////////////////
      // look for removed mappings //
      ///////////////////////////////
      for (let value of Object.keys(baseMapping))
      {
         if(!activeMapping[value])
         {
            removedMappings.push(value);
         }
      }

      ///////////////////////////////
      // look for changed mappings //
      ///////////////////////////////
      for (let value of Object.keys(activeMapping))
      {
         if(baseMapping[value] && activeMapping[value] != baseMapping[value])
         {
            changedMappings.push(value);
         }
      }

      if(addedMappings.length || removedMappings.length || changedMappings.length)
      {
         let rs = `Updated value mapping for ${bulkLoadField.getQualifiedLabel()}: `
         const parts: string[] = [];

         if(addedMappings.length)
         {
            parts.push(`Added value${addedMappings.length == 1 ? "" : "s"} for: ${this.joinUpToN(addedMappings, 5)}`);
         }
         if(removedMappings.length)
         {
            parts.push(`Removed value${removedMappings.length == 1 ? "" : "s"} for: ${this.joinUpToN(removedMappings, 5)}`);
         }
         if(changedMappings.length)
         {
            parts.push(`Changed value${changedMappings.length == 1 ? "" : "s"} for: ${this.joinUpToN(changedMappings, 5)}`);
         }

         return rs + parts.join("; ");
      }

      return null;
   }


   /***************************************************************************
    **
    ***************************************************************************/
   public static diffBulkLoadMappings = (tableStructure: BulkLoadTableStructure, fileDescription: FileDescription, baseMapping: BulkLoadMapping, activeMapping: BulkLoadMapping): string[] =>
   {
      const diffs: string[] = [];

      const baseFieldsMap = this.extractUsedFieldMapFromMapping(baseMapping);
      const activeFieldsMap = this.extractUsedFieldMapFromMapping(activeMapping);

      const orderedBaseFields = this.getOrderedActiveFields(baseMapping);
      const orderedActiveFields = this.getOrderedActiveFields(activeMapping);

      ////////////////////////
      // header-level diffs //
      ////////////////////////
      if ((baseMapping.hasHeaderRow == true) != (activeMapping.hasHeaderRow == true))
      {
         diffs.push(`Changed does the file have a header row? from ${baseMapping.hasHeaderRow ? "Yes" : "No"} to ${activeMapping.hasHeaderRow ? "Yes" : "No"}`);
      }

      if (baseMapping.layout != activeMapping.layout)
      {
         const format = (layout: string) => (layout ?? " ").substring(0, 1) + (layout ?? " ").substring(1).toLowerCase();
         diffs.push(`Changed layout from ${format(baseMapping.layout)} to ${format(activeMapping.layout)}`);
      }

      ///////////////////////
      // field-level diffs //
      ///////////////////////
      // todo - keep sorted like screen is by ... idk, loop over fields in mapping first
      diffs.push(...this.diffFieldSets(baseFieldsMap, activeFieldsMap, "Added", orderedActiveFields));
      diffs.push(...this.diffFieldSets(activeFieldsMap, baseFieldsMap, "Removed", orderedBaseFields));
      diffs.push(...this.diffFieldContents(fileDescription, baseFieldsMap, activeFieldsMap, orderedActiveFields));

      for (let bulkLoadField of orderedActiveFields)
      {
         try
         {
            const fieldName = bulkLoadField.getQualifiedName() // todo - does this (and the others calls to this) need suffix?

            const valueMappingDiff = this.diffFieldValueMappings(bulkLoadField, baseMapping.valueMappings[fieldName] ?? {}, activeMapping.valueMappings[fieldName] ?? {});
            if(valueMappingDiff)
            {
               diffs.push(valueMappingDiff);
            }
         }
         catch(e)
         {
            console.log(`Error diffing profiles: ${e}`);
         }
      }

      return diffs;
   };

}