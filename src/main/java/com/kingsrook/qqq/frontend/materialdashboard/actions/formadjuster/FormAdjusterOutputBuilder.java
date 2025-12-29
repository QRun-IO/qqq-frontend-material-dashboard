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
import java.util.Map;
import com.kingsrook.qqq.backend.core.context.QContext;
import com.kingsrook.qqq.backend.core.model.metadata.tables.QTableMetaData;


/***************************************************************************
 * Builder class to help make a FormAdjusterOutput
 ***************************************************************************/
public class FormAdjusterOutputBuilder
{
   private QTableMetaData table;

   private Map<String, FormAdjusterOutputBuilderFieldChanges> fieldChangesMap = new HashMap<>();



   /*******************************************************************************
    * Constructor for a new builder for a form based on a table.
    *
    * @param tableName the table that the form is based on.  e.g., where the
    *                  fields will come from
    *******************************************************************************/
   public FormAdjusterOutputBuilder(String tableName)
   {
      this.table = QContext.getQInstance().getTable(tableName);
   }



   /***************************************************************************
    * complete the job of the builder, making its collected changes into
    * a {@link FormAdjusterOutput}.
    *
    * @return the resulting {@link FormAdjusterOutput}
    ***************************************************************************/
   public FormAdjusterOutput build()
   {
      FormAdjusterOutput output = new FormAdjusterOutput();

      for(FormAdjusterOutputBuilderFieldChanges fieldChanges : fieldChangesMap.values())
      {
         fieldChanges.apply(table, output);
      }

      return (output);
   }



   /***************************************************************************
    * add a change to this builder to set a field's label
    *
    * @param fieldName name of the field to change
    * @param label new lame for the field.
    ***************************************************************************/
   public void makeFieldLabel(String fieldName, String label)
   {
      getFieldChanges(fieldName).withChangeLabelTo(label);
   }



   /***************************************************************************
    * add a change to this builder to make a field hidden or shown based on
    * a boolean.
    *
    * @param fieldName name of the field to change
    * @param condition if true, the field will be set to not hidden;
    *                  if false the field will be set to be hidden.
    ***************************************************************************/
   public void makeFieldShownIf(String fieldName, boolean condition)
   {
      getFieldChanges(fieldName).withChangeIsHiddenTo(!condition);
   }



   /***************************************************************************
    * add a change to this builder to make a field hidden or shown based on
    * a boolean.
    *
    * @param fieldName name of the field to change
    * @param condition if true, the field will be set to be hidden;
    *                  if false the field will be set to not hidden.
    ***************************************************************************/
   public void makeFieldHiddenIf(String fieldName, boolean condition)
   {
      getFieldChanges(fieldName).withChangeIsHiddenTo(condition);
   }



   /***************************************************************************
    * add a change to this builder to make a field required or optional based on
    * a boolean.
    *
    * @param fieldName name of the field to change
    * @param condition if true, the field will be set to be required;
    *                  if false the field will be set to not required.
    ***************************************************************************/
   public void makeFieldRequiredIf(String fieldName, boolean condition)
   {
      getFieldChanges(fieldName).withChangeIsRequiredTo(condition);
   }



   /***************************************************************************
    * add a change to this builder to make a field required or optional based on
    * a boolean.
    *
    * @param fieldName name of the field to change
    * @param condition if true, the field will be set to not required;
    *                  if false the field will be set to be required.
    ***************************************************************************/
   public void makeFieldOptionalIf(String fieldName, boolean condition)
   {
      getFieldChanges(fieldName).withChangeIsRequiredTo(!condition);
   }



   /***************************************************************************
    * add a change to this builder to make a field editable or read-only based on
    * a boolean.
    *
    * @param fieldName name of the field to change
    * @param condition if true, the field will be set to be editable;
    *                  if false the field will be set to not editable.
    ***************************************************************************/
   public void makeFieldEditableIf(String fieldName, boolean condition)
   {
      getFieldChanges(fieldName).withChangeIsEditableTo(condition);
   }



   /***************************************************************************
    * add a change to this builder to make a field editable or read-only based on
    * a boolean.
    *
    * @param fieldName name of the field to change
    * @param condition if true, the field will be set to not editable;
    *                  if false the field will be set to be editable.
    ***************************************************************************/
   public void makeFieldReadOnlyIf(String fieldName, boolean condition)
   {
      getFieldChanges(fieldName).withChangeIsEditableTo(!condition);
   }



   /***************************************************************************
    * add a change to this builder to make a field shown (not hidden).
    *
    * @param fieldName name of the field to change
    ***************************************************************************/
   public void makeFieldShown(String fieldName)
   {
      getFieldChanges(fieldName).withChangeIsHiddenTo(false);
   }



   /***************************************************************************
    * add a change to this builder to make a field hidden.
    *
    * @param fieldName name of the field to change
    ***************************************************************************/
   public void makeFieldHidden(String fieldName)
   {
      getFieldChanges(fieldName).withChangeIsHiddenTo(true);
   }



   /***************************************************************************
    * add a change to this builder to make a field required.
    *
    * @param fieldName name of the field to change
    ***************************************************************************/
   public void makeFieldRequired(String fieldName)
   {
      getFieldChanges(fieldName).withChangeIsRequiredTo(true);
   }



   /***************************************************************************
    * add a change to this builder to make a field optional (not required).
    *
    * @param fieldName name of the field to change
    ***************************************************************************/
   public void makeFieldOptional(String fieldName)
   {
      getFieldChanges(fieldName).withChangeIsRequiredTo(false);
   }



   /***************************************************************************
    * add a change to this builder to make a field editable.
    *
    * @param fieldName name of the field to change
    ***************************************************************************/
   public void makeFieldEditable(String fieldName)
   {
      getFieldChanges(fieldName).withChangeIsEditableTo(true);
   }



   /***************************************************************************
    * add a change to this builder to make a field read-only (not editable).
    *
    * @param fieldName name of the field to change
    ***************************************************************************/
   public void makeFieldReadOnly(String fieldName)
   {
      getFieldChanges(fieldName).withChangeIsEditableTo(false);
   }



   /***************************************************************************
    * get an existing {@link FormAdjusterOutputBuilderFieldChanges} object
    * for a given field name - creating one (and adding it to `this`) if it did
    * not previously exist
    *
    * @param fieldName name of the field to get a change-tracker for.
    * @return existing or new FormAdjusterOutputBuilderFieldChanges object for
    * the field.
    ***************************************************************************/
   private FormAdjusterOutputBuilderFieldChanges getFieldChanges(String fieldName)
   {
      return (fieldChangesMap.computeIfAbsent(fieldName, k -> new FormAdjusterOutputBuilderFieldChanges(fieldName)));
   }

}
