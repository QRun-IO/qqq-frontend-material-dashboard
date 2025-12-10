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
import Icon from "@mui/material/Icon";
import BlockElementWrapper from "qqq/components/widgets/blocks/BlockElementWrapper";
import {StandardBlockComponentProps} from "qqq/components/widgets/blocks/BlockModels";
import ProcessWidgetBlockUtils from "qqq/pages/processes/ProcessWidgetBlockUtils";
import React from "react";

/*******************************************************************************
 ** Block that renders ... just some text.
 **
 ** ${text}
 *******************************************************************************/
export default function TextBlock({widgetMetaData, data}: StandardBlockComponentProps): JSX.Element
{
   let color = "rgba(0, 0, 0, 0.87)";
   if (data.styles?.color)
   {
      color = ProcessWidgetBlockUtils.processColorFromStyleMap(data.styles.color);
   }

   let boxStyle = {};
   if (data.styles?.format == "alert")
   {
      boxStyle =
         {
            border: `1px solid ${color}`,
            background: `${color}40`,
            padding: "0.5rem",
            borderRadius: "0.5rem",
         };
   }
   else if (data.styles?.format == "banner")
   {
      boxStyle =
         {
            background: `${color}40`,
            padding: "0.5rem",
         };
   }

   let fontSize = "1rem";
   if (data.styles?.size)
   {
      switch (data.styles.size.toLowerCase())
      {
         case "largest":
            fontSize = "3rem";
            break;
         case "headline":
            fontSize = "2rem";
            break;
         case "title":
            fontSize = "1.5rem";
            break;
         case "body":
            fontSize = "1rem";
            break;
         case "smallest":
            fontSize = "0.75rem";
            break;
         default:
         {
            if (data.styles.size.match(/^\d+$/))
            {
               fontSize = `${data.styles.size}px`;
            }
            else
            {
               fontSize = "1rem";
            }
         }
      }
   }

   let fontWeight = "400";
   if (data.styles?.weight)
   {
      switch (data.styles.weight.toLowerCase())
      {
         case "thin":
         case "100":
            fontWeight = "100";
            break;
         case "extralight":
         case "200":
            fontWeight = "200";
            break;
         case "light":
         case "300":
            fontWeight = "300";
            break;
         case "normal":
         case "400":
            fontWeight = "400";
            break;
         case "medium":
         case "500":
            fontWeight = "500";
            break;
         case "semibold":
         case "600":
            fontWeight = "600";
            break;
         case "bold":
         case "700":
            fontWeight = "700";
            break;
         case "extrabold":
         case "800":
            fontWeight = "800";
            break;
         case "black":
         case "900":
            fontWeight = "900";
            break;
      }
   }

   const text = data.values.interpolatedText ?? data.values.text;
   const lines = (text ?? "").split("\n");

   const startIcon = data.values.startIcon?.name ? <Icon>{data.values.startIcon.name}</Icon> : null;
   const endIcon = data.values.endIcon?.name ? <Icon>{data.values.endIcon.name}</Icon> : null;

   return (
      <BlockElementWrapper metaData={widgetMetaData} data={data} slot="">
         <Box display="inline-block" lineHeight="1.2" sx={boxStyle}>
            <span style={{fontSize: fontSize, color: color, fontWeight: fontWeight}}>
               {lines.map((line: string, index: number) =>
                  (
                     <div key={index}>
                        <>
                           {index == 0 && startIcon ? {startIcon} : null}
                           {line}
                           {index == lines.length - 1 && endIcon ? {endIcon} : null}
                        </>
                     </div>
                  ))
               }</span>
         </Box>
      </BlockElementWrapper>
   );
}
