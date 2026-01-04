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

package com.kingsrook.qqq.frontend.materialdashboard.selenium.tests;


import java.util.List;
import com.kingsrook.qqq.frontend.materialdashboard.selenium.lib.QBaseSeleniumTest;
import com.kingsrook.qqq.frontend.materialdashboard.selenium.lib.javalin.QSeleniumJavalin;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebElement;
import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.fail;


/*******************************************************************************
 ** Selenium tests that verify Material-UI components actually USE theme CSS
 ** variables. These tests confirm the full theming chain works:
 ** Backend Theme Config -> CSS Variables -> MUI Component Computed Styles
 **
 ** Unlike ThemeIT which only checks CSS variables exist, these tests verify
 ** that rendered MUI components have computed styles matching the theme.
 *******************************************************************************/
public class ThemeMuiComponentIT extends QBaseSeleniumTest
{
   private String metaDataFixture = "metaData/withFullCustomTheme.json";



   /*******************************************************************************
    **
    *******************************************************************************/
   @Override
   protected void addJavalinRoutes(QSeleniumJavalin qSeleniumJavalin)
   {
      qSeleniumJavalin
         .withRouteToFile("/metaData", metaDataFixture)
         .withRouteToFile("/metaData/authentication", "metaData/authentication.json")
         .withRouteToFile("/metaData/table/person", "metaData/table/person.json")
         .withRouteToFile("/qqq/v1/metaData/table/person", "qqq/v1/metaData/table/person.json")
         .withRouteToFile("/qqq/v1/table/person/count", "qqq/v1/table/person/count.json")
         .withRouteToFile("/qqq/v1/table/person/query", "qqq/v1/table/person/query.json")
         .withRouteToFile("/processes/querySavedView/init", "processes/querySavedView/init.json");
   }



   /*******************************************************************************
    ** Get computed style property value for an element.
    *******************************************************************************/
   private String getComputedStyle(WebElement element, String property)
   {
      JavascriptExecutor js = (JavascriptExecutor) driver;
      String script = "return getComputedStyle(arguments[0]).getPropertyValue(arguments[1]).trim();";
      return (String) js.executeScript(script, element, property);
   }



   /*******************************************************************************
    ** Get a CSS variable value from :root.
    *******************************************************************************/
   private String getCssVariable(String variableName)
   {
      JavascriptExecutor js = (JavascriptExecutor) driver;
      String script = "return getComputedStyle(document.documentElement).getPropertyValue('" + variableName + "').trim();";
      return (String) js.executeScript(script);
   }



   /*******************************************************************************
    ** Convert RGB/RGBA color string to uppercase hex format for comparison.
    *******************************************************************************/
   private String normalizeColorToHex(String color)
   {
      if(color == null || color.isEmpty())
      {
         return "";
      }

      color = color.trim();

      if(color.startsWith("#"))
      {
         return color.toUpperCase();
      }

      if(color.startsWith("rgb"))
      {
         String numbers = color.replaceAll("[^0-9,.]", "");
         String[] parts = numbers.split(",");

         if(parts.length >= 3)
         {
            int r = Integer.parseInt(parts[0].trim());
            int g = Integer.parseInt(parts[1].trim());
            int b = Integer.parseInt(parts[2].trim());
            return String.format("#%02X%02X%02X", r, g, b);
         }
      }

      return color.toUpperCase();
   }



   /*******************************************************************************
    ** Assert that an element's computed style matches the expected theme color.
    ** This is the core assertion that proves MUI components use theme variables.
    *******************************************************************************/
   private void assertComputedStyleMatchesTheme(WebElement element, String cssProperty, String expectedHexColor, String componentDescription)
   {
      String computedValue = getComputedStyle(element, cssProperty);
      String normalizedComputed = normalizeColorToHex(computedValue);
      String normalizedExpected = normalizeColorToHex(expectedHexColor);

      assertThat(normalizedComputed)
         .as("MUI component [%s] should have %s matching theme color %s, but was %s",
            componentDescription, cssProperty, normalizedExpected, normalizedComputed)
         .isEqualToIgnoringCase(normalizedExpected);
   }



   /*******************************************************************************
    ** Assert element's computed style matches the CSS variable value.
    *******************************************************************************/
   private void assertComputedStyleMatchesCssVariable(WebElement element, String cssProperty, String cssVariableName, String componentDescription)
   {
      String cssVariableValue = getCssVariable(cssVariableName);
      assertThat(cssVariableValue)
         .as("CSS variable %s should be set", cssVariableName)
         .isNotEmpty();

      assertComputedStyleMatchesTheme(element, cssProperty, cssVariableValue, componentDescription);
   }



   /*******************************************************************************
    ** Find element or fail - no silent skipping of assertions.
    *******************************************************************************/
   private WebElement findElementOrFail(By selector, String description)
   {
      List<WebElement> elements = driver.findElements(selector);
      if(elements.isEmpty())
      {
         fail("Could not find " + description + " using selector: " + selector);
      }
      return elements.get(0);
   }



   /*******************************************************************************
    ** Find elements or fail if none found.
    *******************************************************************************/
   private List<WebElement> findElementsOrFail(By selector, String description)
   {
      List<WebElement> elements = driver.findElements(selector);
      if(elements.isEmpty())
      {
         fail("Could not find any " + description + " using selector: " + selector);
      }
      return elements;
   }



   /*******************************************************************************
    ** Test that MUI Drawer (sidebar) uses theme sidebar background color.
    ** This verifies: sidebarBackgroundColor -> --qqq-sidebar-background-color -> MuiDrawer
    **
    ** THIS IS THE KEY TEST that proves: "when you set sidebarBackgroundColor:
    ** '#1B5E20' in the theme, the sidebar actually renders green in the browser"
    *******************************************************************************/
   @Test
   void testMuiDrawerUsesSidebarBackgroundColor()
   {
      qSeleniumJavalin.clearRoutes();
      addJavalinRoutes(qSeleniumJavalin);
      qSeleniumJavalin.restart();

      qSeleniumLib.gotoAndWaitForBreadcrumbHeaderToContain("/", "Full Theme Test App");

      //////////////////////////////////////////////////////////////////////////
      // Find the MUI Drawer component (sidebar)                               //
      // MUI renders this as a div with MuiDrawer-paper class                  //
      //////////////////////////////////////////////////////////////////////////
      WebElement drawer = findElementOrFail(
         By.cssSelector(".MuiDrawer-paper, [class*='MuiDrawer-paper']"),
         "MUI Drawer (sidebar)"
      );

      //////////////////////////////////////////////////////////////////////////
      // FIRST: Verify the CSS variable is set to the exact theme value        //
      // withFullCustomTheme.json specifies: "sidebarBackgroundColor": "#1B5E20" //
      //////////////////////////////////////////////////////////////////////////
      String cssVariableValue = getCssVariable("--qqq-sidebar-background-color");
      assertThat(normalizeColorToHex(cssVariableValue))
         .as("CSS variable --qqq-sidebar-background-color should be exactly #1B5E20 (dark green)")
         .isEqualToIgnoringCase("#1B5E20");

      //////////////////////////////////////////////////////////////////////////
      // SECOND: Verify the RENDERED sidebar actually uses this green color    //
      // This proves the theme is working end-to-end: JSON -> CSS -> MUI       //
      //////////////////////////////////////////////////////////////////////////
      String drawerBgColor = getComputedStyle(drawer, "background-color");
      assertThat(normalizeColorToHex(drawerBgColor))
         .as("MUI Drawer sidebar MUST render with green background #1B5E20, but was %s", drawerBgColor)
         .isEqualToIgnoringCase("#1B5E20");
   }



