/* QQQ - Low-code Application Framework for Engineers.
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

import {Capability} from "@qrunio/qqq-frontend-core/lib/model/metaData/Capability";
import {QAppMetaData} from "@qrunio/qqq-frontend-core/lib/model/metaData/QAppMetaData";
import {QAppNodeType} from "@qrunio/qqq-frontend-core/lib/model/metaData/QAppNodeType";
import {QInstance} from "@qrunio/qqq-frontend-core/lib/model/metaData/QInstance";
import {QProcessMetaData} from "@qrunio/qqq-frontend-core/lib/model/metaData/QProcessMetaData";
import {QReportMetaData} from "@qrunio/qqq-frontend-core/lib/model/metaData/QReportMetaData";
import {QTableMetaData} from "@qrunio/qqq-frontend-core/lib/model/metaData/QTableMetaData";
import {QWidgetMetaData} from "@qrunio/qqq-frontend-core/lib/model/metaData/QWidgetMetaData";
import {Icon, Typography} from "@mui/material";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import QContext from "QContext";
import colors from "qqq/assets/theme/base/colors";
import MDTypography from "qqq/components/legacy/MDTypography";
import ProcessLinkCard from "qqq/components/processes/ProcessLinkCard";
import DashboardWidgets from "qqq/components/widgets/DashboardWidgets";
import MiniStatisticsCard from "qqq/components/widgets/statistics/MiniStatisticsCard";
import BaseLayout from "qqq/layouts/BaseLayout";
import Client from "qqq/utils/qqq/Client";
import React, {useContext, useEffect, useState} from "react";
import {Link, useLocation} from "react-router-dom";

const qController = Client.getInstance();

interface Props
{
   app?: QAppMetaData;
}

function AppHome({app}: Props): JSX.Element
{
   const [qInstance, setQInstance] = useState(null as QInstance);
   const [tables, setTables] = useState([] as QTableMetaData[]);
   const [processes, setProcesses] = useState([] as QProcessMetaData[]);
   const [reports, setReports] = useState([] as QReportMetaData[]);
   const [childApps, setChildApps] = useState([] as QAppMetaData[]);
   const [tableCounts, setTableCounts] = useState(new Map<string, { isLoading: boolean, value: number }>());
   const [tableCountNumbers, setTableCountNumbers] = useState(new Map<string, string>());
   const [tableCountTexts, setTableCountTexts] = useState(new Map<string, string>() as any);
   const [updatedTableCounts, setUpdatedTableCounts] = useState(new Date());
   const [widgets, setWidgets] = useState([] as any[]);

   const {pageHeader, recordAnalytics, setPageHeader} = useContext(QContext);

   const location = useLocation();

   useEffect(() =>
   {
      (async () =>
      {
         const newQInstance = await qController.loadMetaData();
         setQInstance(newQInstance);
      })();
   }, []);

   const mdbMetaData = app?.supplementalAppMetaData?.get("materialDashboard");
   let showAppLabelOnHomeScreen = true;
   let includeTableCountsOnHomeScreen = true;
   if(mdbMetaData)
   {
      showAppLabelOnHomeScreen = mdbMetaData.showAppLabelOnHomeScreen;
      includeTableCountsOnHomeScreen = mdbMetaData.includeTableCountsOnHomeScreen;
   }

   useEffect(() =>
   {
      setPageHeader(null);
      recordAnalytics({location: window.location, title: "App: " + app.label});
      recordAnalytics({category: "appEvents", action: "loadAppScreen", label: app.label});

      if (!qInstance)
      {
         return;
      }

      const newTables: QTableMetaData[] = [];
      const newProcesses: QProcessMetaData[] = [];
      const newReports: QReportMetaData[] = [];
      const newChildApps: QAppMetaData[] = [];

      app.children.forEach((child) =>
      {
         switch (child.type)
         {
            // todo - filter out hidden
            case QAppNodeType.TABLE:
               newTables.push(qInstance.tables.get(child.name));
               break;
            case QAppNodeType.PROCESS:
               newProcesses.push(qInstance.processes.get(child.name));
               break;
            case QAppNodeType.REPORT:
               newReports.push(qInstance.reports.get(child.name));
               break;
            case QAppNodeType.APP:
               newChildApps.push(qInstance.apps.get(child.name));
               break;
            default:
               console.log(`Unexpected child type: ${child.type}`);
         }
      });

      setTables(newTables);
      setProcesses(newProcesses);
      setReports(newReports);
      setChildApps(newChildApps);

      const tableCounts = new Map<string, { isLoading: boolean, value: number }>();
      const tableCountNumbers = new Map<string, string>();
      const tableCountTexts = new Map<string, string>();
      newTables.forEach((table) =>
      {
         if(includeTableCountsOnHomeScreen)
         {
            tableCounts.set(table.name, {isLoading: true, value: null});
            setTimeout(async () =>
            {
               const tableMetaData = await qController.loadTableMetaData(table.name);
               let countResult = null;
               if (tableMetaData.capabilities.has(Capability.TABLE_COUNT) && tableMetaData.readPermission)
               {
                  try
                  {
                     [countResult] = await qController.count(table.name);

                     if (countResult !== null && countResult !== undefined)
                     {
                        tableCountNumbers.set(table.name, countResult.toLocaleString());
                        tableCountTexts.set(table.name, countResult === 1 ? "total record" : "total records");
                     }
                     else
                     {
                        tableCountNumbers.set(table.name, "–");
                        tableCountTexts.set(table.name, " ");
                     }
                  }
                  catch (e)
                  {
                     console.log("Caught: " + e);
                     tableCountNumbers.set(table.name, "–");
                     tableCountTexts.set(table.name, " ");
                  }
               }
               else
               {
                  tableCountNumbers.set(table.name, "–");
                  tableCountTexts.set(table.name, " ");
               }

               tableCounts.set(table.name, {isLoading: false, value: countResult});
               setTableCounts(tableCounts);
               setTableCountNumbers(tableCountNumbers);
               setTableCountTexts(tableCountTexts);
               setUpdatedTableCounts(new Date());
            }, 1);
         }
         else
         {
            tableCounts.set(table.name, {isLoading: false, value: null});
            tableCountNumbers.set(table.name, " ");
            tableCountTexts.set(table.name, " ");

            setTableCounts(tableCounts);
            setTableCountNumbers(tableCountNumbers);
            setTableCountTexts(tableCountTexts);
         }
      });
      setTableCounts(tableCounts);

      if (app.widgets)
      {
         ///////////////////////////
         // load widget meta data //
         ///////////////////////////
         const matchingWidgets: QWidgetMetaData[] = [];
         app.widgets.forEach((widgetName) =>
         {
            const widget = qInstance.widgets.get(widgetName);
            matchingWidgets.push(widget);
         });
         setWidgets(matchingWidgets);
      }
   }, [qInstance, location]);

   const tileSizeLg = 3;

   const hasTablePermission = (tableName: string) =>
   {
      return tables.find(t => t.name === tableName && (t.readPermission || t.insertPermission || t.editPermission || t.deletePermission));
   };

   const hasProcessPermission = (processName: string) =>
   {
      return processes.find(p => p.name === processName && p.hasPermission);
   };

   const hasReportPermission = (reportName: string) =>
   {
      return reports.find(r => r.name === reportName && r.hasPermission);
   };

   const widgetCount = widgets ? widgets.length : 0;
   const sectionCount = app.sections ? app.sections.length : 0;

   //////////////////////////////////////////////////////////////////////////////////////////////////////
   // if our app has no widgets or sections, but it does have child apps, then return those child apps //
   //////////////////////////////////////////////////////////////////////////////////////////////////////
   if(widgetCount == 0 && sectionCount == 0 && childApps && childApps.length > 0)
   {
      return (
         <BaseLayout>
            {
               showAppLabelOnHomeScreen &&
               <Typography textTransform="capitalize" variant="h3">
                  {app.label}
               </Typography>
            }
            <Grid container spacing={3}>
               <Grid item xs={12} lg={12}>
                  <Card sx={{overflow: "visible"}}>
                     <Box p={3} display="flex" alignItems="center" gap=".5rem">
                        <Typography variant="h5">Apps</Typography>
                     </Box>
                     <Grid container spacing={3} padding={3} pt={0}>
                        {childApps.map((childApp) => (
                           <Grid key={childApp.name} item xs={12} lg={3}>
                              <Link to={childApp.name}>
                                 <Card>
                                    <Box display="flex" alignItems="center" p={2}>
                                       <Box
                                          color={"#FFFFFF"}
                                          display="flex"
                                          justifyContent="center"
                                          alignItems="center"
                                          width="4rem"
                                          height="4rem"
                                          sx={{borderRadius: "10px", backgroundColor: colors.info.main}}
                                       >
                                          <Icon fontSize="medium" color="inherit">
                                             {childApp.iconName || app.iconName}
                                          </Icon>
                                       </Box>
                                       <Box textAlign="left" ml={2}>
                                          <MDTypography variant="button" fontWeight="bold" color="text">
                                             {childApp.label}
                                          </MDTypography>
                                       </Box>
                                    </Box>
                                 </Card>
                              </Link>
                           </Grid>
                        ))}
                     </Grid>
                  </Card>
               </Grid>
            </Grid>
         </BaseLayout>
      )
   }

   return (
      <BaseLayout>
         {
            showAppLabelOnHomeScreen &&
            <Typography textTransform="capitalize" variant="h3">
               {app.label}
            </Typography>
         }
         <Box>
            {app.widgets && app.widgets.length > 0 && (
               <Box pb={app.sections ? 2.375 : 4} pt={"0.5rem"}>
                  <DashboardWidgets widgetMetaDataList={widgets} />
               </Box>
            )}
            <Grid container spacing={3} mt={"-1rem"}>
               {
                  app.sections ? (
                     <Grid item xs={12} lg={12}>
                        {app.sections.map((section) => (
                           <Box key={section.name} mb={3}>
                              <Card sx={{overflow: "visible"}}>
                                 <Box p={3} display="flex" alignItems="center" gap=".5rem">
                                    {
                                       section.icon &&
                                       (
                                          section.icon.path && <img src={section.icon.path} alt={section.label} />
                                       )
                                    }
                                    <Typography variant="h5">
                                       {section.label}
                                    </Typography>
                                 </Box>
                                 {
                                    section.processes ? (
                                       <Box p={3} pl={3} pt={0} pb={1}>
                                          <MDTypography variant="h6">Actions</MDTypography>
                                       </Box>
                                    ) : null
                                 }
                                 {
                                    section.processes ? (
                                       <Grid container spacing={3} padding={3} paddingTop={0}>
                                          {
                                             section.processes.map((processName) =>
                                             {
                                                let process = app.childMap.get(processName);
                                                return (
                                                   <Grid key={process.name} item xs={12} md={12} lg={tileSizeLg}>
                                                      {hasProcessPermission(processName) ?
                                                         <Link to={process.name}>
                                                            <ProcessLinkCard
                                                               icon={process.iconName || app.iconName}
                                                               title={process.label}
                                                            />
                                                         </Link> :
                                                         <ProcessLinkCard
                                                            icon={process.iconName || app.iconName}
                                                            title={process.label}
                                                            isDisabled={true}
                                                         />
                                                      }
                                                   </Grid>
                                                );
                                             })
                                          }
                                       </Grid>
                                    ) : null
                                 }
                                 {
                                    section.processes && section.reports ? (
                                       <Divider />
                                    ) : null
                                 }
                                 {
                                    section.reports ? (
                                       <Box p={3} pl={3} pt={0} pb={1}>
                                          <MDTypography variant="h6">Reports</MDTypography>
                                       </Box>
                                    ) : null
                                 }
                                 {
                                    section.reports ? (
                                       <Grid container spacing={3} padding={3} paddingTop={0}>
                                          {
                                             section.reports.map((reportName) =>
                                             {
                                                let report = app.childMap.get(reportName);
                                                return (
                                                   <Grid key={report.name} item xs={12} md={12} lg={tileSizeLg}>
                                                      {hasReportPermission(reportName) ?
                                                         <Link to={report.name}>
                                                            <ProcessLinkCard
                                                               icon={report.iconName || app.iconName}
                                                               title={report.label}
                                                               isReport={true}
                                                            />
                                                         </Link> :
                                                         <ProcessLinkCard
                                                            icon={report.iconName || app.iconName}
                                                            title={report.label}
                                                            isReport={true}
                                                            isDisabled={true}
                                                         />
                                                      }
                                                   </Grid>
                                                );
                                             })
                                          }
                                       </Grid>
                                    ) : null
                                 }
                                 {
                                    section.reports && section.tables ? (
                                       <Divider />
                                    ) : null
                                 }
                                 {
                                    section.tables ? (
                                       <Box p={3} pl={3} pb={1} pt={0}>
                                          <MDTypography variant="h6">Data</MDTypography>
                                       </Box>
                                    ) : null
                                 }
                                 {
                                    section.tables ? (
                                       <Grid container spacing={3} padding={3} paddingBottom={0} paddingTop={0}>
                                          {
                                             section.tables.map((tableName) =>
                                             {
                                                let table = app.childMap.get(tableName);
                                                let count = "";
                                                let percentage = "";
                                                if(includeTableCountsOnHomeScreen)
                                                {
                                                   count = !tableCounts.has(table.name) || tableCounts.get(table.name).isLoading ? "..." : (tableCountNumbers.get(table.name));
                                                   percentage = !tableCounts.has(table.name) || tableCounts.get(table.name).isLoading ? "" : (tableCountTexts.get(table.name));
                                                }
                                                return (
                                                   <Grid key={table.name} item xs={12} md={12} lg={tileSizeLg}>
                                                      {hasTablePermission(tableName) ?
                                                         <Link to={table.name}>
                                                            <Box className="big-icon" mb={3}>
                                                               <MiniStatisticsCard
                                                                  title={{fontWeight: "bold", text: table.label}}
                                                                  count={count}
                                                                  percentage={{color: "info", text: percentage}}
                                                                  icon={{color: "info", component: <Icon>{table.iconName || app.iconName}</Icon>}}
                                                               />
                                                            </Box>
                                                         </Link> :
                                                         <Box mb={3} title="You do not have permission to access this table">
                                                            <MiniStatisticsCard
                                                               title={{fontWeight: "bold", text: table.label}}
                                                               count={count}
                                                               percentage={{color: "info", text: percentage}}
                                                               icon={{color: "info", component: <Icon>{table.iconName || app.iconName}</Icon>}}
                                                               isDisabled={true}
                                                            />
                                                         </Box>
                                                      }
                                                   </Grid>
                                                );
                                             })
                                          }
                                       </Grid>
                                    ) : null
                                 }
                              </Card>
                           </Box>
                        ))}
                     </Grid>
                  ) : null
               }

            </Grid>
         </Box>
      </BaseLayout>
   );
}

AppHome.defaultProps = {
   app: null,
};

export default AppHome;
