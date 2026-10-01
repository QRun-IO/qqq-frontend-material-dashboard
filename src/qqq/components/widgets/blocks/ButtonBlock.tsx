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
import Icon from "@mui/material/Icon";
import {standardWidth} from "qqq/components/buttons/DefaultButtons";
import MDButton from "qqq/components/legacy/MDButton";
import BlockElementWrapper from "qqq/components/widgets/blocks/BlockElementWrapper";
import {StandardBlockComponentProps} from "qqq/components/widgets/blocks/BlockModels";
import React from "react";


/*******************************************************************************
 ** Block that renders ... a button...
 **
 *******************************************************************************/
export default function ButtonBlock({widgetMetaData, data, actionCallback}: StandardBlockComponentProps): JSX.Element
{
   const startIcon = data.values.startIcon?.name ? <Icon>{data.values.startIcon.name}</Icon> : null;
   const endIcon = data.values.endIcon?.name ? <Icon>{data.values.endIcon.name}</Icon> : null;

   function onClick()
   {
      if (actionCallback)
      {
         actionCallback(data, data.values);
      }
      else
      {
         console.log("ButtonBlock onClick with no actionCallback present, so, noop");
      }
   }

   let buttonVariant: "gradient" | "outlined" | "text" = "gradient";
   if (data.styles?.format == "outlined")
   {
      buttonVariant = "outlined";
   }
   else if (data.styles?.format == "text")
   {
      buttonVariant = "text";
   }
   else if (data.styles?.format == "filled")
   {
      buttonVariant = "gradient";
   }

   // todo - button colors... but to do RGB's, might need to move away from MDButton?

   return (
      <BlockElementWrapper metaData={widgetMetaData} data={data} slot="">
         <Box mx={1} my={1} minWidth={standardWidth}>
            <MDButton
               type="button"
               variant={buttonVariant}
               color="dark"
               size="small"
               fullWidth
               startIcon={startIcon}
               endIcon={endIcon}
               onClick={onClick}
            >
               {data.values.label ?? "Button"}
            </MDButton>
         </Box>
      </BlockElementWrapper>
   );
}
