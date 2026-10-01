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

package com.kingsrook.qqq.frontend.materialdashboard.seleniumwithqapplication.tests;


import com.kingsrook.qqq.backend.core.actions.tables.InsertAction;
import com.kingsrook.qqq.backend.core.exceptions.QException;
import com.kingsrook.qqq.backend.core.model.actions.tables.insert.InsertInput;
import com.kingsrook.qqq.backend.core.model.data.QRecord;
import com.kingsrook.qqq.backend.core.model.metadata.QInstance;
import com.kingsrook.qqq.backend.core.model.metadata.fields.QFieldMetaData;
import com.kingsrook.qqq.backend.core.model.metadata.fields.QFieldType;
import com.kingsrook.qqq.backend.core.model.metadata.tables.QTableMetaData;
import com.kingsrook.qqq.frontend.materialdashboard.selenium.lib.QQQMaterialDashboardSelectors;
import com.kingsrook.qqq.frontend.materialdashboard.seleniumwithqapplication.lib.QBaseSeleniumWithQApplicationTest;
import com.kingsrook.qqq.frontend.materialdashboard.seleniumwithqapplication.metadata.MemoryBackendProducer;
import com.kingsrook.qqq.frontend.materialdashboard.seleniumwithqapplication.metadata.PeopleAppProducer;
import com.kingsrook.qqq.frontend.materialdashboard.seleniumwithqapplication.metadata.PersonTableProducer;
import org.junit.jupiter.api.Test;


/*******************************************************************************
 ** Tests for app pages and high-level navigation in material dashboard
 *
 * Note this is a copy of {@link com.kingsrook.qqq.frontend.materialdashboard.selenium.tests.AppPageNavIT}
 * from the older mock/fixture test hierarchy.  We think this shows a better way.
 *******************************************************************************/
public class AppPageNavViaFullServerIT extends QBaseSeleniumWithQApplicationTest
{


   /***************************************************************************
    *
    ***************************************************************************/
   @Override
   protected void customizeQInstance(QInstance qInstance) throws QException
   {
      QTableMetaData cityTable = new QTableMetaData().withName("city")
         .withBackendName(MemoryBackendProducer.NAME)
         .withField(new QFieldMetaData("id", QFieldType.INTEGER))
         .withField(new QFieldMetaData("name", QFieldType.STRING))
         .withField(new QFieldMetaData("state", QFieldType.STRING))
         .withPrimaryKeyField("id");
      qInstance.addTable(cityTable);
      PeopleAppProducer.addTableToGreetingsApp(qInstance, cityTable.getName());
   }



   /***************************************************************************
    *
    ***************************************************************************/
   @Override
   protected void setupTestData() throws QException
   {
      new InsertAction().execute(new InsertInput(PersonTableProducer.NAME).withRecord(new QRecord().withValue("firstName", "Homer")));
   }



   /*******************************************************************************
    **
    *******************************************************************************/
   @Test
   void testHomeToAppPageViaLeftNav()
   {
      qSeleniumLib.gotoAndWaitForBreadcrumbHeaderToContain("/", "Greetings App");
      qSeleniumLib.waitForSelectorContaining(QQQMaterialDashboardSelectors.SIDEBAR_ITEM, "People App").click();
      qSeleniumLib.waitForSelectorContaining(QQQMaterialDashboardSelectors.SIDEBAR_ITEM, "Greetings App").click();
      qSeleniumLib.tryMultiple(3, () -> qSeleniumLib.waitForSelectorContaining("a", "City").click());
   }



   /*******************************************************************************
    **
    *******************************************************************************/
   @Test
   void testAppPageToTablePage()
   {
      qSeleniumLib.gotoAndWaitForBreadcrumbHeaderToContain("/peopleApp/greetingsApp", "Greetings App");
      qSeleniumLib.tryMultiple(3, () -> qSeleniumLib.waitForSelectorContaining("a", "Person").click());
      qSeleniumLib.waitForSelectorContaining(QQQMaterialDashboardSelectors.BREADCRUMB_HEADER, "Person");
      qSeleniumLib.waitForSelectorContaining(".recordQuery", "Homer");
   }

}
