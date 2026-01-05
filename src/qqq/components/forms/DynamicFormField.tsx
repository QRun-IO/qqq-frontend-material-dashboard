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

import {InputAdornment, InputLabel} from "@mui/material";
import Box from "@mui/material/Box";
import Switch from "@mui/material/Switch";
import {AdornmentType} from "@qrunio/qqq-frontend-core/lib/model/metaData/AdornmentType";
import {QPossibleValue} from "@qrunio/qqq-frontend-core/lib/model/QPossibleValue";
import {ErrorMessage, Field, useFormikContext} from "formik";
import colors from "qqq/assets/theme/base/colors";
import BooleanFieldSwitch from "qqq/components/forms/BooleanFieldSwitch";
import DynamicFormFieldAsWidget from "qqq/components/forms/DynamicFormFieldAsWidget";
import DynamicFormUtils from "qqq/components/forms/DynamicFormUtils";
import DynamicSelect from "qqq/components/forms/DynamicSelect";
import MDInput from "qqq/components/legacy/MDInput";
import MDTypography from "qqq/components/legacy/MDTypography";
import React, {useMemo, useState} from "react";
import AceEditor from "react-ace";
import {flushSync} from "react-dom";
import {generateInputId} from "qqq/utils/qqqIdUtils";

// Declaring props types for FormField
interface Props
{
   label: string,
   name: string,
   displayFormat: string,
   value: any,
   type: string,
   isEditable?: boolean,
   placeholder?: string,
   backgroundColor?: string,
   processUUID?: string,
   onChangeCallback?: (newValue: any) => void,
   additionalCallbacks?:
      {
         onTextSelect?: (event: React.SyntheticEvent<HTMLInputElement>) => void;
         onFocus?: (event: React.SyntheticEvent<HTMLInputElement>) => void;
         onBlur?: (event: React.SyntheticEvent<HTMLInputElement>) => void;
      },

   [key: string]: any,

   bulkEditMode?: boolean,
   bulkEditSwitchChangeHandler?: any,
   formFieldObject: any,
   otherValues?: Record<string, any>
}

