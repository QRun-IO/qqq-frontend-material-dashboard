/*
 * QQQ - Low-code Application Framework for Engineers.
 * Copyright (C) 2021-2024.  Kingsrook, LLC
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
