/*
 * QQQ - Low-code Application Framework for Engineers.
 * Copyright (C) 2021-2022.  Kingsrook, LLC
 * 651 N Broad St Ste 205 # 6917 | Middletown DE 19709 | United States
 * contact@kingsrook.com
 * https://github.com/Kingsrook/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {createTheme} from "@mui/material";
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

export default createTheme({
   breakpoints: {...breakpoints},
   palette: {...colors},
   typography: {...typography},
   boxShadows: {...boxShadows},
   borders: {...borders},
   functions: {
      boxShadow,
      hexToRgb,
      linearGradient,
      pxToRem,
      rgba,
   },

   components: {
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
      MuiAppBar: {...appBar},
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
   },
});
