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

import {Tooltip} from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import TextField from "@mui/material/TextField";
import {QFieldMetaData} from "@qrunio/qqq-frontend-core/lib/model/metaData/QFieldMetaData";
import {QFieldType} from "@qrunio/qqq-frontend-core/lib/model/metaData/QFieldType";
import {QTableMetaData} from "@qrunio/qqq-frontend-core/lib/model/metaData/QTableMetaData";
import {FieldFunction} from "@qrunio/qqq-frontend-core/lib/model/query/FieldFunction";
import {QCriteriaOperator} from "@qrunio/qqq-frontend-core/lib/model/query/QCriteriaOperator";
import {QFilterCriteria} from "@qrunio/qqq-frontend-core/lib/model/query/QFilterCriteria";
import QContext from "QContext";
import colors from "qqq/assets/theme/base/colors";
import {QFilterCriteriaWithId} from "qqq/components/query/CustomFilterPanel";
import {getDefaultCriteriaValue, getOperatorOptions, getValueModeRequiredCount, OperatorOption, validateCriteria, ValueMode} from "qqq/components/query/FilterCriteriaRow";
import FilterCriteriaRowValues from "qqq/components/query/FilterCriteriaRowValues";
import XIcon from "qqq/components/query/XIcon";
import {QueryScreenUsage} from "qqq/pages/records/query/RecordQuery";
import FilterUtils from "qqq/utils/qqq/FilterUtils";
import TableUtils from "qqq/utils/qqq/TableUtils";
import React, {SyntheticEvent, useContext, useEffect, useReducer, useState} from "react";

export type CriteriaParamType = QFilterCriteriaWithId | null | "tooComplex";

interface QuickFilterProps
{
   tableMetaData: QTableMetaData;
   fullFieldName: string;
   fieldMetaData: QFieldMetaData;
   criteriaParam: CriteriaParamType;
   updateCriteria: (newCriteria: QFilterCriteria, needDebounce: boolean, doRemoveCriteria: boolean) => void;
   defaultOperator?: QCriteriaOperator;
   handleRemoveQuickFilterField?: (fieldName: string) => void;
   queryScreenUsage?: QueryScreenUsage;
   allowVariables?: boolean;
}

QuickFilter.defaultProps =
   {
      defaultOperator: QCriteriaOperator.EQUALS,
      handleRemoveQuickFilterField: null
   };

let seedId = new Date().getTime() % 173237;

export const quickFilterButtonStyles = {
   fontSize: "0.75rem",
   fontWeight: 600,
   color: "#757575",
   borderColor: colors.grayLines.main + " !important",
   textTransform: "none",
   borderRadius: "2rem",
   border: "1px solid #757575",
   minWidth: "3.5rem",
   minHeight: "auto",
   padding: "0.375rem 0.625rem",
   whiteSpace: "nowrap",
   boxShadow: "none",
   marginBottom: "0.5rem",
   marginRight: "0.5rem",
   "&:hover": {
      opacity: "unset",
      background: "unset",
      boxShadow: "unset",
      filter: "unset"
   }
};

/*******************************************************************************
 ** Test if a CriteriaParamType represents an actual query criteria - or, if it's
 ** null or the "tooComplex" placeholder.
 *******************************************************************************/
const criteriaParamIsCriteria = (param: CriteriaParamType): boolean =>
{
   return (param != null && param != "tooComplex");
};

/*******************************************************************************
 ** Test of an OperatorOption equals a query Criteria - that is - that the
 ** operators within them are equal - AND - if the OperatorOption has implicit
 ** values (e.g., the booleans), then those options equal the criteria's options.
 *******************************************************************************/
const doesOperatorOptionEqualCriteria = (operatorOption: OperatorOption, criteria: QFilterCriteriaWithId): boolean =>
{
   if (operatorOption.value == criteria.operator)
   {
      if (operatorOption.implicitValues)
      {
         if (JSON.stringify(operatorOption.implicitValues) == JSON.stringify(criteria.values))
         {
            return (true);
         }
         else
         {
            return (false);
         }
      }

      return (true);
   }

   return (false);
};


