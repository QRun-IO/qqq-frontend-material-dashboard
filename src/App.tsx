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

import {QException} from "@qrunio/qqq-frontend-core/lib/exceptions/QException";
import {QAppNodeType} from "@qrunio/qqq-frontend-core/lib/model/metaData/QAppNodeType";
import {QAppTreeNode} from "@qrunio/qqq-frontend-core/lib/model/metaData/QAppTreeNode";
import {QAuthenticationMetaData} from "@qrunio/qqq-frontend-core/lib/model/metaData/QAuthenticationMetaData";
import {QBrandingMetaData} from "@qrunio/qqq-frontend-core/lib/model/metaData/QBrandingMetaData";
import {QInstance} from "@qrunio/qqq-frontend-core/lib/model/metaData/QInstance";
import {QProcessMetaData} from "@qrunio/qqq-frontend-core/lib/model/metaData/QProcessMetaData";
import {QTableMetaData} from "@qrunio/qqq-frontend-core/lib/model/metaData/QTableMetaData";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import Icon from "@mui/material/Icon";
import {ThemeProvider} from "@mui/material/styles";
import {LicenseInfo} from "@mui/x-license-pro";
import CommandMenu from "CommandMenu";
import QContext from "QContext";
import useAnonymousAuthenticationModule from "qqq/authorization/anonymous/useAnonymousAuthenticationModule";
import useAuth0AuthenticationModule from "qqq/authorization/auth0/useAuth0AuthenticationModule";
import useOAuth2AuthenticationModule from "qqq/authorization/oauth2/useOAuth2AuthenticationModule";
import Sidenav from "qqq/components/horseshoe/sidenav/SideNav";
import theme from "qqq/components/legacy/Theme";
import {getBannerClassName, getBannerStyles, getBanner, makeBannerContent} from "qqq/components/misc/Banners";
import {setMiniSidenav, useMaterialUIController} from "qqq/context";
import AppHome from "qqq/pages/apps/Home";
import NoApps from "qqq/pages/apps/NoApps";
import ProcessRun from "qqq/pages/processes/ProcessRun";
import ReportRun from "qqq/pages/processes/ReportRun";
import EntityCreate from "qqq/pages/records/create/RecordCreate";
import TableDeveloperView from "qqq/pages/records/developer/TableDeveloperView";
import {resolveAssetUrl} from "qqq/utils/PathUtils";
import EntityEdit from "qqq/pages/records/edit/RecordEdit";
import RecordQuery from "qqq/pages/records/query/RecordQuery";
import RecordDeveloperView from "qqq/pages/records/view/RecordDeveloperView";
import RecordView from "qqq/pages/records/view/RecordView";
import RecordViewByUniqueKey from "qqq/pages/records/view/RecordViewByUniqueKey";
import GoogleAnalyticsUtils, {AnalyticsModel} from "qqq/utils/GoogleAnalyticsUtils";
import Client from "qqq/utils/qqq/Client";
import ProcessUtils from "qqq/utils/qqq/ProcessUtils";
import React, {JSXElementConstructor, Key, ReactElement, useEffect, useState,} from "react";
import {useCookies} from "react-cookie";
import {Navigate, Route, Routes, useLocation, useSearchParams,} from "react-router-dom";
import {Md5} from "ts-md5/dist/md5";


const qController = Client.getInstance();
export const SESSION_UUID_COOKIE_NAME = "sessionUUID";

interface Props
{
   authenticationMetaData: QAuthenticationMetaData;
}

