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

import {QFrontendStepMetaData} from "@qrunio/qqq-frontend-core/lib/model/metaData/QFrontendStepMetaData";
import {QInstance} from "@qrunio/qqq-frontend-core/lib/model/metaData/QInstance";
import {QProcessMetaData} from "@qrunio/qqq-frontend-core/lib/model/metaData/QProcessMetaData";
import {QTableMetaData} from "@qrunio/qqq-frontend-core/lib/model/metaData/QTableMetaData";
import {ListItem} from "@mui/material";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Icon from "@mui/material/Icon";
import List from "@mui/material/List";
import ListItemText from "@mui/material/ListItemText";
import colors from "qqq/assets/theme/base/colors";
import React, {useState} from "react";
import {ProcessSummaryLine} from "qqq/models/processes/ProcessSummaryLine";
import Client from "qqq/utils/qqq/Client";
import ValueUtils from "qqq/utils/qqq/ValueUtils";

interface Props
{
   qInstance: QInstance;
   process: QProcessMetaData;
   table: QTableMetaData;
   processValues: any;
   step: QFrontendStepMetaData;
}

/*******************************************************************************
 ** This is the process summary result component.
 *******************************************************************************/
function ProcessSummaryResults({
   qInstance, process, table = null, processValues, step,
}: Props): JSX.Element
{
   const [sourceTableMetaData, setSourceTableMetaData] = useState(null as QTableMetaData);

   if(processValues.sourceTable && !sourceTableMetaData)
   {
      (async () =>
      {
         const sourceTableMetaData = await Client.getInstance().loadTableMetaData(processValues.sourceTable)
         setSourceTableMetaData(sourceTableMetaData);
      })();
   }

   const resultValidationList = (
      <List sx={{mt: 2}}>
         {
            processValues?.recordCount !== undefined && sourceTableMetaData && (
               <ListItem sx={{my: 2}}>
                  <ListItemText primaryTypographyProps={{fontSize: 16}}>
                     {ValueUtils.getFormattedNumber(processValues.recordCount)}
                     {" "}
                     {sourceTableMetaData.label}
                     {processValues.recordCount === 1 ? " record was" : " records were"} processed.
                  </ListItemText>
               </ListItem>
            )
         }
         <List>
            {
               processValues.processResults && processValues.processResults.map((processSummaryLine: ProcessSummaryLine, i: number) => (new ProcessSummaryLine(processSummaryLine).getProcessSummaryListItem(i, sourceTableMetaData, qInstance, true)))
            }
         </List>
      </List>
   );

   let headerColor = colors.success.main;
   if(processValues.status == "ERROR")
   {
      headerColor = colors.error.main;
   }

   return (
      <Box m={{xs: 0, md: 3}} mt={"3rem!important"}>
         <Grid container>
            <Grid item xs={0} lg={2} />
            <Grid item xs={12} lg={8}>
               <Box border="1px solid rgb(70%, 70%, 70%)" borderRadius="10px" p={2} mt={2}>
                  <Box mx={2} mt={-5} p={1} sx={{width: "fit-content", borderRadius: ".25em", backgroundColor: headerColor}} width="initial" color="#FFFFFF">
                     <Box display="flex" alignItems="center" color="white">
                        {process.iconName && <Icon fontSize="medium" sx={{mr: 1}}>{process.iconName}</Icon>}
                        Process Summary
                     </Box>
                  </Box>
                  {resultValidationList}
               </Box>
            </Grid>
            <Grid item xs={0} lg={2} />
         </Grid>
      </Box>
   );
}

export default ProcessSummaryResults;
