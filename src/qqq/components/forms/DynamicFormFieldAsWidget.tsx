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

import {Alert, Skeleton} from "@mui/material";
import {AdornmentType} from "@qrunio/qqq-frontend-core/lib/model/metaData/AdornmentType";
import {QFieldMetaData} from "@qrunio/qqq-frontend-core/lib/model/metaData/QFieldMetaData";
import {QWidgetMetaData} from "@qrunio/qqq-frontend-core/lib/model/metaData/QWidgetMetaData";
import FormData from "form-data";
import FilterAndColumnsSetupWidget from "qqq/components/widgets/misc/FilterAndColumnsSetupWidget";
import Client from "qqq/utils/qqq/Client";
import {useEffect, useState} from "react";

interface DynamicFormFieldAsWidgetProps
{
   name: string
   fieldMetaData: QFieldMetaData,
   setValueCallback?: (fieldName: string, value: any, shouldValidate?: boolean) => void,
   otherValues?: Record<string, any>,
}

const qController = Client.getInstance();

export default function DynamicFormFieldAsWidget({name, fieldMetaData, setValueCallback, otherValues}: DynamicFormFieldAsWidgetProps): JSX.Element
{
   const [widgetName, setWidgetName] = useState(fieldMetaData.getAdornment(AdornmentType.WIDGET).getValue("widgetName"));
   const [widgetMetaData, setWidgetMetaData] = useState(null as QWidgetMetaData);
   const [widgetData, setWidgetData] = useState(null as any);

   const [formValues, setFormValues] = useState({} as { [name: string]: any });

   //////////////////////////////////////////////////////////////////////////////////////
   // upon initial load (or if the widget name ever changed??), fetch widget meta data //
   //////////////////////////////////////////////////////////////////////////////////////
   useEffect(() =>
   {
      if (!widgetMetaData || widgetMetaData.name != widgetName)
      {
         (async () =>
         {
            const metaData = await qController.loadMetaData();
            const widgetMetaData = metaData.widgets.get(widgetName);
            setWidgetMetaData(widgetMetaData);
         })();
      }
   }, [widgetName]);

   /////////////////////////////////////////////////////////////////////////
   // upon widget meta data change, fetch widget data / render the widget //
   /////////////////////////////////////////////////////////////////////////
   useEffect(() =>
   {
      if (!widgetMetaData)
      {
         return;
      }

      (async () =>
      {
         const formData: FormData = new FormData();
         if (otherValues)
         {
            for (let key in otherValues)
            {
               formData.append(key, otherValues[key]);
            }
         }

         formData.append("__formFieldAsWidget_FieldName", name);

         const widgetData = await qController.widget(widgetMetaData.name, formData, `${widgetMetaData.name}-${name}`);
         if (widgetData)
         {
            setWidgetData(widgetData);
         }
      })();

   }, [widgetMetaData]);

   /////////////////////////////////////////
   // hooks above here                    //
   // callbacks and other functions below //
   /////////////////////////////////////////

   /*******************************************************************************
    * callback passed in to the rendering of widgets, to pass values out of here
    * back to the containing form
    *******************************************************************************/
   function setFormFieldValuesFromWidget(values: { [name: string]: any })
   {
      for (let key in values)
      {
         setValueCallback(key, values[key]);
      }
   }

   /////////////////////////////////////////
   // callbacks and other functions above //
   // returns below here                  //
   /////////////////////////////////////////

   if (!widgetData || !widgetMetaData)
   {
      return (<Skeleton></Skeleton>);
   }

   /////////////////////////////////
   // switch based on widget type //
   /////////////////////////////////
   if (widgetMetaData.type == "filterAndColumnsSetup")
   {
      /////////////////////////////////////////////////////////////////////////////////////////////////////////
      // if the widget metadata specifies a table name, set form values to that so widget knows which to use //
      // (for the case when it is not being specified by a separate field in the record)                     //
      /////////////////////////////////////////////////////////////////////////////////////////////////////////
      if (widgetData?.tableName)
      {
         formValues["tableName"] = widgetData?.tableName;
      }

      ///////////////////////////////////////////////////////////////////////////////////////////
      // added this for row-builder use-case, where the field name has an index appended to it //
      // but seems safe for general use case as well.                                          //
      ///////////////////////////////////////////////////////////////////////////////////////////
      widgetData.filterFieldName = name;

      return <FilterAndColumnsSetupWidget
         isEditable={true}
         widgetMetaData={widgetMetaData}
         widgetData={widgetData}
         recordValues={otherValues}
         label={widgetData.label ?? widgetMetaData.label ?? "Filter"}
         onSaveCallback={setFormFieldValuesFromWidget}
         widgetComponentProps={{
            omitLabel: true,
            additionalCSS: {
               display: "inline-block",
               position: "relative",
               top: "-2rem",
               marginBottom: "-2rem",
               padding: "0"
            }
         }}
      />;
   }
   else
   {
      ///////////////////////////////////
      // error for unsupported widgets //
      ///////////////////////////////////
      return (<Alert severity="error">Error: Unsupported widget type [{widgetMetaData.type}] in DynamicFormFieldAsWidget</Alert>);
   }
}
