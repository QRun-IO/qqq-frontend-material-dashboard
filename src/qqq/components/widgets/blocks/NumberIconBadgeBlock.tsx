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
import BlockElementWrapper from "qqq/components/widgets/blocks/BlockElementWrapper";
import {StandardBlockComponentProps} from "qqq/components/widgets/blocks/BlockModels";

/*******************************************************************************
 ** Block that renders ... a number, and an icon, like a badge.
 **
 ** ${number} ${icon}
 *******************************************************************************/
export default function NumberIconBadgeBlock({widgetMetaData, data}: StandardBlockComponentProps): JSX.Element
{
   return (
      <div style={{display: "inline-block", whiteSpace: "nowrap", color: data.styles.color}}>
         {
            data.values.number &&
            <BlockElementWrapper metaData={widgetMetaData} data={data} slot="number">
               <span style={{color: data.styles.color, fontSize: "0.875rem"}}>{data.values.number}</span>
            </BlockElementWrapper>
         }
         {
            data.values.iconName &&
            <BlockElementWrapper metaData={widgetMetaData} data={data} slot="icon">
               <Icon style={{color: data.styles.color, fontSize: "1rem", marginLeft: "2px", position: "relative", top: "4px"}}>{data.values.iconName}</Icon>
            </BlockElementWrapper>
         }
      </div>);
}
