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


import java.util.HashMap;
import com.kingsrook.qqq.backend.core.logging.QLogger;
import com.kingsrook.qqq.backend.core.model.metadata.fields.QFieldMetaData;
import com.kingsrook.qqq.backend.core.model.metadata.frontend.QFrontendFieldMetaData;
import com.kingsrook.qqq.backend.core.model.metadata.tables.QTableMetaData;
import static com.kingsrook.qqq.backend.core.logging.LogUtils.logPair;


/***************************************************************************
 * package-private class used internally by {@link FormAdjusterOutputBuilder}
 * to track changes to an individual field.
 ***************************************************************************/
class FormAdjusterOutputBuilderFieldChanges
{
   private static final QLogger LOG = QLogger.getLogger(FormAdjusterOutputBuilderFieldChanges.class);

   private String fieldName;

   private Boolean changeIsHiddenTo   = null;
   private Boolean changeIsRequiredTo = null;
   private Boolean changeIsEditableTo = null;
   private String  changeLabelTo      = null;



   /*******************************************************************************
    * Constructor
    *
    * @param fieldName which field the changes will be for.
    *******************************************************************************/
   public FormAdjusterOutputBuilderFieldChanges(String fieldName)
   {
      this.fieldName = fieldName;
   }



   /***************************************************************************
    * add all changes for this field to the input formAdjusterOutput.
    * @param table the qqq table meta-data that the field is a part of.
    *              note that if the field isn't found in the table, this method
    *              will log a warning and return with noop.
    * @param formAdjusterOutput object being built (e.g., by a
    *                           {@link FormAdjusterOutputBuilder} that the changes
    *                           for this field are added to.
    ***************************************************************************/
   void apply(QTableMetaData table, FormAdjusterOutput formAdjusterOutput)
   {
      QFieldMetaData originalField = table.getFields().get(fieldName);
      if(originalField == null)
      {
         LOG.warn("Field not found", logPair("fieldName", fieldName));
         return;
      }

      QFieldMetaData cloneField = originalField.clone();
      boolean        anyChanges = false;

      //////////////////////////////////////////////////////////////////////////
      // if any of our changeXXX attributes are set, then set the appropriate //
      // value in the clone of the field, and record that we have changes     //
      //////////////////////////////////////////////////////////////////////////
      if(changeIsHiddenTo != null)
      {
         cloneField.setIsHidden(changeIsHiddenTo);
         anyChanges = true;
      }

      if(changeIsEditableTo != null)
      {
         cloneField.setIsEditable(changeIsEditableTo);
         anyChanges = true;
      }

      if(changeIsRequiredTo != null)
      {
         cloneField.setIsRequired(changeIsRequiredTo);
         anyChanges = true;
      }

      if(changeLabelTo != null)
      {
         cloneField.setLabel(changeLabelTo);
         anyChanges = true;
      }

      if(anyChanges)
      {
         ///////////////////////////////////////////////////////////////////////////////////////
         // if we had any changes, lazy-init an UpdatedFieldMetaData map in the output object //
         // and put this field in that map.                                                   //
         ///////////////////////////////////////////////////////////////////////////////////////
         if(formAdjusterOutput.getUpdatedFieldMetaData() == null)
         {
            formAdjusterOutput.setUpdatedFieldMetaData(new HashMap<>());
         }

         formAdjusterOutput.getUpdatedFieldMetaData().put(fieldName, new QFrontendFieldMetaData(cloneField));
      }
   }



   /*******************************************************************************
    ** Getter for changeIsHiddenTo
    **
    *******************************************************************************/
   public Boolean getChangeIsHiddenTo()
   {
      return changeIsHiddenTo;
   }



   /*******************************************************************************
    ** Setter for changeIsHiddenTo
    **
    *******************************************************************************/
   public void setChangeIsHiddenTo(Boolean changeIsHiddenTo)
   {
      this.changeIsHiddenTo = changeIsHiddenTo;
   }



