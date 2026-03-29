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

import {describe, it, expect} from "@jest/globals";
import {MaterialDashboardThemeMetaData} from "./MaterialDashboardThemeMetaData";

describe("MaterialDashboardThemeMetaData", () =>
{
   describe("constructor", () =>
   {
      it("should construct with all properties from object", () =>
      {
         const theme = new MaterialDashboardThemeMetaData({
            primaryColor: "#FF0000",
            secondaryColor: "#00FF00",
            backgroundColor: "#0000FF",
            surfaceColor: "#FFFFFF",
            textPrimary: "#000000",
            textSecondary: "#666666",
            errorColor: "#FF0000",
            warningColor: "#FFA500",
            successColor: "#00FF00",
            infoColor: "#0000FF",
            fontFamily: "Roboto",
            headerFontFamily: "Open Sans",
            borderRadius: "8px",
            density: "compact",
            logoPath: "/assets/logo.svg",
            iconPath: "/assets/icon.svg",
            faviconPath: "/assets/favicon.ico",
            customCss: "body { margin: 0; }",
            iconStyle: "outlined"
         });

         expect(theme.primaryColor).toBe("#FF0000");
         expect(theme.secondaryColor).toBe("#00FF00");
         expect(theme.backgroundColor).toBe("#0000FF");
         expect(theme.surfaceColor).toBe("#FFFFFF");
         expect(theme.textPrimary).toBe("#000000");
         expect(theme.textSecondary).toBe("#666666");
         expect(theme.errorColor).toBe("#FF0000");
         expect(theme.warningColor).toBe("#FFA500");
         expect(theme.successColor).toBe("#00FF00");
         expect(theme.infoColor).toBe("#0000FF");
         expect(theme.fontFamily).toBe("Roboto");
         expect(theme.headerFontFamily).toBe("Open Sans");
         expect(theme.borderRadius).toBe("8px");
         expect(theme.density).toBe("compact");
         expect(theme.logoPath).toBe("/assets/logo.svg");
         expect(theme.iconPath).toBe("/assets/icon.svg");
         expect(theme.faviconPath).toBe("/assets/favicon.ico");
         expect(theme.customCss).toBe("body { margin: 0; }");
         expect(theme.iconStyle).toBe("outlined");
      });

      it("should handle empty object", () =>
      {
         const theme = new MaterialDashboardThemeMetaData({});

         expect(theme.primaryColor).toBeUndefined();
         expect(theme.secondaryColor).toBeUndefined();
         expect(theme.backgroundColor).toBeUndefined();
         expect(theme.surfaceColor).toBeUndefined();
         expect(theme.textPrimary).toBeUndefined();
         expect(theme.textSecondary).toBeUndefined();
         expect(theme.errorColor).toBeUndefined();
         expect(theme.warningColor).toBeUndefined();
         expect(theme.successColor).toBeUndefined();
         expect(theme.infoColor).toBeUndefined();
         expect(theme.fontFamily).toBeUndefined();
         expect(theme.headerFontFamily).toBeUndefined();
         expect(theme.borderRadius).toBeUndefined();
         expect(theme.density).toBeUndefined();
         expect(theme.logoPath).toBeUndefined();
         expect(theme.iconPath).toBeUndefined();
         expect(theme.faviconPath).toBeUndefined();
         expect(theme.customCss).toBeUndefined();
         expect(theme.iconStyle).toBeUndefined();
      });

      it("should handle partial object", () =>
      {
         const theme = new MaterialDashboardThemeMetaData({
            primaryColor: "#FF0000",
            density: "normal"
         });

         expect(theme.primaryColor).toBe("#FF0000");
         expect(theme.density).toBe("normal");
         expect(theme.secondaryColor).toBeUndefined();
         expect(theme.iconStyle).toBeUndefined();
      });
   });

   describe("density type", () =>
   {
      it("should accept compact density", () =>
      {
         const theme = new MaterialDashboardThemeMetaData({density: "compact"});
         expect(theme.density).toBe("compact");
      });

      it("should accept normal density", () =>
      {
         const theme = new MaterialDashboardThemeMetaData({density: "normal"});
         expect(theme.density).toBe("normal");
      });

      it("should accept comfortable density", () =>
      {
         const theme = new MaterialDashboardThemeMetaData({density: "comfortable"});
         expect(theme.density).toBe("comfortable");
      });
   });

   describe("iconStyle type", () =>
   {
      it("should accept filled iconStyle", () =>
      {
         const theme = new MaterialDashboardThemeMetaData({iconStyle: "filled"});
         expect(theme.iconStyle).toBe("filled");
      });

      it("should accept outlined iconStyle", () =>
      {
         const theme = new MaterialDashboardThemeMetaData({iconStyle: "outlined"});
         expect(theme.iconStyle).toBe("outlined");
      });

      it("should accept rounded iconStyle", () =>
      {
         const theme = new MaterialDashboardThemeMetaData({iconStyle: "rounded"});
         expect(theme.iconStyle).toBe("rounded");
      });

      it("should accept sharp iconStyle", () =>
      {
         const theme = new MaterialDashboardThemeMetaData({iconStyle: "sharp"});
         expect(theme.iconStyle).toBe("sharp");
      });

      it("should accept two-tone iconStyle", () =>
      {
         const theme = new MaterialDashboardThemeMetaData({iconStyle: "two-tone"});
         expect(theme.iconStyle).toBe("two-tone");
      });
   });

   describe("color properties", () =>
   {
      it("should handle hex color formats", () =>
      {
         const theme = new MaterialDashboardThemeMetaData({
            primaryColor: "#F00",
            secondaryColor: "#00FF00",
            errorColor: "#FF0000FF"
         });

         expect(theme.primaryColor).toBe("#F00");
         expect(theme.secondaryColor).toBe("#00FF00");
         expect(theme.errorColor).toBe("#FF0000FF");
      });
   });

   describe("asset paths", () =>
   {
      it("should handle various path formats", () =>
      {
         const theme = new MaterialDashboardThemeMetaData({
            logoPath: "/assets/logo.svg",
            iconPath: "https://example.com/icon.png",
            faviconPath: "./favicon.ico"
         });

         expect(theme.logoPath).toBe("/assets/logo.svg");
         expect(theme.iconPath).toBe("https://example.com/icon.png");
         expect(theme.faviconPath).toBe("./favicon.ico");
      });
   });

   describe("customCss", () =>
   {
      it("should handle multi-line CSS", () =>
      {
         const css = `
            body {
               margin: 0;
               padding: 0;
            }
            .custom-class {
               color: red;
            }
         `;
         const theme = new MaterialDashboardThemeMetaData({customCss: css});

         expect(theme.customCss).toBe(css);
      });
   });
});
