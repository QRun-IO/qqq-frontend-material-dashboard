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

import {QFrontendStepMetaData} from "@qrunio/qqq-frontend-core/lib/model/metaData/QFrontendStepMetaData";
import {QInstance} from "@qrunio/qqq-frontend-core/lib/model/metaData/QInstance";
import {QProcessMetaData} from "@qrunio/qqq-frontend-core/lib/model/metaData/QProcessMetaData";
import {QTableMetaData} from "@qrunio/qqq-frontend-core/lib/model/metaData/QTableMetaData";
import {QRecord} from "@qrunio/qqq-frontend-core/lib/model/QRecord";
import {Button, FormControlLabel, ListItem, Radio, RadioGroup, Typography} from "@mui/material";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Icon from "@mui/material/Icon";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItemText from "@mui/material/ListItemText";
import MDTypography from "qqq/components/legacy/MDTypography";
import CustomWidthTooltip from "qqq/components/tooltips/CustomWidthTooltip";
import RecordGridWidget, {ChildRecordListData} from "qqq/components/widgets/misc/RecordGridWidget";
import {ProcessSummaryLine} from "qqq/models/processes/ProcessSummaryLine";
import {renderSectionOfFields} from "qqq/pages/records/view/RecordView";
import Client from "qqq/utils/qqq/Client";
import TableUtils from "qqq/utils/qqq/TableUtils";
import ValueUtils from "qqq/utils/qqq/ValueUtils";
import React, {useEffect, useState} from "react";

interface Props
{
   qInstance: QInstance,
   process: QProcessMetaData,
   table: QTableMetaData,
   processValues: any,
   step: QFrontendStepMetaData,
   previewRecords: QRecord[],
   formValues: any,
   doFullValidationRadioChangedHandler: any,
   loadingRecords?: boolean
}

////////////////////////////////////////////////////////////////////////////
// e.g., for bulk-load, where we want to show associations under a record //
// the processValue will have these data, to drive this screen.           //
////////////////////////////////////////////////////////////////////////////
interface AssociationPreview
{
   tableName: string;
   widgetName: string;
   associationName: string;
}

/*******************************************************************************
 ** This is the process validation/review component - where the user may be prompted
 ** to do a full validation or skip it.  It's the same screen that shows validation
 ** results when they are available.
 *******************************************************************************/
