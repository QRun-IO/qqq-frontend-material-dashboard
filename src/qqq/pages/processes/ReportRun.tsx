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
import {QReportMetaData} from "@qrunio/qqq-frontend-core/lib/model/metaData/QReportMetaData";
import React, {useContext, useEffect, useState} from "react";
import QContext from "QContext";
import ProcessRun from "qqq/pages/processes/ProcessRun";
import Client from "qqq/utils/qqq/Client";

interface Props
{
   report?: QReportMetaData;
}

function ReportRun({report}: Props): JSX.Element
{
   const [metaData, setMetaData] = useState(null as QInstance);
   const {pageHeader, setPageHeader} = useContext(QContext);

   useEffect(() =>
   {
      if (!metaData)
      {
         (async () =>
         {
            const metaData = await Client.getInstance().loadMetaData();
            setMetaData(metaData);
         })();
      }
   });

   if (metaData)
   {
      setPageHeader(report.label);
      const process = metaData.processes.get(report.processName);
      const defaultProcessValues = {reportName: report.name};
      return (<ProcessRun process={process} overrideLabel={report.label} isReport={true} defaultProcessValues={defaultProcessValues} />);
   }
   else
   {
      // todo - loading?
      return (<div />);
   }
}

ReportRun.defaultProps = {
   process: null,
};

export default ReportRun;
