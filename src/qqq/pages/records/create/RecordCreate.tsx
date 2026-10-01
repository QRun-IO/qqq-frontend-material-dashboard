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

import {QTableMetaData} from "@qrunio/qqq-frontend-core/lib/model/metaData/QTableMetaData";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import EntityForm from "qqq/components/forms/EntityForm";
import BaseLayout from "qqq/layouts/BaseLayout";

interface Props
{
   table?: QTableMetaData;
}

function EntityCreate({table}: Props): JSX.Element
{
   return (
      <BaseLayout>
         <Box mb={3}>
            <EntityForm table={table} />
         </Box>
      </BaseLayout>
   );
}

EntityCreate.defaultProps = {
   table: null,
};

export default EntityCreate;
