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
import com.kingsrook.qqq.backend.core.model.metadata.layout.CollapsibleMetaData;
import com.kingsrook.qqq.backend.core.model.metadata.tables.QFieldSection;
import com.kingsrook.qqq.frontend.materialdashboard.seleniumwithqapplication.lib.QBaseSeleniumWithQApplicationTest;
import com.kingsrook.qqq.frontend.materialdashboard.seleniumwithqapplication.metadata.PersonTableProducer;
import com.kingsrook.qqq.frontend.materialdashboard.seleniumwithqapplication.metadata.PetSpeciesPVSProducer;
import com.kingsrook.qqq.frontend.materialdashboard.seleniumwithqapplication.metadata.PetTableProducer;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;


/*******************************************************************************
 ** Tests for menus on the record view screen
 *
 *******************************************************************************/
public class CollapsibleSectionsIT extends QBaseSeleniumWithQApplicationTest
{

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
      new InsertAction().execute(new InsertInput(PersonTableProducer.NAME).withRecords(List.of(
         new QRecord().withValue("firstName", "Homer").withValue("lastName", "Simpson").withValue("isAlive", true)
      )));

      new InsertAction().execute(new InsertInput(PetTableProducer.NAME).withRecords(List.of(
         new QRecord().withValue("name", "Santa's Little Helper").withValue("speciesId", PetSpeciesPVSProducer.Value.DOG.getPossibleValueId()).withValue("ownerPersonId", 1)
      )));
   }



   /***************************************************************************
    *
    ***************************************************************************/
   public void customizeQInstanceForAllSectionsCollapsibleAndInitiallyOpen(QInstance qInstance) throws QException
   {
      for(QFieldSection section : qInstance.getTable(PersonTableProducer.NAME).getSections())
      {
         section.setCollapsible(CollapsibleMetaData.INITIALLY_OPEN);
      }
   }



   /*******************************************************************************
    *
    *******************************************************************************/
   @Test
   @Tag("customizeQInstanceForAllSectionsCollapsibleAndInitiallyOpen")
   void testAllSectionsCollapsibleAndInitiallyOpen()
   {
      qSeleniumLib.gotoAndWaitForBreadcrumbHeaderToContain("/peopleApp/greetingsApp/person/1", "Homer");

      ////////////////////////////////////////////////////////////////
      // sections should initially be open, so values should appear //
      ////////////////////////////////////////////////////////////////
      assertDataSectionIsOpenAndCollapsible();
      assertPetsSectionIsOpenAndCollapsible();

      ////////////////////////////////////////////////////////////////////////
      // close both (one at a time) and the data they have should disappear //
      ////////////////////////////////////////////////////////////////////////
      clickDataSectionHeader();
      assertDataSectionIsClosed();
      assertPetsSectionIsOpenAndCollapsible();

      clickPetsSectionHeader();
      assertDataSectionIsClosed();
      assertPetsSectionIsClosed();

      ////////////////
      // reopen one //
      ////////////////
      clickDataSectionHeader();
      assertDataSectionIsOpenAndCollapsible();
      assertPetsSectionIsClosed();

      //////////////////////////////////////////////////////////////////////////
      // reload the page - state should stay the same thanks to local storage //
      //////////////////////////////////////////////////////////////////////////
      qSeleniumLib.driver.navigate().refresh();
      assertDataSectionIsOpenAndCollapsible();
      assertPetsSectionIsClosed();

      ///////////////////////////
      // re-open the other now //
      ///////////////////////////
      clickPetsSectionHeader();
      assertDataSectionIsOpenAndCollapsible();
      assertPetsSectionIsOpenAndCollapsible();

      ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
      // the T1 section shouldn't be collapsible.  so, there should only be 2 collapsible icons in the body of the screen. //
      ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
      List<WebElement> icons = qSeleniumLib.waitForSelectorAll(".recordView .MuiIcon-root", 2);
      assertThat(icons).filteredOn(e -> e.getText().contains("expand_less")).hasSize(2);

      /////////////////////////////////////////////////////////////////////////////////////////////////
      // data in the T1 section should be visible - and clicking the header there shouldn't hide it. //
      /////////////////////////////////////////////////////////////////////////////////////////////////
      qfmdSeleniumLib.waitForViewScreenFieldValue("First Name", "Homer");
      qSeleniumLib.waitForSelectorContaining("h5", "Viewing Person: Homer").click();
      qfmdSeleniumLib.waitForViewScreenFieldValue("First Name", "Homer");

      //qSeleniumLib.waitForever();
   }



   /***************************************************************************
    *
    ***************************************************************************/
   public void customizeQInstanceForAllSectionsNotCollapsible(QInstance qInstance) throws QException
   {
      for(QFieldSection section : qInstance.getTable(PersonTableProducer.NAME).getSections())
      {
         section.setCollapsible(CollapsibleMetaData.NOT_COLLAPSIBLE);
      }
   }



   /*******************************************************************************
    *
    *******************************************************************************/
   @Test
   @Tag("customizeQInstanceForAllSectionsNotCollapsible")
   void testAllSectionsNotCollapsible()
   {
      qSeleniumLib.gotoAndWaitForBreadcrumbHeaderToContain("/peopleApp/greetingsApp/person/1", "Homer");

      ////////////////////////////////////////////////////////////////
      // sections should initially be open, so values should appear //
      ////////////////////////////////////////////////////////////////
      assertDataSectionIsOpenButNotCollapsible();
      assertPetsSectionIsOpenButNotCollapsible();

      ////////////////////////////////////////////////////////
      // clicking section headers shouldn't change anything //
      ////////////////////////////////////////////////////////
      clickDataSectionHeader();
      assertDataSectionIsOpenButNotCollapsible();
      assertPetsSectionIsOpenButNotCollapsible();

      clickPetsSectionHeader();
      assertDataSectionIsOpenButNotCollapsible();
      assertPetsSectionIsOpenButNotCollapsible();

      //qSeleniumLib.waitForever();
   }



   /***************************************************************************
    *
    ***************************************************************************/
   public void customizeQInstanceForAllSectionsCollapsibleAndInitiallyClosed(QInstance qInstance) throws QException
   {
      for(QFieldSection section : qInstance.getTable(PersonTableProducer.NAME).getSections())
      {
         section.setCollapsible(CollapsibleMetaData.INITIALLY_CLOSED);
      }
   }



   /*******************************************************************************
    *
    *******************************************************************************/
   @Test
   @Tag("customizeQInstanceForAllSectionsCollapsibleAndInitiallyClosed")
   void testAllSectionsCollapsibleAndInitiallyClosed()
   {
      qSeleniumLib.gotoAndWaitForBreadcrumbHeaderToContain("/peopleApp/greetingsApp/person/1", "Homer");

      /////////////////////////////////////////
      // sections should initially be closed //
      /////////////////////////////////////////
      assertDataSectionIsClosed();
      assertPetsSectionIsClosed();

      ////////////////////////////////////////////////////////////////////////
      // open both (one at a time) and the data they have should disappear //
      ////////////////////////////////////////////////////////////////////////
      clickDataSectionHeader();
      assertDataSectionIsOpenAndCollapsible();
      assertPetsSectionIsClosed();

      clickPetsSectionHeader();
      assertDataSectionIsOpenAndCollapsible();
      assertPetsSectionIsOpenAndCollapsible();

      //////////////////
      // re-close one //
      //////////////////
      clickDataSectionHeader();
      assertDataSectionIsClosed();
      assertPetsSectionIsOpenAndCollapsible();

      //////////////////////////////////////////////////////////////////////////
      // reload the page - state should stay the same thanks to local storage //
      //////////////////////////////////////////////////////////////////////////
      qSeleniumLib.driver.navigate().refresh();
      assertDataSectionIsClosed();
      assertPetsSectionIsOpenAndCollapsible();

      ////////////////////////////
      // re-close the other now //
      ////////////////////////////
      clickPetsSectionHeader();
      assertDataSectionIsClosed();
      assertPetsSectionIsClosed();

      //qSeleniumLib.waitForever();
   }



   /***************************************************************************
    *
    ***************************************************************************/
   private void clickPetsSectionHeader()
   {
      qSeleniumLib.waitForSelectorContaining("h6", "Pets").click();
   }



   /***************************************************************************
    *
    ***************************************************************************/
   private void clickDataSectionHeader()
   {
      qSeleniumLib.waitForSelectorContaining("h6", "Data").click();
   }



   /***************************************************************************
    *
    ***************************************************************************/
   private void assertPetsSectionIsClosed()
   {
      qfmdSeleniumLib.waitForDataGridContentToNotExist("Santa's Little Helper");
      WebElement h6 = qSeleniumLib.waitForSelectorContaining("h6", "Pets");

      List<WebElement> icons = qSeleniumLib.getAncestor(h6, 3).findElements(By.className("MuiIcon-root"));
      assertThat(icons).anyMatch(e -> e.getText().contains("expand_more"));
      assertThat(icons).noneMatch(e -> e.getText().contains("save_alt"));
   }



   /***************************************************************************
    *
    ***************************************************************************/
   private void assertDataSectionIsClosed()
   {
      qfmdSeleniumLib.waitForViewScreenFieldValueToNotExist("Is Alive", "Yes");
      WebElement h6 = qSeleniumLib.waitForSelectorContaining("h6", "Data");

      WebElement icon = qSeleniumLib.getParent(h6).findElement(By.className("MuiIcon-root"));
      assertThat(icon.getText()).contains("expand_more");
   }



   /***************************************************************************
    *
    ***************************************************************************/
   private void assertPetsSectionIsOpenAndCollapsible()
   {
      qfmdSeleniumLib.waitForDataGridContent("Santa's Little Helper");
      WebElement h6 = qSeleniumLib.waitForSelectorContaining("h6", "Pets");

      List<WebElement> icons = qSeleniumLib.getAncestor(h6, 3).findElements(By.className("MuiIcon-root"));
      assertThat(icons).anyMatch(e -> e.getText().contains("expand_less"));

      /////////////////////////////
      // this is the export icon //
      /////////////////////////////
      assertThat(icons).anyMatch(e -> e.getText().contains("save_alt"));
   }



   /***************************************************************************
    *
    ***************************************************************************/
   private void assertDataSectionIsOpenAndCollapsible()
   {
      qfmdSeleniumLib.waitForViewScreenFieldValue("Is Alive", "Yes");
      WebElement h6 = qSeleniumLib.waitForSelectorContaining("h6", "Data");

      WebElement icon = qSeleniumLib.getParent(h6).findElement(By.className("MuiIcon-root"));
      assertThat(icon.getText()).contains("expand_less");
   }


   /***************************************************************************
    *
    ***************************************************************************/
   private void assertPetsSectionIsOpenButNotCollapsible()
   {
      qfmdSeleniumLib.waitForDataGridContent("Santa's Little Helper");
      WebElement h6 = qSeleniumLib.waitForSelectorContaining("h6", "Pets");

      List<WebElement> icons = qSeleniumLib.getAncestor(h6, 3).findElements(By.className("MuiIcon-root"));
      assertThat(icons).noneMatch(e -> e.getText().contains("expand_less"));

      /////////////////////////////
      // this is the export icon //
      /////////////////////////////
      assertThat(icons).anyMatch(e -> e.getText().contains("save_alt"));
   }



   /***************************************************************************
    *
    ***************************************************************************/
   private void assertDataSectionIsOpenButNotCollapsible()
   {
      qfmdSeleniumLib.waitForViewScreenFieldValue("Is Alive", "Yes");
      WebElement h6 = qSeleniumLib.waitForSelectorContaining("h6", "Data");

      assertThatThrownBy(() -> qSeleniumLib.getParent(h6).findElement(By.className("MuiIcon-root")));
   }

}
