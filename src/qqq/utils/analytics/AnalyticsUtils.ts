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
import {getAnalyticsPluginRegistry} from "qqq/utils/analytics/AnalyticsPluginRegistry";
import {AnalyticsModel} from "qqq/utils/analytics/AnalyticsTypes";
import {registerBuiltInAnalyticsProviders} from "qqq/utils/analytics/BuiltInAnalyticsProviders";
import Client from "qqq/utils/qqq/Client";

export type {AnalyticsModel, PageView, UserEvent} from "qqq/utils/analytics/AnalyticsTypes";

const qController = Client.getInstance();
const DEFAULT_ANALYTICS_PROVIDERS: string[] = ["google", "posthog"];
const pluginScriptLoadPromises: Map<string, Promise<void>> = new Map<string, Promise<void>>();


/*******************************************************************************
 ** Facade over analytics providers.
 *******************************************************************************/
export default class AnalyticsUtils
{
   private metaData: QInstance | null = null;
   private setupPromise: Promise<void> | null = null;
   private providers: AnalyticsProviderInterface[] = [];


   /*******************************************************************************
    **
    *******************************************************************************/
   constructor()
   {
   }


   /*******************************************************************************
    ** Prefer the generic analyticsValues key, but keep googleAnalyticsValues as a
    ** deprecated fallback while app backends migrate their session payloads.
    *******************************************************************************/
   public static getAnalyticsIdentityValues = (sessionValues: {[key: string]: any} | null): {[key: string]: any} =>
   {
      return sessionValues?.analyticsValues ?? sessionValues?.googleAnalyticsValues ?? {};
   }


   /*******************************************************************************
    **
    *******************************************************************************/
   private setup = async (): Promise<void> =>
   {
      this.metaData = await qController.loadMetaData();
      registerBuiltInAnalyticsProviders();
      await this.loadConfiguredPluginScripts();
      this.providers = this.buildConfiguredProviders();

      let sessionValues: {[key: string]: any} = null;
      try
      {
         sessionValues = JSON.parse(localStorage.getItem("sessionValues"));
      }
      catch(e)
      {
         console.log("Error reading session values from localStorage: " + e);
      }

      for(let i = 0; i < this.providers.length; i++)
      {
         try
         {
            this.providers[i].initialize(this.metaData, sessionValues);
         }
         catch(e)
         {
            console.error(`Error initializing analytics provider #${i + 1}`, e);
         }
      }
   }


   /*******************************************************************************
    **
    *******************************************************************************/
   private loadConfiguredPluginScripts = async (): Promise<void> =>
   {
      const environmentValues = this.metaData?.environmentValues;
      const configuredPluginScripts = environmentValues?.get("ANALYTICS_PLUGIN_SCRIPTS") || environmentValues?.get("ANALYTICS_PLUGIN_SCRIPT_URLS");
      const urls = this.parseList(configuredPluginScripts);
      if(urls.length == 0)
      {
         return;
      }

      await Promise.all(urls.map((url) => this.loadPluginScript(url)));
   }


   /*******************************************************************************
    **
    *******************************************************************************/
   private loadPluginScript = async (url: string): Promise<void> =>
   {
      const resolvedUrl = new URL(url, window.location.origin).toString();
      const existingPromise = pluginScriptLoadPromises.get(resolvedUrl);
      if(existingPromise)
      {
         await existingPromise;
         return;
      }

      const loadPromise = new Promise<void>((resolve, reject) =>
      {
         const script = document.createElement("script");
         script.async = true;
         script.crossOrigin = "anonymous";
         script.type = "text/javascript";
         script.src = resolvedUrl;
         script.onload = () => resolve();
         script.onerror = () => reject(new Error(`Failed to load analytics plugin script: ${resolvedUrl}`));
         document.head.appendChild(script);
      });

      pluginScriptLoadPromises.set(resolvedUrl, loadPromise);

      try
      {
         await loadPromise;
      }
      catch(e)
      {
         console.error(e);
      }
   }


   /*******************************************************************************
    **
    *******************************************************************************/
   private buildConfiguredProviders = (): AnalyticsProviderInterface[] =>
   {
      const registry = getAnalyticsPluginRegistry();
      const configuredProviderNames = this.parseList(this.metaData?.environmentValues?.get("ANALYTICS_PROVIDERS"));
      const providerNames = configuredProviderNames.length > 0 ? configuredProviderNames : DEFAULT_ANALYTICS_PROVIDERS;

      const uniqueProviderNames = Array.from(new Set(providerNames.map((name) => name.toLowerCase())));
      const configuredProviders: AnalyticsProviderInterface[] = [];

      for(let i = 0; i < uniqueProviderNames.length; i++)
      {
         const providerName = uniqueProviderNames[i];
         const provider = registry.create(providerName);
         if(!provider)
         {
            console.warn(`Configured analytics provider [${providerName}] was not found in QQQAnalytics registry.`);
            continue;
         }

         if(!this.isValidProvider(provider))
         {
            console.warn(`Configured analytics provider [${providerName}] does not implement required methods.`);
            continue;
         }

         configuredProviders.push(provider);
      }

      if(configuredProviders.length == 0)
      {
         console.warn("No analytics providers were activated.");
      }

      return configuredProviders;
   }


   /*******************************************************************************
    **
    *******************************************************************************/
   private isValidProvider = (provider: AnalyticsProviderInterface): boolean =>
   {
      return typeof provider.initialize === "function"
         && typeof provider.record === "function"
         && typeof provider.reset === "function";
   }


   /*******************************************************************************
    **
    *******************************************************************************/
   private parseList = (csv: string | null | undefined): string[] =>
   {
      if(!csv)
      {
         return [];
      }

      return csv
         .split(/[,\n\r;]/g)
         .map((value) => value.trim())
         .filter((value) => value.length > 0);
   }


   /*******************************************************************************
    **
    *******************************************************************************/
   private ensureSetup = async (): Promise<void> =>
   {
      if(this.metaData != null)
      {
         return;
      }

      if(this.setupPromise == null)
      {
         this.setupPromise = this.setup();
      }

      await this.setupPromise;
   }


   /*******************************************************************************
    **
    *******************************************************************************/
   public initialize = () =>
   {
      (async () =>
      {
         await this.ensureSetup();
      })();
   }


   /*******************************************************************************
    **
    *******************************************************************************/
   public recordAnalytics = (model: AnalyticsModel) =>
   {
      (async () =>
      {
         await this.ensureSetup();
         for(let i = 0; i < this.providers.length; i++)
         {
            try
            {
               this.providers[i].record(model);
            }
            catch(e)
            {
               console.error(`Error recording analytics for provider #${i + 1}`, e);
            }
         }
      })();
   }


   /*******************************************************************************
    **
    *******************************************************************************/
   public reset = () =>
   {
      for(let i = 0; i < this.providers.length; i++)
      {
         try
         {
            this.providers[i].reset();
         }
         catch(e)
         {
            console.error(`Error resetting analytics provider #${i + 1}`, e);
         }
      }
   }
}
