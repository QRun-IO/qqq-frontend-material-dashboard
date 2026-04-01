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


import {QTableMetaData} from "@qrunio/qqq-frontend-core/lib/model/metaData/QTableMetaData";
import {QRecord} from "@qrunio/qqq-frontend-core/lib/model/QRecord";
import {QCriteriaOperator} from "@qrunio/qqq-frontend-core/lib/model/query/QCriteriaOperator";
import {QFilterCriteria} from "@qrunio/qqq-frontend-core/lib/model/query/QFilterCriteria";
import {QQueryFilter} from "@qrunio/qqq-frontend-core/lib/model/query/QQueryFilter";
import {QueryJoin} from "@qrunio/qqq-frontend-core/lib/model/query/QueryJoin";
import {Alert, Box} from "@mui/material";
import Grid from "@mui/material/Grid";
import BaseLayout from "qqq/layouts/BaseLayout";
import Client from "qqq/utils/qqq/Client";
import TableUtils from "qqq/utils/qqq/TableUtils";
import React, {useEffect, useState} from "react";
import {useLocation, useNavigate, useSearchParams} from "react-router-dom";

interface RecordViewByUniqueKeyProps
{
   table: QTableMetaData;
}

const qController = Client.getInstance();

/***************************************************************************
 ** Wrapper that reads a unique key from the query string, looks for a
 ** matching record, and redirects to the standard view URL.
 ***************************************************************************/
export default function RecordViewByUniqueKey({table}: RecordViewByUniqueKeyProps): JSX.Element
{
   const tableName = table.name;
   const navigate = useNavigate();
   const location = useLocation();

   const [asyncLoadInited, setAsyncLoadInited] = useState(false);
   const [tableMetaData, setTableMetaData] = useState(null as QTableMetaData);
   const [doneLoading, setDoneLoading] = useState(false);
   const [record, setRecord] = useState(null as QRecord);
   const [errorMessage, setErrorMessage] = useState(null as string);

   const [queryParams] = useSearchParams();

   if (!asyncLoadInited)
   {
      setAsyncLoadInited(true);

      (async () =>
      {
         const tableMetaData = await qController.loadTableMetaData(tableName);
         setTableMetaData(tableMetaData);

         const criteria: QFilterCriteria[] = [];
         for (let [name, value] of queryParams.entries())
         {
            criteria.push(new QFilterCriteria(name, QCriteriaOperator.EQUALS, [value]));
            if(!tableMetaData.fields.has(name))
            {
               setErrorMessage(`Query-string parameter [${name}] is not a defined field on the ${tableMetaData.label} table.`);
               setDoneLoading(true);
               return;
            }
         }

         let queryJoins: QueryJoin[] = null;
         const visibleJoinTables = TableUtils.getVisibleJoinTables(tableMetaData);
         if (visibleJoinTables.size > 0)
         {
            queryJoins = TableUtils.getQueryJoins(tableMetaData, visibleJoinTables);
         }

         const filter = new QQueryFilter(criteria, null, null, "AND", 0, 2);
         qController.query(tableName, filter, queryJoins)
            .then((queryResult) =>
            {
               setDoneLoading(true);
               if (queryResult.length == 1)
               {
                  setRecord(queryResult[0]);
               }
               else if (queryResult.length == 0)
               {
                  setErrorMessage(`No ${tableMetaData.label} record was found matching the given values.`);
               }
               else if (queryResult.length > 1)
               {
                  setErrorMessage(`More than one ${tableMetaData.label} record was found matching the given values.`);
               }
            })
            .catch((error) =>
            {
               setDoneLoading(true);
               console.log(error);
               if (error && error.message)
               {
                  setErrorMessage(error.message);
               }
               else if (error && error.response && error.response.data && error.response.data.error)
               {
                  setErrorMessage(error.response.data.error);
               }
               else
               {
                  setErrorMessage("Unexpected error running query");
               }
            });
      })();
   }

   useEffect(() =>
   {
      if (asyncLoadInited)
      {
         setAsyncLoadInited(false);
         setDoneLoading(false);
         setRecord(null);
      }
   }, [queryParams]);

   // redirect to the standard view URL once we have the record ID
   useEffect(() =>
   {
      if (doneLoading && record)
      {
         const recordId = record.values.get(tableMetaData?.primaryKeyField);
         if (recordId)
         {
            const basePath = location.pathname.replace(/\/key$/, "");
            navigate(`${basePath}/${recordId}`, {replace: true});
         }
      }
   }, [doneLoading, record]);

   if (!doneLoading)
   {
      return (<div>Loading...</div>);
   }
   else if (record)
   {
      // will redirect via the useEffect above
      return (<div>Loading...</div>);
   }
   else if (errorMessage)
   {
      return (<BaseLayout>
         <Box className="recordView">
            <Grid container>
               <Grid item xs={12}>
                  <Box mb={3}>
                     {
                        <Alert color="error" sx={{mb: 3}}>{errorMessage}</Alert>
                     }
                  </Box>
               </Grid>
            </Grid>
         </Box>
      </BaseLayout>);
   }
}
