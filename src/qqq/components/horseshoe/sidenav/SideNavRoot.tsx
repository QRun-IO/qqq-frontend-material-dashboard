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
         height: "100%",
         top: "unset",

         ...(miniSidenav ? drawerCloseStyles() : drawerOpenStyles()),
      },
   };
});
