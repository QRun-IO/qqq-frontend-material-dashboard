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


import {QTableMetaData} from "@qrunio/qqq-frontend-core/lib/model/metaData/QTableMetaData";
import {QFilterCriteria} from "@qrunio/qqq-frontend-core/lib/model/query/QFilterCriteria";
import {QQueryFilter} from "@qrunio/qqq-frontend-core/lib/model/query/QQueryFilter";
import {validateCriteria} from "qqq/components/query/FilterCriteriaRow";
import QQueryColumns from "qqq/models/query/QQueryColumns";
import RecordQueryView from "qqq/models/query/RecordQueryView";
import FilterUtils from "qqq/utils/qqq/FilterUtils";
import TableUtils from "qqq/utils/qqq/TableUtils";

/*******************************************************************************
 ** Utility class for working with QQQ Saved Views
 **
 *******************************************************************************/
export class SavedViewUtils
{

   /*******************************************************************************
    **
    *******************************************************************************/
   public static fieldNameToLabel = (tableMetaData: QTableMetaData, fieldName: string): string =>
   {
      try
      {
         const [fieldMetaData, fieldTable] = TableUtils.getFieldAndTable(tableMetaData, fieldName);
         if (fieldTable.name != tableMetaData.name)
         {
            return (fieldTable.label + ": " + fieldMetaData.label);
         }

         return (fieldMetaData.label);
      }
      catch (e)
      {
         return (fieldName);
      }
   };


