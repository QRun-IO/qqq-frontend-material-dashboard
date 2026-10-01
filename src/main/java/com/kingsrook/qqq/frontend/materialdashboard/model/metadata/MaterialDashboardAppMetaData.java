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

package com.kingsrook.qqq.frontend.materialdashboard.model.metadata;


import com.kingsrook.qqq.backend.core.model.metadata.layout.QAppMetaData;
import com.kingsrook.qqq.backend.core.model.metadata.layout.QSupplementalAppMetaData;
import com.kingsrook.qqq.backend.core.utils.CollectionUtils;


/*******************************************************************************
 ** app-level meta-data for this module (handled as QSupplementalTableMetaData)
 *******************************************************************************/
public class MaterialDashboardAppMetaData extends QSupplementalAppMetaData
{
   public static final String TYPE_NAME = "materialDashboard";

   private Boolean showAppLabelOnHomeScreen = true;
   private Boolean includeTableCountsOnHomeScreen = true;



   /*******************************************************************************
    **
    *******************************************************************************/
   public static MaterialDashboardAppMetaData of(QAppMetaData app)
   {
      return ((MaterialDashboardAppMetaData) CollectionUtils.nonNullMap(app.getSupplementalMetaData()).get(TYPE_NAME));
   }



   /*******************************************************************************
    ** either get the supplemental meta dat attached to an app - or create a new one
    ** and attach it to the app, and return that.
    *******************************************************************************/
   public static MaterialDashboardAppMetaData ofOrWithNew(QAppMetaData app)
   {
      MaterialDashboardAppMetaData materialDashboardAppMetaData = of(app);

      if(materialDashboardAppMetaData == null)
      {
         materialDashboardAppMetaData = new MaterialDashboardAppMetaData();
         app.withSupplementalMetaData(materialDashboardAppMetaData);
      }

      return (materialDashboardAppMetaData);
   }



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
      return TYPE_NAME;
   }



   /*******************************************************************************
    ** Getter for showAppLabelOnHomeScreen
    *******************************************************************************/
   public Boolean getShowAppLabelOnHomeScreen()
   {
      return (this.showAppLabelOnHomeScreen);
   }



   /*******************************************************************************
    ** Setter for showAppLabelOnHomeScreen
    *******************************************************************************/
   public void setShowAppLabelOnHomeScreen(Boolean showAppLabelOnHomeScreen)
   {
      this.showAppLabelOnHomeScreen = showAppLabelOnHomeScreen;
   }



   /*******************************************************************************
    ** Fluent setter for showAppLabelOnHomeScreen
    *******************************************************************************/
   public MaterialDashboardAppMetaData withShowAppLabelOnHomeScreen(Boolean showAppLabelOnHomeScreen)
   {
      this.showAppLabelOnHomeScreen = showAppLabelOnHomeScreen;
      return (this);
   }



   /*******************************************************************************
    ** Getter for includeTableCountsOnHomeScreen
    *******************************************************************************/
   public Boolean getIncludeTableCountsOnHomeScreen()
   {
      return (this.includeTableCountsOnHomeScreen);
   }



   /*******************************************************************************
    ** Setter for includeTableCountsOnHomeScreen
    *******************************************************************************/
   public void setIncludeTableCountsOnHomeScreen(Boolean includeTableCountsOnHomeScreen)
   {
      this.includeTableCountsOnHomeScreen = includeTableCountsOnHomeScreen;
   }



   /*******************************************************************************
    ** Fluent setter for includeTableCountsOnHomeScreen
    *******************************************************************************/
   public MaterialDashboardAppMetaData withIncludeTableCountsOnHomeScreen(Boolean includeTableCountsOnHomeScreen)
   {
      this.includeTableCountsOnHomeScreen = includeTableCountsOnHomeScreen;
      return (this);
   }

}
