/*
 * QQQ - Low-code Application Framework for Engineers.
 * Copyright (C) 2021-2022.  Kingsrook, LLC
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

import {QController} from "@qrunio/qqq-frontend-core/lib/controllers/QController";
import {QControllerV1} from "@qrunio/qqq-frontend-core/lib/controllers/QControllerV1";
import {QException} from "@qrunio/qqq-frontend-core/lib/exceptions/QException";
import {detectBasePath} from "../PathUtils";

/*******************************************************************************
 ** client wrapper of qqq backend
 **
 *******************************************************************************/
class Client
{
   private static qController: QController;
   private static qControllerV1: QControllerV1;
   private static unauthorizedCallback: () => void;
   private static basePath: string = "";

   private static handleException(exception: QException)
   {
      console.log(`Caught Exception: ${JSON.stringify(exception)}`);

      if (exception && exception.status == 401 && Client.unauthorizedCallback)
      {
         console.log("This is a 401 - calling the unauthorized callback.");
         Client.unauthorizedCallback();
      }

      throw (exception);
   }

   /**
    * Initializes the base path for routing and asset detection.
    * The base path is used for React Router basename only.
    * API calls are always made to the root path (/) regardless of where the SPA is hosted.
    * 
    * This enables the SPA to be hosted at any path without configuration changes.
    */
   private static initializeBasePath(): void
   {
      if (!this.basePath)
      {
         this.basePath = detectBasePath();
         console.log(`[QQQ] SPA base path detected: ${this.basePath}`);
         console.log("[QQQ] API calls will be directed to root path (/, /metaData, /qqq/v1, etc.)");
      }
   }

   public static getInstance()
   {
      if (this.qController == null)
      {
         this.initializeBasePath();
         // QController constructor accepts baseUrl as first parameter
         // APIs are always served from root (/), not from the SPA's base path
         // Pass empty string to use root path for all API calls
         this.qController = new QController("", this.handleException);
      }

      return this.qController;
   }

   public static getInstanceV1(path: string = "/qqq/v1")
   {
      if (this.qControllerV1 == null)
      {
         this.initializeBasePath();
         // APIs are always served from root (/), not from the SPA's base path
         // Pass the path directly without prepending the SPA base path
         this.qControllerV1 = new QControllerV1(path, this.handleException);
      }

      return this.qControllerV1;
   }

   public static setGotAuthenticationInAllControllers()
   {
      Client.getInstance().setGotAuthentication();
      Client.getInstanceV1().setGotAuthentication();
   }

   static setUnauthorizedCallback(unauthorizedCallback: () => void)
   {
      Client.unauthorizedCallback = unauthorizedCallback;
   }
}

export default Client;


