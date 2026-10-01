/*
 * QQQ - Low-code Application Framework for Engineers.
 * Copyright (C) 2021-2024.  Kingsrook, LLC
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


import {AdornmentType} from "@qrunio/qqq-frontend-core/lib/model/metaData/AdornmentType";
import {QFieldMetaData} from "@qrunio/qqq-frontend-core/lib/model/metaData/QFieldMetaData";
import {QFieldType} from "@qrunio/qqq-frontend-core/lib/model/metaData/QFieldType";
import {QRecord} from "@qrunio/qqq-frontend-core/lib/model/QRecord";
import {Button, colors, Icon} from "@mui/material";
import Box from "@mui/material/Box";
import Tooltip from "@mui/material/Tooltip";
import {useFormikContext} from "formik";
import MDTypography from "qqq/components/legacy/MDTypography";
import ValueUtils from "qqq/utils/qqq/ValueUtils";
import React, {useCallback, useState} from "react";
import {useDropzone} from "react-dropzone";

interface FileInputFieldProps
{
   field: any,
   record?: QRecord,
   errorMessage?: any
}

export default function FileInputField({field, record, errorMessage}: FileInputFieldProps): JSX.Element
{
   const [fileName, setFileName] = useState(null as string);

   const formikProps = useFormikContext();

   const fileChanged = (event: React.FormEvent<HTMLInputElement>, field: any) =>
   {
      setFileName(null);
      if (event.currentTarget.files && event.currentTarget.files[0])
      {
         setFileName(event.currentTarget.files[0].name);
      }

      formikProps.setFieldValue(field.name, event.currentTarget.files[0]);
   };

   const onDrop = useCallback((acceptedFiles: any) =>
   {
      setFileName(null);
      if (acceptedFiles.length && acceptedFiles[0])
      {
         setFileName(acceptedFiles[0].name);
      }

      formikProps.setFieldValue(field.name, acceptedFiles[0]);
   }, []);
   const {getRootProps, getInputProps, isDragActive} = useDropzone({onDrop});


   const removeFile = (fieldName: string) =>
   {
      setFileName(null);
      formikProps.setFieldValue(fieldName, null);
      record?.values.delete(fieldName);
      record?.displayValues.delete(fieldName);
   };

   const pseudoField = new QFieldMetaData({name: field.name, type: QFieldType.BLOB});

   const fileUploadAdornment = field.fieldMetaData?.getAdornment(AdornmentType.FILE_UPLOAD);
   const format = fileUploadAdornment?.values?.get("format") ?? "button";

   return (
      <Box mb={1.5}>
         {
            record && record.values.get(field.name) && <Box fontSize="0.875rem" pb={1}>
               Current File:
               <Box display="inline-flex" pl={1}>
                  {ValueUtils.getDisplayValue(pseudoField, record, "view")}
                  <Tooltip placement="bottom" title="Remove current file">
                     <Icon className="blobIcon" fontSize="small" onClick={(e) => removeFile(field.name)}>delete</Icon>
                  </Tooltip>
               </Box>
            </Box>
         }

         {
            format == "button" &&
               <Box display="flex" alignItems="center">
                  <Button variant="outlined" component="label">
                     <span style={{color: colors.lightBlue[500]}}>Choose file to upload</span>
                     <input
                        id={field.name}
                        name={field.name}
                        type="file"
                        hidden
                        onChange={(event: React.FormEvent<HTMLInputElement>) => fileChanged(event, field)}
                     />
                  </Button>
                  <Box ml={1} fontSize={"1rem"}>
                     {fileName}
                  </Box>
               </Box>
         }

         {
            format == "dragAndDrop" &&
            <>
               <Box {...getRootProps()} sx={
                  {
                     display: "flex",
                     alignItems: "center",
                     justifyContent: "center",
                     width: "100%",
                     height: "300px",
                     borderRadius: "2rem",
                     backgroundColor: isDragActive ? colors.lightBlue[50] : "transparent",
                     border: `2px ${isDragActive ? "solid" : "dashed"} ${colors.lightBlue[500]}`
                  }}>
                  <input {...getInputProps()} />
                  <Box display="flex" alignItems="center" flexDirection="column">
                     <Icon sx={{fontSize: "4rem !important", color: colors.lightBlue[500]}}>upload_file</Icon>
                     <Box>Drag and drop a file</Box>
                     <Box fontSize="1rem" m="0.5rem">or</Box>
                     <Box border={`2px solid ${colors.lightBlue[500]}`} mt="0.25rem" padding="0.25rem 1rem" borderRadius="0.5rem" sx={{cursor: "pointer"}} fontSize="1rem">
                        Browse files
                     </Box>
                  </Box>
               </Box>
               <Box fontSize={"1rem"} mt="0.25rem">
                  {fileName}&nbsp;
               </Box>
            </>
         }

         <Box mt={0.75}>
            <MDTypography component="div" variant="caption" color="error" fontWeight="regular">
               {errorMessage && <span>{errorMessage}</span>}
            </MDTypography>
         </Box>
      </Box>
   );
}
