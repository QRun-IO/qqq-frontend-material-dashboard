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


import {QWidgetMetaData} from "@qrunio/qqq-frontend-core/lib/model/metaData/QWidgetMetaData";
import {Alert, Skeleton} from "@mui/material";
import ButtonBlock from "qqq/components/widgets/blocks/ButtonBlock";
import AudioBlock from "qqq/components/widgets/blocks/AudioBlock";
import IconBlock from "qqq/components/widgets/blocks/IconBlock";
import InputFieldBlock from "qqq/components/widgets/blocks/InputFieldBlock";
import React from "react";
import BigNumberBlock from "qqq/components/widgets/blocks/BigNumberBlock";
import {BlockData} from "qqq/components/widgets/blocks/BlockModels";
import DividerBlock from "qqq/components/widgets/blocks/DividerBlock";
import NumberIconBadgeBlock from "qqq/components/widgets/blocks/NumberIconBadgeBlock";
import ProgressBarBlock from "qqq/components/widgets/blocks/ProgressBarBlock";
import TableSubRowDetailRowBlock from "qqq/components/widgets/blocks/TableSubRowDetailRowBlock";
import TextBlock from "qqq/components/widgets/blocks/TextBlock";
import UpOrDownNumberBlock from "qqq/components/widgets/blocks/UpOrDownNumberBlock";
import CompositeWidget from "qqq/components/widgets/CompositeWidget";
import ImageBlock from "./blocks/ImageBlock";


interface WidgetBlockProps
{
   widgetMetaData: QWidgetMetaData;
   block: BlockData;
   actionCallback?: (blockData: BlockData, eventValues?: {[name: string]: any}) => boolean;
   values?: { [key: string]: any };
}


/*******************************************************************************
 ** Component to render a single Block in the widget framework!
 *******************************************************************************/
export default function WidgetBlock({widgetMetaData, block, actionCallback, values}: WidgetBlockProps): JSX.Element
{
   if(!block)
   {
      return (<Skeleton />);
   }

   if(!block.values)
   {
      block.values = {};
   }

   if(!block.styles)
   {
      block.styles = {};
   }

   if(block.blockTypeName == "COMPOSITE")
   {
      // @ts-ignore - special case for composite type block...
      return (<CompositeWidget widgetMetaData={widgetMetaData} data={block} actionCallback={actionCallback} values={values} />);
   }

   switch(block.blockTypeName)
   {
      case "TEXT":
         return (<TextBlock widgetMetaData={widgetMetaData} data={block} />);
      case "NUMBER_ICON_BADGE":
         return (<NumberIconBadgeBlock widgetMetaData={widgetMetaData} data={block} />);
      case "UP_OR_DOWN_NUMBER":
         return (<UpOrDownNumberBlock widgetMetaData={widgetMetaData} data={block} />);
      case "TABLE_SUB_ROW_DETAIL_ROW":
         return (<TableSubRowDetailRowBlock widgetMetaData={widgetMetaData} data={block} />);
      case "PROGRESS_BAR":
         return (<ProgressBarBlock widgetMetaData={widgetMetaData} data={block} />);
      case "DIVIDER":
         return (<DividerBlock widgetMetaData={widgetMetaData} data={block} />);
      case "BIG_NUMBER":
         return (<BigNumberBlock widgetMetaData={widgetMetaData} data={block} />);
      case "INPUT_FIELD":
         return (<InputFieldBlock widgetMetaData={widgetMetaData} data={block} actionCallback={actionCallback} />);
      case "BUTTON":
         return (<ButtonBlock widgetMetaData={widgetMetaData} data={block} actionCallback={actionCallback} />);
      case "AUDIO":
         return (<AudioBlock widgetMetaData={widgetMetaData} data={block} />);
      case "IMAGE":
         return (<ImageBlock widgetMetaData={widgetMetaData} data={block} actionCallback={actionCallback} />);
      case "ICON":
         return (<IconBlock widgetMetaData={widgetMetaData} data={block} actionCallback={actionCallback} />);
      default:
         return (<Alert sx={{m: "0.5rem"}} color="warning">Unsupported block type: {block.blockTypeName}</Alert>)
   }

}
