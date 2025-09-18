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

import {QInstance} from "@qrunio/qqq-frontend-core/lib/model/metaData/QInstance";
import {QWidgetMetaData} from "@qrunio/qqq-frontend-core/lib/model/metaData/QWidgetMetaData";
import {Box} from "@mui/material";
import React, {useEffect, useState} from "react";
import DashboardWidgets, {WidgetScreenType} from "qqq/components/widgets/DashboardWidgets";
import Widget from "qqq/components/widgets/Widget";
import Client from "qqq/utils/qqq/Client";


//////////////////////////////////////////////
// structure of expected parent widget data //
//////////////////////////////////////////////
export interface ParentWidgetData
{
   label?: string;
   dropdownLabelList: string[];
   dropdownNameList: string[];
   dropdownDataList: {
      id: string,
      label: string
   }[][];
   childWidgetNameList: string[];
   dropdownNeedsSelectedText?: string;
   storeDropdownSelections?: boolean;
   csvData?: any[][];
   icon?: string;
   layoutType: string;
}


////////////////////////////////////
// define properties and defaults //
////////////////////////////////////
interface Props
{
   urlParams?: string,
   widgetMetaData?: QWidgetMetaData,
   widgetIndex: number,
   data: ParentWidgetData,
   reloadWidgetCallback?: (params: string) => void,
   entityPrimaryKey?: string,
   tableName?: string,
   storeDropdownSelections?: boolean,
   screen?: WidgetScreenType;
}


const qController = Client.getInstance();

function ParentWidget({urlParams, widgetMetaData, widgetIndex, data, reloadWidgetCallback, entityPrimaryKey, tableName, storeDropdownSelections, screen}: Props,): JSX.Element
{
   const [childUrlParams, setChildUrlParams] = useState((urlParams) ? urlParams : "");
   const [qInstance, setQInstance] = useState(null as QInstance);
   const [widgets, setWidgets] = useState([] as any[]);

   useEffect(() =>
   {
      (async () =>
      {
         const newQInstance = await qController.loadMetaData();
         setQInstance(newQInstance);
      })();
   }, []);

   useEffect(() =>
   {
      if (qInstance && data && data.childWidgetNameList)
      {
         let widgetMetaDataList = [] as QWidgetMetaData[];
         data?.childWidgetNameList.forEach((widgetName: string) =>
         {
            widgetMetaDataList.push(qInstance.widgets.get(widgetName));
         });
         setWidgets(widgetMetaDataList);
      }
   }, [qInstance, data, childUrlParams]);

   useEffect(() =>
   {
      setChildUrlParams(urlParams);
   }, [urlParams]);

   const parentReloadWidgetCallback = (data: string) =>
   {
      setChildUrlParams(data);
      reloadWidgetCallback(data);
   };

   ///////////////////////////////////////////////////////////////////////////////////////////
   // if this parent widget is in card form, and its children are too, then we need some px //
   ///////////////////////////////////////////////////////////////////////////////////////////
   const parentIsCard = widgetMetaData && widgetMetaData.isCard;
   const childrenAreCards = widgetMetaData && widgets && widgets[0] && widgets[0].isCard;
   const px = (parentIsCard && childrenAreCards) ? 3 : 0;

   //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
   // if this is a parent, which is not a card, then we need to omit the padding, i think, on the Widget that ultimately gets rendered //
   //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
   const omitPadding = !parentIsCard;

   return (
      qInstance && data ? (
         <Widget
            widgetMetaData={widgetMetaData}
            widgetData={data}
            storeDropdownSelections={storeDropdownSelections}
            reloadWidgetCallback={parentReloadWidgetCallback}
            omitPadding={omitPadding}
         >
            <Box sx={{height: "100%", width: "100%"}} px={px}>
               <DashboardWidgets widgetMetaDataList={widgets} entityPrimaryKey={entityPrimaryKey} tableName={tableName} childUrlParams={childUrlParams} areChildren={true} parentWidgetMetaData={widgetMetaData} wrapWidgetsInTabPanels={data.layoutType?.toLowerCase() == "tabs"} screen={screen} />
            </Box>
         </Widget>
      ) : null
   );
}

export default ParentWidget;
