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

import {QInstance} from "@qrunio/qqq-frontend-core/lib/model/metaData/QInstance";
import AnalyticsProviderInterface from "qqq/utils/analytics/AnalyticsProviderInterface";
import AnalyticsUtils from "qqq/utils/analytics/AnalyticsUtils";
import {AnalyticsModel, PageView, UserEvent} from "qqq/utils/analytics/AnalyticsTypes";
import ReactGA from "react-ga4";


export default class GoogleAnalyticsProvider implements AnalyticsProviderInterface
{
   private active: boolean = false;


   /*******************************************************************************
    **
    *******************************************************************************/
   public initialize = (metaData: QInstance, sessionValues: {[key: string]: any} | null): void =>
   {
      if(metaData.environmentValues?.get("GOOGLE_ANALYTICS_ENABLED") == "true" && metaData.environmentValues?.get("GOOGLE_ANALYTICS_TRACKING_ID"))
      {
         this.active = true;
         ReactGA.initialize(metaData.environmentValues.get("GOOGLE_ANALYTICS_TRACKING_ID"),
            {
               gaOptions: {},
               gtagOptions: {}
            });

         const analyticsIdentityValues = AnalyticsUtils.getAnalyticsIdentityValues(sessionValues);
         if(Object.keys(analyticsIdentityValues).length > 0)
         {
            ReactGA.gtag("set", "user_properties", analyticsIdentityValues);
         }
      }
      else
      {
         this.active = false;
      }
   }


   /*******************************************************************************
    **
    *******************************************************************************/
   public record = (model: AnalyticsModel): void =>
   {
      if(!this.active)
      {
         return;
      }

      if(model.hasOwnProperty("location"))
      {
         const pageView = model as PageView;
         ReactGA.send({hitType: "pageview", page: pageView.location.pathname + pageView.location.search, title: pageView.title});
      }
      else if(model.hasOwnProperty("action") || model.hasOwnProperty("category") || model.hasOwnProperty("label"))
      {
         const userEvent = model as UserEvent;
         ReactGA.event({action: userEvent.action, category: userEvent.category, label: userEvent.label});
      }
      else
      {
         console.log("Unrecognizable analytics model", model);
      }
   }


   /*******************************************************************************
    **
    *******************************************************************************/
   public reset = (): void =>
   {
      // no-op for GA in current implementation
   }
}
