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
import com.kingsrook.qqq.frontend.materialdashboard.selenium.lib.javalin.QSeleniumJavalin;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.assertTrue;


/*******************************************************************************
 ** Test for Associated Record Scripts functionality.
 *******************************************************************************/
public class AssociatedRecordScriptIT extends QBaseSeleniumTest
{

   /*******************************************************************************
    **
    *******************************************************************************/
   @Override
   protected void addJavalinRoutes(QSeleniumJavalin qSeleniumJavalin)
   {
      super.addJavalinRoutes(qSeleniumJavalin);
      qSeleniumJavalin.withRouteToFile("/data/person/1", "data/person/1701.json");
      qSeleniumJavalin.withRouteToFile("/data/person/1/developer", "data/person/developer.json");
   }



   /*******************************************************************************
    **
    *******************************************************************************/
   @Test
   void testNavigatingBackAndForth()
   {
      qSeleniumLib.gotoAndWaitForBreadcrumbHeaderToContain("/peopleApp/greetingsApp/person/1", "John Doe");
      qSeleniumLib.waitForSelectorContaining("BUTTON", "actions").click();
      
      qSeleniumLib.waitForSelectorContaining("LI", "Developer Mode").click();
      assertTrue(qSeleniumLib.driver.getCurrentUrl().endsWith("/1/dev"));

      // qSeleniumLib.waitForever();
   }

}
