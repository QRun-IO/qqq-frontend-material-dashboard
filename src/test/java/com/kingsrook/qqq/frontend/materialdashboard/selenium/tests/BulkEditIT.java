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

package com.kingsrook.qqq.frontend.materialdashboard.selenium.tests;


import com.kingsrook.qqq.backend.core.logging.QLogger;
import com.kingsrook.qqq.frontend.materialdashboard.selenium.lib.QBaseSeleniumTest;
import com.kingsrook.qqq.frontend.materialdashboard.selenium.lib.javalin.QSeleniumJavalin;
import org.junit.jupiter.api.Test;


/*******************************************************************************
 ** Test for the scripts table
 *******************************************************************************/
public class BulkEditIT extends QBaseSeleniumTest
{
   private static final QLogger LOG = QLogger.getLogger(BulkEditIT.class);



   /*******************************************************************************
    **
    *******************************************************************************/
   @Override
   protected void addJavalinRoutes(QSeleniumJavalin qSeleniumJavalin)
   {
      addCommonRoutesForThisTest(qSeleniumJavalin);
      qSeleniumJavalin
         .withRouteToFile("/metaData/process/person.bulkEdit", "metaData/process/person.bulkEdit.json")
         .withRouteToFile("/processes/person.bulkEdit/init", "/processes/person.bulkEdit/init.json")
         .withRouteToFile("/processes/person.bulkEdit/74a03a7d-2f53-4784-9911-3a21f7646c43/step/edit", "/processes/person.bulkEdit/step/edit.json")
         .withRouteToFile("/processes/person.bulkEdit/74a03a7d-2f53-4784-9911-3a21f7646c43/step/review", "/processes/person.bulkEdit/step/review.json")
      ;
   }



   /*******************************************************************************
    **
    *******************************************************************************/
   private void addCommonRoutesForThisTest(QSeleniumJavalin qSeleniumJavalin)
   {
      super.addJavalinRoutes(qSeleniumJavalin);
      qSeleniumJavalin.withRouteToFile("/data/person/count", "data/person/count.json");
      qSeleniumJavalin.withRouteToFile("/data/person/query", "data/person/index.json");
      qSeleniumJavalin.withRouteToFile("/data/person/variants", "data/person/variants.json");
      qSeleniumJavalin.withRouteToFile("/qqq/v1/table/person/count", "qqq/v1/table/person/count.json");
      qSeleniumJavalin.withRouteToFile("/qqq/v1/table/person/query", "qqq/v1/table/person/index.json");
      qSeleniumJavalin.withRouteToString("/processes/person.bulkEdit/74a03a7d-2f53-4784-9911-3a21f7646c43/records", "[]");
   }



   /*******************************************************************************
    **
    *******************************************************************************/
   @Test
   // @RepeatedTest(100)
   void test()
   {
      qSeleniumLib.gotoAndWaitForBreadcrumbHeaderToContain("/peopleApp/greetingsApp/person", "Person");
      qSeleniumLib.waitForSelectorContaining("button", "selection").click();
      qSeleniumLib.waitForSelectorContaining("li", "This page").click();
      qSeleniumLib.waitForSelectorContaining("div", "records on this page are selected");

      tryWait(1000);

      qSeleniumLib.waitForSelectorContaining("button", "action").click();
      qSeleniumLib.waitForSelectorContaining("li", "bulk edit").click();

      tryWait(2000);

      /////////////////
      // edit screen //
      /////////////////
      // Wait for the bulk edit form to be fully loaded
      qSeleniumLib.waitForSelectorContaining("div", "Flip the switches next to the fields");
      qSeleniumLib.waitForSelector("#bulkEditSwitch-firstName").click();
      qSeleniumLib.waitForSelector("input[name=firstName]").click();
      qSeleniumLib.waitForSelector("input[name=firstName]").sendKeys("John");
      qSeleniumLib.waitForSelectorContaining("button", "next").click();

      ///////////////////////
      // validation screen //
      ///////////////////////
      qSeleniumLib.waitForSelectorContaining("span", "How would you like to proceed").click();
      qSeleniumLib.waitForSelectorContaining("button", "next").click();

      //////////////////////////////////////////////////////////////
      // need to change the result of the 'review' step this time //
      //////////////////////////////////////////////////////////////
      qSeleniumLib.waitForSelectorContaining("div", "Person Bulk Edit: Review").click();
      qSeleniumJavalin.clearRoutes();
      qSeleniumJavalin.stop();
      addCommonRoutesForThisTest(qSeleniumJavalin);
      qSeleniumJavalin.withRouteToFile("/processes/person.bulkEdit/74a03a7d-2f53-4784-9911-3a21f7646c43/step/review", "/processes/person.bulkEdit/step/review-result.json");
      qSeleniumJavalin.restart();
      qSeleniumLib.waitForSelectorContaining("button", "submit").click();

      ///////////////////
      // result screen //
      ///////////////////
      qSeleniumLib.waitForSelectorContaining("div", "Person Bulk Edit: Result").click();
      qSeleniumLib.waitForSelectorContaining("button", "close").click();

      // qSeleniumLib.waitForever();
   }



   /***************************************************************************
    *
    ***************************************************************************/
   private void tryWait(int millis)
   {
      LOG.debug("Trying a wait...");
      qSeleniumLib.waitForMillis(millis);
      LOG.debug("Proceeding post-wait...");
   }

}
