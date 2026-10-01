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

import {CircularProgress, Typography} from "@mui/material";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import React from "react";
import {NavLink} from "react-router-dom";
import MDTypography from "qqq/components/legacy/MDTypography";

///////////////////////////////////////////
// structure of expected stats card data //
///////////////////////////////////////////
export interface StatisticsCardData
{
   count: number;
   countFontSize: string;
   countURL?: string;
   percentageAmount: number;
   percentageLabel: string;
}

/////////////////////////
// inputs and defaults //
/////////////////////////
interface Props
{
   data: StatisticsCardData;
   increaseIsGood: boolean;
   [key: string]: any;
}

StatisticsCard.defaultProps = {
   color: "info",
   increaseIsGood: true
};

function StatisticsCard({data, increaseIsGood}: Props): JSX.Element
{
   if(! data)
   {
      return null;
   }
   const {count, percentageAmount, percentageLabel} = data;

   let percentageString = "";
   if (percentageAmount)
   {
      percentageString = percentageAmount.toLocaleString() + "%";
      if (percentageAmount > 0)
      {
         percentageString = "+" + percentageString;
      }
   }

   let percentColor = "dark";
   if (percentageAmount !== 0)
   {
      if (increaseIsGood)
      {
         percentColor = (percentageAmount > 0) ? "success" : "warning";
      }
      else
      {
         percentColor = (percentageAmount < 0) ? "success" : "warning";
      }
   }

   return (

      <Box mt={0} sx={{minHeight: "112px", height: "100%", flexGrow: 1, flexDirection: "column", display: "flex", paddingTop: "0px"}}>
         <Box mt={0} display="flex" justifyContent="center">
            {
               count !== undefined ? (
                  <Typography pb={1} mt={0} sx={{color: "#344767", display: "flex", alignContent: "flex-end", fontSize: data?.countFontSize ? data?.countFontSize : "30px"}}>
                     {
                        data.countURL ? (
                           <NavLink to={data.countURL}>{count.toLocaleString()}</NavLink>
                        ) : (
                           count.toLocaleString()
                        )
                     }
                  </Typography>
               ) : (
                  <CircularProgress sx={{marginTop: "1rem", paddingBottom: "25px"}} color="inherit" size={data?.countFontSize ? data.countFontSize : 23}/>
               )
            }
         </Box>
         {
            percentageAmount !== undefined && percentageAmount !== 0 ? (
               <Box pb={2}>

                  <Divider sx={{marginTop: "0px"}} />
                  <MDTypography pl={3} component="p" variant="button" color="text" display="flex">
                     <MDTypography
                        component="span"
                        variant="button"
                        fontWeight="bold"
                        color={percentColor}
                     >
                        {percentageString}
                     </MDTypography>
                     &nbsp;{percentageLabel}
                  </MDTypography>
               </Box>
            ) : null
         }
      </Box>
   );
}


export default StatisticsCard;
