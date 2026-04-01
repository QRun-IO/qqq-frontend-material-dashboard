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

import {QFieldMetaData} from "@qrunio/qqq-frontend-core/lib/model/metaData/QFieldMetaData";
import {QTableMetaData} from "@qrunio/qqq-frontend-core/lib/model/metaData/QTableMetaData";
import {QTableSection} from "@qrunio/qqq-frontend-core/lib/model/metaData/QTableSection";
import {QueryJoin} from "@qrunio/qqq-frontend-core/lib/model/query/QueryJoin";

/*******************************************************************************
 ** Utility class for working with QQQ Tables
 **
 *******************************************************************************/
class TableUtils
{

   /*******************************************************************************
    ** For a table, return a sub-set of sections (originally meant for display in
    ** the record-screen sidebars)
    **
    ** If the table has no sections, one big "all fields" section is created.
    **
    ** a list of "allowed field names" may be given, in which case, a section is only
    ** included if it has a field in that list.  e.g., an edit-screen, where disabled
    ** fields aren't to be shown - if a section only has disabled fields, don't include it.
    **
    ** By default sections w/ widget names are excluded -- but -- to include them,
    ** provide the metaData plus list of allowedWidgetTypes.
    *******************************************************************************/
   public static getSectionsForRecordSidebar(tableMetaData: QTableMetaData, allowedFieldNames: any = null, additionalInclusionPredicate?: (section: QTableSection) => boolean, alternativeType?: string): QTableSection[]
   {
      /////////////////////////////////////////////////////////////////
      // if the table has sections, then filter them and return some //
      /////////////////////////////////////////////////////////////////
      if (tableMetaData.sections)
      {
         //////////////////////////////////////////////////////////////////////////////////////////////
         // if there are filters (a list of allowed field names, or an additionalInclusionPredicate, //
         // then only return a subset of sections matching the filters                               //
         //////////////////////////////////////////////////////////////////////////////////////////////
         if (allowedFieldNames || additionalInclusionPredicate)
         {
            ////////////////////////////////////////////////////////////////
            // put the field names in a set, for better inclusion testing //
            ////////////////////////////////////////////////////////////////
            const allowedFieldNameSet = new Set<string>();
            if(allowedFieldNames)
            {
               allowedFieldNames.forEach((k: string) => allowedFieldNameSet.add(k));
            }

            ///////////////////////////////////////////////////////////////////////////////
            // loop over the sections, deciding which ones to include in the return list //
            ///////////////////////////////////////////////////////////////////////////////
            const allowedSections: QTableSection[] = [];
            for (let i = 0; i < tableMetaData.sections.length; i++)
            {
               let section = tableMetaData.sections[i];
               if(alternativeType && section.alternatives?.has(alternativeType))
               {
                  section = section.alternatives.get(alternativeType);
               }

               let includeSection = false;

               for (let j = 0; j < section.fieldNames?.length; j++)
               {
                  if (allowedFieldNameSet.has(section.fieldNames[j]))
                  {
                     includeSection = true;
                     break;
                  }
               }

               if (additionalInclusionPredicate && additionalInclusionPredicate(section))
               {
                  includeSection = true;
               }

               if(includeSection)
               {
                  allowedSections.push(section);
               }
            }

            return (allowedSections);
         }

         ////////////////////////////////////////////////////////////////
         // if there are no filters to apply, then return all sections //
         // (potentially mapped to an alternative, by the type)        //
         ////////////////////////////////////////////////////////////////
         return (tableMetaData.sections.map((section) => section.alternatives?.get(alternativeType) ?? section));
      }

      ///////////////////////////////////////////////////////////////////////////////////////////////
      // else, if the table had no sections, then make a pseudo-one with either all of the fields, //
      // or a subset based on the allowedFieldNames                                                //
      ///////////////////////////////////////////////////////////////////////////////////////////////
      let fieldNames = [...tableMetaData.fields.keys()];
      if (allowedFieldNames)
      {
         fieldNames = [];
         for (const fieldName in tableMetaData.fields.keys())
         {
            if (allowedFieldNames[fieldName])
            {
               fieldNames.push(fieldName);
            }
         }
      }

      return ([new QTableSection({
         iconName: "description", label: "All Fields", name: "allFields", fieldNames: [...fieldNames],
      })]);
   }


