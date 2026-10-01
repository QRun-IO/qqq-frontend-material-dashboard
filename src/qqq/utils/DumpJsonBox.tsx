/*
 * QQQ - Low-code Application Framework for Engineers.
 * Copyright (C) 2021-2024.  Kingsrook, LLC
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


import Box from "@mui/material/Box";
import React from "react";

interface DumpJsonBoxProps
{
   data: any;
   title?: string;
}

/***************************************************************************
 ** Utillity for debugging an object as JSON
 ***************************************************************************/
export default function DumpJsonBox({data, title}: DumpJsonBoxProps): JSX.Element
{
   return (
      <Box border="1px solid gray" my="1rem" borderRadius="0.5rem">
         {
            title &&
            <Box borderBottom="1px solid gray" mb="0.5rem" px="0.25rem" borderRadius="0.5rem 0.5rem 0 0" fontSize="1rem" fontWeight="600kkk" sx={{backgroundColor: "#D0D0D0"}}>
               {title}
            </Box>
         }
         <Box maxHeight="200px" p="0.25rem" overflow="auto" sx={{whiteSpace: "pre-wrap", fontFamily: "monospace", fontSize: "0.75rem", lineHeight: "1.2"}}>
            {JSON.stringify(data, null, 3)}
         </Box>
      </Box>
   );
}
