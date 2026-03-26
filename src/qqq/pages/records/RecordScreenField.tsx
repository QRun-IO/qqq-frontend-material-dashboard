/*
 * QQQ - Low-code Application Framework for Engineers.
 * Copyright (C) 2021-2026.  Kingsrook, LLC
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
import Icon from "@mui/material/Icon";
import IconButton from "@mui/material/IconButton";
import OutlinedInput from "@mui/material/OutlinedInput";
import Tooltip from "@mui/material/Tooltip/Tooltip";
import Typography from "@mui/material/Typography";
import {AdornmentType} from "@qrunio/qqq-frontend-core/lib/model/metaData/AdornmentType";
import {QFieldMetaData} from "@qrunio/qqq-frontend-core/lib/model/metaData/QFieldMetaData";
import {QTableMetaData} from "@qrunio/qqq-frontend-core/lib/model/metaData/QTableMetaData";
import {QTableVariant} from "@qrunio/qqq-frontend-core/lib/model/metaData/QTableVariant";
import {QRecord} from "@qrunio/qqq-frontend-core/lib/model/QRecord";
import {Field, useFormikContext} from "formik";
import {flushSync} from "react-dom";
import DynamicFormUtils, {DynamicFormFieldDefinition} from "qqq/components/forms/DynamicFormUtils";
import DynamicFormFieldAsWidget from "qqq/components/forms/DynamicFormFieldAsWidget";
import DynamicSelect from "qqq/components/forms/DynamicSelect";
import BooleanFieldSwitch from "qqq/components/forms/BooleanFieldSwitch";
import HelpContent, {hasHelpContent} from "qqq/components/misc/HelpContent";
import {FieldValueAsWidget} from "qqq/components/view/FieldValueAsWidget";
import QContext from "QContext";
import RecordScreenContext, {RecordScreenMode} from "qqq/pages/records/RecordScreenContext";
import ValueUtils from "qqq/utils/qqq/ValueUtils";
import React, {useCallback, useContext, useRef, useState, useEffect} from "react";

// target height for all input controls: 26px
const INPUT_HEIGHT = "26px";
const INPUT_FONT_SIZE = "0.875rem"; // 14px
const ERROR_FONT_SIZE = "0.75rem"; // 12px

// ghost border for view mode values to match edit-mode sizing
const viewValueSx = {
   padding: "3px 6px",
   border: "1px solid transparent",
   borderRadius: "3px",
   fontSize: INPUT_FONT_SIZE,
   transition: "border-color 150ms",
   display: "inline-block",
   overflow: "hidden",
   textOverflow: "ellipsis",
   whiteSpace: "nowrap" as const,
   maxWidth: "100%",
   lineHeight: "18px",
   boxSizing: "border-box" as const,
   height: INPUT_HEIGHT,
   // move chips up 3px so they fit in the box height
   "& .MuiChip-root": {
      position: "relative",
      top: "-3px"
   }
};

// non-editable field styling during edit mode
// TODO: these colors are hardcoded — consider integrating with the theme system later
const nonEditableFieldSx = {
   ...viewValueSx,
   color: "#616161",
   backgroundColor: "#F5F5F5",
   border: "1px solid #E0E0E0",
   maxWidth: {xs: "100%", lg: "286px"},
   width: "100%",
};


const rowSx = {
   py: "3px",
   minHeight: "36px",
   display: "flex",
   alignItems: "center"
}


interface RecordScreenFieldProps
{
   field: QFieldMetaData;
   fieldName: string;
   mode: RecordScreenMode;
   record?: QRecord;
   formFieldDef?: DynamicFormFieldDefinition;
   tableMetaData?: QTableMetaData;
   tableVariant?: QTableVariant;
   onEditIconClick?: (fieldName?: string) => void;
}

/***************************************************************************
 ** A single field that renders in either view or edit mode.
 ** In view mode: label on left, display value on right (with ghost border).
 ** In edit mode: label on left, input control on right.
 ***************************************************************************/
