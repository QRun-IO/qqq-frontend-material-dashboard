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

import {QController} from "@qrunio/qqq-frontend-core/lib/controllers/QController";
import {QJobError} from "@qrunio/qqq-frontend-core/lib/model/processes/QJobError";
import {QPossibleValue} from "@qrunio/qqq-frontend-core/lib/model/QPossibleValue";
import {QRecord} from "@qrunio/qqq-frontend-core/lib/model/QRecord";
import {IconButton, SelectChangeEvent, ToggleButton, ToggleButtonGroup, Typography} from "@mui/material";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import FormControl from "@mui/material/FormControl/FormControl";
import Grid from "@mui/material/Grid";
import Icon from "@mui/material/Icon";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select/Select";
import Snackbar from "@mui/material/Snackbar";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import FormData from "form-data";
import {QCancelButton, QSaveButton} from "qqq/components/buttons/DefaultButtons";
import DynamicSelect from "qqq/components/forms/DynamicSelect";
import ScriptDocsForm from "qqq/components/scripts/ScriptDocsForm";
import ScriptTestForm from "qqq/components/scripts/ScriptTestForm";
import Client from "qqq/utils/qqq/Client";

import "ace-builds/src-noconflict/ace";
import "ace-builds/src-noconflict/mode-javascript";
import "ace-builds/src-noconflict/theme-github";
import React, {useEffect, useReducer, useRef, useState} from "react";
import AceEditor from "react-ace";
import "ace-builds/src-noconflict/ext-language_tools";

export interface ScriptEditorProps
{
   title: string;
   scriptId: number;
   scriptRevisionRecord: QRecord;
   closeCallback: any;
   tableName: string;
   fieldName: string;
   recordId: any;
   scriptTypeRecord: QRecord;
   scriptTypeFileSchemaList: QRecord[];
}

const qController = Client.getInstance();

function buildInitialFileContentsMap(scriptRevisionRecord: QRecord, scriptTypeFileSchemaList: QRecord[]): { [name: string]: string }
{
   const rs: { [name: string]: string } = {};

   if (!scriptTypeFileSchemaList)
   {
      console.log("Missing scriptTypeFileSchemaList");
   }
   else
   {
      let files = scriptRevisionRecord?.associatedRecords?.get("files");

      for (let i = 0; i < scriptTypeFileSchemaList.length; i++)
      {
         let scriptTypeFileSchema = scriptTypeFileSchemaList[i];
         let name = scriptTypeFileSchema.values.get("name");
         let contents = "";

         for (let j = 0; j < files?.length; j++)
         {
            let file = files[j];
            if (file.values.get("fileName") == name)
            {
               contents = file.values.get("contents");
            }
         }

         rs[name] = contents;
      }
   }

   return (rs);
}

function buildFileTypeMap(scriptTypeFileSchemaList: QRecord[]): { [name: string]: string }
{
   const rs: { [name: string]: string } = {};

   if (!scriptTypeFileSchemaList)
   {
      console.log("Missing scriptTypeFileSchemaList");
   }
   else
   {
      for (let i = 0; i < scriptTypeFileSchemaList.length; i++)
      {
         let name = scriptTypeFileSchemaList[i].values.get("name");
         rs[name] = scriptTypeFileSchemaList[i].values.get("fileType");
      }
   }

   return (rs);
}

