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

package com.kingsrook.qqq.frontend.materialdashboard.selenium.tests.query;


import java.util.HashSet;
import java.util.List;
import java.util.stream.Collectors;
import com.kingsrook.qqq.frontend.materialdashboard.selenium.lib.QBaseSeleniumTest;
import com.kingsrook.qqq.frontend.materialdashboard.selenium.lib.QQQMaterialDashboardSelectors;
import com.kingsrook.qqq.frontend.materialdashboard.selenium.lib.QueryScreenLib;
import com.kingsrook.qqq.frontend.materialdashboard.selenium.lib.javalin.CapturedContext;
import com.kingsrook.qqq.frontend.materialdashboard.selenium.lib.javalin.QSeleniumJavalin;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.WebElement;
import static org.assertj.core.api.Assertions.assertThat;


/*******************************************************************************
 ** Test for the record query screen
 *******************************************************************************/
public class QueryScreenIT extends QBaseSeleniumTest
{

   /*******************************************************************************
    **
    *******************************************************************************/
   @Override
   protected void addJavalinRoutes(QSeleniumJavalin qSeleniumJavalin)
   {
      super.addJavalinRoutes(qSeleniumJavalin);
      qSeleniumJavalin
         .withRouteToFile("/data/person/count", "data/person/count.json")
         .withRouteToFile("/data/person/query", "data/person/index.json")
         .withRouteToFile("/qqq/v1/table/person/count", "qqq/v1/table/person/count.json")
         .withRouteToFile("/qqq/v1/table/person/query", "qqq/v1/table/person/index.json")
         .withRouteToFile("/data/person/variants", "data/person/variants.json")
         .withRouteToFile("/data/person/possibleValues/homeCityId", "data/person/possibleValues/homeCityId.json")
         .withRouteToFile("/processes/querySavedView/init", "processes/querySavedView/init.json");
   }



   /*******************************************************************************
    **
    *******************************************************************************/
   @Test
   void testBuildQueryQueryAndClearFilters()
   {
      QueryScreenLib queryScreenLib = new QueryScreenLib(qSeleniumLib);

      qSeleniumLib.gotoAndWaitForBreadcrumbHeaderToContain("/peopleApp/greetingsApp/person", "Person");
      queryScreenLib.waitForQueryToHaveRan();
      queryScreenLib.gotoAdvancedMode();
      queryScreenLib.clickFilterBuilderButton();

      /////////////////////////////////////////////////////////////////////
      // open the filter window, enter a value, wait for query to re-run //
      /////////////////////////////////////////////////////////////////////
      qSeleniumJavalin.beginCapture();
      queryScreenLib.addAdvancedQueryFilterInput(0, "Id", "equals", "1", null);

      ///////////////////////////////////////////////////////////////////
      // assert that query & count both have the expected filter value //
      ///////////////////////////////////////////////////////////////////
      String idEquals1FilterSubstring = """
         {"fieldName":"id","operator":"EQUALS","values":["1"]}""";
      qSeleniumJavalin.waitForCapturedPathWithBodyContaining("/qqq/v1/table/person/count", idEquals1FilterSubstring);
      qSeleniumJavalin.waitForCapturedPathWithBodyContaining("/qqq/v1/table/person/query", idEquals1FilterSubstring);
      qSeleniumJavalin.endCapture();

      ///////////////////////////////////////
      // click away from the filter window //
      ///////////////////////////////////////
      qSeleniumLib.waitForSeconds(1); // todo grr.
      qSeleniumLib.waitForSelector(QQQMaterialDashboardSelectors.BREADCRUMB_HEADER).click();
      queryScreenLib.assertFilterButtonBadge(1);

      ///////////////////////////////////////////////////////////////////
      // click the 'x' clear icon, then yes, then expect another query //
      ///////////////////////////////////////////////////////////////////
      qSeleniumJavalin.beginCapture();
      queryScreenLib.clickAdvancedFilterClearIcon();

      ////////////////////////////////////////////////////////////////////
      // assert that query & count both no longer have the filter value //
      ////////////////////////////////////////////////////////////////////
      CapturedContext capturedCount = qSeleniumJavalin.waitForCapturedPath("/qqq/v1/table/person/count");
      CapturedContext capturedQuery = qSeleniumJavalin.waitForCapturedPath("/qqq/v1/table/person/query");
      assertThat(capturedCount).extracting("body").asString().doesNotContain(idEquals1FilterSubstring);
      assertThat(capturedQuery).extracting("body").asString().doesNotContain(idEquals1FilterSubstring);
      qSeleniumJavalin.endCapture();
   }



