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
import com.kingsrook.qqq.backend.core.actions.tables.InsertAction;
import com.kingsrook.qqq.backend.core.exceptions.QException;
import com.kingsrook.qqq.backend.core.model.actions.tables.insert.InsertInput;
import com.kingsrook.qqq.backend.core.model.data.QRecord;
import com.kingsrook.qqq.backend.core.model.metadata.QInstance;
import com.kingsrook.qqq.backend.core.model.savedviews.QuickSavedView;
import com.kingsrook.qqq.backend.core.model.savedviews.SavedView;
import com.kingsrook.qqq.backend.core.model.savedviews.SavedViewsMetaDataProvider;
import com.kingsrook.qqq.frontend.materialdashboard.selenium.lib.QueryScreenLib;
import com.kingsrook.qqq.frontend.materialdashboard.seleniumwithqapplication.lib.QBaseSeleniumWithQApplicationTest;
import com.kingsrook.qqq.frontend.materialdashboard.seleniumwithqapplication.metadata.MemoryBackendProducer;
import com.kingsrook.qqq.frontend.materialdashboard.seleniumwithqapplication.metadata.PersonTableProducer;
import org.json.JSONArray;
import org.json.JSONObject;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;


/*******************************************************************************
 * tests for meta-data action's Redirects output object
 *******************************************************************************/
public class QuickSavedViewsIT extends QBaseSeleniumWithQApplicationTest
{
   String DATA_QQQ_ID_QUICK_VIEWS_CONTAINER = "[data-qqq-id=\"quick-views-container\"]";



   /***************************************************************************
    *
    ***************************************************************************/
   @Override
   protected void customizeQInstance(QInstance qInstance) throws QException
   {
      new SavedViewsMetaDataProvider()
         .withIsQuickSavedViewEnabled(true)
         .defineAll(qInstance, MemoryBackendProducer.NAME, null);
   }



   /***************************************************************************
    *
    ***************************************************************************/
   @Override
   protected void setupTestData() throws QException
   {
      new InsertAction().execute(new InsertInput(PersonTableProducer.NAME).withRecord(new QRecord().withValue("firstName", "Homer").withValue("lastName", "Simpson")));

      setupTestDataViaTestMethodTagSpecifyingSetupTestDataMethodName();
   }



   /*******************************************************************************
    **
    *******************************************************************************/
   @Test
   void testNoQuickViews()
   {
      qSeleniumLib.gotoAndWaitForBreadcrumbHeaderToContain("/peopleApp/greetingsApp/person", "Person");
      qSeleniumLib.waitForSelectorToNotExist(DATA_QQQ_ID_QUICK_VIEWS_CONTAINER);
   }



   /***************************************************************************
    *
    ***************************************************************************/
   public void setupTestDataForTestHasQuickViews() throws QException
   {
      List<QRecord> insertedViews = new InsertAction().execute(new InsertInput(SavedView.TABLE_NAME).withRecordEntities(List.of(

         new SavedView().withLabel("Empty View").withTableName(PersonTableProducer.NAME).withViewJson(new JSONObject()
            .put("queryFilter", new JSONObject())
            .put("queryColumns", new JSONObject())
            .toString()),

         new SavedView().withLabel("Simple View").withTableName(PersonTableProducer.NAME).withViewJson(new JSONObject()
            .put("queryFilter", new JSONObject()
               .put("criteria", new JSONArray()
                  .put(new JSONObject().put("fieldName", "firstName").put("operator", "EQUALS").put("values", new JSONArray(List.of("Homer"))))
               ))
            .put("queryColumns", new JSONObject())
            .toString()),

      new SavedView().withLabel("Slow View").withTableName(PersonTableProducer.NAME).withViewJson(new JSONObject()
         .put("queryFilter", new JSONObject())
         .put("queryColumns", new JSONObject())
         .toString())

      ))).getRecords();

      new InsertAction().execute(new InsertInput(QuickSavedView.TABLE_NAME).withRecordEntities(List.of(
         new QuickSavedView().withSavedViewId(insertedViews.get(0).getValueInteger("id")).withDoCount(false).withSortOrder(2),
         new QuickSavedView().withSavedViewId(insertedViews.get(1).getValueInteger("id")).withDoCount(true).withSortOrder(1)
      )));
   }



