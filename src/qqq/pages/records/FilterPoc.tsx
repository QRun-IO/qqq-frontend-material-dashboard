/*
 * QQQ - Low-code Application Framework for Engineers.
 * Copyright (C) 2021-2023.  Kingsrook, LLC
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

import {QController} from "@qrunio/qqq-frontend-core/lib/controllers/QController";
import {QTableMetaData} from "@qrunio/qqq-frontend-core/lib/model/metaData/QTableMetaData";
import {QQueryFilter} from "@qrunio/qqq-frontend-core/lib/model/query/QQueryFilter";
import Box from "@mui/material/Box";
import {useEffect, useState} from "react";
import {CustomFilterPanel} from "qqq/components/query/CustomFilterPanel";
import BaseLayout from "qqq/layouts/BaseLayout";
import Client from "qqq/utils/qqq/Client";


interface Props
{
}

FilterPoc.defaultProps = {};

function FilterPoc({}: Props): JSX.Element
{
   const [tableMetaData, setTableMetaData] = useState(null as QTableMetaData)
   const [queryFilter, setQueryFilter] = useState(new QQueryFilter())

   const updateFilter = (newFilter: QQueryFilter) =>
   {
      setQueryFilter(JSON.parse(JSON.stringify(newFilter)));
   }

   useEffect(() =>
   {
      (async () =>
      {
         const table = await Client.getInstance().loadTableMetaData("order")
         setTableMetaData(table);
      })();
   }, []);

   return (
      <BaseLayout>
         {
            tableMetaData &&
            <Box>
               <Box sx={{background: "white"}} border="1px solid gray">
                  {/* @ts-ignore */}
                  <CustomFilterPanel tableMetaData={tableMetaData} queryFilter={queryFilter} updateFilter={updateFilter} />
               </Box>
               <pre style={{fontSize: "12px"}}>
                  {JSON.stringify(queryFilter, null, 3)})
               </pre>
            </Box>
         }
      </BaseLayout>
   );
}

export default FilterPoc;
