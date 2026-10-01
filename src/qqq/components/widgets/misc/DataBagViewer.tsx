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

import {QException} from "@qrunio/qqq-frontend-core/lib/exceptions/QException";
import {QRecord} from "@qrunio/qqq-frontend-core/lib/model/QRecord";
import {QCriteriaOperator} from "@qrunio/qqq-frontend-core/lib/model/query/QCriteriaOperator";
import {QFilterCriteria} from "@qrunio/qqq-frontend-core/lib/model/query/QFilterCriteria";
import {QFilterOrderBy} from "@qrunio/qqq-frontend-core/lib/model/query/QFilterOrderBy";
import {QQueryFilter} from "@qrunio/qqq-frontend-core/lib/model/query/QQueryFilter";
import {Chip} from "@mui/material";
import Alert from "@mui/material/Alert";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import ListItemText from "@mui/material/ListItemText";
import Modal from "@mui/material/Modal";
import Snackbar from "@mui/material/Snackbar";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import Typography from "@mui/material/Typography";
import DataBagDataEditor, {DataBagDataEditorProps} from "qqq/components/databags/DataBagDataEditor";
import DataBagPreview from "qqq/components/databags/DataBagPreview";
import TabPanel from "qqq/components/misc/TabPanel";
import CustomWidthTooltip from "qqq/components/tooltips/CustomWidthTooltip";
import {LoadingState} from "qqq/models/LoadingState";
import DeveloperModeUtils from "qqq/utils/DeveloperModeUtils";
import Client from "qqq/utils/qqq/Client";
import ValueUtils from "qqq/utils/qqq/ValueUtils";

import "ace-builds/src-noconflict/ace";
import "ace-builds/src-noconflict/mode-java";
import "ace-builds/src-noconflict/mode-javascript";
import "ace-builds/src-noconflict/mode-json";
import "ace-builds/src-noconflict/theme-github";
import React, {useReducer, useState} from "react";
import AceEditor from "react-ace";
import "ace-builds/src-noconflict/ext-language_tools";

const qController = Client.getInstance();

// Declaring props types for ViewForm
interface Props
{
   dataBagId: number;
}

DataBagViewer.defaultProps =
   {};

