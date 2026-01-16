/*
 * QQQ - Low-code Application Framework for Engineers.
 * Copyright (C) 2021-2022.  Kingsrook, LLC
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

import Box from "@mui/material/Box";
import Icon from "@mui/material/Icon";
import React from "react";
import {Link} from "react-router-dom";
import MDButton from "qqq/components/legacy/MDButton";


// eslint-disable import/prefer-default-export

export const standardWidth = "150px";

const standardML = {xs: 1, md: 3};

interface QCreateNewButtonProps
{
   tablePath: string;
}

export function QCreateNewButton({tablePath}: QCreateNewButtonProps): JSX.Element
{
   return (
      <Box display="inline-block" ml={standardML} mr={0} width={standardWidth}>
         <Link to={`${tablePath}/create`}>
            <MDButton variant="gradient" color="info" fullWidth startIcon={<Icon>add</Icon>}>
               Create New
            </MDButton>
         </Link>
      </Box>
   );
}

interface QSaveButtonProps
{
   label?: string;
   iconName?: string;
   onClickHandler?: any,
   disabled: boolean
}

QSaveButton.defaultProps = {
   label: "Save",
   iconName: "save"
};

export function QSaveButton({label, iconName, onClickHandler, disabled}: QSaveButtonProps): JSX.Element
{
   return (
      <Box ml={standardML} width={standardWidth}>
         <MDButton type="submit" variant="gradient" color="info" size="small" onClick={onClickHandler} fullWidth startIcon={<Icon>{iconName}</Icon>} disabled={disabled}>
            {label}
         </MDButton>
      </Box>
   );
}

interface QDeleteButtonProps
{
   onClickHandler: any;
   disabled?: boolean;
}

QDeleteButton.defaultProps = {
   disabled: false
};

export function QDeleteButton({onClickHandler, disabled}: QDeleteButtonProps): JSX.Element
{
   return (
      <Box ml={standardML} width={standardWidth}>
         <MDButton variant="gradient" color="primary" size="small" onClick={onClickHandler} fullWidth startIcon={<Icon>delete</Icon>} disabled={disabled}>
            Delete
         </MDButton>
      </Box>
   );
}

export function QEditButton(): JSX.Element
{
   return (
      <Box ml={standardML} width={standardWidth}>
         <Link to="edit">
            <MDButton variant="gradient" color="dark" size="small" fullWidth startIcon={<Icon>edit</Icon>}>
               Edit
            </MDButton>
         </Link>
      </Box>
   );
}

interface QActionsMenuButtonProps
{
   isOpen: boolean;
   onClickHandler: any;
}

export function QActionsMenuButton({isOpen, onClickHandler}: QActionsMenuButtonProps): JSX.Element
{
   return (
      <Box width={standardWidth} ml={1}>
         <MDButton
            variant={isOpen ? "contained" : "outlined"}
            color="dark"
            onClick={onClickHandler}
            startIcon={<Icon>games</Icon>}
            fullWidth
         >
            actions&nbsp;
            <Icon>keyboard_arrow_down</Icon>
         </MDButton>
      </Box>
   );
}

interface QCancelButtonProps
{
   onClickHandler: any;
   disabled: boolean;
   label?: string;
   iconName?: string;
}

export function QCancelButton({
   onClickHandler, disabled, label, iconName,
}: QCancelButtonProps): JSX.Element
{
   return (
      <Box ml={standardML} width={standardWidth}>
         <MDButton type="button" variant="outlined" color="dark" size="small" fullWidth startIcon={<Icon>{iconName}</Icon>} onClick={onClickHandler} disabled={disabled}>
            {label}
         </MDButton>
      </Box>
   );
}

QCancelButton.defaultProps = {
   label: "cancel",
   iconName: "cancel",
};

interface QSubmitButtonProps
{
   label?: string;
   iconName?: string;
   disabled: boolean;
}

export function QSubmitButton({label, iconName, disabled}: QSubmitButtonProps): JSX.Element
{
   return (
      <Box ml={standardML} width={standardWidth}>
         <MDButton type="submit" variant="gradient" color="dark" size="small" fullWidth startIcon={<Icon>{iconName}</Icon>} disabled={disabled}>
            {label}
         </MDButton>
      </Box>
   );
}

QSubmitButton.defaultProps = {
   label: "Submit",
   iconName: "check",
};

interface QAlternateButtonProps
{
   label: string,
   iconName?: string,
   disabled: boolean,
   onClick?: () => void
}

export function QAlternateButton({label, iconName, disabled, onClick}: QAlternateButtonProps): JSX.Element
{
   return (
      <Box ml={standardML} width={standardWidth}>
         <MDButton type="button" variant="gradient" color="secondary" size="small" fullWidth startIcon={iconName && <Icon>{iconName}</Icon>} onClick={onClick} disabled={disabled}>
            {label}
         </MDButton>
      </Box>
   );
}

QAlternateButton.defaultProps = {};
