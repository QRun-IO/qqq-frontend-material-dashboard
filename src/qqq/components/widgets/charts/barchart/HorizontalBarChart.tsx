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

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";
import {ReactNode, useMemo} from "react";
import {Bar} from "react-chartjs-2";
import colors from "qqq/components/legacy/colors";
import MDTypography from "qqq/components/legacy/MDTypography";
import {GenericChartData} from "qqq/components/widgets/charts/datastructures/GenericChartData";


//////////////////
// configuation //
//////////////////
const options = {
   indexAxis: "y",
   responsive: true,
   maintainAspectRatio: false,
   plugins: {
      legend: {
         display: true,
      },
      tooltip: {
         enabled: true,
         callbacks: {
            label: function(context:any)
            {
               return(context.parsed.x);
            }
         }
      },
   },
   scales: {
      y: {
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
         },
      },
      x: {
         grid: {
            drawBorder: false,
            display: false,
            drawOnChartArea: true,
            drawTicks: true,
            color: "#c1c4ce5c",
         },
         ticks: {
            display: true,
            color: "#9ca2b7",
            padding: 0,
            font: {
               size: 14,
               weight: 300,
               family: "SF Pro Display,Roboto",
               style: "normal",
               lineHeight: 2,
            },
            callback: function(value: any, index: any, values: any)
            {
               return value;
            }
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
   title?: string;
   description?: string | ReactNode;
   height?: string | number;
   isCurrency?: boolean;
   data: GenericChartData;

   [key: string]: any;
}

function HorizontalBarChart({icon, title, description, height, data, isCurrency}: Props): JSX.Element
{
   let fullData = {};
   if(data && data.datasets)
   {
      const chartDatasets = data.datasets
         ? data.datasets.map((dataset) => ({
            ...dataset,
            weight: 5,
            borderWidth: 0,
            borderRadius: 4,
            backgroundColor: dataset?.color
               ? dataset.color
               : colors.info.main,
            fill: false,
            maxBarThickness: 15,
         }))
         : [];

      if (data)
      {
         fullData = {
            labels: data.labels,
            datasets: chartDatasets
         };
      }
   }

   let customOptions = options;
   if(isCurrency)
   {
      customOptions.scales.x.ticks =
      {
         ... customOptions.scales.x.ticks,
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
            return context.parsed.x.toLocaleString("en-US", {style: "currency", currency: "USD", minimumFractionDigits: 0});
         }
      }
   }

   const renderChart = (
      <Box py={2} pr={2} pl={icon.component ? 1 : 2} sx={{alignItems: "stretch", flexGrow: 1, display: "flex", marginTop: "0px", paddingTop: "0px"}}>
         {title || description && (
            <Box display="flex" px={description ? 1 : 0} pt={description ? 1 : 0} sx={{alignItems: "stretch", flexGrow: 1, display: "flex", marginTop: "0px", paddingTop: "0px"}}>
               {icon.component && (
                  <Box
                     width="4rem"
                     height="4rem"
                     borderRadius="xl"
                     display="flex"
                     justifyContent="center"
                     alignItems="center"
                     color="white"
                     mt={-5}
                     mr={2}
                     sx={{backgroundColor: icon.color || "info"}}
                  >
                     <Icon fontSize="medium">{icon.component}</Icon>
                  </Box>
               )}
               <Box mt={icon.component ? -2 : 0}>
                  {title && <MDTypography variant="h5">{title}</MDTypography>}
                  <Box mb={2}>
                     <MDTypography component="div" variant="button" color="text">
                        {description}
                     </MDTypography>
                  </Box>
               </Box>
            </Box>
         )}
         {useMemo(
            () => (
               <Box height={height} sx={{alignItems: "stretch", flexGrow: 1, display: "flex", marginTop: "0px", paddingTop: "0px"}}>
                  {
                     data && data?.datasets && data?.datasets.length > 0 ?(
                        <Bar data={fullData} options={options} />
                     ):(
                        <Box mt={2} sx={{width: "100%", textAlign: "center"}}><i>No data was provided to this chart</i></Box>
                     )
                  }
               </Box>
            ),
            [data, height]
         )}
      </Box>
   );

   return title || description ? <Card>{renderChart}</Card> : renderChart;
}

HorizontalBarChart.defaultProps = {
   icon: {color: "info", component: ""},
   title: "",
   description: "",
   height: "19.125rem",
};

export default HorizontalBarChart;
