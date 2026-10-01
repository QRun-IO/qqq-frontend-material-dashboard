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

import {TypographyProps} from "@mui/material";
import {FC, forwardRef, ReactNode} from "react";
import MDTypographyRoot from "qqq/components/legacy/MDTypography/MDTypographyRoot";
import {useMaterialUIController} from "qqq/context";

// Declaring props types for MDTypography
interface Props extends TypographyProps
{
   color?:
      | "inherit"
      | "primary"
      | "secondary"
      | "info"
      | "success"
      | "warning"
      | "error"
      | "light"
      | "dark"
      | "text"
      | "white";
   fontWeight?: "light" | "regular" | "medium" | "bold" | undefined;
   textTransform?: "none" | "capitalize" | "uppercase" | "lowercase";
   verticalAlign?:
      | "unset"
      | "baseline"
      | "sub"
      | "super"
      | "text-top"
      | "text-bottom"
      | "middle"
      | "top"
      | "bottom";
   textGradient?: boolean;
   children: ReactNode;
   opacity?: number;

   [key: string]: any;
}

const MDTypography: FC<Props | any> = forwardRef(
   (
      {color, fontWeight, textTransform, verticalAlign, textGradient, opacity, children, ...rest},
      ref
   ) =>
   {
      const [controller] = useMaterialUIController();
      const {darkMode} = controller;

      return (
         <MDTypographyRoot
            {...rest}
            ref={ref}
            ownerState={{
               color,
               textTransform,
               verticalAlign,
               fontWeight,
               opacity,
               textGradient,
               darkMode,
            }}
         >
            {children}
         </MDTypographyRoot>
      );
   }
);

// Declaring default props for MDTypography
MDTypography.defaultProps = {
   color: "dark",
   fontWeight: undefined,
   textTransform: "none",
   verticalAlign: "unset",
   textGradient: false,
   opacity: 1,
};

export default MDTypography;
