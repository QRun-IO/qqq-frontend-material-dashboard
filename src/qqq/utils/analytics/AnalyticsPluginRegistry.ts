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

import AnalyticsProviderInterface from "qqq/utils/analytics/AnalyticsProviderInterface";

export type AnalyticsProviderFactory = () => AnalyticsProviderInterface;

export interface AnalyticsPluginRegistryApi
{
   register(name: string, providerFactory: AnalyticsProviderFactory): void;
   unregister(name: string): void;
   has(name: string): boolean;
   create(name: string): AnalyticsProviderInterface | null;
   list(): string[];
}

const providerFactories: Map<string, AnalyticsProviderFactory> = new Map<string, AnalyticsProviderFactory>();


/*******************************************************************************
 **
 *******************************************************************************/
function normalizeName(name: string): string
{
   return (name ?? "").trim().toLowerCase();
}


/*******************************************************************************
 **
 *******************************************************************************/
const registryApi: AnalyticsPluginRegistryApi = {
   register(name: string, providerFactory: AnalyticsProviderFactory): void
   {
      const normalizedName = normalizeName(name);
      if(!normalizedName)
      {
         throw new Error("Analytics provider name must be non-empty.");
      }

      if(typeof providerFactory !== "function")
      {
         throw new Error(`Analytics provider [${normalizedName}] must be registered with a factory function.`);
      }

      providerFactories.set(normalizedName, providerFactory);
   },


   unregister(name: string): void
   {
      providerFactories.delete(normalizeName(name));
   },


   has(name: string): boolean
   {
      return providerFactories.has(normalizeName(name));
   },


   create(name: string): AnalyticsProviderInterface | null
   {
      const factory = providerFactories.get(normalizeName(name));
      if(!factory)
      {
         return null;
      }

      return factory();
   },


   list(): string[]
   {
      return Array.from(providerFactories.keys()).sort();
   }
};


/*******************************************************************************
 ** Ensure registry is available globally for overlay plugin scripts.
 *******************************************************************************/
export function ensureAnalyticsPluginRegistry(): AnalyticsPluginRegistryApi
{
   const win = window as any;
   if(!win.QQQAnalytics)
   {
      win.QQQAnalytics = registryApi;
   }
   return win.QQQAnalytics as AnalyticsPluginRegistryApi;
}


/*******************************************************************************
 **
 *******************************************************************************/
export function getAnalyticsPluginRegistry(): AnalyticsPluginRegistryApi
{
   return ensureAnalyticsPluginRegistry();
}

