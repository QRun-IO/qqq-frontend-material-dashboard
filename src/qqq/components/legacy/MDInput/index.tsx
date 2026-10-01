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
