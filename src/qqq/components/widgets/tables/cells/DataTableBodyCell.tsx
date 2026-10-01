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

import {Box} from "@mui/material";
import {Theme} from "@mui/material/styles";
import colors from "qqq/assets/theme/base/colors";
import {ReactNode} from "react";

// Declaring prop types for DataTableBodyCell
interface Props
{
   children: ReactNode;
   noBorder?: boolean;
   align?: "left" | "right" | "center";
   sx?: any;
}

function DataTableBodyCell({noBorder, align, sx, children}: Props): JSX.Element
{
   return (
      <Box
         component="div"
         textAlign={align}
         py={1.5}
         px={1.5}
         sx={({palette: {light}, typography: {size}, borders: {borderWidth}}: Theme) => ({
            borderBottom: noBorder ? "none" : `${borderWidth[1]} solid ${colors.grayLines.main}`,
            fontSize: "0.875rem",
            "@media (min-width: 1440px)": {
               fontSize: "1rem"
            },
            "@media (max-width: 1440px)": {
               fontSize: "0.875rem"
            },
            "&:nth-of-type(1)": {
               paddingLeft: "1rem"
            },
            "&:last-child": {
               paddingRight: "1rem"
            }, ...sx
         })}
      >
         <Box
            display="initial"
            width="max-content"
            color={colors.dark.main}
         >
            {children}
         </Box>
      </Box>
   );
}

// Declaring default props for DataTableBodyCell
DataTableBodyCell.defaultProps = {
   noBorder: false,
   align: "left",
   sx: {}
};

export default DataTableBodyCell;
