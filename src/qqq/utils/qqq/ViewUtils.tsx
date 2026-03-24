/*
 * QQQ - Low-code Application Framework for Engineers.
 * Copyright (C) 2021-2026.  Kingsrook, LLC
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

import {Typography} from "@mui/material";
import Grid from "@mui/material/Grid";
import Tooltip from "@mui/material/Tooltip/Tooltip";
import {SxProps} from "@mui/system";
import {AdornmentType} from "@qrunio/qqq-frontend-core/lib/model/metaData/AdornmentType";
import {QFieldMetaData} from "@qrunio/qqq-frontend-core/lib/model/metaData/QFieldMetaData";
import {QTableMetaData} from "@qrunio/qqq-frontend-core/lib/model/metaData/QTableMetaData";
import {QTableVariant} from "@qrunio/qqq-frontend-core/lib/model/metaData/QTableVariant";
import {QRecord} from "@qrunio/qqq-frontend-core/lib/model/QRecord";
import HelpContent, {hasHelpContent} from "qqq/components/misc/HelpContent";
import {FieldValueAsWidget} from "qqq/components/view/FieldValueAsWidget";
import TableUtils from "qqq/utils/qqq/TableUtils";
import ValueUtils from "qqq/utils/qqq/ValueUtils";
import React from "react";


/*******************************************************************************
 ** Render a grid of view-mode fields (label + display value).
 ** Extracted from RecordView for reuse by CronUIWidget, DynamicFormWidget, ValidationReview.
 *******************************************************************************/
export function renderSectionOfFields(key: string, fieldNames: string[], tableMetaData: QTableMetaData, helpHelpActive: boolean, record: QRecord, fieldMap?: { [name: string]: QFieldMetaData }, styleOverrides?: { label?: SxProps, value?: SxProps }, tableVariant?: QTableVariant)
{
   return <Grid container lg={12} key={key} display="flex" py={1} pr={2}>
      {
         fieldNames.map((fieldName: string) =>
         {
            let [field, tableForField] = tableMetaData ? TableUtils.getFieldAndTable(tableMetaData, fieldName) : fieldMap ? [fieldMap[fieldName], null] : [null, null];

            if(field == null)
            {
               if(tableMetaData?.virtualFields?.has(fieldName))
               {
                  field = tableMetaData.virtualFields.get(fieldName);
               }
            }

            if (field != null)
            {
               let label = field.label;
               let gridColumns = (field.gridColumns && field.gridColumns > 0) ? field.gridColumns : 12;

               const helpRoles = ["VIEW_SCREEN", "READ_SCREENS", "ALL_SCREENS"];
               const showHelp = helpHelpActive || hasHelpContent(field.helpContents, helpRoles);
               const formattedHelpContent = <HelpContent helpContents={field.helpContents} roles={helpRoles} heading={label} helpContentKey={`table:${tableMetaData?.name};field:${fieldName}`} />;

               const labelElement = <Typography variant="button" textTransform="none" fontWeight="bold" pr={1} color="rgb(52, 71, 103)" sx={{cursor: "default", ...(styleOverrides?.label ?? {})}}>{label}:</Typography>;

               if(field.hasAdornment(AdornmentType.WIDGET))
               {
                  return (<Grid item key={fieldName} lg={gridColumns} flexDirection="column" pr={2}>
                     <FieldValueAsWidget field={field} record={record} />
                  </Grid>);
               }

               return (
                  <Grid item key={fieldName} lg={gridColumns} flexDirection="column" pr={2}>
                     <>
                        {
                           showHelp && formattedHelpContent ? <Tooltip title={formattedHelpContent}>{labelElement}</Tooltip> : labelElement
                        }
                        <div style={{display: "inline-block", width: 0}}>&nbsp;</div>
                        <Typography variant="button" textTransform="none" fontWeight="regular" color="rgb(123, 128, 154)" sx={{...(styleOverrides?.value ?? {})}}>
                           {ValueUtils.getDisplayValue(field, record, "view", fieldName, tableVariant)}
                        </Typography>
                     </>
                  </Grid>
               );
            }
         })
      }
   </Grid>;
}
