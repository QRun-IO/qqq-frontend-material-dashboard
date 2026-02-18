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
import globals from "qqq/assets/theme/base/globals";
import typography from "qqq/assets/theme/base/typography";
import appBar from "qqq/assets/theme/components/appBar";
import avatar from "qqq/assets/theme/components/avatar";
import breadcrumbs from "qqq/assets/theme/components/breadcrumbs";
import button from "qqq/assets/theme/components/button";
import buttonBase from "qqq/assets/theme/components/buttonBase";
import card from "qqq/assets/theme/components/card";
import cardContent from "qqq/assets/theme/components/card/cardContent";
import cardMedia from "qqq/assets/theme/components/card/cardMedia";
import container from "qqq/assets/theme/components/container";
import dialog from "qqq/assets/theme/components/dialog";
import dialogActions from "qqq/assets/theme/components/dialog/dialogActions";
import dialogContent from "qqq/assets/theme/components/dialog/dialogContent";
import dialogContentText from "qqq/assets/theme/components/dialog/dialogContentText";
import dialogTitle from "qqq/assets/theme/components/dialog/dialogTitle";
import divider from "qqq/assets/theme/components/divider";
import flatpickr from "qqq/assets/theme/components/flatpickr";
import autocomplete from "qqq/assets/theme/components/form/autocomplete";
import checkbox from "qqq/assets/theme/components/form/checkbox";
import formControlLabel from "qqq/assets/theme/components/form/formControlLabel";
import formLabel from "qqq/assets/theme/components/form/formLabel";
import input from "qqq/assets/theme/components/form/input";
import inputLabel from "qqq/assets/theme/components/form/inputLabel";
import inputOutlined from "qqq/assets/theme/components/form/inputOutlined";
import radio from "qqq/assets/theme/components/form/radio";
import select from "qqq/assets/theme/components/form/select";
import switchButton from "qqq/assets/theme/components/form/switchButton";
import textField from "qqq/assets/theme/components/form/textField";
import icon from "qqq/assets/theme/components/icon";
import iconButton from "qqq/assets/theme/components/iconButton";
import linearProgress from "qqq/assets/theme/components/linearProgress";
import link from "qqq/assets/theme/components/link";
import list from "qqq/assets/theme/components/list";
import listItem from "qqq/assets/theme/components/list/listItem";
import listItemText from "qqq/assets/theme/components/list/listItemText";
import menu from "qqq/assets/theme/components/menu";
import menuItem from "qqq/assets/theme/components/menu/menuItem";
import popover from "qqq/assets/theme/components/popover";
import sidenav from "qqq/assets/theme/components/sidenav";
import slider from "qqq/assets/theme/components/slider";
import stepper from "qqq/assets/theme/components/stepper";
import step from "qqq/assets/theme/components/stepper/step";
import stepConnector from "qqq/assets/theme/components/stepper/stepConnector";
import stepIcon from "qqq/assets/theme/components/stepper/stepIcon";
import stepLabel from "qqq/assets/theme/components/stepper/stepLabel";
import svgIcon from "qqq/assets/theme/components/svgIcon";
import tableCell from "qqq/assets/theme/components/table/tableCell";
import tableContainer from "qqq/assets/theme/components/table/tableContainer";
import tableHead from "qqq/assets/theme/components/table/tableHead";
import tabs from "qqq/assets/theme/components/tabs";
import tab from "qqq/assets/theme/components/tabs/tab";
import tooltip from "qqq/assets/theme/components/tooltip";
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
 ** Original border-radius defaults per component, matching the values from
 ** the static component override files in assets/theme/components/.
 ** These are the "native" values before any theming was applied.
 *******************************************************************************/
const COMPONENT_DEFAULT_BORDER_RADIUS: Record<string, number> = {
   button: 8,           // borderRadius.lg
   card: 12,            // borderRadius.xl
   chip: 12,            // borderRadius.xl
   dialog: 8,           // borderRadius.lg
   outlinedInput: 6,    // borderRadius.md
   linearProgress: 6,   // borderRadius.md
   menuPaper: 6,        // borderRadius.md
   paperRounded: 12,    // borderRadius.xl
   popoverPaper: 6,     // borderRadius.md
   tooltip: 6,          // borderRadius.md
};

