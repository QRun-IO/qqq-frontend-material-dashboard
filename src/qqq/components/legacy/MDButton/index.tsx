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

import {ButtonProps} from "@mui/material";
import {FC, forwardRef, ReactNode} from "react";
import MDButtonRoot from "qqq/components/legacy/MDButton/MDButtonRoot";
import {useMaterialUIController} from "qqq/context";
import {generateButtonId} from "qqq/utils/qqqIdUtils";

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
  qqqId?: string;
  [key: string]: any;
}

const MDButton: FC<Props> = forwardRef(
   ({color, variant, size, circular, iconOnly, children, qqqId, ...rest}, ref) =>
   {
      const [controller] = useMaterialUIController();
      const {darkMode} = controller;

      // Extract icon name from startIcon if present (for icon-only buttons)
      let iconName: string | undefined;
      if (rest.startIcon && typeof rest.startIcon === "object")
      {
         const iconProps = (rest.startIcon as any).props;
         if (iconProps?.children)
         {
            iconName = String(iconProps.children);
         }
      }

      // Generate data-qqq-id for CSS targeting
      const dataQqqId = generateButtonId(qqqId, children, iconName);

      return (
         <MDButtonRoot
            {...rest}
            ref={ref}
            data-qqq-id={dataQqqId}
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
