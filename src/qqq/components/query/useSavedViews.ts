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

import {QController} from "@qrunio/qqq-frontend-core/lib/controllers/QController";
import {QInstance} from "@qrunio/qqq-frontend-core/lib/model/metaData/QInstance";
import {QTableMetaData} from "@qrunio/qqq-frontend-core/lib/model/metaData/QTableMetaData";
import {QJobComplete} from "@qrunio/qqq-frontend-core/lib/model/processes/QJobComplete";
import {QJobError} from "@qrunio/qqq-frontend-core/lib/model/processes/QJobError";
import {QRecord} from "@qrunio/qqq-frontend-core/lib/model/QRecord";
import FormData from "form-data";
import QContext from "QContext";
import {useContext, useEffect, useState} from "react";


interface Props
{
   qController: QController;
   metaData?: QInstance;
   tableMetaData?: QTableMetaData;
}


export interface UseSavedViewsResult
{
   savedViews: QRecord[];
   yourSavedViews: QRecord[];
   viewsSharedWithYou: QRecord[];
   savedViewsHaveLoaded: boolean;

   loadSavedViews: () => Promise<void>;
   makeSavedViewRequest: (processName: string, formData: FormData) => Promise<QRecord[]>;
}


/***************************************************************************
 * Hook used by RecordQuery screen to load and manage saved views.  Meant
 * for use by sub-components of RecordQuery that need access to saved views.
 ***************************************************************************/
export default function useSavedViews(props: Props): UseSavedViewsResult
{
   const {qController, metaData, tableMetaData} = props;

   const [savedViews, setSavedViews] = useState([] as QRecord[]);
   const [yourSavedViews, setYourSavedViews] = useState([] as QRecord[]);
   const [viewsSharedWithYou, setViewsSharedWithYou] = useState([] as QRecord[]);

   const [savedViewsHaveLoaded, setSavedViewsHaveLoaded] = useState(false);

   const {userId: currentUserId} = useContext(QContext);

   //////////////////////////////////////////////////////////////////////////
   // load filters on first run, then monitor location or metadata changes //
   //////////////////////////////////////////////////////////////////////////
   useEffect(() =>
   {
      if (metaData && metaData.processes.has("querySavedView") && tableMetaData)
      {
         loadSavedViews()
      }
   }, [tableMetaData, metaData]);


   /*******************************************************************************
    ** make request to load all saved filters from backend
    *******************************************************************************/
   async function loadSavedViews()
   {
      setSavedViewsHaveLoaded(false);
      if (!tableMetaData)
      {
         return;
      }

      const formData = new FormData();
      formData.append("tableName", tableMetaData.name);

      let savedViews = await makeSavedViewRequest("querySavedView", formData);
      setSavedViews(savedViews);

      const yourSavedViews: QRecord[] = [];
      const viewsSharedWithYou: QRecord[] = [];
      for (let i = 0; i < savedViews.length; i++)
      {
         const record = savedViews[i];
         if (record.values.get("userId") == currentUserId)
         {
            yourSavedViews.push(record);
         }
         else
         {
            viewsSharedWithYou.push(record);
         }
      }
      setYourSavedViews(yourSavedViews);
      setViewsSharedWithYou(viewsSharedWithYou);
      setSavedViewsHaveLoaded(true);
   }


   /*******************************************************************************
    ** make a request to the backend for various savedView processes
    *******************************************************************************/
   async function makeSavedViewRequest(processName: string, formData: FormData): Promise<QRecord[]>
   {
      /////////////////////////
      // fetch saved filters //
      /////////////////////////
      let savedViews = [] as QRecord[];
      try
      {
         //////////////////////////////////////////////////////////////////
         // we don't want this job to go async, so, pass a large timeout //
         //////////////////////////////////////////////////////////////////
         formData.append(QController.STEP_TIMEOUT_MILLIS_PARAM_NAME, 60 * 1000);
         const processResult = await qController.processInit(processName, formData, qController.defaultMultipartFormDataHeaders());
         if (processResult instanceof QJobError)
         {
            const jobError = processResult as QJobError;
            throw (jobError.error);
         }
         else
         {
            const result = processResult as QJobComplete;
            if (result.values.savedViewList)
            {
               for (let i = 0; i < result.values.savedViewList.length; i++)
               {
                  const qRecord = new QRecord(result.values.savedViewList[i]);
                  savedViews.push(qRecord);
               }
            }
         }
      }
      catch (e)
      {
         throw (e);
      }

      return (savedViews);
   }


   return ({
      savedViews,
      yourSavedViews,
      viewsSharedWithYou,
      savedViewsHaveLoaded,
      loadSavedViews,
      makeSavedViewRequest
   });
}