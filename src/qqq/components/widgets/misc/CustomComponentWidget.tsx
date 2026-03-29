/*
 * QQQ - Low-code Application Framework for Engineers.
 * Copyright (C) 2021-2024.  Kingsrook, LLC
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

