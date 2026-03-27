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


import {QExposedJoin} from "@qrunio/qqq-frontend-core/lib/model/metaData/QExposedJoin";
import {QFieldMetaData} from "@qrunio/qqq-frontend-core/lib/model/metaData/QFieldMetaData";
import {QInstance} from "@qrunio/qqq-frontend-core/lib/model/metaData/QInstance";
import {QTableMetaData} from "@qrunio/qqq-frontend-core/lib/model/metaData/QTableMetaData";
import {Box} from "@mui/material";
import Autocomplete, {AutocompleteRenderOptionState} from "@mui/material/Autocomplete";
import Icon from "@mui/material/Icon";
import TextField from "@mui/material/TextField";
import React, {ReactNode, useMemo, useState} from "react";

interface FieldAutoCompleteProps
{
   id: string,
   metaData: QInstance,
   tableMetaData: QTableMetaData,
   handleFieldChange: (event: any, newValue: any, reason: string) => void,
   defaultValue?: { field: QFieldMetaData, table: QTableMetaData, fieldName: string },
   autoFocus?: boolean,
   forceOpen?: boolean,
   hiddenFieldNames?: string[],
   availableFieldNames?: string[],
   variant?: "standard" | "filled" | "outlined",
   label?: string,
   textFieldSX?: any,
   autocompleteSlotProps?: any,
   hasError?: boolean,
   noOptionsText?: string,
   omitExposedJoins?: string[],
   includeVirtualFields: "all" | "none" | "querySelectable" | "queryCriteria"
}

FieldAutoComplete.defaultProps =
   {
      defaultValue: null,
      autoFocus: false,
      forceOpen: null,
      hiddenFieldNames: [],
      availableFieldNames: [],
      variant: "standard",
      label: "Field",
      textFieldSX: null,
      autocompleteSlotProps: null,
      hasError: false,
      noOptionsText: "No options",
      includeVirtualFields: "none"
   };

function makeFieldOptionsForTable(tableMetaData: QTableMetaData, fieldOptions: any[], isJoinTable: boolean, hiddenFieldNames: string[], availableFieldNames: string[], selectedFieldName: string, includeVirtualFields: "all" | "none" | "querySelectable" | "queryCriteria" = "none")
{
   const availableFields = [...tableMetaData.fields.values()]
   if (includeVirtualFields != "none")
   {
      tableMetaData.virtualFields?.forEach(virtualField =>
      {
         if (includeVirtualFields == "all" || (includeVirtualFields == "querySelectable" && virtualField.isQuerySelectable) || (includeVirtualFields == "queryCriteria" && virtualField.isQueryCriteria))
         {
            availableFields.push(virtualField);
         }
      })
   }

   const sortedFields = availableFields.sort((a, b) => a.label.localeCompare(b.label));
   for (let i = 0; i < sortedFields.length; i++)
   {
      const fieldName = isJoinTable ? `${tableMetaData.name}.${sortedFields[i].name}` : sortedFields[i].name;

      if (hiddenFieldNames && hiddenFieldNames.indexOf(fieldName) > -1 && fieldName != selectedFieldName)
      {
         continue;
      }

      if (availableFieldNames?.length && availableFieldNames.indexOf(fieldName) == -1)
      {
         continue;
      }

      fieldOptions.push({field: sortedFields[i], table: tableMetaData, fieldName: fieldName});
   }
}


/*******************************************************************************
 ** Component for rendering a list of field names from a table as an auto-complete.
 *******************************************************************************/
