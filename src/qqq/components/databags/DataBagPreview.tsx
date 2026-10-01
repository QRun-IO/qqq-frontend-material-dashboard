/*
 * QQQ - Low-code Application Framework for Engineers.
 * Copyright (C) 2021-2023.  Kingsrook, LLC
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


import Box from "@mui/material/Box";
import Icon from "@mui/material/Icon";
import React, {useEffect, useReducer, useState} from "react";

interface Props
{
   data?: any;
   json?: string;
}

DataBagPreview.defaultProps = {
   data: null,
   json: null,
};

function DataBagPreview({data, json}: Props): JSX.Element
{
   const [openPreviewDivs, setOpenPreviewDivs] = useState(new Set<string>)
   const [, forceUpdate] = useReducer((x) => x + 1, 0);
   const [dataToRender, setDataToRender] = useState(null as any);
   const [errorMessage, setErrorMessage] = useState(null as string)

   useEffect(() =>
   {
      if(data)
      {
         setDataToRender(data);
      }
      else
      {
         try
         {
            const dataToRender = JSON.parse(json)
            setDataToRender(dataToRender);
            setErrorMessage(null);
         }
         catch(e)
         {
            setErrorMessage("Error parsing JSON: " + e);
         }
      }
   }, [data, json]);

   const togglePreviewDiv = (id: string) =>
   {
      if(openPreviewDivs.has(id))
      {
         openPreviewDivs.delete(id);
      }
      else
      {
         openPreviewDivs.add(id);
      }
      setOpenPreviewDivs(openPreviewDivs);
      console.log(openPreviewDivs);
      forceUpdate();
   }

   const previewObject = (object: any, path: string): JSX.Element =>
   {
      if(typeof object == "object")
      {
         return (
            <>
               <Box ml={3}>
                  {
                     Object.keys(object).map((key: any, index: any) =>
                     {
                        const divId = `${path}.${key}`
                        const childIsObject = (typeof object[key] == "object");
                        return (
                           <React.Fragment key={index}>
                              <Box>
                                 {
                                    childIsObject
                                       ? <Icon sx={{position: "relative", top: "2px"}} onClick={() => togglePreviewDiv(divId)} style={{cursor: "pointer"}}>{openPreviewDivs.has(divId) ? "expand_more" : "chevron_right"}</Icon>
                                       : <Box component="span" px="4px">&bull;</Box>
                                 }
                                 {
                                    childIsObject
                                       ? <span className="fieldLabel" onClick={() => togglePreviewDiv(divId)} style={{"cursor": "pointer"}}>{key}:</span>
                                       : <span className="fieldLabel">{key}:</span>
                                 }
                                 {
                                    childIsObject && openPreviewDivs.has(divId) && <Box>{previewObject(object[key], `${path}.${key}`)}</Box>
                                 }
                                 {
                                    !childIsObject && <span className="fieldValue">{String(object[key])}</span>
                                 }
                              </Box>
                           </React.Fragment>
                        );
                     })
                  }
               </Box>
            </>
         )
      }
      else
      {
         return (<>{object}</>)
      }
   }

   const getDataBagPreview = (data: any): JSX.Element=>
   {
      console.log("getDataBagPreview:")
      return previewObject(data, "");
   }

   return (
      <>
         {errorMessage == null && dataToRender && getDataBagPreview(dataToRender)}
         {errorMessage && <Box p={2}>{errorMessage}</Box>}
      </>
   )
}

export default DataBagPreview;
