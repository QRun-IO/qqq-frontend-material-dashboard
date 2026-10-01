/*
 * QQQ - Low-code Application Framework for Engineers.
 * Copyright (C) 2021-2024.  Kingsrook, LLC
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


import {QTableMetaData} from "@qrunio/qqq-frontend-core/lib/model/metaData/QTableMetaData";
import {QQueryFilter} from "@qrunio/qqq-frontend-core/lib/model/query/QQueryFilter";
import Box from "@mui/material/Box";
import colors from "qqq/assets/theme/base/colors";
import {validateCriteria} from "qqq/components/query/FilterCriteriaRow";
import XIcon from "qqq/components/query/XIcon";
import FilterUtils from "qqq/utils/qqq/FilterUtils";
import React, {useState} from "react";

interface AdvancedQueryPreviewProps
{
   tableMetaData: QTableMetaData;
   queryFilter: QQueryFilter;
   isEditable: boolean;
   isQueryTooComplex: boolean;
   removeCriteriaByIndexCallback: (index: number) => void;
}

/*******************************************************************************
 ** Box shown on query screen (and more??) to preview what a query looks like,
 ** as an "advanced" style/precursor-to-writing-your-own-query thing.
 *******************************************************************************/
export default function AdvancedQueryPreview({tableMetaData, queryFilter, isEditable, isQueryTooComplex, removeCriteriaByIndexCallback}: AdvancedQueryPreviewProps): JSX.Element
{
   const [mouseOverElement, setMouseOverElement] = useState(null as string);


   /*******************************************************************************
    **
    *******************************************************************************/
   function handleMouseOverElement(name: string)
   {
      setMouseOverElement(name);
   }


   /*******************************************************************************
    **
    *******************************************************************************/
   function handleMouseOutElement()
   {
      setMouseOverElement(null);
   }



   /*******************************************************************************
    ** format the current query as a string for showing on-screen as a preview.
    *******************************************************************************/
   const queryToAdvancedString = (thisQueryFilter: QQueryFilter) =>
   {
      if (queryFilter == null || !queryFilter.criteria)
      {
         return (<span></span>);
      }

      let counter = 0;

      return (
         <React.Fragment>
            {thisQueryFilter.criteria?.map((criteria, i) =>
            {
               const {criteriaIsValid} = validateCriteria(criteria, null);
               if (criteriaIsValid)
               {
                  counter++;
                  return (
                     <span key={i} style={{marginBottom: "0.125rem"}} onMouseOver={() => handleMouseOverElement(`queryPreview-${i}`)} onMouseOut={() => handleMouseOutElement()}>
                        {counter > 1 ? <span style={{marginLeft: "0.25rem", marginRight: "0.25rem"}}>{thisQueryFilter.booleanOperator}&nbsp;</span> : <span />}
                        {FilterUtils.criteriaToHumanString(tableMetaData, criteria, true)}
                        {isEditable && !isQueryTooComplex && (
                           mouseOverElement == `queryPreview-${i}` && <span className={`advancedQueryPreviewX-${counter - 1}`}>
                              <XIcon position="forAdvancedQueryPreview" onClick={() => removeCriteriaByIndexCallback(i)} /></span>
                        )}
                        {counter > 1 && i == thisQueryFilter.criteria?.length - 1 && thisQueryFilter.subFilters?.length > 0 ? <span style={{marginLeft: "0.25rem", marginRight: "0.25rem"}}>{thisQueryFilter.booleanOperator}&nbsp;</span> : <span />}
                     </span>
                  );
               }
               else
               {
                  return (<span />);
               }
            })}

            {thisQueryFilter.subFilters?.length > 0 && (thisQueryFilter.subFilters.map((filter: QQueryFilter, j) =>
            {
               return (
                  <React.Fragment key={j}>
                     {j > 0 ? <span style={{marginLeft: "0.25rem", marginRight: "0.25rem"}}>{thisQueryFilter.booleanOperator}&nbsp;</span> : <span></span>}
                     <span style={{display: "flex", marginRight: "0.20rem"}}>(</span>
                     {queryToAdvancedString(filter)}
                     <span style={{display: "flex", marginRight: "0.20rem"}}>)</span>
                  </React.Fragment>
               );
            }))}
         </React.Fragment>
      );
   };

   const moreSX = isEditable ?
      {
         borderTop: `1px solid ${colors.grayLines.main}`,
         boxShadow: "inset 0px 0px 4px 2px #EFEFED",
         borderRadius: "0 0 0.75rem 0.75rem",
      } :
      {
         borderRadius: "0.75rem",
         border: `1px solid ${colors.grayLines.main}`,
      }

   return (
      <Box whiteSpace="nowrap" display="flex" flexShrink={1} flexGrow={1} alignItems="center">
         {
            <Box
               className="advancedQueryString"
               display="inline-block"
               width="100%"
               sx={{fontSize: "1rem", background: "#FFFFFF"}}
               minHeight={"2.5rem"}
               p={"0.5rem"}
               pb={"0.125rem"}
               {...moreSX}
            >
               <Box display="flex" flexWrap="wrap" fontSize="0.875rem">
                  {queryToAdvancedString(queryFilter)}
               </Box>
            </Box>
         }
      </Box>
   )
}