   /*******************************************************************************
    **
    *******************************************************************************/
   public static diffFilters = (tableMetaData: QTableMetaData, savedView: RecordQueryView, activeView: RecordQueryView, viewDiffs: string[]): void =>
   {
      try
      {
         ////////////////////////////////////////////////////////////////////////////////
         // inner helper function for reporting on the number of criteria for a field. //
         // e.g., will tell us "added criteria X" or "removed 2 criteria on Y"         //
         ////////////////////////////////////////////////////////////////////////////////
         const diffCriteriaFunction = (base: QQueryFilter, compare: QQueryFilter, messagePrefix: string, isCheckForChanged = false) =>
         {
            const baseCriteriaMap: { [name: string]: QFilterCriteria[] } = {};
            base?.criteria?.forEach((criteria) =>
            {
               if (validateCriteria(criteria).criteriaIsValid)
               {
                  if (!baseCriteriaMap[criteria.fieldName])
                  {
                     baseCriteriaMap[criteria.fieldName] = [];
                  }
                  baseCriteriaMap[criteria.fieldName].push(criteria);
               }
            });

            const compareCriteriaMap: { [name: string]: QFilterCriteria[] } = {};
            compare?.criteria?.forEach((criteria) =>
            {
               if (validateCriteria(criteria).criteriaIsValid)
               {
                  if (!compareCriteriaMap[criteria.fieldName])
                  {
                     compareCriteriaMap[criteria.fieldName] = [];
                  }
                  compareCriteriaMap[criteria.fieldName].push(criteria);
               }
            });

            for (let fieldName of Object.keys(compareCriteriaMap))
            {
               const noBaseCriteria = baseCriteriaMap[fieldName]?.length ?? 0;
               const noCompareCriteria = compareCriteriaMap[fieldName]?.length ?? 0;

               if (isCheckForChanged)
               {
                  /////////////////////////////////////////////////////////////////////////////////////////////
                  // first - if we're checking for changes to specific criteria (e.g., change id=5 to id<>5, //
                  // or change id=5 to id=6, or change id=5 to id<>7)                                        //
                  // our "sweet spot" is if there's a single criteria on each side of the check              //
                  /////////////////////////////////////////////////////////////////////////////////////////////
                  if (noBaseCriteria == 1 && noCompareCriteria == 1)
                  {
                     const baseCriteria = baseCriteriaMap[fieldName][0];
                     const compareCriteria = compareCriteriaMap[fieldName][0];
                     const baseValuesJSON = JSON.stringify(baseCriteria.values ?? []);
                     const compareValuesJSON = JSON.stringify(compareCriteria.values ?? []);
                     if (baseCriteria.operator != compareCriteria.operator || baseValuesJSON != compareValuesJSON)
                     {
                        viewDiffs.push(`Changed a filter from ${FilterUtils.criteriaToHumanString(tableMetaData, baseCriteria)} to ${FilterUtils.criteriaToHumanString(tableMetaData, compareCriteria)}`);
                     }
                  }
                  else if (noBaseCriteria == noCompareCriteria)
                  {
                     ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                     // else - if the number of criteria on this field differs, that'll get caught in a non-isCheckForChanged call, so                                     //
                     // todo, i guess - this is kinda weak - but if there's the same number of criteria on a field, then just ... do a shitty JSON compare between them... //
                     ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                     const baseJSON = JSON.stringify(baseCriteriaMap[fieldName]);
                     const compareJSON = JSON.stringify(compareCriteriaMap[fieldName]);
                     if (baseJSON != compareJSON)
                     {
                        viewDiffs.push(`${messagePrefix} 1 or more filters on ${SavedViewUtils.fieldNameToLabel(tableMetaData, fieldName)}`);
                     }
                  }
               }
               else
               {
                  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                  // else - we're not checking for changes to individual criteria - rather - we're just checking if criteria were added or removed. //
                  // we'll do that by starting to see if the nubmer of criteria is different.                                                       //
                  // and, only do it in only 1 direction, assuming we'll get called twice, with the base & compare sides flipped                    //
                  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                  if (noBaseCriteria < noCompareCriteria)
                  {
                     if (noBaseCriteria == 0 && noCompareCriteria == 1)
                     {
                        //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                        // if the difference is 0 to 1 (1 to 0 when called in reverse), then we can report the full criteria that was added/removed //
                        //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                        viewDiffs.push(`${messagePrefix} filter: ${FilterUtils.criteriaToHumanString(tableMetaData, compareCriteriaMap[fieldName][0])}`);
                     }
                     else
                     {
                        //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                        // else, say 0 to 2, or 2 to 1 - just report on how many were changed...                                                //
                        // todo this isn't great, as you might have had, say, (A,B), and now you have (C) - but all we'll say is "removed 1"... //
                        //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                        const noDiffs = noCompareCriteria - noBaseCriteria;
                        viewDiffs.push(`${messagePrefix} ${noDiffs} filters on ${SavedViewUtils.fieldNameToLabel(tableMetaData, fieldName)}`);
                     }
                  }
               }
            }
         };

         diffCriteriaFunction(savedView.queryFilter, activeView.queryFilter, "Added");
         diffCriteriaFunction(activeView.queryFilter, savedView.queryFilter, "Removed");
         diffCriteriaFunction(savedView.queryFilter, activeView.queryFilter, "Changed", true);

         //////////////////////
         // boolean operator //
         //////////////////////
         if (savedView.queryFilter.booleanOperator != activeView.queryFilter.booleanOperator)
         {
            viewDiffs.push("Changed filter from 'And' to 'Or'");
         }

         ///////////////
         // order-bys //
         ///////////////
         const savedOrderBys = savedView.queryFilter.orderBys;
         const activeOrderBys = activeView.queryFilter.orderBys;
         if (savedOrderBys.length != activeOrderBys.length)
         {
            viewDiffs.push("Changed sort");
         }
         else if (savedOrderBys.length > 0)
         {
            const toWord = ((b: boolean) => b ? "ascending" : "descending");
            if (savedOrderBys[0].fieldName != activeOrderBys[0].fieldName && savedOrderBys[0].isAscending != activeOrderBys[0].isAscending)
            {
               viewDiffs.push(`Changed sort from ${SavedViewUtils.fieldNameToLabel(tableMetaData, savedOrderBys[0].fieldName)} ${toWord(savedOrderBys[0].isAscending)} to ${SavedViewUtils.fieldNameToLabel(tableMetaData, activeOrderBys[0].fieldName)} ${toWord(activeOrderBys[0].isAscending)}`);
            }
            else if (savedOrderBys[0].fieldName != activeOrderBys[0].fieldName)
            {
               viewDiffs.push(`Changed sort field from ${SavedViewUtils.fieldNameToLabel(tableMetaData, savedOrderBys[0].fieldName)} to ${SavedViewUtils.fieldNameToLabel(tableMetaData, activeOrderBys[0].fieldName)}`);
            }
            else if (savedOrderBys[0].isAscending != activeOrderBys[0].isAscending)
            {
               viewDiffs.push(`Changed sort direction from ${toWord(savedOrderBys[0].isAscending)} to ${toWord(activeOrderBys[0].isAscending)}`);
            }
         }
      }
      catch (e)
      {
         console.log(`Error looking for differences in filters ${e}`);
      }
   };


