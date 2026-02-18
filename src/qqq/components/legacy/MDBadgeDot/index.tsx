/* QQQ - Low-code Application Framework for Engineers.
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

import Box from "@mui/material/Box";
import {FC, forwardRef, useContext} from "react";
import QContext from "QContext";
import MDTypography from "qqq/components/legacy/MDTypography";


// declaring props types for MDBadgeDot
interface Props
{
   variant?: "gradient" | "contained";
   color?: string;
   size?: "xs" | "sm" | "md" | "lg";
   badgeContent: string;
   font?:
      | {
      color: string;
      weight: string;
   }
      | any;

   [key: string]: any;
}

const MDBadgeDot: FC<Props> = forwardRef(
   ({variant, color, size, badgeContent, font = {}, ...rest}, ref) =>
   {
      const {accentColor} = useContext(QContext);
      let finalSize;
      let fontSize: any;
      let padding;

      if (size === "sm")
      {
         finalSize = "0.5rem";
         fontSize = "caption";
         padding = "0.45em 0.775em";
      }
      else if (size === "lg")
      {
         finalSize = "0.625rem";
         fontSize = "body2";
         padding = "0.85em 1.375em";
      }
      else if (size === "md")
      {
         finalSize = "0.5rem";
         fontSize = "button";
         padding = "0.65em 1em";
      }
      else
      {
         finalSize = "0.375rem";
         fontSize = "caption";
         padding = "0.45em 0.775em";
      }

      const validColors = [
         "primary",
         "secondary",
         "info",
         "success",
         "warning",
         "error",
         "light",
         "dark",
         "custom1",
         "custom2",
         "custom3",
         "custom4",
         "custom5"
      ];

      const colorValues = {
         "primary": "#e91e63",
         "secondary": "#7b809a",
         "info": accentColor,
         "success": "#4CAF50",
         "warning": "#fb8c00",
         "error": "#F44335",
         "light": "#f0f2f5",
         "dark": "#344767",
         "custom1": "#8c28c2",
         "custom2": "#ffe120",
         "custom3": "#000000",
         "custom4": "#747474",
         "custom5": "#ffcefa"
      } as any;

      return (
         <Box ref={ref} display="flex" alignItems="center" p={padding} {...rest}>
            <Box
               component="i"
               display="inline-block"
               width={finalSize}
               height={finalSize}
               borderRadius="50%"
               mr={1}
               sx={{backgroundColor: colorValues[color]}}
            />
            <MDTypography
               variant={fontSize}
               fontWeight={font.weight ? font.weight : "regular"}
               color={font.color ? font.color : "dark"}
               sx={{lineHeight: 0}}
            >
               {badgeContent}
            </MDTypography>
         </Box>
      );
   }
);

// Declaring default props for MDBadgeDot
MDBadgeDot.defaultProps = {
   variant: "contained",
   color: "info",
   size: "xs",
   font: {},
};

export default MDBadgeDot;
