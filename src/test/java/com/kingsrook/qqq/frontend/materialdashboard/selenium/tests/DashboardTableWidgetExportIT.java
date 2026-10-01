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

package com.kingsrook.qqq.frontend.materialdashboard.selenium.tests;


import java.io.File;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import com.kingsrook.qqq.frontend.materialdashboard.selenium.lib.QBaseSeleniumTest;
import com.kingsrook.qqq.frontend.materialdashboard.selenium.lib.QSeleniumLib;
import com.kingsrook.qqq.frontend.materialdashboard.selenium.lib.javalin.QSeleniumJavalin;
import org.apache.commons.io.FileUtils;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.By;
import static org.junit.jupiter.api.Assertions.assertEquals;


/*******************************************************************************
 ** Tests for dashboard table widget with export button
 *******************************************************************************/
public class DashboardTableWidgetExportIT extends QBaseSeleniumTest
{

   /*******************************************************************************
    **
    *******************************************************************************/
   @Override
   protected void addJavalinRoutes(QSeleniumJavalin qSeleniumJavalin)
   {
      super.addJavalinRoutes(qSeleniumJavalin);
      qSeleniumJavalin
         .withRouteToFile("/data/person/count", "data/person/count.json")
         .withRouteToFile("/data/city/count", "data/city/count.json");

      qSeleniumJavalin.withRouteToString("/widget/SampleTableWidget", """
         {
            "label": "Sample Table Widget",
            "footerHTML": "<span class='material-icons-round notranslate MuiIcon-root MuiIcon-fontSizeInherit' aria-hidden='true'><span class='dashboard-schedule-icon'>schedule</span></span>Updated at 2023-10-17 09:11:38 AM CDT",
            "columns": [
                { "type": "html", "header": "Id", "accessor": "id", "width": "30px" },
                { "type": "html", "header": "Name", "accessor": "name", "width": "1fr" }
            ],
            "rows": [
                { "id": "1", "name": "<a href='/setup/person/1'>Homer S.</a>" },
                { "id": "2", "name": "<a href='/setup/person/2'>Marge B.</a>" },
                { "id": "3", "name": "<a href='/setup/person/3'>Bart J.</a>" }
            ],
            "type": "table"
         }
         """);
   }



   /*******************************************************************************
    **
    *******************************************************************************/
   @Test
   void testDashboardTableWidgetExport() throws IOException
   {
      qSeleniumLib.gotoAndWaitForBreadcrumbHeaderToContain("/", "Greetings App");

      ////////////////////////////////////////////////////////////////////////
      // assert that the table widget rendered its header and some contents //
      ////////////////////////////////////////////////////////////////////////
      qSeleniumLib.waitForSelectorContaining("#SampleTableWidget h6", "Sample Table Widget");
      qSeleniumLib.waitForSelectorContaining("#SampleTableWidget a", "Homer S.");
      qSeleniumLib.waitForSelectorContaining("#SampleTableWidget div", "Updated at 2023-10-17 09:11:38 AM CDT");

      /////////////////////////////
      // click the export button //
      /////////////////////////////
      qSeleniumLib.waitForSelector("#SampleTableWidget h6")
         .findElement(QSeleniumLib.PARENT)
         .findElement(By.cssSelector("button"))
         .click();

      qSeleniumLib.waitForCondition("Should have downloaded 1 file", () -> getDownloadedFiles().size() == 1);
      qSeleniumLib.waitForCondition("Expected file name", () -> getDownloadedFiles().get(0).getName().matches("Sample Table Widget.*.csv"));
      File csvFile = getDownloadedFiles().get(0);
      String fileContents = FileUtils.readFileToString(csvFile, StandardCharsets.UTF_8);
      assertEquals("""
         "Id","Name"
         "1","Homer S."
         "2","Marge B."
         "3","Bart J."
         """, fileContents);

      // qSeleniumLib.waitForever();
   }

}
