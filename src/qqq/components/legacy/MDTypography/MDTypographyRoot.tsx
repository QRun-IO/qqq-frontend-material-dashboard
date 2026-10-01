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

import {styled} from "@mui/material/styles";
import Typography from "@mui/material/Typography";

export default styled(Typography)(({theme, ownerState}: any): any => 
{
   const {palette, typography, functions}: any = theme;
   const {color, textTransform, verticalAlign, fontWeight, opacity, textGradient, darkMode} =
    ownerState;

   const {gradients, transparent, white} = palette;
   const {fontWeightLight, fontWeightRegular, fontWeightMedium, fontWeightBold} = typography;
   const {linearGradient} = functions;

   // fontWeight styles
   const fontWeights: { [key: string]: number } = {
      light: fontWeightLight,
      regular: fontWeightRegular,
      medium: fontWeightMedium,
      bold: fontWeightBold,
   };

   // styles for the typography with textGradient={true}
   const gradientStyles = () => ({
      backgroundImage:
      color !== "inherit" && color !== "text" && color !== "white" && gradients[color]
         ? linearGradient(gradients[color].main, gradients[color].state)
         : linearGradient(gradients.dark.main, gradients.dark.state),
      display: "inline-block",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: transparent.main,
      position: "relative",
      zIndex: 1,
   });

   // color value
   let colorValue = color === "inherit" || !palette[color] ? "inherit" : palette[color].main;

   if (darkMode && (color === "inherit" || !palette[color])) 
   {
      colorValue = "inherit";
   }
   else if (darkMode && color === "dark") colorValue = white.main;

   return {
      opacity,
      textTransform,
      verticalAlign,
      textDecoration: "none",
      color: colorValue,
      fontWeight: fontWeights[fontWeight] && fontWeights[fontWeight],
      ...(textGradient && gradientStyles()),
   };
});
