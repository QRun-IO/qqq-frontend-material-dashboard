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

import {Checkbox, Chip, CircularProgress, FilterOptionsState, Icon} from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import Box from "@mui/material/Box";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";
import {AdornmentType} from "@qrunio/qqq-frontend-core/lib/model/metaData/AdornmentType";
import {QTableMetaData} from "@qrunio/qqq-frontend-core/lib/model/metaData/QTableMetaData";
import {QPossibleValue} from "@qrunio/qqq-frontend-core/lib/model/QPossibleValue";
import {ErrorMessage, useFormikContext} from "formik";
import colors from "qqq/assets/theme/base/colors";
import MDTypography from "qqq/components/legacy/MDTypography";
import {FieldPossibleValueProps} from "qqq/models/fields/FieldPossibleValueProps";
import Client from "qqq/utils/qqq/Client";
import React, {useEffect, useState} from "react";

interface Props
{
   fieldPossibleValueProps: FieldPossibleValueProps;
   overrideId?: string;
   name?: string;
   fieldLabel: string;
   inForm: boolean;
   initialValue?: any;
   initialValues?: QPossibleValue[];
   onChange?: any;
   isEditable?: boolean;
   isMultiple?: boolean;
   bulkEditMode?: boolean;
   bulkEditSwitchChangeHandler?: any;
   otherValues?: Map<string, any>;
   variant: "standard" | "outlined";
   initiallyOpen: boolean;
   useCase: "form" | "filter";
   processUUID?: string | null;
}

DynamicSelect.defaultProps = {
   inForm: true,
   initialValue: null,
   initialValues: undefined,
   onChange: null,
   isEditable: true,
   isMultiple: false,
   bulkEditMode: false,
   otherValues: new Map<string, any>(),
   variant: "outlined",
   initiallyOpen: false,
   bulkEditSwitchChangeHandler: () =>
   {
   },
};

const {inputBorderColor} = colors;


export const getAutocompleteOutlinedStyle = (isDisabled: boolean) =>
{
   return ({
      "& .MuiOutlinedInput-root": {
         borderRadius: "0.75rem",
      },
      "& .MuiInputBase-root": {
         padding: "0.5rem",
         background: isDisabled ? "#f0f2f5!important" : "initial",
      },
      "& .MuiOutlinedInput-root .MuiAutocomplete-input": {
         padding: "0",
         fontSize: "1rem"
      },
      "& .Mui-disabled .MuiOutlinedInput-notchedOutline": {
         borderColor: inputBorderColor
      }
   });
};


const qController = Client.getInstance();

