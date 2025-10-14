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

package com.kingsrook.qqq.frontend.materialdashboard.selenium.lib.javalin;


import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import com.kingsrook.qqq.backend.core.utils.CollectionUtils;
import com.kingsrook.qqq.frontend.materialdashboard.selenium.lib.QSeleniumLib;
import io.javalin.Javalin;
import io.javalin.apibuilder.ApiBuilder;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.eclipse.jetty.server.Connector;
import org.eclipse.jetty.server.HttpConnectionFactory;
import static org.junit.jupiter.api.Assertions.fail;


/*******************************************************************************
 ** Javalin server manager for use with by Selenium tests!!
 *******************************************************************************/
public class QSeleniumJavalin
{
   Logger LOG = LogManager.getLogger(QSeleniumJavalin.class);

   private long WAIT_SECONDS = 10;

   private Map<String, String> routesToFiles   = new LinkedHashMap<>();
   private Map<String, String> routesToStrings = new LinkedHashMap<>();

   private Javalin javalin;

   ////////////////////////////////////////////////////////////////////////////////////////
   // multiple javalin threads will be running and hitting these structures in parallel, //
   // so it's critical to wrap collections in synchronized versions!!                    //
   ////////////////////////////////////////////////////////////////////////////////////////
   List<String> routeFilesServed = Collections.synchronizedList(new ArrayList<>());
   List<String> pathsThat404ed   = Collections.synchronizedList(new ArrayList<>());

   boolean               capturing = false;
   List<CapturedContext> captured  = Collections.synchronizedList(new ArrayList<>());



   /*******************************************************************************
    ** Constructor
    **
    *******************************************************************************/
   public QSeleniumJavalin()
   {
   }



   /*******************************************************************************
    **
    *******************************************************************************/
   public void clearRoutes()
   {
      this.routesToFiles.clear();
      this.routesToStrings.clear();
   }



   /*******************************************************************************
    ** Fluent setter for routeToFile
    **
    *******************************************************************************/
   public QSeleniumJavalin withRouteToFile(String path, String fixtureFilePath)
   {
      if(this.routesToFiles == null)
      {
         this.routesToFiles = new LinkedHashMap<>();
      }
      this.routesToFiles.put(path, fixtureFilePath);
      return (this);
   }



   /*******************************************************************************
    **
    *******************************************************************************/
   public QSeleniumJavalin withRouteToString(String path, String responseString)
   {
      if(this.routesToStrings == null)
      {
         this.routesToStrings = new LinkedHashMap<>();
      }
      this.routesToStrings.put(path, responseString);
      return (this);
   }



   /*******************************************************************************
    **
    *******************************************************************************/
   public QSeleniumJavalin start()
   {
      javalin = Javalin.create(config ->
      {
         config.router.apiBuilder(
            () ->
            {
               for(Map.Entry<String, String> routeToFile : CollectionUtils.nonNullMap(routesToFiles).entrySet())
               {
                  LOG.debug("Setting up route for [" + routeToFile.getKey() + "] => [" + routeToFile.getValue() + "]");
                  ApiBuilder.get(routeToFile.getKey(), new RouteFromFileHandler(this, routeToFile.getKey(), routeToFile.getValue()));
                  ApiBuilder.post(routeToFile.getKey(), new RouteFromFileHandler(this, routeToFile.getKey(), routeToFile.getValue()));
               }

               for(Map.Entry<String, String> routeToString : CollectionUtils.nonNullMap(routesToStrings).entrySet())
               {
                  LOG.debug("Setting up route for [" + routeToString.getKey() + "] => [" + routeToString.getValue() + "]");
                  ApiBuilder.get(routeToString.getKey(), new RouteFromStringHandler(this, routeToString.getKey(), routeToString.getValue()));
                  ApiBuilder.post(routeToString.getKey(), new RouteFromStringHandler(this, routeToString.getKey(), routeToString.getValue()));
               }
            }
         );

      }).start(8001);

      javalin.before(new CapturingHandler(this));

      javalin.error(404, context -> {
         LOG.warn("Returning 404 for [" + context.method() + " " + context.path() + "]");
         pathsThat404ed.add(context.path());
      });

      ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
      // to accept "large" access tokens in Authorization: Bearer <token> headers (e.g., with 100s of permissions), //
      // we need a larger size allowed for HTTP headers (javalin/jetty default is 8K)                               //
      // making this too large can waste resources and open one up to various DOS attacks, supposedly.              //
      // (Note, this must happen after the javalin service.start call)                                              //
      ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
      for(Connector connector : javalin.jettyServer().server().getConnectors())
      {
         connector.getConnectionFactory(HttpConnectionFactory.class).getHttpConfiguration().setRequestHeaderSize(65535);
      }

      return (this);
   }



