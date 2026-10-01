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

import {QInstance} from "@qrunio/qqq-frontend-core/lib/model/metaData/QInstance";
import {QTableMetaData} from "@qrunio/qqq-frontend-core/lib/model/metaData/QTableMetaData";
import {QCriteriaOperator} from "@qrunio/qqq-frontend-core/lib/model/query/QCriteriaOperator";
import {QFilterCriteria} from "@qrunio/qqq-frontend-core/lib/model/query/QFilterCriteria";
import {QQueryFilter} from "@qrunio/qqq-frontend-core/lib/model/query/QQueryFilter";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button/Button";
import Icon from "@mui/material/Icon/Icon";
import {GridFilterPanelProps, GridSlotsComponentsProps} from "@mui/x-data-grid-pro";
import {FilterCriteriaRow, getDefaultCriteriaValue} from "qqq/components/query/FilterCriteriaRow";
import React, {forwardRef, useReducer} from "react";


declare module "@mui/x-data-grid"
{
   ///////////////////////////////////////////////////////////////////////
   // this lets these props be passed in via <DataGrid componentsProps> //
   ///////////////////////////////////////////////////////////////////////
   interface FilterPanelPropsOverrides
   {
      tableMetaData: QTableMetaData;
      metaData: QInstance;
      queryFilter: QQueryFilter;
      updateFilter: (newFilter: QQueryFilter) => void;
      omitExposedJoins?: string[]
   }
}


export class QFilterCriteriaWithId extends QFilterCriteria
{
   id: number;

   public static buildFromCriteria(criteria: QFilterCriteria, id: number)
   {
      const rs = new QFilterCriteria(criteria.fieldName, criteria.operator, criteria.values) as QFilterCriteriaWithId;
      rs.id = id;
      return (rs);
   }
}


let debounceTimeout: string | number | NodeJS.Timeout;
let criteriaId = (new Date().getTime()) + 1000;

export const CustomFilterPanel = forwardRef<any, GridFilterPanelProps>(
   function MyCustomFilterPanel(props: GridSlotsComponentsProps["filterPanel"], ref)
   {
      const [, forceUpdate] = useReducer((x) => x + 1, 0);

      const queryFilter = props.queryFilter;

      // console.log(`CustomFilterPanel: filter: ${JSON.stringify(queryFilter)}`);

      function focusLastField()
      {
         setTimeout(() =>
         {
            try
            {
               // console.log(`Try to focus ${criteriaId - 1}`);
               document.getElementById(`field-${criteriaId - 1}`).focus();
            }
            catch (e)
            {
               console.log("Error trying to focus field ...", e);
            }
         });
      }

      const addCriteria = () =>
      {
         const qFilterCriteriaWithId = new QFilterCriteriaWithId(null, QCriteriaOperator.EQUALS, getDefaultCriteriaValue());
         qFilterCriteriaWithId.id = criteriaId++;
         console.log(`adding criteria id ${qFilterCriteriaWithId.id}`);
         queryFilter.criteria.push(qFilterCriteriaWithId);
         props.updateFilter(queryFilter);
         forceUpdate();

         focusLastField();
      };

      if (!queryFilter.criteria)
      {
         queryFilter.criteria = [];
         addCriteria();
      }

      if (queryFilter.criteria.length == 0)
      {
         /////////////////////////////////////////////
         // make sure there's at least one criteria //
         /////////////////////////////////////////////
         addCriteria();
      }
      else
      {
         ////////////////////////////////////////////////////////////////////////////////////
         // make sure all criteria have an id on them (to be used as react component keys) //
         ////////////////////////////////////////////////////////////////////////////////////
         let updatedAny = false;
         for (let i = 0; i < queryFilter.criteria.length; i++)
         {
            if (!queryFilter.criteria[i].id)
            {
               queryFilter.criteria[i].id = criteriaId++;
            }
         }
         if (updatedAny)
         {
            props.updateFilter(queryFilter);
         }
      }

      if (queryFilter.criteria.length == 1 && !queryFilter.criteria[0].fieldName)
      {
         focusLastField();
      }

      let booleanOperator: "AND" | "OR" | null = null;
      if (queryFilter.criteria.length > 1)
      {
         booleanOperator = queryFilter.booleanOperator;
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
      // needDebounce param - things like typing in a text field DO need debounce, but changing an operator doesn't //
      ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
      const updateCriteria = (newCriteria: QFilterCriteria, index: number, needDebounce = false) =>
      {
         queryFilter.criteria[index] = newCriteria;

         clearTimeout(debounceTimeout);
         debounceTimeout = setTimeout(() => props.updateFilter(queryFilter), needDebounce ? 500 : 1);

         forceUpdate();
      };

      const updateBooleanOperator = (newValue: string) =>
      {
         queryFilter.booleanOperator = newValue;
         props.updateFilter(queryFilter);
         forceUpdate();
      };

      const removeCriteria = (index: number) =>
      {
         queryFilter.criteria.splice(index, 1);
         props.updateFilter(queryFilter);
         forceUpdate();
      };

      return (
         <Box className="customFilterPanel">
            {
               queryFilter.criteria.map((criteria: QFilterCriteriaWithId, index: number) =>
                  (
                     <Box key={criteria.id}>
                        <FilterCriteriaRow
                           id={criteria.id}
                           index={index}
                           tableMetaData={props.tableMetaData}
                           metaData={props.metaData}
                           criteria={criteria}
                           booleanOperator={booleanOperator}
                           updateCriteria={(newCriteria, needDebounce) => updateCriteria(newCriteria, index, needDebounce)}
                           removeCriteria={() => removeCriteria(index)}
                           updateBooleanOperator={(newValue) => updateBooleanOperator(newValue)}
                           allowVariables={props.allowVariables}
                           queryScreenUsage={props.queryScreenUsage}
                           omitExposedJoins={props.omitExposedJoins}
                        />
                        {/*JSON.stringify(criteria)*/}
                     </Box>
                  ))
            }
            <Box p={1}>
               <Button onClick={() => addCriteria()} startIcon={<Icon>add</Icon>} size="medium" sx={{px: 0.75}}>Add Condition</Button>
            </Box>
         </Box>
      );
   }
);
