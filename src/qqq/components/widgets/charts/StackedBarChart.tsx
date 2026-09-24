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
import {BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Title, Tooltip,} from "chart.js";
import React, {useEffect, useState} from "react";
import {Bar} from "react-chartjs-2";
import {useNavigate} from "react-router-dom";
import colors from "qqq/assets/theme/base/colors";
import {chartColors, DefaultChartData} from "qqq/components/widgets/charts/DefaultChartData";
import ChartSubheaderWithData, {ChartSubheaderData} from "qqq/components/widgets/components/ChartSubheaderWithData";

ChartJS.register(
   CategoryScale,
   LinearScale,
   BarElement,
   Title,
   Tooltip,
   Legend
);

export const makeOptions = (data: DefaultChartData) =>
{
   return({
      maintainAspectRatio: false,
      responsive: true,
      animation: {
         duration: 0
      },
      elements: {
         bar: {
            borderRadius: 4
         }
      },
      onHover: function (event: any, elements: any[], chart: any)
      {
         if(event.type == "mousemove" && elements.length > 0 && data.urls && data.urls.length > elements[0].index && data.urls[elements[0].index])
         {
            chart.canvas.style.cursor = "pointer";
         }
         else
         {
            chart.canvas.style.cursor = "default";
         }
      },
      plugins: {
         tooltip: {
            // todo - some configs around this
            callbacks: {
               title: function(context: any)
               {
                  return ("");
               },
               label: function(context: any)
               {
                  if(context.dataset.label.startsWith(context.label))
                  {
                     return `${context.label}: ${context.formattedValue}`;
                  }
                  else
                  {
                     return ("");
                  }
               }
            }
         },
         legend: {
            position: "bottom",
            labels: {
               usePointStyle: true,
               pointStyle: "circle",
               boxHeight: 6,
               boxWidth: 6,
               padding: 12,
               font: {
                  size: 14
               }
            }
         }
      },
      scales: {
         x: {
            stacked: true,
            grid: {display: false},
            ticks: {autoSkip: false, maxRotation: 90}
         },
         y: {
            stacked: true,
            position: "right",
            ticks: {precision: 0}
         },
      },
   });
}

interface Props
{
   data: DefaultChartData;
   chartSubheaderData?: ChartSubheaderData;
}

const {gradients} = colors;

function StackedBarChart({data, chartSubheaderData}: Props): JSX.Element
{
   const navigate = useNavigate();

   const [stateData, setStateData] = useState(data);


   const handleClick = (e: Array<{}>) =>
   {
      if (e && e.length > 0 && data?.urls && data?.urls.length)
      {
         // @ts-ignore
         navigate(data.urls[e[0]["index"]]);
      }
      console.log(e);
   };

   useEffect(() =>
   {
      if (data)
      {
         data?.datasets?.forEach((dataset: any, index: number) =>
         {
            if (!dataset.backgroundColor)
            {
               if (gradients[chartColors[index]])
               {
                  dataset.backgroundColor = gradients[chartColors[index]].state;
               }
               else
               {
                  dataset.backgroundColor = chartColors[index];
               }
            }
         });
         setStateData(stateData);
      }
   }, [data]);


   return data ? (
      <Box>
         {chartSubheaderData && (<ChartSubheaderWithData chartSubheaderData={chartSubheaderData} />)}
         <Box width="100%" height="300px">
            <Bar data={{...data, labels: data.labels ?? [], datasets: data.datasets ?? []}} options={makeOptions(data)} getElementsAtEvent={handleClick} />
         </Box>
      </Box>
   ) : <Skeleton sx={{marginLeft: "20px", marginRight: "20px", height: "200px"}} />;
}

export default StackedBarChart;
