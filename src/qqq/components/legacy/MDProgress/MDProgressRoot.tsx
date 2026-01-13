/*
 * QQQ - Low-code Application Framework for Engineers.
 * Copyright (C) 2021-2022.  Kingsrook, LLC
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
