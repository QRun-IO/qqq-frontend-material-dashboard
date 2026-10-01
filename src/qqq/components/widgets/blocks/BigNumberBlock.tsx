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
 ** Block that renders ... a big number, optionally with some other stuff.
 **
 ** ${heading}
 ** ${number} ${context}
 *******************************************************************************/
export default function BigNumberBlock({widgetMetaData, data}: StandardBlockComponentProps): JSX.Element
{
   let flexJustifyContent = "normal";
   let flexAlignItems = "baseline";

   return (
      <div style={{width: data.styles.width ?? "auto"}}>

         <div style={{fontWeight: "700", fontSize: "0.875rem", color: "#3D3D3D", marginBottom: "-0.5rem"}}>
            <BlockElementWrapper metaData={widgetMetaData} data={data} slot="heading">
               <span>{data.values.heading}</span>
            </BlockElementWrapper>
         </div>

         <div style={{display: "flex", alignItems: flexAlignItems, justifyContent: flexJustifyContent}}>

            <div style={{display: "flex", alignItems: "baseline"}}>
               <div style={{fontWeight: "700", fontSize: "2rem", marginRight: "0.25rem"}}>
                  <BlockElementWrapper metaData={widgetMetaData} data={data} slot="number">
                     <span style={{color: data.styles.numberColor}}>{data.values.number}</span>
                  </BlockElementWrapper>
               </div>
               {
                  data.values.context &&
                  <div style={{fontWeight: "500", fontSize: "0.875rem", color: "#7b809a"}}>
                     <BlockElementWrapper metaData={widgetMetaData} data={data} slot="context">
                        <span>{data.values.context}</span>
                     </BlockElementWrapper>
                  </div>
               }
            </div>

         </div>
      </div>
   );
}
