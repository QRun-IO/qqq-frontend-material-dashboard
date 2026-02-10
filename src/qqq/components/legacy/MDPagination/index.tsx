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

import Box from "@mui/material/Box";
import {preferredColorNameInfoOrPrimary} from "qqq/assets/theme/functions/preferInfoColorToPrimaryColor";
import {createContext, FC, forwardRef, ReactNode, useContext, useMemo} from "react";
import MDPaginationItemRoot from "qqq/components/legacy/MDPagination/MDPaginationItemRoot";

// The Pagination main context
const Context = createContext<any>(null);

// Declare props types for MDPagination
interface Props
{
   item?: boolean;
   variant?: "gradient" | "contained";
   color?:
      | "white"
      | "primary"
      | "secondary"
      | "info"
      | "success"
      | "warning"
      | "error"
      | "light"
      | "dark";
   size?: "small" | "medium" | "large";
   active?: boolean;
   children: ReactNode;

   [key: string]: any;
}

const MDPagination: FC<Props | any> = forwardRef(
   ({item, variant, color, size, active, children, ...rest}, ref) =>
   {
      const context: any = useContext(Context);
      const paginationSize = context ? context.size : undefined;

      const providerValue = useMemo(
         () => ({
            variant,
            color,
            size,
         }),
         [variant, color, size]
      );

      return (
         <Context.Provider value={providerValue}>
            {item ? (
               <MDPaginationItemRoot
                  {...rest}
                  ref={ref}
                  variant={active ? context.variant : "outlined"}
                  color={active ? context.color : "secondary"}
                  iconOnly
                  circular
                  ownerState={{variant, active, paginationSize}}
               >
                  {children}
               </MDPaginationItemRoot>
            ) : (
               <Box
                  display="flex"
                  justifyContent="flex-end"
                  alignItems="center"
                  sx={{listStyle: "none"}}
               >
                  {children}
               </Box>
            )}
         </Context.Provider>
      );
   }
);

// Declaring default props for MDPagination
MDPagination.defaultProps = {
   item: false,
   variant: "gradient",
   color: preferredColorNameInfoOrPrimary(),
   size: "medium",
   active: false,
};

export default MDPagination;
