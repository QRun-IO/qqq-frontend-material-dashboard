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


import java.util.ArrayList;
import java.util.List;
import com.kingsrook.qqq.backend.core.actions.tables.InsertAction;
import com.kingsrook.qqq.backend.core.exceptions.QException;
import com.kingsrook.qqq.backend.core.model.actions.tables.insert.InsertInput;
import com.kingsrook.qqq.backend.core.model.data.QRecord;
import com.kingsrook.qqq.backend.core.model.metadata.QInstance;
import com.kingsrook.qqq.backend.core.model.metadata.fields.AdornmentType;
import com.kingsrook.qqq.backend.core.model.metadata.fields.FieldAdornment;
import com.kingsrook.qqq.backend.core.model.metadata.fields.QFieldMetaData;
import com.kingsrook.qqq.backend.core.model.metadata.fields.QFieldType;
import com.kingsrook.qqq.backend.core.model.metadata.layout.QIcon;
import com.kingsrook.qqq.backend.core.model.metadata.menus.QMenu;
import com.kingsrook.qqq.backend.core.model.metadata.menus.QMenuSlot;
import com.kingsrook.qqq.backend.core.model.metadata.menus.adjusters.QMenuAdjuster;
import com.kingsrook.qqq.backend.core.model.metadata.menus.adjusters.QMenuItemMatcher;
import com.kingsrook.qqq.backend.core.model.metadata.menus.defaults.QMenuDefaultViewScreenActionsMenu;
import com.kingsrook.qqq.backend.core.model.metadata.menus.items.QMenuItemBuiltIn;
import com.kingsrook.qqq.backend.core.model.metadata.menus.items.QMenuItemDivider;
import com.kingsrook.qqq.backend.core.model.metadata.menus.items.QMenuItemDownloadFile;
import com.kingsrook.qqq.backend.core.model.metadata.menus.items.QMenuItemRunProcess;
import com.kingsrook.qqq.backend.core.model.metadata.menus.items.QMenuItemSubList;
import com.kingsrook.qqq.backend.core.model.metadata.menus.items.QMenuItemSubMenu;
import com.kingsrook.qqq.backend.core.model.metadata.tables.QTableMetaData;
import com.kingsrook.qqq.frontend.materialdashboard.junit.TestUtils;
import com.kingsrook.qqq.frontend.materialdashboard.seleniumwithqapplication.lib.QBaseSeleniumWithQApplicationTest;
import com.kingsrook.qqq.frontend.materialdashboard.seleniumwithqapplication.metadata.PersonNoopProcessMetaDataProducer;
import com.kingsrook.qqq.frontend.materialdashboard.seleniumwithqapplication.metadata.PersonTableProducer;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.WebElement;
import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;


/*******************************************************************************
 ** Tests for menus on the record view screen
 *
 *******************************************************************************/
public class RecordViewMenusIT extends QBaseSeleniumWithQApplicationTest
{


   /***************************************************************************
    *
    ***************************************************************************/
   @Override
   public void customizeQInstance(QInstance qInstance) throws QException
   {
      customizeQInstanceViaTestMethodTagSpecifyingDoMethodName(qInstance);
   }



   /***************************************************************************
    *
    ***************************************************************************/
   @Override
   protected void setupTestData() throws QException
   {
      new InsertAction().execute(new InsertInput(PersonTableProducer.NAME).withRecords(List.of(
         new QRecord().withValue("firstName", "Homer").withValue("lastName", "Simpson"),
         new QRecord().withValue("firstName", "Marge").withValue("lastName", "Simpson").withValue("fileA", "fileA contents")
      )));
   }



   /*******************************************************************************
    *
    *******************************************************************************/
   @Test
   void testActionMenuWithoutCustomizations()
   {
      qSeleniumLib.gotoAndWaitForBreadcrumbHeaderToContain("/peopleApp/greetingsApp/person/1", "Homer");

      qSeleniumLib.waitForSelectorContaining("button", "Actions").click();
      assertMenuItemExists("New");
      assertMenuItemExists("Copy");
      assertMenuItemExists("Edit");
      assertMenuItemExists("Delete");
      assertMenuDividerCount(2);
      assertMenuItemExists("Developer Mode");

      ////////////////////////////////////
      // no audit table in the instance //
      ////////////////////////////////////
      assertMenuItemDoesNotExist("Audit");

      qSeleniumLib.clickBackdrop();
      // qSeleniumLib.waitForever();
   }



   /*******************************************************************************
    *
    *******************************************************************************/
   @Test
   @Tag("doActionMenuWithChanges")
   void testActionMenuWithChanges()
   {
      doActionMenuWithChanges(null);
   }



