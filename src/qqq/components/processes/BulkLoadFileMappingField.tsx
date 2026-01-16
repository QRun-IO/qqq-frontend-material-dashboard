/*
 * QQQ - Low-code Application Framework for Engineers.
 * Copyright (C) 2021-2024.  Kingsrook, LLC
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
import {Checkbox, FormControlLabel, Radio, Tooltip} from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Icon from "@mui/material/Icon";
import RadioGroup from "@mui/material/RadioGroup";
import TextField from "@mui/material/TextField";
import {useFormikContext} from "formik";
import colors from "qqq/assets/theme/base/colors";
import QDynamicFormField from "qqq/components/forms/DynamicFormField";
import DynamicFormUtils from "qqq/components/forms/DynamicFormUtils";
import {BulkLoadField, FileDescription} from "qqq/models/processes/BulkLoadModels";
import Client from "qqq/utils/qqq/Client";
import React, {useEffect, useState} from "react";

interface BulkLoadMappingFieldProps
{
   bulkLoadField: BulkLoadField,
   isRequired: boolean,
   removeFieldCallback?: () => void,
   fileDescription: FileDescription,
   forceParentUpdate?: () => void,
   isBulkEdit?: boolean
}

const xIconButtonSX =
   {
      border: `1px solid ${colors.grayLines.main} !important`,
      borderRadius: "0.5rem",
      textTransform: "none",
      fontSize: "1rem",
      fontWeight: "400",
      width: "30px",
      minWidth: "30px",
      height: "2rem",
      minHeight: "2rem",
      paddingLeft: 0,
      paddingRight: 0,
      marginRight: "0.5rem",
      marginTop: "0.5rem",
      color: colors.error.main,
      "&:hover": {color: colors.error.main},
      "&:focus": {color: colors.error.main},
      "&:focus:not(:hover)": {color: colors.error.main},
   };

const qController = Client.getInstance();

/***************************************************************************
 ** row for a single field on the bulk load mapping screen.
 ***************************************************************************/
