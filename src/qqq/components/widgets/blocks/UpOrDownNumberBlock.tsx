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

import Icon from "@mui/material/Icon";
import React from "react";
import BlockElementWrapper from "qqq/components/widgets/blocks/BlockElementWrapper";
import {StandardBlockComponentProps} from "qqq/components/widgets/blocks/BlockModels";


/*******************************************************************************
 ** Block that renders an up/down icon, a number, and some context
 **
 ** ${icon} ${number} ${context}
 *
 ** or, if style.isStacked:
 *
 ** ${icon} ${number}
 ** ${context}
 *******************************************************************************/
export default function UpOrDownNumberBlock({widgetMetaData, data}: StandardBlockComponentProps): JSX.Element
{
   if (!data.styles)
   {
      data.styles = {};
   }

   if (!data.values)
   {
      data.values = {};
   }

   const UP_ICON = "arrow_drop_up";
   const DOWN_ICON = "arrow_drop_down";

   const defaultGreenColor = "#2BA83F";
   const defaultRedColor = "#FB4141";

   const goodOrBadColor = data.styles.colorOverride ?? (data.values.isGood ? defaultGreenColor : defaultRedColor);
   const iconName = data.values.isUp ? UP_ICON : DOWN_ICON;

   return (
      <>
         <div style={{display: "flex", flexDirection: data.styles.isStacked ? "column" : "row", alignItems: data.styles.isStacked ? "flex-end" : "baseline", marginLeft: "auto"}}>

            <div style={{display: "flex", alignItems: "baseline", fontWeight: 700, fontSize: ".875rem"}}>
               <BlockElementWrapper metaData={widgetMetaData} data={data} slot="number">
                  <>
                     <Icon sx={{color: goodOrBadColor, alignSelf: "flex-end", fontSize: "2.25rem !important", lineHeight: "0.875rem", height: "1rem", width: "2rem",}}>{iconName}</Icon>
                     <span style={{color: goodOrBadColor}}>{data.values.number}</span>
                  </>
               </BlockElementWrapper>
            </div>

            <div style={{fontWeight: 500, fontSize: "0.875rem", color: "#7b809a", marginLeft: "0.25rem"}}>
               <BlockElementWrapper metaData={widgetMetaData} data={data} slot="context">
                  <span>{data.values.context}</span>
               </BlockElementWrapper>
            </div>

         </div>
      </>
   );
}
