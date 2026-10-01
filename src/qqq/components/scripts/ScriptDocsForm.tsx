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


import {Typography} from "@mui/material";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import React from "react";
import AceEditor from "react-ace";

interface Props
{
   helpText: string;
   exampleCode: string;
   aceEditorHeight: string
}

ScriptDocsForm.defaultProps = {
   aceEditorHeight: "100%",
};

function ScriptDocsForm({helpText, exampleCode, aceEditorHeight}: Props): JSX.Element
{

   const oneBlock = (name: string, mode: string, heading: string, code: string): JSX.Element =>
   {
      return (
         <Grid item xs={6} height="100%">
            <Box gap={2} pb={1} pr={2} height="100%">
               <Card sx={{width: "100%", height: "100%"}}>
                  <Typography variant="h6" p={2} pb={1}>{heading}</Typography>
                  <Box className="devDocumentation" height="100%">
                     <Typography variant="body2" sx={{maxWidth: "1200px", margin: "auto", height: "calc(100% - 0.5rem)"}}>
                        <AceEditor
                           mode={mode}
                           theme="github"
                           name={name}
                           editorProps={{$blockScrolling: true}}
                           setOptions={{useWorker: false}}
                           value={code}
                           readOnly
                           highlightActiveLine={false}
                           width="100%"
                           showPrintMargin={false}
                           height="100%"
                           style={{borderBottomRightRadius: "0.75rem", borderBottomLeftRadius: "0.75rem"}}
                        />
                     </Typography>
                  </Box>
               </Card>
            </Box>
         </Grid>
      )
   }

   return (
      <Grid container spacing={2} height="100%">
         {oneBlock("helpText", "text", "Documentation", helpText)}
         {oneBlock("exampleCode", "javascript", "Example Code", exampleCode)}
      </Grid>
   );
}

export default ScriptDocsForm;

