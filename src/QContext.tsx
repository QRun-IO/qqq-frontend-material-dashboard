/*
 * QQQ - Low-code Application Framework for Engineers.
 * Copyright (C) 2021-2022.  Kingsrook, LLC
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

import {QBrandingMetaData} from "@qrunio/qqq-frontend-core/lib/model/metaData/QBrandingMetaData";
import {QProcessMetaData} from "@qrunio/qqq-frontend-core/lib/model/metaData/QProcessMetaData";
import {QTableMetaData} from "@qrunio/qqq-frontend-core/lib/model/metaData/QTableMetaData";
import {AnalyticsModel} from "qqq/utils/analytics/AnalyticsUtils";
import {createContext, ReactNode} from "react";

interface QContext
{
   pageHeader: string | JSX.Element;
   setPageHeader?: (header: string | JSX.Element) => void;
   pageHeaderRightContent?: ReactNode;
   setPageHeaderRightContent?: (content: ReactNode) => void;

   accentColor: string;
   setAccentColor?: (color: string) => void;

   accentColorLight: string;
   setAccentColorLight?: (color: string) => void;

   dotMenuOpen: boolean;
   setDotMenuOpen?: (dotMenuOpen: boolean) => void;

   keyboardHelpOpen: boolean;
   setKeyboardHelpOpen?: (keyboardHelpOpen: boolean) => void;

   modalStack: string[];
   pushModalOnStack?: (modalIdentifier: string) => void;
   popModalOffStack?: (modalIdentifier: string) => void;
   clearModalStack?: () => void;

   tableMetaData?: QTableMetaData;
   setTableMetaData?: (tableMetaData: QTableMetaData) => void;

   tableProcesses?: QProcessMetaData[];
   setTableProcesses?: (tableProcesses: QProcessMetaData[]) => void;

   ///////////////////////////////////////////
   // function to record an analytics event //
   ///////////////////////////////////////////
   recordAnalytics?: (model: AnalyticsModel) => void;

   ///////////////////////////////////
   // constants - no setters needed //
   ///////////////////////////////////
   pathToLabelMap?: {[path: string]: string};
   branding?: QBrandingMetaData;
   helpHelpActive?: boolean;
   userId?: string;
}

const defaultState = {
   pageHeader: "",
   pageHeaderRightContent: null as ReactNode,
   accentColor: "#0062FF",
   accentColorLight: "#C0D6F7",
   dotMenuOpen: false,
   keyboardHelpOpen: false,
   pathToLabelMap: {},
   helpHelpActive: false,
   modalStack: [] as string[],
};

const QContext = createContext<QContext>(defaultState);
export default QContext;