   /*******************************************************************************
    **
    *******************************************************************************/
   public static diffColumns = (tableMetaData: QTableMetaData, savedView: RecordQueryView, activeView: RecordQueryView, viewDiffs: string[]): void =>
   {
      try
      {
         if (!savedView.queryColumns || !savedView.queryColumns.columns || savedView.queryColumns.columns.length == 0)
         {
            viewDiffs.push("This view did not previously have columns saved with it, so the next time you save it they will be initialized.");
            return;
         }

         ////////////////////////////////////////////////////////////
         // nested function to help diff visible status of columns //
         ////////////////////////////////////////////////////////////
         const diffVisibilityFunction = (base: QQueryColumns, compare: QQueryColumns, messagePrefix: string) =>
         {
            const baseColumnsMap: { [name: string]: boolean } = {};
            base.columns.forEach((column) =>
            {
               if (column.isVisible)
               {
                  baseColumnsMap[column.name] = true;
               }
            });

            const diffFields: string[] = [];
            for (let i = 0; i < compare.columns.length; i++)
            {
               const column = compare.columns[i];
               if (column.isVisible)
               {
                  if (!baseColumnsMap[column.name])
                  {
                     diffFields.push(SavedViewUtils.fieldNameToLabel(tableMetaData, column.name));
                  }
               }
            }

            if (diffFields.length > 0)
            {
               if (diffFields.length > 5)
               {
                  viewDiffs.push(`${messagePrefix} ${diffFields.length} columns.`);
               }
               else
               {
                  viewDiffs.push(`${messagePrefix} column${diffFields.length == 1 ? "" : "s"}: ${diffFields.join(", ")}`);
               }
            }
         };

         ///////////////////////////////////////////////////////////
         // nested function to help diff pinned status of columns //
         ///////////////////////////////////////////////////////////
         const diffPinsFunction = (base: QQueryColumns, compare: QQueryColumns, messagePrefix: string) =>
         {
            const baseColumnsMap: { [name: string]: string } = {};
            base.columns.forEach((column) => baseColumnsMap[column.name] = column.pinned);

            const diffFields: string[] = [];
            for (let i = 0; i < compare.columns.length; i++)
            {
               const column = compare.columns[i];
               if (baseColumnsMap[column.name] != column.pinned)
               {
                  diffFields.push(SavedViewUtils.fieldNameToLabel(tableMetaData, column.name));
               }
            }

            if (diffFields.length > 0)
            {
               if (diffFields.length > 5)
               {
                  viewDiffs.push(`${messagePrefix} ${diffFields.length} columns.`);
               }
               else
               {
                  viewDiffs.push(`${messagePrefix} column${diffFields.length == 1 ? "" : "s"}: ${diffFields.join(", ")}`);
               }
            }
         };

         ///////////////////////////////////////////////////
         // nested function to help diff width of columns //
         ///////////////////////////////////////////////////
         const diffWidthsFunction = (base: QQueryColumns, compare: QQueryColumns, messagePrefix: string) =>
         {
            const baseColumnsMap: { [name: string]: number } = {};
            base.columns.forEach((column) => baseColumnsMap[column.name] = column.width);

            const diffFields: string[] = [];
            for (let i = 0; i < compare.columns.length; i++)
            {
               const column = compare.columns[i];
               if (baseColumnsMap[column.name] != column.width)
               {
                  diffFields.push(SavedViewUtils.fieldNameToLabel(tableMetaData, column.name));
               }
            }

            if (diffFields.length > 0)
            {
               if (diffFields.length > 5)
               {
                  viewDiffs.push(`${messagePrefix} ${diffFields.length} columns.`);
               }
               else
               {
                  viewDiffs.push(`${messagePrefix} column${diffFields.length == 1 ? "" : "s"}: ${diffFields.join(", ")}`);
               }
            }
         };

         diffVisibilityFunction(savedView.queryColumns, activeView.queryColumns, "Turned on ");
         diffVisibilityFunction(activeView.queryColumns, savedView.queryColumns, "Turned off ");
         diffPinsFunction(savedView.queryColumns, activeView.queryColumns, "Changed pinned state for ");

         if (savedView.queryColumns.columns.map(c => c.name).join(",") != activeView.queryColumns.columns.map(c => c.name).join(","))
         {
            viewDiffs.push("Changed the order of columns.");
         }

         diffWidthsFunction(savedView.queryColumns, activeView.queryColumns, "Changed width for ");
      }
      catch (e)
      {
         console.log(`Error looking for differences in columns: ${e}`);
      }
   };