/*******************************************************************************
 ** Default for MUI's shape.borderRadius (used by components we don't
 ** explicitly override).
 *******************************************************************************/
const DEFAULT_SHAPE_BORDER_RADIUS = 6; // borderRadius.md

/*******************************************************************************
 ** Parse a border radius string (e.g., "8px") to a number.
 ** Returns null if the value is missing or unparseable, allowing fallback logic.
 *******************************************************************************/
function parseBorderRadius(value: string | undefined): number | null
{
   if (!value) return null;
   const parsed = parseInt(value, 10);
   return isNaN(parsed) ? null : parsed;
}

/*******************************************************************************
 ** Resolve the border-radius for a specific component using the three-tier
 ** priority system:
 **   1. Per-component override (e.g., borderRadiusCard) - absolute, always wins
 **   2. Global override (borderRadiusGlobal) - uniform value for all components
 **   3. Component default x scale factor - proportional scaling of original values
 *******************************************************************************/
function resolveComponentBorderRadius(
   componentOverride: number | null,
   globalOverride: number | null,
   componentDefault: number,
   scale: number,
): number
{
   if (componentOverride !== null) return componentOverride;
   if (globalOverride !== null) return globalOverride;
   return Math.round(componentDefault * scale);
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
   const textPrimary = theme.textPrimary || "#212121";
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
      gradients: {
         ...colors.gradients,
         primary: {
            main: "color-mix(in srgb, var(--qqq-primary-color, #D81B60) 65%, white)",
            state: "var(--qqq-primary-color, #D81B60)",
         },
         info: {
            main: "color-mix(in srgb, var(--qqq-info-color, #0062FF) 65%, white)",
            state: "var(--qqq-info-color, #0062FF)",
         },
      }
   } as ThemeOptions["palette"];
}

/*******************************************************************************
 ** Build MUI typography from QThemeMetaData.
 ** Merges with base typography to preserve custom properties like size/lineHeight
 ** that are used by the component override files.
 *******************************************************************************/
function buildTypography(theme: QThemeMetaData): ThemeOptions["typography"]
{
   const fontFamily = theme.fontFamily || "\"Roboto\", \"Helvetica\", \"Arial\", sans-serif";

   /////////////////////////////////////////////////////////////////////////////
   // Spread base typography to include custom properties (size, lineHeight,  //
   // fontWeightLighter, display variants) needed by component override files //
   /////////////////////////////////////////////////////////////////////////////
   return {
      ...typography,
      fontFamily,
      fontWeightLight: theme.fontWeightLight || 300,
      fontWeightRegular: theme.fontWeightRegular || 400,
      fontWeightMedium: theme.fontWeightMedium || 600,
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
         fontSize: theme.typographyH2FontSize || "2.25rem",
         fontWeight: theme.typographyH2FontWeight || 700,
         lineHeight: theme.typographyH2LineHeight || 1.3,
         letterSpacing: theme.typographyH2LetterSpacing || "-0.00833em",
         textTransform: (theme.typographyH2TextTransform as "none" | "uppercase" | "lowercase" | "capitalize") || "none",
      },
      h3: {
         fontFamily: theme.headerFontFamily || fontFamily,
         fontSize: theme.typographyH3FontSize || "1.75rem",
         fontWeight: theme.typographyH3FontWeight || 600,
         lineHeight: theme.typographyH3LineHeight || 1.375,
         letterSpacing: theme.typographyH3LetterSpacing || "0em",
         textTransform: (theme.typographyH3TextTransform as "none" | "uppercase" | "lowercase" | "capitalize") || "none",
      },
      h4: {
         fontFamily: theme.headerFontFamily || fontFamily,
         fontSize: theme.typographyH4FontSize || "1.5rem",
         fontWeight: theme.typographyH4FontWeight || 700,
         lineHeight: theme.typographyH4LineHeight || 1.375,
         letterSpacing: theme.typographyH4LetterSpacing || "0.00735em",
         textTransform: (theme.typographyH4TextTransform as "none" | "uppercase" | "lowercase" | "capitalize") || "none",
      },
      h5: {
         fontFamily: theme.headerFontFamily || fontFamily,
         fontSize: theme.typographyH5FontSize || "1.25rem",
         fontWeight: theme.typographyH5FontWeight || 700,
         lineHeight: theme.typographyH5LineHeight || 1.375,
         letterSpacing: theme.typographyH5LetterSpacing || "0em",
         textTransform: (theme.typographyH5TextTransform as "none" | "uppercase" | "lowercase" | "capitalize") || "none",
      },
      h6: {
         fontFamily: theme.headerFontFamily || fontFamily,
         fontSize: theme.typographyH6FontSize || "1.125rem",
         fontWeight: theme.typographyH6FontWeight || 500,
         lineHeight: theme.typographyH6LineHeight || 1.625,
         letterSpacing: theme.typographyH6LetterSpacing || "0.0075em",
         textTransform: (theme.typographyH6TextTransform as "none" | "uppercase" | "lowercase" | "capitalize") || "none",
      },
      body1: {
         fontFamily,
         fontSize: theme.typographyBody1FontSize || "1.25rem",
         fontWeight: theme.typographyBody1FontWeight || 400,
         lineHeight: theme.typographyBody1LineHeight || 1.625,
         letterSpacing: theme.typographyBody1LetterSpacing || "0.00938em",
      },
      body2: {
         fontFamily,
         fontSize: theme.typographyBody2FontSize || "1rem",
         fontWeight: theme.typographyBody2FontWeight || 300,
         lineHeight: theme.typographyBody2LineHeight || 1.6,
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
         fontWeight: theme.typographyCaptionFontWeight || 300,
         lineHeight: theme.typographyCaptionLineHeight || 1.25,
         letterSpacing: theme.typographyCaptionLetterSpacing || "0.03333em",
      },
   };
}