export default function App({authenticationMetaData}: Props)
{
   const [, , removeCookie] = useCookies([SESSION_UUID_COOKIE_NAME]);
   const [loadingToken, setLoadingToken] = useState(false);
   const [isFullyAuthenticated, setIsFullyAuthenticated] = useState(false);
   const [profileRoutes, setProfileRoutes] = useState({});
   const [branding, setBranding] = useState({} as QBrandingMetaData);
   const [metaData, setMetaData] = useState({} as QInstance);
   const [needLicenseKey, setNeedLicenseKey] = useState(true);
   const [loggedInUser, setLoggedInUser] = useState({} as { name?: string, email?: string });
   const [defaultRoute, setDefaultRoute] = useState("/no-apps");
   const [earlyReturnForAuth, setEarlyReturnForAuth] = useState(null as JSX.Element);

   const {setupSession: auth0SetupSession, logout: auth0Logout} = useAuth0AuthenticationModule({setIsFullyAuthenticated, setLoggedInUser, setEarlyReturnForAuth});
   const {setupSession: oauth2SetupSession, logout: oauth2Logout} = useOAuth2AuthenticationModule({setIsFullyAuthenticated, setLoggedInUser, setEarlyReturnForAuth, inOAuthContext: authenticationMetaData.type === "OAUTH2"});
   const {setupSession: anonymousSetupSession, logout: anonymousLogout} = useAnonymousAuthenticationModule({setIsFullyAuthenticated, setLoggedInUser, setEarlyReturnForAuth});

   /////////////////////////////////////////////////////////
   // tell the client how to do a logout if it sees a 401 //
   /////////////////////////////////////////////////////////
   Client.setUnauthorizedCallback(() => doLogout());

   /////////////////////////////////////////////////
   // deal with making sure user is authenticated //
   /////////////////////////////////////////////////
   useEffect(() =>
   {
      if (loadingToken)
      {
         return;
      }
      setLoadingToken(true);

      (async () =>
      {
         if (authenticationMetaData.type === "AUTH_0")
         {
            await auth0SetupSession();
         }
         else if (authenticationMetaData.type === "OAUTH2")
         {
            await oauth2SetupSession();
         }
         else if (authenticationMetaData.type === "FULLY_ANONYMOUS" || authenticationMetaData.type === "MOCK")
         {
            await anonymousSetupSession();
         }
         else
         {
            console.log(`Unrecognized authenticationMetaData.type: ${authenticationMetaData.type}`);
            qController.clearAuthenticationMetaDataLocalStorage();
         }

      })();
   }, [loadingToken]);

   if (needLicenseKey)
   {
      (async () =>
      {
         const metaData: QInstance = await qController.loadMetaData();
         LicenseInfo.setLicenseKey(metaData.environmentValues?.get("MATERIAL_UI_LICENSE_KEY") || process.env.REACT_APP_MATERIAL_UI_LICENSE_KEY);
         setNeedLicenseKey(false);
      })();
   }

   /***************************************************************************
    ** call appropriate logout function based on authentication meta data type
    ***************************************************************************/
   function doLogout()
   {
      if (authenticationMetaData?.type === "AUTH_0")
      {
         auth0Logout();
      }
      else if (authenticationMetaData?.type === "OAUTH2")
      {
         oauth2Logout();
      }
      else if (authenticationMetaData?.type === "FULLY_ANONYMOUS" || authenticationMetaData?.type === "MOCK")
      {
         anonymousLogout();
      }
      else
      {
         console.log(`No logout callback for authentication type [${authenticationMetaData?.type}].`);
      }
   }

   const [controller, dispatch] = useMaterialUIController();
   const {miniSidenav, direction, sidenavColor} = controller;
   const [onMouseEnter, setOnMouseEnter] = useState(false);
   const {pathname} = useLocation();
   const [queryParams] = useSearchParams();

   const [needToLoadRoutes, setNeedToLoadRoutes] = useState(true);
   const [sideNavRoutes, setSideNavRoutes] = useState([]);
   const [appRoutes, setAppRoutes] = useState(null as any);
   const [pathToLabelMap, setPathToLabelMap] = useState({} as { [path: string]: string });

   ////////////////////////////////////////////
   // load qqq meta data to make more routes //
   ////////////////////////////////////////////
   useEffect(() =>
   {
      if (!needToLoadRoutes || !isFullyAuthenticated)
      {
         return;
      }
      setNeedToLoadRoutes(false);

      (async () =>
      {
         function addAppToSideNavList(app: QAppTreeNode, appList: any[], parentPath: string, depth: number)
         {
            const path = `${parentPath}/${app.name}`;
            if (app.type !== QAppNodeType.APP)
            {
               return;
            }

            if (depth > 2)
            {
               console.warn("App depth is greater than 2 - not including app in side nav...");
               return;
            }

            const childList: any[] = [];
            if (app.children)
            {
               app.children.forEach((child: QAppTreeNode) =>
               {
                  addAppToSideNavList(child, childList, path, depth + 1);
               });
            }

            if (childList.length === 0)
            {
               if (depth === 0)
               {
                  /////////////////////////////////////////////////////
                  // at level 0, the entry must always be a collapse //
                  /////////////////////////////////////////////////////
                  appList.push({
                     type: "collapse",
                     name: app.label,
                     key: app.name,
                     route: path,
                     icon: <Icon fontSize="medium">{app.iconName}</Icon>,
                     noCollapse: true,
                     component: <AppHome />,
                  });
               }
               else
               {
                  appList.push({
                     name: app.label,
                     key: app.name,
                     route: path,
                     icon: <Icon fontSize="medium">{app.iconName}</Icon>,
                     component: <AppHome />,
                  });
               }
            }
            else
            {
               appList.push({
                  type: "collapse",
                  name: app.label,
                  key: app.name,
                  dropdown: true,
                  icon: <Icon fontSize="medium">{app.iconName}</Icon>,
                  collapse: childList,
               });
            }
         }

         let foundFirstApp = false;

         function addAppToAppRoutesList(metaData: QInstance, app: QAppTreeNode, routeList: any[], parentPath: string, depth: number)
         {
            const path = `${parentPath}/${app.name}`;
            if (app.type === QAppNodeType.APP)
            {
               if (app.children)
               {
                  app.children.forEach((child: QAppTreeNode) =>
                  {
                     addAppToAppRoutesList(metaData, child, routeList, path, depth + 1);
                  });
               }

               routeList.push({
                  name: `${app.label}`,
                  key: app.name,
                  route: path,
                  component: <AppHome app={metaData.apps.get(app.name)} />,
               });

               if (!foundFirstApp)
               {
                  /////////////////////////////////////////////////////////////////////////////////////////////////////
                  // keep track of what the top-most app the user has access to is.  set that as their default route //
                  /////////////////////////////////////////////////////////////////////////////////////////////////////
                  foundFirstApp = true;
                  setDefaultRoute(path);
                  console.log("Set default route to: " + path);
               }
            }
            else if (app.type === QAppNodeType.TABLE)
            {
               const table = metaData.tables.get(app.name);
               routeList.push({
                  name: `${app.label}`,
                  key: app.name,
                  route: path,
                  component: <RecordQuery table={table} key={table.name} />,
               });

               routeList.push({
                  name: `${app.label}`,
                  key: app.name,
                  route: `${path}/savedView/:id`,
                  component: <RecordQuery table={table} key={table.name} />,
               });

               routeList.push({
                  name: `${app.label} Create`,
                  key: `${app.name}.create`,
                  route: `${path}/create`,
                  component: <EntityCreate table={table} />,
               });

               routeList.push({
                  name: `${app.label}`,
                  key: `${app.name}.dev`,
                  route: `${path}/dev`,
                  component: <TableDeveloperView table={table} />,
               });

               ///////////////////////////////////////////////////////////////////////////////////////////////////////
               // this is the path to open a modal-form when viewing a record, to create a different (child) record //
               // it can also be done with a hash like: #/createChild=:childTableName                               //
               ///////////////////////////////////////////////////////////////////////////////////////////////////////
               routeList.push({
                  key: `${app.name}.createChild`,
                  route: `${path}/:id/createChild/:childTableName`,
                  component: <RecordView table={table} />,
               });

               routeList.push({
                  name: `${app.label} View`,
                  key: `${app.name}.view`,
                  route: `${path}/:id`,
                  component: <RecordView table={table} />,
               });

               routeList.push({
                  name: `${app.label} View`,
                  key: `${app.name}.view`,
                  route: `${path}/key`,
                  component: <RecordViewByUniqueKey table={table} />,
               });

               routeList.push({
                  name: `${app.label}`,
                  key: `${app.name}.edit`,
                  route: `${path}/:id/edit`,
                  component: <EntityEdit table={table} isCopy={false} />,
               });

               routeList.push({
                  name: `${app.label}`,
                  key: `${app.name}.copy`,
                  route: `${path}/:id/copy`,
                  component: <EntityEdit table={table} isCopy={true} />,
               });

               routeList.push({
                  name: `${app.label}`,
                  key: `${app.name}.record.dev`,
                  route: `${path}/:id/dev`,
                  component: <RecordDeveloperView table={table} />,
               });

               const processesForTable = ProcessUtils.getProcessesForTable(metaData, table.name, true);
               processesForTable.forEach((process) =>
               {
                  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                  // paths to open modal process under its owning table.                                                                           //
                  // note, processes can also be launched (at least initially on entityView screen) with a hash like: #/launchProcess=:processName //
                  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                  routeList.push({
                     name: process.label,
                     key: process.name,
                     route: `${path}/${process.name}`,
                     component: <RecordQuery table={table} key={`${table.name}-${process.name}`} launchProcess={process} />,
                  });

                  routeList.push({
                     name: process.label,
                     key: `${app.name}/${process.name}`,
                     route: `${path}/:id/${process.name}`,
                     component: <RecordView table={table} key={`${table.name}-${process.name}`} launchProcess={process} />,
                  });
               });

               const materialDashboardInstanceMetaData = metaData.supplementalInstanceMetaData?.get("materialDashboard");
               if (materialDashboardInstanceMetaData)
               {
                  const processNamesToAddToAllQueryAndViewScreens = materialDashboardInstanceMetaData.processNamesToAddToAllQueryAndViewScreens;
                  if (processNamesToAddToAllQueryAndViewScreens)
                  {
                     for (let processName of processNamesToAddToAllQueryAndViewScreens)
                     {
                        const process = metaData.processes.get(processName);
                        if (process)
                        {
                           routeList.push({
                              name: process.label,
                              key: process.name,
                              route: `${path}/${process.name}`,
                              component: <RecordQuery table={table} key={`${table.name}-${process.name}`} launchProcess={process} />,
                           });

                           routeList.push({
                              name: process.label,
                              key: `${app.name}/${process.name}`,
                              route: `${path}/:id/${process.name}`,
                              component: <RecordView table={table} launchProcess={process} />,
                           });
                        }
                     }
                  }
               }
               else
               {
                  ////////////////
                  // deprecated //
                  ////////////////
                  const runRecordScriptProcess = metaData.processes.get("runRecordScript");
                  if (runRecordScriptProcess)
                  {
                     const process = runRecordScriptProcess;
                     routeList.push({
                        name: process.label,
                        key: process.name,
                        route: `${path}/${process.name}`,
                        component: <RecordQuery table={table} key={`${table.name}-${process.name}`} launchProcess={process} />,
                     });

                     routeList.push({
                        name: process.label,
                        key: `${app.name}/${process.name}`,
                        route: `${path}/:id/${process.name}`,
                        component: <RecordView table={table} launchProcess={process} />,
                     });
                  }
               }

               const reportsForTable = ProcessUtils.getReportsForTable(metaData, table.name, true);
               reportsForTable.forEach((report) =>
               {
                  // todo - do we need some table/report routes here, that would go to RecordQuery and/or RecordView
                  routeList.push({
                     name: report.label,
                     key: report.name,
                     route: `${path}/${report.name}`,
                     component: <ReportRun report={report} />,
                  });
               });
            }
            else if (app.type === QAppNodeType.PROCESS)
            {
               const process = metaData.processes.get(app.name);
               routeList.push({
                  name: `${app.label}`,
                  key: app.name,
                  route: path,
                  component: <ProcessRun process={process} />,
               });
            }
            else if (app.type === QAppNodeType.REPORT)
            {
               const report = metaData.reports.get(app.name);
               routeList.push({
                  name: `${app.label}`,
                  key: app.name,
                  route: path,
                  component: <ReportRun report={report} />,
               });
            }
         }

         try
         {
            const metaData = await Client.getInstance().loadMetaData();
            setMetaData(metaData);
            if (metaData.branding)
            {
               setBranding(metaData.branding);
               const favicon = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
               const appleIcon = document.querySelector("link[rel~='apple-touch-icon']") as HTMLLinkElement;
               if (favicon)
               {
                  favicon.href = resolveAssetUrl(metaData.branding.icon);
               }
               if (appleIcon)
               {
                  appleIcon.href = resolveAssetUrl(metaData.branding.icon);
               }
               if (metaData.branding.accentColor)
               {
                  setAccentColor(metaData.branding.accentColor);
               }
            }

            const gravatarBase = "https://www.gravatar.com/avatar/";
            const hash = Md5.hashStr(loggedInUser?.email || "user");
            const profilePicture = `${gravatarBase}${hash}`;
            const profileRoutes = {
               type: "collapse",
               name: loggedInUser?.name ?? "Anonymous",
               key: "username",
               noCollapse: true,
               icon: <Avatar src={profilePicture} alt="{loggedInUser?.name}" />,
            };
            setProfileRoutes(profileRoutes);

            const sideNavAppList = [] as any[];
            const appRoutesList = [] as any[];

            //////////////////////////////////////////////////////////////////////////////////
            // iterate through the list to find the 'main dashboard so we can put it first' //
            //////////////////////////////////////////////////////////////////////////////////
            if (metaData.appTree && metaData.appTree.length)
            {
               for (let i = 0; i < metaData.appTree.length; i++)
               {
                  const app = metaData.appTree[i];
                  addAppToSideNavList(app, sideNavAppList, "", 0);
                  addAppToAppRoutesList(metaData, app, appRoutesList, "", 0);
               }
            }
            else
            {
               ///////////////////////////////////////////////////////////////////
               // if the user doesn't have access to any apps, push this route. //
               ///////////////////////////////////////////////////////////////////
               appRoutesList.push({
                  name: "No Apps",
                  key: "no-apps",
                  route: "/no-apps",
                  component: <NoApps />,
               });
            }

            const pathToLabelMap: { [path: string]: string } = {};
            for (let i = 0; i < appRoutesList.length; i++)
            {
               const route = appRoutesList[i];
               pathToLabelMap[route.route] = route.name;
            }
            setPathToLabelMap(pathToLabelMap);

            const newSideNavRoutes = [];
            // @ts-ignore
            newSideNavRoutes.unshift(profileRoutes);
            newSideNavRoutes.push({type: "divider", key: "divider-1"});
            for (let i = 0; i < sideNavAppList.length; i++)
            {
               newSideNavRoutes.push(sideNavAppList[i]);
            }

            setSideNavRoutes(newSideNavRoutes);
            setAppRoutes(appRoutesList);
         }
         catch (e)
         {
            console.error(e);
            if (e instanceof QException)
            {
               if ((e as QException).status === 401)
               {
                  console.log("Exception is a QException with status = 401.  Clearing some of localStorage & cookies");
                  qController.clearAuthenticationMetaDataLocalStorage();
                  localStorage.removeItem("accessToken");
                  removeCookie(SESSION_UUID_COOKIE_NAME, {path: "/"});

                  doLogout();
                  return;
               }
            }
         }
      })();
   }, [needToLoadRoutes, isFullyAuthenticated]);

   ///////////////////////////////////////////////////
   // Open sidenav when mouse enter on mini sidenav //
   ///////////////////////////////////////////////////
   const handleOnMouseEnter = () =>
   {
      if (miniSidenav && !onMouseEnter)
      {
         setMiniSidenav(dispatch, false);
         setOnMouseEnter(true);
      }
   };

   /////////////////////////////////////////////////
   // Close sidenav when mouse leave mini sidenav //
   /////////////////////////////////////////////////
   const handleOnMouseLeave = () =>
   {
      if (onMouseEnter)
      {
         setMiniSidenav(dispatch, true);
         setOnMouseEnter(false);
      }
   };

   useEffect(() =>
   {
      document.body.setAttribute("dir", direction);
   }, [direction]);

   //////////////////////////////////////////////////////
   // Setting page scroll to 0 when changing the route //
   //////////////////////////////////////////////////////
   useEffect(() =>
   {
      document.documentElement.scrollTop = 0;
      document.scrollingElement.scrollTop = 0;
   }, [pathname]);

   ///////////////////////////////////////////////////////////////////////////////////////////
   // convert an object that works for the Sidenav into one that works for the react-router //
   ///////////////////////////////////////////////////////////////////////////////////////////
   const getRoutes = (allRoutes: any[]): any => allRoutes.map(
      (route: {
         collapse: any;
         route: string;
         component: ReactElement<any, string | JSXElementConstructor<any>>;
         key: Key;
      }) =>
      {
         if (route.collapse)
         {
            return getRoutes(route.collapse);
         }

         if (route.route)
         {
            return <Route path={route.route} element={route.component} key={route.key} />;
         }

         return null;
      },
   );

   const [pageHeader, setPageHeader] = useState("" as string | JSX.Element);
   const [accentColor, setAccentColor] = useState("#0062FF");
   const [accentColorLight, setAccentColorLight] = useState("#C0D6F7");
   const [tableMetaData, setTableMetaData] = useState(null);
   const [tableProcesses, setTableProcesses] = useState(null);
   const [dotMenuOpen, setDotMenuOpen] = useState(false);
   const [modalStack, setModalStack] = useState([] as string[]);
   const [keyboardHelpOpen, setKeyboardHelpOpen] = useState(false);
   const [helpHelpActive] = useState(queryParams.has("helpHelp"));
   const [userId, setUserId] = useState(loggedInUser?.email);

   useEffect(() =>
   {
      setUserId(loggedInUser?.email);
   }, [loggedInUser]);


   const [googleAnalyticsUtils] = useState(new GoogleAnalyticsUtils());

   /*******************************************************************************
    **
    *******************************************************************************/
   function recordAnalytics(model: AnalyticsModel)
   {
      googleAnalyticsUtils.recordAnalytics(model);
   }

   ///////////////////////////////////////////////////////////////////
   // if any of the auth/session setup code determined that we need //
   // to render something and return early - then do so here.       //
   ///////////////////////////////////////////////////////////////////
   if (earlyReturnForAuth)
   {
      return (earlyReturnForAuth);
   }


   /***************************************************************************
    **
    ***************************************************************************/
   function banner(): JSX.Element | null
   {
      const banner = getBanner(metaData?.branding, "QFMD_TOP_OF_SITE");

      if (!banner)
      {
         return (null);
      }

      return (<Box className={getBannerClassName(banner)} sx={{display: "flex", justifyContent: "center", padding: "0.5rem", position: "sticky", top: "0", zIndex: 1, ...getBannerStyles(banner)}}>
         {makeBannerContent(banner)}
      </Box>);
   }


   /***************************************************************************
    *
    ***************************************************************************/
   function pushModalOnStack(modalIdentifier: string): void
   {
      if(modalStack.length > 0 && modalStack[modalStack.length] == modalIdentifier)
      {
         console.warn(`Pushing a new modal on the QContext modalStack that is a duplicate of the current top-of-stack [${modalIdentifier}]`)
      }
      modalStack.push(modalIdentifier);
      setModalStack([...modalStack]);
   }


   /***************************************************************************
    *
    ***************************************************************************/
   function popModalOffStack(modalIdentifier: string): void
   {
      if(modalStack.length > 0 && modalStack[modalStack.length - 1] != modalIdentifier)
      {
         console.warn(`Request to pop a modal [${modalIdentifier}] off the QContext modalStack that is not currently on top [${modalStack[modalStack.length - 1]}]`)
         return;
      }
      modalStack.pop();
      setModalStack([...modalStack]);
   }


   /***************************************************************************
    *
    ***************************************************************************/
   function clearModalStack(): void
   {
      setModalStack([]);
   }


   return (

      appRoutes && (
         <QContext.Provider value={{
            pageHeader: pageHeader,
            accentColor: accentColor,
            accentColorLight: accentColorLight,
            tableMetaData: tableMetaData,
            tableProcesses: tableProcesses,
            dotMenuOpen: dotMenuOpen,
            modalStack: modalStack,
            keyboardHelpOpen: keyboardHelpOpen,
            helpHelpActive: helpHelpActive,
            userId: userId,
            setPageHeader: (header: string | JSX.Element) => setPageHeader(header),
            setAccentColor: (accentColor: string) => setAccentColor(accentColor),
            setAccentColorLight: (accentColorLight: string) => setAccentColorLight(accentColorLight),
            setTableMetaData: (tableMetaData: QTableMetaData) => setTableMetaData(tableMetaData),
            setTableProcesses: (tableProcesses: QProcessMetaData[]) => setTableProcesses(tableProcesses),
            setDotMenuOpen: (dotMenuOpent: boolean) => setDotMenuOpen(dotMenuOpent),
            setKeyboardHelpOpen: (keyboardHelpOpen: boolean) => setKeyboardHelpOpen(keyboardHelpOpen),
            pushModalOnStack: pushModalOnStack,
            popModalOffStack: popModalOffStack,
            clearModalStack: clearModalStack,
            recordAnalytics: recordAnalytics,
            pathToLabelMap: pathToLabelMap,
            branding: branding
         }}>
            <ThemeProvider theme={theme}>
               <CssBaseline />
               <CommandMenu metaData={metaData} />
               {banner()}
               <Sidenav
                  color={sidenavColor}
                  icon={resolveAssetUrl(branding.icon)}
                  logo={resolveAssetUrl(branding.logo)}
                  appName={branding.appName}
                  branding={branding}
                  routes={sideNavRoutes}
                  onMouseEnter={handleOnMouseEnter}
                  onMouseLeave={handleOnMouseLeave}
                  logout={doLogout}
               />
               <Routes>
                  <Route path="*" element={<Navigate to={defaultRoute} />} />
                  {appRoutes && getRoutes(appRoutes)}
                  {profileRoutes && getRoutes([profileRoutes])}
               </Routes>
            </ThemeProvider>
         </QContext.Provider>
      )
   );
}