   /*******************************************************************************
    **
    *******************************************************************************/
   @Test
   void testMultiCriteriaQueryWithOr()
   {
      QueryScreenLib queryScreenLib = new QueryScreenLib(qSeleniumLib);

      qSeleniumLib.gotoAndWaitForBreadcrumbHeaderToContain("/peopleApp/greetingsApp/person", "Person");
      queryScreenLib.waitForQueryToHaveRan();
      queryScreenLib.gotoAdvancedMode();
      queryScreenLib.clickFilterBuilderButton();

      qSeleniumJavalin.beginCapture();
      queryScreenLib.addAdvancedQueryFilterInput(0, "First Name", "contains", "Dar", "Or");
      queryScreenLib.addAdvancedQueryFilterInput(1, "First Name", "contains", "Jam", "Or");

      String expectedFilterContents0 = """
         {"fieldName":"firstName","operator":"CONTAINS","values":["Dar"]}""";
      String expectedFilterContents1 = """
         {"fieldName":"firstName","operator":"CONTAINS","values":["Jam"]}""";
      String expectedFilterContents2 = """
         "booleanOperator":"OR\"""";

      qSeleniumJavalin.waitForCapturedPathWithBodyContaining("/qqq/v1/table/person/query", expectedFilterContents0);
      qSeleniumJavalin.waitForCapturedPathWithBodyContaining("/qqq/v1/table/person/query", expectedFilterContents1);
      qSeleniumJavalin.waitForCapturedPathWithBodyContaining("/qqq/v1/table/person/query", expectedFilterContents2);
      qSeleniumJavalin.endCapture();
   }



   /*******************************************************************************
    **
    *******************************************************************************/
   @Test
   void testBasicBooleanOperators()
   {
      QueryScreenLib queryScreenLib = new QueryScreenLib(qSeleniumLib);

      qSeleniumLib.gotoAndWaitForBreadcrumbHeaderToContain("/peopleApp/greetingsApp/person", "Person");
      queryScreenLib.waitForQueryToHaveRan();

      queryScreenLib.addBasicFilter("Is Employed");

      testBasicBooleanCriteria(queryScreenLib, "Is Employed", "equals yes", "(?s).*Is Employed:.*yes.*", """
         {"fieldName":"isEmployed","operator":"EQUALS","values":[true]}""");

      testBasicBooleanCriteria(queryScreenLib, "Is Employed", "equals no", "(?s).*Is Employed:.*no.*", """
         {"fieldName":"isEmployed","operator":"EQUALS","values":[false]}""");

      testBasicBooleanCriteria(queryScreenLib, "Is Employed", "is empty", "(?s).*Is Employed:.*is empty.*", """
         {"fieldName":"isEmployed","operator":"IS_BLANK","values":[]}""");

      testBasicBooleanCriteria(queryScreenLib, "Is Employed", "is not empty", "(?s).*Is Employed:.*is not empty.*", """
         {"fieldName":"isEmployed","operator":"IS_NOT_BLANK","values":[]}""");
   }



   /*******************************************************************************
    **
    *******************************************************************************/
   @Test
   void testBasicPossibleValues()
   {
      QueryScreenLib queryScreenLib = new QueryScreenLib(qSeleniumLib);

      qSeleniumLib.gotoAndWaitForBreadcrumbHeaderToContain("/peopleApp/greetingsApp/person", "Person");
      queryScreenLib.waitForQueryToHaveRan();

      String field = "Home City";
      queryScreenLib.addBasicFilter(field);

      testBasicCriteriaPossibleValues(queryScreenLib, field, "is any of", List.of("St. Louis", "Chesterfield"), "(?s).*" + field + ":.*St. Louis.*\\+1.*", """
         {"fieldName":"homeCityId","operator":"IN","values":[1,2]}""");

      testBasicCriteriaPossibleValues(queryScreenLib, field, "equals", List.of("Chesterfield"), "(?s).*" + field + ":.*Chesterfield.*", """
         {"fieldName":"homeCityId","operator":"EQUALS","values":[2]}""");

      testBasicCriteriaPossibleValues(queryScreenLib, field, "is empty", null, "(?s).*" + field + ":.*is empty.*", """
         {"fieldName":"homeCityId","operator":"IS_BLANK","values":[]}""");

      testBasicCriteriaPossibleValues(queryScreenLib, field, "does not equal", List.of("St. Louis"), "(?s).*" + field + ":.*does not equal.*St. Louis.*", """
         {"fieldName":"homeCityId","operator":"NOT_EQUALS_OR_IS_NULL","values":[1]}""");

      testBasicCriteriaPossibleValues(queryScreenLib, field, "is none of", List.of("Chesterfield"), "(?s).*" + field + ":.*is none of.*St. Louis.*\\+1", """
         {"fieldName":"homeCityId","operator":"NOT_IN","values":[1,2]}""");
   }



