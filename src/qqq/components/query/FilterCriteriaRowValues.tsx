/*
 * QQQ - Low-code Application Framework for Engineers.
 * Copyright (C) 2021-2023.  Kingsrook, LLC
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
import {QFieldType} from "@qrunio/qqq-frontend-core/lib/model/metaData/QFieldType";
import {QTableMetaData} from "@qrunio/qqq-frontend-core/lib/model/metaData/QTableMetaData";
import {QPossibleValue} from "@qrunio/qqq-frontend-core/lib/model/QPossibleValue";
import {FilterVariableExpression} from "@qrunio/qqq-frontend-core/lib/model/query/FilterVariableExpression";
import Autocomplete from "@mui/material/Autocomplete";
import Box from "@mui/material/Box";
import Icon from "@mui/material/Icon";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment/InputAdornment";
import TextField from "@mui/material/TextField";
import DynamicFormUtils from "qqq/components/forms/DynamicFormUtils";
import DynamicSelect from "qqq/components/forms/DynamicSelect";
import AssignFilterVariable from "qqq/components/query/AssignFilterVariable";
import CriteriaDateField, {NoWrapTooltip} from "qqq/components/query/CriteriaDateField";
import {QFilterCriteriaWithId} from "qqq/components/query/CustomFilterPanel";
import {EvaluatedExpression} from "qqq/components/query/EvaluatedExpression";
import FilterCriteriaPaster from "qqq/components/query/FilterCriteriaPaster";
import {OperatorOption, ValueMode} from "qqq/components/query/FilterCriteriaRow";
import {QueryScreenUsage} from "qqq/pages/records/query/RecordQuery";
import ValueUtils from "qqq/utils/qqq/ValueUtils";
import React, {SyntheticEvent, useReducer, useState} from "react";
import {flushSync} from "react-dom";

interface Props
{
   operatorOption: OperatorOption;
   criteria: QFilterCriteriaWithId;
   field: QFieldMetaData;
   table: QTableMetaData;
   valueChangeHandler: (event: React.ChangeEvent | SyntheticEvent, valueIndex?: number | "all", newValue?: any) => void;
   initiallyOpenMultiValuePvs?: boolean;
   queryScreenUsage?: QueryScreenUsage;
   allowVariables?: boolean;
}

FilterCriteriaRowValues.defaultProps =
   {
      initiallyOpenMultiValuePvs: false
   };


/***************************************************************************
 * get the type to use for an <input> from a QFieldMetaData
 ***************************************************************************/
export const getTypeForTextField = (field: QFieldMetaData): string =>
{
   let type = "search";

   if (field.type == QFieldType.INTEGER)
   {
      type = "number";
   }
   else if (field.type == QFieldType.DATE)
   {
      type = "date";
   }
   else if (field.type == QFieldType.DATE_TIME)
   {
      type = "datetime-local";
   }

   return (type);
};


/***************************************************************************
 * Make an <input type=text> (actually, might be a different type, but that's
 * the gist of it), for a field.
 ***************************************************************************/