export default function FieldAutoComplete({id, metaData, tableMetaData, handleFieldChange, defaultValue, autoFocus, forceOpen, hiddenFieldNames, availableFieldNames, variant, label, textFieldSX, autocompleteSlotProps, hasError, noOptionsText, omitExposedJoins, includeVirtualFields}: FieldAutoCompleteProps): JSX.Element
{
   const [selectedFieldName, setSelectedFieldName] = useState(defaultValue ? defaultValue.fieldName : null);

   const fieldOptions: any[] = [];
   makeFieldOptionsForTable(tableMetaData, fieldOptions, false, hiddenFieldNames, availableFieldNames, selectedFieldName, includeVirtualFields);
   let fieldsGroupBy = null;

   const availableExposedJoins = useMemo(() =>
   {
      const rs: QExposedJoin[] = []
      for(let exposedJoin of tableMetaData.exposedJoins ?? [])
      {
         if(omitExposedJoins?.indexOf(exposedJoin.joinTable.name) > -1)
         {
            continue;
         }
         rs.push(exposedJoin);
      }
      return (rs);
   }, [tableMetaData, omitExposedJoins]);

   if (availableExposedJoins && availableExposedJoins.length > 0)
   {
      for (let i = 0; i < availableExposedJoins.length; i++)
      {
         const exposedJoin = availableExposedJoins[i];
         if (metaData.tables.has(exposedJoin.joinTable.name))
         {
            fieldsGroupBy = (option: any) => `${option.table.label} fields`;
            makeFieldOptionsForTable(exposedJoin.joinTable, fieldOptions, true, hiddenFieldNames, availableFieldNames, selectedFieldName);
         }
      }
   }


   function getFieldOptionLabel(option: any)
   {
      /////////////////////////////////////////////////////////////////////////////////////////
      // note - we're using renderFieldOption below for the actual select-box options, which //
      // are always jut field label (as they are under groupings that show their table name) //
      /////////////////////////////////////////////////////////////////////////////////////////
      if (option && option.field && option.table)
      {
         if (option.table.name == tableMetaData.name)
         {
            return (option.field.label);
         }
         else
         {
            return (option.table.label + ": " + option.field.label);
         }
      }

      return ("");
   }


   //////////////////////////////////////////////////////////////////////////////////////////////
   // for options, we only want the field label (contrast with what we show in the input box,  //
   // which comes out of getFieldOptionLabel, which is the table-label prefix for join fields) //
   //////////////////////////////////////////////////////////////////////////////////////////////
   function renderFieldOption(props: React.HTMLAttributes<HTMLLIElement>, option: any, state: AutocompleteRenderOptionState): ReactNode
   {
      let label = "";
      if (option && option.field)
      {
         label = (option.field.label);
      }

      return (<li {...props}>{label}</li>);
   }


   function isFieldOptionEqual(option: any, value: any)
   {
      return option.fieldName === value.fieldName;
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////
   // seems like, if we always add the open attribute, then if its false or null, then the autocomplete //
   // doesn't open at all... so, only add the attribute at all, if forceOpen is true                    //
   ///////////////////////////////////////////////////////////////////////////////////////////////////////
   const alsoOpen: { [key: string]: any } = {};
   if (forceOpen)
   {
      alsoOpen["open"] = forceOpen;
   }


   /*******************************************************************************
    **
    *******************************************************************************/
   function onChange(event: any, newValue: any, reason: string)
   {
      setSelectedFieldName(newValue ? newValue.fieldName : null);
      handleFieldChange(event, newValue, reason);
   }

   return (
      <Autocomplete
         id={id}
         renderInput={(params) =>
         {
            const inputProps = params.InputProps;
            const originalEndAdornment = inputProps.endAdornment;
            inputProps.endAdornment = <Box>
               {hasError && <Icon color="error">error_outline</Icon>}
               {originalEndAdornment}
            </Box>;

            return (<TextField {...params} autoFocus={autoFocus} label={label} variant={variant} sx={textFieldSX} autoComplete="off" type="search" InputProps={inputProps} />);
         }}
         // @ts-ignore
         defaultValue={defaultValue}
         options={fieldOptions}
         onChange={onChange}
         isOptionEqualToValue={(option, value) => isFieldOptionEqual(option, value)}
         groupBy={fieldsGroupBy}
         getOptionLabel={(option) => getFieldOptionLabel(option)}
         renderOption={(props, option, state) => renderFieldOption(props, option, state)}
         autoSelect={true}
         autoHighlight={true}
         slotProps={autocompleteSlotProps ?? {}}
         noOptionsText={noOptionsText}
         {...alsoOpen}
      />

   );
}
