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

import BlockElementWrapper from "qqq/components/widgets/blocks/BlockElementWrapper";
import {StandardBlockComponentProps} from "qqq/components/widgets/blocks/BlockModels";


/*******************************************************************************
 ** Block that renders a label & value, meant to be used as a detail-row in a
 ** sub-row within a table widget
 **
 ** ${label} ${value}
 *******************************************************************************/
export default function TableSubRowDetailRowBlock({widgetMetaData, data}: StandardBlockComponentProps): JSX.Element
{
   return (
      <div style={{display: "flex", maxWidth: "calc(100% - 24px)", justifyContent: "space-between"}}>

         {
            data.values.label &&
            <div style={{overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis"}}>
               <BlockElementWrapper metaData={widgetMetaData} data={data} slot="label">
                  <span style={{color: data.styles.labelColor}}>{data.values.label}</span>
               </BlockElementWrapper>
            </div>
         }

         {
            data.values.value &&
            <BlockElementWrapper metaData={widgetMetaData} data={data} slot="value">
               <span style={{color: data.styles.valueColor}}>{data.values.value}</span>
            </BlockElementWrapper>
         }
      </div>
   );
}
