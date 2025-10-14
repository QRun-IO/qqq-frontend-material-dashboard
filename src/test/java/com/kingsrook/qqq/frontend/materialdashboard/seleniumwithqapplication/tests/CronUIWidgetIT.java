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
import com.kingsrook.qqq.backend.core.actions.dashboard.widgets.CronUIWidgetRenderer;
import com.kingsrook.qqq.backend.core.exceptions.QException;
import com.kingsrook.qqq.backend.core.model.common.TimeZonePossibleValueSourceMetaDataProvider;
import com.kingsrook.qqq.backend.core.model.dashboard.widgets.CronUISetupData;
import com.kingsrook.qqq.backend.core.model.metadata.QInstance;
import com.kingsrook.qqq.backend.core.model.metadata.dashboard.QWidgetMetaData;
import com.kingsrook.qqq.backend.core.model.metadata.fields.QFieldMetaData;
import com.kingsrook.qqq.backend.core.model.metadata.fields.QFieldType;
import com.kingsrook.qqq.backend.core.model.metadata.layout.QIcon;
import com.kingsrook.qqq.backend.core.model.metadata.tables.QFieldSection;
import com.kingsrook.qqq.backend.core.model.metadata.tables.QTableMetaData;
import com.kingsrook.qqq.backend.core.model.metadata.tables.Tier;
import com.kingsrook.qqq.backend.core.utils.StringUtils;
import com.kingsrook.qqq.frontend.materialdashboard.seleniumwithqapplication.lib.QBaseSeleniumWithQApplicationTest;
import com.kingsrook.qqq.frontend.materialdashboard.seleniumwithqapplication.metadata.MemoryBackendProducer;
import com.kingsrook.qqq.frontend.materialdashboard.seleniumwithqapplication.metadata.PeopleAppProducer;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.Keys;
import org.openqa.selenium.WebElement;


/*******************************************************************************
 ** Tests for CronUI Widget.
 *******************************************************************************/
public class CronUIWidgetIT extends QBaseSeleniumWithQApplicationTest
{
   private static final String TABLE_NAME  = "tableWithCronWidget";
   private static final String WIDGET_NAME = "cronUiWidget";



   /***************************************************************************
    *
    ***************************************************************************/
   @Override
   protected void customizeQInstance(QInstance qInstance) throws QException
   {
      for(boolean cronExpressionIsRequired : List.of(true, false))
      {
         for(boolean hasDefaultCronExpression : List.of(true, false))
         {
            for(boolean timeZoneIsRequired : List.of(true, false))
            {
               for(boolean hasDefaultTimeZone : List.of(true, false))
               {
                  String nameSuffix = getNameSuffix(cronExpressionIsRequired, hasDefaultCronExpression, timeZoneIsRequired, hasDefaultTimeZone);
                  String tableName  = TABLE_NAME + nameSuffix;

                  QWidgetMetaData widget = CronUIWidgetRenderer.buildWidgetMetaData(WIDGET_NAME + nameSuffix, "Schedule", new CronUISetupData(tableName, "cronExpression", "timeZoneId"));
                  qInstance.addWidget(widget);

                  QTableMetaData table = new QTableMetaData()
                     .withName(tableName)
                     .withBackendName(MemoryBackendProducer.NAME)
                     .withField(new QFieldMetaData("id", QFieldType.INTEGER))
                     .withField(new QFieldMetaData("name", QFieldType.STRING))
                     .withField(new QFieldMetaData("cronExpression", QFieldType.STRING)
                        .withIsRequired(cronExpressionIsRequired)
                        .withDefaultValue(hasDefaultCronExpression ? "0 0 0 * * ?" : null)
                     )
                     .withField(new QFieldMetaData("timeZoneId", QFieldType.STRING)
                        .withIsRequired(timeZoneIsRequired)
                        .withDefaultValue(hasDefaultTimeZone ? "US/Eastern" : null)
                        .withPossibleValueSourceName(TimeZonePossibleValueSourceMetaDataProvider.NAME))
                     .withSection(new QFieldSection("fields", new QIcon(), Tier.T2, List.of("id", "name")))
                     .withSection(new QFieldSection("hidden", new QIcon(), Tier.T2, List.of("cronExpression", "timeZoneId")).withIsHidden(true))
                     .withSection(new QFieldSection("schedule", new QIcon(), Tier.T2).withWidgetName(widget.getName()))
                     .withPrimaryKeyField("id");
                  qInstance.addTable(table);
                  PeopleAppProducer.addTableToGreetingsApp(qInstance, table.getName());
               }
            }
         }
      }

      qInstance.add(new TimeZonePossibleValueSourceMetaDataProvider().produce());
   }



