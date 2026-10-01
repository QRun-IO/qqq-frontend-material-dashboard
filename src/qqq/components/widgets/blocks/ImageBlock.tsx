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

import Box from "@mui/material/Box";
import BlockElementWrapper from "qqq/components/widgets/blocks/BlockElementWrapper";
import {StandardBlockComponentProps} from "qqq/components/widgets/blocks/BlockModels";
import DumpJsonBox from "qqq/utils/DumpJsonBox";
import React from "react";

/*******************************************************************************
 ** Block that renders ... an image tag
 **
 ** <audio src=${path} ${autoPlay} ${showControls} />
 *******************************************************************************/
export default function ImageBlock({widgetMetaData, data}: StandardBlockComponentProps): JSX.Element
{
   let imageStyle: any = {};

   if(data.styles?.width)
   {
      imageStyle.width = data.styles?.width;
   }

   if(data.styles?.height)
   {
      imageStyle.height = data.styles?.height;
   }

   if(data.styles?.bordered)
   {
      imageStyle.border = "1px solid #C0C0C0";
      imageStyle.borderRadius = "0.5rem";
   }


   return (
      <BlockElementWrapper metaData={widgetMetaData} data={data} slot="">
         <img src={data.values?.path} alt={data.values?.alt} style={imageStyle} />
      </BlockElementWrapper>
   );
}
