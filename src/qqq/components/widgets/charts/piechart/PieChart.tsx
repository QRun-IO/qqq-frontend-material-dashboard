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

import {Card, Skeleton} from "@mui/material";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import parse from "html-react-parser";
import React, {useEffect, useMemo, useState} from "react";
import {Pie} from "react-chartjs-2";
import {useNavigate} from "react-router-dom";
import MDTypography from "qqq/components/legacy/MDTypography";
import {chartColors} from "qqq/components/widgets/charts/DefaultChartData";
import configs from "qqq/components/widgets/charts/piechart/PieChartConfigs";
import ChartSubheaderWithData, {ChartSubheaderData} from "qqq/components/widgets/components/ChartSubheaderWithData";

//////////////////////////////////////////
// structure of expected bar chart data //
//////////////////////////////////////////
export interface PieChartData
{
   labels: string[];
   dataset: {
      label: string;
      backgroundColors?: string[];
      data: number[];
      urls?: string[];
   };
}


// Declaring props types for PieChart
interface Props
{
   description?: string;
   chartData: PieChartData;
   chartSubheaderData?: ChartSubheaderData;

   [key: string]: any;
}


function PieChart({description, chartData, chartSubheaderData}: Props): JSX.Element
{
   const navigate = useNavigate();
   const [dataLoaded, setDataLoaded] = useState(false);

   if (chartData && chartData.dataset)
   {
      if(!chartData.dataset.backgroundColors)
      {
         chartData.dataset.backgroundColors = chartColors;
      }
   }
   const {data, options} = configs(chartData?.labels || [], chartData?.dataset || {}, chartData?.dataset?.urls);

   useEffect(() =>
   {
      if (chartData)
      {
         setDataLoaded(true);
      }
   }, [chartData]);

   const handleClick = (e: Array<{}>) =>
   {
      if (e && e.length > 0 && chartData?.dataset?.urls && chartData?.dataset?.urls.length)
      {
         // @ts-ignore
         navigate(chartData.dataset.urls[e[0]["index"]]);
      }
   };

   return (
      <Card sx={{boxShadow: "none", height: "100%", width: "100%", display: "flex", flexGrow: 1, border: 0}}>
         <Box>
            <Box>
               {chartSubheaderData && (<ChartSubheaderWithData chartSubheaderData={chartSubheaderData} />)}
            </Box>
            <Box width="100%" height="300px">
               {useMemo(
                  () => (
                     <Pie data={data} options={options} getElementsAtEvent={handleClick} />
                  ),
                  [chartData]
               )}
            </Box>
            {
               !chartData && (
                  <Box sx={{
                     position: "absolute",
                     top: "40%",
                     left: "50%",
                     transform: "translate(-50%, -50%)",
                     display: "flex",
                     justifyContent: "center"
                  }}>
                     <Skeleton sx={{width: "150px", height: "150px"}} variant="circular" />
                  </Box>
               )
            }
            {
               description && (
                  <>
                     <Divider />
                     <Box display="flex" flexDirection={{xs: "column", sm: "row"}} mt="auto">
                        <MDTypography variant="button" color="text" fontWeight="light">
                           {parse(description)}
                        </MDTypography>
                     </Box>
                  </>
               )
            }
         </Box>
      </Card>
   );
}

// Declaring default props for PieChart
PieChart.defaultProps = {
   icon: {color: "info", component: ""},
   title: "",
   description: "",
   height: "19.125rem",
};

export default PieChart;
