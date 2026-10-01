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

import {QPossibleValue} from "@qrunio/qqq-frontend-core/lib/model/QPossibleValue";
import {QQueryFilter} from "@qrunio/qqq-frontend-core/lib/model/query/QQueryFilter";

/*******************************************************************************
 ** Properties attached to a (formik?) form field, to denote how it behaves as
 ** as related to a possible value source.
 *******************************************************************************/
export interface FieldPossibleValueProps
{
   isPossibleValue?: boolean;
   possibleValues?: QPossibleValue[];
   initialDisplayValue: string | null;
   fieldName?: string;
   tableName?: string;
   processName?: string;
   possibleValueSourceName?: string;
   possibleValueSourceFilter?: QQueryFilter;
   otherValues?: Map<string, any>;
}

