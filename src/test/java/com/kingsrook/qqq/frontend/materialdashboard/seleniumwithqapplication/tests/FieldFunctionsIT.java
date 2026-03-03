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


import java.io.Serializable;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import com.kingsrook.qqq.backend.core.actions.customizers.TableCustomizerInterface;
import com.kingsrook.qqq.backend.core.actions.customizers.TableCustomizers;
import com.kingsrook.qqq.backend.core.actions.tables.InsertAction;
import com.kingsrook.qqq.backend.core.exceptions.QException;
import com.kingsrook.qqq.backend.core.model.actions.tables.QueryOrGetInputInterface;
import com.kingsrook.qqq.backend.core.model.actions.tables.insert.InsertInput;
import com.kingsrook.qqq.backend.core.model.common.DayOfWeekPossibleValueSourceMetaDataProducer;
import com.kingsrook.qqq.backend.core.model.data.QRecord;
import com.kingsrook.qqq.backend.core.model.metadata.QInstance;
import com.kingsrook.qqq.backend.core.model.metadata.code.QCodeReference;
import com.kingsrook.qqq.backend.core.model.metadata.fields.QFieldMetaData;
import com.kingsrook.qqq.backend.core.model.metadata.fields.QFieldType;
import com.kingsrook.qqq.backend.core.model.metadata.fields.QVirtualFieldMetaData;
import com.kingsrook.qqq.backend.core.model.metadata.fields.functions.FieldFunction;
import com.kingsrook.qqq.backend.core.model.metadata.fields.functions.implementations.StringLengthFunction;
import com.kingsrook.qqq.backend.core.model.metadata.fields.functions.implementations.WeekdayOfDateTimeFunction;
import com.kingsrook.qqq.backend.core.model.metadata.layout.QIcon;
import com.kingsrook.qqq.backend.core.model.metadata.tables.QFieldSection;
import com.kingsrook.qqq.backend.core.model.metadata.tables.QFieldSectionAlternativeType;
import com.kingsrook.qqq.backend.core.model.metadata.tables.QTableMetaData;
import com.kingsrook.qqq.backend.core.model.metadata.tables.Tier;
import com.kingsrook.qqq.frontend.materialdashboard.selenium.lib.QueryScreenLib;
import com.kingsrook.qqq.frontend.materialdashboard.seleniumwithqapplication.lib.QBaseSeleniumWithQApplicationTest;
import com.kingsrook.qqq.frontend.materialdashboard.seleniumwithqapplication.metadata.MemoryBackendProducer;
import com.kingsrook.qqq.frontend.materialdashboard.seleniumwithqapplication.metadata.PeopleAppProducer;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.Keys;
import org.openqa.selenium.WebElement;
import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertTrue;


/*******************************************************************************
 ** Tests for field functions (e.g., "day is any of" filter on date-time fields)
 ** and virtual fields appearing in the query data grid.
 *******************************************************************************/
public class FieldFunctionsIT extends QBaseSeleniumWithQApplicationTest
{
   private static final String TABLE_NAME = "fieldFunctionsTest";



