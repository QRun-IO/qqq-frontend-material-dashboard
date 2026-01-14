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

// eslint-disable-next-line import/no-unresolved
import {QThemeMetaData} from "@qrunio/qqq-frontend-core/lib/model/metaData/QThemeMetaData";

/*******************************************************************************
 ** Default theme values matching the current QQQ color scheme.
 *******************************************************************************/
export const DEFAULT_THEME: QThemeMetaData = {
   // Color palette
   primaryColor: "#0062FF",
   secondaryColor: "#7b809a",
   backgroundColor: "#f0f2f5",
   surfaceColor: "#ffffff",
   textPrimary: "#344767",
   textSecondary: "#7b809a",
   errorColor: "#F44335",
   warningColor: "#fb8c00",
   successColor: "#4CAF50",
   infoColor: "#0062FF",

   // Typography - Base
   fontFamily: "\"Roboto\", \"Helvetica\", \"Arial\", sans-serif",
   headerFontFamily: "\"Roboto\", \"Helvetica\", \"Arial\", sans-serif",
   monoFontFamily: "\"Roboto Mono\", \"Courier New\", monospace",
   fontSizeBase: "14px",
   fontWeightLight: 300,
   fontWeightRegular: 400,
   fontWeightMedium: 500,
   fontWeightBold: 700,

   // Typography - H1
   typographyH1FontSize: "3rem",
   typographyH1FontWeight: 700,
   typographyH1LineHeight: 1.25,
   typographyH1LetterSpacing: "-0.01562em",
   typographyH1TextTransform: "none",

   // Typography - H2
   typographyH2FontSize: "2.125rem",
   typographyH2FontWeight: 700,
   typographyH2LineHeight: 1.3,
   typographyH2LetterSpacing: "-0.00833em",
   typographyH2TextTransform: "none",

   // Typography - H3
   typographyH3FontSize: "1.5rem",
   typographyH3FontWeight: 700,
   typographyH3LineHeight: 1.375,
   typographyH3LetterSpacing: "0em",
   typographyH3TextTransform: "none",

   // Typography - H4
   typographyH4FontSize: "1.25rem",
   typographyH4FontWeight: 700,
   typographyH4LineHeight: 1.4,
   typographyH4LetterSpacing: "0.00735em",
   typographyH4TextTransform: "none",

   // Typography - H5
   typographyH5FontSize: "1rem",
   typographyH5FontWeight: 600,
   typographyH5LineHeight: 1.5,
   typographyH5LetterSpacing: "0em",
   typographyH5TextTransform: "none",

   // Typography - H6
   typographyH6FontSize: "0.875rem",
   typographyH6FontWeight: 600,
   typographyH6LineHeight: 1.6,
   typographyH6LetterSpacing: "0.0075em",
   typographyH6TextTransform: "none",

   // Typography - Body1
   typographyBody1FontSize: "1rem",
   typographyBody1FontWeight: 400,
   typographyBody1LineHeight: 1.5,
   typographyBody1LetterSpacing: "0.00938em",
   typographyBody1TextTransform: "none",

   // Typography - Body2
   typographyBody2FontSize: "0.875rem",
   typographyBody2FontWeight: 400,
   typographyBody2LineHeight: 1.43,
   typographyBody2LetterSpacing: "0.01071em",
   typographyBody2TextTransform: "none",

   // Typography - Button
   typographyButtonFontSize: "0.875rem",
   typographyButtonFontWeight: 500,
   typographyButtonLineHeight: 1.75,
   typographyButtonLetterSpacing: "0.02857em",
   typographyButtonTextTransform: "uppercase",

   // Typography - Caption
   typographyCaptionFontSize: "0.75rem",
   typographyCaptionFontWeight: 400,
   typographyCaptionLineHeight: 1.66,
   typographyCaptionLetterSpacing: "0.03333em",
   typographyCaptionTextTransform: "none",

   // Sizing
   borderRadius: "8px",
   density: "normal",

   // Branded Header Bar (disabled by default)
   brandedHeaderEnabled: false,
   brandedHeaderBackgroundColor: "#1a2035",
   brandedHeaderTextColor: "#ffffff",
   brandedHeaderHeight: "48px",
   brandedHeaderTagline: "",

   // Sidebar (dark theme defaults matching current QQQ)
   sidebarBackgroundColor: "#1a2035",
   sidebarTextColor: "#ffffff",
   sidebarIconColor: "#ffffff",
   sidebarSelectedBackgroundColor: "#0062FF",
   sidebarSelectedTextColor: "#ffffff",
   sidebarHoverBackgroundColor: "rgba(255, 255, 255, 0.2)",
   sidebarDividerColor: "rgba(255, 255, 255, 0.2)",

   // App Bar
   appBarBackgroundColor: "#ffffff",
   appBarTextColor: "#344767",

   // Tables
   tableHeaderBackgroundColor: "#f0f2f5",
   tableHeaderTextColor: "#344767",
   tableRowHoverColor: "rgba(0, 0, 0, 0.04)",
   tableRowSelectedColor: "rgba(0, 98, 255, 0.08)",
   tableBorderColor: "rgba(0, 0, 0, 0.12)",

   // General
   dividerColor: "rgba(0, 0, 0, 0.12)",
   borderColor: "rgba(0, 0, 0, 0.12)",
   cardBorderColor: "rgba(0, 0, 0, 0.12)",

   // Icons
   iconStyle: "filled",
} as QThemeMetaData;

