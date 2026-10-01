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

import {QInstance} from "@qrunio/qqq-frontend-core/lib/model/metaData/QInstance";
import {QTableMetaData} from "@qrunio/qqq-frontend-core/lib/model/metaData/QTableMetaData";
import {QCriteriaOperator} from "@qrunio/qqq-frontend-core/lib/model/query/QCriteriaOperator";
import {QFilterCriteria} from "@qrunio/qqq-frontend-core/lib/model/query/QFilterCriteria";
import {QQueryFilter} from "@qrunio/qqq-frontend-core/lib/model/query/QQueryFilter";
import {ListItem} from "@mui/material";
import Box from "@mui/material/Box";
import Icon from "@mui/material/Icon";
import IconButton from "@mui/material/IconButton";
import ListItemText from "@mui/material/ListItemText";
import Tooltip from "@mui/material/Tooltip";
import React from "react";
import {Link} from "react-router-dom";
import ValueUtils from "qqq/utils/qqq/ValueUtils";

/*******************************************************************************
 ** Entity that corresponds to qqq backend's ProcessSummaryLine - with methods
 ** to help display properly in a process review screen.
 *******************************************************************************/
export class ProcessSummaryLine
{
   status: "OK" | "INFO" | "WARNING" | "ERROR";

   count: number;
   message: string;
   primaryKeys: any[];

   tableName: string;
   recordId: any;
   filter: any;
   linkPreText: string;
   linkText: string;
   linkPostText: string;

   bulletsOfText: any[];

   constructor(processSummaryLine: any)
   {
      this.status = processSummaryLine.status;
      this.count = processSummaryLine.count;
      this.message = processSummaryLine.message;
      this.primaryKeys = processSummaryLine.primaryKeys;

      this.tableName = processSummaryLine.tableName;
      this.recordId = processSummaryLine.recordId;
      this.linkPreText = processSummaryLine.linkPreText;
      this.linkText = processSummaryLine.linkText;
      this.linkPostText = processSummaryLine.linkPostText;

      this.bulletsOfText = processSummaryLine.bulletsOfText;

      this.filter = processSummaryLine.filter;
   }

   getProcessSummaryListItem(i: number, table: QTableMetaData, qInstance: QInstance, isResultScreen: boolean = false): JSX.Element
   {
      if (this.tableName != undefined && (this.recordId != undefined || this.filter != undefined))
      {
         return (this.getProcessSummaryListItemForTableRecordOrFilterLink(i, table, qInstance, isResultScreen));
      }

      return (this.getProcessSummaryListItemForCountAndMessage(i, table, qInstance, isResultScreen));
   }

   private getProcessSummaryListItemForTableRecordOrFilterLink(i: number, table: QTableMetaData, qInstance: QInstance, isResultScreen: boolean = false): JSX.Element
   {
      const tablePath = qInstance.getTablePathByName(this.tableName);

      return (
         <ListItem key={i} sx={{pl: 4, my: 2}}>
            <Box display="flex" alignItems="top">
               <Icon fontSize="medium" sx={{mr: 1}} color={this.getColor()}>{this.getIcon(isResultScreen)}</Icon>
               <ListItemText primaryTypographyProps={{fontSize: 16}}>
                  {this.linkPreText ?? ""}
                  {
                     this.recordId
                        ? <Link to={`${tablePath}/${this.recordId}`}>{this.linkText}</Link>
                        : <Link to={`${tablePath}?filter=${JSON.stringify(this.filter)}`}>{this.linkText}</Link>
                  }
                  {this.linkPostText ?? ""}
               </ListItemText>
            </Box>
         </ListItem>
      );
   }

   private getProcessSummaryListItemForCountAndMessage(i: number, table: QTableMetaData, qInstance: QInstance, isResultScreen: boolean = false): JSX.Element
   {
      //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
      // split up the message into words - then we'll display the last word by itself with a non-breaking space, no-wrap-glued to the button. //
      //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
      const messageWords = this.message ? this.message.split(" ") : [];
      const lastWord = messageWords.length > 1 ? messageWords[messageWords.length - 1] : "";
      if (messageWords.length > 1)
      {
         messageWords.splice(messageWords.length - 1, 1);
      }

      //////////////////////////////////////////////////////////////////////////////////////////////
      // try to get a link to the records - but note, it may come back null for various reasons - //
      // if it's null, then don't output a link tag.                                              //
      //////////////////////////////////////////////////////////////////////////////////////////////
      const linkToRecords = this.getLinkToRecords(table, qInstance);
      let linkTag = null;
      if(linkToRecords)
      {
         linkTag = <Link target="_blank" to={linkToRecords}>
            <Tooltip title="See these records in a new tab" sx={{py: 0}}>
               <IconButton sx={{py: 0}}><Icon fontSize="small">open_in_new</Icon></IconButton>
            </Tooltip>
         </Link>
      }

      return (
         <ListItem key={i} sx={{pl: 4, my: 2}}>
            <Box display="flex" alignItems="top">
               <Icon fontSize="medium" sx={{mr: 1}} color={this.getColor()}>{this.getIcon(isResultScreen)}</Icon>
               <ListItemText primaryTypographyProps={{fontSize: 16}}>
                  {/* work hard to prevent the icon from falling down to the next line by itself... */}
                  {`${ValueUtils.getFormattedNumber(this.count)} ${messageWords.join(" ")} `}
                  {
                     (linkTag) ? (
                        <span style={{whiteSpace: "nowrap"}}>
                           {lastWord}&nbsp;{linkTag}
                        </span>
                     ) : <span>{lastWord}</span>
                  }
                  {
                     this.bulletsOfText && <ul style={{marginLeft: "2rem"}}>
                        {
                           this.bulletsOfText.map((bullet, index) => <li key={index}>{bullet}</li>)
                        }
                     </ul>
                  }
               </ListItemText>
            </Box>
         </ListItem>
      );
   }

   private getColor(): "success" | "info" | "warning" | "error" | "secondary"
   {
      if (this.status === "OK")
      {
         return "success";
      }
      else if (this.status === "INFO")
      {
         return "info";
      }
      else if (this.status === "WARNING")
      {
         return "warning";
      }
      else if (this.status === "ERROR")
      {
         return "error";
      }
      else
      {
         return "secondary";
      }
   }

   private getIcon(isResultScreen: boolean): string
   {
      if (this.status === "OK")
      {
         return isResultScreen ? "check" : "arrow_forward";
      }
      else if (this.status === "INFO")
      {
         return "info";
      }
      else if (this.status === "WARNING")
      {
         return "warning_amber";
      }
      else if (this.status === "ERROR")
      {
         return "report";
      }
      return "";
   }

   private getLinkToRecords(table: QTableMetaData, qInstance: QInstance): string | null
   {
      if(!table)
      {
         console.log("No table, so not returning a link to records");
         return (null);
      }

      if(!table.primaryKeyField)
      {
         console.log("No table.primaryKeyField, so not returning a link to records");
         return (null);
      }

      const tablePath = qInstance.getTablePath(table);
      if(!tablePath)
      {
         console.log("No tablePath, so not returning a link to records");
         return (null);
      }

      if(!this.primaryKeys)
      {
         console.log("No primaryKeys, so not returning a link to records");
         return (null);
      }

      const filter = new QQueryFilter([new QFilterCriteria(table.primaryKeyField, QCriteriaOperator.IN, this.primaryKeys)]);
      const path = `${tablePath}?filter=${JSON.stringify(filter)}`;

      if(path.length > 2048)
      {
         console.log(`Path is too long [${path.length}], so not returning a link to records.`);
         return (null);
      }

      return (path);
   }
}
