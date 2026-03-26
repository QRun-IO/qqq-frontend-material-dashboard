/*
 * QQQ - Low-code Application Framework for Engineers.
 * Copyright (C) 2021-2025.  Kingsrook, LLC
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

package com.kingsrook.qqq.frontend.materialdashboard.selenium.lib;


import org.openqa.selenium.Keys;
import org.openqa.selenium.WebElement;


/*******************************************************************************
 ** static methods for interacting with standard elements in a QFMD selenium test
 *
 * In theory this class should hold a lot of the CSS selectors that our most
 * common elements need for accessing.
 *
 * And this class is differentiated from {@link QSeleniumLib}, in that that class
 * should be more generic - e.g., for frontends other than QFMD (it might have a
 * few methods that break that rule, like the breadcrumb one), but this one is
 * all about QFMD selectors and structures.
 *******************************************************************************/
public class QFMDSeleniumLib
{
   private final QSeleniumLib qSeleniumLib;



   /*******************************************************************************
    ** Constructor
    **
    *******************************************************************************/
   public QFMDSeleniumLib(QSeleniumLib qSeleniumLib)
   {
      this.qSeleniumLib = qSeleniumLib;
   }



   /*******************************************************************************
    **
    *******************************************************************************/
   public void chooseFromActionMenu(String menuOptionText)
   {
      qSeleniumLib.waitForSelectorContaining("button", "action").click();
      qSeleniumLib.waitForSelectorContaining("li", menuOptionText).click();
   }



   /***************************************************************************
    *
    ***************************************************************************/
   public void clickSaveButton()
   {
      qSeleniumLib.waitForSelectorContaining("button", "Save").click();
   }


   /***************************************************************************
    *
    ***************************************************************************/
   public void clickOkButton()
   {
      qSeleniumLib.waitForSelectorContaining("button", "OK").click();
   }



   /***************************************************************************
    *
    ***************************************************************************/
   public void waitForFormValidationErrorContaining(String messageContaining)
   {
      qSeleniumLib.waitForSelectorContaining("[data-field-error]", messageContaining);
   }



   /***************************************************************************
    *
    ***************************************************************************/
   public void inputDynamicSelectOption(String fieldId, String optionText)
   {
      WebElement input = qSeleniumLib.waitForSelector("input[id=\"" + fieldId + "\"]");
      input.click();
      input.sendKeys(optionText);

      qSeleniumLib.waitForSelectorAllSatisfyingPredicate(".MuiAutocomplete-option", es -> es.size() == 1);

      input.sendKeys(Keys.DOWN);
      input.sendKeys(Keys.ENTER);
   }



   /***************************************************************************
    *
    ***************************************************************************/
   public WebElement inputTextField(String fieldName)
   {
      WebElement input = qSeleniumLib.waitForSelector("input[name=\"" + fieldName + "\"]");
      return (input);
   }



   /***************************************************************************
    *
    ***************************************************************************/
   public WebElement inputTextField(String fieldName, String value)
   {
      WebElement input = inputTextField(fieldName);
      input.click();
      input.sendKeys(value);
      return (input);
   }



   /***************************************************************************
    *
    ***************************************************************************/
   public void waitForAlert(String message)
   {
      qSeleniumLib.waitForSelectorContaining(".MuiAlert-root", message);
   }


   /***************************************************************************
    *
    ***************************************************************************/
   public void waitForAlertToNotExist(String message)
   {
      qSeleniumLib.waitForSelectorContainingToNotExist(".MuiAlert-root", message);
   }



