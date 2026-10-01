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
         .withPort(Integer.getInteger("qqq.test.backendPort", 8001))
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
