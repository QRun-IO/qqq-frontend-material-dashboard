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


import java.util.List;
import com.kingsrook.qqq.frontend.materialdashboard.selenium.lib.QBaseSeleniumTest;
import com.kingsrook.qqq.frontend.materialdashboard.selenium.lib.javalin.CapturedContext;
import com.kingsrook.qqq.frontend.materialdashboard.selenium.lib.javalin.QSeleniumJavalin;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.WebElement;
import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertEquals;


/*******************************************************************************
 ** Test for the audit screen (e.g., modal)
 *******************************************************************************/
public class AuditIT extends QBaseSeleniumTest
{

   /*******************************************************************************
    **
    *******************************************************************************/
   @Override
   protected void addJavalinRoutes(QSeleniumJavalin qSeleniumJavalin)
   {
      super.addJavalinRoutes(qSeleniumJavalin);
      qSeleniumJavalin
         .withRouteToFile("/data/person/1701", "data/person/1701.json");
   }



   /*******************************************************************************
    **
    *******************************************************************************/
   @Test
   void testOpenAuditsFromRecordWithNoAuditsFoundThenClose()
   {
      /////////////////////////////////////////////////////////////////////
      // setup route for empty audits - then assert we show such message //
      /////////////////////////////////////////////////////////////////////
      qSeleniumJavalin.withRouteToFile("/data/audit/query", "data/audit/query-empty.json");
      qSeleniumJavalin.restart();

      qSeleniumLib.gotoAndWaitForBreadcrumbHeaderToContain("/peopleApp/greetingsApp/person/1701", "John Doe");

      qSeleniumLib.waitForSelectorContaining("BUTTON", "Actions").click();
      qSeleniumLib.waitForSelectorContaining("LI", "Audit").click();
      qSeleniumLib.waitForSelector(".audit");
      qSeleniumLib.waitForSelectorContaining("DIV", "Audit for Person: John Doe");
      qSeleniumLib.waitForSelectorContaining("DIV", "No audits were found for this record");

      ///////////////////////////////////////
      // make sure we can close the dialog //
      ///////////////////////////////////////
      qSeleniumLib.waitForSelectorContaining("BUTTON", "Close").click();
      qSeleniumLib.waitForSelectorToNotExist(".audit");
   }



   /*******************************************************************************
    **
    *******************************************************************************/
   @Test
   void testOpenAuditsFromRecordWithSomeAuditsFound()
   {
      String auditQueryPath = "/data/audit/query";
      qSeleniumJavalin.withRouteToFile(auditQueryPath, "data/audit/query.json");
      qSeleniumJavalin.restart();

      qSeleniumLib.gotoAndWaitForBreadcrumbHeaderToContain("/peopleApp/greetingsApp/person/1701", "John Doe");

      qSeleniumLib.waitForSelectorContaining("BUTTON", "Actions").click();
      qSeleniumLib.waitForSelectorContaining("LI", "Audit").click();
      qSeleniumLib.waitForSelectorContaining("DIV", "Audit for Person: John Doe");
      qSeleniumLib.waitForSelectorContaining("DIV", "Showing all 5 audits for this record");

      //////////////////////////////////////////////////////////////////////////////////////////////////
      // assertions about the different styles of detail messages (set a value, cleared a value, etc) //
      //////////////////////////////////////////////////////////////////////////////////////////////////
      qSeleniumLib.waitForSelectorContaining("LI", "First Name: Set to John");
      qSeleniumLib.waitForSelectorContaining("B", "John");
      qSeleniumLib.waitForSelectorContaining("LI", "Last Name: Removed value Doe");
      qSeleniumLib.waitForSelectorContaining("LI", "clientId: Changed from BetaMax to ACME");
      qSeleniumLib.waitForSelectorContaining("B", "ACME");
      qSeleniumLib.waitForSelectorContaining("DIV", "Audit message here");
      qSeleniumLib.waitForSelectorContaining("LI", "This is a detail message");
   }



   /*******************************************************************************
    **
    *******************************************************************************/
   @Test
   void testOpenAuditsFromRecordReSortList()
   {
      String auditQueryPath = "/data/audit/query";
      qSeleniumJavalin.withRouteToFile(auditQueryPath, "data/audit/query.json");
      qSeleniumJavalin.restart();

      qSeleniumLib.gotoAndWaitForBreadcrumbHeaderToContain("/peopleApp/greetingsApp/person/1701", "John Doe");

      qSeleniumLib.waitForSelectorContaining("BUTTON", "Actions").click();
      qSeleniumLib.waitForSelectorContaining("LI", "Audit").click();
      qSeleniumLib.waitForSelectorContaining("DIV", "Audit for Person: John Doe");

      /////////////////////////////////////////////////////////////////////////////////////////
      // make sure clicking the re-sort buttons works (fires a new request w/ opposite sort) //
      /////////////////////////////////////////////////////////////////////////////////////////
      qSeleniumJavalin.beginCapture();
      WebElement sortAscButton = qSeleniumLib.waitForSelectorContaining("BUTTON", "arrow_upward");
      assertEquals("false", sortAscButton.getAttribute("aria-pressed"));
      sortAscButton.click();
      qSeleniumJavalin.waitForCapturedPath(auditQueryPath);
      qSeleniumJavalin.endCapture();
      List<CapturedContext> captured = qSeleniumJavalin.getCaptured();
      captured = captured.stream().filter(cc -> cc.getPath().equals(auditQueryPath)).toList();
      assertEquals(1, captured.size());
      assertThat(captured.get(0).getBody()).contains("\"isAscending\":true");

      sortAscButton = qSeleniumLib.waitForSelectorContaining("BUTTON", "arrow_upward");
      assertEquals("true", sortAscButton.getAttribute("aria-pressed"));

      qSeleniumJavalin.beginCapture();
      qSeleniumLib.waitForSelectorContaining("BUTTON", "arrow_downward").click();
      qSeleniumJavalin.waitForCapturedPath(auditQueryPath);
      qSeleniumJavalin.endCapture();
      captured = qSeleniumJavalin.getCaptured();
      captured = captured.stream().filter(cc -> cc.getPath().equals(auditQueryPath)).toList();
      assertEquals(1, captured.size());
      assertThat(captured.get(0).getBody()).contains("\"isAscending\":false");
   }

}
