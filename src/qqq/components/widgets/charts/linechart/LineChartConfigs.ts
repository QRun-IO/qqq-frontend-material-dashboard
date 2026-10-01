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

function configs(labels: any, datasets: any)
{
   return {
      data: {
         labels,
         datasets: [
            {
               label: datasets.label,
               tension: 0,
               pointRadius: 5,
               pointBorderColor: "transparent",
               pointBackgroundColor: "rgba(255, 255, 255, .8)",
               borderColor: "rgba(255, 255, 255, .8)",
               borderWidth: 4,
               backgroundColor: "transparent",
               fill: true,
               data: datasets.data,
               maxBarThickness: 6,
            },
         ],
      },
      options: {
         responsive: true,
         maintainAspectRatio: false,
         plugins: {
            legend: {
               display: false,
            },
         },
         interaction: {
            intersect: false,
            mode: "index",
         },
         scales: {
            y: {
               grid: {
                  drawBorder: false,
                  display: true,
                  drawOnChartArea: true,
                  drawTicks: false,
                  borderDash: [5, 5],
                  color: "rgba(255, 255, 255, .2)",
               },
               ticks: {
                  display: true,
                  color: "#f8f9fa",
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
            x: {
               grid: {
                  drawBorder: false,
                  display: false,
                  drawOnChartArea: false,
                  drawTicks: false,
                  borderDash: [5, 5],
               },
               ticks: {
                  display: true,
                  color: "#f8f9fa",
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
      },
   };
}

export default configs;
