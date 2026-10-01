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
import {QFieldMetaData} from "@qrunio/qqq-frontend-core/lib/model/metaData/QFieldMetaData";
import {QFieldType} from "@qrunio/qqq-frontend-core/lib/model/metaData/QFieldType";
import {QJobComplete} from "@qrunio/qqq-frontend-core/lib/model/processes/QJobComplete";
import {QJobError} from "@qrunio/qqq-frontend-core/lib/model/processes/QJobError";
import {QRecord} from "@qrunio/qqq-frontend-core/lib/model/QRecord";
import {Typography} from "@mui/material";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableContainer from "@mui/material/TableContainer";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import FormData from "form-data";
import React, {useState} from "react";
import MDTypography from "qqq/components/legacy/MDTypography";
import DataTableBodyCell from "qqq/components/widgets/tables/cells/DataTableBodyCell";
import DataTableHeadCell from "qqq/components/widgets/tables/cells/DataTableHeadCell";
import Client from "qqq/utils/qqq/Client";
import ValueUtils from "qqq/utils/qqq/ValueUtils";

interface AssociatedScriptDefinition
{
   testInputFields: QFieldMetaData[];
   testOutputFields: QFieldMetaData[];
}

export interface ScriptTestFormProps
{
   scriptId: number;
   scriptType: QRecord;
   tableName: string;
   fieldName: string;
   recordId: any;
   fileContents: {[name: string]: string};
   apiName: string;
   apiVersion: string;
}

const qController = Client.getInstance();