/*******************************************************************************
 ** CSS variable prefix for QQQ theme variables.
 *******************************************************************************/
const CSS_VAR_PREFIX = "--qqq-";

/*******************************************************************************
 ** Convert a camelCase property name to kebab-case.
 ** Handles both lowercase-to-uppercase and digit-to-uppercase transitions.
 *******************************************************************************/
function toKebabCase(str: string): string
{
   return str
      .replace(/([a-z])([A-Z])/g, "$1-$2")
      .replace(/([0-9])([A-Z])/g, "$1-$2")
      .toLowerCase();
}

/*******************************************************************************
 ** Density spacing multipliers for compact/normal/comfortable modes.
 *******************************************************************************/
const DENSITY_SPACING: Record<string, { base: number; small: string; medium: string; large: string }> = {
   compact: {base: 6, small: "0.25rem", medium: "0.5rem", large: "0.75rem"},
   normal: {base: 8, small: "0.5rem", medium: "1rem", large: "1.5rem"},
   comfortable: {base: 10, small: "0.75rem", medium: "1.25rem", large: "2rem"},
};

/*******************************************************************************
 ** Convert a hex color to RGB components.
 *******************************************************************************/
function hexToRgb(hex: string): { r: number; g: number; b: number } | null
{
   const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
   return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
   } : null;
}

/*******************************************************************************
 ** Lighten a hex color by a percentage (0-100).
 *******************************************************************************/
function lightenColor(hex: string, percent: number): string
{
   const rgb = hexToRgb(hex);
   if (!rgb) return hex;

   const factor = percent / 100;
   const r = Math.min(255, Math.round(rgb.r + (255 - rgb.r) * factor));
   const g = Math.min(255, Math.round(rgb.g + (255 - rgb.g) * factor));
   const b = Math.min(255, Math.round(rgb.b + (255 - rgb.b) * factor));

   return `rgb(${r}, ${g}, ${b})`;
}

/*******************************************************************************
 ** Darken a hex color by a percentage (0-100).
 *******************************************************************************/
function darkenColor(hex: string, percent: number): string
{
   const rgb = hexToRgb(hex);
   if (!rgb) return hex;

   const factor = 1 - (percent / 100);
   const r = Math.round(rgb.r * factor);
   const g = Math.round(rgb.g * factor);
   const b = Math.round(rgb.b * factor);

   return `rgb(${r}, ${g}, ${b})`;
}

/*******************************************************************************
 ** Inject theme values as CSS custom properties on the :root element.
 ** Merges provided theme with defaults - only defined values override.
 *******************************************************************************/
