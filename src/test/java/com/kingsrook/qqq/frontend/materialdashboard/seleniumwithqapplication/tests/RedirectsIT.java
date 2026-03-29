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


import java.util.List;
import com.kingsrook.qqq.backend.core.actions.metadata.DefaultNoopMetaDataActionCustomizer;
import com.kingsrook.qqq.backend.core.actions.tables.InsertAction;
import com.kingsrook.qqq.backend.core.exceptions.QException;
import com.kingsrook.qqq.backend.core.model.actions.metadata.MetaDataOutput;
import com.kingsrook.qqq.backend.core.model.actions.tables.insert.InsertInput;
import com.kingsrook.qqq.backend.core.model.data.QRecord;
import com.kingsrook.qqq.backend.core.model.metadata.QInstance;
import com.kingsrook.qqq.backend.core.model.metadata.code.QCodeReference;
import com.kingsrook.qqq.backend.core.model.metadata.layout.QAppMetaData;
import com.kingsrook.qqq.backend.core.model.metadata.layout.QAppSection;
import com.kingsrook.qqq.backend.core.model.metadata.permissions.PermissionLevel;
import com.kingsrook.qqq.backend.core.model.metadata.permissions.QPermissionRules;
import com.kingsrook.qqq.frontend.materialdashboard.seleniumwithqapplication.lib.QBaseSeleniumWithQApplicationTest;
import com.kingsrook.qqq.frontend.materialdashboard.seleniumwithqapplication.metadata.PeopleAppProducer;
import com.kingsrook.qqq.frontend.materialdashboard.seleniumwithqapplication.metadata.PersonTableProducer;
import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.assertThat;


/*******************************************************************************
 * tests for meta-data action's Redirects output object
 *******************************************************************************/
public class RedirectsIT extends QBaseSeleniumWithQApplicationTest
{
   public static final String RESTRICTED_APP_NAME   = "restrictedApp";
   public static final String LOW_AFFINITY_APP_NAME = "lowAffinityApp";


   /***************************************************************************
    *
    ***************************************************************************/
   @Override
   protected void customizeQInstance(QInstance qInstance) throws QException
   {
      qInstance.setMetaDataActionCustomizer(new QCodeReference(TestMetaDataActionCustomizer.class));

      QAppMetaData restrictedApp = new QAppMetaData()
         .withName(RESTRICTED_APP_NAME)
         .withPermissionRules(new QPermissionRules().withLevel(PermissionLevel.HAS_ACCESS_PERMISSION))
         .withSectionOfChildren(new QAppSection()
            .withName("tables")
            .withTable(PersonTableProducer.NAME));
      qInstance.addApp(restrictedApp);

      QAppMetaData lowAffinityApp = new QAppMetaData()
         .withName(LOW_AFFINITY_APP_NAME)
         .withSortOrder(1)
         .withSectionOfChildren(new QAppSection()
            .withName("tables")
            .withTable(PersonTableProducer.NAME));
      qInstance.addApp(lowAffinityApp);

      qInstance.getApp(PeopleAppProducer.GREETINGS_APP_NAME).setChildAppAffinity(PersonTableProducer.NAME, 2);
      lowAffinityApp.setChildAppAffinity(PersonTableProducer.NAME, 1);
   }



   /***************************************************************************
    *
    ***************************************************************************/
   public static class TestMetaDataActionCustomizer extends DefaultNoopMetaDataActionCustomizer
   {
      /***************************************************************************
       *
       ***************************************************************************/
      @Override
      public void postProcess(MetaDataOutput metaDataOutput) throws QException
      {
         metaDataOutput.withRedirect("/noSuchApp/person", "/peopleApp/greetingsApp/person");
         metaDataOutput.withRedirect("/noSuchApp/person/*", "/peopleApp/greetingsApp/person");
         metaDataOutput.withRedirect("/homer/simpson", "/peopleApp/greetingsApp/person/1");
      }
   }



