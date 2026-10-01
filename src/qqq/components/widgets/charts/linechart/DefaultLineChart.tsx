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

import Box from "@mui/material/Box";
import React, {ReactNode, useMemo} from "react";
import {Line} from "react-chartjs-2";
import colors from "qqq/assets/theme/base/colors";
import MDBadgeDot from "qqq/components/legacy/MDBadgeDot";

//////////////////////////////////////////
// structure of default line chart data //
//////////////////////////////////////////
export interface DefaultLineChartData
{
   labels: string[];
   lineLabels?: string[];
   datasets: {
      label: string;
      color?: "primary" | "secondary" | "info" | "success" | "warning" | "error" | "light" | "dark";
      data: number[];
   }[];
};

/////////////////////
// display options //
/////////////////////
const options = {
   responsive: true,
   maintainAspectRatio: false,
   plugins: {
      legend: {
         display: false,
      },
      tooltip: {
         enabled: true,
         callbacks: {
            label: function(context:any)
            {
               return(" " + Number(context.parsed.y).toLocaleString());
            }
         }
      }
   },
   interaction: {
      intersect: false,
      mode: "index",
   },
   scales: {
      y: {
         beginAtZero: true,
         grid: {
            drawBorder: false,
            display: true,
            drawOnChartArea: true,
            drawTicks: false,
            borderDash: [5, 5],
            color: "#c1c4ce5c",
         },
         ticks: {
            display: true,
            padding: 10,
            color: "#9ca2b7",
            font: {
               size: 14,
               weight: 300,
               family: "SF Pro Display,Roboto",
               style: "normal",
               lineHeight: 2,
            },
            callback: function(value: any, index: any, values: any)
            {
               return value.toLocaleString();
            }
         },
      },
      x: {
         grid: {
            drawBorder: false,
            display: true,
            drawOnChartArea: true,
            drawTicks: true,
            borderDash: [5, 5],
            color: "#c1c4ce5c",
         },
         ticks: {
            display: true,
            color: "#9ca2b7",
            padding: 10,
            font: {
               size: 14,
               weight: 300,
               family: "SF Pro Display,Roboto",
               style: "normal",
               lineHeight: 2,
            },
         },
      },
   },
};

/////////////////////////
// inputs and defaults //
/////////////////////////
interface Props
{
   icon?: {
      color?: "primary" | "secondary" | "info" | "success" | "warning" | "error" | "light" | "dark";
      component: ReactNode;
   };
   height?: string | number;
   description?: any;
   isYAxisCurrency?: boolean;
   data: DefaultLineChartData;

   [key: string]: any;
}

DefaultLineChart.defaultProps = {
   icon: {color: "info", component: ""},
   height: "19.125rem",
};


function DefaultLineChart({data, height, isYAxisCurrency}: Props): JSX.Element
{
   const allBackgroundColors = ["info", "warning", "primary", "success", "error", "secondary", "dark"];
   if (data && data.datasets)
   {
      data.datasets.forEach((ds, index) =>
      {
         // @ts-ignore
         ds.color = allBackgroundColors[index];
      });
   }

   const description= (
      <Box display="flex" justifyContent="space-between">
         <Box display="flex" ml={-1}>
            {
               data?.datasets?.map((dataSet: any) => (
                  <MDBadgeDot key={dataSet.label} color={dataSet.color} size="sm" badgeContent={dataSet.label} />
               ))
            }
         </Box>
         <Box mt={-4} mr={-1} position="absolute" right="1.5rem" />
      </Box>
   );

   const chartDatasets = data && data.datasets
      ? data.datasets.map((dataset) => ({
         ...dataset,
         tension: 0,
         pointRadius: 3,
         borderWidth: 4,
         backgroundColor: "transparent",
         fill: true,
         pointBackgroundColor: colors[dataset.color]
            ? colors[dataset.color || "dark"].main
            : colors.dark.main,
         borderColor: colors[dataset.color]
            ? colors[dataset.color || "dark"].main
            : colors.dark.main,
         maxBarThickness: 6,
      }))
      : [];

   let customOptions = options;
   if(isYAxisCurrency)
   {
      customOptions.scales.y.ticks =
         {
            ... customOptions.scales.y.ticks,
            callback: function(value: any, index: any, values: any)
            {
               return value.toLocaleString("en-US", {style: "currency", currency: "USD", minimumFractionDigits: 0});
            }
         }
      customOptions.plugins.tooltip.callbacks =
         {
            ... customOptions.plugins.tooltip.callbacks,
            label: function(context:any)
            {
               return " " + context.parsed.y.toLocaleString("en-US", {style: "currency", currency: "USD", minimumFractionDigits: 2});
            }
         }
   }

   let fullData = {};
   if (data)
   {
      fullData = {
         labels: data.labels,
         datasets: chartDatasets
      };
   }

   return (
      <Box py={2} pr={2} pl={2}>
         {description}
         {useMemo(
            () => (
               <Box height={height}>
                  <Line data={fullData} options={options} />
               </Box>
            ),

            [data, height]
         )}
      </Box>
   );
}

export default DefaultLineChart;
