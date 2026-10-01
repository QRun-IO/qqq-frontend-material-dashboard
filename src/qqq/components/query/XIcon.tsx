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
import IconButton from "@mui/material/IconButton";
import React, {useContext} from "react";
import QContext from "QContext";
import colors from "qqq/assets/theme/base/colors";

interface XIconProps
{
   onClick: (e: React.MouseEvent<HTMLSpanElement>) => void;
   position: "forQuickFilter" | "forAdvancedQueryPreview" | "default";
   shade: "default" | "accent" | "accentLight"
}

XIcon.defaultProps = {
   position: "default",
   shade: "default"
};

export default function XIcon({onClick, position, shade}: XIconProps): JSX.Element
{
   const {accentColor, accentColorLight} = useContext(QContext)

   //////////////////////////
   // for default position //
   //////////////////////////
   let rest: any = {
      top: "-0.75rem",
      left: "-0.5rem",
   }

   if(position == "forQuickFilter")
   {
      rest = {
         left: "-1.125rem",
      }
   }
   else if(position == "forAdvancedQueryPreview")
   {
      rest = {
         top: "-0.5rem",
         left: "-0.75rem",
      }
   }

   let color;
   switch (shade)
   {
      case "default":
         color = colors.gray.main;
         break;
      case "accent":
         color = accentColor;
         break;
      case "accentLight":
         color = accentColorLight;
         break;
   }

   return (
      <span style={{position: "relative"}}><IconButton sx={{
         fontSize: "0.75rem",
         border: `1px solid ${color}`,
         color: color,
         padding: "0",
         background: "#FFFFFF !important",
         position: "absolute",
         ... rest
      }} onClick={onClick}><Icon>close</Icon></IconButton></span>
   )
}
