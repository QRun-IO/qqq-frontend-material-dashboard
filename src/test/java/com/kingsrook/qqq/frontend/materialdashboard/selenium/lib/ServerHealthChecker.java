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

import java.io.IOException;
import java.net.HttpURLConnection;
import java.net.URL;
import java.time.Duration;
import java.time.Instant;
import javax.net.ssl.HttpsURLConnection;
import javax.net.ssl.HostnameVerifier;
import javax.net.ssl.SSLSession;

/**
 * Utility class to check if the React development server is ready
 */
public class ServerHealthChecker
{
   private static final String DEFAULT_BASE_URL = "https://localhost:3001";
   private static final int DEFAULT_TIMEOUT_SECONDS = 60; // Increased for CI
   private static final int DEFAULT_RETRY_INTERVAL_MS = 2000; // Increased for CI

   /**
    * Check if the React server is ready and responding
    * @param baseUrl The base URL of the server (default: https://localhost:3001)
    * @param timeoutSeconds Maximum time to wait for server to be ready
    * @return true if server is ready, false otherwise
    */
   public static boolean isServerReady(String baseUrl, int timeoutSeconds)
   {
      if (baseUrl == null) {
         baseUrl = DEFAULT_BASE_URL;
      }
      
      // Check if we're in CI environment for different timeout behavior
      boolean isCI = "true".equals(System.getenv("CI")) || 
                     "true".equals(System.getenv("GITHUB_ACTIONS")) ||
                     "true".equals(System.getenv("QQQ_SELENIUM_HEADLESS"));
      
      if (isCI) {
         System.out.println("🔍 CI environment detected - using extended timeout and retry intervals");
         timeoutSeconds = Math.max(timeoutSeconds, 90); // Ensure minimum 90 seconds in CI
      }
      
      Instant startTime = Instant.now();
      Duration timeout = Duration.ofSeconds(timeoutSeconds);
      int attemptCount = 0;
      
      while (Duration.between(startTime, Instant.now()).compareTo(timeout) < 0) {
         attemptCount++;
         try {
            URL url = new URL(baseUrl);
            HttpURLConnection connection = (HttpURLConnection) url.openConnection();
            connection.setRequestMethod("GET");
            connection.setConnectTimeout(isCI ? 5000 : 2000); // Longer timeout in CI
            connection.setReadTimeout(isCI ? 5000 : 2000);   // Longer timeout in CI
            connection.setInstanceFollowRedirects(false);
            
            // Accept self-signed certificates for localhost HTTPS
            if (baseUrl.startsWith("https://localhost") && connection instanceof HttpsURLConnection) {
               HttpsURLConnection httpsConnection = (HttpsURLConnection) connection;
               httpsConnection.setHostnameVerifier(new HostnameVerifier() {
                  @Override
                  public boolean verify(String hostname, SSLSession session) {
                     return true; // Accept all hostnames for localhost
                  }
               });
            }
            
            int responseCode = connection.getResponseCode();
            connection.disconnect();
            
            // Accept any response code that indicates the server is running
            if (responseCode >= 200 && responseCode < 500) {
               System.out.println("✅ React server is ready at " + baseUrl + " (HTTP " + responseCode + ") after " + attemptCount + " attempts");
               return true;
            }
            
         } catch (IOException e) {
            // Server not ready yet, continue waiting
            if (attemptCount % 5 == 0 || isCI) { // Log every 5th attempt, or every attempt in CI
               System.out.println("⏳ Waiting for React server at " + baseUrl + "... (attempt " + attemptCount + ")");
               if (isCI && attemptCount > 10) {
                  System.out.println("   Error details: " + e.getMessage());
               }
            }
         }
         
         try {
            Thread.sleep(isCI ? DEFAULT_RETRY_INTERVAL_MS : 1000);
         } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            return false;
         }
      }
      
      System.err.println("❌ React server failed to start within " + timeoutSeconds + " seconds after " + attemptCount + " attempts");
      return false;
   }

   /**
    * Check if the React server is ready with default settings
    * @return true if server is ready, false otherwise
    */
   public static boolean isServerReady()
   {
      return isServerReady(DEFAULT_BASE_URL, DEFAULT_TIMEOUT_SECONDS);
   }

   /**
    * Check if the React server is ready with custom URL
    * @param baseUrl The base URL of the server
    * @return true if server is ready, false otherwise
    */
   public static boolean isServerReady(String baseUrl)
   {
      return isServerReady(baseUrl, DEFAULT_TIMEOUT_SECONDS);
   }

   /**
    * Wait for the React server to be ready and throw an exception if it's not
    * @param baseUrl The base URL of the server
    * @param timeoutSeconds Maximum time to wait for server to be ready
    * @throws RuntimeException if server is not ready within timeout
    */
   public static void waitForServerReady(String baseUrl, int timeoutSeconds)
   {
      if (!isServerReady(baseUrl, timeoutSeconds)) {
         throw new RuntimeException("React server is not ready at " + baseUrl + 
                                  " after " + timeoutSeconds + " seconds");
      }
   }

   /**
    * Wait for the React server to be ready with default settings
    * @throws RuntimeException if server is not ready within timeout
    */
   public static void waitForServerReady()
   {
      waitForServerReady(DEFAULT_BASE_URL, DEFAULT_TIMEOUT_SECONDS);
   }
}