   /***************************************************************************
    *
    ***************************************************************************/
   public void doActionMenuWithChanges(QInstance qInstance)
   {
      /////////////////////////////////////////////////////////////////////////////////////////////
      // qInstance setup, called by customizeQInstance based on @Tag("do...") on the test method //
      /////////////////////////////////////////////////////////////////////////////////////////////
      if(qInstance != null)
      {
         QTableMetaData table = qInstance.getTable(TestUtils.TABLE_NAME_PERSON);

         ///////////////////////////////////
         // remove edit, add a 2nd "copy" //
         ///////////////////////////////////
         QMenuDefaultViewScreenActionsMenu menu = new QMenuDefaultViewScreenActionsMenu();
         QMenuAdjuster.removeFirst(menu, new QMenuItemMatcher("Edit"));
         QMenuAdjuster.addLast(menu, new QMenuItemBuiltIn(QMenuItemBuiltIn.DefaultOptions.COPY));

         ////////////////////////////////////////////////////////////////////////////
         // put the no-op process as the very first thing, with a divider below it //
         ////////////////////////////////////////////////////////////////////////////
         QMenuAdjuster.addFirst(menu, new QMenuItemRunProcess(PersonNoopProcessMetaDataProducer.NAME));
         QMenuAdjuster.addAtIndex(menu, 1, new QMenuItemDivider());

         table.withMenu(menu);
         return;
      }

      ///////////////
      // test body //
      ///////////////
      qSeleniumLib.gotoAndWaitForBreadcrumbHeaderToContain("/peopleApp/greetingsApp/person/1", "Homer");

      qSeleniumLib.waitForSelectorContaining("button", "Actions").click();
      assertMenuItemExists("No op process");
      assertMenuItemExists("New");
      assertMenuItemExists("Copy");
      assertMenuItemDoesNotExist("Edit");
      assertMenuItemExists("Delete");
      assertMenuDividerCount(2);
      assertMenuItemExists("Developer Mode");

      ////////////////////////////////////
      // no audit table in the instance //
      ////////////////////////////////////
      assertMenuItemDoesNotExist("Audit");

      assertThat(getMenuIconsAndLabels("No op process"))
         .matches(".* No op process .* New .* Copy .* Delete .* Developer Mode .* Copy");

      ///////////////////////////////////////////
      // make sure launching the process works //
      ///////////////////////////////////////////
      assertMenuItemExists("No op process").click();
      qSeleniumLib.waitForSelectorContaining(".MuiTypography-h5", "No op process: Step 1");
      qfmdSeleniumLib.clickCancelButton();

      qSeleniumLib.clickBackdrop();
      // qSeleniumLib.waitForever();
   }



   /*******************************************************************************
    *
    *******************************************************************************/
   @Test
   @Tag("doAdditionalMenus")
   void testAdditionalMenus()
   {
      doAdditionalMenus(null);
   }



   /***************************************************************************
    *
    ***************************************************************************/
   public void doAdditionalMenus(QInstance qInstance)
   {
      /////////////////////////////////////////////////////////////////////////////////////////////
      // qInstance setup, called by customizeQInstance based on @Tag("do...") on the test method //
      /////////////////////////////////////////////////////////////////////////////////////////////
      if(qInstance != null)
      {
         QTableMetaData table = qInstance.getTable(TestUtils.TABLE_NAME_PERSON);

         addBlobField(table, "fileContents");

         QMenu customMenu1 = new QMenu()
            .withLabel("Hamburgers")
            .withSlot(QMenuSlot.VIEW_SCREEN_ADDITIONAL)
            .withIcon(new QIcon().withName("lunch_dining"))
            .withItem(new QMenuItemBuiltIn(QMenuItemBuiltIn.DefaultOptions.COPY))
            .withItem(new QMenuItemDownloadFile("fileContents").withLabel("Download File Contents"))
            .withItem(new QMenuItemRunProcess(PersonNoopProcessMetaDataProducer.NAME));
         table.withMenu(customMenu1);

         return;
      }

      ///////////////
      // test body //
      ///////////////
      qSeleniumLib.gotoAndWaitForBreadcrumbHeaderToContain("/peopleApp/greetingsApp/person/1", "Homer");

      qSeleniumLib.waitForSelectorContaining("button", "Hamburgers").click();
      assertMenuItemExists("Copy");

      WebElement downloadItem = assertMenuItemExists("Download File Contents");
      assertMenuItemEnabledStatus(downloadItem, false);

      assertMenuItemExists("No op process");

      assertThat(getMenuIconsAndLabels("No op process"))
         .matches("copy Copy file_download Download File Contents not_interested No op process");

      qSeleniumLib.clickBackdrop();
      //qSeleniumLib.waitForever();
   }



   /*******************************************************************************
    *
    *******************************************************************************/
   @Test
   @Tag("doSubMenu")
   void testSubMenu() throws QException
   {
      doSubMenu(null);
   }



