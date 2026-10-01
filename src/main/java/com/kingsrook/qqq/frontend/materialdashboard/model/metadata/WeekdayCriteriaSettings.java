/*
 * QQQ - Low-code Application Framework for Engineers.
 * Copyright (C) 2021-2026.  Kingsrook, LLC
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

package com.kingsrook.qqq.frontend.materialdashboard.model.metadata;


import java.io.Serializable;
import java.util.HashMap;
import java.util.Map;


/*******************************************************************************
 * Material dashboard instance metadata settings - to control weekday criteria
 * on date & date-time fields.  e.g., day-is-any-of or day-is-non-eof.
 *
 * <p>These criteria are on by default - but this object can turn them off with
 * the {@code enabled} setting.</p>
 *
 * <p>Also - since how time zones should apply can be a hotly contested issue,
 * values for the parameters supported by QQQ's {@code WeekdayOfDateTimeFunction}
 * can be set as {@code dateTimeFieldFunctionArguments}</p>
 *
 * <p>e.g., to always use US/Central time:
 * <pre>
new WeekdayCriteriaSettings().withDateTimeFieldFunctionArguments(
   Map.of(WeekdayOfDateTimeFunction.PARAM_TIME_ZONE_ID, "US/Central")));</pre></p>
 *
 * <p>or to use user/session time zone:
 * <pre>
 new WeekdayCriteriaSettings().withDateTimeFieldFunctionArguments(
    Map.of(WeekdayOfDateTimeFunction.PARAM_USE_SESSION_ZONE_ID, true)));</pre></p>
 *******************************************************************************/
public class WeekdayCriteriaSettings implements Serializable, Cloneable
{
   private Boolean                   enabled                        = true;
   private Map<String, Serializable> dateTimeFieldFunctionArguments = new HashMap<>();



   /*******************************************************************************
    * Getter for enabled
    * @see #withEnabled(Boolean)
    *******************************************************************************/
   public Boolean getEnabled()
   {
      return (this.enabled);
   }



   /*******************************************************************************
    * Setter for enabled
    * @see #withEnabled(Boolean)
    *******************************************************************************/
   public void setEnabled(Boolean enabled)
   {
      this.enabled = enabled;
   }



   /*******************************************************************************
    * Fluent setter for enabled
    *
    * @param enabled
    * TODO document this property
    *
    * @return this
    *******************************************************************************/
   public WeekdayCriteriaSettings withEnabled(Boolean enabled)
   {
      this.enabled = enabled;
      return (this);
   }



   /*******************************************************************************
    * Getter for dateTimeFieldFunctionArguments
    * @see #withDateTimeFieldFunctionArguments(Map)
    *******************************************************************************/
   public Map<String, Serializable> getDateTimeFieldFunctionArguments()
   {
      return (this.dateTimeFieldFunctionArguments);
   }



   /*******************************************************************************
    * Setter for dateTimeFieldFunctionArguments
    * @see #withDateTimeFieldFunctionArguments(Map)
    *******************************************************************************/
   public void setDateTimeFieldFunctionArguments(Map<String, Serializable> dateTimeFieldFunctionArguments)
   {
      this.dateTimeFieldFunctionArguments = dateTimeFieldFunctionArguments;
   }



   /*******************************************************************************
    * Fluent setter for dateTimeFieldFunctionArguments
    *
    * @param dateTimeFieldFunctionArguments
    * TODO document this property
    *
    * @return this
    *******************************************************************************/
   public WeekdayCriteriaSettings withDateTimeFieldFunctionArguments(Map<String, Serializable> dateTimeFieldFunctionArguments)
   {
      this.dateTimeFieldFunctionArguments = dateTimeFieldFunctionArguments;
      return (this);
   }



   /***************************************************************************
    *
    ***************************************************************************/
   @Override
   public WeekdayCriteriaSettings clone()
   {
      try
      {
         WeekdayCriteriaSettings clone = (WeekdayCriteriaSettings) super.clone();

         if(dateTimeFieldFunctionArguments != null)
         {
            clone.dateTimeFieldFunctionArguments = new HashMap<>(dateTimeFieldFunctionArguments);
         }

         return clone;
      }
      catch(CloneNotSupportedException e)
      {
         throw new AssertionError();
      }
   }

}