   /*******************************************************************************
    **
    *******************************************************************************/
   public static getFieldAndTable(tableMetaData: QTableMetaData, fieldName: string): [QFieldMetaData, QTableMetaData]
   {
      if(!fieldName)
      {
         return [null, null];
      }

      if (fieldName.indexOf(".") > -1)
      {
         const nameParts = fieldName.split(".", 2);
         for (let i = 0; i < tableMetaData?.exposedJoins?.length; i++)
         {
            const join = tableMetaData?.exposedJoins[i];
            if (join?.joinTable.name == nameParts[0])
            {
               return ([this.getFieldOrVirtualField(join.joinTable, nameParts[1]), join.joinTable]);
            }
         }
      }
      else
      {
         return ([this.getFieldOrVirtualField(tableMetaData, fieldName), tableMetaData]);
      }

      return [null, null];
   }


   /***************************************************************************
    *
    ***************************************************************************/
   private static getFieldOrVirtualField(tableMetaData: QTableMetaData, fieldName: string): QFieldMetaData
   {
      if(!fieldName)
      {
         return null;
      }

      if(tableMetaData.fields.has(fieldName))
      {
         return tableMetaData.fields.get(fieldName);
      }

      if(tableMetaData.virtualFields?.has(fieldName))
      {
         return tableMetaData.virtualFields.get(fieldName);
      }

      return (null);
   }


   /*******************************************************************************
    ** for a field that might be from a join table, get its label - either the field's
    ** label, if it's from "this" table - or the table's label: field's label, if it's
    ** from a join table.
    *******************************************************************************/
   public static getFieldFullLabel(tableMetaData: QTableMetaData, fieldName: string): string
   {
      try
      {
         const [field, fieldTable] = TableUtils.getFieldAndTable(tableMetaData, fieldName);
         if (fieldTable.name == tableMetaData.name)
         {
            return (field.label);
         }
         return `${fieldTable.label}: ${field.label}`;
      }
      catch (e)
      {
         console.log(`Error getting full field label for ${fieldName} in table ${tableMetaData?.name}: ${e}`);
         return fieldName;
      }
   }


   /*******************************************************************************
    **
    *******************************************************************************/
   public static getQueryJoins(tableMetaData: QTableMetaData, visibleJoinTables: Set<string>): QueryJoin[]
   {
      const queryJoins = [];
      for (let i = 0; i < tableMetaData.exposedJoins.length; i++)
      {
         const join = tableMetaData.exposedJoins[i];
         if (visibleJoinTables.has(join.joinTable.name))
         {
            let joinName = null;
            if (join.joinPath && join.joinPath.length == 1 && join.joinPath[0].name)
            {
               joinName = join.joinPath[0].name;
            }
            //////////////////////////////////////////////////////////////////////////////////////////////////////////////
            // todo - what about a join with a longer path?  it would be nice to pass such joinNames through there too, //
            // but what, that would actually be multiple queryJoins?  needs a fair amount of thought.                   //
            //////////////////////////////////////////////////////////////////////////////////////////////////////////////
            queryJoins.push(new QueryJoin(join.joinTable.name, true, "LEFT", null, null, joinName));
         }
      }

      return queryJoins;
   }




   /*******************************************************************************
    ** For a table, get the set of join table names that are visible in any
    ** non-hidden section's field list.
    *******************************************************************************/
   public static getVisibleJoinTables(tableMetaData: QTableMetaData): Set<string>
   {
      const visibleJoinTables = new Set<string>();

      for (let i = 0; i < tableMetaData?.sections.length; i++)
      {
         const section = tableMetaData?.sections[i];
         if (section.isHidden || !section.fieldNames || !section.fieldNames.length)
         {
            continue;
         }

         section.fieldNames.forEach((fieldName) =>
         {
            const [field, tableForField] = TableUtils.getFieldAndTable(tableMetaData, fieldName);
            if (tableForField && tableForField.name != tableMetaData.name)
            {
               visibleJoinTables.add(tableForField.name);
            }
         });
      }

      return (visibleJoinTables);
   }

}

export default TableUtils;
