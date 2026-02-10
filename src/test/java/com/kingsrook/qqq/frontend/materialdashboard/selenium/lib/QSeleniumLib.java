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
import java.time.Duration;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;
import java.util.function.Function;
import java.util.function.Predicate;
import com.kingsrook.qqq.backend.core.utils.SleepUtils;
import org.apache.commons.io.FileUtils;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.NoSuchElementException;
import org.openqa.selenium.OutputType;
import org.openqa.selenium.StaleElementReferenceException;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.interactions.Actions;
import org.openqa.selenium.logging.LogEntries;
import org.openqa.selenium.logging.LogEntry;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.fail;


/*******************************************************************************
 ** Library working with Selenium!
 *
 * Note that this class is differentiated from {@link QFMDSeleniumLib}, in that
 * this class should be more generic - e.g., for frontends other than QFMD (it
 * might have a few methods that break that rule, like the breadcrumb one), whereas
 * that class is all about QFMD selectors.
 *******************************************************************************/
public class QSeleniumLib
{
   Logger LOG = LogManager.getLogger(QSeleniumLib.class);

   public final WebDriver driver;

   private long    WAIT_SECONDS        = 10;
   private String  BASE_URL            = "https://localhost:3001";
   private boolean SCREENSHOTS_ENABLED = true;
   private String  SCREENSHOTS_PATH    = "/tmp/QSeleniumScreenshots/";

   private boolean autoHighlight = false;

   //////////////////////////////////////////////////////////////////////////////////////
   // useful to use on a WebElement, in a call like: .findElement(QSeleniumLib.PARENT) //
   //////////////////////////////////////////////////////////////////////////////////////
   public static final By PARENT = By.xpath("./..");



   /*******************************************************************************
    ** Constructor
    **
    *******************************************************************************/
   public QSeleniumLib(WebDriver webDriver)
   {
      this.driver = webDriver;
   }



   /*******************************************************************************
    ** Fluent setter for waitSeconds
    **
    *******************************************************************************/
   public QSeleniumLib withWaitSeconds(int waitSeconds)
   {
      WAIT_SECONDS = waitSeconds;
      return (this);
   }



   /*******************************************************************************
    ** Fluent setter for screenshotsEnabled
    **
    *******************************************************************************/
   public QSeleniumLib withScreenshotsEnabled(boolean screenshotsEnabled)
   {
      SCREENSHOTS_ENABLED = screenshotsEnabled;
      return (this);
   }



   /*******************************************************************************
    ** Fluent setter for screenshotsPath
    **
    *******************************************************************************/
   public QSeleniumLib withScreenshotsPath(String screenshotsPath)
   {
      SCREENSHOTS_PATH = screenshotsPath;
      return (this);
   }



   /*******************************************************************************
    ** Fluent setter for baseUrl
    **
    *******************************************************************************/
   public QSeleniumLib withBaseUrl(String baseUrl)
   {
      BASE_URL = baseUrl;
      return (this);
   }



   /*******************************************************************************
    ** Getter for BASE_URL
    **
    *******************************************************************************/
   public String getBaseUrl()
   {
      return BASE_URL;
   }



   /*******************************************************************************
    **
    *******************************************************************************/
   public void waitForSeconds(int n)
   {
      try
      {
         new WebDriverWait(driver, Duration.ofSeconds(n))
            .until(ExpectedConditions.presenceOfElementLocated(By.cssSelector(".wontEverBePresent")));
      }
      catch(Exception e)
      {
         ///////////////////
         // okay, resume. //
         ///////////////////
      }
   }



   /*******************************************************************************
    **
    *******************************************************************************/
   public void waitForMillis(int n)
   {
      try
      {
         new WebDriverWait(driver, Duration.ofMillis(n))
            .until(ExpectedConditions.presenceOfElementLocated(By.cssSelector(".wontEverBePresent")));
      }
      catch(Exception e)
      {
         ///////////////////
         // okay, resume. //
         ///////////////////
      }
   }



   /*******************************************************************************
    **
    *******************************************************************************/
   public void waitForever()
   {
      if(System.getenv("CIRCLECI") != null)
      {
         LOG.warn("A waitForever was found in CIRCLECI - so, we don't want to do that, so, returning immediately.");
         return;
      }

      LOG.warn("Going into a waitForever...");
      new WebDriverWait(driver, Duration.ofHours(1))
         .until(ExpectedConditions.presenceOfElementLocated(By.cssSelector(".wontEverBePresent")));
   }



