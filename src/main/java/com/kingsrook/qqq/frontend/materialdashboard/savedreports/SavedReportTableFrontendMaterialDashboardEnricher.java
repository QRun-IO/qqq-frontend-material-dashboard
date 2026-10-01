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

package com.kingsrook.qqq.frontend.materialdashboard.savedreports;


import java.util.List;
import com.kingsrook.qqq.backend.core.model.metadata.tables.QTableMetaData;
import com.kingsrook.qqq.frontend.materialdashboard.model.metadata.MaterialDashboardTableMetaData;
import com.kingsrook.qqq.frontend.materialdashboard.model.metadata.fieldrules.FieldRule;
import com.kingsrook.qqq.frontend.materialdashboard.model.metadata.fieldrules.FieldRuleAction;
import com.kingsrook.qqq.frontend.materialdashboard.model.metadata.fieldrules.FieldRuleTrigger;


/*******************************************************************************
 ** Add frontend material dashboard enhacements to saved report table
 *******************************************************************************/
public class SavedReportTableFrontendMaterialDashboardEnricher
{

   /*******************************************************************************
    **
    *******************************************************************************/
   public static void enrich(QTableMetaData tableMetaData)
   {
      MaterialDashboardTableMetaData materialDashboardTableMetaData = MaterialDashboardTableMetaData.ofOrWithNew(tableMetaData);

      /////////////////////////////////////////////////////////////////////////
      // make changes to the tableName field clear the value in these fields //
      /////////////////////////////////////////////////////////////////////////
      for(String targetField : List.of("queryFilterJson", "columnsJson", "pivotTableJson"))
      {
         materialDashboardTableMetaData.withFieldRule(new FieldRule()
            .withSourceField("tableName")
            .withTrigger(FieldRuleTrigger.ON_CHANGE)
            .withAction(FieldRuleAction.CLEAR_TARGET_FIELD)
            .withTargetField(targetField));
      }
   }

}
