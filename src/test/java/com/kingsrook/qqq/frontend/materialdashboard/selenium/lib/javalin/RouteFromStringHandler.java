/*
 * QQQ - Low-code Application Framework for Engineers.
 * Copyright (C) 2021-2024.  Kingsrook, LLC
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

package com.kingsrook.qqq.frontend.materialdashboard.selenium.lib.javalin;


import io.javalin.http.Context;
import io.javalin.http.Handler;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;


/*******************************************************************************
 ** javalin handler for returning a static string for a route
 *******************************************************************************/
public class RouteFromStringHandler implements Handler
{
   Logger LOG = LogManager.getLogger(RouteFromStringHandler.class);

   private final String           route;
   private final String           responseString;
   private final QSeleniumJavalin qSeleniumJavalin;



   /*******************************************************************************
    ** Constructor
    **
    *******************************************************************************/
   public RouteFromStringHandler(QSeleniumJavalin qSeleniumJavalin, String route, String responseString)
   {
      this.qSeleniumJavalin = qSeleniumJavalin;
      this.route = route;
      this.responseString = responseString;
   }



   /*******************************************************************************
    **
    *******************************************************************************/
   @Override
   public void handle(Context context)
   {
      qSeleniumJavalin.routeFilesServed.add(this.route);
      LOG.debug("Serving route [" + this.route + "] via static String");
      context.result(this.responseString);
   }
}