/*******************************************************************************
 ** Deep merge helper - merges objects recursively.
 ** Used to combine base component overrides with dynamic theme values.
 *******************************************************************************/
function deepMerge<T extends Record<string, unknown>>(target: T, source: Partial<T>): T
{
   const output = {...target} as Record<string, unknown>;
   for (const key of Object.keys(source))
   {
      const sourceVal = source[key];
      const targetVal = target[key];
      if (
         sourceVal &&
         typeof sourceVal === "object" &&
         !Array.isArray(sourceVal) &&
         targetVal &&
         typeof targetVal === "object" &&
         !Array.isArray(targetVal)
      )
      {
         output[key] = deepMerge(
            targetVal as Record<string, unknown>,
            sourceVal as Record<string, unknown>
         );
      }
      else if (sourceVal !== undefined)
      {
         output[key] = sourceVal;
      }
   }
   return output as T;
}

/*******************************************************************************
 ** Build MUI component overrides from QThemeMetaData.
 **
 ** Strategy: Import all 55 component override files as base styling, then apply
 ** dynamic theme values on top. This preserves the detailed styling work while
 ** allowing colors, spacing, and border-radius to be customized.
 **
 ** @param theme - merged theme metadata with defaults
 ** @param hasExplicitTheme - true if backend provided theme, false for unthemed apps
 *******************************************************************************/
