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

package com.kingsrook.qqq.frontend.materialdashboard.selenium.tests.query;


import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import com.kingsrook.qqq.frontend.materialdashboard.selenium.lib.QBaseSeleniumTest;
import com.kingsrook.qqq.frontend.materialdashboard.selenium.lib.QueryScreenLib;
import com.kingsrook.qqq.frontend.materialdashboard.selenium.lib.javalin.CapturedContext;
import com.kingsrook.qqq.frontend.materialdashboard.selenium.lib.javalin.QSeleniumJavalin;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.WebElement;
import static org.junit.jupiter.api.Assertions.assertTrue;


/*******************************************************************************
 ** Test for Saved View functionality on the Query screen.
 *******************************************************************************/
public class SavedViewsIT extends QBaseSeleniumTest
{

   /*******************************************************************************
    **
    *******************************************************************************/
   @Override
   protected void addJavalinRoutes(QSeleniumJavalin qSeleniumJavalin)
   {
      addStandardRoutesForThisTest(qSeleniumJavalin);
   }



   /*******************************************************************************
    **
    *******************************************************************************/
   private void addStandardRoutesForThisTest(QSeleniumJavalin qSeleniumJavalin)
   {
      super.addJavalinRoutes(qSeleniumJavalin);
      qSeleniumJavalin.withRouteToFile("/data/person/count", "data/person/count.json");
      qSeleniumJavalin.withRouteToFile("/data/person/query", "data/person/index.json");
      qSeleniumJavalin.withRouteToFile("/qqq/v1/table/person/count", "qqq/v1/table/person/count.json");
      qSeleniumJavalin.withRouteToFile("/qqq/v1/table/person/query", "qqq/v1/table/person/index.json");
      qSeleniumJavalin.withRouteToFile("/data/person/*", "data/person/1701.json");
   }



   /*******************************************************************************
    **
    *******************************************************************************/
   @Test
   void testNavigatingBackAndForth()
   {
      QueryScreenLib queryScreenLib = new QueryScreenLib(qSeleniumLib);

      qSeleniumLib.gotoAndWaitForBreadcrumbHeaderToContain("/peopleApp/greetingsApp/person", "Person");

      qSeleniumLib.waitForSelectorContaining("BUTTON", "Views").click();
      qSeleniumLib.waitForSelectorContaining("LI", "Some People");

      ////////////////////////////////////////
      // need to only return id=2 next time //
      ////////////////////////////////////////
      qSeleniumJavalin.stop();
      qSeleniumJavalin.clearRoutes();
      addStandardRoutesForThisTest(qSeleniumJavalin);
      qSeleniumJavalin.withRouteToFile("/processes/querySavedView/init", "processes/querySavedView/init-id=2.json");
      qSeleniumJavalin.restart();

      /////////////////////////////////////////////////////
      // go to a specific view - assert that it's loaded //
      /////////////////////////////////////////////////////
      qSeleniumLib.waitForSelectorContaining("LI", "Some People").click();
      qSeleniumLib.waitForCondition("Current URL should have view id", () -> driver.getCurrentUrl().endsWith("/person/savedView/2"));
      queryScreenLib.assertSavedViewNameOnScreen("Some People");

      //////////////////////////////
      // click into a view screen //
      //////////////////////////////
      qSeleniumLib.waitForSeconds(1); // wait for the filters menu to fully disappear?  if this doesn't work, try a different word to look for...
      queryScreenLib.waitForDataGridCellContaining("jdoe@kingsrook.com").click();
      qSeleniumLib.waitForSelectorContaining("H5", "Viewing Person: John Doe");

      ///////////////////////////////////////////////////
      // take breadcrumb back to table query           //
      // assert the previously selected View is loaded //
      ///////////////////////////////////////////////////
      qSeleniumLib.waitForSelectorContaining("A", "Person").click();
      qSeleniumLib.waitForCondition("Current URL should have View id", () -> driver.getCurrentUrl().endsWith("/person/savedView/2"));
      queryScreenLib.assertSavedViewNameOnScreen("Some People");
      queryScreenLib.assertQuickFilterButtonIndicatesActiveFilter("firstName");

      //////////////////////
      // modify the query //
      //////////////////////
      queryScreenLib.clickQuickFilterButton("lastName");
      WebElement valueInput = qSeleniumLib.waitForSelector(".filterValuesColumn INPUT");
      valueInput.click();
      valueInput.sendKeys("Kelkhoff");
      qSeleniumLib.waitForMillis(1000);

      qSeleniumLib.clickBackdrop();
      qSeleniumLib.waitForSelectorContaining("DIV", "Unsaved Change");

      //////////////////////////////
      // click into a view screen //
      //////////////////////////////
      queryScreenLib.waitForDataGridCellContaining("jdoe@kingsrook.com").click();
      qSeleniumLib.waitForSelectorContaining("H5", "Viewing Person: John Doe");

      ///////////////////////////////////////////////////////////////////////////////
      // take breadcrumb back to table query                                       //
      // assert the previously selected filter, with modification, is still loaded //
      ///////////////////////////////////////////////////////////////////////////////
      qSeleniumJavalin.beginCapture();
      qSeleniumLib.waitForSelectorContaining("A", "Person").click();
      qSeleniumLib.waitForCondition("Current URL should have filter id", () -> driver.getCurrentUrl().endsWith("/person/savedView/2"));
      queryScreenLib.assertSavedViewNameOnScreen("Some People");
      qSeleniumLib.waitForSelectorContaining("DIV", "Unsaved Change");
      CapturedContext capturedContext = qSeleniumJavalin.waitForCapturedPath("/qqq/v1/table/person/query");
      assertTrue(capturedContext.getBody().contains("Kelkhoff"));
      qSeleniumJavalin.endCapture();

      //////////////////////////////////////////////////
      // navigate to the table with a View in the URL //
      //////////////////////////////////////////////////
      String filter = """
         {"criteria":[{"fieldName":"id", "operator":"LESS_THAN", "values":[10]}]}
         """.replace('\n', ' ').replaceAll(" ", "");
      qSeleniumLib.gotoAndWaitForBreadcrumbHeaderToContain("/peopleApp/greetingsApp/person?filter=" + URLEncoder.encode(filter, StandardCharsets.UTF_8), "Person");
      qSeleniumLib.waitForSelectorContaining("BUTTON", "Save View As");

      //////////////////////////////
      // click into a view screen //
      //////////////////////////////
      queryScreenLib.waitForDataGridCellContaining("jdoe@kingsrook.com").click();
      qSeleniumLib.waitForSelectorContaining("H5", "Viewing Person: John Doe");

      /////////////////////////////////////////////////////////////////////////////////
      // take breadcrumb back to table query                                         //
      // assert the filter previously given on the URL is what is loaded & requested //
      /////////////////////////////////////////////////////////////////////////////////
      qSeleniumJavalin.beginCapture();
      qSeleniumLib.waitForSelectorContaining("A", "Person").click();
      qSeleniumLib.waitForCondition("Current URL should not have filter id", () -> !driver.getCurrentUrl().endsWith("/person/savedView/2"));
      qSeleniumLib.waitForSelectorContaining("BUTTON", "Save View As");
      capturedContext = qSeleniumJavalin.waitForCapturedPath("/qqq/v1/table/person/query");
      assertTrue(capturedContext.getBody().matches("(?s).*id.*LESS_THAN.*10.*"));
      qSeleniumJavalin.endCapture();
   }

}
