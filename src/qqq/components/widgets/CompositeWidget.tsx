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
import {Box, Skeleton} from "@mui/material";
import Card from "@mui/material/Card";
import Modal from "@mui/material/Modal";
import parse from "html-react-parser";
import {BlockData} from "qqq/components/widgets/blocks/BlockModels";
import WidgetBlock from "qqq/components/widgets/WidgetBlock";
import ProcessWidgetBlockUtils from "qqq/pages/processes/ProcessWidgetBlockUtils";
import React, {useEffect, useState} from "react";


export interface CompositeData
{
   blockId: string;
   blocks: BlockData[];
   styleOverrides?: any;
   layout?: string;
   overlayHtml?: string;
   overlayStyleOverrides?: any;
   modalMode: string;
   styles?: any;
}


interface CompositeWidgetProps
{
   widgetMetaData: QWidgetMetaData;
   data: CompositeData;
   actionCallback?: (blockData: BlockData, eventValues?: { [name: string]: any }) => boolean;
   values?: { [key: string]: any };
}


/*******************************************************************************
 ** Widget which is a list of Blocks.
 *******************************************************************************/
export default function CompositeWidget({widgetMetaData, data, actionCallback, values}: CompositeWidgetProps): JSX.Element
{
   if (!data || !data.blocks)
   {
      return (<Skeleton />);
   }

   ////////////////////////////////////////////////////////////////////////////////////
   // note - these layouts are defined in qqq in the CompositeWidgetData.Layout enum //
   ////////////////////////////////////////////////////////////////////////////////////
   let layout = data?.layout;
   let boxStyle: any = {};
   if (layout == "FLEX_COLUMN")
   {
      boxStyle.display = "flex";
      boxStyle.flexDirection = "column";
      boxStyle.flexWrap = "wrap";
      boxStyle.gap = "0.5rem";
   }
   else if (layout == "FLEX_ROW_WRAPPED")
   {
      boxStyle.display = "flex";
      boxStyle.flexDirection = "row";
      boxStyle.flexWrap = "wrap";
      boxStyle.gap = "0.5rem";
   }
   else if (layout == "FLEX_ROW")
   {
      boxStyle.display = "flex";
      boxStyle.flexDirection = "row";
      boxStyle.gap = "0.5rem";
   }
   else if (layout == "FLEX_ROW_SPACE_BETWEEN")
   {
      boxStyle.display = "flex";
      boxStyle.flexDirection = "row";
      boxStyle.justifyContent = "space-between";
      boxStyle.gap = "0.25rem";
   }
   else if (layout == "FLEX_ROW_CENTER")
   {
      boxStyle.display = "flex";
      boxStyle.flexDirection = "row";
      boxStyle.justifyContent = "center";
      boxStyle.gap = "0.25rem";
      boxStyle.flexWrap = "wrap";
   }
   else if (layout == "TABLE_SUB_ROW_DETAILS")
   {
      boxStyle.display = "flex";
      boxStyle.flexDirection = "column";
      boxStyle.fontSize = "0.875rem";
      boxStyle.fontWeight = 400;
      boxStyle.borderRight = "1px solid #D0D0D0";
   }
   else if (layout == "BADGES_WRAPPER")
   {
      boxStyle.display = "flex";
      boxStyle.gap = "0.25rem";
      boxStyle.padding = "0 0.25rem";
      boxStyle.fontSize = "0.875rem";
      boxStyle.fontWeight = 400;
      boxStyle.border = "1px solid gray";
      boxStyle.borderRadius = "0.5rem";
      boxStyle.background = "#FFFFFF";
   }
   if (data?.styleOverrides)
   {
      boxStyle = {...boxStyle, ...data.styleOverrides};
   }

   if (data.styles?.backgroundColor)
   {
      boxStyle.backgroundColor = ProcessWidgetBlockUtils.processColorFromStyleMap(data.styles.backgroundColor);
   }

   if (data.styles?.padding)
   {
      boxStyle.paddingTop = data.styles?.padding.top + "px"
      boxStyle.paddingBottom = data.styles?.padding.bottom + "px"
      boxStyle.paddingLeft = data.styles?.padding.left + "px"
      boxStyle.paddingRight = data.styles?.padding.right + "px"
   }

   let overlayStyle: any = {};

   if (data?.overlayStyleOverrides)
   {
      overlayStyle = {...overlayStyle, ...data.overlayStyleOverrides};
   }

   const content = (
      <>
         {
            data?.overlayHtml &&
            <Box sx={overlayStyle} className="blockWidgetOverlay">{parse(data.overlayHtml)}</Box>
         }
         <Box sx={boxStyle} className="compositeWidget">
            {
               data.blocks.map((block: BlockData, index) => (
                  <React.Fragment key={index}>
                     <WidgetBlock widgetMetaData={widgetMetaData} block={block} actionCallback={actionCallback} values={values} />
                  </React.Fragment>
               ))
            }
         </Box>
      </>
   );

   if (data.modalMode)
   {
      const [isModalOpen, setIsModalOpen] = useState(values && (values[data.blockId] == true));

      /***************************************************************************
       **
       ***************************************************************************/
      const controlCallback = (newValue: boolean) =>
      {
         setIsModalOpen(newValue);
      };

      /***************************************************************************
       **
       ***************************************************************************/
      const modalOnClose = (event: object, reason: string) =>
      {
         values[data.blockId] = false;
         setIsModalOpen(false);
         actionCallback({blockTypeName: "BUTTON", values: {}}, {controlCode: `hideModal:${data.blockId}`});
      };

      //////////////////////////////////////////////////////////////////////////////////////////
      // register the control-callback function - so when buttons are clicked, we can be told //
      //////////////////////////////////////////////////////////////////////////////////////////
      useEffect(() =>
      {
         if (actionCallback)
         {
            actionCallback(null, {
               registerControlCallbackName: data.blockId,
               registerControlCallbackFunction: controlCallback
            });
         }
      }, []);

      return (<Modal open={isModalOpen} onClose={modalOnClose}>
         <Box sx={{position: "absolute", overflowY: "auto", maxHeight: "100%", width: "100%"}}>
            <Card sx={{my: 5, mx: "auto", p: "1rem", maxWidth: "1024px"}}>
               {content}
            </Card>
         </Box>
      </Modal>);
   }
   else
   {
      return content;
   }

}