function ScriptEditor({title, scriptId, scriptRevisionRecord, closeCallback, tableName, fieldName, recordId, scriptTypeRecord, scriptTypeFileSchemaList}: ScriptEditorProps): JSX.Element
{
   const [closing, setClosing] = useState(false);

   const [apiName, setApiName] = useState(scriptRevisionRecord ? scriptRevisionRecord.values.get("apiName") : null);
   const [apiNameLabel, setApiNameLabel] = useState(scriptRevisionRecord ? scriptRevisionRecord.displayValues.get("apiName") : null);
   const [apiVersion, setApiVersion] = useState(scriptRevisionRecord ? scriptRevisionRecord.values.get("apiVersion") : null);
   const [apiVersionLabel, setApiVersionLabel] = useState(scriptRevisionRecord ? scriptRevisionRecord.displayValues.get("apiVersion") : null);

   const fileNamesFromSchema = scriptTypeFileSchemaList.map((schemaRecord) => schemaRecord.values.get("name"));
   const [availableFileNames, setAvailableFileNames] = useState(fileNamesFromSchema);
   const [openEditorFileNames, setOpenEditorFileNames] = useState([fileNamesFromSchema[0]]);
   const [fileContents, setFileContents] = useState(buildInitialFileContentsMap(scriptRevisionRecord, scriptTypeFileSchemaList));
   const [fileTypes, setFileTypes] = useState(buildFileTypeMap(scriptTypeFileSchemaList));
   console.log(`file types: ${JSON.stringify(fileTypes)}`);

   const [commitMessage, setCommitMessage] = useState("");
   const [openTool, setOpenTool] = useState(null);
   const [errorAlert, setErrorAlert] = useState("");
   const [promptForCommitMessageOpen, setPromptForCommitMessageOpen] = useState(false);
   const [, forceUpdate] = useReducer((x) => x + 1, 0);
   const ref = useRef();

   useEffect(() =>
   {
      // @ts-ignore
      // eslint-disable-next-line import/namespace
      const langTools = ace.require("ace/ext/language_tools");
      const myCompleter =
         {
            // @ts-ignore
            getCompletions: function (editor, session, pos, prefix, callback)
            {
               // @ts-ignore
               let completions = [];

               // todo - get from backend, based on the script type
               completions.push({value: "api.get(", meta: "Get a records in a table."});
               completions.push({value: "api.query(", meta: "Search for records in a table."});
               completions.push({value: "api.insert(", meta: "Create one record in a table."});
               completions.push({value: "api.update(", meta: "Update one record in a table."});
               completions.push({value: "api.delete(", meta: "Remove one record from a table."});
               completions.push({value: "api.bulkInsert(", meta: "Create multiple records in a table."});
               completions.push({value: "api.bulkUpdate(", meta: "Update multiple records in a table."});
               completions.push({value: "api.bulkDelete(", meta: "Remove multiple records from a table."});
               completions.push({value: "api.runProcess(", meta: "Run a process"});
               // completions.push({value: "api.newRecord(", meta: "Create a new QRecord object."});
               // completions.push({value: "api.newQueryInput(", meta: "Create a new QueryInput object."});
               // completions.push({value: "api.newQueryFilter(", meta: "Create a new QueryFilter object."});
               // completions.push({value: "api.newFilterCriteria(", meta: "Create a new FilterCriteria object."});
               // completions.push({value: "api.newFilterOrderBy(", meta: "Create a new FilterOrderBy object."});
               // completions.push({value: "getValue(", meta: "Get a value from a record"});
               completions.push({value: "logger.log(", meta: "Write a Script Log Line"});

               // @ts-ignore
               callback(null, completions);
            }
         };
      langTools.addCompleter(myCompleter);

      const preventUnload = (event: BeforeUnloadEvent) =>
      {
         ///////////////////////////////////////////////////////////////////////
         // NOTE: This message isn't used in modern browsers, but is required //
         ///////////////////////////////////////////////////////////////////////
         const message = "Are you sure you want to leave?";
         event.preventDefault();
         event.returnValue = message;
      };

      window.addEventListener("beforeunload", preventUnload);
      return () =>
      {
         window.removeEventListener("beforeunload", preventUnload);
      };

   }, []);

   /*
   ////////////////////////////////////////////////////////////////////////////////////////////////
   // nice idea here, but we can't figure out how to call the function in the child component :( //
   ////////////////////////////////////////////////////////////////////////////////////////////////
   const handleCommandT = () =>
   {
      console.log("Command-T pressed!");
      if(openTool != "test")
      {
         console.log("Setting open tool to 'test'")
         setOpenTool("test");
         return;
      }

      if(runTestCallback)
      {
         console.log("Trying to call triggerTestScript...")
         runTestCallback();
      }
      // @ts-ignore
      // ref.current?.triggerTestScript();
   };

   useEffect(() =>
   {
      const editor = getAceInstance().edit("editor");
      editor.commands.removeCommand("customCommandT");
      editor.commands.addCommand({
         name: "customCommandT",
         bindKey: {win: "Ctrl-T", mac: "Command-T"},
         exec: handleCommandT,
      });
   }, [openTool]);
   */

   const changeOpenTool = (event: React.MouseEvent<HTMLElement>, newValue: string | null) =>
   {
      setOpenTool(newValue);

      // need this to make Ace recognize new height.
      setTimeout(() =>
      {
         window.dispatchEvent(new Event("resize"));
      }, 100);
   };

   const saveClicked = (overrideCommitMessage?: string) =>
   {
      if (!apiName || !apiVersion)
      {
         setErrorAlert("You must select a value for both API Name and API Version.");
         return;
      }

      if (!commitMessage && !overrideCommitMessage)
      {
         setPromptForCommitMessageOpen(true);
         return;
      }

      setClosing(true);

      (async () =>
      {
         const formData = new FormData();
         formData.append("scriptId", scriptId);
         formData.append("commitMessage", overrideCommitMessage ?? commitMessage);

         if (apiName)
         {
            formData.append("apiName", apiName);
         }

         if (apiVersion)
         {
            formData.append("apiVersion", apiVersion);
         }


         const fileNamesFromSchema = scriptTypeFileSchemaList.map((schemaRecord) => schemaRecord.values.get("name"));
         formData.append("fileNames", fileNamesFromSchema.join(","));

         for (let fileName in fileContents)
         {
            formData.append("fileContents:" + fileName, fileContents[fileName]);
         }

         //////////////////////////////////////////////////////////////////
         // we don't want this job to go async, so, pass a large timeout //
         //////////////////////////////////////////////////////////////////
         formData.append(QController.STEP_TIMEOUT_MILLIS_PARAM_NAME, 60 * 1000);

         try
         {
            const processResult = await qController.processInit("storeScriptRevision", formData, qController.defaultMultipartFormDataHeaders());
            console.log("process result");
            console.log(processResult);

            if (processResult instanceof QJobError)
            {
               const jobError = processResult as QJobError;
               setErrorAlert(jobError.userFacingError ?? jobError.error);
               setClosing(false);
               return;
            }

            closeCallback(null, "saved", "Saved New Script Version");
         }
         catch (e)
         {
            // @ts-ignore
            setErrorAlert(e.message ?? "Unexpected error saving script");
            setClosing(false);
         }
      })();
   };

   const cancelClicked = () =>
   {
      setClosing(true);
      closeCallback(null, "cancelled");
   };

   const updateCode = (value: string, event: any, index: number) =>
   {
      fileContents[openEditorFileNames[index]] = value;
      forceUpdate();
   };

   const updateCommitMessage = (event: React.ChangeEvent<HTMLInputElement>) =>
   {
      setCommitMessage(event.target.value);
   };

   const closePromptForCommitMessage = (wasSaveClicked: boolean, message?: string) =>
   {
      setPromptForCommitMessageOpen(false);

      if (wasSaveClicked)
      {
         setCommitMessage(message);
         saveClicked(message);
      }
      else
      {
         setClosing(false);
      }
   };

   const changeApiName = (apiNamePossibleValue?: QPossibleValue) =>
   {
      if (apiNamePossibleValue)
      {
         setApiName(apiNamePossibleValue.id);
      }
      else
      {
         setApiName(null);
      }
   };

   const changeApiVersion = (apiVersionPossibleValue?: QPossibleValue) =>
   {
      if (apiVersionPossibleValue)
      {
         setApiVersion(apiVersionPossibleValue.id);
      }
      else
      {
         setApiVersion(null);
      }
   };

   const handleSelectingFile = (event: SelectChangeEvent, index: number) =>
   {
      openEditorFileNames[index] = event.target.value;
      setOpenEditorFileNames(openEditorFileNames);
      forceUpdate();
   };

   const splitEditorClicked = () =>
   {
      openEditorFileNames.push(availableFileNames[0]);
      setOpenEditorFileNames(openEditorFileNames);
      forceUpdate();
   };

   const closeEditorClicked = (index: number) =>
   {
      openEditorFileNames.splice(index, 1);
      setOpenEditorFileNames(openEditorFileNames);
      forceUpdate();
   };

   const computeEditorWidth = (): string =>
   {
      return (100 / openEditorFileNames.length) + "%";
   };

   return (
      <Box className="scriptEditor" sx={{position: "absolute", overflowY: "auto", height: "100%", width: "100%"}} p={6}>
         <Card sx={{height: "100%", p: 3}}>

            <Snackbar open={errorAlert !== null && errorAlert !== ""} onClose={(event?: React.SyntheticEvent | Event, reason?: string) =>
            {
               if (reason === "clickaway")
               {
                  return;
               }
               setErrorAlert("");
            }} anchorOrigin={{vertical: "top", horizontal: "center"}}>
               <Alert color="error" onClose={() => setErrorAlert("")}>
                  {errorAlert}
               </Alert>
            </Snackbar>

            <Box display="flex" justifyContent="space-between" alignItems="center">
               <Typography variant="h5" pb={1}>
                  {title}
               </Typography>

               <Box>
                  <Typography variant="body2" display="inline" pr={1}>
                     Tools:
                  </Typography>
                  <ToggleButtonGroup
                     value={openTool}
                     exclusive
                     onChange={changeOpenTool}
                     size="small"
                     sx={{pb: 1}}
                  >
                     <ToggleButton value="test">Test</ToggleButton>
                     <ToggleButton value="docs">Docs</ToggleButton>
                  </ToggleButtonGroup>
               </Box>
            </Box>

            <Box sx={{height: openTool ? "45%" : "100%"}}>
               <Grid container alignItems="flex-end">
                  <Box maxWidth={"50%"} minWidth={300}>
                     <DynamicSelect fieldPossibleValueProps={{tableName: "scriptRevision", fieldName: "apiName", initialDisplayValue: apiNameLabel}} initialValue={apiName} fieldLabel={"API Name *"} inForm={false} onChange={changeApiName} useCase="form" />
                  </Box>
                  <Box maxWidth={"50%"} minWidth={300} pl={2}>
                     <DynamicSelect fieldPossibleValueProps={{tableName: "scriptRevision", fieldName: "apiVersion", initialDisplayValue: apiVersionLabel}} initialValue={apiVersion} fieldLabel={"API Version *"} inForm={false} onChange={changeApiVersion} useCase="form" />
                  </Box>
               </Grid>
               <Box display="flex" sx={{height: "100%"}}>
                  {openEditorFileNames.map((fileName, index) =>
                  {
                     return (
                        <Box key={`${fileName}-${index}`} sx={{height: "100%", width: computeEditorWidth()}}>
                           <Box sx={{borderBottom: 1, borderColor: "divider"}} display="flex" justifyContent="space-between" alignItems="flex-end">
                              <FormControl className="selectedFileTab" variant="standard" sx={{verticalAlign: "bottom"}}>
                                 <Select value={openEditorFileNames[index]} onChange={(event) => handleSelectingFile(event, index)}>
                                    {
                                       availableFileNames.map((name) => (
                                          <MenuItem key={name} value={name}>{name}</MenuItem>
                                       ))
                                    }
                                 </Select>
                              </FormControl>
                              <Box>
                                 {
                                    openEditorFileNames.length > 1 &&
                                    <Tooltip title="Close this editor split" enterDelay={500}>
                                       <IconButton size="small" onClick={() => closeEditorClicked(index)}>
                                          <Icon>close</Icon>
                                       </IconButton>
                                    </Tooltip>
                                 }
                                 {
                                    index == openEditorFileNames.length - 1 &&
                                    <Tooltip title="Open a new editor split" enterDelay={500}>
                                       <IconButton size="small" onClick={splitEditorClicked}>
                                          <Icon>vertical_split</Icon>
                                       </IconButton>
                                    </Tooltip>
                                 }
                              </Box>
                           </Box>
                           <AceEditor
                              mode={fileTypes[openEditorFileNames[index]] ?? "javascript"}
                              theme="github"
                              name="editor"
                              editorProps={{$blockScrolling: true}}
                              setOptions={{
                                 useWorker: false,
                                 enableBasicAutocompletion: true,
                                 enableLiveAutocompletion: true,
                              }}
                              onChange={(value, event) => updateCode(value, event, index)}
                              width="100%"
                              height="calc(100% - 88px)"
                              value={fileContents[openEditorFileNames[index]]}
                              style={{border: "1px solid gray"}}
                           />
                        </Box>
                     );
                  })}
               </Box>
            </Box>

            {
               openTool &&
               <Box sx={{height: "45%"}} pt={2}>
                  {
                     openTool == "test" && <ScriptTestForm scriptId={scriptId} scriptType={scriptTypeRecord} tableName={tableName} fieldName={fieldName} recordId={recordId} fileContents={fileContents} apiName={apiName} apiVersion={apiVersion} />
                  }
                  {
                     openTool == "docs" && <ScriptDocsForm helpText={scriptTypeRecord?.values.get("helpText")} exampleCode={scriptTypeRecord?.values.get("sampleCode")} aceEditorHeight="100%" />
                  }
               </Box>
            }

            <Box pt={1}>
               <Grid container alignItems="flex-end">
                  <Box width="50%">
                     <TextField id="commitMessage" label="Commit Message" variant="standard" fullWidth value={commitMessage} onChange={updateCommitMessage} style={{visibility: "hidden"}} />
                  </Box>
                  <Grid container justifyContent="flex-end" spacing={3}>
                     <QCancelButton disabled={closing} onClickHandler={cancelClicked} />
                     <QSaveButton disabled={closing} onClickHandler={() => saveClicked()} />
                  </Grid>
               </Grid>
            </Box>

            <CommitMessagePrompt isOpen={promptForCommitMessageOpen} closeHandler={closePromptForCommitMessage} />
         </Card>
      </Box>

   );
}

