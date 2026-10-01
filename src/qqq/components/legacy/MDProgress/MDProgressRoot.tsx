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

import LinearProgress from "@mui/material/LinearProgress";
import {styled, Theme} from "@mui/material/styles";

// @ts-ignore
export default styled(LinearProgress)(
   ({theme, ownerState}: { theme?: Theme | any; ownerState: any }) =>
   {
      const {palette, functions} = theme;
      const {color, value, variant} = ownerState;

      const {text, gradients} = palette;
      const {linearGradient} = functions;

      // background value
      let backgroundValue;

      if (variant === "gradient")
      {
         backgroundValue = gradients[color]
            ? linearGradient(gradients[color].main, gradients[color].state)
            : linearGradient(gradients.info.main, gradients.info.state);
      }
      else
      {
         backgroundValue = palette[color] ? palette[color].main : palette.info.main;
      }

      return {
         "& .MuiLinearProgress-bar": {
            background: backgroundValue,
            width: `${value}%`,
            color: text.main,
         },
      };
   }
);
