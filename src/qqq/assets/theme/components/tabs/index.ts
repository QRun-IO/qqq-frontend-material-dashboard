/**
 =========================================================
 * Material Dashboard 2 PRO React TS - v1.0.0
 =========================================================

 * Product Page: https://www.creative-tim.com/product/material-dashboard-2-pro-react-ts
 * Copyright 2022 Creative Tim (https://www.creative-tim.com)

 Coded by www.creative-tim.com

 =========================================================

 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 */

// Material Dashboard 2 PRO React TS Base Styles
import colors from "qqq/assets/theme/base/colors";

// Material Dashboard 2 PRO React TS Helper Functions
import pxToRem from "qqq/assets/theme/functions/pxToRem";

const {grey, white} = colors;

// types
type Types = any;

const tabs: Types = {
   styleOverrides: {
      root: {
         position: "relative",
         borderRadius: 0,
         borderBottom: "1px solid",
         borderBottomColor: grey[400],
         minHeight: "unset",
         padding: "0",
         margin: "0",
         "& button": {
            fontWeight: 500
         }
      },

      scroller: {
         marginLeft: "0.5rem"
      },

      flexContainer: {
         height: "100%",
         position: "relative",
         width: "fit-content",
         zIndex: 10,
      },

      fixed: {
         overflow: "unset !important",
         overflowX: "unset !important",
      },

      vertical: {
         "& .MuiTabs-indicator": {
            width: "100%",
         },
      },

      indicator: {
         height: "100%",
         borderRadius: 0,
         backgroundColor: white.main,
         borderBottom: "2px solid",
         borderBottomColor: colors.info.main,
         transition: "all 500ms ease",
      },
   },
};

export default tabs;