function ValidationReview({
   qInstance, process, table = null, processValues, step, previewRecords = [], formValues, doFullValidationRadioChangedHandler, loadingRecords
}: Props): JSX.Element
{
   const [previewRecordIndex, setPreviewRecordIndex] = useState(0);
   const [sourceTableMetaData, setSourceTableMetaData] = useState(null as QTableMetaData);
   const [previewTableMetaData, setPreviewTableMetaData] = useState(null as QTableMetaData);
   const [childTableMetaData, setChildTableMetaData] = useState({} as { [name: string]: QTableMetaData });

   const [associationPreviewsByWidgetName, setAssociationPreviewsByWidgetName] = useState({} as { [widgetName: string]: AssociationPreview });

   if (processValues.sourceTable && !sourceTableMetaData)
   {
      (async () =>
      {
         const sourceTableMetaData = await Client.getInstance().loadTableMetaData(processValues.sourceTable);
         setSourceTableMetaData(sourceTableMetaData);
      })();
   }

   ////////////////////////////////////////////////////////////////////////////////////////
   // load meta-data and set up associations-data structure, if so directed from backend //
   ////////////////////////////////////////////////////////////////////////////////////////
   useEffect(() =>
   {
      if (processValues.formatPreviewRecordUsingTableLayout && !previewTableMetaData)
      {
         (async () =>
         {
            const previewTableMetaData = await Client.getInstance().loadTableMetaData(processValues.formatPreviewRecordUsingTableLayout);
            setPreviewTableMetaData(previewTableMetaData);
         })();
      }

      try
      {
         const previewRecordAssociatedTableNames: string[] = processValues.previewRecordAssociatedTableNames ?? [];
         const previewRecordAssociatedWidgetNames: string[] = processValues.previewRecordAssociatedWidgetNames ?? [];
         const previewRecordAssociationNames: string[] = processValues.previewRecordAssociationNames ?? [];

         const associationPreviewsByWidgetName: { [widgetName: string]: AssociationPreview } = {};
         for (let i = 0; i < Math.min(previewRecordAssociatedTableNames.length, previewRecordAssociatedWidgetNames.length, previewRecordAssociationNames.length); i++)
         {
            const associationPreview = {tableName: previewRecordAssociatedTableNames[i], widgetName: previewRecordAssociatedWidgetNames[i], associationName: previewRecordAssociationNames[i]};
            associationPreviewsByWidgetName[associationPreview.widgetName] = associationPreview;
         }
         setAssociationPreviewsByWidgetName(associationPreviewsByWidgetName);

         if (Object.keys(associationPreviewsByWidgetName))
         {
            (async () =>
            {
               for (let key in associationPreviewsByWidgetName)
               {
                  const associationPreview = associationPreviewsByWidgetName[key];
                  childTableMetaData[associationPreview.tableName] = await Client.getInstance().loadTableMetaData(associationPreview.tableName);
                  setChildTableMetaData(Object.assign({}, childTableMetaData));
               }
            })();
         }
      }
      catch (e)
      {
         console.log(`Error setting up association previews: ${e}`);
      }
   }, []);


   /***************************************************************************
    **
    ***************************************************************************/
   const updatePreviewRecordIndex = (offset: number) =>
   {
      let newIndex = previewRecordIndex + offset;
      if (newIndex < 0)
      {
         newIndex = 0;
      }
      if (newIndex >= previewRecords.length - 1)
      {
         newIndex = previewRecords.length - 1;
      }

      setPreviewRecordIndex(newIndex);
   };


   /***************************************************************************
    **
    ***************************************************************************/
   const buildDoFullValidationRadioListItem = (value: "true" | "false", labelText: string, tooltipHTML: JSX.Element): JSX.Element =>
   {
      ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
      // split up the label into words - then we'll display the last word by itself with a non-breaking space, no-wrap-glued to the button. //
      ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
      const labelWords = labelText.split(" ");
      const lastWord = labelWords[labelWords.length - 1];
      labelWords.splice(labelWords.length - 1, 1);

      return (
         <ListItem sx={{pl: 2}}>
            <FormControlLabel
               value={value}
               control={<Radio />}
               label={(
                  <ListItemText primaryTypographyProps={{fontSize: 16, pt: 0.625}}>
                     {`${labelWords.join(" ")} `}
                     <span style={{whiteSpace: "nowrap"}}>
                        {/* eslint-disable-next-line react/jsx-one-expression-per-line */}
                        {lastWord}.&nbsp;<CustomWidthTooltip title={tooltipHTML}>
                           <IconButton sx={{py: 0}}><Icon fontSize="small">info_outlined</Icon></IconButton>
                           {/* eslint-disable-next-line react/jsx-closing-tag-location */}
                        </CustomWidthTooltip>
                     </span>
                  </ListItemText>
               )}
            />
         </ListItem>
      );
   };

   const preValidationList = (
      <List sx={{mt: 2}}>
         {
            processValues?.recordCount !== undefined && sourceTableMetaData && (
               <ListItem sx={{my: 2}}>
                  <ListItemText primaryTypographyProps={{fontSize: 16}}>
                     {`Input: ${ValueUtils.getFormattedNumber(processValues.recordCount)} ${sourceTableMetaData?.label} record${processValues.recordCount === 1 ? "" : "s"}.`}
                  </ListItemText>
               </ListItem>
            )
         }
         {
            processValues?.supportsFullValidation && formValues && formValues.doFullValidation !== undefined && (
               <>
                  <ListItem sx={{mb: 1, mt: 6}}>
                     <ListItemText primaryTypographyProps={{fontSize: 16}}>How would you like to proceed?</ListItemText>
                  </ListItem>
                  <List className="doFullValidationRadios">
                     <RadioGroup name="doFullValidation" value={formValues.doFullValidation} onChange={doFullValidationRadioChangedHandler}>
                        {buildDoFullValidationRadioListItem(
                           "true",
                           "Perform Validation on all records before processing", (
                              <div>
                                 If you choose this option, a Validation step will run on all of the input records.
                                 You will then be told how many can process successfully, and how many have issues.
                                 <br />
                                 <br />
                                 Running this validation may take several minutes, depending on the complexity of the work, and the number of records.
                                 <br />
                                 <br />
                                 Choose this option if you want more information about what will happen, and you are willing to wait for that information.
                              </div>
                           ),
                        )}

                        {buildDoFullValidationRadioListItem(
                           "false",
                           "Skip Validation.  Submit the records for immediate processing", (
                              <div>
                                 If you choose this option, the input records will immediately be processed.
                                 You will be told how many records were successfully processed, and which ones had issues after the processing is completed.
                                 <br />
                                 <br />
                                 Choose this option if you feel that you do not need this information, or are not willing to wait for it.
                              </div>
                           ),
                        )}
                     </RadioGroup>
                  </List>
               </>
            )
         }
      </List>
   );

   const postValidationList = (
      <List sx={{mt: 2}}>
         {
            processValues?.recordCount !== undefined && sourceTableMetaData && (
               <ListItem sx={{my: 2}}>
                  <ListItemText primaryTypographyProps={{fontSize: 16}}>
                     Validation complete on
                     {` ${ValueUtils.getFormattedNumber(processValues.recordCount)} ${sourceTableMetaData?.label} ${processValues.recordCount === 1 ? "record." : "records."}`}
                  </ListItemText>
               </ListItem>
            )
         }
         <List>
            {
               processValues.validationSummary && processValues.validationSummary.map((processSummaryLine: ProcessSummaryLine, i: number) => (new ProcessSummaryLine(processSummaryLine).getProcessSummaryListItem(i, sourceTableMetaData, qInstance)))
            }
         </List>
      </List>
   );


   const recordPreviewWidget = step.recordListFields && (
      <Box border="1px solid rgb(70%, 70%, 70%)" borderRadius="10px" p={2} mt={2}>
         <Box mx={2} mt={-5} p={1} sx={{width: "fit-content", borderColor: "rgb(70%, 70%, 70%)", borderWidth: "2px", borderStyle: "solid", borderRadius: ".25em", backgroundColor: "#FFFFFF"}} width="initial" color="white">
            <Typography>Preview</Typography>
         </Box>
         <Box p={3} pb={0}>
            <MDTypography color="body" variant="body2" component="div" mb={2}>
               <Box display="flex">
                  {
                     loadingRecords ? <i>Loading...</i> : <>
                        {
                           processValues?.previewMessage && previewRecords && previewRecords.length > 0 ? (
                              <>
                                 <i>{processValues?.previewMessage}</i>
                                 <CustomWidthTooltip
                                    title={(
                                       <div>
                                          Note that the number of preview records available may be fewer than the total number of records being processed.
                                       </div>
                                    )}
                                 >
                                    <IconButton sx={{py: 0}}><Icon fontSize="small">info_outlined</Icon></IconButton>
                                 </CustomWidthTooltip>
                              </>
                           ) : (
                              <>
                                 <i>No record previews are available at this time.</i>
                                 <CustomWidthTooltip
                                    title={(
                                       <div>
                                          {
                                             processValues.validationSummary ? (
                                                <>
                                                   It appears as though this process does not contain any valid records.
                                                </>
                                             ) : (
                                                <>
                                                   If you choose to Perform Validation, and there are any valid records, then you will see a preview here.
                                                </>
                                             )
                                          }
                                       </div>
                                    )}
                                 >
                                    <IconButton sx={{py: 0}}><Icon fontSize="small">info_outlined</Icon></IconButton>
                                 </CustomWidthTooltip>
                              </>
                           )
                        }
                     </>
                  }
               </Box>
            </MDTypography>
            <MDTypography color="body" variant="body2" component="div">
               <Box sx={{maxHeight: "calc(100vh - 640px)", overflow: "auto", minHeight: "300px", marginRight: "-40px"}}>
                  <Box sx={{paddingRight: "40px"}}>
                     {
                        previewRecords && !processValues.formatPreviewRecordUsingTableLayout && previewRecords[previewRecordIndex] && step.recordListFields.map((field) => (
                           <Box key={field.name} style={{marginBottom: "12px"}}>
                              <b>{`${field.label}:`}</b>
                              {" "}
                              &nbsp;
                              {" "}
                              {ValueUtils.getDisplayValue(field, previewRecords[previewRecordIndex], "view")}
                           </Box>
                        ))
                     }
                     {
                        previewRecords && processValues.formatPreviewRecordUsingTableLayout && previewRecords[previewRecordIndex] &&
                        <PreviewRecordUsingTableLayout
                           index={previewRecordIndex}
                           record={previewRecords[previewRecordIndex]}
                           tableMetaData={previewTableMetaData}
                           qInstance={qInstance}
                           associationPreviewsByWidgetName={associationPreviewsByWidgetName}
                           childTableMetaData={childTableMetaData}
                        />
                     }
                  </Box>
               </Box>
               {
                  previewRecords && previewRecords.length > 0 && (
                     <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Button startIcon={<Icon>navigate_before</Icon>} onClick={() => updatePreviewRecordIndex(-1)} disabled={previewRecordIndex <= 0}>Previous</Button>
                        <span>
                           {`Preview ${previewRecordIndex + 1} of ${previewRecords.length}`}
                        </span>
                        <Button endIcon={<Icon>navigate_next</Icon>} onClick={() => updatePreviewRecordIndex(1)} disabled={previewRecordIndex >= previewRecords.length - 1}>Next</Button>
                     </Box>
                  )
               }
            </MDTypography>
         </Box>
      </Box>
   );

   return (
      <Box m={{xs: 0, md: 3}} mt={"3rem!important"}>
         <Grid container spacing={2}>
            <Grid item xs={12} lg={6}>
               <MDTypography color="body" variant="button">
                  {processValues.validationSummary ? postValidationList : preValidationList}
               </MDTypography>
            </Grid>
            <Grid item xs={12} lg={6} mt={3}>
               {recordPreviewWidget}
            </Grid>
         </Grid>
      </Box>
   );
}



