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

import {QAuthenticationMetaData} from "@qrunio/qqq-frontend-core/lib/model/metaData/QAuthenticationMetaData";
import {SESSION_UUID_COOKIE_NAME} from "App";
import Client from "qqq/utils/qqq/Client";
import {detectBasePath} from "qqq/utils/PathUtils";
import {useCookies} from "react-cookie";
import {AuthContextProps, AuthProvider, useAuth} from "react-oidc-context";
import {useNavigate, useSearchParams} from "react-router-dom";

const qController = Client.getInstance();

interface Props
{
   setIsFullyAuthenticated?: (is: boolean) => void;
   setLoggedInUser?: (user: any) => void;
   setEarlyReturnForAuth?: (element: JSX.Element | null) => void;
   inOAuthContext: boolean;
}

/***************************************************************************
 ** hook for working with the OAuth2  authentication module
 ***************************************************************************/
export default function useOAuth2AuthenticationModule({setIsFullyAuthenticated, setLoggedInUser, setEarlyReturnForAuth, inOAuthContext}: Props)
{
   ///////////////////////////////////////////////////////////////////////////////////////
   // the useAuth hook should only be called if we're inside the <AuthProvider> element //
   // so on the page that uses this hook to call renderAppWrapper, we aren't in that    //
   // element/context, thus, don't call that hook.                                      //
   ///////////////////////////////////////////////////////////////////////////////////////
   const authOidc: AuthContextProps | null = inOAuthContext ? useAuth() : null;

   const [cookies, removeCookie] = useCookies([SESSION_UUID_COOKIE_NAME]);
   const [searchParams] = useSearchParams();
   const navigate = useNavigate();

   /***************************************************************************
    **
    ***************************************************************************/
   const setupSession = async () =>
   {
      try
      {
         const basePath = detectBasePath();
         const preSigninRedirectPathnameKey = "oauth2.preSigninRedirect.pathname";
         const tokenPath = basePath === "/" ? "/token" : `${basePath}/token`;
         if (window.location.pathname === tokenPath)
         {
            ///////////////////////////////////////////////////////////////////////////
            // if we're at a path of /token, get code & state params, look up values //
            // from that state in local storage, and make a post to the backend to   //
            // with these values - which will itself talk to the identity provider   //
            // to get an access token, and ultimately a session.                     //
            ///////////////////////////////////////////////////////////////////////////
            const code = searchParams.get("code");
            const state = searchParams.get("state");
            const oidcString = localStorage.getItem(`oidc.${state}`);
            if (oidcString)
            {
               const oidcObject = JSON.parse(oidcString) as { [name: string]: any };
               console.log(oidcObject);
               const manageSessionRequestBody = {code: code, codeVerifier: oidcObject.code_verifier, redirectUri: oidcObject.redirect_uri};
               const {uuid: newSessionUuid, values} = await qController.manageSession(null, null, manageSessionRequestBody);
               console.log(`we have new session UUID: ${newSessionUuid}`);

               setIsFullyAuthenticated(true);
               Client.setGotAuthenticationInAllControllers();

               setLoggedInUser(values?.user);
               console.log("Token load complete.");

               const preSigninRedirectPathname = localStorage.getItem(preSigninRedirectPathnameKey);
               localStorage.removeItem(preSigninRedirectPathname);
               navigate(preSigninRedirectPathname ?? basePath, {replace: true});
            }
            else
            {
               ////////////////////////////////////////////
               // if unrecognized state, render an error //
               ////////////////////////////////////////////
               setEarlyReturnForAuth(<div>Login error:  Unrecognized state.  Refresh to try again.</div>);
            }
         }
         else
         {
            //////////////////////////////////////////////////////////////////////////
            // if we have a sessionUUID cookie, try to validate it with the backend //
            //////////////////////////////////////////////////////////////////////////
            const sessionUuidCookie = cookies[SESSION_UUID_COOKIE_NAME];
            // Ensure we have a string value, not an object (react-cookie can return objects in some cases)
            // This can happen if the cookie was set with a different path or if there's a cookie parsing issue
            const sessionUuid = typeof sessionUuidCookie === "string" ? sessionUuidCookie : null;
            if (sessionUuid)
            {
               console.log(`we have session UUID: ${sessionUuid} - validating it...`);
               const {values} = await qController.manageSession(null, sessionUuid, null);

               setIsFullyAuthenticated(true);
               Client.setGotAuthenticationInAllControllers();

               setLoggedInUser(values?.user);
               console.log("Token load complete.");
            }
            else
            {
               /////////////////////////////////////////////////////////////////////////////////////////////////
               // else no cookie, and not a token url, we need to get authentication from the provider         //
               // First try silent sign-in (if user is already authenticated with Authentik),                 //
               // otherwise redirect to login page                                                              //
               /////////////////////////////////////////////////////////////////////////////////////////////////
               if (authOidc)
               {
                  // Check if user is already authenticated with Authentik
                  if (authOidc.isAuthenticated && authOidc.user)
                  {
                     // User is authenticated with Authentik but doesn't have a session cookie
                     // This can happen if the cookie was set with path: "/" and we're at /admin
                     // Try to get a new session by using signinSilent to refresh the token
                     console.log("User is authenticated with Authentik but no session cookie found. Attempting to establish session...");
                     try
                     {
                        // Try silent sign-in to get a fresh token
                        await authOidc.signinSilent();
                        // After silent sign-in, the user should have a valid token
                        // The token is stored internally by react-oidc-context
                        // We need to extract it from the user's access_token or use the user info
                        // For now, let's try to get user info which should trigger token refresh
                        if (authOidc.user && authOidc.user.access_token)
                        {
                           const accessToken = authOidc.user.access_token;
                           // Exchange the access token for a session
                           const {uuid: newSessionUuid, values} = await qController.manageSession(accessToken, null, null);
                           console.log(`Established new session UUID: ${newSessionUuid}`);
                           
                           setIsFullyAuthenticated(true);
                           Client.setGotAuthenticationInAllControllers();
                           setLoggedInUser(values?.user);
                           console.log("Session established successfully.");
                           return;
                        }
                     }
                     catch (tokenError)
                     {
                        console.warn("Failed to establish session silently:", tokenError);
                        // Fall through to redirect
                     }
                  }
                  
                  // Not authenticated or silent sign-in failed, redirect to login
                  console.log("Redirecting to OAuth2 provider login...");
                  localStorage.setItem(preSigninRedirectPathnameKey, window.location.pathname);
                  setEarlyReturnForAuth(<div>Signing in...</div>);
                  authOidc.signinRedirect();
               }
               else
               {
                  // authOidc is null (not in OAuth context), this shouldn't happen but handle it
                  console.error("authOidc is null - cannot authenticate. This may indicate a configuration issue.");
                  setEarlyReturnForAuth(<div>Authentication error: OAuth2 context not available.</div>);
               }
            }
         }
      }
      catch (e)
      {
         console.log(`Error loading token: ${JSON.stringify(e)}`);
         logout();
         return;
      }
   };


   /***************************************************************************
    **
    ***************************************************************************/
   const logout = () =>
   {
      // Clean up local state first, before attempting Authentik logout
      qController.clearAuthenticationMetaDataLocalStorage();
      const basePath = detectBasePath();
      removeCookie(SESSION_UUID_COOKIE_NAME, {path: basePath});
      
      // Attempt Authentik logout, but handle errors gracefully
      // If Authentik has an error (like the RAC provider bug), we still want to redirect back to our app
      try
      {
         const postLogoutRedirectUri = `${window.location.origin}${basePath}`;
         authOidc?.signoutRedirect({post_logout_redirect_uri: postLogoutRedirectUri});
      }
      catch (e)
      {
         // If Authentik logout fails, redirect manually to our app
         console.warn("Authentik logout error (this may be an Authentik backend issue):", e);
         window.location.href = `${window.location.origin}${basePath}`;
      }
   };


   /***************************************************************************
    **
    ***************************************************************************/
   const renderAppWrapper = (authenticationMetaData: QAuthenticationMetaData, children: JSX.Element): JSX.Element =>
   {
      const authority: string = authenticationMetaData.data.baseUrl;
      const clientId = authenticationMetaData.data.clientId;

      if (!authority || !clientId)
      {
         return (
            <div>Error: OAuth2 authenticationMetaData is missing baseUrl [{authority}] and/or clientId [{clientId}].</div>
         );
      }

      const basePath = detectBasePath();
      const tokenPath = basePath === "/" ? "/token" : `${basePath}/token`;
      const oidcConfig =
         {
            authority: authority,
            client_id: clientId,
            redirect_uri: `${window.location.origin}${tokenPath}`,
            response_type: "code",
            scope: "openid profile email offline_access",
         };

      return (<AuthProvider {...oidcConfig}>
         {children}
      </AuthProvider>
      );
   };


   return {
      setupSession,
      logout,
      renderAppWrapper
   };

}