   /*******************************************************************************
    **
    *******************************************************************************/
   public void gotoAndWaitForBreadcrumbHeaderToContain(String path, String expectedHeaderText)
   {
      driver.get(BASE_URL + path);

      WebElement header = new WebDriverWait(driver, Duration.ofSeconds(WAIT_SECONDS))
         .until(ExpectedConditions.presenceOfElementLocated(By.cssSelector(QQQMaterialDashboardSelectors.BREADCRUMB_HEADER)));

      LOG.debug("Navigated to [" + path + "].  Breadcrumb Header: " + header.getText());
      assertThat(header.getText()).contains(expectedHeaderText);
   }



   /*******************************************************************************
    **
    *******************************************************************************/
   public void clickBackdrop()
   {
      for(WebElement webElement : this.waitForSelectorAll(".MuiBackdrop-root", 0))
      {
         try
         {
            webElement.click();
         }
         catch(Exception e)
         {
            // ignore.
         }
      }
   }



   /*******************************************************************************
    **
    *******************************************************************************/
   public WebElement waitForSelector(String cssSelector)
   {
      WebElement element = waitForSelectorAll(cssSelector, 1).get(0);

      Actions actions = new Actions(driver);
      actions.moveToElement(element);

      conditionallyAutoHighlight(element);
      return element;
   }



   /*******************************************************************************
    **
    *******************************************************************************/
   public void moveMouseCursorToElement(WebElement element)
   {
      Actions actions = new Actions(driver);
      actions.moveToElement(element);
      actions.perform();
   }



   /*******************************************************************************
    **
    *******************************************************************************/
   public List<WebElement> waitForSelectorAllSatisfyingPredicate(String cssSelector, Predicate<List<WebElement>> predicate)
   {
      return waitForSelectorAllSatisfyingPredicate(cssSelector, predicate, null);
   }



   /*******************************************************************************
    **
    *******************************************************************************/
   public List<WebElement> waitForSelectorAllSatisfyingPredicate(String cssSelector, Predicate<List<WebElement>> predicate, String predicateDescription)
   {
      if(predicateDescription == null)
      {
         predicateDescription = "";
      }
      else
      {
         predicateDescription = " " + predicateDescription;
      }

      LOG.debug("Waiting for element matching selector [" + cssSelector + "] and satisfying predicate" + predicateDescription);
      long start = System.currentTimeMillis();

      do
      {
         List<WebElement> elements = driver.findElements(By.cssSelector(cssSelector));
         if(predicate.test(elements))
         {
            LOG.debug("Found [" + elements.size() + "] element(s) matching selector [" + cssSelector + "] and satisfying predicate" + predicateDescription);
            return (elements);
         }

         sleepABit();
      }
      while(start + (1000 * WAIT_SECONDS) > System.currentTimeMillis());

      fail("Failed to find element matching selector [" + cssSelector + "] satisfying predicate" + predicateDescription + " after [" + WAIT_SECONDS + "] seconds.");
      return (null);
   }



   /*******************************************************************************
    **
    *******************************************************************************/
   public List<WebElement> waitForSelectorAll(String cssSelector, int minCount)
   {
      return waitForSelectorAllSatisfyingPredicate(cssSelector, elements -> elements.size() >= minCount, "minCount of " + minCount);
   }



   /*******************************************************************************
    **
    *******************************************************************************/
   public void waitForSelectorToNotExist(String cssSelector)
   {
      LOG.debug("Waiting for non-existence of element matching selector [" + cssSelector + "]");
      long start = System.currentTimeMillis();

      do
      {
         List<WebElement> elements = driver.findElements(By.cssSelector(cssSelector));
         if(elements.isEmpty())
         {
            LOG.debug("Found non-existence of element(s) matching selector [" + cssSelector + "]");
            return;
         }

         sleepABit();
      }
      while(start + (1000 * WAIT_SECONDS) > System.currentTimeMillis());

      fail("Failed for non-existence of element matching selector [" + cssSelector + "] after [" + WAIT_SECONDS + "] seconds.");
   }