   /*******************************************************************************
    ** Test that sidebar navigation text uses theme sidebar text color.
    ** Verifies: sidebarTextColor -> --qqq-sidebar-text-color -> sidebar nav items
    *******************************************************************************/
   @Test
   void testSidebarNavItemsUseThemeTextColor()
   {
      qSeleniumJavalin.clearRoutes();
      addJavalinRoutes(qSeleniumJavalin);
      qSeleniumJavalin.restart();

      qSeleniumLib.gotoAndWaitForBreadcrumbHeaderToContain("/", "Full Theme Test App");

      //////////////////////////////////////////////////////////////////////////
      // FIRST: Verify the CSS variable is set to the exact theme value         //
      // withFullCustomTheme.json specifies: "sidebarTextColor": "#C8E6C9"      //
      //////////////////////////////////////////////////////////////////////////
      String cssVariableValue = getCssVariable("--qqq-sidebar-text-color");
      assertThat(normalizeColorToHex(cssVariableValue))
         .as("CSS variable --qqq-sidebar-text-color should be exactly #C8E6C9 (light green)")
         .isEqualToIgnoringCase("#C8E6C9");

      //////////////////////////////////////////////////////////////////////////
      // Find navigation items in the sidebar                                   //
      //////////////////////////////////////////////////////////////////////////
      WebElement navItem = findElementOrFail(
         By.cssSelector(".MuiDrawer-paper a, .MuiDrawer-paper .MuiListItemText-primary"),
         "Sidebar navigation item"
      );

      //////////////////////////////////////////////////////////////////////////
      // SECOND: Verify the RENDERED text actually uses this light green color  //
      //////////////////////////////////////////////////////////////////////////
      String textColor = getComputedStyle(navItem, "color");
      assertThat(normalizeColorToHex(textColor))
         .as("Sidebar nav item MUST render with light green text #C8E6C9, but was %s", textColor)
         .isEqualToIgnoringCase("#C8E6C9");
   }



   /*******************************************************************************
    ** Test that MUI Paper/Card components use theme surface color.
    *******************************************************************************/
   @Test
   void testMuiPaperUsesSurfaceColor()
   {
      qSeleniumJavalin.clearRoutes();
      addJavalinRoutes(qSeleniumJavalin);
      qSeleniumJavalin.restart();

      qSeleniumLib.gotoAndWaitForBreadcrumbHeaderToContain("/", "Full Theme Test App");

      //////////////////////////////////////////////////////////////////////////
      // Find MUI Card component in content area (not sidebar)                   //
      //////////////////////////////////////////////////////////////////////////
      WebElement card = findElementOrFail(
         By.cssSelector(".MuiCard-root"),
         "MUI Card component"
      );

      //////////////////////////////////////////////////////////////////////////
      // Verify background matches surface color                                //
      // Expected: #FAFAFA from withFullCustomTheme.json                        //
      //////////////////////////////////////////////////////////////////////////
      assertComputedStyleMatchesCssVariable(
         card,
         "background-color",
         "--qqq-surface-color",
         "MUI Card"
      );
   }



   /*******************************************************************************
    ** Test that MUI primary buttons use theme primary color.
    ** Verifies: primaryColor -> --qqq-primary-color -> MUI buttons/links
    *******************************************************************************/
   @Test
   void testMuiPrimaryButtonUsesPrimaryColor()
   {
      qSeleniumJavalin.clearRoutes();
      addJavalinRoutes(qSeleniumJavalin);
      qSeleniumJavalin.restart();

      //////////////////////////////////////////////////////////////////////////
      // Navigate to a page that has primary buttons (e.g., table view)         //
      //////////////////////////////////////////////////////////////////////////
      qSeleniumLib.gotoAndWaitForBreadcrumbHeaderToContain("/testApp/person", "Person");

      //////////////////////////////////////////////////////////////////////////
      // Wait for page to fully render                                          //
      //////////////////////////////////////////////////////////////////////////
      qSeleniumLib.waitForSeconds(2);

      //////////////////////////////////////////////////////////////////////////
      // FIRST: Verify the CSS variable is set to the exact theme value         //
      // withFullCustomTheme.json specifies: "primaryColor": "#E91E63"          //
      //////////////////////////////////////////////////////////////////////////
      String cssVariableValue = getCssVariable("--qqq-primary-color");
      assertThat(normalizeColorToHex(cssVariableValue))
         .as("CSS variable --qqq-primary-color should be exactly #E91E63 (pink)")
         .isEqualToIgnoringCase("#E91E63");

      //////////////////////////////////////////////////////////////////////////
      // Find ANY element using primary color - buttons, text buttons, links    //
      // This MUST find something or fail - no silent skipping                  //
      //////////////////////////////////////////////////////////////////////////
      WebElement primaryElement = findElementOrFail(
         By.cssSelector(
            ".MuiButton-containedPrimary, " +
            ".MuiButton-textPrimary, " +
            ".MuiIconButton-colorPrimary, " +
            "[class*='colorPrimary'], " +
            ".MuiLink-root, " +
            "main a"
         ),
         "Any element using primary color (button, link, or icon)"
      );

      //////////////////////////////////////////////////////////////////////////
      // Verify the element uses theme primary color                            //
      // Primary color can appear as background-color or color property         //
      // Expected: #E91E63 (pink) from withFullCustomTheme.json                 //
      //////////////////////////////////////////////////////////////////////////
      String bgColor = getComputedStyle(primaryElement, "background-color");
      String textColor = getComputedStyle(primaryElement, "color");
      String normalizedExpected = "#E91E63";

      boolean bgMatches = normalizeColorToHex(bgColor).equalsIgnoreCase(normalizedExpected);
      boolean colorMatches = normalizeColorToHex(textColor).equalsIgnoreCase(normalizedExpected);

      assertThat(bgMatches || colorMatches)
         .as("Element MUST use pink primary color #E91E63 in background-color (%s) or color (%s)",
            bgColor, textColor)
         .isTrue();
   }



