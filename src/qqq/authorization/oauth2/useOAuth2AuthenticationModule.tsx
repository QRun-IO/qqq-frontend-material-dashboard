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

////////////////////////////////////////////////////////////////////////////////
// ** Singleton instance of the QQQ client controller for API communication * //
////////////////////////////////////////////////////////////////////////////////
const qController = Client.getInstance();

/**
 * Properties interface for the useOAuth2AuthenticationModule hook.
 *
 * @interface Props
 * @property {function} [setIsFullyAuthenticated] - Optional callback to update the authentication state in parent component
 * @property {function} [setLoggedInUser] - Optional callback to set the logged-in user object in parent component
 * @property {function} [setEarlyReturnForAuth] - Optional callback to display auth-related UI elements (e.g., loading, errors)
 * @property {boolean} inOAuthContext - Flag indicating whether the component is rendered within an OAuth context (AuthProvider)
 */
interface Props
{
   setIsFullyAuthenticated?: (is: boolean) => void;
   setLoggedInUser?: (user: any) => void;
   setEarlyReturnForAuth?: (element: JSX.Element | null) => void;
   inOAuthContext: boolean;
}

/**
 * Custom React hook for managing OAuth2 authentication flows using the Authorization Code Flow with PKCE.
 *
 * This hook handles the complete OAuth2 authentication lifecycle including:
 * - Initiating the OAuth2 login flow and redirecting to the identity provider
 * - Processing authorization codes returned from the identity provider
 * - Exchanging authorization codes for session tokens via the backend
 * - Validating existing session cookies
 * - Managing logout and session cleanup
 * - Wrapping the application with the necessary OAuth2 context provider
 *
 * The hook implements a three-stage authentication process:
 * 1. Initial redirect to identity provider (IP) for user login
 * 2. Callback handling at /token endpoint to exchange code for session
 * 3. Session validation on subsequent page loads using cookies
 *
 * @param {Props} props - Configuration object containing callbacks and context flags
 * @param {function} [props.setIsFullyAuthenticated] - Callback to update authentication state in parent
 * @param {function} [props.setLoggedInUser] - Callback to update logged-in user data in parent
 * @param {function} [props.setEarlyReturnForAuth] - Callback to display auth UI (loading, errors)
 * @param {boolean} props.inOAuthContext - Whether component is within OAuth AuthProvider context
 *
 * @returns {object} Object containing authentication methods
 * @returns {function} setupSession - Initiates or validates the authentication session
 * @returns {function} logout - Clears session and redirects to identity provider logout
 * @returns {function} renderAppWrapper - Wraps children with OAuth AuthProvider configuration
 *
 * @example
 * const { setupSession, logout, renderAppWrapper } = useOAuth2AuthenticationModule({
 *   setIsFullyAuthenticated: setAuthState,
 *   setLoggedInUser: setUser,
 *   setEarlyReturnForAuth: setAuthUI,
 *   inOAuthContext: true
 * });
 */