function CommitMessagePrompt(props: { isOpen: boolean, closeHandler: (wasSaveClicked: boolean, message?: string) => void })
{
   const [commitMessage, setCommitMessage] = useState("No commit message given");

   const updateCommitMessage = (event: React.ChangeEvent<HTMLInputElement>) =>
   {
      setCommitMessage(event.target.value);
   };

   const keyPressHandler = (e: React.KeyboardEvent<HTMLDivElement>) =>
   {
      if (e.key === "Enter")
      {
         props.closeHandler(true, commitMessage);
      }
   };

   return (
      <Dialog
         open={props.isOpen}
         onClose={() => props.closeHandler(false)}
         aria-labelledby="alert-dialog-title"
         aria-describedby="alert-dialog-description"
         onKeyPress={e => keyPressHandler(e)}
      >
         <DialogTitle id="alert-dialog-title">Please Enter a Commit Message</DialogTitle>
         <DialogContent sx={{width: "500px"}}>
            <Box pt={1}>
               <TextField
                  autoFocus
                  name="commit-message"
                  placeholder="Commit message"
                  label="Commit message"
                  inputProps={{width: "100%", maxLength: 250}}
                  value={commitMessage}
                  sx={{width: "100%"}}
                  onChange={updateCommitMessage}
                  onFocus={event =>
                  {
                     event.target.select();
                  }}
               />
            </Box>
         </DialogContent>
         <DialogActions>
            <QCancelButton onClickHandler={() => props.closeHandler(false)} disabled={false} />
            <QSaveButton label="Save" onClickHandler={() => props.closeHandler(true, commitMessage)} disabled={false} />
         </DialogActions>
      </Dialog>
   );
}

export default ScriptEditor;
