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
import boxShadows from "qqq/assets/theme/base/boxShadows";

// Material Dashboard 2 PRO React TS Helper Functions
import pxToRem from "qqq/assets/theme/functions/pxToRem";

const { white, grey, transparent } = colors;
const { borderWidth } = borders;
const { md } = boxShadows;

// types
type Types = any;

const switchButton: Types = {
  defaultProps: {
    disableRipple: false,
  },

  styleOverrides: {
    switchBase: {
      color: "var(--qqq-switch-track-color, #42424a)",

      "&:hover": {
        backgroundColor: transparent.main,
      },

      "&.Mui-checked": {
        color: "var(--qqq-switch-track-color, #42424a)",

        "&:hover": {
          backgroundColor: transparent.main,
        },

        "& .MuiSwitch-thumb": {
          borderColor: "var(--qqq-switch-track-color, #42424a) !important",
        },

        "& + .MuiSwitch-track": {
          backgroundColor: "var(--qqq-switch-track-color, #42424a) !important",
          borderColor: "var(--qqq-switch-track-color, #42424a) !important",
          opacity: 1,
        },
      },

      "&.Mui-disabled + .MuiSwitch-track": {
        opacity: "0.3 !important",
      },

      "&.Mui-focusVisible .MuiSwitch-thumb": {
        backgroundImage: "linear-gradient(195deg, var(--qqq-info-color, #0062FF), var(--qqq-info-color, #0062FF))",
      },
    },

    thumb: {
      backgroundColor: white.main,
      boxShadow: md,
      border: `${borderWidth[1]} solid ${grey[400]}`,
    },

    track: {
      width: pxToRem(32),
      height: pxToRem(15),
      backgroundColor: grey[400],
      border: `${borderWidth[1]} solid ${grey[400]}`,
      opacity: 1,
    },

    checked: {},
  },
};

export default switchButton;
