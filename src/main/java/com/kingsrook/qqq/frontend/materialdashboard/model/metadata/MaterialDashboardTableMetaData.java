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

package com.kingsrook.qqq.frontend.materialdashboard.model.metadata;


import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import com.kingsrook.qqq.backend.core.instances.QInstanceValidator;
import com.kingsrook.qqq.backend.core.logging.QLogger;
import com.kingsrook.qqq.backend.core.model.metadata.QInstance;
import com.kingsrook.qqq.backend.core.model.metadata.code.QCodeReference;
import com.kingsrook.qqq.backend.core.model.metadata.tables.QSupplementalTableMetaData;
import com.kingsrook.qqq.backend.core.model.metadata.tables.QTableMetaData;
import com.kingsrook.qqq.backend.core.utils.CollectionUtils;
import com.kingsrook.qqq.backend.core.utils.StringUtils;
import com.kingsrook.qqq.frontend.materialdashboard.actions.formadjuster.FormAdjusterInterface;
import com.kingsrook.qqq.frontend.materialdashboard.actions.formadjuster.FormAdjusterRegistry;
import com.kingsrook.qqq.frontend.materialdashboard.model.metadata.fieldrules.FieldRule;
import static com.kingsrook.qqq.backend.core.logging.LogUtils.logPair;


/*******************************************************************************
 ** table-level meta-data for this module (handled as QSupplementalTableMetaData)
 *******************************************************************************/
public class MaterialDashboardTableMetaData extends QSupplementalTableMetaData
{
   private static final QLogger LOG = QLogger.getLogger(MaterialDashboardTableMetaData.class);

   public static final String TYPE = "materialDashboard";

   private List<List<String>> gotoFieldNames;
   private List<String>       defaultQuickFilterFieldNames;
   private List<FieldRule>    fieldRules;

   private QCodeReference onLoadFormAdjuster = null;



   /*******************************************************************************
    **
    *******************************************************************************/
   @Override
   public boolean includeInFullFrontendMetaData()
   {
      return (true);
   }



   /*******************************************************************************
    **
    *******************************************************************************/
   @Override
   public String getType()
   {
      return (TYPE);
   }



   /*******************************************************************************
    **
    *******************************************************************************/
   public static MaterialDashboardTableMetaData ofOrWithNew(QTableMetaData table)
   {
      MaterialDashboardTableMetaData supplementalMetaData = (MaterialDashboardTableMetaData) table.getSupplementalMetaData(TYPE);
      if(supplementalMetaData == null)
      {
         supplementalMetaData = new MaterialDashboardTableMetaData();
         table.withSupplementalMetaData(supplementalMetaData);
      }

      return (supplementalMetaData);
   }



   /*******************************************************************************
    ** Getter for gotoFieldNames
    *******************************************************************************/
   public List<List<String>> getGotoFieldNames()
   {
      return (this.gotoFieldNames);
   }



   /*******************************************************************************
    ** Setter for gotoFieldNames
    *******************************************************************************/
   public void setGotoFieldNames(List<List<String>> gotoFieldNames)
   {
      this.gotoFieldNames = gotoFieldNames;
   }



   /*******************************************************************************
    ** Fluent setter for gotoFieldNames
    *******************************************************************************/
   public MaterialDashboardTableMetaData withGotoFieldNames(List<List<String>> gotoFieldNames)
   {
      this.gotoFieldNames = gotoFieldNames;
      return (this);
   }



