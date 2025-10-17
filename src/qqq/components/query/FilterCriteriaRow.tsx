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

import {QFieldType} from "@qrunio/qqq-frontend-core/lib/model/metaData/QFieldType";
import {QInstance} from "@qrunio/qqq-frontend-core/lib/model/metaData/QInstance";
import {QTableMetaData} from "@qrunio/qqq-frontend-core/lib/model/metaData/QTableMetaData";
import {QCriteriaOperator} from "@qrunio/qqq-frontend-core/lib/model/query/QCriteriaOperator";
import {QFilterCriteria} from "@qrunio/qqq-frontend-core/lib/model/query/QFilterCriteria";
import Autocomplete from "@mui/material/Autocomplete";
import Box from "@mui/material/Box";
import FormControl from "@mui/material/FormControl/FormControl";
import Icon from "@mui/material/Icon/Icon";
import IconButton from "@mui/material/IconButton";
import MenuItem from "@mui/material/MenuItem";
import Select, {SelectChangeEvent} from "@mui/material/Select/Select";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import FieldAutoComplete from "qqq/components/misc/FieldAutoComplete";
import {QFilterCriteriaWithId} from "qqq/components/query/CustomFilterPanel";
import FilterCriteriaRowValues from "qqq/components/query/FilterCriteriaRowValues";
import {QueryScreenUsage} from "qqq/pages/records/query/RecordQuery";
import FilterUtils from "qqq/utils/qqq/FilterUtils";
import React, {ReactNode, SyntheticEvent, useState} from "react";


export enum ValueMode
{
   NONE = "NONE",
   SINGLE = "SINGLE",
   DOUBLE = "DOUBLE",
   MULTI = "MULTI",
   SINGLE_DATE = "SINGLE_DATE",
   DOUBLE_DATE = "DOUBLE_DATE",
   SINGLE_DATE_TIME = "SINGLE_DATE_TIME",
   DOUBLE_DATE_TIME = "DOUBLE_DATE_TIME",
   PVS_SINGLE = "PVS_SINGLE",
   PVS_MULTI = "PVS_MULTI",
}

export const getValueModeRequiredCount = (valueMode: ValueMode): number =>
{
   switch (valueMode)
   {
      case ValueMode.NONE:
         return (0);
      case ValueMode.SINGLE:
      case ValueMode.SINGLE_DATE:
      case ValueMode.SINGLE_DATE_TIME:
      case ValueMode.PVS_SINGLE:
         return (1);
      case ValueMode.DOUBLE:
      case ValueMode.DOUBLE_DATE:
      case ValueMode.DOUBLE_DATE_TIME:
         return (2);
      case ValueMode.MULTI:
      case ValueMode.PVS_MULTI:
         return (null);
   }
};

export interface OperatorOption
{
   label: string;
   value: QCriteriaOperator;
   implicitValues?: any[];
   valueMode: ValueMode;
}

export const getDefaultCriteriaValue = () => [""];

