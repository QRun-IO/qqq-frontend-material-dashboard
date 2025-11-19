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
import com.kingsrook.qqq.backend.core.actions.tables.InsertAction;
import com.kingsrook.qqq.backend.core.exceptions.QException;
import com.kingsrook.qqq.backend.core.model.actions.tables.insert.InsertInput;
import com.kingsrook.qqq.backend.core.model.data.QRecord;
import com.kingsrook.qqq.backend.core.model.metadata.QInstance;
import com.kingsrook.qqq.backend.core.model.savedviews.SavedViewsMetaDataProvider;
import com.kingsrook.qqq.frontend.materialdashboard.selenium.lib.QueryScreenLib;
import com.kingsrook.qqq.frontend.materialdashboard.seleniumwithqapplication.lib.QBaseSeleniumWithQApplicationTest;
import com.kingsrook.qqq.frontend.materialdashboard.seleniumwithqapplication.metadata.MemoryBackendProducer;
import com.kingsrook.qqq.frontend.materialdashboard.seleniumwithqapplication.metadata.PersonTableProducer;
import org.junit.jupiter.api.Test;


/*******************************************************************************
 ** Tests for query screen
 *
 *******************************************************************************/
public class QueryScreenIT extends QBaseSeleniumWithQApplicationTest
{

   /***************************************************************************
    *
    ***************************************************************************/
   @Override
   protected void customizeQInstance(QInstance qInstance) throws QException
   {
      new SavedViewsMetaDataProvider().defineAll(qInstance, MemoryBackendProducer.NAME, null);
   }



   /***************************************************************************
    *
    ***************************************************************************/
   @Override
   protected void setupTestData() throws QException
   {
      new InsertAction().execute(new InsertInput(PersonTableProducer.NAME).withRecords(List.of(
         new QRecord().withValue("firstName", "Homer").withValue("lastName", "Simpson").withValue("isAlive", true),
         new QRecord().withValue("firstName", "Abraham").withValue("lastName", "Simpson").withValue("isAlive", true),
         new QRecord().withValue("firstName", "Abraham").withValue("lastName", "Lincoln").withValue("isAlive", false))
      ));
   }



   /*******************************************************************************
    * regression, where a saved view's filter would be stripped away if it was
    * boolean 'equals no' (due to a == "" in js instead of ===)
    *
    * todo - we'd like to assert before and after saving the filter that the row
    *  count is 1, but at the time of this writing, qqq memory backend has a bug with
    *  boolean filters w/ string criteria (which qfmd always submits).
    *  so, in the mean time, just assert about the quick filter button being active
    *  with the string "no" in it
    *******************************************************************************/
   @Test
   void testSaveFilterWithBooleanEqualsFalse()
   {
      qSeleniumLib.gotoAndWaitForBreadcrumbHeaderToContain("/peopleApp/greetingsApp/person", "Person");
      QueryScreenLib queryScreenLib = new QueryScreenLib(qSeleniumLib);

      queryScreenLib.setBasicFilter("First Name", "equals", "Abraham");
      qfmdSeleniumLib.waitForQueryScreenPaginationToContain("Showing 1 to 2 of 2");

      queryScreenLib.addBasicFilter("Is Alive");
      queryScreenLib.setBasicBooleanFilter("Is Alive", "equals no");

      // todo pending boolean memory filter bug qfmdSeleniumLib.waitForQueryScreenPaginationToContain("Showing 1 to 1 of 1");
      qSeleniumLib.waitForSelectorContaining("button.filterActive", "no");

      qSeleniumLib.waitForSelectorContaining("button", "Save View As").click();
      qSeleniumLib.waitForSelector(".MuiDialogContent-root input").sendKeys("dead Abrahams");
      qSeleniumLib.waitForSelectorContaining(".MuiDialogActions-root button", "Save").click();
      qfmdSeleniumLib.waitForPageHeaderToContain("dead Abrahams");

      // todo pending boolean memory filter bug qfmdSeleniumLib.waitForQueryScreenPaginationToContain("Showing 1 to 1 of 1");
      qSeleniumLib.waitForSelectorContaining("button.filterActive", "no");
   }

}
