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

import {Capability} from "@qrunio/qqq-frontend-core/lib/model/metaData/Capability";
import {QTableMetaData} from "@qrunio/qqq-frontend-core/lib/model/metaData/QTableMetaData";
import {TablePagination} from "@mui/material";
import Box from "@mui/material/Box";
import Icon from "@mui/material/Icon";
import IconButton from "@mui/material/IconButton";
import {GridRowsProp} from "@mui/x-data-grid-pro";
import CustomWidthTooltip from "qqq/components/tooltips/CustomWidthTooltip";
import ValueUtils from "qqq/utils/qqq/ValueUtils";
import React from "react";

interface CustomPaginationProps
{
   tableMetaData: QTableMetaData;
   rows: GridRowsProp[];
   totalRecords: number;
   distinctRecords: number;
   pageNumber: number;
   rowsPerPage: number;
   loading: boolean;
   isJoinMany: boolean;
   handlePageChange: (value: number) => void;
   handleRowsPerPageChange: (value: number) => void;
}

/*******************************************************************************
 ** DataGrid custom component - for pagination!
 *******************************************************************************/
export default function CustomPaginationComponent({tableMetaData, rows, totalRecords, distinctRecords, pageNumber, rowsPerPage, loading, isJoinMany, handlePageChange, handleRowsPerPageChange}: CustomPaginationProps): JSX.Element
{
   // @ts-ignore
   const defaultLabelDisplayedRows = ({from, to, count}) =>
   {
      const tooltipHTML = <>
         The number of rows shown on this screen may be greater than the number of {tableMetaData?.label} records
         that match your query, because you have included fields from other tables which may have
         more than one record associated with each {tableMetaData?.label}.
      </>;
      let distinctPart = isJoinMany ? (<Box display="inline" component="span" textAlign="right">
         &nbsp;({ValueUtils.safeToLocaleString(distinctRecords)} distinct<CustomWidthTooltip title={tooltipHTML}>
            <IconButton sx={{p: 0, pl: 0.25, mb: 0.25}}><Icon fontSize="small" sx={{fontSize: "1.125rem !important", color: "#9f9f9f"}}>info_outlined</Icon></IconButton>
         </CustomWidthTooltip>
         )
      </Box>) : <></>;

      if (tableMetaData && !tableMetaData.capabilities.has(Capability.TABLE_COUNT))
      {
         if (loading)
         {
            return "Counting...";
         }

         if (!rows || rows.length == 0)
         {
            return "No rows";
         }

         ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
         // to avoid a non-countable table showing (this is what data-grid did) 91-100 even if there were only 95 records, //
         // we'll do this... not quite good enough, but better than the original                                           //
         ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
         if (rows.length > 0 && rows.length < to - from)
         {
            to = from + (rows.length - 1);
         }
         return (`Showing ${from.toLocaleString()} to ${to.toLocaleString()}`);
      }

      /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
      // treat -1 as the sentinel that it's set as below -- remember, we did that so that 'to' would have a value in here when there's no count. //
      /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
      if (count !== null && count !== undefined && count !== -1)
      {
         if (count === 0)
         {
            return (loading ? "Counting..." : "No rows");
         }

         return <span>
            Showing {from.toLocaleString()} to {to.toLocaleString()} of
            {
               count == -1 ?
                  <>more than {to.toLocaleString()}</>
                  : <> {count.toLocaleString()}{distinctPart}</>
            }
         </span>;
      }
      else
      {
         return ("Counting...");
      }
   };

   ///////////////////////////////////////////////////////////////////////////////
   // the `count` param that we pass to <TablePagination> below is very         //
   // important - it drives which of the < and > (prev & next) buttons are      //
   // enabled - and, it's a little tricky for tables where we don't do a count. //
   ///////////////////////////////////////////////////////////////////////////////
   let countForTablePagination: number;
   if (tableMetaData && !tableMetaData.capabilities.has(Capability.TABLE_COUNT))
   {
      ////////////////////////////////////////////
      // handle tables where count is disabled. //
      ////////////////////////////////////////////
      if(!rows || rows.length == 0)
      {
         /////////////////////////////////////////////
         // if we have no rows, assume a count of 0 //
         /////////////////////////////////////////////
         countForTablePagination = 0;
      }
      if(rows.length < rowsPerPage)
      {
         //////////////////////////////////////////////////////////////////////////////////////////////////
         // if the # of rows we have is less than the rowsPerPage, assume we're at the end of the query  //
         // so, setting count to pageNo*rowsPer + rows.length - leaves prev. enabled, but disables next. //
         //////////////////////////////////////////////////////////////////////////////////////////////////
         countForTablePagination = (pageNumber * rowsPerPage) + rows.length;
      }
      else
      {
         ///////////////////////////////////////////////////////////////////////////////////////////////////
         // else, we don't know how many more pages there could be - so, just assume it's at least 1 more //
         ///////////////////////////////////////////////////////////////////////////////////////////////////
         countForTablePagination = ((pageNumber + 1) * rowsPerPage) + 1;
      }
   }
   else
   {
      ////////////////////////////////////////////////////////////////////////////////
      // cases where count is enabled - they work much more like we'd expect:       //
      // if we don't know totalRecords (probably same as loading?) - use a -1,      //
      // which lets us see < and > both active;  else, use totalRecords when known. //
      ////////////////////////////////////////////////////////////////////////////////
      countForTablePagination = totalRecords === null || totalRecords === undefined ? -1 : totalRecords;
   }

   return (
      <TablePagination
         component="div"
         sx={{minWidth: "450px", "& .MuiTablePagination-displayedRows": {minWidth: "110px"}}}
         count={countForTablePagination}
         page={pageNumber}
         rowsPerPageOptions={[10, 25, 50, 100, 250]}
         rowsPerPage={rowsPerPage}
         onPageChange={(event, value) => handlePageChange(value)}
         onRowsPerPageChange={(event) => handleRowsPerPageChange(Number(event.target.value))}
         labelDisplayedRows={defaultLabelDisplayedRows}
      />
   );

}
