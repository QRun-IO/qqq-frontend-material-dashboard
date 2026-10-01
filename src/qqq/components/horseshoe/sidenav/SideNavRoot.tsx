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

import Drawer from "@mui/material/Drawer";
import {styled, Theme} from "@mui/material/styles";

export default styled(Drawer)(({theme, ownerState}: { theme?: Theme | any; ownerState: any }) =>
{
   const {palette, boxShadows, transitions, breakpoints, functions} = theme;
   const {transparentSidenav, whiteSidenav, miniSidenav, darkMode} = ownerState;

   const sidebarWidth = 245;
   const {transparent, gradients, white, background} = palette;
   const {xxl} = boxShadows;
   const {pxToRem, linearGradient} = functions;

   let backgroundValue = darkMode
      ? background.sidenav
      : linearGradient(gradients.dark.main, gradients.dark.state);

   if (transparentSidenav)
   {
      backgroundValue = transparent.main;
   }
   else if (whiteSidenav)
   {
      backgroundValue = white.main;
   }

   // styles for the sidenav when miniSidenav={false}
   const drawerOpenStyles = () => ({
      background: backgroundValue,
      transform: "translateX(0)",
      transition: transitions.create("transform", {
         easing: transitions.easing.sharp,
         duration: transitions.duration.shorter,
      }),

      [breakpoints.up("xl")]: {
         boxShadow: transparentSidenav ? "none" : xxl,
         marginBottom: transparentSidenav ? 0 : "inherit",
         left: "0",
         width: sidebarWidth,
         transform: "translateX(0)",
         transition: transitions.create(["width", "background-color"], {
            easing: transitions.easing.sharp,
            duration: transitions.duration.enteringScreen,
         }),
      },
   });

   // styles for the sidenav when miniSidenav={true}
   const drawerCloseStyles = () => ({
      background: backgroundValue,
      transform: `translateX(${pxToRem(-320)})`,
      transition: transitions.create("transform", {
         easing: transitions.easing.sharp,
         duration: transitions.duration.shorter,
      }),

      [breakpoints.up("xl")]: {
         boxShadow: transparentSidenav ? "none" : xxl,
         marginBottom: transparentSidenav ? 0 : "inherit",
         left: "0",
         width: pxToRem(96),
         overflowX: "hidden",
         transform: "translateX(0)",
         transition: transitions.create(["width", "background-color"], {
            easing: transitions.easing.sharp,
            duration: transitions.duration.shorter,
         }),
      },
   });

   return {
      "& .MuiDrawer-paper": {
         boxShadow: xxl,
         border: "none",
         margin: "0",
         borderRadius: "0",
         // Account for branded header height when present
         top: "var(--qqq-branded-header-height, 0px)",
         height: "calc(100vh - var(--qqq-branded-header-height, 0px))",

         ...(miniSidenav ? drawerCloseStyles() : drawerOpenStyles()),
      },
   };
});
