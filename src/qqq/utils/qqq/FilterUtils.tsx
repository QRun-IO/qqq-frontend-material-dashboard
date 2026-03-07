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
import {GridSortModel} from "@mui/x-data-grid-pro";
import {QController} from "@qrunio/qqq-frontend-core/lib/controllers/QController";
import {QFieldMetaData} from "@qrunio/qqq-frontend-core/lib/model/metaData/QFieldMetaData";
import {QFieldType} from "@qrunio/qqq-frontend-core/lib/model/metaData/QFieldType";
import {QTableMetaData} from "@qrunio/qqq-frontend-core/lib/model/metaData/QTableMetaData";
import {QPossibleValue} from "@qrunio/qqq-frontend-core/lib/model/QPossibleValue";
import {FieldFunction} from "@qrunio/qqq-frontend-core/lib/model/query/FieldFunction";
import {FilterVariableExpression} from "@qrunio/qqq-frontend-core/lib/model/query/FilterVariableExpression";
import {NowExpression} from "@qrunio/qqq-frontend-core/lib/model/query/NowExpression";
import {NowWithOffsetExpression} from "@qrunio/qqq-frontend-core/lib/model/query/NowWithOffsetExpression";
import {QCriteriaOperator} from "@qrunio/qqq-frontend-core/lib/model/query/QCriteriaOperator";
import {QFilterCriteria} from "@qrunio/qqq-frontend-core/lib/model/query/QFilterCriteria";
import {QFilterOrderBy} from "@qrunio/qqq-frontend-core/lib/model/query/QFilterOrderBy";
import {QQueryFilter} from "@qrunio/qqq-frontend-core/lib/model/query/QQueryFilter";
import {ThisOrLastPeriodExpression} from "@qrunio/qqq-frontend-core/lib/model/query/ThisOrLastPeriodExpression";
import DynamicFormUtils from "qqq/components/forms/DynamicFormUtils";
import {validateCriteria} from "qqq/components/query/FilterCriteriaRow";
import TableUtils from "qqq/utils/qqq/TableUtils";
import ValueUtils from "qqq/utils/qqq/ValueUtils";
import {GetDisplayValuesFunction} from "qqq/utils/usePossibleValueLabels";

/*******************************************************************************
 ** Utility class for working with QQQ Filters
 **
 *******************************************************************************/
class FilterUtils
{

   /*******************************************************************************
    ** Helper method - take a list of values, which may be possible values, and
    ** either return the original list, or a new list that is just the ids of the
    ** possible values (if it was a list of possible values).
    **
    ** Or, if the values are date-times, convert them to UTC.
    *******************************************************************************/
   public static cleanseCriteriaValueForQQQ = (param: any[], fieldMetaData: QFieldMetaData): number[] | string[] =>
   {
      if (param === null || param === undefined)
      {
         return (param);
      }

      if (FilterUtils.gridCriteriaValueToExpression(param))
      {
         return (param);
      }

      let rs = [];
      for (let i = 0; i < param.length; i++)
      {
         if (param[i] && param[i].id && param[i].label)
         {
            /////////////////////////////////////////////////////////////
            // if the param looks like a possible value, return its id //
            /////////////////////////////////////////////////////////////
            rs.push(param[i].id);
         }
         else
         {
            if (fieldMetaData?.type == QFieldType.DATE_TIME)
            {
               try
               {
                  let toPush = ValueUtils.frontendLocalZoneDateTimeStringToUTCStringForBackend(param[i]);
                  rs.push(toPush);
               }
               catch (e)
               {
                  console.log("Error converting date-time to UTC: ", e);
                  rs.push(param[i]);
               }
            }
            else
            {
               rs.push(param[i]);
            }
         }
      }
      return (rs);
   };


