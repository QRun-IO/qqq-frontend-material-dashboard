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

      if(!color)
      {
         color = preferredColorNameInfoOrPrimary();
      }

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
   size: "medium",
   active: false,
};

export default MDPagination;
