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

/*******************************************************************************
 ** Meta-Data to define theme configuration in a Material Dashboard application.
 **
 *******************************************************************************/
export class MaterialDashboardThemeMetaData
{
   // Color palette
   primaryColor?: string;
   secondaryColor?: string;
   backgroundColor?: string;
   surfaceColor?: string;
   textPrimary?: string;
   textSecondary?: string;
   errorColor?: string;
   warningColor?: string;
   successColor?: string;
   infoColor?: string;
   preferInfoColorToPrimaryColor?: boolean;

   // Typography - Base
   fontFamily?: string;
   headerFontFamily?: string;
   monoFontFamily?: string;
   fontSizeBase?: string;
   fontWeightLight?: number;
   fontWeightRegular?: number;
   fontWeightMedium?: number;
   fontWeightBold?: number;

   // Typography - H1
   typographyH1FontSize?: string;
   typographyH1FontWeight?: number;
   typographyH1LineHeight?: number;
   typographyH1LetterSpacing?: string;
   typographyH1TextTransform?: string;

   // Typography - H2
   typographyH2FontSize?: string;
   typographyH2FontWeight?: number;
   typographyH2LineHeight?: number;
   typographyH2LetterSpacing?: string;
   typographyH2TextTransform?: string;

   // Typography - H3
   typographyH3FontSize?: string;
   typographyH3FontWeight?: number;
   typographyH3LineHeight?: number;
   typographyH3LetterSpacing?: string;
   typographyH3TextTransform?: string;

   // Typography - H4
   typographyH4FontSize?: string;
   typographyH4FontWeight?: number;
   typographyH4LineHeight?: number;
   typographyH4LetterSpacing?: string;
   typographyH4TextTransform?: string;

   // Typography - H5
   typographyH5FontSize?: string;
   typographyH5FontWeight?: number;
   typographyH5LineHeight?: number;
   typographyH5LetterSpacing?: string;
   typographyH5TextTransform?: string;

   // Typography - H6
   typographyH6FontSize?: string;
   typographyH6FontWeight?: number;
   typographyH6LineHeight?: number;
   typographyH6LetterSpacing?: string;
   typographyH6TextTransform?: string;

   // Typography - Body1
   typographyBody1FontSize?: string;
   typographyBody1FontWeight?: number;
   typographyBody1LineHeight?: number;
   typographyBody1LetterSpacing?: string;
   typographyBody1TextTransform?: string;

   // Typography - Body2
   typographyBody2FontSize?: string;
   typographyBody2FontWeight?: number;
   typographyBody2LineHeight?: number;
   typographyBody2LetterSpacing?: string;
   typographyBody2TextTransform?: string;

   // Typography - Button
   typographyButtonFontSize?: string;
   typographyButtonFontWeight?: number;
   typographyButtonLineHeight?: number;
   typographyButtonLetterSpacing?: string;
   typographyButtonTextTransform?: string;

   // Typography - Caption
   typographyCaptionFontSize?: string;
   typographyCaptionFontWeight?: number;
   typographyCaptionLineHeight?: number;
   typographyCaptionLetterSpacing?: string;
   typographyCaptionTextTransform?: string;

   // Sizing - Border Radius
   // borderRadiusGlobal: absolute px value applied uniformly to all components
   // borderRadiusScale: multiplier applied to each component's original default (default 1.0)
   // Resolution order: borderRadiusCard ?? borderRadiusGlobal ?? (componentDefault * borderRadiusScale)
   borderRadiusGlobal?: string;
   borderRadiusScale?: number;
   borderRadiusButton?: string;
   borderRadiusCard?: string;
   borderRadiusChip?: string;
   borderRadiusDialog?: string;
   borderRadiusOutlinedInput?: string;
   borderRadiusLinearProgress?: string;
   borderRadiusMenuPaper?: string;
   borderRadiusPaperRounded?: string;
   borderRadiusPopoverPaper?: string;
   borderRadiusTooltip?: string;
   density?: "compact" | "normal" | "comfortable";

   // Asset paths
   logoPath?: string;
   iconPath?: string;
   faviconPath?: string;

   // Custom CSS
   customCss?: string;

   // Icon style
   iconStyle?: "filled" | "outlined" | "rounded" | "sharp" | "two-tone";

   // Branded Header Bar
   brandedHeaderEnabled?: boolean;
   brandedHeaderBackgroundColor?: string;
   brandedHeaderTextColor?: string;
   brandedHeaderLogoPath?: string;
   brandedHeaderLogoAltText?: string;
   brandedHeaderHeight?: string;
   brandedHeaderTagline?: string;

