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

// Material Dashboard 2 PRO React TS Helper Functions
import pxToRem from "qqq/assets/theme/functions/pxToRem";

// types
type Types = any;

const stepIcon: Types = {
  styleOverrides: {
    root: {
      background: "var(--qqq-stepper-inactive-color, rgba(255, 255, 255, 0.5))",
      fill: "var(--qqq-stepper-inactive-color, rgba(255, 255, 255, 0.5))",
      stroke: "var(--qqq-stepper-inactive-color, rgba(255, 255, 255, 0.5))",
      strokeWidth: pxToRem(10),
      width: pxToRem(13),
      height: pxToRem(13),
      borderRadius: "50%",
      zIndex: 99,
      transition: "all 200ms linear",

      "&.Mui-active": {
        background: "var(--qqq-stepper-active-color, #ffffff)",
        fill: "var(--qqq-stepper-active-color, #ffffff)",
        stroke: "var(--qqq-stepper-active-color, #ffffff)",
        borderColor: "var(--qqq-stepper-active-color, #ffffff)",
        boxShadow: "0rem 0rem 0rem 0.125rem var(--qqq-stepper-active-color, #ffffff)",
      },

      "&.Mui-completed": {
        background: "var(--qqq-stepper-active-color, #ffffff)",
        fill: "var(--qqq-stepper-active-color, #ffffff)",
        stroke: "var(--qqq-stepper-active-color, #ffffff)",
        borderColor: "var(--qqq-stepper-active-color, #ffffff)",
        boxShadow: "0rem 0rem 0rem 0.125rem var(--qqq-stepper-active-color, #ffffff)",
      },
    },
  },
};

export default stepIcon;
