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
import {QFieldType} from "@qrunio/qqq-frontend-core/lib/model/metaData/QFieldType";
import {Expression} from "qqq/components/query/CriteriaDateField";
import ValueUtils from "qqq/utils/qqq/ValueUtils";
import React, {useEffect, useState} from "react";

/*******************************************************************************
 ** Helper component to show value inside tooltips that ticks up every second.
 ** Without this, changing state on the higher-level component caused the tooltip to flicker.
 *******************************************************************************/
interface EvaluatedExpressionProps
{
   field: QFieldMetaData;
   expression: any;
}


export function EvaluatedExpression({field, expression}: EvaluatedExpressionProps)
{
   const [timeForEvaluations, setTimeForEvaluations] = useState(new Date());

   useEffect(() =>
   {
      const interval = setInterval(() =>
      {
         setTimeForEvaluations(new Date());
      }, 1000);

      return () => clearInterval(interval);
   }, []);

   return <span style={{fontVariantNumeric: "tabular-nums"}}>{`${evaluateExpression(timeForEvaluations, field, expression)}`}</span>;
}

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;
const evaluateExpression = (time: Date, field: QFieldMetaData, expression: Expression): string =>
{
   if (expression.type == "FilterVariableExpression")
   {
      return (expression.toString());
   }

   let rs: Date = null;
   if (expression.type == "NowWithOffset")
   {
      rs = time;
      let amount = Number(expression.amount);
      switch (expression.timeUnit)
      {
         case "MINUTES":
         {
            amount = amount * 60 * 1000;
            break;
         }
         case "HOURS":
         {
            amount = amount * HOUR_MS;
            break;
         }
         case "DAYS":
         {
            amount = amount * DAY_MS;
            break;
         }
         case "YEARS":
         {
            amount = amount * 365 * DAY_MS;
            break;
         }
         default:
         {
            console.log("Unrecognized time unit: " + expression.timeUnit);
         }
      }

      if (expression.operator == "MINUS")
      {
         amount = -amount;
      }

      rs.setTime(rs.getTime() + amount);

      if (expression.timeUnit == "YEARS")
      {
         //////////////////////
         // handle leap year //
         //////////////////////
         const today = time;
         while (today.getDate() != rs.getDate())
         {
            rs.setTime(rs.getTime() - DAY_MS);
         }
      }
   }
   else if (expression.type == "Now")
   {
      rs = time;
   }
   else if (expression.type == "ThisOrLastPeriod")
   {
      rs = time;
      rs.setSeconds(0);
      rs.setMinutes(0);
      if (expression.timeUnit == "HOURS")
      {
         if (expression.operator == "LAST")
         {
            rs.setTime(rs.getTime() - HOUR_MS);
         }
      }
      else
      {
         rs.setHours(0);
         if (expression.timeUnit == "DAYS")
         {
            if (expression.operator == "LAST")
            {
               rs.setTime(rs.getTime() - DAY_MS);
            }
         }
         else if (expression.timeUnit == "WEEKS")
         {
            while (rs.getDay() != 0)
            {
               rs.setTime(rs.getTime() - DAY_MS);
            }

            if (expression.operator == "LAST")
            {
               rs.setTime(rs.getTime() - 7 * DAY_MS);
            }
         }
         else if (expression.timeUnit == "MONTHS")
         {
            rs.setDate(1);

            if (expression.operator == "LAST")
            {
               rs.setTime(rs.getTime() - DAY_MS);
               rs.setDate(1);
            }
         }
         else if (expression.timeUnit == "YEARS")
         {
            rs.setDate(1);
            rs.setMonth(0);

            if (expression.operator == "LAST")
            {
               rs.setTime(rs.getTime() - 365 * DAY_MS);
            }
         }
      }
   }

   if (rs)
   {
      if (field.type == QFieldType.DATE)
      {
         return (ValueUtils.formatDate(rs));
      }
      else
      {
         return (ValueUtils.formatDateTime(rs));
      }
   }

   return null;
};



