/*
 * QQQ - Low-code Application Framework for Engineers.
 * Copyright (C) 2021-2023.  Kingsrook, LLC
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

import {QException} from "@qrunio/qqq-frontend-core/lib/exceptions/QException";
import {QTableMetaData} from "@qrunio/qqq-frontend-core/lib/model/metaData/QTableMetaData";
import {QJobComplete} from "@qrunio/qqq-frontend-core/lib/model/processes/QJobComplete";
import {QJobError} from "@qrunio/qqq-frontend-core/lib/model/processes/QJobError";
import {QRecord} from "@qrunio/qqq-frontend-core/lib/model/QRecord";
import {QCriteriaOperator} from "@qrunio/qqq-frontend-core/lib/model/query/QCriteriaOperator";
import {QFilterCriteria} from "@qrunio/qqq-frontend-core/lib/model/query/QFilterCriteria";
import {QFilterOrderBy} from "@qrunio/qqq-frontend-core/lib/model/query/QFilterOrderBy";
import {QQueryFilter} from "@qrunio/qqq-frontend-core/lib/model/query/QQueryFilter";
import {QueryJoin} from "@qrunio/qqq-frontend-core/lib/model/query/QueryJoin";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Icon from "@mui/material/Icon/Icon";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import FormData from "form-data";
import QContext from "QContext";
import Client from "qqq/utils/qqq/Client";
import ValueUtils from "qqq/utils/qqq/ValueUtils";
import React, {useContext, useEffect, useState} from "react";

interface Props
{
   tableMetaData: QTableMetaData;
   recordId: any;
   record: QRecord;
}

AuditBody.defaultProps =
   {};

const qController = Client.getInstance();

function AuditBody({tableMetaData, recordId, record}: Props): JSX.Element
{
   const [audits, setAudits] = useState([] as QRecord[]);
   const [total, setTotal] = useState(null as number);
   const [limit, setLimit] = useState(1000);
   const [statusString, setStatusString] = useState("Loading audits...");
   const [auditsByDate, setAuditsByDate] = useState([] as QRecord[][]);
   const [auditDetailMap, setAuditDetailMap] = useState(null as Map<number, JSX.Element[]>);
   const [fieldChangeMap, setFieldChangeMap] = useState(null as Map<number, JSX.Element>);
   const [sortDirection, setSortDirection] = useState(localStorage.getItem("audit.sortDirection") === "true");
   const {accentColor} = useContext(QContext);

   function wrapValue(value: any): JSX.Element
   {
      return <span style={{fontWeight: "500", color: " rgb(123, 128, 154)"}}>{value}</span>;
   }

   function wasValue(value: any): JSX.Element
   {
      return <span style={{fontWeight: "100", color: " rgb(123, 128, 154)"}}>{value}</span>;
   }

   function getAuditDetailFieldChangeRow(qRecord: QRecord): JSX.Element | null
   {
      const message = qRecord.values.get("auditDetail.message");
      const fieldName = qRecord.values.get("auditDetail.fieldName");
      const oldValue = qRecord.values.get("auditDetail.oldValue");
      const newValue = qRecord.values.get("auditDetail.newValue");
      if (fieldName && (oldValue !== null || newValue !== null))
      {
         const fieldLabel = tableMetaData?.fields?.get(fieldName)?.label ?? fieldName;
         return (<tr>
            <td>{fieldLabel}</td>
            <td>{oldValue}</td>
            <td>{newValue}</td>
         </tr>);
      }
      return (null);
   }

   function getAuditDetailElement(qRecord: QRecord): JSX.Element | null
   {
      const message = qRecord.values.get("auditDetail.message");
      const fieldName = qRecord.values.get("auditDetail.fieldName");
      const oldValue = qRecord.values.get("auditDetail.oldValue");
      const newValue = qRecord.values.get("auditDetail.newValue");
      if (fieldName && (oldValue !== null || newValue !== null))
      {
         const fieldLabel = tableMetaData?.fields?.get(fieldName)?.label ?? fieldName;
         if (oldValue !== undefined && newValue !== undefined)
         {
            return (<>{fieldLabel}: Changed from {(oldValue)} to <b>{(newValue)}</b></>);
         }
         else if (newValue !== undefined)
         {
            return (<>{fieldLabel}: Set to <b>{(newValue)}</b></>);
         }
         else if (oldValue !== undefined)
         {
            return (<>{fieldLabel}: Removed value {(oldValue)}</>);
         }
         else if (message)
         {
            return (<>{message}</>);
         }

         /*
         const fieldLabel = <span style={{fontWeight: "700", color: "rgb(52, 71, 103)"}}>{tableMetaData?.fields?.get(fieldName)?.label ?? fieldName}</span>;
         if(oldValue !== undefined && newValue !== undefined)
         {
            return (<>Changed {fieldLabel} from {wrapValue(oldValue)} to {wrapValue(newValue)}</>);
         }
         else if(newValue !== undefined)
         {
            return (<>Set {fieldLabel} to {wrapValue(newValue)}</>);
         }
         else if(oldValue !== undefined)
         {
            return (<>Removed {fieldLabel} value {wrapValue(oldValue)}</>);
         }
         */

         /*
         const fieldLabel = <span style={{fontWeight: "700", color: "rgb(52, 71, 103)"}}>{tableMetaData?.fields?.get(fieldName)?.label ?? fieldName}:</span>;
         if(oldValue !== undefined && newValue !== undefined)
         {
            return (<>{fieldLabel} {wrapValue(newValue)} (was {oldValue})</>);
         }
         else if(newValue !== undefined)
         {
            return (<>{fieldLabel} {wrapValue(newValue)} (was --)</>);
         }
         else if(oldValue !== undefined)
         {
            return (<>{fieldLabel} {wrapValue("--")} (was {oldValue})</>);
         }
         */

         /*
         const fieldLabel = <span style={{fontWeight: "700", color: "rgb(52, 71, 103)"}}>{tableMetaData?.fields?.get(fieldName)?.label ?? fieldName}:</span>;
         if(oldValue !== undefined && newValue !== undefined)
         {
            return (<>{fieldLabel} {newValue} {wasValue(`(was ${oldValue})`)}</>);
         }
         else if(newValue !== undefined)
         {
            return (<>{fieldLabel} {newValue} {wasValue("(was --)")}</>);
         }
         else if(oldValue !== undefined)
         {
            return (<>{fieldLabel} -- {wasValue(`(was ${oldValue})`)}</>);
         }
         */

         /*
         const fieldLabel = <span style={{fontWeight: "700", color: "rgb(52, 71, 103)"}}>{tableMetaData?.fields?.get(fieldName)?.label ?? fieldName}:</span>;
         if(oldValue !== undefined && newValue !== undefined)
         {
            return (<>{fieldLabel} Changed to {wrapValue(newValue)} (was {oldValue})</>);
         }
         else if(newValue !== undefined)
         {
            return (<>{fieldLabel} Set to {wrapValue(newValue)}</>);
         }
         else if(oldValue !== undefined)
         {
            return (<>{fieldLabel} Removed value (was {oldValue})</>);
         }
         */
      }
      else if (message)
      {
         return (<>{message}</>);
      }
      return (null);
   }

   useEffect(() =>
   {
      (async () =>
      {
         ///////////////////////////////
         // fetch audits in try-catch //
         ///////////////////////////////
         let audits = [] as QRecord[];
         try
         {
            const qInstance = await qController.loadMetaData();

            //////////////////////////////////////////////////////////////////////////////////
            // Originally audits were loaded by a direct query from this screen.            //
            // but with the addition of table-personalization, and possibly future fetching //
            // of child records, instead call the GetAuditsForRecord process, if it exists. //
            //////////////////////////////////////////////////////////////////////////////////
            const getAuditsProcessName = "GetAuditsForRecord";
            if(qInstance.processes.has(getAuditsProcessName))
            {
               const formData = new FormData();
               formData.append("tableName", tableMetaData.name);
               formData.append("recordId", recordId);
               formData.append("isSortAscending", sortDirection);
               formData.append("limit", limit);
               // todo if/when added: formData.append("includeChildren", includeChildren);
               const processResult = await qController.processRun(getAuditsProcessName, formData);

               if (processResult instanceof QJobError)
               {
                  const jobError = processResult as QJobError
                  throw(jobError.userFacingError ?? jobError.error)
               }

               const jobComplete = processResult as QJobComplete
               jobComplete.values["audits"]?.forEach((audit: any) => audits.push(new QRecord(audit)));
               setAudits(audits);

               setTotal(null);
               if (jobComplete.values["distinctCount"])
               {
                  setTotal(jobComplete.values["distinctCount"]);
               }
            }
            else
            {
               /////////////////////////////////
               // setup filter to load audits //
               /////////////////////////////////
               const filter = new QQueryFilter([
                  new QFilterCriteria("auditTable.name", QCriteriaOperator.EQUALS, [tableMetaData.name]),
                  new QFilterCriteria("recordId", QCriteriaOperator.EQUALS, [recordId]),
               ], [
                  new QFilterOrderBy("timestamp", sortDirection),
                  new QFilterOrderBy("id", sortDirection),
                  new QFilterOrderBy("auditDetail.id", true)
               ], null, "AND", 0, limit);

               audits = await qController.query("audit", filter, [new QueryJoin("auditDetail", true, "LEFT")]);
               setAudits(audits);

               //////////////////////////////////////////////////////////
               // if we fetched the limit, count the total for showing //
               //////////////////////////////////////////////////////////
               if (audits.length == limit)
               {
                  const [count, distinctCount] = await qController.count("audit", filter, null, true); // todo validate distinct working here!
                  setTotal(distinctCount);
               }
            }
         }
         catch (e)
         {
            if (e instanceof QException)
            {
               if ((e as QException).status === 403)
               {
                  setStatusString("You do not have permission to view audits");
                  return;
               }
            }

            setStatusString("Error loading audits");
         }

         //////////////////////////////////////////////////////////////////////////////////////////////////////////
         // group the audits by auditId (e.g., this is a list that joined audit & auditDetail, so un-flatten it) //
         //////////////////////////////////////////////////////////////////////////////////////////////////////////
         const unflattenedAudits: QRecord[] = [];
         const detailMap: Map<number, JSX.Element[]> = new Map();
         const fieldChangeRowsMap: Map<number, JSX.Element[]> = new Map();
         for (let i = 0; i < audits.length; i++)
         {
            let id = audits[i].values.get("id");
            if (i == 0 || unflattenedAudits[unflattenedAudits.length - 1].values.get("id") != id)
            {
               unflattenedAudits.push(audits[i]);
            }

            let auditDetail = getAuditDetailElement(audits[i]);
            if (auditDetail)
            {
               if (!detailMap.has(id))
               {
                  detailMap.set(id, []);
               }

               detailMap.get(id).push(auditDetail);
            }

            // table version, probably not to commit
            let fieldChangeRow = getAuditDetailFieldChangeRow(audits[i]);
            if (auditDetail)
            {
               if (!fieldChangeRowsMap.has(id))
               {
                  fieldChangeRowsMap.set(id, []);
               }
               // fieldChangeRowsMap.get(id).push(fieldChangeRow)
            }
         }
         audits = unflattenedAudits;
         setAuditDetailMap(detailMap);

         const fieldChangeMap: Map<number, JSX.Element> = new Map();
         for (let i = 0; i < unflattenedAudits.length; i++)
         {
            let id = unflattenedAudits[i].values.get("id");
            if (fieldChangeRowsMap.has(id) && fieldChangeRowsMap.get(id).length > 0)
            {
               const fieldChangeTable = (
                  <table style={{fontSize: "0.875rem"}} className="auditDetailTable" cellSpacing="0">
                     <thead>
                        <tr>
                           <td>Field</td>
                           <td>Old Value</td>
                           <td>New Value</td>
                        </tr>
                     </thead>
                     <tbody>
                        {fieldChangeRowsMap.get(id).map((row, key) => <React.Fragment key={key}>{row}</React.Fragment>)}
                     </tbody>
                  </table>
               );
               fieldChangeMap.set(id, fieldChangeTable);
            }
         }
         setFieldChangeMap(fieldChangeMap);

         //////////////////////////////
         // group the audits by date //
         //////////////////////////////
         const auditsByDate = [];
         let thisDatesAudits = null as QRecord[];
         let lastDate = null;
         for (let i = 0; i < audits.length; i++)
         {
            const audit = audits[i];
            const date = ValueUtils.formatDateTime(audit.values.get("timestamp")).split(" ")[0];
            if (date != lastDate)
            {
               thisDatesAudits = [];
               auditsByDate.push(thisDatesAudits);
               lastDate = date;
            }
            thisDatesAudits.push(audit);
         }
         setAuditsByDate(auditsByDate);

         ///////////////////////////
         // set the status string //
         ///////////////////////////
         if (audits.length == 0)
         {
            setStatusString("No audits were found for this record.");
         }
         else
         {
            if (total)
            {
               setStatusString(`Showing first ${limit?.toLocaleString()} of ${total?.toLocaleString()} audit details for this record`);
            }
            else
            {
               if (audits.length == 1)
               {
                  setStatusString("Showing the only audit detail for this record");
               }
               else if (audits.length == 2)
               {
                  setStatusString("Showing the only 2 audit details for this record");
               }
               else
               {
                  setStatusString(`Showing all ${audits.length?.toLocaleString()} audit details for this record`);
               }
            }
         }
      }
      )();
   }, [sortDirection]);

   const changeSortDirection = () =>
   {
      setAudits([]);
      const newSortDirection = !sortDirection;
      setSortDirection(newSortDirection);
      localStorage.setItem("audit.sortDirection", String(newSortDirection));
   };

   const todayFormatted = ValueUtils.formatDateTime(new Date()).split(" ")[0];
   const yesterday = new Date();
   yesterday.setTime(yesterday.getTime() - 24 * 60 * 60 * 1000);
   const yesterdayFormatted = ValueUtils.formatDateTime(yesterday).split(" ")[0];

   return (
      <Box>
         <Box p={3} display="flex" flexDirection="row" justifyContent="space-between" alignItems="flex-start">
            <Typography variant="h5" pb={3}>
               Audit for {tableMetaData.label}: {record?.recordLabel ?? recordId}
               <Typography fontSize={14}>
                  {statusString}
               </Typography>
            </Typography>
            <Box>
               <Typography variant="button" pr={1}>Sort</Typography>
               <ToggleButtonGroup
                  value={sortDirection}
                  exclusive
                  onChange={changeSortDirection}
                  aria-label="text alignment"
               >
                  <ToggleButton value={true} aria-label="sort ascending">
                     <Tooltip title="Sort by time ascending (oldest to newest)" placement="bottom">
                        <Icon>arrow_upward</Icon>
                     </Tooltip>
                  </ToggleButton>
                  <ToggleButton value={false} aria-label="sort descending">
                     <Tooltip title="Sort by time descending (newest to oldest)" placement="bottom">
                        <Icon>arrow_downward</Icon>
                     </Tooltip>
                  </ToggleButton>
               </ToggleButtonGroup>
            </Box>
         </Box>
         <Box sx={{overflow: "auto", height: "calc( 100vh - 19rem )", position: "relative"}} px={3}>
            {
               auditsByDate.length ? auditsByDate.map((audits) =>
               {
                  if (audits.length)
                  {
                     const audit0 = audits[0];
                     const formattedTimestamp = ValueUtils.formatDateTime(audit0.values.get("timestamp"));
                     const timestampParts = formattedTimestamp.split(" ");

                     return (
                        <Box key={audit0.values.get("id")} className="auditGroupBlock">
                           <Box position="sticky" top="0" zIndex={3}>
                              <Box display="flex" flexDirection="row" justifyContent="center" fontSize={14} position={"relative"} top={"-1px"} pb={"6px"} sx={{backgroundImage: "linear-gradient(to bottom, rgba(255,255,255,1), rgba(255,255,255,1) 80%, rgba(255,255,255,0))"}}>
                                 <Box borderTop={1} mt={1.25} mr={1} width="100%" borderColor="#B0B0B0" />
                                 <Box whiteSpace="nowrap">
                                    {ValueUtils.getFullWeekday(audit0.values.get("timestamp"))} {timestampParts[0]}
                                    {timestampParts[0] == todayFormatted ? " (Today)" : ""}
                                    {timestampParts[0] == yesterdayFormatted ? " (Yesterday)" : ""}
                                 </Box>
                                 <Box borderTop={1} mt={1.25} ml={1} width="100%" borderColor="#B0B0B0" />
                              </Box>
                           </Box>

                           {
                              audits.map((audit) =>
                              {
                                 const formattedTimestamp = ValueUtils.formatDateTime(audit.values.get("timestamp"));
                                 const timestampParts = formattedTimestamp.split(" ");

                                 return (
                                    <Box key={audit.values.get("id")} display="flex" flexDirection="row" mb={1} className="singleAuditBlock">
                                       <Avatar sx={{bgcolor: accentColor, zIndex: 2}}>
                                          <Icon>check</Icon>
                                       </Avatar>
                                       <Box p={1} width="100%">
                                          <Box fontSize="0.875rem" color="rgb(123, 128, 154)">
                                             {timestampParts[1]} {timestampParts[2]} {timestampParts[3]} &nbsp; {audit.displayValues.get("auditUserId")}
                                          </Box>
                                          <Box fontSize="0.875rem">
                                             {audit.values.get("message")}
                                          </Box>
                                          <Box fontSize="0.875rem">
                                             <ul style={{"marginLeft": "1rem"}}>
                                                {
                                                   auditDetailMap.get(audit.values.get("id"))?.map((detail, key) =>
                                                   {
                                                      return (<li key={key}>{detail}</li>);
                                                   })
                                                }
                                             </ul>
                                          </Box>
                                          {
                                             fieldChangeMap.has(audit.values.get("id")) && fieldChangeMap.get(audit.values.get("id"))
                                          }
                                       </Box>
                                    </Box>
                                 );
                              })
                           }
                        </Box>
                     );
                  }
                  else
                  {
                     return <></>;
                  }
               }) : <></>
            }
         </Box>
      </Box>);
}

export default AuditBody;
