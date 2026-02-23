/*
 * QQQ - Low-code Application Framework for Engineers.
 * Copyright (C) 2021-2026.  Kingsrook, LLC
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
import Button from "@mui/material/Button";
import Icon from "@mui/material/Icon";
import {ApiVersion} from "@qrunio/qqq-frontend-core/lib/controllers/QControllerV1";
import {QInstance} from "@qrunio/qqq-frontend-core/lib/model/metaData/QInstance";
import {QTableMetaData} from "@qrunio/qqq-frontend-core/lib/model/metaData/QTableMetaData";
import {QTableVariant} from "@qrunio/qqq-frontend-core/lib/model/metaData/QTableVariant";
import {QRecord} from "@qrunio/qqq-frontend-core/lib/model/QRecord";
import QContext from "QContext";
import colors from "qqq/assets/theme/base/colors";
import {UseSavedViewsResult} from "qqq/components/query/useSavedViews";
import RecordQueryView from "qqq/models/query/RecordQueryView";
import {QueryScreenUsage} from "qqq/pages/records/query/RecordQuery";
import Client from "qqq/utils/qqq/Client";
import FilterUtils from "qqq/utils/qqq/FilterUtils";
import {SavedViewUtils} from "qqq/utils/qqq/SavedViewUtils";
import ValueUtils from "qqq/utils/qqq/ValueUtils";
import React, {useContext, useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";


interface QuickSavedViewsProps
{
   metaData: QInstance;
   tableMetaData: QTableMetaData;
   apiVersion: ApiVersion;
   tableVariant?: QTableVariant;
   useSavedViewsResult?: UseSavedViewsResult;
   viewOnChangeCallback?: (selectedSavedViewId: number) => Promise<void>;
   queryScreenUsage: QueryScreenUsage;
   currentSavedView: QRecord;
   activeView?: RecordQueryView;
}


/***************************************************************************
 * Component to render a row of "Quick saved view" buttons.
 *
 * These views come from the useSavedViews hook, and are identified as records
 * having "type" == "quickView".
 ***************************************************************************/
