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

package com.kingsrook.qqq.frontend.materialdashboard.selenium.lib;


import java.io.File;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import com.kingsrook.qqq.backend.core.utils.CollectionUtils;
import com.kingsrook.qqq.frontend.materialdashboard.selenium.lib.javalin.QSeleniumJavalin;
import io.github.bonigarcia.wdm.WebDriverManager;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.TestInfo;
import org.junit.jupiter.api.extension.ExtendWith;
import org.openqa.selenium.Dimension;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import static org.junit.jupiter.api.Assertions.fail;


/*******************************************************************************
 ** Base class for Selenium tests
 *******************************************************************************/
@ExtendWith(SeleniumTestWatcher.class)
public class QBaseSeleniumTest
{
   protected static ChromeOptions chromeOptions;

   protected WebDriver        driver;
   protected QSeleniumJavalin qSeleniumJavalin;
   protected QSeleniumLib     qSeleniumLib;



   /*******************************************************************************
    **
    *******************************************************************************/
   @BeforeAll
   static void beforeAll()
   {
      chromeOptions = new ChromeOptions();
      chromeOptions.setAcceptInsecureCerts(true);
      chromeOptions.addArguments("--ignore-certificate-errors");
      chromeOptions.addArguments("--remote-allow-origins=*");

      String headless = System.getenv("QQQ_SELENIUM_HEADLESS");
      if("true".equals(headless))
      {
         chromeOptions.addArguments("--headless=new");
      }

      WebDriverManager.chromiumdriver().setup();
   }



   /*******************************************************************************
    **
    *******************************************************************************/
   @BeforeEach
   public void beforeEach()
   {
      manageDownloadsDirectory();

      HashMap<String, Object> chromePrefs = new HashMap<>();
      chromePrefs.put("profile.default_content_settings.popups", 0);
      chromePrefs.put("download.default_directory", getDownloadsDirectory());
      chromeOptions.setExperimentalOption("prefs", chromePrefs);

      driver = new ChromeDriver(chromeOptions);

      driver.manage().window().setSize(new Dimension(1700, 1300));
      qSeleniumLib = new QSeleniumLib(driver);

      SeleniumTestWatcher.setCurrentSeleniumLib(qSeleniumLib);

      if(useInternalJavalin())
      {
         qSeleniumJavalin = new QSeleniumJavalin();
         addJavalinRoutes(qSeleniumJavalin);
         qSeleniumJavalin.start();
      }
   }



   /*******************************************************************************
    **
    *******************************************************************************/
   private void manageDownloadsDirectory()
   {
      File downloadsDirectory = new File(getDownloadsDirectory());
      if(!downloadsDirectory.exists())
      {
         if(!downloadsDirectory.mkdir())
         {
            fail("Could not create downloads directory: " + downloadsDirectory);
         }
      }

      if(!downloadsDirectory.isDirectory())
      {
         fail("Downloads directory: " + downloadsDirectory + " is not a directory.");
      }

      for(File file : CollectionUtils.nonNullArray(downloadsDirectory.listFiles()))
      {
         if(!file.delete())
         {
            fail("Could not remove a file from the downloads directory: " + file.getAbsolutePath());
         }
      }
   }



   /*******************************************************************************
    **
    *******************************************************************************/
   protected String getDownloadsDirectory()
   {
      return ("/tmp/selenium-downloads");
   }



   /*******************************************************************************
    **
    *******************************************************************************/
   protected List<File> getDownloadedFiles()
   {
      File[] downloadedFiles = CollectionUtils.nonNullArray((new File(getDownloadsDirectory())).listFiles());
      return (Arrays.stream(downloadedFiles).toList());
   }



   /*******************************************************************************
    ** control if the test needs to start its own javalin server, or if we're running
    ** in an environment where an external web server is being used.
    *******************************************************************************/
   protected boolean useInternalJavalin()
   {
      return (true);
   }



   /*******************************************************************************
    ** meant for sub-classes to define their own javalin routes, if they need to
    *******************************************************************************/
   protected void addJavalinRoutes(QSeleniumJavalin qSeleniumJavalin)
   {
      qSeleniumJavalin
         .withRouteToFile("/metaData", "metaData/index.json")
         .withRouteToFile("/metaData/authentication", "metaData/authentication.json")
         .withRouteToFile("/metaData/table/person", "metaData/table/person.json")
         .withRouteToFile("/metaData/table/city", "metaData/table/person.json")
         .withRouteToFile("/metaData/table/script", "metaData/table/script.json")
         .withRouteToFile("/metaData/table/scriptRevision", "metaData/table/scriptRevision.json")
         .withRouteToFile("/qqq/v1/metaData/table/person", "qqq/v1/metaData/table/person.json")
         .withRouteToFile("/qqq/v1/metaData/table/city", "qqq/v1/metaData/table/city.json")
         .withRouteToFile("/qqq/v1/metaData/table/script", "qqq/v1/metaData/table/script.json")
         .withRouteToFile("/qqq/v1/metaData/table/scriptRevision", "qqq/v1/metaData/table/scriptRevision.json")
         .withRouteToFile("/processes/querySavedView/init", "processes/querySavedView/init.json");

   }



   /*******************************************************************************
    **
    *******************************************************************************/
   @AfterEach
   void afterEach(TestInfo testInfo)
   {
      if(qSeleniumLib == null)
      {
         System.err.println("Cannot take after-test screenshot, as qSeleniumLib is null.");
      }
      else
      {
         qSeleniumLib.takeScreenshotToFile(getClass().getSimpleName() + "/" + testInfo.getDisplayName());
      }

      ////////////////////////////////////////////////////////////////////////////////////////
      // note - at one time we did a driver.quit here - but we're moving that into          //
      // SeleniumTestWatcher, so it can dump logs if it wants to (it runs after the @After) //
      ////////////////////////////////////////////////////////////////////////////////////////

      if(qSeleniumJavalin != null)
      {
         qSeleniumJavalin.stop();
      }
   }

}
