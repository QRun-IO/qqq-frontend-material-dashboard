/*
 * QQQ - Low-code Application Framework for Engineers.
 * Copyright (C) 2021-2025.  Kingsrook, LLC
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
import {Auth0Provider, useAuth0} from "@auth0/auth0-react";
import {QAuthenticationMetaData} from "@qrunio/qqq-frontend-core/lib/model/metaData/QAuthenticationMetaData";
import App, {SESSION_UUID_COOKIE_NAME} from "App";
import HandleAuthorizationError from "HandleAuthorizationError";
import jwt_decode from "jwt-decode";
import ProtectedRoute from "qqq/authorization/auth0/ProtectedRoute";
import {MaterialUIControllerProvider} from "qqq/context";
import Client from "qqq/utils/qqq/Client";
import {detectBasePath} from "qqq/utils/PathUtils";
import {useCookies} from "react-cookie";
import {useNavigate, useSearchParams} from "react-router-dom";

const qController = Client.getInstance();
const qControllerV1 = Client.getInstanceV1();

interface Props
{
   setIsFullyAuthenticated?: (is: boolean) => void;
   setLoggedInUser?: (user: any) => void;
   setEarlyReturnForAuth?: (element: JSX.Element | null) => void;
}

/***************************************************************************
 ** hook for working with the Auth0 authentication module
 ***************************************************************************/
export default function useAuth0AuthenticationModule({setIsFullyAuthenticated, setLoggedInUser}: Props)
{
   const {user: auth0User, getAccessTokenSilently: auth0GetAccessTokenSilently, logout: useAuth0Logout} = useAuth0();

   const [cookies, removeCookie] = useCookies([SESSION_UUID_COOKIE_NAME]);


   /***************************************************************************
    **
    ***************************************************************************/
   const shouldStoreNewToken = (newToken: string, oldToken: string): boolean =>
   {
      if (!cookies[SESSION_UUID_COOKIE_NAME])
      {
         console.log("No session uuid cookie - so we should store a new one.");
         return (true);
      }

      if (!oldToken)
      {
         console.log("No accessToken in localStorage - so we should store a new one.");
         return (true);
      }

      try
      {
         const oldJSON: any = jwt_decode(oldToken);
         const newJSON: any = jwt_decode(newToken);

         ////////////////////////////////////////////////////////////////////////////////////
         // if the old (local storage) token is expired, then we need to store the new one //
         ////////////////////////////////////////////////////////////////////////////////////
         const oldExp = oldJSON["exp"];
         if (oldExp * 1000 < (new Date().getTime()))
         {
            console.log("Access token in local storage was expired - so we should store a new one.");
            return (true);
         }

         ////////////////////////////////////////////////////////////////////////////////////////////////
         // remove the exp & iat values from what we compare - as they are always different from auth0 //
         // note, this is only deleting them from what we compare, not from what we'd store.           //
         ////////////////////////////////////////////////////////////////////////////////////////////////
         delete newJSON["exp"];
         delete newJSON["iat"];
         delete oldJSON["exp"];
         delete oldJSON["iat"];

         const different = JSON.stringify(newJSON) !== JSON.stringify(oldJSON);
         if (different)
         {
            console.log("Latest access token from auth0 has changed vs localStorage - so we should store a new one.");
         }
         return (different);
      }
      catch (e)
      {
         console.log("Caught in shouldStoreNewToken: " + e);
      }

      return (true);
   };


   /***************************************************************************
    **
    ***************************************************************************/
   const setupSession = async () =>
   {
      try
      {
         console.log("Loading token from auth0...");
         const accessToken = await auth0GetAccessTokenSilently();

         const lsAccessToken = localStorage.getItem("accessToken");
         if (shouldStoreNewToken(accessToken, lsAccessToken))
         {
            console.log("Sending accessToken to backend, requesting a sessionUUID...");
            const {uuid: values} = await qController.manageSession(accessToken, null);

            localStorage.setItem("accessToken", accessToken);
            localStorage.setItem("sessionValues", JSON.stringify(values));
            console.log("Got new sessionUUID from backend, and stored new accessToken");
         }
         else
         {
            console.log("Using existing sessionUUID cookie");
         }

         setIsFullyAuthenticated(true);
         Client.setGotAuthenticationInAllControllers();

         setLoggedInUser(auth0User);
         console.log("Token load complete.");
      }
      catch (e)
      {
         console.log(`Error loading token: ${JSON.stringify(e)}`);
         qController.clearAuthenticationMetaDataLocalStorage();
         localStorage.removeItem("accessToken");
         const basePath = detectBasePath();
         removeCookie(SESSION_UUID_COOKIE_NAME, {path: basePath});
         useAuth0Logout();
         return;
      }
   };


   /***************************************************************************
    **
    ***************************************************************************/
   const logout = () =>
   {
      localStorage.removeItem("accessToken");
      useAuth0Logout({returnTo: window.location.origin});
   };


   /***************************************************************************
    **
    ***************************************************************************/
   // @ts-ignore
   function Auth0ProviderWithRedirectCallback({children, ...props})
   {
      const navigate = useNavigate();
      const [searchParams] = useSearchParams();

      // @ts-ignore
      const onRedirectCallback = (appState) =>
      {
         navigate((appState && appState.returnTo) || window.location.pathname);
      };
      if (searchParams.get("error"))
      {
         return (
            // @ts-ignore
            <Auth0Provider {...props}>
               <HandleAuthorizationError errorMessage={searchParams.get("error_description")} />
            </Auth0Provider>
         );
      }
      else
      {
         return (
            // @ts-ignore
            <Auth0Provider onRedirectCallback={onRedirectCallback} {...props}>
               {children}
            </Auth0Provider>
         );
      }
   }


   /***************************************************************************
    **
    ***************************************************************************/
   const renderAppWrapper = (authenticationMetaData: QAuthenticationMetaData): JSX.Element =>
   {
      // @ts-ignore
      let domain: string = authenticationMetaData.data.baseUrl;

      // @ts-ignore
      const clientId = authenticationMetaData.data.clientId;

      // @ts-ignore
      const audience = authenticationMetaData.data.audience;

      if (!domain || !clientId)
      {
         return (
            <div>Error: AUTH0 authenticationMetaData is missing baseUrl [{domain}] and/or clientId [{clientId}].</div>
         );
      }

      if (domain.endsWith("/"))
      {
         /////////////////////////////////////////////////////////////////////////////////////
         // auth0 lib fails if we have a trailing slash.  be a bit more graceful than that. //
         /////////////////////////////////////////////////////////////////////////////////////
         domain = domain.replace(/\/$/, "");
      }

      /***************************************************************************
       ** simple Functional Component to wrap the <App> and pass the authentication-
       ** MetaData prop in, so a simple Component can be passed into ProtectedRoute
       ***************************************************************************/
      function WrappedApp()
      {
         return <App authenticationMetaData={authenticationMetaData} />
      }

      const basePath = detectBasePath();
      const redirectUri = `${window.location.origin}${basePath}`;
      return (
         <Auth0ProviderWithRedirectCallback
            domain={domain}
            clientId={clientId}
            audience={audience}
            redirectUri={redirectUri}>
            <MaterialUIControllerProvider>
               <ProtectedRoute component={WrappedApp} />
            </MaterialUIControllerProvider>
         </Auth0ProviderWithRedirectCallback>
      );
   };


   return {
      setupSession,
      logout,
      renderAppWrapper
   };

}
