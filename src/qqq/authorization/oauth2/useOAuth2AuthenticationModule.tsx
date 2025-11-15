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
               // else no cookie, and not a token url, we need to redirect to the provider's login page       //
               // capture the path the user was trying to access in local storage, to redirect back to later. //
               /////////////////////////////////////////////////////////////////////////////////////////////////
               console.log("Loading token from OAuth2 provider...");
               console.log(authOidc);
               localStorage.setItem(preSigninRedirectPathnameKey, window.location.pathname);
               setEarlyReturnForAuth(<div>Signing in...</div>);
               authOidc?.signinRedirect();
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
      qController.clearAuthenticationMetaDataLocalStorage();
      const basePath = detectBasePath();
      removeCookie(SESSION_UUID_COOKIE_NAME, {path: basePath});
      authOidc?.signoutRedirect();
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
