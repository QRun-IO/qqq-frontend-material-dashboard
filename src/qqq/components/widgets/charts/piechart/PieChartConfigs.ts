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

import colors from "qqq/assets/theme/base/colors";

const {gradients, dark} = colors;

function configs(labels: any, datasets: any, urls: string[] | undefined)
{
   const backgroundColors = [];

   if (datasets.backgroundColors)
   {
      datasets.backgroundColors.forEach((color: string) =>
      {
         if (gradients[color])
         {
            backgroundColors.push(gradients[color].state);
         }
         else
         {
            backgroundColors.push(color);
         }
      });
   }
   else
   {
      backgroundColors.push(dark.main);
   }

   return {
      data: {
         labels,
         datasets: [
            {
               label: datasets.label,
               weight: 9,
               cutout: 0,
               tension: 0.9,
               pointRadius: 2,
               borderWidth: 2,
               backgroundColor: backgroundColors,
               fill: false,
               data: datasets.data,
            },
         ],
      },
      options: {
         maintainAspectRatio: false,
         responsive: true,
         onHover: function (event: any, elements: any[], chart: any)
         {
            if(event.type == "mousemove" && elements.length > 0 && urls && urls.length > elements[0].index && urls[elements[0].index])
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
               callbacks: {
                  label: function(context: any)
                  {
                     let percentSuffix = "";
                     try
                     {
                        //////////////////////////////////////////////////////////////////////////
                        // make percent by dividing this slice's value by the sum of all values //
                        //////////////////////////////////////////////////////////////////////////
                        const thisSlice = context.dataset.data[context.dataIndex];
                        const sum = context.dataset.data.reduce((acc: number, val: number) => acc + val, 0);
                        percentSuffix = " (" + Number(100 * thisSlice / sum).toFixed(1) + "%)";
                     }
                     catch(e)
                     {
                        // leave percentSuffix empty
                     }

                     ////////////////////////////////////////////////////////////////////////////////
                     // our labels already have the value in them - so just use the label in the   //
                     // tooltip (lib by default puts label + value, so we were duplicating value!) //
                     // oh, and we add percent if we can                                           //
                     ////////////////////////////////////////////////////////////////////////////////
                     return context.label + percentSuffix;
                  }
               }
            },
            legend: {
               position: "bottom",
               labels: {
                  usePointStyle: true,
                  pointStyle: "circle",
                  padding: 12,
                  boxHeight: 8,
                  boxWidth: 8,
                  font: {
                     size: 14
                  }
               }
            },
         },
         scales: {
            y: {
               grid: {
                  drawBorder: false,
                  display: false,
                  drawOnChartArea: false,
                  drawTicks: false,
               },
               ticks: {
                  display: false,
               },
            },
            x: {
               grid: {
                  drawBorder: false,
                  display: false,
                  drawOnChartArea: false,
                  drawTicks: false,
               },
               ticks: {
                  display: false,
               },
            },
         },
      },
   };
}

export default configs;
