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

package com.kingsrook.qqq.frontend.materialdashboard.seleniumwithqapplication.tests;


import java.io.Serializable;
import java.util.List;
import com.kingsrook.qqq.backend.core.actions.dashboard.widgets.AbstractWidgetRenderer;
import com.kingsrook.qqq.backend.core.actions.processes.BackendStep;
import com.kingsrook.qqq.backend.core.actions.tables.InsertAction;
import com.kingsrook.qqq.backend.core.actions.tables.QueryAction;
import com.kingsrook.qqq.backend.core.context.QContext;
import com.kingsrook.qqq.backend.core.exceptions.QException;
import com.kingsrook.qqq.backend.core.model.actions.processes.RunBackendStepInput;
import com.kingsrook.qqq.backend.core.model.actions.processes.RunBackendStepOutput;
import com.kingsrook.qqq.backend.core.model.actions.tables.insert.InsertInput;
import com.kingsrook.qqq.backend.core.model.actions.tables.query.QQueryFilter;
import com.kingsrook.qqq.backend.core.model.actions.tables.query.QueryInput;
import com.kingsrook.qqq.backend.core.model.actions.tables.query.QueryOutput;
import com.kingsrook.qqq.backend.core.model.actions.widgets.RenderWidgetInput;
import com.kingsrook.qqq.backend.core.model.actions.widgets.RenderWidgetOutput;
import com.kingsrook.qqq.backend.core.model.dashboard.widgets.ChildRecordListData;
import com.kingsrook.qqq.backend.core.model.dashboard.widgets.WidgetType;
import com.kingsrook.qqq.backend.core.model.data.QRecord;
import com.kingsrook.qqq.backend.core.model.metadata.QInstance;
import com.kingsrook.qqq.backend.core.model.metadata.code.QCodeReference;
import com.kingsrook.qqq.backend.core.model.metadata.dashboard.QWidgetMetaData;
import com.kingsrook.qqq.backend.core.model.metadata.processes.QBackendStepMetaData;
import com.kingsrook.qqq.backend.core.model.metadata.processes.QComponentType;
import com.kingsrook.qqq.backend.core.model.metadata.processes.QFrontendComponentMetaData;
import com.kingsrook.qqq.backend.core.model.metadata.processes.QFrontendStepMetaData;
import com.kingsrook.qqq.backend.core.model.metadata.processes.QProcessMetaData;
import com.kingsrook.qqq.backend.core.model.metadata.tables.QTableMetaData;
import com.kingsrook.qqq.frontend.materialdashboard.seleniumwithqapplication.lib.QBaseSeleniumWithQApplicationTest;
import com.kingsrook.qqq.frontend.materialdashboard.seleniumwithqapplication.metadata.PersonTableProducer;
import org.json.JSONObject;
import org.junit.jupiter.api.Test;


/*******************************************************************************
 * Test for a process that includes a RecordListWidget.
 *
 * Specifically added after a change in QFrontendCore broke rendering a widget
 * with a process, if a process value was, for example, a JSON String, due to
 * invalid URL-encoding of values that were being POST.
 *******************************************************************************/
public class ProcessWithChildRecordListWidgetIT extends QBaseSeleniumWithQApplicationTest
{
   private static final String PROCESS_NAME = "processWithChildRecordList";
   private static final String WIDGET_NAME  = "childRecordListWidget";



   /***************************************************************************
    *
    ***************************************************************************/
   @Override
   protected void customizeQInstance(QInstance qInstance) throws QException
   {
      QWidgetMetaData widget = new QWidgetMetaData()
         .withName(WIDGET_NAME)
         .withType(WidgetType.CHILD_RECORD_LIST.getType())
         .withGridColumns(12)
         .withIsCard(false)
         .withShowExportButton(false)
         .withShowReloadButton(false)
         .withCodeReference(new QCodeReference(WidgetRenderer.class));
      qInstance.addWidget(widget);

      QProcessMetaData process = new QProcessMetaData()
         .withName(PROCESS_NAME)
         .withTableName(PersonTableProducer.NAME)

         .withStep(new QBackendStepMetaData()
            .withName("setup")
            .withCode(new QCodeReference(ProcessSetupStep.class)))

         .withStep(new QFrontendStepMetaData()
            .withName("editScreen")
            .withComponent(new QFrontendComponentMetaData().withType(QComponentType.WIDGET).withValue("widgetName", widget.getName())));

      qInstance.addProcess(process);
   }



   /***************************************************************************
    *
    ***************************************************************************/
   public static class ProcessSetupStep implements BackendStep
   {
      /***************************************************************************
       *
       ***************************************************************************/
      @Override
      public void run(RunBackendStepInput runBackendStepInput, RunBackendStepOutput runBackendStepOutput) throws QException
      {
         JSONObject someJson = new JSONObject();
         someJson.put("foo", "1");
         someJson.put("bar", "2");
         runBackendStepOutput.addValue("someJson", someJson.toString());

         List<QRecord> records = QueryAction.execute(PersonTableProducer.NAME, new QQueryFilter());
         runBackendStepOutput.addValue("childRecords", (Serializable) records);
      }
   }



   /***************************************************************************
    *
    ***************************************************************************/
   public static class WidgetRenderer extends AbstractWidgetRenderer
   {
      /*******************************************************************************
       **
       *******************************************************************************/
      @Override
      public RenderWidgetOutput render(RenderWidgetInput input) throws QException
      {
         String someJson = input.getQueryParams().get("someJson");
         if(someJson != null)
         {
            new JSONObject(someJson);
         }

         QueryOutput    queryOutput = new QueryAction().execute(new QueryInput(PersonTableProducer.NAME));
         QTableMetaData table       = QContext.getQInstance().getTable(PersonTableProducer.NAME);
         String         tablePath   = QContext.getQInstance().getTablePath(PersonTableProducer.NAME);
         ChildRecordListData data = new ChildRecordListData("Children", queryOutput, table, tablePath, null, null)
            .withCanAddChildRecord(true)
            .withAllowRecordDelete(true)
            .withAllowRecordEdit(true)
            .withDisableRowClick(true)
            .withIsInProcess(true)
            .withTableName(table.getName());
         return (new RenderWidgetOutput(data));
      }
   }



   /***************************************************************************
    *
    ***************************************************************************/
   @Override
   protected void setupTestData() throws QException
   {
      new InsertAction().execute(new InsertInput(PersonTableProducer.NAME).withRecord(new QRecord().withValue("firstName", "Homer").withValue("lastName", "Simpson")));
   }



   /*******************************************************************************
    **
    *******************************************************************************/
   @Test
   void test()
   {
      qSeleniumLib.gotoAndWaitForBreadcrumbHeaderToContain("/peopleApp/greetingsApp/person/1", "Homer");
      qfmdSeleniumLib.chooseFromActionMenu("Child Record List");
      qSeleniumLib.waitForSelectorContaining(".modalProcess .widget .MuiDataGrid-root", "Homer");
   }

}
