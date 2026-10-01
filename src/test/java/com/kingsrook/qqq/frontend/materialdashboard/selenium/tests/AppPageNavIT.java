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


import com.kingsrook.qqq.frontend.materialdashboard.selenium.lib.QBaseSeleniumTest;
import com.kingsrook.qqq.frontend.materialdashboard.selenium.lib.QQQMaterialDashboardSelectors;
import com.kingsrook.qqq.frontend.materialdashboard.selenium.lib.javalin.QSeleniumJavalin;
import org.junit.jupiter.api.Test;


/*******************************************************************************
 ** Tests for app pages and high-level navigation in material dashboard
 *******************************************************************************/
public class AppPageNavIT extends QBaseSeleniumTest
{

   /*******************************************************************************
    **
    *******************************************************************************/
   @Override
   protected void addJavalinRoutes(QSeleniumJavalin qSeleniumJavalin)
   {
      super.addJavalinRoutes(qSeleniumJavalin);
      qSeleniumJavalin
         .withRouteToString("/widget/PersonsByCreateDateBarChart", "{}")
         .withRouteToString("/widget/QuickSightChartRenderer", """
            {"url": "http://www.google.com"}""")
         .withRouteToFile("/data/person/count", "data/person/count.json")
         .withRouteToFile("/data/city/count", "data/city/count.json")
         .withRouteToFile("/qqq/v1/table/person/count", "qqq/v1/table/person/count.json")
         .withRouteToFile("/qqq/v1/table/city/count", "qqq/v1/table/city/count.json");
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
   }

}
