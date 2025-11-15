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

import {useAuth0} from "@auth0/auth0-react";
import React, {useEffect} from "react";
import {useCookies} from "react-cookie";
import {SESSION_UUID_COOKIE_NAME} from "App";
import {detectBasePath} from "qqq/utils/PathUtils";

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
      const basePath = detectBasePath();
      removeCookie(SESSION_UUID_COOKIE_NAME, {path: basePath});
   });

   return (
      <div>{errorMessage}</div>
   );
}

HandleAuthorizationError.defaultProps = {
   errorMessage: "User authorization error.",
};

export default HandleAuthorizationError;
