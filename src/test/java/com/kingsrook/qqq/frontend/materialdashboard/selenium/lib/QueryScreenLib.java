/*
 * QQQ - Low-code Application Framework for Engineers.
 * Copyright (C) 2021-2024.  Kingsrook, LLC
 * 651 N Broad St Ste 205 # 6917 | Middletown DE 19709 | United States
 * contact@kingsrook.com
 * https://github.com/Kingsrook/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package com.kingsrook.qqq.frontend.materialdashboard.selenium.lib;


import java.util.List;
import com.kingsrook.qqq.backend.core.utils.CollectionUtils;
import com.kingsrook.qqq.backend.core.utils.StringUtils;
import org.openqa.selenium.By;
import org.openqa.selenium.Keys;
import org.openqa.selenium.WebElement;


/*******************************************************************************
 **
 *******************************************************************************/
public class QueryScreenLib
{
   private final QSeleniumLib qSeleniumLib;



   /*******************************************************************************
    ** Constructor
    **
    *******************************************************************************/
   public QueryScreenLib(QSeleniumLib qSeleniumLib)
   {
      this.qSeleniumLib = qSeleniumLib;
   }



   /*******************************************************************************
    **
    *******************************************************************************/
   public WebElement assertFilterButtonBadge(int valueInBadge)
   {
      return qSeleniumLib.waitForSelectorContaining(".filterBuilderCountBadge", String.valueOf(valueInBadge));
   }



   /*******************************************************************************
    **
    *******************************************************************************/
   public void clickAdvancedFilterClearIcon()
   {
      qSeleniumLib.moveMouseCursorToElement(qSeleniumLib.waitForSelector(".filterBuilderButton"));
      qSeleniumLib.waitForSelector(".filterBuilderXIcon BUTTON").click();
      qSeleniumLib.waitForSelectorContaining("BUTTON", "Yes").click();
   }



   /*******************************************************************************
    **
    *******************************************************************************/
   public void clickQuickFilterClearIcon(String fieldName)
   {
      qSeleniumLib.moveMouseCursorToElement(qSeleniumLib.waitForSelector("#quickFilter\\." + fieldName));
      qSeleniumLib.waitForSelector("#quickFilter\\." + fieldName + "+span button").click();
   }



   /*******************************************************************************
    **
    *******************************************************************************/
   public void assertNoFilterButtonBadge(int valueInBadge)
   {
      qSeleniumLib.waitForSelectorContainingToNotExist(".filterBuilderCountBadge", String.valueOf(valueInBadge));
   }



   /*******************************************************************************
    **
    *******************************************************************************/
   public WebElement waitForQueryToHaveRan()
   {
      return qSeleniumLib.waitForSelector(QQQMaterialDashboardSelectors.QUERY_GRID_CELL);
   }



   /*******************************************************************************
    **
    *******************************************************************************/
   public void openCriteriaPasterAndPasteValues(String fieldName, List<String> values)
   {
      /////////////////////////////////////////////////////////////////////////////
      // open the is any of criteria for given field and click the paster button //
      /////////////////////////////////////////////////////////////////////////////
      qSeleniumLib.waitForSelectorContaining("BUTTON", fieldName).click();
      qSeleniumLib.waitForSelector("#criteriaOperator").click();
      qSeleniumLib.waitForSelectorContaining("LI", "is any of").click();
      qSeleniumLib.waitForMillis(250);
      qSeleniumLib.waitForSelector(".criteriaPasterButton").click();

      ////////////////////////////////////////
      // paste the values into the textarea //
      ////////////////////////////////////////
      qSeleniumLib
         .waitForSelector(".criteriaPasterTextArea textarea#outlined-multiline-static")
         .sendKeys(String.join("\n", values));
   }



   /*******************************************************************************
    **
    *******************************************************************************/
   public void clickFilterBuilderButton()
   {
      qSeleniumLib.waitForSelectorContaining("BUTTON", "FILTER BUILDER").click();
   }



   /*******************************************************************************
    **
    *******************************************************************************/
   public WebElement assertQuickFilterButtonIndicatesActiveFilter(String fieldName)
   {
      return qSeleniumLib.waitForSelector("#quickFilter\\." + fieldName + ".filterActive");
   }



   /*******************************************************************************
    **
    *******************************************************************************/
   public void assertQuickFilterButtonDoesNotIndicateActiveFilter(String fieldName)
   {
      qSeleniumLib.waitForSelectorToNotExist("#quickFilter\\." + fieldName + ".filterActive");
   }



   /*******************************************************************************
    **
    *******************************************************************************/
   public void clickQuickFilterButton(String fieldName)
   {
      qSeleniumLib.waitForSelector("#quickFilter\\." + fieldName).click();
   }



   /*******************************************************************************
    **
    *******************************************************************************/
   public void gotoAdvancedMode()
   {
      qSeleniumLib.waitForSelectorContaining("BUTTON", "ADVANCED").click();
      qSeleniumLib.waitForSelectorContaining("BUTTON", "FILTER BUILDER");
   }



   /*******************************************************************************
    **
    *******************************************************************************/
   public void gotoBasicMode()
   {
      qSeleniumLib.waitForSelectorContaining("BUTTON", "BASIC").click();
      qSeleniumLib.waitForSelectorContaining("BUTTON", "ADD FILTER");
   }



   /*******************************************************************************
    **
    *******************************************************************************/
   public void assertSavedViewNameOnScreen(String savedViewName)
   {
      qSeleniumLib.waitForSelectorContaining("H3", savedViewName);
   }