export default function RecordScreenField({field, fieldName, mode, record, formFieldDef, tableMetaData, tableVariant, onEditIconClick}: RecordScreenFieldProps): JSX.Element
{
   const {setFieldValue, handleFieldBlur} = useContext(RecordScreenContext);
   const {helpHelpActive} = useContext(QContext);
   const {values: formikValues} = useFormikContext<any>();
   const isEditing = mode === "edit" || mode === "create";
   const isEditable = field.isEditable && isEditing && (formFieldDef?.isEditable !== false);
   const [showCopied, setShowCopied] = useState(false);

   const handleCopyValue = useCallback((e: React.MouseEvent) =>
   {
      e.stopPropagation();
      // use getDisplayValue for proper formatting (e.g., date-times), but fall back
      // to plain display/raw values since getDisplayValue can return JSX for some types
      let formattedValue = record ? ValueUtils.getDisplayValue(field, record, "view", fieldName, tableVariant) : null;
      if (formattedValue != null && typeof formattedValue === "object")
      {
         // getDisplayValue returned JSX — fall back to display value or raw value
         formattedValue = record?.displayValues?.get(fieldName) ?? record?.values?.get(fieldName);
      }
      const textToCopy = formattedValue != null && formattedValue !== "" ? String(formattedValue) : "";
      if (textToCopy)
      {
         navigator.clipboard.writeText(textToCopy);
         setShowCopied(true);
         setTimeout(() => setShowCopied(false), 1500);
      }
   }, [record, field, fieldName, tableVariant]);
   const label = field.label;

   const helpRoles = isEditing
      ? [(mode === "create" ? "INSERT_SCREEN" : "EDIT_SCREEN"), "WRITE_SCREENS", "ALL_SCREENS"]
      : ["VIEW_SCREEN", "READ_SCREENS", "ALL_SCREENS"];
   const showHelp = helpHelpActive || hasHelpContent(field.helpContents, helpRoles);
   const helpContent = <HelpContent helpContents={field.helpContents} roles={helpRoles} heading={isEditing ? undefined : label} helpContentKey={`table:${tableMetaData?.name};field:${fieldName}`} />;

   // widget-adorned fields render specially
   if (field.hasAdornment(AdornmentType.WIDGET))
   {
      if (isEditing)
      {
         return (
            <>
               <DynamicFormFieldAsWidget
                  name={fieldName}
                  fieldMetaData={field}
                  setValueCallback={(name: string, value: any) => setFieldValue(name, value)}
                  otherValues={formikValues}
               />
               <AnimatedFieldError fieldName={fieldName} />
            </>
         );
      }
      return <FieldValueAsWidget field={field} record={record} />;
   }

   const labelElement = (
      <Typography
         className="fieldLabel"
         variant="button"
         textTransform="none"
         fontWeight="bold"
         pr={1}
         color="rgb(52, 71, 103)"
         {...(isEditable ? {component: "label", htmlFor: fieldName} : {})}
         sx={{
            cursor: isEditable ? "pointer" : "default",
            flexShrink: 0,
            fontSize: INPUT_FONT_SIZE,
            lineHeight: 1.2,
            maxWidth: {xs: "174px", lg: "none"},
         }}
      >
         {label}{isEditing && field.isRequired && <span style={{marginLeft: "1px"}}>*</span>}:
      </Typography>
   );

   const wrappedLabel = showHelp && helpContent && !isEditing
      ? <Tooltip title={helpContent}>{labelElement}</Tooltip>
      : labelElement;

   /////////////////////////
   // VIEW MODE RENDERING //
   /////////////////////////
   if (!isEditable)
   {
      const valueSx = isEditing ? nonEditableFieldSx : viewValueSx;
      // in edit mode, show plain text (no links) for non-editable fields
      let displayValue: any;
      if (isEditing)
      {
         // for PV fields, use the initialDisplayValue from the form field def
         // (which was looked up during form data setup); otherwise use
         // ValueUtils.getDisplayValue for proper formatting (e.g., date-times),
         // falling back to plain display/raw values if it returns JSX (links, chips, etc.)
         displayValue = formFieldDef?.possibleValueProps?.initialDisplayValue;
         if (displayValue == null)
         {
            displayValue = record ? ValueUtils.getDisplayValue(field, record, "view", fieldName, tableVariant) : null;
            if (displayValue != null && typeof displayValue === "object")
            {
               displayValue = record?.displayValues?.get(fieldName) ?? record?.values?.get(fieldName);
            }
         }
         displayValue = displayValue ?? formikValues?.[fieldName] ?? "";
      }
      else
      {
         displayValue = record ? ValueUtils.getDisplayValue(field, record, "view", fieldName, tableVariant) : "";
      }
      const rawValue = record?.values?.get(fieldName) ?? formikValues?.[fieldName];
      const hasValue = rawValue != null && String(rawValue) !== "";

      return (
         <Box sx={rowSx} data-field-name={fieldName}>
            <Box
               display="flex"
               alignItems="center"
               sx={{
                  minWidth: 0,
                  flex: 1,
                  "&:hover .field-action-icons": {opacity: 1},
               }}
            >
               {wrappedLabel}
               <Typography
                  variant="button"
                  textTransform="none"
                  fontWeight="regular"
                  color={isEditing ? "#616161" : "rgb(123, 128, 154)"}
                  sx={valueSx}
               >
                  {displayValue}
               </Typography>
               {mode === "view" && (
                  <Box className="field-action-icons" sx={{opacity: showCopied ? 1 : 0, transition: "opacity 150ms", display: "flex", alignItems: "center", flexShrink: 0}}>
                     {hasValue && (
                        <Tooltip title={showCopied ? "Copied" : "Copy value"} open={showCopied || undefined} placement="top" enterDelay={500} enterNextDelay={300}>
                           <IconButton size="small" onClick={handleCopyValue} sx={{ml: 0.5}}>
                              <Icon fontSize="small">content_copy</Icon>
                           </IconButton>
                        </Tooltip>
                     )}
                     {field.isEditable && onEditIconClick && (
                        <Tooltip title="Edit" placement="top" enterDelay={500} enterNextDelay={300}>
                           <IconButton size="small" onClick={() => onEditIconClick(fieldName)} sx={{ml: 0.25}}>
                              <Icon fontSize="small">edit</Icon>
                           </IconButton>
                        </Tooltip>
                     )}
                  </Box>
               )}
            </Box>
         </Box>
      );
   }

   /////////////////////////
   // EDIT MODE RENDERING //
   /////////////////////////
   return (
      <Box data-field-name={fieldName}>
         <Box sx={rowSx}>
            {wrappedLabel}
            <Box sx={{maxWidth: {xs: "none", lg: "286px"}, flex: 1, minWidth: 0, lineHeight: 1}}>
               {renderEditControl(field, fieldName, formFieldDef, formikValues, setFieldValue, handleFieldBlur)}
            </Box>
         </Box>
         {showHelp && <Box color="#757575" fontSize="0.875rem" mt="-0.25rem" pl="2rem">{helpContent}</Box>}
         <AnimatedFieldError fieldName={fieldName} />
      </Box>
   );
}