   /*******************************************************************************
    ** Fluent setter for changeIsHiddenTo
    **
    * @param changeIsHiddenTo if non-null, marks that this "change" object, when
    *                          applied to a {@link FormAdjusterOutput}, should
    *                          include setting this field's isHidden value accordingly.
    *                          if null, then isHidden is not changed.
    *******************************************************************************/
   public FormAdjusterOutputBuilderFieldChanges withChangeIsHiddenTo(Boolean changeIsHiddenTo)
   {
      this.changeIsHiddenTo = changeIsHiddenTo;
      return (this);
   }



   /*******************************************************************************
    ** Getter for changeLabelTo
    **
    *******************************************************************************/
   public String getChangeLabelTo()
   {
      return changeLabelTo;
   }



   /*******************************************************************************
    ** Setter for changeLabelTo
    **
    *******************************************************************************/
   public void setChangeLabelTo(String changeLabelTo)
   {
      this.changeLabelTo = changeLabelTo;
   }



   /*******************************************************************************
    ** Fluent setter for changeLabelTo
    **
    * @param changeLabelTo if non-null, marks that this "change" object, when
    *                      applied to a {@link FormAdjusterOutput}, should
    *                      include setting this field's label accordingly.
    *                      if null, then label is not changed.
    *******************************************************************************/
   public FormAdjusterOutputBuilderFieldChanges withChangeLabelTo(String changeLabelTo)
   {
      this.changeLabelTo = changeLabelTo;
      return (this);
   }



   /*******************************************************************************
    ** Getter for fieldName
    **
    *******************************************************************************/
   public String getFieldName()
   {
      return fieldName;
   }



   /*******************************************************************************
    * Getter for changeIsRequiredTo
    * @see #withChangeIsRequiredTo(Boolean)
    *******************************************************************************/
   public Boolean getChangeIsRequiredTo()
   {
      return (this.changeIsRequiredTo);
   }



   /*******************************************************************************
    * Setter for changeIsRequiredTo
    * @see #withChangeIsRequiredTo(Boolean)
    *******************************************************************************/
   public void setChangeIsRequiredTo(Boolean changeIsRequiredTo)
   {
      this.changeIsRequiredTo = changeIsRequiredTo;
   }



   /*******************************************************************************
    * Fluent setter for changeIsRequiredTo
    *
    * @param changeIsRequiredTo if non-null, marks that this "change" object, when
    *                           applied to a {@link FormAdjusterOutput}, should
    *                           include setting this field's isRequired value accordingly.
    *                           if null, then isRequired is not changed.
    * @return this
    *******************************************************************************/
   public FormAdjusterOutputBuilderFieldChanges withChangeIsRequiredTo(Boolean changeIsRequiredTo)
   {
      this.changeIsRequiredTo = changeIsRequiredTo;
      return (this);
   }



   /*******************************************************************************
    * Getter for changeIsEditableTo
    * @see #withChangeIsEditableTo(Boolean)
    *******************************************************************************/
   public Boolean getChangeIsEditableTo()
   {
      return (this.changeIsEditableTo);
   }



   /*******************************************************************************
    * Setter for changeIsEditableTo
    * @see #withChangeIsEditableTo(Boolean)
    *******************************************************************************/
   public void setChangeIsEditableTo(Boolean changeIsEditableTo)
   {
      this.changeIsEditableTo = changeIsEditableTo;
   }



   /*******************************************************************************
    * Fluent setter for changeIsEditableTo
    *
    * @param changeIsEditableTo if non-null, marks that this "change" object, when
    *                           applied to a {@link FormAdjusterOutput}, should
    *                           include setting this field's isEditable value accordingly.
    *                           if null, then isEditable is not changed.
    * @return this
    *******************************************************************************/
   public FormAdjusterOutputBuilderFieldChanges withChangeIsEditableTo(Boolean changeIsEditableTo)
   {
      this.changeIsEditableTo = changeIsEditableTo;
      return (this);
   }

}