export function injectThemeVariables(theme?: QThemeMetaData): void
{
   const root = document.documentElement;

   /////////////////////////////////////////////////////////////////////////////
   // Filter out undefined values from theme before merging with defaults     //
   // This prevents undefined values from overwriting default values          //
   /////////////////////////////////////////////////////////////////////////////
   const definedThemeValues: Partial<QThemeMetaData> = {};
   if (theme)
   {
      for (const key of Object.keys(theme) as (keyof QThemeMetaData)[])
      {
         if (theme[key] !== undefined)
         {
            (definedThemeValues as Record<string, unknown>)[key] = theme[key];
         }
      }
   }
   const mergedTheme = {...DEFAULT_THEME, ...definedThemeValues};

   const themeProperties: (keyof QThemeMetaData)[] = [
      // Color palette
      "primaryColor",
      "secondaryColor",
      "backgroundColor",
      "surfaceColor",
      "textPrimary",
      "textSecondary",
      "errorColor",
      "warningColor",
      "successColor",
      "infoColor",

      // Typography - Base
      "fontFamily",
      "headerFontFamily",
      "monoFontFamily",
      "fontSizeBase",
      "fontWeightLight",
      "fontWeightRegular",
      "fontWeightMedium",
      "fontWeightBold",

      // Typography - H1
      "typographyH1FontSize",
      "typographyH1FontWeight",
      "typographyH1LineHeight",
      "typographyH1LetterSpacing",
      "typographyH1TextTransform",

      // Typography - H2
      "typographyH2FontSize",
      "typographyH2FontWeight",
      "typographyH2LineHeight",
      "typographyH2LetterSpacing",
      "typographyH2TextTransform",

      // Typography - H3
      "typographyH3FontSize",
      "typographyH3FontWeight",
      "typographyH3LineHeight",
      "typographyH3LetterSpacing",
      "typographyH3TextTransform",

      // Typography - H4
      "typographyH4FontSize",
      "typographyH4FontWeight",
      "typographyH4LineHeight",
      "typographyH4LetterSpacing",
      "typographyH4TextTransform",

      // Typography - H5
      "typographyH5FontSize",
      "typographyH5FontWeight",
      "typographyH5LineHeight",
      "typographyH5LetterSpacing",
      "typographyH5TextTransform",

      // Typography - H6
      "typographyH6FontSize",
      "typographyH6FontWeight",
      "typographyH6LineHeight",
      "typographyH6LetterSpacing",
      "typographyH6TextTransform",

      // Typography - Body1
      "typographyBody1FontSize",
      "typographyBody1FontWeight",
      "typographyBody1LineHeight",
      "typographyBody1LetterSpacing",
      "typographyBody1TextTransform",

      // Typography - Body2
      "typographyBody2FontSize",
      "typographyBody2FontWeight",
      "typographyBody2LineHeight",
      "typographyBody2LetterSpacing",
      "typographyBody2TextTransform",

      // Typography - Button
      "typographyButtonFontSize",
      "typographyButtonFontWeight",
      "typographyButtonLineHeight",
      "typographyButtonLetterSpacing",
      "typographyButtonTextTransform",

      // Typography - Caption
      "typographyCaptionFontSize",
      "typographyCaptionFontWeight",
      "typographyCaptionLineHeight",
      "typographyCaptionLetterSpacing",
      "typographyCaptionTextTransform",

      // Sizing
      "borderRadius",
      "density",

      // Asset paths
      "logoPath",
      "iconPath",
      "faviconPath",

      // Icon style
      "iconStyle",

      // Branded Header Bar
      "brandedHeaderEnabled",
      "brandedHeaderBackgroundColor",
      "brandedHeaderTextColor",
      "brandedHeaderLogoPath",
      "brandedHeaderLogoAltText",
      "brandedHeaderHeight",
      "brandedHeaderTagline",

      // App Bar
      "appBarBackgroundColor",
      "appBarTextColor",

      // Sidebar
      "sidebarBackgroundColor",
      "sidebarTextColor",
      "sidebarIconColor",
      "sidebarSelectedBackgroundColor",
      "sidebarSelectedTextColor",
      "sidebarHoverBackgroundColor",
      "sidebarDividerColor",

      // Tables
      "tableHeaderBackgroundColor",
      "tableHeaderTextColor",
      "tableRowHoverColor",
      "tableRowSelectedColor",
      "tableBorderColor",

      // General
      "dividerColor",
      "borderColor",
      "cardBorderColor",
   ];

   for (const prop of themeProperties)
   {
      const value = mergedTheme[prop];
      if (value != null)
      {
         const cssVarName = `${CSS_VAR_PREFIX}${toKebabCase(prop)}`;
         root.style.setProperty(cssVarName, String(value));
      }
   }

   ////////////////////////////////////////////////////////////////////
   // Inject density-based spacing variables based on density setting //
   ////////////////////////////////////////////////////////////////////
   const density = mergedTheme.density || "normal";
   const spacing = DENSITY_SPACING[density] || DENSITY_SPACING.normal;
   root.style.setProperty(`${CSS_VAR_PREFIX}spacing-base`, `${spacing.base}px`);
   root.style.setProperty(`${CSS_VAR_PREFIX}spacing-small`, spacing.small);
   root.style.setProperty(`${CSS_VAR_PREFIX}spacing-medium`, spacing.medium);
   root.style.setProperty(`${CSS_VAR_PREFIX}spacing-large`, spacing.large);

   ////////////////////////////////////////////////////////////////////
   // Inject derived colors for UI elements                          //
   ////////////////////////////////////////////////////////////////////

   // Action colors for interactive elements
   root.style.setProperty(`${CSS_VAR_PREFIX}action-active`, "rgba(0, 0, 0, 0.54)");
   root.style.setProperty(`${CSS_VAR_PREFIX}action-hover`, "rgba(0, 0, 0, 0.04)");
   root.style.setProperty(`${CSS_VAR_PREFIX}action-selected`, "rgba(0, 0, 0, 0.08)");
   root.style.setProperty(`${CSS_VAR_PREFIX}action-disabled`, "rgba(0, 0, 0, 0.26)");

   // Primary contrast text (text on primary-colored backgrounds)
   root.style.setProperty(`${CSS_VAR_PREFIX}primary-contrast-text`, "#ffffff");

   // Status color variants (light backgrounds and dark text for alerts/banners)
   const infoColor = mergedTheme.infoColor || DEFAULT_THEME.infoColor;
   const successColor = mergedTheme.successColor || DEFAULT_THEME.successColor;
   const warningColor = mergedTheme.warningColor || DEFAULT_THEME.warningColor;
   const errorColor = mergedTheme.errorColor || DEFAULT_THEME.errorColor;

   root.style.setProperty(`${CSS_VAR_PREFIX}info-light`, lightenColor(infoColor, 90));
   root.style.setProperty(`${CSS_VAR_PREFIX}info-dark`, darkenColor(infoColor, 60));
   root.style.setProperty(`${CSS_VAR_PREFIX}success-light`, lightenColor(successColor, 90));
   root.style.setProperty(`${CSS_VAR_PREFIX}success-dark`, darkenColor(successColor, 60));
   root.style.setProperty(`${CSS_VAR_PREFIX}warning-light`, lightenColor(warningColor, 90));
   root.style.setProperty(`${CSS_VAR_PREFIX}warning-dark`, darkenColor(warningColor, 60));
   root.style.setProperty(`${CSS_VAR_PREFIX}error-light`, lightenColor(errorColor, 90));
   root.style.setProperty(`${CSS_VAR_PREFIX}error-dark`, darkenColor(errorColor, 60));

   ////////////////////////////////////////////////////////////////////
   // Inject chart-specific colors                                    //
   ////////////////////////////////////////////////////////////////////
   root.style.setProperty(`${CSS_VAR_PREFIX}chart-grid-color`, "#c1c4ce5c");
   root.style.setProperty(`${CSS_VAR_PREFIX}chart-text-color`, "#9ca2b7");
   root.style.setProperty(`${CSS_VAR_PREFIX}chart-background-color`, mergedTheme.primaryColor || "#1A73E8");

   ////////////////////////////////////////////////////////////////////
   // Inject link color (defaults to primary)                        //
   ////////////////////////////////////////////////////////////////////
   root.style.setProperty(`${CSS_VAR_PREFIX}link-color`, mergedTheme.primaryColor || DEFAULT_THEME.primaryColor);

   ////////////////////////////////////////////////////////////////////
   // Inject grey scale for UI elements                              //
   ////////////////////////////////////////////////////////////////////
   root.style.setProperty(`${CSS_VAR_PREFIX}grey-100`, "#f8f9fa");
   root.style.setProperty(`${CSS_VAR_PREFIX}grey-200`, "#eeeeee");
   root.style.setProperty(`${CSS_VAR_PREFIX}grey-300`, "#e0e0e0");
   root.style.setProperty(`${CSS_VAR_PREFIX}grey-400`, "#bdbdbd");
   root.style.setProperty(`${CSS_VAR_PREFIX}grey-500`, "#9e9e9e");
   root.style.setProperty(`${CSS_VAR_PREFIX}grey-600`, "#757575");
   root.style.setProperty(`${CSS_VAR_PREFIX}grey-700`, "#616161");
   root.style.setProperty(`${CSS_VAR_PREFIX}grey-800`, "#424242");
   root.style.setProperty(`${CSS_VAR_PREFIX}grey-900`, "#212121");

   ////////////////////////////////////////////////////////////////////
   // Inject icon font stylesheets dynamically                       //
   ////////////////////////////////////////////////////////////////////
   injectIconFonts(mergedTheme.iconStyle);

   // Inject custom CSS if provided
   if (mergedTheme.customCss)
   {
      injectCustomCss(mergedTheme.customCss);
   }
}