   /***************************************************************************
    *
    ***************************************************************************/
   private static String getNameSuffix(boolean cronExpressionIsRequired, boolean hasDefaultCronExpression, boolean timeZoneIsRequired, boolean hasDefaultTimeZone)
   {
      String nameSuffix = "DefaultCron" + StringUtils.ucFirst(String.valueOf(hasDefaultCronExpression))
                          + "_CronRequired" + StringUtils.ucFirst(String.valueOf(cronExpressionIsRequired))
                          + "DefaultTimeZone" + StringUtils.ucFirst(String.valueOf(hasDefaultTimeZone))
                          + "_TimeZoneRequired" + StringUtils.ucFirst(String.valueOf(timeZoneIsRequired));
      return nameSuffix;
   }



   /*******************************************************************************
    **
    *******************************************************************************/
   @Test
   void testCombinations()
   {
      for(boolean cronExpressionIsRequired : List.of(true, false))
      {
         for(boolean hasDefaultCronExpression : List.of(true, false))
         {
            for(boolean timeZoneIsRequired : List.of(true, false))
            {
               for(boolean hasDefaultTimeZone : List.of(true, false))
               {
                  String tableName = TABLE_NAME + getNameSuffix(cronExpressionIsRequired, hasDefaultCronExpression, timeZoneIsRequired, hasDefaultTimeZone);

                  qSeleniumLib.gotoAndWaitForBreadcrumbHeaderToContain("/peopleApp/greetingsApp/" + tableName + "/create", "Creating New");

                  if(hasDefaultCronExpression)
                  {
                     qSeleniumLib.waitForSelectorContaining(".widget .MuiBox-root", "Every day, at 12:00 am");
                  }

                  qfmdSeleniumLib.clickSaveButton();

                  if(!hasDefaultCronExpression && cronExpressionIsRequired)
                  {
                     qfmdSeleniumLib.waitForFormValidationErrorContaining("Schedule is required");

                     qSeleniumLib.waitForSelector("#day").click();
                     qSeleniumLib.waitForSelectorContaining("label", "Every day").click();
                     qSeleniumLib.clickBackdrop();
                     qSeleniumLib.waitForSelectorContaining(".widget .MuiBox-root", "Every day, every minute");

                     qfmdSeleniumLib.clickSaveButton();
                  }

                  if(!hasDefaultTimeZone && timeZoneIsRequired)
                  {
                     qfmdSeleniumLib.waitForFormValidationErrorContaining("Time Zone is required");
                     qfmdSeleniumLib.inputDynamicSelectOption("timeZoneId", "US/Central");
                     qfmdSeleniumLib.clickSaveButton();
                  }

                  qfmdSeleniumLib.waitForAlert("successfully created");

                  if(timeZoneIsRequired || hasDefaultTimeZone)
                  {
                     qfmdSeleniumLib.waitForViewScreenFieldValue("Time Zone", hasDefaultTimeZone ? "US/Eastern" : "US/Central");
                  }

                  if(cronExpressionIsRequired || hasDefaultCronExpression)
                  {
                     qfmdSeleniumLib.waitForViewScreenFieldValue("Cron Expression", hasDefaultCronExpression ? "0 0 0" : "0 * *");
                     qfmdSeleniumLib.waitForViewScreenFieldValue("Cron Expression Description", hasDefaultCronExpression ? "Every day, at 12:00 am" : "Every day, every minute");
                  }
               }
            }
         }
      }
   }



