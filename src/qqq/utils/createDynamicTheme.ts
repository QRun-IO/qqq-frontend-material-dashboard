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

import {createTheme, Theme, ThemeOptions} from "@mui/material";
// eslint-disable-next-line import/no-unresolved
import {QThemeMetaData} from "@qrunio/qqq-frontend-core/lib/model/metaData/QThemeMetaData";
import borders from "qqq/assets/theme/base/borders";
import boxShadows from "qqq/assets/theme/base/boxShadows";
import breakpoints from "qqq/assets/theme/base/breakpoints";
import colors from "qqq/assets/theme/base/colors";
import boxShadow from "qqq/assets/theme/functions/boxShadow";
import hexToRgb from "qqq/assets/theme/functions/hexToRgb";
import linearGradient from "qqq/assets/theme/functions/linearGradient";
import pxToRem from "qqq/assets/theme/functions/pxToRem";
import rgba from "qqq/assets/theme/functions/rgba";
import {DEFAULT_THEME} from "./themeUtils";

/*******************************************************************************
 ** Density spacing multipliers for compact/normal/comfortable modes.
 *******************************************************************************/
const DENSITY_SPACING: Record<string, number> = {
   compact: 6,
   normal: 8,
   comfortable: 10,
};

/*******************************************************************************
 ** Parse a border radius string (e.g., "8px") to a number.
 *******************************************************************************/
function parseBorderRadius(value: string | undefined): number
{
   if (!value) return 8;
   const parsed = parseInt(value, 10);
   return isNaN(parsed) ? 8 : parsed;
}

/*******************************************************************************
 ** Merge provided theme with defaults, filtering out undefined values.
 *******************************************************************************/
function mergeWithDefaults(theme?: QThemeMetaData): QThemeMetaData
{
   const definedValues: Partial<QThemeMetaData> = {};
   if (theme)
   {
      for (const key of Object.keys(theme) as (keyof QThemeMetaData)[])
      {
         if (theme[key] !== undefined)
         {
            (definedValues as Record<string, unknown>)[key] = theme[key];
         }
      }
   }
   return {...DEFAULT_THEME, ...definedValues} as QThemeMetaData;
}

/*******************************************************************************
 ** Build MUI palette from QThemeMetaData.
 ** Extends the base colors with dynamic theme values.
 **
 ** Uses type assertion because this project extends MUI's palette with custom
 ** properties like 'focus' that aren't in the standard PaletteOptions type.
 *******************************************************************************/
function buildPalette(theme: QThemeMetaData): ThemeOptions["palette"]
{
   /////////////////////////////////////////////////////////////////////////////
   // Start with all existing colors from the base colors file               //
   // Then override with dynamic theme values where provided                  //
   /////////////////////////////////////////////////////////////////////////////
   const primaryColor = theme.primaryColor || colors.info.main;
   const secondaryColor = theme.secondaryColor || colors.secondary.main;
   const errorColor = theme.errorColor || colors.error.main;
   const warningColor = theme.warningColor || colors.warning.main;
   const infoColor = theme.infoColor || colors.info.main;
   const successColor = theme.successColor || colors.success.main;
   const textPrimary = theme.textPrimary || "#344767";
   const textSecondary = theme.textSecondary || "#7b809a";
   const backgroundColor = theme.backgroundColor || colors.background.default;

   return {
      ...colors,
      primary: {
         main: primaryColor,
         focus: primaryColor,
      },
      secondary: {
         main: secondaryColor,
         focus: secondaryColor,
      },
      error: {
         main: errorColor,
         focus: errorColor,
      },
      warning: {
         main: warningColor,
         focus: warningColor,
      },
      info: {
         main: infoColor,
         focus: infoColor,
      },
      success: {
         main: successColor,
         focus: successColor,
      },
      background: {
         default: backgroundColor,
      },
      text: {
         main: textSecondary,
         focus: textSecondary,
         primary: textPrimary,
         secondary: textSecondary,
      },
   } as ThemeOptions["palette"];
}

/*******************************************************************************
 ** Build MUI typography from QThemeMetaData.
 *******************************************************************************/
