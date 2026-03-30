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

import {Box, Skeleton} from "@mui/material";
import {AdornmentType} from "@qrunio/qqq-frontend-core/lib/model/metaData/AdornmentType";
import {QFieldMetaData} from "@qrunio/qqq-frontend-core/lib/model/metaData/QFieldMetaData";
import {QWidgetMetaData} from "@qrunio/qqq-frontend-core/lib/model/metaData/QWidgetMetaData";
import {QRecord} from "@qrunio/qqq-frontend-core/lib/model/QRecord";
import DashboardWidgets from "qqq/components/widgets/DashboardWidgets";
import Client from "qqq/utils/qqq/Client";
import React, {useEffect, useRef, useState} from "react";

const qController = Client.getInstance();

interface Props
{
   field: QFieldMetaData;
   record: QRecord;
}

/***************************************************************************
 * Render a field for a view-only screen (e.g., not a form), using a widget.
 * The field is expected to have an adornment of type WIDGET, with a value
 * "widgetName", which should be a valid widget name within the qInstance.
 ***************************************************************************/
export function FieldValueAsWidget({field, record}: Props): JSX.Element
{
   const [widgetName] = useState(field?.getAdornment(AdornmentType.WIDGET)?.getValue("widgetName"));
   const [widgetMetaData, setWidgetMetaData] = useState(null as QWidgetMetaData);
   const [error, setError] = useState(null as string);
   const [ready, setReady] = useState(false);

   const skeletonWrapperRef = useRef();

   const widgetData = record?.values?.get(field.name);

   useEffect(() =>
   {
      (async () =>
      {
         try
         {
            const metaData = await qController.loadMetaData();
            const widgetMetaData = metaData.widgets.get(widgetName);
            if (!widgetMetaData)
            {
               setError(`Could not load widget [${widgetName}]`);
            }
            else
            {
               setWidgetMetaData(widgetMetaData);
               setReady(true);
            }
         }
         catch (e)
         {
            setError(`${e}`);
         }
      })();
   }, []);

   ///////////////////////
   // if error, show it //
   ///////////////////////
   if (error)
   {
      return (<span className="FieldValueAsWidget" style={{color: "red", fontSize: "0.875rem"}}>
         <span>Error: {error}</span>
      </span>
      );
   }

   ///////////////////////////////////////////////////////////////////////////////////////
   // make skeleton fade in after a bit, so if content is fast enough, it doesn't flash //
   ///////////////////////////////////////////////////////////////////////////////////////
   setTimeout(() =>
   {
      try
      {
         if (skeletonWrapperRef.current)
         {
            //@ts-ignore
            skeletonWrapperRef.current.style.opacity = "100";
         }
      }
      catch (e)
      {
         // ignore
      }
   }, 250);

   /////////////////////////////////
   // if not ready, show skeleton //
   /////////////////////////////////
   if (!ready)
   {
      return (<div ref={skeletonWrapperRef} id="it" style={{opacity: 0, transition: "opacity 0.75s ease"}}><Skeleton /></div>);
   }

   /////////////////////////////////////////////
   // assuming all is good, render the widget //
   /////////////////////////////////////////////
   return (<Box component="span" sx={{"& .widget": {padding: "0 !important", display: "inline-block"}}}>
      <DashboardWidgets key={`field:${field.name}`} widgetMetaDataList={[widgetMetaData]} initialWidgetDataList={[widgetData]} omitWrappingGridContainer={true} omitPaddingOnWidget={true} screen="recordView"  />
   </Box>);
}