   /*******************************************************************************
    **
    *******************************************************************************/
   @Test
   void testBasic()
   {
      ////////////////////////////////////////////////////////////////////
      // cron required, w/o default; time zone not required, w/ default //
      ////////////////////////////////////////////////////////////////////
      String tableName = TABLE_NAME + getNameSuffix(true, false, false, true);
      qSeleniumLib.gotoAndWaitForBreadcrumbHeaderToContain("/peopleApp/greetingsApp/" + tableName + "/create", "Creating New");

      // days
      qSeleniumLib.waitForSelector("#day").click();
      qSeleniumLib.waitForSelectorContaining("label", "Selected weekdays").click();

      WebElement weekdays = qSeleniumLib.waitForSelector("#weekdays");
      weekdays.click();
      weekdays.sendKeys("T");
      qSeleniumLib.waitForSelectorContaining(".MuiAutocomplete-option", "Thursday").click();
      qSeleniumLib.waitForSelectorContaining(".MuiChip-label", "Thursday");
      qSeleniumLib.waitForSelectorContaining(".MuiAutocomplete-option", "Tuesday").click();
      qSeleniumLib.waitForSelectorContaining(".MuiChip-label", "Tuesday");
      qSeleniumLib.clickBackdrop();

      qSeleniumLib.waitForSelector("input#day[value=\"Tue, Thu\"]");
      qSeleniumLib.waitForSelectorContaining(".widget .MuiBox-root", "Every week, on Tuesday and Thursday, every minute");

      ///////////
      // hours //
      ///////////
      qSeleniumLib.waitForSelector("#hour").click();
      qSeleniumLib.waitForSelectorContaining("label", "Selected hours").click();

      WebElement hours = qSeleniumLib.waitForSelector("#hours");
      hours.click();
      hours.sendKeys("1pm");
      qSeleniumLib.waitForSelectorContaining(".MuiAutocomplete-option", "1pm").click();
      qSeleniumLib.waitForSelectorContaining(".MuiChip-label", "1pm");
      qSeleniumLib.waitForSelectorContaining("label", "Selected hours").click();
      hours.sendKeys(Keys.ESCAPE);
      qSeleniumLib.clickBackdrop();
      qSeleniumLib.waitForSelector("input#hour[value=\"1pm\"]");
      qSeleniumLib.waitForSelectorContaining(".widget .MuiBox-root", "Every week, on Tuesday and Thursday, at 1pm, every minute");

      /////////////
      // minutes //
      /////////////
      qSeleniumLib.waitForSelector("#minute").click();
      qSeleniumLib.waitForSelectorContaining("label", "Selected minutes").click();

      WebElement minutes = qSeleniumLib.waitForSelector("#minutes");
      minutes.click();
      minutes.sendKeys("15");
      qSeleniumLib.waitForSelectorContaining(".MuiAutocomplete-option", "15").click();
      qSeleniumLib.waitForSelectorContaining(".MuiChip-label", "15");
      minutes.sendKeys(Keys.BACK_SPACE, Keys.BACK_SPACE);
      minutes.sendKeys("30");
      qSeleniumLib.waitForSelectorContaining(".MuiAutocomplete-option", "30").click();
      qSeleniumLib.waitForSelectorContaining(".MuiChip-label", "30");
      minutes.sendKeys(Keys.BACK_SPACE, Keys.BACK_SPACE);
      minutes.sendKeys("45");
      qSeleniumLib.waitForSelectorContaining(".MuiAutocomplete-option", "45").click();
      qSeleniumLib.waitForSelectorContaining(".MuiChip-label", "45");
      qSeleniumLib.waitForSelectorContaining(".MuiChip-root", "30").findElement(By.cssSelector(".MuiChip-deleteIcon")).click();
      minutes.sendKeys(Keys.ESCAPE);
      qSeleniumLib.clickBackdrop();

      qSeleniumLib.waitForSelector("input#minute[value=\"15, 45\"]");
      qSeleniumLib.waitForSelectorContaining(".widget .MuiBox-root", "Every week, on Tuesday and Thursday, at 1pm, at minutes 15 and 45");
   }