/*******************************************************************************
 ** Map icon style name to MUI Icon baseClassName.
 *******************************************************************************/
const ICON_STYLE_TO_CLASS: Record<string, string> = {
   filled: "material-icons",
   outlined: "material-icons-outlined",
   rounded: "material-icons-round",
   sharp: "material-icons-sharp",
   "two-tone": "material-icons-two-tone",
};

/*******************************************************************************
 ** Get the MUI Icon baseClassName for the current theme's iconStyle.
 *******************************************************************************/
export function getIconBaseClassName(): string
{
   const iconStyle = getComputedStyle(document.documentElement)
      .getPropertyValue("--qqq-icon-style").trim() || "filled";
   return ICON_STYLE_TO_CLASS[iconStyle] || ICON_STYLE_TO_CLASS.filled;
}

/*******************************************************************************
 ** Retrieve a CSS variable value with an optional fallback.
 *******************************************************************************/
export function getThemeVariable(name: string, fallback?: string): string
{
   const cssVarName = name.startsWith(CSS_VAR_PREFIX) ? name : `${CSS_VAR_PREFIX}${toKebabCase(name)}`;
   const value = getComputedStyle(document.documentElement).getPropertyValue(cssVarName).trim();
   return value || fallback || "";
}

/*******************************************************************************
 ** Inject custom CSS into the document head.
 *******************************************************************************/
