import type {AnalyticsPluginRegistryApi} from "qqq/utils/analytics/AnalyticsPluginRegistry";

declare global
{
   interface Window
   {
      QQQAnalytics?: AnalyticsPluginRegistryApi;
   }
}

export {};

