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

import {MaterialDashboardThemeMetaData} from "qqq/models/metadata/MaterialDashboardThemeMetaData";
import {DEFAULT_THEME, DENSITY_SPACING, injectCustomCss, injectIconFonts} from "./themeUtils";

/*******************************************************************************
 ** CSS variable prefix for QQQ island variables.
 *******************************************************************************/
const CSS_VAR_PREFIX = "--qqq-";

/*******************************************************************************
 ** Inject CSS variables for "island" components that don't use MUI palette.
 **
 ** Islands are components with their own theming system:
 ** - Sidebar: Dark theme with its own color scheme
 ** - Branded Header: Custom header bar with logo/tagline
 ** - DataGrid: MUI X component with specific styling needs
 **
 ** Unlike MUI components (which get colors from theme.palette), these islands
 ** need CSS variables to be styled consistently with the rest of the app.
 *******************************************************************************/
export function injectIslandVariables(theme?: MaterialDashboardThemeMetaData): void
{
   const root = document.documentElement;

   //////////////////////////////////////////////////////////////////////////
   // Add/remove .qqq-themed class on body based on theme presence.        //
   // CSS overrides in qqq-override-styles.css are scoped to this class.   //
   // This allows button/input styling to only apply when a theme is set.  //
   //////////////////////////////////////////////////////////////////////////
   if (theme)
   {
      document.body.classList.add("qqq-themed");
   }
   else
   {
      document.body.classList.remove("qqq-themed");
      return; // No theme = no CSS variables injected. CSS uses fallback values.
   }

   /////////////////////////////////////////////////////////////////////////////
   // Merge with defaults, filtering out undefined values                     //
   /////////////////////////////////////////////////////////////////////////////
   const definedValues: Partial<MaterialDashboardThemeMetaData> = {};
   if (theme)
   {
      for (const key of Object.keys(theme) as (keyof MaterialDashboardThemeMetaData)[])
      {
         if (theme[key] !== undefined)
         {
            (definedValues as Record<string, unknown>)[key] = theme[key];
         }
      }
   }
   const mergedTheme = {...DEFAULT_THEME, ...definedValues} as MaterialDashboardThemeMetaData;

   /////////////////////////////////////////////////////////////////////////////
   // Sidebar variables                                                       //
   /////////////////////////////////////////////////////////////////////////////
   setVar(root, "sidebar-background-color", mergedTheme.sidebarBackgroundColor);
   setVar(root, "sidebar-text-color", mergedTheme.sidebarTextColor);
   setVar(root, "sidebar-icon-color", mergedTheme.sidebarIconColor);
   setVar(root, "sidebar-selected-background-color", mergedTheme.sidebarSelectedBackgroundColor);
   setVar(root, "sidebar-selected-text-color", mergedTheme.sidebarSelectedTextColor);
   setVar(root, "sidebar-hover-background-color", mergedTheme.sidebarHoverBackgroundColor);
   setVar(root, "sidebar-divider-color", mergedTheme.sidebarDividerColor);

   /////////////////////////////////////////////////////////////////////////////
   // Branded Header variables                                                //
   // Only set non-zero height when branded header is enabled to prevent      //
   // sidebar positioning issues (issue #128)                                 //
   /////////////////////////////////////////////////////////////////////////////
   setVar(root, "branded-header-enabled", mergedTheme.brandedHeaderEnabled ? "true" : "false");
   setVar(root, "branded-header-background-color", mergedTheme.brandedHeaderBackgroundColor);
   setVar(root, "branded-header-text-color", mergedTheme.brandedHeaderTextColor);
   if (mergedTheme.brandedHeaderEnabled)
   {
      setVar(root, "branded-header-height", mergedTheme.brandedHeaderHeight);
   }
   else
   {
      setVar(root, "branded-header-height", "0px");
   }
   setVar(root, "branded-header-logo-path", mergedTheme.brandedHeaderLogoPath);
   setVar(root, "branded-header-logo-alt-text", mergedTheme.brandedHeaderLogoAltText);
   setVar(root, "branded-header-tagline", mergedTheme.brandedHeaderTagline);

   /////////////////////////////////////////////////////////////////////////////
   // DataGrid variables (table-specific styling)                             //
   /////////////////////////////////////////////////////////////////////////////
   setVar(root, "table-header-background-color", mergedTheme.tableHeaderBackgroundColor);
   setVar(root, "table-header-text-color", mergedTheme.tableHeaderTextColor);
   setVar(root, "table-row-hover-color", mergedTheme.tableRowHoverColor);
   setVar(root, "table-row-selected-color", mergedTheme.tableRowSelectedColor);
   setVar(root, "table-border-color", mergedTheme.tableBorderColor);

   /////////////////////////////////////////////////////////////////////////////
   // General variables needed by islands                                     //
   /////////////////////////////////////////////////////////////////////////////
   setVar(root, "primary-color", mergedTheme.primaryColor);
   setVar(root, "secondary-color", mergedTheme.secondaryColor);
   setVar(root, "text-primary", mergedTheme.textPrimary);
   setVar(root, "text-secondary", mergedTheme.textSecondary);
   setVar(root, "background-color", mergedTheme.backgroundColor);
   setVar(root, "surface-color", mergedTheme.surfaceColor);
   setVar(root, "border-color", mergedTheme.borderColor);
   setVar(root, "card-border-color", mergedTheme.cardBorderColor);
   setVar(root, "divider-color", mergedTheme.dividerColor);
   setVar(root, "border-radius-global", mergedTheme.borderRadiusGlobal);
   setVar(root, "error-color", mergedTheme.errorColor);
   setVar(root, "warning-color", mergedTheme.warningColor);
   setVar(root, "success-color", mergedTheme.successColor);
   setVar(root, "info-color", mergedTheme.infoColor);

   /////////////////////////////////////////////////////////////////////////////
   // Typography base variables                                               //
   /////////////////////////////////////////////////////////////////////////////
   setVar(root, "font-family", mergedTheme.fontFamily);
   setVar(root, "header-font-family", mergedTheme.headerFontFamily);
   setVar(root, "mono-font-family", mergedTheme.monoFontFamily);
   setVar(root, "font-size-base", mergedTheme.fontSizeBase);
   setVar(root, "font-weight-light", mergedTheme.fontWeightLight);
   setVar(root, "font-weight-regular", mergedTheme.fontWeightRegular);
   setVar(root, "font-weight-medium", mergedTheme.fontWeightMedium);
   setVar(root, "font-weight-bold", mergedTheme.fontWeightBold);

   /////////////////////////////////////////////////////////////////////////////
   // Typography variant variables (H1-H6, Body1, Body2, Button, Caption)     //
   /////////////////////////////////////////////////////////////////////////////
   setVar(root, "typography-h1-font-size", mergedTheme.typographyH1FontSize);
   setVar(root, "typography-h1-font-weight", mergedTheme.typographyH1FontWeight);
   setVar(root, "typography-h1-line-height", mergedTheme.typographyH1LineHeight);
   setVar(root, "typography-h1-letter-spacing", mergedTheme.typographyH1LetterSpacing);
   setVar(root, "typography-h1-text-transform", mergedTheme.typographyH1TextTransform);

   setVar(root, "typography-h2-font-size", mergedTheme.typographyH2FontSize);
   setVar(root, "typography-h2-font-weight", mergedTheme.typographyH2FontWeight);
   setVar(root, "typography-h2-line-height", mergedTheme.typographyH2LineHeight);
   setVar(root, "typography-h2-letter-spacing", mergedTheme.typographyH2LetterSpacing);
   setVar(root, "typography-h2-text-transform", mergedTheme.typographyH2TextTransform);

   setVar(root, "typography-h3-font-size", mergedTheme.typographyH3FontSize);
   setVar(root, "typography-h3-font-weight", mergedTheme.typographyH3FontWeight);
   setVar(root, "typography-h3-line-height", mergedTheme.typographyH3LineHeight);
   setVar(root, "typography-h3-letter-spacing", mergedTheme.typographyH3LetterSpacing);
   setVar(root, "typography-h3-text-transform", mergedTheme.typographyH3TextTransform);

   setVar(root, "typography-h4-font-size", mergedTheme.typographyH4FontSize);
   setVar(root, "typography-h4-font-weight", mergedTheme.typographyH4FontWeight);
   setVar(root, "typography-h4-line-height", mergedTheme.typographyH4LineHeight);
   setVar(root, "typography-h4-letter-spacing", mergedTheme.typographyH4LetterSpacing);
   setVar(root, "typography-h4-text-transform", mergedTheme.typographyH4TextTransform);

   setVar(root, "typography-h5-font-size", mergedTheme.typographyH5FontSize);
   setVar(root, "typography-h5-font-weight", mergedTheme.typographyH5FontWeight);
   setVar(root, "typography-h5-line-height", mergedTheme.typographyH5LineHeight);
   setVar(root, "typography-h5-letter-spacing", mergedTheme.typographyH5LetterSpacing);
   setVar(root, "typography-h5-text-transform", mergedTheme.typographyH5TextTransform);

   setVar(root, "typography-h6-font-size", mergedTheme.typographyH6FontSize);
   setVar(root, "typography-h6-font-weight", mergedTheme.typographyH6FontWeight);
   setVar(root, "typography-h6-line-height", mergedTheme.typographyH6LineHeight);
   setVar(root, "typography-h6-letter-spacing", mergedTheme.typographyH6LetterSpacing);
   setVar(root, "typography-h6-text-transform", mergedTheme.typographyH6TextTransform);

   setVar(root, "typography-body1-font-size", mergedTheme.typographyBody1FontSize);
   setVar(root, "typography-body1-font-weight", mergedTheme.typographyBody1FontWeight);
   setVar(root, "typography-body1-line-height", mergedTheme.typographyBody1LineHeight);
   setVar(root, "typography-body1-letter-spacing", mergedTheme.typographyBody1LetterSpacing);
   setVar(root, "typography-body1-text-transform", mergedTheme.typographyBody1TextTransform);

   setVar(root, "typography-body2-font-size", mergedTheme.typographyBody2FontSize);
   setVar(root, "typography-body2-font-weight", mergedTheme.typographyBody2FontWeight);
   setVar(root, "typography-body2-line-height", mergedTheme.typographyBody2LineHeight);
   setVar(root, "typography-body2-letter-spacing", mergedTheme.typographyBody2LetterSpacing);
   setVar(root, "typography-body2-text-transform", mergedTheme.typographyBody2TextTransform);

   setVar(root, "typography-button-font-size", mergedTheme.typographyButtonFontSize);
   setVar(root, "typography-button-font-weight", mergedTheme.typographyButtonFontWeight);
   setVar(root, "typography-button-line-height", mergedTheme.typographyButtonLineHeight);
   setVar(root, "typography-button-letter-spacing", mergedTheme.typographyButtonLetterSpacing);
   setVar(root, "typography-button-text-transform", mergedTheme.typographyButtonTextTransform);

   setVar(root, "typography-caption-font-size", mergedTheme.typographyCaptionFontSize);
   setVar(root, "typography-caption-font-weight", mergedTheme.typographyCaptionFontWeight);
   setVar(root, "typography-caption-line-height", mergedTheme.typographyCaptionLineHeight);
   setVar(root, "typography-caption-letter-spacing", mergedTheme.typographyCaptionLetterSpacing);
   setVar(root, "typography-caption-text-transform", mergedTheme.typographyCaptionTextTransform);

   /////////////////////////////////////////////////////////////////////////////
   // Density and spacing variables                                           //
   /////////////////////////////////////////////////////////////////////////////
   const density = mergedTheme.density || "normal";
   const spacing = DENSITY_SPACING[density] || DENSITY_SPACING.normal;
   setVar(root, "density", density);
   setVar(root, "spacing-base", `${spacing.base}px`);
   setVar(root, "spacing-small", spacing.small);
   setVar(root, "spacing-medium", spacing.medium);
   setVar(root, "spacing-large", spacing.large);

   /////////////////////////////////////////////////////////////////////////////
   // App Bar variables                                                       //
   /////////////////////////////////////////////////////////////////////////////
   setVar(root, "app-bar-background-color", mergedTheme.appBarBackgroundColor);
   setVar(root, "app-bar-text-color", mergedTheme.appBarTextColor);

   /////////////////////////////////////////////////////////////////////////////
   // Asset paths                                                             //
   /////////////////////////////////////////////////////////////////////////////
   setVar(root, "logo-path", mergedTheme.logoPath);
   setVar(root, "icon-path", mergedTheme.iconPath);
   setVar(root, "favicon-path", mergedTheme.faviconPath);

   /////////////////////////////////////////////////////////////////////////////
   // Icon style for MUI Icon baseClassName                                   //
   /////////////////////////////////////////////////////////////////////////////
   setVar(root, "icon-style", mergedTheme.iconStyle || "filled");

   /////////////////////////////////////////////////////////////////////////////
   // Inject icon fonts                                                       //
   /////////////////////////////////////////////////////////////////////////////
   injectIconFonts();

   /////////////////////////////////////////////////////////////////////////////
   // Inject custom CSS if provided                                           //
   /////////////////////////////////////////////////////////////////////////////
   if (mergedTheme.customCss)
   {
      injectCustomCss(mergedTheme.customCss);
   }
}

/*******************************************************************************
 ** Helper to set a CSS variable on an element.
 *******************************************************************************/
function setVar(element: HTMLElement, name: string, value: string | number | boolean | undefined): void
{
   if (value != null)
   {
      element.style.setProperty(`${CSS_VAR_PREFIX}${name}`, String(value));
   }
}

