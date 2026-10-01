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

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import React, {useContext} from "react";
import QContext from "QContext";
import MDTypography from "qqq/components/legacy/MDTypography";

interface Props
{
   label: string;
   url: string;
}

interface IframeProps
{
   iframe: string;
}

function Iframe({iframe}: IframeProps)
{
   return (<div dangerouslySetInnerHTML={{__html: iframe || ""}} />);
}

function QuickSightChart({label, url}: Props): JSX.Element
{
   const {accentColor} = useContext(QContext);

   const iframe = `<iframe style='border: 0 solid ${accentColor}; height: 411px; width: 99%' title=${label} src=${url} />`;

   return (
      <Card sx={{height: "100%"}}>
         <Box padding="1rem">
            <MDTypography variant="h5">{label}</MDTypography>
            <Iframe iframe={iframe} />
         </Box>
      </Card>
   );
}

export default QuickSightChart;
