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

import {QInstance} from "@qrunio/qqq-frontend-core/lib/model/metaData/QInstance";
import {Box, Grid} from "@mui/material";
import {VectorMap} from "@react-jvectormap/core";
import {usAea} from "@react-jvectormap/unitedstates";
import React, {useEffect, useState} from "react";
import Client from "qqq/utils/qqq/Client";


////////////////////////////////////////////////
// structure of expected US and A widget data //
////////////////////////////////////////////////
export interface MapMarkerData
{
   name: string;
   latitude: number;
   longitude: number;
}
export interface USMapWidgetData
{
   height: string;
   markers?: MapMarkerData[];
}


////////////////////////////////////
// define properties and defaults //
////////////////////////////////////
interface Props
{
   widgetIndex: number;
   label: string;
   icon?: string;
   reloadWidgetCallback?: (widgetIndex: number, params: string) => void;
   data: USMapWidgetData;
}


const qController = Client.getInstance();
function USMapWidget(props: Props, ): JSX.Element
{
   const [qInstance, setQInstance] = useState(null as QInstance);

   useEffect(() =>
   {
      (async () =>
      {
         const newQInstance = await qController.loadMetaData();
         setQInstance(newQInstance);
      })();
   }, []);

   return (
      <Grid container>
         <Grid item xs={12} sx={{height: props.data?.height}}>
            {
               props.data?.height && (
                  <Box mt={3} sx={{height: "100%"}}>
                     <VectorMap
                        map={usAea}
                        zoomOnScroll={false}
                        zoomButtons={false}
                        markersSelectable
                        backgroundColor="transparent"
                        markers={[
                           {
                              name: "edison",
                              latLng: [40.5274, -74.3933],
                           },
                           {
                              name: "stockton",
                              latLng: [37.975556, -121.300833],
                           },
                           {
                              name: "patterson",
                              latLng: [37.473056, -121.132778],
                           },
                        ]}
                        regionStyle={{
                           initial: {
                              fill: "#dee2e7",
                              "fill-opacity": 1,
                              stroke: "none",
                              "stroke-width": 0,
                              "stroke-opacity": 0,
                           },
                        }}
                        markerStyle={{
                           initial: {
                              fill: "#e91e63",
                              stroke: "#ffffff",
                              "stroke-width": 5,
                              "stroke-opacity": 0.5,
                              r: 7,
                           },
                           hover: {
                              fill: "E91E63",
                              stroke: "#ffffff",
                              "stroke-width": 5,
                              "stroke-opacity": 0.5,
                           },
                           selected: {
                              fill: "E91E63",
                              stroke: "#ffffff",
                              "stroke-width": 5,
                              "stroke-opacity": 0.5,
                           },
                        }}
                        style={{
                           marginTop: "-1.5rem",
                        }}
                        onRegionTipShow={() => false}
                        onMarkerTipShow={() => false}
                     />
                  </Box>
               )
            }

         </Grid>
      </Grid>
   );
}

export default USMapWidget;