   /*******************************************************************************
    *
    * The `getDisplayValues` parameter is an optional function from the
    * usePossibleValueLabels hook - which is encouraged to be given, to avoid
    * unnecessary backend calls (as it internally caches possible value lookups).
    * If it is not given, the functionality remains the same - but the same backend
    * call can be made multiple times.
    *******************************************************************************/
   public static async cleanupValuesInFilerFromQueryString(qController: QController, tableMetaData: QTableMetaData, queryFilter: QQueryFilter, getDisplayValues?: GetDisplayValuesFunction)
   {
      for (let i = 0; i < queryFilter?.criteria?.length; i++)
      {
         const criteria = queryFilter.criteria[i];
         let [field, fieldTable] = TableUtils.getFieldAndTable(tableMetaData, criteria.fieldName);

         if (!field)
         {
            console.warn(`Field ${criteria.fieldName} not found in tableMetaData - unable to clean up values for it..`);
            return;
         }

         let values = criteria.values;
         let hasFilterVariable = false;

         if (field.possibleValueSourceName)
         {
            //////////////////////////////////////////////////////////////////////////////////
            // possible-values in query-string are expected to only be their id values.     //
            // e.g., ...values=[1]...                                                       //
            // but we need them to be possibleValue objects (w/ id & label) so the label    //
            // can be shown in the filter dropdown.  So, make backend call to look them up. //
            // also, there are cases where we can get a null or "" as the only value in the //
            // values array - avoid sending that to the backend, as it comes back w/ all    //
            // possible values, and a general "bad time"                                    //
            //////////////////////////////////////////////////////////////////////////////////
            if (values && values.length > 0 && values[0] !== null && values[0] !== undefined && values[0] !== "")
            {
               ////////////////////////////////////////////////////////////////////////
               // do not do this lookup if the field is a filter variable expression //
               ////////////////////////////////////////////////////////////////////////
               if (values[0].type && values[0].type == "FilterVariableExpression")
               {
                  hasFilterVariable = true;
               }
               else
               {
                  if(getDisplayValues)
                  {
                     ///////////////////////////////////////////////////////////////////////////////////
                     // if we have a getDisplayValues function-from the hook, use it to look up the   //
                     // labels note - we must convert q QFieldMetaData (field) to a                   //
                     // DynamicFormFieldDefinition (dynamicField) and add possible value props to it. //
                     ///////////////////////////////////////////////////////////////////////////////////
                     const dynamicField = DynamicFormUtils.getDynamicField(field);
                     DynamicFormUtils.addPossibleValuePropsToSingleField(dynamicField, field, fieldTable.name, null, null);

                     const displayValuesMap = await getDisplayValues(dynamicField, values);

                     //////////////////////////////////////////////////////////////////////////////////////
                     // this function returns an array of display values (labels) - but the code below   //
                     // expects an array of possible values (objects with id & label) - so convert them. //
                     //////////////////////////////////////////////////////////////////////////////////////
                     const possibleValuesArray: QPossibleValue[] = [];
                     for (let value of values)
                     {
                        possibleValuesArray.push(new QPossibleValue({id: value, label: displayValuesMap[value] ?? value}));
                     }
                     values = possibleValuesArray;
                  }
                  else
                  {
                     values = await qController.possibleValues(fieldTable.name, null, field.name, "", values, undefined, undefined, "filter");
                  }
               }
            }

            ////////////////////////////////////////////
            // log message if no values were returned //
            ////////////////////////////////////////////
            if (!values || values.length === 0)
            {
               console.warn("WARNING: No possible values were returned for [" + field.possibleValueSourceName + "] for values [" + criteria.values + "].");
            }
         }

         if (values && values.length)
         {
            const fieldFunctionName = criteria?.fieldFunction?.functionTypeIdentifierName;

            for (let i = 0; i < values.length; i++)
            {
               //////////////////////////////////////////////////////////////////////////
               // replace objects that look like expressions with expression instances //
               //////////////////////////////////////////////////////////////////////////
               const expression = this.gridCriteriaValueToExpression(values[i]);
               if (expression)
               {
                  values[i] = expression;
               }
               else
               {
                  if (fieldFunctionName == "WeekdayOfDate" || fieldFunctionName == "WeekdayOfDateTime")
                  {
                     ////////////////////////////////////////////////////////////////////////////////////////////
                     // for weekday-of functions, make PVS's out of the values (in case they're just the ints) //
                     ////////////////////////////////////////////////////////////////////////////////////////////
                     if(values[i] != null && values[i] != undefined && !values[i].label)
                     {
                        values[i] = this.getWeekdayPossibleValue(values[i]);
                     }
                  }
                  else if (field.type == QFieldType.DATE_TIME)
                  {
                     ///////////////////////////////////////////
                     // make date-times work for the frontend //
                     ///////////////////////////////////////////
                     values[i] = ValueUtils.formatDateTimeValueForForm(values[i]);
                  }
               }
            }
         }

         criteria.values = values;
      }

      ////////////////////////////////////////////////
      // recursively clean values in any subfilters //
      ////////////////////////////////////////////////
      for (let j = 0; j < queryFilter?.subFilters?.length; j++)
      {
         await FilterUtils.cleanupValuesInFilerFromQueryString(qController, tableMetaData, queryFilter.subFilters[j]);
      }
   }


