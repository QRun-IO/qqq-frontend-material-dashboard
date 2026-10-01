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

import {QWidgetMetaData} from "@qrunio/qqq-frontend-core/lib/model/metaData/QWidgetMetaData";
import {CompositeData} from "qqq/components/widgets/CompositeWidget";


export interface BlockData
{
   blockId?: string;
   blockTypeName: string;

   tooltip?: BlockTooltip;
   link?: BlockLink;
   tooltipMap?: { [slot: string]: BlockTooltip };
   linkMap?: { [slot: string]: BlockLink };

   values: any;
   styles?: any;

   conditional?: string;
}


export interface BlockTooltip
{
   blockData?: CompositeData;
   title: string | JSX.Element;
   placement: string;
}


export interface BlockLink
{
   href: string;
   target: string;
}


export interface StandardBlockComponentProps
{
   widgetMetaData: QWidgetMetaData;
   data: BlockData;
   actionCallback?: (blockData: BlockData, eventValues?: {[name: string]: any}) => boolean;
}

