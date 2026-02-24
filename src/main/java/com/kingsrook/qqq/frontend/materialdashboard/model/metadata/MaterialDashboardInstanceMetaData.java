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
import java.util.List;
import com.kingsrook.qqq.backend.core.model.metadata.QInstance;
import com.kingsrook.qqq.backend.core.model.metadata.QSupplementalInstanceMetaData;


/*******************************************************************************
 ** instance-level meta-data for this module (handled as QSupplementalTableMetaData)
 *******************************************************************************/
public class MaterialDashboardInstanceMetaData implements QSupplementalInstanceMetaData
{
   public static final String TYPE = "materialDashboard";

   private List<String> processNamesToAddToAllQueryAndViewScreens = new ArrayList<>();

   private Integer queryScreenCopyFullQueryColumnValuesLimit = 100_000;

   private MaterialDashboardTableMetaData.RecordViewActionsPlacement recordViewActionsPlacement = MaterialDashboardTableMetaData.RecordViewActionsPlacement.IN_IDENTITY_SECTION;



   /*******************************************************************************
    **
    *******************************************************************************/
   @Override
   public String getName()
   {
      return (TYPE);
   }



   /*******************************************************************************
    **
    *******************************************************************************/
   public static MaterialDashboardInstanceMetaData ofOrWithNew(QInstance qInstance)
   {
      MaterialDashboardInstanceMetaData supplementalMetaData = (MaterialDashboardInstanceMetaData) qInstance.getSupplementalMetaData(TYPE);
      if(supplementalMetaData == null)
      {
         supplementalMetaData = new MaterialDashboardInstanceMetaData();
         qInstance.withSupplementalMetaData(supplementalMetaData);
      }

      return (supplementalMetaData);
   }



   /*******************************************************************************
    ** Getter for processNamesToAddToAllQueryAndViewScreens
    *******************************************************************************/
   public List<String> getProcessNamesToAddToAllQueryAndViewScreens()
   {
      return (this.processNamesToAddToAllQueryAndViewScreens);
   }



   /*******************************************************************************
    **
    *******************************************************************************/
   public void addProcessNameToAddToAllQueryAndViewScreens(String processNamesToAddToAllQueryAndViewScreens)
   {
      if(this.processNamesToAddToAllQueryAndViewScreens == null)
      {
         this.processNamesToAddToAllQueryAndViewScreens = new ArrayList<>();
      }
      this.processNamesToAddToAllQueryAndViewScreens.add(processNamesToAddToAllQueryAndViewScreens);
   }



   /*******************************************************************************
    ** Setter for processNamesToAddToAllQueryAndViewScreens
    *******************************************************************************/
   public void setProcessNamesToAddToAllQueryAndViewScreens(List<String> processNamesToAddToAllQueryAndViewScreens)
   {
      this.processNamesToAddToAllQueryAndViewScreens = processNamesToAddToAllQueryAndViewScreens;
   }



   /*******************************************************************************
    ** Fluent setter for processNamesToAddToAllQueryAndViewScreens
    *******************************************************************************/
   public MaterialDashboardInstanceMetaData withProcessNamesToAddToAllQueryAndViewScreens(List<String> processNamesToAddToAllQueryAndViewScreens)
   {
      this.processNamesToAddToAllQueryAndViewScreens = processNamesToAddToAllQueryAndViewScreens;
      return (this);
   }


   /*******************************************************************************
    * Getter for queryScreenCopyFullQueryColumnValuesLimit
    * @see #withQueryScreenCopyFullQueryColumnValuesLimit(Integer)
    *******************************************************************************/
   public Integer getQueryScreenCopyFullQueryColumnValuesLimit()
   {
      return (this.queryScreenCopyFullQueryColumnValuesLimit);
   }



   /*******************************************************************************
    * Setter for queryScreenCopyFullQueryColumnValuesLimit
    * @see #withQueryScreenCopyFullQueryColumnValuesLimit(Integer)
    *******************************************************************************/
   public void setQueryScreenCopyFullQueryColumnValuesLimit(Integer queryScreenCopyFullQueryColumnValuesLimit)
   {
      this.queryScreenCopyFullQueryColumnValuesLimit = queryScreenCopyFullQueryColumnValuesLimit;
   }



   /*******************************************************************************
    * Fluent setter for queryScreenCopyFullQueryColumnValuesLimit
    *
    * @param queryScreenCopyFullQueryColumnValuesLimit
    * for the Copy full query result option in the query screen's column menu,
    * this value is the max number of rows allowed in the query result in order
    * to allow the copy function to run.
    * If null, then it's up to the frontend what to do (original implementation had
    * a limit of 100,000).  To effectively disable this feature, set to, e.g.,
    * Integer.MAX_VALUE.  If set to 0 or negative, will basically make the feature
    * frustratingly unusable.
    * @return this
    *******************************************************************************/
   public MaterialDashboardInstanceMetaData withQueryScreenCopyFullQueryColumnValuesLimit(Integer queryScreenCopyFullQueryColumnValuesLimit)
   {
      this.queryScreenCopyFullQueryColumnValuesLimit = queryScreenCopyFullQueryColumnValuesLimit;
      return (this);
   }



   /*******************************************************************************
    ** Getter for recordViewActionsPlacement
    *******************************************************************************/
   public MaterialDashboardTableMetaData.RecordViewActionsPlacement getRecordViewActionsPlacement()
   {
      return (this.recordViewActionsPlacement);
   }



   /*******************************************************************************
    ** Setter for recordViewActionsPlacement
    *******************************************************************************/
   public void setRecordViewActionsPlacement(MaterialDashboardTableMetaData.RecordViewActionsPlacement recordViewActionsPlacement)
   {
      this.recordViewActionsPlacement = recordViewActionsPlacement;
   }



   /*******************************************************************************
    ** Fluent setter for recordViewActionsPlacement
    *******************************************************************************/
   public MaterialDashboardInstanceMetaData withRecordViewActionsPlacement(MaterialDashboardTableMetaData.RecordViewActionsPlacement recordViewActionsPlacement)
   {
      this.recordViewActionsPlacement = recordViewActionsPlacement;
      return (this);
   }


}