export const getOperatorOptions = (tableMetaData: QTableMetaData, fieldName: string): OperatorOption[] =>
{
   const [field, fieldTable] = FilterUtils.getField(tableMetaData, fieldName);
   let operatorOptions = [];
   if (field && fieldTable)
   {
      //////////////////////////////////////////////////////
      // setup array of options for operator Autocomplete //
      //////////////////////////////////////////////////////
      if (field.possibleValueSourceName)
      {
         operatorOptions.push({label: "equals", value: QCriteriaOperator.EQUALS, valueMode: ValueMode.PVS_SINGLE});
         operatorOptions.push({label: "does not equal", value: QCriteriaOperator.NOT_EQUALS_OR_IS_NULL, valueMode: ValueMode.PVS_SINGLE});
         operatorOptions.push({label: "is empty", value: QCriteriaOperator.IS_BLANK, valueMode: ValueMode.NONE});
         operatorOptions.push({label: "is not empty", value: QCriteriaOperator.IS_NOT_BLANK, valueMode: ValueMode.NONE});
         operatorOptions.push({label: "is any of", value: QCriteriaOperator.IN, valueMode: ValueMode.PVS_MULTI});
         operatorOptions.push({label: "is none of", value: QCriteriaOperator.NOT_IN, valueMode: ValueMode.PVS_MULTI});
      }
      else
      {
         switch (field.type)
         {
            case QFieldType.DECIMAL:
            case QFieldType.INTEGER:
            case QFieldType.LONG:
               operatorOptions.push({label: "equals", value: QCriteriaOperator.EQUALS, valueMode: ValueMode.SINGLE});
               operatorOptions.push({label: "does not equal", value: QCriteriaOperator.NOT_EQUALS_OR_IS_NULL, valueMode: ValueMode.SINGLE});
               operatorOptions.push({label: "greater than", value: QCriteriaOperator.GREATER_THAN, valueMode: ValueMode.SINGLE});
               operatorOptions.push({label: "greater than or equals", value: QCriteriaOperator.GREATER_THAN_OR_EQUALS, valueMode: ValueMode.SINGLE});
               operatorOptions.push({label: "less than", value: QCriteriaOperator.LESS_THAN, valueMode: ValueMode.SINGLE});
               operatorOptions.push({label: "less than or equals", value: QCriteriaOperator.LESS_THAN_OR_EQUALS, valueMode: ValueMode.SINGLE});
               operatorOptions.push({label: "is empty", value: QCriteriaOperator.IS_BLANK, valueMode: ValueMode.NONE});
               operatorOptions.push({label: "is not empty", value: QCriteriaOperator.IS_NOT_BLANK, valueMode: ValueMode.NONE});
               operatorOptions.push({label: "is between", value: QCriteriaOperator.BETWEEN, valueMode: ValueMode.DOUBLE});
               operatorOptions.push({label: "is not between", value: QCriteriaOperator.NOT_BETWEEN, valueMode: ValueMode.DOUBLE});
               operatorOptions.push({label: "is any of", value: QCriteriaOperator.IN, valueMode: ValueMode.MULTI});
               operatorOptions.push({label: "is none of", value: QCriteriaOperator.NOT_IN, valueMode: ValueMode.MULTI});
               break;
            case QFieldType.DATE:
               operatorOptions.push({label: "equals", value: QCriteriaOperator.EQUALS, valueMode: ValueMode.SINGLE_DATE});
               operatorOptions.push({label: "does not equal", value: QCriteriaOperator.NOT_EQUALS_OR_IS_NULL, valueMode: ValueMode.SINGLE_DATE});
               operatorOptions.push({label: "is after", value: QCriteriaOperator.GREATER_THAN, valueMode: ValueMode.SINGLE_DATE});
               operatorOptions.push({label: "is on or after", value: QCriteriaOperator.GREATER_THAN_OR_EQUALS, valueMode: ValueMode.SINGLE_DATE});
               operatorOptions.push({label: "is before", value: QCriteriaOperator.LESS_THAN, valueMode: ValueMode.SINGLE_DATE});
               operatorOptions.push({label: "is on or before", value: QCriteriaOperator.LESS_THAN_OR_EQUALS, valueMode: ValueMode.SINGLE_DATE});
               operatorOptions.push({label: "is empty", value: QCriteriaOperator.IS_BLANK, valueMode: ValueMode.NONE});
               operatorOptions.push({label: "is not empty", value: QCriteriaOperator.IS_NOT_BLANK, valueMode: ValueMode.NONE});
               operatorOptions.push({label: "is between", value: QCriteriaOperator.BETWEEN, valueMode: ValueMode.DOUBLE_DATE});
               operatorOptions.push({label: "is not between", value: QCriteriaOperator.NOT_BETWEEN, valueMode: ValueMode.DOUBLE_DATE});
               //? operatorOptions.push({label: "is between", value: QCriteriaOperator.BETWEEN});
               //? operatorOptions.push({label: "is not between", value: QCriteriaOperator.NOT_BETWEEN});
               //? operatorOptions.push({label: "is any of", value: QCriteriaOperator.IN});
               //? operatorOptions.push({label: "is none of", value: QCriteriaOperator.NOT_IN});
               break;
            case QFieldType.DATE_TIME:
               operatorOptions.push({label: "equals", value: QCriteriaOperator.EQUALS, valueMode: ValueMode.SINGLE_DATE_TIME});
               operatorOptions.push({label: "does not equal", value: QCriteriaOperator.NOT_EQUALS_OR_IS_NULL, valueMode: ValueMode.SINGLE_DATE_TIME});
               operatorOptions.push({label: "is after", value: QCriteriaOperator.GREATER_THAN, valueMode: ValueMode.SINGLE_DATE_TIME});
               operatorOptions.push({label: "is at or after", value: QCriteriaOperator.GREATER_THAN_OR_EQUALS, valueMode: ValueMode.SINGLE_DATE_TIME});
               operatorOptions.push({label: "is before", value: QCriteriaOperator.LESS_THAN, valueMode: ValueMode.SINGLE_DATE_TIME});
               operatorOptions.push({label: "is at or before", value: QCriteriaOperator.LESS_THAN_OR_EQUALS, valueMode: ValueMode.SINGLE_DATE_TIME});
               operatorOptions.push({label: "is empty", value: QCriteriaOperator.IS_BLANK, valueMode: ValueMode.NONE});
               operatorOptions.push({label: "is not empty", value: QCriteriaOperator.IS_NOT_BLANK, valueMode: ValueMode.NONE});
               operatorOptions.push({label: "is between", value: QCriteriaOperator.BETWEEN, valueMode: ValueMode.DOUBLE_DATE_TIME});
               operatorOptions.push({label: "is not between", value: QCriteriaOperator.NOT_BETWEEN, valueMode: ValueMode.DOUBLE_DATE_TIME});
               //? operatorOptions.push({label: "is between", value: QCriteriaOperator.BETWEEN});
               //? operatorOptions.push({label: "is not between", value: QCriteriaOperator.NOT_BETWEEN});
               break;
            case QFieldType.BOOLEAN:
               operatorOptions.push({label: "equals yes", value: QCriteriaOperator.EQUALS, valueMode: ValueMode.NONE, implicitValues: [true]});
               operatorOptions.push({label: "equals no", value: QCriteriaOperator.EQUALS, valueMode: ValueMode.NONE, implicitValues: [false]});
               operatorOptions.push({label: "is empty", value: QCriteriaOperator.IS_BLANK, valueMode: ValueMode.NONE});
               operatorOptions.push({label: "is not empty", value: QCriteriaOperator.IS_NOT_BLANK, valueMode: ValueMode.NONE});
               /*
               ? is yes or empty (is not no)
               ? is no or empty (is not yes)
                */
               break;
            case QFieldType.BLOB:
               operatorOptions.push({label: "is empty", value: QCriteriaOperator.IS_BLANK, valueMode: ValueMode.NONE});
               operatorOptions.push({label: "is not empty", value: QCriteriaOperator.IS_NOT_BLANK, valueMode: ValueMode.NONE});
               break;
            default:
               operatorOptions.push({label: "equals", value: QCriteriaOperator.EQUALS, valueMode: ValueMode.SINGLE});
               operatorOptions.push({label: "does not equal", value: QCriteriaOperator.NOT_EQUALS_OR_IS_NULL, valueMode: ValueMode.SINGLE});
               operatorOptions.push({label: "contains ", value: QCriteriaOperator.CONTAINS, valueMode: ValueMode.SINGLE});
               operatorOptions.push({label: "does not contain", value: QCriteriaOperator.NOT_CONTAINS, valueMode: ValueMode.SINGLE});
               operatorOptions.push({label: "starts with", value: QCriteriaOperator.STARTS_WITH, valueMode: ValueMode.SINGLE});
               operatorOptions.push({label: "does not start with", value: QCriteriaOperator.NOT_STARTS_WITH, valueMode: ValueMode.SINGLE});
               operatorOptions.push({label: "ends with", value: QCriteriaOperator.ENDS_WITH, valueMode: ValueMode.SINGLE});
               operatorOptions.push({label: "does not end with", value: QCriteriaOperator.NOT_ENDS_WITH, valueMode: ValueMode.SINGLE});
               operatorOptions.push({label: "is empty", value: QCriteriaOperator.IS_BLANK, valueMode: ValueMode.NONE});
               operatorOptions.push({label: "is not empty", value: QCriteriaOperator.IS_NOT_BLANK, valueMode: ValueMode.NONE});
               operatorOptions.push({label: "is any of", value: QCriteriaOperator.IN, valueMode: ValueMode.MULTI});
               operatorOptions.push({label: "is none of", value: QCriteriaOperator.NOT_IN, valueMode: ValueMode.MULTI});
         }
      }
   }

   return (operatorOptions);
};


