/*
 * QQQ - Low-code Application Framework for Engineers.
 * Copyright (C) 2021-2025.  Kingsrook, LLC
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

import {QAuthenticationMetaData} from "@qrunio/qqq-frontend-core/lib/model/metaData/QAuthenticationMetaData";
import {SESSION_UUID_COOKIE_NAME} from "App";
import Client from "qqq/utils/qqq/Client";
import {useCookies} from "react-cookie";
import {Md5} from "ts-md5/dist/md5";

const qController = Client.getInstance();

interface Props
{
   setIsFullyAuthenticated?: (is: boolean) => void;
   setLoggedInUser?: (user: any) => void;
   setEarlyReturnForAuth?: (element: JSX.Element | null) => void;
}

/***************************************************************************
 ** hook for working with the anonymous authentication module
 ***************************************************************************/
export default function useAnonymousAuthenticationModule({setIsFullyAuthenticated, setLoggedInUser, setEarlyReturnForAuth}: Props)
{
   const [cookies, setCookie, removeCookie] = useCookies([SESSION_UUID_COOKIE_NAME]);

   /***************************************************************************
    **
    ***************************************************************************/
   const setupSession = async () =>
   {
      console.log("Generating random token...");
      setIsFullyAuthenticated(true);
      Client.setGotAuthenticationInAllControllers();
      setCookie(SESSION_UUID_COOKIE_NAME, Md5.hashStr(`${new Date()}`), {path: "/"});

      try
      {
         const {values} = await qController.manageSession(null, null, null);
         localStorage.setItem("sessionValues", JSON.stringify(values ?? {}));
         if (values?.user)
         {
            setLoggedInUser(values.user);
         }
      }
      catch (e)
      {
         console.log("manageSession call failed (may be expected for some backends)", e);
      }

      console.log("Token generation complete.");
   };


   /***************************************************************************
    **
    ***************************************************************************/
   const logout = () =>
   {
      qController.clearAuthenticationMetaDataLocalStorage();
      localStorage.removeItem("sessionValues");
      removeCookie(SESSION_UUID_COOKIE_NAME, {path: "/"});
   };


   /***************************************************************************
    **
    ***************************************************************************/
   const renderAppWrapper = (authenticationMetaData: QAuthenticationMetaData, children: JSX.Element): JSX.Element =>
   {
      return children;
   };


   return {
      setupSession,
      logout,
      renderAppWrapper
   };

}