   /*******************************************************************************
    **
    *******************************************************************************/
   public void waitForSelectorContainingToNotExist(String cssSelector, String textContains)
   {
      LOG.debug("Waiting for non-existence of element matching selector [" + cssSelector + "] containing text [" + textContains + "]");
      long start = System.currentTimeMillis();

      do
      {
         List<WebElement> elements = driver.findElements(By.cssSelector(cssSelector));
         if(elements.isEmpty())
         {
            LOG.debug("Found non-existence of element(s) matching selector [" + cssSelector + "]");
            return;
         }

         if(elements.stream().noneMatch(e -> e.getText().toLowerCase().contains(textContains.toLowerCase())))
         {
            LOG.debug("Found non-existence of element(s) matching selector [" + cssSelector + "] containing text [" + textContains + "]");
            return;
         }

         sleepABit();
      }
      while(start + (1000 * WAIT_SECONDS) > System.currentTimeMillis());

      fail("Failed for non-existence of element matching selector [" + cssSelector + "] containing text [" + textContains + "] after [" + WAIT_SECONDS + "] seconds.");
   }



   /*******************************************************************************
    **
    *******************************************************************************/
   public void waitForSelectorTextMatchingRegexToNotExist(String cssSelector, String textMatches)
   {
      LOG.debug("Waiting for non-existence of element matching selector [" + cssSelector + "] matching regex [" + textMatches + "]");
      long start = System.currentTimeMillis();

      do
      {
         List<WebElement> elements = driver.findElements(By.cssSelector(cssSelector));
         if(elements.isEmpty())
         {
            LOG.debug("Found non-existence of element(s) matching selector [" + cssSelector + "]");
            return;
         }

         if(elements.stream().noneMatch(e -> e.getText().toLowerCase().matches(textMatches.toLowerCase())))
         {
            LOG.debug("Found non-existence of element(s) matching selector [" + cssSelector + "] matches regex [" + textMatches + "]");
            return;
         }

         sleepABit();
      }
      while(start + (1000 * WAIT_SECONDS) > System.currentTimeMillis());

      fail("Failed for non-existence of element matching selector [" + cssSelector + "] matching regex [" + textMatches + "] after [" + WAIT_SECONDS + "] seconds.");
   }



   /*******************************************************************************
    **
    *******************************************************************************/
   public void waitForNumberOfWindowsToBe(int number)
   {
      LOG.debug("Waiting for number of windows (tabs) to be [" + number + "]");
      long start = System.currentTimeMillis();

      do
      {
         if(driver.getWindowHandles().size() == number)
         {
            LOG.debug("Number of windows (tabs) is [" + number + "]");
            return;
         }

         sleepABit();
      }
      while(start + (1000 * WAIT_SECONDS) > System.currentTimeMillis());

      fail("Failed waiting for number of windows (tabs) to be [" + number + "] after [" + WAIT_SECONDS + "] seconds.");
   }



   /*******************************************************************************
    **
    *******************************************************************************/
   public static void sleepABit()
   {
      try
      {
         Thread.sleep(100);
      }
      catch(InterruptedException e)
      {
         // resume
      }
   }



   /*******************************************************************************
    **
    *******************************************************************************/
   public void highlightElement(WebElement element)
   {
      JavascriptExecutor js = (JavascriptExecutor) driver;
      js.executeScript("arguments[0].setAttribute('style', 'background: yellow; border: 3px solid red;');", element);
   }



   /*******************************************************************************
    **
    *******************************************************************************/
   private void soonUnhighlightElement(WebElement element)
   {
      CompletableFuture.supplyAsync(() ->
      {
         SleepUtils.sleep(2, TimeUnit.SECONDS);
         JavascriptExecutor js = (JavascriptExecutor) driver;
         js.executeScript("arguments[0].setAttribute('style', 'background: unset; border: unset;');", element);
         return (true);
      });
   }



   /*******************************************************************************
    **
    *******************************************************************************/
   public void switchToSecondaryTab()
   {
      String originalWindow = driver.getWindowHandle();

      waitForNumberOfWindowsToBe(2);

      Set<String> windowHandles = driver.getWindowHandles();
      for(String windowHandle : windowHandles)
      {
         if(!windowHandle.equals(originalWindow))
         {
            driver.switchTo().window(windowHandle);
            return;
         }
      }

      fail("Failed to find a window handle not equal to the original window handle.  Original=[" + originalWindow + "].  All=[" + windowHandles + "]");
   }



