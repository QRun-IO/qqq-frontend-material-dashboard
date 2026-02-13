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

package com.kingsrook.qqq.frontend.materialdashboard.seleniumwithqapplication.tests;


import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import com.kingsrook.qqq.backend.core.actions.tables.InsertAction;
import com.kingsrook.qqq.backend.core.exceptions.QException;
import com.kingsrook.qqq.backend.core.model.actions.tables.insert.InsertInput;
import com.kingsrook.qqq.backend.core.model.data.QRecord;
import com.kingsrook.qqq.backend.core.model.metadata.QInstance;
import com.kingsrook.qqq.backend.core.model.savedviews.SavedView;
import com.kingsrook.qqq.backend.core.model.savedviews.SavedViewsMetaDataProvider;
import com.kingsrook.qqq.backend.core.utils.JsonUtils;
import com.kingsrook.qqq.frontend.materialdashboard.seleniumwithqapplication.lib.QBaseSeleniumWithQApplicationTest;
import com.kingsrook.qqq.frontend.materialdashboard.seleniumwithqapplication.metadata.MemoryBackendProducer;
import com.kingsrook.qqq.frontend.materialdashboard.seleniumwithqapplication.metadata.PersonTableProducer;
import org.json.JSONArray;
import org.json.JSONObject;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;


/*******************************************************************************
 * Test for the various ways we init a process.
 *
 * Adding during migration from calling /init with a GET to a POST instead.
 *******************************************************************************/
public class ProcessInitVariationsIT extends QBaseSeleniumWithQApplicationTest
{
   String longFirstName = "Homer Is not Long Enough Of A Name So We Made One Much Much Much Much Longer";



   /***************************************************************************
    *
    ***************************************************************************/
   @Override
   protected void customizeQInstance(QInstance qInstance) throws QException
   {
      customizeQInstanceViaTestMethodTagSpecifyingCustomizeQInstanceMethodName(qInstance);
   }



   /***************************************************************************
    *
    ***************************************************************************/
   @Override
   protected void setupTestData() throws QException
   {
      if(!setupTestDataViaTestMethodTagSpecifyingSetupTestDataMethodName())
      {
         new InsertAction().execute(new InsertInput(PersonTableProducer.NAME).withRecords(List.of(
            new QRecord().withValue("firstName", "Homer").withValue("lastName", "Simpson"),
            new QRecord().withValue("firstName", "Marge").withValue("lastName", "Simpson"),
            new QRecord().withValue("firstName", "Bart").withValue("lastName", "Simpson")
         )));
      }
   }



   /*******************************************************************************
    **
    *******************************************************************************/
   @Test
   void testInitFromRecordView()
   {
      qSeleniumLib.gotoAndWaitForBreadcrumbHeaderToContain("/peopleApp/greetingsApp/person/1", "Homer");
      qfmdSeleniumLib.chooseFromActionMenu("Basic ETL Process");
      qSeleniumLib.waitForSelectorContaining(".modalProcess", "Input: 1 Person record");
      qSeleniumLib.waitForSelectorContainingTextMatchingRegex(".modalProcess", "(?s).*First Name:.*Homer.*");
   }



   /*******************************************************************************
    **
    *******************************************************************************/
   @Test
   void testInitFromQueryByThisPage()
   {
      qSeleniumLib.gotoAndWaitForBreadcrumbHeaderToContain("/peopleApp/greetingsApp/person", "Person");
      qSeleniumLib.waitForSelector(".MuiDataGrid-columnHeaders input[type=\"checkbox\"]").click();
      qfmdSeleniumLib.chooseFromActionMenu("Basic ETL Process");
      qSeleniumLib.waitForSelectorContaining(".modalProcess", "Input: 3 Person records");
      qSeleniumLib.waitForSelectorContainingTextMatchingRegex(".modalProcess", "(?s).*First Name:.*Homer.*");
   }