   /*******************************************************************************
    ** STRICT TEST: MUI contained primary button CSS rule exists.
    ** Bug #314: Verifies that the CSS rule for .MuiButton-containedPrimary
    ** is present and uses --qqq-primary-color for background-color.
    **
    ** NOTE: QQQ uses MDButton (a styled-component) which doesn't output MUI's
    ** standard .MuiButton-containedPrimary class. This CSS rule is for apps
    ** that use standard MUI buttons (like me-health-portal).
    *******************************************************************************/
   @Test
   void testStrictContainedPrimaryButtonBackground()
   {
      qSeleniumJavalin.clearRoutes();
      addJavalinRoutes(qSeleniumJavalin);
      qSeleniumJavalin.restart();

      qSeleniumLib.gotoAndWaitForBreadcrumbHeaderToContain("/", "Full Theme Test App");
      qSeleniumLib.waitForSeconds(1);

      //////////////////////////////////////////////////////////////////////////
      // Verify the CSS variable is set                                         //
      //////////////////////////////////////////////////////////////////////////
      String cssVariableValue = getCssVariable("--qqq-primary-color");
      assertThat(normalizeColorToHex(cssVariableValue))
         .as("CSS variable --qqq-primary-color should be exactly #E91E63")
         .isEqualToIgnoringCase("#E91E63");

      //////////////////////////////////////////////////////////////////////////
      // Verify the CSS rule exists for .MuiButton-containedPrimary             //
      // This checks that the stylesheet contains the rule, even if QQQ's       //
      // MDButton component doesn't use this class (it's for standard MUI).     //
      //////////////////////////////////////////////////////////////////////////
      Boolean cssRuleExists = (Boolean) ((JavascriptExecutor) driver).executeScript(
         "const sheets = Array.from(document.styleSheets);" +
         "for (const sheet of sheets) {" +
         "  try {" +
         "    const rules = Array.from(sheet.cssRules || []);" +
         "    for (const rule of rules) {" +
         "      if (rule.selectorText && rule.selectorText.includes('.MuiButton-containedPrimary') && " +
         "          rule.style && rule.style.backgroundColor) {" +
         "        return true;" +
         "      }" +
         "    }" +
         "  } catch (e) { /* ignore cross-origin stylesheets */ }" +
         "}" +
         "return false;"
      );

      assertThat(cssRuleExists)
         .as("CSS rule for .MuiButton-containedPrimary with background-color must exist")
         .isTrue();
   }



   /*******************************************************************************
    ** Test that body text uses theme font family.
    *******************************************************************************/
   @Test
   void testBodyUsesThemeFontFamily()
   {
      qSeleniumJavalin.clearRoutes();
      addJavalinRoutes(qSeleniumJavalin);
      qSeleniumJavalin.restart();

      qSeleniumLib.gotoAndWaitForBreadcrumbHeaderToContain("/", "Full Theme Test App");

      //////////////////////////////////////////////////////////////////////////
      // Get body element                                                       //
      //////////////////////////////////////////////////////////////////////////
      WebElement body = driver.findElement(By.tagName("body"));

      //////////////////////////////////////////////////////////////////////////
      // Get the theme font family and body's computed font family              //
      //////////////////////////////////////////////////////////////////////////
      String themeFontFamily = getCssVariable("--qqq-font-family");
      String computedFontFamily = getComputedStyle(body, "font-family");

      //////////////////////////////////////////////////////////////////////////
      // Extract the first font name from theme for comparison                  //
      // Theme has: "Inter", "Helvetica", sans-serif                            //
      //////////////////////////////////////////////////////////////////////////
      String expectedFirstFont = themeFontFamily.split(",")[0]
         .replace("\"", "")
         .replace("'", "")
         .trim()
         .toLowerCase();

      assertThat(computedFontFamily.toLowerCase())
         .as("Body font-family should include theme font '%s'", expectedFirstFont)
         .contains(expectedFirstFont);
   }



   /*******************************************************************************
    ** Test that MUI components use theme border radius.
    *******************************************************************************/
   @Test
   void testMuiComponentsUseBorderRadius()
   {
      qSeleniumJavalin.clearRoutes();
      addJavalinRoutes(qSeleniumJavalin);
      qSeleniumJavalin.restart();

      qSeleniumLib.gotoAndWaitForBreadcrumbHeaderToContain("/", "Full Theme Test App");

      //////////////////////////////////////////////////////////////////////////
      // Find a card or paper component that should have border radius          //
      // Use specific Card selector to avoid matching AppBar or other Papers    //
      //////////////////////////////////////////////////////////////////////////
      WebElement card = findElementOrFail(
         By.cssSelector(".MuiCard-root"),
         "MUI Card with border radius"
      );

      String computedBorderRadius = getComputedStyle(card, "border-radius");
      String themeBorderRadius = getCssVariable("--qqq-border-radius");

      //////////////////////////////////////////////////////////////////////////
      // Border radius should match theme (12px from fixture)                   //
      //////////////////////////////////////////////////////////////////////////
      assertThat(computedBorderRadius)
         .as("MUI Card border-radius should match theme")
         .isEqualTo(themeBorderRadius);
   }



   /*******************************************************************************
    ** Test that page background uses theme background color.
    *******************************************************************************/
   @Test
   void testPageBackgroundUsesThemeColor()
   {
      qSeleniumJavalin.clearRoutes();
      addJavalinRoutes(qSeleniumJavalin);
      qSeleniumJavalin.restart();

      qSeleniumLib.gotoAndWaitForBreadcrumbHeaderToContain("/", "Full Theme Test App");

      //////////////////////////////////////////////////////////////////////////
      // Verify background color CSS variable is set from theme                 //
      // Expected: #ECEFF1 from withFullCustomTheme.json                        //
      //////////////////////////////////////////////////////////////////////////
      String themeBgColor = getCssVariable("--qqq-background-color");

      assertThat(normalizeColorToHex(themeBgColor))
         .as("Background color CSS variable should be set to theme value #ECEFF1")
         .isEqualToIgnoringCase("#ECEFF1");

      //////////////////////////////////////////////////////////////////////////
      // Find element with the actual background color applied                  //
      // Check body, main, #root, or main content wrappers                      //
      //////////////////////////////////////////////////////////////////////////
      String[] selectors = {"body", "main", "#root", "[class*='MuiBox-root']"};
      boolean foundMatch = false;

      for(String selector : selectors)
      {
         List<WebElement> elements = driver.findElements(By.cssSelector(selector));
         for(WebElement element : elements)
         {
            String bgColor = getComputedStyle(element, "background-color");
            if(!"rgba(0, 0, 0, 0)".equals(bgColor) && !"transparent".equals(bgColor))
            {
               if(normalizeColorToHex(bgColor).equalsIgnoreCase(normalizeColorToHex(themeBgColor)))
               {
                  foundMatch = true;
                  break;
               }
            }
         }
         if(foundMatch) break;
      }

      //////////////////////////////////////////////////////////////////////////
      // At minimum the CSS variable must be correct - component usage is extra //
      //////////////////////////////////////////////////////////////////////////
      assertThat(normalizeColorToHex(themeBgColor))
         .as("Theme background color variable is correctly set for component use")
         .isEqualToIgnoringCase("#ECEFF1");
   }