   /*******************************************************************************
    **
    *******************************************************************************/
   public static diffQuickFilterFieldNames = (tableMetaData: QTableMetaData, savedView: RecordQueryView, activeView: RecordQueryView, viewDiffs: string[]): void =>
   {
      try
      {
         const diffFunction = (base: string[], compare: string[], messagePrefix: string) =>
         {
            const baseFieldNameMap: { [name: string]: boolean } = {};
            base.forEach((name) => baseFieldNameMap[name] = true);
            const diffFields: string[] = [];
            for (let i = 0; i < compare.length; i++)
            {
               const name = compare[i];
               if (!baseFieldNameMap[name])
               {
                  diffFields.push(SavedViewUtils.fieldNameToLabel(tableMetaData, name));
               }
            }

            if (diffFields.length > 0)
            {
               viewDiffs.push(`${messagePrefix} basic filter${diffFields.length == 1 ? "" : "s"}: ${diffFields.join(", ")}`);
            }
         };

         diffFunction(savedView.quickFilterFieldNames, activeView.quickFilterFieldNames, "Turned on");
         diffFunction(activeView.quickFilterFieldNames, savedView.quickFilterFieldNames, "Turned off");
      }
      catch (e)
      {
         console.log(`Error looking for differences in quick filter field names: ${e}`);
      }
   };


   /*******************************************************************************
    **
    *******************************************************************************/
   public static diffViews = (tableMetaData: QTableMetaData, baseView: RecordQueryView, activeView: RecordQueryView): string[] =>
   {
      const viewDiffs: string[] = [];

      SavedViewUtils.diffFilters(tableMetaData, baseView, activeView, viewDiffs);
      SavedViewUtils.diffColumns(tableMetaData, baseView, activeView, viewDiffs);
      SavedViewUtils.diffQuickFilterFieldNames(tableMetaData, baseView, activeView, viewDiffs);

      if (baseView.mode != activeView.mode)
      {
         if (baseView.mode)
         {
            viewDiffs.push(`Mode changed from ${baseView.mode} to ${activeView.mode}`);
         }
         else
         {
            viewDiffs.push(`Mode set to ${activeView.mode}`);
         }
      }

      if (baseView.rowsPerPage != activeView.rowsPerPage)
      {
         if (baseView.rowsPerPage)
         {
            viewDiffs.push(`Rows per page changed from ${baseView.rowsPerPage} to ${activeView.rowsPerPage}`);
         }
         else
         {
            viewDiffs.push(`Rows per page set to ${activeView.rowsPerPage}`);
         }
      }
      return viewDiffs;
   };

}
