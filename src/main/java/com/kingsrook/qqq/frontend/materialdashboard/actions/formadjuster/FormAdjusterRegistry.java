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
import java.util.List;
import java.util.Map;
import com.kingsrook.qqq.backend.core.actions.customizers.QCodeLoader;
import com.kingsrook.qqq.backend.core.exceptions.QException;
import com.kingsrook.qqq.backend.core.logging.QLogger;
import com.kingsrook.qqq.backend.core.model.metadata.QInstance;
import com.kingsrook.qqq.backend.core.model.metadata.code.QCodeReference;
import com.kingsrook.qqq.backend.core.utils.ClassPathUtils;
import com.kingsrook.qqq.backend.javalin.QJavalinMetaData;
import com.kingsrook.qqq.frontend.materialdashboard.model.metadata.MaterialDashboardFieldMetaData;
import com.kingsrook.qqq.middleware.javalin.metadata.JavalinRouteProviderMetaData;


/*******************************************************************************
 ** Class that stores code-references for the application's defined fromAdjusters
 ** This class also, when registering its first formAdjuster, adds the route to
 ** the javalin instance to service form-adjuster calls from the frontend.
 *******************************************************************************/
public class FormAdjusterRegistry
{
   private static final QLogger LOG = QLogger.getLogger(FormAdjusterRegistry.class);

   private static boolean   didRegisterRouteProvider = false;
   private static QInstance lastRegisteredQInstance  = null;

   private static Map<String, QCodeReference> onChangeAdjusters = new HashMap<>();
   private static Map<String, QCodeReference> onLoadAdjusters   = new HashMap<>();



   /***************************************************************************
    * register on-load and on-change form adjusters for a given field.
    ***************************************************************************/
   public static void registerFormAdjusters(QInstance qInstance, MaterialDashboardFieldMetaData materialDashboardFieldMetaData) throws QException
   {
      ////////////////////////////////////////////////////////////////
      // add the code-references to the map of registered adjusters //
      ////////////////////////////////////////////////////////////////
      String identifier = materialDashboardFieldMetaData.getFormAdjusterIdentifier();

      QCodeReference onChangeCode = materialDashboardFieldMetaData.getOnChangeFormAdjuster();
      if(onChangeCode != null)
      {
         registerOnChangeFormAdjuster(qInstance, identifier, onChangeCode);
      }

      QCodeReference onLoadCode = materialDashboardFieldMetaData.getOnLoadFormAdjuster();
      if(onLoadCode != null)
      {
         registerOnLoadFormAdjuster(qInstance, identifier, onLoadCode);
      }
   }



   /***************************************************************************
    * make sure the route-provider is registered in javalin
    ***************************************************************************/
   private static void registerRouteProvider(QInstance qInstance) throws QException
   {
      //////////////////////////////////////////////////////////////////////////////////////////////////////////////
      // support hot-swaps, by checking if the input qInstance is different from one we previously registered for //
      //////////////////////////////////////////////////////////////////////////////////////////////////////////////
      if(didRegisterRouteProvider && lastRegisteredQInstance != qInstance)
      {
         didRegisterRouteProvider = false;
         onChangeAdjusters.clear();
         onLoadAdjusters.clear();
      }

      /////////////////////////////////////////////////////////////////////////////////////
      // if we need to register the javalin router, do so (only once per qInstance)      //
      // note, javalin is optional dep, so make sure it's available before try to use it //
      /////////////////////////////////////////////////////////////////////////////////////
      if(!didRegisterRouteProvider)
      {
         if(ClassPathUtils.isClassAvailable(QJavalinMetaData.class.getName()))
         {
            QJavalinMetaData javalinMetaData = QJavalinMetaData.ofOrWithNew(qInstance);
            javalinMetaData.withRouteProvider(new JavalinRouteProviderMetaData()
               .withHostedPath("/material-dashboard-backend/form-adjuster/{identifier}/{event}")
               .withMethods(List.of("POST"))
               .withProcessName(RunFormAdjusterProcess.NAME)
            );

            qInstance.add(new RunFormAdjusterProcess().produce(qInstance));
         }

         didRegisterRouteProvider = true;
         lastRegisteredQInstance = qInstance;
      }
   }



   /***************************************************************************
    * register an on-change form adjuster
    ***************************************************************************/
   public static void registerOnChangeFormAdjuster(QInstance qInstance, String identifier, QCodeReference codeReference) throws QException
   {
      registerRouteProvider(qInstance);

      if(onChangeAdjusters.containsKey(identifier) && !onChangeAdjusters.get(identifier).equals(codeReference))
      {
         LOG.warn("Attempt to register more than one onChangeFormAdjuster with identifier: " + identifier);
      }
      onChangeAdjusters.put(identifier, codeReference);
   }



   /***************************************************************************
    * register an on-load form adjuster
    ***************************************************************************/
   public static void registerOnLoadFormAdjuster(QInstance qInstance, String identifier, QCodeReference codeReference) throws QException
   {
      registerRouteProvider(qInstance);

      if(onLoadAdjusters.containsKey(identifier) && !onLoadAdjusters.get(identifier).equals(codeReference))
      {
         LOG.warn("Attempt to register more than one onLoadFormAdjuster with identifier: " + identifier);
      }
      onLoadAdjusters.put(identifier, codeReference);
   }



   /***************************************************************************
    **
    ***************************************************************************/
   static FormAdjusterInterface getOnChangeAdjuster(String identifier)
   {
      QCodeReference codeReference = onChangeAdjusters.get(identifier);
      if(codeReference != null)
      {
         return QCodeLoader.getAdHoc(FormAdjusterInterface.class, codeReference);
      }
      return (null);
   }



   /***************************************************************************
    **
    ***************************************************************************/
   static FormAdjusterInterface getOnLoadAdjuster(String identifier)
   {
      QCodeReference codeReference = onLoadAdjusters.get(identifier);
      if(codeReference != null)
      {
         return QCodeLoader.getAdHoc(FormAdjusterInterface.class, codeReference);
      }
      return (null);
   }

}