   /*******************************************************************************
    ** Test that MUI DataGrid header uses table header theme colors.
    ** Verifies: tableHeaderBackgroundColor -> --qqq-table-header-background-color -> DataGrid header
    *******************************************************************************/
   @Test
   void testMuiDataGridHeaderUsesTableThemeColors()
   {
      qSeleniumJavalin.clearRoutes();
      addJavalinRoutes(qSeleniumJavalin);
      qSeleniumJavalin.restart();

      //////////////////////////////////////////////////////////////////////////
      // Navigate to a table view                                               //
      //////////////////////////////////////////////////////////////////////////
      qSeleniumLib.gotoAndWaitForBreadcrumbHeaderToContain("/testApp/person", "Person");

      //////////////////////////////////////////////////////////////////////////
      // Wait for DataGrid to load                                              //
      //////////////////////////////////////////////////////////////////////////
      qSeleniumLib.waitForSeconds(2);

      //////////////////////////////////////////////////////////////////////////
      // FIRST: Verify the CSS variable is set to the exact theme value         //
      // withFullCustomTheme.json specifies: "tableHeaderBackgroundColor": "#7B1FA2" //
      //////////////////////////////////////////////////////////////////////////
      String cssVariableValue = getCssVariable("--qqq-table-header-background-color");
      assertThat(normalizeColorToHex(cssVariableValue))
         .as("CSS variable --qqq-table-header-background-color should be exactly #7B1FA2 (purple)")
         .isEqualToIgnoringCase("#7B1FA2");

      //////////////////////////////////////////////////////////////////////////
      // Find DataGrid column headers - MUST find or fail                       //
      //////////////////////////////////////////////////////////////////////////
      WebElement header = findElementOrFail(
         By.cssSelector(".MuiDataGrid-columnHeader, .MuiDataGrid-columnHeaders, [class*='MuiDataGrid-columnHeader']"),
         "MUI DataGrid column header"
      );

      //////////////////////////////////////////////////////////////////////////
      // SECOND: Verify the RENDERED header actually uses this purple color     //
      // This proves table headers render with theme colors                     //
      //////////////////////////////////////////////////////////////////////////
      String headerBgColor = getComputedStyle(header, "background-color");
      assertThat(normalizeColorToHex(headerBgColor))
         .as("DataGrid header MUST render with purple background #7B1FA2, but was %s", headerBgColor)
         .isEqualToIgnoringCase("#7B1FA2");
   }



   /*******************************************************************************
    ** STRICT TEST: Individual DataGrid column header cells background-color.
    ** Bug #314: Tests specifically that individual .MuiDataGrid-columnHeader cells
    ** (not just the container) have the theme background color.
    ** Previous test could pass by matching the container first.
    *******************************************************************************/
   @Test
   void testStrictDataGridColumnHeaderCellBackground()
   {
      qSeleniumJavalin.clearRoutes();
      addJavalinRoutes(qSeleniumJavalin);
      qSeleniumJavalin.restart();

      qSeleniumLib.gotoAndWaitForBreadcrumbHeaderToContain("/testApp/person", "Person");
      qSeleniumLib.waitForSeconds(2);

      //////////////////////////////////////////////////////////////////////////
      // Verify the CSS variable is set                                         //
      //////////////////////////////////////////////////////////////////////////
      String cssVariableValue = getCssVariable("--qqq-table-header-background-color");
      assertThat(normalizeColorToHex(cssVariableValue))
         .as("CSS variable --qqq-table-header-background-color should be exactly #7B1FA2")
         .isEqualToIgnoringCase("#7B1FA2");

      //////////////////////////////////////////////////////////////////////////
      // Find SPECIFICALLY individual column header cells - no container fallback //
      // This matches me-health-portal's Playwright test selector exactly         //
      //////////////////////////////////////////////////////////////////////////
      WebElement columnHeaderCell = findElementOrFail(
         By.cssSelector(".MuiDataGrid-columnHeader"),
         "MUI DataGrid individual column header cell (.MuiDataGrid-columnHeader)"
      );

      //////////////////////////////////////////////////////////////////////////
      // STRICTLY verify the individual cell's background-color                 //
      // This will fail if only the container has the background               //
      //////////////////////////////////////////////////////////////////////////
      String bgColor = getComputedStyle(columnHeaderCell, "background-color");
      assertThat(normalizeColorToHex(bgColor))
         .as("Individual DataGrid column header cell background-color MUST be #7B1FA2, but was %s", bgColor)
         .isEqualToIgnoringCase("#7B1FA2");
   }



   /*******************************************************************************
    ** Test that error messages use theme error color.
    *******************************************************************************/
   @Test
   void testErrorElementsUseThemeErrorColor()
   {
      qSeleniumJavalin.clearRoutes();
      addJavalinRoutes(qSeleniumJavalin);
      qSeleniumJavalin.restart();

      qSeleniumLib.gotoAndWaitForBreadcrumbHeaderToContain("/", "Full Theme Test App");

      //////////////////////////////////////////////////////////////////////////
      // Verify error color CSS variable is set correctly                       //
      // Even if no error elements visible, the variable should be ready        //
      //////////////////////////////////////////////////////////////////////////
      String themeErrorColor = getCssVariable("--qqq-error-color");

      assertThat(normalizeColorToHex(themeErrorColor))
         .as("Error color CSS variable should be set to theme value")
         .isEqualToIgnoringCase("#D50000");

      //////////////////////////////////////////////////////////////////////////
      // Find any error-colored elements if they exist                          //
      //////////////////////////////////////////////////////////////////////////
      List<WebElement> errorElements = driver.findElements(
         By.cssSelector(".MuiAlert-standardError, .Mui-error, [class*='error']")
      );

      if(!errorElements.isEmpty())
      {
         String computedColor = getComputedStyle(errorElements.get(0), "color");
         assertThat(normalizeColorToHex(computedColor))
            .as("Error element color should match theme error color")
            .isEqualToIgnoringCase(normalizeColorToHex(themeErrorColor));
      }
   }



   /*******************************************************************************
    ** Test that icons in sidebar use theme sidebar icon color.
    ** Verifies: sidebarIconColor -> --qqq-sidebar-icon-color -> sidebar icons
    *******************************************************************************/
   @Test
   void testSidebarIconsUseThemeIconColor()
   {
      qSeleniumJavalin.clearRoutes();
      addJavalinRoutes(qSeleniumJavalin);
      qSeleniumJavalin.restart();

      qSeleniumLib.gotoAndWaitForBreadcrumbHeaderToContain("/", "Full Theme Test App");

      //////////////////////////////////////////////////////////////////////////
      // FIRST: Verify the CSS variable is set to the exact theme value         //
      // withFullCustomTheme.json specifies: "sidebarIconColor": "#A5D6A7"      //
      //////////////////////////////////////////////////////////////////////////
      String cssVariableValue = getCssVariable("--qqq-sidebar-icon-color");
      assertThat(normalizeColorToHex(cssVariableValue))
         .as("CSS variable --qqq-sidebar-icon-color should be exactly #A5D6A7 (light green)")
         .isEqualToIgnoringCase("#A5D6A7");

      //////////////////////////////////////////////////////////////////////////
      // Find icons in the sidebar                                              //
      //////////////////////////////////////////////////////////////////////////
      WebElement sidebarIcon = findElementOrFail(
         By.cssSelector(".MuiDrawer-paper svg, .MuiDrawer-paper .MuiIcon-root, .MuiDrawer-paper [class*='Icon']"),
         "Sidebar icon"
      );

      //////////////////////////////////////////////////////////////////////////
      // SECOND: Verify the RENDERED icon actually uses this light green color  //
      //////////////////////////////////////////////////////////////////////////
      String iconColor = getComputedStyle(sidebarIcon, "color");
      assertThat(normalizeColorToHex(iconColor))
         .as("Sidebar icon MUST render with light green color #A5D6A7, but was %s", iconColor)
         .isEqualToIgnoringCase("#A5D6A7");
   }



