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
