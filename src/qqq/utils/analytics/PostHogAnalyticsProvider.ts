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

type PostHogType = {
   __QQQ_POSTHOG_INITIALIZED?: boolean;
   __SV?: number;
   _i?: any[];
   people?: any[];
   push?: (...items: any[]) => number;
   init?: (token: string, config: {[key: string]: any}, name?: string) => void;
   identify?: (distinctId: string, properties?: {[key: string]: any}) => void;
   capture?: (event: string, properties?: {[key: string]: any}) => void;
   reset?: () => void;
   [name: string]: any;
};


export default class PostHogAnalyticsProvider implements AnalyticsProviderInterface
{
   private active: boolean = false;


   /*******************************************************************************
    **
    *******************************************************************************/
   public initialize = (metaData: QInstance, sessionValues: {[key: string]: any} | null): void =>
   {
      const postHogEnabled = metaData.environmentValues?.get("POSTHOG_ENABLED") == "true";
      const postHogApiKey = metaData.environmentValues?.get("POSTHOG_API_KEY") || metaData.environmentValues?.get("POSTHOG_PROJECT_API_KEY");
      const postHogHost = metaData.environmentValues?.get("POSTHOG_HOST") || "https://us.i.posthog.com";

      if(postHogEnabled && postHogApiKey)
      {
         this.active = true;
         this.initializePostHog(postHogApiKey, postHogHost);
         this.identify(sessionValues);
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
         this.getPostHog()?.capture?.("$pageview", {
            path: pageView.location.pathname,
            search: pageView.location.search,
            title: pageView.title
         });
      }
      else if(model.hasOwnProperty("action") || model.hasOwnProperty("category") || model.hasOwnProperty("label"))
      {
         const userEvent = model as UserEvent;
         this.getPostHog()?.capture?.(userEvent.action, {
            category: userEvent.category,
            label: userEvent.label
         });
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
      this.getPostHog()?.reset?.();
   }


   /*******************************************************************************
    **
   *******************************************************************************/
   private initializePostHog = (projectApiKey: string, apiHost: string): void =>
   {
      const win = window as any;
      win.posthog = win.posthog || [];
      const existingPostHog = this.getPostHog();
      if(existingPostHog && existingPostHog.__QQQ_POSTHOG_INITIALIZED)
      {
         return;
      }

      (function(document: Document, posthog: PostHogType)
      {
         if(posthog.__SV)
         {
            return;
         }

         posthog.__SV = 1;
         posthog._i = posthog._i || [];
         posthog.people = posthog.people || [];

         const createStub = (target: any, method: string) =>
         {
            let queueTarget = target;
            let queueMethod = method;
            const splitMethod = method.split(".");
            if(splitMethod.length == 2)
            {
               queueTarget = target[splitMethod[0]] = target[splitMethod[0]] || [];
               queueMethod = splitMethod[1];
            }

            queueTarget[queueMethod] = (...args: any[]) =>
            {
               queueTarget.push([queueMethod, ...args]);
            };
         };

         const methods = "capture identify alias group register register_once unregister unregister_once set_config reset opt_in_capturing opt_out_capturing has_opted_in_capturing has_opted_out_capturing clear_opt_in_out_capturing start_session_recording stop_session_recording setPersonPropertiesForFlags onFeatureFlags".split(" ");
         methods.forEach((method) => createStub(posthog, method));
         posthog.init = (token: string, config: {[key: string]: any}, name?: string) =>
         {
            const target = name ? (posthog[name] = posthog[name] || []) : posthog;
            target.people = target.people || [];
            methods.forEach((method) => createStub(target, method));
            posthog._i?.push([token, config, name || "posthog"]);
         };

         const script = document.createElement("script");
         script.id = "qqq-posthog-js";
         script.async = true;
         script.crossOrigin = "anonymous";
         script.type = "text/javascript";

         const normalizedHost = apiHost.replace(/\/+$/, "");
         const assetHost = normalizedHost.includes(".i.posthog.com") ? normalizedHost.replace(".i.posthog.com", "-assets.i.posthog.com") : normalizedHost;
         script.src = `${assetHost}/static/array.js`;

         const firstScript = document.getElementsByTagName("script")[0];
         if(firstScript && firstScript.parentNode)
         {
            firstScript.parentNode.insertBefore(script, firstScript);
         }
         else
         {
            document.head.appendChild(script);
         }
      })(document, win.posthog);

      const postHog = this.getPostHog();
      postHog?.init?.(projectApiKey, {
         api_host: apiHost,
         person_profiles: "identified_only",
         capture_pageview: false,
         session_idle_timeout_seconds: 5 * 60
      });
      if(postHog)
      {
         postHog.__QQQ_POSTHOG_INITIALIZED = true;
      }
   }


   /*******************************************************************************
    **
    *******************************************************************************/
   private identify = (sessionValues: {[key: string]: any} | null): void =>
   {
      if(!this.active)
      {
         return;
      }

      const googleAnalyticsValues = (sessionValues?.googleAnalyticsValues ?? {}) as {[key: string]: any};
      const ctlUserId = googleAnalyticsValues["ctl_user_id"] || sessionValues?.user?.id || sessionValues?.user?.userId;
      const email = googleAnalyticsValues["user_email"] || sessionValues?.user?.email || sessionValues?.user?.idReference;
      const name = googleAnalyticsValues["name"] || sessionValues?.user?.name || sessionValues?.user?.fullName;
      const clientName = googleAnalyticsValues["client_name"];
      const clientId = googleAnalyticsValues["client_id"];
      const distinctId = ctlUserId || email;

      if(!distinctId)
      {
         return;
      }

      const properties: {[key: string]: any} = {};
      if(ctlUserId)
      {
         properties.ctl_user_id = ctlUserId;
      }
      if(email)
      {
         properties.email = email;
      }
      if(name)
      {
         properties.name = name;
      }
      if(clientName)
      {
         properties.client = clientName;
         properties.client_name = clientName;
      }
      if(clientId)
      {
         properties.client_id = clientId;
      }

      this.getPostHog()?.identify?.(String(distinctId), properties);
   }


   /*******************************************************************************
    **
    *******************************************************************************/
   private getPostHog = (): PostHogType | null =>
   {
      return (window as any).posthog || null;
   }
}
