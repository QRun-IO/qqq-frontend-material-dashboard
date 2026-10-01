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
 ** javalin handler that captures the context, for later review, e.g., of the
 ** query string or posted body
 *******************************************************************************/
public class CapturingHandler implements Handler
{
   Logger LOG = LogManager.getLogger(CapturingHandler.class);

   private final QSeleniumJavalin qSeleniumJavalin;



   /*******************************************************************************
    ** Constructor
    **
    *******************************************************************************/
   public CapturingHandler(QSeleniumJavalin qSeleniumJavalin)
   {
      this.qSeleniumJavalin = qSeleniumJavalin;
   }



   /*******************************************************************************
    **
    *******************************************************************************/
   @Override
   public void handle(Context context) throws Exception
   {
      if(qSeleniumJavalin.capturing)
      {
         LOG.info("Capturing request for path [" + context.path() + "]");
         qSeleniumJavalin.captured.add(new CapturedContext(context));
      }
      else
      {
         LOG.trace("Not capturing request for path [" + context.path() + "]");
      }
   }
}
