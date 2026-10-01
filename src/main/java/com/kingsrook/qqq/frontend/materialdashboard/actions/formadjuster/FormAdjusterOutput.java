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
import java.util.Set;
import com.kingsrook.qqq.backend.core.model.metadata.frontend.QFrontendFieldMetaData;
import com.kingsrook.qqq.backend.core.model.metadata.tables.QFieldSection;


/*******************************************************************************
 **
 *******************************************************************************/
public class FormAdjusterOutput
{
   private Map<String, QFrontendFieldMetaData> updatedFieldMetaData      = null;
   private Map<String, Serializable>           updatedFieldValues        = null;
   private Map<String, String>                 updatedFieldDisplayValues = null;
   private Set<String>                         fieldsToClear             = null;
   private Map<String, QFieldSection>          updatedSectionMetaData    = null;

   private Boolean isFormDisabled      = false;
   private String  formDisabledMessage = null;


   /*******************************************************************************
    ** Getter for updatedFieldValues
    *******************************************************************************/
   public Map<String, Serializable> getUpdatedFieldValues()
   {
      return (this.updatedFieldValues);
   }



   /*******************************************************************************
    ** Setter for updatedFieldValues
    *******************************************************************************/
   public void setUpdatedFieldValues(Map<String, Serializable> updatedFieldValues)
   {
      this.updatedFieldValues = updatedFieldValues;
   }



   /*******************************************************************************
    ** Fluent setter for updatedFieldValues
    *******************************************************************************/
   public FormAdjusterOutput withUpdatedFieldValues(Map<String, Serializable> updatedFieldValues)
   {
      this.updatedFieldValues = updatedFieldValues;
      return (this);
   }



   /*******************************************************************************
    ** Getter for fieldsToClear
    *******************************************************************************/
   public Set<String> getFieldsToClear()
   {
      return (this.fieldsToClear);
   }



   /*******************************************************************************
    ** Setter for fieldsToClear
    *******************************************************************************/
   public void setFieldsToClear(Set<String> fieldsToClear)
   {
      this.fieldsToClear = fieldsToClear;
   }



   /*******************************************************************************
    ** Fluent setter for fieldsToClear
    *******************************************************************************/
   public FormAdjusterOutput withFieldsToClear(Set<String> fieldsToClear)
   {
      this.fieldsToClear = fieldsToClear;
      return (this);
   }



   /*******************************************************************************
    ** Getter for updatedFieldMetaData
    *******************************************************************************/
   public Map<String, QFrontendFieldMetaData> getUpdatedFieldMetaData()
   {
      return (this.updatedFieldMetaData);
   }



   /*******************************************************************************
    ** Setter for updatedFieldMetaData
    *******************************************************************************/
   public void setUpdatedFieldMetaData(Map<String, QFrontendFieldMetaData> updatedFieldMetaData)
   {
      this.updatedFieldMetaData = updatedFieldMetaData;
   }



   /*******************************************************************************
    ** Fluent setter for updatedFieldMetaData
    *******************************************************************************/
   public FormAdjusterOutput withUpdatedFieldMetaData(Map<String, QFrontendFieldMetaData> updatedFieldMetaData)
   {
      this.updatedFieldMetaData = updatedFieldMetaData;
      return (this);
   }



   /*******************************************************************************
    ** Getter for updatedFieldDisplayValues
    *******************************************************************************/
   public Map<String, String> getUpdatedFieldDisplayValues()
   {
      return (this.updatedFieldDisplayValues);
   }



   /*******************************************************************************
    ** Setter for updatedFieldDisplayValues
    *******************************************************************************/
   public void setUpdatedFieldDisplayValues(Map<String, String> updatedFieldDisplayValues)
   {
      this.updatedFieldDisplayValues = updatedFieldDisplayValues;
   }



   /*******************************************************************************
    ** Fluent setter for updatedFieldDisplayValues
    *******************************************************************************/
   public FormAdjusterOutput withUpdatedFieldDisplayValues(Map<String, String> updatedFieldDisplayValues)
   {
      this.updatedFieldDisplayValues = updatedFieldDisplayValues;
      return (this);
   }



   /*******************************************************************************
    * Getter for updatedSectionMetaData
    * @see #withUpdatedSectionMetaData(Map)
    *******************************************************************************/
   public Map<String, QFieldSection> getUpdatedSectionMetaData()
   {
      return (this.updatedSectionMetaData);
   }



   /*******************************************************************************
    * Setter for updatedSectionMetaData
    * @see #withUpdatedSectionMetaData(Map)
    *******************************************************************************/
   public void setUpdatedSectionMetaData(Map<String, QFieldSection> updatedSectionMetaData)
   {
      this.updatedSectionMetaData = updatedSectionMetaData;
   }



   /*******************************************************************************
    * Fluent setter for updatedSectionMetaData
    *
    * @param updatedSectionMetaData
    * Map of QFieldSections to be changed by this request - e.g., to hide or change
    * labels or icons (is probably about all you can do)
    * @return this
    *******************************************************************************/
   public FormAdjusterOutput withUpdatedSectionMetaData(Map<String, QFieldSection> updatedSectionMetaData)
   {
      this.updatedSectionMetaData = updatedSectionMetaData;
      return (this);
   }



   /*******************************************************************************
    * Getter for isFormDisabled
    * @see #withIsFormDisabled(Boolean)
    *******************************************************************************/
   public Boolean getIsFormDisabled()
   {
      return (this.isFormDisabled);
   }



   /*******************************************************************************
    * Setter for isFormDisabled
    * @see #withIsFormDisabled(Boolean)
    *******************************************************************************/
   public void setIsFormDisabled(Boolean isFormDisabled)
   {
      this.isFormDisabled = isFormDisabled;
   }



   /*******************************************************************************
    * Fluent setter for isFormDisabled
    *
    * @param isFormDisabled
    * boolean, defaults to false.  If set to true, then the frontend should disable
    * the form, fully blocking edits.
    * @return this
    *******************************************************************************/
   public FormAdjusterOutput withIsFormDisabled(Boolean isFormDisabled)
   {
      this.isFormDisabled = isFormDisabled;
      return (this);
   }



   /*******************************************************************************
    * Getter for formDisabledMessage
    * @see #withFormDisabledMessage(String)
    *******************************************************************************/
   public String getFormDisabledMessage()
   {
      return (this.formDisabledMessage);
   }



   /*******************************************************************************
    * Setter for formDisabledMessage
    * @see #withFormDisabledMessage(String)
    *******************************************************************************/
   public void setFormDisabledMessage(String formDisabledMessage)
   {
      this.formDisabledMessage = formDisabledMessage;
   }



   /*******************************************************************************
    * Fluent setter for formDisabledMessage
    *
    * @param formDisabledMessage
    * Message the frontend should display to the user when the form is disabled
    * (see withIsFormDisabled()).  If this message isn't set, then the frontend
    * will display a generic message.
    * @return this
    *******************************************************************************/
   public FormAdjusterOutput withFormDisabledMessage(String formDisabledMessage)
   {
      this.formDisabledMessage = formDisabledMessage;
      return (this);
   }

}