   /*******************************************************************************
    **
    *******************************************************************************/
   public WebElement waitForDataGridCellContaining(String containingText)
   {
      return qSeleniumLib.waitForSelectorContaining("DIV.MuiDataGrid-cell", containingText);
   }



   /*******************************************************************************
    **
    *******************************************************************************/
   public void addAdvancedQueryFilterInput(int index, String fieldLabel, String operator, String value, String booleanOperator)
   {
      if(index > 0)
      {
         qSeleniumLib.waitForSelectorContaining("BUTTON", "Add condition").click();
      }

      WebElement subFormForField = qSeleniumLib.waitForSelectorAll(".filterCriteriaRow", index + 1).get(index);

      if(index == 1)
      {
         WebElement booleanOperatorInput = subFormForField.findElement(By.cssSelector(".booleanOperatorColumn .MuiInput-input"));
         booleanOperatorInput.click();
         qSeleniumLib.waitForMillis(100);

         subFormForField.findElement(By.cssSelector(".booleanOperatorColumn .MuiInput-input"));
         qSeleniumLib.waitForSelectorContaining("li", booleanOperator).click();
         qSeleniumLib.waitForMillis(100);
      }

      WebElement fieldInput = subFormForField.findElement(By.cssSelector(".fieldColumn INPUT"));
      fieldInput.click();
      qSeleniumLib.waitForMillis(100);
      fieldInput.clear();
      fieldInput.sendKeys(fieldLabel);
      qSeleniumLib.waitForMillis(100);
      fieldInput.sendKeys("\n");
      qSeleniumLib.waitForMillis(100);

      WebElement operatorInput = subFormForField.findElement(By.cssSelector(".operatorColumn INPUT"));
      operatorInput.click();
      qSeleniumLib.waitForMillis(100);
      operatorInput.sendKeys(Keys.BACK_SPACE, Keys.BACK_SPACE, Keys.BACK_SPACE, Keys.BACK_SPACE, Keys.BACK_SPACE, Keys.BACK_SPACE, Keys.BACK_SPACE, Keys.BACK_SPACE, Keys.BACK_SPACE, Keys.BACK_SPACE, Keys.BACK_SPACE, Keys.BACK_SPACE, operator);
      qSeleniumLib.waitForMillis(100);
      operatorInput.sendKeys("\n");
      qSeleniumLib.waitForMillis(100);

      if(StringUtils.hasContent(value))
      {
         WebElement valueInput = subFormForField.findElement(By.cssSelector(".filterValuesColumn INPUT"));
         valueInput.click();
         valueInput.sendKeys(value);
         qSeleniumLib.waitForMillis(100);
      }
   }



   /*******************************************************************************
    **
    *******************************************************************************/
   public void addBasicFilter(String fieldLabel)
   {
      qSeleniumLib.waitForSelectorContaining("BUTTON", "Add Filter").click();
      qSeleniumLib.waitForSelectorContaining(".fieldListMenuBody-addQuickFilter LI", fieldLabel).click();
      qSeleniumLib.clickBackdrop();
   }



   /*******************************************************************************
    **
    *******************************************************************************/
   public void setBasicFilter(String fieldLabel, String operatorLabel, String value)
   {
      qSeleniumLib.waitForSelectorContaining("BUTTON", fieldLabel).click();
      qSeleniumLib.waitForMillis(250);
      qSeleniumLib.waitForSelector("#criteriaOperator").click();
      qSeleniumLib.waitForSelectorContaining("LI", operatorLabel).click();

      if(StringUtils.hasContent(value))
      {
         qSeleniumLib.waitForSelector(".filterValuesColumn INPUT").click();
         qSeleniumLib.waitForSelector(".filterValuesColumn INPUT").sendKeys(value);
      }

      qSeleniumLib.clickBackdrop();
   }



   /*******************************************************************************
    **
    *******************************************************************************/
   public void setBasicBooleanFilter(String fieldLabel, String operatorLabel)
   {
      qSeleniumLib.waitForSelectorContaining("BUTTON", fieldLabel).click();
      qSeleniumLib.waitForMillis(250);
      qSeleniumLib.waitForSelector("#criteriaOperator").click();
      qSeleniumLib.waitForSelectorContaining("LI", operatorLabel).click();

      qSeleniumLib.clickBackdrop();
   }



   /*******************************************************************************
    **
    *******************************************************************************/
   public void setBasicFilterPossibleValues(String fieldLabel, String operatorLabel, List<String> values)
   {
      qSeleniumLib.waitForSelectorContaining("BUTTON", fieldLabel).click();
      qSeleniumLib.waitForMillis(250);
      qSeleniumLib.waitForSelector("#criteriaOperator").click();
      qSeleniumLib.waitForSelectorContaining("LI", operatorLabel).click();

      if(CollectionUtils.nullSafeHasContents(values))
      {
         qSeleniumLib.waitForSelector(".filterValuesColumn INPUT").click();
         for(String value : values)
         {
            qSeleniumLib.waitForSelectorContaining(".MuiAutocomplete-listbox LI", value).click();
         }
      }

      qSeleniumLib.clickBackdrop();
   }



   /*******************************************************************************
    **
    *******************************************************************************/
   public void waitForAdvancedQueryStringMatchingRegex(String regEx)
   {
      qSeleniumLib.waitForSelectorContainingTextMatchingRegex(".advancedQueryString", regEx);
   }



   /*******************************************************************************
    **
    *******************************************************************************/
   public void waitForBasicFilterButtonMatchingRegex(String regEx)
   {
      qSeleniumLib.waitForSelectorContainingTextMatchingRegex("BUTTON", regEx);
   }
}