   /*******************************************************************************
    **
    *******************************************************************************/
   public void stop()
   {
      if(javalin != null)
      {
         javalin.stop();
         javalin = null;
      }
   }



   /*******************************************************************************
    **
    *******************************************************************************/
   public void restart()
   {
      stop();
      start();
   }



   /*******************************************************************************
    **
    *******************************************************************************/
   public void report()
   {
      LOG.info("Paths that 404'ed:");
      pathsThat404ed.forEach(s -> LOG.info(" - " + s));

      LOG.info("Routes served as static files:");
      routeFilesServed.forEach(s -> LOG.info(" - " + s));
   }



   /*******************************************************************************
    **
    *******************************************************************************/
   public void beginCapture()
   {
      LOG.info("Beginning to capture requests now");
      capturing = true;
      captured.clear();
   }



   /*******************************************************************************
    **
    *******************************************************************************/
   public void endCapture()
   {
      LOG.info("Ending capturing of requests now");
      capturing = false;
   }



   /*******************************************************************************
    **
    *******************************************************************************/
   public List<CapturedContext> getCaptured()
   {
      return (captured);
   }



   /*******************************************************************************
    **
    *******************************************************************************/
   public CapturedContext waitForCapturedPath(String path)
   {
      LOG.debug("Waiting for captured request for path [" + path + "]");
      long start = System.currentTimeMillis();

      do
      {
         // LOG.debug("  captured paths: " + captured.stream().map(CapturedContext::getPath).collect(Collectors.joining(",")));
         for(CapturedContext context : captured)
         {
            if(context.getPath().equals(path))
            {
               LOG.debug("Found captured request for path [" + path + "]");
               return (context);
            }
         }

         QSeleniumLib.sleepABit();
      }
      while(start + (1000 * WAIT_SECONDS) > System.currentTimeMillis());

      fail("Failed to capture a request for path [" + path + "] after [" + WAIT_SECONDS + "] seconds.");
      return (null);
   }



   /*******************************************************************************
    **
    *******************************************************************************/
   public CapturedContext waitForCapturedPathWithBodyContaining(String path, String bodyContaining)
   {
      LOG.debug("Waiting for captured request for path [" + path + "] with body containing [" + bodyContaining + "]");
      long start = System.currentTimeMillis();

      do
      {
         for(CapturedContext context : captured)
         {
            if(context.getPath().equals(path))
            {
               if(context.getBody() != null && context.getBody().contains(bodyContaining))
               {
                  LOG.debug("Found captured request for path [" + path + "] with body containing [" + bodyContaining + "]");
                  return (context);
               }
            }
         }

         QSeleniumLib.sleepABit();
      }
      while(start + (1000 * WAIT_SECONDS) > System.currentTimeMillis());

      LOG.debug("  captured paths: \n   " + captured.stream().map(cc -> cc.getPath() + "[" + cc.getBody() + "]").collect(Collectors.joining("\n   ")));
      fail("Failed to capture a request for path [" + path + "] with body containing [" + bodyContaining + "] after [" + WAIT_SECONDS + "] seconds.");
      return (null);
   }

}
