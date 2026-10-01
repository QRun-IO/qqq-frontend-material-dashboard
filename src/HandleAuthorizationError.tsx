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

import {useAuth0} from "@auth0/auth0-react";
import React, {useEffect} from "react";
import {useCookies} from "react-cookie";
import {SESSION_UUID_COOKIE_NAME} from "App";

interface Props
{
   errorMessage?: string;
}


function HandleAuthorizationError({errorMessage}: Props)
{

   const [, , removeCookie] = useCookies([SESSION_UUID_COOKIE_NAME]);
   const {logout} = useAuth0();

   useEffect(() =>
   {
      logout();
      removeCookie(SESSION_UUID_COOKIE_NAME, {path: "/"});
   });

   return (
      <div>{errorMessage}</div>
   );
}

HandleAuthorizationError.defaultProps = {
   errorMessage: "User authorization error.",
};

export default HandleAuthorizationError;