   /***************************************************************************
    *
    ***************************************************************************/
   @Override
   protected void customizeQInstance(QInstance qInstance) throws QException
   {
      qInstance.add(new DayOfWeekPossibleValueSourceMetaDataProducer().produce(qInstance));

      QTableMetaData table = new QTableMetaData()
         .withName(TABLE_NAME)
         .withBackendName(MemoryBackendProducer.NAME)
         .withRecordLabelFormatAndFields("%s %s", "firstName", "lastName")
         .withField(new QFieldMetaData("id", QFieldType.INTEGER).withIsEditable(false))
         .withField(new QFieldMetaData("firstName", QFieldType.STRING).withLabel("First Name"))
         .withField(new QFieldMetaData("lastName", QFieldType.STRING).withLabel("Last Name"))
         .withField(new QFieldMetaData("birthDate", QFieldType.DATE_TIME).withLabel("Birth Date"))
         .withSection(new QFieldSection("identity", new QIcon(), Tier.T1, List.of("id", "firstName", "lastName", "birthDate"))
            .withAlternative(QFieldSectionAlternativeType.RECORD_VIEW, (s) -> s.setFieldNames(List.of("id", "fullName", "firstName", "lastName", "birthDate"))))
         .withPrimaryKeyField("id");

      ////////////////////////////////////////////////////////////////////////////////////////////
      // fullName - virtual field in the section alternative, so it appears after the section's //
      // regular fields but before any leftover virtuals                                        //
      ////////////////////////////////////////////////////////////////////////////////////////////
      table.withVirtualField(new QVirtualFieldMetaData("fullName", QFieldType.STRING)
         .withLabel("Full Name")
         .withIsQuerySelectable(true));

      ////////////////////////////////////////////////////////////////////////////////////////
      // birthYear - virtual field NOT in any section alternative, so it appears at the end //
      ////////////////////////////////////////////////////////////////////////////////////////
      table.withVirtualField(new QVirtualFieldMetaData("birthYear", QFieldType.STRING)
         .withLabel("Birth Year")
         .withIsQuerySelectable(true));

      ///////////////////////////////////////////////////////////////////////////////////////////////
      // firstNameLength - queryable virtual field using StringLength field function on firstName.  //
      // isQueryCriteria=true so it appears in the filter field picker.                             //
      // isQuerySelectable=true so it appears in the data grid (auto-computed by backend).          //
      ///////////////////////////////////////////////////////////////////////////////////////////////
      table.withVirtualField(new QVirtualFieldMetaData("firstNameLength", QFieldType.INTEGER)
         .withLabel("First Name Length")
         .withIsQueryCriteria(true)
         .withIsQuerySelectable(true)
         .withFieldFunction(new FieldFunction()
            .withFieldName("firstName")
            .withFunctionTypeIdentifier(StringLengthFunction.IDENTIFIER)));

      ////////////////////////////////////////////////////////////////////////////////////////////////
      // birthDayOfWeek - queryable virtual field using WeekdayOfDateTime field function on          //
      // birthDate.  Returns ISO-8601 day-of-week (Monday=1..Sunday=7).                             //
      ////////////////////////////////////////////////////////////////////////////////////////////////
      Map<String, Serializable> weekdayArgs = new HashMap<>();
      weekdayArgs.put(WeekdayOfDateTimeFunction.PARAM_TIME_ZONE_ID, "UTC");

      table.withVirtualField(new QVirtualFieldMetaData("birthDayOfWeek", QFieldType.INTEGER)
         .withLabel("Birth Day Of Week")
         .withPossibleValueSourceName(DayOfWeekPossibleValueSourceMetaDataProducer.NAME)
         .withIsQueryCriteria(true)
         .withIsQuerySelectable(true)
         .withFieldFunction(new FieldFunction()
            .withFieldName("birthDate")
            .withFunctionTypeIdentifier(WeekdayOfDateTimeFunction.IDENTIFIER)
            .withArguments(weekdayArgs)));

      table.withVirtualField(new QVirtualFieldMetaData("virtuallyUseless", QFieldType.DECIMAL)
         .withLabel("Virtually Useless")
         .withIsQueryCriteria(false)
         .withIsQuerySelectable(false));

      table.withCustomizer(TableCustomizers.POST_QUERY_RECORD, new QCodeReference(TestTableCustomizer.class));

      qInstance.addTable(table);
      PeopleAppProducer.addTableToGreetingsApp(qInstance, table.getName());
   }



   /***************************************************************************
    *
    ***************************************************************************/
   @Override
   protected void setupTestData() throws QException
   {
      new InsertAction().execute(new InsertInput(TABLE_NAME).withRecords(List.of(
         new QRecord().withValue("firstName", "Homer").withValue("lastName", "Simpson").withValue("birthDate", Instant.parse("2026-03-02T12:00:00Z")),   // Monday
         new QRecord().withValue("firstName", "Marge").withValue("lastName", "Simpson").withValue("birthDate", Instant.parse("2026-03-03T12:00:00Z")),   // Tuesday
         new QRecord().withValue("firstName", "Bart").withValue("lastName", "Simpson").withValue("birthDate", Instant.parse("2026-03-04T12:00:00Z")),    // Wednesday
         new QRecord().withValue("firstName", "Lisa").withValue("lastName", "Simpson").withValue("birthDate", Instant.parse("2026-03-06T12:00:00Z")),    // Friday
         new QRecord().withValue("firstName", "Maggie").withValue("lastName", "Simpson").withValue("birthDate", Instant.parse("2026-03-01T12:00:00Z"))   // Sunday
      )));
   }



   /***************************************************************************
    * Populates the virtual fields on each record after query.
    ***************************************************************************/
   public static class TestTableCustomizer implements TableCustomizerInterface
   {
      /***************************************************************************
       *
       ***************************************************************************/
      @Override
      public List<QRecord> postQuery(QueryOrGetInputInterface queryInput, List<QRecord> records)
      {
         for(QRecord record : records)
         {
            String firstName = record.getValueString("firstName");
            String lastName  = record.getValueString("lastName");
            record.setValue("fullName", (lastName != null ? lastName : "") + ", " + (firstName != null ? firstName : ""));

            Instant birthDate = record.getValueInstant("birthDate");
            if(birthDate != null)
            {
               record.setValue("birthYear", String.valueOf(birthDate.atZone(ZoneId.of("UTC")).getYear()));
            }

            record.setValue("virtuallyUseless", new BigDecimal("3.50"));
         }
         return records;
      }
   }



