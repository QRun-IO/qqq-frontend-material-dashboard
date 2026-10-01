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

import {QInstance} from "@qrunio/qqq-frontend-core/lib/model/metaData/QInstance";
import {QWidgetMetaData} from "@qrunio/qqq-frontend-core/lib/model/metaData/QWidgetMetaData";
import {Skeleton} from "@mui/material";
import Box from "@mui/material/Box";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableContainer from "@mui/material/TableContainer";
import TableRow from "@mui/material/TableRow";
import parse from "html-react-parser";
import MDTypography from "qqq/components/legacy/MDTypography";
import DataTableBodyCell from "qqq/components/widgets/tables/cells/DataTableBodyCell";
import DataTableHeadCell from "qqq/components/widgets/tables/cells/DataTableHeadCell";
import DefaultCell from "qqq/components/widgets/tables/cells/DefaultCell";
import DataTable from "qqq/components/widgets/tables/DataTable";
import Client from "qqq/utils/qqq/Client";
import React, {useEffect, useState} from "react";


//////////////////////////////////////
// structure of expected table data //
//////////////////////////////////////
export interface TableDataInput
{
   columns: { [key: string]: any }[];
   columnHeaderTooltips?: { [columnName: string]: string | JSX.Element };
   rows: { [key: string]: any }[];
}


/////////////////////////
// inputs and defaults //
/////////////////////////
interface Props
{
   noRowsFoundHTML?: string;
   rowsPerPage?: number;
   hidePaginationDropdown?: boolean;
   fixedStickyLastRow?: boolean;
   fixedHeight?: number;
   data: TableDataInput;
   widgetMetaData: QWidgetMetaData;
}

const qController = Client.getInstance();

function TableCard({noRowsFoundHTML, data, rowsPerPage, hidePaginationDropdown, fixedStickyLastRow, fixedHeight, widgetMetaData}: Props): JSX.Element
{
   const [qInstance, setQInstance] = useState(null as QInstance);

   useEffect(() =>
   {
      (async () =>
      {
         const newQInstance = await qController.loadMetaData();
         setQInstance(newQInstance);
      })();
   }, []);

   return (
      <Box className="tableCard" mx={-2} mb="-28px" pt="11px" pb="0.25rem">
         {
            data && data.columns && !noRowsFoundHTML ?
               <DataTable
                  table={data}
                  entriesPerPage={rowsPerPage}
                  hidePaginationDropdown={hidePaginationDropdown}
                  fixedStickyLastRow={fixedStickyLastRow}
                  fixedHeight={fixedHeight}
                  showTotalEntries={false}
                  isSorted={false}
                  widgetMetaData={widgetMetaData}
               />
               : noRowsFoundHTML ?
                  <Box p={3} pt={0} pb={3} sx={{textAlign: "center"}}>
                     <MDTypography variant="subtitle2" color="secondary" fontWeight="regular">
                        {noRowsFoundHTML ? (parse(noRowsFoundHTML)) : "No rows found"}
                     </MDTypography>
                  </Box>
                  :
                  <TableContainer sx={{boxShadow: "none"}}>
                     <Table component="div" sx={{display: "grid", gridTemplateRows: "auto", gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr"}}>
                        {Array(8).fill(0).map((_, i) =>
                           <DataTableHeadCell key={`head-${i}`} sorted={false} width="auto" align="center">
                              <Skeleton width="100%" />
                           </DataTableHeadCell>
                        )}
                        {Array(5).fill(0).map((_, i) =>
                           Array(8).fill(0).map((_, j) =>
                              <DataTableBodyCell key={`cell-${i}-${j}`} align="center">
                                 <DefaultCell isFooter={false}><Skeleton /></DefaultCell>
                              </DataTableBodyCell>
                           )
                        )}
                     </Table>
                  </TableContainer>
         }
      </Box>
   );
}

export default TableCard;
