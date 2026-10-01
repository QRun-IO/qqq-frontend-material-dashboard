/*
 * QQQ - Low-code Application Framework for Engineers.
 * Copyright (C) 2021-2025.  Kingsrook, LLC
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

import {Banner} from "@qrunio/qqq-frontend-core/lib/model/metaData/Banner";
import {QBrandingMetaData} from "@qrunio/qqq-frontend-core/lib/model/metaData/QBrandingMetaData";
import parse from "html-react-parser";

/////////////////////////////////////////////////////////////////////////////////////////////////////////////
// One may render a banner using the functions in this file as:                                            //
//                                                                                                         //
// const banner = getBanner(branding, "QFMD_SIDE_NAV_UNDER_LOGO");                                         //
// return (<Box className={getBannerClassName(banner)} sx={{padding: "1rem", ...getBannerStyles(banner)}}> //
//    {makeBannerContent(banner)}                                                                          //
// </Box>);                                                                                                //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////


/***************************************************************************
 **
 ***************************************************************************/
export function getBanner(branding: QBrandingMetaData, slot: string): Banner | null
{
   if (branding?.banners?.has(slot))
   {
      return (branding.banners.get(slot));
   }

   return (null);
}


/***************************************************************************
 **
 ***************************************************************************/
export function getBannerStyles(banner: Banner)
{
   let bgColor = "";
   let color = "";

   if (banner)
   {
      if (banner.backgroundColor)
      {
         bgColor = banner.backgroundColor;
      }

      if (banner.textColor)
      {
         bgColor = banner.textColor;
      }
   }

   const rest = banner?.additionalStyles ?? {};

   return ({
      backgroundColor: bgColor,
      color: color,
      ...rest
   });
}


/***************************************************************************
 **
 ***************************************************************************/
export function getBannerClassName(banner: Banner)
{
   return `banner ${banner?.severity?.toLowerCase()}`;
}


/***************************************************************************
 **
 ***************************************************************************/
export function makeBannerContent(banner: Banner): JSX.Element
{
   return <>{banner?.messageHTML ? parse(banner?.messageHTML) : banner?.messageText}</>;
}

