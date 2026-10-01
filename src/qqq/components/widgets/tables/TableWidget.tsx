/*
 * QQQ - Low-code Application Framework for Engineers.
 * Copyright (C) 2021-2023.  Kingsrook, LLC
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
// @ts-ignore
import {htmlToText} from "html-to-text";
import QContext from "QContext";
import HelpContent, {hasHelpContent} from "qqq/components/misc/HelpContent";
import TableCard from "qqq/components/widgets/tables/TableCard";
import Widget, {WidgetData} from "qqq/components/widgets/Widget";
import {WidgetUtils} from "qqq/components/widgets/WidgetUtils";
import HtmlUtils from "qqq/utils/HtmlUtils";
import ValueUtils from "qqq/utils/qqq/ValueUtils";
import React, {useContext, useEffect, useState} from "react";

interface Props
{
   widgetMetaData?: QWidgetMetaData;
   widgetData?: WidgetData;
   reloadWidgetCallback?: (params: string) => void;
   isChild?: boolean;
}

TableWidget.defaultProps = {};

function TableWidget(props: Props): JSX.Element
{
   const [isExportDisabled, setIsExportDisabled] = useState(false); // hmm, would like true here, but it broke...
   const [csv, setCsv] = useState(null as string);
   const [fileName, setFileName] = useState(null as string);
   const {helpHelpActive} = useContext(QContext);

   const rows = props.widgetData?.rows;
   const columns = props.widgetData?.columns;

   useEffect(() =>
   {
      let isExportDisabled = true;
      if (props.widgetData && columns && rows && rows.length > 0)
      {
         isExportDisabled = false;
      }
      setIsExportDisabled(isExportDisabled);

      if (props.widgetData && rows && columns)
      {
         let csv = "";
         for (let j = 0; j < columns.length; j++)
         {
            if (j > 0)
            {
               csv += ",";
            }
            csv += `"${columns[j].header}"`;
         }
         csv += "\n";

         for (let i = 0; i < rows.length; i++)
         {
            for (let j = 0; j < columns.length; j++)
            {
               if (j > 0)
               {
                  csv += ",";
               }

               const cell = rows[i][columns[j].accessor];
               let text = cell;
               if (columns[j].type != "default")
               {
                  text = htmlToText(cell,
                     {
                        selectors: [
                           {selector: "a", format: "inline"},
                           {selector: ".MuiIcon-root", format: "skip"},
                           {selector: ".button", format: "skip"}
                        ]
                     });
               }
               csv += `"${ValueUtils.cleanForCsv(text)}"`;
            }
            csv += "\n";
         }

         setCsv(csv);

         const fileName = WidgetUtils.makeExportFileName(props.widgetData, props.widgetMetaData);
         setFileName(fileName);

         console.log(`useEffect, setting fileName ${fileName}`);
      }

   }, [props.widgetMetaData, props.widgetData]);

   const onExportClick = () =>
   {
      if (props.widgetData?.csvData)
      {
         const csv = WidgetUtils.widgetCsvDataToString(props.widgetData);
         const fileName = WidgetUtils.makeExportFileName(props.widgetData, props.widgetMetaData);
         HtmlUtils.download(fileName, csv);
      }
      else if (csv)
      {
         HtmlUtils.download(fileName, csv);
      }
      else
      {
         alert("There is no data available to export.");
      }
   };

   const labelAdditionalElementsLeft: JSX.Element[] = [];
   if (props.widgetData?.linkText && props.widgetData?.linkURL)
   {
      labelAdditionalElementsLeft.push(WidgetUtils.generateLabelLink(props.widgetData?.linkText, props.widgetData?.linkURL));
   }
   if (props.widgetMetaData?.showExportButton)
   {
      labelAdditionalElementsLeft.push(WidgetUtils.generateExportButton(onExportClick));
   }

   //////////////////////////////////////////////////////
   // look for column-header tooltips from helpContent //
   //////////////////////////////////////////////////////
   const columnHeaderTooltips: { [columnName: string]: JSX.Element } = {};
   for (let column of props.widgetData?.columns ?? [])
   {
      const helpRoles = ["ALL_SCREENS"];
      const slotName = `columnHeader=${column.accessor}`;
      const showHelp = helpHelpActive || hasHelpContent(props.widgetMetaData?.helpContent?.get(slotName), helpRoles);

      if (showHelp)
      {
         const formattedHelpContent = <HelpContent helpContents={props.widgetMetaData?.helpContent?.get(slotName)} roles={helpRoles} helpContentKey={`widget:${props.widgetMetaData?.name};slot:${slotName}`} />;
         columnHeaderTooltips[column.accessor] = formattedHelpContent;
      }
   }

   return (
      <Widget
         widgetMetaData={props.widgetMetaData}
         widgetData={props.widgetData}
         reloadWidgetCallback={(data) => props.reloadWidgetCallback(data)}
         footerHTML={props.widgetData?.footerHTML}
         isChild={props.isChild}
         labelAdditionalElementsLeft={labelAdditionalElementsLeft}
      >
         <TableCard
            noRowsFoundHTML={props.widgetData?.noRowsFoundHTML}
            rowsPerPage={props.widgetData?.rowsPerPage}
            hidePaginationDropdown={props.widgetData?.hidePaginationDropdown}
            fixedStickyLastRow={props.widgetData?.fixedStickyLastRow}
            fixedHeight={props.widgetData?.fixedHeight}
            data={{columns: props.widgetData?.columns, rows: props.widgetData?.rows, columnHeaderTooltips: columnHeaderTooltips}}
            widgetMetaData={props.widgetMetaData}
         />
      </Widget>
   );
}

export default TableWidget;
