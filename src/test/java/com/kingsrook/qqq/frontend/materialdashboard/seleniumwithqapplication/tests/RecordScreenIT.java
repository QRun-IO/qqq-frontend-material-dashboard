/*
 * QQQ - Low-code Application Framework for Engineers.
 * Copyright (C) 2021-2026.  Kingsrook, LLC
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
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import com.kingsrook.qqq.backend.core.actions.tables.InsertAction;
import com.kingsrook.qqq.backend.core.actions.tables.QueryAction;
import com.kingsrook.qqq.backend.core.context.CapturedContext;
import com.kingsrook.qqq.backend.core.context.QContext;
import com.kingsrook.qqq.backend.core.model.actions.tables.query.QueryInput;
import com.kingsrook.qqq.backend.core.model.actions.tables.query.QueryOutput;
import com.kingsrook.qqq.backend.core.model.session.QSystemUserSession;
import com.kingsrook.qqq.backend.core.exceptions.QException;
import com.kingsrook.qqq.backend.core.model.actions.tables.insert.InsertInput;
import com.kingsrook.qqq.backend.core.model.data.QRecord;
import com.kingsrook.qqq.backend.core.model.metadata.QInstance;
import com.kingsrook.qqq.backend.core.model.metadata.code.QCodeReference;
import com.kingsrook.qqq.backend.core.model.metadata.fields.CaseChangeBehavior;
import com.kingsrook.qqq.backend.core.model.metadata.help.QHelpContent;
import com.kingsrook.qqq.backend.core.model.metadata.help.QHelpRole;
import com.kingsrook.qqq.backend.core.model.metadata.fields.QFieldMetaData;
import com.kingsrook.qqq.backend.core.model.metadata.fields.QFieldType;
import com.kingsrook.qqq.backend.core.model.metadata.layout.QIcon;
import com.kingsrook.qqq.backend.core.model.metadata.layout.CollapsibleMetaData;
import com.kingsrook.qqq.backend.core.model.metadata.dashboard.QWidgetMetaData;
import com.kingsrook.qqq.backend.core.model.savedreports.SavedReport;
import com.kingsrook.qqq.backend.core.model.savedreports.SavedReportsMetaDataProvider;
import com.kingsrook.qqq.backend.core.model.metadata.tables.Association;
import com.kingsrook.qqq.backend.core.model.metadata.tables.TablesPossibleValueSourceMetaDataProvider;
import com.kingsrook.qqq.backend.core.model.metadata.tables.QFieldSection;
import com.kingsrook.qqq.backend.core.model.metadata.tables.QFieldSectionAlternativeType;
import com.kingsrook.qqq.backend.core.model.metadata.tables.QTableMetaData;
import com.kingsrook.qqq.backend.core.model.metadata.tables.SectionFactory;
import com.kingsrook.qqq.backend.core.model.metadata.tables.Tier;
import com.kingsrook.qqq.backend.core.model.common.TimeZonePossibleValueSourceMetaDataProvider;
import com.kingsrook.qqq.backend.core.model.scheduledjobs.ScheduledJob;
import com.kingsrook.qqq.backend.core.model.scheduledjobs.ScheduledJobsMetaDataProvider;
import com.kingsrook.qqq.frontend.materialdashboard.seleniumwithqapplication.metadata.PersonGreeterWidgetProducer;
import com.kingsrook.qqq.frontend.materialdashboard.seleniumwithqapplication.metadata.PersonJoinPetMetaDataProducer;
import com.kingsrook.qqq.frontend.materialdashboard.seleniumwithqapplication.metadata.PersonJoinPetWidgetMetaDataProducer;
import com.kingsrook.qqq.frontend.materialdashboard.seleniumwithqapplication.metadata.PetSpeciesPVSProducer;
import com.kingsrook.qqq.frontend.materialdashboard.seleniumwithqapplication.metadata.PetTableProducer;
import com.kingsrook.qqq.frontend.materialdashboard.selenium.lib.QueryScreenLib;
import com.kingsrook.qqq.frontend.materialdashboard.actions.formadjuster.FormAdjusterInput;
import com.kingsrook.qqq.frontend.materialdashboard.actions.formadjuster.FormAdjusterInterface;
import com.kingsrook.qqq.frontend.materialdashboard.actions.formadjuster.FormAdjusterOutput;
import com.kingsrook.qqq.frontend.materialdashboard.actions.formadjuster.FormAdjusterOutputBuilder;
import com.kingsrook.qqq.frontend.materialdashboard.model.metadata.MaterialDashboardFieldMetaData;
import com.kingsrook.qqq.frontend.materialdashboard.model.metadata.MaterialDashboardTableMetaData;
import com.kingsrook.qqq.frontend.materialdashboard.seleniumwithqapplication.lib.QBaseSeleniumWithQApplicationTest;
import com.kingsrook.qqq.frontend.materialdashboard.seleniumwithqapplication.metadata.MemoryBackendProducer;
import com.kingsrook.qqq.frontend.materialdashboard.seleniumwithqapplication.metadata.PeopleAppProducer;
import com.kingsrook.qqq.frontend.materialdashboard.seleniumwithqapplication.metadata.PersonTableProducer;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.Keys;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.interactions.Actions;
import static org.assertj.core.api.Assertions.assertThat;


/*******************************************************************************
 ** Selenium tests for the new unified RecordScreen component.
 ** Tests for the unified RecordScreen component (view, edit, create modes).
 *******************************************************************************/
public class RecordScreenIT extends QBaseSeleniumWithQApplicationTest
{
   private static final int SHORT_WAIT  = 50; // was 200-300ms — hover/click settle
   private static final int MEDIUM_WAIT = 100; // was 500ms — widget/grid render
   private static final int LONG_WAIT   = 250; // was 1000ms — modal close + grid reload

   private static final Keys MODIFIER_KEY = System.getProperty("os.name").toLowerCase().contains("mac") ? Keys.COMMAND : Keys.CONTROL;

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
      if(setupTestDataViaTestMethodTagSpecifyingSetupTestDataMethodName())
      {
         return;
      }