function buildTypography(theme: QThemeMetaData): ThemeOptions["typography"]
{
   const fontFamily = theme.fontFamily || "\"Roboto\", \"Helvetica\", \"Arial\", sans-serif";

   return {
      fontFamily,
      fontWeightLight: theme.fontWeightLight || 300,
      fontWeightRegular: theme.fontWeightRegular || 400,
      fontWeightMedium: theme.fontWeightMedium || 500,
      fontWeightBold: theme.fontWeightBold || 700,
      h1: {
         fontFamily: theme.headerFontFamily || fontFamily,
         fontSize: theme.typographyH1FontSize || "3rem",
         fontWeight: theme.typographyH1FontWeight || 700,
         lineHeight: theme.typographyH1LineHeight || 1.25,
         letterSpacing: theme.typographyH1LetterSpacing || "-0.01562em",
         textTransform: (theme.typographyH1TextTransform as "none" | "uppercase" | "lowercase" | "capitalize") || "none",
      },
      h2: {
         fontFamily: theme.headerFontFamily || fontFamily,
         fontSize: theme.typographyH2FontSize || "2.125rem",
         fontWeight: theme.typographyH2FontWeight || 700,
         lineHeight: theme.typographyH2LineHeight || 1.3,
         letterSpacing: theme.typographyH2LetterSpacing || "-0.00833em",
         textTransform: (theme.typographyH2TextTransform as "none" | "uppercase" | "lowercase" | "capitalize") || "none",
      },
      h3: {
         fontFamily: theme.headerFontFamily || fontFamily,
         fontSize: theme.typographyH3FontSize || "1.5rem",
         fontWeight: theme.typographyH3FontWeight || 700,
         lineHeight: theme.typographyH3LineHeight || 1.375,
         letterSpacing: theme.typographyH3LetterSpacing || "0em",
         textTransform: (theme.typographyH3TextTransform as "none" | "uppercase" | "lowercase" | "capitalize") || "none",
      },
      h4: {
         fontFamily: theme.headerFontFamily || fontFamily,
         fontSize: theme.typographyH4FontSize || "1.25rem",
         fontWeight: theme.typographyH4FontWeight || 700,
         lineHeight: theme.typographyH4LineHeight || 1.4,
         letterSpacing: theme.typographyH4LetterSpacing || "0.00735em",
         textTransform: (theme.typographyH4TextTransform as "none" | "uppercase" | "lowercase" | "capitalize") || "none",
      },
      h5: {
         fontFamily: theme.headerFontFamily || fontFamily,
         fontSize: theme.typographyH5FontSize || "1rem",
         fontWeight: theme.typographyH5FontWeight || 600,
         lineHeight: theme.typographyH5LineHeight || 1.5,
         letterSpacing: theme.typographyH5LetterSpacing || "0em",
         textTransform: (theme.typographyH5TextTransform as "none" | "uppercase" | "lowercase" | "capitalize") || "none",
      },
      h6: {
         fontFamily: theme.headerFontFamily || fontFamily,
         fontSize: theme.typographyH6FontSize || "0.875rem",
         fontWeight: theme.typographyH6FontWeight || 600,
         lineHeight: theme.typographyH6LineHeight || 1.6,
         letterSpacing: theme.typographyH6LetterSpacing || "0.0075em",
         textTransform: (theme.typographyH6TextTransform as "none" | "uppercase" | "lowercase" | "capitalize") || "none",
      },
      body1: {
         fontFamily,
         fontSize: theme.typographyBody1FontSize || "1rem",
         fontWeight: theme.typographyBody1FontWeight || 400,
         lineHeight: theme.typographyBody1LineHeight || 1.5,
         letterSpacing: theme.typographyBody1LetterSpacing || "0.00938em",
      },
      body2: {
         fontFamily,
         fontSize: theme.typographyBody2FontSize || "0.875rem",
         fontWeight: theme.typographyBody2FontWeight || 400,
         lineHeight: theme.typographyBody2LineHeight || 1.43,
         letterSpacing: theme.typographyBody2LetterSpacing || "0.01071em",
      },
      button: {
         fontFamily,
         fontSize: theme.typographyButtonFontSize || "0.875rem",
         fontWeight: theme.typographyButtonFontWeight || 500,
         lineHeight: theme.typographyButtonLineHeight || 1.75,
         letterSpacing: theme.typographyButtonLetterSpacing || "0.02857em",
         textTransform: (theme.typographyButtonTextTransform as "none" | "uppercase" | "lowercase" | "capitalize") || "uppercase",
      },
      caption: {
         fontFamily,
         fontSize: theme.typographyCaptionFontSize || "0.75rem",
         fontWeight: theme.typographyCaptionFontWeight || 400,
         lineHeight: theme.typographyCaptionLineHeight || 1.66,
         letterSpacing: theme.typographyCaptionLetterSpacing || "0.03333em",
      },
   };
}

/*******************************************************************************
 ** Build MUI component overrides from QThemeMetaData.
 ** This replaces the 55 static component override files with dynamic values.
 *******************************************************************************/
