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

package com.kingsrook.qqq.frontend.materialdashboard.selenium.lib;


import java.util.Optional;
import org.junit.jupiter.api.extension.ExtensionContext;
import org.junit.jupiter.api.extension.TestWatcher;


/*******************************************************************************
 **
 *******************************************************************************/
public class SeleniumTestWatcher implements TestWatcher
{
   private static QSeleniumLib qSeleniumLib;



   /*******************************************************************************
    **
    *******************************************************************************/
   public static void setCurrentSeleniumLib(QSeleniumLib qSeleniumLib)
   {
      SeleniumTestWatcher.qSeleniumLib = qSeleniumLib;
   }



   /*******************************************************************************
    **
    *******************************************************************************/
   @Override
   public void testFailed(ExtensionContext context, Throwable cause)
   {
      if(qSeleniumLib != null)
      {
         System.out.println("Dumping browser console after failed test: " + context.getDisplayName());
         System.out.println("----------------------------------------------------------------------------");
         try
         {
            qSeleniumLib.dumpConsole();
         }
         catch(Exception e)
         {
            System.out.println("Error dumping console:");
            e.printStackTrace();
         }
         System.out.println("----------------------------------------------------------------------------");
      }

      tryToQuitSelenium();
   }



   /*******************************************************************************
    **
    *******************************************************************************/
   private void tryToQuitSelenium()
   {
      if(qSeleniumLib != null)
      {
         try
         {
            qSeleniumLib.driver.quit();
         }
         catch(Exception e)
         {
            System.err.println("Error quiting selenium driver: " + e.getMessage());
         }
      }
   }



   /*******************************************************************************
    **
    *******************************************************************************/
   @Override
   public void testSuccessful(ExtensionContext context)
   {
      tryToQuitSelenium();
   }



   /*******************************************************************************
    **
    *******************************************************************************/
   @Override
   public void testAborted(ExtensionContext context, Throwable cause)
   {
      tryToQuitSelenium();
   }



   /*******************************************************************************
    **
    *******************************************************************************/
   @Override
   public void testDisabled(ExtensionContext context, Optional<String> reason)
   {
      tryToQuitSelenium();
   }
}