   /*******************************************************************************
    **
    *******************************************************************************/
   public void closeSecondaryTab()
   {
      String originalWindow = driver.getWindowHandle();
      driver.close();

      Set<String> windowHandles = driver.getWindowHandles();
      for(String windowHandle : windowHandles)
      {
         if(!windowHandle.equals(originalWindow))
         {
            driver.switchTo().window(windowHandle);
            return;
         }
      }

      fail("Failed to find a window handle not equal to the original window handle.  Original=[" + originalWindow + "].  All=[" + windowHandles + "]");
   }



   @FunctionalInterface
   public interface Code<T>
   {
      /*******************************************************************************
       **
       *******************************************************************************/
      T run();
   }



   /*******************************************************************************
    **
    *******************************************************************************/
   public boolean waitForCondition(String message, Code<Boolean> c)
   {
      LOG.debug("Waiting for condition: " + message);
      long start = System.currentTimeMillis();
      do
      {
         Boolean b = c.run();
         if(b != null && b)
         {
            LOG.debug("Condition became true: " + message);
            return (true);
         }

         sleepABit();
      }
      while(start + (1000 * WAIT_SECONDS) > System.currentTimeMillis());
      LOG.warn("Failed for condition to become true: " + message);
      return (false);
   }



   /*******************************************************************************
    **
    *******************************************************************************/
   public WebElement waitForSelectorContaining(String cssSelector, String textContains)
   {
      return (waitForSelectorMatchingPredicate(cssSelector, "containing text [" + textContains + "]", (WebElement element) ->
      {
         return (element.getText() != null && element.getText().toLowerCase().contains(textContains.toLowerCase()));
      }));
   }



   /*******************************************************************************
    **
    *******************************************************************************/
   public WebElement waitForSelectorContainingTextMatchingRegex(String cssSelector, String regExp)
   {
      return (waitForSelectorMatchingPredicate(cssSelector, "matching regexp [" + regExp + "]", (WebElement element) ->
      {
         return (element.getText() != null && element.getText().matches(regExp));
      }));
   }



   /*******************************************************************************
    **
    *******************************************************************************/
   private WebElement waitForSelectorMatchingPredicate(String cssSelector, String description, Function<WebElement, Boolean> predicate)
   {
      LOG.debug("Waiting for element matching selector [" + cssSelector + "] " + description);
      long start = System.currentTimeMillis();

      do
      {
         List<WebElement> elements = driver.findElements(By.cssSelector(cssSelector));
         for(WebElement element : elements)
         {
            try
            {
               if(predicate.apply(element))
               {
                  LOG.debug("Found element matching selector [" + cssSelector + "] " + description);
                  Actions actions = new Actions(driver);
                  actions.moveToElement(element);
                  conditionallyAutoHighlight(element);
                  return (element);
               }
            }
            catch(StaleElementReferenceException sere)
            {
               LOG.debug("Caught a StaleElementReferenceException - will retry.");
            }
            catch(NoSuchElementException nsee)
            {
               LOG.debug("Caught a NoSuchElementException - will retry.");
            }
         }

         sleepABit();
      }
      while(start + (1000 * WAIT_SECONDS) > System.currentTimeMillis());

      fail("Failed to find element matching selector [" + cssSelector + "] " + description + " after [" + WAIT_SECONDS + "] seconds.");
      return (null);
   }



   /*******************************************************************************
    **
    *******************************************************************************/
   private void conditionallyAutoHighlight(WebElement element)
   {
      if(autoHighlight && System.getenv("CIRCLECI") == null)
      {
         highlightElement(element);
         soonUnhighlightElement(element);
      }
   }



   /*******************************************************************************
    ** Take a screenshot, putting it in the SCREENSHOTS_PATH, with a subdirectory
    ** for the test class simple name, filename = methodName.png.
    *******************************************************************************/
   public void takeScreenshotToFile()
   {
      StackTraceElement[] stackTrace     = new Exception().getStackTrace();
      StackTraceElement   caller         = stackTrace[1];
      String              filePathSuffix = caller.getClassName().substring(caller.getClassName().lastIndexOf(".") + 1) + "/" + caller.getMethodName() + ".png";
      takeScreenshotToFile(filePathSuffix);
   }