/*******************************************************************************
 ** Get the object to use as the selected OperatorOption (e.g., value for that
 ** autocomplete), given an array of options, the query's active criteria in this
 ** field, and the default operator to use for this field
 *******************************************************************************/
const getOperatorSelectedValue = (operatorOptions: OperatorOption[], criteria: QFilterCriteriaWithId, defaultOperator: QCriteriaOperator, return0thOptionInsteadOfNull: boolean = false): OperatorOption =>
{
   if (criteria)
   {
      const filteredOptions = operatorOptions.filter(o => doesOperatorOptionEqualCriteria(o, criteria));
      if (filteredOptions.length > 0)
      {
         return (filteredOptions[0]);
      }
   }

   const filteredOptions = operatorOptions.filter(o => o.value == defaultOperator);
   if (filteredOptions.length > 0)
   {
      return (filteredOptions[0]);
   }

   if (return0thOptionInsteadOfNull)
   {
      console.log("Returning 0th operator instead of null - this isn't expected, but has been seen to happen - so here's some additional debugging:");
      try
      {
         console.log("Operator options:   " + JSON.stringify(operatorOptions));
         console.log("Criteria: " + JSON.stringify(criteria));
         console.log("Default Operator:   " + JSON.stringify(defaultOperator));
      }
      catch (e)
      {
         console.log(`Error in debug output: ${e}`);
      }

      return operatorOptions[0];
   }

   return (null);
};

/*******************************************************************************
 ** Component to render a QuickFilter - that is - a button, with a Menu under it,
 ** with Operator and Value controls.
 *******************************************************************************/
