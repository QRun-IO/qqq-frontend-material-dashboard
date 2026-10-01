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

import {QJobError} from "@qrunio/qqq-frontend-core/lib/model/processes/QJobError";
import {ToggleButton, ToggleButtonGroup, Typography} from "@mui/material";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import Snackbar from "@mui/material/Snackbar";
import TextField from "@mui/material/TextField";
import FormData from "form-data";
import React, {useReducer, useState} from "react";
import AceEditor from "react-ace";
import {QCancelButton, QSaveButton} from "qqq/components/buttons/DefaultButtons";
import Client from "qqq/utils/qqq/Client";
import DataBagPreview from "./DataBagPreview";

export interface DataBagDataEditorProps
{
   title: string;
   dataBagId: number;
   data: string;
   closeCallback: any;
}


const qController = Client.getInstance();

function DataBagDataEditor({title, dataBagId, data, closeCallback}: DataBagDataEditorProps): JSX.Element
{
   const [closing, setClosing] = useState(false);
   const [updatedCode, setUpdatedCode] = useState(data)
   const [commitMessage, setCommitMessage] = useState("")
   const [openTool, setOpenTool] = useState(null);
   const [errorAlert, setErrorAlert] = useState("")
   const [, forceUpdate] = useReducer((x) => x + 1, 0);

   const changeOpenTool = (event: React.MouseEvent<HTMLElement>, newValue: string | null) =>
   {
      setOpenTool(newValue);

      // need this to make Ace recognize new height.
      setTimeout(() =>
      {
         window.dispatchEvent(new Event("resize"))
      }, 100);
   };

   const saveClicked = () =>
   {
      try
      {
         JSON.parse(updatedCode)
      }
      catch(e)
      {
         setErrorAlert("Cannot save Data Bag Contents.  Invalid json:  " + e);
         return;
      }

      setClosing(true);

      (async () =>
      {
         const formData = new FormData();
         formData.append("dataBagId", dataBagId);
         formData.append("data", updatedCode);
         formData.append("commitMessage", commitMessage);

         //////////////////////////////////////////////////////////////////
         // we don't want this job to go async, so, pass a large timeout //
         //////////////////////////////////////////////////////////////////
         formData.append("_qStepTimeoutMillis", 60 * 1000);

         const formDataHeaders = {
            "content-type": "multipart/form-data; boundary=--------------------------320289315924586491558366",
         };

         const processResult = await qController.processInit("storeDataBagVersion", formData, formDataHeaders);
         if (processResult instanceof QJobError)
         {
            const jobError = processResult as QJobError
            closeCallback(null, "failed", jobError.userFacingError ?? jobError.error);
         }
         console.log("process result");
         console.log(processResult);

         closeCallback(null, "saved", "Saved New Data Bag Version");
      })();
   }

   const cancelClicked = () =>
   {
      setClosing(true);
      closeCallback(null, "cancelled");
   }

   const updateCode = (value: string, event: any) =>
   {
      console.log("Updating code")
      setUpdatedCode(value);
      forceUpdate();
   }

   const updateCommitMessage = (event: React.ChangeEvent<HTMLInputElement>) =>
   {
      setCommitMessage(event.target.value);
   }

   return (
      <Box sx={{position: "absolute", overflowY: "auto", height: "100%", width: "100%"}} p={6}>
         <Card sx={{height: "100%", p: 3}}>

            <Snackbar open={errorAlert !== null && errorAlert !== ""} onClose={(event?: React.SyntheticEvent | Event, reason?: string) =>
            {
               if (reason === "clickaway")
               {
                  return;
               }
               setErrorAlert("")
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
                     <ToggleButton value="preview">Preview</ToggleButton>
                  </ToggleButtonGroup>
               </Box>
            </Box>

            <Box sx={{height: openTool ? "45%" : "100%"}}>
               <AceEditor
                  mode="json"
                  theme="github"
                  name="editor"
                  editorProps={{$blockScrolling: true}}
                  setOptions={{useWorker: false}}
                  onChange={updateCode}
                  width="100%"
                  height="100%"
                  value={updatedCode}
                  style={{border: "1px solid gray"}}
               />
            </Box>

            {
               openTool &&
               <Box sx={{height: "45%"}} pt={2}>
                  {
                     openTool == "preview" &&
                     <Box fontSize="14px" overflow="auto" height="100%" border="1px solid gray" pt={1}>
                        <DataBagPreview json={updatedCode} />
                     </Box>
                  }
               </Box>
            }

            <Box pt={1}>
               <Grid container alignItems="flex-end">
                  <Box width="50%">
                     <TextField id="commitMessage" label="Commit Message" variant="standard" fullWidth value={commitMessage} onChange={updateCommitMessage} />
                  </Box>
                  <Grid container justifyContent="flex-end" spacing={3}>
                     <QCancelButton disabled={closing} onClickHandler={cancelClicked} />
                     <QSaveButton disabled={closing} onClickHandler={saveClicked} />
                  </Grid>
               </Grid>
            </Box>
         </Card>
      </Box>
   );
}

export default DataBagDataEditor;