   /***************************************************************************
    *
    ***************************************************************************/
   @Override
   protected void setupTestData() throws QException
   {
      new InsertAction().execute(new InsertInput(PersonTableProducer.NAME).withRecords(List.of(
         new QRecord().withValue("firstName", "Homer").withValue("lastName", "Simpson")
      )));
   }



   /*******************************************************************************
    **
    *******************************************************************************/
   @Test
   void testManualRedirects()
   {
      /////////////////////////////////////////////
      // baseline - the actual path to the table //
      /////////////////////////////////////////////
      qSeleniumLib.gotoAndWaitForBreadcrumbHeaderToContain("/peopleApp/greetingsApp/" + PersonTableProducer.NAME + "/1", "Homer");
      qSeleniumLib.gotoAndWaitForBreadcrumbHeaderToContain("/peopleApp/greetingsApp/" + PersonTableProducer.NAME, "Person");
      qSeleniumLib.gotoAndWaitForBreadcrumbHeaderToContain("/peopleApp/greetingsApp/" + PersonTableProducer.NAME + "/", "Person");

      ///////////////////////////////////////////////////////////////////////////////////
      // a redirect - from invalid path to table (but where a redirect has been built) //
      ///////////////////////////////////////////////////////////////////////////////////
      qSeleniumLib.gotoAndWaitForBreadcrumbHeaderToContain("/noSuchApp/" + PersonTableProducer.NAME + "/1", "Homer");
      qSeleniumLib.gotoAndWaitForBreadcrumbHeaderToContain("/noSuchApp/" + PersonTableProducer.NAME, "Person");
      qSeleniumLib.gotoAndWaitForBreadcrumbHeaderToContain("/noSuchApp/" + PersonTableProducer.NAME + "/", "Person");

      ///////////////////////////////////
      // and a totally custom redirect //
      ///////////////////////////////////
      qSeleniumLib.gotoAndWaitForBreadcrumbHeaderToContain("/homer/simpson", "Homer");
   }



   /*******************************************************************************
    **
    *******************************************************************************/
   @Test
   void testDeepLinkToPermissionDeniedAppWithTableGetsRedirectedToAppWithPermissionAndSameTable()
   {
      ///////////////////////////////////////////////////////////////////////////////////////////////////
      // try to go to the person table under the restricted app - it should redirect to the people app //
      ///////////////////////////////////////////////////////////////////////////////////////////////////
      qSeleniumLib.gotoAndWaitForBreadcrumbHeaderToContain("/restrictedApp/" + PersonTableProducer.NAME, "Person");
      assertThat(qSeleniumLib.driver.getCurrentUrl()).contains("/peopleApp/greetingsApp/");

      /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
      // make sure other paths that look like apps (but aren't) don't redirect to this table - they should go to the default app //
      /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
      qSeleniumLib.gotoAndWaitForBreadcrumbHeaderToContain("/whatever/" + PersonTableProducer.NAME, "Low Affinity App");
      assertThat(qSeleniumLib.driver.getCurrentUrl()).doesNotContain("/peopleApp/greetingsApp/");
   }



   /*******************************************************************************
    **
    *******************************************************************************/
   @Test
   void testAppAffinity()
   {
      ///////////////////////////////////////////////////////////////////////
      // make sure we can go to the person table under the lowAffinity app //
      ///////////////////////////////////////////////////////////////////////
      qSeleniumLib.gotoAndWaitForBreadcrumbHeaderToContain("/lowAffinityApp/" + PersonTableProducer.NAME, "Person");
      assertThat(qSeleniumLib.driver.getCurrentUrl()).contains("/lowAffinityApp/");

      //////////////////////////////////////////////////////////////////////////////////////////////////////
      // but if we use the dot menu, we land at the higher-affinity app - which is peopleApp/greetingsApp //
      //////////////////////////////////////////////////////////////////////////////////////////////////////
      qfmdSeleniumLib.dotMenu("Person", "person");
      qSeleniumLib.waitForSelectorContaining("h3", "Person");
      assertThat(qSeleniumLib.driver.getCurrentUrl()).contains("/peopleApp/greetingsApp/");
   }

}
