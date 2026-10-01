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

import {withAuthenticationRequired} from "@auth0/auth0-react";
import React from "react";
import Loader from "qqq/authorization/auth0/Loader";

// @ts-ignore
function ProtectedRoute({component}) : JSX.Element
{
   const Component = withAuthenticationRequired(component, {
      // eslint-disable-next-line react/no-unstable-nested-components
      onRedirecting: () => <Loader />,
   });

   return <Component />;
}

export default ProtectedRoute;
