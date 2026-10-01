/*
 * QQQ - Low-code Application Framework for Engineers.
 * Copyright (C) 2021-2022.  Kingsrook, LLC
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

import {styled, Theme} from "@mui/material/styles";
import MDButton from "qqq/components/legacy/MDButton";


// @ts-ignore
export default styled(MDButton)(({theme, ownerState}: { theme?: Theme; ownerState: any }) =>
{
   const {borders, functions, typography, palette} = theme;
   const {variant, paginationSize, active} = ownerState;

   const {borderColor} = borders;
   const {pxToRem} = functions;
   const {fontWeightRegular, size: fontSize} = typography;
   const {light} = palette;

   // width, height, minWidth and minHeight values
   let sizeValue = pxToRem(36);

   if (paginationSize === "small")
   {
      sizeValue = pxToRem(30);
   }
   else if (paginationSize === "large")
   {
      sizeValue = pxToRem(46);
   }

   return {
      borderColor,
      margin: `0 ${pxToRem(2)}`,
      pointerEvents: active ? "none" : "auto",
      fontWeight: fontWeightRegular,
      fontSize: fontSize.sm,
      width: sizeValue,
      minWidth: sizeValue,
      height: sizeValue,
      minHeight: sizeValue,

      "&:hover, &:focus, &:active": {
         transform: "none",
         boxShadow: (variant !== "gradient" || variant !== "contained") && "none !important",
         opacity: "1 !important",
      },

      "&:hover": {
         backgroundColor: light.main,
         borderColor,
      },
   };
});