/***************************************************************************
 ** Animated error message that slides open/closed.
 ** Stays mounted so the close animation can play when the error clears.
 ***************************************************************************/
function AnimatedFieldError({fieldName}: {fieldName: string}): JSX.Element
{
   const {getFieldMeta, submitCount} = useFormikContext<any>();
   const meta = getFieldMeta(fieldName);
   const error = (meta.touched || submitCount > 0) && meta.error ? meta.error : undefined;
   const [displayedError, setDisplayedError] = useState<string | undefined>(undefined);
   const contentRef = useRef<HTMLDivElement>(null);
   const [height, setHeight] = useState(0);

   useEffect(() =>
   {
      if (error)
      {
         // Show the new error text immediately so we can measure it
         setDisplayedError(error);
      }
      else
      {
         // Keep displayed text during close animation, clear after transition
         const timer = setTimeout(() => setDisplayedError(undefined), 200);
         setHeight(0);
         return () => clearTimeout(timer);
      }
   }, [error]);

   // Measure after displayedError updates the DOM
   useEffect(() =>
   {
      if (displayedError && contentRef.current)
      {
         setHeight(contentRef.current.scrollHeight);
      }
   }, [displayedError]);

   return (
      <Box sx={{
         height: `${height}px`,
         overflow: "hidden",
         transition: "height 200ms ease-in-out",
         fontSize: ERROR_FONT_SIZE,
         paddingBottom: displayedError ? "2px" : "0",
      }}>
         <Box ref={contentRef}>
            {displayedError && <Typography variant="caption" color="error" data-field-error={fieldName}>{displayedError}</Typography>}
         </Box>
      </Box>
   );
}