   /*******************************************************************************
    ** Test the "day is any of" filter operator on a DATE_TIME field - verifying
    ** that the weekday possible values appear and the filter activates correctly.
    *******************************************************************************/
   @Test
   void testDayIsAnyOfFilterOnDateTimeField()
   {
      qSeleniumLib.gotoAndWaitForBreadcrumbHeaderToContain("/peopleApp/greetingsApp/" + TABLE_NAME, "Field Functions Test");
      QueryScreenLib queryScreenLib = new QueryScreenLib(qSeleniumLib);

      qfmdSeleniumLib.waitForQueryScreenPaginationValues(1, 5, 5);

      /////////////////////////////////////////////////////////////////////
      // set Birth Date filter to "day is any of" with Monday and Friday //
      /////////////////////////////////////////////////////////////////////
      queryScreenLib.setBasicFilterPossibleValues("Birth Date", "day is any of", List.of("Monday", "Friday"));

      ////////////////////////////////////////////////////////////////////////////////////////////
      // assert the filter is active and shows the selected day(s) in the quick filter button   //
      ////////////////////////////////////////////////////////////////////////////////////////////
      queryScreenLib.assertQuickFilterButtonIndicatesActiveFilter("birthDate");
      qSeleniumLib.waitForSelectorContaining("button.filterActive", "Monday");

      /////////////////////////////////////////
      // assert filter was applied correctly //
      /////////////////////////////////////////
      qfmdSeleniumLib.waitForQueryScreenPaginationValues(1, 2, 2);
      queryScreenLib.waitForDataGridCellContaining("Monday");
   }



   /*******************************************************************************
    ** Test that virtual fields with isQuerySelectable appear as columns in the
    ** data grid with correct values and in the expected column ordering.
    *******************************************************************************/
   @Test
   void testVirtualFieldsAppearInDataGridWithCorrectValuesAndOrdering()
   {
      qSeleniumLib.gotoAndWaitForBreadcrumbHeaderToContain("/peopleApp/greetingsApp/" + TABLE_NAME, "Field Functions Test");
      qfmdSeleniumLib.waitForQueryScreenPaginationValues(1, 5, 5);

      //////////////////////////////////////////////////////////////////////
      // verify virtual field column headers are present in the data grid //
      //////////////////////////////////////////////////////////////////////
      qSeleniumLib.waitForSelector(".MuiDataGrid-columnHeader[data-field='fullName']");
      qSeleniumLib.waitForSelector(".MuiDataGrid-columnHeader[data-field='birthYear']");

      ///////////////////////////////////////////////////////////////////////////
      // verify virtual field values are correct in the grid cells             //
      // fullName uses "lastName, firstName" format to be distinguishable from //
      // the record label which uses "firstName lastName"                      //
      ///////////////////////////////////////////////////////////////////////////
      qfmdSeleniumLib.waitForDataGridContent("Simpson, Homer");
      qfmdSeleniumLib.waitForDataGridContent("Simpson, Marge");
      qfmdSeleniumLib.waitForDataGridContent("2026");

      ////////////////////////////////////////////
      // verify column ordering is alphabetical //
      ////////////////////////////////////////////
      List<WebElement> columnHeaders = driver.findElements(By.cssSelector(".MuiDataGrid-columnHeader[data-field]"));
      List<String>     fieldNames    = new ArrayList<>();
      for(WebElement header : columnHeaders)
      {
         fieldNames.add(header.getAttribute("data-field"));
      }

      int firstNameIndex = fieldNames.indexOf("firstName");
      int birthDateIndex = fieldNames.indexOf("birthDate");
      int fullNameIndex  = fieldNames.indexOf("fullName");
      int birthYearIndex = fieldNames.indexOf("birthYear");

      assertTrue(firstNameIndex >= 0, "firstName column should be present");
      assertTrue(birthDateIndex >= 0, "birthDate column should be present");
      assertTrue(fullNameIndex >= 0, "fullName virtual column should be present");
      assertTrue(birthYearIndex >= 0, "birthYear virtual column should be present");
      assertTrue(fullNameIndex > birthDateIndex, "fullName should come after birthDate");
      assertTrue(birthYearIndex > birthDateIndex, "birthYear should come after birthDate");

      assertThat(fieldNames.indexOf("virtuallyUseless")).isLessThan(0);
   }



