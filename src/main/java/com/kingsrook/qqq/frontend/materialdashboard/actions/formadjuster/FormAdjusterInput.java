/*
 * QQQ - Low-code Application Framework for Engineers.
 * Copyright (C) 2021-2025.  Kingsrook, LLC
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

package com.kingsrook.qqq.frontend.materialdashboard.actions.formadjuster;


import java.io.Serializable;
import java.util.Map;


/*******************************************************************************
 * Input wrapper to a {@link FormAdjusterInterface}
 *
 * Contains values from the browser.
 *******************************************************************************/
public class FormAdjusterInput
{
   private String event;
   private String fieldName;

   private Serializable              newValue;
   private Map<String, Serializable> allValues;


   /***************************************************************************
    * For a given field name, return the current value for it.  Which will
    * be `newValue` if `fieldName` is `this.fieldName` (e.g., this is a field
    * level event, and you're requesting the effected field's value) - or -
    * the value for the field from the allValues map.
    *
    * @param fieldName what field to get a value for
    * @return the field's new value (if appropriate), or existing value possibly
    * null.
    ***************************************************************************/
   public Serializable getFieldValue(String fieldName)
   {
      if(fieldName.equals(this.fieldName))
      {
         return getNewValue();
      }
      return getAllValues().get(fieldName);
   }



   /*******************************************************************************
    ** Getter for event
    *******************************************************************************/
   public String getEvent()
   {
      return (this.event);
   }



   /*******************************************************************************
    ** Setter for event
    *******************************************************************************/
   public void setEvent(String event)
   {
      this.event = event;
   }



   /*******************************************************************************
    ** Fluent setter for event
    *******************************************************************************/
   public FormAdjusterInput withEvent(String event)
   {
      this.event = event;
      return (this);
   }



   /*******************************************************************************
    ** Getter for fieldName
    *******************************************************************************/
   public String getFieldName()
   {
      return (this.fieldName);
   }



   /*******************************************************************************
    ** Setter for fieldName
    *******************************************************************************/
   public void setFieldName(String fieldName)
   {
      this.fieldName = fieldName;
   }



   /*******************************************************************************
    ** Fluent setter for fieldName
    *******************************************************************************/
   public FormAdjusterInput withFieldName(String fieldName)
   {
      this.fieldName = fieldName;
      return (this);
   }



   /*******************************************************************************
    ** Getter for newValue
    *******************************************************************************/
   public Serializable getNewValue()
   {
      return (this.newValue);
   }



   /*******************************************************************************
    ** Setter for newValue
    *******************************************************************************/
   public void setNewValue(Serializable newValue)
   {
      this.newValue = newValue;
   }



   /*******************************************************************************
    ** Fluent setter for newValue
    *******************************************************************************/
   public FormAdjusterInput withNewValue(Serializable newValue)
   {
      this.newValue = newValue;
      return (this);
   }



   /*******************************************************************************
    ** Getter for allValues
    *******************************************************************************/
   public Map<String, Serializable> getAllValues()
   {
      return (this.allValues);
   }



   /*******************************************************************************
    ** Setter for allValues
    *******************************************************************************/
   public void setAllValues(Map<String, Serializable> allValues)
   {
      this.allValues = allValues;
   }



   /*******************************************************************************
    ** Fluent setter for allValues
    *******************************************************************************/
   public FormAdjusterInput withAllValues(Map<String, Serializable> allValues)
   {
      this.allValues = allValues;
      return (this);
   }

}
