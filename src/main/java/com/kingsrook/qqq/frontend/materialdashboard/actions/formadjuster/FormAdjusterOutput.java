/*
 * QQQ - Low-code Application Framework for Engineers.
 * Copyright (C) 2021-2025.  Kingsrook, LLC
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

}
