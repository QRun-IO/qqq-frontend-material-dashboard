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
import {QProcessMetaData} from "@qrunio/qqq-frontend-core/lib/model/metaData/QProcessMetaData";
import {QReportMetaData} from "@qrunio/qqq-frontend-core/lib/model/metaData/QReportMetaData";

/*******************************************************************************
 ** Utility class for working with QQQ Processes
 **
 *******************************************************************************/
class ProcessUtils
{
   public static mergeDefaultValues(defaults: Record<string, unknown>, queryValues: string): Record<string, unknown>
   {
      const values: unknown = JSON.parse(queryValues);
      if (values === null || typeof values !== "object" || Array.isArray(values))
      {
         throw new Error("Process default values must be an object");
      }
      return {...defaults, ...values};
   }

   public static getProcessesForTable(metaData: QInstance, tableName: string, includeHidden = false): QProcessMetaData[]
   {
      const matchingProcesses: QProcessMetaData[] = [];
      if (metaData.processes)
      {
         const processKeys = [...metaData.processes.keys()];
         processKeys.forEach((key) =>
         {
            const process = metaData.processes.get(key);
            if (process.tableName === tableName && (includeHidden || !process.isHidden))
            {
               matchingProcesses.push(process);
            }
         });
      }
      return matchingProcesses;
   }

   public static getReportsForTable(metaData: QInstance, tableName: string, includeHidden = false): QReportMetaData[]
   {
      const matchingReports: QReportMetaData[] = [];
      if (metaData.reports)
      {
         const reportKeys = [...metaData.reports.keys()];
         reportKeys.forEach((key) =>
         {
            const process = metaData.reports.get(key);
            if (process.tableName === tableName)
            {
               matchingReports.push(process);
            }
         });
      }
      return matchingReports;
   }

}

export default ProcessUtils;