interface FilterCriteriaRowProps
{
   id: number,
   index: number,
   tableMetaData: QTableMetaData,
   metaData: QInstance,
   criteria: QFilterCriteria,
   booleanOperator: "AND" | "OR" | null,
   updateCriteria: (newCriteria: QFilterCriteria, needDebounce: boolean) => void,
   removeCriteria: () => void,
   updateBooleanOperator: (newValue: string) => void,
   queryScreenUsage?: QueryScreenUsage,
   allowVariables?: boolean,
   omitExposedJoins?: string[]
}

FilterCriteriaRow.defaultProps =
   {};

export function validateCriteria(criteria: QFilterCriteria, operatorSelectedValue?: OperatorOption): { criteriaIsValid: boolean, criteriaStatusTooltip: string }
{
   let criteriaIsValid = true;
   let criteriaStatusTooltip = "This condition is fully defined and is part of your filter.";

   function isNotSet(value: any)
   {
      return (value === null || value == undefined || String(value).trim() === "");
   }

   if (!criteria)
   {
      criteriaIsValid = false;
      criteriaStatusTooltip = "This condition is not defined.";
      return {criteriaIsValid, criteriaStatusTooltip};
   }

   if (!criteria.fieldName)
   {
      criteriaIsValid = false;
      criteriaStatusTooltip = "You must select a field to begin to define this condition.";
   }
   else if (!criteria.operator)
   {
      criteriaIsValid = false;
      criteriaStatusTooltip = "You must select an operator to continue to define this condition.";
   }
   else
   {
      if (criteria.operator == QCriteriaOperator.IS_BLANK || criteria.operator == QCriteriaOperator.IS_NOT_BLANK)
      {
         //////////////////////////////////
         // don't need to look at values //
         //////////////////////////////////
      }
      else if (criteria.operator == QCriteriaOperator.BETWEEN || criteria.operator == QCriteriaOperator.NOT_BETWEEN)
      {
         if ((criteria.values?.length ?? 0) < 2 || isNotSet(criteria.values[0]) || isNotSet(criteria.values[1]))
         {
            criteriaIsValid = false;
            criteriaStatusTooltip = "You must enter two values to complete the definition of this condition.";
         }
      }
      else if (criteria.operator == QCriteriaOperator.IN || criteria.operator == QCriteriaOperator.NOT_IN)
      {
         if ((criteria.values?.length ?? 0) < 1 || isNotSet(criteria.values[0]))
         {
            criteriaIsValid = false;
            criteriaStatusTooltip = "You must enter one or more values complete the definition of this condition.";
         }
      }
      else
      {
         if (!criteria.values || isNotSet(criteria.values[0]))
         {
            criteriaIsValid = false;
            criteriaStatusTooltip = "You must enter a value to complete the definition of this condition.";
         }
      }
   }
   return {criteriaIsValid, criteriaStatusTooltip};
}

