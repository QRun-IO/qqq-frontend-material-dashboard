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

function collapseItem(theme: Theme, ownerState: any) 
{
   const {palette, transitions, breakpoints, boxShadows, borders, functions} = theme;
   const {active, transparentSidenav, whiteSidenav, darkMode} = ownerState;

   const {white, transparent, dark, grey} = palette;
   const {md} = boxShadows;
   const {borderRadius} = borders;
   const {pxToRem, rgba} = functions;

   return {
      background: () => 
      {
         let backgroundValue;

         if (transparentSidenav && darkMode) 
         {
            backgroundValue = active ? rgba(white.main, 0.2) : transparent.main;
         }
         else if (transparentSidenav && !darkMode) 
         {
            backgroundValue = active ? grey[300] : transparent.main;
         }
         else if (whiteSidenav) 
         {
            backgroundValue = active ? grey[200] : transparent.main;
         }
         else 
         {
            backgroundValue = active ? rgba(white.main, 0.2) : transparent.main;
         }

         return backgroundValue;
      },
      color: (transparentSidenav && !darkMode) || whiteSidenav ? dark.main : white.main,
      display: "flex",
      alignItems: "center",
      width: "100%",
      padding: `${pxToRem(8)} ${pxToRem(16)}`,
      margin: `${pxToRem(1.5)} ${pxToRem(16)}`,
      borderRadius: borderRadius.md,
      cursor: "pointer",
      userSelect: "none",
      whiteSpace: "wrap",
      overflow: "hidden",
      boxShadow: active && !whiteSidenav && !darkMode && !transparentSidenav ? md : "none",
      [breakpoints.up("xl")]: {
         transition: transitions.create(["box-shadow", "background-color"], {
            easing: transitions.easing.easeInOut,
            duration: transitions.duration.shorter,
         }),
      },

      "& .MuiListItemText-primary": {
         lineHeight: "revert"
      },

      "&:hover, &:focus": {
         backgroundColor:
        transparentSidenav && !darkMode
           ? grey[300]
           : rgba(whiteSidenav ? grey[400] : white.main, 0.2),
      },
   };
}

function collapseIconBox(theme: Theme, ownerState: any) 
{
   const {palette, transitions, borders, functions} = theme;
   const {transparentSidenav, whiteSidenav, darkMode} = ownerState;

   const {white, dark} = palette;
   const {borderRadius} = borders;
   const {pxToRem} = functions;

   return {
      minWidth: pxToRem(32),
      minHeight: pxToRem(32),
      color: (transparentSidenav && !darkMode) || whiteSidenav ? dark.main : white.main,
      borderRadius: borderRadius.md,
      display: "grid",
      placeItems: "center",
      transition: transitions.create("margin", {
         easing: transitions.easing.easeInOut,
         duration: transitions.duration.standard,
      }),

      "& svg, svg g": {
         color: transparentSidenav || whiteSidenav ? dark.main : white.main,
      },
   };
}

const collapseIcon = ({palette: {white, gradients}}: Theme, {active}: any) => ({
   color: active ? white.main : gradients.dark.state,
});

function collapseText(theme: any, ownerState: any) 
{
   const {typography, transitions, breakpoints, functions} = theme;
   const {miniSidenav, transparentSidenav, active} = ownerState;

   const {size, fontWeightRegular, fontWeightLight} = typography;
   const {pxToRem} = functions;

   return {
      marginLeft: pxToRem(10),

      [breakpoints.up("xl")]: {
         opacity: miniSidenav || (miniSidenav && transparentSidenav) ? 0 : 1,
         maxWidth: miniSidenav || (miniSidenav && transparentSidenav) ? 0 : "100%",
         marginLeft: miniSidenav || (miniSidenav && transparentSidenav) ? 0 : pxToRem(10),
         transition: transitions.create(["opacity", "margin"], {
            easing: transitions.easing.easeInOut,
            duration: transitions.duration.standard,
         }),
      },

      "& span": {
         fontWeight: active ? fontWeightRegular : fontWeightLight,
         fontSize: size.sm,
         lineHeight: 0,
      },
   };
}

function collapseArrow(theme: Theme, ownerState: any) 
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

export {collapseItem, collapseIconBox, collapseIcon, collapseText, collapseArrow};