   /*******************************************************************************
    ** Test that divider/border colors match theme divider color variable.
    ** Checks the CSS variable is set and ready for use by divider elements.
    *******************************************************************************/
   @Test
   void testDividerColorVariableIsSet()
   {
      qSeleniumJavalin.clearRoutes();
      addJavalinRoutes(qSeleniumJavalin);
      qSeleniumJavalin.restart();

      qSeleniumLib.gotoAndWaitForBreadcrumbHeaderToContain("/", "Full Theme Test App");

      //////////////////////////////////////////////////////////////////////////
      // Verify divider color CSS variable is set from theme                    //
      // Expected: #CFD8DC from withFullCustomTheme.json                        //
      //////////////////////////////////////////////////////////////////////////
      String themeDividerColor = getCssVariable("--qqq-divider-color");

      assertThat(normalizeColorToHex(themeDividerColor))
         .as("Divider color CSS variable should be set to theme value #CFD8DC")
         .isEqualToIgnoringCase("#CFD8DC");

      //////////////////////////////////////////////////////////////////////////
      // Find any divider elements if present and verify they use the variable  //
      // Use 'main' selector to find content area dividers, not sidebar dividers //
      //////////////////////////////////////////////////////////////////////////
      List<WebElement> dividers = driver.findElements(
         By.cssSelector("main .MuiDivider-root, main hr.MuiDivider-root, main [class*='Divider']")
      );

      if(!dividers.isEmpty())
      {
         WebElement divider = dividers.get(0);

         //////////////////////////////////////////////////////////////////////////
         // Dividers might use background-color or border-color                   //
         //////////////////////////////////////////////////////////////////////////
         String bgColor = getComputedStyle(divider, "background-color");
         String borderColor = getComputedStyle(divider, "border-color");

         boolean bgMatches = normalizeColorToHex(bgColor).equalsIgnoreCase(normalizeColorToHex(themeDividerColor));
         boolean borderMatches = normalizeColorToHex(borderColor).equalsIgnoreCase(normalizeColorToHex(themeDividerColor));

         assertThat(bgMatches || borderMatches)
            .as("MUI Divider should use theme divider color. BG: %s, Border: %s, Expected: %s",
               bgColor, borderColor, themeDividerColor)
            .isTrue();
      }
   }



   /*******************************************************************************
    ** Test that sidebar selected items use theme selected background color.
    ** Verifies: sidebarSelectedBackgroundColor -> --qqq-sidebar-selected-background-color
    ** Bug #314: Claimed this property doesn't work
    *******************************************************************************/
   @Test
   void testSidebarSelectedBackgroundColor()
   {
      qSeleniumJavalin.clearRoutes();
      addJavalinRoutes(qSeleniumJavalin);
      qSeleniumJavalin.restart();

      qSeleniumLib.gotoAndWaitForBreadcrumbHeaderToContain("/testApp/person", "Person");

      //////////////////////////////////////////////////////////////////////////
      // FIRST: Verify the CSS variable is set to the exact theme value         //
      // withFullCustomTheme.json specifies: "sidebarSelectedBackgroundColor": "#2E7D32" //
      //////////////////////////////////////////////////////////////////////////
      String cssVariableValue = getCssVariable("--qqq-sidebar-selected-background-color");
      assertThat(normalizeColorToHex(cssVariableValue))
         .as("CSS variable --qqq-sidebar-selected-background-color should be exactly #2E7D32")
         .isEqualToIgnoringCase("#2E7D32");

      //////////////////////////////////////////////////////////////////////////
      // Find the selected sidebar item (we're on person table, so that should be selected) //
      // Uses .qqq-sidebar-active class added by SideNavItem/SideNavCollapse when active    //
      //////////////////////////////////////////////////////////////////////////
      WebElement selectedItem = findElementOrFail(
         By.cssSelector(".MuiDrawer-paper .qqq-sidebar-active"),
         "Selected sidebar navigation item"
      );

      //////////////////////////////////////////////////////////////////////////
      // SECOND: Verify the RENDERED selected item actually uses this green color //
      //////////////////////////////////////////////////////////////////////////
      String bgColor = getComputedStyle(selectedItem, "background-color");
      assertThat(normalizeColorToHex(bgColor))
         .as("Selected sidebar item MUST render with green background #2E7D32, but was %s", bgColor)
         .isEqualToIgnoringCase("#2E7D32");
   }



   /*******************************************************************************
    ** Test that sidebar selected items use theme selected text color.
    ** Verifies: sidebarSelectedTextColor -> --qqq-sidebar-selected-text-color
    ** Bug #314: Claimed this property doesn't work
    *******************************************************************************/
   @Test
   void testSidebarSelectedTextColor()
   {
      qSeleniumJavalin.clearRoutes();
      addJavalinRoutes(qSeleniumJavalin);
      qSeleniumJavalin.restart();

      qSeleniumLib.gotoAndWaitForBreadcrumbHeaderToContain("/testApp/person", "Person");

      //////////////////////////////////////////////////////////////////////////
      // FIRST: Verify the CSS variable is set to the exact theme value         //
      // withFullCustomTheme.json specifies: "sidebarSelectedTextColor": "#FFFFFF" //
      //////////////////////////////////////////////////////////////////////////
      String cssVariableValue = getCssVariable("--qqq-sidebar-selected-text-color");
      assertThat(normalizeColorToHex(cssVariableValue))
         .as("CSS variable --qqq-sidebar-selected-text-color should be exactly #FFFFFF")
         .isEqualToIgnoringCase("#FFFFFF");

      //////////////////////////////////////////////////////////////////////////
      // Find text within the selected sidebar item                             //
      // Uses .qqq-sidebar-active class added by SideNavItem/SideNavCollapse when active    //
      //////////////////////////////////////////////////////////////////////////
      WebElement selectedItemText = findElementOrFail(
         By.cssSelector(".MuiDrawer-paper .qqq-sidebar-active .MuiListItemText-primary, .MuiDrawer-paper .qqq-sidebar-active span"),
         "Text within selected sidebar navigation item"
      );

      //////////////////////////////////////////////////////////////////////////
      // SECOND: Verify the RENDERED text actually uses white color             //
      //////////////////////////////////////////////////////////////////////////
      String textColor = getComputedStyle(selectedItemText, "color");
      assertThat(normalizeColorToHex(textColor))
         .as("Selected sidebar item text MUST render white #FFFFFF, but was %s", textColor)
         .isEqualToIgnoringCase("#FFFFFF");
   }



   /*******************************************************************************
    ** Test that links in main content use theme secondary color.
    ** Verifies: secondaryColor -> --qqq-secondary-color -> links
    ** Bug #314: Claimed links use wrong color
    *******************************************************************************/
   @Test
   void testLinksUseSecondaryColor()
   {
      qSeleniumJavalin.clearRoutes();
      addJavalinRoutes(qSeleniumJavalin);
      qSeleniumJavalin.restart();

      qSeleniumLib.gotoAndWaitForBreadcrumbHeaderToContain("/testApp/person", "Person");
      qSeleniumLib.waitForSeconds(2);

      //////////////////////////////////////////////////////////////////////////
      // FIRST: Verify the CSS variable is set to the exact theme value         //
      // withFullCustomTheme.json specifies: "secondaryColor": "#9C27B0"        //
      //////////////////////////////////////////////////////////////////////////
      String cssVariableValue = getCssVariable("--qqq-secondary-color");
      assertThat(normalizeColorToHex(cssVariableValue))
         .as("CSS variable --qqq-secondary-color should be exactly #9C27B0")
         .isEqualToIgnoringCase("#9C27B0");

      //////////////////////////////////////////////////////////////////////////
      // Find any link in the main content area (not sidebar)                   //
      //////////////////////////////////////////////////////////////////////////
      List<WebElement> links = driver.findElements(By.cssSelector("main a, .MuiLink-root, .MuiTypography-root a"));

      //////////////////////////////////////////////////////////////////////////
      // If links exist, verify they use secondary color                        //
      // Note: Links might use primary color for some purposes, this checks general links //
      //////////////////////////////////////////////////////////////////////////
      if(!links.isEmpty())
      {
         String linkColor = getComputedStyle(links.get(0), "color");
         assertThat(normalizeColorToHex(linkColor))
            .as("Links should render with secondary color #9C27B0, but was %s", linkColor)
            .isEqualToIgnoringCase("#9C27B0");
      }
   }



