/*
 * QQQ - Low-code Application Framework for Engineers.
 * Copyright (C) 2021-2023.  Kingsrook, LLC
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

import {Alert} from "@mui/material";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Icon from "@mui/material/Icon";
import LinearProgress from "@mui/material/LinearProgress";
import Typography from "@mui/material/Typography";
import {DataGridPro, GridSortModel} from "@mui/x-data-grid-pro";
import {QController} from "@qrunio/qqq-frontend-core/lib/controllers/QController";
import {QFieldMetaData} from "@qrunio/qqq-frontend-core/lib/model/metaData/QFieldMetaData";
import {QFieldType} from "@qrunio/qqq-frontend-core/lib/model/metaData/QFieldType";
import {QTableMetaData} from "@qrunio/qqq-frontend-core/lib/model/metaData/QTableMetaData";
import {QTableSection} from "@qrunio/qqq-frontend-core/lib/model/metaData/QTableSection";
import {QJobComplete} from "@qrunio/qqq-frontend-core/lib/model/processes/QJobComplete";
import {QJobError} from "@qrunio/qqq-frontend-core/lib/model/processes/QJobError";
import {QRecord} from "@qrunio/qqq-frontend-core/lib/model/QRecord";
import {QQueryFilter} from "@qrunio/qqq-frontend-core/lib/model/query/QQueryFilter";
import FormData from "form-data";
import DataGridUtils from "qqq/utils/DataGridUtils";
import HtmlUtils from "qqq/utils/HtmlUtils";
import Client from "qqq/utils/qqq/Client";
import ValueUtils from "qqq/utils/qqq/ValueUtils";
import React, {useEffect, useState} from "react";

interface Props
{
   tableMetaData: QTableMetaData;
   fieldMetaData: QFieldMetaData;
   fieldTableName: string;
   filter: QQueryFilter;
}

ColumnStats.defaultProps = {};

const qController = Client.getInstance();

function ColumnStats({tableMetaData, fieldMetaData, fieldTableName, filter}: Props): JSX.Element
{
   const [statusString, setStatusString] = useState("Calculating statistics...");
   const [errorString, setErrorString] = useState(null as string);
   const [loading, setLoading] = useState(true);
   const [valueCounts, setValueCounts] = useState(null as QRecord[]);
   const [statsRecord, setStatsRecord] = useState(null as QRecord);
   const [orderBy, setOrderBy] = useState(null as string);
   const [statsFields, setStatsFields] = useState([] as QFieldMetaData[]);
   const [countDistinct, setCountDistinct] = useState(null as number);
   const [rows, setRows] = useState([]);
   const [columns, setColumns] = useState([]);

   useEffect(() =>
   {
      if (!loading)
      {
         return;
      }

      (async () =>
      {
         const fullFieldName = (fieldTableName == tableMetaData.name ? "" : `${fieldTableName}.`) + fieldMetaData.name;

         const formData = new FormData();
         formData.append("tableName", tableMetaData.name);
         formData.append("fieldName", fullFieldName);
         formData.append("filterJSON", JSON.stringify(filter));
         formData.append(QController.STEP_TIMEOUT_MILLIS_PARAM_NAME, 300 * 1000);
         if (orderBy)
         {
            formData.append("orderBy", orderBy);
         }
         const processResult = await qController.processRun("columnStats", formData);

         setStatusString(null);
         setErrorString(null);
         if (processResult instanceof QJobError)
         {
            const jobError = processResult as QJobError;
            setStatusString(null);
            setErrorString(jobError.error);
            setRows([]);
            setLoading(false);
         }
         else
         {
            // todo - job running!

            const result = processResult as QJobComplete;

            const statFieldObjects = result.values.statsFields;
            if (statFieldObjects && statFieldObjects.length)
            {
               const newStatsFields = [] as QFieldMetaData[];
               for (let i = 0; i < statFieldObjects.length; i++)
               {
                  newStatsFields.push(new QFieldMetaData(statFieldObjects[i]));
               }
               setStatsFields(newStatsFields);
            }

            let qRecord = new QRecord(result.values.statsRecord);
            setStatsRecord(qRecord);
            if (qRecord.values.has("countDistinct"))
            {
               setCountDistinct(qRecord.values.get("countDistinct"));
            }

            const valueCounts = [] as QRecord[];
            for (let i = 0; i < result.values.valueCounts?.length; i++)
            {
               let valueRecord = new QRecord(result.values.valueCounts[i]);

               ////////////////////////////////////////////////////////////////////////////////////////////////
               // for a field from a join, the backend will have sent it as table.field (e.g., lineItem.sku) //
               // but we'll have a "better time" in the rest of this code if we have it as just the field    //
               // name, so, copy it there...                                                                 //
               ////////////////////////////////////////////////////////////////////////////////////////////////
               valueRecord.displayValues.set(fieldMetaData.name, valueRecord.displayValues.get(fullFieldName));
               valueRecord.values.set(fieldMetaData.name, valueRecord.values.get(fullFieldName));
               valueCounts.push(valueRecord);
            }
            setValueCounts(valueCounts);

            const fakeTableMetaData = new QTableMetaData({primaryKeyField: fieldMetaData.name});
            fakeTableMetaData.fields = new Map<string, QFieldMetaData>();
            fakeTableMetaData.fields.set(fieldMetaData.name, fieldMetaData);
            fakeTableMetaData.fields.set("count", new QFieldMetaData({name: "count", label: "Count", type: "INTEGER"}));
            fakeTableMetaData.fields.set("percent", new QFieldMetaData({name: "percent", label: "Percent", type: "DECIMAL"}));
            fakeTableMetaData.sections = [] as QTableSection[];
            fakeTableMetaData.sections.push(new QTableSection({fieldNames: [fieldMetaData.name, "count", "percent"]}));

            const rows = DataGridUtils.makeRows(valueCounts, fakeTableMetaData);
            const columns = DataGridUtils.setupGridColumns(fakeTableMetaData, null, null, "bySection");

            if (fieldMetaData.type == QFieldType.DATE_TIME)
            {
               columns[0].headerName = fieldMetaData.label + " (grouped by hour)";
            }

            columns.forEach((c) =>
            {
               c.filterable = false;
               c.hideable = false;
            });

            setRows(rows);
            setColumns(columns);
            setLoading(false);
         }
      })();
   }, [loading]);

   function CustomPagination()
   {
      return (
         <Box pr={3} fontSize="0.85rem">
            {rows && rows.length && countDistinct && rows.length < countDistinct ? <span>Showing the first {rows.length.toLocaleString()} of {countDistinct.toLocaleString()} values</span> : <></>}
            {rows && rows.length && countDistinct && rows.length >= countDistinct && rows.length == 1 ? <span>Showing the only value</span> : <></>}
            {rows && rows.length && countDistinct && rows.length >= countDistinct && rows.length > 1 ? <span>Showing all {rows.length.toLocaleString()} values</span> : <></>}
         </Box>
      );
   }

   const refresh = () =>
   {
      setLoading(true);
      setStatusString("Refreshing...");
      setErrorString(null);
   };

   const doExport = () =>
   {
      let csv = `"${ValueUtils.cleanForCsv(fieldMetaData.label)}","Count"\n`;
      for (let i = 0; i < valueCounts.length; i++)
      {
         const fieldValue = valueCounts[i].displayValues.get(fieldMetaData.name);
         const count = valueCounts[i].values.get("count");
         csv += `"${ValueUtils.cleanForCsv(fieldValue)}",${count}\n`;
      }

      const fileName = tableMetaData.label + " - " + fieldMetaData.label + " Column Stats " + ValueUtils.formatDateTimeForFileName(new Date()) + ".csv";
      HtmlUtils.download(fileName, csv);
   };

   function Loading()
   {
      return (
         <LinearProgress color="info" />
      );
   }

   const handleSortChange = (gridSort: GridSortModel) =>
   {
      if (gridSort && gridSort.length > 0)
      {
         console.log("Sort: ", gridSort[0]);
         setOrderBy(`${gridSort[0].field}.${gridSort[0].sort}`);
         refresh();
      }
   };

   return (
      <Box>
         <Box p={3} display="flex" flexDirection="row" justifyContent="space-between" alignItems="flex-start">
            <Box pb={3}>
               <Typography variant="h5">
                  Column Statistics for {fieldMetaData.label}
                  <Typography fontSize={14}>
                     {statusString ?? <>&nbsp;</>}
                  </Typography>
               </Typography>
               {errorString && <Box position="absolute" top="3.75rem" width="calc(100% - 5rem)" zIndex="10" mx="2rem"><Alert severity="error">{errorString}</Alert></Box>}
            </Box>
            <Box>
               <Button onClick={() => refresh()} startIcon={<Icon>refresh</Icon>} disabled={loading}>
                  Refresh
               </Button>
               <Button onClick={() => doExport()} startIcon={<Icon>save_alt</Icon>} disabled={valueCounts == null || valueCounts.length == 0}>
                  Export
               </Button>
            </Box>
         </Box>
         <Grid container>
            <Grid item xs={8}>
               <Box sx={{overflow: "auto", height: "calc( 100vh - 18rem )", position: "relative"}} px={3}>
                  <DataGridPro
                     components={{LoadingOverlay: Loading, Pagination: CustomPagination}}
                     rows={rows}
                     disableSelectionOnClick
                     columns={columns}
                     disableColumnSelector={true}
                     disableColumnPinning={true}
                     loading={loading}
                     rowBuffer={10}
                     error={errorString}
                     getRowClassName={(params) => (params.indexRelativeToCurrentPage % 2 === 0 ? "even" : "odd")}
                     sortingMode={"server"}
                     onSortModelChange={handleSortChange}
                     sortingOrder={["desc", "asc"]}
                     pagination={true}
                     paginationMode={"server"}
                     initialState={{
                        sorting: {
                           sortModel: [
                              {
                                 field: "count",
                                 sort: "desc",
                              },
                           ],
                        },
                     }}
                  />
               </Box>
            </Grid>
            <Grid item xs={4} sx={{whiteSpace: "nowrap", overflowX: "auto"}}>
               <Box px={3} fontSize="1rem">
                  {
                     statsFields && statsFields.map((field) =>
                        (
                           <Box key={field.name} pb={1}>
                              <div className="fieldLabel">{field.label}:</div>
                              <div className="fieldValue">{ValueUtils.getValueForDisplay(field, statsRecord?.values.get(field.name), statsRecord?.displayValues.get(field.name))}</div>
                           </Box>
                        ))
                  }
               </Box>
            </Grid>
         </Grid>
      </Box>);
}

export default ColumnStats;