function buildComponents(theme: QThemeMetaData): ThemeOptions["components"]
{
   const borderRadius = parseBorderRadius(theme.borderRadius);
   const density = theme.density || "normal";
   const spacingUnit = DENSITY_SPACING[density] || 8;

   const primaryColor = theme.primaryColor || "#0062FF";
   const textPrimary = theme.textPrimary || "#344767";
   const textSecondary = theme.textSecondary || "#7b809a";
   const backgroundColor = theme.backgroundColor || "#f0f2f5";
   const surfaceColor = theme.surfaceColor || "#ffffff";
   const borderColor = theme.borderColor || "rgba(0, 0, 0, 0.12)";
   const dividerColor = theme.dividerColor || "rgba(0, 0, 0, 0.12)";

   return {
      MuiCssBaseline: {
         styleOverrides: {
            html: {
               scrollBehavior: "smooth",
            },
            body: {
               backgroundColor,
            },
            "*, *::before, *::after": {
               margin: 0,
               padding: 0,
            },
            "a, a:link, a:visited": {
               textDecoration: "none",
            },
            "a.link, .link, a.link:link, .link:link, a.link:visited, .link:visited": {
               color: `${primaryColor} !important`,
               transition: "color 150ms ease-in",
            },
            "a.link:hover, .link:hover, a.link:focus, .link:focus": {
               color: `${primaryColor} !important`,
            },
         },
      },
      MuiButton: {
         defaultProps: {
            disableRipple: false,
         },
         styleOverrides: {
            root: {
               borderRadius: `${borderRadius}px`,
               padding: `${spacingUnit}px ${spacingUnit * 2}px`,
            },
            contained: {
               boxShadow: "none",
               "&:hover": {
                  boxShadow: "none",
               },
            },
            containedPrimary: {
               backgroundColor: primaryColor,
               "&:hover": {
                  backgroundColor: primaryColor,
                  filter: "brightness(0.9)",
               },
            },
            outlined: {
               borderColor,
            },
            outlinedPrimary: {
               borderColor: primaryColor,
               color: primaryColor,
               "&:hover": {
                  backgroundColor: `${primaryColor}10`,
               },
            },
            text: {
               color: textPrimary,
            },
            textPrimary: {
               color: primaryColor,
            },
         },
      },
      MuiCard: {
         styleOverrides: {
            root: {
               borderRadius: `${borderRadius}px`,
               boxShadow: "0rem 0.25rem 0.375rem -0.0625rem rgba(0, 0, 0, 0.1), 0rem 0.125rem 0.25rem -0.0625rem rgba(0, 0, 0, 0.06)",
               overflow: "visible",
            },
         },
      },
      MuiCardContent: {
         styleOverrides: {
            root: {
               padding: `${spacingUnit * 2}px`,
               "&:last-child": {
                  paddingBottom: `${spacingUnit * 2}px`,
               },
            },
         },
      },
      MuiChip: {
         styleOverrides: {
            root: {
               borderRadius: `${borderRadius / 2}px`,
            },
            colorPrimary: {
               backgroundColor: primaryColor,
            },
         },
      },
      MuiDialog: {
         styleOverrides: {
            paper: {
               borderRadius: `${borderRadius}px`,
            },
         },
      },
      MuiDivider: {
         styleOverrides: {
            root: {
               backgroundColor: dividerColor,
            },
         },
      },
      MuiIconButton: {
         styleOverrides: {
            root: {
               color: textSecondary,
               "&:hover": {
                  backgroundColor: "rgba(0, 0, 0, 0.04)",
               },
            },
         },
      },
      MuiInputBase: {
         styleOverrides: {
            root: {
               fontSize: "0.875rem",
            },
         },
      },
      MuiOutlinedInput: {
         styleOverrides: {
            root: {
               borderRadius: `${borderRadius}px`,
               "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: primaryColor,
               },
            },
            notchedOutline: {
               borderColor,
            },
         },
      },
      MuiInputLabel: {
         styleOverrides: {
            root: {
               color: textSecondary,
               "&.Mui-focused": {
                  color: primaryColor,
               },
            },
         },
      },
      MuiLink: {
         styleOverrides: {
            root: {
               color: primaryColor,
               textDecoration: "none",
               "&:hover": {
                  textDecoration: "underline",
               },
            },
         },
      },
      MuiLinearProgress: {
         styleOverrides: {
            root: {
               borderRadius: `${borderRadius / 2}px`,
               height: "4px",
            },
            bar: {
               borderRadius: `${borderRadius / 2}px`,
            },
            colorPrimary: {
               backgroundColor: `${primaryColor}30`,
            },
            barColorPrimary: {
               backgroundColor: primaryColor,
            },
         },
      },
      MuiMenu: {
         styleOverrides: {
            paper: {
               borderRadius: `${borderRadius}px`,
               boxShadow: "0rem 0.25rem 0.375rem -0.0625rem rgba(0, 0, 0, 0.1), 0rem 0.125rem 0.25rem -0.0625rem rgba(0, 0, 0, 0.06)",
            },
         },
      },
      MuiMenuItem: {
         styleOverrides: {
            root: {
               fontSize: "0.875rem",
               padding: `${spacingUnit}px ${spacingUnit * 2}px`,
               "&:hover": {
                  backgroundColor: "rgba(0, 0, 0, 0.04)",
               },
            },
         },
      },
      MuiPaper: {
         styleOverrides: {
            root: {
               backgroundColor: surfaceColor,
            },
            rounded: {
               borderRadius: `${borderRadius}px`,
            },
         },
      },
      MuiPopover: {
         styleOverrides: {
            paper: {
               borderRadius: `${borderRadius}px`,
               boxShadow: "0rem 0.25rem 0.375rem -0.0625rem rgba(0, 0, 0, 0.1), 0rem 0.125rem 0.25rem -0.0625rem rgba(0, 0, 0, 0.06)",
            },
         },
      },
      MuiSelect: {
         styleOverrides: {
            select: {
               "&:focus": {
                  backgroundColor: "transparent",
               },
            },
         },
      },
      MuiSwitch: {
         styleOverrides: {
            colorPrimary: {
               "&.Mui-checked": {
                  color: primaryColor,
               },
               "&.Mui-checked + .MuiSwitch-track": {
                  backgroundColor: primaryColor,
               },
            },
         },
      },
      MuiTab: {
         styleOverrides: {
            root: {
               color: textSecondary,
               "&.Mui-selected": {
                  color: primaryColor,
               },
            },
         },
      },
      MuiTabs: {
         styleOverrides: {
            indicator: {
               backgroundColor: primaryColor,
            },
         },
      },
      MuiTableCell: {
         styleOverrides: {
            root: {
               borderBottom: `1px solid ${theme.tableBorderColor || borderColor}`,
               padding: `${spacingUnit}px ${spacingUnit * 2}px`,
            },
            head: {
               backgroundColor: theme.tableHeaderBackgroundColor || backgroundColor,
               color: theme.tableHeaderTextColor || textPrimary,
               fontWeight: 600,
            },
         },
      },
      MuiTableRow: {
         styleOverrides: {
            root: {
               "&:hover": {
                  backgroundColor: theme.tableRowHoverColor || "rgba(0, 0, 0, 0.04)",
               },
               "&.Mui-selected": {
                  backgroundColor: theme.tableRowSelectedColor || "rgba(0, 98, 255, 0.08)",
               },
            },
         },
      },
      MuiTooltip: {
         styleOverrides: {
            tooltip: {
               backgroundColor: "#1a2035",
               color: "#ffffff",
               fontSize: "0.75rem",
               borderRadius: `${borderRadius / 2}px`,
               padding: `${spacingUnit / 2}px ${spacingUnit}px`,
            },
            arrow: {
               color: "#1a2035",
            },
         },
      },
      MuiTypography: {
         styleOverrides: {
            root: {
               color: textPrimary,
            },
         },
      },
   };
}