   /***************************************************************************
    *
    ***************************************************************************/
   public static getWeekdayPossibleValue(dayNo: number): QPossibleValue | null
   {
      return this.getWeekdayPossibleValues().filter(pv => pv.id == dayNo)[0] ?? null;
   }


   /***************************************************************************
    *
    ***************************************************************************/
   public static getWeekdayPossibleValues(): QPossibleValue[]
   {
      const allDays: QPossibleValue[] = [
         new QPossibleValue({id: 1, label: "Monday"}),
         new QPossibleValue({id: 2, label: "Tuesday"}),
         new QPossibleValue({id: 3, label: "Wednesday"}),
         new QPossibleValue({id: 4, label: "Thursday"}),
         new QPossibleValue({id: 5, label: "Friday"}),
         new QPossibleValue({id: 6, label: "Saturday"}),
         new QPossibleValue({id: 7, label: "Sunday"}),
      ];

      ////////////////////////////////////////////////////////////////////////////
      // determine the locale's first day of week to order the list accordingly //
      ////////////////////////////////////////////////////////////////////////////
      let firstDay = 7; // default to Sunday
      try
      {
         const locale = new Intl.Locale(navigator.language) as any;
         const weekInfo = typeof locale.getWeekInfo === "function" ? locale.getWeekInfo() : locale.weekInfo;
         if (weekInfo?.firstDay)
         {
            firstDay = weekInfo.firstDay;
         }
      }
      catch (e)
      {
         // fall back to Sunday-first
      }

      const startIndex = firstDay - 1;
      return [...allDays.slice(startIndex), ...allDays.slice(0, startIndex)];
   }