   /*******************************************************************************
    **
    *******************************************************************************/
   @Test
   @Tag("setupTestDataForTestHasQuickViews")
   void testHasQuickViews() throws QException
   {
      qSeleniumLib.gotoAndWaitForBreadcrumbHeaderToContain("/peopleApp/greetingsApp/person", "Person");

      String quickViewButtonBackgroundBeforeClicking = qSeleniumLib.waitForSelectorContaining(DATA_QQQ_ID_QUICK_VIEWS_CONTAINER + " button", "Empty View").getCssValue("background");
      qSeleniumLib.waitForSelectorContaining(DATA_QQQ_ID_QUICK_VIEWS_CONTAINER + " button", "Empty View").click();
      assertThat(qSeleniumLib.driver.getCurrentUrl()).contains("/peopleApp/greetingsApp/person/savedView/1");
      String quickViewButtonBackgroundAfterClicking = qSeleniumLib.waitForSelectorContaining(DATA_QQQ_ID_QUICK_VIEWS_CONTAINER + " button", "Empty View").getCssValue("background");
      assertNotEquals(quickViewButtonBackgroundBeforeClicking, quickViewButtonBackgroundAfterClicking);

      ///////////////////////////////////////////////////////////////////////////////
      // make sure this view didn't include a count (in parentheses)               //
      // note counts are in separate element, so (?s) (single-line) regex to match //
      ///////////////////////////////////////////////////////////////////////////////
      qSeleniumLib.waitForSelectorTextMatchingRegexToNotExist(DATA_QQQ_ID_QUICK_VIEWS_CONTAINER + " button", "(?s).*Empty View.*\\(.*");

      //////////////////////////////////////////////////////////////////////////////
      // simple view is set to include count, so assert it is shown, and click it //
      //////////////////////////////////////////////////////////////////////////////
      qSeleniumLib.waitForSelectorContainingTextMatchingRegex(DATA_QQQ_ID_QUICK_VIEWS_CONTAINER + " button", "(?s).*Simple View.*\\(1\\).*").click();
      assertThat(qSeleniumLib.driver.getCurrentUrl()).contains("/peopleApp/greetingsApp/person/savedView/2");
      QueryScreenLib queryScreenLib = new QueryScreenLib(qSeleniumLib);
      queryScreenLib.assertQuickFilterButtonIndicatesActiveFilter("firstName");

      /////////////////////////////////////////////////////////////////////////////////////////
      // make sure clicking a different quick-view changes background color on the first one //
      /////////////////////////////////////////////////////////////////////////////////////////
      String quickViewButtonBackgroundAfterClickingDifferentOne = qSeleniumLib.waitForSelectorContaining(DATA_QQQ_ID_QUICK_VIEWS_CONTAINER + " button", "Empty View").getCssValue("background");
      assertEquals(quickViewButtonBackgroundBeforeClicking, quickViewButtonBackgroundAfterClickingDifferentOne);

      /////////////////////////////////////////////////////
      // slow-view shouldn't show up with the quick ones //
      /////////////////////////////////////////////////////
      qSeleniumLib.waitForSelectorContainingToNotExist(DATA_QQQ_ID_QUICK_VIEWS_CONTAINER + " button", "Slow View");

      //////////////////////
      // click views menu //
      //////////////////////
      String viewsMenuButtonBackgroundBeforeSelectingSlowView = qSeleniumLib.waitForSelectorContaining("button", "Views").getCssValue("background");
      qSeleniumLib.waitForSelectorContaining("button", "Views").click();
      qSeleniumLib.waitForSelectorContaining(".MuiMenu-root li", "View Actions");

      //////////////////////////////////////////////////////////////////////////////
      // make sure quick view isn't there, but slow view is, and we can select it //
      //////////////////////////////////////////////////////////////////////////////
      qSeleniumLib.waitForSelectorContainingToNotExist(".MuiMenu-root li", "Simple View");
      qSeleniumLib.waitForSelectorContaining(".MuiMenu-root li", "Slow View").click();
      assertThat(qSeleniumLib.driver.getCurrentUrl()).contains("/peopleApp/greetingsApp/person/savedView/3");

      /////////////////////////////////////////////////////////////////////////////////////
      // make sure the views button background changes when selecting the non-quick view //
      /////////////////////////////////////////////////////////////////////////////////////
      String viewsMenuButtonBackgroundAfterSelectingSlowView = qSeleniumLib.waitForSelectorContaining("button", "Views").getCssValue("background");
      assertNotEquals(viewsMenuButtonBackgroundBeforeSelectingSlowView, viewsMenuButtonBackgroundAfterSelectingSlowView);

      //////////////////////////////////////////////////////////////////////////////////////////
      // now go back to a quick view - the views button should go back to original background //
      //////////////////////////////////////////////////////////////////////////////////////////
      qSeleniumLib.waitForSelectorContaining(DATA_QQQ_ID_QUICK_VIEWS_CONTAINER + " button", "Empty View").click();
      assertThat(qSeleniumLib.driver.getCurrentUrl()).contains("/peopleApp/greetingsApp/person/savedView/1");
      String viewsMenuButtonBackgroundAfterSelectingQuickView = qSeleniumLib.waitForSelectorContaining("button", "Views").getCssValue("background");
      assertEquals(viewsMenuButtonBackgroundBeforeSelectingSlowView, viewsMenuButtonBackgroundAfterSelectingQuickView);

      // qSeleniumLib.waitForever();
   }

}
