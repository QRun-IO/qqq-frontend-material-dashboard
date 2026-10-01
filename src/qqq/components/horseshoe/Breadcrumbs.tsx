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

import {Breadcrumbs as MuiBreadcrumbs} from "@mui/material";
import Box from "@mui/material/Box";
import Icon from "@mui/material/Icon";
import {ReactNode, useContext} from "react";
import {Link} from "react-router-dom";
import QContext from "QContext";
import colors from "qqq/assets/theme/base/colors";
import MDTypography from "qqq/components/legacy/MDTypography";

interface Props
{
   icon: ReactNode;
   title: string;
   route: string | string[];
   light?: boolean;

   [key: string]: any;
}

const ucFirst = (input: string): string =>
{
   if (!input)
   {
      return (input);
   }
   return (input.substring(0, 1).toUpperCase() + input.substring(1));
};

export const routeToLabel = (route: string): string =>
{
   const label = ucFirst(route
      .replace(".", " ")
      .replace("-", " ")
      .replace("_", " ")
      .replace(/([a-z])([A-Z]+)/g, "$1 $2") // transform personUSA => person USA
      .replace(/^([A-Z]+)([A-Z])([a-z])/, "$1 $2$3")); // transform USAPerson => USA Person
   return (label);
};

function QBreadcrumbs({icon, title, route, light}: Props): JSX.Element
{
   ///////////////////////////////////////////////////////////////////////
   // strip away empty elements of the route (e.g., trailing slash(es)) //
   ///////////////////////////////////////////////////////////////////////
   if (route.length)
   {
      // @ts-ignore
      route = route.filter(r => r != "");
   }

   const routes: string[] | any = route.slice(0, -1);
   const {pathToLabelMap, branding} = useContext(QContext);

   const fullPathToLabel = (fullPath: string, route: string): string =>
   {
      if (fullPath.endsWith("/"))
      {
         fullPath = fullPath.replace(/\/+$/, "");
      }

      if (pathToLabelMap && pathToLabelMap[fullPath])
      {
         return pathToLabelMap[fullPath];
      }

      return (routeToLabel(route));
   };

   let pageTitle = branding?.appName ?? "";
   const fullRoutes: string[] = [];
   let accumulatedPath = "";
   for (let i = 0; i < routes.length; i++)
   {
      ////////////////////////////////////////////////////////
      // avoid showing "saved view" as a breadcrumb element //
      // e.g., if at /app/table/savedView/1                 //
      ////////////////////////////////////////////////////////
      if (routes[i] === "savedView" && i == routes.length - 1)
      {
         continue;
      }

      ///////////////////////////////////////////////////////////////////////
      // avoid showing the table name if it's the element before savedView //
      // e.g., when at /app/table/savedView/1 (so where i==1)              //
      // we want to just be showing "App"                                  //
      ///////////////////////////////////////////////////////////////////////
      if (i < routes.length - 1 && routes[i + 1] == "savedView" && i == 1)
      {
         continue;
      }

      if (routes[i] === "")
      {
         continue;
      }

      accumulatedPath = `${accumulatedPath}/${routes[i]}`;
      fullRoutes.push(accumulatedPath);
      pageTitle = `${fullPathToLabel(accumulatedPath, routes[i])} | ${pageTitle}`;
   }

   document.title = `${ucFirst(title)} | ${pageTitle}`;

   return (
      <Box mr={{xs: 0, xl: 8}}>
         <MuiBreadcrumbs
            sx={{
               fontSize: "1.125rem",
               fontWeight: "500",
               color: colors.dark.main,
               "& li": {
                  lineHeight: "unset!important"
               },
               "& a": {
                  color: colors.gray.main
               },
               "& .MuiBreadcrumbs-separator": {
                  fontSize: "1.125rem",
                  fontWeight: "500",
                  color: colors.dark.main
               },
            }}
         >
            <Link to="/">
               <Icon sx={{fontSize: "1.25rem!important", position: "relative", top: "0.25rem"}}>{icon}</Icon>
            </Link>
            {fullRoutes.map((fullRoute: string) => (
               <Link to={fullRoute} key={fullRoute}>
                  {fullPathToLabel(fullRoute, fullRoute.replace(/.*\//, ""))}
               </Link>
            ))}
         </MuiBreadcrumbs>
      </Box>
   );
}

QBreadcrumbs.defaultProps = {
   light: false,
};

export default QBreadcrumbs;
