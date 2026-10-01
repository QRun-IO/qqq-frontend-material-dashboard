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
import {Box, Tooltip} from "@mui/material";
import QContext from "QContext";
import HelpContent, {hasHelpContent} from "qqq/components/misc/HelpContent";
import {BlockData, BlockLink, BlockTooltip} from "qqq/components/widgets/blocks/BlockModels";
import CompositeWidget from "qqq/components/widgets/CompositeWidget";
import React, {ReactElement, useContext} from "react";
import {Link} from "react-router-dom";

interface BlockElementWrapperProps
{
   data: BlockData;
   metaData: QWidgetMetaData;
   slot: string;
   linkProps?: any;
   children: ReactElement;
}

/*******************************************************************************
 ** For Blocks - wrap their "slot" elements with an optional tooltip and/or link
 *******************************************************************************/
export default function BlockElementWrapper({data, metaData, slot, linkProps, children}: BlockElementWrapperProps): JSX.Element
{
   const {helpHelpActive} = useContext(QContext);

   let link: BlockLink;
   let tooltip: BlockTooltip;

   if (slot)
   {
      link = data.linkMap && data.linkMap[slot.toUpperCase()];
      if (!link)
      {
         link = data.link;
      }

      tooltip = data.tooltipMap && data.tooltipMap[slot.toUpperCase()];
      if (!tooltip)
      {
         tooltip = data.tooltip;
      }
   }
   else
   {
      link = data.link;
      tooltip = data.tooltip;
   }

   if (!tooltip)
   {
      const helpRoles = ["ALL_SCREENS"];

      ///////////////////////////////////////////////////////////////////////////////////////////////
      // the full keys in the helpContent table will look like:                                    //
      // widget:MyCoolWidget;slot=myBlockId,label (if the block has a blockId in data)             //
      // widget:MyCoolWidget;slot=label (no blockId; note, label is slot name here)                //
      // in the widget metaData, the map of helpContent will just have the "slot" portion as a key //
      ///////////////////////////////////////////////////////////////////////////////////////////////
      const key = data.blockId ? `${data.blockId},${slot}` : slot;
      const showHelp = helpHelpActive || hasHelpContent(metaData?.helpContent?.get(key), helpRoles);

      if (showHelp)
      {
         const formattedHelpContent = <HelpContent helpContents={metaData?.helpContent?.get(key)} roles={helpRoles} helpContentKey={`widget:${metaData?.name};slot:${key}`} />;
         tooltip = {title: formattedHelpContent, placement: "bottom"};
      }
   }

   let rs = children;

   if (link && link.href)
   {
      rs = <Link to={link.href} target={link.target} style={{color: "#546E7A"}} {...linkProps}>{rs}</Link>;
   }

   if (tooltip)
   {
      let placement = tooltip.placement ? tooltip.placement.toLowerCase() : "bottom";

      // @ts-ignore - placement possible values
      if (tooltip.blockData)
      {
         // @ts-ignore - special case for composite type block...
         rs = <Tooltip title={
            <Box sx={{width: "200px"}}>
               <CompositeWidget widgetMetaData={metaData} data={tooltip?.blockData} />
            </Box>
         }>{rs}</Tooltip>;
      }
      else
      {
         // @ts-ignore - placement possible values
         rs = <Tooltip title={tooltip.title} placement={placement}>{rs}</Tooltip>;
      }
   }

   return (rs);
}
