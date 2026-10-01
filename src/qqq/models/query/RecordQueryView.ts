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

import {QQueryFilter} from "@qrunio/qqq-frontend-core/lib/model/query/QQueryFilter";
import QQueryColumns, {PreLoadQueryColumns} from "qqq/models/query/QQueryColumns";
import FilterUtils from "qqq/utils/qqq/FilterUtils";


/*******************************************************************************
 ** Model to represent the full "view" that is active on the RecordQuery screen
 ** (and accordingly, can be saved as a saved view).
 *******************************************************************************/
export default class RecordQueryView
{
   queryFilter: QQueryFilter; // contains orderBys
   queryColumns: QQueryColumns; // contains on/off, sequence, widths, and pins
   viewIdentity: string; // url vs. saved vs. ad-hoc, plus "noncey" stuff?  not very used...
   rowsPerPage: number;
   quickFilterFieldNames: string[];
   mode: string;
   // variant?

   /*******************************************************************************
    **
    *******************************************************************************/
   constructor()
   {
   }


   /*******************************************************************************
    ** factory function - build a RecordQueryView object from JSON (string or parsed object).
    **
    ** input json is must look like if you JSON.stringify this class - that is:
    ** {queryFilter: {}, queryColumns: {}, etc...}
    *******************************************************************************/
   public static buildFromJSON = (json: string | any): RecordQueryView =>
   {
      const view = new RecordQueryView();

      if (typeof json == "string")
      {
         json = JSON.parse(json);
      }

      view.queryFilter = json.queryFilter as QQueryFilter;

      FilterUtils.stripAwayIncompleteCriteria(view.queryFilter)

      //////////////////////////////////////////////////////////////////////////////////////////
      // it's important that some criteria values exist as expression objects - so - do that. //
      //////////////////////////////////////////////////////////////////////////////////////////
      for (let i = 0; i < view.queryFilter?.criteria?.length; i++)
      {
         const criteria = view.queryFilter.criteria[i]
         for (let j = 0; j < criteria?.values?.length; j++)
         {
            const value = criteria.values[j];
            const expression = FilterUtils.gridCriteriaValueToExpression(value);
            if(expression)
            {
               criteria.values[j] = expression;
            }
         }
      }

      if(json.queryColumns)
      {
         view.queryColumns = QQueryColumns.buildFromJSON(json.queryColumns);
      }
      else
      {
         view.queryColumns = new PreLoadQueryColumns();
      }

      view.viewIdentity = json.viewIdentity;
      view.rowsPerPage = json.rowsPerPage;
      view.quickFilterFieldNames = json.quickFilterFieldNames;
      view.mode = json.mode;

      return (view);
   };

}
