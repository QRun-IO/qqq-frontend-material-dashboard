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

package com.kingsrook.qqq.frontend.materialdashboard.seleniumwithqapplication.lib;


import java.io.File;
import java.io.IOException;
import java.lang.reflect.Method;
import java.net.Socket;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Optional;
import com.kingsrook.qqq.backend.core.context.CapturedContext;
import com.kingsrook.qqq.backend.core.context.QContext;
import com.kingsrook.qqq.backend.core.exceptions.QException;
import com.kingsrook.qqq.backend.core.model.metadata.QInstance;
import com.kingsrook.qqq.backend.core.model.session.QSystemUserSession;
import com.kingsrook.qqq.backend.core.modules.backend.implementations.memory.MemoryRecordStore;
import com.kingsrook.qqq.backend.core.utils.CollectionUtils;
import com.kingsrook.qqq.frontend.materialdashboard.selenium.lib.QFMDSeleniumLib;
import com.kingsrook.qqq.frontend.materialdashboard.selenium.lib.QSeleniumLib;
import com.kingsrook.qqq.frontend.materialdashboard.selenium.lib.SeleniumTestWatcher;
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
 * Base class for Selenium tests that use the {@link TestApplicationServer}
 * - e.g., a full QQQ-based application server - not mocked json routes in a hack
 * of a javalin server.
 *
 * Note this class is copied from
 * {@link com.kingsrook.qqq.frontend.materialdashboard.selenium.lib.QBaseSeleniumTest}.
 * In theory these could share a common ancestor and just handle the javalin server
 * bits differently.  But in practice, that one might just end up going away,
 * and we only have 2 at this point (so no rule of 3 yet).  Plus not clear how these
 * might need to drift from each other and/or if there's a ton of changes ever made
 * in there (it tends to be faily stable).
 *******************************************************************************/
@ExtendWith(SeleniumTestWatcher.class)
public class QBaseSeleniumWithQApplicationTest
{
   protected static ChromeOptions chromeOptions;

   protected WebDriver             driver;
   protected TestApplicationServer testApplicationServer;

   protected QSeleniumLib    qSeleniumLib;
   protected QFMDSeleniumLib qfmdSeleniumLib;

   protected TestInfo testInfo;



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

      //////////////////////////////////////////////////////////////////////////////////////
      // before chrome is started, check if we can connect to the base URL.  If not, fail //
      // the test early with a more helpful error message than you might otherwise get    //
      //////////////////////////////////////////////////////////////////////////////////////
      assertBaseUrlHostAndPortIsConnectable();