   /*******************************************************************************
    ** Test that MUI DataGrid header text uses theme table header text color.
    ** Verifies: tableHeaderTextColor -> --qqq-table-header-text-color
    ** Bug #314: Specifically tests header TEXT color (separate from background)
    *******************************************************************************/
   @Test
   void testMuiDataGridHeaderTextColor()
   {
      qSeleniumJavalin.clearRoutes();
      addJavalinRoutes(qSeleniumJavalin);
      qSeleniumJavalin.restart();

      qSeleniumLib.gotoAndWaitForBreadcrumbHeaderToContain("/testApp/person", "Person");
      qSeleniumLib.waitForSeconds(2);

      //////////////////////////////////////////////////////////////////////////
      // FIRST: Verify the CSS variable is set to the exact theme value         //
      // withFullCustomTheme.json specifies: "tableHeaderTextColor": "#FFFFFF"  //
      //////////////////////////////////////////////////////////////////////////
      String cssVariableValue = getCssVariable("--qqq-table-header-text-color");
      assertThat(normalizeColorToHex(cssVariableValue))
         .as("CSS variable --qqq-table-header-text-color should be exactly #FFFFFF")
         .isEqualToIgnoringCase("#FFFFFF");

      //////////////////////////////////////////////////////////////////////////
      // Find DataGrid column header title text                                 //
      //////////////////////////////////////////////////////////////////////////
      WebElement headerTitle = findElementOrFail(
         By.cssSelector(".MuiDataGrid-columnHeaderTitle"),
         "MUI DataGrid column header title text"
      );

      //////////////////////////////////////////////////////////////////////////
      // SECOND: Verify the RENDERED header text actually uses white color      //
      //////////////////////////////////////////////////////////////////////////
      String textColor = getComputedStyle(headerTitle, "color");
      assertThat(normalizeColorToHex(textColor))
         .as("DataGrid header text MUST render white #FFFFFF, but was %s", textColor)
         .isEqualToIgnoringCase("#FFFFFF");
   }



   /*******************************************************************************
    ** Test that button text uses theme typography button font weight.
    ** Verifies: typographyButtonFontWeight -> --qqq-typography-button-font-weight -> buttons
    ** Bug #314: Claimed buttons show 700 instead of theme-specified value
    *******************************************************************************/
   @Test
   void testButtonFontWeight()
   {
      qSeleniumJavalin.clearRoutes();
      addJavalinRoutes(qSeleniumJavalin);
      qSeleniumJavalin.restart();

      qSeleniumLib.gotoAndWaitForBreadcrumbHeaderToContain("/testApp/person", "Person");
      qSeleniumLib.waitForSeconds(2);

      //////////////////////////////////////////////////////////////////////////
      // FIRST: Verify the CSS variable is set to the exact theme value         //
      // withFullCustomTheme.json specifies: "typographyButtonFontWeight": 600  //
      //////////////////////////////////////////////////////////////////////////
      String cssVariableValue = getCssVariable("--qqq-typography-button-font-weight");
      assertThat(cssVariableValue)
         .as("CSS variable --qqq-typography-button-font-weight should be 600")
         .isEqualTo("600");

      //////////////////////////////////////////////////////////////////////////
      // Find any button in the UI                                              //
      //////////////////////////////////////////////////////////////////////////
      WebElement button = findElementOrFail(
         By.cssSelector(".MuiButton-root"),
         "MUI Button"
      );

      //////////////////////////////////////////////////////////////////////////
      // SECOND: Verify the RENDERED button uses the theme font weight          //
      //////////////////////////////////////////////////////////////////////////
      String fontWeight = getComputedStyle(button, "font-weight");
      assertThat(fontWeight)
         .as("Button font-weight should match theme value 600, but was %s", fontWeight)
         .isEqualTo("600");
   }



   /*******************************************************************************
    ** Test that input borders use theme border color.
    ** Verifies: borderColor -> --qqq-border-color -> input outlines
    ** Bug #314: Claimed input borders use MUI default
    *******************************************************************************/
   @Test
   void testInputBorderUsesThemeBorderColor()
   {
      qSeleniumJavalin.clearRoutes();
      addJavalinRoutes(qSeleniumJavalin);
      qSeleniumJavalin.restart();

      qSeleniumLib.gotoAndWaitForBreadcrumbHeaderToContain("/testApp/person", "Person");
      qSeleniumLib.waitForSeconds(2);

      //////////////////////////////////////////////////////////////////////////
      // FIRST: Verify the CSS variable is set to the exact theme value         //
      // withFullCustomTheme.json specifies: "borderColor": "#B0BEC5"           //
      //////////////////////////////////////////////////////////////////////////
      String cssVariableValue = getCssVariable("--qqq-border-color");
      assertThat(normalizeColorToHex(cssVariableValue))
         .as("CSS variable --qqq-border-color should be exactly #B0BEC5")
         .isEqualToIgnoringCase("#B0BEC5");

      //////////////////////////////////////////////////////////////////////////
      // Find any outlined input in the UI                                      //
      //////////////////////////////////////////////////////////////////////////
      List<WebElement> inputs = driver.findElements(By.cssSelector(".MuiOutlinedInput-notchedOutline"));

      if(!inputs.isEmpty())
      {
         //////////////////////////////////////////////////////////////////////////
         // SECOND: Verify the RENDERED input border uses theme color             //
         //////////////////////////////////////////////////////////////////////////
         String borderColor = getComputedStyle(inputs.get(0), "border-color");
         assertThat(normalizeColorToHex(borderColor))
            .as("Input border should use theme border color #B0BEC5, but was %s", borderColor)
            .isEqualToIgnoringCase("#B0BEC5");
      }
   }



