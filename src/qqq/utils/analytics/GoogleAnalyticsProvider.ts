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

import {QInstance} from "@qrunio/qqq-frontend-core/lib/model/metaData/QInstance";
import AnalyticsProviderInterface from "qqq/utils/analytics/AnalyticsProviderInterface";
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

         if(sessionValues && sessionValues["googleAnalyticsValues"])
         {
            ReactGA.gtag("set", "user_properties", sessionValues["googleAnalyticsValues"]);
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

