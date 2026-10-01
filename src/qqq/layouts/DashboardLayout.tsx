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
import {ReactNode, useEffect} from "react";
import {useLocation} from "react-router-dom";
import {setLayout, useMaterialUIController} from "qqq/context";

function DashboardLayout({children}: { children: ReactNode }): JSX.Element
{
   const [controller, dispatch] = useMaterialUIController();
   const {miniSidenav} = controller;
   const {pathname} = useLocation();

   useEffect(() =>
   {
      setLayout(dispatch, "dashboard");
   }, [pathname]);

   return (
      <Box
         sx={({breakpoints, transitions, functions: {pxToRem}}) => ({
            p: "20px",
            position: "relative",

            [breakpoints.up("xl")]: {
               marginLeft: miniSidenav ? pxToRem(120) : pxToRem(245),
               transition: transitions.create(["margin-left", "margin-right"], {
                  easing: transitions.easing.easeInOut,
                  duration: transitions.duration.standard,
               }),
            },
         })}
      >
         {children}
      </Box>
   );
}

export default DashboardLayout;