   /*******************************************************************************
    **
    *******************************************************************************/
   @Test
   void testAdvanced()
   {
      ////////////////////////////////////////////////////////////////////
      // cron required, w/o default; time zone not required, w/ default //
      ////////////////////////////////////////////////////////////////////
      String tableName = TABLE_NAME + getNameSuffix(true, false, false, true);
      qSeleniumLib.gotoAndWaitForBreadcrumbHeaderToContain("/peopleApp/greetingsApp/" + tableName + "/create", "Creating New");
      qSeleniumLib.waitForSelectorContaining(".MuiToggleButton-root", "Advanced").click();

      String mostOfCronString = "5 15,45 0/3 5-20/5 * ";
      qfmdSeleniumLib.inputTextField("cronExpression", mostOfCronString);
      qSeleniumLib.waitForSelectorContaining(".widget .MuiBox-root", "Invalid cron expression");

      qfmdSeleniumLib.inputTextField("cronExpression", "?");
      String description = "Every month, on the 5th through 20th every 5 days, at 12am to 11pm every 3 hours, at minutes 15 and 45, at second 05";
      qSeleniumLib.waitForSelectorContaining(".widget .MuiBox-root", description);

      qSeleniumLib.waitForSelectorContaining(".MuiToggleButton-root[disabled]", "Basic");

      qfmdSeleniumLib.clickSaveButton();
      qfmdSeleniumLib.waitForAlert("successfully created");
      qfmdSeleniumLib.waitForViewScreenFieldValue("Cron Expression", mostOfCronString + "?");
      qfmdSeleniumLib.waitForViewScreenFieldValue("Cron Expression Description", description);
   }



   /*******************************************************************************
    **
    *******************************************************************************/
   @Test
   void testClearButton()
   {
      ////////////////////////////////////////////////////////////////////
      // cron required, w/o default; time zone not required, w/ default //
      ////////////////////////////////////////////////////////////////////
      String tableName = TABLE_NAME + getNameSuffix(true, false, false, true);
      qSeleniumLib.gotoAndWaitForBreadcrumbHeaderToContain("/peopleApp/greetingsApp/" + tableName + "/create", "Creating New");

      qSeleniumLib.waitForSelector("#day").click();
      qSeleniumLib.waitForSelectorContaining("label", "Every day").click();
      qSeleniumLib.clickBackdrop();
      qSeleniumLib.waitForSelectorContaining(".widget .MuiBox-root", "Every day, every minute");

      qSeleniumLib.waitForSelectorContaining("button", "clear").click();
      qSeleniumLib.waitForSelectorContainingToNotExist(".widget .MuiBox-root", "Every day, every minute");

      qSeleniumLib.waitForSelectorContaining(".MuiToggleButton-root", "Advanced").click();
      qfmdSeleniumLib.inputTextField("cronExpression", "1 2 3 4 5 ?");
      qSeleniumLib.waitForSelectorContaining(".widget .MuiBox-root", "In May, on the 4th, at 3:02:01 am");

      qSeleniumLib.waitForSelectorContaining("button", "clear").click();
      qSeleniumLib.waitForSelectorContainingToNotExist(".widget .MuiBox-root", "In May");

      qfmdSeleniumLib.clickSaveButton();
      qfmdSeleniumLib.waitForFormValidationErrorContaining("Schedule is required");
   }

}
