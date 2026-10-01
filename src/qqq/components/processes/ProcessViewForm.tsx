/*
 * QQQ - Low-code Application Framework for Engineers.
 * Copyright (C) 2021-2024.  Kingsrook, LLC
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


import {AdornmentType} from "@qrunio/qqq-frontend-core/lib/model/metaData/AdornmentType";
import {QFieldMetaData} from "@qrunio/qqq-frontend-core/lib/model/metaData/QFieldMetaData";
import Grid from "@mui/material/Grid";
import MDTypography from "qqq/components/legacy/MDTypography";
import ValueUtils from "qqq/utils/qqq/ValueUtils";

interface ProcessViewFormProps
{
   fields: QFieldMetaData[];
   values: { [fieldName: string]: any };
   columns?: number;
}

ProcessViewForm.defaultProps = {
   columns: 2
};

/***************************************************************************
 ** a "view form" within a process step
 **
 ***************************************************************************/
export default function ProcessViewForm({fields, values, columns}: ProcessViewFormProps): JSX.Element
{
   const sm = Math.floor(12 / columns);

   return <Grid container>
      {fields.map((field: QFieldMetaData) => (
         field.hasAdornment(AdornmentType.ERROR) ? (
            values[field.name] && (
               <Grid item xs={12} sm={sm} key={field.name} display="flex" py={1} pr={2}>
                  <MDTypography variant="button" fontWeight="regular">
                     {ValueUtils.getValueForDisplay(field, values[field.name], undefined, "view")}
                  </MDTypography>
               </Grid>
            )
         ) : (
            <Grid item xs={12} sm={sm} key={field.name} display="flex" py={1} pr={2}>
               <MDTypography variant="button" fontWeight="bold">
                  {field.label}
                  : &nbsp;
               </MDTypography>
               <MDTypography variant="button" fontWeight="regular" color="text">
                  {ValueUtils.getValueForDisplay(field, values[field.name], undefined, "view")}
               </MDTypography>
            </Grid>
         )))
      }
   </Grid>;
}