export default function useOAuth2AuthenticationModule({setIsFullyAuthenticated, setLoggedInUser, setEarlyReturnForAuth, inOAuthContext}: Props)
{
   /////////////////////////////////////////////////////////////////////////////////////////////
   // The useAuth hook should only be called if we're inside the <AuthProvider> element.      //
   // On the page that uses this hook to call renderAppWrapper, we aren't in that             //
   // element/context yet, so we conditionally call useAuth based on the inOAuthContext flag. //
   // This prevents "hook called outside of context" errors.                                  //
   /////////////////////////////////////////////////////////////////////////////////////////////
   const authOidc: AuthContextProps | null = inOAuthContext ? useAuth() : null;

   /////////////////////////////////////////////////////////////////////////////
   // ** Cookie management hook for reading the session UUID cookie         * //
   // ** (Removal is done via direct document.cookie manipulation in logout) * //
   /////////////////////////////////////////////////////////////////////////////
   const [cookies] = useCookies([SESSION_UUID_COOKIE_NAME]);

   ////////////////////////////////////////////////////////////////////////////////////////////
   // ** URL search parameters hook for extracting OAuth callback parameters (code, state) * //
   ////////////////////////////////////////////////////////////////////////////////////////////
   const [searchParams] = useSearchParams();

   //////////////////////////////////////////////////////////////////////////
   // ** Navigation hook for programmatic redirects after authentication * //
   //////////////////////////////////////////////////////////////////////////
   const navigate = useNavigate();

   /**
    * Establishes or validates a user authentication session using OAuth2 flows.
    *
    * This function handles three distinct authentication scenarios:
    *
    * 1. **OAuth Callback (pathname === "/token")**:
    *    - Extracts authorization code and state from URL parameters
    *    - Retrieves PKCE verifier and redirect URI from local storage using state
    *    - Exchanges code for session via backend API call
    *    - Sets authentication state and redirects to original destination
    *
    * 2. **Existing Session Validation (has session cookie)**:
    *    - Validates existing session UUID cookie with backend
    *    - Updates authentication state if session is valid
    *    - Allows user to continue to requested page
    *
    * 3. **New Authentication Required (no cookie, not callback)**:
    *    - Saves current pathname for post-login redirect
    *    - Initiates OAuth2 authorization code flow
    *    - Redirects to identity provider's login page
    *
    * @async
    * @function setupSession
    * @returns {Promise<void>} Resolves when session setup is complete or logout is triggered
    * @throws {Error} Logs error and triggers logout if session validation/creation fails
    */
   const setupSession = async () =>
   {
      try
      {
         /** Local storage key for storing the pre-signin redirect path */
         const preSigninRedirectPathnameKey = "oauth2.preSigninRedirect.pathname";

         /** Check if we're at the OAuth callback endpoint (handles any base path + /token) */
         const isTokenCallback = window.location.pathname.endsWith("/token");

         if (isTokenCallback)
         {
            /////////////////////////////////////////////////////////////////////////
            // SCENARIO 1: OAuth2 Callback Handler (/token endpoint)               //
            // This executes when the identity provider redirects back to our app  //
            // after successful user authentication. We exchange the authorization //
            // code for a session token via our backend.                           //
            /////////////////////////////////////////////////////////////////////////

            /////////////////////////////////////////////////////////////////
            // ** Authorization code received from the identity provider * //
            /////////////////////////////////////////////////////////////////
            const code = searchParams.get("code");

            //////////////////////////////////////////////////////////////////////
            // ** State parameter for CSRF protection and session correlation * //
            //////////////////////////////////////////////////////////////////////
            const state = searchParams.get("state");

            //////////////////////////////////////////////////////////////////////////////////////////////////////////
            // ** Retrieve OIDC session data (PKCE verifier, redirect URI) from local storage using the state key * //
            //////////////////////////////////////////////////////////////////////////////////////////////////////////
            const oidcString = localStorage.getItem(`oidc.${state}`);

            if (oidcString)
            {
               ///////////////////////////////////////////////////////////////////////////////
               // ** Parse the stored OIDC data containing code_verifier and redirect_uri * //
               ///////////////////////////////////////////////////////////////////////////////
               const oidcObject = JSON.parse(oidcString) as { [name: string]: any };

               ////////////////////////////////////////////////////////////////////////////////////////
               // ** Prepare request body with authorization code, PKCE verifier, and redirect URI * //
               ////////////////////////////////////////////////////////////////////////////////////////
               const manageSessionRequestBody = {code: code, codeVerifier: oidcObject.code_verifier, redirectUri: oidcObject.redirect_uri};

               ///////////////////////////////////////////////////////////////////////
               // ** Exchange authorization code for session UUID via backend API * //
               ///////////////////////////////////////////////////////////////////////
               const {uuid: newSessionUuid, values} = await qController.manageSession(null, null, manageSessionRequestBody);

               /////////////////////////////////////////////////////////
               // ** Update parent component's authentication state * //
               /////////////////////////////////////////////////////////
               setIsFullyAuthenticated(true);

               ////////////////////////////////////////////////////////////////////////////////////
               // ** Notify all Client controller instances that authentication is established * //
               ////////////////////////////////////////////////////////////////////////////////////
               Client.setGotAuthenticationInAllControllers();

               /////////////////////////////////////////////////////////////////////////
               // ** Store the logged-in user information in parent component state * //
               /////////////////////////////////////////////////////////////////////////
               setLoggedInUser(values?.user);

               ////////////////////////////////////////////////////////////////////////////////
               // ** Retrieve the path the user was trying to access before authentication * //
               ////////////////////////////////////////////////////////////////////////////////
               const preSigninRedirectPathname = localStorage.getItem(preSigninRedirectPathnameKey);

               ///////////////////////////////////////////////////////////////
               // ** Clean up the stored redirect path from local storage * //
               ///////////////////////////////////////////////////////////////
               localStorage.removeItem(preSigninRedirectPathnameKey);

               /////////////////////////////////////////////////////////////////////////////
               // ** Navigate back to the original destination (or home if none stored) * //
               /////////////////////////////////////////////////////////////////////////////
               const targetPath = preSigninRedirectPathname ?? "/";
               navigate(targetPath, {replace: true});
            }
            else
            {
               ///////////////////////////////////////////////////////////////////////
               // State parameter not found in local storage - possible CSRF attack //
               // or expired/invalid OAuth flow. Try to recover gracefully.         //
               ///////////////////////////////////////////////////////////////////////
               
               // Check if we have a valid session cookie - if so, just navigate home
               const sessionUuid = cookies[SESSION_UUID_COOKIE_NAME];
               if (sessionUuid)
               {
                  navigate("/", {replace: true});
                  return;
               }
               
               // No session and no valid state - show error
               setEarlyReturnForAuth(
                  <div style={{padding: "20px"}}>
                     <h2>Login Error</h2>
                     <p>The login session expired. Please try again.</p>
                     <button onClick={() => window.location.href = "/"}>Return to Home</button>
                  </div>
               );
            }
         }
         else
         {
            /////////////////////////////////////////////////////////////////////////////
            // SCENARIO 2 or 3: Either validate existing session or initiate new login //
            /////////////////////////////////////////////////////////////////////////////

            /////////////////////////////////////////////////////////////////////////
            // ** Attempt to retrieve existing session UUID from browser cookies * //
            /////////////////////////////////////////////////////////////////////////
            const sessionUuid = cookies[SESSION_UUID_COOKIE_NAME];

            if (sessionUuid)
            {
               ////////////////////////////////////////////////////////////////////////////
               // SCENARIO 2: Existing Session Validation                                //
               // User has a session cookie - validate it's still valid with the backend //
               ////////////////////////////////////////////////////////////////////////////

               ////////////////////////////////////////////////////////////////////////
               // ** Validate the session UUID with backend and retrieve user data * //
               ////////////////////////////////////////////////////////////////////////
               const {values} = await qController.manageSession(null, sessionUuid, null);

               /////////////////////////////////////////////////////////
               // ** Update parent component's authentication state * //
               /////////////////////////////////////////////////////////
               setIsFullyAuthenticated(true);

               ////////////////////////////////////////////////////////////////////////////////////
               // ** Notify all Client controller instances that authentication is established * //
               ////////////////////////////////////////////////////////////////////////////////////
               Client.setGotAuthenticationInAllControllers();

               /////////////////////////////////////////////////////////////////////////
               // ** Store the logged-in user information in parent component state * //
               /////////////////////////////////////////////////////////////////////////
               setLoggedInUser(values?.user);
            }
            else
            {
               //////////////////////////////////////////////////////////////////////////////////////
               // SCENARIO 3: Initiate New OAuth2 Login Flow                                       //
               // No session cookie exists - redirect user to identity provider for authentication //
               //////////////////////////////////////////////////////////////////////////////////////

               //////////////////////////////////////////////////////////////////////////////////
               // ** Store current pathname to redirect back after successful authentication * //
               // If we're at the base path (e.g., /admin), store "/" so we redirect to home  //
               //////////////////////////////////////////////////////////////////////////////////
               const basePath = detectBasePath();
               let pathToStore = window.location.pathname;
               
               // If we're exactly at the base path, store "/" instead
               // This prevents redirecting to just the base path after login (which would match wildcard route)
               if (basePath && basePath !== "/" && pathToStore === basePath)
               {
                  pathToStore = "/";
               }
               localStorage.setItem(preSigninRedirectPathnameKey, pathToStore);

               ////////////////////////////////////////////////////////////////////////////////
               // ** Display "Signing in..." message to user while redirect is in progress * //
               ////////////////////////////////////////////////////////////////////////////////
               setEarlyReturnForAuth(<div>Signing in...</div>);

               ////////////////////////////////////////////////////////////////////////////////////////
               // ** Redirect to identity provider's authorization endpoint (triggers OAuth2 flow) * //
               ////////////////////////////////////////////////////////////////////////////////////////
               await authOidc?.signinRedirect();
            }
         }
      }
      catch (e)
      {
         /////////////////////////////////////////////////////////////////////////
         // ** Log authentication error and clean up any partial state        * //
         /////////////////////////////////////////////////////////////////////////
         console.error("OAuth2 authentication error:", e);
         
         // Only trigger logout if we're not at the token callback
         // (to avoid infinite loops if the issue is with state lookup)
         if (!window.location.pathname.endsWith("/token"))
         {
            logout();
         }
         return;
      }
   };


   /**
    * Logs out the current user by clearing all authentication data and redirecting to the identity provider's logout endpoint.
    *
    * This function performs a complete cleanup of the authentication session:
    * 1. Calls the backend logout endpoint to invalidate the server-side session
    * 2. Clears authentication metadata from local storage (via QQQ client controller)
    * 3. Removes the session UUID cookie from the browser
    * 4. Clears all OIDC-related localStorage items (session state, verifiers, etc.)
    * 5. Redirects to the identity provider's logout endpoint for server-side session cleanup
    *
    * After logout, the user will need to re-authenticate to access protected resources.
    *
    * @function logout
    * @returns {Promise<void>}
    */
   const logout = async () =>
   {
      ///////////////////////////////////////////////////////////////////////////////////
      // ** Call backend logout endpoint FIRST to invalidate server-side session      * //
      // ** This ensures the session is deleted from database and cache is cleared    * //
      ///////////////////////////////////////////////////////////////////////////////////
      try
      {
         await fetch("/qqq/v1/logout", {
            method: "POST",
            credentials: "include"
         });
      }
      catch (e)
      {
         console.warn("[OAuth2] Backend logout failed:", e);
      }

      //////////////////////////////////////////////////////////////////////////////////
      // ** Clear authentication metadata stored in local storage by the QQQ client * //
      //////////////////////////////////////////////////////////////////////////////////
      qController.clearAuthenticationMetaDataLocalStorage();

      /////////////////////////////////////////////////////////////////////////////////////////////////////
      // ** Remove session cookies from the browser                                                    * //
      // ** Backend sets both sessionUUID and sessionId cookies (see issue #339)                       * //
      // ** Must clear both to prevent stale session persistence                                       * //
      // ** Use direct document.cookie manipulation (react-cookie's removeCookie has bugs)             * //
      /////////////////////////////////////////////////////////////////////////////////////////////////////
      console.log("[OAuth2] Removing session cookies (path: /)");
      document.cookie = `${SESSION_UUID_COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; max-age=0;`;
      document.cookie = `sessionId=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; max-age=0;`;

      ///////////////////////////////////////////////////////////////////////////////////
      // ** Clear all OIDC-related items from localStorage (state, verifiers, etc.) * //
      ///////////////////////////////////////////////////////////////////////////////////
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++)
      {
         const key = localStorage.key(i);
         if (key && (key.startsWith("oidc.") || key.startsWith("oauth2.")))
         {
            keysToRemove.push(key);
         }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));

      /////////////////////////////////////////////////////////////////////////////////////////////
      // ** Redirect to the identity provider's logout endpoint to terminate the OAuth session * //
      /////////////////////////////////////////////////////////////////////////////////////////////
      authOidc?.signoutRedirect();
   };


   /**
    * Wraps the application with the OAuth2 AuthProvider context, configuring it with identity provider settings.
    *
    * This function creates and returns an AuthProvider component configured with the OAuth2/OIDC settings
    * from the authentication metadata. The AuthProvider enables OAuth2 functionality throughout the
    * component tree, including sign-in redirects, token management, and user context.
    *
    * The configuration uses the Authorization Code Flow with PKCE (Proof Key for Code Exchange) for
    * enhanced security in single-page applications.
    *
    * @function renderAppWrapper
    * @param {QAuthenticationMetaData} authenticationMetaData - Metadata containing OAuth2 provider configuration
    * @param {string} authenticationMetaData.data.baseUrl - The OAuth2 provider's base authority URL
    * @param {string} authenticationMetaData.data.clientId - The OAuth2 client identifier for this application
    * @param {JSX.Element} children - React children to be wrapped with the OAuth2 context
    *
    * @returns {JSX.Element} Either the AuthProvider wrapping the children, or an error message if configuration is invalid
    *
    * @example
    * const wrappedApp = renderAppWrapper(authMetaData, <App />);
    */
   const renderAppWrapper = (authenticationMetaData: QAuthenticationMetaData, children: JSX.Element): JSX.Element =>
   {

      ////////////////////////////////////////////////////////////////////////////////////
      // ** Extract the OAuth2 identity provider's base URL (authority) from metadata * //
      ////////////////////////////////////////////////////////////////////////////////////
      const authority: string = authenticationMetaData.data.baseUrl;

      //////////////////////////////////////////////////////////////////////////
      // ** Extract the OAuth2 client ID for this application from metadata * //
      //////////////////////////////////////////////////////////////////////////
      const clientId = authenticationMetaData.data.clientId;

      //////////////////////////////////////////////////////////////////////////////////////////////////
      // ** Validate required OAuth2 configuration - cannot proceed without authority and client ID * //
      //////////////////////////////////////////////////////////////////////////////////////////////////
      if (!authority || !clientId)
      {
         return (<div>Error: OAuth2 authenticationMetaData is missing baseUrl [{authority}] and/or clientId [{clientId}].</div>);
      }

      /**
       * Configure the OIDC (OpenID Connect) client settings for the AuthProvider.
       *
       * Configuration details:
       * - authority: The identity provider's base URL (e.g., https://auth.example.com)
       * - client_id: Unique identifier for this application registered with the provider
       * - redirect_uri: Where the provider redirects after authentication (our /token endpoint)
       * - post_logout_redirect_uri: Where to redirect after logout (back to base path)
       * - response_type: "code" indicates we're using Authorization Code Flow
       * - scope: Requested permissions - openid (required), profile, email, offline_access (refresh tokens)
       */
      
      // Detect base path at RUNTIME from current URL
      // This allows the app to work at any path without rebuild: /, /admin, /app, /this/that, etc.
      const basePath = detectBasePath();
      const baseUrl = (basePath && basePath !== "/") ? `${window.location.origin}${basePath}` : window.location.origin;
      
      ///////////////////////////////////////////////////////////////////////////////////////////
      // ** Extract scopes from metadata, with sensible default for backwards compatibility * //
      ///////////////////////////////////////////////////////////////////////////////////////////
      const scopes = authenticationMetaData.data.scopes || "openid profile email offline_access";

      const oidcConfig = {
         authority: authority,
         client_id: clientId,
         redirect_uri: `${baseUrl}/token`,
         post_logout_redirect_uri: baseUrl,
         response_type: "code",
         scope: scopes,
      };

      ///////////////////////////////////////////////////////////////////////////////
      // ** Return the application wrapped in the configured OAuth2 AuthProvider * //
      ///////////////////////////////////////////////////////////////////////////////
      return (<AuthProvider {...oidcConfig}> {children} </AuthProvider>);
   };


   /**
    * Return object containing the three main authentication operations.
    * These functions are exposed to parent components for managing the authentication lifecycle.
    */
   return {
      setupSession, logout, renderAppWrapper
   };

}