export function FilterCriteriaRow({id, index, tableMetaData, metaData, criteria, booleanOperator, updateCriteria, removeCriteria, updateBooleanOperator, queryScreenUsage, allowVariables, omitExposedJoins}: FilterCriteriaRowProps): JSX.Element
{
   // console.log(`FilterCriteriaRow: criteria: ${JSON.stringify(criteria)}`);
   const [operatorSelectedValue, setOperatorSelectedValue] = useState(null as OperatorOption);
   const [operatorInputValue, setOperatorInputValue] = useState("");

   ////////////////////////////////////////////////////////////
   // set up array of options for operator dropdown          //
   // only call the function to do it if we have a field set //
   ////////////////////////////////////////////////////////////
   let operatorOptions: OperatorOption[] = [];

   ////////////////////////////////////////////////////////////////
   // make currently selected values appear in the Autocompletes //
   ////////////////////////////////////////////////////////////////
   let defaultFieldValue;
   let field = null;
   let fieldTable = null;
   if (criteria && criteria.fieldName)
   {
      [field, fieldTable] = FilterUtils.getField(tableMetaData, criteria.fieldName);
      if (field && fieldTable)
      {
         if (fieldTable.name == tableMetaData.name)
         {
            // @ts-ignore
            defaultFieldValue = {field: field, table: tableMetaData, fieldName: criteria.fieldName};
         }
         else
         {
            defaultFieldValue = {field: field, table: fieldTable, fieldName: criteria.fieldName};
         }

         operatorOptions = getOperatorOptions(tableMetaData, criteria.fieldName);

         let newOperatorSelectedValue = operatorOptions.filter(option =>
         {
            if (option.value == criteria.operator)
            {
               if (option.implicitValues)
               {
                  return (JSON.stringify(option.implicitValues) == JSON.stringify(criteria.values));
               }
               else
               {
                  return (true);
               }
            }
            return (false);
         })[0];
         if (newOperatorSelectedValue?.label !== operatorSelectedValue?.label)
         {
            setOperatorSelectedValue(newOperatorSelectedValue);
            setOperatorInputValue(newOperatorSelectedValue?.label);
         }
      }
   }

   //////////////////////////////////////////////
   // event handler for booleanOperator Select //
   //////////////////////////////////////////////
   const handleBooleanOperatorChange = (event: SelectChangeEvent<"AND" | "OR">, child: ReactNode) =>
   {
      updateBooleanOperator(event.target.value);
   };

   //////////////////////////////////////////
   // event handler for field Autocomplete //
   //////////////////////////////////////////
   const handleFieldChange = (event: any, newValue: any, reason: string) =>
   {
      const oldFieldName = criteria.fieldName;

      criteria.fieldName = newValue ? newValue.fieldName : null;

      //////////////////////////////////////////////////////
      // decide if we should clear out the values or not. //
      //////////////////////////////////////////////////////
      if (criteria.fieldName == null || isFieldTypeDifferent(oldFieldName, criteria.fieldName))
      {
         criteria.values = getDefaultCriteriaValue();
      }

      ////////////////////////////////////////////////////////////////////
      // update the operator options, and the operator on this criteria //
      ////////////////////////////////////////////////////////////////////
      operatorOptions = getOperatorOptions(tableMetaData, criteria.fieldName);
      if (operatorOptions.length)
      {
         if (isFieldTypeDifferent(oldFieldName, criteria.fieldName))
         {
            criteria.operator = operatorOptions[0].value;
            setOperatorSelectedValue(operatorOptions[0]);
            setOperatorInputValue(operatorOptions[0].label);
         }
      }
      else
      {
         criteria.operator = null;
         setOperatorSelectedValue(null);
         setOperatorInputValue("");
      }

      updateCriteria(criteria, false);
   };

   /////////////////////////////////////////////
   // event handler for operator Autocomplete //
   /////////////////////////////////////////////
   const handleOperatorChange = (event: any, newValue: any, reason: string) =>
   {
      criteria.operator = newValue ? newValue.value : null;

      if (newValue)
      {
         setOperatorSelectedValue(newValue);
         setOperatorInputValue(newValue.label);

         if (newValue.implicitValues)
         {
            criteria.values = newValue.implicitValues;
         }

         //////////////////////////////////////////////////////////////////////////////////////////////////
         // we've seen cases where switching operators can sometimes put a null in as the first value... //
         // that just causes a bad time (e.g., null pointers in Autocomplete), so, get rid of that.      //
         //////////////////////////////////////////////////////////////////////////////////////////////////
         if (criteria.values && criteria.values.length == 1 && criteria.values[0] == null)
         {
            criteria.values = [];
         }

         if (newValue.valueMode && !newValue.implicitValues)
         {
            const requiredValueCount = getValueModeRequiredCount(newValue.valueMode);
            if (requiredValueCount != null && criteria.values.length > requiredValueCount)
            {
               criteria.values.splice(requiredValueCount);
            }
         }
      }
      else
      {
         setOperatorSelectedValue(null);
         setOperatorInputValue("");
      }

      updateCriteria(criteria, false);
   };

   //////////////////////////////////////////////////
   // event handler for value field (of all types) //
   //////////////////////////////////////////////////
   const handleValueChange = (event: React.ChangeEvent | SyntheticEvent, valueIndex: number | "all" = 0, newValue?: any) =>
   {
      // @ts-ignore
      const value = newValue !== undefined ? newValue : event ? event.target.value : null;

      if (!criteria.values)
      {
         criteria.values = [];
      }

      if (valueIndex == "all")
      {
         criteria.values = value;
      }
      else
      {
         criteria.values[valueIndex] = value;
      }

      updateCriteria(criteria, true);
   };

   const isFieldTypeDifferent = (fieldNameA: string, fieldNameB: string): boolean =>
   {
      const [fieldA] = FilterUtils.getField(tableMetaData, fieldNameA);
      const [fieldB] = FilterUtils.getField(tableMetaData, fieldNameB);
      if (fieldA?.type !== fieldB.type)
      {
         return (true);
      }
      if (fieldA.possibleValueSourceName !== fieldB.possibleValueSourceName)
      {
         return (true);
      }

      return (false);
   };

   function isOperatorOptionEqual(option: OperatorOption, value: OperatorOption)
   {
      return (option?.value == value?.value && JSON.stringify(option?.implicitValues) == JSON.stringify(value?.implicitValues));
   }

   const {criteriaIsValid, criteriaStatusTooltip} = validateCriteria(criteria, operatorSelectedValue);

   const tooltipEnterDelay = 750;

   return (
      <Box className="filterCriteriaRow" pt={0.5} display="flex" alignItems="flex-end" pr={0.5}>
         <Box display="inline-block">
            <Tooltip title="Remove this condition from your filter" enterDelay={tooltipEnterDelay} placement="left">
               <IconButton onClick={removeCriteria}><Icon fontSize="small">close</Icon></IconButton>
            </Tooltip>
         </Box>
         <Box display="inline-block" width={55} className="booleanOperatorColumn">
            {booleanOperator && index > 0 ?
               <FormControl variant="standard" sx={{verticalAlign: "bottom"}} fullWidth>
                  <Select value={booleanOperator} disabled={index > 1} onChange={handleBooleanOperatorChange}>
                     <MenuItem value="AND">And</MenuItem>
                     <MenuItem value="OR">Or</MenuItem>
                  </Select>
               </FormControl>
               : <span />}
         </Box>
         <Box display="inline-block" width={250} className="fieldColumn">
            <FieldAutoComplete id={`field-${id}`} metaData={metaData} tableMetaData={tableMetaData} defaultValue={defaultFieldValue} handleFieldChange={handleFieldChange}
               omitExposedJoins={omitExposedJoins} autocompleteSlotProps={{popper: {className: "filterCriteriaRowColumnPopper", style: {padding: 0, width: "250px"}}}}
            />
         </Box>
         <Box display="inline-block" width={200} className="operatorColumn">
            <Tooltip title={criteria.fieldName == null ? "You must select a field before you can select an operator" : null} enterDelay={tooltipEnterDelay}>
               <Autocomplete
                  id={"criteriaOperator"}
                  renderInput={(params) => (<TextField {...params} label={"Operator"} variant="standard" autoComplete="off" type="search" InputProps={{...params.InputProps}} />)}
                  options={operatorOptions}
                  value={operatorSelectedValue as any}
                  inputValue={operatorInputValue}
                  onChange={handleOperatorChange}
                  onInputChange={(e, value) => setOperatorInputValue(value)}
                  isOptionEqualToValue={(option, value) => isOperatorOptionEqual(option, value)}
                  getOptionLabel={(option: any) => option.label}
                  autoSelect={true}
                  autoHighlight={true}
                  slotProps={{popper: {style: {padding: 0, maxHeight: "unset", width: "200px"}}}}
                  /*disabled={criteria.fieldName == null}*/
               />
            </Tooltip>
         </Box>
         <Box display="inline-block" width={300} className="filterValuesColumn">
            <FilterCriteriaRowValues
               operatorOption={operatorSelectedValue}
               criteria={QFilterCriteriaWithId.buildFromCriteria(criteria, id)}
               field={field}
               table={fieldTable}
               valueChangeHandler={(event, valueIndex, newValue) => handleValueChange(event, valueIndex, newValue)}
               queryScreenUsage={queryScreenUsage}
               allowVariables={allowVariables}
            />
         </Box>
         <Box display="inline-block">
            <Tooltip title={criteriaStatusTooltip} enterDelay={tooltipEnterDelay} placement="bottom">
               {
                  criteriaIsValid
                     ? <Icon color="success">check</Icon>
                     : <Icon color="disabled">pending</Icon>
               }
            </Tooltip>
         </Box>
      </Box>
   );
}