export default function QuickFilter({tableMetaData, fullFieldName, fieldMetaData, criteriaParam, updateCriteria, defaultOperator, handleRemoveQuickFilterField, queryScreenUsage, allowVariables}: QuickFilterProps): JSX.Element
{
   const operatorOptions = fieldMetaData ? getOperatorOptions(tableMetaData, fullFieldName) : [];
   const [_, tableForField] = TableUtils.getFieldAndTable(tableMetaData, fullFieldName);

   const [isOpen, setIsOpen] = useState(false);
   const [anchorEl, setAnchorEl] = useState(null);
   const [isMouseOver, setIsMouseOver] = useState(false);

   ////////////////////////////////////////////////////////////////////////////////////////////////////////
   // copy the criteriaParam to a new object in here - so changes won't apply until user closes the menu //
   ////////////////////////////////////////////////////////////////////////////////////////////////////////
   const [criteria, setCriteria] = useState(criteriaParamIsCriteria(criteriaParam) ? Object.assign({}, criteriaParam) as QFilterCriteriaWithId : null);
   const [id, setId] = useState(criteriaParamIsCriteria(criteriaParam) ? (criteriaParam as QFilterCriteriaWithId).id : ++seedId);

   const [operatorSelectedValue, setOperatorSelectedValue] = useState(getOperatorSelectedValue(operatorOptions, criteria, defaultOperator, true));
   const [operatorInputValue, setOperatorInputValue] = useState(operatorSelectedValue?.label);

   const {criteriaIsValid, criteriaStatusTooltip} = validateCriteria(criteria, operatorSelectedValue);

   const {accentColor} = useContext(QContext);

   //////////////////////
   // ole' faithful... //
   //////////////////////
   const [, forceUpdate] = useReducer((x) => x + 1, 0);

   useEffect(() =>
   {
      //////////////////////////////////////////////////////////////////////////////
      // was not seeing criteria changes take place until watching it stringified //
      //////////////////////////////////////////////////////////////////////////////
      setCriteria(criteria);
   }, [JSON.stringify(criteria)]);

   /*******************************************************************************
    **
    *******************************************************************************/
   function handleMouseOverElement()
   {
      setIsMouseOver(true);
   }


   /*******************************************************************************
    **
    *******************************************************************************/
   function handleMouseOutElement()
   {
      setIsMouseOver(false);
   }


   //////////////////////////////////////////////////////////////////////////////////////////////////////////////
   // handle a change to the criteria from outside this component (e.g., the prop isn't the same as the state) //
   //////////////////////////////////////////////////////////////////////////////////////////////////////////////
   if (criteriaParamIsCriteria(criteriaParam) && JSON.stringify(criteriaParam) !== JSON.stringify(criteria))
   {
      if (isOpen)
      {
         ////////////////////////////////////////////////////////////////////////////////
         // this was firing too-often for case where:  there was a criteria originally //
         ////////////////////////////////////////////////////////////////////////////////
         console.log("Not handling outside change (A), because dropdown is-open");
      }
      else
      {
         ////////////////////////////////////////////////////////////////////////////////////////////////////////
         // copy the criteriaParam to a new object in here - so changes won't apply until user closes the menu //
         ////////////////////////////////////////////////////////////////////////////////////////////////////////
         const newCriteria = Object.assign({}, criteriaParam) as QFilterCriteriaWithId;
         setCriteria(newCriteria);
         const operatorOption = operatorOptions.filter(o => o.value == newCriteria.operator)[0];
         setOperatorSelectedValue(operatorOption);
         setOperatorInputValue(operatorOption.label);
      }
   }

   /*******************************************************************************
    ** Test if we need to construct a new criteria object
    ** This is (at least for some cases) for when the criteria gets changed
    ** from outside of this component - e.g., a reset on the query screen
    *******************************************************************************/
   const criteriaNeedsReset = (): boolean =>
   {
      if (criteria != null && criteriaParam == null)
      {
         const defaultOperatorOption = operatorOptions.filter(o => o.value == defaultOperator)[0];
         if (criteria.operator !== defaultOperatorOption?.value || JSON.stringify(criteria.values) !== JSON.stringify(getDefaultCriteriaValue()))
         {
            if (isOpen)
            {
               //////////////////////////////////////////////////////////////////////////////////
               // this was firing too-often for case where:  there was no criteria originally, //
               // so, by adding this is-open check, we eliminated those.                       //
               //////////////////////////////////////////////////////////////////////////////////
               console.log("Not handling outside change (B), because dropdown is-open");
               return (false);
            }

            return (true);
         }
      }

      return (false);
   };

   /*******************************************************************************
    ** Construct a new criteria object - resetting the values tied to the operator
    ** autocomplete at the same time.
    *******************************************************************************/
   const makeNewCriteria = (): QFilterCriteria =>
   {
      const operatorOption = operatorOptions.filter(o => o.value == defaultOperator)[0];
      const criteria = new QFilterCriteriaWithId(fullFieldName, operatorOption?.value, getDefaultCriteriaValue());
      criteria.id = id;
      setOperatorSelectedValue(operatorOption);
      setOperatorInputValue(operatorOption?.label);
      setCriteria(criteria);
      return (criteria);
   };

   /*******************************************************************************
    ** event handler to open the menu in response to the button being clicked.
    *******************************************************************************/
   const handleOpenMenu = (event: any) =>
   {
      setIsOpen(!isOpen);
      setAnchorEl(event.currentTarget);

      setTimeout(() =>
      {
         const element = document.getElementById("value-" + criteria.id);
         element?.focus();
      });
   };

   /*******************************************************************************
    ** handler for the Menu when being closed
    *******************************************************************************/
   const closeMenu = () =>
   {
      //////////////////////////////////////////////////////////////////////////////////
      // when closing the menu, that's when we'll update the criteria from the caller //
      //////////////////////////////////////////////////////////////////////////////////
      updateCriteria(criteria, false, false);

      setIsOpen(false);
      setAnchorEl(null);
   };

   /*******************************************************************************
    ** event handler for operator Autocomplete having its value changed
    *******************************************************************************/
   const handleOperatorChange = (event: any, newValue: any, reason: string) =>
   {
      const newOperatorOption = newValue as OperatorOption;

      if (newOperatorOption)
      {
         criteria.operator = newOperatorOption.value;
         setOperatorSelectedValue(newOperatorOption);
         setOperatorInputValue(newOperatorOption.label);

         if (newOperatorOption.implicitValues)
         {
            criteria.values = newOperatorOption.implicitValues;
         }

         //////////////////////////////////////////////////////////////////////////////////////////////////
         // we've seen cases where switching operators can sometimes put a null in as the first value... //
         // that just causes a bad time (e.g., null pointers in Autocomplete), so, get rid of that.      //
         //////////////////////////////////////////////////////////////////////////////////////////////////
         if (criteria.values && criteria.values.length == 1 && criteria.values[0] == null)
         {
            criteria.values = [];
         }

         if (newOperatorOption.valueMode && !newOperatorOption.implicitValues)
         {
            const requiredValueCount = getValueModeRequiredCount(newOperatorOption.valueMode);
            if (requiredValueCount != null && criteria.values.length > requiredValueCount)
            {
               criteria.values.splice(requiredValueCount);
            }
         }

         /////////////////////////////////////////////////////////////////////////////////////////////////////
         // if the operator option has a field function, then set it on the criteria object - else clear it //
         /////////////////////////////////////////////////////////////////////////////////////////////////////
         if(newOperatorOption.fieldFunctionType)
         {
            criteria.fieldFunction = new FieldFunction(criteria.fieldName, newOperatorOption.fieldFunctionType, {});
         }
         else
         {
            criteria.fieldFunction = undefined;
         }

         //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
         // for dates & date-times - if moving from a PVS operator to a date (or date time) operator, reset the values array //
         //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
         if((fieldMetaData?.type == "DATE" || fieldMetaData?.type == "DATE_TIME") && criteria.values.length > 0)
         {
            ////////////////////////////////////////////////////////////////////////////////////////////////////////////
            // at first we thought this code might fail if you move from pvs to none, then none to date...            //
            // but presumably that goes through a splice again, w/ required value count 0, thus making it a non-issue //
            ////////////////////////////////////////////////////////////////////////////////////////////////////////////
            const isPvs = (option: OperatorOption) => option?.valueMode == ValueMode.PVS_SINGLE || option?.valueMode == ValueMode.PVS_MULTI;
            const isDate = (option: OperatorOption) => option?.valueMode == ValueMode.SINGLE_DATE || option?.valueMode == ValueMode.DOUBLE_DATE || option?.valueMode == ValueMode.SINGLE_DATE_TIME || option?.valueMode == ValueMode.DOUBLE_DATE_TIME;

            if((isPvs(operatorSelectedValue) && isDate(newOperatorOption)) || (isDate(operatorSelectedValue) && isPvs(newOperatorOption)))
            {
               criteria.values = [];
            }
         }
      }
      else
      {
         criteria.operator = null;
         criteria.fieldFunction = undefined;
         setOperatorSelectedValue(null);
         setOperatorInputValue("");
      }

      setCriteria(criteria);
      forceUpdate();
   };

   /*******************************************************************************
    ** implementation of isOptionEqualToValue for Autocomplete - compares both the
    ** value (e.g., what operator it is) and the implicitValues within the option
    *******************************************************************************/
   function isOperatorOptionEqual(option: OperatorOption, value: OperatorOption)
   {
      return (option?.value == value?.value && JSON.stringify(option?.implicitValues) == JSON.stringify(value?.implicitValues));
   }

   /*******************************************************************************
    ** event handler for the value field (of all types), when it changes
    *******************************************************************************/
   const handleValueChange = (event: React.ChangeEvent | SyntheticEvent, valueIndex: number | "all" = 0, newValue?: any) =>
   {
      // @ts-ignore
      const value = newValue !== undefined ? newValue : event ? event.target.value : null;

      console.log("IN HERE");
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

      setCriteria(criteria);
      forceUpdate();
   };

   /*******************************************************************************
    ** a noop event handler, e.g., for a too-complex
    *******************************************************************************/
   const noop = () =>
   {
   };

   /*******************************************************************************
    ** event handler that responds to 'x' button that removes the criteria from the
    ** quick-filter, resetting it to a new filter.
    *******************************************************************************/
   const resetCriteria = (e: React.MouseEvent<HTMLSpanElement>) =>
   {
      if (criteriaIsValid)
      {
         e.stopPropagation();
         const newCriteria = makeNewCriteria();
         updateCriteria(newCriteria, false, true);
      }
   };

   /*******************************************************************************
    ** event handler for clicking the (x) icon that turns off this quick filter field.
    ** hands off control to the function that was passed in (e.g., from RecordQueryOrig).
    *******************************************************************************/
   const handleTurningOffQuickFilterField = () =>
   {
      closeMenu();
      if (handleRemoveQuickFilterField)
      {
         handleRemoveQuickFilterField(criteria?.fieldName);
      }
   };

   ////////////////////////////////////////////////////////////////////////////////////
   // if no field was input (e.g., record-query is still loading), return null early //
   ////////////////////////////////////////////////////////////////////////////////////
   if (!fieldMetaData)
   {
      return (null);
   }

   //////////////////////////////////////////////////////////////////////////////////////////
   // if there should be a selected value in the operator autocomplete, and it's different //
   // from the last selected one, then set the state vars that control that autocomplete   //
   //////////////////////////////////////////////////////////////////////////////////////////
   const maybeNewOperatorSelectedValue = getOperatorSelectedValue(operatorOptions, criteria, defaultOperator);
   if (JSON.stringify(maybeNewOperatorSelectedValue) !== JSON.stringify(operatorSelectedValue))
   {
      setOperatorSelectedValue(maybeNewOperatorSelectedValue);
      setOperatorInputValue(maybeNewOperatorSelectedValue?.label);
   }

   /////////////////////////////////////////////////////////////////////////////////////
   // if there wasn't a criteria, or we need to reset it (make a new one), then do so //
   /////////////////////////////////////////////////////////////////////////////////////
   if (criteria == null || criteriaNeedsReset())
   {
      makeNewCriteria();
   }

   /////////////////////////
   // build up the button //
   /////////////////////////
   const tooComplex = criteriaParam == "tooComplex";
   const tooltipEnterDelay = 500;

   let buttonAdditionalStyles: any = {};
   let buttonVariant: "outlined" | "contained" | "text" = "outlined";
   let buttonColorName: "secondary" | "primary" = "secondary";
   let buttonContent = <span>{tableForField?.name != tableMetaData.name ? `${tableForField.label}: ` : ""}{fieldMetaData.label}</span>;
   let buttonClassName = "filterNotActive";
   if (criteriaIsValid)
   {
      buttonVariant = "contained";
      buttonColorName = "primary";
      buttonAdditionalStyles.backgroundColor = accentColor + " !important";
      buttonAdditionalStyles.borderColor = accentColor + " !important";
      buttonAdditionalStyles.color = "white !important";
      buttonClassName = "filterActive";

      let valuesString = FilterUtils.getValuesString(fieldMetaData, criteria, 1, "+N");

      ///////////////////////////////////////////
      // don't show the Equals or In operators //
      ///////////////////////////////////////////
      let operatorString = (<>{operatorSelectedValue.label}&nbsp;</>);
      if (operatorSelectedValue.value == QCriteriaOperator.EQUALS || operatorSelectedValue.value == QCriteriaOperator.IN)
      {
         operatorString = (<></>);
      }

      buttonContent = (<><span style={{fontWeight: 700}}>{buttonContent}:</span>&nbsp;<span style={{fontWeight: 400}}>{operatorString}{valuesString}</span></>);
   }

   const mouseEvents =
      {
         onMouseOver: () => handleMouseOverElement(),
         onMouseOut: () => handleMouseOutElement()
      };

   let button = fieldMetaData && <Button
      variant={buttonVariant}
      color={buttonColorName}
      id={`quickFilter.${fullFieldName}`}
      className={buttonClassName}
      {...mouseEvents}
      sx={{...quickFilterButtonStyles, ...buttonAdditionalStyles}}
      onClick={tooComplex ? noop : handleOpenMenu}
      disabled={tooComplex}
   >{buttonContent}</Button>;

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
   // if the criteria on this field is the "tooComplex" sentinel, then wrap the button in a tooltip stating such, and return early. //
   // note this was part of original design on this widget, but later deprecated...                                                 //
   ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
   if (tooComplex)
   {
      ////////////////////////////////////////////////////////////////////////////
      // wrap button in span, so disabled button doesn't cause disabled tooltip //
      ////////////////////////////////////////////////////////////////////////////
      return (
         <Tooltip title={`Your current filter is too complex to do a Quick Filter on ${fieldMetaData.label}.  Use the Filter button to edit.`} enterDelay={tooltipEnterDelay} slotProps={{popper: {sx: {top: "-0.75rem!important"}}}}>
            <span>{button}</span>
         </Tooltip>
      );
   }

   /*******************************************************************************
    ** event handler for 'x' button - either resets the criteria or turns off the field.
    *******************************************************************************/
   const xClicked = (e: React.MouseEvent<HTMLSpanElement>) =>
   {
      e.stopPropagation();
      if (criteriaIsValid)
      {
         resetCriteria(e);
      }
      else
      {
         handleTurningOffQuickFilterField();
      }
   };

   //////////////////////////////
   // return the button & menu //
   //////////////////////////////
   const widthAndMaxWidth = (fieldMetaData?.type == QFieldType.DATE_TIME) ? 315 : fieldMetaData.possibleValueSourceName ? 300 : 250;
   return (
      <>
         {button}
         {
            /////////////////////////////////////////////////////////////////////////////////////
            // only show the 'x' if it's to clear out a valid criteria on the field,           //
            // or if we were given a callback to remove the quick-filter field from the screen //
            /////////////////////////////////////////////////////////////////////////////////////
            (criteriaIsValid || handleRemoveQuickFilterField) && isMouseOver && <span {...mouseEvents}><XIcon shade={criteriaIsValid ? "accent" : "default"} position="forQuickFilter" onClick={xClicked} /></span>
         }
         {
            isOpen && <Menu open={Boolean(anchorEl)} anchorEl={anchorEl} onClose={closeMenu} sx={{overflow: "visible"}}>
               <Box display="inline-block" width={widthAndMaxWidth} maxWidth={widthAndMaxWidth} className="operatorColumn">
                  <Autocomplete
                     id={"criteriaOperator"}
                     ////////////////////////////////////////////////////////////////////////////////////////////////////
                     // ok, so, by default, if you type an 'o' as the first letter in the FilterCriteriaRowValues box, //
                     // something is causing THIS element to become selected, if the first letter in its label is 'O'. //
                     // ... work around is to put invisible &zwnj; entity as first character in label instead...       //
                     ////////////////////////////////////////////////////////////////////////////////////////////////////
                     renderInput={(params) => (<TextField {...params} label={<>&zwnj;Operator</>} variant="standard" autoComplete="off" type="search" InputProps={{...params.InputProps}} />)}
                     options={operatorOptions}
                     value={operatorSelectedValue as any}
                     inputValue={operatorInputValue}
                     onChange={handleOperatorChange}
                     onInputChange={(e, value) => setOperatorInputValue(value)}
                     isOptionEqualToValue={(option, value) => isOperatorOptionEqual(option, value)}
                     getOptionLabel={(option: any) => option.label}
                     autoSelect={true}
                     autoHighlight={true}
                     disableClearable
                     slotProps={{popper: {style: {padding: 0, maxHeight: "unset", width: "250px"}}}}
                  />
               </Box>
               <Box width={widthAndMaxWidth} maxWidth={widthAndMaxWidth} className="quickFilter filterValuesColumn" sx={{"& .MuiChip-root.MuiAutocomplete-tag": {maxWidth: `${widthAndMaxWidth - 85}px`}}}>
                  <FilterCriteriaRowValues
                     queryScreenUsage={queryScreenUsage}
                     operatorOption={operatorSelectedValue}
                     criteria={criteria}
                     field={fieldMetaData}
                     table={tableForField}
                     allowVariables={allowVariables}
                     valueChangeHandler={(event, valueIndex, newValue) => handleValueChange(event, valueIndex, newValue)}
                     initiallyOpenMultiValuePvs={true} // todo - maybe not?
                  />
               </Box>
            </Menu>
         }
      </>
   );
}