function DynamicSelect({fieldPossibleValueProps, overrideId, name, fieldLabel, inForm, initialValue, initialValues, onChange, isEditable, isMultiple, bulkEditMode, bulkEditSwitchChangeHandler, otherValues, variant, initiallyOpen, useCase, processUUID}: Props)
{
   const {fieldName, initialDisplayValue, possibleValueSourceName, possibleValues, processName, tableName} = fieldPossibleValueProps;

   const [open, setOpen] = useState(initiallyOpen);
   const [options, setOptions] = useState<readonly QPossibleValue[]>([]);
   const [searchTerm, setSearchTerm] = useState(null);
   const [firstRender, setFirstRender] = useState(true);
   const [otherValuesWhenResultsWereLoaded, setOtherValuesWhenResultsWereLoaded] = useState(JSON.stringify(Object.fromEntries((otherValues))));

   useEffect(() =>
   {
      if (tableName && processName)
      {
         console.log("DynamicSelect - you may not provide both a tableName and a processName");
      }
      if (tableName && !fieldName)
      {
         console.log("DynamicSelect - if you provide a tableName, you must also provide a fieldName");
      }
      if (processName && !fieldName)
      {
         console.log("DynamicSelect - if you provide a processName, you must also provide a fieldName");
      }
      if (!fieldName && !possibleValueSourceName)
      {
         console.log("DynamicSelect - you must provide either a fieldName (and a tableName or processName) or a possibleValueSourceName");
      }
      if (fieldName && !possibleValueSourceName)
      {
         if (!tableName || !processName)
         {
            console.log("DynamicSelect - if you provide a fieldName and not a possibleValueSourceName, then you must also provide a tableName or processName");
         }
      }
      if (possibleValueSourceName)
      {
         if (tableName || processName)
         {
            console.log("DynamicSelect - if you provide a possibleValueSourceName, you should not also provide a tableName or processName");
         }
      }

   }, [tableName, processName, fieldName, possibleValueSourceName]);

   ////////////////////////////////////////////////////////////////////////////////////////////////
   // default value - needs to be an array (from initialValues (array) prop) for multiple mode - //
   // else non-multiple, assume we took in an initialValue (id) and initialDisplayValue (label), //
   // and build a little object that looks like a possibleValue out of those                     //
   ////////////////////////////////////////////////////////////////////////////////////////////////
   let [defaultValue, _] = isMultiple ? useState(initialValues ?? undefined)
      : useState(initialValue && initialDisplayValue ? [{id: initialValue, label: initialDisplayValue}] : null);

   if (isMultiple && defaultValue === null)
   {
      defaultValue = [];
   }

   // const loading = open && options.length === 0;
   const [loading, setLoading] = useState(false);
   const [switchChecked, setSwitchChecked] = useState(false);
   const [isDisabled, setIsDisabled] = useState(!isEditable || bulkEditMode);
   const [tableMetaData, setTableMetaData] = useState(null as QTableMetaData);

   let setFieldValueRef: (field: string, value: any, shouldValidate?: boolean) => void = null;
   if (inForm)
   {
      const {setFieldValue} = useFormikContext();
      setFieldValueRef = setFieldValue;
   }


   /*******************************************************************************
    **
    *******************************************************************************/
   const filterInlinePossibleValues = (searchTerm: string, possibleValues: QPossibleValue[]): QPossibleValue[] =>
   {
      return possibleValues.filter(pv => pv.label?.toLowerCase().startsWith(searchTerm));
   };


   /***************************************************************************
    **
    ***************************************************************************/
   const loadResults = async (): Promise<QPossibleValue[]> =>
   {
      if (possibleValues)
      {
         return filterInlinePossibleValues(searchTerm, possibleValues);
      }
      else
      {
         return await qController.possibleValues(
            {
               tableName,
               processName,
               fieldNameOrPossibleValueSourceName: possibleValueSourceName ?? fieldName,
               searchTerm: searchTerm ?? "",
               values: otherValues,
               useCase,
               possibleValueSourceFilter: fieldPossibleValueProps.possibleValueSourceFilter,
               processUUID
            });
      }
   };


   /***************************************************************************
    **
    ***************************************************************************/
   useEffect(() =>
   {
      if (firstRender)
      {
         // console.log("First render, so not searching...");
         setFirstRender(false);

         /*
         if(!initiallyOpen)
         {
            console.log("returning because not initially open?");
            return;
         }
         */
      }
      // console.log("Use effect for searchTerm - searching!");

      let active = true;

      setLoading(true);
      (async () =>
      {
         // console.log(`doing a search with ${searchTerm}`);
         const results: QPossibleValue[] = await loadResults();

         if (tableMetaData == null && tableName)
         {
            let tableMetaData: QTableMetaData = await qController.loadTableMetaData(tableName);
            setTableMetaData(tableMetaData);
         }

         setLoading(false);
         // console.log("Results:")
         // console.log(`${results}`);
         if (active)
         {
            setOptions([...results]);
         }
      })();

      return () =>
      {
         active = false;
      };
   }, [searchTerm]);


   /***************************************************************************
    ** todo - finish... call it in onOpen?
    ***************************************************************************/
   const reloadIfOtherValuesAreChanged = () =>
   {
      if (JSON.stringify(Object.fromEntries(otherValues)) != otherValuesWhenResultsWereLoaded)
      {
         (async () =>
         {
            setLoading(true);
            setOptions([]);

            console.log("Refreshing possible values...");
            const results: QPossibleValue[] = await loadResults();

            setLoading(false);
            setOptions([...results]);
            setOtherValuesWhenResultsWereLoaded(JSON.stringify(Object.fromEntries(otherValues)));
         })();
      }
   };


   /***************************************************************************
    **
    ***************************************************************************/
   const inputChanged = (event: React.SyntheticEvent, value: string, reason: string) =>
   {
      // console.log(`input changed.  Reason: ${reason}, setting search term to ${value}`);
      if (reason !== "reset")
      {
         // console.log(` -> setting search term to ${value}`);
         setSearchTerm(value);
      }
   };


   /***************************************************************************
    **
    ***************************************************************************/
   const handleBlur = (x: any) =>
   {
      setSearchTerm(null);
   };


   /***************************************************************************
    **
    ***************************************************************************/
   const handleChanged = (event: React.SyntheticEvent, value: any | any[], reason: string, details?: string) =>
   {
      // console.log("handleChanged.  value is:");
      // console.log(value);
      setSearchTerm(null);

      if (onChange)
      {
         if (isMultiple)
         {
            onChange(value);
         }
         else
         {
            onChange(value ? new QPossibleValue(value) : null);
         }
      }
      else if (setFieldValueRef && fieldName)
      {
         setFieldValueRef(fieldName, value ? value.id : null);
      }
   };


   /***************************************************************************
    **
    ***************************************************************************/
   const filterOptions = (options: { id: any; label: string; }[], state: FilterOptionsState<{ id: any; label: string; }>): { id: any; label: string; }[] =>
   {
      /////////////////////////////////////////////////////////////////////////////////
      // this looks like a no-op, but it's important to have, otherwise, we can only //
      // get options whose text/label matches the input (e.g., not ids that match)   //
      /////////////////////////////////////////////////////////////////////////////////
      return (options);
   };


   /***************************************************************************
    **
    ***************************************************************************/
   // @ts-ignore
   const renderOption = (props: Object, option: any, {selected}) =>
   {
      let content = (<>{option.label}</>);

      try
      {
         const field = tableMetaData?.fields.get(fieldName);
         if (field)
         {
            const adornment = field.getAdornment(AdornmentType.CHIP);
            if (adornment)
            {
               const color = adornment.getValue("color." + option.id) ?? "default";
               const iconName = adornment.getValue("icon." + option.id) ?? null;
               const iconElement = iconName ? <Icon>{iconName}</Icon> : null;
               content = (<Chip label={option.label} color={color} icon={iconElement} size="small" variant="outlined" sx={{fontWeight: 500}} />);
            }
         }
      }
      catch (e)
      {
      }

      if (isMultiple)
      {
         content = (
            <>
               <Checkbox style={{marginRight: 8}} checked={selected} />
               {content}
            </>
         );
      }

      ///////////////////////////////////////////////////////////////////////////////////////////////
      // we provide a custom renderOption method, to prevent a bug we saw during development,      //
      // where if multiple options had an identical label, then the widget would ... i don't know, //
      // show more options than it should - it was odd to see, and it could be fixed by changing   //
      // a PVS's format to include id - so the idea came, that maybe the LI's needed unique key    //
      // attributes.  so, doing this, w/ key=id, seemed to fix it.                                 //
      ///////////////////////////////////////////////////////////////////////////////////////////////
      return (
         <li {...props} key={option.id} style={{fontSize: "1rem"}}>
            {content}
         </li>
      );
   };


   /***************************************************************************
    **
    ***************************************************************************/
   const bulkEditSwitchChanged = () =>
   {
      const newSwitchValue = !switchChecked;
      setSwitchChecked(newSwitchValue);
      setIsDisabled(!newSwitchValue);
      bulkEditSwitchChangeHandler(fieldName, newSwitchValue);
   };

   ////////////////////////////////////////////
   // for outlined style, adjust some styles //
   ////////////////////////////////////////////
   let autocompleteSX = {};
   if (variant == "outlined")
   {
      autocompleteSX = getAutocompleteOutlinedStyle(isDisabled);
   }

   const autocomplete = (
      <Box>
         <Autocomplete
            id={overrideId ?? fieldName ?? possibleValueSourceName ?? "anonymous"}
            name={name}
            sx={autocompleteSX}
            open={open}
            fullWidth
            onOpen={() =>
            {
               reloadIfOtherValuesAreChanged();
               setOpen(true);
               // console.log("setting open...");
               if (options.length == 0)
               {
                  // console.log("no options yet, so setting search term to ''...");
                  setSearchTerm("");
               }
            }}
            onClose={() =>
            {
               setOpen(false);
            }}
            isOptionEqualToValue={(option, value) => value !== null && value !== undefined && option.id === value.id}
            getOptionLabel={(option) =>
            {
               if (option === null || option === undefined)
               {
                  return ("");
               }

               // @ts-ignore
               if (option && option.length)
               {
                  // @ts-ignore
                  option = option[0];
               }
               // @ts-ignore
               return option.label;
            }}
            options={options}
            loading={loading}
            onInputChange={inputChanged}
            onBlur={handleBlur}
            defaultValue={defaultValue}
            // @ts-ignore
            onChange={handleChanged}
            noOptionsText={"No matches found"}
            onKeyPress={e =>
            {
               if (e.key === "Enter")
               {
                  e.preventDefault();
               }
            }}
            renderOption={renderOption}
            filterOptions={filterOptions}
            disabled={isDisabled}
            multiple={isMultiple}
            disableCloseOnSelect={isMultiple}
            limitTags={5}
            slotProps={{popper: {className: "DynamicSelectPopper"}}}
            renderInput={(params) => (
               <TextField
                  {...params}
                  label={fieldLabel}
                  variant={variant}
                  autoComplete="off"
                  type="search"
                  InputProps={{
                     ...params.InputProps,
                     endAdornment: (
                        <React.Fragment>
                           {loading ? <CircularProgress color="inherit" size={20} /> : null}
                           {params.InputProps.endAdornment}
                        </React.Fragment>
                     ),
                  }}
               />
            )}
         />
         {
            inForm &&
            <Box mt={0.75}>
               <MDTypography component="div" variant="caption" color="error" fontWeight="regular">
                  {!isDisabled && <div className="fieldErrorMessage"><ErrorMessage name={overrideId ?? fieldName ?? possibleValueSourceName ?? "anonymous"} render={msg => <span data-field-error="true">{msg}</span>} /></div>}
               </MDTypography>
            </Box>
         }
      </Box>
   );


   if (bulkEditMode)
   {
      return (
         <Box mb={1.5} display="flex" flexDirection="row">
            <Box alignItems="baseline" pt={1}>
               <Switch
                  id={`bulkEditSwitch-${fieldName}`}
                  checked={switchChecked}
                  onClick={bulkEditSwitchChanged}
                  sx={{
                     top: "-4px",
                     "& .MuiSwitch-track": {
                        height: 20,
                        borderRadius: 10,
                        top: -3,
                        position: "relative"
                     }
                  }}
               />
            </Box>
            <Box width="100%">
               {autocomplete}
            </Box>
         </Box>
      );
   }
   else
   {
      return (
         <Box className="DynamicSelectAutoCompleteWrapper">
            {autocomplete}
         </Box>
      );
   }


}

export default DynamicSelect;
