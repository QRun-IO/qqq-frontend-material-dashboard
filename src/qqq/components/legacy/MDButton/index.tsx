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

import {ButtonProps} from "@mui/material";
import {FC, forwardRef, ReactNode} from "react";
import MDButtonRoot from "qqq/components/legacy/MDButton/MDButtonRoot";
import {useMaterialUIController} from "qqq/context";

// Declaring props types for MDButton
export interface Props extends Omit<ButtonProps, "color" | "variant"> {
  color?:
    | "white"
    | "primary"
    | "secondary"
    | "info"
    | "success"
    | "warning"
    | "error"
    | "light"
    | "dark"
    | "default";
  variant?: "text" | "contained" | "outlined" | "gradient";
  size?: "small" | "medium" | "large";
  circular?: boolean;
  iconOnly?: boolean;
  children?: ReactNode;
  [key: string]: any;
}

const MDButton: FC<Props> = forwardRef(
   ({color, variant, size, circular, iconOnly, children, qqqId, ...rest}, ref) =>
   {
      const [controller] = useMaterialUIController();
      const {darkMode} = controller;

      return (
         <MDButtonRoot
            {...rest}
            ref={ref}
            data-qqq-id={qqqId}
            data-button-variant={variant}
            ownerState={{color, variant, size, circular, iconOnly, darkMode}}
         >
            {children}
         </MDButtonRoot>
      );
   }
);

// Declaring default props for MDButton
MDButton.defaultProps = {
   color: "white",
   variant: "contained",
   size: "medium",
   circular: false,
   iconOnly: false,
};

export default MDButton;