   /*******************************************************************************
    ** perform QInstance validation on this table meta data.
    *******************************************************************************/
   @Override
   public void validate(QInstance qInstance, QTableMetaData tableMetaData, QInstanceValidator qInstanceValidator)
   {
      super.validate(qInstance, tableMetaData, qInstanceValidator);

      String prefix = "MaterialDashboardTableMetaData supplementalTableMetaData for table [" + tableMetaData.getName() + "] ";

      for(List<String> gotoFieldNameSubList : CollectionUtils.nonNullList(gotoFieldNames))
      {
         qInstanceValidator.assertCondition(!gotoFieldNameSubList.isEmpty(), prefix + "has an empty gotoFieldNames list");
         validateListOfFieldNames(tableMetaData, gotoFieldNameSubList, qInstanceValidator, prefix + "gotoFieldNames: ");
      }
      validateListOfFieldNames(tableMetaData, defaultQuickFilterFieldNames, qInstanceValidator, prefix + "defaultQuickFilterFieldNames: ");

      for(FieldRule fieldRule : CollectionUtils.nonNullList(fieldRules))
      {
         validateFieldRule(qInstance, tableMetaData, qInstanceValidator, fieldRule, prefix);
      }

      if(onLoadFormAdjuster != null)
      {
         qInstanceValidator.validateSimpleCodeReference(prefix + ", onLoadFormAdjuster", onLoadFormAdjuster, FormAdjusterInterface.class);
      }
   }



   /***************************************************************************
    * perform QInstance enrichment on this table meta data.
    ***************************************************************************/
   @Override
   public void enrich(QInstance qInstance, QTableMetaData table)
   {
      super.enrich(qInstance, table);

      try
      {
         if(onLoadFormAdjuster != null)
         {
            ///////////////////////////////////////////////////////////////////////////////
            // if there's an on-load form adjuster, add it to the form adjuster registry //
            ///////////////////////////////////////////////////////////////////////////////
            FormAdjusterRegistry.registerOnLoadFormAdjuster(qInstance, "table:" + table.getName(), onLoadFormAdjuster);
         }
      }
      catch(Exception e)
      {
         LOG.warn("Error enriching MaterialDashboardTableMetaData", e, logPair("table", table == null ? null : table.getName()));
      }
   }



   /*******************************************************************************
    **
    *******************************************************************************/
   static void validateFieldRule(QInstance qInstance, QTableMetaData tableMetaData, QInstanceValidator qInstanceValidator, FieldRule fieldRule, String prefix)
   {
      qInstanceValidator.assertCondition(fieldRule.getTrigger() != null, prefix + "has a fieldRule without a trigger");
      qInstanceValidator.assertCondition(fieldRule.getAction() != null, prefix + "has a fieldRule without an action");

      if(qInstanceValidator.assertCondition(StringUtils.hasContent(fieldRule.getSourceField()), prefix + "has a fieldRule without a sourceField"))
      {
         qInstanceValidator.assertNoException(() -> tableMetaData.getField(fieldRule.getSourceField()), prefix + "has a fieldRule with an unrecognized sourceField: " + fieldRule.getSourceField());
      }

      if(StringUtils.hasContent(fieldRule.getTargetField()))
      {
         qInstanceValidator.assertNoException(() -> tableMetaData.getField(fieldRule.getTargetField()), prefix + "has a fieldRule with an unrecognized targetField: " + fieldRule.getTargetField());
      }

      if(StringUtils.hasContent(fieldRule.getTargetWidget()))
      {
         if(qInstanceValidator.assertCondition(qInstance.getWidget(fieldRule.getTargetWidget()) != null, prefix + "has a widgetRule with an unrecognized targetWidget: " + fieldRule.getTargetWidget()))
         {
            qInstanceValidator.assertCondition(CollectionUtils.nonNullList(tableMetaData.getSections()).stream().anyMatch(s -> fieldRule.getTargetWidget().equals(s.getWidgetName())),
               prefix + "has a widgetRule with a targetWidget which is not used in any sections on the table");
         }
      }
   }



   /*******************************************************************************
    **
    *******************************************************************************/
   private void validateListOfFieldNames(QTableMetaData tableMetaData, List<String> fieldNames, QInstanceValidator qInstanceValidator, String prefix)
   {
      Set<String> usedNames = new HashSet<>();
      for(String fieldName : CollectionUtils.nonNullList(fieldNames))
      {
         if(qInstanceValidator.assertNoException(() -> tableMetaData.getField(fieldName), prefix + " unrecognized field name: " + fieldName))
         {
            qInstanceValidator.assertCondition(!usedNames.contains(fieldName), prefix + "has a duplicated field name: " + fieldName);
            usedNames.add(fieldName);
         }
      }
   }