export default function DataBagViewer({dataBagId}: Props): JSX.Element
{
   const [dataBagRecord, setDataBagRecord] = useState(null as QRecord);
   const [asyncLoadInited, setAsyncLoadInited] = useState(false);
   const [versionRecordList, setVersionRecordList] = useState(null as QRecord[]);
   const [selectedVersionRecord, setSelectedVersionRecord] = useState(null as QRecord);
   const [currentVersionId, setCurrentVersionId] = useState(null as number);
   const [notFoundMessage, setNotFoundMessage] = useState(null);
   const [selectedTab, setSelectedTab] = useState(0);
   const [editorProps, setEditorProps] = useState(null as DataBagDataEditorProps);
   const [successText, setSuccessText] = useState(null as string);
   const [failText, setFailText] = useState(null as string);
   const [, forceUpdate] = useReducer((x) => x + 1, 0);

   const [loadingSelectedVersion, _] = useState(new LoadingState(forceUpdate, "loading"));

   if (!asyncLoadInited)
   {
      setAsyncLoadInited(true);

      (async () =>
      {
         try
         {
            const dataBagRecord = await qController.get("dataBag", dataBagId);
            setDataBagRecord(dataBagRecord);

            const criteria = [new QFilterCriteria("dataBagId", QCriteriaOperator.EQUALS, [dataBagId])];
            const orderBys = [new QFilterOrderBy("sequenceNo", false)];
            const filter = new QQueryFilter(criteria, orderBys, null, "AND", 0, 25);
            const versions = await qController.query("dataBagVersion", filter);
            console.log("Fetched versions:");
            console.log(versions);
            setVersionRecordList(versions);

            if (versions && versions.length > 0)
            {
               setCurrentVersionId(versions[0].values.get("id"));
               const latestVersion = await qController.get("dataBagVersion", versions[0].values.get("id"));
               console.log("Fetched latestVersion:");
               console.log(latestVersion);
               setSelectedVersionRecord(latestVersion);
               loadingSelectedVersion.setNotLoading();
               forceUpdate();
            }
         }
         catch (e)
         {
            if (e instanceof QException)
            {
               if ((e as QException).status === 404)
               {
                  setNotFoundMessage("Data bag data could not be found.");
                  return;
               }
            }
            setNotFoundMessage("Error loading data bag data: " + e);
         }
      })();
   }

   const editData = (data: string) =>
   {
      const editorProps = {} as DataBagDataEditorProps;
      editorProps.title = (data ? "Editing Contents of Data Bag: " : "Initializing Contents of Data Bag: ") + dataBagRecord?.values?.get("name");
      editorProps.data = data;
      editorProps.dataBagId = dataBagId;
      setEditorProps(editorProps);
   };

   const closeEditingScript = (event: object, reason: string, alert: string = null) =>
   {
      if (reason === "backdropClick" || reason === "escapeKeyDown")
      {
         return;
      }

      if (reason === "saved")
      {
         setAsyncLoadInited(false);
         forceUpdate();

         if (alert)
         {
            setSuccessText(alert);
         }
      }
      else if (reason === "failed")
      {
         setAsyncLoadInited(false);
         forceUpdate();

         if (alert)
         {
            setFailText(alert);
         }
      }

      setEditorProps(null);
   };

   const changeTab = (newValue: number) =>
   {
      setSelectedTab(newValue);
      forceUpdate();
   };

   const selectVersion = (version: QRecord) =>
   {
      (async () =>
      {
         // fetch the full version
         setSelectedVersionRecord(version);
         loadingSelectedVersion.setLoading();

         const selectedVersion = await qController.get("dataBagVersion", version.values.get("id"));
         console.log("Fetched selectedVersion:");
         console.log(selectedVersion);
         setSelectedVersionRecord(selectedVersion);
         loadingSelectedVersion.setNotLoading();
         forceUpdate();
      })();
   };

   function getVersionsList(versionRecordList: QRecord[], selectedVersionRecord: QRecord)
   {
      return <List sx={{pl: 3, height: "400px", overflow: "auto"}}>
         {
            (versionRecordList == null || versionRecordList.length == 0) ?
               <Typography variant="body2">
                  There are not any versions of this data bag.
               </Typography>
               : <></>
         }
         {
            versionRecordList?.map((version: any) => (
               <React.Fragment key={version.values.get("id")}>
                  <ListItem sx={{p: 1}} alignItems="flex-start" selected={selectedVersionRecord?.values?.get("id") == version.values.get("id")} onClick={(event) => selectVersion(version)}>
                     <ListItemAvatar>
                        <Avatar sx={{bgcolor: DeveloperModeUtils.revToColor("", dataBagId, version.values.get("sequenceNo"))}}>{`${version.values.get("sequenceNo")}`}</Avatar>
                     </ListItemAvatar>
                     <ListItemText
                        primaryTypographyProps={{fontSize: "1rem"}}
                        secondaryTypographyProps={{fontSize: ".85rem"}}
                        primary={
                           <div style={{overflow: "hidden", textOverflow: "ellipsis", maxHeight: "5rem"}} title={version.values.get("commitMessage")}>
                              {currentVersionId == version?.values?.get("id") && <Chip label="CURRENT" color="success" variant="outlined" size="small" sx={{mr: 1, fontSize: "0.75rem"}} />}
                              {version.values.get("commitMessage")}
                           </div>
                        }
                        secondary={
                           <>
                              {ValueUtils.formatDateTime(version.values.get("createDate"))}
                              <br />
                              {version.values.get("author")}
                           </>
                        }
                     />
                  </ListItem>
                  <Divider sx={{my: 0.5}} variant="inset" component="li" />
               </React.Fragment>
            ))
         }
      </List>;
   }

   let editButtonTooltip = "";
   let editButtonText = "Create New Version";
   if (currentVersionId)
   {
      if (currentVersionId === selectedVersionRecord?.values?.get("id"))
      {
         editButtonTooltip = "If you make any changes to this data bag, a new version will be created when you hit Save.";
         editButtonText = "Edit";
      }
      else
      {
         editButtonTooltip = "If you want to make this previous Version active, bring up the Edit window, make any changes " +
            "to the old Version if they are needed, then click Save. A new Version will be created, and set as Current.";
         editButtonText = "Edit and Activate";
      }
   }

   return (
      <Grid container>
         <Grid item xs={12}>
            <Box>
               {
                  notFoundMessage
                     ?
                     <Box>{notFoundMessage}</Box>
                     :
                     <Box>
                        {
                           successText ? (
                              <Snackbar open={successText !== null && successText !== ""} autoHideDuration={6000} onClose={() => setSuccessText(null)} anchorOrigin={{vertical: "top", horizontal: "center"}}>
                                 <Alert color="success" onClose={() => setSuccessText(null)}>
                                    {successText}
                                 </Alert>
                              </Snackbar>
                           ) : ("")
                        }
                        {
                           failText ? (
                              <Snackbar open={failText !== null && failText !== ""} autoHideDuration={6000} onClose={() => setFailText(null)} anchorOrigin={{vertical: "top", horizontal: "center"}}>
                                 <Alert color="error" onClose={() => setFailText(null)}>
                                    {failText}
                                 </Alert>
                              </Snackbar>
                           ) : ("")
                        }

                        <Grid container spacing={3}>
                           <Grid item xs={12}>
                              <>
                                 <Tabs
                                    sx={{m: 0, mb: 1, mt: -3}}
                                    value={selectedTab}
                                    onChange={(event, newValue) => changeTab(newValue)}
                                    variant="standard"
                                 >
                                    <Tab label="Raw Data" id="simple-tab-0" aria-controls="simple-tabpanel-0" />
                                    <Tab label="Data Preview" id="simple-tab-1" aria-controls="simple-tabpanel-1" />
                                 </Tabs>

                                 <TabPanel index={0} value={selectedTab}>
                                    <Grid container>
                                       <Grid item xs={4}>
                                          <Box display="flex" alignItems="center" gap={2} pb={1} height="40px">
                                             <Typography variant="h6" pl={3}>Versions</Typography>
                                          </Box>
                                          {getVersionsList(versionRecordList, selectedVersionRecord)}
                                       </Grid>

                                       <Grid item xs={8}>
                                          <Box display="flex" alignItems="center" justifyContent="space-between" gap={2} pb={1} height="40px">
                                             {
                                                selectedVersionRecord ?
                                                   <Typography variant="h6">
                                                      Version {selectedVersionRecord.values.get("sequenceNo")}
                                                      {
                                                         currentVersionId === selectedVersionRecord.values.get("id")
                                                            ? (<> (Current)</>)
                                                            : <></>
                                                      }
                                                   </Typography>
                                                   : <></>
                                             }
                                             <CustomWidthTooltip title={editButtonTooltip}>
                                                <Button sx={{py: 0}} onClick={() => editData(selectedVersionRecord?.values?.get("data"))}>
                                                   {editButtonText}
                                                </Button>
                                             </CustomWidthTooltip>
                                          </Box>
                                          {
                                             loadingSelectedVersion.isNotLoading() && selectedVersionRecord && selectedVersionRecord.values.get("data") ? (
                                                <>
                                                   <AceEditor
                                                      mode="json"
                                                      theme="github"
                                                      name={"viewData"}
                                                      readOnly
                                                      highlightActiveLine={false}
                                                      setOptions={{useWorker: false}}
                                                      editorProps={{$blockScrolling: true}}
                                                      width="100%"
                                                      height="400px"
                                                      value={selectedVersionRecord?.values?.get("data")}
                                                   />
                                                </>
                                             ) : null
                                          }
                                          {
                                             loadingSelectedVersion.isLoadingSlow() && <Box fontSize="14px" pl={3}>Loading...</Box>
                                          }
                                       </Grid>
                                    </Grid>
                                 </TabPanel>
                                 <TabPanel index={1} value={selectedTab}>
                                    <Grid container height="440px">
                                       <Grid item xs={4}>
                                          <Box display="flex" alignItems="center" gap={2} pb={1} height="40px">
                                             <Typography variant="h6" pl={3}>Versions</Typography>
                                          </Box>
                                          {getVersionsList(versionRecordList, selectedVersionRecord)}
                                       </Grid>
                                       <Grid item xs={8}>
                                          <Box display="flex" alignItems="center" gap={2} pb={1} height="40px">
                                             <Typography variant="h6" pl={3}>Data Preview (Version {selectedVersionRecord?.values?.get("sequenceNo")})</Typography>
                                          </Box>
                                          <Box height="400px" overflow="auto" ml={1} fontSize="14px">
                                             {loadingSelectedVersion.isNotLoading() && selectedTab == 1 && selectedVersionRecord?.values?.get("data") && <DataBagPreview json={selectedVersionRecord?.values?.get("data")} />}
                                             {loadingSelectedVersion.isLoadingSlow() && <Box pl={3}>Loading...</Box>}
                                          </Box>
                                       </Grid>
                                    </Grid>
                                 </TabPanel>
                              </>
                           </Grid>
                        </Grid>

                        {
                           editorProps &&
                           <Modal open={editorProps !== null} onClose={(event, reason) => closeEditingScript(event, reason)}>
                              <DataBagDataEditor
                                 closeCallback={closeEditingScript}
                                 {...editorProps}
                              />
                           </Modal>
                        }

                     </Box>
               }
            </Box>
         </Grid>
      </Grid>
   );
}
