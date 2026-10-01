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

// Declaring props types for ProductCell
import Box from "@mui/material/Box";
import React from "react";
import MDTypography from "qqq/components/legacy/MDTypography";

interface Props
{
   imageUrl: string;
   label: string;
   total?: string | number;
   totalType?: string;
}

function ImageCell({imageUrl, label, total, totalType}: Props): JSX.Element
{
   return (
      <Box display="flex" alignItems="center" pr={2}>
         <Box sx={{width: "50px"}} mr={2}>
            {
               imageUrl && imageUrl !== "" && (
                  <img src={imageUrl} alt={label} />
               )
            }
         </Box>
         <Box display="flex" flexDirection="column">
            <MDTypography variant="button" fontWeight="medium">
               {label}
            </MDTypography>
            <MDTypography variant="button" fontWeight="regular" color="secondary">
               <MDTypography component="span" variant="button" fontWeight="regular" color="success">
                  {total}
               </MDTypography>{" "}
               {totalType}
            </MDTypography>
         </Box>
      </Box>
   );
}

export default ImageCell;
