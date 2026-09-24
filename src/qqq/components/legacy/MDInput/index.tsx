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

import {OutlinedTextFieldProps, StandardTextFieldProps} from "@mui/material";
import {FC, forwardRef} from "react";
import MDInputRoot from "qqq/components/legacy/MDInput/MDInputRoot";

interface Props extends Omit<OutlinedTextFieldProps | StandardTextFieldProps, "variant"> {
  variant?: "standard" | "outlined";
  error?: boolean;
  success?: boolean;
  disabled?: boolean;
}

const MDInput: FC<Props | any> = forwardRef(({error, success, disabled, ...rest}, ref) => (
   <MDInputRoot {...rest} ref={ref} disabled={disabled} ownerState={{error, success, disabled}} />
));

// Declaring default props for MDInput
MDInput.defaultProps = {
   error: false,
   success: false,
   disabled: false,
};

export default MDInput;
