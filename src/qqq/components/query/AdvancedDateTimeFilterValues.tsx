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
import {NowExpression} from "@qrunio/qqq-frontend-core/lib/model/query/NowExpression";
import {NowWithOffsetExpression, NowWithOffsetOperator, NowWithOffsetUnit} from "@qrunio/qqq-frontend-core/lib/model/query/NowWithOffsetExpression";
import {ThisOrLastPeriodExpression, ThisOrLastPeriodOperator, ThisOrLastPeriodUnit} from "@qrunio/qqq-frontend-core/lib/model/query/ThisOrLastPeriodExpression";
import {FormControl, FormControlLabel, Radio, RadioGroup, Select} from "@mui/material";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import Icon from "@mui/material/Icon";
import MenuItem from "@mui/material/MenuItem";
import Modal from "@mui/material/Modal";
import {SelectChangeEvent} from "@mui/material/Select/Select";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import {preferredColorNameInfoOrPrimary} from "qqq/assets/theme/functions/preferInfoColorToPrimaryColor";
import React, {ReactNode, useState} from "react";
import {QCancelButton, QSaveButton} from "qqq/components/buttons/DefaultButtons";


interface Props
{
   type: QFieldType
   expression: any;
   onSave: (expression: any) => void;
   forcedOpen: boolean;
}

AdvancedDateTimeFilterValues.defaultProps = {
   forcedOpen: false
};

const extractExpressionType = (expression: any) => expression?.type ?? "NowWithOffset";
const extractNowWithOffsetAmount = (expression: any) => expression?.type == "NowWithOffset" ? (expression?.amount ?? 1) : 1;
const extractNowWithOffsetTimeUnit = (expression: any) => expression?.type == "NowWithOffset" ? (expression?.timeUnit ?? "DAYS") : "DAYS" as NowWithOffsetUnit;
const extractNowWithOffsetOperator = (expression: any) => expression?.type == "NowWithOffset" ? (expression?.operator ?? "MINUS") : "MINUS" as NowWithOffsetOperator;
const extractThisOrLastPeriodTimeUnit = (expression: any) => expression?.type == "ThisOrLastPeriod" ? (expression?.timeUnit ?? "DAYS") : "DAYS" as ThisOrLastPeriodUnit;
const extractThisOrLastPeriodOperator = (expression: any) => expression?.type == "ThisOrLastPeriod" ? (expression?.operator ?? "THIS") : "THIS" as ThisOrLastPeriodOperator;

