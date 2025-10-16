/*
 * QQQ - Low-code Application Framework for Engineers.
 * Copyright (C) 2021-2024.  Kingsrook, LLC
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


import {QWidgetMetaData} from "@qrunio/qqq-frontend-core/lib/model/metaData/QWidgetMetaData";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Icon from "@mui/material/Icon";
import Tooltip from "@mui/material/Tooltip/Tooltip";
import Typography from "@mui/material/Typography";
import colors from "qqq/assets/theme/base/colors";
import HelpContent, {hasHelpContent} from "qqq/components/misc/HelpContent";
import {WidgetData} from "qqq/components/widgets/Widget";
import ValueUtils from "qqq/utils/qqq/ValueUtils";
import React from "react";
import {Link} from "react-router-dom";

/*******************************************************************************
 ** Utility class used by Widgets
 **
 *******************************************************************************/
export class WidgetUtils
{

   /*******************************************************************************
    **
    *******************************************************************************/
   public static generateExportButton = (onExportClick: () => void): JSX.Element =>
   {
      return (<Typography key={1} variant="body2" py={0} px={0} display="inline" position="relative" top="-0.25rem">
         <Tooltip title="Export">
            <Button sx={{px: 1, py: 0, minWidth: "initial"}} onClick={onExportClick} disabled={false}>
               <Icon sx={{color: colors.gray.main, fontSize: 1.125}}>save_alt</Icon>
            </Button>
         </Tooltip>
      </Typography>);
   };


   /*******************************************************************************
    **
    *******************************************************************************/
   public static generateLabelLink = (linkText: string, linkURL: string): JSX.Element =>
   {
      return (<Box key={1} fontSize="1rem" pl={1} display="inline" position="relative">
         (<Link to={linkURL}>{linkText}</Link>)
      </Box>);
   };


   /*******************************************************************************
    **
    *******************************************************************************/
   public static widgetCsvDataToString = (data: WidgetData): string =>
   {
      function isNumeric(x: any)
      {
         return !isNaN(Number(x));
      }

      let csv = "";
      for (let i = 0; i < data.csvData.length; i++)
      {
         for (let j = 0; j < data.csvData[i].length; j++)
         {
            if (j > 0)
            {
               csv += ",";
            }

            let cell = data.csvData[i][j];
            if (cell && isNumeric(String(cell)))
            {
               csv += cell;
            }
            else
            {
               csv += `"${ValueUtils.cleanForCsv(cell)}"`;
            }
         }
         csv += "\n";
      }

      return (csv);
   };


   /*******************************************************************************
    **
    *******************************************************************************/
   public static makeExportFileName = (data: WidgetData, widgetMetaData: QWidgetMetaData): string =>
   {
      const fileName = (data?.label ?? widgetMetaData.label) + " " + ValueUtils.formatDateTimeForFileName(new Date()) + ".csv";
      return (fileName);
   };


   /***************************************************************************
    * for a given widget (metaData), slot (within the widget), and list of
    * helpRoles, plus based on if helpHelp is active, return:
    * - formattedHelpContent (possibly indicating the key for helpHelp mode)
    * - showHelp - boolean indicating whether to show anything or not.
    ***************************************************************************/
   public static getHelp = (widgetMetaData: QWidgetMetaData, slot: string, helpRoles: string[], helpHelpActive: boolean): {formattedHelpContent: JSX.Element, showHelp: boolean} =>
   {
      const helpContent = widgetMetaData?.helpContent?.get(slot);
      const showHelp = helpHelpActive || hasHelpContent(helpContent, helpRoles);
      const formattedHelpContent = <HelpContent helpContents={helpContent} roles={helpRoles} helpContentKey={`widget:${widgetMetaData.name};slot:${slot}`} />;
      return {formattedHelpContent, showHelp};
   };

}
