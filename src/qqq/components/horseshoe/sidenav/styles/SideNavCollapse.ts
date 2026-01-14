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

   const {white, transparent, grey} = palette;
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
      color: "var(--qqq-sidebar-text-color, #ffffff)",
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
         backgroundColor: "var(--qqq-sidebar-hover-background-color, rgba(255, 255, 255, 0.1))",
      },
   };
}

function collapseIconBox(theme: Theme, ownerState: any)
{
   const {transitions, borders, functions} = theme;

   const {borderRadius} = borders;
   const {pxToRem} = functions;

   return {
      minWidth: pxToRem(32),
      minHeight: pxToRem(32),
      color: "var(--qqq-sidebar-icon-color, #ffffff)",
      borderRadius: borderRadius.md,
      display: "grid",
      placeItems: "center",
      transition: transitions.create("margin", {
         easing: transitions.easing.easeInOut,
         duration: transitions.duration.standard,
      }),

      "& svg, svg g": {
         color: "var(--qqq-sidebar-icon-color, #ffffff)",
      },
   };
}

const collapseIcon = (_theme: Theme, {active}: any) => ({
   color: active ? "var(--qqq-sidebar-selected-text-color, #ffffff)" : "var(--qqq-sidebar-icon-color, #ffffff)",
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
   const {typography, transitions, breakpoints, functions} = theme;
   const {noCollapse, miniSidenav, transparentSidenav, open, active} = ownerState;

   const {size} = typography;
   const {pxToRem} = functions;

   return {
      fontSize: `${size.lg} !important`,
      fontWeight: 700,
      marginBottom: pxToRem(-1),
      transform: open ? "rotate(0)" : "rotate(-180deg)",
      color: open || active ? "var(--qqq-sidebar-selected-text-color, #ffffff)" : "var(--qqq-sidebar-icon-color, #ffffff)",
      opacity: open || active ? 1 : 0.5,
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