function AdvancedDateTimeFilterValues({type, expression, onSave, forcedOpen}: Props): JSX.Element
{
   const [originalExpression, setOriginalExpression] = useState(JSON.stringify(expression));

   const [expressionType, setExpressionType] = useState(extractExpressionType(expression))

   const [nowWithOffsetAmount, setNowWithOffsetAmount] = useState(extractNowWithOffsetAmount(expression));
   const [nowWithOffsetTimeUnit, setNowWithOffsetTimeUnit] = useState(extractNowWithOffsetTimeUnit(expression));
   const [nowWithOffsetOperator, setNowWithOffsetOperator] = useState(extractNowWithOffsetOperator(expression));

   const [thisOrLastPeriodTimeUnit, setThisOrLastPeriodTimeUnit] = useState(extractThisOrLastPeriodTimeUnit(expression));
   const [thisOrLastPeriodOperator, setThisOrLastPeriodOperator] = useState(extractThisOrLastPeriodOperator(expression));

   const [isOpen, setIsOpen] = useState(false)

   if(!isOpen && forcedOpen)
   {
      setIsOpen(true);
   }

   const setStateToExpression = (activeExpression: any) =>
   {
      setExpressionType(extractExpressionType(activeExpression))

      setNowWithOffsetAmount(extractNowWithOffsetAmount(activeExpression))
      setNowWithOffsetTimeUnit(extractNowWithOffsetTimeUnit(activeExpression))
      setNowWithOffsetOperator(extractNowWithOffsetOperator(activeExpression))

      setThisOrLastPeriodTimeUnit(extractThisOrLastPeriodTimeUnit(activeExpression))
      setThisOrLastPeriodOperator(extractThisOrLastPeriodOperator(activeExpression))
   }

   //////////////////////////////////////////////////////////////////////////////////
   // if the expression (prop) has changed, re-set the state variables based on it //
   //////////////////////////////////////////////////////////////////////////////////
   if(JSON.stringify(expression) !== originalExpression)
   {
      ///////////////////////////////////////////////////////////
      // update all state vars based on the current expression //
      ///////////////////////////////////////////////////////////
      setStateToExpression(expression);

      setOriginalExpression(JSON.stringify(expression))
   }

   const openDialog = () =>
   {
      setIsOpen(true);
   }

   const handleCancelClicked = () =>
   {
      ///////////////////////////////////////////////////////////
      // update all state vars back to the original expression //
      ///////////////////////////////////////////////////////////
      const restoreExpression = JSON.parse(originalExpression)
      setStateToExpression(restoreExpression);

      close();
   }

   const handleSaveClicked = () =>
   {
      switch(expressionType)
      {
         case "Now":
         {
            const expression = new NowExpression();
            onSave(expression);
            break;
         }
         case "NowWithOffset":
         {
            const expression = new NowWithOffsetExpression()
            expression.operator = nowWithOffsetOperator;
            expression.amount = nowWithOffsetAmount;
            expression.timeUnit = nowWithOffsetTimeUnit;
            onSave(expression);
            break;
         }
         case "ThisOrLastPeriod":
         {
            const expression = new ThisOrLastPeriodExpression()
            expression.operator = thisOrLastPeriodOperator;
            expression.timeUnit = thisOrLastPeriodTimeUnit;
            onSave(expression);
            break;
         }
         default:
         {
            console.log(`Unmapped expression type in handleSAveClicked: ${expressionType}`);
         }
      }

      close();
   }

   const close = () =>
   {
      setIsOpen(false);
   }

   function handleExpressionTypeChange(e: React.ChangeEvent<HTMLInputElement>)
   {
      setExpressionType(e.target.value);
   }

   function handleNowWithOffsetAmountChange(event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>)
   {
      setNowWithOffsetAmount(parseInt(event.target.value));
   }

   function handleNowWithOffsetTimeUnitChange(event: SelectChangeEvent<NowWithOffsetUnit>, child: ReactNode)
   {
      // @ts-ignore
      setNowWithOffsetTimeUnit(event.target.value)
   }

   function handleNowWithOffsetOperatorChange(event: SelectChangeEvent<NowWithOffsetOperator>, child: ReactNode)
   {
      // @ts-ignore
      setNowWithOffsetOperator(event.target.value)
   }

   function handleThisOrLastPeriodTimeUnitChange(event: SelectChangeEvent<ThisOrLastPeriodUnit>, child: ReactNode)
   {
      // @ts-ignore
      setThisOrLastPeriodTimeUnit(event.target.value)
   }

   function handleThisOrLastPeriodOperatorChange(event: SelectChangeEvent<ThisOrLastPeriodOperator>, child: ReactNode)
   {
      // @ts-ignore
      setThisOrLastPeriodOperator(event.target.value)
   }

   const mainCardStyles: any = {};
   mainCardStyles.width = "600px";

   /////////////////////////////////////////////////////////////////////////
   // for the time units, have them end in an 's' if the amount is plural //
   // name here means "time unit 's'"                                     //
   /////////////////////////////////////////////////////////////////////////
   const nwoTUs = (nowWithOffsetAmount == 1 ? "" : "s");

   return (
      <Box>
         <Tooltip title={`Define a custom ${type == QFieldType.DATE ? "date" : "date-time"} condition`}>
            <Icon onClick={openDialog} fontSize="small" color={preferredColorNameInfoOrPrimary()} sx={{mx: 0.25, cursor: "pointer", position: "relative", top: "2px"}}>settings</Icon>
         </Tooltip>
         {
            isOpen &&
            (
               <Modal open={isOpen} className="AdvancedDateTimeFilterValues">
                  <Box sx={{position: "absolute", overflowY: "auto", width: "100%"}}>
                     <Box py={3} justifyContent="center" sx={{display: "flex", mt: 8}}>
                        <Card sx={mainCardStyles}>
                           <Box p={4} pb={2}>
                              <Grid container>
                                 <Grid item pr={3} xs={12} lg={12}>
                                    <Typography variant="h5">Custom Date Filter Condition</Typography>
                                    <Typography sx={{display: "flex", lineHeight: "1.7", textTransform: "revert"}} variant="button">
                                       Select the type of expression you want for your condition.<br />
                                       Then enter values to express your condition.
                                    </Typography>
                                 </Grid>
                              </Grid>
                           </Box>
                           <RadioGroup name="expressionType" value={expressionType} onChange={handleExpressionTypeChange}>

                              <Box px={4} pb={4}>
                                 <FormControlLabel value="Now" control={<Radio size="small" />} label={type == QFieldType.DATE_TIME ? "Now" : "Today"} />
                              </Box>

                              <Box px={4} pb={4}>
                                 <FormControlLabel value="NowWithOffset" control={<Radio size="small" />} label="Relative Expression" />
                                 <Box pl={4}>
                                    <FormControl variant="standard" sx={{verticalAlign: "bottom", width: "30%"}}>
                                       <TextField
                                          variant="standard"
                                          type="number"
                                          inputProps={{min: 0}}
                                          autoComplete="off"
                                          value={nowWithOffsetAmount}
                                          onChange={(event) => handleNowWithOffsetAmountChange(event)}
                                          fullWidth
                                       />
                                    </FormControl>

                                    <FormControl variant="standard" sx={{verticalAlign: "bottom", width: "30%"}}>
                                       <Select value={nowWithOffsetTimeUnit} disabled={false} onChange={handleNowWithOffsetTimeUnitChange} label="Unit">
                                          {type == QFieldType.DATE_TIME && <MenuItem value="SECONDS">Second{nwoTUs}</MenuItem>}
                                          {type == QFieldType.DATE_TIME  && <MenuItem value="MINUTES">Minute{nwoTUs}</MenuItem>}
                                          {type == QFieldType.DATE_TIME  && <MenuItem value="HOURS">Hour{nwoTUs}</MenuItem>}
                                          <MenuItem value="DAYS">Day{nwoTUs}</MenuItem>
                                          <MenuItem value="WEEKS">Week{nwoTUs}</MenuItem>
                                          <MenuItem value="MONTHS">Month{nwoTUs}</MenuItem>
                                          <MenuItem value="YEARS">Year{nwoTUs}</MenuItem>
                                       </Select>
                                    </FormControl>

                                    <FormControl variant="standard" sx={{verticalAlign: "bottom", width: "40%"}}>
                                       <Select value={nowWithOffsetOperator} disabled={false} onChange={handleNowWithOffsetOperatorChange}>
                                          <MenuItem value="MINUS">Ago (in the past)</MenuItem>
                                          <MenuItem value="PLUS">From now (in the future)</MenuItem>
                                       </Select>
                                    </FormControl>
                                 </Box>
                              </Box>

                              <Box px={4} pb={4}>
                                 <FormControlLabel value="ThisOrLastPeriod" control={<Radio size="small" />} label={`${type == QFieldType.DATE_TIME ? "Start of " : ""}This or Last...`} />
                                 <Box pl={4}>

                                    <FormControl variant="standard" sx={{verticalAlign: "bottom", width: "30%"}}>
                                       <Select value={thisOrLastPeriodOperator} disabled={false} onChange={handleThisOrLastPeriodOperatorChange}>
                                          <MenuItem value="THIS">This</MenuItem>
                                          <MenuItem value="LAST">Last</MenuItem>
                                       </Select>
                                    </FormControl>

                                    <FormControl variant="standard" sx={{verticalAlign: "bottom", width: "30%"}}>
                                       <Select value={thisOrLastPeriodTimeUnit} disabled={false} onChange={handleThisOrLastPeriodTimeUnitChange} label="Unit">
                                          {type == QFieldType.DATE_TIME  && <MenuItem value="HOURS">Hour</MenuItem>}
                                          <MenuItem value="DAYS">Day</MenuItem>
                                          <MenuItem value="WEEKS">Week</MenuItem>
                                          <MenuItem value="MONTHS">Month</MenuItem>
                                          <MenuItem value="YEARS">Year</MenuItem>
                                       </Select>
                                    </FormControl>

                                 </Box>
                              </Box>

                           </RadioGroup>
                           <Box p={3} pt={0}>
                              <Grid container pl={1} pr={1} justifyContent="right" alignItems="stretch" sx={{display: "flex-inline "}}>
                                 <QCancelButton onClickHandler={handleCancelClicked} iconName="cancel" disabled={false} />
                                 <QSaveButton onClickHandler={handleSaveClicked} label="Apply" disabled={false} />
                              </Grid>
                           </Box>
                        </Card>
                     </Box>
                  </Box>
               </Modal>

            )
         }
      </Box>
   );
}

export default AdvancedDateTimeFilterValues;
