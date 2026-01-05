/*
 * QQQ - Low-code Application Framework for Engineers.
 * Copyright (C) 2021-2025.  Kingsrook, LLC
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

import {QThemeMetaData} from "@qrunio/qqq-frontend-core/lib/model/metaData/QThemeMetaData";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import React from "react";

interface Props
{
   theme?: QThemeMetaData | null;
}

/*******************************************************************************
 ** BrandedHeaderBar - renders a branded header bar when enabled via theme.
 ** Uses CSS variables injected from QThemeMetaData for styling.
 *******************************************************************************/
export default function BrandedHeaderBar({theme}: Props): JSX.Element | null
{
   /////////////////////////////////////////////////////////////////////////////
   // Check if branded header is enabled via theme prop                       //
   /////////////////////////////////////////////////////////////////////////////
   if (!theme?.brandedHeaderEnabled)
   {
      return null;
   }

   return (
      <Box
         component="header"
         data-branded-header="true"
         className="qqq-branded-header-bar"
         sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 1rem",
            backgroundColor: "var(--qqq-branded-header-background-color)",
            color: "var(--qqq-branded-header-text-color)",
            height: "var(--qqq-branded-header-height, 48px)",
            position: "sticky",
            top: 0,
            zIndex: 1200,
         }}
      >
         <Box sx={{display: "flex", alignItems: "center", gap: 2}}>
            {theme.brandedHeaderLogoPath && (
               <Box
                  component="img"
                  src={theme.brandedHeaderLogoPath}
                  alt={theme.brandedHeaderLogoAltText || "Logo"}
                  sx={{
                     height: "calc(var(--qqq-branded-header-height, 48px) - 8px)",
                     maxWidth: "200px",
                     objectFit: "contain",
                  }}
                  onError={(e: React.SyntheticEvent<HTMLImageElement>) =>
                  {
                     e.currentTarget.style.display = "none";
                  }}
               />
            )}
            {theme.brandedHeaderTagline && (
               <Typography
                  variant="body1"
                  sx={{
                     color: "var(--qqq-branded-header-text-color)",
                     fontWeight: 500,
                  }}
               >
                  {theme.brandedHeaderTagline}
               </Typography>
            )}
         </Box>
      </Box>
   );
}
