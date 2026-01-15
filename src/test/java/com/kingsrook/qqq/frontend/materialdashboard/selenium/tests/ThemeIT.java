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


import com.kingsrook.qqq.frontend.materialdashboard.selenium.lib.QBaseSeleniumTest;
import com.kingsrook.qqq.frontend.materialdashboard.selenium.lib.javalin.QSeleniumJavalin;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebElement;
import static org.assertj.core.api.Assertions.assertThat;


/*******************************************************************************
 ** Selenium E2E tests for pluggable themes feature.
 ** Tests that theme properties from backend metaData are applied as CSS variables.
 *******************************************************************************/
public class ThemeIT extends QBaseSeleniumTest
{
   private String metaDataFixture = "metaData/index.json";



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
         .withRouteToFile("/processes/querySavedView/init", "processes/querySavedView/init.json");
   }



   /*******************************************************************************
    ** Helper to get a CSS variable value from :root.
    *******************************************************************************/
   private String getCssVariable(String variableName)
   {
      JavascriptExecutor js = (JavascriptExecutor) driver;
      String script = "return getComputedStyle(document.documentElement).getPropertyValue('" + variableName + "').trim();";
      return (String) js.executeScript(script);
   }



   /*******************************************************************************
    ** Helper to check if a style element with specific ID exists.
    *******************************************************************************/
   private boolean styleElementExists(String id)
   {
      JavascriptExecutor js = (JavascriptExecutor) driver;
      String script = "return document.getElementById('" + id + "') !== null;";
      return (Boolean) js.executeScript(script);
   }



   /*******************************************************************************
    ** Helper to get content of a style element.
    *******************************************************************************/
   private String getStyleElementContent(String id)
   {
      JavascriptExecutor js = (JavascriptExecutor) driver;
      String script = "var el = document.getElementById('" + id + "'); return el ? el.textContent : '';";
      return (String) js.executeScript(script);
   }



   /*******************************************************************************
    ** Test that custom primary color is applied.
    *******************************************************************************/
   @Test
   void testPrimaryColorApplied()
   {
      metaDataFixture = "metaData/withCustomTheme.json";
      qSeleniumJavalin.clearRoutes();
      addJavalinRoutes(qSeleniumJavalin);
      qSeleniumJavalin.restart();

      qSeleniumLib.gotoAndWaitForBreadcrumbHeaderToContain("/", "Test App");

      String primaryColor = getCssVariable("--qqq-primary-color");
      assertThat(primaryColor).isEqualToIgnoringCase("#FF5500");
   }



   /*******************************************************************************
    ** Test that custom secondary color is applied.
    *******************************************************************************/
   @Test
   void testSecondaryColorApplied()
   {
      metaDataFixture = "metaData/withCustomTheme.json";
      qSeleniumJavalin.clearRoutes();
      addJavalinRoutes(qSeleniumJavalin);
      qSeleniumJavalin.restart();

      qSeleniumLib.gotoAndWaitForBreadcrumbHeaderToContain("/", "Test App");

      String secondaryColor = getCssVariable("--qqq-secondary-color");
      assertThat(secondaryColor).isEqualToIgnoringCase("#00AA55");
   }



   /*******************************************************************************
    ** Test that custom background color is applied.
    *******************************************************************************/
   @Test
   void testBackgroundColorApplied()
   {
      metaDataFixture = "metaData/withCustomTheme.json";
      qSeleniumJavalin.clearRoutes();
      addJavalinRoutes(qSeleniumJavalin);
      qSeleniumJavalin.restart();

      qSeleniumLib.gotoAndWaitForBreadcrumbHeaderToContain("/", "Test App");

      String backgroundColor = getCssVariable("--qqq-background-color");
      assertThat(backgroundColor).isEqualToIgnoringCase("#EEEEFF");
   }



   /*******************************************************************************
    ** Test that all color properties are applied from custom theme.
    *******************************************************************************/
   @Test
   void testAllColorPropertiesApplied()
   {
      metaDataFixture = "metaData/withCustomTheme.json";
      qSeleniumJavalin.clearRoutes();
      addJavalinRoutes(qSeleniumJavalin);
      qSeleniumJavalin.restart();

      qSeleniumLib.gotoAndWaitForBreadcrumbHeaderToContain("/", "Test App");

      assertThat(getCssVariable("--qqq-primary-color")).isEqualToIgnoringCase("#FF5500");
      assertThat(getCssVariable("--qqq-secondary-color")).isEqualToIgnoringCase("#00AA55");
      assertThat(getCssVariable("--qqq-background-color")).isEqualToIgnoringCase("#EEEEFF");
      assertThat(getCssVariable("--qqq-surface-color")).isEqualToIgnoringCase("#FFFFFF");
      assertThat(getCssVariable("--qqq-text-primary")).isEqualToIgnoringCase("#111111");
      assertThat(getCssVariable("--qqq-text-secondary")).isEqualToIgnoringCase("#555555");
      assertThat(getCssVariable("--qqq-error-color")).isEqualToIgnoringCase("#CC0000");
      assertThat(getCssVariable("--qqq-warning-color")).isEqualToIgnoringCase("#FFAA00");
      assertThat(getCssVariable("--qqq-success-color")).isEqualToIgnoringCase("#00CC00");
      assertThat(getCssVariable("--qqq-info-color")).isEqualToIgnoringCase("#0055FF");
   }



   /*******************************************************************************
    ** Test that custom font family is applied.
    *******************************************************************************/
   @Test
   void testFontFamilyApplied()
   {
      metaDataFixture = "metaData/withCustomTheme.json";
      qSeleniumJavalin.clearRoutes();
      addJavalinRoutes(qSeleniumJavalin);
      qSeleniumJavalin.restart();

      qSeleniumLib.gotoAndWaitForBreadcrumbHeaderToContain("/", "Test App");

      String fontFamily = getCssVariable("--qqq-font-family");
      assertThat(fontFamily).contains("Arial");
   }



   /*******************************************************************************
    ** Test that custom header font family is applied.
    *******************************************************************************/
   @Test
   void testHeaderFontFamilyApplied()
   {
      metaDataFixture = "metaData/withCustomTheme.json";
      qSeleniumJavalin.clearRoutes();
      addJavalinRoutes(qSeleniumJavalin);
      qSeleniumJavalin.restart();

      qSeleniumLib.gotoAndWaitForBreadcrumbHeaderToContain("/", "Test App");

      String headerFontFamily = getCssVariable("--qqq-header-font-family");
      assertThat(headerFontFamily).contains("Georgia");
   }



   /*******************************************************************************
    ** Test that custom border radius is applied.
    *******************************************************************************/
   @Test
   void testBorderRadiusApplied()
   {
      metaDataFixture = "metaData/withCustomTheme.json";
      qSeleniumJavalin.clearRoutes();
      addJavalinRoutes(qSeleniumJavalin);
      qSeleniumJavalin.restart();

      qSeleniumLib.gotoAndWaitForBreadcrumbHeaderToContain("/", "Test App");

      String borderRadius = getCssVariable("--qqq-border-radius");
      assertThat(borderRadius).isEqualTo("12px");
   }



   /*******************************************************************************
    ** Test that compact density sets appropriate spacing variables.
    *******************************************************************************/
   @Test
   void testCompactDensitySpacing()
   {
      metaDataFixture = "metaData/withCompactDensity.json";
      qSeleniumJavalin.clearRoutes();
      addJavalinRoutes(qSeleniumJavalin);
      qSeleniumJavalin.restart();

      qSeleniumLib.gotoAndWaitForBreadcrumbHeaderToContain("/", "Test App");

      assertThat(getCssVariable("--qqq-density")).isEqualTo("compact");
      assertThat(getCssVariable("--qqq-spacing-base")).isEqualTo("6px");
      assertThat(getCssVariable("--qqq-spacing-small")).isEqualTo("0.25rem");
      assertThat(getCssVariable("--qqq-spacing-medium")).isEqualTo("0.5rem");
      assertThat(getCssVariable("--qqq-spacing-large")).isEqualTo("0.75rem");
   }



   /*******************************************************************************
    ** Test that outlined icon style is applied.
    *******************************************************************************/
   @Test
   void testOutlinedIconStyle()
   {
      metaDataFixture = "metaData/withOutlinedIcons.json";
      qSeleniumJavalin.clearRoutes();
      addJavalinRoutes(qSeleniumJavalin);
      qSeleniumJavalin.restart();

      qSeleniumLib.gotoAndWaitForBreadcrumbHeaderToContain("/", "Test App");

      String iconStyle = getCssVariable("--qqq-icon-style");
      assertThat(iconStyle).isEqualTo("outlined");
   }



   /*******************************************************************************
    ** Test that custom CSS is injected into the page.
    *******************************************************************************/
   @Test
   void testCustomCssInjected()
   {
      metaDataFixture = "metaData/withCustomCss.json";
      qSeleniumJavalin.clearRoutes();
      addJavalinRoutes(qSeleniumJavalin);
      qSeleniumJavalin.restart();

      qSeleniumLib.gotoAndWaitForBreadcrumbHeaderToContain("/", "Test App");

      //////////////////////////////////////////////////////////////////////
      // Verify the custom CSS style element was created                   //
      //////////////////////////////////////////////////////////////////////
      assertThat(styleElementExists("qqq-custom-theme-css")).isTrue();

      //////////////////////////////////////////////////////////////////////
      // Verify the content matches what was provided                      //
      //////////////////////////////////////////////////////////////////////
      String cssContent = getStyleElementContent("qqq-custom-theme-css");
      assertThat(cssContent).contains(".qqq-test-marker");
   }



   /*******************************************************************************
    ** Test that CSS variables are NOT injected when no theme is provided.
    ** CSS fallbacks in the stylesheet handle default styling.
    *******************************************************************************/
   @Test
   void testDefaultThemeWhenNotProvided()
   {
      //////////////////////////////////////////////////////////////////////
      // Use the standard index.json which has no theme property           //
      //////////////////////////////////////////////////////////////////////
      metaDataFixture = "metaData/index.json";
      qSeleniumJavalin.clearRoutes();
      addJavalinRoutes(qSeleniumJavalin);

      qSeleniumLib.gotoAndWaitForBreadcrumbHeaderToContain("/", "Greetings App");

      //////////////////////////////////////////////////////////////////////
      // CSS variables should NOT be injected for unthemed apps            //
      // CSS fallback values handle default styling                        //
      //////////////////////////////////////////////////////////////////////
      String primaryColor = getCssVariable("--qqq-primary-color");
      assertThat(primaryColor).isEmpty();
   }



   /*******************************************************************************
    ** Test that normal density (default) sets appropriate spacing variables.
    *******************************************************************************/
   @Test
   void testNormalDensitySpacing()
   {
      metaDataFixture = "metaData/withCustomTheme.json";
      qSeleniumJavalin.clearRoutes();
      addJavalinRoutes(qSeleniumJavalin);
      qSeleniumJavalin.restart();

      qSeleniumLib.gotoAndWaitForBreadcrumbHeaderToContain("/", "Test App");

      assertThat(getCssVariable("--qqq-density")).isEqualTo("normal");
      assertThat(getCssVariable("--qqq-spacing-base")).isEqualTo("8px");
      assertThat(getCssVariable("--qqq-spacing-small")).isEqualTo("0.5rem");
      assertThat(getCssVariable("--qqq-spacing-medium")).isEqualTo("1rem");
      assertThat(getCssVariable("--qqq-spacing-large")).isEqualTo("1.5rem");
   }



   /*******************************************************************************
    ** Test that filled icon style is applied by default.
    *******************************************************************************/
   @Test
   void testFilledIconStyleDefault()
   {
      metaDataFixture = "metaData/withCustomTheme.json";
      qSeleniumJavalin.clearRoutes();
      addJavalinRoutes(qSeleniumJavalin);
      qSeleniumJavalin.restart();

      qSeleniumLib.gotoAndWaitForBreadcrumbHeaderToContain("/", "Test App");

      String iconStyle = getCssVariable("--qqq-icon-style");
      assertThat(iconStyle).isEqualTo("filled");
   }



   /*******************************************************************************
    ** Test that branded header CSS variables are applied.
    *******************************************************************************/
   @Test
   void testBrandedHeaderCssVariables()
   {
      metaDataFixture = "metaData/withFullCustomTheme.json";
      qSeleniumJavalin.clearRoutes();
      addJavalinRoutes(qSeleniumJavalin);
      qSeleniumJavalin.restart();

      qSeleniumLib.gotoAndWaitForBreadcrumbHeaderToContain("/", "Full Theme Test App");

      assertThat(getCssVariable("--qqq-branded-header-enabled")).isEqualTo("true");
      assertThat(getCssVariable("--qqq-branded-header-background-color")).isEqualToIgnoringCase("#1A237E");
      assertThat(getCssVariable("--qqq-branded-header-text-color")).isEqualToIgnoringCase("#E8EAF6");
      assertThat(getCssVariable("--qqq-branded-header-logo-path")).isEqualTo("/branded-header-logo.png");
      assertThat(getCssVariable("--qqq-branded-header-logo-alt-text")).isEqualTo("Test Brand Logo");
      assertThat(getCssVariable("--qqq-branded-header-height")).isEqualTo("56px");
      assertThat(getCssVariable("--qqq-branded-header-tagline")).isEqualTo("Custom Theme Test Suite");
   }



   /*******************************************************************************
    ** Test that sidebar CSS variables are applied.
    *******************************************************************************/
   @Test
   void testSidebarCssVariables()
   {
      metaDataFixture = "metaData/withFullCustomTheme.json";
      qSeleniumJavalin.clearRoutes();
      addJavalinRoutes(qSeleniumJavalin);
      qSeleniumJavalin.restart();

      qSeleniumLib.gotoAndWaitForBreadcrumbHeaderToContain("/", "Full Theme Test App");

      assertThat(getCssVariable("--qqq-sidebar-background-color")).isEqualToIgnoringCase("#1B5E20");
      assertThat(getCssVariable("--qqq-sidebar-text-color")).isEqualToIgnoringCase("#C8E6C9");
      assertThat(getCssVariable("--qqq-sidebar-icon-color")).isEqualToIgnoringCase("#A5D6A7");
      assertThat(getCssVariable("--qqq-sidebar-selected-background-color")).isEqualToIgnoringCase("#2E7D32");
      assertThat(getCssVariable("--qqq-sidebar-selected-text-color")).isEqualToIgnoringCase("#FFFFFF");
      assertThat(getCssVariable("--qqq-sidebar-hover-background-color")).contains("rgba");
      assertThat(getCssVariable("--qqq-sidebar-divider-color")).contains("rgba");
   }



   /*******************************************************************************
    ** Test that app bar CSS variables are applied.
    *******************************************************************************/
   @Test
   void testAppBarCssVariables()
   {
      metaDataFixture = "metaData/withFullCustomTheme.json";
      qSeleniumJavalin.clearRoutes();
      addJavalinRoutes(qSeleniumJavalin);
      qSeleniumJavalin.restart();

      qSeleniumLib.gotoAndWaitForBreadcrumbHeaderToContain("/", "Full Theme Test App");

      assertThat(getCssVariable("--qqq-app-bar-background-color")).isEqualToIgnoringCase("#F5F5F5");
      assertThat(getCssVariable("--qqq-app-bar-text-color")).isEqualToIgnoringCase("#37474F");
   }



   /*******************************************************************************
    ** Test that table CSS variables are applied.
    *******************************************************************************/
   @Test
   void testTableCssVariables()
   {
      metaDataFixture = "metaData/withFullCustomTheme.json";
      qSeleniumJavalin.clearRoutes();
      addJavalinRoutes(qSeleniumJavalin);
      qSeleniumJavalin.restart();

      qSeleniumLib.gotoAndWaitForBreadcrumbHeaderToContain("/", "Full Theme Test App");

      assertThat(getCssVariable("--qqq-table-header-background-color")).isEqualToIgnoringCase("#7B1FA2");
      assertThat(getCssVariable("--qqq-table-header-text-color")).isEqualToIgnoringCase("#FFFFFF");
      assertThat(getCssVariable("--qqq-table-row-hover-color")).isEqualToIgnoringCase("#F3E5F5");
      assertThat(getCssVariable("--qqq-table-row-selected-color")).isEqualToIgnoringCase("#CE93D8");
      assertThat(getCssVariable("--qqq-table-border-color")).isEqualToIgnoringCase("#E1BEE7");
   }



   /*******************************************************************************
    ** Test that divider and border CSS variables are applied.
    *******************************************************************************/
   @Test
   void testDividerBorderCssVariables()
   {
      metaDataFixture = "metaData/withFullCustomTheme.json";
      qSeleniumJavalin.clearRoutes();
      addJavalinRoutes(qSeleniumJavalin);
      qSeleniumJavalin.restart();

      qSeleniumLib.gotoAndWaitForBreadcrumbHeaderToContain("/", "Full Theme Test App");

      assertThat(getCssVariable("--qqq-divider-color")).isEqualToIgnoringCase("#CFD8DC");
      assertThat(getCssVariable("--qqq-border-color")).isEqualToIgnoringCase("#B0BEC5");
      assertThat(getCssVariable("--qqq-card-border-color")).isEqualToIgnoringCase("#ECEFF1");
   }



   /*******************************************************************************
    ** Test that typography H1-H3 CSS variables are applied.
    *******************************************************************************/
   @Test
   void testTypographyH1H3CssVariables()
   {
      metaDataFixture = "metaData/withFullCustomTheme.json";
      qSeleniumJavalin.clearRoutes();
      addJavalinRoutes(qSeleniumJavalin);
      qSeleniumJavalin.restart();

      qSeleniumLib.gotoAndWaitForBreadcrumbHeaderToContain("/", "Full Theme Test App");

      //////////////////////////////////////////////////////////////////////////
      // H1 typography                                                          //
      //////////////////////////////////////////////////////////////////////////
      assertThat(getCssVariable("--qqq-typography-h1-font-size")).isEqualTo("3rem");
      assertThat(getCssVariable("--qqq-typography-h1-font-weight")).isEqualTo("700");
      assertThat(getCssVariable("--qqq-typography-h1-line-height")).isEqualTo("1.2");
      assertThat(getCssVariable("--qqq-typography-h1-letter-spacing")).isEqualTo("-0.02em");
      assertThat(getCssVariable("--qqq-typography-h1-text-transform")).isEqualTo("none");

      //////////////////////////////////////////////////////////////////////////
      // H2 typography                                                          //
      //////////////////////////////////////////////////////////////////////////
      assertThat(getCssVariable("--qqq-typography-h2-font-size")).isEqualTo("2.5rem");
      assertThat(getCssVariable("--qqq-typography-h2-font-weight")).isEqualTo("600");
      assertThat(getCssVariable("--qqq-typography-h2-line-height")).isEqualTo("1.3");
      assertThat(getCssVariable("--qqq-typography-h2-letter-spacing")).isEqualTo("-0.01em");
      assertThat(getCssVariable("--qqq-typography-h2-text-transform")).isEqualTo("none");

      //////////////////////////////////////////////////////////////////////////
      // H3 typography                                                          //
      //////////////////////////////////////////////////////////////////////////
      assertThat(getCssVariable("--qqq-typography-h3-font-size")).isEqualTo("2rem");
      assertThat(getCssVariable("--qqq-typography-h3-font-weight")).isEqualTo("600");
      assertThat(getCssVariable("--qqq-typography-h3-line-height")).isEqualTo("1.4");
      assertThat(getCssVariable("--qqq-typography-h3-letter-spacing")).isEqualTo("0");
      assertThat(getCssVariable("--qqq-typography-h3-text-transform")).isEqualTo("none");
   }



   /*******************************************************************************
    ** Test that typography H4-H6 CSS variables are applied.
    *******************************************************************************/
   @Test
   void testTypographyH4H6CssVariables()
   {
      metaDataFixture = "metaData/withFullCustomTheme.json";
      qSeleniumJavalin.clearRoutes();
      addJavalinRoutes(qSeleniumJavalin);
      qSeleniumJavalin.restart();

      qSeleniumLib.gotoAndWaitForBreadcrumbHeaderToContain("/", "Full Theme Test App");

      //////////////////////////////////////////////////////////////////////////
      // H4 typography                                                          //
      //////////////////////////////////////////////////////////////////////////
      assertThat(getCssVariable("--qqq-typography-h4-font-size")).isEqualTo("1.5rem");
      assertThat(getCssVariable("--qqq-typography-h4-font-weight")).isEqualTo("500");
      assertThat(getCssVariable("--qqq-typography-h4-line-height")).isEqualTo("1.4");
      assertThat(getCssVariable("--qqq-typography-h4-letter-spacing")).isEqualTo("0");
      assertThat(getCssVariable("--qqq-typography-h4-text-transform")).isEqualTo("none");

      //////////////////////////////////////////////////////////////////////////
      // H5 typography                                                          //
      //////////////////////////////////////////////////////////////////////////
      assertThat(getCssVariable("--qqq-typography-h5-font-size")).isEqualTo("1.25rem");
      assertThat(getCssVariable("--qqq-typography-h5-font-weight")).isEqualTo("500");
      assertThat(getCssVariable("--qqq-typography-h5-line-height")).isEqualTo("1.5");
      assertThat(getCssVariable("--qqq-typography-h5-letter-spacing")).isEqualTo("0");
      assertThat(getCssVariable("--qqq-typography-h5-text-transform")).isEqualTo("none");

      //////////////////////////////////////////////////////////////////////////
      // H6 typography                                                          //
      //////////////////////////////////////////////////////////////////////////
      assertThat(getCssVariable("--qqq-typography-h6-font-size")).isEqualTo("1rem");
      assertThat(getCssVariable("--qqq-typography-h6-font-weight")).isEqualTo("500");
      assertThat(getCssVariable("--qqq-typography-h6-line-height")).isEqualTo("1.5");
      assertThat(getCssVariable("--qqq-typography-h6-letter-spacing")).isEqualTo("0.01em");
      assertThat(getCssVariable("--qqq-typography-h6-text-transform")).isEqualTo("none");
   }



   /*******************************************************************************
    ** Test that typography body and caption CSS variables are applied.
    *******************************************************************************/
   @Test
   void testTypographyBodyCaptionCssVariables()
   {
      metaDataFixture = "metaData/withFullCustomTheme.json";
      qSeleniumJavalin.clearRoutes();
      addJavalinRoutes(qSeleniumJavalin);
      qSeleniumJavalin.restart();

      qSeleniumLib.gotoAndWaitForBreadcrumbHeaderToContain("/", "Full Theme Test App");

      //////////////////////////////////////////////////////////////////////////
      // Body1 typography                                                       //
      //////////////////////////////////////////////////////////////////////////
      assertThat(getCssVariable("--qqq-typography-body1-font-size")).isEqualTo("1rem");
      assertThat(getCssVariable("--qqq-typography-body1-font-weight")).isEqualTo("400");
      assertThat(getCssVariable("--qqq-typography-body1-line-height")).isEqualTo("1.6");
      assertThat(getCssVariable("--qqq-typography-body1-letter-spacing")).isEqualTo("0");
      assertThat(getCssVariable("--qqq-typography-body1-text-transform")).isEqualTo("none");

      //////////////////////////////////////////////////////////////////////////
      // Body2 typography                                                       //
      //////////////////////////////////////////////////////////////////////////
      assertThat(getCssVariable("--qqq-typography-body2-font-size")).isEqualTo("0.875rem");
      assertThat(getCssVariable("--qqq-typography-body2-font-weight")).isEqualTo("400");
      assertThat(getCssVariable("--qqq-typography-body2-line-height")).isEqualTo("1.5");
      assertThat(getCssVariable("--qqq-typography-body2-letter-spacing")).isEqualTo("0");
      assertThat(getCssVariable("--qqq-typography-body2-text-transform")).isEqualTo("none");

      //////////////////////////////////////////////////////////////////////////
      // Caption typography                                                     //
      //////////////////////////////////////////////////////////////////////////
      assertThat(getCssVariable("--qqq-typography-caption-font-size")).isEqualTo("0.75rem");
      assertThat(getCssVariable("--qqq-typography-caption-font-weight")).isEqualTo("400");
      assertThat(getCssVariable("--qqq-typography-caption-line-height")).isEqualTo("1.4");
      assertThat(getCssVariable("--qqq-typography-caption-letter-spacing")).isEqualTo("0.03em");
      assertThat(getCssVariable("--qqq-typography-caption-text-transform")).isEqualTo("none");
   }



   /*******************************************************************************
    ** Test that typography button CSS variables are applied.
    *******************************************************************************/
   @Test
   void testTypographyButtonCssVariables()
   {
      metaDataFixture = "metaData/withFullCustomTheme.json";
      qSeleniumJavalin.clearRoutes();
      addJavalinRoutes(qSeleniumJavalin);
      qSeleniumJavalin.restart();

      qSeleniumLib.gotoAndWaitForBreadcrumbHeaderToContain("/", "Full Theme Test App");

      assertThat(getCssVariable("--qqq-typography-button-font-size")).isEqualTo("0.875rem");
      assertThat(getCssVariable("--qqq-typography-button-font-weight")).isEqualTo("600");
      assertThat(getCssVariable("--qqq-typography-button-line-height")).isEqualTo("1.75");
      assertThat(getCssVariable("--qqq-typography-button-letter-spacing")).isEqualTo("0.03em");
      assertThat(getCssVariable("--qqq-typography-button-text-transform")).isEqualTo("uppercase");
   }



   /*******************************************************************************
    ** Test that font weight CSS variables are applied.
    *******************************************************************************/
   @Test
   void testFontWeightCssVariables()
   {
      metaDataFixture = "metaData/withFullCustomTheme.json";
      qSeleniumJavalin.clearRoutes();
      addJavalinRoutes(qSeleniumJavalin);
      qSeleniumJavalin.restart();

      qSeleniumLib.gotoAndWaitForBreadcrumbHeaderToContain("/", "Full Theme Test App");

      assertThat(getCssVariable("--qqq-font-weight-light")).isEqualTo("300");
      assertThat(getCssVariable("--qqq-font-weight-regular")).isEqualTo("400");
      assertThat(getCssVariable("--qqq-font-weight-medium")).isEqualTo("500");
      assertThat(getCssVariable("--qqq-font-weight-bold")).isEqualTo("700");
   }



   /*******************************************************************************
    ** Test that monospace font family CSS variable is applied.
    *******************************************************************************/
   @Test
   void testMonoFontFamilyApplied()
   {
      metaDataFixture = "metaData/withFullCustomTheme.json";
      qSeleniumJavalin.clearRoutes();
      addJavalinRoutes(qSeleniumJavalin);
      qSeleniumJavalin.restart();

      qSeleniumLib.gotoAndWaitForBreadcrumbHeaderToContain("/", "Full Theme Test App");

      String monoFontFamily = getCssVariable("--qqq-mono-font-family");
      assertThat(monoFontFamily).contains("JetBrains Mono");
   }



   /*******************************************************************************
    ** Test that font size base CSS variable is applied.
    *******************************************************************************/
   @Test
   void testFontSizeBaseApplied()
   {
      metaDataFixture = "metaData/withFullCustomTheme.json";
      qSeleniumJavalin.clearRoutes();
      addJavalinRoutes(qSeleniumJavalin);
      qSeleniumJavalin.restart();

      qSeleniumLib.gotoAndWaitForBreadcrumbHeaderToContain("/", "Full Theme Test App");

      assertThat(getCssVariable("--qqq-font-size-base")).isEqualTo("15px");
   }



   /*******************************************************************************
    ** Test that comfortable density sets appropriate spacing variables.
    *******************************************************************************/
   @Test
   void testComfortableDensitySpacing()
   {
      metaDataFixture = "metaData/withComfortableDensity.json";
      qSeleniumJavalin.clearRoutes();
      addJavalinRoutes(qSeleniumJavalin);
      qSeleniumJavalin.restart();

      qSeleniumLib.gotoAndWaitForBreadcrumbHeaderToContain("/", "Comfortable Density Test");

      assertThat(getCssVariable("--qqq-density")).isEqualTo("comfortable");
      assertThat(getCssVariable("--qqq-spacing-base")).isEqualTo("10px");
      assertThat(getCssVariable("--qqq-spacing-small")).isEqualTo("0.75rem");
      assertThat(getCssVariable("--qqq-spacing-medium")).isEqualTo("1.25rem");
      assertThat(getCssVariable("--qqq-spacing-large")).isEqualTo("2rem");
   }



   /*******************************************************************************
    ** Test that rounded icon style is applied.
    *******************************************************************************/
   @Test
   void testRoundedIconStyle()
   {
      metaDataFixture = "metaData/withRoundedIcons.json";
      qSeleniumJavalin.clearRoutes();
      addJavalinRoutes(qSeleniumJavalin);
      qSeleniumJavalin.restart();

      qSeleniumLib.gotoAndWaitForBreadcrumbHeaderToContain("/", "Rounded Icons Test");

      String iconStyle = getCssVariable("--qqq-icon-style");
      assertThat(iconStyle).isEqualTo("rounded");
   }



   /*******************************************************************************
    ** Test that sharp icon style is applied.
    *******************************************************************************/
   @Test
   void testSharpIconStyle()
   {
      metaDataFixture = "metaData/withSharpIcons.json";
      qSeleniumJavalin.clearRoutes();
      addJavalinRoutes(qSeleniumJavalin);
      qSeleniumJavalin.restart();

      qSeleniumLib.gotoAndWaitForBreadcrumbHeaderToContain("/", "Sharp Icons Test");

      String iconStyle = getCssVariable("--qqq-icon-style");
      assertThat(iconStyle).isEqualTo("sharp");
   }



   /*******************************************************************************
    ** Test that two-tone icon style is applied.
    *******************************************************************************/
   @Test
   void testTwoToneIconStyle()
   {
      metaDataFixture = "metaData/withTwoToneIcons.json";
      qSeleniumJavalin.clearRoutes();
      addJavalinRoutes(qSeleniumJavalin);
      qSeleniumJavalin.restart();

      qSeleniumLib.gotoAndWaitForBreadcrumbHeaderToContain("/", "Two Tone Icons Test");

      String iconStyle = getCssVariable("--qqq-icon-style");
      assertThat(iconStyle).isEqualTo("two-tone");
   }



   /*******************************************************************************
    ** Test that logo/icon/favicon path CSS variables are applied.
    *******************************************************************************/
   @Test
   void testBrandingPathCssVariables()
   {
      metaDataFixture = "metaData/withFullCustomTheme.json";
      qSeleniumJavalin.clearRoutes();
      addJavalinRoutes(qSeleniumJavalin);
      qSeleniumJavalin.restart();

      qSeleniumLib.gotoAndWaitForBreadcrumbHeaderToContain("/", "Full Theme Test App");

      assertThat(getCssVariable("--qqq-logo-path")).isEqualTo("/custom-logo.png");
      assertThat(getCssVariable("--qqq-icon-path")).isEqualTo("/custom-icon.png");
      assertThat(getCssVariable("--qqq-favicon-path")).isEqualTo("/custom-favicon.ico");
   }



   /*******************************************************************************
    ** Test comprehensive theme with all properties applied together.
    *******************************************************************************/
   @Test
   void testAllThemePropertiesAppliedTogether()
   {
      metaDataFixture = "metaData/withFullCustomTheme.json";
      qSeleniumJavalin.clearRoutes();
      addJavalinRoutes(qSeleniumJavalin);
      qSeleniumJavalin.restart();

      qSeleniumLib.gotoAndWaitForBreadcrumbHeaderToContain("/", "Full Theme Test App");

      //////////////////////////////////////////////////////////////////////////
      // Core colors                                                            //
      //////////////////////////////////////////////////////////////////////////
      assertThat(getCssVariable("--qqq-primary-color")).isEqualToIgnoringCase("#E91E63");
      assertThat(getCssVariable("--qqq-secondary-color")).isEqualToIgnoringCase("#9C27B0");
      assertThat(getCssVariable("--qqq-background-color")).isEqualToIgnoringCase("#ECEFF1");
      assertThat(getCssVariable("--qqq-surface-color")).isEqualToIgnoringCase("#FAFAFA");
      assertThat(getCssVariable("--qqq-text-primary")).isEqualToIgnoringCase("#263238");
      assertThat(getCssVariable("--qqq-text-secondary")).isEqualToIgnoringCase("#607D8B");
      assertThat(getCssVariable("--qqq-error-color")).isEqualToIgnoringCase("#D50000");
      assertThat(getCssVariable("--qqq-warning-color")).isEqualToIgnoringCase("#FF6D00");
      assertThat(getCssVariable("--qqq-success-color")).isEqualToIgnoringCase("#00C853");
      assertThat(getCssVariable("--qqq-info-color")).isEqualToIgnoringCase("#2962FF");

      //////////////////////////////////////////////////////////////////////////
      // Font families                                                          //
      //////////////////////////////////////////////////////////////////////////
      assertThat(getCssVariable("--qqq-font-family")).contains("Inter");
      assertThat(getCssVariable("--qqq-header-font-family")).contains("Poppins");
      assertThat(getCssVariable("--qqq-mono-font-family")).contains("JetBrains Mono");

      //////////////////////////////////////////////////////////////////////////
      // Border radius and density                                              //
      //////////////////////////////////////////////////////////////////////////
      assertThat(getCssVariable("--qqq-border-radius")).isEqualTo("12px");
      assertThat(getCssVariable("--qqq-density")).isEqualTo("normal");

      //////////////////////////////////////////////////////////////////////////
      // Icon style                                                             //
      //////////////////////////////////////////////////////////////////////////
      assertThat(getCssVariable("--qqq-icon-style")).isEqualTo("rounded");

      //////////////////////////////////////////////////////////////////////////
      // Verify custom CSS was injected                                         //
      //////////////////////////////////////////////////////////////////////////
      assertThat(styleElementExists("qqq-custom-theme-css")).isTrue();
      String cssContent = getStyleElementContent("qqq-custom-theme-css");
      assertThat(cssContent).contains(".qqq-full-theme-test-marker");
   }



   /*******************************************************************************
    ** Test that partial theme configuration only sets specified properties.
    *******************************************************************************/
   @Test
   void testPartialThemeConfiguration()
   {
      //////////////////////////////////////////////////////////////////////////
      // Use the standard custom theme which only has a subset of properties    //
      //////////////////////////////////////////////////////////////////////////
      metaDataFixture = "metaData/withCustomTheme.json";
      qSeleniumJavalin.clearRoutes();
      addJavalinRoutes(qSeleniumJavalin);
      qSeleniumJavalin.restart();

      qSeleniumLib.gotoAndWaitForBreadcrumbHeaderToContain("/", "Test App");

      //////////////////////////////////////////////////////////////////////////
      // These were explicitly set in the fixture                               //
      //////////////////////////////////////////////////////////////////////////
      assertThat(getCssVariable("--qqq-primary-color")).isEqualToIgnoringCase("#FF5500");
      assertThat(getCssVariable("--qqq-secondary-color")).isEqualToIgnoringCase("#00AA55");

      //////////////////////////////////////////////////////////////////////////
      // Verify defaults are used for unset sidebar properties                  //
      //////////////////////////////////////////////////////////////////////////
      String sidebarBg = getCssVariable("--qqq-sidebar-background-color");
      assertThat(sidebarBg).isNotEmpty();
   }



   /*******************************************************************************
    ** Test that CSS variables are NOT injected when no theme is configured.
    ** CSS fallbacks in the stylesheet handle default styling.
    *******************************************************************************/
   @Test
   void testEmptyThemeUsesDefaults()
   {
      metaDataFixture = "metaData/index.json";
      qSeleniumJavalin.clearRoutes();
      addJavalinRoutes(qSeleniumJavalin);

      qSeleniumLib.gotoAndWaitForBreadcrumbHeaderToContain("/", "Greetings App");

      //////////////////////////////////////////////////////////////////////////
      // CSS variables should NOT be injected for unthemed apps                //
      // CSS fallback values handle default styling                            //
      //////////////////////////////////////////////////////////////////////////
      assertThat(getCssVariable("--qqq-primary-color")).isEmpty();
      assertThat(getCssVariable("--qqq-density")).isEmpty();
      assertThat(getCssVariable("--qqq-icon-style")).isEmpty();
      assertThat(getCssVariable("--qqq-border-radius")).isEmpty();
   }
}