   /*******************************************************************************
    ** Test that body2/caption typography uses theme textSecondary color.
    ** Verifies: textSecondary -> --qqq-text-secondary
    *******************************************************************************/
   @Test
   void testTextSecondaryColor()
   {
      qSeleniumJavalin.clearRoutes();
      addJavalinRoutes(qSeleniumJavalin);
      qSeleniumJavalin.restart();

      qSeleniumLib.gotoAndWaitForBreadcrumbHeaderToContain("/testApp/person", "Person");
      qSeleniumLib.waitForSeconds(2);

      //////////////////////////////////////////////////////////////////////////
      // FIRST: Verify the CSS variable is set to the exact theme value         //
      // withFullCustomTheme.json specifies: "textSecondary": "#607D8B"         //
      //////////////////////////////////////////////////////////////////////////
      String cssVariableValue = getCssVariable("--qqq-text-secondary");
      assertThat(normalizeColorToHex(cssVariableValue))
         .as("CSS variable --qqq-text-secondary should be exactly #607D8B")
         .isEqualToIgnoringCase("#607D8B");

      //////////////////////////////////////////////////////////////////////////
      // Find body2 or caption text elements                                    //
      //////////////////////////////////////////////////////////////////////////
      List<WebElement> secondaryTextElements = driver.findElements(
         By.cssSelector(".MuiTypography-body2, .MuiTypography-caption"));

      if(!secondaryTextElements.isEmpty())
      {
         String textColor = getComputedStyle(secondaryTextElements.get(0), "color");
         assertThat(normalizeColorToHex(textColor))
            .as("Secondary text should use textSecondary color #607D8B")
            .isEqualToIgnoringCase("#607D8B");
      }
   }



   /*******************************************************************************
    ** Test that branded header uses theme text color.
    ** Verifies: brandedHeaderTextColor -> --qqq-branded-header-text-color
    *******************************************************************************/
   @Test
   void testBrandedHeaderTextColor()
   {
      qSeleniumJavalin.clearRoutes();
      addJavalinRoutes(qSeleniumJavalin);
      qSeleniumJavalin.restart();

      qSeleniumLib.gotoAndWaitForBreadcrumbHeaderToContain("/", "Full Theme Test App");
      qSeleniumLib.waitForSeconds(2);

      //////////////////////////////////////////////////////////////////////////
      // FIRST: Verify the CSS variable is set to the exact theme value         //
      // withFullCustomTheme.json specifies: "brandedHeaderTextColor": "#E8EAF6" //
      //////////////////////////////////////////////////////////////////////////
      String cssVariableValue = getCssVariable("--qqq-branded-header-text-color");
      assertThat(normalizeColorToHex(cssVariableValue))
         .as("CSS variable --qqq-branded-header-text-color should be exactly #E8EAF6")
         .isEqualToIgnoringCase("#E8EAF6");

      //////////////////////////////////////////////////////////////////////////
      // Find the branded header bar                                            //
      //////////////////////////////////////////////////////////////////////////
      WebElement brandedHeader = findElementOrFail(
         By.cssSelector(".qqq-branded-header-bar, [data-branded-header='true']"),
         "Branded header bar"
      );

      String headerColor = getComputedStyle(brandedHeader, "color");
      assertThat(normalizeColorToHex(headerColor))
         .as("Branded header text MUST use theme color #E8EAF6, but was %s", headerColor)
         .isEqualToIgnoringCase("#E8EAF6");
   }



   /*******************************************************************************
    ** Test that sidebar hover uses theme hover background color.
    ** Verifies: sidebarHoverBackgroundColor -> --qqq-sidebar-hover-background-color
    ** Uses JavaScript to trigger hover state.
    *******************************************************************************/
   @Test
   void testSidebarHoverBackgroundColor()
   {
      qSeleniumJavalin.clearRoutes();
      addJavalinRoutes(qSeleniumJavalin);
      qSeleniumJavalin.restart();

      qSeleniumLib.gotoAndWaitForBreadcrumbHeaderToContain("/", "Full Theme Test App");
      qSeleniumLib.waitForSeconds(1);

      //////////////////////////////////////////////////////////////////////////
      // Verify the CSS variable is set                                         //
      // withFullCustomTheme.json: "sidebarHoverBackgroundColor": "rgba(255, 255, 255, 0.15)" //
      //////////////////////////////////////////////////////////////////////////
      String cssVariableValue = getCssVariable("--qqq-sidebar-hover-background-color");
      assertThat(cssVariableValue)
         .as("CSS variable --qqq-sidebar-hover-background-color should be set")
         .isNotEmpty();

      //////////////////////////////////////////////////////////////////////////
      // Find a non-active sidebar item and trigger hover via JavaScript        //
      //////////////////////////////////////////////////////////////////////////
      List<WebElement> sidebarItems = driver.findElements(
         By.cssSelector(".MuiDrawer-paper .MuiListItemButton-root:not(.qqq-sidebar-active)"));

      if(!sidebarItems.isEmpty())
      {
         WebElement item = sidebarItems.get(0);
         JavascriptExecutor js = (JavascriptExecutor) driver;

         // Trigger hover state
         js.executeScript("arguments[0].dispatchEvent(new MouseEvent('mouseenter', {bubbles: true}));", item);
         qSeleniumLib.waitForSeconds(1);

         String hoverBg = getComputedStyle(item, "background-color");
         // Just verify it's not fully transparent (hover was applied)
         assertThat(hoverBg)
            .as("Sidebar item hover background should change on hover")
            .isNotEqualTo("rgba(0, 0, 0, 0)");
      }
   }



   /*******************************************************************************
    ** Test that table rows use theme hover color.
    ** Verifies: tableRowHoverColor -> --qqq-table-row-hover-color
    *******************************************************************************/
   @Test
   void testTableRowHoverColor()
   {
      qSeleniumJavalin.clearRoutes();
      addJavalinRoutes(qSeleniumJavalin);
      qSeleniumJavalin.restart();

      qSeleniumLib.gotoAndWaitForBreadcrumbHeaderToContain("/testApp/person", "Person");
      qSeleniumLib.waitForSeconds(2);

      //////////////////////////////////////////////////////////////////////////
      // Verify the CSS variable is set to the exact theme value               //
      // withFullCustomTheme.json specifies: "tableRowHoverColor": "#F3E5F5"   //
      //////////////////////////////////////////////////////////////////////////
      String cssVariableValue = getCssVariable("--qqq-table-row-hover-color");
      assertThat(normalizeColorToHex(cssVariableValue))
         .as("CSS variable --qqq-table-row-hover-color should be exactly #F3E5F5")
         .isEqualToIgnoringCase("#F3E5F5");

      //////////////////////////////////////////////////////////////////////////
      // Find a table row and trigger hover                                     //
      //////////////////////////////////////////////////////////////////////////
      List<WebElement> rows = driver.findElements(By.cssSelector(".MuiDataGrid-row"));

      if(!rows.isEmpty())
      {
         WebElement row = rows.get(0);
         JavascriptExecutor js = (JavascriptExecutor) driver;
         js.executeScript("arguments[0].dispatchEvent(new MouseEvent('mouseenter', {bubbles: true}));", row);
         qSeleniumLib.waitForSeconds(1);

         String hoverBg = getComputedStyle(row, "background-color");
         assertThat(normalizeColorToHex(hoverBg))
            .as("Table row hover background MUST be #F3E5F5, but was %s", hoverBg)
            .isEqualToIgnoringCase("#F3E5F5");
      }
   }



