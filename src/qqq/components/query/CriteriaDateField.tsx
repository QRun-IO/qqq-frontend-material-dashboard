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
import {FilterVariableExpression} from "@qrunio/qqq-frontend-core/lib/model/query/FilterVariableExpression";
import {NowExpression} from "@qrunio/qqq-frontend-core/lib/model/query/NowExpression";
import {NowWithOffsetExpression, NowWithOffsetOperator, NowWithOffsetUnit} from "@qrunio/qqq-frontend-core/lib/model/query/NowWithOffsetExpression";
import {ThisOrLastPeriodExpression, ThisOrLastPeriodOperator, ThisOrLastPeriodUnit} from "@qrunio/qqq-frontend-core/lib/model/query/ThisOrLastPeriodExpression";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Icon from "@mui/material/Icon";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment/InputAdornment";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import {styled} from "@mui/material/styles";
import TextField from "@mui/material/TextField";
import Tooltip, {tooltipClasses, TooltipProps} from "@mui/material/Tooltip";
import AdvancedDateTimeFilterValues from "qqq/components/query/AdvancedDateTimeFilterValues";
import {QFilterCriteriaWithId} from "qqq/components/query/CustomFilterPanel";
import {EvaluatedExpression} from "qqq/components/query/EvaluatedExpression";
import {makeTextField} from "qqq/components/query/FilterCriteriaRowValues";
import React, {SyntheticEvent, useReducer, useState} from "react";
import {preferredColorNameInfoOrPrimary} from "qqq/assets/theme/functions/preferInfoColorToPrimaryColor";


export type Expression = NowWithOffsetExpression | ThisOrLastPeriodExpression | NowExpression | FilterVariableExpression;


interface CriteriaDateFieldProps
{
   valueIndex: number;
   label: string;
   idPrefix: string;
   field: QFieldMetaData;
   criteria: QFilterCriteriaWithId;
   valueChangeHandler: (event: React.ChangeEvent | SyntheticEvent, valueIndex?: number | "all", newValue?: any) => void;
   allowVariables?: boolean;
}

CriteriaDateField.defaultProps = {
   valueIndex: 0,
   label: "Value",
   idPrefix: "value-"
};

export const NoWrapTooltip = styled(({className, children, ...props}: TooltipProps) => (
   <Tooltip {...props} classes={{popper: className}}>{children}</Tooltip>
))({
   [`& .${tooltipClasses.tooltip}`]: {
      whiteSpace: "nowrap"
   },
});