export default function QuickSavedViews({metaData, tableMetaData, apiVersion, tableVariant, useSavedViewsResult, viewOnChangeCallback, queryScreenUsage, currentSavedView, activeView}: QuickSavedViewsProps): JSX.Element
{
   const [countsBySavedViewId, setCountsBySavedViewId] = useState({} as Record<number, number>);
   const [errorsBySavedViewId, setErrorsBySavedViewId] = useState({} as Record<number, boolean>);

   const navigate = useNavigate();
   const isQueryScreen = queryScreenUsage == "queryScreen";
   const {accentColor, accentColorLight} = useContext(QContext);

   const qControllerV1 = Client.getInstanceV1();

   const quickViewButtonStyles = {
      fontSize: "0.875rem",
      fontWeight: 500,
      color: "#757575",
      textTransform: "none",
      borderRadius: "0.75rem",
      border: `1px solid ${colors.grayLines.main}`,
      minWidth: "3.5rem",
      minHeight: "auto",
      padding: "0.375rem 0.625rem", whiteSpace: "nowrap",
   };


   /***************************************************************************
    * Event handler for a quick-view being clicked.
    ***************************************************************************/
   const quickViewOnClick = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>, record: QRecord) =>
   {
      event.currentTarget.blur();
      viewOnChangeCallback(record.values.get("id"));
      if (isQueryScreen)
      {
         navigate(`${metaData.getTablePathByName(tableMetaData.name)}/savedView/${record.values.get("id")}`);
      }
   };


   /***************************************************************************
    * dynamically adjust the style of the button based on which view is active
    * and if it's clean or dirty.
    ***************************************************************************/
   const getQuickViewButtonStyleOverrides = (savedView: QRecord): Record<string, any> =>
   {
      if (savedView.values.get("id") == currentSavedView?.values.get("id"))
      {
         const baseView = JSON.parse(currentSavedView.values.get("viewJson")) as RecordQueryView;
         const viewDiffs = activeView ? SavedViewUtils.diffViews(tableMetaData, baseView, activeView) : [];
         if (viewDiffs.length > 0)
         {
            return {backgroundColor: accentColorLight, color: accentColor, borderColor: accentColorLight};
         }
         else
         {
            return {backgroundColor: accentColor, color: "#FFFFFF", borderColor: accentColor};
         }
      }
      return {};
   };

   /***************************************************************************
    * get a string for the data-button-state attribute of the button based on
    * if the button isn't active ("empty"), or is active, then whether it's
    * got changes ("dirty") or not ("clean").
    ***************************************************************************/
   const getQuickViewButtonState = (savedView: QRecord): string =>
   {
      if (savedView.values.get("id") == currentSavedView?.values.get("id"))
      {
         const baseView = JSON.parse(currentSavedView.values.get("viewJson")) as RecordQueryView;
         const viewDiffs = activeView ? SavedViewUtils.diffViews(tableMetaData, baseView, activeView) : [];
         if (viewDiffs.length > 0)
         {
            return "dirty"
         }
         else
         {
            return "clean"
         }
      }
      return "empty";
   }

   const yourQuickViews = useSavedViewsResult?.yourSavedViews?.filter(view => view.values.get("type") == "quickView") ?? [];
   const quickViewsSharedWithYou = useSavedViewsResult?.viewsSharedWithYou?.filter(view => view.values.get("type") == "quickView") ?? [];
   const quickViews: QRecord[] = [...yourQuickViews, ...quickViewsSharedWithYou];
   quickViews.sort((a, b) => a.values.get("sortOrder") - b.values.get("sortOrder"));


   /////////////////////////////////////////////////////////////////////////
   // watch the saved views list. when it changes, fetch fresh counts for //
   // any views that are marked with the "doCount" value set to true      //
   /////////////////////////////////////////////////////////////////////////
   useEffect(() =>
   {
      quickViews.forEach((view) =>
      {
         if (view.values.get("doCount"))
         {
            (async () =>
            {
               const id = view.values.get("id");
               const viewJson = view.values.get("viewJson");
               const viewObject = RecordQueryView.buildFromJSON(viewJson);
               const filterForBackend = FilterUtils.prepQueryFilterForBackend(tableMetaData, viewObject.queryFilter);

               try
               {
                  const [count] = await qControllerV1.count(tableMetaData?.name, apiVersion, filterForBackend, null, undefined, tableVariant);
                  setCountsBySavedViewId(prev => ({...prev, [id]: count}));
                  setErrorsBySavedViewId(prev => ({...prev, [id]: false}));
               }
               catch (e)
               {
                  console.error(e);
                  setErrorsBySavedViewId(prev => ({...prev, [id]: true}));
               }
            })();
         }
      });
   }, [useSavedViewsResult?.yourSavedViews, useSavedViewsResult?.viewsSharedWithYou]);


   return (
      quickViews.length > 0 &&
      <Box data-qqq-id="quick-views-container" display="flex" gap={"0.5rem"} alignItems="center" py={"0.25rem"}>
         {quickViews.map((view) =>
            <Button
               key={view.values.get("id")}
               data-button-state={getQuickViewButtonState(view)}
               sx={{...quickViewButtonStyles, ...getQuickViewButtonStyleOverrides(view), "&:hover": {...quickViewButtonStyles, ...getQuickViewButtonStyleOverrides(view), "&:hover": {}}}}
               onClick={(event) => quickViewOnClick(event, view)}
            >
               {view.values.get("label")}
               {view.values.get("doCount") &&
                  <>
                     {errorsBySavedViewId[view.values.get("id")]
                        ? <span>&nbsp;<Icon sx={{verticalAlign: "text-top"}} title="Error loading count">error_outline</Icon></span>
                        : <span>&nbsp;({ValueUtils.safeToLocaleString(countsBySavedViewId[view.values.get("id")], "...")})</span>
                     }
                  </>
               }
            </Button>
         )}
      </Box>
   );
}