      WebDriverManager.chromedriver().setup();
   }



   /*******************************************************************************
    **
    *******************************************************************************/
   @BeforeEach
   public void beforeEach(TestInfo testInfo) throws QException
   {
      this.testInfo = testInfo;
      manageDownloadsDirectory();

      HashMap<String, Object> chromePrefs = new HashMap<>();
      chromePrefs.put("profile.default_content_settings.popups", 0);
      chromePrefs.put("download.default_directory", getDownloadsDirectory());
      chromeOptions.setExperimentalOption("prefs", chromePrefs);

      driver = new ChromeDriver(chromeOptions);

      driver.manage().window().setSize(new Dimension(1700, 1300));
      qSeleniumLib = new QSeleniumLib(driver);
      qfmdSeleniumLib = new QFMDSeleniumLib(qSeleniumLib);

      SeleniumTestWatcher.setCurrentSeleniumLib(qSeleniumLib);

      if(useInternalJavalin())
      {
         testApplicationServer = new TestApplicationServer();

         customizeQInstance(testApplicationServer.getQInstance());
         QContext.withTemporaryContext(new CapturedContext(testApplicationServer.getQInstance(), new QSystemUserSession()), () ->
         {
            setupTestData();
         });

         testApplicationServer.start();
      }
   }



   /***************************************************************************
    *
    ***************************************************************************/
   protected static void assertBaseUrlHostAndPortIsConnectable()
   {
      String baseUrl = new QSeleniumLib(null).getBaseUrl();
      String  host;
      Integer port;

      try
      {
         host = baseUrl.substring(baseUrl.indexOf("//") + 2).replaceAll("[:/].*", "");
         port = Integer.parseInt(baseUrl.substring(baseUrl.lastIndexOf(":") + 1).replaceAll("/.*", ""));
      }
      catch(Exception e)
      {
         fail("Failed to parse hostname or port from baseUrl [" + baseUrl + "]", e);
         return;
      }

      try(Socket ignored = new Socket(host, port))
      {
         //////////////////////
         // test can proceed //
         //////////////////////
         System.out.println("Connection to [" + host + ":" + port + "] successful.  Continuing with test.");
      }
      catch (IOException e)
      {
         ////////////////
         // fail early //
         ////////////////
         fail("Could not connect to [" + host + ":" + port + "].  Is a material-dashboard server running?", e);
      }
   }



   /*******************************************************************************
    **
    *******************************************************************************/
   @AfterEach
   void afterEach() throws QException
   {
      MemoryRecordStore.fullReset();
      cleanupTestData();
   }



   /***************************************************************************
    *
    ***************************************************************************/
   protected void customizeQInstance(QInstance qInstance) throws QException
   {
      //////////////////
      // noop at base //
      //////////////////
   }



   /***************************************************************************
    * To allow each test method to have different qInstance customization (which
    * must be set up in the BeforeEach part of the JUnit flow - not within the @Test)
    * while keeping that setup ("given") code closer to the test method itself
    * and not having a big switch in the @BeforeEach method, this method
    * allows @Test methods to have a @Tag, with a value of "customizeQInstance..."
    * - where that tag value is assumed to be a method name (must start with
    * "customizeQInstance"), which takes a QInstance parameter
    *
    * <p>The full pattern here being (with a call to this method in customizeQInstance):
    *
    * <pre>
    *    public void customizeQInstanceForTestFooBar(QInstance qInstance)
    *    {
    *       // customize the qInstance for this test here.
    *       // qInstance.with...
    *    }
    *
    *    &commat;Test
    *    &commat;Tag("customizeQInstanceForTestFooBar")
    *    public void testFooBar()
    *    {
    *       // run the test here.
    *       // qSeleniumLib.gotoAndWaitForBreadcrumbHeaderToContain...
    *       // qSeleniumLib.waitForSelectorContaining...
    *    }
    * </pre>
    ***************************************************************************/
   protected void customizeQInstanceViaTestMethodTagSpecifyingCustomizeQInstanceMethodName(QInstance qInstance) throws QException
   {
      Optional<String> customizeQInstanceTag = testInfo.getTags().stream().filter(s -> s.matches("^customizeQInstance.*")).findFirst();
      if(customizeQInstanceTag.isPresent())
      {
         try
         {
            Method method = getClass().getMethod(customizeQInstanceTag.get(), QInstance.class);
            method.invoke(this, qInstance);
         }
         catch(NoSuchMethodException e)
         {
            fail("Missing method: [public void " + customizeQInstanceTag.get() + "(QInstance)] specified in @Tag(\"customizeQInstance...\") for [" + testInfo.getDisplayName() + "]");
         }
         catch(Exception e)
         {
            throw (new QException("Error in customizeQInstanceViaTestMethodTagSpecifyingDoMethodName", e));
         }
      }
   }


   /***************************************************************************
    *
    ***************************************************************************/
   protected void setupTestData() throws QException
   {
      //////////////////
      // noop at base //
      //////////////////
   }



   /***************************************************************************
    *
    ***************************************************************************/
   protected void cleanupTestData() throws QException
   {
      //////////////////
      // noop at base //
      //////////////////
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

      if(testApplicationServer != null)
      {
         testApplicationServer.stop();
      }
   }

}
