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

package com.kingsrook.qqq.frontend.materialdashboard.seleniumwithqapplication.lib;


import com.kingsrook.qqq.backend.core.exceptions.QException;
import com.kingsrook.qqq.backend.core.model.metadata.QInstance;
import com.kingsrook.qqq.middleware.javalin.QApplicationJavalinServer;


/*******************************************************************************
 * container for a {@link QApplicationJavalinServer} started by selenium tests,
 * to serve a full qqq application, rather than mock/fixture json files.
 *******************************************************************************/
public class TestApplicationServer
{
   private       QApplicationJavalinServer javalinServer;
   private final TestApplication           testApplication;



   /*******************************************************************************
    ** Constructor
    **
    *******************************************************************************/
   public TestApplicationServer() throws QException
   {
      this.testApplication = new TestApplication();
   }



   /***************************************************************************
    *
    ***************************************************************************/
   public void start() throws QException
   {
      javalinServer = new QApplicationJavalinServer(testApplication)
         .withPort(8001)
         .withServeFrontendMaterialDashboard(false)
         .withServeLegacyUnversionedMiddlewareAPI(true);

      javalinServer.start();
   }



   /***************************************************************************
    *
    ***************************************************************************/
   public void stop()
   {
      javalinServer.stop();
   }



   /***************************************************************************
    *
    ***************************************************************************/
   public QInstance getQInstance()
   {
      return testApplication.getQInstance();
   }
}
