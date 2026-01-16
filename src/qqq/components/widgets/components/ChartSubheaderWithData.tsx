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


import {Skeleton} from "@mui/material";
import Box from "@mui/material/Box";
import Icon from "@mui/material/Icon";
import Typography from "@mui/material/Typography";
import React from "react";
import {Link} from "react-router-dom";
import colors from "qqq/assets/theme/base/colors";
import ValueUtils from "qqq/utils/qqq/ValueUtils";

export interface ChartSubheaderData
{
   mainNumber: number;
   vsPreviousPercent: number;
   vsPreviousNumber: number;
   isUpVsPrevious: boolean;
   isGoodVsPrevious: boolean;
   vsDescription: string;
   mainNumberUrl: string;
   previousNumberUrl: string;
}

interface Props
{
   chartSubheaderData: ChartSubheaderData;
}

const GOOD_COLOR = colors.success.main;
const BAD_COLOR = colors.error.main;
const UP_ICON = "arrow_drop_up";
const DOWN_ICON = "arrow_drop_down";

function StackedBarChart({chartSubheaderData}: Props): JSX.Element
{
   let color = "black";
   if (chartSubheaderData && chartSubheaderData.isGoodVsPrevious != null)
   {
      color = chartSubheaderData.isGoodVsPrevious ? GOOD_COLOR : BAD_COLOR;
   }

   let iconName: string = null;
   if (chartSubheaderData && chartSubheaderData.isUpVsPrevious != null)
   {
      iconName = chartSubheaderData.isUpVsPrevious ? UP_ICON : DOWN_ICON;
   }

   let mainNumberElement = <Typography variant="h3" display="inline">{ValueUtils.getFormattedNumber(chartSubheaderData.mainNumber)}</Typography>;
   if(chartSubheaderData.mainNumberUrl)
   {
      mainNumberElement = <Link to={chartSubheaderData.mainNumberUrl}>{mainNumberElement}</Link>
   }
   mainNumberElement = <Box pr={1}>{mainNumberElement}</Box>

   let previousNumberElement = (
      <>
         <Typography display="block" variant="body2" sx={{color: colors.gray.main, fontSize: ".875rem", fontWeight: 500}}>
            &nbsp;{chartSubheaderData.vsDescription}
            {chartSubheaderData.vsPreviousNumber && (<>&nbsp;({ValueUtils.getFormattedNumber(chartSubheaderData.vsPreviousNumber)})</>)}
         </Typography>
      </>
   )

   if(chartSubheaderData.previousNumberUrl)
   {
      previousNumberElement = <Link to={chartSubheaderData.previousNumberUrl}>{previousNumberElement}</Link>
   }

   return chartSubheaderData ? (
      <Box display="inline-flex" alignItems="flex-end" flexWrap="wrap">
         {mainNumberElement}
         {
            chartSubheaderData.vsPreviousPercent != null && iconName != null && (
               <Box display="inline-flex" alignItems="baseline" pb={0.5} ml={-0.5}>
                  <Icon fontSize="medium" sx={{color: color, alignSelf: "flex-end"}}>{iconName}</Icon>
                  <Typography display="inline" variant="body2" sx={{color: color, fontSize: ".875rem", fontWeight: 500}}>{chartSubheaderData.vsPreviousPercent}%</Typography>
                  {previousNumberElement}
               </Box>
            )
         }
      </Box>
   ) : <Skeleton sx={{marginLeft: "20px", marginRight: "20px", height: "12px"}} />;
}

export default StackedBarChart;
