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

import {Theme} from "@mui/material/styles";

function item(theme: Theme | any, ownerState: any)
{
   const {palette, borders, functions, transitions} = theme;
   const {active, color, transparentSidenav, whiteSidenav, darkMode} = ownerState;

   const {transparent, white, grey} = palette;
   const {borderRadius} = borders;
   const {rgba} = functions;

   return {
      pl: 3,
      mt: 0.375,
      mb: 0.3,
      width: "100%",
      borderRadius: borderRadius.md,
      cursor: "pointer",
      backgroundColor: () =>
      {
         let backgroundValue = transparent.main;

         if (
            (active === "isParent" && !transparentSidenav && !whiteSidenav) ||
            (active === "isParent" && transparentSidenav && darkMode)
         )
         {
            backgroundValue = rgba(white.main, 0.2);
         }
         else if (active === "isParent" && transparentSidenav)
         {
            backgroundValue = grey[300];
         }
         else if (active === "isParent" && whiteSidenav)
         {
            backgroundValue = grey[200];
         }
         else if (active)
         {
            backgroundValue = palette[color].main;
         }

         return backgroundValue;
      },
      transition: transitions.create("background-color", {
         easing: transitions.easing.easeInOut,
         duration: transitions.duration.shorter,
      }),

      "&:hover, &:focus": {
         backgroundColor:
            !active &&
            rgba((transparentSidenav && !darkMode) || whiteSidenav ? grey[400] : white.main, 0.2),
      },
   };
}

function itemContent(theme: Theme, ownerState: any)
{
   const {palette, typography, transitions, functions} = theme;
   const {miniSidenav, name, active, transparentSidenav, whiteSidenav, darkMode} = ownerState;

   const {white, dark} = palette;
   const {size, fontWeightRegular, fontWeightLight} = typography;
   const {pxToRem} = functions;

   return {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      width: "100%",
      padding: `${pxToRem(12)} ${pxToRem(16)}`,
      marginLeft: pxToRem(18),
      userSelect: "none",
      position: "relative",

      "& span": {
         color:
            ((transparentSidenav && !darkMode) || whiteSidenav) && (active === "isParent" || !active)
               ? dark.main
               : white.main,
         fontWeight: active ? fontWeightRegular : fontWeightLight,
         fontSize: size.sm,
         opacity: miniSidenav ? 0 : 1,
         transition: transitions.create(["opacity", "color"], {
            easing: transitions.easing.easeInOut,
            duration: transitions.duration.standard,
         }),
      },

      "&::before": {
         color:
            ((transparentSidenav && !darkMode) || whiteSidenav) && (active === "isParent" || !active)
               ? dark.main
               : white.main,
         fontWeight: fontWeightRegular,
         display: "flex",
         alignItems: "center",
         position: "absolute",
         top: "50%",
         transform: "translateY(-50%)",
         left: pxToRem(-15),
         opacity: 1,
         borderRadius: "50%",
         fontSize: size.sm,
      },
   };
}

function itemArrow(theme: Theme, ownerState: any)
{
   const {palette, typography, transitions, breakpoints, functions} = theme;
   const {noCollapse, transparentSidenav, whiteSidenav, miniSidenav, open, active, darkMode} =
      ownerState;

   const {white, dark} = palette;
   const {size} = typography;
   const {pxToRem, rgba} = functions;

   return {
      fontSize: `${size.lg} !important`,
      fontWeight: 700,
      marginBottom: pxToRem(-1),
      transform: open ? "rotate(0)" : "rotate(-180deg)",
      color: () =>
      {
         let colorValue;

         if (transparentSidenav && darkMode)
         {
            colorValue = open || active ? white.main : rgba(white.main, 0.25);
         }
         else if (transparentSidenav || whiteSidenav)
         {
            colorValue = open || active ? dark.main : rgba(dark.main, 0.25);
         }
         else
         {
            colorValue = open || active ? white.main : rgba(white.main, 0.5);
         }

         return colorValue;
      },
      transition: transitions.create(["color", "transform", "opacity"], {
         easing: transitions.easing.easeInOut,
         duration: transitions.duration.shorter,
      }),

      [breakpoints.up("xl")]: {
         display:
            noCollapse || (transparentSidenav && miniSidenav) || miniSidenav
               ? "none !important"
               : "block !important",
      },
   };
}

export {item, itemContent, itemArrow};