export default function CriteriaDateField({valueIndex, label, idPrefix, field, criteria, valueChangeHandler, allowVariables}: CriteriaDateFieldProps): JSX.Element
{
   const [relativeDateTimeOpen, setRelativeDateTimeOpen] = useState(false);
   const [relativeDateTimeMenuAnchorElement, setRelativeDateTimeMenuAnchorElement] = useState(null);
   const [forceAdvancedDateTimeDialogOpen, setForceAdvancedDateTimeDialogOpen] = useState(false);
   const [, forceUpdate] = useReducer((x) => x + 1, 0);

   const openRelativeDateTimeMenu = (event: React.MouseEvent<HTMLElement>) =>
   {
      setRelativeDateTimeOpen(true);
      setRelativeDateTimeMenuAnchorElement(event.currentTarget);
   };

   const closeRelativeDateTimeMenu = () =>
   {
      setRelativeDateTimeOpen(false);
      setRelativeDateTimeMenuAnchorElement(null);
   };

   const setExpression = (valueIndex: number, expression: Expression) =>
   {
      saveNewDateTimeExpression(valueIndex, expression);
      closeRelativeDateTimeMenu();
   };

   function saveNewDateTimeExpression(valueIndex: number, expression: any)
   {
      valueChangeHandler(null, valueIndex, expression);
      forceUpdate();
   }

   const makeDateTimeExpressionTextField = (expression: any, valueIndex: number = 0, label = "Value", idPrefix = "value-") =>
   {
      const clearValue = (event: React.MouseEvent<HTMLAnchorElement> | React.MouseEvent<HTMLButtonElement>, index: number) =>
      {
         valueChangeHandler(event, index, "");
         forceUpdate();
         document.getElementById(`${idPrefix}${criteria.id}`).focus();
      };

      const inputProps: any = {};
      inputProps.endAdornment = (
         <InputAdornment position="end">
            <IconButton sx={{visibility: expression ? "visible" : "hidden"}} onClick={(event) => clearValue(event, valueIndex)}>
               <Icon>close</Icon>
            </IconButton>
         </InputAdornment>
      );

      let displayValue = expression.toString();
      if (expression?.type == "ThisOrLastPeriod")
      {
         if (field.type == QFieldType.DATE_TIME || (field.type == QFieldType.DATE && expression.timeUnit != "DAYS"))
         {
            displayValue = "start of " + displayValue;
         }
      }
      if (expression?.type == "Now")
      {
         if (field.type == QFieldType.DATE)
         {
            displayValue = "today";
         }
      }

      return <NoWrapTooltip title={<EvaluatedExpression field={field} expression={expression} />} placement="bottom" enterDelay={1000} sx={{marginLeft: "-75px !important", marginTop: "-8px !important"}}><TextField
         id={`${idPrefix}${criteria.id}`}
         label={label}
         variant="standard"
         autoComplete="off"
         InputProps={{readOnly: true, unselectable: "off", ...inputProps}}
         InputLabelProps={{shrink: true}}
         value={displayValue}
         fullWidth
      /></NoWrapTooltip>;
   };

   const isExpression = criteria.values && criteria.values[valueIndex] && criteria.values[valueIndex].type;
   const currentExpression = isExpression ? criteria.values[valueIndex] : null;

   const tooltipMenuItemFromExpression = (valueIndex: number, tooltipPlacement: "left" | "right", expression: Expression) =>
   {
      let startOfPrefix = "";
      if (expression.type == "ThisOrLastPeriod")
      {
         if (field.type == QFieldType.DATE_TIME || expression.timeUnit != "DAYS")
         {
            startOfPrefix = "start of ";
         }
      }

      return <NoWrapTooltip title={<EvaluatedExpression field={field} expression={expression} />} placement={tooltipPlacement}>
         <MenuItem onClick={() => setExpression(valueIndex, expression)}>{startOfPrefix}{expression.toString()}</MenuItem>
      </NoWrapTooltip>;
   };

   const newNowExpression = (): NowExpression =>
   {
      const expression = new NowExpression();
      return (expression);
   };

   const newNowWithOffsetExpression = (operator: NowWithOffsetOperator, amount: number, timeUnit: NowWithOffsetUnit): NowWithOffsetExpression =>
   {
      const expression = new NowWithOffsetExpression();
      expression.operator = operator;
      expression.amount = amount;
      expression.timeUnit = timeUnit;
      return (expression);
   };

   const newThisOrLastPeriodExpression = (operator: ThisOrLastPeriodOperator, timeUnit: ThisOrLastPeriodUnit): ThisOrLastPeriodExpression =>
   {
      const expression = new ThisOrLastPeriodExpression();
      expression.operator = operator;
      expression.timeUnit = timeUnit;
      return (expression);
   };

   function doForceAdvancedDateTimeDialogOpen()
   {
      setForceAdvancedDateTimeDialogOpen(true);
      closeRelativeDateTimeMenu();
      setTimeout(() => setForceAdvancedDateTimeDialogOpen(false), 100);
   }

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


   return <Box display="flex" alignItems="flex-end">
      {
         isExpression ?
            currentExpression?.type == "FilterVariableExpression" ? (
               makeFilterVariableTextField(criteria.values[valueIndex], valueIndex, label, idPrefix)
            ) : (
               makeDateTimeExpressionTextField(criteria.values[valueIndex], valueIndex, label, idPrefix)
            )
            : makeTextField(field, criteria, valueChangeHandler, valueIndex, label, idPrefix, allowVariables)
      }
      {
         (!isExpression || currentExpression?.type != "FilterVariableExpression") && (
            <><Box>
               <Tooltip title={`Choose a common relative ${field.type == QFieldType.DATE ? "date" : "date-time"} expression`} placement="bottom">
                  <Icon fontSize="small" color={preferredColorNameInfoOrPrimary()} sx={{mx: 0.25, cursor: "pointer", position: "relative", top: "2px"}} onClick={openRelativeDateTimeMenu}>date_range</Icon>
               </Tooltip>
               <Menu
                  open={relativeDateTimeOpen}
                  anchorEl={relativeDateTimeMenuAnchorElement}
                  transformOrigin={{horizontal: "left", vertical: "top"}}
                  onClose={closeRelativeDateTimeMenu}
               >
                  {field.type == QFieldType.DATE ?
                     <Box display="flex">
                        <Box>
                           {tooltipMenuItemFromExpression(valueIndex, "left", newNowWithOffsetExpression("MINUS", 7, "DAYS"))}
                           {tooltipMenuItemFromExpression(valueIndex, "left", newNowWithOffsetExpression("MINUS", 14, "DAYS"))}
                           {tooltipMenuItemFromExpression(valueIndex, "left", newNowWithOffsetExpression("MINUS", 30, "DAYS"))}
                           {tooltipMenuItemFromExpression(valueIndex, "left", newNowWithOffsetExpression("MINUS", 90, "DAYS"))}
                           {tooltipMenuItemFromExpression(valueIndex, "left", newNowWithOffsetExpression("MINUS", 180, "DAYS"))}
                           {tooltipMenuItemFromExpression(valueIndex, "left", newNowWithOffsetExpression("MINUS", 1, "YEARS"))}
                           <Divider />
                           <Tooltip title="Define a custom expression" placement="left">
                              <MenuItem onClick={doForceAdvancedDateTimeDialogOpen}>Custom</MenuItem>
                           </Tooltip>
                        </Box>
                        <Box>
                           {tooltipMenuItemFromExpression(valueIndex, "right", newThisOrLastPeriodExpression("THIS", "DAYS"))}
                           {tooltipMenuItemFromExpression(valueIndex, "right", newThisOrLastPeriodExpression("LAST", "DAYS"))}
                           {tooltipMenuItemFromExpression(valueIndex, "right", newThisOrLastPeriodExpression("THIS", "WEEKS"))}
                           {tooltipMenuItemFromExpression(valueIndex, "right", newThisOrLastPeriodExpression("LAST", "WEEKS"))}
                           {tooltipMenuItemFromExpression(valueIndex, "right", newThisOrLastPeriodExpression("THIS", "MONTHS"))}
                           {tooltipMenuItemFromExpression(valueIndex, "right", newThisOrLastPeriodExpression("LAST", "MONTHS"))}
                           {tooltipMenuItemFromExpression(valueIndex, "right", newThisOrLastPeriodExpression("THIS", "YEARS"))}
                           {tooltipMenuItemFromExpression(valueIndex, "right", newThisOrLastPeriodExpression("LAST", "YEARS"))}
                        </Box>
                     </Box>
                     :
                     <Box display="flex">
                        <Box>
                           {tooltipMenuItemFromExpression(valueIndex, "left", newNowWithOffsetExpression("MINUS", 1, "HOURS"))}
                           {tooltipMenuItemFromExpression(valueIndex, "left", newNowWithOffsetExpression("MINUS", 12, "HOURS"))}
                           {tooltipMenuItemFromExpression(valueIndex, "left", newNowWithOffsetExpression("MINUS", 24, "HOURS"))}
                           {tooltipMenuItemFromExpression(valueIndex, "left", newNowWithOffsetExpression("MINUS", 7, "DAYS"))}
                           {tooltipMenuItemFromExpression(valueIndex, "left", newNowWithOffsetExpression("MINUS", 14, "DAYS"))}
                           {tooltipMenuItemFromExpression(valueIndex, "left", newNowWithOffsetExpression("MINUS", 30, "DAYS"))}
                           {tooltipMenuItemFromExpression(valueIndex, "left", newNowWithOffsetExpression("MINUS", 90, "DAYS"))}
                           {tooltipMenuItemFromExpression(valueIndex, "left", newNowWithOffsetExpression("MINUS", 180, "DAYS"))}
                           {tooltipMenuItemFromExpression(valueIndex, "left", newNowWithOffsetExpression("MINUS", 1, "YEARS"))}
                           <Divider />
                           <Tooltip title="Define a custom expression" placement="left">
                              <MenuItem onClick={doForceAdvancedDateTimeDialogOpen}>Custom</MenuItem>
                           </Tooltip>
                        </Box>
                        <Box>
                           {tooltipMenuItemFromExpression(valueIndex, "right", newNowExpression())}
                           {tooltipMenuItemFromExpression(valueIndex, "right", newThisOrLastPeriodExpression("THIS", "HOURS"))}
                           {tooltipMenuItemFromExpression(valueIndex, "right", newThisOrLastPeriodExpression("LAST", "HOURS"))}
                           {tooltipMenuItemFromExpression(valueIndex, "right", newThisOrLastPeriodExpression("THIS", "DAYS"))}
                           {tooltipMenuItemFromExpression(valueIndex, "right", newThisOrLastPeriodExpression("LAST", "DAYS"))}
                           {tooltipMenuItemFromExpression(valueIndex, "right", newThisOrLastPeriodExpression("THIS", "WEEKS"))}
                           {tooltipMenuItemFromExpression(valueIndex, "right", newThisOrLastPeriodExpression("LAST", "WEEKS"))}
                           {tooltipMenuItemFromExpression(valueIndex, "right", newThisOrLastPeriodExpression("THIS", "MONTHS"))}
                           {tooltipMenuItemFromExpression(valueIndex, "right", newThisOrLastPeriodExpression("LAST", "MONTHS"))}
                           {tooltipMenuItemFromExpression(valueIndex, "right", newThisOrLastPeriodExpression("THIS", "YEARS"))}
                           {tooltipMenuItemFromExpression(valueIndex, "right", newThisOrLastPeriodExpression("LAST", "YEARS"))}
                        </Box>
                     </Box>}
               </Menu>
            </Box><Box>
               <AdvancedDateTimeFilterValues type={field.type} expression={currentExpression} onSave={(expression: any) => saveNewDateTimeExpression(valueIndex, expression)} forcedOpen={forceAdvancedDateTimeDialogOpen} />
            </Box></>
         )
      }
   </Box>;
}

