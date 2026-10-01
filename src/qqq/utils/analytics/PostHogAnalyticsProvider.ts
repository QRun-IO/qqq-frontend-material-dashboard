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


export function buildPostHogScriptUrl(apiHost: string, origin: string): string
{
   const scriptUrl = new URL(apiHost, origin);
   const normalizedPathname = scriptUrl.pathname.replace(/\/+$/, "");
   if(scriptUrl.hostname.toLowerCase() == "i.posthog.com")
   {
      scriptUrl.hostname = "assets.i.posthog.com";
   }
   else if(scriptUrl.hostname.toLowerCase().endsWith(".i.posthog.com"))
   {
      scriptUrl.hostname = scriptUrl.hostname.replace(/\.i\.posthog\.com$/i, "-assets.i.posthog.com");
   }

   scriptUrl.hash = "";
   scriptUrl.search = "";
   if(normalizedPathname.toLowerCase().endsWith("/static/array.js"))
   {
      scriptUrl.pathname = normalizedPathname;
   }
   else if(normalizedPathname && normalizedPathname != "/")
   {
      scriptUrl.pathname = `${normalizedPathname}/static/array.js`;
   }
   else
   {
      scriptUrl.pathname = "/static/array.js";
   }

   return (scriptUrl.toString());
}


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
      const scriptUrl = this.getPostHogScriptUrl(apiHost);
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
         script.src = scriptUrl;

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

      const analyticsIdentityValues = AnalyticsUtils.getAnalyticsIdentityValues(sessionValues) as {[key: string]: any};
      const userId = sessionValues?.user?.id || sessionValues?.user?.userId;
      const email = analyticsIdentityValues["user_email"] || sessionValues?.user?.email || sessionValues?.user?.idReference;
      const name = analyticsIdentityValues["name"] || sessionValues?.user?.name || sessionValues?.user?.fullName;
      const clientName = analyticsIdentityValues["client_name"];
      const clientId = analyticsIdentityValues["client_id"];
      const distinctId = userId || email;

      if(!distinctId)
      {
         return;
      }

      const properties: {[key: string]: any} = {};
      if(userId)
      {
         properties.user_id = userId;
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


   /*******************************************************************************
    **
   *******************************************************************************/
   private getPostHogScriptUrl = (apiHost: string): string =>
   {
      return (buildPostHogScriptUrl(apiHost, window.location.origin));
   }
}
