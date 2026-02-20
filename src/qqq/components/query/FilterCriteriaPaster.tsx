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

import {FormControl, InputLabel, Select, SelectChangeEvent} from "@mui/material";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import Icon from "@mui/material/Icon";
import Modal from "@mui/material/Modal";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import {QFieldMetaData} from "@qrunio/qqq-frontend-core/lib/model/metaData/QFieldMetaData";
import {QInstance} from "@qrunio/qqq-frontend-core/lib/model/metaData/QInstance";
import {QTableMetaData} from "@qrunio/qqq-frontend-core/lib/model/metaData/QTableMetaData";
import {QPossibleValue} from "@qrunio/qqq-frontend-core/lib/model/QPossibleValue";
import {preferredColorNameInfoOrPrimary} from "qqq/assets/theme/functions/preferInfoColorToPrimaryColor";
import {QCancelButton, QSaveButton} from "qqq/components/buttons/DefaultButtons";
import ChipTextField from "qqq/components/forms/ChipTextField";
import HelpContent from "qqq/components/misc/HelpContent";
import {LoadingState} from "qqq/models/LoadingState";
import Client from "qqq/utils/qqq/Client";
import React, {useEffect, useReducer, useState} from "react";

interface Props
{
   type: string;
   onSave: (newValues: any[]) => void;
   table?: QTableMetaData;
   field?: QFieldMetaData;
}

FilterCriteriaPaster.defaultProps = {};
const qController = Client.getInstance();

