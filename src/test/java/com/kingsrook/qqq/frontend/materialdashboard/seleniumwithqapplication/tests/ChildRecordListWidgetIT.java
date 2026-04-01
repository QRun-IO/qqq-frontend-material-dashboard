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
import com.kingsrook.qqq.backend.core.actions.dashboard.widgets.ChildRecordListRenderer;
import com.kingsrook.qqq.backend.core.actions.tables.InsertAction;
import com.kingsrook.qqq.backend.core.exceptions.QException;
import com.kingsrook.qqq.backend.core.model.actions.tables.insert.InsertInput;
import com.kingsrook.qqq.backend.core.model.actions.tables.query.QueryJoin;
import com.kingsrook.qqq.backend.core.model.data.QRecord;
import com.kingsrook.qqq.backend.core.model.metadata.QInstance;
import com.kingsrook.qqq.frontend.materialdashboard.seleniumwithqapplication.lib.QBaseSeleniumWithQApplicationTest;
import com.kingsrook.qqq.frontend.materialdashboard.seleniumwithqapplication.metadata.PersonJoinPetMetaDataProducer;
import com.kingsrook.qqq.frontend.materialdashboard.seleniumwithqapplication.metadata.PersonTableProducer;
import com.kingsrook.qqq.frontend.materialdashboard.seleniumwithqapplication.metadata.PetSpeciesPVSProducer;
import com.kingsrook.qqq.frontend.materialdashboard.seleniumwithqapplication.metadata.PetTableProducer;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;


/*******************************************************************************
 * Test for the ChildRecordListWidget
 *
 *******************************************************************************/
public class ChildRecordListWidgetIT extends QBaseSeleniumWithQApplicationTest
{
   private static final String WIDGET_NAME = "childRecordListWidget";

   public static final String TEST_DEFAULT         = "testDefault";
   public static final String TEST_OMIT_FIELDS     = "testOmitFields";
   public static final String TEST_ONLY_INCLUDE    = "testOnlyInclude";
   public static final String TEST_QUERY_JOINS     = "testQueryJoins";
   public static final String TEST_KEEP_JOIN_FIELD = "testKeepJoinField";
   public static final String TEST_MAX_ROWS        = "testMaxRows";
   public static final String TEST_ADD_CHILD       = "testAddChild";

   private static final String WIDGET_CELL          = ".widget .MuiDataGrid-cell";
   private static final String WIDGET_COLUMN_HEADER = ".widget .MuiDataGrid-columnHeader";

   private static final Integer defaultNoOfFieldsInWidget = 3;



   /***************************************************************************
    *
    ***************************************************************************/
   @SuppressWarnings("SimplifiableConditionalExpression")
   @Override
   protected void customizeQInstance(QInstance qInstance) throws QException
   {
      String testName = testInfo.getDisplayName();

      ChildRecordListRenderer.widgetMetaDataBuilder(qInstance.getJoin(PersonJoinPetMetaDataProducer.NAME))
         .withName(WIDGET_NAME)
         .withLabel("Pets")
         .withOmitFieldNames(TEST_OMIT_FIELDS.equals(testName) ? List.of("id", "name") : null)
         .withOnlyIncludeFieldNames(TEST_ONLY_INCLUDE.equals(testName) ? List.of("name") : null)
         .withQueryJoins(TEST_QUERY_JOINS.equals(testName) ? List.of(new QueryJoin(PersonTableProducer.NAME).withSelect(true)) : null)
         .withKeepJoinField(TEST_KEEP_JOIN_FIELD.equals(testName) ? true : false)
         .withMaxRows(TEST_MAX_ROWS.equals(testName) ? 1 : null)
         .withCanAddChildRecord(TEST_ADD_CHILD.equals(testName) ? true : false)
         .getWidgetMetaData()
         .addSelfToInstance(qInstance);

      qInstance.getTable(PersonTableProducer.NAME)
         .getSection("pets")
         .setWidgetName(WIDGET_NAME);
   }



