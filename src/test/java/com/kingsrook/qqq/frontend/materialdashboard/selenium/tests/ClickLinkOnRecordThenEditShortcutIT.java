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
import com.kingsrook.qqq.frontend.materialdashboard.selenium.lib.javalin.QSeleniumJavalin;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.assertTrue;


/*******************************************************************************
 ** Test that goes to a record, clicks a link for another record, then
 ** hits 'e' on keyboard to edit the second record - and confirms that we're
 ** on the edit url for the second record, not the first (a former bug).
 *******************************************************************************/
public class ClickLinkOnRecordThenEditShortcutIT extends QBaseSeleniumTest
{

   /*******************************************************************************
    **
    *******************************************************************************/
   @Override
   protected void addJavalinRoutes(QSeleniumJavalin qSeleniumJavalin)
   {
      super.addJavalinRoutes(qSeleniumJavalin);
      qSeleniumJavalin.withRouteToFile("/data/script/1", "data/script/1.json");
      qSeleniumJavalin.withRouteToFile("/data/scriptRevision/100", "data/scriptRevision/100.json");
   }



   /*******************************************************************************
    **
    *******************************************************************************/
   @Test
   void testClickLinkOnRecordThenEditShortcutTest()
   {
      qSeleniumLib.gotoAndWaitForBreadcrumbHeaderToContain("/developer/script/1", "Hello, Script");
      qSeleniumLib.waitForSelectorContaining("A", "100").click();

      qSeleniumLib.waitForSelectorContaining("BUTTON", "actions").sendKeys("e");
      assertTrue(qSeleniumLib.driver.getCurrentUrl().endsWith("/scriptRevision/100/edit"));
   }

}
