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
