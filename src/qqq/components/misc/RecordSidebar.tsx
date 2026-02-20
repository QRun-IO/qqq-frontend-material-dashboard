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

import {QTableMetaData} from "@qrunio/qqq-frontend-core/lib/model/metaData/QTableMetaData";
import {QTableSection} from "@qrunio/qqq-frontend-core/lib/model/metaData/QTableSection";
import {QWidgetMetaData} from "@qrunio/qqq-frontend-core/lib/model/metaData/QWidgetMetaData";
import {Box} from "@mui/material";
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";
import {Theme} from "@mui/material/styles";
import React from "react";
import MDTypography from "qqq/components/legacy/MDTypography";
import {sanitizeId} from "qqq/utils/qqqIdUtils";

interface Props
{
   tableSections: QTableSection[];
   sectionVisibility?: {[key: string]: boolean };
   metaData?: QTableMetaData;
   widgetMetaDataList?: QWidgetMetaData[];
   light?: boolean;
   stickyTop?: string;
}

QRecordSidebar.defaultProps = {
   light: false,
   stickyTop: "1rem",
};

interface SidebarEntry
{
   iconName: string;
   name: string;
   label: string;
}

function QRecordSidebar({tableSections, widgetMetaDataList, sectionVisibility, stickyTop}: Props): JSX.Element
{
   /////////////////////////////////////////////////////////
   // insert widgets after identity (first) table section //
   /////////////////////////////////////////////////////////
   const sidebarEntries = [] as SidebarEntry[];
   if(!sectionVisibility)
   {
      sectionVisibility = {};
   }

   tableSections && tableSections.forEach((section, index) =>
   {
      if(section.isHidden)
      {
         return;
      }

      if (index === 1 && widgetMetaDataList)
      {
         widgetMetaDataList.forEach((widget) =>
         {
            sidebarEntries.push({iconName: widget.icon, name: widget.name, label: widget.label});
         });
      }
      sidebarEntries.push({iconName: section.iconName, name: section.name, label: section.label});
   });


   return (
      <Card sx={{borderRadius: "0.75rem", position: "sticky", top: stickyTop, overflow: "hidden", maxHeight: "calc(100vh - 2rem)"}} data-qqq-id="record-sidebar">
         <Box component="ul" display="flex" flexDirection={{xs: "row", md: "column"}} flexWrap={{xs: "wrap", md: "nowrap"}} p={2} m={0} sx={{listStyle: "none", overflow: "auto", height: "100%"}}>
            {
               /////////////////////////////////////////////////////////////////////////////////////////////////////////
               // note on sectionVisibility below - assume that a missing entry means that it wasn't marked           //
               // for hiding - so only hide sections that are marked as visible == false (assume undef means visible) //
               /////////////////////////////////////////////////////////////////////////////////////////////////////////
               sidebarEntries ? sidebarEntries.map((entry: SidebarEntry, key: number) => (

                  <Box key={`section-link-${entry.name}`} className={`sidebar-section ${sectionVisibility[entry.name] === false ? "is-hidden" : "is-visible"}`} onClick={() => document.getElementById(entry.name)?.scrollIntoView()} sx={{cursor: "pointer"}} width={{xs: "50%", md: "100%"}} data-qqq-id={`sidebar-item-${sanitizeId(entry.name)}`}>
                     <Box key={`section-${entry.name}`} component="li" pt={0.5} pb={0.5}>
                        <MDTypography
                           variant="button"
                           fontWeight="regular"
                           sx={({
                              borders: {borderRadius}, functions: {pxToRem}, palette: {light}, transitions,
                           }: Theme) => ({
                              display: "flex",
                              alignItems: "center",
                              borderRadius: borderRadius.md,
                              padding: `${pxToRem(8)} ${pxToRem(8)}`,
                              transition: transitions.create("background-color", {
                                 easing: transitions.easing.easeInOut,
                                 duration: transitions.duration.shorter,
                              }),

                              "&:hover": {
                                 backgroundColor: light.main,
                              },
                           })}
                        >
                           <Box mr={1.5} lineHeight={1.2} color="black">
                              <Icon fontSize="small">{entry.iconName}</Icon>
                           </Box>
                           <Box lineHeight={1.2} color="black">
                              {entry.label}
                           </Box>

                        </MDTypography>
                     </Box>
                  </Box>
               )) : null
            }
         </Box>
      </Card>
   );
}

export default QRecordSidebar;
