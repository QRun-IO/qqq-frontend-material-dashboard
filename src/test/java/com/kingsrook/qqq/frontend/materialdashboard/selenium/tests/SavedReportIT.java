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


import java.util.List;
import com.kingsrook.qqq.frontend.materialdashboard.selenium.lib.QBaseSeleniumTest;
import com.kingsrook.qqq.frontend.materialdashboard.selenium.lib.QSeleniumLib;
import com.kingsrook.qqq.frontend.materialdashboard.selenium.lib.QueryScreenLib;
import com.kingsrook.qqq.frontend.materialdashboard.selenium.lib.javalin.QSeleniumJavalin;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.Keys;
import org.openqa.selenium.WebElement;
import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;


/*******************************************************************************
 ** Test for Saved Report screen (table has some special behaviors)
 *******************************************************************************/
public class SavedReportIT extends QBaseSeleniumTest
{

   /*******************************************************************************
    **
    *******************************************************************************/
   @Override
   protected void addJavalinRoutes(QSeleniumJavalin qSeleniumJavalin)
   {
      super.addJavalinRoutes(qSeleniumJavalin);
      qSeleniumJavalin
         .withRouteToFile("/metaData/table/savedReport", "metaData/table/savedReport.json")
         .withRouteToFile("/qqq/v1/metaData/table/savedReport", "qqq/v1/metaData/table/savedReport.json")
         .withRouteToFile("/widget/reportSetupWidget", "widget/reportSetupWidget.json")
         .withRouteToFile("/widget/pivotTableSetupWidget", "widget/pivotTableSetupWidget.json")
         .withRouteToFile("/data/savedReport/possibleValues/tableName", "data/savedReport/possibleValues/tableName.json")

         .withRouteToFile("/data/person/count", "data/person/count.json")
         .withRouteToFile("/data/person/query", "data/person/index.json")
         .withRouteToFile("/qqq/v1/table/person/count", "qqq/v1/table/person/count.json")
         .withRouteToFile("/qqq/v1/table/person/query", "qqq/v1/table/person/index.json")
      ;
   }



   /*******************************************************************************
    **
    *******************************************************************************/
   @Test
   void testCreate()
   {
      qSeleniumLib.gotoAndWaitForBreadcrumbHeaderToContain("/userCustomizations/savedReport/create", "Creating New Saved Report");

      //////////////////////////////////////////////////////////////
      // make sure things are disabled before a table is selected //
      //////////////////////////////////////////////////////////////
      WebElement webElement = qSeleniumLib.waitForSelectorContaining("button", "Edit Filters and Columns");
      assertEquals("true", webElement.getAttribute("disabled"));

      qSeleniumLib.waitForSelector("#label").click();
      qSeleniumLib.waitForSelector("#label").sendKeys("My Report");

      qSeleniumLib.waitForSelector("#tableName").click();
      qSeleniumLib.waitForSelector("#tableName").sendKeys("Person" + Keys.DOWN + Keys.ENTER);

      //////////////////////////////////
      // make sure things enabled now //
      //////////////////////////////////
      webElement = qSeleniumLib.waitForSelectorContaining("button", "Edit Filters and Columns");
      assertNull(webElement.getAttribute("disabled"));

      ////////////////////////////////////////////////////
      // open query-screen popup, wait for query to run //
      ////////////////////////////////////////////////////
      qSeleniumJavalin.beginCapture();
      qSeleniumLib.waitForSelectorContaining("button", "Edit Filters and Columns").click();
      qSeleniumJavalin.waitForCapturedPath("/qqq/v1/table/person/count");
      qSeleniumJavalin.waitForCapturedPath("/qqq/v1/table/person/query");
      qSeleniumJavalin.endCapture();

      QueryScreenLib queryScreenLib = new QueryScreenLib(qSeleniumLib);
      queryScreenLib.setBasicFilter("First Name", "contains", "Darin");

      ////////////////////////
      // close query screen //
      ////////////////////////
      qSeleniumLib.waitForSelectorContaining("button", "OK").click();

      //////////////////////////////////////////////////////
      // make sure query things appear on edit screen now //
      //////////////////////////////////////////////////////
      qSeleniumLib.waitForSelectorContaining(".advancedQueryString", "First Name");
      qSeleniumLib.waitForSelectorContaining(".advancedQueryString", "contains");
      qSeleniumLib.waitForSelectorContaining(".advancedQueryString", "Darin");
      List<WebElement> columns = qSeleniumLib.waitForSelectorContaining("h5", "Columns")
         .findElement(QSeleniumLib.PARENT)
         .findElements(By.cssSelector("DIV"));

      assertThat(columns)
         .hasSizeGreaterThanOrEqualTo(5) // at least this many
         .anyMatch(we -> we.getText().equals("Home City")); // a few fields are found

      ///////////////////
      // turn on pivot //
      ///////////////////
      qSeleniumLib.waitForSelectorContaining("label", "Use Pivot Table").click();
      qSeleniumLib.waitForSelectorContaining("button", "Edit Pivot Table").click();
      qSeleniumLib.waitForSelectorContaining("h3", "Edit Pivot Table");

      ///////////////
      // add a row //
      ///////////////
      qSeleniumLib.waitForSelectorContaining(".MuiModal-root button", "Add new row").click();
      WebElement row0Input = qSeleniumLib.waitForSelector("#rows-0");
      row0Input.click();
      row0Input.sendKeys("Last Name" + Keys.ENTER);

      //////////////////
      // add a column //
      //////////////////
      qSeleniumLib.waitForSelectorContaining(".MuiModal-root button", "Add new column").click();
      WebElement column0Input = qSeleniumLib.waitForSelector("#columns-0");
      column0Input.click();
      column0Input.sendKeys("Home City" + Keys.ENTER);

      /////////////////
      // add a value //
      /////////////////
      qSeleniumLib.waitForSelectorContaining(".MuiModal-root button", "Add new value").click();
      WebElement value0Input = qSeleniumLib.waitForSelector("#values-field-0");
      value0Input.click();
      value0Input.sendKeys("Id" + Keys.ENTER);

      /////////////////////////////////////////
      // try to submit - but expect an error //
      /////////////////////////////////////////
      qSeleniumLib.waitForSelectorContaining("button", "OK").click();
      qSeleniumLib.waitForSelectorContaining(".MuiAlert-standard", "Missing value in 1 field.").click();

      ///////////////////////////
      // now select a function //
      ///////////////////////////
      WebElement function0Input = qSeleniumLib.waitForSelector("#values-function-0");
      function0Input.click();
      function0Input.sendKeys("Count" + Keys.ENTER);

      qSeleniumLib.waitForSelectorContaining("button", "OK").click();
      qSeleniumLib.waitForSelectorContainingToNotExist("h3", "Edit Pivot Table");

      // qSeleniumLib.waitForever();
   }

}
