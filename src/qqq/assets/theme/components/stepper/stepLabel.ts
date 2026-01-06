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
import typography from "qqq/assets/theme/base/typography";

// Material Dashboard 2 PRO React TS Helper Functions
import pxToRem from "qqq/assets/theme/functions/pxToRem";

const { size, fontWeightRegular } = typography;

// types
type Types = any;

const stepLabel: Types = {
  styleOverrides: {
    label: {
      marginTop: `${pxToRem(8)} !important`,
      fontWeight: fontWeightRegular,
      fontSize: size.xs,
      color: "var(--qqq-stepper-inactive-color, rgba(255, 255, 255, 0.5))",
      textTransform: "uppercase",

      "&.Mui-active": {
        fontWeight: `${fontWeightRegular} !important`,
        color: "var(--qqq-stepper-active-color, rgba(255, 255, 255, 0.9)) !important",
      },

      "&.Mui-completed": {
        fontWeight: `${fontWeightRegular} !important`,
        color: "var(--qqq-stepper-active-color, rgba(255, 255, 255, 0.9)) !important",
      },
    },
  },
};

export default stepLabel;