   /*******************************************************************************
    **
    *******************************************************************************/
   @Test
   void testCriteriaPasterHappyPath()
   {
      QueryScreenLib queryScreenLib = new QueryScreenLib(qSeleniumLib);

      ////////////////////////////
      // go to the person page //
      ////////////////////////////
      qSeleniumLib.gotoAndWaitForBreadcrumbHeaderToContain("/peopleApp/greetingsApp/person", "Person");
      queryScreenLib.waitForQueryToHaveRan();

      //////////////////////////////////////
      // open the paste values dialog UI //
      //////////////////////////////////////
      queryScreenLib.openCriteriaPasterAndPasteValues("id", List.of("1", "2", "3"));

      ///////////////////////////////////////////////////////////////
      // wait for chips to appear in the filter values review box //
      ///////////////////////////////////////////////////////////////
      assertFilterPasterChipCounts(3, 0);

      ///////////////////////////////////////////////
      // confirm each chip has the blue color class //
      ///////////////////////////////////////////////
      qSeleniumLib.waitForSelectorAll(".MuiChip-root", 3).forEach(chip ->
      {
         String classAttr = chip.getAttribute("class");
         assertThat(classAttr).contains("MuiChip-colorInfo");
      });
   }



   /*******************************************************************************
    **
    *******************************************************************************/
   @Test
   void testCriteriaPasterInvalidValueValidation()
   {
      QueryScreenLib queryScreenLib = new QueryScreenLib(qSeleniumLib);

      ////////////////////////////
      // go to the person page //
      ////////////////////////////
      qSeleniumLib.gotoAndWaitForBreadcrumbHeaderToContain("/peopleApp/greetingsApp/person", "Person");
      queryScreenLib.waitForQueryToHaveRan();

      //////////////////////////////////////
      // open the paste values dialog UI //
      //////////////////////////////////////
      queryScreenLib.openCriteriaPasterAndPasteValues("id", List.of("1", "a", "3"));

      //////////////////////////////////////////////////////
      // check that chips match values and are classified //
      //////////////////////////////////////////////////////
      assertFilterPasterChipCounts(2, 1);

      ////////////////////////////////////////////////////////////////////
      // confirm that an appropriate validation error message is shown //
      ////////////////////////////////////////////////////////////////////
      WebElement errorMessage = qSeleniumLib.waitForSelectorContaining("span", "value is not a number");
      assertThat(errorMessage.getText()).contains("value is not a number");
   }



   /*******************************************************************************
    **
    *******************************************************************************/
   @Test
   void testCriteriaPasterDuplicateValueValidation()
   {
      QueryScreenLib queryScreenLib = new QueryScreenLib(qSeleniumLib);

      ////////////////////////////
      // go to the person page //
      ////////////////////////////
      qSeleniumLib.gotoAndWaitForBreadcrumbHeaderToContain("/peopleApp/greetingsApp/person", "Person");
      queryScreenLib.waitForQueryToHaveRan();

      //////////////////////////////////////
      // open the paste values dialog UI //
      //////////////////////////////////////
      List<String> pastedValues = List.of("1", "1", "1", "2", "2");
      queryScreenLib.openCriteriaPasterAndPasteValues("id", pastedValues);

      ///////////////////////////////////////////////
      // expected chip & uniqueness calculations  //
      ///////////////////////////////////////////////
      int totalCount  = pastedValues.size();                // 5
      int uniqueCount = new HashSet<>(pastedValues).size(); // 2

      /////////////////////////////
      // chips should show dupes //
      /////////////////////////////
      assertFilterPasterChipCounts(pastedValues.size(), 0);

      ////////////////////////////////////////////////////////////////
      // counter text should match “5 values (2 unique)” (or alike) //
      ////////////////////////////////////////////////////////////////
      String     expectedCounter = totalCount + " values (" + uniqueCount + " unique)";
      WebElement counterLabel    = qSeleniumLib.waitForSelectorContaining("span", "unique");
      assertThat(counterLabel.getText()).contains(expectedCounter);
   }