   /*******************************************************************************
    ** Getter for defaultQuickFilterFieldNames
    *******************************************************************************/
   public List<String> getDefaultQuickFilterFieldNames()
   {
      return (this.defaultQuickFilterFieldNames);
   }



   /*******************************************************************************
    ** Setter for defaultQuickFilterFieldNames
    *******************************************************************************/
   public void setDefaultQuickFilterFieldNames(List<String> defaultQuickFilterFieldNames)
   {
      this.defaultQuickFilterFieldNames = defaultQuickFilterFieldNames;
   }



   /*******************************************************************************
    ** Fluent setter for defaultQuickFilterFieldNames
    *******************************************************************************/
   public MaterialDashboardTableMetaData withDefaultQuickFilterFieldNames(List<String> defaultQuickFilterFieldNames)
   {
      this.defaultQuickFilterFieldNames = defaultQuickFilterFieldNames;
      return (this);
   }



   /*******************************************************************************
    ** Getter for fieldRules
    *******************************************************************************/
   public List<FieldRule> getFieldRules()
   {
      return (this.fieldRules);
   }



   /*******************************************************************************
    ** Setter for fieldRules
    *******************************************************************************/
   public void setFieldRules(List<FieldRule> fieldRules)
   {
      this.fieldRules = fieldRules;
   }



   /*******************************************************************************
    ** Fluent setter for fieldRules
    *******************************************************************************/
   public MaterialDashboardTableMetaData withFieldRules(List<FieldRule> fieldRules)
   {
      this.fieldRules = fieldRules;
      return (this);
   }



   /*******************************************************************************
    ** Fluent setter for fieldRules
    *******************************************************************************/
   public MaterialDashboardTableMetaData withFieldRule(FieldRule fieldRule)
   {
      if(this.fieldRules == null)
      {
         this.fieldRules = new ArrayList<>();
      }

      this.fieldRules.add(fieldRule);

      return (this);
   }



   /*******************************************************************************
    * Getter for onLoadFormAdjuster
    * @see #withOnLoadFormAdjuster(QCodeReference)
    *******************************************************************************/
   public QCodeReference getOnLoadFormAdjuster()
   {
      return (this.onLoadFormAdjuster);
   }



   /*******************************************************************************
    * Setter for onLoadFormAdjuster
    * @see #withOnLoadFormAdjuster(QCodeReference)
    *******************************************************************************/
   public void setOnLoadFormAdjuster(QCodeReference onLoadFormAdjuster)
   {
      this.onLoadFormAdjuster = onLoadFormAdjuster;
   }



   /*******************************************************************************
    * Fluent setter for onLoadFormAdjuster
    *
    * @param onLoadFormAdjuster code reference to class of type
    *                           {@link FormAdjusterInterface} to be executed "on load"
    *                           for insert & edit screens for this table.
    * @return this
    *******************************************************************************/
   public MaterialDashboardTableMetaData withOnLoadFormAdjuster(QCodeReference onLoadFormAdjuster)
   {
      this.onLoadFormAdjuster = onLoadFormAdjuster;
      return (this);
   }




   /***************************************************************************
    *
    ***************************************************************************/
   @Override
   protected QSupplementalTableMetaData finishClone(QSupplementalTableMetaData abstractClone)
   {
      MaterialDashboardTableMetaData clone = (MaterialDashboardTableMetaData) abstractClone;

      if(gotoFieldNames != null)
      {
         clone.gotoFieldNames = new ArrayList<>();
         for(List<String> gotoFieldNameSubList : gotoFieldNames)
         {
            clone.gotoFieldNames.add(new ArrayList<>(gotoFieldNameSubList));
         }
      }

      if(defaultQuickFilterFieldNames != null)
      {
         clone.defaultQuickFilterFieldNames = new ArrayList<>(defaultQuickFilterFieldNames);
      }

      if(fieldRules != null)
      {
         clone.fieldRules = new ArrayList<>();
         for(FieldRule fieldRule : fieldRules)
         {
            clone.fieldRules.add(fieldRule.clone());
         }
      }

      if(onLoadFormAdjuster != null)
      {
         clone.onLoadFormAdjuster = onLoadFormAdjuster.clone();
      }

      return abstractClone;
   }

}
