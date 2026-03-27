/*
 * QQQ - Low-code Application Framework for Engineers.
 * Copyright (C) 2021-2022.  Kingsrook, LLC
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
