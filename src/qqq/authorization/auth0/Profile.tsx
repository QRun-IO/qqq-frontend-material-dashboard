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
import React from "react";
import CodeSnippet from "qqq/authorization/auth0/CodeSnippet";

export function Profile()
{
   const {user} = useAuth0();

   if (!user)
   {
      console.log("no user");
      return null;
   }

   return (
      <div className="content-layout">
         <div className="content__body">
            <div className="profile-grid">
               <div className="profile__details">
                  <CodeSnippet
                     title="Decoded ID Token"
                     code={JSON.stringify(user, null, 2)}
                  />
               </div>
            </div>
         </div>
      </div>
   );
}

export default Profile;