   /***************************************************************************
    *
    ***************************************************************************/
   public void waitForViewScreenFieldValue(String fieldLabel, String value)
   {
      // RecordScreenField renders label and value as separate block elements (getText returns "Label:\nValue")
      // while renderSectionOfFields (used by widgets in view mode) renders inline (getText returns "Label: Value")
      // Try both separators — space and newline.
      // Catch StaleElementReferenceException in the predicate (page may re-render between findElements and getText).
      String withSpace = fieldLabel + ": " + value;
      String withNewline = fieldLabel + ":\n" + value;
      qSeleniumLib.waitForSelectorAllSatisfyingPredicate(".MuiGrid-item",
         elements ->
         {
            try
            {
               return elements.stream().anyMatch(e -> e.getText().contains(withSpace) || e.getText().contains(withNewline));
            }
            catch(org.openqa.selenium.StaleElementReferenceException e)
            {
               return false;
            }
         },
         "containing [" + fieldLabel + ": " + value + "]");
   }


   /***************************************************************************
    *
    ***************************************************************************/
   public void waitForViewScreenFieldValueToNotExist(String fieldLabel, String value)
   {
      String withSpace = fieldLabel + ": " + value;
      String withNewline = fieldLabel + ":\n" + value;
      qSeleniumLib.waitForSelectorAllSatisfyingPredicate(".MuiGrid-item",
         elements -> elements.stream().noneMatch(e -> e.getText().contains(withSpace) || e.getText().contains(withNewline)),
         "not containing [" + fieldLabel + ": " + value + "]");
   }



   /***************************************************************************
    *
    ***************************************************************************/
   public void blurByClickingBlankSpace()
   {
      /////////////////////////////////////////////
      // find a divider in the left nav to click //
      /////////////////////////////////////////////
      qSeleniumLib.waitForSelector(".MuiDrawer-paperAnchorLeft .MuiDivider-root").click();
   }



   /***************************************************************************
    * bring up the dot menu - type something in, then select an option by name
    ***************************************************************************/
   public void dotMenu(String searchText, String nameOfItemToSelect)
   {
      ///////////////////////////////////////////////////////////////////////////////////////////
      // this button is maybe more reliable than sending dot to some nothing-selected element? //
      ///////////////////////////////////////////////////////////////////////////////////////////
      qSeleniumLib.waitForSelectorContaining("header button", "search").click();
      qSeleniumLib.waitForSelector("div[cmdk-root] input").click();
      qSeleniumLib.waitForSelector("div[cmdk-root] input").sendKeys(searchText);
      qSeleniumLib.waitForSelector("div[cmdk-item][data-value=\"" + nameOfItemToSelect + "\"]").click();
   }


   /***************************************************************************
    *
    ***************************************************************************/
   public void waitForPageHeaderToContain(String textContains)
   {
      qSeleniumLib.waitForSelectorContaining("h3", textContains);
   }



   /***************************************************************************
    *
    ***************************************************************************/
   public void waitForQueryScreenPaginationToContain(String textContains)
   {
      qSeleniumLib.waitForSelectorContaining(".MuiTablePagination-displayedRows", textContains);
   }



   /***************************************************************************
    *
    ***************************************************************************/
   public void waitForQueryScreenPaginationValues(Integer from, Integer to, Integer of)
   {
      qSeleniumLib.waitForSelectorContaining(".MuiTablePagination-displayedRows", "Showing " + from + " to " + to + " of " + of);
   }



   /***************************************************************************
    *
    ***************************************************************************/
   public void clickCancelButton()
   {
      qSeleniumLib.waitForSelectorContaining("button", "Cancel").click();
   }



   /***************************************************************************
    *
    ***************************************************************************/
   public void closeAlert()
   {
      qSeleniumLib.waitForSelector(".MuiAlert-root button").click();
   }



   /***************************************************************************
    *
    ***************************************************************************/
   public void waitForDataGridContent(String expectedText)
   {
      qSeleniumLib.waitForSelectorContaining(".MuiDataGrid-cell", expectedText);
   }



   /***************************************************************************
    *
    ***************************************************************************/
   public void waitForDataGridContentToNotExist(String expectedText)
   {
      qSeleniumLib.waitForSelectorContainingToNotExist(".MuiDataGrid-cell", expectedText);
   }
}
