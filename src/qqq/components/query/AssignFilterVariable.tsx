/*
 * QQQ - Low-code Application Framework for Engineers.
 * Copyright (C) 2021-2023.  Kingsrook, LLC
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

import {QFieldMetaData} from "@qrunio/qqq-frontend-core/lib/model/metaData/QFieldMetaData";
import {FilterVariableExpression} from "@qrunio/qqq-frontend-core/lib/model/query/FilterVariableExpression";
import Box from "@mui/material/Box";
import Icon from "@mui/material/Icon";
import Tooltip from "@mui/material/Tooltip";
import {preferredColorNameInfoOrPrimary} from "qqq/assets/theme/functions/preferInfoColorToPrimaryColor";
import CriteriaDateField from "qqq/components/query/CriteriaDateField";
import React, {SyntheticEvent, useState} from "react";


export type Expression = FilterVariableExpression;


interface AssignFilterButtonProps
{
   valueIndex: number;
   field: QFieldMetaData;
   valueChangeHandler: (event: React.ChangeEvent | SyntheticEvent, valueIndex?: number | "all", newValue?: any) => void;
}

CriteriaDateField.defaultProps = {
   valueIndex: 0,
   label: "Value",
   idPrefix: "value-"
};

export default function AssignFilterVariable({valueIndex, field, valueChangeHandler}: AssignFilterButtonProps): JSX.Element
{
   const [isValueAVariable, setIsValueAVariable] = useState(false);

   const handleVariableButtonOnClick = () =>
   {
      setIsValueAVariable(!isValueAVariable);
      const expression = new FilterVariableExpression({fieldName: field.name, valueIndex: valueIndex});
      valueChangeHandler(null, valueIndex, expression);
   };

   return <Box display="flex" alignItems="flex-end">
      <Box>
         <Tooltip title={`Use a variable as the value for the ${field.label} field`} placement="bottom">
            <Icon fontSize="small" color={preferredColorNameInfoOrPrimary()} sx={{mx: 0.25, cursor: "pointer", position: "relative", top: "2px"}} onClick={handleVariableButtonOnClick}>functions</Icon>
         </Tooltip>
      </Box>
   </Box>;
}

