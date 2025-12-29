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

import Box from "@mui/material/Box";
import QContext from "QContext";
import {qfmdBridge, QFMDBridge} from "qqq/utils/qqq/QFMDBridge";
import React, {useContext, useState} from "react";

// todo - deploy from here!!
interface DynamicComponentProps
{
   qfmdBridge?: QFMDBridge,
   props?: any,
   qContext?: QContext
}


/*******************************************************************************
 ** hook for working with Dynamically loaded components
 **
 *******************************************************************************/
export default function useDynamicComponents()
{
   const [dynamicComponents, setDynamicComponents] = useState<{ [name: string]: React.FC }>({});

   const qContext = useContext(QContext);


   /*******************************************************************************
    **
    *******************************************************************************/
   const loadComponent = async (name: string, url: string) =>
   {
      try
      {
         await new Promise((resolve, reject) =>
         {
            ////////////////////////////////////////////////////////
            // Dynamically load the bundle by adding a script tag //
            ////////////////////////////////////////////////////////
            const script = document.createElement("script");
            script.src = url;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
         });
      }
      catch (e)
      {
         ////////////////////////////////////////////////
         // if the script can't be loaded log an error //
         ////////////////////////////////////////////////
         console.error(`Error loading bundle from [${url}]`);
      }

      ///////////////////////////////////////////////////////////////////////////////
      // Assuming the bundle attaches itself to window.${name} (.${name} again...) //
      // (Note: if exported as UMD, you might need to access the default export)   //
      ///////////////////////////////////////////////////////////////////////////////
      let component = (window as any)[name]?.[name];
      if (!component)
      {
         console.error(`Component not found on window.${name}`);
         component = () => <Box>Error loading {name}</Box>;
      }

      const newDCs = Object.assign({}, dynamicComponents);
      newDCs[name] = component;
      setDynamicComponents(newDCs);
   };


   /***************************************************************************
    **
    ***************************************************************************/
   const hasComponentLoaded = (name: string): boolean =>
   {
      return (!!dynamicComponents[name]);
   };


   /***************************************************************************
    **
    ***************************************************************************/
   const renderComponent = (name: string, props?: any): JSX.Element =>
   {
      if (dynamicComponents[name])
      {
         const C: React.FC<DynamicComponentProps> = dynamicComponents[name];
         return (<C qfmdBridge={qfmdBridge} qContext={qContext} props={props} />);
      }
      else
      {
         return (<Box>Loading...</Box>);
      }
   };


   return {
      loadComponent,
      hasComponentLoaded,
      renderComponent
   };
}