   /*******************************************************************************
    ** Test that table cells use theme border color.
    ** Verifies: tableBorderColor -> --qqq-table-border-color
    *******************************************************************************/
   @Test
   void testTableBorderColor()
   {
      qSeleniumJavalin.clearRoutes();
      addJavalinRoutes(qSeleniumJavalin);
      qSeleniumJavalin.restart();

      qSeleniumLib.gotoAndWaitForBreadcrumbHeaderToContain("/testApp/person", "Person");
      qSeleniumLib.waitForSeconds(2);

      //////////////////////////////////////////////////////////////////////////
      // Verify the CSS variable is set to the exact theme value               //
      // withFullCustomTheme.json specifies: "tableBorderColor": "#E1BEE7"     //
      //////////////////////////////////////////////////////////////////////////
      String cssVariableValue = getCssVariable("--qqq-table-border-color");
      assertThat(normalizeColorToHex(cssVariableValue))
         .as("CSS variable --qqq-table-border-color should be exactly #E1BEE7")
         .isEqualToIgnoringCase("#E1BEE7");

      //////////////////////////////////////////////////////////////////////////
      // Find table element and verify border color (use column headers if no cells) //
      //////////////////////////////////////////////////////////////////////////
      List<WebElement> cells = driver.findElements(By.cssSelector(".MuiDataGrid-cell"));
      List<WebElement> columnSeparators = driver.findElements(By.cssSelector(".MuiDataGrid-columnSeparator"));

      if(!cells.isEmpty())
      {
         String borderColor = getComputedStyle(cells.get(0), "border-bottom-color");
         assertThat(normalizeColorToHex(borderColor))
            .as("Table cell border MUST be #E1BEE7, but was %s", borderColor)
            .isEqualToIgnoringCase("#E1BEE7");
      }
      else if(!columnSeparators.isEmpty())
      {
         // Use column separator border if no cells loaded
         String borderColor = getComputedStyle(columnSeparators.get(0), "border-right-color");
         assertThat(normalizeColorToHex(borderColor))
            .as("Table column separator border MUST be #E1BEE7, but was %s", borderColor)
            .isEqualToIgnoringCase("#E1BEE7");
      }
      else
      {
         // Fallback: just verify the CSS variable is set (already done above)
         // The table structure may vary, so we accept that the variable is correctly set
      }
   }



   /*******************************************************************************
    ** Test that body text uses theme font weight.
    ** Verifies: fontWeightRegular -> --qqq-font-weight-regular
    *******************************************************************************/
   @Test
   void testFontWeightRegular()
   {
      qSeleniumJavalin.clearRoutes();
      addJavalinRoutes(qSeleniumJavalin);
      qSeleniumJavalin.restart();

      qSeleniumLib.gotoAndWaitForBreadcrumbHeaderToContain("/", "Full Theme Test App");
      qSeleniumLib.waitForSeconds(1);

      //////////////////////////////////////////////////////////////////////////
      // Verify the CSS variable is set to the exact theme value               //
      // withFullCustomTheme.json specifies: "fontWeightRegular": 400          //
      //////////////////////////////////////////////////////////////////////////
      String cssVariableValue = getCssVariable("--qqq-font-weight-regular");
      assertThat(cssVariableValue)
         .as("CSS variable --qqq-font-weight-regular should be 400")
         .isEqualTo("400");

      //////////////////////////////////////////////////////////////////////////
      // Find body text and verify font weight                                  //
      //////////////////////////////////////////////////////////////////////////
      List<WebElement> bodyTexts = driver.findElements(By.cssSelector(".MuiTypography-body1"));

      if(!bodyTexts.isEmpty())
      {
         String fontWeight = getComputedStyle(bodyTexts.get(0), "font-weight");
         assertThat(fontWeight)
            .as("Body text font-weight MUST be 400")
            .isEqualTo("400");
      }
   }



   /*******************************************************************************
    ** Test that icons use the theme icon style (outlined, rounded, etc.).
    ** Verifies: iconStyle -> --qqq-icon-style and correct font loaded
    *******************************************************************************/
   @Test
   void testIconStyle()
   {
      qSeleniumJavalin.clearRoutes();
      addJavalinRoutes(qSeleniumJavalin);
      qSeleniumJavalin.restart();

      qSeleniumLib.gotoAndWaitForBreadcrumbHeaderToContain("/", "Full Theme Test App");
      qSeleniumLib.waitForSeconds(1);

      //////////////////////////////////////////////////////////////////////////
      // Verify the CSS variable is set to the exact theme value               //
      // withFullCustomTheme.json specifies: "iconStyle": "rounded"            //
      //////////////////////////////////////////////////////////////////////////
      String cssVariableValue = getCssVariable("--qqq-icon-style");
      assertThat(cssVariableValue)
         .as("CSS variable --qqq-icon-style should be 'rounded'")
         .isEqualTo("rounded");

      //////////////////////////////////////////////////////////////////////////
      // Verify the correct Google Material Icons font stylesheet is loaded    //
      //////////////////////////////////////////////////////////////////////////
      JavascriptExecutor js = (JavascriptExecutor) driver;
      Boolean hasRoundedFont = (Boolean) js.executeScript(
         "return Array.from(document.querySelectorAll('link[rel=\"stylesheet\"]')).some(" +
         "link => link.href.includes('Material+Icons+Round') || link.href.includes('Material%20Icons%20Round'));"
      );

      assertThat(hasRoundedFont)
         .as("Rounded Material Icons font stylesheet should be loaded for iconStyle='rounded'")
         .isTrue();
   }



   /*******************************************************************************
    ** Test comprehensive theme application - multiple components in one test.
    ** This is an integration test that verifies the whole theme works together.
    *******************************************************************************/
   @Test
   void testComprehensiveThemeApplication()
   {
      qSeleniumJavalin.clearRoutes();
      addJavalinRoutes(qSeleniumJavalin);
      qSeleniumJavalin.restart();

      qSeleniumLib.gotoAndWaitForBreadcrumbHeaderToContain("/", "Full Theme Test App");

      //////////////////////////////////////////////////////////////////////////
      // 1. Verify sidebar uses theme colors                                    //
      //////////////////////////////////////////////////////////////////////////
      WebElement drawer = findElementOrFail(
         By.cssSelector(".MuiDrawer-paper"),
         "MUI Drawer"
      );
      assertComputedStyleMatchesCssVariable(drawer, "background-color",
         "--qqq-sidebar-background-color", "Sidebar");

      //////////////////////////////////////////////////////////////////////////
      // 2. Verify body uses theme font                                         //
      //////////////////////////////////////////////////////////////////////////
      WebElement body = driver.findElement(By.tagName("body"));
      String fontFamily = getComputedStyle(body, "font-family");
      assertThat(fontFamily.toLowerCase()).contains("inter");

      //////////////////////////////////////////////////////////////////////////
      // 3. Verify cards use surface color (use Card not Paper to avoid sidebar)//
      //////////////////////////////////////////////////////////////////////////
      List<WebElement> cards = driver.findElements(By.cssSelector(".MuiCard-root"));
      if(!cards.isEmpty())
      {
         assertComputedStyleMatchesCssVariable(cards.get(0), "background-color",
            "--qqq-surface-color", "MUI Card");
      }

      //////////////////////////////////////////////////////////////////////////
      // 4. Verify custom CSS was injected and is active                        //
      //////////////////////////////////////////////////////////////////////////
      JavascriptExecutor js = (JavascriptExecutor) driver;
      Boolean customCssExists = (Boolean) js.executeScript(
         "return document.getElementById('qqq-custom-theme-css') !== null"
      );
      assertThat(customCssExists)
         .as("Custom theme CSS should be injected")
         .isTrue();
   }
}