   /*******************************************************************************
    ** Take a screenshot, and give it a path/name of your choosing (under SCREENSHOTS_PATH)
    ** - note - .png will be appended.
    *******************************************************************************/
   public void takeScreenshotToFile(String filePathSuffix)
   {
      if(SCREENSHOTS_ENABLED)
      {
         try
         {
            File outputFile = driver.findElement(By.cssSelector("html")).getScreenshotAs(OutputType.FILE);
            File destFile   = new File(SCREENSHOTS_PATH + filePathSuffix + ".png");
            destFile.mkdirs();
            if(destFile.exists())
            {
               String newFileName = destFile.getAbsolutePath().replaceFirst("\\.png", "-" + System.currentTimeMillis() + ".png");
               destFile.renameTo(new File(newFileName));
            }
            FileUtils.moveFile(outputFile, destFile);
            LOG.info("Made screenshot at: " + destFile);
         }
         catch(Exception e)
         {
            LOG.warn("Error taking screenshot to file: " + e.getMessage());
         }
      }
   }



   /*******************************************************************************
    **
    *******************************************************************************/
   public void waitForElementToHaveFocus(WebElement element)
   {
      LOG.debug("Waiting for element [" + element + "] to have focus.");
      long start = System.currentTimeMillis();
      do
      {
         if(Objects.equals(driver.switchTo().activeElement(), element))
         {
            LOG.debug("Element [" + element + "] has focus.");
            return;
         }
         sleepABit();
      }
      while(start + (1000 * WAIT_SECONDS) > System.currentTimeMillis());

      fail("Failed to see that element [" + element + "] has focus after [" + WAIT_SECONDS + "] seconds.");
   }



   /*******************************************************************************
    **
    *******************************************************************************/
   @FunctionalInterface
   public interface VoidVoidFunction
   {
      /*******************************************************************************
       **
       *******************************************************************************/
      void run();
   }



   /*******************************************************************************
    **
    *******************************************************************************/
   public void tryMultiple(int noOfTries, VoidVoidFunction f)
   {
      for(int i = 0; i < noOfTries; i++)
      {
         try
         {
            f.run();
            return;
         }
         catch(Exception e)
         {
            if(i < noOfTries - 1)
            {
               LOG.debug("On try [" + i + " of " + noOfTries + "] caught: " + e.getMessage());
            }
            else
            {
               throw (e);
            }
         }
      }
   }



   /*******************************************************************************
    * to help assert about files being downloaded by tests, this method loads the
    * chrome://downloads/ page, then tries to grab text from the page representing
    * the latest downloaded file.
    *
    * <p>Note that the selectors used in this method may need updated over time
    * as chrome changes the html of the downloads page...</p>
    *
    * @return (at the time of this writing) - downloaded filename, newline, "From https://localhost:3001"
    *******************************************************************************/
   public String getLatestChromeDownloadedFileInfo()
   {
      driver.get("chrome://downloads/");
      JavascriptExecutor js      = (JavascriptExecutor) driver;
      WebElement         element = (WebElement) js.executeScript("return document.querySelector('downloads-manager').shadowRoot.querySelector('downloads-item').shadowRoot.querySelector('#content')");
      return (element.getText());
   }



   /*******************************************************************************
    ** Getter for autoHighlight
    *******************************************************************************/
   public boolean getAutoHighlight()
   {
      return (this.autoHighlight);
   }



   /*******************************************************************************
    ** Setter for autoHighlight
    *******************************************************************************/
   public void setAutoHighlight(boolean autoHighlight)
   {
      this.autoHighlight = autoHighlight;
   }



   /*******************************************************************************
    ** Fluent setter for autoHighlight
    *******************************************************************************/
   public QSeleniumLib withAutoHighlight(boolean autoHighlight)
   {
      this.autoHighlight = autoHighlight;
      return (this);
   }



   /*******************************************************************************
    **
    *******************************************************************************/
   public void dumpConsole()
   {
      Set<String> availableLogTypes = driver.manage().logs().getAvailableLogTypes();
      for(String logType : availableLogTypes)
      {
         LogEntries logEntries = driver.manage().logs().get(logType);
         for(LogEntry logEntry : logEntries)
         {
            System.out.println(logEntry.toJson());
         }
      }
   }



   /***************************************************************************
    * using the ./.. xpath repeatedly, get an ancestor of an element.
    ***************************************************************************/
   public WebElement getAncestor(WebElement element, int level)
   {
      for(int i = 0; i < level; i++)
      {
         element = element.findElement(QSeleniumLib.PARENT);
      }

      return element;
   }



   /***************************************************************************
    * get the direct parent of an element.
    ***************************************************************************/
   public WebElement getParent(WebElement element)
   {
      return getAncestor(element, 1);
   }

}
