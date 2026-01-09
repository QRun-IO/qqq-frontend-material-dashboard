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
import borders from "qqq/assets/theme/base/borders";

// Material Dashboard 2 PRO React TS Helper Functions
import pxToRem from "qqq/assets/theme/functions/pxToRem";

const { transparent } = colors;
const { borderRadius } = borders;

// types
type Types = any;

const stepper: Types = {
  styleOverrides: {
    root: {
      background: "var(--qqq-stepper-background, linear-gradient(195deg, var(--qqq-primary-color), var(--qqq-primary-color-dark, var(--qqq-primary-color))))",
      padding: `${pxToRem(24)} 0 ${pxToRem(16)}`,
      borderRadius: borderRadius.lg,
      boxShadow: "var(--qqq-stepper-shadow, 0rem 0.25rem 1.25rem 0rem rgba(0, 0, 0, 0.14), 0rem 0.4375rem 0.625rem -0.3125rem rgba(0, 0, 0, 0.4))",

      "&.MuiPaper-root": {
        backgroundColor: transparent.main,
      },
    },
  },
};

export default stepper;