   /*******************************************************************************
    **
    *******************************************************************************/
   @Test
   void testInitFromQueryByFullQuery()
   {
      qSeleniumLib.gotoAndWaitForBreadcrumbHeaderToContain("/peopleApp/greetingsApp/person", "Person");
      qSeleniumLib.waitForSelectorContaining("button", "Selection").click();
      qSeleniumLib.waitForSelectorContaining("li", "Full query result").click();
      qfmdSeleniumLib.chooseFromActionMenu("Basic ETL Process");
      qSeleniumLib.waitForSelectorContaining(".modalProcess", "Input: 3 Person records");

      ///////////////////////////////////////////////////////////////////////////////////
      // note - the sort from the query is respected here, thus id desc has Bart first //
      ///////////////////////////////////////////////////////////////////////////////////
      qSeleniumLib.waitForSelectorContainingTextMatchingRegex(".modalProcess", "(?s).*First Name:.*Bart.*");
   }



   /*******************************************************************************
    **
    *******************************************************************************/
   @Test
   void testInitFromUrlWithDefaultParams()
   {
      String url = "/peopleApp/greetingsApp/person/1/PersonNoopProcess?defaultProcessValues=" + URLEncoder.encode(JsonUtils.toJson(Map.of("foo", "bar")), StandardCharsets.UTF_8);
      qSeleniumLib.gotoAndWaitForBreadcrumbHeaderToContain(url, "No op process");
      qSeleniumLib.waitForSelectorContainingTextMatchingRegex(".modalProcess", "(?s).*Foo:.*bar.*");

   }



   /***************************************************************************
    * Add the saved views tables to the instance - with security turned off.
    ***************************************************************************/
   public void customizeQInstanceTooLargeForQueryString(QInstance qInstance) throws QException
   {
      new SavedViewsMetaDataProvider().defineAll(qInstance, MemoryBackendProducer.NAME, null);
      qInstance.getTable(SavedView.TABLE_NAME).setRecordSecurityLocks(null);
   }



   /***************************************************************************
    *
    ***************************************************************************/
   public void setupTestDataTooLargeForQueryString() throws QException
   {
      ///////////////////////////////////////////////////
      // insert 250 homers, with very long first names //
      ///////////////////////////////////////////////////
      List<String>  firstNames = new ArrayList<>();
      List<QRecord> records    = new ArrayList<>();
      for(int i = 0; i < 250; i++)
      {
         String firstName = longFirstName + i;
         firstNames.add(firstName);
         records.add(new QRecord().withValue("firstName", firstName));
      }
      new InsertAction().execute(new InsertInput(PersonTableProducer.NAME).withRecords(records));

      //////////////////////////////////////////////////////////////////////////////
      // insert a saved view that loads all of those homers by first name IN list //
      //////////////////////////////////////////////////////////////////////////////
      SavedView savedView = new SavedView()
         .withLabel("Too many records")
         .withTableName(PersonTableProducer.NAME)
         .withUserId("anonymous")
         .withViewJson(new JSONObject()
            .put("queryFilter", new JSONObject()
               .put("criteria", new JSONArray()
                  .put(new JSONObject().put("fieldName", "firstName").put("operator", "IN").put("values", new JSONArray(firstNames)))
               ))
            .put("queryColumns", new JSONObject())
            .toString());
      new InsertAction().execute(new InsertInput(SavedView.TABLE_NAME).withRecordEntity(savedView));
   }



   /*******************************************************************************
    * Regression test - where if a filter became too large for the webserver to accept
    * as a query string (http 414 error), the process would fail to init.  So we
    * updated it to do a POST instead.
    *******************************************************************************/
   @Test
   @Tag("setupTestDataTooLargeForQueryString")
   @Tag("customizeQInstanceTooLargeForQueryString")
   void testInitFromQueryByFullQueryTooLargeForQueryString()
   {
      qSeleniumLib.gotoAndWaitForBreadcrumbHeaderToContain("/peopleApp/greetingsApp/person/savedView/1", "Person / Too Many Records");

      qSeleniumLib.waitForSelectorContaining("button", "Selection").click();
      qSeleniumLib.waitForSelectorContaining("li", "Full query result").click();

      qfmdSeleniumLib.chooseFromActionMenu("Basic ETL Process");
      qSeleniumLib.waitForSelectorContaining(".modalProcess", "Input: 250 Person records");
      qSeleniumLib.waitForSelectorContainingTextMatchingRegex(".modalProcess", "(?s).*First Name:.*" + longFirstName + ".*");
   }

}
