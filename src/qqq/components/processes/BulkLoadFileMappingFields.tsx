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


import Box from "@mui/material/Box";
import Icon from "@mui/material/Icon";
import colors from "qqq/assets/theme/base/colors";
import QHierarchyAutoComplete, {Group, Option} from "qqq/components/misc/QHierarchyAutoComplete";
import BulkLoadFileMappingField from "qqq/components/processes/BulkLoadFileMappingField";
import {BulkLoadField, BulkLoadMapping, FileDescription} from "qqq/models/processes/BulkLoadModels";
import React, {useEffect, useReducer, useState} from "react";

interface BulkLoadMappingFieldsProps
{
   bulkLoadMapping: BulkLoadMapping,
   fileDescription: FileDescription,
   forceParentUpdate?: () => void,
   isBulkEdit?: boolean
}


const ADD_SINGLE_FIELD_TOOLTIP = "Click to add this field to your mapping.";
const ADD_MANY_FIELD_TOOLTIP = "Click to add this field to your mapping as many times as you need.";
const ALREADY_ADDED_FIELD_TOOLTIP = "This field has already been added to your mapping.";

/***************************************************************************
 ** The section of the bulk load mapping screen with all the fields.
 ***************************************************************************/
export default function BulkLoadFileMappingFields({bulkLoadMapping, fileDescription, forceParentUpdate, isBulkEdit}: BulkLoadMappingFieldsProps): JSX.Element
{
   const [, forceUpdate] = useReducer((x) => x + 1, 0);

   const [forceHierarchyAutoCompleteRerender, setForceHierarchyAutoCompleteRerender] = useState(0);

   ////////////////////////////////////////////
   // build list of fields that can be added //
   ////////////////////////////////////////////
   const [addFieldsGroup, setAddFieldsGroup] = useState({
      label: bulkLoadMapping.tablesByPath[""]?.label,
      value: "mainTable",
      options: [],
      subGroups: []
   } as Group);
   // const [addFieldsToggleStates, setAddFieldsToggleStates] = useState({} as { [name: string]: boolean });
   const [addFieldsDisableStates, setAddFieldsDisableStates] = useState({} as { [name: string]: boolean });
   const [tooltips, setTooltips] = useState({} as { [name: string]: string });

   useEffect(() =>
   {
      const newDisableStates: { [name: string]: boolean } = {};
      const newTooltips: { [name: string]: string } = {};

      /////////////////////////////////////////////////////////////////////////////////////////////
      // do the unused fields array first, as we've got some use-case where i think a field from //
      // suggested mappings (or profiles?) are in this list, even though they shouldn't be?      //
      /////////////////////////////////////////////////////////////////////////////////////////////
      for (let field of bulkLoadMapping.unusedFields)
      {
         const qualifiedName = field.getQualifiedName();
         newTooltips[qualifiedName] = field.isMany() ? ADD_MANY_FIELD_TOOLTIP : ADD_SINGLE_FIELD_TOOLTIP;
      }

      //////////////////////////////////////////////////
      // then do all the required & additional fields //
      //////////////////////////////////////////////////
      for (let field of [...(bulkLoadMapping.requiredFields ?? []), ...(bulkLoadMapping.additionalFields ?? [])])
      {
         const qualifiedName = field.getQualifiedName();

         if (bulkLoadMapping.layout == "WIDE" && field.isMany())
         {
            newDisableStates[qualifiedName] = false;
            newTooltips[qualifiedName] = ADD_MANY_FIELD_TOOLTIP;
         }
         else
         {
            newDisableStates[qualifiedName] = true;
            newTooltips[qualifiedName] = ALREADY_ADDED_FIELD_TOOLTIP;
         }
      }

      setAddFieldsDisableStates(newDisableStates);
      setTooltips(newTooltips);
      setForceHierarchyAutoCompleteRerender(forceHierarchyAutoCompleteRerender + 1);

   }, [bulkLoadMapping, bulkLoadMapping.layout]);


   ///////////////////////////////////////////////
   // initialize this structure on first render //
   ///////////////////////////////////////////////
   if (addFieldsGroup.options.length == 0)
   {
      for (let qualifiedFieldName in bulkLoadMapping.fieldsByTablePrefix[""])
      {
         const bulkLoadField = bulkLoadMapping.fieldsByTablePrefix[""][qualifiedFieldName];
         const field = bulkLoadField.field;
         addFieldsGroup.options.push({label: field.label, value: field.name, bulkLoadField: bulkLoadField});
      }

      for (let prefix in bulkLoadMapping.fieldsByTablePrefix)
      {
         if (prefix == "")
         {
            continue;
         }

         const associationOptions: Option[] = [];
         const tableStructure = bulkLoadMapping.tablesByPath[prefix];
         addFieldsGroup.subGroups.push({label: tableStructure.label, value: tableStructure.associationPath, options: associationOptions});

         for (let qualifiedFieldName in bulkLoadMapping.fieldsByTablePrefix[prefix])
         {
            const bulkLoadField = bulkLoadMapping.fieldsByTablePrefix[prefix][qualifiedFieldName];
            const field = bulkLoadField.field;
            associationOptions.push({label: field.label, value: field.name, bulkLoadField: bulkLoadField});
         }
      }
   }


   /***************************************************************************
    **
    ***************************************************************************/
   function removeField(bulkLoadField: BulkLoadField)
   {
      addFieldsDisableStates[bulkLoadField.getQualifiedName()] = false;
      setAddFieldsDisableStates(Object.assign({}, addFieldsDisableStates));

      if (bulkLoadMapping.layout == "WIDE" && bulkLoadField.isMany())
      {
         //////////////////////////////////////////////////////////////////////////
         // ok, you can add more - so don't disable and don't change the tooltip //
         //////////////////////////////////////////////////////////////////////////
      }
      else
      {
         tooltips[bulkLoadField.getQualifiedName()] = ADD_SINGLE_FIELD_TOOLTIP;
      }

      bulkLoadMapping.removeField(bulkLoadField);
      forceUpdate();
      forceParentUpdate();
      setForceHierarchyAutoCompleteRerender(forceHierarchyAutoCompleteRerender + 1);
   }

   /***************************************************************************
    **
    ***************************************************************************/
   function handleToggleField(option: Option, group: Group, newValue: boolean)
   {
      const fieldKey = group.value == "mainTable" ? option.value : group.value + "." + option.value;

      // addFieldsToggleStates[fieldKey] = newValue;
      // setAddFieldsToggleStates(Object.assign({}, addFieldsToggleStates));

      addFieldsDisableStates[fieldKey] = newValue;
      setAddFieldsDisableStates(Object.assign({}, addFieldsDisableStates));

      const bulkLoadField = bulkLoadMapping.fields[fieldKey];
      if (bulkLoadField)
      {
         if (newValue)
         {
            bulkLoadMapping.addField(bulkLoadField);
         }
         else
         {
            bulkLoadMapping.removeField(bulkLoadField);
         }

         forceUpdate();
         forceParentUpdate();
      }
   }


   /***************************************************************************
    **
    ***************************************************************************/
   function handleAddField(option: Option, group: Group)
   {
      const fieldKey = group.value == "mainTable" ? option.value : group.value + "." + option.value;

      const bulkLoadField = bulkLoadMapping.fields[fieldKey];
      if (bulkLoadField)
      {
         bulkLoadMapping.addField(bulkLoadField);

         // addFieldsDisableStates[fieldKey] = true;
         // setAddFieldsDisableStates(Object.assign({}, addFieldsDisableStates));

         if (bulkLoadMapping.layout == "WIDE" && bulkLoadField.isMany())
         {
            //////////////////////////////////////////////////////////////////////////
            // ok, you can add more - so don't disable and don't change the tooltip //
            //////////////////////////////////////////////////////////////////////////
         }
         else
         {
            addFieldsDisableStates[fieldKey] = true;
            setAddFieldsDisableStates(Object.assign({}, addFieldsDisableStates));

            tooltips[fieldKey] = ALREADY_ADDED_FIELD_TOOLTIP;
         }

         forceUpdate();
         forceParentUpdate();

         document.getElementById("addFieldsButton")?.scrollIntoView();
      }
   }


   let buttonBackground = "none";
   let buttonBorder = colors.grayLines.main;
   let buttonColor = colors.gray.main;

   const addFieldMenuButtonStyles = {
      borderRadius: "0.75rem",
      border: `1px solid ${buttonBorder}`,
      color: buttonColor,
      textTransform: "none",
      fontWeight: 500,
      fontSize: "0.875rem",
      p: "0.5rem",
      backgroundColor: buttonBackground,
      "&:focus:not(:hover)": {
         color: buttonColor,
         backgroundColor: buttonBackground,
      },
      "&:hover": {
         color: buttonColor,
         backgroundColor: buttonBackground,
      }
   };

   return (
      <>
         {isBulkEdit ? <h5>Key Fields</h5> : <h5>Required Fields</h5>}
         <Box pl={"1rem"}>
            {
               bulkLoadMapping.requiredFields.length == 0 &&
               (
                  isBulkEdit ?
                     <i style={{fontSize: "0.875rem"}}>Select table key fields to continue.</i>
                     :
                     <i style={{fontSize: "0.875rem"}}>There are no required fields in this table.</i>
               )
            }
            {bulkLoadMapping.requiredFields.map((bulkLoadField) => (
               <BulkLoadFileMappingField
                  fileDescription={fileDescription}
                  key={bulkLoadField.getKey()}
                  bulkLoadField={bulkLoadField}
                  isRequired={true}
                  forceParentUpdate={forceParentUpdate}
                  isBulkEdit={isBulkEdit}
               />
            ))}
         </Box>

         <Box mt="1rem">
            {isBulkEdit ? <h5>Fields To Update</h5> : <h5>Additional Fields</h5>}
            <Box pl={"1rem"}>
               {bulkLoadMapping.additionalFields.map((bulkLoadField) => (
                  <BulkLoadFileMappingField
                     fileDescription={fileDescription}
                     key={bulkLoadField.getKey()}
                     bulkLoadField={bulkLoadField}
                     isRequired={false}
                     removeFieldCallback={() => removeField(bulkLoadField)}
                     forceParentUpdate={forceParentUpdate}
                     isBulkEdit={isBulkEdit}
                  />
               ))}

               <Box display="flex" pt="1rem" pl="12.5rem">
                  <QHierarchyAutoComplete
                     idPrefix="addFieldAutocomplete"
                     defaultGroup={addFieldsGroup}
                     menuDirection="up"
                     buttonProps={{id: "addFieldsButton", sx: addFieldMenuButtonStyles}}
                     buttonChildren={<><Icon sx={{mr: "0.5rem"}}>add</Icon> Add Fields <Icon sx={{ml: "0.5rem"}}>keyboard_arrow_down</Icon></>}
                     isModeSelectOne
                     keepOpenAfterSelectOne
                     handleSelectedOption={handleAddField}
                     forceRerender={forceHierarchyAutoCompleteRerender}
                     disabledStates={addFieldsDisableStates}
                     tooltips={tooltips}
                  />
               </Box>
            </Box>
         </Box>
      </>
   );
}

