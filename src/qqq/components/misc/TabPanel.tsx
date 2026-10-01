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

import {Typography} from "@mui/material";
import Box from "@mui/material/Box";
import React from "react";

interface TabPanelProps
{
   children?: React.ReactNode;
   index: number;
   value: number;
   style?: any;
}

export default function TabPanel(props: TabPanelProps)
{
   const {children, value, index, style, ...other} = props;

   return (
      <div
         role="tabpanel"
         hidden={value !== index}
         id={`simple-tabpanel-${index}`}
         aria-labelledby={`simple-tab-${index}`}
         style={style}
         {...other}
      >
         {value === index && (
            <Box>
               <Typography>{children}</Typography>
            </Box>
         )}
      </div>
   );
}