function ScriptTestForm({scriptId, scriptType, tableName, fieldName, recordId, fileContents, apiName, apiVersion}: ScriptTestFormProps): JSX.Element
{
   const [testInputFields, setTestInputFields] = useState(null as QFieldMetaData[])
   const [testOutputFields, setTestOutputFields] = useState(null as QFieldMetaData[])
   const [testInputValues, setTestInputValues] = useState({} as any);
   const [testOutputValues, setTestOutputValues] = useState({} as any);
   const [logLines, setLogLines] = useState([] as any[])
   const [testException, setTestException] = useState(null as string)
   const [firstRender, setFirstRender] = useState(true);

   if(firstRender)
   {
      setFirstRender(false);
   }

   if(firstRender)
   {
      (async () =>
      {
         /////////////////////////////////////////////////////////////////////
         // call backend to load details about how to test this script type //
         /////////////////////////////////////////////////////////////////////
         const formData = new FormData();
         formData.append("scriptTypeId", scriptType.values.get("id"));
         const processResult = await qController.processRun("loadScriptTestDetails", formData, null, true);

         if (processResult instanceof QJobError)
         {
            const jobError = processResult as QJobError
            setTestException(jobError.userFacingError ?? jobError.error)
            return;
         }

         const jobComplete = processResult as QJobComplete

         const testInputFields = [] as QFieldMetaData[];
         for(let i = 0; i <jobComplete?.values?.testInputFields?.length; i++)
         {
            testInputFields.push(new QFieldMetaData(jobComplete.values.testInputFields[i]));
         }
         setTestInputFields(testInputFields);

         const testOutputFields = [] as QFieldMetaData[];
         for(let i = 0; i <jobComplete?.values?.testOutputFields?.length; i++)
         {
            testOutputFields.push(new QFieldMetaData(jobComplete.values.testOutputFields[i]));
         }
         setTestOutputFields(testOutputFields);

         /////////////////////////////////////////////
         // set a default value in each input field //
         /////////////////////////////////////////////
         testInputFields.forEach((field: QFieldMetaData) =>
         {
            testInputValues[field.name] = field.defaultValue ?? "";
         });
      })();
   }

   const buildFullExceptionMessage = (exception: any): string =>
   {
      return (exception.message + (exception.cause ? "\ncaused by: " + buildFullExceptionMessage(exception.cause) : ""));
   };

   const testScript = () =>
   {
      const inputValues = new Map<string, any>();
      if (testInputFields)
      {
         testInputFields.forEach((field: QFieldMetaData) =>
         {
            inputValues.set(field.name, testInputValues[field.name]);
         });
      }

      setTestOutputValues({});
      setLogLines([]);
      setTestException(null);

      (async () =>
      {
         try
         {
            let output;
            /*
            if(tableName && recordId && fieldName)
            {
               /////////////////////////////////////////////////////////////////
               // associated record scripts - run this way (at least for now) //
               /////////////////////////////////////////////////////////////////
               inputValues.set("apiName", apiName);
               inputValues.set("apiVersion", apiVersion);
               output = await qController.testScript(tableName, recordId, fieldName, "todo!", inputValues);
            }
            else
            */
            {
               const formData = new FormData();
               formData.append("scriptId", scriptId);
               formData.append("apiName", apiName);
               formData.append("apiVersion", apiVersion);

               formData.append("fileNames", Object.keys(fileContents).join(","))
               for (let fileName in fileContents)
               {
                  formData.append("fileContents:" + fileName, fileContents[fileName]);
               }

               for(let fieldName of inputValues.keys())
               {
                  formData.append(fieldName, inputValues.get(fieldName));
               }

               const processResult = await qController.processRun("testScript", formData, null, true);

               if (processResult instanceof QJobError)
               {
                  const jobError = processResult as QJobError
                  setTestException(jobError.userFacingError ?? jobError.error)
                  return;
               }

               const jobComplete = processResult as QJobComplete
               output = jobComplete.values;
            }

            console.log("got output:")
            console.log(output);
            console.log(Object.keys(output));
            setTestOutputValues(output.outputObject ?? {});
            if(output.exception)
            {
               const exceptionMessage = buildFullExceptionMessage(output.exception);
               setTestException(exceptionMessage)
            }

            if(output.scriptLogLines && output.scriptLogLines.length)
            {
               const scriptLogLines = [];
               for(var i = 0; i<output.scriptLogLines.length; i++)
               {
                  scriptLogLines.push(output.scriptLogLines[i].values);
               }
               setLogLines(scriptLogLines);
            }
         }
         catch(e)
         {
            console.warn(e);
            if(e instanceof QException)
            {
               const qe = e as QException;
               setTestException(qe.code + ": " + qe.message);
            }
            else
            {
               setTestException(`${e}`);
            }
         }
      })();
   };

   const handleInputChange = (fieldName: string, newValue: string) =>
   {
      testInputValues[fieldName] = newValue;
      console.log(`Setting ${fieldName} = ${newValue}`);
      setTestInputValues(JSON.parse(JSON.stringify(testInputValues)));
   }

   return (
      <Grid container spacing={2} height="100%" className="scriptTestForm">
         <Grid item xs={6} height="100%">
            <Box gap={2} pb={1} pr={2} height="100%">
               <Card sx={{width: "100%", height: "100%", overflow: "auto"}}>
                  <Box width="100%">
                     <Typography variant="h6" p={2} pb={1}>Test Input</Typography>
                     <Box px={2} pb={2}>
                        <Alert severity="warning" sx={{mb: 2}}>
                           Test runs against live data. Explicit writes and external side effects can persist, even if the script later fails. The draft revision and test logs are not saved. Use a test environment and disposable records.
                        </Alert>
                        {
                           testInputFields && testInputValues && testInputFields.map((field: QFieldMetaData) =>
                           {
                              return (<TextField
                                 key={field.name}
                                 id={field.name}
                                 label={field.label}
                                 value={testInputValues[field.name]}
                                 variant="standard"
                                 onChange={(event) =>
                                 {
                                    handleInputChange(field.name, event.target.value);
                                 }}
                                 multiline={field.type == QFieldType.TEXT}
                                 maxRows={field.type == QFieldType.TEXT ? 5 : 1}
                                 fullWidth
                                 sx={{mb: 2}}
                              />);
                           })
                        }
                     </Box>
                     <div style={{float: "right"}}>
                        <Button onClick={() => testScript()}>Submit</Button>
                     </div>
                  </Box>
               </Card>
            </Box>
         </Grid>
         <Grid item xs={6} height="100%">
            <Box gap={2} pb={1} height="100%">
               <Card sx={{width: "100%", height: "100%", overflow: "auto"}}>
                  <Typography variant="h6" p={2} pl={3} pb={1}>Test Output</Typography>
                  <Box p={3} pt={0}>
                     {
                        testException &&
                        <Typography variant="body2" color="red">
                           {testException}
                        </Typography>
                     }
                     {
                        testOutputFields && testOutputFields.map((f: any) =>
                        {
                           const field = new QFieldMetaData(f);
                           return (
                              <Box key={field.name} flexDirection="row" pr={2}>
                                 <Typography variant="button" textTransform="none"  fontWeight="bold" pr={1}>
                                    {field.label}:
                                 </Typography>
                                 <MDTypography variant="button" fontWeight="regular" color="text">
                                    {
                                       testOutputValues.values ?
                                          ValueUtils.getValueForDisplay(field, testOutputValues.values[field.name], testOutputValues.displayValues[field.name], "view") :
                                          ValueUtils.getValueForDisplay(field, testOutputValues[field.name], testOutputValues[field.name], "view")
                                    }
                                 </MDTypography>
                              </Box>
                           );
                        })
                     }
                     {
                        logLines && logLines.length ?
                           <>
                              <Typography variant="h6" p={2} pl={0} pb={1}>Test Log Lines</Typography>
                              <TableContainer sx={{boxShadow: "none"}} className="scriptLogLines">
                                 <Table>
                                    <Box component="thead">
                                       <TableRow key="header">
                                          <DataTableHeadCell sorted={false} width="140px">Timestamp</DataTableHeadCell>
                                          <DataTableHeadCell sorted={false}>Log Line</DataTableHeadCell>
                                       </TableRow>
                                    </Box>
                                    <TableBody>
                                       {
                                          logLines.map((logLine: any, i: number) =>
                                             (
                                                <TableRow key={i}>
                                                   <DataTableBodyCell><span style={{whiteSpace: "nowrap", paddingRight: "1rem"}}>{ValueUtils.formatTime(logLine["timestamp"])}</span></DataTableBodyCell>
                                                   <DataTableBodyCell>{logLine["text"]}</DataTableBodyCell>
                                                </TableRow>
                                             ))
                                       }
                                    </TableBody>
                                 </Table>
                              </TableContainer>
                           </> : <></>
                     }
                  </Box>
               </Card>
            </Box>
         </Grid>
      </Grid>
   );
}

export default ScriptTestForm;
