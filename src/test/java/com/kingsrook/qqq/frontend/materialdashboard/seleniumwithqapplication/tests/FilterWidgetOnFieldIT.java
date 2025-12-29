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


import java.util.List;
import com.kingsrook.qqq.backend.core.actions.dashboard.widgets.AbstractWidgetRenderer;
import com.kingsrook.qqq.backend.core.actions.tables.InsertAction;
import com.kingsrook.qqq.backend.core.exceptions.QException;
import com.kingsrook.qqq.backend.core.model.actions.tables.insert.InsertInput;
import com.kingsrook.qqq.backend.core.model.actions.widgets.RenderWidgetInput;
import com.kingsrook.qqq.backend.core.model.actions.widgets.RenderWidgetOutput;
import com.kingsrook.qqq.backend.core.model.dashboard.widgets.FilterAndColumnsSetupData;
import com.kingsrook.qqq.backend.core.model.dashboard.widgets.WidgetType;
import com.kingsrook.qqq.backend.core.model.data.QRecord;
import com.kingsrook.qqq.backend.core.model.metadata.QInstance;
import com.kingsrook.qqq.backend.core.model.metadata.code.QCodeReference;
import com.kingsrook.qqq.backend.core.model.metadata.dashboard.QWidgetMetaData;
import com.kingsrook.qqq.backend.core.model.metadata.fields.AdornmentType;
import com.kingsrook.qqq.backend.core.model.metadata.fields.FieldAdornment;
import com.kingsrook.qqq.backend.core.model.metadata.fields.QFieldMetaData;
import com.kingsrook.qqq.backend.core.model.metadata.fields.QFieldType;
import com.kingsrook.qqq.backend.core.model.metadata.layout.QIcon;
import com.kingsrook.qqq.backend.core.model.metadata.tables.QFieldSection;
import com.kingsrook.qqq.backend.core.model.metadata.tables.QTableMetaData;
import com.kingsrook.qqq.backend.core.model.metadata.tables.Tier;
import com.kingsrook.qqq.frontend.materialdashboard.junit.TestUtils;
import com.kingsrook.qqq.frontend.materialdashboard.selenium.lib.QueryScreenLib;
import com.kingsrook.qqq.frontend.materialdashboard.seleniumwithqapplication.lib.QBaseSeleniumWithQApplicationTest;
import com.kingsrook.qqq.frontend.materialdashboard.seleniumwithqapplication.metadata.MemoryBackendProducer;
import com.kingsrook.qqq.frontend.materialdashboard.seleniumwithqapplication.metadata.PeopleAppProducer;
import com.kingsrook.qqq.frontend.materialdashboard.seleniumwithqapplication.metadata.PersonTableProducer;
import org.junit.jupiter.api.Test;


/*******************************************************************************
 * Tests for using a filter widget on a field.
 *******************************************************************************/
public class FilterWidgetOnFieldIT extends QBaseSeleniumWithQApplicationTest
{
   private static final String TABLE_NAME = "tableWithFilterField";



   /***************************************************************************
    *
    ***************************************************************************/
   @Override
   protected void customizeQInstance(QInstance qInstance) throws QException
   {
      QWidgetMetaData widget = new QWidgetMetaData()
         .withName("someFilterWidget")
         .withLabel("Filter")
         .withIsCard(false)
         .withType(WidgetType.FILTER_AND_COLUMNS_SETUP.getType())
         .withCodeReference(new QCodeReference(FilterWidgetRenderer.class));
      qInstance.addWidget(widget);

      QTableMetaData table = new QTableMetaData()
         .withName(TABLE_NAME)
         .withBackendName(MemoryBackendProducer.NAME)
         .withField(new QFieldMetaData("id", QFieldType.INTEGER).withIsEditable(false))
         .withField(new QFieldMetaData("name", QFieldType.STRING).withIsRequired(true))
         .withField(new QFieldMetaData("filterJSON", QFieldType.STRING).withLabel("Person Filter")
            .withGridColumns(12)
            .withFieldAdornment(new FieldAdornment(AdornmentType.WIDGET)
               .withValue(AdornmentType.WidgetValues.WIDGET_NAME, widget.getName())))
         .withSection(new QFieldSection("identity", new QIcon(), Tier.T1, List.of("id", "name")))
         .withSection(new QFieldSection("filter", new QIcon(), Tier.T2, List.of("filterJSON")))
         .withPrimaryKeyField("id");

      qInstance.addTable(table);
      PeopleAppProducer.addTableToGreetingsApp(qInstance, table.getName());
   }

   /***************************************************************************
    *
    ***************************************************************************/
   @Override
   protected void setupTestData() throws QException
   {
      new InsertAction().execute(new InsertInput(PersonTableProducer.NAME).withRecords(List.of(
         new QRecord().withValue("firstName", "Darin").withValue("lastName", "Kelkhoff"),
         new QRecord().withValue("firstName", "Jean-Luc").withValue("lastName", "Picard")
      )));
   }


   /***************************************************************************
    *
    ***************************************************************************/
   public static class FilterWidgetRenderer extends AbstractWidgetRenderer
   {
      /*******************************************************************************
       **
       *******************************************************************************/
      @Override
      public RenderWidgetOutput render(RenderWidgetInput input) throws QException
      {
         return (new RenderWidgetOutput(new FilterAndColumnsSetupData(TestUtils.TABLE_NAME_PERSON, false, true, null)));
      }
   }



   /*******************************************************************************
    **
    *******************************************************************************/
   @Test
   void test()
   {
      QueryScreenLib queryScreenLib = new QueryScreenLib(qSeleniumLib);

      qSeleniumLib.gotoAndWaitForBreadcrumbHeaderToContain("/peopleApp/greetingsApp/" + TABLE_NAME + "/create", "Creating New");

      qfmdSeleniumLib.inputTextField("name", "Filter for Darin's");

      qSeleniumLib.waitForSelectorContaining("button", "Edit Filters").click();
      qfmdSeleniumLib.waitForQueryScreenPaginationValues(1, 2, 2);
      queryScreenLib.setBasicFilter("First Name", "equals", "Darin");
      qfmdSeleniumLib.waitForQueryScreenPaginationValues(1, 1, 1);
      qfmdSeleniumLib.clickOkButton();

      qSeleniumLib.waitForSelectorContaining(".advancedQueryString", "First Name equals Darin");
      qfmdSeleniumLib.clickSaveButton();

      qfmdSeleniumLib.waitForViewScreenFieldValue("Person Filter", """
            {"criteria":[{"fieldName":"firstName","operator":"EQUALS","values":["Darin"]""");

      qfmdSeleniumLib.chooseFromActionMenu("Edit");

      qSeleniumLib.waitForSelectorContaining(".advancedQueryString", "First Name equals Darin");
      qSeleniumLib.waitForSelectorContaining("button", "Edit Filters").click();
      qfmdSeleniumLib.waitForQueryScreenPaginationValues(1, 1, 1);
      queryScreenLib.clickQuickFilterClearIcon("firstName");
      qfmdSeleniumLib.waitForQueryScreenPaginationValues(1, 2, 2);
      qfmdSeleniumLib.clickOkButton();

      qSeleniumLib.waitForSelectorContainingToNotExist(".advancedQueryString", "First Name equals Darin");
      qfmdSeleniumLib.clickSaveButton();

      qfmdSeleniumLib.waitForViewScreenFieldValue("Person Filter", """
            {"criteria":[]""");
   }

}
