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


import {QWidgetMetaData} from "@qrunio/qqq-frontend-core/lib/model/metaData/QWidgetMetaData";
import {QRecord} from "@qrunio/qqq-frontend-core/lib/model/QRecord";
import {Skeleton} from "@mui/material";
import Box from "@mui/material/Box";
import useDynamicComponents from "qqq/utils/qqq/useDynamicComponents";
import {useEffect, useState} from "react";


interface CustomComponentWidgetProps
{
   widgetMetaData: QWidgetMetaData;
   widgetData: any;
   record: QRecord;
}


CustomComponentWidget.defaultProps = {};


/*******************************************************************************
 ** Component to display a custom component - one dynamically loaded.
 *******************************************************************************/
export default function CustomComponentWidget({widgetMetaData, widgetData, record}: CustomComponentWidgetProps): JSX.Element
{
   const [componentName, setComponentName] = useState(widgetMetaData.defaultValues.get("componentName"));
   const [componentSourceUrl, setComponentSourceUrl] = useState(widgetMetaData.defaultValues.get("componentSourceUrl"));

   const {loadComponent, hasComponentLoaded, renderComponent} = useDynamicComponents();

   useEffect(() =>
   {
      loadComponent(componentName, componentSourceUrl);
   }, []);

   const props: any =
      {
         widgetMetaData: widgetMetaData,
         widgetData: widgetData,
         record: record,
      }

   return (<Box id="customComponentWidget" sx={widgetMetaData.defaultValues?.get("sx")}>
      {hasComponentLoaded(componentName) ? renderComponent(componentName, props) : <Skeleton width="100%" height="100%" />}
   </Box>);
}

