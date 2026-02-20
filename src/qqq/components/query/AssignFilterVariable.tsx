/*
 * QQQ - Low-code Application Framework for Engineers.
 * Copyright (C) 2021-2023.  Kingsrook, LLC
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

