/*
 * QQQ - Low-code Application Framework for Engineers.
 * Copyright (C) 2021-2024.  Kingsrook, LLC
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

import Typography from "@mui/material/Typography";
import BlockElementWrapper from "qqq/components/widgets/blocks/BlockElementWrapper";
import {StandardBlockComponentProps} from "qqq/components/widgets/blocks/BlockModels";


/*******************************************************************************
 ** Block that renders a progress bar!
 **
 ** Values:
 **    ${heading}
 **    [${percent}===___] ${value ?? percent}
 **
 ** Slots:
 **    ${heading}
 **    ${bar}             ${value}
 *******************************************************************************/
export default function ProgressBarBlock({widgetMetaData, data}: StandardBlockComponentProps): JSX.Element
{
   return (
      <Typography component="div" variant="button" color="text" fontWeight="light" sx={{textTransform: "none"}}>
         {
            data.values.heading &&
            <div style={{marginBottom: "0.25rem", fontWeight: 500, color: "#3D3D3D"}}>
               <BlockElementWrapper metaData={widgetMetaData} data={data} slot="heading">
                  <span>{data.values.heading}</span>
               </BlockElementWrapper>
            </div>
         }

         <div style={{display: "flex", alignItems: "center", marginBottom: "0.75rem"}}>

            <BlockElementWrapper metaData={widgetMetaData} data={data} slot="bar" linkProps={{style: {width: "100%"}}}>
               <div style={{background: "#E0E0E0", width: "100%", borderRadius: "0.5rem", height: "1rem"}}>
                  {
                     data.values.percent > 0 ? <div style={{background: data.styles.barColor ?? "#0062ff", minWidth: "1rem", width: `${data.values.percent}%`, borderRadius: "0.5rem", height: "1rem"}}></div> : <></>
                  }
               </div>
            </BlockElementWrapper>

            <div style={{width: "60px", textAlign: "right", fontWeight: 600, color: "#3D3D3D"}}>
               <BlockElementWrapper metaData={widgetMetaData} data={data} slot="value">
                  <span>{data.values.value ?? `${(data.values.percent as number).toFixed(1)}%`}</span>
               </BlockElementWrapper>
            </div>

         </div>
      </Typography>);

}