interface PreviewRecordUsingTableLayoutProps
{
   index: number
   record: QRecord,
   tableMetaData: QTableMetaData,
   qInstance: QInstance,
   associationPreviewsByWidgetName: { [widgetName: string]: AssociationPreview },
   childTableMetaData: { [name: string]: QTableMetaData },
}

function PreviewRecordUsingTableLayout({record, tableMetaData, qInstance, associationPreviewsByWidgetName, childTableMetaData, index}: PreviewRecordUsingTableLayoutProps): JSX.Element
{
   if (!tableMetaData)
   {
      return (<i>Loading...</i>);
   }

   const renderedSections: JSX.Element[] = [];
   const tableSections = TableUtils.getSectionsForRecordSidebar(tableMetaData);

   for (let i = 0; i < tableSections.length; i++)
   {
      const section = tableSections[i];
      if (section.isHidden)
      {
         continue;
      }

      if (section.fieldNames)
      {
         renderedSections.push(<Box mb="1rem">
            <Box><h4>{section.label}</h4></Box>
            <Box ml="1rem">
               {renderSectionOfFields(section.name, section.fieldNames, tableMetaData, false, record, undefined, {label: {fontWeight: "500"}})}
            </Box>
         </Box>);
      }
      else if (section.widgetName)
      {
         const widget = qInstance.widgets.get(section.widgetName);
         if (widget)
         {
            let data: ChildRecordListData = null;
            if (associationPreviewsByWidgetName[section.widgetName])
            {
               const associationPreview = associationPreviewsByWidgetName[section.widgetName];
               const associationRecords = record.associatedRecords?.get(associationPreview.associationName) ?? [];
               data = {
                  canAddChildRecord: false,
                  childTableMetaData: childTableMetaData[associationPreview.tableName],
                  defaultValuesForNewChildRecords: {},
                  disabledFieldsForNewChildRecords: {},
                  queryOutput: {records: associationRecords},
                  totalRows: associationRecords.length,
                  tablePath: "",
                  title: "",
                  viewAllLink: "",
               };

               renderedSections.push(<Box mb="1rem">
                  {
                     data && <Box>
                        <Box mb="0.5rem"><h4>{section.label}</h4></Box>
                        <Box pl="1rem">
                           <RecordGridWidget key={index} data={data} widgetMetaData={widget} disableRowClick gridOnly={true} gridDensity={"compact"} />
                        </Box>
                     </Box>
                  }
               </Box>);
            }
         }
      }
   }

   return <>{renderedSections}</>;
}


export default ValidationReview;
