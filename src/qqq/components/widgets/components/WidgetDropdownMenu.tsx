/*
 * QQQ - Low-code Application Framework for Engineers.
 * Copyright (C) 2021-2022.  Kingsrook, LLC
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

import {CalendarTodayOutlined} from "@mui/icons-material";
import {Collapse, InputAdornment, Theme} from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import Box from "@mui/material/Box";
import Icon from "@mui/material/Icon";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import {SxProps} from "@mui/system";
import {DatePicker, DateValidationError, LocalizationProvider, PickerChangeHandlerContext, PickerValidDate} from "@mui/x-date-pickers";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import {Field, Form, Formik} from "formik";
import QContext from "QContext";
import colors from "qqq/assets/theme/base/colors";
import MDInput from "qqq/components/legacy/MDInput";
import ValueUtils from "qqq/utils/qqq/ValueUtils";
import React, {useContext, useEffect, useState} from "react";


export interface DropdownOption
{
   id: string;
   label: string;
}

/////////////////////////
// inputs and defaults //
/////////////////////////
interface Props
{
   name: string;
   type?: string;
   defaultValue?: any;
   label?: string;
   startIcon?: string;
   width?: number;
   disableClearable?: boolean;
   allowBackAndForth?: boolean;
   backAndForthInverted?: boolean;
   dropdownOptions?: DropdownOption[];
   onChangeCallback?: (dropdownLabel: string, data: any) => void;
   sx?: SxProps<Theme>;
}

interface StartAndEndDate
{
   startDate?: string,
   endDate?: string
}

function parseCustomTimeValuesFromDefaultValue(defaultValue: any): StartAndEndDate
{
   const customTimeValues: StartAndEndDate = {};
   if (defaultValue && defaultValue.id)
   {
      var parts = defaultValue.id.split(",");
      if (parts.length >= 2)
      {
         customTimeValues["startDate"] = ValueUtils.formatDateTimeValueForForm(parts[1]);
      }
      if (parts.length >= 3)
      {
         customTimeValues["endDate"] = ValueUtils.formatDateTimeValueForForm(parts[2]);
      }
   }

   return (customTimeValues);
}

function makeBackendValuesFromFrontendValues(frontendDefaultValues: StartAndEndDate): StartAndEndDate
{
   const backendTimeValues: StartAndEndDate = {};
   if (frontendDefaultValues && frontendDefaultValues.startDate)
   {
      backendTimeValues.startDate = ValueUtils.frontendLocalZoneDateTimeStringToUTCStringForBackend(frontendDefaultValues.startDate);
   }
   if (frontendDefaultValues && frontendDefaultValues.endDate)
   {
      backendTimeValues.endDate = ValueUtils.frontendLocalZoneDateTimeStringToUTCStringForBackend(frontendDefaultValues.endDate);
   }
   return (backendTimeValues);
}

function WidgetDropdownMenu({name, type, defaultValue, label, startIcon, width, disableClearable, allowBackAndForth, backAndForthInverted, dropdownOptions, onChangeCallback, sx}: Props): JSX.Element
{
   const [customTimesVisible, setCustomTimesVisible] = useState(defaultValue && defaultValue.id && defaultValue.id.startsWith("custom,"));
   const [customTimeValuesFrontend, setCustomTimeValuesFrontend] = useState(parseCustomTimeValuesFromDefaultValue(defaultValue) as StartAndEndDate);
   const [customTimeValuesBackend, setCustomTimeValuesBackend] = useState(makeBackendValuesFromFrontendValues(customTimeValuesFrontend) as StartAndEndDate);
   const [debounceTimeout, setDebounceTimeout] = useState(null as any);

   const [isOpen, setIsOpen] = useState(false);
   const [value, setValue] = useState(defaultValue);
   const [dateValue, setDateValue] = useState(defaultValue);
   const [inputValue, setInputValue] = useState("");

   const [backDisabled, setBackDisabled] = useState(false);
   const [forthDisabled, setForthDisabled] = useState(false);

   const {accentColor} = useContext(QContext);

   const doForceOpen = (event: React.MouseEvent<HTMLDivElement>) =>
   {
      setIsOpen(true);
   };

   useEffect(() =>
   {
      if (type == "DATE_PICKER")
      {
         handleOnChange(null, defaultValue, null);
      }
   }, [defaultValue]);

   function getSelectedIndex(value: DropdownOption)
   {
      let currentIndex = null;
      for (let i = 0; i < dropdownOptions.length; i++)
      {
         if (value && dropdownOptions[i].id == value.id)
         {
            currentIndex = i;
            break;
         }
      }
      return currentIndex;
   }


   const navigateBackAndForth = (event: React.MouseEvent, direction: -1 | 1, type: string) =>
   {
      event.stopPropagation();

      if (type == "DATE_PICKER")
      {
         let currentDate = new Date(dateValue);
         currentDate.setDate(currentDate.getDate() + direction);
         handleOnChange(null, currentDate, null);
         return;
      }

      let currentIndex = getSelectedIndex(value);

      if (currentIndex == null)
      {
         console.log("No current value.... TODO");
         return;
      }

      if (currentIndex == 0 && direction == -1)
      {
         console.log("Can't go -1");
         return;
      }

      if (currentIndex == dropdownOptions.length - 1 && direction == 1)
      {
         console.log("Can't go +1");
         return;
      }

      handleOnChange(event, dropdownOptions[currentIndex + direction], "navigatedBackAndForth");
   };


   const handleDatePickerOnChange = (value: PickerValidDate, context: PickerChangeHandlerContext<DateValidationError>) =>
   {
      if (value.isValid())
      {
         handleOnChange(null, value.toDate(), null);
      }
   };


   const handleOnChange = (event: any, newValue: any, reason: string) =>
   {
      if (type == "DATE_PICKER")
      {
         setDateValue(newValue);
         newValue = {"id": new Date(newValue).toLocaleDateString()};
      }
      else
      {
         setValue(newValue);
      }

      const isTimeframeCustom = name == "timeframe" && newValue && newValue.id == "custom";
      setCustomTimesVisible(isTimeframeCustom);

      if (isTimeframeCustom)
      {
         callOnChangeCallbackIfCustomTimeframeHasDateValues();
      }
      else
      {
         onChangeCallback(label, newValue);
      }

      /* this had bugs (seemed to not take immediate effect?), so don't use for now.
      let currentIndex = getSelectedIndex(value);
      if(currentIndex == 0)
      {
         backAndForthInverted ? setForthDisabled(true) : setBackDisabled(true);
      }
      else
      {
         backAndForthInverted ? setForthDisabled(false) : setBackDisabled(false);
      }

      if (currentIndex == dropdownOptions.length - 1)
      {
         backAndForthInverted ? setBackDisabled(true) : setForthDisabled(true);
      }
      else
      {
         backAndForthInverted ? setBackDisabled(false) : setForthDisabled(false);
      }
      */
   };

   const handleOnInputChange = (event: any, newValue: any, reason: string) =>
   {
      setInputValue(newValue);
   };

   const callOnChangeCallbackIfCustomTimeframeHasDateValues = () =>
   {
      if (customTimeValuesBackend["startDate"] && customTimeValuesBackend["endDate"])
      {
         onChangeCallback(label, {id: `custom,${customTimeValuesBackend["startDate"]},${customTimeValuesBackend["endDate"]}`, label: "Custom"});
      }
   };

   let customTimes = <></>;
   if (name == "timeframe")
   {
      const handleSubmit = async (values: any, actions: any) =>
      {
      };

      const dateChanged = (fieldName: "startDate" | "endDate", event: any) =>
      {
         customTimeValuesFrontend[fieldName] = event.target.value;
         customTimeValuesBackend[fieldName] = ValueUtils.frontendLocalZoneDateTimeStringToUTCStringForBackend(event.target.value);

         clearTimeout(debounceTimeout);
         const newDebounceTimeout = setTimeout(() =>
         {
            callOnChangeCallbackIfCustomTimeframeHasDateValues();
         }, 500);
         setDebounceTimeout(newDebounceTimeout);
      };

      customTimes = <Box sx={{display: "inline-block", position: "relative", top: "-7px"}}>
         <Collapse orientation="horizontal" in={customTimesVisible}>
            <Formik initialValues={customTimeValuesFrontend} onSubmit={handleSubmit}>
               {({}) => (
                  <Form id="timeframe-form" autoComplete="off">
                     <Field name="startDate" type="datetime-local" as={MDInput} variant="standard" label="Custom Timeframe Start" InputLabelProps={{shrink: true}} InputProps={{size: "small"}} sx={{ml: 2, width: 198}} onChange={(event: any) => dateChanged("startDate", event)} />
                     <Field name="endDate" type="datetime-local" as={MDInput} variant="standard" label="Custom Timeframe End" InputLabelProps={{shrink: true}} InputProps={{size: "small"}} sx={{ml: 2, width: 198}} onChange={(event: any) => dateChanged("endDate", event)} />
                  </Form>
               )}
            </Formik>
         </Collapse>
      </Box>;
   }

   const startAdornment = startIcon ? <Icon sx={{fontSize: "1.25rem!important", color: colors.gray.main, paddingLeft: allowBackAndForth ? "auto" : "0.25rem", width: allowBackAndForth ? "1.5rem" : "1.75rem"}}>{startIcon}</Icon> : null;

   ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
   // we tried this end-adornment, for a different style of down-arrow - but by using it, we then messed something else up (i forget what), so... not used right now //
   ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
   const endAdornment = <InputAdornment position="end" sx={{position: "absolute", right: allowBackAndForth ? "-0.5rem" : "0.5rem"}}><Icon sx={{fontSize: "1.75rem!important", color: colors.gray.main}}>keyboard_arrow_down</Icon></InputAdornment>;

   const fontSize = "1rem";
   let optionPaddingLeftRems = 0.75;
   if (startIcon)
   {
      optionPaddingLeftRems += allowBackAndForth ? 1.5 : 1.75;
   }
   if (allowBackAndForth)
   {
      optionPaddingLeftRems += 2.5;
   }

   if (type == "DATE_PICKER")
   {
      return (
         <Box sx={{
            ...sx,
            background: "white",
            width: "250px",
            borderRadius: "0.75rem !important",
            border: `1px solid ${colors.grayLines.main}`,
            "& *": {cursor: "pointer"}
         }} display="flex" alignItems="center" onClick={(event) => doForceOpen(event)}>
            {allowBackAndForth && <IconButton sx={{padding: 0, margin: "8px"}} onClick={(event) => navigateBackAndForth(event, backAndForthInverted ? 1 : -1, type)} disabled={backDisabled}><Icon>navigate_before</Icon></IconButton>}
            <LocalizationProvider dateAdapter={AdapterDayjs}>
               <DatePicker
                  sx={{paddingRight: "8px"}}
                  defaultValue={dayjs(defaultValue)}
                  name={name}
                  value={dayjs(dateValue)}
                  onChange={handleDatePickerOnChange}
                  slots={{
                     openPickerIcon: CalendarTodayOutlined
                  }}
                  slotProps={{
                     openPickerIcon: {sx: {fontSize: "1.25rem !important", color: "#757575"}},
                     actionBar: {actions: ["today"]},
                     textField: {variant: "standard", InputProps: {sx: {fontSize: "16px", color: "#495057"}, disableUnderline: true}}
                  }}
               />
            </LocalizationProvider>
            {allowBackAndForth && <IconButton onClick={(event) => navigateBackAndForth(event, backAndForthInverted ? -1 : 1, type)} disabled={forthDisabled}><Icon>navigate_next</Icon></IconButton>}
         </Box>
      );
   }
   else
   {
      return (
         dropdownOptions ? (
            <Box sx={{
               whiteSpace: "nowrap", display: "flex",
               "& .MuiPopperUnstyled-root": {
                  border: `1px solid ${colors.grayLines.main}`,
                  borderTop: "none",
                  borderRadius: "0 0 0.75rem 0.75rem",
                  padding: 0,
               }, "& .MuiPaper-rounded": {
                  borderRadius: "0 0 0.75rem 0.75rem",
               }
            }} className="dashboardDropdownMenu">
               <Autocomplete
                  id={`${label}-combo-box`}

                  defaultValue={defaultValue}
                  value={value}
                  onChange={handleOnChange}
                  inputValue={inputValue}
                  onInputChange={handleOnInputChange}

                  isOptionEqualToValue={(option, value) => option.id === value.id}

                  open={isOpen}
                  onOpen={() => setIsOpen(true)}
                  onClose={() => setIsOpen(false)}

                  size="small"
                  disablePortal
                  disableClearable={disableClearable}
                  options={dropdownOptions}
                  sx={{
                     ...sx,
                     cursor: "pointer",
                     display: "inline-block",
                     "& .MuiOutlinedInput-notchedOutline": {
                        border: "none"
                     },
                  }}
                  renderInput={(params: any) =>
                     <>
                        <Box sx={{width: `${width}px`, background: "white", borderRadius: isOpen ? "0.75rem 0.75rem 0 0" : "0.75rem", border: `1px solid ${colors.grayLines.main}`, "& *": {cursor: "pointer"}}} display="flex" alignItems="center" onClick={(event) => doForceOpen(event)}>
                           {allowBackAndForth && <IconButton onClick={(event) => navigateBackAndForth(event, backAndForthInverted ? 1 : -1, type)} disabled={backDisabled}><Icon>navigate_before</Icon></IconButton>}
                           <TextField {...params} placeholder={label} sx={{
                              "& .MuiInputBase-input": {
                                 fontSize: fontSize
                              }
                           }} InputProps={{...params.InputProps, startAdornment: startAdornment/*, endAdornment: endAdornment*/}}
                           />
                           {allowBackAndForth && <IconButton onClick={(event) => navigateBackAndForth(event, backAndForthInverted ? -1 : 1, type)} disabled={forthDisabled}><Icon>navigate_next</Icon></IconButton>}
                        </Box>
                     </>
                  }
                  renderOption={(props, option: DropdownOption) => (
                     <li {...props} style={{whiteSpace: "normal", fontSize: fontSize, paddingLeft: `${optionPaddingLeftRems}rem`}}>{option.label}</li>
                  )}

                  noOptionsText={<Box fontSize={fontSize}>No options found</Box>}

                  slotProps={{
                     popper: {
                        sx: {
                           width: `${width}px!important`
                        }
                     }
                  }}
               />
               {customTimes}
            </Box>
         ) : null
      );
   }
}

export default WidgetDropdownMenu;