/***************************************************************************
 ** render the appropriate edit control for a field
 ***************************************************************************/
function renderEditControl(field: QFieldMetaData, fieldName: string, formFieldDef: DynamicFormFieldDefinition, formikValues?: any, setFieldValue?: (name: string, value: any) => void, handleFieldBlur?: (fieldName: string, value: any) => void): JSX.Element
{
   if (!formFieldDef)
   {
      return <Typography variant="body2" color="text.secondary">Field not configured</Typography>;
   }

   // possible value / dropdown
   if (formFieldDef.possibleValueProps)
   {
      return (
         <DynamicSelect
            fieldPossibleValueProps={formFieldDef.possibleValueProps}
            name={fieldName}
            isEditable={formFieldDef.isEditable}
            fieldLabel=""
            useCase="form"
            inForm={false}
            initialValue={formikValues?.[fieldName]}
            onChange={(value: any) => setFieldValue(fieldName, value ? value.id : null)}
         />
      );
   }

   // boolean / checkbox
   if (formFieldDef.type === "checkbox")
   {
      return <BooleanFieldSwitch name={fieldName} label="" value={formikValues?.[fieldName] ?? false} isDisabled={!formFieldDef.isEditable} />;
   }

   // default: text/number/datetime/etc via Formik Field
   const isToUpperCase = DynamicFormUtils.isToUpperCase(field);
   const isToLowerCase = DynamicFormUtils.isToLowerCase(field);

   let caseChangeOnChange: any = {};
   if (isToUpperCase || isToLowerCase)
   {
      caseChangeOnChange.onChange = (e: any) =>
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
            setFieldValue(fieldName, newValue);
         });

         const input = document.getElementById(fieldName) as HTMLInputElement;
         if (input)
         {
            input.setSelectionRange(beforeStart, beforeEnd);
         }
      };
   }

   return (
      <Field
         name={fieldName}
         id={fieldName}
         type={formFieldDef.type}
         as={OutlinedInput}
         size="small"
         fullWidth
         sx={{
            ".compactForm &": {
               height: INPUT_HEIGHT,
            },
            ".compactForm & .MuiOutlinedInput-input": {
               padding: "3px 6px",
               fontSize: INPUT_FONT_SIZE,
               height: "18px",
               boxSizing: "content-box",
            },
            ".compactForm & .MuiOutlinedInput-notchedOutline": {
               borderRadius: "3px",
            },
         }}
         inputProps={{
            id: fieldName,
            style: {
               overflow: "hidden",
               textOverflow: "ellipsis",
            },
         }}
         onKeyDown={(e: React.KeyboardEvent) =>
         {
            if (e.key === "Enter")
            {
               e.preventDefault();
            }
         }}
         onBlur={(e: React.FocusEvent<HTMLInputElement>) =>
         {
            handleFieldBlur?.(fieldName, e.target.value);
         }}
         {...caseChangeOnChange}
      />
   );
}
