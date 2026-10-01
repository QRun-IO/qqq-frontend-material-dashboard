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


/*******************************************************************************
 ** Test for the scripts table
 *******************************************************************************/
public class ScriptTableIT extends QBaseSeleniumTest
{

   /*******************************************************************************
    **
    *******************************************************************************/
   @Override
   protected void addJavalinRoutes(QSeleniumJavalin qSeleniumJavalin)
   {
      super.addJavalinRoutes(qSeleniumJavalin);
      qSeleniumJavalin
         .withRouteToFile("/data/script/1", "data/script/1.json")
         .withRouteToFile("/data/scriptType/1", "data/scriptType/1.json")
         .withRouteToFile("/data/scriptRevision/query", "data/scriptRevision/query.json")
         .withRouteToFile("/data/scriptLog/query", "data/scriptLog/query.json")
         .withRouteToFile("/data/scriptRevision/100", "data/scriptRevision/100.json")
         .withRouteToFile("/metaData/table/script", "metaData/table/script.json")
         .withRouteToFile("/widget/scriptViewer", "widget/scriptViewer.json")
      ;
   }



   /*******************************************************************************
    **
    *******************************************************************************/
   @Test
   void test()
   {
      qSeleniumLib.gotoAndWaitForBreadcrumbHeaderToContain("/developer/script/1", "Hello, Script");

      qSeleniumLib.waitForSelectorContaining("DIV.ace_line", "var hello;");
      qSeleniumLib.waitForSelectorContaining("DIV", "2nd commit");
      qSeleniumLib.waitForSelectorContaining("DIV", "Initial checkin");
   }

}
