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


import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.temporal.ChronoUnit;
import com.kingsrook.qqq.backend.core.model.actions.tables.query.QCriteriaOperator;
import com.kingsrook.qqq.backend.core.model.actions.tables.query.QFilterCriteria;
import com.kingsrook.qqq.backend.core.model.actions.tables.query.QQueryFilter;
import com.kingsrook.qqq.backend.core.model.actions.tables.query.expressions.NowWithOffset;
import com.kingsrook.qqq.backend.core.model.actions.tables.query.expressions.ThisOrLastPeriod;
import com.kingsrook.qqq.backend.core.utils.JsonUtils;
import com.kingsrook.qqq.frontend.materialdashboard.selenium.lib.QBaseSeleniumTest;
import com.kingsrook.qqq.frontend.materialdashboard.selenium.lib.QueryScreenLib;
import com.kingsrook.qqq.frontend.materialdashboard.selenium.lib.javalin.QSeleniumJavalin;
import org.junit.jupiter.api.Test;


/*******************************************************************************
 ** Test for the record query screen when a filter is given in the URL
 *******************************************************************************/
public class QueryScreenFilterInUrlBasicModeIT extends QBaseSeleniumTest
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
         .withRouteToFile("/data/person/possibleValues/homeCityId", "data/person/possibleValues/homeCityId.json")
         .withRouteToFile("/data/person/variants", "data/person/variants.json")
         .withRouteToFile("/processes/querySavedView/init", "processes/querySavedView/init.json");
   }



   /*******************************************************************************
    **
    *******************************************************************************/
   @Test
   void testUrlWithFilter()
   {
      QueryScreenLib queryScreenLib = new QueryScreenLib(qSeleniumLib);

      ////////////////////////////////////////
      // not-blank -- criteria w/ no values //
      ////////////////////////////////////////
      String filterJSON = JsonUtils.toJson(new QQueryFilter()
         .withCriteria(new QFilterCriteria("annualSalary", QCriteriaOperator.IS_NOT_BLANK)));
      qSeleniumLib.gotoAndWaitForBreadcrumbHeaderToContain("/peopleApp/greetingsApp/person?filter=" + URLEncoder.encode(filterJSON, StandardCharsets.UTF_8), "Person");
      queryScreenLib.waitForQueryToHaveRan();
      queryScreenLib.assertQuickFilterButtonIndicatesActiveFilter("annualSalary");
      queryScreenLib.clickQuickFilterButton("annualSalary");
      qSeleniumLib.waitForSelector("input[value=\"is not empty\"]");

      ///////////////////////////////
      // between on a number field //
      ///////////////////////////////
      filterJSON = JsonUtils.toJson(new QQueryFilter()
         .withCriteria(new QFilterCriteria("annualSalary", QCriteriaOperator.BETWEEN, 1701, 74656)));
      qSeleniumLib.gotoAndWaitForBreadcrumbHeaderToContain("/peopleApp/greetingsApp/person?filter=" + URLEncoder.encode(filterJSON, StandardCharsets.UTF_8), "Person");
      queryScreenLib.waitForQueryToHaveRan();
      queryScreenLib.assertQuickFilterButtonIndicatesActiveFilter("annualSalary");
      queryScreenLib.clickQuickFilterButton("annualSalary");
      qSeleniumLib.waitForSelector("input[value=\"is between\"]");
      qSeleniumLib.waitForSelector("input[value=\"1701\"]");
      qSeleniumLib.waitForSelector("input[value=\"74656\"]");

      //////////////////////////////////////////
      // not-equals on a possible-value field //
      //////////////////////////////////////////
      filterJSON = JsonUtils.toJson(new QQueryFilter()
         .withCriteria(new QFilterCriteria("homeCityId", QCriteriaOperator.NOT_EQUALS, 1)));
      qSeleniumLib.gotoAndWaitForBreadcrumbHeaderToContain("/peopleApp/greetingsApp/person?filter=" + URLEncoder.encode(filterJSON, StandardCharsets.UTF_8), "Person");
      queryScreenLib.waitForQueryToHaveRan();
      queryScreenLib.assertQuickFilterButtonIndicatesActiveFilter("homeCityId");
      queryScreenLib.clickQuickFilterButton("homeCityId");
      qSeleniumLib.waitForSelector("input[value=\"does not equal\"]");
      qSeleniumLib.waitForSelector("input[value=\"St. Louis\"]");

      //////////////////////////////////////
      // an IN for a possible-value field //
      //////////////////////////////////////
      filterJSON = JsonUtils.toJson(new QQueryFilter()
         .withCriteria(new QFilterCriteria("homeCityId", QCriteriaOperator.IN, 1, 2)));
      qSeleniumLib.gotoAndWaitForBreadcrumbHeaderToContain("/peopleApp/greetingsApp/person?filter=" + URLEncoder.encode(filterJSON, StandardCharsets.UTF_8), "Person");
      queryScreenLib.waitForQueryToHaveRan();
      queryScreenLib.assertQuickFilterButtonIndicatesActiveFilter("homeCityId");
      queryScreenLib.clickQuickFilterButton("homeCityId");
      qSeleniumLib.waitForSelector("input[value=\"is any of\"]");
      qSeleniumLib.waitForSelectorContaining(".MuiChip-label", "St. Louis");
      qSeleniumLib.waitForSelectorContaining(".MuiChip-label", "Chesterfield");

      /////////////////////////////////////////
      // greater than a date-time expression //
      /////////////////////////////////////////
      filterJSON = JsonUtils.toJson(new QQueryFilter()
         .withCriteria(new QFilterCriteria("createDate", QCriteriaOperator.GREATER_THAN, NowWithOffset.minus(5, ChronoUnit.DAYS))));
      qSeleniumLib.gotoAndWaitForBreadcrumbHeaderToContain("/peopleApp/greetingsApp/person?filter=" + URLEncoder.encode(filterJSON, StandardCharsets.UTF_8), "Person");
      queryScreenLib.waitForQueryToHaveRan();
      queryScreenLib.assertQuickFilterButtonIndicatesActiveFilter("createDate");
      queryScreenLib.clickQuickFilterButton("createDate");
      qSeleniumLib.waitForSelector("input[value=\"is after\"]");
      qSeleniumLib.waitForSelector("input[value=\"5 days ago\"]");

      ///////////////////////
      // multiple criteria //
      ///////////////////////
      filterJSON = JsonUtils.toJson(new QQueryFilter()
         .withCriteria(new QFilterCriteria("firstName", QCriteriaOperator.STARTS_WITH, "Dar"))
         .withCriteria(new QFilterCriteria("createDate", QCriteriaOperator.LESS_THAN_OR_EQUALS, ThisOrLastPeriod.this_(ChronoUnit.YEARS))));
      qSeleniumLib.gotoAndWaitForBreadcrumbHeaderToContain("/peopleApp/greetingsApp/person?filter=" + URLEncoder.encode(filterJSON, StandardCharsets.UTF_8), "Person");
      queryScreenLib.waitForQueryToHaveRan();
      queryScreenLib.assertQuickFilterButtonIndicatesActiveFilter("firstName");
      queryScreenLib.assertQuickFilterButtonIndicatesActiveFilter("createDate");
      queryScreenLib.clickQuickFilterButton("createDate");
      qSeleniumLib.waitForSelector("input[value=\"is at or before\"]");
      qSeleniumLib.waitForSelector("input[value=\"start of this year\"]");
      qSeleniumLib.clickBackdrop();
      queryScreenLib.clickQuickFilterButton("firstName");
      qSeleniumLib.waitForSelector("input[value=\"starts with\"]");
      qSeleniumLib.waitForSelector("input[value=\"Dar\"]");

      ////////////////////////////////
      // remove one, then the other //
      ////////////////////////////////
      qSeleniumLib.clickBackdrop();
      queryScreenLib.clickQuickFilterClearIcon("createDate");
      queryScreenLib.assertQuickFilterButtonIndicatesActiveFilter("firstName");
      queryScreenLib.assertQuickFilterButtonDoesNotIndicateActiveFilter("createDate");
      queryScreenLib.clickQuickFilterClearIcon("firstName");
      queryScreenLib.assertQuickFilterButtonDoesNotIndicateActiveFilter("firstName");

      // qSeleniumLib.waitForever();
   }

}
