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


import {DynamicFormFieldDefinition} from "qqq/components/forms/DynamicFormUtils";
import Client from "qqq/utils/qqq/Client";
import {useState} from "react";

const qController = Client.getInstance();

interface Props
{
   useCase?: "form" | "filter";
   processUUID?: string;
   otherValues?: Map<string, any>;
}

interface Result
{
   getDisplayValues: GetDisplayValuesFunction;
   getDisplayValue: GetDisplayValueFunction;
}

export type GetDisplayValueFunction = (field: DynamicFormFieldDefinition, id: any) => Promise<string>;
export type GetDisplayValuesFunction = (field: DynamicFormFieldDefinition, ids: any[]) => Promise<Record<any, string>>;


/***************************************************************************
 * Hook to act as a cache and lookup utility for possible value labels.
 *
 * The hook returns 2 functions, that can be used to get the label for a given
 * possible value field and either 1 or multiple ids
 ***************************************************************************/
export default function usePossibleValueLabels({useCase, processUUID, otherValues}: Props) : Result
{
   const [cache] = useState({} as Record<string, Record<any, string>>);


   /***************************************************************************
    * for a given field, and list of ids, return possible value labels for them
    * in an object key'ed by id.
    ***************************************************************************/
   const getDisplayValues: GetDisplayValuesFunction = async (field, ids) =>
   {
      ////////////////////////////////////////////
      // ensure sub-cache for this field exists //
      ////////////////////////////////////////////
      if (!cache[field.name])
      {
         cache[field.name] = {};
      }

      /////////////////////////////////////
      // check if any ids need looked up //
      /////////////////////////////////////
      const idsNeeded: any[] = [];
      for (let id of ids)
      {
         if(!cache[field.name][id])
         {
            idsNeeded.push(id);
         }
      }

      /////////////////////////////////////////////
      // if any ids are needed, look them up now //
      /////////////////////////////////////////////
      if (idsNeeded.length > 0)
      {
         const possibleValueProps = field.possibleValueProps;
         const possibleValues = await qController.possibleValues({
            fieldNameOrPossibleValueSourceName: possibleValueProps.possibleValueSourceName ?? possibleValueProps.fieldName,
            ids: idsNeeded,
            possibleValueSourceFilter: possibleValueProps.possibleValueSourceFilter,
            processName: possibleValueProps.processName,
            tableName: possibleValueProps.tableName,
            useCase: useCase ?? "form",
            //@ts-ignore
            processUUID: processUUID ?? possibleValueProps.processUUID,
            values: otherValues,
         });

         for (let possibleValue of possibleValues)
         {
            cache[field.name][possibleValue.id] = possibleValue.label
         }
      }

      //////////////////////
      // build return set //
      //////////////////////
      const rs: Record<any, string> = {};
      for (let id of ids)
      {
         rs[id] = cache[field.name][id];
      }

      return rs;
   }


   /***************************************************************************
    * for a given field, return the possible value label for a given id.
    ***************************************************************************/
   const getDisplayValue: GetDisplayValueFunction = async (field, id) =>
   {
      const object = await getDisplayValues(field, [id]);
      return object[id]
   };

   return {
      getDisplayValues,
      getDisplayValue,
   };
}