   /***************************************************************************
    *
    ***************************************************************************/
   @Override
   protected void setupTestData() throws QException
   {
      new InsertAction().execute(new InsertInput(PersonTableProducer.NAME).withRecords(List.of(
         new QRecord().withValue("firstName", "Homer").withValue("lastName", "Simpson"), // will have 2 pets
         new QRecord().withValue("firstName", "Ned").withValue("lastName", "Flanders") // will have no pets
      )));

      new InsertAction().execute(new InsertInput(PetTableProducer.NAME).withRecords(List.of(
         new QRecord().withValue("name", "Snowball II").withValue("speciesId", PetSpeciesPVSProducer.Value.CAT.getPossibleValueId()).withValue("ownerPersonId", 1),
         new QRecord().withValue("name", "Santa's Little Helper").withValue("speciesId", PetSpeciesPVSProducer.Value.DOG.getPossibleValueId()).withValue("ownerPersonId", 1),
         new QRecord().withValue("name", "Stray").withValue("speciesId", PetSpeciesPVSProducer.Value.DOG.getPossibleValueId()).withValue("ownerPersonId", null) // no owner :(
      )));
   }



   /*******************************************************************************
    **
    *******************************************************************************/
   @Test
   @DisplayName(TEST_DEFAULT)
   void testDefault()
   {
      qSeleniumLib.gotoAndWaitForBreadcrumbHeaderToContain("/peopleApp/greetingsApp/person/1", "Homer");

      /////////////////////////////////////
      // default # of columns by default //
      /////////////////////////////////////
      assertEquals(defaultNoOfFieldsInWidget, qSeleniumLib.waitForSelectorAll(WIDGET_COLUMN_HEADER, 1).size());

      qSeleniumLib.waitForSelectorContaining(WIDGET_COLUMN_HEADER, "Id");
      qSeleniumLib.waitForSelectorContaining(WIDGET_CELL, "1");
      qSeleniumLib.waitForSelectorContaining(WIDGET_COLUMN_HEADER, "Name");
      qSeleniumLib.waitForSelectorContaining(WIDGET_CELL, "Santa's Little Helper");
      qSeleniumLib.waitForSelectorContaining(WIDGET_COLUMN_HEADER, "Species");
      qSeleniumLib.waitForSelectorContaining(WIDGET_CELL, "Dog");

      ///////////////////////////////////////////////////
      // confirm join field is not included by default //
      ///////////////////////////////////////////////////
      qSeleniumLib.waitForSelectorContainingToNotExist(WIDGET_CELL, "Homer Simpson");
      qSeleniumLib.waitForSelectorContainingToNotExist(WIDGET_COLUMN_HEADER, "Owner Person");

      qSeleniumLib.waitForSelectorContaining(".MuiDataGrid-rowCount", "Total Rows: 2");
      qSeleniumLib.waitForSelectorContainingToNotExist(".MuiDataGrid-rowCount", "of");

      qSeleniumLib.waitForSelector("[aria-label=\"Export\"] button").click();

      ////////////////////////////
      // validate view all link //
      ////////////////////////////
      qSeleniumLib.waitForSelectorContaining(".widget a", "View All").click();
      qfmdSeleniumLib.waitForPageHeaderToContain("Pet");
      qfmdSeleniumLib.waitForQueryScreenPaginationToContain("Showing 1 to 2 of 2");
   }



   /*******************************************************************************
    **
    *******************************************************************************/
   @Test
   @DisplayName(TEST_OMIT_FIELDS)
   void testOmitFields()
   {
      qSeleniumLib.gotoAndWaitForBreadcrumbHeaderToContain("/peopleApp/greetingsApp/person/1", "Homer");

      ////////////////////////////////////
      // 2 columns omitted in this case //
      ////////////////////////////////////
      assertEquals(defaultNoOfFieldsInWidget - 2, qSeleniumLib.waitForSelectorAll(WIDGET_COLUMN_HEADER, 1).size());

      qSeleniumLib.waitForSelectorContainingToNotExist(WIDGET_COLUMN_HEADER, "Name");
      qSeleniumLib.waitForSelectorContainingToNotExist(WIDGET_CELL, "Santa's Little Helper");
      qSeleniumLib.waitForSelectorContaining(WIDGET_COLUMN_HEADER, "Species");
      qSeleniumLib.waitForSelectorContaining(WIDGET_CELL, "Dog");
   }