   /*******************************************************************************
    ** given a table, and a field name (which may be prefixed with an exposed-join
    ** table name (from the table) - return the corresponding field-meta-data, and
    ** the table that the field is from (e.g., may be a join table!)
    *******************************************************************************/
   public static getField(tableMetaData: QTableMetaData, fieldName: string): [QFieldMetaData, QTableMetaData]
   {
      if (fieldName == null)
      {
         return ([null, null]);
      }

      if (fieldName.indexOf(".") > -1)
      {
         let parts = fieldName.split(".", 2);
         if (tableMetaData.exposedJoins && tableMetaData.exposedJoins.length)
         {
            for (let i = 0; i < tableMetaData.exposedJoins.length; i++)
            {
               const joinTable = tableMetaData.exposedJoins[i].joinTable;
               if (joinTable.name == parts[0])
               {
                  return ([this.getFieldOrVirtualField(joinTable, parts[1]), joinTable]);
               }
            }
         }

         console.log(`Failed to find join field: ${fieldName}`);
         return ([null, null]);
      }
      else
      {
         return ([this.getFieldOrVirtualField(tableMetaData, fieldName), tableMetaData]);
      }
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
    **
    *******************************************************************************/
   public static gridCriteriaValueToExpression(value: any)
   {
      if (value && value.length)
      {
         value = value[0];
      }

      if (value && value.type)
      {
         if (value.type == "NowWithOffset")
         {
            return (new NowWithOffsetExpression(value));
         }
         else if (value.type == "Now")
         {
            return (new NowExpression(value));
         }
         else if (value.type == "ThisOrLastPeriod")
         {
            return (new ThisOrLastPeriodExpression(value));
         }
         else if (value.type == "FilterVariableExpression")
         {
            return (new FilterVariableExpression(value));
         }
      }

      return (null);
   }


   /*******************************************************************************
    ** edit the input filter object, replacing any values which have {id,label} attributes
    ** to instead just have the id part.
    *******************************************************************************/
   public static convertFilterPossibleValuesToIds(inputFilter: QQueryFilter): QQueryFilter
   {
      const filter = Object.assign({}, inputFilter);

      if (filter.criteria)
      {
         for (let i = 0; i < filter.criteria.length; i++)
         {
            const criteria = filter.criteria[i];
            if (criteria.values)
            {
               for (let j = 0; j < criteria.values.length; j++)
               {
                  let value = criteria.values[j];
                  if (value && value.id && value.label)
                  {
                     criteria.values[j] = value.id;
                  }
               }
            }
         }
      }

      return (filter);
   }


   /*******************************************************************************
    **
    *******************************************************************************/
   public static canFilterWorkAsBasic(tableMetaData: QTableMetaData, filter: QQueryFilter): { canFilterWorkAsBasic: boolean; canFilterWorkAsAdvanced: boolean, reasonsWhyItCannot?: string[] }
   {
      const reasonsWhyItCannot: string[] = [];

      if (filter == null)
      {
         return ({canFilterWorkAsBasic: true, canFilterWorkAsAdvanced: true});
      }

      if (filter.booleanOperator == "OR")
      {
         reasonsWhyItCannot.push("Filter uses the 'OR' operator.");
      }

      if (filter.subFilters?.length > 0)
      {
         reasonsWhyItCannot.push("Filter contains sub-filters.");
         return ({canFilterWorkAsBasic: false, canFilterWorkAsAdvanced: false, reasonsWhyItCannot: reasonsWhyItCannot});
      }

      if (filter.criteria)
      {
         const usedFields: { [name: string]: boolean } = {};
         const warnedFields: { [name: string]: boolean } = {};
         for (let i = 0; i < filter.criteria.length; i++)
         {
            const criteriaName = filter.criteria[i].fieldName;
            if (!criteriaName)
            {
               continue;
            }

            if (usedFields[criteriaName])
            {
               if (!warnedFields[criteriaName])
               {
                  const [field, tableForField] = TableUtils.getFieldAndTable(tableMetaData, criteriaName);
                  let fieldLabel = field.label;
                  if (tableForField.name != tableMetaData.name)
                  {
                     let fieldLabel = `${tableForField.label}: ${field.label}`;
                  }
                  reasonsWhyItCannot.push(`Filter contains more than 1 condition for the field: ${fieldLabel}`);
                  warnedFields[criteriaName] = true;
               }
            }
            usedFields[criteriaName] = true;
         }
      }

      if (reasonsWhyItCannot.length == 0)
      {
         return ({canFilterWorkAsBasic: true, canFilterWorkAsAdvanced: true});
      }
      else
      {
         return ({canFilterWorkAsBasic: false, canFilterWorkAsAdvanced: true, reasonsWhyItCannot: reasonsWhyItCannot});
      }
   }

   /*******************************************************************************
    ** get the values associated with a criteria as a string, e.g., for showing
    ** in a tooltip.
    *******************************************************************************/
   public static getValuesString(fieldMetaData: QFieldMetaData, criteria: QFilterCriteria, maxValuesToShow: number = 3, andMoreFormat: "andNOther" | "+N" = "andNOther"): string
   {
      let valuesString = "";

      if (criteria.operator == QCriteriaOperator.IS_BLANK || criteria.operator == QCriteriaOperator.IS_NOT_BLANK)
      {
         ///////////////////////////////////////////////
         // we don't want values for these operators. //
         ///////////////////////////////////////////////
         return valuesString;
      }

      if (criteria.values && criteria.values.length)
      {
         let labels = [] as string[];

         let maxLoops = criteria.values.length;
         if (maxLoops > (maxValuesToShow + 2))
         {
            maxLoops = maxValuesToShow;
         }
         else if (maxValuesToShow == 1 && criteria.values.length > 1)
         {
            maxLoops = 1;
         }

         for (let i = 0; i < maxLoops; i++)
         {
            const value = criteria.values[i];
            if (value.type == "FilterVariableExpression")
            {
               const expression = new FilterVariableExpression(value);
               labels.push(expression.toString());
            }
            else if (value.type == "NowWithOffset")
            {
               const expression = new NowWithOffsetExpression(value);
               labels.push(expression.toString());
            }
            else if (value.type == "Now")
            {
               const expression = new NowExpression(value);
               labels.push(expression.toString());
            }
            else if (value.type == "ThisOrLastPeriod")
            {
               const expression = new ThisOrLastPeriodExpression(value);
               let startOfPrefix = "";
               if (fieldMetaData?.type == QFieldType.DATE_TIME || expression.timeUnit != "DAYS")
               {
                  startOfPrefix = "start of ";
               }
               labels.push(`${startOfPrefix}${expression.toString()}`);
            }
            else if (fieldMetaData?.type == QFieldType.BOOLEAN)
            {
               labels.push(value == true ? "yes" : "no");
            }
            else if (value && value.label)
            {
               labels.push(value.label);
            }
            else if (fieldMetaData?.type == QFieldType.DATE_TIME)
            {
               labels.push(ValueUtils.formatDateTime(value));
            }
            else if (fieldMetaData?.type == QFieldType.DATE)
            {
               labels.push(ValueUtils.formatDate(value));
            }
            else
            {
               labels.push(value);
            }
         }

         if (maxLoops < criteria.values.length)
         {
            const n = criteria.values.length - maxLoops;
            switch (andMoreFormat)
            {
               case "andNOther":
                  labels.push(` and ${n} other value${n == 1 ? "" : "s"}.`);
                  break;
               case "+N":
                  labels[labels.length - 1] += ` +${n}`;
                  break;
            }
         }

         valuesString = (labels.join(", "));
      }
      return valuesString;
   }


   /*******************************************************************************
    **
    *******************************************************************************/
   public static buildQFilterFromJSONObject(object: any): QQueryFilter
   {
      const queryFilter = new QQueryFilter();

      queryFilter.criteria = [];
      for (let i = 0; i < object.criteria?.length; i++)
      {
         const criteriaObject = object.criteria[i];
         queryFilter.criteria.push(new QFilterCriteria(criteriaObject.fieldName, criteriaObject.operator, criteriaObject.values));
      }

      queryFilter.orderBys = [];
      for (let i = 0; i < object.orderBys?.length; i++)
      {
         const orderByObject = object.orderBys[i];
         queryFilter.orderBys.push(new QFilterOrderBy(orderByObject.fieldName, orderByObject.isAscending));
      }

      queryFilter.booleanOperator = object.booleanOperator;
      queryFilter.skip = object.skip;
      queryFilter.limit = object.limit;

      return (queryFilter);
   }


   /*******************************************************************************
    **
    *******************************************************************************/
   public static getGridSortFromQueryFilter(queryFilter: QQueryFilter): GridSortModel
   {
      const gridSortModel: GridSortModel = [];
      for (let i = 0; i < queryFilter?.orderBys?.length; i++)
      {
         const orderBy = queryFilter.orderBys[i];
         gridSortModel.push({field: orderBy.fieldName, sort: orderBy.isAscending ? "asc" : "desc"});
      }
      return (gridSortModel);
   }


   /*******************************************************************************
    **
    *******************************************************************************/
   public static operatorToHumanString(criteria: QFilterCriteria, field: QFieldMetaData): string
   {
      if (criteria == null || criteria.operator == null)
      {
         return (null);
      }

      const isDate = field.type == QFieldType.DATE;
      const isDateTime = field.type == QFieldType.DATE_TIME;

      try
      {
         switch (criteria.operator)
         {
            case QCriteriaOperator.EQUALS:
               return ("equals");
            case QCriteriaOperator.NOT_EQUALS:
            case QCriteriaOperator.NOT_EQUALS_OR_IS_NULL:
               return ("does not equal");
            case QCriteriaOperator.IN:
               if (isDate || isDateTime)
               {
                  return ("day is any of");
               }
               return ("is any of");
            case QCriteriaOperator.NOT_IN:
               if (isDate || isDateTime)
               {
                  return ("day is none of");
               }
               return ("is none of");
            case QCriteriaOperator.STARTS_WITH:
               return ("starts with");
            case QCriteriaOperator.ENDS_WITH:
               return ("ends with");
            case QCriteriaOperator.CONTAINS:
               return ("contains");
            case QCriteriaOperator.NOT_STARTS_WITH:
               return ("does not start with");
            case QCriteriaOperator.NOT_ENDS_WITH:
               return ("does not end with");
            case QCriteriaOperator.NOT_CONTAINS:
               return ("does not contain");
            case QCriteriaOperator.LESS_THAN:
               if (isDate || isDateTime)
               {
                  return ("is before");
               }
               return ("less than");
            case QCriteriaOperator.LESS_THAN_OR_EQUALS:
               if (isDate)
               {
                  return ("is on or before");
               }
               if (isDateTime)
               {
                  return ("is at or before");
               }
               return ("less than or equals");
            case QCriteriaOperator.GREATER_THAN:
               if (isDate || isDateTime)
               {
                  return ("is after");
               }
               return ("greater than");
            case QCriteriaOperator.GREATER_THAN_OR_EQUALS:
               if (isDate)
               {
                  return ("is on or after");
               }
               if (isDateTime)
               {
                  return ("is at or after");
               }
               return ("greater than or equals");
            case QCriteriaOperator.IS_BLANK:
               return ("is empty");
            case QCriteriaOperator.IS_NOT_BLANK:
               return ("is not empty");
            case QCriteriaOperator.BETWEEN:
               return ("is between");
            case QCriteriaOperator.NOT_BETWEEN:
               return ("is not between");
         }
      }
      catch (e)
      {
         console.log(`Error getting operator human string for ${JSON.stringify(criteria)}: ${e}`);
         return criteria?.operator;
      }
   }


   /*******************************************************************************
    **
    *******************************************************************************/
   public static criteriaToHumanString(table: QTableMetaData, criteria: QFilterCriteria, styled = false): string | JSX.Element
   {
      if (criteria == null)
      {
         return (null);
      }

      const [field, fieldTable] = TableUtils.getFieldAndTable(table, criteria.fieldName);
      const fieldLabel = TableUtils.getFieldFullLabel(table, criteria.fieldName);
      const valuesString = FilterUtils.getValuesString(field, criteria);

      if (styled)
      {
         return (
            <Box display="inline" whiteSpace="nowrap" color="#FFFFFF" mb={"0.5rem"}>
               <Box display="inline" p="0.125rem" pl="0.5rem" sx={{background: "#0062FF"}} borderRadius="0.5rem 0 0 0.5rem">{fieldLabel} </Box>
               <Box display="inline" p="0.125rem" sx={{background: "#757575"}} borderRadius={valuesString ? "0" : "0 0.5rem 0.5rem 0"}> {FilterUtils.operatorToHumanString(criteria, field)} </Box>
               {valuesString && <Box display="inline" p="0.125rem" pr="0.5rem" sx={{background: "#009971"}} borderRadius="0 0.5rem 0.5rem 0"> {valuesString}</Box>}
               &nbsp;
            </Box>
         );
      }
      else
      {
         return (`${fieldLabel} ${FilterUtils.operatorToHumanString(criteria, field)} ${valuesString}`);
      }
   }


   /*******************************************************************************
    ** after go-live of redesign in March 2024, we had bugs where we could get a
    ** filter with a criteria w/ a null field name (e.g., by having an incomplete
    ** criteria in the Advanced filter builder - and that would sometimes break
    ** the screen!  So, strip those away when storing or loading filters, via
    ** this function.
    *******************************************************************************/
   public static stripAwayIncompleteCriteria(filter: QQueryFilter)
   {
      if (filter?.criteria?.length > 0)
      {
         for (let i = 0; i < filter.criteria.length; i++)
         {
            let removeFilter = false;
            if (!filter.criteria[i].fieldName)
            {
               ///////////////////////////////////////////////////////
               // no field name is obviously an incomplete criteria //
               ///////////////////////////////////////////////////////
               removeFilter = true;
            }

            if (filter.criteria[i]?.values?.length == 1 && filter.criteria[i]?.values[0] === "")
            {
               ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
               // quick filters add an empty-string value as a placeholder, but if that's all that's there, then it isn't a valid criteria, so remove it //
               ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
               removeFilter = true;
            }

            if (removeFilter)
            {
               filter.criteria.splice(i, 1);
               i--;
            }
         }
      }
   }


   /*******************************************************************************
    ** make a new query filter, based on the input one, but w/ values good for the
    ** backend.  such as, possible values as just ids, not objects w/ a label;
    ** date-times formatted properly and in UTC
    *******************************************************************************/
   public static prepQueryFilterForBackend(tableMetaData: QTableMetaData, sourceFilter: QQueryFilter, pageNumber?: number, rowsPerPage?: number): QQueryFilter
   {
      const filterForBackend = new QQueryFilter([], sourceFilter.orderBys, sourceFilter.subFilters, sourceFilter.booleanOperator);
      for (let i = 0; i < sourceFilter?.criteria?.length; i++)
      {
         const criteria = sourceFilter.criteria[i];
         const {criteriaIsValid} = validateCriteria(criteria, null);
         if (criteriaIsValid)
         {
            if (criteria.operator == QCriteriaOperator.IS_BLANK || criteria.operator == QCriteriaOperator.IS_NOT_BLANK)
            {
               ///////////////////////////////////////////////////////////////////////////////////////////
               // do this to avoid submitting an empty-string argument for blank/not-blank operators... //
               ///////////////////////////////////////////////////////////////////////////////////////////
               filterForBackend.criteria.push(new QFilterCriteria(criteria.fieldName, criteria.operator, []));
            }
            else
            {
               ///////////////////////////////////////////////////////////////////////////////////////////////////////////////
               // else push a clone of the criteria - since it may get manipulated below (convertFilterPossibleValuesToIds) //
               ///////////////////////////////////////////////////////////////////////////////////////////////////////////////
               const [field] = FilterUtils.getField(tableMetaData, criteria.fieldName);
               const newCriteria = new QFilterCriteria(criteria.fieldName, criteria.operator, FilterUtils.cleanseCriteriaValueForQQQ(criteria.values, field));

               if(criteria.fieldFunction)
               {
                  ///////////////////////////////////////////////////////////////////////////////////////
                  // if there's a fieldFunction, clone it if it's an object (w/ a clone method), else  //
                  // Object.assign to make a copy of it - point being, so we don't modify the original //
                  ///////////////////////////////////////////////////////////////////////////////////////
                  newCriteria.fieldFunction = criteria.fieldFunction.clone ? criteria.fieldFunction?.clone() : new FieldFunction(criteria.fieldFunction.fieldName, criteria.fieldFunction.functionTypeIdentifierName, criteria.fieldFunction.arguments);
               }

               filterForBackend.criteria.push(newCriteria);
            }
         }
      }

      /////////////////////////////////////////
      // recursively prep subfilters as well //
      /////////////////////////////////////////
      let subFilters = [] as QQueryFilter[];
      for (let j = 0; j < sourceFilter?.subFilters?.length; j++)
      {
         subFilters.push(FilterUtils.prepQueryFilterForBackend(tableMetaData, sourceFilter.subFilters[j]));
      }

      filterForBackend.subFilters = subFilters;

      if (pageNumber !== undefined && rowsPerPage !== undefined)
      {
         filterForBackend.skip = pageNumber * rowsPerPage;
         filterForBackend.limit = rowsPerPage;
      }

      return filterForBackend;
   };
}

export default FilterUtils;