export default function BulkLoadFileMappingField({bulkLoadField, isRequired, removeFieldCallback, fileDescription, forceParentUpdate, isBulkEdit}: BulkLoadMappingFieldProps): JSX.Element
{
   const columnNames = fileDescription.getColumnNames();

   const [valueType, setValueType] = useState(bulkLoadField.valueType);
   const [selectedColumn, setSelectedColumn] = useState({label: columnNames[bulkLoadField.columnIndex], value: bulkLoadField.columnIndex});
   const [selectedColumnInputValue, setSelectedColumnInputValue] = useState(columnNames[bulkLoadField.columnIndex]);

   const [doingInitialLoadOfPossibleValue, setDoingInitialLoadOfPossibleValue] = useState(false);
   const [everDidInitialLoadOfPossibleValue, setEverDidInitialLoadOfPossibleValue] = useState(false);
   const [possibleValueInitialDisplayValue, setPossibleValueInitialDisplayValue] = useState(null as string);

   const fieldMetaData = new QFieldMetaData(bulkLoadField.field);
   const dynamicField = DynamicFormUtils.getDynamicField(fieldMetaData);
   const dynamicFieldInObject: any = {};
   dynamicFieldInObject[fieldMetaData["name"]] = dynamicField;
   DynamicFormUtils.addPossibleValueProps(dynamicFieldInObject, [fieldMetaData], bulkLoadField.tableStructure.tableName, null, null);

   /////////////////////////////////////////////////////////////////////////////////////
   // deal with dynamically loading the initial default value for a possible value... //
   /////////////////////////////////////////////////////////////////////////////////////
   let actuallyDoingInitialLoadOfPossibleValue = doingInitialLoadOfPossibleValue;
   if (dynamicField.possibleValueProps && bulkLoadField.defaultValue && !doingInitialLoadOfPossibleValue && !everDidInitialLoadOfPossibleValue)
   {
      actuallyDoingInitialLoadOfPossibleValue = true;
      setDoingInitialLoadOfPossibleValue(true);
      setEverDidInitialLoadOfPossibleValue(true);

      (async () =>
      {
         try
         {
            const possibleValues = await qController.possibleValues(bulkLoadField.tableStructure.tableName, null, fieldMetaData.name, null, [bulkLoadField.defaultValue], undefined, null, "filter");
            if (possibleValues && possibleValues.length > 0)
            {
               setPossibleValueInitialDisplayValue(possibleValues[0].label);
            }
            else
            {
               setPossibleValueInitialDisplayValue(null);
            }
         }
         catch (e)
         {
            console.log(`Error loading possible value: ${e}`);
         }

         actuallyDoingInitialLoadOfPossibleValue = false;
         setDoingInitialLoadOfPossibleValue(false);
      })();
   }

   if (dynamicField.possibleValueProps && possibleValueInitialDisplayValue)
   {
      dynamicField.possibleValueProps.initialDisplayValue = possibleValueInitialDisplayValue;
   }

   //////////////////////////////////////////////////////
   // build array of options for the columns drop down //
   // don't allow duplicates                           //
   //////////////////////////////////////////////////////
   const columnOptions: { value: number, label: string }[] = [];
   const usedLabels: { [label: string]: boolean } = {};
   for (let i = 0; i < columnNames.length; i++)
   {
      const label = columnNames[i];
      if (!usedLabels[label])
      {
         columnOptions.push({label: label, value: i});
         usedLabels[label] = true;
      }
   }

   //////////////////////////////////////////////////////////////////////
   // try to pick up changes in the hasHeaderRow toggle from way above //
   //////////////////////////////////////////////////////////////////////
   if (bulkLoadField.columnIndex != null && bulkLoadField.columnIndex != undefined && selectedColumn.label && columnNames[bulkLoadField.columnIndex] != selectedColumn.label)
   {
      setSelectedColumn({label: columnNames[bulkLoadField.columnIndex], value: bulkLoadField.columnIndex});
      setSelectedColumnInputValue(columnNames[bulkLoadField.columnIndex]);
   }

   const mainFontSize = "0.875rem";
   const smallerFontSize = "0.75rem";

   /////////////////////////////////////////////////////////////////////////////////////////////
   // some field types get their value from formik.                                           //
   // so for a pre-populated value, do an on-load useEffect, that'll set the value in formik. //
   /////////////////////////////////////////////////////////////////////////////////////////////
   const {setFieldValue} = useFormikContext();
   useEffect(() =>
   {
      if (valueType == "defaultValue")
      {
         setFieldValue(`${bulkLoadField.field.name}.defaultValue`, bulkLoadField.defaultValue);
      }
   }, []);


   /***************************************************************************
    **
    ***************************************************************************/
   function columnChanged(event: any, newValue: any, reason: string)
   {
      setSelectedColumn(newValue);
      setSelectedColumnInputValue(newValue == null ? "" : newValue.label);

      bulkLoadField.columnIndex = newValue == null ? null : newValue.value;

      if (fileDescription.hasHeaderRow)
      {
         bulkLoadField.headerName = newValue == null ? null : newValue.label;
      }

      bulkLoadField.error = null;
      bulkLoadField.warning = null;
      forceParentUpdate && forceParentUpdate();
   }


   /***************************************************************************
    **
    ***************************************************************************/
   function defaultValueChanged(newValue: any)
   {
      setFieldValue(`${bulkLoadField.field.name}.defaultValue`, newValue);
      bulkLoadField.defaultValue = newValue;
      bulkLoadField.error = null;
      bulkLoadField.warning = null;
      forceParentUpdate && forceParentUpdate();
   }


   /***************************************************************************
    **
    ***************************************************************************/
   function valueTypeChanged(isColumn: boolean)
   {
      const newValueType = isColumn ? "column" : "defaultValue";
      bulkLoadField.valueType = newValueType;
      setValueType(newValueType);
      bulkLoadField.error = null;
      bulkLoadField.warning = null;
      forceParentUpdate && forceParentUpdate();
   }


   /***************************************************************************
    **
    ***************************************************************************/
   function mapValuesChanged(value: boolean)
   {
      bulkLoadField.doValueMapping = value;
      forceParentUpdate && forceParentUpdate();
   }


   /***************************************************************************
    **
    ***************************************************************************/
   function clearIfEmptyChanged(value: boolean)
   {
      bulkLoadField.clearIfEmpty = value;
      forceParentUpdate && forceParentUpdate();
   }


   /***************************************************************************
    **
    ***************************************************************************/
   function changeSelectedColumnInputValue(e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>)
   {
      setSelectedColumnInputValue(e.target.value);
   }

   return (<Box py="0.5rem" sx={{borderBottom: "1px solid lightgray", width: "100%", overflow: "auto"}} id={`blfmf-${bulkLoadField.field.name}`}>
      <Box display="grid" gridTemplateColumns="200px 400px auto" fontSize="1rem" gap="0.5rem" sx={
         {
            "& .MuiFormControlLabel-label": {ml: "0 !important", fontWeight: "normal !important", fontSize: mainFontSize}
         }}>

         <Box display="flex" alignItems="flex-start">
            {
               (!isRequired) && <Tooltip placement="bottom" title="Remove this field from your mapping.">
                  <Button sx={xIconButtonSX} onClick={() => removeFieldCallback()}><Icon>clear</Icon></Button>
               </Tooltip>
            }
            <Box pt="0.625rem">
               {bulkLoadField.getQualifiedLabel()}
            </Box>
         </Box>

         <RadioGroup name="valueType" value={valueType}>
            <Box>
               <Box display="flex" alignItems="center" sx={{height: "45px"}}>
                  <FormControlLabel value="column" control={<Radio size="small" onChange={(event, checked) => valueTypeChanged(checked)} />} label={"File column"} sx={{minWidth: "140px", whiteSpace: "nowrap"}} />
                  {
                     valueType == "column" && <Box width="100%">
                        <Autocomplete
                           id={bulkLoadField.field.name}
                           renderInput={(params) => (<TextField {...params} label={""} value={selectedColumnInputValue} onChange={e => changeSelectedColumnInputValue(e)} fullWidth variant="outlined" autoComplete="off" type="search" InputProps={{...params.InputProps}} sx={{"& .MuiOutlinedInput-root": {borderRadius: "0.75rem"}}} />)}
                           fullWidth
                           options={columnOptions}
                           multiple={false}
                           defaultValue={selectedColumn}
                           value={selectedColumn}
                           inputValue={selectedColumnInputValue}
                           onChange={columnChanged}
                           getOptionLabel={(option) => typeof (option) == "string" ? option : (option?.label ?? "")}
                           isOptionEqualToValue={(option, value) => option == null && value == null || option.value == value.value}
                           renderOption={(props, option, state) => (<li {...props}>{option?.label ?? ""}</li>)}
                           sx={{"& .MuiOutlinedInput-root": {padding: "0"}}}
                        />
                     </Box>
                  }
               </Box>
               <Box display="flex" alignItems="center" sx={{height: "45px"}}>
                  <FormControlLabel value="defaultValue" control={<Radio size="small" onChange={(event, checked) => valueTypeChanged(!checked)} />} label={"Default value"} sx={{minWidth: "140px", whiteSpace: "nowrap"}} />
                  {
                     valueType == "defaultValue" && actuallyDoingInitialLoadOfPossibleValue && <Box width="100%">Loading...</Box>
                  }
                  {
                     valueType == "defaultValue" && !actuallyDoingInitialLoadOfPossibleValue && <Box width="100%">
                        <QDynamicFormField
                           name={`${bulkLoadField.field.name}.defaultValue`}
                           displayFormat={""}
                           label={""}
                           formFieldObject={dynamicField}
                           type={dynamicField.type}
                           value={bulkLoadField.defaultValue}
                           onChangeCallback={defaultValueChanged}
                        />
                     </Box>
                  }
               </Box>
            </Box>
            {
               bulkLoadField.warning &&
               <Box fontSize={smallerFontSize} color={colors.warning.main} ml="145px" className="bulkLoadFieldError">
                  {bulkLoadField.warning}
               </Box>
            }
            {
               bulkLoadField.error &&
               <Box fontSize={smallerFontSize} color={colors.error.main} ml="145px" className="bulkLoadFieldError">
                  {bulkLoadField.error}
               </Box>
            }
         </RadioGroup>

         <Box ml="1rem">
            {
               valueType == "column" && <>
                  <Box display="flex" alignItems="center" sx={{height: "45px"}}>
                     <FormControlLabel value="mapValues" control={<Checkbox size="small" defaultChecked={bulkLoadField.doValueMapping} onChange={(event, checked) => mapValuesChanged(checked)} />} label={"Map values"} sx={{minWidth: "140px", whiteSpace: "nowrap"}} />
                     {
                        isBulkEdit && !isRequired && <FormControlLabel value="clearIfEmpty" control={<Checkbox size="small" defaultChecked={bulkLoadField.clearIfEmpty} onChange={(event, checked) => clearIfEmptyChanged(checked)} />} label={"Clear if empty"} sx={{minWidth: "140px", whiteSpace: "nowrap"}} />
                     }
                  </Box>
                  <Box fontSize={mainFontSize} mt="0.5rem">
                     Preview Values: <span style={{color: "gray"}}>{(fileDescription.getPreviewValues(selectedColumn?.value) ?? [""]).join(", ")}</span>
                  </Box>
               </>
            }
         </Box>

      </Box>
   </Box>);
}