   /*******************************************************************************
    **
    *******************************************************************************/
   @Test
   void testCriteriaPasterWithPVSHappyPath()
   {
      QueryScreenLib queryScreenLib = new QueryScreenLib(qSeleniumLib);

      ////////////////////////////
      // go to the person page //
      ////////////////////////////
      qSeleniumLib.gotoAndWaitForBreadcrumbHeaderToContain("/peopleApp/greetingsApp/person", "Person");
      queryScreenLib.waitForQueryToHaveRan();

      //////////////////////////////////////
      // open the paste values dialog UI //
      //////////////////////////////////////
      queryScreenLib.addBasicFilter("home city");
      queryScreenLib.openCriteriaPasterAndPasteValues("home city", List.of("St. Louis", "chesterfield"));
      qSeleniumLib.waitForSeconds(1);

      ///////////////////////////////////////////////////////////////
      // wait for chips to appear in the filter values review box //
      ///////////////////////////////////////////////////////////////
      assertFilterPasterChipCounts(2, 0);

      ///////////////////////////////////////////////
      // confirm each chip has the blue color class //
      ///////////////////////////////////////////////
      qSeleniumLib.waitForSelectorAll(".MuiChip-root", 2).forEach(chip ->
      {
         String classAttr = chip.getAttribute("class");
         assertThat(classAttr).contains("MuiChip-colorInfo");
      });
   }



   /*******************************************************************************
    **
    *******************************************************************************/
   @Test
   void testCriteriaPasterWithPVSTwoGoodOneBadAndDupes()
   {
      QueryScreenLib queryScreenLib = new QueryScreenLib(qSeleniumLib);

      ////////////////////////////
      // go to the person page //
      ////////////////////////////
      qSeleniumLib.gotoAndWaitForBreadcrumbHeaderToContain("/peopleApp/greetingsApp/person", "Person");
      queryScreenLib.waitForQueryToHaveRan();

      //////////////////////////////////////
      // open the paste values dialog UI //
      //////////////////////////////////////
      List<String> cities = List.of("St. Louis", "chesterfield", "Maryville", "st. louis", "st. louis", "chesterfield");
      queryScreenLib.addBasicFilter("home city");
      queryScreenLib.openCriteriaPasterAndPasteValues("home city", cities);
      qSeleniumLib.waitForSeconds(1);

      ///////////////////////////////////////////////
      // expected chip & uniqueness calculations  //
      ///////////////////////////////////////////////
      int totalCount  = cities.size();
      int uniqueCount = cities.stream().map(String::toLowerCase).collect(Collectors.toSet()).size();

      ///////////////////////////////////////////
      // chips should show dupes and bad chips //
      ///////////////////////////////////////////
      assertFilterPasterChipCounts(5, 1);

      ////////////////////////////////////////////////////////////////
      // counter text should match “5 values (2 unique)” (or alike) //
      ////////////////////////////////////////////////////////////////
      String     expectedCounter = totalCount + " values (" + uniqueCount + " unique)";
      WebElement counterLabel    = qSeleniumLib.waitForSelectorContaining("span", "unique");
      assertThat(counterLabel.getText()).contains(expectedCounter);

      //////////////////////////////////////////
      // assert the "value not found" warning //
      //////////////////////////////////////////
      WebElement warning = qSeleniumLib.waitForSelectorContaining("span", "was not found");
      assertThat(warning.getText()).contains("1 value was not found and will not be added to the filter");

   }