   /*******************************************************************************
    **
    *******************************************************************************/
   @Test
   @DisplayName(TEST_ONLY_INCLUDE)
   void testOnlyInclude()
   {
      qSeleniumLib.gotoAndWaitForBreadcrumbHeaderToContain("/peopleApp/greetingsApp/person/1", "Homer");

      ////////////////////////////////
      // only 1 column in this case //
      ////////////////////////////////
      assertEquals(1, qSeleniumLib.waitForSelectorAll(WIDGET_COLUMN_HEADER, 1).size());

      qSeleniumLib.waitForSelectorContaining(WIDGET_COLUMN_HEADER, "Name");
      qSeleniumLib.waitForSelectorContaining(WIDGET_CELL, "Santa's Little Helper");
      qSeleniumLib.waitForSelectorContainingToNotExist(WIDGET_COLUMN_HEADER, "Species");
      qSeleniumLib.waitForSelectorContainingToNotExist(WIDGET_CELL, "Dog");
   }



   /*******************************************************************************
    **
    *******************************************************************************/
   @Test
   @DisplayName(TEST_QUERY_JOINS)
   void testQueryJoins()
   {
      qSeleniumLib.gotoAndWaitForBreadcrumbHeaderToContain("/peopleApp/greetingsApp/person/1", "Homer");

      //////////////////////////
      // more columns in here //
      //////////////////////////
      assertThat(qSeleniumLib.waitForSelectorAll(WIDGET_COLUMN_HEADER, 1).size()).isGreaterThan(defaultNoOfFieldsInWidget);

      qSeleniumLib.waitForSelectorContaining(WIDGET_CELL, "Santa's Little Helper");
      qSeleniumLib.waitForSelectorContaining(WIDGET_CELL, "Dog");
      qSeleniumLib.waitForSelectorContaining(WIDGET_COLUMN_HEADER, "Owner: Id");
      qSeleniumLib.waitForSelectorContaining(WIDGET_COLUMN_HEADER, "Owner: First Name");
      qSeleniumLib.waitForSelectorContaining(WIDGET_CELL, "Simpson");
   }



   /*******************************************************************************
    **
    *******************************************************************************/
   @Test
   @DisplayName(TEST_KEEP_JOIN_FIELD)
   void testKeepJoinField()
   {
      qSeleniumLib.gotoAndWaitForBreadcrumbHeaderToContain("/peopleApp/greetingsApp/person/1", "Homer");

      /////////////////////////////////////////////
      // 1 more column if we keep the join field //
      /////////////////////////////////////////////
      assertEquals(defaultNoOfFieldsInWidget + 1, qSeleniumLib.waitForSelectorAll(WIDGET_COLUMN_HEADER, 1).size());

      qSeleniumLib.waitForSelectorContaining(WIDGET_CELL, "Santa's Little Helper");
      qSeleniumLib.waitForSelectorContaining(WIDGET_CELL, "Homer Simpson");
      qSeleniumLib.waitForSelectorContaining(WIDGET_COLUMN_HEADER, "Owner Person");
   }



   /*******************************************************************************
    **
    *******************************************************************************/
   @Test
   @DisplayName(TEST_ADD_CHILD)
   void setTestAddChild()
   {
      qSeleniumLib.gotoAndWaitForBreadcrumbHeaderToContain("/peopleApp/greetingsApp/person/1", "Homer");

      qSeleniumLib.waitForSelectorContaining("button", "add new").click();
      qSeleniumLib.waitForSelectorContaining("h5", "Creating New Pet");

      //////////////////////////////////////////////////////////////////////////
      // make sure parent foreign key field is present but not an input     //
      // (RecordScreen renders non-editable fields as plain text, not inputs) //
      //////////////////////////////////////////////////////////////////////////
      WebElement ownerField = qSeleniumLib.waitForSelector("[data-field-name='ownerPersonId']");
      assertTrue(ownerField.findElements(By.tagName("input")).isEmpty());

      qfmdSeleniumLib.inputTextField("name", "Stompy");
      qfmdSeleniumLib.inputDynamicSelectOption("speciesId", "Elephant");

      qSeleniumLib.waitForSelectorContaining(".modalEditForm button", "Save").click();

      qSeleniumLib.waitForSelectorContaining(WIDGET_CELL, "Stompy");
      qSeleniumLib.waitForSelectorContaining(WIDGET_CELL, "Elephant");
   }



   /*******************************************************************************
    **
    *******************************************************************************/
   @Test
   @DisplayName(TEST_MAX_ROWS)
   void testMaxRows()
   {
      qSeleniumLib.gotoAndWaitForBreadcrumbHeaderToContain("/peopleApp/greetingsApp/person/1", "Homer");
      qSeleniumLib.waitForSelectorContaining(".MuiDataGrid-rowCount", "Total Rows: 1 of 2");
   }

}
