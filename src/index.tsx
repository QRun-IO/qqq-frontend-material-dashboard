/*
 * QQQ - Low-code Application Framework for Engineers.
 * Copyright (C) 2021-2022.  Kingsrook, LLC
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
import React from "react";
import ReactDOM from "react-dom";
import {createRoot} from "react-dom/client";
import {BrowserRouter, useNavigate, useSearchParams} from "react-router-dom";
import App from "App";
import "qqq/styles/qqq-override-styles.css";
import "qqq/styles/form-animation.css";
import "qqq/styles/globals.scss";
import "qqq/styles/raycast.scss";
import useAnonymousAuthenticationModule from "qqq/authorization/anonymous/useAnonymousAuthenticationModule";
import useAuth0AuthenticationModule from "qqq/authorization/auth0/useAuth0AuthenticationModule";
import useOAuth2AuthenticationModule from "qqq/authorization/oauth2/useOAuth2AuthenticationModule";
import {MaterialUIControllerProvider} from "qqq/context";
import Client from "qqq/utils/qqq/Client";
import {detectBasePath} from "qqq/utils/PathUtils";


/////////////////////////////////////////////////////////////////////////////////
// Expose React and ReactDOM as globals, for use by dynamically loaded modules //
/////////////////////////////////////////////////////////////////////////////////
(window as any).React = React;
(window as any).ReactDOM = ReactDOM;

const qController = Client.getInstance();

if (document.location.search && document.location.search.indexOf("clearAuthenticationMetaDataLocalStorage") > -1)
{
   qController.clearAuthenticationMetaDataLocalStorage();
}


const authenticationMetaDataPromise: Promise<QAuthenticationMetaData> = qController.getAuthenticationMetaData();

authenticationMetaDataPromise.then((authenticationMetaData) =>
{

   /***************************************************************************
    **
    ***************************************************************************/
   function Auth0RouterBody()
   {
      const {renderAppWrapper} = useAuth0AuthenticationModule({});
      return (renderAppWrapper(authenticationMetaData));
   }


   /***************************************************************************
    **
    ***************************************************************************/
   function OAuth2RouterBody()
   {
      const {renderAppWrapper} = useOAuth2AuthenticationModule({inOAuthContext: false});
      return (renderAppWrapper(authenticationMetaData, (
         <MaterialUIControllerProvider>
            <App authenticationMetaData={authenticationMetaData} />
         </MaterialUIControllerProvider>
      )));
   }


   /***************************************************************************
    **
    ***************************************************************************/
   function AnonymousRouterBody()
   {
      const {renderAppWrapper} = useAnonymousAuthenticationModule({});
      return (renderAppWrapper(authenticationMetaData, (
         <MaterialUIControllerProvider>
            <App authenticationMetaData={authenticationMetaData} />
         </MaterialUIControllerProvider>
      )));
   }


   const container = document.getElementById("root");
   const root = createRoot(container);

   if (authenticationMetaData.type === "AUTH_0")
   {
      root.render(<BrowserRouter basename={detectBasePath()}>
         <Auth0RouterBody />
      </BrowserRouter>);
   }
   else if (authenticationMetaData.type === "OAUTH2")
   {
      root.render(<BrowserRouter basename={detectBasePath()}>
         <OAuth2RouterBody />
      </BrowserRouter>);
   }
   else if (authenticationMetaData.type === "FULLY_ANONYMOUS" || authenticationMetaData.type === "MOCK")
   {
      root.render(<BrowserRouter basename={detectBasePath()}>
         <AnonymousRouterBody />
      </BrowserRouter>);
   }
   else
   {
      root.render(<div>
         Error: Unknown authenticationMetaData type: [{authenticationMetaData.type}].
      </div>);
   }

});