function injectCustomCss(css: string): void
{
   const existingStyle = document.getElementById("qqq-custom-theme-css");
   if (existingStyle)
   {
      existingStyle.textContent = css;
   }
   else
   {
      const style = document.createElement("style");
      style.id = "qqq-custom-theme-css";
      style.textContent = css;
      document.head.appendChild(style);
   }
}

/*******************************************************************************
 ** Default icon font CDN URL for Material Icons.
 *******************************************************************************/
const DEFAULT_ICON_FONT_URL = "https://fonts.googleapis.com/css?family=Material+Icons|Material+Icons+Outlined|Material+Icons+Two+Tone|Material+Icons+Round|Material+Icons+Sharp";

/*******************************************************************************
 ** Default font CDN URL for Roboto.
 *******************************************************************************/
const DEFAULT_FONT_URL = "https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap";

/*******************************************************************************
 ** Inject icon font stylesheets dynamically based on theme configuration.
 ** This replaces the hardcoded CDN links in index.html with dynamic injection.
 *******************************************************************************/
function injectIconFonts(iconStyle?: string): void
{
   const iconFontLinkId = "qqq-icon-font";
   const fontLinkId = "qqq-font";

   ////////////////////////////////////////////////////////////////////
   // Inject main font (Roboto) if not already present               //
   ////////////////////////////////////////////////////////////////////
   if (!document.getElementById(fontLinkId))
   {
      const fontLink = document.createElement("link");
      fontLink.id = fontLinkId;
      fontLink.rel = "stylesheet";
      fontLink.href = DEFAULT_FONT_URL;
      document.head.appendChild(fontLink);
   }

   ////////////////////////////////////////////////////////////////////
   // Inject icon font - remove existing and re-add to allow updates //
   ////////////////////////////////////////////////////////////////////
   const existingIconLink = document.getElementById(iconFontLinkId);
   if (existingIconLink)
   {
      existingIconLink.remove();
   }

   const iconLink = document.createElement("link");
   iconLink.id = iconFontLinkId;
   iconLink.rel = "stylesheet";
   iconLink.href = DEFAULT_ICON_FONT_URL;
   document.head.appendChild(iconLink);
}
