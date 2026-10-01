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

import {QFieldMetaData} from "@qrunio/qqq-frontend-core/lib/model/metaData/QFieldMetaData";
import {QWidgetMetaData} from "@qrunio/qqq-frontend-core/lib/model/metaData/QWidgetMetaData";
import {QRecord} from "@qrunio/qqq-frontend-core/lib/model/QRecord";
import {Skeleton} from "@mui/material";
import Box from "@mui/material/Box";
import Icon from "@mui/material/Icon";
import Typography from "@mui/material/Typography";
import React from "react";
import Widget from "qqq/components/widgets/Widget";
import ValueUtils from "qqq/utils/qqq/ValueUtils";

interface Props
{
   widgetMetaData: QWidgetMetaData;
   data: any;
   reloadWidgetCallback?: (params: string) => void;
}

FieldValueListWidget.defaultProps = {};

function FieldValueListWidget({widgetMetaData, data, reloadWidgetCallback}: Props): JSX.Element
{
   if (data?.dropdownNeedsSelectedText)
   {
      return (
         <Widget widgetMetaData={widgetMetaData} widgetData={data} reloadWidgetCallback={reloadWidgetCallback}>
            <br />
         </Widget>
      );
   }

   if (!data.fields || !data.record)
   {
      const skeletons = [75, 50, 90];
      return (
         <Widget widgetMetaData={widgetMetaData}>
            <Box p={3} pt={0} display="flex" flexDirection="column">
               {skeletons.map((s) =>
                  (
                     <Box key={s} display="flex" flexDirection="row" pr={2}>
                        <Typography variant="button" pr={2}>
                           <Skeleton width={s + "px"} />
                        </Typography>
                        <Typography variant="button">
                           <Skeleton width={2 * (s + (100 - (1.25 * s))) + "px"} />
                        </Typography>
                     </Box>
                  ))
               }
            </Box>
         </Widget>
      );
   }

   const fields = data.fields.map((f: any) => new QFieldMetaData(f));
   const record = new QRecord(data.record);
   const fieldLabelPrefixIconNames = data.fieldLabelPrefixIconNames ?? {};
   const fieldLabelPrefixIconColors = data.fieldLabelPrefixIconColors ?? {};
   const fieldIndentLevels = data.fieldIndentLevels ?? {};

   return (
      <Widget omitPadding={true} widgetMetaData={widgetMetaData} widgetData={data} reloadWidgetCallback={reloadWidgetCallback}>
         <Box p={0} pt={0} display="flex" flexDirection="column">
            {
               fields.map((field: QFieldMetaData, index: number) => (
                  <Box key={field.label} flexDirection="row" pr={2} pl={3 * (fieldIndentLevels[field.name] ?? 0)}>
                     {
                        fieldLabelPrefixIconNames[field.name] &&
                        <Icon color={fieldLabelPrefixIconColors[field.name] ?? "primary"} sx={{position: "relative", top: "4px", paddingRight: "8px", width: "24px"}}>{fieldLabelPrefixIconNames[field.name]}</Icon>
                     }
                     {
                        field.label &&
                        <Typography variant="button" fontWeight="bold" pr={1} sx={{textTransform: "none", color: "#344767"}}>
                           {field.label}:
                        </Typography>
                     }
                     <Typography variant="button" fontWeight="regular" color="text" sx={{textTransform: "none", color: "#7b809a", fontWeight: 400}}>
                        {ValueUtils.getDisplayValue(field, record, "view")}
                     </Typography>
                  </Box>
               ))
            }
         </Box>
      </Widget>
   );
}

export default FieldValueListWidget;
