/*
 * QQQ - Low-code Application Framework for Engineers.
 * Copyright (C) 2021-2024.  Kingsrook, LLC
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

package com.kingsrook.qqq.frontend.materialdashboard.model.metadata.fieldrules;


import java.io.Serializable;


/*******************************************************************************
 ** definition of rules for how UI fields should behave.
 **
 ** e.g., one field being changed causing different things to be needed in another
 ** field.
 *******************************************************************************/
public class FieldRule implements Serializable, Cloneable
{
   private FieldRuleTrigger trigger;
   private String           sourceField;
   private FieldRuleAction  action;
   private String           targetField;

   private String targetWidget;



   /*******************************************************************************
    ** Getter for trigger
    *******************************************************************************/
   public FieldRuleTrigger getTrigger()
   {
      return (this.trigger);
   }



   /*******************************************************************************
    ** Setter for trigger
    *******************************************************************************/
   public void setTrigger(FieldRuleTrigger trigger)
   {
      this.trigger = trigger;
   }



   /*******************************************************************************
    ** Fluent setter for trigger
    *******************************************************************************/
   public FieldRule withTrigger(FieldRuleTrigger trigger)
   {
      this.trigger = trigger;
      return (this);
   }



   /*******************************************************************************
    ** Getter for sourceField
    *******************************************************************************/
   public String getSourceField()
   {
      return (this.sourceField);
   }



   /*******************************************************************************
    ** Setter for sourceField
    *******************************************************************************/
   public void setSourceField(String sourceField)
   {
      this.sourceField = sourceField;
   }



   /*******************************************************************************
    ** Fluent setter for sourceField
    *******************************************************************************/
   public FieldRule withSourceField(String sourceField)
   {
      this.sourceField = sourceField;
      return (this);
   }



   /*******************************************************************************
    ** Getter for action
    *******************************************************************************/
   public FieldRuleAction getAction()
   {
      return (this.action);
   }



   /*******************************************************************************
    ** Setter for action
    *******************************************************************************/
   public void setAction(FieldRuleAction action)
   {
      this.action = action;
   }



   /*******************************************************************************
    ** Fluent setter for action
    *******************************************************************************/
   public FieldRule withAction(FieldRuleAction action)
   {
      this.action = action;
      return (this);
   }



   /*******************************************************************************
    ** Getter for targetField
    *******************************************************************************/
   public String getTargetField()
   {
      return (this.targetField);
   }



   /*******************************************************************************
    ** Setter for targetField
    *******************************************************************************/
   public void setTargetField(String targetField)
   {
      this.targetField = targetField;
   }



   /*******************************************************************************
    ** Fluent setter for targetField
    *******************************************************************************/
   public FieldRule withTargetField(String targetField)
   {
      this.targetField = targetField;
      return (this);
   }



   /*******************************************************************************
    ** Getter for targetWidget
    *******************************************************************************/
   public String getTargetWidget()
   {
      return (this.targetWidget);
   }



   /*******************************************************************************
    ** Setter for targetWidget
    *******************************************************************************/
   public void setTargetWidget(String targetWidget)
   {
      this.targetWidget = targetWidget;
   }



   /*******************************************************************************
    ** Fluent setter for targetWidget
    *******************************************************************************/
   public FieldRule withTargetWidget(String targetWidget)
   {
      this.targetWidget = targetWidget;
      return (this);
   }



   /***************************************************************************
    * 
    ***************************************************************************/
   @Override
   public FieldRule clone()
   {
      try
      {
         FieldRule clone = (FieldRule) super.clone();
         return clone;
      }
      catch(CloneNotSupportedException e)
      {
         throw new AssertionError();
      }
   }
}
