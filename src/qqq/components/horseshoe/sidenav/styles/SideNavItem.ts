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
   const {palette, borders, transitions} = theme;
   const {active, color} = ownerState;

   const {transparent} = palette;
   const {borderRadius} = borders;

   return {
      pl: 3,
      mt: 0.375,
      mb: 0.3,
      width: "100%",
      borderRadius: borderRadius.md,
      cursor: "pointer",
      backgroundColor: () =>
      {
         if (active === "isParent")
         {
            return "var(--qqq-sidebar-selected-background-color, rgba(255, 255, 255, 0.2))";
         }
         else if (active)
         {
            return palette[color].main;
         }

         return transparent.main;
      },
      transition: transitions.create("background-color", {
         easing: transitions.easing.easeInOut,
         duration: transitions.duration.shorter,
      }),

      "&:hover, &:focus": {
         backgroundColor: !active ? "var(--qqq-sidebar-hover-background-color, rgba(255, 255, 255, 0.1))" : undefined,
      },
   };
}

function itemContent(theme: Theme, ownerState: any)
{
   const {typography, transitions, functions} = theme;
   const {miniSidenav, active} = ownerState;

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
         color: active ? "var(--qqq-sidebar-selected-text-color, #ffffff)" : "var(--qqq-sidebar-text-color, #ffffff)",
         fontWeight: active ? fontWeightRegular : fontWeightLight,
         fontSize: size.sm,
         opacity: miniSidenav ? 0 : 1,
         transition: transitions.create(["opacity", "color"], {
            easing: transitions.easing.easeInOut,
            duration: transitions.duration.standard,
         }),
      },

      "&::before": {
         color: active ? "var(--qqq-sidebar-selected-text-color, #ffffff)" : "var(--qqq-sidebar-text-color, #ffffff)",
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
   const {typography, transitions, breakpoints, functions} = theme;
   const {noCollapse, transparentSidenav, miniSidenav, open, active} = ownerState;

   const {size} = typography;
   const {pxToRem} = functions;

   return {
      fontSize: `${size.lg} !important`,
      fontWeight: 700,
      marginBottom: pxToRem(-1),
      transform: open ? "rotate(0)" : "rotate(-180deg)",
      color: open || active ? "var(--qqq-sidebar-selected-text-color, #ffffff)" : "var(--qqq-sidebar-icon-color, #ffffff)",
      opacity: open || active ? 1 : 0.6,
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