export const makeTextField = (field: QFieldMetaData, criteria: QFilterCriteriaWithId, valueChangeHandler?: (event: (React.ChangeEvent | React.SyntheticEvent), valueIndex?: (number | "all"), newValue?: any) => void, valueIndex: number = 0, label = "Value", idPrefix = "value-", allowVariables = false) =>
{
   const isExpression = criteria.values && criteria.values[valueIndex] && criteria.values[valueIndex].type;
   const inputId = `${idPrefix}${criteria.id}`;
   let type = getTypeForTextField(field);
   const inputLabelProps: any = {};

   if (field.type == QFieldType.DATE || field.type == QFieldType.DATE_TIME)
   {
      inputLabelProps.shrink = true;
   }

   let value = criteria.values[valueIndex];
   if (field.type == QFieldType.DATE_TIME && value && String(value).indexOf("Z") > -1)
   {
      value = ValueUtils.formatDateTimeValueForForm(value);
   }

   /***************************************************************************
    * Event handler for the clear 'x'.
    ***************************************************************************/
   const clearValue = (event: React.MouseEvent<HTMLAnchorElement> | React.MouseEvent<HTMLButtonElement>, index: number) =>
   {
      valueChangeHandler(event, index, "");
      document.getElementById(inputId).focus();
   };


   /*******************************************************************************
    ** Event handler for key-down events - specifically added here, to stop pressing
    ** 'tab' in a date or date-time from closing the quick-filter...
    *******************************************************************************/
   const handleKeyDown = (e: any) =>
   {
      if (field.type == QFieldType.DATE || field.type == QFieldType.DATE_TIME)
      {
         if (e.code == "Tab")
         {
            console.log("Tab on date or date-time - don't close me, just move to the next sub-field!...");
            e.stopPropagation();
         }
      }
   };


   /***************************************************************************
    * make a version of the text field for when the criteria's value is set to
    * be a "variable"
    ***************************************************************************/
   const makeFilterVariableTextField = (expression: FilterVariableExpression, valueIndex: number = 0, label = "Value", idPrefix = "value-") =>
   {
      const clearValue = (event: React.MouseEvent<HTMLAnchorElement> | React.MouseEvent<HTMLButtonElement>, index: number) =>
      {
         valueChangeHandler(event, index, "");
         document.getElementById(`${idPrefix}${criteria.id}`).focus();
      };

      const inputProps2: any = {};
      inputProps2.endAdornment = (
         <InputAdornment position="end">
            <IconButton sx={{visibility: expression ? "visible" : "hidden"}} onClick={(event) => clearValue(event, valueIndex)}>
               <Icon>closer</Icon>
            </IconButton>
         </InputAdornment>
      );

      return <NoWrapTooltip title={<EvaluatedExpression field={field} expression={expression} />} placement="bottom" enterDelay={1000} sx={{marginLeft: "-75px !important", marginTop: "-8px !important"}}><TextField
         id={`${idPrefix}${criteria.id}`}
         label={label}
         variant="standard"
         autoComplete="off"
         InputProps={{disabled: true, readOnly: true, unselectable: "off", ...inputProps2}}
         InputLabelProps={{shrink: true}}
         value="${VARIABLE}"
         fullWidth
      /></NoWrapTooltip>;
   };


   ///////////////////////////////////////////////////////////////////////////
   // set up an 'x' icon as an end-adornment, to clear value from the field //
   ///////////////////////////////////////////////////////////////////////////
   const inputProps: any = {};
   inputProps.endAdornment = (
      <InputAdornment position="end">
         <IconButton sx={{visibility: value ? "visible" : "hidden"}} onClick={(event) => clearValue(event, valueIndex)}>
            <Icon>close</Icon>
         </IconButton>
      </InputAdornment>
   );


   /***************************************************************************
    * onChange event handler.  deals with, if the field has a to upper/lower
    * case rule on it, to apply that transform, and adjust the cursor.
    * See:  https://giacomocerquone.com/blog/keep-input-cursor-still
    ***************************************************************************/
   function onChange(event: any)
   {
      const beforeStart = event.target.selectionStart;
      const beforeEnd = event.target.selectionEnd;

      let isToUpperCase = DynamicFormUtils.isToUpperCase(field);
      let isToLowerCase = DynamicFormUtils.isToLowerCase(field);

      if (isToUpperCase || isToLowerCase)
      {
         flushSync(() =>
         {
            let newValue = event.currentTarget.value;

            if (isToUpperCase)
            {
               newValue = newValue.toUpperCase();
            }
            if (isToLowerCase)
            {
               newValue = newValue.toLowerCase();
            }

            event.currentTarget.value = newValue;
         });

         const input = document.getElementById(inputId);
         if (input)
         {
            // @ts-ignore
            input.setSelectionRange(beforeStart, beforeEnd);
         }
      }

      valueChangeHandler(event, valueIndex);
   }

   ////////////////////////
   // return the element //
   ////////////////////////
   return <Box sx={{margin: 0, padding: 0, display: "flex"}}>
      {
         isExpression ? (
            makeFilterVariableTextField(criteria.values[valueIndex], valueIndex, label, idPrefix)
         ) : (
            <TextField
               id={inputId}
               label={label}
               variant="standard"
               autoComplete="off"
               type={type}
               onChange={onChange}
               onKeyDown={handleKeyDown}
               value={value}
               InputLabelProps={inputLabelProps}
               InputProps={inputProps}
               fullWidth
               autoFocus={true}
            />
         )
      }
      {
         allowVariables && (
            <AssignFilterVariable field={field} valueChangeHandler={valueChangeHandler} valueIndex={valueIndex} />
         )
      }
   </Box>;
};