function QDynamicFormField({
   label,
   name,
   displayFormat,
   value,
   bulkEditMode,
   bulkEditSwitchChangeHandler,
   type,
   isEditable,
   placeholder,
   backgroundColor,
   formFieldObject,
   onChangeCallback,
   additionalCallbacks,
   processUUID,
   otherValues,
   ...rest
}: Props): JSX.Element
{
   const [switchChecked, setSwitchChecked] = useState(false);
   const [isDisabled, setIsDisabled] = useState(!isEditable || bulkEditMode);
   const {inputBorderColor} = colors;

   const {setFieldValue} = useFormikContext();

   const inputLabelProps = {};
   if (type.toLowerCase().match("(date|time)"))
   {
      // @ts-ignore
      inputLabelProps.shrink = true;
   }

   const inputProps: any = {};
   if (displayFormat && displayFormat.startsWith("$"))
   {
      inputProps.startAdornment = <InputAdornment position="start">$</InputAdornment>;
   }
   if (displayFormat && displayFormat.endsWith("%%"))
   {
      inputProps.endAdornment = <InputAdornment position="end">%</InputAdornment>;
   }

   if (placeholder)
   {
      inputProps.placeholder = placeholder;
   }

   if (backgroundColor)
   {
      inputProps.sx = {
         "&.MuiInputBase-root": {
            backgroundColor: backgroundColor
         }
      };
   }

   // @ts-ignore
   const handleOnWheel = (e) =>
   {
      if (type.toLowerCase().match("number"))
      {
         e.target.blur();
      }
   };

   ///////////////////////////////////////////////////////////////////////////////////////
   // check the field meta data for behavior that says to do toUpperCase or toLowerCase //
   ///////////////////////////////////////////////////////////////////////////////////////
   let isToUpperCase = useMemo(() => DynamicFormUtils.isToUpperCase(formFieldObject?.fieldMetaData), [formFieldObject]);
   let isToLowerCase = useMemo(() => DynamicFormUtils.isToLowerCase(formFieldObject?.fieldMetaData), [formFieldObject]);

   ////////////////////////////////////////////////////////////////////////
   // if the field has a toUpperCase or toLowerCase behavior on it, then //
   // apply that rule.  But also, to avoid the cursor always jumping to  //
   // the end of the input, do some manipulation of the selection.       //
   // See: https://giacomocerquone.com/blog/keep-input-cursor-still      //
   // Note, we only want an onChange handle if we're doing one of these  //
   // behaviors, (because teh flushSync is potentially slow).  hence, we //
   // put the onChange in an object and assign it with a spread          //
   ////////////////////////////////////////////////////////////////////////
   let onChange: any = {};
   if (isToUpperCase || isToLowerCase || onChangeCallback)
   {
      onChange.onChange = (e: any) =>
      {
         if (isToUpperCase || isToLowerCase)
         {
            const beforeStart = e.target.selectionStart;
            const beforeEnd = e.target.selectionEnd;

            flushSync(() =>
            {
               let newValue = e.currentTarget.value;
               if (isToUpperCase)
               {
                  newValue = newValue.toUpperCase();
               }
               if (isToLowerCase)
               {
                  newValue = newValue.toLowerCase();
               }
               setFieldValue(name, newValue);
               if (onChangeCallback)
               {
                  onChangeCallback(newValue);
               }
            });

            const input = document.getElementById(name) as HTMLInputElement;
            if (input)
            {
               input.setSelectionRange(beforeStart, beforeEnd);
            }
         }
         else if (onChangeCallback)
         {
            onChangeCallback(e.currentTarget.value);
         }
      };
   }

   /***************************************************************************
    **
    ***************************************************************************/
   function dynamicSelectOnChange(newValue?: QPossibleValue)
   {
      if (onChangeCallback)
      {
         onChangeCallback(newValue == null ? null : newValue.id);
      }
   }

   let field;
   let getsBulkEditHtmlLabel = true;
   if (formFieldObject.possibleValueProps)
   {
      field = (<DynamicSelect
         name={name}
         fieldPossibleValueProps={formFieldObject.possibleValueProps}
         isEditable={!isDisabled}
         fieldLabel={label}
         initialValue={value}
         bulkEditMode={bulkEditMode}
         bulkEditSwitchChangeHandler={bulkEditSwitchChangeHandler}
         onChange={dynamicSelectOnChange}
         // otherValues={otherValuesMap}
         useCase="form"
         processUUID={processUUID}
      />);
   }
   else if (type === "checkbox")
   {
      getsBulkEditHtmlLabel = false;
      field = (<>
         <BooleanFieldSwitch name={name} label={label} value={value} isDisabled={isDisabled} onChangeCallback={onChangeCallback} />
         <Box mt={0.75}>
            <MDTypography component="div" variant="caption" color="error" fontWeight="regular">
               {!isDisabled && <div className="fieldErrorMessage"><ErrorMessage name={name} render={msg => <span data-field-error="true">{msg}</span>} /></div>}
            </MDTypography>
         </Box>
      </>);
   }
   else if (type === "ace")
   {
      let mode = "text";
      if (formFieldObject && formFieldObject.languageMode)
      {
         mode = formFieldObject.languageMode;
      }

      getsBulkEditHtmlLabel = false;
      field = (
         <>
            <InputLabel shrink={true}>{label}</InputLabel>
            <AceEditor
               mode={mode}
               theme="github"
               name="editor"
               editorProps={{$blockScrolling: true}}
               onChange={(value: string, event: any) =>
               {
                  setFieldValue(name, value, false);
                  if (onChangeCallback)
                  {
                     onChangeCallback(value);
                  }
               }}
               setOptions={{useWorker: false}}
               width="100%"
               height="300px"
               value={value}
               style={{border: `1px solid ${inputBorderColor}`, borderRadius: "0.75rem"}}
            />
         </>
      );
   }
   else if (formFieldObject.fieldMetaData.getAdornment(AdornmentType.WIDGET))
   {
      field = (<DynamicFormFieldAsWidget
         name={name ?? formFieldObject.fieldMetaData.name}
         fieldMetaData={formFieldObject?.fieldMetaData}
         setValueCallback={(fieldName: string, value: any) =>
         {
            if(fieldName == name)
            {
               onChangeCallback(value);
            }
            else
            {
               console.log(`Discarding a changed value from a DynamicFormFieldAsWidget: [${fieldName}][${value}]`);
            }
         }}
         otherValues={otherValues}
      />);
   }
   else
   {
      const dataQqqId = generateInputId(undefined, name, label);
      field = (
         <>
            <Field {...rest} {...onChange} onWheel={handleOnWheel} name={name} type={type} as={MDInput} variant="outlined" label={label} InputLabelProps={inputLabelProps} InputProps={inputProps} fullWidth disabled={isDisabled} data-qqq-id={dataQqqId}
               onKeyPress={(e: any) =>
               {
                  if (e.key === "Enter")
                  {
                     e.preventDefault();
                  }
               }}
               onSelect={(event: React.SyntheticEvent<HTMLInputElement>) =>
               {
                  additionalCallbacks?.onTextSelect?.(event);
               }}
               onFocus={(event: React.SyntheticEvent<HTMLInputElement>) =>
               {
                  additionalCallbacks?.onFocus?.(event);
               }}
               onBlur={(event: React.SyntheticEvent<HTMLInputElement>) =>
               {
                  additionalCallbacks?.onBlur?.(event);
               }}
            />
            <Box mt={0.75}>
               <MDTypography component="div" variant="caption" color="error" fontWeight="regular">
                  {!isDisabled && <div className="fieldErrorMessage"><ErrorMessage name={name} render={msg => <span data-field-error="true">{msg}</span>} /></div>}
               </MDTypography>
            </Box>
         </>
      );
   }

   const bulkEditSwitchChanged = () =>
   {
      setBulkEditSwitch(!switchChecked);
   };

   const setBulkEditSwitch = (value: boolean) =>
   {
      const newSwitchValue = value;
      setSwitchChecked(newSwitchValue);
      setIsDisabled(!newSwitchValue);
      bulkEditSwitchChangeHandler(name, newSwitchValue);
   };

   if (bulkEditMode)
   {
      return (
         <Box mb={1.5} display="flex" flexDirection="row">
            <Box alignItems="baseline" pt={1}>
               <Switch
                  id={`bulkEditSwitch-${name}`}
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
            <Box width="100%" sx={{background: (type == "checkbox" && isDisabled) ? "#f0f2f5!important" : "initial"}}>
               {
                  getsBulkEditHtmlLabel
                     ? (<label htmlFor={`bulkEditSwitch-${name}`}>
                        {field}
                     </label>)
                     : <div onClick={() => setBulkEditSwitch(true)}>{field}</div>
               }
            </Box>
         </Box>
      );
   }
   else
   {
      return (
         <Box mb={1.5}>
            {field}
         </Box>
      );
   }
}

QDynamicFormField.defaultProps = {
   bulkEditMode: false,
   isEditable: true,
   bulkEditSwitchChangeHandler: () =>
   {
   },
};

export default QDynamicFormField;
