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

import {QRecord} from "@qrunio/qqq-frontend-core/lib/model/QRecord";
import Box from "@mui/material/Box";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableContainer from "@mui/material/TableContainer";
import TableRow from "@mui/material/TableRow";
import React from "react";
import DataTableBodyCell from "qqq/components/widgets/tables/cells/DataTableBodyCell";
import DataTableHeadCell from "qqq/components/widgets/tables/cells/DataTableHeadCell";
import ValueUtils from "qqq/utils/qqq/ValueUtils";

interface Props
{
   logs: QRecord[];
}

ScriptLogsView.defaultProps = {
   logs: null,
};

function ScriptLogsView({logs}: Props): JSX.Element
{
   return (
      <TableContainer sx={{boxShadow: "none"}} className="scriptLogsView">
         <Table>
            <Box component="thead">
               <TableRow key="header">
                  <DataTableHeadCell sorted={false}>Timestamp</DataTableHeadCell>
                  <DataTableHeadCell sorted={false} align="right">Run Time (ms)</DataTableHeadCell>
                  <DataTableHeadCell sorted={false}>Had Error?</DataTableHeadCell>
                  <DataTableHeadCell sorted={false}>Input</DataTableHeadCell>
                  <DataTableHeadCell sorted={false}>Output</DataTableHeadCell>
                  <DataTableHeadCell sorted={false}>Logs</DataTableHeadCell>
               </TableRow>
            </Box>
            <TableBody>
               {
                  logs?.map((logRecord: QRecord) =>
                  {
                     let logs = "";
                     if (logRecord.values.get("scriptLogLine"))
                     {
                        for (let i = 0; i < logRecord.values.get("scriptLogLine").length; i++)
                        {
                           logs += (logRecord.values.get("scriptLogLine")[i].values.text + "\n");
                        }
                     }

                     return (
                        <TableRow key={logRecord.values.get("id")}>
                           <DataTableBodyCell>{ValueUtils.formatDateTime(logRecord.values.get("startTimestamp"))}</DataTableBodyCell>
                           <DataTableBodyCell align="right">{logRecord.values.get("runTimeMillis")?.toLocaleString()}</DataTableBodyCell>
                           <DataTableBodyCell>
                              <div style={{color: logRecord.values.get("hadError") ? "red" : "auto"}}>{ValueUtils.formatBoolean(logRecord.values.get("hadError"))}</div>
                           </DataTableBodyCell>
                           <DataTableBodyCell>{logRecord.values.get("input")}</DataTableBodyCell>
                           <DataTableBodyCell>
                              {logRecord.values.get("output")}
                              {logRecord.values.get("error")}
                           </DataTableBodyCell>
                           <DataTableBodyCell>{logs}</DataTableBodyCell>
                        </TableRow>
                     );
                  })
               }
            </TableBody>
         </Table>
      </TableContainer>
   );
}

export default ScriptLogsView;