   /*******************************************************************************
    **
    *******************************************************************************/
   private void testBasicBooleanCriteria(QueryScreenLib queryScreenLib, String fieldLabel, String operatorLabel, String expectButtonStringRegex, String expectFilterJsonContains)
   {
      qSeleniumJavalin.beginCapture();
      queryScreenLib.setBasicBooleanFilter(fieldLabel, operatorLabel);
      queryScreenLib.waitForBasicFilterButtonMatchingRegex(expectButtonStringRegex);
      qSeleniumJavalin.waitForCapturedPathWithBodyContaining("/qqq/v1/table/person/query", expectFilterJsonContains);
      qSeleniumJavalin.endCapture();
   }



   /*******************************************************************************
    **
    *******************************************************************************/
   private void testBasicCriteriaPossibleValues(QueryScreenLib queryScreenLib, String fieldLabel, String operatorLabel, List<String> values, String expectButtonStringRegex, String expectFilterJsonContains)
   {
      qSeleniumJavalin.beginCapture();
      queryScreenLib.setBasicFilterPossibleValues(fieldLabel, operatorLabel, values);
      queryScreenLib.waitForBasicFilterButtonMatchingRegex(expectButtonStringRegex);
      qSeleniumJavalin.waitForCapturedPathWithBodyContaining("/qqq/v1/table/person/query", expectFilterJsonContains);
      qSeleniumJavalin.endCapture();
   }



   /*******************************************************************************
    **
    *******************************************************************************/
   @Test
   void testAdvancedBooleanOperators()
   {
      QueryScreenLib queryScreenLib = new QueryScreenLib(qSeleniumLib);

      qSeleniumLib.gotoAndWaitForBreadcrumbHeaderToContain("/peopleApp/greetingsApp/person", "Person");
      queryScreenLib.waitForQueryToHaveRan();

      queryScreenLib.gotoAdvancedMode();

      testAdvancedCriteria(queryScreenLib, "Is Employed", "equals yes", null, "(?s).*Is Employed.*equals yes.*", """
         {"fieldName":"isEmployed","operator":"EQUALS","values":[true]}""");

      testAdvancedCriteria(queryScreenLib, "Is Employed", "equals no", null, "(?s).*Is Employed.*equals no.*", """
         {"fieldName":"isEmployed","operator":"EQUALS","values":[false]}""");

      testAdvancedCriteria(queryScreenLib, "Is Employed", "is empty", null, "(?s).*Is Employed.*is empty.*", """
         {"fieldName":"isEmployed","operator":"IS_BLANK","values":[]}""");

      testAdvancedCriteria(queryScreenLib, "Is Employed", "is not empty", null, "(?s).*Is Employed.*is not empty.*", """
         {"fieldName":"isEmployed","operator":"IS_NOT_BLANK","values":[]}""");
   }

   // todo - table requires variant - prompt for it, choose it, see query; change variant, change on-screen, re-query



   /*******************************************************************************
    **
    *******************************************************************************/
   private void testAdvancedCriteria(QueryScreenLib queryScreenLib, String fieldLabel, String operatorLabel, String value, String expectQueryStringRegex, String expectFilterJsonContains)
   {
      qSeleniumJavalin.beginCapture();
      queryScreenLib.clickFilterBuilderButton();
      queryScreenLib.addAdvancedQueryFilterInput(0, fieldLabel, operatorLabel, value, null);
      qSeleniumLib.clickBackdrop();
      queryScreenLib.waitForAdvancedQueryStringMatchingRegex(expectQueryStringRegex);
      qSeleniumJavalin.waitForCapturedPathWithBodyContaining("/qqq/v1/table/person/query", expectFilterJsonContains);
      qSeleniumJavalin.endCapture();
      queryScreenLib.clickAdvancedFilterClearIcon();
   }



   /*******************************************************************************
    **
    *******************************************************************************/
   private void assertFilterPasterChipCounts(int expectedValid, int expectedInvalid)
   {
      List<WebElement> chips      = qSeleniumLib.waitForSelectorAll(".MuiChip-root", expectedValid + expectedInvalid);
      long             validCount = chips.stream().filter(c -> c.getAttribute("class").contains("MuiChip-colorInfo")).count();
      long             errorCount = chips.stream().filter(c -> c.getAttribute("class").contains("MuiChip-colorError")).count();

      assertThat(validCount).isEqualTo(expectedValid);
      assertThat(errorCount).isEqualTo(expectedInvalid);
   }
}
