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

import {Theme} from "@mui/material/styles";
import colors from "qqq/assets/theme/base/colors";

function navbar(theme: Theme | any, ownerState: any)
{
   const {
      palette, boxShadows, functions, transitions, breakpoints, borders,
   } = theme;
   const {
      transparentNavbar, absolute, light, darkMode,
   } = ownerState;

   const {
      dark, white, text, transparent, background,
   } = palette;
   const {navbarBoxShadow} = boxShadows;
   const {rgba, pxToRem} = functions;
   const {borderRadius} = borders;

   return {
      boxShadow: transparentNavbar || absolute ? "none" : navbarBoxShadow,
      backdropFilter: transparentNavbar || absolute ? "none" : `saturate(200%) blur(${pxToRem(30)})`,
      backgroundColor:
         transparentNavbar || absolute
            ? `${transparent.main} !important`
            : rgba(darkMode ? background.default : white.main, 0.8),

      color: () =>
      {
         let color;

         if (light)
         {
            color = white.main;
         }
         else if (transparentNavbar)
         {
            color = text.main;
         }
         else
         {
            color = dark.main;
         }

         return color;
      },
      top: absolute ? 0 : pxToRem(12),
      minHeight: "auto",
      display: "grid",
      alignItems: "center",
      borderRadius: borderRadius.xl,
      paddingTop: pxToRem(0),
      paddingBottom: pxToRem(0),
      paddingRight: absolute ? pxToRem(8) : 0,
      paddingLeft: absolute ? pxToRem(16) : 0,

      "& > *": {
         transition: transitions.create("all", {
            easing: transitions.easing.easeInOut,
            duration: transitions.duration.standard,
         }),
      },

      "& .MuiToolbar-root": {
         display: "flex",
         justifyContent: "space-between",
         alignItems: "flex-start",

         [breakpoints.up("sm")]: {
            minHeight: "auto",
            padding: `${pxToRem(4)} ${pxToRem(16)}`,
         },
      },
   };
}

const navbarContainer = ({breakpoints}: Theme): any => ({
   flexDirection: "column",
   alignItems: "flex-start",
   justifyContent: "space-between",
   padding: "0 !important",

   [breakpoints.up("md")]: {
      flexDirection: "row",
      paddingTop: "0",
      paddingBottom: "0",
   },
});

const navbarRow = ({breakpoints}: Theme, {isMini}: any) => ({
   display: "flex",
   alignItems: "center",
   width: "100%",

   [breakpoints.up("md")]: {
      justifyContent: "stretch",
      width: isMini ? "100%" : "max-content",
   },

   [breakpoints.up("xl")]: {
      justifyContent: "stretch !important",
      width: "max-content !important",
   },
});

const navbarIconButton = ({typography: {size}, breakpoints}: Theme) => ({
   px: 1,

   "& .material-icons, .material-icons-round": {
      fontSize: `${size.xl} !important`,
   },

   "& .MuiTypography-root": {
      display: "none",

      [breakpoints.up("sm")]: {
         display: "inline-block",
         lineHeight: 1.2,
         ml: 0.5,
      },
   },
});

const navbarDesktopMenu = ({breakpoints}: Theme) => ({
   display: "none !important",
   cursor: "pointer",

   [breakpoints.down("sm")]: {
      display: "inline-block !important",
   },
});

const recentlyViewedMenu = ({breakpoints}: Theme) => ({
   marginTop: "-0.5rem",
   "& .MuiInputLabel-root": {
      color: colors.gray.main,
      fontWeight: "500",
      fontSize: "1rem"
   },
   "& .MuiInputAdornment-root": {
      marginTop: "0.5rem",
      color: colors.gray.main,
      fontSize: "1rem"
   },
   "& .MuiOutlinedInput-root": {
      borderRadius: "0",
      padding: "0"
   },
   "& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline": {
      border: "0"
   },
   display: "block",
   [breakpoints.down("md")]: {
      display: "none !important",
   },
});

const navbarMobileMenu = ({breakpoints}: Theme) => ({
   left: "-0.75rem",
   display: "inline-block",
   lineHeight: 0,

   [breakpoints.up("xl")]: {
      display: "none",
   },
});

export {
   navbar,
   navbarContainer,
   navbarRow,
   navbarIconButton,
   navbarDesktopMenu,
   navbarMobileMenu,
   recentlyViewedMenu
};
