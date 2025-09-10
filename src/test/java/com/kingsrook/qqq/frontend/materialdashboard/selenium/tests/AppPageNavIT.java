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
