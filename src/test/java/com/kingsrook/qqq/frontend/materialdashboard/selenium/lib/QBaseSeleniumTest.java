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
import org.junit.jupiter.api.AfterAll;
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
   protected static String userDataDir;

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
      
      // CI-specific Chrome options to prevent conflicts
      chromeOptions.addArguments("--no-sandbox");
      chromeOptions.addArguments("--disable-dev-shm-usage");
      chromeOptions.addArguments("--disable-gpu");
      chromeOptions.addArguments("--disable-extensions");
      chromeOptions.addArguments("--disable-background-timer-throttling");
      chromeOptions.addArguments("--disable-backgrounding-occluded-windows");
      chromeOptions.addArguments("--disable-renderer-backgrounding");
      chromeOptions.addArguments("--disable-features=TranslateUI");
      chromeOptions.addArguments("--disable-ipc-flooding-protection");
      chromeOptions.addArguments("--disable-web-security");
      chromeOptions.addArguments("--disable-features=VizDisplayCompositor");
      chromeOptions.addArguments("--timeout=30000");
      
      // Additional options for GitHub Actions stability
      chromeOptions.addArguments("--disable-setuid-sandbox");
      chromeOptions.addArguments("--disable-background-networking");
      chromeOptions.addArguments("--disable-default-apps");
      chromeOptions.addArguments("--disable-sync");
      chromeOptions.addArguments("--disable-translate");
      chromeOptions.addArguments("--hide-scrollbars");
      chromeOptions.addArguments("--metrics-recording-only");
      chromeOptions.addArguments("--mute-audio");
      chromeOptions.addArguments("--no-first-run");
      chromeOptions.addArguments("--safebrowsing-disable-auto-update");
      chromeOptions.addArguments("--disable-client-side-phishing-detection");
      chromeOptions.addArguments("--disable-component-extensions-with-background-pages");
      chromeOptions.addArguments("--disable-hang-monitor");
      chromeOptions.addArguments("--disable-prompt-on-repost");
      chromeOptions.addArguments("--disable-domain-reliability");
      chromeOptions.addArguments("--disable-features=AudioServiceOutOfProcess");
      chromeOptions.addArguments("--disable-features=MediaRouter");
      chromeOptions.addArguments("--force-color-profile=srgb");
      chromeOptions.addArguments("--memory-pressure-off");
      chromeOptions.addArguments("--max_old_space_size=4096");
      
      // Critical options for GitHub Actions headless mode
      chromeOptions.addArguments("--window-size=1700,1300");
      chromeOptions.addArguments("--disable-blink-features=AutomationControlled");
      chromeOptions.addArguments("--run-all-compositor-stages-before-draw");
      chromeOptions.addArguments("--disable-software-rasterizer");
      
      // Use unique user data directory for each test run
      userDataDir = "/tmp/chrome-user-data-" + System.currentTimeMillis() + "-" + Thread.currentThread().getId();
      chromeOptions.addArguments("--user-data-dir=" + userDataDir);

      // Enable headless mode in CI environments or when explicitly requested
      String headless = System.getenv("QQQ_SELENIUM_HEADLESS");
      String ci = System.getenv("CI");
      String githubActions = System.getenv("GITHUB_ACTIONS");
      
      if("true".equals(headless) || "true".equals(ci) || "true".equals(githubActions))
      {
         chromeOptions.addArguments("--headless=new");
         System.out.println("Running in headless mode (CI environment detected)");
      }

      // Configure WebDriverManager for CI environments
      WebDriverManager.chromiumdriver()
         .clearDriverCache()
         .setup();
      
      // Debug: Print Chrome options (using asMap() instead of getArguments())
      System.out.println("Chrome Options: " + chromeOptions.asMap());
      System.out.println("User Data Dir: " + userDataDir);
      System.out.println("CI Environment: " + ci);
      System.out.println("GitHub Actions: " + githubActions);
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

      try {
         driver = new ChromeDriver(chromeOptions);
         
         // Set timeouts for better stability in CI
         driver.manage().timeouts().implicitlyWait(java.time.Duration.ofSeconds(10));
         driver.manage().timeouts().pageLoadTimeout(java.time.Duration.ofSeconds(30));
         driver.manage().timeouts().scriptTimeout(java.time.Duration.ofSeconds(30));
         
         // Only set window size if not in headless mode (window size is set via Chrome options in headless)
         String headless = System.getenv("QQQ_SELENIUM_HEADLESS");
         String ci = System.getenv("CI");
         String githubActions = System.getenv("GITHUB_ACTIONS");
         
         if(!"true".equals(headless) && !"true".equals(ci) && !"true".equals(githubActions))
         {
            try {
               driver.manage().window().setSize(new Dimension(1700, 1300));
            } catch (Exception e) {
               System.err.println("Warning: Could not set window size: " + e.getMessage());
               // Continue without setting window size
            }
         }
         
         qSeleniumLib = new QSeleniumLib(driver);
         
         System.out.println("Chrome driver initialized successfully");
      } catch (Exception e) {
         System.err.println("Failed to initialize Chrome driver: " + e.getMessage());
         e.printStackTrace();
         throw e;
      }

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
      
      // Clean up Chrome user data directory
      if(userDataDir != null)
      {
         try
         {
            File userDataDirFile = new File(userDataDir);
            if(userDataDirFile.exists())
            {
               // Delete the directory and all its contents
               deleteDirectory(userDataDirFile);
            }
         }
         catch(Exception e)
         {
            System.err.println("Failed to clean up Chrome user data directory: " + userDataDir + " - " + e.getMessage());
         }
      }
   }



   /*******************************************************************************
    ** Cleanup after all tests in the class
    *******************************************************************************/
   @AfterAll
   static void afterAll()
   {
      // Final cleanup of Chrome user data directory
      if(userDataDir != null)
      {
         try
         {
            File userDataDirFile = new File(userDataDir);
            if(userDataDirFile.exists())
            {
               deleteDirectory(userDataDirFile);
            }
         }
         catch(Exception e)
         {
            System.err.println("Failed to clean up Chrome user data directory in afterAll: " + userDataDir + " - " + e.getMessage());
         }
      }
   }



   /*******************************************************************************
    ** Helper method to recursively delete a directory and all its contents
    *******************************************************************************/
   private static void deleteDirectory(File directory)
   {
      if(directory.exists())
      {
         File[] files = directory.listFiles();
         if(files != null)
         {
            for(File file : files)
            {
               if(file.isDirectory())
               {
                  deleteDirectory(file);
               }
               else
               {
                  file.delete();
               }
            }
         }
         directory.delete();
      }
   }

}