   /***************************************************************************
    *
    ***************************************************************************/
   public void doSubMenu(QInstance qInstance) throws QException
   {
      /////////////////////////////////////////////////////////////////////////////////////////////
      // qInstance setup, called by customizeQInstance based on @Tag("do...") on the test method //
      /////////////////////////////////////////////////////////////////////////////////////////////
      if(qInstance != null)
      {
         QTableMetaData table = qInstance.getTable(TestUtils.TABLE_NAME_PERSON);

         addBlobField(table, "fileA");
         addBlobField(table, "fileB");

         QMenuDefaultViewScreenActionsMenu menu = new QMenuDefaultViewScreenActionsMenu();
         QMenuAdjuster.addBefore(menu, new QMenuItemSubList()
               .withItem(new QMenuItemSubMenu()
                  .withLabel("Files")
                  .withIcon(new QIcon().withName("attach_file"))
                  .withItem(new QMenuItemDownloadFile("fileA").withLabel("File A"))
                  .withItem(new QMenuItemDownloadFile("fileB").withLabel("File B"))
               )
               .withItem(new QMenuItemDivider()),
            new QMenuItemMatcher(QMenuItemBuiltIn.DefaultOptions.THIS_TABLE_PROCESS_LIST));
         table.withMenu(menu);

         return;
      }

      ///////////////
      // test body //
      ///////////////
      qSeleniumLib.gotoAndWaitForBreadcrumbHeaderToContain("/peopleApp/greetingsApp/person/2", "Marge");

      qSeleniumLib.waitForSelectorContaining("button", "Actions").click();

      assertMenuItemExists("Delete");

      WebElement filesItem = assertMenuItemExists("Files");
      filesItem.click();

      WebElement fileAItem = assertMenuItemExists("File A");
      assertMenuItemEnabledStatus(fileAItem, true);

      WebElement fileBItem = assertMenuItemExists("File B");
      assertMenuItemEnabledStatus(fileBItem, false);

      assertMenuItemExists("No op process");

      assertMenuDividerCount(3);

      assertThat(getMenuIconsAndLabels("No op process"))
         .matches(".*Delete attach_file Files .* No op process.*");
      fileAItem.click();

      qSeleniumLib.waitForMillis(500);

      String latestChromeDownloadedFileInfo = qSeleniumLib.getLatestChromeDownloadedFileInfo();
      assertThat(latestChromeDownloadedFileInfo).contains("fileA-2.txt");

      qSeleniumLib.clickBackdrop();
      //qSeleniumLib.waitForever();
   }



   /***************************************************************************
    *
    ***************************************************************************/
   private void assertMenuItemEnabledStatus(WebElement menuItem, boolean expectedIsEnabled)
   {
      if(expectedIsEnabled)
      {
         assertThat(menuItem.getAttribute("class")).doesNotContain("Mui-disabled");
      }
      else
      {
         assertThat(menuItem.getAttribute("class")).contains("Mui-disabled");
      }
   }



   /***************************************************************************
    *
    ***************************************************************************/
   private static void addBlobField(QTableMetaData table, String fieldName)
   {
      QFieldMetaData field = new QFieldMetaData(fieldName, QFieldType.BLOB);
      table.addField(field);
      table.getSections().get(1).getFieldNames().add(fieldName);

      FieldAdornment adornment = new FieldAdornment()
         .withType(AdornmentType.FILE_DOWNLOAD)
         .withValue(AdornmentType.FileDownloadValues.FILE_NAME_FORMAT, fieldName + "-%s.txt")
         .withValue(AdornmentType.FileDownloadValues.FILE_NAME_FORMAT_FIELDS, new ArrayList<>(List.of("id")))
         .withValue(AdornmentType.FileDownloadValues.DEFAULT_EXTENSION, "txt");
      field.withFieldAdornment(adornment);
   }



   /***************************************************************************
    *
    ***************************************************************************/
   private String getMenuIconsAndLabels(String someMenuContentText)
   {
      return qSeleniumLib.waitForSelectorContaining(".MuiMenu-list", someMenuContentText).getText().replace('\n', ' ');
   }



   /***************************************************************************
    *
    ***************************************************************************/
   private void assertMenuDividerCount(Integer expectedCount)
   {
      if(expectedCount > 0)
      {
         assertEquals(expectedCount, qSeleniumLib.waitForSelectorAll(".MuiMenu-list hr", expectedCount).size());
      }
      else
      {
         qSeleniumLib.waitForSelectorToNotExist(".MuiMenu-list hr");
      }
   }



   /***************************************************************************
    *
    ***************************************************************************/
   private WebElement assertMenuItemExists(String menuItemLabel)
   {
      WebElement webElement = qSeleniumLib.waitForSelectorContaining("li", menuItemLabel);
      assertTrue(webElement.isDisplayed());
      return webElement;
   }



   /***************************************************************************
    *
    ***************************************************************************/
   private void assertMenuItemDoesNotExist(String menuItemLabel)
   {
      qSeleniumLib.waitForSelectorContainingToNotExist("li", menuItemLabel);
   }

}