   /*******************************************************************************
    ** Test that a queryable virtual field (firstNameLength, using StringLength
    ** field function) appears in the filter field picker and correctly filters
    ** records when used.
    ** Homer=5, Marge=5, Bart=4, Lisa=4, Maggie=6
    *******************************************************************************/
   @Test
   void testFilterOnStringLengthVirtualField()
   {
      qSeleniumLib.gotoAndWaitForBreadcrumbHeaderToContain("/peopleApp/greetingsApp/" + TABLE_NAME, "Field Functions Test");
      QueryScreenLib queryScreenLib = new QueryScreenLib(qSeleniumLib);

      qfmdSeleniumLib.waitForQueryScreenPaginationValues(1, 5, 5);

      //////////////////////////////////////////////////////////////////////////////////////
      // add First Name Length as a quick filter and set it to equals 5 (Homer and Marge) //
      //////////////////////////////////////////////////////////////////////////////////////
      queryScreenLib.addBasicFilter("First Name Length");
      queryScreenLib.setBasicFilter("First Name Length", "equals", "5");

      queryScreenLib.assertQuickFilterButtonIndicatesActiveFilter("firstNameLength");
      qfmdSeleniumLib.waitForQueryScreenPaginationValues(1, 2, 2);

      ///////////////////////////////////////////////////////////////////////////
      // verify the correct records are shown (Homer and Marge, both length 5) //
      ///////////////////////////////////////////////////////////////////////////
      qfmdSeleniumLib.waitForDataGridContent("Homer");
      qfmdSeleniumLib.waitForDataGridContent("Marge");
      qfmdSeleniumLib.waitForDataGridContentToNotExist("Bart");
      qfmdSeleniumLib.waitForDataGridContentToNotExist("Maggie");

      ////////////////////////////////////////////////////
      // clear and re-filter for length 6 (only Maggie) //
      ////////////////////////////////////////////////////
      queryScreenLib.clickQuickFilterClearIcon("firstNameLength");
      qfmdSeleniumLib.waitForQueryScreenPaginationValues(1, 5, 5);

      queryScreenLib.setBasicFilter("First Name Length", "equals", "6");
      qfmdSeleniumLib.waitForQueryScreenPaginationValues(1, 1, 1);
      qfmdSeleniumLib.waitForDataGridContent("Maggie");
   }



   /*******************************************************************************
    ** Test that a queryable virtual field (birthDayOfWeek, using WeekdayOfDateTime
    ** field function) appears in the filter field picker and correctly filters
    ** records when used.
    ** ISO-8601: Monday=1, Tuesday=2, Wednesday=3, Friday=5, Sunday=7
    *******************************************************************************/
   @Test
   void testFilterOnWeekdayOfDateTimeVirtualField()
   {
      qSeleniumLib.gotoAndWaitForBreadcrumbHeaderToContain("/peopleApp/greetingsApp/" + TABLE_NAME, "Field Functions Test");
      QueryScreenLib queryScreenLib = new QueryScreenLib(qSeleniumLib);

      qfmdSeleniumLib.waitForQueryScreenPaginationValues(1, 5, 5);

      /////////////////////////////////////////////////////////////////////////////////////
      // add Birth Day Of Week as a quick filter and set it to equals 1 (Monday = Homer) //
      /////////////////////////////////////////////////////////////////////////////////////
      queryScreenLib.addBasicFilter("Birth Day Of Week");
      queryScreenLib.setBasicFilterPossibleValues("Birth Day Of Week", "is any of", List.of("Monday"));
      qSeleniumLib.waitForSelector(".filterValuesColumn INPUT").sendKeys(Keys.ESCAPE, Keys.ESCAPE);

      queryScreenLib.assertQuickFilterButtonIndicatesActiveFilter("birthDayOfWeek");
      qfmdSeleniumLib.waitForQueryScreenPaginationValues(1, 1, 1);
      qfmdSeleniumLib.waitForDataGridContent("Homer");

      /////////////////////////////////////////////////////////
      // clear and re-filter for weekday 7 (Sunday = Maggie) //
      /////////////////////////////////////////////////////////
      queryScreenLib.clickQuickFilterClearIcon("birthDayOfWeek");
      qfmdSeleniumLib.waitForQueryScreenPaginationValues(1, 5, 5);

      queryScreenLib.setBasicFilterPossibleValues("Birth Day Of Week", "is any of", List.of("Sunday"));
      qSeleniumLib.waitForSelector(".filterValuesColumn INPUT").sendKeys(Keys.ESCAPE, Keys.ESCAPE);

      qfmdSeleniumLib.waitForQueryScreenPaginationValues(1, 1, 1);
      qfmdSeleniumLib.waitForDataGridContent("Maggie");
   }

}