function buildComponents(theme: QThemeMetaData, hasExplicitTheme: boolean): ThemeOptions["components"]
{
   /////////////////////////////////////////////////////////////////////////////
   // Border radius resolution: per-component ?? global ?? (default * scale) //
   /////////////////////////////////////////////////////////////////////////////
   const borderRadiusGlobal = parseBorderRadius(theme.borderRadius/*Global*/);
   const borderRadiusScale = /*theme.borderRadiusScale ??*/ 1.0;

   const resolveBorderRadius = (component: string, override: number | null) =>
      resolveComponentBorderRadius(override, borderRadiusGlobal, COMPONENT_DEFAULT_BORDER_RADIUS[component], borderRadiusScale);

   const borderRadiusButton = resolveBorderRadius("button", parseBorderRadius(theme.borderRadius/*Button*/));
   const borderRadiusCard = resolveBorderRadius("card", parseBorderRadius(theme.borderRadius/*Card*/));
   const borderRadiusChip = resolveBorderRadius("chip", parseBorderRadius(theme.borderRadius/*Chip*/));
   const borderRadiusDialog = resolveBorderRadius("dialog", parseBorderRadius(theme.borderRadius/*Dialog*/));
   const borderRadiusOutlinedInput = resolveBorderRadius("outlinedInput", parseBorderRadius(theme.borderRadius/*OutlinedInput*/));
   const borderRadiusLinearProgress = resolveBorderRadius("linearProgress", parseBorderRadius(theme.borderRadius/*LinearProgress*/));
   const borderRadiusMenuPaper = resolveBorderRadius("menuPaper", parseBorderRadius(theme.borderRadius/*MenuPaper*/));
   const borderRadiusPaperRounded = resolveBorderRadius("paperRounded", parseBorderRadius(theme.borderRadius/*PaperRounded*/));
   const borderRadiusPopoverPaper = resolveBorderRadius("popoverPaper", parseBorderRadius(theme.borderRadius/*PopoverPaper*/));
   const borderRadiusTooltip = resolveBorderRadius("tooltip", parseBorderRadius(theme.borderRadius/*Tooltip*/));

   const density = theme.density || "normal";
   const spacingUnit = DENSITY_SPACING[density] || 8;

   const primaryColor = theme.primaryColor || "#0062FF";
   const textPrimary = theme.textPrimary || "#212121";
   const textSecondary = theme.textSecondary || "#7b809a";
   const backgroundColor = theme.backgroundColor || "#f0f2f5";
   const surfaceColor = theme.surfaceColor || "#ffffff";
   const borderColor = theme.borderColor || "rgba(0, 0, 0, 0.12)";
   const dividerColor = theme.dividerColor || "rgba(0, 0, 0, 0.12)";

   /////////////////////////////////////////////////////////////////////////////
   // Base components from the 55 static files - preserves all detailed        //
   // styling like shadows, transitions, sizes, etc.                           //
   /////////////////////////////////////////////////////////////////////////////
   const baseComponents: ThemeOptions["components"] = {
      MuiCssBaseline: {
         styleOverrides: {
            ...globals,
            ...flatpickr,
            ...container,
         },
      },
      MuiDrawer: {...sidenav},
      MuiList: {...list},
      MuiListItem: {...listItem},
      MuiListItemText: {...listItemText},
      MuiCard: {...card},
      MuiCardMedia: {...cardMedia},
      MuiCardContent: {...cardContent},
      MuiButton: {...button},
      MuiIconButton: {...iconButton},
      MuiInput: {...input},
      MuiInputLabel: {...inputLabel},
      MuiOutlinedInput: {...inputOutlined},
      MuiTextField: {...textField},
      MuiMenu: {...menu},
      MuiMenuItem: {...menuItem},
      MuiSwitch: {...switchButton},
      MuiDivider: {...divider},
      MuiTableContainer: {...tableContainer},
      MuiTableHead: {...tableHead},
      MuiTableCell: {...tableCell},
      MuiLinearProgress: {...linearProgress},
      MuiBreadcrumbs: {...breadcrumbs},
      MuiSlider: {...slider},
      MuiAvatar: {...avatar},
      MuiTooltip: {...tooltip},
      MuiAppBar: {
         ...appBar,
         styleOverrides: {
            ...appBar.styleOverrides,
            root: {
               ...appBar.styleOverrides?.root,
               backgroundColor: "transparent",
            },
         },
      },
      MuiTabs: {...tabs},
      MuiTab: {...tab},
      MuiStepper: {...stepper},
      MuiStep: {...step},
      MuiStepConnector: {...stepConnector},
      MuiStepLabel: {...stepLabel},
      MuiStepIcon: {...stepIcon},
      MuiSelect: {...select},
      MuiFormControlLabel: {...formControlLabel},
      MuiFormLabel: {...formLabel},
      MuiCheckbox: {...checkbox},
      MuiRadio: {...radio},
      MuiAutocomplete: {...autocomplete},
      MuiPopover: {...popover},
      MuiButtonBase: {...buttonBase},
      MuiIcon: {...icon},
      MuiSvgIcon: {...svgIcon},
      MuiLink: {...link},
      MuiDialog: {...dialog},
      MuiDialogTitle: {...dialogTitle},
      MuiDialogContent: {...dialogContent},
      MuiDialogContentText: {...dialogContentText},
      MuiDialogActions: {...dialogActions},
   };

   /////////////////////////////////////////////////////////////////////////////
   // Dynamic overrides - theme-specific values that override the base         //
   // These are the properties that should change based on QThemeMetaData      //
   /////////////////////////////////////////////////////////////////////////////
   const dynamicOverrides: ThemeOptions["components"] = {
      MuiCssBaseline: {
         styleOverrides: {
            body: {
               backgroundColor,
               fontSize: theme.fontSizeBase || "14px",
            },
            "a.link, .link, a.link:link, .link:link, a.link:visited, .link:visited": {
               color: `${primaryColor} !important`,
            },
            "a.link:hover, .link:hover, a.link:focus, .link:focus": {
               color: `${primaryColor} !important`,
            },
         },
      },
      MuiButton: {
         styleOverrides: {
            root: {
               borderRadius: `${borderRadiusButton}px`,
               padding: `${spacingUnit}px ${spacingUnit * 2}px`,
            },
            containedPrimary: {
               backgroundColor: primaryColor,
               "&:hover": {
                  backgroundColor: primaryColor,
                  filter: "brightness(0.9)",
               },
            },
            outlinedPrimary: {
               borderColor: primaryColor,
               color: primaryColor,
               "&:hover": {
                  backgroundColor: `${primaryColor}10`,
               },
            },
            textPrimary: {
               color: primaryColor,
            },
         },
      },
      MuiCard: {
         styleOverrides: {
            root: {
               borderRadius: `${borderRadiusCard}px`,
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
               borderRadius: `${borderRadiusChip}px`,
            },
            colorPrimary: {
               backgroundColor: primaryColor,
            },
         },
      },
      MuiDialog: {
         styleOverrides: {
            paper: {
               borderRadius: `${borderRadiusDialog}px`,
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
            },
         },
      },
      MuiOutlinedInput: {
         styleOverrides: {
            root: {
               borderRadius: `${borderRadiusOutlinedInput}px`,
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
            },
         },
      },
      MuiLinearProgress: {
         styleOverrides: {
            root: {
               borderRadius: `${borderRadiusLinearProgress}px`,
            },
            bar: {
               borderRadius: `${borderRadiusLinearProgress}px`,
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
               borderRadius: `${borderRadiusMenuPaper}px`,
            },
         },
      },
      MuiPaper: {
         styleOverrides: {
            root: hasExplicitTheme
               ? {
                  //////////////////////////////////////////////////////////////////////////////////
                  // Only apply surfaceColor when a theme is explicitly provided.                 //
                  // Exclude AppBar - it handles its own background.                              //
                  // Exclude Alerts - they are designed to have a red/yellow/green/etc background //
                  //////////////////////////////////////////////////////////////////////////////////
                  "&:not(.MuiAppBar-root):not(.MuiAlert-root)": {
                     backgroundColor: surfaceColor,
                  },
               }
               : {},
            rounded: {
               borderRadius: `${borderRadiusPaperRounded}px`,
            },
         },
      },
      MuiPopover: {
         styleOverrides: {
            paper: {
               borderRadius: `${borderRadiusPopoverPaper}px`,
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
               borderBottomColor: primaryColor,
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
               borderRadius: `${borderRadiusTooltip}px`,
               padding: `${spacingUnit / 2}px ${spacingUnit}px`,
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

   /////////////////////////////////////////////////////////////////////////////
   // Merge base components with dynamic overrides                             //
   /////////////////////////////////////////////////////////////////////////////
   return deepMerge(
      baseComponents as Record<string, unknown>,
      dynamicOverrides as Record<string, unknown>
   ) as ThemeOptions["components"];
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
   const hasExplicitTheme = themeMetaData != null;

   const density = mergedTheme.density || "normal";
   const spacingUnit = DENSITY_SPACING[density] || 8;

   const themeOptions: ThemeOptions = {
      breakpoints: {...breakpoints},
      palette: buildPalette(mergedTheme),
      typography: buildTypography(mergedTheme),
      spacing: spacingUnit,
      shape: {
         borderRadius: resolveComponentBorderRadius(
            null,
            parseBorderRadius(mergedTheme.borderRadius/*Global*/),
            DEFAULT_SHAPE_BORDER_RADIUS,
            /*mergedTheme.borderRadiusScale ??*/ 1.0,
         ),
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
      components: buildComponents(mergedTheme, hasExplicitTheme),
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