   // App Bar
   appBarBackgroundColor?: string;
   appBarTextColor?: string;

   // Sidebar
   sidebarBackgroundColor?: string;
   sidebarTextColor?: string;
   sidebarIconColor?: string;
   sidebarSelectedBackgroundColor?: string;
   sidebarSelectedTextColor?: string;
   sidebarHoverBackgroundColor?: string;
   sidebarDividerColor?: string;

   // Tables
   tableHeaderBackgroundColor?: string;
   tableHeaderTextColor?: string;
   tableRowHoverColor?: string;
   tableRowSelectedColor?: string;
   tableBorderColor?: string;

   // General
   dividerColor?: string;
   borderColor?: string;
   cardBorderColor?: string;

   constructor(object: any)
   {
      // Color palette
      this.primaryColor = object.primaryColor;
      this.secondaryColor = object.secondaryColor;
      this.backgroundColor = object.backgroundColor;
      this.surfaceColor = object.surfaceColor;
      this.textPrimary = object.textPrimary;
      this.textSecondary = object.textSecondary;
      this.errorColor = object.errorColor;
      this.warningColor = object.warningColor;
      this.successColor = object.successColor;
      this.infoColor = object.infoColor;
      this.preferInfoColorToPrimaryColor = object.preferInfoColorToPrimaryColor;

      // Typography - Base
      this.fontFamily = object.fontFamily;
      this.headerFontFamily = object.headerFontFamily;
      this.monoFontFamily = object.monoFontFamily;
      this.fontSizeBase = object.fontSizeBase;
      this.fontWeightLight = object.fontWeightLight;
      this.fontWeightRegular = object.fontWeightRegular;
      this.fontWeightMedium = object.fontWeightMedium;
      this.fontWeightBold = object.fontWeightBold;

      // Typography - H1
      this.typographyH1FontSize = object.typographyH1FontSize;
      this.typographyH1FontWeight = object.typographyH1FontWeight;
      this.typographyH1LineHeight = object.typographyH1LineHeight;
      this.typographyH1LetterSpacing = object.typographyH1LetterSpacing;
      this.typographyH1TextTransform = object.typographyH1TextTransform;

      // Typography - H2
      this.typographyH2FontSize = object.typographyH2FontSize;
      this.typographyH2FontWeight = object.typographyH2FontWeight;
      this.typographyH2LineHeight = object.typographyH2LineHeight;
      this.typographyH2LetterSpacing = object.typographyH2LetterSpacing;
      this.typographyH2TextTransform = object.typographyH2TextTransform;

      // Typography - H3
      this.typographyH3FontSize = object.typographyH3FontSize;
      this.typographyH3FontWeight = object.typographyH3FontWeight;
      this.typographyH3LineHeight = object.typographyH3LineHeight;
      this.typographyH3LetterSpacing = object.typographyH3LetterSpacing;
      this.typographyH3TextTransform = object.typographyH3TextTransform;

      // Typography - H4
      this.typographyH4FontSize = object.typographyH4FontSize;
      this.typographyH4FontWeight = object.typographyH4FontWeight;
      this.typographyH4LineHeight = object.typographyH4LineHeight;
      this.typographyH4LetterSpacing = object.typographyH4LetterSpacing;
      this.typographyH4TextTransform = object.typographyH4TextTransform;

      // Typography - H5
      this.typographyH5FontSize = object.typographyH5FontSize;
      this.typographyH5FontWeight = object.typographyH5FontWeight;
      this.typographyH5LineHeight = object.typographyH5LineHeight;
      this.typographyH5LetterSpacing = object.typographyH5LetterSpacing;
      this.typographyH5TextTransform = object.typographyH5TextTransform;

      // Typography - H6
      this.typographyH6FontSize = object.typographyH6FontSize;
      this.typographyH6FontWeight = object.typographyH6FontWeight;
      this.typographyH6LineHeight = object.typographyH6LineHeight;
      this.typographyH6LetterSpacing = object.typographyH6LetterSpacing;
      this.typographyH6TextTransform = object.typographyH6TextTransform;

      // Typography - Body1
      this.typographyBody1FontSize = object.typographyBody1FontSize;
      this.typographyBody1FontWeight = object.typographyBody1FontWeight;
      this.typographyBody1LineHeight = object.typographyBody1LineHeight;
      this.typographyBody1LetterSpacing = object.typographyBody1LetterSpacing;
      this.typographyBody1TextTransform = object.typographyBody1TextTransform;

      // Typography - Body2
      this.typographyBody2FontSize = object.typographyBody2FontSize;
      this.typographyBody2FontWeight = object.typographyBody2FontWeight;
      this.typographyBody2LineHeight = object.typographyBody2LineHeight;
      this.typographyBody2LetterSpacing = object.typographyBody2LetterSpacing;
      this.typographyBody2TextTransform = object.typographyBody2TextTransform;

      // Typography - Button
      this.typographyButtonFontSize = object.typographyButtonFontSize;
      this.typographyButtonFontWeight = object.typographyButtonFontWeight;
      this.typographyButtonLineHeight = object.typographyButtonLineHeight;
      this.typographyButtonLetterSpacing = object.typographyButtonLetterSpacing;
      this.typographyButtonTextTransform = object.typographyButtonTextTransform;

      // Typography - Caption
      this.typographyCaptionFontSize = object.typographyCaptionFontSize;
      this.typographyCaptionFontWeight = object.typographyCaptionFontWeight;
      this.typographyCaptionLineHeight = object.typographyCaptionLineHeight;
      this.typographyCaptionLetterSpacing = object.typographyCaptionLetterSpacing;
      this.typographyCaptionTextTransform = object.typographyCaptionTextTransform;

      // Sizing - Border Radius
      this.borderRadiusGlobal = object.borderRadiusGlobal ?? object.borderRadius; // backwards compat
      this.borderRadiusScale = object.borderRadiusScale;
      this.borderRadiusButton = object.borderRadiusButton;
      this.borderRadiusCard = object.borderRadiusCard;
      this.borderRadiusChip = object.borderRadiusChip;
      this.borderRadiusDialog = object.borderRadiusDialog;
      this.borderRadiusOutlinedInput = object.borderRadiusOutlinedInput;
      this.borderRadiusLinearProgress = object.borderRadiusLinearProgress;
      this.borderRadiusMenuPaper = object.borderRadiusMenuPaper;
      this.borderRadiusPaperRounded = object.borderRadiusPaperRounded;
      this.borderRadiusPopoverPaper = object.borderRadiusPopoverPaper;
      this.borderRadiusTooltip = object.borderRadiusTooltip;
      this.density = object.density;

      // Asset paths
      this.logoPath = object.logoPath;
      this.iconPath = object.iconPath;
      this.faviconPath = object.faviconPath;

      // Custom CSS
      this.customCss = object.customCss;

      // Icon style
      this.iconStyle = object.iconStyle;

      // Branded Header Bar
      this.brandedHeaderEnabled = object.brandedHeaderEnabled;
      this.brandedHeaderBackgroundColor = object.brandedHeaderBackgroundColor;
      this.brandedHeaderTextColor = object.brandedHeaderTextColor;
      this.brandedHeaderLogoPath = object.brandedHeaderLogoPath;
      this.brandedHeaderLogoAltText = object.brandedHeaderLogoAltText;
      this.brandedHeaderHeight = object.brandedHeaderHeight;
      this.brandedHeaderTagline = object.brandedHeaderTagline;

      // App Bar
      this.appBarBackgroundColor = object.appBarBackgroundColor;
      this.appBarTextColor = object.appBarTextColor;

      // Sidebar
      this.sidebarBackgroundColor = object.sidebarBackgroundColor;
      this.sidebarTextColor = object.sidebarTextColor;
      this.sidebarIconColor = object.sidebarIconColor;
      this.sidebarSelectedBackgroundColor = object.sidebarSelectedBackgroundColor;
      this.sidebarSelectedTextColor = object.sidebarSelectedTextColor;
      this.sidebarHoverBackgroundColor = object.sidebarHoverBackgroundColor;
      this.sidebarDividerColor = object.sidebarDividerColor;

      // Tables
      this.tableHeaderBackgroundColor = object.tableHeaderBackgroundColor;
      this.tableHeaderTextColor = object.tableHeaderTextColor;
      this.tableRowHoverColor = object.tableRowHoverColor;
      this.tableRowSelectedColor = object.tableRowSelectedColor;
      this.tableBorderColor = object.tableBorderColor;

      // General
      this.dividerColor = object.dividerColor;
      this.borderColor = object.borderColor;
      this.cardBorderColor = object.cardBorderColor;
   }
}
