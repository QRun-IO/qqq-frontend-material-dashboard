/*
 * QQQ - Low-code Application Framework for Engineers.
 * Copyright (C) 2021-2026.  Kingsrook, LLC
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
import {QTableMetaData} from "@qrunio/qqq-frontend-core/lib/model/metaData/QTableMetaData";
import {QRecord} from "@qrunio/qqq-frontend-core/lib/model/QRecord";
import {ChildRecordListData} from "qqq/components/widgets/misc/RecordGridWidget";
import {FieldRule} from "qqq/models/fields/FieldRules";
import {createContext} from "react";

export type RecordScreenMode = "view" | "edit" | "create";

export interface RecordScreenContextValue
{
   mode: RecordScreenMode;
   tableMetaData: QTableMetaData;
   metaData: QInstance;
   record: QRecord;
   setFieldValue: (name: string, value: any, shouldValidate?: boolean) => void;
   handleFieldBlur: (fieldName: string, value: any) => void;
   reloadWidget: (widgetName: string, additionalParams?: { [key: string]: any }) => void;
   fieldRules: FieldRule[];
   isFormDisabled: boolean;

   // widget sub-validations
   addSubValidations: (name: string, validations: Record<string, any>) => void;

   // enter edit mode callback (for pencil icons in view mode)
   onEditIconClick?: (fieldName?: string) => void;

   // child record management (edit mode)
   childListWidgetData: { [name: string]: ChildRecordListData };
   openAddChildRecord: (widgetName: string, widgetData: ChildRecordListData) => void;
   openEditChildRecord: (widgetName: string, widgetData: ChildRecordListData, rowIndex: number) => void;
   deleteChildRecord: (widgetName: string, rowIndex: number) => void;
}

const RecordScreenContext = createContext<RecordScreenContextValue>({
   mode: "view",
   tableMetaData: null,
   metaData: null,
   record: null,
   setFieldValue: () =>
   {
   },
   handleFieldBlur: () =>
   {
   },
   reloadWidget: () =>
   {
   },
   fieldRules: [],
   isFormDisabled: false,
   addSubValidations: () =>
   {
   },
   childListWidgetData: {},
   openAddChildRecord: () =>
   {
   },
   openEditChildRecord: () =>
   {
   },
   deleteChildRecord: () =>
   {
   },
});

export default RecordScreenContext;