function FilterCriteriaPaster({table, field, type, onSave}: Props): JSX.Element
{
   enum Delimiter
   {
      DETECT_AUTOMATICALLY = "Detect Automatically",
      COMMA = "Comma",
      NEWLINE = "Newline",
      PIPE = "Pipe",
      SPACE = "Space",
      TAB = "Tab",
      CUSTOM = "Custom",
   }

   const delimiterToCharacterMap: { [key: string]: string } = {};

   delimiterToCharacterMap[Delimiter.COMMA] = "[,\n\r]";
   delimiterToCharacterMap[Delimiter.TAB] = "[\t,\n,\r]";
   delimiterToCharacterMap[Delimiter.NEWLINE] = "[\n\r]";
   delimiterToCharacterMap[Delimiter.PIPE] = "[\\|\r\n]";
   delimiterToCharacterMap[Delimiter.SPACE] = "[ \n\r]";

   const delimiterDropdownOptions = Object.values(Delimiter);

   const mainCardStyles: any = {};
   mainCardStyles.width = "60%";
   mainCardStyles.minWidth = "500px";

   ///////////////////////////////////////////////////////////////////////////////////////////
   // add a LoadingState object, in case the initial loads (of meta data and view) are slow //
   ///////////////////////////////////////////////////////////////////////////////////////////
   const [, forceUpdate] = useReducer((x) => x + 1, 0);
   const [pageLoadingState, _] = useState(new LoadingState(forceUpdate));

   //x const [gridFilterItem, setGridFilterItem] = useState(props.item);
   const [pasteModalIsOpen, setPasteModalIsOpen] = useState(false);
   const [inputText, setInputText] = useState("");
   const [delimiter, setDelimiter] = useState("");
   const [delimiterCharacter, setDelimiterCharacter] = useState("");
   const [customDelimiterValue, setCustomDelimiterValue] = useState("");
   const [chipData, setChipData] = useState(undefined);
   const [uniqueCount, setUniqueCount] = useState(undefined);
   const [chipValidity, setChipValidity] = useState([] as boolean[]);
   const [chipPVSIds, setChipPVSIds] = useState([] as any[]);
   const [detectedText, setDetectedText] = useState("");
   const [errorText, setErrorText] = useState("");
   const [saveDisabled, setSaveDisabled] = useState(true);
   const [metaData, setMetaData] = useState(null as QInstance);

   //////////////////////////////////////////////////////////////
   // handler for when paste icon is clicked in 'any' operator //
   //////////////////////////////////////////////////////////////
   const handlePasteClick = (event: any) =>
   {
      event.target.blur();
      setPasteModalIsOpen(true);
   };

   const clearData = () =>
   {
      setDelimiter("");
      setDelimiterCharacter("");
      setChipData([]);
      setChipValidity([]);
      setInputText("");
      setDetectedText("");
      setCustomDelimiterValue("");
      setPasteModalIsOpen(false);
   };

   const handleCancelClicked = () =>
   {
      clearData();
      setPasteModalIsOpen(false);
   };

   const handleSaveClicked = () =>
   {
      ///////////////////////////////////////////////////////////////
      // if numeric remove any non-numerics, or invalid pvs values //
      ///////////////////////////////////////////////////////////////
      let saveData = [];
      let usedLabels = new Map<any, boolean>();
      for (let i = 0; i < chipData.length; i++)
      {
         if (chipValidity[i] === true)
         {
            if (type === "pvs")
            {
               /////////////////////////////////////////////
               // if already used this PVS label, skip it //
               /////////////////////////////////////////////
               if (usedLabels.get(chipData[i]) != null)
               {
                  continue;
               }

               saveData.push(new QPossibleValue({id: chipPVSIds[i], label: chipData[i]}));
               usedLabels.set(chipData[i], true);
            }
            else
            {
               saveData.push(chipData[i]);
            }
         }
      }

      //////////////////////////////////////////
      // for pvs, sort by label before saving //
      //////////////////////////////////////////
      if (type === "pvs")
      {
         saveData.sort((a: QPossibleValue, b: QPossibleValue) => b.label.localeCompare(a.label));
      }

      onSave(saveData);

      clearData();
      setPasteModalIsOpen(false);
   };

   ////////////////////////////////////////////////////////////////
   // when user selects a different delimiter on the parse modal //
   ////////////////////////////////////////////////////////////////
   const handleDelimiterChange = (event: SelectChangeEvent) =>
   {
      const newDelimiter = event.target.value;
      console.log(`Delimiter Changed to ${JSON.stringify(newDelimiter)}`);

      setDelimiter(newDelimiter);
      if (newDelimiter === Delimiter.CUSTOM)
      {
         setDelimiterCharacter(customDelimiterValue);
      }
      else
      {
         setDelimiterCharacter(delimiterToCharacterMap[newDelimiter]);
      }
   };

   const handleTextChange = (event: any) =>
   {
      const inputText = event.target.value;
      setInputText(inputText);
   };

   const handleCustomDelimiterChange = (event: any) =>
   {
      let inputText = event.target.value;
      setCustomDelimiterValue(inputText);
   };

   ///////////////////////////////////////////////////////////////////////////////////////
   // iterate over each character, putting them into 'buckets' so that we can determine //
   // a good default to use when data is pasted into the textarea                       //
   ///////////////////////////////////////////////////////////////////////////////////////
   const calculateAutomaticDelimiter = (text: string): string =>
   {
      const buckets = new Map();
      for (let i = 0; i < text.length; i++)
      {
         let bucketName = "";

         switch (text.charAt(i))
         {
            case "\t":
               bucketName = Delimiter.TAB;
               break;
            case "\n":
            case "\r":
               bucketName = Delimiter.NEWLINE;
               break;
            case "|":
               bucketName = Delimiter.PIPE;
               break;
            case " ":
               bucketName = Delimiter.SPACE;
               break;
            case ",":
               bucketName = Delimiter.COMMA;
               break;
         }

         if (bucketName !== "")
         {
            let currentCount = (buckets.has(bucketName)) ? buckets.get(bucketName) : 0;
            buckets.set(bucketName, currentCount + 1);
         }
      }

      ///////////////////////
      // default is commas //
      ///////////////////////
      let highestCount = 0;
      let delimiter = Delimiter.COMMA;
      for (let j = 0; j < delimiterDropdownOptions.length; j++)
      {
         let bucketName = delimiterDropdownOptions[j];
         if (buckets.has(bucketName) && buckets.get(bucketName) > highestCount)
         {
            delimiter = bucketName;
            highestCount = buckets.get(bucketName);
         }
      }

      setDetectedText(`${delimiter} Detected`);
      return (delimiterToCharacterMap[delimiter]);
   };

   useEffect(() =>
   {
      (async () =>
      {
         const metaData = await qController.loadMetaData();
         setMetaData(metaData);
      })();

      let currentDelimiter = delimiter;
      let currentDelimiterCharacter = delimiterCharacter;

      /////////////////////////////////////////////////////////////////////////////
      // if no delimiter already set in the state, call function to determine it //
      /////////////////////////////////////////////////////////////////////////////
      if (!currentDelimiter || currentDelimiter === Delimiter.DETECT_AUTOMATICALLY)
      {
         currentDelimiterCharacter = calculateAutomaticDelimiter(inputText);
         if (!currentDelimiterCharacter)
         {
            return;
         }

         currentDelimiter = Delimiter.DETECT_AUTOMATICALLY;
         setDelimiter(Delimiter.DETECT_AUTOMATICALLY);
         setDelimiterCharacter(currentDelimiterCharacter);
      }
      else if (currentDelimiter === Delimiter.CUSTOM)
      {
         ////////////////////////////////////////////////////
         // if custom, make sure to split on new lines too //
         ////////////////////////////////////////////////////
         currentDelimiterCharacter = `[${customDelimiterValue}\r\n]`;
      }

      console.log(`current delimiter is: ${currentDelimiter}, delimiting on: ${currentDelimiterCharacter}`);

      let regex = new RegExp(currentDelimiterCharacter);
      let parts = inputText.split(regex);
      let chipData = [] as string[];

      /////////////////////////////////////////////////////////////////
      // use a map to keep track of the counts for each unique value //
      /////////////////////////////////////////////////////////////////
      const uniqueValuesMap: { [key: string]: number } = {};

      ///////////////////////////////////////////////////////
      // if delimiter is empty string, dont split anything //
      ///////////////////////////////////////////////////////
      setErrorText("");
      let invalidCount = 0;
      if (currentDelimiterCharacter !== "")
      {
         for (let i = 0; i < parts.length; i++)
         {
            let part = parts[i].trim();
            if (part !== "")
            {
               chipData.push(part);

               ////////////////////////////////////////////////////////////////
               // if numeric or pvs, check validity and add to invalid count //
               ////////////////////////////////////////////////////////////////
               if (chipValidity[i] != null && chipValidity[i] !== true)
               {
                  if ((type === "number" && Number.isNaN(Number(part))) || type === "pvs")
                  {
                     invalidCount++;
                  }
               }
               else
               {
                  let count = uniqueValuesMap[part] == null ? 0 : uniqueValuesMap[part];
                  uniqueValuesMap[part] = count + 1;
               }
            }
         }
      }

      if (invalidCount > 0)
      {
         if (type === "number")
         {
            let suffix = invalidCount === 1 ? " value is not a number" : " values are not numbers";
            setErrorText(invalidCount + suffix + " and will not be added to the filter");
         }
         else if (type === "pvs")
         {
            let suffix = invalidCount === 1 ? " value was" : " values were";
            setErrorText(invalidCount + suffix + " not found and will not be added to the filter");
         }
      }

      setUniqueCount(Object.keys(uniqueValuesMap).length);
      setChipData(chipData);

   }, [inputText, delimiterCharacter, customDelimiterValue, detectedText, chipValidity]);

   const slotName = type === "pvs" ? "bulkAddFilterValuesPossibleValueSource" : "bulkAddFilterValues";
   const helpRoles = ["QUERY_SCREEN"];
   const formattedHelpContent = <HelpContent helpContents={metaData?.helpContent?.get(slotName)} roles={helpRoles} heading={null} helpContentKey={`instanceLevel:true;slot:${slotName}`} />;

   return (
      <Box>
         <Tooltip title="Quickly add many values to your filter by pasting them from a spreadsheet or any other data source.">
            <Icon className="criteriaPasterButton" onClick={handlePasteClick} fontSize="small" color={preferredColorNameInfoOrPrimary()} sx={{mx: 0.25, cursor: "pointer"}}>paste_content</Icon>
         </Tooltip>
         {
            pasteModalIsOpen &&
            (
               <Modal open={pasteModalIsOpen}>
                  <Box>
                     <Box sx={{position: "absolute", overflowY: "auto", width: "100%"}}>
                        <Box py={3} justifyContent="center" sx={{display: "flex", mt: 8}}>
                           <Card sx={mainCardStyles}>
                              <Box p={4} pb={2}>
                                 <Grid container>
                                    <Grid item pr={3} xs={12} lg={12}>
                                       <Typography variant="h5">Bulk Add Filter Values</Typography>
                                       {
                                          formattedHelpContent && <Box sx={{display: "flex", lineHeight: "1.7", textTransform: "none"}}>
                                             <Typography sx={{display: "flex", lineHeight: "1.7", textTransform: "revert"}} variant="button">
                                                {formattedHelpContent}
                                             </Typography>
                                          </Box>
                                       }
                                    </Grid>
                                 </Grid>
                              </Box>
                              <Grid container pl={3} pr={3} justifyContent="center" alignItems="stretch" sx={{display: "flex", height: "100%"}}>
                                 <Grid item pr={3} xs={6} lg={6} sx={{width: "100%", display: "flex", flexDirection: "column", flexGrow: 1}}>
                                    <FormControl sx={{m: 1, width: "100%"}}>
                                       <TextField
                                          className="criteriaPasterTextArea"
                                          id="outlined-multiline-static"
                                          label="PASTE TEXT"
                                          multiline
                                          onChange={handleTextChange}
                                          rows={16}
                                          value={inputText}
                                       />
                                    </FormControl>
                                 </Grid>
                                 <Grid item xs={6} lg={6} sx={{display: "flex", flexGrow: 1}}>
                                    <FormControl sx={{m: 1, width: "100%"}}>
                                       <ChipTextField
                                          handleChipChange={(isMakingRequest: boolean, chipValidity: boolean[], chipPVSIds: any[]) =>
                                          {
                                             setErrorText("");
                                             if (isMakingRequest)
                                             {
                                                pageLoadingState.setLoading();
                                             }
                                             else
                                             {
                                                pageLoadingState.setNotLoading();
                                             }
                                             setSaveDisabled(isMakingRequest);
                                             setChipPVSIds(chipPVSIds);
                                             setChipValidity(chipValidity);
                                          }}
                                          table={table}
                                          field={field}
                                          chipData={chipData}
                                          chipValidity={chipValidity}
                                          chipType={type}
                                          multiline
                                          fullWidth
                                          variant="outlined"
                                          id="tags"
                                          rows={0}
                                          name="tags"
                                          label="FILTER VALUES REVIEW"
                                       />
                                    </FormControl>
                                 </Grid>
                              </Grid>
                              <Grid container pl={3} pr={3} justifyContent="center" alignItems="stretch" sx={{display: "flex", height: "100%"}}>
                                 <Grid item pl={1} pr={3} xs={6} lg={6} sx={{width: "100%", display: "flex", flexDirection: "column", flexGrow: 1}}>
                                    <Box sx={{display: "inline-flex", alignItems: "baseline"}}>
                                       <FormControl sx={{mt: 2, width: "50%"}}>
                                          <InputLabel htmlFor="select-native">
                                             SEPARATOR
                                          </InputLabel>
                                          <Select
                                             multiline
                                             native
                                             value={delimiter}
                                             onChange={handleDelimiterChange}
                                             label="SEPARATOR"
                                             size="medium"
                                             inputProps={{
                                                id: "select-native",
                                             }}
                                          >
                                             {delimiterDropdownOptions.map((delimiter) => (
                                                <option key={delimiter} value={delimiter}>
                                                   {delimiter}
                                                </option>
                                             ))}
                                          </Select>
                                       </FormControl>
                                       {delimiter === Delimiter.CUSTOM.valueOf() && (

                                          <FormControl sx={{pl: 2, top: 5, width: "50%"}}>
                                             <TextField
                                                name="custom-delimiter-value"
                                                placeholder="Custom Separator"
                                                label="Custom Separator"
                                                variant="standard"
                                                value={customDelimiterValue}
                                                onChange={handleCustomDelimiterChange}
                                                inputProps={{maxLength: 1}}
                                             />
                                          </FormControl>
                                       )}
                                       {inputText && delimiter === Delimiter.DETECT_AUTOMATICALLY.valueOf() && (

                                          <Typography pl={2} variant="button" sx={{top: "1px", textTransform: "revert"}}>
                                             <i>{detectedText}</i>
                                          </Typography>
                                       )}
                                    </Box>
                                 </Grid>
                                 <Grid sx={{display: "flex", justifyContent: "flex-start", alignItems: "flex-start"}} item pl={1} xs={4} lg={4}>
                                    {
                                       errorText && chipData.length > 0 && (
                                          <Box sx={{display: "flex", justifyContent: "flex-start", alignItems: "flex-start"}}>
                                             <Icon color="error">error</Icon>
                                             <Typography sx={{paddingLeft: "4px", textTransform: "revert"}} variant="button">{errorText}</Typography>
                                          </Box>
                                       )
                                    }
                                    {
                                       pageLoadingState.isLoadingSlow() && (
                                          <Box sx={{display: "flex", justifyContent: "flex-start", alignItems: "flex-start"}}>
                                             <Icon color="warning">warning</Icon>
                                             <Typography sx={{paddingLeft: "4px", textTransform: "revert"}} variant="button">Loading...</Typography>
                                          </Box>
                                       )
                                    }
                                 </Grid>
                                 <Grid sx={{display: "flex", justifyContent: "flex-end", alignItems: "flex-start"}} item pr={1} xs={2} lg={2}>
                                    {
                                       chipData && chipData.length > 0 && (
                                          <Typography sx={{textTransform: "revert"}} variant="button">{chipData.length.toLocaleString()} {chipData.length === 1 ? "value" : "values"} {uniqueCount && `(${uniqueCount} unique)`}</Typography>
                                       )
                                    }
                                 </Grid>
                              </Grid>
                              <Box p={3} pt={0}>
                                 <Grid container pl={1} pr={1} justifyContent="right" alignItems="stretch" sx={{display: "flex-inline "}}>
                                    <QCancelButton
                                       onClickHandler={handleCancelClicked}
                                       iconName="cancel"
                                       disabled={false} />
                                    <QSaveButton onClickHandler={handleSaveClicked} label="Add Values" disabled={saveDisabled} />
                                 </Grid>
                              </Box>
                           </Card>
                        </Box>
                     </Box>
                  </Box>
               </Modal>

            )
         }
      </Box>
   );
}

export default FilterCriteriaPaster;
