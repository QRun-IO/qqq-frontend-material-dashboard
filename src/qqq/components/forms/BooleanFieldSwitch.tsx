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

import {Box, InputLabel} from "@mui/material";
import Stack from "@mui/material/Stack";
import {styled} from "@mui/material/styles";
import Switch from "@mui/material/Switch";
import Typography from "@mui/material/Typography";
import {useFormikContext} from "formik";
import React, {SyntheticEvent} from "react";
import colors from "qqq/assets/theme/base/colors";

const AntSwitch = styled(Switch)(({theme}) => ({
   width: 32,
   height: 20,
   padding: 0,
   display: "flex",
   "&:active": {
      "& .MuiSwitch-thumb": {
         width: 15,
      },
      "& .MuiSwitch-switchBase.Mui-checked": {
         transform: "translateX(9px)",
      },
   },
   "& .MuiSwitch-switchBase": {
      padding: 2,
      "&.Mui-checked": {
         transform: "translateX(12px)",
         color: "#fff",
         "& + .MuiSwitch-track": {
            opacity: 1,
            backgroundColor: theme.palette.mode === "dark" ? "#177ddc" : "#1890ff",
         },
      },
   },
   "& .MuiSwitch-thumb": {
      boxShadow: "0 2px 4px 0 rgb(0 35 11 / 20%)",
      width: 16,
      height: 16,
      borderRadius: 8,
      transition: theme.transitions.create([ "width" ], {
         duration: 200,
      }),
   },
   "&.nullSwitch .MuiSwitch-thumb": {
      width: 28,
   },
   "& .MuiSwitch-track": {
      height: 20,
      borderRadius: 20 / 2,
      opacity: 1,
      backgroundColor:
         theme.palette.mode === "dark" ? "rgba(255,255,255,.35)" : "rgba(0,0,0,.25)",
      boxSizing: "border-box",
   },
}));

interface Props
{
   name: string;
   label: string;
   value: boolean;
   isDisabled: boolean;
   onChangeCallback?: (newValue: any) => void;
}



function BooleanFieldSwitch({name, label, value, isDisabled, onChangeCallback}: Props) : JSX.Element
{
   const {setFieldValue} = useFormikContext();

   const setSwitch = (event: SyntheticEvent, newValue: boolean) =>
   {
      if(!isDisabled)
      {
         setFieldValue(name, newValue);
         if(onChangeCallback)
         {
            onChangeCallback(newValue);
         }
         event.stopPropagation();
      }
   }

   const toggleSwitch = () =>
   {
      setFieldValue(name, !value);
      if(onChangeCallback)
      {
         onChangeCallback(!value);
      }
   }

   const classNullSwitch = (value === null || value == undefined || `${value}` == "") ? "nullSwitch" : "";

   return (
      <Box bgcolor={isDisabled ? colors.grey[200] : ""}>
         <InputLabel shrink={true}>{label}</InputLabel>
         <Stack direction="row" spacing={1} alignItems="center" height="37px">
            <Typography
               fontSize="1rem"
               color={value === false ? "auto" : "#bfbfbf" }
               onClick={(e) => setSwitch(e, false)}
               sx={{cursor: value === false || isDisabled ? "inherit" : "pointer"}}>
         No
            </Typography>
            <AntSwitch className={classNullSwitch} name={name} checked={value} onClick={toggleSwitch} disabled={isDisabled} />
            <Typography
               fontSize="1rem"
               color={value === true ? "auto" : "#bfbfbf"}
               onClick={(e) => setSwitch(e, true)}
               sx={{cursor: value === true || isDisabled ? "inherit" : "pointer"}}>
         Yes
            </Typography>
         </Stack>
      </Box>
   );
}

export default BooleanFieldSwitch