      new InsertAction().execute(new InsertInput(PersonTableProducer.NAME).withRecords(List.of(
         new QRecord().withValue("firstName", "Homer").withValue("lastName", "Simpson").withValue("isAlive", true),
         new QRecord().withValue("firstName", "Marge").withValue("lastName", "Simpson").withValue("isAlive", true)
      )));
   }



   /*******************************************************************************
    * Test create screen behaviors: Escape is a no-op, Cancel navigates away,
    * and filling fields + saving creates the record end-to-end.
    *******************************************************************************/
   @Test
   void testCreateScreenBehaviorAndSaveRecord()
   {
      qSeleniumLib.gotoAndWaitForBreadcrumbHeaderToContain("/peopleApp/greetingsApp/person/create", "Creating New");
      qSeleniumLib.waitForSelectorContaining("h5", "Creating New Person");
      qSeleniumLib.waitForSelector("input[name='firstName']");

      ///////////////////////////////////////////////////
      // verify Escape on create screen does nothing   //
      ///////////////////////////////////////////////////
      WebElement body = driver.findElement(By.tagName("body"));
      body.sendKeys(Keys.ESCAPE);
      qSeleniumLib.waitForMillis(MEDIUM_WAIT);
      qSeleniumLib.waitForSelectorContaining("h5", "Creating New Person");
      qSeleniumLib.waitForSelector("input[name='firstName']");

      ///////////////////////////////////////////////////
      // verify Cancel navigates away from create      //
      ///////////////////////////////////////////////////
      qSeleniumLib.waitForSelectorContaining("button", "Cancel").click();
      qSeleniumLib.waitForSelectorContainingToNotExist("h5", "Creating New Person");

      /////////////////////////////////////////////////////
      // navigate back to create and do the full flow    //
      /////////////////////////////////////////////////////
      qSeleniumLib.gotoAndWaitForBreadcrumbHeaderToContain("/peopleApp/greetingsApp/person/create", "Creating New");

      WebElement firstNameInput = qSeleniumLib.waitForSelector("input[name='firstName']");
      firstNameInput.sendKeys("Bart");

      WebElement lastNameInput = qSeleniumLib.waitForSelector("input[name='lastName']");
      lastNameInput.sendKeys("Simpson");

      qSeleniumLib.waitForSelectorContaining("button", "Save").click();

      qSeleniumLib.waitForSelectorContaining(".MuiAlert-message", "successfully created");
      qSeleniumLib.waitForSelectorContaining("[data-qqq-id='record-screen-title-person']", "Viewing Person: Bart Simpson");
   }



   /*******************************************************************************
    * Test that confirming delete actually deletes the record and navigates away
    *******************************************************************************/
   @Test
   void testDeleteRecordConfirm()
   {
      qSeleniumLib.gotoAndWaitForBreadcrumbHeaderToContain("/peopleApp/greetingsApp/person/1", "Homer");
      qSeleniumLib.waitForSelector("[data-qqq-id='record-screen-person']");

      //////////////////////////////////
      // open the delete confirmation //
      //////////////////////////////////
      qSeleniumLib.waitForSelectorContaining("button", "Delete").click();
      qSeleniumLib.waitForSelectorContaining(".MuiDialogTitle-root", "Confirm Deletion");

      //////////////////////
      // confirm deletion //
      //////////////////////
      qSeleniumLib.waitForSelectorContaining("button", "Yes").click();

      ////////////////////////////////////////////////////////////////////////
      // verify we navigate away from the record (back to the query screen) //
      ////////////////////////////////////////////////////////////////////////
      qSeleniumLib.waitForSelectorContainingToNotExist("h5", "Viewing Person: Homer");
   }



   /*******************************************************************************
    * Test that entering edit via pencil icon, then saving (both via button click
    * and via Cmd+S keyboard shortcut), returns to view mode with updated values.
    *******************************************************************************/
   @Test
   void testPencilEditSaveAndCtrlSSave()
   {
      qSeleniumLib.gotoAndWaitForBreadcrumbHeaderToContain("/peopleApp/greetingsApp/person/1", "Homer");
      qSeleniumLib.waitForSelector("[data-qqq-id='record-screen-person']");

      /////////////////////////////////////////////
      // round 1: edit via pencil, save via button //
      /////////////////////////////////////////////
      enterEditModeViaPencilIcon();

      WebElement firstNameInput = qSeleniumLib.waitForSelector("input[name='firstName']");
      firstNameInput.sendKeys(Keys.chord(MODIFIER_KEY, "a"));
      firstNameInput.sendKeys("Bart");
      WebElement saveButton = qSeleniumLib.waitForSelectorContaining(".stickyBottomButtonBar button", "Save");
      ((JavascriptExecutor) driver).executeScript("arguments[0].click();", saveButton);

      qSeleniumLib.waitForSelectorContaining(".MuiAlert-message", "successfully updated");
      qSeleniumLib.waitForSelectorContaining("[data-qqq-id='record-screen-title-person']", "Viewing Person: Bart Simpson");
      qSeleniumLib.waitForSelectorToNotExist("input[name='firstName']");
      qSeleniumLib.waitForSelectorContaining("button", "Actions");

      ///////////////////////////////////////////////
      // round 2: re-enter edit, save via Cmd+S   //
      ///////////////////////////////////////////////
      enterEditModeViaPencilIcon();

      firstNameInput = qSeleniumLib.waitForSelector("input[name='firstName']");
      firstNameInput.sendKeys(Keys.chord(MODIFIER_KEY, "a"));
      firstNameInput.sendKeys("Homer");
      firstNameInput.sendKeys(Keys.chord(MODIFIER_KEY, "s"));

      qSeleniumLib.waitForSelectorContaining(".MuiAlert-message", "successfully updated");
      qSeleniumLib.waitForSelectorContaining("[data-qqq-id='record-screen-title-person']", "Viewing Person: Homer Simpson");
   }



   /*******************************************************************************
    * Test cancel flows: pencil-cancel preserves original values, Edit-Cancel-Edit
    * does not produce a /edit/edit path.
    *******************************************************************************/
   @Test
   void testCancelFlowsAndNoDoubleEditPath()
   {
      qSeleniumLib.gotoAndWaitForBreadcrumbHeaderToContain("/peopleApp/greetingsApp/person/1", "Homer");
      qSeleniumLib.waitForSelector("[data-qqq-id='record-screen-person']");

      //////////////////////////////////////////////////////////////
      // enter edit via pencil, change a value, cancel, and       //
      // verify original values are restored (not the changed one) //
      //////////////////////////////////////////////////////////////
      enterEditModeViaPencilIcon();

      WebElement firstNameInput = qSeleniumLib.waitForSelector("input[name='firstName']");
      firstNameInput.sendKeys(Keys.chord(MODIFIER_KEY, "a"));
      firstNameInput.sendKeys("CHANGED");

      WebElement cancelButton = qSeleniumLib.waitForSelectorContaining("button", "Cancel");
      ((JavascriptExecutor) driver).executeScript("arguments[0].click();", cancelButton);

      //////////////////////////////
      // verify back in view mode //
      //////////////////////////////
      qSeleniumLib.waitForSelectorContaining("[data-qqq-id='record-screen-title-person']", "Viewing Person: Homer Simpson");
      qSeleniumLib.waitForSelectorContaining(".recordScreen", "Homer");
      qSeleniumLib.waitForSelectorContainingToNotExist(".recordScreen", "CHANGED");
      qSeleniumLib.waitForSelectorToNotExist("input[name='firstName']");
      qSeleniumLib.waitForSelectorContaining("button", "Actions");

      ///////////////////////////////////////////////////////////////
      // now Edit via button > Cancel > Edit again — no /edit/edit //
      ///////////////////////////////////////////////////////////////
      qSeleniumLib.waitForSelectorContaining("button", "Edit").click();
      qSeleniumLib.waitForSelectorContaining("h5", "Edit Person");

      qSeleniumLib.waitForSelectorContaining("button", "Cancel").click();
      qSeleniumLib.waitForSelectorContaining("h5", "Viewing Person");

      qSeleniumLib.waitForSelectorContaining("button", "Edit").click();
      qSeleniumLib.waitForSelectorContaining("h5", "Edit Person");

      ///////////////////////////////////////////////////////////////////
      // verify we're still on the edit screen (not redirected home)   //
      // and the URL does not contain /edit/edit (the double-edit bug) //
      ///////////////////////////////////////////////////////////////////
      qSeleniumLib.waitForSelectorContaining("h5", "Edit Person");
      qSeleniumLib.waitForSelector("input[name='firstName']");
      assertThat(driver.getCurrentUrl())
         .as("URL should not contain /edit/edit")
         .doesNotContain("/edit/edit");
   }



   /*******************************************************************************
    * Test that clicking a field's pencil icon puts focus into that field's input.
    *******************************************************************************/
   @Test
   void testPencilClickFocusesField()
   {
      qSeleniumLib.gotoAndWaitForBreadcrumbHeaderToContain("/peopleApp/greetingsApp/person/1", "Homer");
      qSeleniumLib.waitForSelector("[data-qqq-id='record-screen-person']");

      //////////////////////////////////////////////////////////////
      // hover over the Last Name field and click its pencil icon //
      //////////////////////////////////////////////////////////////
      WebElement lastNameField = qSeleniumLib.waitForSelector("[data-field-name='lastName']");
      qSeleniumLib.moveMouseCursorToElement(lastNameField);
      qSeleniumLib.waitForMillis(SHORT_WAIT);

      /////////////////////////////////////////////////////////////////////
      // click the pencil (edit) icon specifically on the lastName field //
      /////////////////////////////////////////////////////////////////////
      WebElement pencilIcon = qSeleniumLib.waitForSelector("[data-field-name='lastName'] .field-action-icons .MuiIconButton-root:last-child");
      pencilIcon.click();

      ////////////////////////////////
      // verify edit mode activated //
      ////////////////////////////////
      qSeleniumLib.waitForSelectorContaining("h5", "Edit Person");

      /////////////////////////////////////////
      // verify the lastName input has focus //
      /////////////////////////////////////////
      WebElement lastNameInput = qSeleniumLib.waitForSelector("input[name='lastName']");
      qSeleniumLib.waitForElementToHaveFocus(lastNameInput);
   }



   /*******************************************************************************
    * Helper: hover over a field and click its pencil icon to enter edit mode.
    *******************************************************************************/
   private void enterEditModeViaPencilIcon()
   {
      WebElement field = qSeleniumLib.waitForSelector("[data-field-name='firstName']");
      qSeleniumLib.moveMouseCursorToElement(field);
      qSeleniumLib.waitForMillis(SHORT_WAIT);
      qSeleniumLib.waitForSelector("[data-field-name='firstName'] .field-action-icons .MuiIconButton-root:last-child").click();
      qSeleniumLib.waitForSelectorContaining("h5", "Edit Person");
   }



   /*******************************************************************************
    * Test that boolean switches work in edit mode — clicking the switch toggles
    * the value from Yes to No (or vice versa).
    *******************************************************************************/
   @Test
   void testBooleanSwitchToggles()
   {
      qSeleniumLib.gotoAndWaitForBreadcrumbHeaderToContain("/peopleApp/greetingsApp/person/1", "Homer");
      qSeleniumLib.waitForSelector("[data-qqq-id='record-screen-person']");

      /////////////////////
      // enter edit mode //
      /////////////////////
      enterEditModeViaPencilIcon();

      ///////////////////////////////////////////////////////////////
      // the switch should start checked (isAlive=true) — click it //
      ///////////////////////////////////////////////////////////////
      WebElement switchInput = qSeleniumLib.waitForSelector(".MuiSwitch-root input[type='checkbox']");
      assertThat(switchInput.isSelected()).as("Switch should start as checked (isAlive=true)").isTrue();

      WebElement switchElement = qSeleniumLib.waitForSelector(".MuiSwitch-root");
      switchElement.click();
      qSeleniumLib.waitForMillis(SHORT_WAIT);

      ////////////////////////////////////////
      // verify the switch is now unchecked //
      ////////////////////////////////////////
      assertThat(switchInput.isSelected()).as("Switch should be unchecked after clicking").isFalse();

      /////////////////////
      // save the record //
      /////////////////////
      WebElement saveButton = qSeleniumLib.waitForSelectorContaining(".stickyBottomButtonBar button", "Save");
      ((JavascriptExecutor) driver).executeScript("arguments[0].click();", saveButton);

      ///////////////////////////////////////////////////////////////////
      // verify success and that the boolean shows "No" on view screen //
      ///////////////////////////////////////////////////////////////////
      qSeleniumLib.waitForSelectorContaining(".MuiAlert-message", "successfully updated");
      qSeleniumLib.waitForSelectorContaining("[data-qqq-id='record-screen-title-person']", "Viewing Person");
      qSeleniumLib.waitForSelectorContaining("[data-field-name='isAlive']", "No");
   }



   /*******************************************************************************
    * Customize QInstance for the scroll-stability test: add a "bigPerson" table
    * with 10 sections of 15 fields each.
    *******************************************************************************/
   public void customizeQInstanceForScrollStabilityTest(QInstance qInstance) throws QException
   {
      QTableMetaData table = new QTableMetaData()
         .withName("bigPerson")
         .withBackendName(MemoryBackendProducer.NAME)
         .withField(new QFieldMetaData("id", QFieldType.INTEGER))
         .withPrimaryKeyField("id")
         .withRecordLabelFormatAndFields("%s", "id");

      List<String> t1Fields = new ArrayList<>();
      t1Fields.add("id");
      for(int f = 1; f <= 5; f++)
      {
         String fieldName = "t1Field" + f;
         table.withField(new QFieldMetaData(fieldName, QFieldType.STRING));
         t1Fields.add(fieldName);
      }
      table.withSection(SectionFactory.defaultT1(t1Fields.toArray(new String[0])));

      for(int s = 1; s <= 10; s++)
      {
         List<String> fieldNames = new ArrayList<>();
         for(int f = 1; f <= 15; f++)
         {
            String fieldName = "section" + s + "Field" + f;
            table.withField(new QFieldMetaData(fieldName, QFieldType.STRING));
            fieldNames.add(fieldName);
         }
         table.withSection(SectionFactory.customT2("section" + s, new QIcon("folder"), fieldNames.toArray(new String[0])).withLabel("Section " + s));
      }

      qInstance.addTable(table);
      PeopleAppProducer.addTableToGreetingsApp(qInstance, "bigPerson");
   }



   /***************************************************************************
    *
    ***************************************************************************/
   public void setupTestDataForScrollStabilityTest() throws QException
   {
      QRecord record = new QRecord().withValue("id", 1);
      for(int f = 1; f <= 5; f++)
      {
         record.withValue("t1Field" + f, "T1 Value " + f);
      }
      for(int s = 1; s <= 10; s++)
      {
         for(int f = 1; f <= 15; f++)
         {
            record.withValue("section" + s + "Field" + f, "S" + s + " Value " + f);
         }
      }
      new InsertAction().execute(new InsertInput("bigPerson").withRecords(List.of(record)));
   }



   /*******************************************************************************
    * Test that entering edit mode on a field deep in a large form preserves
    * that field's visual position (scroll correction).
    *******************************************************************************/
   @Test
   @Tag("customizeQInstanceForScrollStabilityTest")
   @Tag("setupTestDataForScrollStabilityTest")
   void testEditModeScrollStability()
   {
      qSeleniumLib.gotoAndWaitForBreadcrumbHeaderToContain("/peopleApp/greetingsApp/bigPerson/1", "1");
      qSeleniumLib.waitForSelector("[data-qqq-id='record-screen-bigperson']");

      ///////////////////////////////////////////////////////////////////
      // scroll to a field in section 5 (middle of the page)           //
      // use the section header to scroll, then find the field by name //
      ///////////////////////////////////////////////////////////////////
      WebElement section5Header = qSeleniumLib.waitForSelectorContaining("h6", "Section 5");
      ((JavascriptExecutor) driver).executeScript("arguments[0].scrollIntoView({block: 'start'});", section5Header);
      qSeleniumLib.waitForMillis(SHORT_WAIT);
      WebElement targetField = qSeleniumLib.waitForSelectorContaining(".recordScreen", "S5 Value 1");
      ((JavascriptExecutor) driver).executeScript("arguments[0].scrollIntoView({block: 'center'});", targetField);
      qSeleniumLib.waitForMillis(SHORT_WAIT);

      //////////////////////////////////////////////////////////////////
      // record the section header's Y position on screen before edit //
      //////////////////////////////////////////////////////////////////
      double yBefore = ((Number) ((JavascriptExecutor) driver).executeScript(
         "return arguments[0].getBoundingClientRect().top;", section5Header)).doubleValue();

      ///////////////////////////////////////////////////////////////
      // hover over a field in section 5 and click its pencil icon //
      ///////////////////////////////////////////////////////////////
      WebElement s5Field = qSeleniumLib.waitForSelector("[data-field-name='section5Field1']");
      qSeleniumLib.moveMouseCursorToElement(s5Field);
      qSeleniumLib.waitForMillis(SHORT_WAIT);
      WebElement pencilIcon = qSeleniumLib.waitForSelector("[data-field-name='section5Field1'] .field-action-icons .MuiIconButton-root:last-child");
      pencilIcon.click();

      ////////////////////////////////
      // verify edit mode activated //
      ////////////////////////////////
      qSeleniumLib.waitForSelectorContaining("h5", "Edit ");

      ////////////////////////////////////////////////////////////
      // find the section header again and check its Y position //
      ////////////////////////////////////////////////////////////
      qSeleniumLib.waitForMillis(SHORT_WAIT);
      WebElement section5HeaderAfter = qSeleniumLib.waitForSelectorContaining("h6", "Section 5");
      double yAfter = ((Number) ((JavascriptExecutor) driver).executeScript(
         "return arguments[0].getBoundingClientRect().top;", section5HeaderAfter)).doubleValue();

      //////////////////////////////////////////////////////////////
      // the field should be within 50px of its original position //
      //////////////////////////////////////////////////////////////
      double drift = Math.abs(yAfter - yBefore);
      assertThat(drift).as("Section 5 should not move more than 50px when entering edit mode (moved " + drift + "px)").isLessThan(50.0);
   }



   ////////////////////////////////////////////////////////////////////////////////
   // Test that breadcrumb shows record ID after entering edit mode via keyboard //
   // shortcut, and that clicking the record ID breadcrumb link exits edit mode. //
   ////////////////////////////////////////////////////////////////////////////////
   @Test
   void testBreadcrumbShowsRecordIdInEditMode()
   {
      qSeleniumLib.gotoAndWaitForBreadcrumbHeaderToContain("/peopleApp/greetingsApp/person/1", "Homer");
      qSeleniumLib.waitForSelector("[data-qqq-id='record-screen-person']");

      ///////////////////////////////////////////////
      // enter edit mode via 'e' keyboard shortcut //
      ///////////////////////////////////////////////
      new Actions(driver).sendKeys("e").perform();
      qSeleniumLib.waitForSelectorContaining("h5", "Edit Person");

      ///////////////////////////////////////////////////////////
      // verify the record ID "1" appears as a breadcrumb link //
      ///////////////////////////////////////////////////////////
      WebElement breadcrumbLink = qSeleniumLib.waitForSelectorContaining(".MuiBreadcrumbs-root a", "1");
      assertThat(breadcrumbLink).isNotNull();

      /////////////////////////////////////////////////////////////////
      // click the record ID breadcrumb link — should exit edit mode //
      /////////////////////////////////////////////////////////////////
      breadcrumbLink.click();

      ///////////////////////////////////////////////////////////////////////////////
      // verify we are back in view mode (no input fields, Actions button visible) //
      ///////////////////////////////////////////////////////////////////////////////
      qSeleniumLib.waitForSelectorToNotExist("input[name='firstName']");
      qSeleniumLib.waitForSelectorContaining("button", "Actions");
   }



   /***************************************************************************
    * Make the Pets widget a managed association so it appears on edit screens.
    ***************************************************************************/
   public void customizeQInstanceForWidgetRerenderTest(QInstance qInstance)
   {
      ((QWidgetMetaData) qInstance.getWidget(PersonJoinPetWidgetMetaDataProducer.NAME))
         .withDefaultValue("manageAssociationName", PetTableProducer.NAME);

      QTableMetaData personTable = qInstance.getTable(PersonTableProducer.NAME);
      personTable.withAssociation(new Association()
         .withName(PetTableProducer.NAME)
         .withAssociatedTableName(PetTableProducer.NAME)
         .withJoinName(PersonJoinPetMetaDataProducer.NAME));
   }


   /***************************************************************************
    * Enable the "Add new" button on the Pets child record widget.
    ***************************************************************************/
   public void customizeQInstanceForAddChildRecordTest(QInstance qInstance)
   {
      ((QWidgetMetaData) qInstance.getWidget(PersonJoinPetWidgetMetaDataProducer.NAME))
         .withDefaultValue("canAddChildRecord", true)
         .withDefaultValue("allowRecordEdit", true)
         .withDefaultValue("allowRecordDelete", true);
   }



   /***************************************************************************
    * Insert pet records so the pets widget has content to render.
    ***************************************************************************/
   public void setupTestDataForWidgetRerenderTest() throws QException
   {
      new InsertAction().execute(new InsertInput(PersonTableProducer.NAME).withRecords(List.of(
         new QRecord().withValue("firstName", "Homer").withValue("lastName", "Simpson").withValue("isAlive", true)
      )));

      new InsertAction().execute(new InsertInput(PetTableProducer.NAME).withRecords(List.of(
         new QRecord().withValue("name", "Santa's Little Helper").withValue("speciesId", 1).withValue("ownerPersonId", 1),
         new QRecord().withValue("name", "Snowball II").withValue("speciesId", 2).withValue("ownerPersonId", 1)
      )));
   }



   /*******************************************************************************
    * Test that a managed-association widget (childRecordList with
    * manageAssociationName) remains visible when entering edit mode via
    * instant-edit, and does NOT re-render on every keystroke.
    *******************************************************************************/
   @Test
   @Tag("customizeQInstanceForWidgetRerenderTest")
   @Tag("setupTestDataForWidgetRerenderTest")
   void testManagedWidgetPersistsInEditModeWithoutRerender()
   {
      qSeleniumLib.gotoAndWaitForBreadcrumbHeaderToContain("/peopleApp/greetingsApp/person/1", "Homer");
      qSeleniumLib.waitForSelector("[data-qqq-id='record-screen-person']");

      ///////////////////////////////////////////////////////////////////
      // wait for the pets widget to fully render with data grid cells //
      ///////////////////////////////////////////////////////////////////
      qSeleniumLib.waitForSelector(".MuiDataGrid-root");
      qSeleniumLib.waitForMillis(MEDIUM_WAIT);

      /////////////////////
      // enter edit mode //
      /////////////////////
      enterEditModeViaPencilIcon();

      /////////////////////////////////////////////////////
      // verify the widget is still present in edit mode //
      /////////////////////////////////////////////////////
      qSeleniumLib.waitForSelector(".MuiDataGrid-root");
      qSeleniumLib.waitForMillis(MEDIUM_WAIT);

      ///////////////////////////////////////////////////////////
      // stamp a marker attribute on the DataGrid root element //
      ///////////////////////////////////////////////////////////
      ((JavascriptExecutor) driver).executeScript(
         "document.querySelector('.MuiDataGrid-root').setAttribute('data-rerender-marker', 'original');"
      );
      qSeleniumLib.waitForSelector("[data-rerender-marker='original']");

      //////////////////////////////////////////////////////
      // type several characters into the firstName input //
      //////////////////////////////////////////////////////
      WebElement firstNameInput = qSeleniumLib.waitForSelector("input[name='firstName']");
      firstNameInput.sendKeys("X");
      qSeleniumLib.waitForMillis(SHORT_WAIT);
      firstNameInput.sendKeys("Y");
      qSeleniumLib.waitForMillis(SHORT_WAIT);
      firstNameInput.sendKeys("Z");
      qSeleniumLib.waitForMillis(MEDIUM_WAIT);

      ///////////////////////////////////////////////////////////////////
      // verify the marker is STILL present — widget did not re-render //
      ///////////////////////////////////////////////////////////////////
      List<WebElement> survivingMarkers = driver.findElements(By.cssSelector("[data-rerender-marker='original']"));
      assertThat(survivingMarkers)
         .as("Widget DataGrid should retain its DOM marker after keystrokes (re-render detected if empty)")
         .isNotEmpty();
   }



   /*******************************************************************************
    * Test that widget sections do NOT re-fetch data when the user scrolls the
    * page in view mode.
    *******************************************************************************/
   @Test
   @Tag("setupTestDataForWidgetRerenderTest")
   void testWidgetDoesNotRerenderOnScroll()
   {
      ///////////////////////////////////////////////////
      // load view mode at full size so widget renders //
      ///////////////////////////////////////////////////
      qSeleniumLib.gotoAndWaitForBreadcrumbHeaderToContain("/peopleApp/greetingsApp/person/1", "Homer");
      qSeleniumLib.waitForSelector("[data-qqq-id='record-screen-person']");
      qSeleniumLib.waitForSelector(".MuiDataGrid-root");
      qSeleniumLib.waitForMillis(MEDIUM_WAIT);

      //////////////////////////////////////////////////
      // shrink window so the page requires scrolling //
      //////////////////////////////////////////////////
      driver.manage().window().setSize(new org.openqa.selenium.Dimension(1200, 600));
      qSeleniumLib.waitForMillis(SHORT_WAIT);

      ///////////////////////////////////////////////////////////
      // install a fetch interceptor to count widget API calls //
      ///////////////////////////////////////////////////////////
      ((JavascriptExecutor) driver).executeScript(
         "window.__widgetFetchCount = 0;" +
         "const originalFetch = window.fetch;" +
         "window.fetch = function() {" +
         "   if (arguments[0] && arguments[0].toString().indexOf('/widget/') !== -1) {" +
         "      window.__widgetFetchCount++;" +
         "   }" +
         "   return originalFetch.apply(this, arguments);" +
         "};"
      );

      ///////////////////////////////////////////
      // scroll down and back up several times //
      ///////////////////////////////////////////
      ((JavascriptExecutor) driver).executeScript("window.scrollBy(0, 300);");
      qSeleniumLib.waitForMillis(MEDIUM_WAIT);
      ((JavascriptExecutor) driver).executeScript("window.scrollBy(0, 300);");
      qSeleniumLib.waitForMillis(MEDIUM_WAIT);
      ((JavascriptExecutor) driver).executeScript("window.scrollBy(0, -600);");
      qSeleniumLib.waitForMillis(MEDIUM_WAIT);

      ///////////////////////////////////////////////////////////
      // verify NO widget API calls were made during scrolling //
      ///////////////////////////////////////////////////////////
      long widgetFetchCount = (long) ((JavascriptExecutor) driver).executeScript("return window.__widgetFetchCount;");
      assertThat(widgetFetchCount)
         .as("Widget should not re-fetch data on scroll (fetch count should be 0, was " + widgetFetchCount + ")")
         .isEqualTo(0);
   }



   /*******************************************************************************
    * Test view-mode child record operations: edit an existing child via pencil
    * icon, then add a new child via "Add new" button — verifying grid updates.
    *******************************************************************************/
   @Test
   @Tag("customizeQInstanceForAddChildRecordTest")
   @Tag("setupTestDataForWidgetRerenderTest")
   void testViewModeChildRecordEditAndAdd()
   {
      qSeleniumLib.gotoAndWaitForBreadcrumbHeaderToContain("/peopleApp/greetingsApp/person/1", "Homer");
      qSeleniumLib.waitForSelector("[data-qqq-id='record-screen-person']");

      ///////////////////////////////////////////////////////////
      // wait for the pets widget to render with existing data //
      ///////////////////////////////////////////////////////////
      qSeleniumLib.waitForSelector(".MuiDataGrid-root");
      qSeleniumLib.waitForMillis(MEDIUM_WAIT);

      /////////////////////////////////////
      // verify we currently have 2 pets //
      /////////////////////////////////////
      List<WebElement> rowsBefore = driver.findElements(By.cssSelector(".MuiDataGrid-row"));
      assertThat(rowsBefore).hasSize(2);
      qSeleniumLib.waitForSelectorContaining(".MuiDataGrid-root", "Santa's Little Helper");

      //////////////////////////////////////////////////
      // click the edit pencil on the first child row //
      //////////////////////////////////////////////////
      WebElement editIcon = qSeleniumLib.waitForSelector(".MuiDataGrid-root .MuiDataGrid-row .MuiIconButton-root");
      ((JavascriptExecutor) driver).executeScript("arguments[0].click();", editIcon);

      /////////////////////////////////////////////////////////
      // verify the edit modal opens and change the pet name //
      /////////////////////////////////////////////////////////
      qSeleniumLib.waitForSelectorContaining(".modalEditForm h5", "Editing Pet");
      WebElement nameInput = qSeleniumLib.waitForSelector(".modalEditForm input[name='name']");
      nameInput.clear();
      nameInput.sendKeys("Santos L. Halper");

      qSeleniumLib.waitForSelectorContaining(".modalEditForm button", "OK").click();
      qSeleniumLib.waitForMillis(LONG_WAIT);

      ////////////////////////////////////////////
      // verify the updated name is in the grid //
      ////////////////////////////////////////////
      qSeleniumLib.waitForSelector(".MuiDataGrid-root");
      qSeleniumLib.waitForSelectorContaining(".MuiDataGrid-root", "Santos L. Halper");

      /////////////////////////////////////////////////////
      // now add a new child record via "Add new" button //
      /////////////////////////////////////////////////////
      qSeleniumLib.waitForSelectorContaining("button", "Add new").click();
      qSeleniumLib.waitForMillis(MEDIUM_WAIT);

      qSeleniumLib.waitForSelectorContaining(".modalEditForm h5", "Creating New Pet");

      WebElement newNameInput = qSeleniumLib.waitForSelector(".modalEditForm input[name='name']");
      newNameInput.sendKeys("Bart's Dog");

      WebElement speciesInput = qSeleniumLib.waitForSelector(".modalEditForm #speciesId");
      speciesInput.click();
      speciesInput.sendKeys("Dog");
      qSeleniumLib.waitForMillis(MEDIUM_WAIT);
      qSeleniumLib.waitForSelectorContaining("li", "Dog").click();
      qSeleniumLib.waitForMillis(SHORT_WAIT);

      qSeleniumLib.waitForSelectorContaining(".modalEditForm button", "Save").click();
      qSeleniumLib.waitForMillis(LONG_WAIT);

      ///////////////////////////////////////////
      // verify we now have 3 pets in the grid //
      ///////////////////////////////////////////
      qSeleniumLib.waitForSelector(".MuiDataGrid-root");
      List<WebElement> rowsAfter = driver.findElements(By.cssSelector(".MuiDataGrid-row"));
      assertThat(rowsAfter)
         .as("Grid should show 3 rows after adding a new child record")
         .hasSize(3);
   }



   /***************************************************************************
    * Customize qInstance to add a non-editable "internalCode" field to the
    * person table — used to detect value leaking from view to create screen.
    ***************************************************************************/
   public void customizeQInstanceForLeakTest(QInstance qInstance)
   {
      QTableMetaData personTable = qInstance.getTable(PersonTableProducer.NAME);
      personTable.withField(new QFieldMetaData("internalCode", QFieldType.STRING).withIsEditable(false));

      // add internalCode to the T1 section
      personTable.getSections().get(0).getFieldNames().add("internalCode");
   }



   /***************************************************************************
    * Insert test data with a value in the non-editable internalCode field.
    ***************************************************************************/
   public void setupTestDataForLeakTest() throws QException
   {
      new InsertAction().execute(new InsertInput(PersonTableProducer.NAME).withRecords(List.of(
         new QRecord().withValue("firstName", "Homer").withValue("lastName", "Simpson")
            .withValue("isAlive", true).withValue("internalCode", "ABC-123")
      )));
   }



   /*******************************************************************************
    * Test that navigating from view record to Actions > New does not leak values
    * from the viewed record into the create form.  Non-editable fields should be
    * blank on the create screen.
    *******************************************************************************/
   @Test
   @Tag("customizeQInstanceForLeakTest")
   @Tag("setupTestDataForLeakTest")
   void testViewScreenDoesNotLeakValuesToCreateScreen()
   {
      ///////////////////////////////////////////////////////
      // view a record first — this populates record state //
      ///////////////////////////////////////////////////////
      qSeleniumLib.gotoAndWaitForBreadcrumbHeaderToContain("/peopleApp/greetingsApp/person/1", "Homer");
      qSeleniumLib.waitForSelector("[data-qqq-id='record-screen-person']");

      /////////////////////////////////////////////////////////////////
      // verify we can see the internalCode value on the view screen //
      /////////////////////////////////////////////////////////////////
      WebElement codeField = qSeleniumLib.waitForSelector("[data-field-name='internalCode']");
      assertThat(codeField.getText()).contains("ABC-123");

      //////////////////////////////////////////////////////////
      // click Actions > New to navigate to the create screen //
      //////////////////////////////////////////////////////////
      qSeleniumLib.waitForSelectorContaining("button", "Actions").click();
      qSeleniumLib.waitForSelectorContaining("li", "New").click();

      //////////////////////////////////////////
      // wait for the create screen to render //
      //////////////////////////////////////////
      qSeleniumLib.waitForSelectorContaining("h5", "Creating New Person");

      //////////////////////////////////////////////////////////////
      // verify the non-editable internalCode field does NOT show //
      // the value from the previously-viewed record              //
      //////////////////////////////////////////////////////////////
      WebElement codeFieldOnCreate = qSeleniumLib.waitForSelector("[data-field-name='internalCode']");
      assertThat(codeFieldOnCreate.getText())
         .as("Non-editable field should not contain the value from the viewed record")
         .doesNotContain("ABC-123");

      ///////////////////////////////////////////////////////////
      // also verify firstName input is empty (editable field) //
      ///////////////////////////////////////////////////////////
      WebElement firstNameInput = qSeleniumLib.waitForSelector("input[name='firstName']");
      assertThat(firstNameInput.getAttribute("value"))
         .as("firstName should be empty on create screen, not leaked from viewed record")
         .isEmpty();
   }



   /***************************************************************************
    * Add a PVS field to person table for testing possible value display.
    ***************************************************************************/
   public void customizeQInstanceForPossibleValueEditTest(QInstance qInstance)
   {
      QTableMetaData personTable = qInstance.getTable(PersonTableProducer.NAME);
      personTable.withField(new QFieldMetaData("favoriteSpeciesId", QFieldType.INTEGER)
         .withPossibleValueSourceName(PetSpeciesPVSProducer.NAME));

      // add to T1 section
      personTable.getSections().get(0).getFieldNames().add("favoriteSpeciesId");
   }



   /***************************************************************************
    * Insert a person with a PVS field populated.
    ***************************************************************************/
   public void setupTestDataForPossibleValueEditTest() throws QException
   {
      new InsertAction().execute(new InsertInput(PersonTableProducer.NAME).withRecords(List.of(
         new QRecord().withValue("firstName", "Homer").withValue("lastName", "Simpson")
            .withValue("isAlive", true).withValue("favoriteSpeciesId", 1)
      )));
   }



   /*******************************************************************************
    * Test that PVS fields show their display value in edit mode, then change
    * the value and save — verifying the new value persists.
    *******************************************************************************/
   @Test
   @Tag("customizeQInstanceForPossibleValueEditTest")
   @Tag("setupTestDataForPossibleValueEditTest")
   void testPossibleValueFieldDisplayAndSave()
   {
      /////////////////////////////////////////////////////////////
      // view the record and verify the PVS field displays "Dog" //
      /////////////////////////////////////////////////////////////
      qSeleniumLib.gotoAndWaitForBreadcrumbHeaderToContain("/peopleApp/greetingsApp/person/1", "Homer");
      qSeleniumLib.waitForSelector("[data-qqq-id='record-screen-person']");
      qSeleniumLib.waitForSelectorContaining("[data-field-name='favoriteSpeciesId']", "Dog");

      /////////////////////////////////////
      // enter edit mode via pencil icon //
      /////////////////////////////////////
      enterEditModeViaPencilIcon();

      ////////////////////////////////////////////////////////////////
      // verify the PVS field still shows "Dog" in the select input //
      ////////////////////////////////////////////////////////////////
      WebElement selectInput = qSeleniumLib.waitForSelector("[data-field-name='favoriteSpeciesId'] input");
      assertThat(selectInput.getAttribute("value"))
         .as("Possible value field should show 'Dog' in edit mode, not be blank")
         .isEqualTo("Dog");

      //////////////////////////////////////////
      // change the PVS field from Dog to Cat //
      //////////////////////////////////////////
      selectInput.click();
      qSeleniumLib.waitForMillis(SHORT_WAIT);

      selectInput.sendKeys(Keys.chord(MODIFIER_KEY, "a"));
      selectInput.sendKeys("Cat");
      qSeleniumLib.waitForMillis(MEDIUM_WAIT);

      qSeleniumLib.waitForSelectorContaining("li", "Cat").click();
      qSeleniumLib.waitForMillis(SHORT_WAIT);

      ////////////////
      // click Save //
      ////////////////
      WebElement saveButton = qSeleniumLib.waitForSelectorContaining(".stickyBottomButtonBar button", "Save");
      ((JavascriptExecutor) driver).executeScript("arguments[0].click();", saveButton);

      //////////////////////////////////////////////////
      // verify success and the field now shows "Cat" //
      //////////////////////////////////////////////////
      qSeleniumLib.waitForSelectorContaining(".MuiAlert-message", "successfully updated");
      qSeleniumLib.waitForSelectorContaining("[data-field-name='favoriteSpeciesId']", "Cat");

      /////////////////////////////////////////////////////////////////////////////////
      // re-enter edit mode — the PV field must show "Cat" (not revert to old "Dog") //
      /////////////////////////////////////////////////////////////////////////////////
      enterEditModeViaPencilIcon();
      WebElement selectInputAfterSave = qSeleniumLib.waitForSelector("[data-field-name='favoriteSpeciesId'] input");
      assertThat(selectInputAfterSave.getAttribute("value"))
         .as("After save + re-enter edit, possible value field should show 'Cat', not the old value")
         .isEqualTo("Cat");
   }



   /*******************************************************************************
    * Test that when adding a child record, the foreign-key field (ownerPersonId)
    * is pre-populated with the parent's id AND is disabled (not editable),
    * because it's a FK set from defaultValuesForNewChildRecords.
    *******************************************************************************/
   @Test
   @Tag("customizeQInstanceForWidgetRerenderTest")
   @Tag("customizeQInstanceForAddChildRecordTest")
   @Tag("setupTestDataForWidgetRerenderTest")
   void testChildRecordModalDisablesForeignKeyField()
   {
      /////////////////////////////////////////////////////////////////////////////////
      // navigate directly to a person record with a createChild hash that specifies //
      // disabledFields — this is how the UI opens child-record create modals        //
      /////////////////////////////////////////////////////////////////////////////////
      String hash = "#/createChild=pet/defaultValues=%7B%22ownerPersonId%22:1%7D/disabledFields=%7B%22ownerPersonId%22:1%7D";
      qSeleniumLib.gotoAndWaitForBreadcrumbHeaderToContain("/peopleApp/greetingsApp/person/1" + hash, "Homer");
      qSeleniumLib.waitForSelector("[data-qqq-id='record-screen-person']");

      ////////////////////////////
      // verify the modal opens //
      ////////////////////////////
      qSeleniumLib.waitForSelectorContaining(".modalEditForm h5", "Creating New Pet");

      /////////////////////////////////////////////////////////////////
      // verify the ownerPersonId field is disabled (not editable)   //
      // because it's the FK linking pet to the parent person record //
      /////////////////////////////////////////////////////////////////
      WebElement ownerPersonField = qSeleniumLib.waitForSelector(".modalEditForm [data-field-name='ownerPersonId']");
      List<WebElement> inputs = ownerPersonField.findElements(By.cssSelector("input"));
      assertThat(inputs)
         .as("Owner Person (FK) field should not have an input (should be view-only) in the child record modal")
         .isEmpty();

      ///////////////////////////////////////////////////////
      // verify the disabled field shows its display value //
      ///////////////////////////////////////////////////////
      assertThat(ownerPersonField.getText())
         .as("Owner Person (FK) field should show its display value")
         .contains("Homer");

      /////////////////////
      // close the modal //
      /////////////////////
      qSeleniumLib.waitForSelectorContaining(".modalEditForm button", "Cancel").click();
   }



   /***************************************************************************
    * Mark firstName as required so validation fires on empty submit.
    ***************************************************************************/
   public void customizeQInstanceForRequiredFieldTest(QInstance qInstance)
   {
      qInstance.getTable(PersonTableProducer.NAME).getField("firstName").setIsRequired(true);
   }



   /*******************************************************************************
    * Test that submitting a create form with a required field blank shows an
    * inline validation error under the field.
    *******************************************************************************/
   @Test
   @Tag("customizeQInstanceForRequiredFieldTest")
   void testRequiredFieldValidationError()
   {
      qSeleniumLib.gotoAndWaitForBreadcrumbHeaderToContain("/peopleApp/greetingsApp/person/create", "Creating New");
      qSeleniumLib.waitForSelector("[data-qqq-id='record-screen-person']");

      //////////////////////////////////////////////////////////
      // click Save without filling in the required firstName //
      //////////////////////////////////////////////////////////
      qSeleniumLib.waitForSelectorContaining("button", "Save").click();

      ///////////////////////////////////////////////////////////
      // verify the validation error message appears and we're //
      // still on the create screen (record was NOT created)   //
      ///////////////////////////////////////////////////////////
      qfmdSeleniumLib.waitForFormValidationErrorContaining("First Name is required");
      qSeleniumLib.waitForSelectorContaining("h5", "Creating New Person");
   }



   /*******************************************************************************
    * Test end-to-end: enter edit mode, edit an existing child record, add a new
    * child record, save the parent, and verify both changes persisted.
    *******************************************************************************/
   @Test
   @Tag("customizeQInstanceForWidgetRerenderTest")
   @Tag("setupTestDataForWidgetRerenderTest")
   void testEditModeChildOperationsAndSavePersists()
   {
      qSeleniumLib.gotoAndWaitForBreadcrumbHeaderToContain("/peopleApp/greetingsApp/person/1", "Homer");
      qSeleniumLib.waitForSelector("[data-qqq-id='record-screen-person']");
      qSeleniumLib.waitForSelector(".MuiDataGrid-root");
      qSeleniumLib.waitForMillis(MEDIUM_WAIT);

      ////////////////////////////////
      // verify 2 pets in view mode //
      ////////////////////////////////
      List<WebElement> rowsBefore = driver.findElements(By.cssSelector(".MuiDataGrid-row"));
      assertThat(rowsBefore).hasSize(2);

      /////////////////////
      // enter edit mode //
      /////////////////////
      enterEditModeViaPencilIcon();
      qSeleniumLib.waitForSelectorContaining("h5", "Edit Person");
      qSeleniumLib.waitForSelector(".MuiDataGrid-root");
      qSeleniumLib.waitForMillis(MEDIUM_WAIT);

      /////////////////////////////////////////////////
      // edit the first existing child record's name //
      /////////////////////////////////////////////////
      WebElement editButton = driver.findElement(By.xpath("//div[contains(@class,'MuiDataGrid-row')][1]//button[.//span[text()='edit']]"));
      editButton.click();
      qSeleniumLib.waitForSelectorContaining(".modalEditForm h5", "Editing Pet");
      WebElement nameInput = qSeleniumLib.waitForSelector(".modalEditForm input[name='name']");
      assertThat(nameInput.getAttribute("value"))
         .as("Name should be pre-populated with existing pet name")
         .isEqualTo("Santa's Little Helper");
      nameInput.clear();
      nameInput.sendKeys("Edited Pet Name");
      qSeleniumLib.waitForSelectorContaining(".modalEditForm button", "OK").click();
      qSeleniumLib.waitForMillis(MEDIUM_WAIT);

      ////////////////////////////////////////////////////
      // verify edit applied in-memory (still 2 rows)   //
      ////////////////////////////////////////////////////
      List<WebElement> rowsAfterEdit = driver.findElements(By.cssSelector(".MuiDataGrid-row"));
      assertThat(rowsAfterEdit).as("Row count should remain 2 after editing").hasSize(2);
      WebElement firstRowNameCell = driver.findElement(By.cssSelector(".MuiDataGrid-row:first-child [data-field='name']"));
      assertThat(firstRowNameCell.getText()).contains("Edited Pet Name");

      //////////////////////////////////////
      // add a new child record in-memory //
      //////////////////////////////////////
      qSeleniumLib.waitForSelectorContaining("button", "Add new").click();
      qSeleniumLib.waitForSelectorContaining(".modalEditForm h5", "Creating New Pet");
      qSeleniumLib.waitForSelector(".modalEditForm input[name='name']").sendKeys("Stampy");
      qSeleniumLib.waitForSelector(".modalEditForm #speciesId").click();
      qSeleniumLib.waitForMillis(SHORT_WAIT);
      qSeleniumLib.waitForSelectorContaining("li", "Dog").click();
      qSeleniumLib.waitForSelectorContaining(".modalEditForm button", "OK").click();
      qSeleniumLib.waitForMillis(MEDIUM_WAIT);

      /////////////////////////////////////////
      // verify 3 rows in the grid in-memory //
      /////////////////////////////////////////
      List<WebElement> rowsInEdit = driver.findElements(By.cssSelector(".MuiDataGrid-row"));
      assertThat(rowsInEdit).as("Should have 3 rows in-memory before save").hasSize(3);

      /////////////////////////////////////////////////////
      // click Save to persist the parent + associations //
      /////////////////////////////////////////////////////
      qSeleniumLib.waitForSelectorContaining("button", "Save").click();

      ////////////////////////////////////////////////
      // wait for the success message and view mode //
      ////////////////////////////////////////////////
      qSeleniumLib.waitForSelectorContaining(".MuiAlert-message", "successfully updated");
      qSeleniumLib.waitForSelectorContaining("h5", "Viewing Person");

      //////////////////////////////////////////////////////////////////
      // wait for the widget to reload in view mode and verify 3 pets //
      //////////////////////////////////////////////////////////////////
      qSeleniumLib.waitForSelector(".MuiDataGrid-root");
      qSeleniumLib.waitForMillis(LONG_WAIT);
      List<WebElement> rowsAfterSave = driver.findElements(By.cssSelector(".MuiDataGrid-row"));
      assertThat(rowsAfterSave)
         .as("Grid should show 3 rows after saving (edit + add persisted)")
         .hasSize(3);
   }



   /*******************************************************************************
    * Test end-to-end: enter edit mode, delete a child record in-memory, save
    * the parent, and verify the deleted child is gone on the reloaded view screen.
    *******************************************************************************/
   @Test
   @Tag("customizeQInstanceForWidgetRerenderTest")
   @Tag("setupTestDataForWidgetRerenderTest")
   void testEditModeDeleteChildAndSavePersists()
   {
      qSeleniumLib.gotoAndWaitForBreadcrumbHeaderToContain("/peopleApp/greetingsApp/person/1", "Homer");
      qSeleniumLib.waitForSelector("[data-qqq-id='record-screen-person']");
      qSeleniumLib.waitForSelector(".MuiDataGrid-root");
      qSeleniumLib.waitForMillis(MEDIUM_WAIT);

      ////////////////////////////////
      // verify 2 pets in view mode //
      ////////////////////////////////
      List<WebElement> rowsBefore = driver.findElements(By.cssSelector(".MuiDataGrid-row"));
      assertThat(rowsBefore).hasSize(2);

      /////////////////////
      // enter edit mode //
      /////////////////////
      enterEditModeViaPencilIcon();
      qSeleniumLib.waitForSelectorContaining("h5", "Edit Person");
      qSeleniumLib.waitForSelector(".MuiDataGrid-root");
      qSeleniumLib.waitForMillis(MEDIUM_WAIT);

      /////////////////////////////////////////////
      // delete the first child record in-memory //
      /////////////////////////////////////////////
      WebElement deleteButton = driver.findElement(By.xpath("//div[contains(@class,'MuiDataGrid-row')][1]//button[.//span[text()='delete']]"));
      deleteButton.click();
      qSeleniumLib.waitForMillis(MEDIUM_WAIT);

      ////////////////////////////////////////
      // verify 1 row in the grid in-memory //
      ////////////////////////////////////////
      List<WebElement> rowsInEdit = driver.findElements(By.cssSelector(".MuiDataGrid-row"));
      assertThat(rowsInEdit).as("Should have 1 row in-memory before save").hasSize(1);

      ///////////////////////////
      // click Save to persist //
      ///////////////////////////
      qSeleniumLib.waitForSelectorContaining("button", "Save").click();

      ////////////////////////////////////////////
      // wait for success message and view mode //
      ////////////////////////////////////////////
      qSeleniumLib.waitForSelectorContaining(".MuiAlert-message", "successfully updated");
      qSeleniumLib.waitForSelectorContaining("h5", "Viewing Person");

      ///////////////////////////////////////////////
      // verify the widget reloads with only 1 pet //
      ///////////////////////////////////////////////
      qSeleniumLib.waitForSelector(".MuiDataGrid-root");
      qSeleniumLib.waitForMillis(LONG_WAIT);
      List<WebElement> rowsAfterSave = driver.findElements(By.cssSelector(".MuiDataGrid-row"));
      assertThat(rowsAfterSave)
         .as("Grid should show 1 row after saving (deleted child removed)")
         .hasSize(1);
   }




   /*******************************************************************************
    * Test keyboard shortcuts in view mode: 'e' enters edit, 'n' opens create,
    * 'd' opens delete dialog, and shortcuts are disabled when typing in an input.
    *******************************************************************************/
   @Test
   void testKeyboardShortcutsInViewMode()
   {
      qSeleniumLib.gotoAndWaitForBreadcrumbHeaderToContain("/peopleApp/greetingsApp/person/1", "Homer");
      qSeleniumLib.waitForSelector("[data-qqq-id='record-screen-person']");

      ////////////////////////////////////////
      // press 'e' — should enter edit mode //
      ////////////////////////////////////////
      WebElement body = driver.findElement(By.tagName("body"));
      body.sendKeys("e");
      qSeleniumLib.waitForSelectorContaining("h5", "Edit Person");
      qSeleniumLib.waitForSelector("input[name='firstName']");

      ////////////////////////////////////////////////////////////
      // verify shortcut is disabled while focus is in an input //
      ////////////////////////////////////////////////////////////
      WebElement firstNameInput = qSeleniumLib.waitForSelector("input[name='firstName']");
      firstNameInput.sendKeys("n");
      qSeleniumLib.waitForMillis(SHORT_WAIT);
      qSeleniumLib.waitForSelectorContaining("h5", "Edit Person");

      //////////////////////////////
      // cancel back to view mode //
      //////////////////////////////
      WebElement cancelButton = qSeleniumLib.waitForSelectorContaining("button", "Cancel");
      ((JavascriptExecutor) driver).executeScript("arguments[0].click();", cancelButton);
      qSeleniumLib.waitForSelectorContaining("h5", "Viewing Person");

      ////////////////////////////////////////////////////////
      // press 'd' — should open delete confirmation dialog //
      ////////////////////////////////////////////////////////
      body = driver.findElement(By.tagName("body"));
      body.sendKeys("d");
      qSeleniumLib.waitForSelectorContaining(".MuiDialogTitle-root", "Confirm Deletion");

      /////////////////////////////
      // close the delete dialog //
      /////////////////////////////
      qSeleniumLib.waitForSelectorContaining("button", "No").click();
      qSeleniumLib.waitForMillis(SHORT_WAIT);

      ////////////////////////////////////////////////
      // press 'c' — should navigate to copy screen //
      ////////////////////////////////////////////////
      body = driver.findElement(By.tagName("body"));
      body.sendKeys("c");
      qSeleniumLib.waitForSelectorContaining("h5", "Copy Person");
      assertThat(driver.getCurrentUrl()).as("URL should end with /copy").contains("/copy");

      ///////////////////////////////////////////////////////////
      // navigate back to view mode for the next shortcut test //
      ///////////////////////////////////////////////////////////
      driver.navigate().back();
      qSeleniumLib.waitForSelectorContaining("h5", "Viewing Person");

      //////////////////////////////////////////////////
      // press 'n' — should navigate to create screen //
      //////////////////////////////////////////////////
      body = driver.findElement(By.tagName("body"));
      body.sendKeys("n");
      qSeleniumLib.waitForSelectorContaining("h5", "Creating New Person");
   }





   /*******************************************************************************
    * Test copy mode: navigate to /copy, verify fields pre-populated, save, and
    * verify the new record gets a different ID.
    *******************************************************************************/
   @Test
   void testCopyModeRoundTrip()
   {
      driver.get("https://localhost:3001/peopleApp/greetingsApp/person/1/copy");

      //////////////////////////////////////////////////////////
      // verify copy-mode header includes source record label //
      //////////////////////////////////////////////////////////
      qSeleniumLib.waitForSelectorContaining("h5", "Copy Person: Homer Simpson");

      ////////////////////////////////////////////////////////////
      // verify inputs are pre-populated from the source record //
      ////////////////////////////////////////////////////////////
      WebElement firstNameInput = qSeleniumLib.waitForSelector("input[name='firstName']");
      assertThat(firstNameInput.getAttribute("value")).isEqualTo("Homer");

      WebElement lastNameInput = qSeleniumLib.waitForSelector("input[name='lastName']");
      assertThat(lastNameInput.getAttribute("value")).isEqualTo("Simpson");

      ////////////////////////////////////
      // change the first name and save //
      ////////////////////////////////////
      firstNameInput.sendKeys(Keys.chord(MODIFIER_KEY, "a"));
      firstNameInput.sendKeys("Bart");
      qSeleniumLib.waitForSelectorContaining("button", "Save").click();

      ////////////////////////////////////////////////////////
      // verify success and a NEW record ID (not /person/1) //
      ////////////////////////////////////////////////////////
      qSeleniumLib.waitForSelectorContaining(".MuiAlert-message", "successfully created");
      qSeleniumLib.waitForSelectorContaining("[data-qqq-id='record-screen-title-person']", "Viewing Person: Bart Simpson");

      String currentUrl = driver.getCurrentUrl();
      assertThat(currentUrl)
         .as("Copy should create a new record with a different ID")
         .doesNotContain("/person/1");
      assertThat(currentUrl).contains("/person/");
   }



   /*******************************************************************************
    * Test navigating to a nonexistent record shows a not-found message.
    *******************************************************************************/
   @Test
   void testNotFoundRecord()
   {
      driver.get("https://localhost:3001/peopleApp/greetingsApp/person/999");

      ////////////////////////////////////////////////////
      // verify an error/not-found message is displayed //
      ////////////////////////////////////////////////////
      qSeleniumLib.waitForSelectorContaining(".MuiAlert-root", "could not be found");

      ///////////////////////////////////////////////////////////////////
      // verify no view/edit controls are shown for the missing record //
      ///////////////////////////////////////////////////////////////////
      List<WebElement> inputs = driver.findElements(By.cssSelector("input[name='firstName']"));
      assertThat(inputs).as("No field inputs should be shown for a missing record").isEmpty();

      List<WebElement> actionsButtons = driver.findElements(By.xpath("//button[contains(text(),'Actions')]"));
      assertThat(actionsButtons).as("No Actions button should be shown for a missing record").isEmpty();
   }



   /*******************************************************************************
    * Customize QInstance to make the "Data" section collapsible.
    *******************************************************************************/
   public void customizeQInstanceForCollapsibleTest(QInstance qInstance)
   {
      QTableMetaData personTable = qInstance.getTable(PersonTableProducer.NAME);
      personTable.getSections().get(1).setCollapsible(CollapsibleMetaData.INITIALLY_OPEN);
   }



   /*******************************************************************************
    * Test that clicking a collapsible section header toggles its visibility.
    * Uses same approach as CollapsibleSectionsIT — click h6 header text and
    * verify field values appear/disappear.
    *******************************************************************************/
   @Test
   @Tag("customizeQInstanceForCollapsibleTest")
   void testCollapsibleSectionToggle()
   {
      qSeleniumLib.gotoAndWaitForBreadcrumbHeaderToContain("/peopleApp/greetingsApp/person/1", "Homer");
      qSeleniumLib.waitForSelector("[data-qqq-id='record-screen-person']");

      /////////////////////////////////////////////////////////////////
      // verify the "Data" section is open and has the collapse icon //
      /////////////////////////////////////////////////////////////////
      qSeleniumLib.waitForSelectorContaining("#data", "Is Alive");
      WebElement h6 = qSeleniumLib.waitForSelectorContaining("h6", "Data");
      WebElement icon = qSeleniumLib.getParent(h6).findElement(By.className("MuiIcon-root"));
      assertThat(icon.getText()).contains("expand_less");

      //////////////////////////////////////////////
      // click the header to collapse the section //
      //////////////////////////////////////////////
      h6.click();

      //////////////////////////////////////////////////////
      // verify field content disappears and icon changes //
      //////////////////////////////////////////////////////
      qSeleniumLib.waitForSelectorContainingToNotExist("#data", "Is Alive");
      h6 = qSeleniumLib.waitForSelectorContaining("h6", "Data");
      icon = qSeleniumLib.getParent(h6).findElement(By.className("MuiIcon-root"));
      assertThat(icon.getText()).contains("expand_more");

      ///////////////////////////
      // click again to expand //
      ///////////////////////////
      h6.click();

      //////////////////////////////////////////////////////////
      // verify field content reappears and icon changes back //
      //////////////////////////////////////////////////////////
      qSeleniumLib.waitForSelectorContaining("#data", "Is Alive");
      h6 = qSeleniumLib.waitForSelectorContaining("h6", "Data");
      icon = qSeleniumLib.getParent(h6).findElement(By.className("MuiIcon-root"));
      assertThat(icon.getText()).contains("expand_less");
   }



   /*******************************************************************************
    * Test that deleting a child record in view mode removes the row from the grid.
    *******************************************************************************/
   @Test
   @Tag("customizeQInstanceForAddChildRecordTest")
   @Tag("setupTestDataForWidgetRerenderTest")
   void testViewModeDeleteChildRecord()
   {
      qSeleniumLib.gotoAndWaitForBreadcrumbHeaderToContain("/peopleApp/greetingsApp/person/1", "Homer");
      qSeleniumLib.waitForSelector("[data-qqq-id='record-screen-person']");

      ////////////////////////////////////////
      // wait for the pets widget to render //
      ////////////////////////////////////////
      qSeleniumLib.waitForSelector(".MuiDataGrid-root");
      qSeleniumLib.waitForMillis(MEDIUM_WAIT);

      /////////////////////////////////
      // verify we start with 2 pets //
      /////////////////////////////////
      List<WebElement> rowsBefore = driver.findElements(By.cssSelector(".MuiDataGrid-row"));
      assertThat(rowsBefore).hasSize(2);

      //////////////////////////////////////////////////////////////
      // click the delete icon on the first row (via JS to bypass //
      // MUI license overlay)                                     //
      //////////////////////////////////////////////////////////////
      WebElement deleteIcon = driver.findElement(By.xpath("//div[contains(@class,'MuiDataGrid-row')][1]//button[.//span[text()='delete']]"));
      ((JavascriptExecutor) driver).executeScript("arguments[0].click();", deleteIcon);
      qSeleniumLib.waitForMillis(LONG_WAIT);

      //////////////////////////////////////////////////////
      // verify we now have 1 row and it's the second pet //
      //////////////////////////////////////////////////////
      qSeleniumLib.waitForSelector("[data-qqq-id='record-screen-person']");
      List<WebElement> rowsAfter = driver.findElements(By.cssSelector(".MuiDataGrid-row"));
      assertThat(rowsAfter)
         .as("Grid should show 1 row after deleting a child record in view mode")
         .hasSize(1);
      qSeleniumLib.waitForSelectorContaining(".MuiDataGrid-root", "Snowball II");
   }



   /*******************************************************************************
    * Test that pressing Enter in an input field does NOT submit the form.
    *******************************************************************************/
   @Test
   void testEnterKeyBlockedInEditMode()
   {
      qSeleniumLib.gotoAndWaitForBreadcrumbHeaderToContain("/peopleApp/greetingsApp/person/1/edit", "Homer");
      qSeleniumLib.waitForSelector("[data-qqq-id='record-screen-person']");

      /////////////////////////////////////////////////////
      // type into the firstName input, then press Enter //
      /////////////////////////////////////////////////////
      WebElement firstNameInput = qSeleniumLib.waitForSelector("input[name='firstName']");
      firstNameInput.sendKeys("X");
      firstNameInput.sendKeys(Keys.ENTER);
      qSeleniumLib.waitForMillis(MEDIUM_WAIT);

      //////////////////////////////////////////////////////////
      // verify we're still in edit mode (no form submission) //
      //////////////////////////////////////////////////////////
      qSeleniumLib.waitForSelectorContaining("h5", "Edit Person");
      qSeleniumLib.waitForSelector("input[name='firstName']");

      ////////////////////////////////////////////////
      // verify no success or error alerts appeared //
      ////////////////////////////////////////////////
      List<WebElement> alerts = driver.findElements(By.cssSelector(".MuiAlert-root"));
      assertThat(alerts).as("No alerts should appear after pressing Enter").isEmpty();
   }



   /***************************************************************************
    * Add the ScheduledJob table (with cron widget) to the QInstance.
    ***************************************************************************/
   public void customizeQInstanceForScheduledJobTest(QInstance qInstance) throws QException
   {
      qInstance.addPossibleValueSource(new TimeZonePossibleValueSourceMetaDataProvider().produce());
      new ScheduledJobsMetaDataProvider().defineAll(qInstance, MemoryBackendProducer.NAME, null);

      ////////////////////////////////////////////////////////////////////////////////
      // remove table customizers that try to interact with QScheduleManager/Quartz //
      ////////////////////////////////////////////////////////////////////////////////
      QTableMetaData scheduledJobTable = qInstance.getTable(ScheduledJob.TABLE_NAME);
      scheduledJobTable.getCustomizers().clear();

      /////////////////////////////////////////////////////////////////////////////////////
      // make fields not relevant to cron widget testing optional, so tests can focus on  //
      // the cron expression round-trip without needing PVS data for type/schedulerName   //
      /////////////////////////////////////////////////////////////////////////////////////
      for(String fieldName : List.of("type", "schedulerName", "isActive"))
      {
         scheduledJobTable.getField(fieldName).setIsRequired(false);
      }

      PeopleAppProducer.addTableToGreetingsApp(qInstance, ScheduledJob.TABLE_NAME);
   }



   /***************************************************************************
    * Insert a scheduledJob record for edit/view testing.
    ***************************************************************************/
   public void setupTestDataForScheduledJobTest() throws QException
   {
      new InsertAction().execute(new InsertInput(ScheduledJob.TABLE_NAME).withRecords(List.of(
         new QRecord()
            .withValue("label", "Test Job")
            .withValue("description", "A test job")
            .withValue("cronExpression", "0 30 8 ? * MON-FRI")
            .withValue("cronTimeZoneId", "US/Central")
            .withValue("repeatSeconds", 30)
      )));
   }



   /*******************************************************************************
    * Test creating a scheduledJob record — verifies the create screen renders
    * with the cron widget without errors, and that a record can be saved.
    *******************************************************************************/
   @Test
   @Tag("customizeQInstanceForScheduledJobTest")
   void testScheduledJobCreate()
   {
      qSeleniumLib.gotoAndWaitForBreadcrumbHeaderToContain("/peopleApp/greetingsApp/scheduledJob/create", "Scheduled Job");
      qSeleniumLib.waitForSelectorContaining("h5", "Creating New Scheduled Job");

      //////////////////////////////////////////
      // fill in the required identity fields //
      //////////////////////////////////////////
      WebElement labelInput = qSeleniumLib.waitForSelector("input[name='label']");
      labelInput.sendKeys("New Test Job");

      WebElement descInput = qSeleniumLib.waitForSelector("input[name='description']");
      descInput.sendKeys("Created by test");

      WebElement repeatInput = qSeleniumLib.waitForSelector("input[name='repeatSeconds']");
      repeatInput.sendKeys("60");

      //////////////
      // hit Save //
      //////////////
      qSeleniumLib.waitForSelectorContaining("button", "Save").click();
      qSeleniumLib.waitForMillis(MEDIUM_WAIT);

      ///////////////////////////////////////////
      // verify we landed on the view screen   //
      ///////////////////////////////////////////
      qSeleniumLib.waitForSelectorContaining("h5", "Viewing Scheduled Job: New Test Job");
      qSeleniumLib.waitForSelectorContaining("[data-field-name='label']", "New Test Job");
      qSeleniumLib.waitForSelectorContaining("[data-field-name='description']", "Created by test");
   }



   /*******************************************************************************
    * Test creating a scheduledJob with a child parameter record — verifies that
    * managed-association child records are included in the create payload.
    *******************************************************************************/
   @Test
   @Tag("customizeQInstanceForScheduledJobTest")
   void testScheduledJobCreateWithParameter() throws QException
   {
      qSeleniumLib.gotoAndWaitForBreadcrumbHeaderToContain("/peopleApp/greetingsApp/scheduledJob/create", "Scheduled Job");
      qSeleniumLib.waitForSelectorContaining("h5", "Creating New Scheduled Job");

      /////////////////////////////
      // fill in identity fields //
      /////////////////////////////
      qfmdSeleniumLib.inputTextField("label", "Job With Params");
      qfmdSeleniumLib.inputTextField("description", "Has a parameter");
      qfmdSeleniumLib.inputTextField("repeatSeconds", "60");

      ////////////////////////////////
      // add a child parameter row  //
      ////////////////////////////////
      qSeleniumLib.waitForSelectorContaining("button", "add new").click();
      qSeleniumLib.waitForSelectorContaining(".modalEditForm h5", "Creating New Scheduled Job Parameter");
      qfmdSeleniumLib.inputTextField("key", "myKey");
      qfmdSeleniumLib.inputTextField("value", "myValue");
      qSeleniumLib.waitForSelectorContaining(".modalEditForm button", "OK").click();
      qSeleniumLib.waitForMillis(MEDIUM_WAIT);

      ///////////////////////////////////////////////
      // verify the parameter appears in the grid //
      ///////////////////////////////////////////////
      qSeleniumLib.waitForSelectorContaining(".MuiDataGrid-root", "myKey");
      qSeleniumLib.waitForSelectorContaining(".MuiDataGrid-root", "myValue");

      //////////////
      // hit Save //
      //////////////
      qSeleniumLib.waitForSelectorContaining("button", "Save").click();
      qSeleniumLib.waitForMillis(MEDIUM_WAIT);

      ///////////////////////////////////////////
      // verify we landed on the view screen   //
      ///////////////////////////////////////////
      qSeleniumLib.waitForSelectorContaining("h5", "Viewing Scheduled Job: Job With Params");

      ///////////////////////////////////////////////////////////////////////
      // verify the parameter was persisted by querying the backend table //
      ///////////////////////////////////////////////////////////////////////
      QContext.init(testApplicationServer.getQInstance(), new QSystemUserSession());
      QueryOutput paramOutput = new QueryAction().execute(new QueryInput("scheduledJobParameter"));
      assertThat(paramOutput.getRecords())
         .anyMatch(r -> "myKey".equals(r.getValueString("key")) && "myValue".equals(r.getValueString("value")));
   }



   /*******************************************************************************
    * Test editing a scheduledJob record — verifies the cron widget values
    * round-trip through edit and save correctly.
    *******************************************************************************/
   @Test
   @Tag("customizeQInstanceForScheduledJobTest")
   @Tag("setupTestDataForScheduledJobTest")
   void testScheduledJobEditAndSave()
   {
      qSeleniumLib.gotoAndWaitForBreadcrumbHeaderToContain("/peopleApp/greetingsApp/scheduledJob/1", "Test Job");
      qSeleniumLib.waitForSelectorContaining("h5", "Viewing Scheduled Job: Test Job");

      /////////////////////////////////////////
      // verify initial values in view mode  //
      /////////////////////////////////////////
      qSeleniumLib.waitForSelectorContaining("[data-field-name='label']", "Test Job");
      qSeleniumLib.waitForSelectorContaining("[data-field-name='description']", "A test job");
      qSeleniumLib.waitForSelectorContaining(".recordScreen", "0 30 8 ? * MON-FRI");
      qSeleniumLib.waitForSelectorContaining(".recordScreen", "US/Central");
      qSeleniumLib.waitForSelectorContaining(".recordScreen", "Monday and Friday");

      /////////////////////
      // enter edit mode //
      /////////////////////
      qSeleniumLib.waitForSelectorContaining("button", "Edit").click();
      qSeleniumLib.waitForSelectorContaining("h5", "Edit Scheduled Job");

      /////////////////////////////////////////
      // modify the label and repeat seconds //
      /////////////////////////////////////////
      WebElement labelInput = qSeleniumLib.waitForSelector("input[name='label']");
      labelInput.sendKeys(Keys.chord(MODIFIER_KEY, "a"));
      labelInput.sendKeys("Updated Job");

      WebElement repeatInput = qSeleniumLib.waitForSelector("input[name='repeatSeconds']");
      repeatInput.sendKeys(Keys.chord(MODIFIER_KEY, "a"));
      repeatInput.sendKeys("120");

      //////////////
      // hit Save //
      //////////////
      qSeleniumLib.waitForSelectorContaining("button", "Save").click();
      qSeleniumLib.waitForMillis(MEDIUM_WAIT);

      /////////////////////////////////////////////////
      // verify we're back in view mode with updates //
      /////////////////////////////////////////////////
      qSeleniumLib.waitForSelectorContaining("h5", "Viewing Scheduled Job: Updated Job");
      qSeleniumLib.waitForSelectorContaining("[data-field-name='label']", "Updated Job");
      qSeleniumLib.waitForSelectorContaining("[data-field-name='repeatSeconds']", "120");

      /////////////////////////////////////////////////////////
      // verify cron expression survived the edit round-trip //
      // including the human-readable description refreshing //
      /////////////////////////////////////////////////////////
      qSeleniumLib.waitForSelectorContaining(".recordScreen", "0 30 8 ? * MON-FRI");
      qSeleniumLib.waitForSelectorContaining(".recordScreen", "US/Central");
      qSeleniumLib.waitForSelectorContaining(".recordScreen", "Monday and Friday");
   }



   /*******************************************************************************
    * Test that navigating to a record URL with #launchProcess=processName opens
    * the process modal.
    *******************************************************************************/
   @Test
   void testLaunchProcessHash()
   {
      qSeleniumLib.gotoAndWaitForBreadcrumbHeaderToContain("/peopleApp/greetingsApp/person/1", "Homer");
      driver.get(driver.getCurrentUrl() + "#launchProcess=BasicETLProcess");
      qSeleniumLib.waitForSelectorContaining(".modalProcess", "Input: 1 Person record");
   }



   /***************************************************************************
    *
    ***************************************************************************/
   public void customizeQInstanceForCaseChangeBehaviorTest(QInstance qInstance)
   {
      qInstance.getTable(PersonTableProducer.NAME).getField("lastName").withBehavior(CaseChangeBehavior.TO_UPPER_CASE);
   }



   /*******************************************************************************
    * Test that a field with CaseChangeBehavior.TO_UPPER_CASE transforms typed
    * input to uppercase in edit mode.
    *******************************************************************************/
   @Test
   @Tag("customizeQInstanceForCaseChangeBehaviorTest")
   void testCaseChangeBehaviorToUpperCase()
   {
      qSeleniumLib.gotoAndWaitForBreadcrumbHeaderToContain("/peopleApp/greetingsApp/person/1", "Homer");

      /////////////////////
      // enter edit mode //
      /////////////////////
      qfmdSeleniumLib.chooseFromActionMenu("Edit");
      qSeleniumLib.waitForSelector("input[name='firstName']");

      ////////////////////////////////////////////
      // clear lastName and type lowercase text //
      ////////////////////////////////////////////
      WebElement lastNameInput = qSeleniumLib.waitForSelector("input[name='lastName']");
      lastNameInput.sendKeys(Keys.chord(MODIFIER_KEY, "a"));
      lastNameInput.sendKeys("flanders");

      /////////////////////////////////////////////////////////
      // verify the field value was transformed to uppercase //
      /////////////////////////////////////////////////////////
      assertThat(lastNameInput.getAttribute("value")).isEqualTo("FLANDERS");
   }



   /***************************************************************************
    *
    ***************************************************************************/
   public void customizeQInstanceForSavedReportTest(QInstance qInstance) throws QException
   {
      qInstance.addPossibleValueSource(TablesPossibleValueSourceMetaDataProvider.defineTablesPossibleValueSource(qInstance));
      new SavedReportsMetaDataProvider().defineAll(qInstance, MemoryBackendProducer.NAME, MemoryBackendProducer.NAME, null);

      ////////////////////////////////////////////////////////////////////////////////
      // remove customizers that interact with scheduler/external systems           //
      ////////////////////////////////////////////////////////////////////////////////
      qInstance.getTable(SavedReport.TABLE_NAME).getCustomizers().clear();
      if (qInstance.getTable("scheduledReport") != null)
      {
         qInstance.getTable("scheduledReport").getCustomizers().clear();
      }

      PeopleAppProducer.addTableToGreetingsApp(qInstance, SavedReport.TABLE_NAME);
   }



   /*******************************************************************************
    * End-to-end test for the savedReport table: create with filter widget,
    * save, view, edit, re-save, and verify round-trip.
    *******************************************************************************/
   @Test
   @Tag("customizeQInstanceForSavedReportTest")
   void testSavedReportTable() throws QException
   {
      ////////////////////
      // CREATE SCREEN  //
      ////////////////////
      qSeleniumLib.gotoAndWaitForBreadcrumbHeaderToContain("/peopleApp/greetingsApp/savedReport/create", "Creating New");

      //////////////////////////////////////////////////////////////
      // the edit button should be disabled before table selected //
      //////////////////////////////////////////////////////////////
      WebElement editButton = qSeleniumLib.waitForSelectorContaining("button", "Edit Filters and Columns");
      assertThat(editButton.getAttribute("disabled")).isEqualTo("true");

      /////////////////////////////
      // fill in name and table  //
      /////////////////////////////
      qSeleniumLib.waitForSelector("#label").sendKeys("My Test Report");
      qSeleniumLib.waitForSelector("#tableName").click();
      qSeleniumLib.waitForSelector("#tableName").sendKeys("Person" + Keys.DOWN + Keys.ENTER);
      qSeleniumLib.waitForMillis(MEDIUM_WAIT);

      //////////////////////////////////////////////////////////////
      // the edit button should now be enabled                    //
      //////////////////////////////////////////////////////////////
      editButton = qSeleniumLib.waitForSelectorContaining("button", "Edit Filters and Columns");
      assertThat(editButton.getAttribute("disabled")).isNull();

      ///////////////////////////////////////////////////////
      // open the filter editor and add a filter criterion //
      ///////////////////////////////////////////////////////
      editButton.click();
      qSeleniumLib.waitForSelectorContaining("h3", "Edit Filters and Columns");

      QueryScreenLib queryScreenLib = new QueryScreenLib(qSeleniumLib);
      queryScreenLib.setBasicFilter("First Name", "contains", "Homer");

      ///////////////////////////////////////////////
      // close filter editor and verify it applied //
      ///////////////////////////////////////////////
      qSeleniumLib.waitForSelectorContaining("button", "OK").click();
      qSeleniumLib.waitForSelectorContainingToNotExist("h3", "Edit Filters and Columns");
      qSeleniumLib.waitForSelectorContaining(".advancedQueryString", "First Name");
      qSeleniumLib.waitForSelectorContaining(".advancedQueryString", "Homer");

      //////////////////////////////////////
      // Set up pivot table before saving //
      //////////////////////////////////////
      qSeleniumLib.waitForSelectorContaining("label", "Use Pivot Table").click();
      qSeleniumLib.waitForSelectorContaining("button", "Edit Pivot Table").click();
      qSeleniumLib.waitForSelectorContaining("h3", "Edit Pivot Table");

      ///////////////
      // add a row //
      ///////////////
      qSeleniumLib.waitForSelectorContaining(".MuiModal-root button", "Add new row").click();
      selectPivotAutocompleteOption("#rows-0", "First Name");

      //////////////////
      // add a column //
      //////////////////
      qSeleniumLib.waitForSelectorContaining(".MuiModal-root button", "Add new column").click();
      selectPivotAutocompleteOption("#columns-0", "Last Name");

      /////////////////
      // add a value //
      /////////////////
      qSeleniumLib.waitForSelectorContaining(".MuiModal-root button", "Add new value").click();
      selectPivotAutocompleteOption("#values-field-0", "Id");

      /////////////////////
      // select function //
      /////////////////////
      selectPivotAutocompleteOption("#values-function-0", "Count");

      //////////////////////////////
      // close pivot table editor //
      //////////////////////////////
      qSeleniumLib.waitForSelectorContaining("button", "OK").click();
      qSeleniumLib.waitForSelectorContainingToNotExist("h3", "Edit Pivot Table");

      /////////////////////////
      // Save the new report //
      /////////////////////////
      qSeleniumLib.waitForSelectorContaining("button", "Save").click();
      qSeleniumLib.waitForMillis(MEDIUM_WAIT);

      /////////////////////////////////////////////////////
      // should land on view screen with correct values  //
      /////////////////////////////////////////////////////
      qSeleniumLib.waitForSelectorContaining("h5", "Viewing Report: My Test Report");
      qSeleniumLib.waitForSelectorContaining("[data-field-name='label']", "My Test Report");
      qSeleniumLib.waitForSelectorContaining("[data-field-name='tableName']", "Person");

      ///////////////////////////////////////////////////////////////////////
      // verify the filter summary is visible in the view mode widget too //
      ///////////////////////////////////////////////////////////////////////
      qSeleniumLib.waitForSelectorContaining(".advancedQueryString", "First Name");

      //////////////////////////////////////////////////////////////
      // verify the pivot table JSON was persisted to the backend //
      //////////////////////////////////////////////////////////////
      QContext.withTemporaryContext(new CapturedContext(testApplicationServer.getQInstance(), new QSystemUserSession()), () ->
      {
         QueryOutput queryOutput = new QueryAction().execute(new QueryInput(SavedReport.TABLE_NAME));
         assertThat(queryOutput.getRecords()).hasSize(1);
         String pivotTableJson = queryOutput.getRecords().get(0).getValueString("pivotTableJson");
         assertThat(pivotTableJson).isNotNull();
         assertThat(pivotTableJson).contains("firstName");
         assertThat(pivotTableJson).contains("lastName");
         assertThat(pivotTableJson).contains("COUNT");
      });

      /////////////////////
      // EDIT the report //
      /////////////////////
      qSeleniumLib.waitForSelectorContaining("button", "Edit").click();
      qSeleniumLib.waitForSelectorContaining("h5", "Edit Report");

      /////////////////////////////////////////////////////////////
      // verify the filter widget button is enabled in edit mode //
      /////////////////////////////////////////////////////////////
      editButton = qSeleniumLib.waitForSelectorContaining("button", "Edit Filters and Columns");
      assertThat(editButton.getAttribute("disabled")).isNull();

      ///////////////////////////////
      // change the label and save //
      ///////////////////////////////
      WebElement labelInput = qSeleniumLib.waitForSelector("input[name='label']");
      labelInput.sendKeys(Keys.chord(MODIFIER_KEY, "a"));
      labelInput.sendKeys("Updated Report Name");
      assertThat(labelInput.getAttribute("value")).isEqualTo("Updated Report Name");

      qSeleniumLib.waitForSelectorContaining("button", "Save").click();
      qSeleniumLib.waitForMillis(MEDIUM_WAIT);

      /////////////////////////////////////////
      // verify updated label on view screen //
      /////////////////////////////////////////
      qSeleniumLib.waitForSelectorContaining("h5", "Viewing Report: Updated Report Name");
      qSeleniumLib.waitForSelectorContaining("[data-field-name='label']", "Updated Report Name");
   }



   /***************************************************************************
    * Add a process-type widget section to the person table.
    ***************************************************************************/
   public void customizeQInstanceForProcessWidgetTest(QInstance qInstance)
   {
      QTableMetaData personTable = qInstance.getTable(PersonTableProducer.NAME);
      personTable.withSection(new QFieldSection("greeter", new QIcon("waving_hand"), Tier.T2)
         .withWidgetName(PersonGreeterWidgetProducer.NAME));
   }



   /*******************************************************************************
    * Test that a process-type widget on the RecordScreen can submit its form
    * and advance to the next step without causing a page reload or URL change.
    *******************************************************************************/
   @Test
   @Tag("customizeQInstanceForProcessWidgetTest")
   void testProcessWidgetSubmitDoesNotReloadPage()
   {
      qSeleniumLib.gotoAndWaitForBreadcrumbHeaderToContain("/peopleApp/greetingsApp/person/1", "Homer");
      qSeleniumLib.waitForSelector("[data-qqq-id='record-screen-person']");

      ///////////////////////////////////////////////////////////////
      // verify the process widget section renders with its label  //
      ///////////////////////////////////////////////////////////////
      qSeleniumLib.waitForSelectorContaining("h6", "Person Greeter");

      ///////////////////////////////////////
      // fill in the process widget form   //
      ///////////////////////////////////////
      WebElement greetingInput = qSeleniumLib.waitForSelector("input[name='greetingName']");
      greetingInput.sendKeys("World");

      ////////////////////////////////////////////////////
      // capture the current URL before clicking submit //
      ////////////////////////////////////////////////////
      String urlBeforeSubmit = qSeleniumLib.driver.getCurrentUrl();

      /////////////////////////////////////////////////////////
      // click the Submit button inside the process widget   //
      /////////////////////////////////////////////////////////
      qSeleniumLib.waitForSelectorContaining("button", "Submit").click();
      qSeleniumLib.waitForMillis(MEDIUM_WAIT);

      /////////////////////////////////////////////////////////
      // verify: the process completed (Return button shown) //
      // without changing the URL (no native form submit)    //
      /////////////////////////////////////////////////////////
      qSeleniumLib.waitForSelectorContaining("button", "Return");

      String urlAfterSubmit = qSeleniumLib.driver.getCurrentUrl();
      assertThat(urlAfterSubmit).isEqualTo(urlBeforeSubmit);
   }


   /*******************************************************************************
    * Test that the /key unique-key route redirects to the standard
    * RecordScreen view URL.
    *******************************************************************************/
   @Test
   void testViewByUniqueKeyRedirectsToRecordScreen()
   {
      /////////////////////////////////////////////////////////
      // navigate to the unique-key URL with firstName=Homer //
      /////////////////////////////////////////////////////////
      qSeleniumLib.gotoAndWaitForBreadcrumbHeaderToContain("/peopleApp/greetingsApp/person/key?firstName=Homer", "Homer");

      ///////////////////////////////////////////////////////////////////
      // should redirect to the standard view URL with the record's ID //
      ///////////////////////////////////////////////////////////////////
      String currentUrl = qSeleniumLib.driver.getCurrentUrl();
      assertThat(currentUrl).contains("/peopleApp/greetingsApp/person/1");
      assertThat(currentUrl).doesNotContain("/key");

      ////////////////////////////////////////////////////////////
      // verify the RecordScreen rendered with the correct data //
      ////////////////////////////////////////////////////////////
      qSeleniumLib.waitForSelector("[data-qqq-id='record-screen-person']");
      qSeleniumLib.waitForSelectorContaining("h5", "Viewing Person: Homer Simpson");
      qSeleniumLib.waitForSelectorContaining("[data-field-name='firstName']", "Homer");
      qSeleniumLib.waitForSelectorContaining("[data-field-name='lastName']", "Simpson");
   }



   /***************************************************************************
    *
    ***************************************************************************/
   public void customizeQInstanceForHelpContentTest(QInstance qInstance)
   {
      //////////////////////////////////////////////////////////////////////
      // add help content to the firstName field and the identity section //
      //////////////////////////////////////////////////////////////////////
      qInstance.getTable(PersonTableProducer.NAME).getField("firstName")
         .withHelpContent(new QHelpContent()
            .withContentAsText("Enter the person's given name")
            .withRole(QHelpRole.ALL_SCREENS));

      qInstance.getTable(PersonTableProducer.NAME).getSection("identity")
         .withHelpContent(new QHelpContent()
            .withContentAsText("This section contains identifying information")
            .withRole(QHelpRole.ALL_SCREENS));
   }



   /*******************************************************************************
    * Test that help content is displayed for fields (as tooltip) and sections
    * (inline) in both view and edit modes.
    *******************************************************************************/
   @Test
   @Tag("customizeQInstanceForHelpContentTest")
   void testHelpContentInViewAndEditMode()
   {
      ////////////////////////////////////
      // navigate to person record view //
      ////////////////////////////////////
      qSeleniumLib.gotoAndWaitForBreadcrumbHeaderToContain("/peopleApp/greetingsApp/person/1", "Homer");
      qSeleniumLib.waitForSelector("[data-qqq-id='record-screen-person']");

      ////////////////////////////////////////////////////////////////
      // verify section help is displayed inline (above the fields) //
      ////////////////////////////////////////////////////////////////
      WebElement sectionHelp = qSeleniumLib.waitForSelectorContaining(".helpContent", "identifying information");
      assertThat(sectionHelp.getText()).contains("This section contains identifying information");

      /////////////////////////////////////////////////////////////////////////
      // verify field help tooltip appears on hover over the firstName label //
      /////////////////////////////////////////////////////////////////////////
      WebElement firstNameLabel = qSeleniumLib.waitForSelectorContaining(".fieldLabel", "First Name");
      qSeleniumLib.moveMouseCursorToElement(firstNameLabel);
      qSeleniumLib.waitForMillis(MEDIUM_WAIT);
      WebElement tooltip = qSeleniumLib.waitForSelector("[role='tooltip']");
      assertThat(tooltip.getText()).contains("Enter the person's given name");

      /////////////////////
      // enter edit mode //
      /////////////////////
      qfmdSeleniumLib.chooseFromActionMenu("Edit");
      qSeleniumLib.waitForSelector("input[name='firstName']");

      /////////////////////////////////////////////////////////
      // verify section help is still displayed in edit mode //
      /////////////////////////////////////////////////////////
      WebElement sectionHelpInEdit = qSeleniumLib.waitForSelectorContaining(".helpContent", "identifying information");
      assertThat(sectionHelpInEdit.getText()).contains("This section contains identifying information");

      //////////////////////////////////////////////////////////////////
      // verify field help is displayed inline (not tooltip) in edit //
      //////////////////////////////////////////////////////////////////
      WebElement fieldHelpInEdit = qSeleniumLib.waitForSelectorContaining(".helpContent", "given name");
      assertThat(fieldHelpInEdit.getText()).contains("Enter the person's given name");
   }



   /***************************************************************************
    *
    ***************************************************************************/
   public void customizeQInstanceForFormAdjusterTest(QInstance qInstance)
   {
      String tableName = "formAdjusterTable";

      QTableMetaData table = new QTableMetaData()
         .withName(tableName)
         .withBackendName(MemoryBackendProducer.NAME)
         .withField(new QFieldMetaData("id", QFieldType.INTEGER).withIsEditable(false))
         .withField(new QFieldMetaData("name", QFieldType.STRING).withIsRequired(true))
         .withField(new QFieldMetaData("type", QFieldType.STRING))
         .withField(new QFieldMetaData("size", QFieldType.INTEGER))
         .withSection(new QFieldSection("identity", new QIcon(), Tier.T1, List.of("id", "name")))
         .withSection(new QFieldSection("data", new QIcon(), Tier.T2, List.of("type", "size")))
         .withPrimaryKeyField("id");

      MaterialDashboardTableMetaData.ofOrWithNew(table)
         .withOnLoadFormAdjuster(new QCodeReference(RecordScreenFormAdjuster.class));
      QFieldMetaData nameField = table.getField("name");
      nameField.withSupplementalMetaData(new MaterialDashboardFieldMetaData()
         .withFormAdjusterIdentifier("table:" + tableName + ";field:" + nameField.getName())
         .withOnChangeFormAdjuster(new QCodeReference(RecordScreenFormAdjuster.class)));

      qInstance.addTable(table);
      PeopleAppProducer.addTableToGreetingsApp(qInstance, tableName);
   }


   /***************************************************************************
    *
    ***************************************************************************/
   public static class RecordScreenFormAdjuster implements FormAdjusterInterface
   {
      @Override
      public FormAdjusterOutput execute(FormAdjusterInput input) throws QException
      {
         boolean showDataSection = false;
         boolean showSizeField = false;

         if ("name".equals(input.getFieldName()))
         {
            String newValue = Objects.requireNonNullElse(com.kingsrook.qqq.backend.core.utils.ValueUtils.getValueAsString(input.getNewValue()), "");
            showDataSection = newValue.contains("data");
            showSizeField = newValue.contains("size");
         }

         QTableMetaData tableMetaData = QContext.getQInstance().getTable("formAdjusterTable");
         QFieldSection dataSectionClone = tableMetaData.getSection("data").clone();
         dataSectionClone.setIsHidden(!showDataSection);

         FormAdjusterOutputBuilder outputBuilder = new FormAdjusterOutputBuilder("formAdjusterTable");
         outputBuilder.makeFieldShownIf("size", showSizeField);
         FormAdjusterOutput output = outputBuilder.build();
         output.setUpdatedSectionMetaData(Map.of(dataSectionClone.getName(), dataSectionClone));

         return output;
      }
   }



   //////////////////////////////////////////////////////////////////////////
   // Set up a table with alternative sections for view mode, where the T1 //
   // section shows different fields in view vs edit mode.                 //
   //////////////////////////////////////////////////////////////////////////
   public void customizeQInstanceForAlternativeSectionTest(QInstance qInstance)
   {
      String tableName = "altSectionTable";

      QTableMetaData table = new QTableMetaData()
         .withName(tableName)
         .withBackendName(MemoryBackendProducer.NAME)
         .withRecordLabelFormatAndFields("%s", "name")
         .withField(new QFieldMetaData("id", QFieldType.INTEGER).withIsEditable(false))
         .withField(new QFieldMetaData("name", QFieldType.STRING).withIsRequired(true))
         .withField(new QFieldMetaData("type", QFieldType.STRING))
         .withField(new QFieldMetaData("homeTown", QFieldType.STRING))
         .withField(new QFieldMetaData("createDate", QFieldType.DATE_TIME).withIsEditable(false))
         .withField(new QFieldMetaData("modifyDate", QFieldType.DATE_TIME).withIsEditable(false))
         .withSection(new QFieldSection("identity", new QIcon(), Tier.T1, List.of("id", "name", "homeTown"))
            .withAlternative(QFieldSectionAlternativeType.RECORD_VIEW, (s) -> s.setFieldNames(List.of("name", "homeTown"))))
         .withSection(new QFieldSection("details", new QIcon(), Tier.T2, List.of("type"))
            .withAlternative(QFieldSectionAlternativeType.RECORD_VIEW, (s) -> s.setIsHidden(true)))
         .withSection(new QFieldSection("dates", new QIcon(), Tier.T3, List.of("createDate", "modifyDate")))
         .withPrimaryKeyField("id");

      qInstance.addTable(table);
      PeopleAppProducer.addTableToGreetingsApp(qInstance, tableName);
   }

   public void setupTestDataForAlternativeSectionTest() throws QException
   {
      new InsertAction().execute(new InsertInput("altSectionTable").withRecords(List.of(
         new QRecord().withValue("name", "TestRecord").withValue("type", "typeA").withValue("homeTown", "Springfield")
      )));
   }


   /////////////////////////////////////////////////////////////////////////////////
   // Test that fields from alternative sections (only shown in view mode) render //
   // correctly when switching to edit mode, where the default sections are used. //
   /////////////////////////////////////////////////////////////////////////////////
   @Test
   @Tag("customizeQInstanceForAlternativeSectionTest")
   @Tag("setupTestDataForAlternativeSectionTest")
   void testAlternativeSectionFieldsRenderInEditMode()
   {
      /////////////////////////////////////////
      // navigate to the record in view mode //
      /////////////////////////////////////////
      qSeleniumLib.gotoAndWaitForBreadcrumbHeaderToContain("/peopleApp/greetingsApp/altSectionTable/1", "TestRecord");

      //////////////////////////////////////////////////////////////////////////////////
      // in view mode: the "details" section should be hidden (alternative hides it), //
      // and the T1 section should NOT show "Id" (alternative removes it)             //
      //////////////////////////////////////////////////////////////////////////////////
      qSeleniumLib.waitForSelectorContaining("[data-field-name='name']", "TestRecord");
      qSeleniumLib.waitForSelectorContaining("[data-field-name='homeTown']", "Springfield");
      qSeleniumLib.waitForSelectorContainingToNotExist("h6", "Details");

      ////////////////////////////////////////
      // enter edit mode via Actions > Edit //
      ////////////////////////////////////////
      qSeleniumLib.waitForSelectorContaining("button", "Actions").click();
      qSeleniumLib.waitForMillis(SHORT_WAIT);
      qSeleniumLib.waitForSelectorContaining("li", "Edit").click();
      qSeleniumLib.waitForMillis(MEDIUM_WAIT);

      ///////////////////////////////////////////////////////////////////////////////////////
      // in edit mode: the "details" section should now be visible with its "type" field   //
      // and the T1 section should show "id" (non-editable) + "name" + "homeTown" editable //
      ///////////////////////////////////////////////////////////////////////////////////////
      qSeleniumLib.waitForSelectorContaining("h5", "Edit ");
      qSeleniumLib.waitForSelector("input[name='name']");
      qSeleniumLib.waitForSelector("input[name='homeTown']");

      /////////////////////////////////////////////////////////
      // the "Details" section should now appear with "type" //
      /////////////////////////////////////////////////////////
      qSeleniumLib.waitForSelectorContaining("h6", "Details");
      qSeleniumLib.waitForSelector("input[name='type']");

      ////////////////////////////////////////////////////////////////////////////
      // id field should be visible (non-editable) — not "Field not configured" //
      ////////////////////////////////////////////////////////////////////////////
      qSeleniumLib.waitForSelector("[data-field-name='id']");
      qSeleniumLib.waitForSelectorContainingToNotExist(".recordScreen", "Field not configured");
   }


   @Test
   @Tag("customizeQInstanceForFormAdjusterTest")
   void testFormAdjusterShowsAndHidesSections()
   {
      ///////////////////////////////
      // navigate to create screen //
      ///////////////////////////////
      qSeleniumLib.gotoAndWaitForBreadcrumbHeaderToContain("/peopleApp/greetingsApp/formAdjusterTable/create", "Creating New");

      ////////////////////////////////////////////////////////////
      // by default the adjuster hides data and filter sections //
      ////////////////////////////////////////////////////////////
      qSeleniumLib.waitForSelector("input[name='name']");
      qSeleniumLib.waitForSelectorContainingToNotExist("h6", "Data");

      /////////////////////////////////////////////////////
      // verify size field is hidden by on-load adjuster //
      /////////////////////////////////////////////////////
      qSeleniumLib.waitForSelectorToNotExist("[data-field-name='size']");

      //////////////////////////////////////////////////////////////////
      // type "data size" — both section and size field should appear //
      //////////////////////////////////////////////////////////////////
      WebElement nameInput = qSeleniumLib.waitForSelector("input[name='name']");
      nameInput.sendKeys("data size");
      qSeleniumLib.waitForSelectorContaining("h5", "Creating New").click();
      qSeleniumLib.waitForMillis(LONG_WAIT);
      qSeleniumLib.waitForSelectorContaining("h6", "Data");
      qSeleniumLib.waitForSelector("[data-field-name='size']");

      //////////////////////////////////////////////////////////////////
      // change name to "x" and blur — data section should hide again //
      //////////////////////////////////////////////////////////////////
      nameInput = qSeleniumLib.waitForSelector("input[name='name']");
      nameInput.sendKeys(Keys.chord(MODIFIER_KEY, "a"));
      nameInput.sendKeys("x");
      qSeleniumLib.waitForSelectorContaining("h5", "Creating New").click();
      qSeleniumLib.waitForMillis(LONG_WAIT);
      qSeleniumLib.waitForSelectorContainingToNotExist("h6", "Data");
   }


   ////////////////////////////////////////////////////////////////////////////////////
   // Helper: click an autocomplete in the pivot table editor, wait for options,     //
   // type the search text, wait for the matching option, and click it.              //
   // Includes retry logic for cases where the dropdown may not open on first click. //
   ////////////////////////////////////////////////////////////////////////////////////
   void selectPivotAutocompleteOption(String inputSelector, String optionText)
   {
      qSeleniumLib.tryMultiple(3, () ->
      {
         WebElement input = qSeleniumLib.waitForSelector(inputSelector);
         input.click();
         qSeleniumLib.waitForSelector(".MuiAutocomplete-popper");
         input.sendKeys(optionText);
         qSeleniumLib.waitForSelectorContaining(".MuiAutocomplete-option", optionText).click();
         qSeleniumLib.waitForSelectorToNotExist(".MuiAutocomplete-popper");
      });
   }

}