/*******************************************************************************
 ** Create a complete MUI theme from QThemeMetaData.
 **
 ** This is the core of the MUI-first theming approach. Instead of injecting
 ** CSS variables and having MUI read them, we build the theme object directly
 ** from the QThemeMetaData values.
 **
 ** The theme is built in three parts:
 ** 1. palette - colors for primary, secondary, error, etc.
 ** 2. typography - font families, sizes, weights for all variants
 ** 3. components - style overrides for MUI components
 *******************************************************************************/
export function createDynamicTheme(themeMetaData?: QThemeMetaData): Theme
{
   const mergedTheme = mergeWithDefaults(themeMetaData);

   const density = mergedTheme.density || "normal";
   const spacingUnit = DENSITY_SPACING[density] || 8;

   const themeOptions: ThemeOptions = {
      breakpoints: {...breakpoints},
      palette: buildPalette(mergedTheme),
      typography: buildTypography(mergedTheme),
      spacing: spacingUnit,
      shape: {
         borderRadius: parseBorderRadius(mergedTheme.borderRadius),
      },
      boxShadows: {...boxShadows},
      borders: {...borders},
      functions: {
         boxShadow,
         hexToRgb,
         linearGradient,
         pxToRem,
         rgba,
      },
      components: buildComponents(mergedTheme),
   };

   return createTheme(themeOptions);
}

/*******************************************************************************
 ** Export the merged theme data for use by island CSS variable injection.
 ** This allows components like sidebar and branded header to access theme values.
 *******************************************************************************/
export function getMergedTheme(themeMetaData?: QThemeMetaData): QThemeMetaData
{
   return mergeWithDefaults(themeMetaData);
}