/***************************************************************************
 * Component that is the "values" portion of a FilterCriteria Row in the
 * advanced query filter editor.
 ***************************************************************************/
function FilterCriteriaRowValues({operatorOption, criteria, field, table, valueChangeHandler, initiallyOpenMultiValuePvs, queryScreenUsage, allowVariables}: Props): JSX.Element
{
   const [, forceUpdate] = useReducer((x) => x + 1, 0);
   const [pasterIteration, setPasterIteration] = useState(0);

   if (!operatorOption)
   {
      return null;
   }


   /***************************************************************************
    * Callback for the Save button from the paste-values modal
    ***************************************************************************/
   function saveNewPasterValues(newValues: any[])
   {
      if (criteria.values)
      {
         criteria.values = [...criteria.values, ...newValues];
      }
      else
      {
         criteria.values = newValues;
      }

      //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
      // we are somehow getting some empty-strings as first-value leaking through.  they aren't cool, so, remove them if we find them //
      //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
      if (criteria.values.length > 0 && criteria.values[0] == "")
      {
         criteria.values = criteria.values.splice(1);
      }

      /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
      // as paster was worked on, at one point in time, we had trouble refreshing values in the DynamicSelect after paster ran,      //
      // so a key was put on the DynamicSelect based on the number of values... but that's a bit wrong (and made changes for non-    //
      // paster mode close it in multi-select mode).  so - instead, explicitly track any time paster completes, and add this counter //
      // to the key, to keep that behavior of refreshing after paster, but not re-rendering for quite so many non-paster changes.    //
      /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
      setPasterIteration(pasterIteration + 1);

      valueChangeHandler(null, "all", criteria.values);
      forceUpdate();
   }

   const isExpression = criteria.values && criteria.values[0] && criteria.values[0].type;

   //////////////////////////////////////////////////////////////////////////////
   // render different form element9s) based on operator option's "value mode" //
   //////////////////////////////////////////////////////////////////////////////
   switch (operatorOption.valueMode)
   {
      case ValueMode.NONE:
         return null;
      case ValueMode.SINGLE:
         return makeTextField(field, criteria, valueChangeHandler, 0, undefined, undefined, allowVariables);
      case ValueMode.SINGLE_DATE:
         return <CriteriaDateField field={field} valueChangeHandler={valueChangeHandler} criteria={criteria} allowVariables={allowVariables} />;
      case ValueMode.DOUBLE_DATE:
         return <Box>
            <CriteriaDateField field={field} valueChangeHandler={valueChangeHandler} criteria={criteria} valueIndex={0} label="From" idPrefix="from-" allowVariables={allowVariables} />
            <CriteriaDateField field={field} valueChangeHandler={valueChangeHandler} criteria={criteria} valueIndex={1} label="To" idPrefix="to-" allowVariables={allowVariables} />
         </Box>;
      case ValueMode.SINGLE_DATE_TIME:
         return <CriteriaDateField field={field} valueChangeHandler={valueChangeHandler} criteria={criteria} allowVariables={allowVariables} />;
      case ValueMode.DOUBLE_DATE_TIME:
         return <Box>
            <CriteriaDateField field={field} valueChangeHandler={valueChangeHandler} criteria={criteria} valueIndex={0} label="From" idPrefix="from-" allowVariables={allowVariables} />
            <CriteriaDateField field={field} valueChangeHandler={valueChangeHandler} criteria={criteria} valueIndex={1} label="To" idPrefix="to-" allowVariables={allowVariables} />
         </Box>;
      case ValueMode.DOUBLE:
         return <Box>
            <Box width="50%" display="inline-block">
               {makeTextField(field, criteria, valueChangeHandler, 0, "From", "from-", allowVariables)}
            </Box>
            <Box width="50%" display="inline-block">
               {makeTextField(field, criteria, valueChangeHandler, 1, "To", "to-", allowVariables)}
            </Box>
         </Box>;
      case ValueMode.MULTI:
         let values = criteria.values;
         if (values && values.length == 1 && (values[0] == "" || values[0] == undefined))
         {
            values = [];
         }
         return <Box display="flex" alignItems="flex-end" className="multiValue">
            <Autocomplete
               renderInput={(params) => (<TextField {...params} variant="standard" label="Values" />)}
               options={[]}
               multiple
               freeSolo // todo - no debounce after enter?
               selectOnFocus
               clearOnBlur
               fullWidth
               limitTags={5}
               value={values}
               onChange={(event, value) => valueChangeHandler(event, "all", value)}
            />
            <Box>
               <FilterCriteriaPaster type={getTypeForTextField(field)} onSave={(newValues: any[]) => saveNewPasterValues(newValues)} />
            </Box>
         </Box>;
      case ValueMode.PVS_SINGLE:
         console.log("Doing pvs single: " + criteria.values);
         let selectedPossibleValue = null;
         if (criteria.values && criteria.values.length > 0)
         {
            selectedPossibleValue = criteria.values[0];
         }
         return <Box display="flex">
            {
               isExpression ? (
                  makeTextField(field, criteria, valueChangeHandler, 0, undefined, undefined, allowVariables)
               ) : (
                  <Box width={"100%"}>
                     <DynamicSelect
                        fieldPossibleValueProps={{tableName: table.name, fieldName: field.name, initialDisplayValue: selectedPossibleValue?.label}}
                        overrideId={field.name + "-single-" + criteria.id}
                        key={field.name + "-single-" + criteria.id}
                        fieldLabel="Value"
                        initialValue={selectedPossibleValue?.id}
                        inForm={false}
                        onChange={(value: any) => valueChangeHandler(null, 0, value)}
                        variant="standard"
                        useCase="filter"
                     />
                  </Box>
               )
            }
            {
               allowVariables && !isExpression && <Box mt={2.0}><AssignFilterVariable field={field} valueChangeHandler={valueChangeHandler} valueIndex={0} /></Box>
            }
         </Box>;
      case ValueMode.PVS_MULTI:
         console.log("Doing pvs multi: " + criteria.values);
         let initialValues: any[] = [];
         if (criteria.values && criteria.values.length > 0)
         {
            if (criteria.values.length == 1 && criteria.values[0] == "")
            {
               // we never want a tag that's just ""...
            }
            else
            {
               initialValues = criteria.values;
            }
         }

         let inlinePossibleValues: QPossibleValue[];
         if(operatorOption.fieldFunctionType === "WeekdayOfDate" || operatorOption.fieldFunctionType === "WeekdayOfDateTime")
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
            inlinePossibleValues = [...allDays.slice(startIndex), ...allDays.slice(0, startIndex)];
         }

         return <Box display="flex" alignItems="flex-end" className="multiValue">
            <Box width={"100%"}>
               <DynamicSelect
                  fieldPossibleValueProps={{tableName: table.name, fieldName: field.name, initialDisplayValue: null, possibleValues: inlinePossibleValues}}
                  overrideId={field.name + "-multi-" + criteria.id}
                  key={field.name + "-multi-" + criteria.id + `-pasterIteration-${pasterIteration}`}
                  isMultiple
                  fieldLabel="Values"
                  initialValues={initialValues}
                  initiallyOpen={false /*initiallyOpenMultiValuePvs*/}
                  inForm={false}
                  onChange={(value: any) => valueChangeHandler(null, "all", value)}
                  variant="standard"
                  useCase="filter"
               />
            </Box>
            <Box>
               <FilterCriteriaPaster table={table} field={field} type="pvs" onSave={(newValues: any[]) => saveNewPasterValues(newValues)} />
            </Box>
         </Box>;
   }

   return (<br />);
}

export default FilterCriteriaRowValues;
