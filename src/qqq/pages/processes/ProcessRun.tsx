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

import {Alert, Button, CircularProgress, Icon, TablePagination} from "@mui/material";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import Stepper from "@mui/material/Stepper";
import {Theme} from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import {DataGridPro, GridColDef} from "@mui/x-data-grid-pro";
import {QException} from "@qrunio/qqq-frontend-core/lib/exceptions/QException";
import {QComponentType} from "@qrunio/qqq-frontend-core/lib/model/metaData/QComponentType";
import {QFieldMetaData} from "@qrunio/qqq-frontend-core/lib/model/metaData/QFieldMetaData";
import {QFrontendComponent} from "@qrunio/qqq-frontend-core/lib/model/metaData/QFrontendComponent";
import {QFrontendStepMetaData} from "@qrunio/qqq-frontend-core/lib/model/metaData/QFrontendStepMetaData";
import {QInstance} from "@qrunio/qqq-frontend-core/lib/model/metaData/QInstance";
import {QProcessMetaData} from "@qrunio/qqq-frontend-core/lib/model/metaData/QProcessMetaData";
import {QTableMetaData} from "@qrunio/qqq-frontend-core/lib/model/metaData/QTableMetaData";
import {QTableSection} from "@qrunio/qqq-frontend-core/lib/model/metaData/QTableSection";
import {QWidgetMetaData} from "@qrunio/qqq-frontend-core/lib/model/metaData/QWidgetMetaData";
import {QJobComplete} from "@qrunio/qqq-frontend-core/lib/model/processes/QJobComplete";
import {QJobError} from "@qrunio/qqq-frontend-core/lib/model/processes/QJobError";
import {QJobRunning} from "@qrunio/qqq-frontend-core/lib/model/processes/QJobRunning";
import {QJobStarted} from "@qrunio/qqq-frontend-core/lib/model/processes/QJobStarted";
import {QPossibleValue} from "@qrunio/qqq-frontend-core/lib/model/QPossibleValue";
import {QRecord} from "@qrunio/qqq-frontend-core/lib/model/QRecord";
import {QQueryFilter} from "@qrunio/qqq-frontend-core/lib/model/query/QQueryFilter";
import FormData from "form-data";
import {Form, Formik} from "formik";
import parse from "html-react-parser";
import QContext from "QContext";
import colors from "qqq/assets/theme/base/colors";
import linearGradient from "qqq/assets/theme/functions/linearGradient";
import {preferredColorNameInfoOrPrimary} from "qqq/assets/theme/functions/preferInfoColorToPrimaryColor";
import {QAlternateButton, QCancelButton, QSubmitButton} from "qqq/components/buttons/DefaultButtons";
import QDynamicForm from "qqq/components/forms/DynamicForm";
import DynamicFormUtils from "qqq/components/forms/DynamicFormUtils";
import MDProgress from "qqq/components/legacy/MDProgress";
import MDTypography from "qqq/components/legacy/MDTypography";
import HelpContent, {hasHelpContent} from "qqq/components/misc/HelpContent";
import QRecordSidebar from "qqq/components/misc/RecordSidebar";
import BulkLoadFileMappingForm from "qqq/components/processes/BulkLoadFileMappingForm";
import BulkLoadProfileForm from "qqq/components/processes/BulkLoadProfileForm";
import BulkLoadValueMappingForm from "qqq/components/processes/BulkLoadValueMappingForm";
import {GoogleDriveFolderPickerWrapper} from "qqq/components/processes/GoogleDriveFolderPickerWrapper";
import ProcessSummaryResults from "qqq/components/processes/ProcessSummaryResults";
import ProcessViewForm from "qqq/components/processes/ProcessViewForm";
import ValidationReview from "qqq/components/processes/ValidationReview";
import {BlockData} from "qqq/components/widgets/blocks/BlockModels";
import CompositeWidget, {CompositeData} from "qqq/components/widgets/CompositeWidget";
import DashboardWidgets from "qqq/components/widgets/DashboardWidgets";
import {ChildRecordListData} from "qqq/components/widgets/misc/RecordGridWidget";
import BaseLayout from "qqq/layouts/BaseLayout";
import ProcessWidgetBlockUtils from "qqq/pages/processes/ProcessWidgetBlockUtils";
import {TABLE_VARIANT_LOCAL_STORAGE_KEY_ROOT} from "qqq/pages/records/query/RecordQuery";
import {AnalyticsModel} from "qqq/utils/GoogleAnalyticsUtils";
import Client from "qqq/utils/qqq/Client";
import TableUtils from "qqq/utils/qqq/TableUtils";
import ValueUtils from "qqq/utils/qqq/ValueUtils";
import React, {useContext, useEffect, useRef, useState} from "react";
import {useLocation, useNavigate, useParams} from "react-router-dom";
import * as Yup from "yup";

interface Props
{
   process?: QProcessMetaData;
   table?: QTableMetaData;
   defaultProcessValues?: any;
   isModal?: boolean;
   isWidget?: boolean;
   isReport?: boolean;
   recordIds?: string[] | QQueryFilter;
   closeModalHandler?: (event: object, reason: string) => void;
   forceReInit?: number;
   overrideLabel?: string;
}

const INITIAL_RETRY_MILLIS = 1_500;
const RETRY_MAX_MILLIS = 12_000;
const BACKOFF_AMOUNT = 1.5;

const qController = Client.getInstance();

////////////////////////////////////////////////////////////////////////////////
// define some functions that we can make reference to, which we'll overwrite //
// with functions from formik, once we're inside formik.                      //
////////////////////////////////////////////////////////////////////////////////
let formikSetFieldValueFunction = (field: string, value: any, shouldValidate?: boolean): void =>
{
};

let formikSetTouched = ({}: any, touched: boolean): void =>
{
};

const cachedPossibleValueLabels: { [fieldName: string]: { [id: string | number]: string } } = {};

export interface SubFormPreSubmitCallbackResultType
{
   maySubmit: boolean;
   values: { [name: string]: any };
}

type SubFormPreSubmitCallback = () => SubFormPreSubmitCallbackResultType;
type SubFormPreSubmitCallbackWithName = { name: string, callback: SubFormPreSubmitCallback }

function ProcessRun({process, table, defaultProcessValues, isModal, isWidget, isReport, recordIds, closeModalHandler, forceReInit, overrideLabel}: Props): JSX.Element
{
   const processNameParam = useParams().processName;
   const processName = process === null ? processNameParam : process.name;
   let tableVariantLocalStorageKey: string | null = null;
   if (table)
   {
      tableVariantLocalStorageKey = `${TABLE_VARIANT_LOCAL_STORAGE_KEY_ROOT}.${table.name}`;
   }

   ///////////////////
   // process state //
   ///////////////////
   const [processUUID, setProcessUUID] = useState(null as string);
   const [retryMillis, setRetryMillis] = useState(INITIAL_RETRY_MILLIS);
   const [jobUUID, setJobUUID] = useState(null as string);
   const [qJobRunning, setQJobRunning] = useState(null as QJobRunning);
   const [qJobRunningDate, setQJobRunningDate] = useState(null as Date);
   const [activeStepIndex, setActiveStepIndex] = useState(0);
   const [activeStep, setActiveStep] = useState(null as QFrontendStepMetaData);
   const [activeStepLabel, setActiveStepLabel] = useState(null as string);
   const [newStep, setNewStep] = useState(null);
   const [stepInstanceCounter, setStepInstanceCounter] = useState(0);
   const [steps, setSteps] = useState([] as QFrontendStepMetaData[]);
   const [backStepName, setBackStepName] = useState(null as string);
   const [needInitialLoad, setNeedInitialLoad] = useState(true);
   const [lastForcedReInit, setLastForcedReInit] = useState(null as number);
   const [processMetaData, setProcessMetaData] = useState(null);
   const [tableMetaData, setTableMetaData] = useState(table);
   const [tableSections, setTableSections] = useState(null as QTableSection[]);
   const [qInstance, setQInstance] = useState(null as QInstance);
   const [processValues, setProcessValues] = useState({} as any);
   const [processError, _setProcessError] = useState(null as string);
   const [isUserFacingError, setIsUserFacingError] = useState(false);
   const [needToCheckJobStatus, setNeedToCheckJobStatus] = useState(false);
   const [lastProcessResponse, setLastProcessResponse] = useState(
      null as QJobStarted | QJobComplete | QJobError | QJobRunning,
   );
   const [showErrorDetail, setShowErrorDetail] = useState(false);
   const [showFullHelpText, setShowFullHelpText] = useState(false);
   const [previouslySeenUpdatedFieldMetaDataMap, setPreviouslySeenUpdatedFieldMetaDataMap] = useState(new Map<string, QFieldMetaData>);

   const [renderedWidgets, setRenderedWidgets] = useState({} as { [step: string]: { [widgetName: string]: any } });
   const [controlCallbacks, setControlCallbacks] = useState({} as { [name: string]: () => void });
   const [subFormPreSubmitCallbacks, setSubFormPreSubmitCallbacks] = useState([] as SubFormPreSubmitCallbackWithName[]);

   const {pageHeader, recordAnalytics, setPageHeader, helpHelpActive} = useContext(QContext);

   //////////////////////////////////////////////////////////////////////////////////////////////////////////////
   // for setting the processError state - call this function, which will also set the isUserFacingError state //
   //////////////////////////////////////////////////////////////////////////////////////////////////////////////
   const setProcessError = (message: string, isUserFacing: boolean = false) =>
   {
      _setProcessError(message);
      setIsUserFacingError(isUserFacing);
   };

   /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
   // the validation screen - it can change whether next is actually the final step or not... so, use this state field to track that. //
   /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
   const [overrideOnLastStep, setOverrideOnLastStep] = useState(null as boolean);

   /////////////////////////////////////////////////////////////////////////////////////
   // determine if we're on the last-step or not (e.g., to decide "Submit" vs "Next") //
   /////////////////////////////////////////////////////////////////////////////////////
   let onLastStep = false;
   if (processMetaData?.stepFlow == "LINEAR" && activeStepIndex === steps.length - 2)
   {
      onLastStep = true;
   }

   ////////////////////////////////////////////
   // determine if any 'next' button appears //
   ////////////////////////////////////////////
   let noMoreSteps = false;
   if (processMetaData?.stepFlow == "LINEAR" && activeStepIndex === steps.length - 1)
   {
      noMoreSteps = true;
   }
   if (processValues["noMoreSteps"])
   {
      //////////////////////////////////////////////////////////////////
      // this, to allow a non-linear process to request this behavior //
      //////////////////////////////////////////////////////////////////
      noMoreSteps = true;
   }

   ////////////////
   // form state //
   ////////////////
   const [formId, setFormId] = useState("");
   const [formFields, setFormFields] = useState({});
   const [initialValues, setInitialValues] = useState({});
   const [validationScheme, setValidationScheme] = useState(null);
   const [validationFunction, setValidationFunction] = useState(null);
   const [formError, setFormError] = useState(null as string);

   ///////////////////////
   // record list state //
   ///////////////////////
   const [needRecords, setNeedRecords] = useState(false);
   const [loadingRecords, setLoadingRecords] = useState(false);
   const [recordConfig, setRecordConfig] = useState({} as any);
   const [pageNumber, setPageNumber] = useState(0);
   const [rowsPerPage, setRowsPerPage] = useState(10);
   const [records, setRecords] = useState([] as any);
   const [childRecordData, setChildRecordData] = useState(null as ChildRecordListData);

   //////////////////////////////
   // state for bulk edit form //
   //////////////////////////////
   const [disabledBulkEditFields, setDisabledBulkEditFields] = useState({} as any);

   const navigate = useNavigate();
   const location = useLocation();

   const bulkLoadFileMappingFormRef = useRef();
   const bulkLoadValueMappingFormRef = useRef();
   const bulkLoadProfileFormRef = useRef();
   const [bulkLoadValueMappingFormFields, setBulkLoadValueMappingFormFields] = useState([] as any[]);

   const doesStepHaveComponent = (step: QFrontendStepMetaData, type: QComponentType): boolean =>
   {
      if (step.components)
      {
         for (let i = 0; i < step.components.length; i++)
         {
            if (step.components[i].type === type)
            {
               return (true);
            }
         }
      }
      return (false);
   };

   // @ts-ignore
   const defaultLabelDisplayedRows = ({from, to, count}) => `${from.toLocaleString()}–${to.toLocaleString()} of ${count !== -1 ? count.toLocaleString() : `more than ${to.toLocaleString()}`}`;

   // @ts-ignore
   // eslint-disable-next-line react/no-unstable-nested-components
   function CustomPagination()
   {
      return (
         <TablePagination
            component="div"
            count={recordConfig.totalRecords}
            page={pageNumber}
            rowsPerPageOptions={[10, 25, 50]}
            rowsPerPage={rowsPerPage}
            onPageChange={(event, value) => recordConfig.handlePageChange(value)}
            onRowsPerPageChange={(event) => recordConfig.handleRowsPerPageChange(Number(event.target.value))}
            labelDisplayedRows={defaultLabelDisplayedRows}
         />
      );
   }

   //////////////////////////////////////////////////////////////
   // event handler for the bulk-edit field-enabled checkboxes //
   //////////////////////////////////////////////////////////////
   const bulkEditSwitchChanged = (name: string, switchValue: boolean) =>
   {
      const newDisabledBulkEditFields = JSON.parse(JSON.stringify(disabledBulkEditFields));
      newDisabledBulkEditFields[name] = !switchValue;
      setDisabledBulkEditFields(newDisabledBulkEditFields);
   };

   const toggleShowErrorDetail = () =>
   {
      setShowErrorDetail(!showErrorDetail);
   };

   const toggleShowFullHelpText = () =>
   {
      setShowFullHelpText(!showFullHelpText);
   };

   const download = (processValues: { [key: string]: string }) =>
   {
      let url;
      let fileName = processValues.downloadFileName;
      if (processValues.serverFilePath)
      {
         url = `/download/${encodeURIComponent(processValues.downloadFileName)}?filePath=${encodeURIComponent(processValues.serverFilePath)}`;
      }
      else if (processValues.storageTableName && processValues.storageReference)
      {
         url = `/download/${encodeURIComponent(processValues.downloadFileName)}?storageTableName=${encodeURIComponent(processValues.storageTableName)}&storageReference=${encodeURIComponent(processValues.storageReference)}`;
      }

      /////////////////////////////////////////////////////////////////////////////////////////////
      // todo - this could be simplified, i think?                                               //
      // it was originally built like this when we had to submit full access token to backend... //
      /////////////////////////////////////////////////////////////////////////////////////////////
      let xhr = new XMLHttpRequest();
      xhr.open("POST", url);
      xhr.responseType = "blob";
      let formData = new FormData();

      // @ts-ignore
      xhr.send(formData);

      xhr.onload = function (e)
      {
         if (this.status == 200)
         {
            const blob = new Blob([this.response]);

            const a = document.createElement("a");
            document.body.appendChild(a);

            const url = window.URL.createObjectURL(blob);
            a.href = url;
            a.download = fileName;
            a.click();
            window.URL.revokeObjectURL(url);
         }
         else
         {
            setProcessError("Error downloading file", true);
         }
      };
   };


   /*******************************************************************************
    **
    *******************************************************************************/
   function renderWidget(widgetName: string)
   {
      const widgetMetaData = qInstance.widgets.get(widgetName);
      if (!widgetMetaData)
      {
         return (<Alert color="error">Unrecognized widget name: {widgetName}</Alert>);
      }

      if (!renderedWidgets[activeStep.name])
      {
         renderedWidgets[activeStep.name] = {};
         setRenderedWidgets(renderedWidgets);
      }

      let isChildRecordWidget = widgetMetaData.type == "childRecordList";
      if (!isChildRecordWidget && renderedWidgets[activeStep.name][widgetName])
      {
         return renderedWidgets[activeStep.name][widgetName];
      }

      const queryStringParts: string[] = [];
      queryStringParts.push(`processUUID=${encodeURIComponent(processUUID)}`);
      for (let name in processValues)
      {
         queryStringParts.push(`${name}=${encodeURIComponent(processValues[name])}`);
      }

      let initialWidgetDataList = null;
      if (processValues[widgetName])
      {
         processValues[widgetName].hasPermission = true;
         initialWidgetDataList = [processValues[widgetName]];
      }

      let actionCallback = blockWidgetActionCallback;
      if (isChildRecordWidget)
      {
         actionCallback = childRecordListWidgetActionCallBack;

         if (childRecordData)
         {
            initialWidgetDataList = [childRecordData];
         }
      }
      else if(widgetMetaData.type == "rowBuilder")
      {
         actionCallback = valueProducingWidgetCallback;
      }

      const renderedWidget = (<Box m={-2}>
         <DashboardWidgets widgetMetaDataList={[widgetMetaData]} omitWrappingGridContainer={true} childUrlParams={queryStringParts.join("&")} initialWidgetDataList={initialWidgetDataList} values={processValues} actionCallback={actionCallback} />
      </Box>);
      renderedWidgets[activeStep.name][widgetName] = renderedWidget;
      return renderedWidget;
   }


   /***************************************************************************
    **
    ***************************************************************************/
   function handleControlCode(controlCode: string)
   {
      const split = controlCode.split(":", 2);
      let controlCallbackName: string;
      let controlCallbackValue: any;
      if (split.length == 2)
      {
         if (split[0] == "showModal")
         {
            processValues[split[1]] = true;
            controlCallbackName = split[1];
            controlCallbackValue = true;
         }
         else if (split[0] == "hideModal")
         {
            processValues[split[1]] = false;
            controlCallbackName = split[1];
            controlCallbackValue = false;
         }
         else if (split[0] == "toggleModal")
         {
            const currentValue = processValues[split[1]];
            processValues[split[1]] = !!!currentValue;
            controlCallbackName = split[1];
            controlCallbackValue = processValues[split[1]];
         }
         else
         {
            console.log(`Unexpected part[0] (before colon) in controlCode: [${controlCode}]`);
         }
      }
      else
      {
         console.log(`Expected controlCode to have 2 colon-delimited parts, but was: [${controlCode}]`);
      }

      if (controlCallbackName && controlCallbacks[controlCallbackName])
      {
         // @ts-ignore ... args are hard
         controlCallbacks[controlCallbackName](controlCallbackValue);
      }
   }


   /***************************************************************************
    ** callback used by child list widget
    ***************************************************************************/
   function childRecordListWidgetActionCallBack(data: any): boolean
   {
      console.log(`in childRecordListWidgetActionCallBack: ${JSON.stringify(data)}`);
      setChildRecordData(data as ChildRecordListData);
      return (true);
   }


   /***************************************************************************
    ** callback used by widgets that can add to process values
    ***************************************************************************/
   function valueProducingWidgetCallback(data: any): boolean
   {
      for(let fieldName in data ?? {})
      {
         processValues[fieldName] = data[fieldName];
         formikSetFieldValueFunction(fieldName, data[fieldName]);
      }

      return (true);
   }


   /***************************************************************************
    ** callback used by widget blocks, e.g., for input-text-enter-on-submit,
    ** and action buttons.
    ***************************************************************************/
   function blockWidgetActionCallback(blockData: BlockData, eventValues?: { [name: string]: any }): boolean
   {
      console.log(`in blockWidgetActionCallback, called by block: ${JSON.stringify(blockData)}`);

      if (eventValues?.registerControlCallbackName && eventValues?.registerControlCallbackFunction)
      {
         controlCallbacks[eventValues.registerControlCallbackName] = eventValues.registerControlCallbackFunction;
         setControlCallbacks(controlCallbacks);
         return (true);
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////
      // we don't validate these on the android frontend, and it seems fine - just let the app validate it? //
      ////////////////////////////////////////////////////////////////////////////////////////////////////////
      // ///////////////////////////////////////////////////////////////////////////////
      // // if the eventValues included an actionCode - validate it before proceeding //
      // ///////////////////////////////////////////////////////////////////////////////
      // if (eventValues && eventValues.actionCode && !ProcessWidgetBlockUtils.isActionCodeValid(eventValues.actionCode, activeStep, processValues))
      // {
      //    setFormError("Unrecognized action code: " + eventValues.actionCode);
      //    if (eventValues["_fieldToClearIfError"])
      //    {
      //       /////////////////////////////////////////////////////////////////////////////
      //       // if the eventValues included a _fieldToClearIfError, well, then do that. //
      //       /////////////////////////////////////////////////////////////////////////////
      //       formikSetFieldValueFunction(eventValues["_fieldToClearIfError"], "", false);
      //    }
      //    return (false);
      // }

      let doSubmit = false;
      if (blockData?.blockTypeName == "BUTTON" && eventValues?.actionCode)
      {
         doSubmit = true;
      }
      else if (blockData?.blockTypeName == "BUTTON" && eventValues?.controlCode)
      {
         handleControlCode(eventValues.controlCode);
         doSubmit = false;
      }
      else if (blockData?.blockTypeName == "INPUT_FIELD")
      {
         ///////////////////////////////////////////////////////////////////////////////////////////////
         // if action callback was fired from an input field, assume that means we're good to submit. //
         ///////////////////////////////////////////////////////////////////////////////////////////////
         doSubmit = true;
      }

      //////////////////
      // ok - submit! //
      //////////////////
      if (doSubmit)
      {
         handleFormSubmit(eventValues);
         return (true);
      }
   }


   /***************************************************************************
    ** in a memoized-fashion (YUNO useMemo?), render a component that is an
    ** adHoc widget (e.g., composite)
    ***************************************************************************/
   function renderAdHocWidget(componentValues: any, componentIndex: number)
   {
      const key = activeStep.name + "-" + stepInstanceCounter + "-" + componentIndex;
      if (renderedWidgets[key])
      {
         return renderedWidgets[key];
      }

      const widgetMetaData = new QWidgetMetaData({name: "adHoc"});
      const compositeWidgetData = JSON.parse(JSON.stringify(componentValues)) as CompositeData;
      compositeWidgetData.styleOverrides = {py: "0.5rem", display: "flex", flexDirection: "column", gap: "0.5rem"};

      ProcessWidgetBlockUtils.dynamicEvaluationOfCompositeWidgetData(compositeWidgetData, processValues);

      renderedWidgets[key] = <Box key={key} pt={2}>
         <CompositeWidget widgetMetaData={widgetMetaData} data={compositeWidgetData} actionCallback={blockWidgetActionCallback} values={processValues} />
      </Box>;

      setRenderedWidgets(renderedWidgets);

      return (renderedWidgets[key]);
   }


   ////////////////////////////////////////////////////
   // generate the main form body content for a step //
   ////////////////////////////////////////////////////
   const getDynamicStepContent = (
      stepIndex: number,
      step: any,
      formData: any,
      processError: string,
      processValues: any,
      recordConfig: any,
      setFieldValue: any,
   ): JSX.Element =>
   {
      if (processError)
      {
         return (
            <>
               <MDTypography color="error" variant="h3" component="div">
                  Error
               </MDTypography>
               <MDTypography color="body" variant="button">
                  An error occurred while running the {isReport ? "report" : "process"}:
                  {" "}
                  {overrideLabel ?? process.label}
                  {
                     isUserFacingError ? (
                        <Box mt={1}>
                           <b>{processError}</b>
                        </Box>
                     ) : (
                        <Box mt={3} display="flex" justifyContent="center">
                           <Box display="flex" flexDirection="column" alignItems="center">
                              <Button onClick={toggleShowErrorDetail} startIcon={<Icon>{showErrorDetail ? "expand_less" : "expand_more"}</Icon>}>
                                 {showErrorDetail ? "Hide " : "Show "}
                                 detailed error message
                              </Button>
                              <Box mt={1} style={{display: showErrorDetail ? "block" : "none"}}>
                                 {processError}
                              </Box>
                           </Box>
                        </Box>
                     )
                  }
               </MDTypography>
               <Box component="div" py={3}>
                  <Grid container justifyContent="flex-end" spacing={3}>
                     {isModal ? <QCancelButton onClickHandler={() => handleCancelClicked(true)} disabled={false} label="Close" />
                        : !isWidget && <QCancelButton onClickHandler={() => handleCancelClicked(true)} disabled={false} />
                     }
                  </Grid>
               </Box>
            </>
         );
      }

      if (qJobRunning || step === null)
      {
         return (
            <Grid m={3} mt={9} container maxWidth="calc(100% - 3rem)">
               <Grid item xs={0} lg={3} />
               <Grid item xs={12} lg={6}>
                  <Card>
                     <Box p={3}>
                        <MDTypography variant="h5" component="div">
                           Working
                        </MDTypography>
                        <Grid container>
                           <Grid item padding={2}>
                              <CircularProgress color="info" />
                           </Grid>
                           <Grid item padding={1}>
                              <MDTypography color="body" variant="button">
                                 {qJobRunning?.message}
                                 <br />
                                 {qJobRunning?.current && qJobRunning?.total && (
                                    <>
                                       <div>{`${qJobRunning.current.toLocaleString()} of ${qJobRunning.total.toLocaleString()}`}</div>
                                       <Box width="20rem">
                                          <MDProgress variant="gradient" value={100 * (qJobRunning.current / qJobRunning.total)} color="success" />

                                       </Box>
                                    </>
                                 )}
                                 {
                                    qJobRunningDate && (<i>{`Updated at ${qJobRunningDate?.toLocaleTimeString()}`}</i>)
                                 }
                              </MDTypography>
                           </Grid>
                        </Grid>
                     </Box>
                  </Card>
               </Grid>
            </Grid>
         );
      }

      const {formFields, values, errors, touched} = formData;
      let localTableSections = tableSections;
      if (localTableSections == null)
      {
         //////////////////////////////////////////////////////////////////////////////////////////////////////
         // if the table sections (ones that actually have fields to edit) haven't been built yet, do so now //
         //////////////////////////////////////////////////////////////////////////////////////////////////////
         localTableSections = tableMetaData ? TableUtils.getSectionsForRecordSidebar(tableMetaData, Object.keys(formFields)) : null;
         setTableSections(localTableSections);
      }

      ////////////////////////////////////////////////////////////////////////////////////
      // if there are any fields that are possible values, they need to know what their //
      // initial value to display should be.                                            //
      // this **needs to be** the actual PVS LABEL - not the raw value (e.g, PVS ID)    //
      // but our first use case, they're the same, so... this needs fixed.              //
      // they also need to know the 'otherValues' in this process - e.g., for filtering //
      ////////////////////////////////////////////////////////////////////////////////////
      if (formFields && processValues)
      {
         Object.keys(formFields).forEach((key) =>
         {
            if (formFields[key].possibleValueProps)
            {
               if (processValues[key])
               {
                  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                  // if we have a cached possible-value label for this field name (key), then set it as the PV's initialDisplayValue //
                  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                  if (cachedPossibleValueLabels[key] && cachedPossibleValueLabels[key][processValues[key]])
                  {
                     formFields[key].possibleValueProps.initialDisplayValue = cachedPossibleValueLabels[key][processValues[key]];
                  }
                  else
                  {
                     ////////////////////////////////////////////////////////////////////////////
                     // else (and i don't think this should happen?) at least set something... //
                     ////////////////////////////////////////////////////////////////////////////
                     formFields[key].possibleValueProps.initialDisplayValue = processValues[key];
                  }
               }

               formFields[key].possibleValueProps.otherValues = formFields[key].possibleValueProps.otherValues ?? new Map<string, any>();
               Object.keys(formFields).forEach((otherKey) =>
               {
                  formFields[key].possibleValueProps.otherValues.set(otherKey, processValues[otherKey]);
               });
            }
         });
      }

      ////////////////////////////////////////////////////////////////////////////////
      // if we have a bulk-load file mapping form, register its pre-submit callback //
      ////////////////////////////////////////////////////////////////////////////////
      if (doesStepHaveComponent(activeStep, QComponentType.BULK_LOAD_FILE_MAPPING_FORM))
      {
         if (bulkLoadFileMappingFormRef?.current)
         {
            // @ts-ignore ...
            addSubFormPreSubmitCallbacks("bulkLoadFileMappingForm", bulkLoadFileMappingFormRef?.current?.preSubmit);
         }
      }

      /////////////////////////////////////////////////////////////////////////////////
      // if we have a bulk-load value mapping form, register its pre-submit callback //
      /////////////////////////////////////////////////////////////////////////////////
      if (doesStepHaveComponent(activeStep, QComponentType.BULK_LOAD_VALUE_MAPPING_FORM))
      {
         if (bulkLoadValueMappingFormRef?.current)
         {
            // @ts-ignore ...
            addSubFormPreSubmitCallbacks("bulkLoadValueMappingForm", bulkLoadValueMappingFormRef?.current?.preSubmit);
         }
      }

      ///////////////////////////////////////////////////////////////////////////
      // if we have a bulk-load profile form, register its pre-submit callback //
      ///////////////////////////////////////////////////////////////////////////
      if (doesStepHaveComponent(activeStep, QComponentType.BULK_LOAD_PROFILE_FORM))
      {
         if (bulkLoadProfileFormRef?.current)
         {
            // @ts-ignore ...
            addSubFormPreSubmitCallbacks("bulkLoadProfileFormRef", bulkLoadProfileFormRef?.current?.preSubmit);
         }
      }

      /////////////////////////////////////
      // screen(step)-level help content //
      /////////////////////////////////////
      let helpRoles = ["PROCESS_SCREEN", "ALL_SCREENS"];
      const showHelp = helpHelpActive || hasHelpContent(step.helpContents, helpRoles);
      const formattedHelpContent = <HelpContent helpContents={step.helpContents} roles={helpRoles} helpContentKey={`process:${processName};step:${step?.name}`} />;
      const isFormatScanner = step?.format?.toLowerCase() == "scanner";

      return (
         <>
            {
               ///////////////////////////////////////////////////////////////////////////////////////////////////////////////
               // hide label on widgets - the Widget component itself provides the label                                    //
               // for modals, show the process label, but not for full-screen processes (for them, it is in the breadcrumb) //
               ///////////////////////////////////////////////////////////////////////////////////////////////////////////////
               !isWidget && !isFormatScanner &&
               <MDTypography variant={isWidget ? "h6" : "h5"} component="div" fontWeight="bold">
                  {(isModal) ? `${overrideLabel ?? process.label}: ` : ""}
                  {activeStepLabel}
               </MDTypography>
            }

            {
               showHelp &&
               <Box fontSize={"0.875rem"} color="var(--qqq-text-secondary, #546E7A)" pb={2}>
                  {formattedHelpContent}
               </Box>
            }

            {
               //////////////////////////////////////////////////
               // render all of the components for this screen //
               //////////////////////////////////////////////////
               step.components && (step.components.map((component: QFrontendComponent, index: number) =>
               {
                  let helpRoles = ["PROCESS_SCREEN", "ALL_SCREENS"];
                  if (component.type == QComponentType.BULK_EDIT_FORM)
                  {
                     helpRoles = ["EDIT_SCREEN", "WRITE_SCREENS", "ALL_SCREENS"];
                  }

                  //////////////////////////////////////////////////////////////////////////
                  // if the component specifies a sub-set of field names to include, then //
                  // edit the formData object to just include those.                      //
                  //////////////////////////////////////////////////////////////////////////
                  let formDataToUse = formData;
                  if (component.values && component.values.includeFieldNames)
                  {
                     formDataToUse = Object.assign({}, formData);

                     formDataToUse.formFields = {};
                     for (let i = 0; i < component.values.includeFieldNames.length; i++)
                     {
                        const fieldName = component.values.includeFieldNames[i];
                        formDataToUse.formFields[fieldName] = formData.formFields[fieldName];
                     }
                  }

                  return (
                     <div key={index}>
                        {
                           component.type === QComponentType.HELP_TEXT && (
                              component.values.previewText ?
                                 <>
                                    <Box mt={1}>
                                       <Button onClick={toggleShowFullHelpText} startIcon={<Icon>{showFullHelpText ? "expand_less" : "expand_more"}</Icon>} sx={{pl: 1}}>
                                          {showFullHelpText ? "Hide " : "Show "}
                                          {component.values.previewText}
                                       </Button>
                                    </Box>
                                    <Box mt={1} style={{display: showFullHelpText ? "block" : "none"}}>
                                       <Typography variant="body2" color="info">
                                          {ValueUtils.breakTextIntoLines(component.values.text)}
                                       </Typography>
                                    </Box>
                                 </>
                                 :
                                 <MDTypography variant="button" color="info">
                                    {ValueUtils.breakTextIntoLines(component.values.text)}
                                 </MDTypography>
                           )
                        }
                        {
                           component.type === QComponentType.BULK_EDIT_FORM && (
                              tableMetaData && localTableSections ?
                                 <Grid container spacing={3} mt={2}>
                                    {
                                       localTableSections.length == 0 &&
                                       <Grid item xs={12}>
                                          <Alert color="error">There are no editable fields on this table.</Alert>
                                       </Grid>
                                    }
                                    {
                                       processValues.nonDistinctPVSFields &&
                                       <Grid item xs={12}>
                                          <Alert color="warning">
                                             {
                                                Object.entries(processValues.nonDistinctPVSFields as Record<string, string[]>)
                                                   .map(([nonDistinctField, dependentFields]) => (
                                                      <Box pb={1} key={nonDistinctField}>
                                                         You may not edit the value of {
                                                            dependentFields.length > 1
                                                               ? <>
                                                                  <b>{dependentFields.slice(0, -1).join(", ")}</b>, or <b>{dependentFields.slice(-1)}</b>
                                                               </>
                                                               : <b>{dependentFields[0]}</b>
                                                         }, because
                                                         the records you are editing do not all have the same value for <b>{nonDistinctField}</b> (unless you edit the value of {nonDistinctField}).
                                                      </Box>
                                                   ))
                                             }
                                          </Alert>
                                       </Grid>
                                    }
                                    <Grid item xs={12} lg={3}>
                                       {
                                          localTableSections.length > 0 && <QRecordSidebar tableSections={localTableSections} stickyTop="20px" />
                                       }
                                    </Grid>
                                    <Grid item xs={12} lg={9}>
                                       {
                                          localTableSections.map((section: QTableSection, index: number) =>
                                          {
                                             const name = section.name;

                                             if (section.isHidden)
                                             {
                                                return;
                                             }

                                             const sectionFormFields = {};
                                             for (let i = 0; i < section.fieldNames.length; i++)
                                             {
                                                const fieldName = section.fieldNames[i];
                                                if (formFields[fieldName])
                                                {
                                                   // @ts-ignore
                                                   sectionFormFields[fieldName] = formFields[fieldName];

                                                   if (formFields[fieldName].possibleValueProps)
                                                   {
                                                      formFields[fieldName].possibleValueProps.tableName = null;
                                                      formFields[fieldName].possibleValueProps.processName = processName;
                                                   }
                                                }
                                             }

                                             if (Object.keys(sectionFormFields).length > 0)
                                             {
                                                const sectionFormData = {
                                                   formFields: sectionFormFields,
                                                   values: values,
                                                   errors: errors,
                                                   touched: touched
                                                };

                                                return (
                                                   <Box key={name} pb={3}>
                                                      <Card id={name} sx={{scrollMarginTop: "20px"}} elevation={5}>
                                                         <MDTypography variant="h5" p={3} pb={1}>
                                                            {section.label}
                                                         </MDTypography>
                                                         <Box px={2}>
                                                            <QDynamicForm processUUID={processUUID} formData={sectionFormData} bulkEditMode bulkEditSwitchChangeHandler={bulkEditSwitchChanged} helpRoles={helpRoles} helpContentKeyPrefix={`table:${tableMetaData?.name};`} />
                                                         </Box>
                                                      </Card>
                                                   </Box>
                                                );
                                             }
                                             else
                                             {
                                                return (<br />);
                                             }
                                          })
                                       }
                                    </Grid>
                                 </Grid>
                                 : <QDynamicForm processUUID={processUUID} formData={formData} bulkEditMode bulkEditSwitchChangeHandler={bulkEditSwitchChanged} helpRoles={helpRoles} helpContentKeyPrefix={`table:${tableMetaData?.name};`} />
                           )
                        }
                        {
                           component.type === QComponentType.EDIT_FORM &&
                           <>
                              {
                                 component.values?.sectionLabel ?
                                    <Box py={1.5}>
                                       <Card sx={{scrollMarginTop: "20px"}}>
                                          <MDTypography variant="h5" p={3} pl={2} pb={1}>
                                             {component.values?.sectionLabel}
                                          </MDTypography>
                                          <Box pt={0} p={2}>
                                             <QDynamicForm formData={formDataToUse} helpRoles={helpRoles} helpContentKeyPrefix={`process:${processName};`} />
                                          </Box>
                                       </Card>
                                    </Box> : <QDynamicForm formData={formDataToUse} helpRoles={helpRoles} helpContentKeyPrefix={`process:${processName};`} />
                              }
                           </>
                        }
                        {
                           component.type === QComponentType.VIEW_FORM && step.viewFields && (
                              <ProcessViewForm fields={step.viewFields} values={processValues} columns={1} />
                           )
                        }
                        {
                           component.type === QComponentType.DOWNLOAD_FORM && (
                              <Grid container display="flex" justifyContent="center">
                                 <Grid item xs={12} sm={12} xl={8} m={3} p={3} mt={6} sx={{border: "1px solid var(--qqq-border-color, gray)", borderRadius: "1rem"}}>
                                    <Box mx={2} mt={-6} p={1} sx={{width: "fit-content", borderColor: "var(--qqq-border-color, rgb(70%, 70%, 70%))", borderWidth: "2px", borderStyle: "solid", borderRadius: ".25em", backgroundColor: "var(--qqq-surface-color, #FFFFFF)"}} width="initial" color="var(--qqq-text-primary, #344767)">
                                       Download
                                    </Box>
                                    <Box display="flex" py={1} pr={2}>
                                       <MDTypography variant="button" fontWeight="bold" onClick={() => download(processValues)} sx={{cursor: "pointer"}}>
                                          <Box display="flex" alignItems="center" gap={1} py={1} pr={2}>
                                             <Icon fontSize="large">download_for_offline</Icon>
                                             {processValues.downloadFileName}
                                          </Box>
                                       </MDTypography>
                                    </Box>
                                 </Grid>
                              </Grid>
                           )
                        }
                        {
                           component.type === QComponentType.VALIDATION_REVIEW_SCREEN && (
                              <ValidationReview
                                 qInstance={qInstance}
                                 process={processMetaData}
                                 table={tableMetaData}
                                 processValues={processValues}
                                 step={step}
                                 previewRecords={records}
                                 loadingRecords={loadingRecords}
                                 formValues={formData.values}
                                 doFullValidationRadioChangedHandler={(event: any) =>
                                 {
                                    const {value} = event.currentTarget;

                                    //////////////////////////////////////////////////////////////
                                    // call the formik function to set the value in this field. //
                                    //////////////////////////////////////////////////////////////
                                    setFieldValue("doFullValidation", value);

                                    setOverrideOnLastStep(value !== "true");
                                 }}
                              />
                           )
                        }
                        {
                           component.type === QComponentType.PROCESS_SUMMARY_RESULTS && (
                              <ProcessSummaryResults qInstance={qInstance} process={processMetaData} table={tableMetaData} processValues={processValues} step={step} />
                           )
                        }
                        {
                           component.type === QComponentType.GOOGLE_DRIVE_SELECT_FOLDER && (
                              // todo - make these booleans configurable (values on the component)
                              <GoogleDriveFolderPickerWrapper showSharedDrivesView={true} showDefaultFoldersView={false} qInstance={qInstance} />
                           )
                        }
                        {
                           component.type === QComponentType.RECORD_LIST && step.recordListFields && recordConfig.columns && (
                              <div>
                                 <MDTypography variant="button" fontWeight="bold">Records</MDTypography>
                                 {" "}
                                 <br />
                                 <Box height="100%">
                                    <DataGridPro
                                       components={{Pagination: CustomPagination}}
                                       page={recordConfig.pageNo}
                                       disableSelectionOnClick
                                       autoHeight
                                       rows={recordConfig.rows}
                                       columns={recordConfig.columns}
                                       rowBuffer={10}
                                       rowCount={recordConfig.totalRecords}
                                       pageSize={recordConfig.rowsPerPage}
                                       rowsPerPageOptions={[10, 25, 50]}
                                       onPageSizeChange={recordConfig.handleRowsPerPageChange}
                                       onPageChange={recordConfig.handlePageChange}
                                       onRowClick={recordConfig.handleRowClick}
                                       getRowId={(row) => row.__idForDataGridPro__}
                                       paginationMode="server"
                                       pagination
                                       density="compact"
                                       loading={recordConfig.loading}
                                       disableColumnFilter
                                    />
                                 </Box>
                              </div>
                           )
                        }
                        {
                           component.type === QComponentType.HTML && (
                              processValues[`${step.name}.html`] &&
                              <Box fontSize="1rem">
                                 {parse(processValues[`${step.name}.html`])}
                              </Box>
                           )
                        }
                        {
                           component.type === QComponentType.WIDGET && (
                              <>
                                 {
                                    ///////////////////////////////////////////////////
                                    // if a widget name is given, render that widget //
                                    ///////////////////////////////////////////////////
                                    component.values?.widgetName &&
                                    renderWidget(component.values?.widgetName)
                                 }
                                 {
                                    /////////////////////////////////////////////////////////
                                    // if the widget is marked as adHoc, render it as such //
                                    /////////////////////////////////////////////////////////
                                    component.values?.isAdHocWidget &&
                                    renderAdHocWidget(component.values, index)
                                 }
                                 {
                                    ////////////////////////////////////////////////
                                    // if neither of those, then programmer error //
                                    ////////////////////////////////////////////////
                                    !(component.values?.widgetName || component.values?.isAdHocWidget) &&
                                    <Alert severity="error">Error: Component is marked as WIDGET type, but does not specify a <u>widgetName</u>, nor the <u>isAdHocWidget</u> flag.</Alert>
                                 }
                              </>
                           )
                        }
                        {
                           component.type === QComponentType.BULK_LOAD_FILE_MAPPING_FORM && (
                              <BulkLoadFileMappingForm
                                 processValues={processValues}
                                 tableMetaData={tableMetaData}
                                 processMetaData={processMetaData}
                                 metaData={qInstance}
                                 ref={bulkLoadFileMappingFormRef}
                                 setActiveStepLabel={setActiveStepLabel}
                                 frontendStep={activeStep}
                              />
                           )
                        }
                        {
                           component.type === QComponentType.BULK_LOAD_VALUE_MAPPING_FORM && (
                              <BulkLoadValueMappingForm
                                 processValues={processValues}
                                 tableMetaData={tableMetaData}
                                 metaData={qInstance}
                                 ref={bulkLoadValueMappingFormRef}
                                 setActiveStepLabel={setActiveStepLabel}
                                 formFields={bulkLoadValueMappingFormFields}
                              />
                           )
                        }
                        {
                           component.type === QComponentType.BULK_LOAD_PROFILE_FORM && (
                              <BulkLoadProfileForm
                                 processValues={processValues}
                                 tableMetaData={tableMetaData}
                                 metaData={qInstance}
                                 ref={bulkLoadProfileFormRef}
                              />
                           )
                        }
                     </div>
                  );
               }))
            }
         </>
      );
   };

   const handlePageChange = (page: number) =>
   {
      setPageNumber(page);
   };

   const handleRowsPerPageChange = (size: number) =>
   {
      setRowsPerPage(size);
   };

   function buildNewRecordConfig()
   {
      const newRecordConfig = {} as any;
      newRecordConfig.pageNo = pageNumber;
      newRecordConfig.rowsPerPage = rowsPerPage;
      newRecordConfig.columns = [] as GridColDef[];
      newRecordConfig.rows = [];
      newRecordConfig.totalRecords = 0;
      newRecordConfig.handleRowsPerPageChange = handleRowsPerPageChange;
      newRecordConfig.handlePageChange = handlePageChange;
      newRecordConfig.handleRowClick = null;
      newRecordConfig.loading = true;
      return (newRecordConfig);
   }

   const getFullFieldList = (activeStep: QFrontendStepMetaData, processValues: any) =>
   {
      let rs: QFieldMetaData[] = [];

      if (activeStep && activeStep.formFields)
      {
         for (let i = 0; i < activeStep.formFields.length; i++)
         {
            rs.push(activeStep.formFields[i]);
         }
      }

      if (processValues.inputFieldList)
      {
         for (let i = 0; i < processValues.inputFieldList.length; i++)
         {
            let inputField = new QFieldMetaData(processValues.inputFieldList[i]);
            rs.push(inputField);
         }
      }

      return (rs);
   };

   //////////////////////////////////////////////////////////////////////////////////////////////////////////////
   // handle moving to another step in the process - e.g., after the backend told us what screen to show next. //
   //////////////////////////////////////////////////////////////////////////////////////////////////////////////
   useEffect(() =>
   {
      if (!processMetaData)
      {
         console.log("No process meta data yet, so returning early");
         return;
      }

      if (!isWidget)
      {
         setPageHeader(overrideLabel ?? processMetaData.label);
      }

      let newIndex = null;
      if (typeof newStep === "number")
      {
         newIndex = newStep as number;
      }
      else if (typeof newStep === "string")
      {
         for (let i = 0; i < steps.length; i++)
         {
            if (steps[i].name === newStep)
            {
               newIndex = i;
               break;
            }
         }
      }
      if (newIndex === null)
      {
         setProcessError(`Unknown process step ${newStep}.`);
         return;
      }
      setActiveStepIndex(newIndex);
      setOverrideOnLastStep(null);

      ////////////////////////////////////////////////////////////////////////////////////////////////////
      // reset formik touched data, so a field that's repeated doesn't immediately show a 'dirty' state //
      ////////////////////////////////////////////////////////////////////////////////////////////////////
      formikSetTouched({}, false);

      if (steps)
      {
         const activeStep = steps[newIndex];
         setActiveStep(activeStep);
         setActiveStepLabel(activeStep.label);
         setFormId(activeStep.name);

         let dynamicFormFields: any = {};
         let formValidations: any = {};
         let initialValues: any = {};

         ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
         // define an inner function here, for adding more fields to the form, if any components have form fields built into them //
         ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
         const addField = (fieldName: string, dynamicFormValue: any, initialValue: any, validation: any) =>
         {
            dynamicFormFields[fieldName] = dynamicFormValue;
            initialValues[fieldName] = initialValue;

            if (formikSetFieldValueFunction)
            {
               formikSetFieldValueFunction(fieldName, initialValue);
            }

            formValidations[fieldName] = validation;
         };

         if (tableMetaData)
         {
            console.log("Adding table name field... ?", tableMetaData.name);
            addField("tableName", {type: "hidden", omitFromQDynamicForm: true}, tableMetaData.name, null);
         }

         if (doesStepHaveComponent(activeStep, QComponentType.VALIDATION_REVIEW_SCREEN))
         {
            addField("doFullValidation", {type: "radio"}, "true", null);

            //////////////////////////////////////////////////////////////////////////////////////////////
            // so - if we're on the validation screen, and we don't have a validationSummary right now, //
            // and the process supports doing full validation - then the user will choose, via radio,   //
            // if this is the last step or not - and by default that radio will be true, to make this   //
            // NOT the last step - so set this value.                                                   //
            //////////////////////////////////////////////////////////////////////////////////////////////
            if (!processValues["validationSummary"] && processValues["supportsFullValidation"])
            {
               setOverrideOnLastStep(false);
            }
         }

         if (doesStepHaveComponent(activeStep, QComponentType.GOOGLE_DRIVE_SELECT_FOLDER))
         {
            addField("googleDriveAccessToken", {type: "hidden", omitFromQDynamicForm: true}, "", null);
            addField("googleDriveFolderId", {type: "hidden", omitFromQDynamicForm: true}, "", null);
            addField("googleDriveFolderName", {type: "hidden", omitFromQDynamicForm: true}, "", null);
         }

         if (doesStepHaveComponent(activeStep, QComponentType.WIDGET))
         {
            ProcessWidgetBlockUtils.addFieldsForCompositeWidget(activeStep, processValues, (fieldMetaData) =>
            {
               const dynamicField = DynamicFormUtils.getDynamicField(fieldMetaData);
               const validation = DynamicFormUtils.getValidationForField(fieldMetaData);
               addField(fieldMetaData.name, dynamicField, processValues[fieldMetaData.name], validation);
            });
         }

         ///////////////////////////////////////////////////
         // if this step has form fields, set up the form //
         ///////////////////////////////////////////////////
         if (activeStep.formFields || processValues.inputFieldList)
         {
            let fullFieldList = getFullFieldList(activeStep, processValues);
            const formData = DynamicFormUtils.getFormData(fullFieldList);

            const possibleValueDisplayValues = new Map<string, string>();

            ///////////////////////////////////////////////////////////////////////////////////////////////////////////
            // ok - so - the addPossibleValueProps method wants to take either a tableName or a processName          //
            // param - if it gets a tableName, then it'll point the PVS to the table - which is what we want         //
            // (at this time, at least) only for the BULK_EDIT process (expected to change in future...)             //
            // so, only pass a tableName into that method if this looks like a bulk edit (based on that component... //
            // else, pass a processName and no table name.                                                           //
            ///////////////////////////////////////////////////////////////////////////////////////////////////////////
            const tableNameForPVProps = doesStepHaveComponent(activeStep, QComponentType.BULK_EDIT_FORM) ? tableMetaData.name : null;
            const processNameForPVProps = tableNameForPVProps ? null : processName;
            DynamicFormUtils.addPossibleValueProps(formData.dynamicFormFields, fullFieldList, tableNameForPVProps, processNameForPVProps, possibleValueDisplayValues);

            dynamicFormFields = formData.dynamicFormFields;
            formValidations = formData.formValidations;

            fullFieldList.forEach((field) =>
            {
               initialValues[field.name] = processValues[field.name];

               if (formikSetFieldValueFunction)
               {
                  formikSetFieldValueFunction(field.name, processValues[field.name]);
               }
            });

            ////////////////////////////////////////////////////////////////////////////////////
            // set initial values in the possible value fields as otherValues (for filtering) //
            ////////////////////////////////////////////////////////////////////////////////////
            Object.keys(dynamicFormFields).forEach((key: any) =>
            {
               if (dynamicFormFields[key].possibleValueProps)
               {
                  dynamicFormFields[key].possibleValueProps.otherValues = dynamicFormFields[key].possibleValueProps.otherValues ?? new Map<string, any>();
                  Object.keys(initialValues).forEach((ivKey: any) =>
                  {
                     dynamicFormFields[key].possibleValueProps.otherValues.set(ivKey, initialValues[ivKey]);
                  });
               }
            });

            ////////////////////////////////////////////////////
            // disable all fields if this is a bulk edit form //
            ////////////////////////////////////////////////////
            if (doesStepHaveComponent(activeStep, QComponentType.BULK_EDIT_FORM))
            {
               const newDisabledBulkEditFields: any = {};
               fullFieldList.forEach((field) =>
               {
                  newDisabledBulkEditFields[field.name] = true;
                  dynamicFormFields[field.name].isRequired = false;
                  formValidations[field.name] = null;
               });
               setDisabledBulkEditFields(newDisabledBulkEditFields);
            }
         }

         /////////////////////////////////////////////////////////////////
         // Help make this component's fields work with our formik form //
         /////////////////////////////////////////////////////////////////
         if (activeStep && doesStepHaveComponent(activeStep, QComponentType.BULK_LOAD_VALUE_MAPPING_FORM))
         {
            const fileValues = processValues.fileValues ?? [];
            const valueMapping = processValues.valueMapping ?? {};
            const mappedValueLabels = processValues.mappedValueLabels ?? {};

            const fieldFullName = processValues.valueMappingFullFieldName;
            const fieldTableName = processValues.valueMappingFieldTableName;

            const field = new QFieldMetaData(processValues.valueMappingField);
            const qFieldMetaData = new QFieldMetaData(field);

            const fieldsForComponent: any[] = [];
            for (let i = 0; i < fileValues.length; i++)
            {
               const dynamicField = DynamicFormUtils.getDynamicField(qFieldMetaData);
               const wrappedField: any = {};
               wrappedField[field.name] = dynamicField;
               DynamicFormUtils.addPossibleValueProps(wrappedField, [field], fieldTableName, null, null);

               const initialValue = valueMapping[fileValues[i]];

               if (dynamicField.possibleValueProps)
               {
                  dynamicField.possibleValueProps.initialDisplayValue = mappedValueLabels[initialValue];
               }

               addField(`${fieldFullName}.value.${i}`, dynamicField, initialValue, null);
               fieldsForComponent.push(dynamicField);
            }

            setBulkLoadValueMappingFormFields(fieldsForComponent);
         }

         if (Object.keys(dynamicFormFields).length > 0)
         {
            ///////////////////////////////////////////
            // if there are form fields, set them up //
            ///////////////////////////////////////////
            setFormFields(dynamicFormFields);
            setInitialValues(initialValues);
            setValidationScheme(Yup.object().shape(formValidations));
            setValidationFunction(null);
         }
         else
         {
            /////////////////////////////////////////////////////////////////////////
            // if there are no form fields, set a null validationScheme (Yup), and //
            // instead use a validation function that always says true.            //
            /////////////////////////////////////////////////////////////////////////
            setValidationScheme(null);
            setValidationFunction(() => true);
         }
      }
   }, [newStep, stepInstanceCounter]); // maybe we could just use stepInstanceCounter...

   /////////////////////////////////////////////////////////////////////////////////////////////
   // if there are records to load: build a record config, and set the needRecords state flag //
   /////////////////////////////////////////////////////////////////////////////////////////////
   useEffect(() =>
   {
      if (activeStep && activeStep.recordListFields)
      {
         const newRecordConfig = buildNewRecordConfig();
         activeStep.recordListFields.forEach((field) =>
         {
            newRecordConfig.columns.push({
               field: field.name, headerName: field.label, width: 200, sortable: false,
            });
         });
         setRecordConfig(newRecordConfig);
         setNeedRecords(true);
      }
   }, [activeStep, rowsPerPage, pageNumber]);

   /////////////////////////////////////////////////////
   // handle a bulk-edit enabled-switch being checked //
   /////////////////////////////////////////////////////
   useEffect(() =>
   {
      if (activeStep && (activeStep.formFields || processValues.inputFieldList))
      {
         let fullFieldList = getFullFieldList(activeStep, processValues);
         const newDynamicFormFields: any = {};
         const newFormValidations: any = {};
         fullFieldList.forEach((field) =>
         {
            const fieldName = field.name;
            const isDisabled = disabledBulkEditFields[fieldName];

            newDynamicFormFields[field.name] = DynamicFormUtils.getDynamicField(field);
            newFormValidations[field.name] = DynamicFormUtils.getValidationForField(field);

            if (isDisabled)
            {
               newDynamicFormFields[field.name].isRequired = false;
               newFormValidations[field.name] = null;
            }
         });

         DynamicFormUtils.addPossibleValueProps(newDynamicFormFields, fullFieldList, tableMetaData?.name, null, null);

         setFormFields(newDynamicFormFields);
         setValidationScheme(Yup.object().shape(newFormValidations));
      }
   }, [disabledBulkEditFields]);

   ////////////////////////////////////////////////
   // when we need to load records, do so, async //
   ////////////////////////////////////////////////
   useEffect(() =>
   {
      if (needRecords)
      {
         setNeedRecords(false);
         (async () =>
         {
            const response = await qController.processRecords(
               processName,
               processUUID,
               recordConfig.rowsPerPage * recordConfig.pageNo,
               recordConfig.rowsPerPage,
            );

            const {records} = response;
            setRecords(records);
            setLoadingRecords(false);

            if (!childRecordData || childRecordData.length == 0)
            {
               setChildRecordData(convertRecordsToChildRecordData(records));
            }

            /////////////////////////////////////////////////////////////////////////////////////////
            // re-construct the recordConfig object, so the setState call triggers a new rendering //
            /////////////////////////////////////////////////////////////////////////////////////////
            const newRecordConfig = buildNewRecordConfig();
            newRecordConfig.loading = false;
            newRecordConfig.columns = recordConfig.columns;
            newRecordConfig.rows = [];
            let rowId = 0;
            records.forEach((record) =>
            {
               const row = Object.fromEntries(record.values.entries());
               row.__idForDataGridPro__ = ++rowId;
               newRecordConfig.rows.push(row);
            });

            newRecordConfig.totalRecords = response.totalRecords;
            setRecordConfig(newRecordConfig);
         })();
      }
   }, [needRecords]);


   /***************************************************************************
    **
    ***************************************************************************/
   function convertRecordsToChildRecordData(records: QRecord[])
   {
      const frontendRecords = [] as any[];
      records.forEach((record: QRecord) =>
      {
         const object = {
            "tableName": record.tableName,
            "recordLabel": record.recordLabel,
            "errors": record.errors,
            "warnings": record.warnings,
            "values": Object.fromEntries(record.values),
            "displayValues": Object.fromEntries(record.displayValues),
         };
         frontendRecords.push(object);
      });
      const newChildListData = {} as ChildRecordListData;
      newChildListData.queryOutput = {records: frontendRecords};
      return (newChildListData);
   }


   /***************************************************************************
    **
    ***************************************************************************/
   function updateFieldsInProcess(steps: QFrontendStepMetaData[], updatedFields: Map<string, QFieldMetaData>)
   {
      if (updatedFields)
      {
         updatedFields.forEach((field) => previouslySeenUpdatedFieldMetaDataMap.set(field.name, field));
         setPreviouslySeenUpdatedFieldMetaDataMap(previouslySeenUpdatedFieldMetaDataMap);
      }

      for (let step of steps)
      {
         if (step && step.formFields)
         {
            for (let i = 0; i < step.formFields.length; i++)
            {
               let field = step.formFields[i];
               if (previouslySeenUpdatedFieldMetaDataMap.has(field.name))
               {
                  step.formFields[i] = previouslySeenUpdatedFieldMetaDataMap.get(field.name);
               }
            }
         }
      }

      if (processValues.inputFieldList)
      {
         for (let i = 0; i < processValues.inputFieldList.length; i++)
         {
            let field = new QFieldMetaData(processValues.inputFieldList[i]);
            if (previouslySeenUpdatedFieldMetaDataMap.has(field.name))
            {
               processValues.inputFieldList[i] = previouslySeenUpdatedFieldMetaDataMap.get(field.name); // todo - uh, not an object?
            }
         }
      }
   }


   /***************************************************************************
    ** manage adding pre-submit callbacks (so they get added just once)
    ***************************************************************************/
   function addSubFormPreSubmitCallbacks(name: string, callback: SubFormPreSubmitCallback)
   {
      if (subFormPreSubmitCallbacks.findIndex(c => c.name == name) == -1)
      {
         const newCallbacks: SubFormPreSubmitCallbackWithName[] = [];
         for (let i = 0; i < subFormPreSubmitCallbacks.length; i++)
         {
            newCallbacks[i] = subFormPreSubmitCallbacks[i];
         }
         newCallbacks.push({name, callback});
         setSubFormPreSubmitCallbacks(newCallbacks);
      }
   }


   //////////////////////////////////////////////////////////////////////////////////////////////////////////
   // handle a response from the server - e.g., after starting a backend job, or getting its status/result //
   //////////////////////////////////////////////////////////////////////////////////////////////////////////
   useEffect(() =>
   {
      if (lastProcessResponse)
      {
         setLastProcessResponse(null);
         setRetryMillis(INITIAL_RETRY_MILLIS);

         if (lastProcessResponse instanceof QJobComplete)
         {
            ///////////////////////////////////////////////////////////////////////////////////////////////
            // run an async function here, in case we need to await looking up any possible-value labels //
            ///////////////////////////////////////////////////////////////////////////////////////////////
            (async () =>
            {
               const qJobComplete = lastProcessResponse as QJobComplete;
               const newValues = qJobComplete.values;

               /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
               // if the process step sent a new frontend-step-list, then refresh what we have in state (constructing new full model objects) //
               /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
               let frontendSteps = steps;
               const updatedFrontendStepList = qJobComplete.processMetaDataAdjustment?.updatedFrontendStepList;
               if (updatedFrontendStepList)
               {
                  frontendSteps = updatedFrontendStepList;
                  setSteps(frontendSteps);
               }

               ////////////////////////////////////////////////////////////////////////////////////////////////////////
               // always merge the new updatedFields map (if there is one) with existing updates and existing fields //
               ////////////////////////////////////////////////////////////////////////////////////////////////////////
               updateFieldsInProcess(frontendSteps, qJobComplete.processMetaDataAdjustment?.updatedFields);
               setSteps(frontendSteps);

               ///////////////////////////////////////////////////////////////////////////////////
               // if the next screen has any PVS fields - look up their labels (display values) //
               ///////////////////////////////////////////////////////////////////////////////////
               const nextStepName = qJobComplete.nextStep;
               let nextStep: QFrontendStepMetaData | null = null;
               if (frontendSteps && nextStepName)
               {
                  for (let i = 0; i < frontendSteps.length; i++)
                  {
                     if (frontendSteps[i].name === nextStepName)
                     {
                        nextStep = frontendSteps[i];
                        break;
                     }
                  }

                  if (nextStep && nextStep.formFields)
                  {
                     for (let i = 0; i < nextStep.formFields.length; i++)
                     {
                        const field = nextStep.formFields[i];
                        const fieldName = field.name;
                        if (field.possibleValueSourceName && newValues && newValues[fieldName])
                        {
                           const results: QPossibleValue[] = await qController.possibleValues(null, processName, fieldName, null, [newValues[fieldName]]);
                           if (results && results.length > 0)
                           {
                              if (!cachedPossibleValueLabels[fieldName])
                              {
                                 cachedPossibleValueLabels[fieldName] = {};
                              }
                              cachedPossibleValueLabels[fieldName][newValues[fieldName]] = results[0].label;
                           }
                        }
                     }
                  }
               }

               //////////////////////////////////////
               // reset some state between screens //
               //////////////////////////////////////
               setJobUUID(null);
               setNewStep(nextStepName);
               setStepInstanceCounter(1 + stepInstanceCounter);
               setProcessValues(newValues);
               setRenderedWidgets({});
               setSubFormPreSubmitCallbacks([]);
               setQJobRunning(null);
               setBackStepName(qJobComplete.backStep);

               if (formikSetFieldValueFunction)
               {
                  //////////////////////////////////
                  // reset field values in formik //
                  //////////////////////////////////
                  for (let key in qJobComplete.values)
                  {
                     if (Object.hasOwn(formFields, key))
                     {
                        console.log(`(re)setting form field [${key}] to [${qJobComplete.values[key]}]`);
                        formikSetFieldValueFunction(key, qJobComplete.values[key]);
                     }
                  }
               }

               if (activeStep && activeStep.recordListFields)
               {
                  setNeedRecords(true);
               }
            })();
         }
         else if (lastProcessResponse instanceof QJobStarted)
         {
            const qJobStarted = lastProcessResponse as QJobStarted;
            setJobUUID(qJobStarted.jobUUID);
            setNeedToCheckJobStatus(true);
         }
         else if (lastProcessResponse instanceof QJobRunning)
         {
            const qJobRunning = lastProcessResponse as QJobRunning;
            setQJobRunning(qJobRunning);
            setQJobRunningDate(new Date());
            setNeedToCheckJobStatus(true);
         }
         else if (lastProcessResponse instanceof QJobError)
         {
            const qJobError = lastProcessResponse as QJobError;
            console.log(`Got an error from the backend... ${qJobError.error} : ${qJobError.userFacingError}`);
            setJobUUID(null);
            if (qJobError.userFacingError)
            {
               setProcessError(qJobError.userFacingError, true);
            }
            else
            {
               setProcessError(qJobError.error);
            }
            setQJobRunning(null);
         }
         else
         {
            console.warn(`Process response was not of an expected type (need an npm clean?) ${JSON.stringify(lastProcessResponse)}`);
         }
      }
   }, [lastProcessResponse]);

   /////////////////////////////////////////////////////////////////////////
   // while a backend async job is running, periodically check its status //
   /////////////////////////////////////////////////////////////////////////
   useEffect(() =>
   {
      if (needToCheckJobStatus)
      {
         setNeedToCheckJobStatus(false);
         if (!processUUID || !jobUUID)
         {
            console.log(`Missing processUUID[${processUUID}] or jobUUID[${jobUUID}], so returning without checking job status`);
            return;
         }

         (async () =>
         {
            setTimeout(async () =>
            {
               try
               {
                  const processResponse = await qController.processJobStatus(
                     processName,
                     processUUID,
                     jobUUID,
                  );
                  setLastProcessResponse(processResponse);
               }
               catch (e)
               {
                  if (e instanceof QException)
                  {
                     const qException = e as QException;
                     const status = Number(qException.status);
                     if (status !== undefined && !Number.isNaN(status) && status >= 500 && status <= 600)
                     {
                        if (retryMillis < RETRY_MAX_MILLIS)
                        {
                           console.log(`500 error, attempting to retry in ${retryMillis + retryMillis} millis`);
                           setRetryMillis(retryMillis * BACKOFF_AMOUNT);
                           setNeedToCheckJobStatus(true);
                           return;
                        }

                        console.log(`Retry millis [${retryMillis}] is greater or equal to the max retry limit [${RETRY_MAX_MILLIS}], giving up...`);
                        setProcessError("Could not connect to server");
                     }
                  }

                  throw (e);
               }
            }, retryMillis);
         })();
      }
   }, [needToCheckJobStatus, retryMillis]);


   const handlePermissionDenied = (e: any): boolean =>
   {
      if ((e as QException).status === 403)
      {
         setProcessError(`You do not have permission to run this ${isReport ? "report" : "process"}.`, true);
         return (true);
      }
      return (false);
   };


   //////////////////////////////////////////////////////////////////////////////////////////
   // do the initial load of data for the process - that is, meta data, plus the init step //
   // also - allow the component that contains this component to force a re-init, by       //
   // changing the value in the forceReInit property                                       //
   //////////////////////////////////////////////////////////////////////////////////////////
   if (needInitialLoad || forceReInit != lastForcedReInit)
   {
      setNeedInitialLoad(false);
      setLastForcedReInit(forceReInit);

      (async () =>
      {
         const urlSearchParams = new URLSearchParams(location.search);
         let queryStringPairsForInit = [];
         if (urlSearchParams.get("recordIds"))
         {
            const recordIdsFromQueryString = urlSearchParams.get("recordIds").split(",");
            const encodedRecordIds = recordIdsFromQueryString.map(r => encodeURIComponent(r)).join(",");
            queryStringPairsForInit.push("recordsParam=recordIds");
            queryStringPairsForInit.push(`recordIds=${encodedRecordIds}`);
         }
         else if (urlSearchParams.get("filterJSON"))
         {
            queryStringPairsForInit.push("recordsParam=filterJSON");
            queryStringPairsForInit.push(`filterJSON=${encodeURIComponent(urlSearchParams.get("filterJSON"))}`);
         }
         // todo once saved filters exist
         //else if(urlSearchParams.get("filterId")) {
         //   queryStringPairsForInit.push("recordsParam=filterId");
         //   queryStringPairsForInit.push(`filterId=${urlSearchParams.get("filterId")}`);
         // }
         else if (recordIds)
         {
            if (recordIds instanceof QQueryFilter)
            {
               queryStringPairsForInit.push("recordsParam=filterJSON");
               queryStringPairsForInit.push(`filterJSON=${encodeURIComponent(JSON.stringify(recordIds))}`);
            }
            else if (typeof recordIds === "object" && recordIds.length)
            {
               const encodedRecordIds = recordIds.map(r => encodeURIComponent(r)).join(",");
               queryStringPairsForInit.push("recordsParam=recordIds");
               queryStringPairsForInit.push(`recordIds=${encodedRecordIds}`);
            }
         }

         if (tableVariantLocalStorageKey && localStorage.getItem(tableVariantLocalStorageKey))
         {
            let tableVariant = JSON.parse(localStorage.getItem(tableVariantLocalStorageKey));
            queryStringPairsForInit.push(`tableVariant=${encodeURIComponent(JSON.stringify(tableVariant))}`);
         }

         try
         {
            const qInstance = await qController.loadMetaData();
            ValueUtils.qInstance = qInstance;
            setQInstance(qInstance);
         }
         catch (e)
         {
            setProcessError("Error loading process definition.");
            return;
         }

         try
         {
            const processMetaData = await qController.loadProcessMetaData(processName);
            setProcessMetaData(processMetaData);
            setSteps(processMetaData.frontendSteps);

            doRecordAnalytics({location: window.location, title: "Process: " + processMetaData?.label});
            doRecordAnalytics({category: "processEvents", action: "startProcess", label: processMetaData?.label});

            if (processMetaData.tableName && !tableMetaData)
            {
               try
               {
                  const tableMetaData = await qController.loadTableMetaData(processMetaData.tableName);
                  setTableMetaData(tableMetaData);
               }
               catch (e)
               {
                  setProcessError("Error loading process's table definition.");
                  return;
               }
            }
         }
         catch (e)
         {
            handlePermissionDenied(e) || setProcessError("Error loading process definition.");
            return;
         }

         if (urlSearchParams.get("defaultProcessValues"))
         {
            if (!defaultProcessValues)
            {
               defaultProcessValues = {};
            }

            const values = JSON.parse(urlSearchParams.get("defaultProcessValues"));
            for (let key in values)
            {
               defaultProcessValues[key] = values[key];
            }
         }

         if (defaultProcessValues)
         {
            for (let key in defaultProcessValues)
            {
               queryStringPairsForInit.push(`${key}=${encodeURIComponent(defaultProcessValues[key])}`);
            }
         }

         if (tableMetaData)
         {
            queryStringPairsForInit.push(`tableName=${encodeURIComponent(tableMetaData.name)}`);
         }

         try
         {
            const processResponse = await qController.processInit(processName, queryStringPairsForInit.join("&"));
            setProcessUUID(processResponse.processUUID);
            setLastProcessResponse(processResponse);
         }
         catch (e)
         {
            handlePermissionDenied(e) || setProcessError("Error initializing process.");
         }
      })();
   }

   //////////////////////////////////////////////////////////////////////////////////////////////////////
   // handle the back button - todo - not really done at all                                           //
   // e.g., qqq needs to say when back is or isn't allowed, and we need to hit the backend upon backs. //
   //////////////////////////////////////////////////////////////////////////////////////////////////////
   const handleBack = () =>
   {
      //////////////////////////////////////////////////////////////////////////////////////////////////
      // note, this is kept out of clearStatesBeforeHittingBackend, because in handleSubmit, the form //
      // might become invalidated, in which case we'd want a form error, i guess.                     //
      //////////////////////////////////////////////////////////////////////////////////////////////////
      setFormError(null);

      clearStatesBeforeHittingBackend();

      setTimeout(async () =>
      {
         doRecordAnalytics({category: "processEvents", action: "processStep", label: activeStep.label});

         const processResponse = await qController.processStep(
            processName,
            processUUID,
            backStepName,
            "isStepBack=true",
            qController.defaultMultipartFormDataHeaders(),
         );
         setLastProcessResponse(processResponse);
      });
   };

   ////////////////////////////////////////////
   // handle user submitting changed records //
   ////////////////////////////////////////////
   const doSubmit = async (formData: FormData) =>
   {
      setTimeout(async () =>
      {
         doRecordAnalytics({category: "processEvents", action: "processStep", label: activeStep.label});

         const processResponse = await Client.getInstance().processStep(
            processName,
            processUUID,
            activeStep.name,
            formData,
            qController.defaultMultipartFormDataHeaders()
         );
         setLastProcessResponse(processResponse);
      });
   };

   //////////////////////////////////////////////////////////////////////////////////////////
   // handle user submitting the form - which in qqq means moving forward from any screen. //
   // caller can pass in a map of values to be added to the form data too                  //
   //////////////////////////////////////////////////////////////////////////////////////////
   const handleFormSubmit = async (values: any) =>
   {
      setFormError(null);

      ///////////////////////////////////////////////////////////////
      // run any sub-form pre-submit callbacks that are registered //
      ///////////////////////////////////////////////////////////////
      for (let i = 0; i < subFormPreSubmitCallbacks.length; i++)
      {
         const {maySubmit, values: moreValues} = subFormPreSubmitCallbacks[i].callback();
         if (!maySubmit)
         {
            console.log(`May not submit form, per callback: ${subFormPreSubmitCallbacks[i].name}`);
            return;
         }

         if (moreValues)
         {
            for (let key in moreValues)
            {
               values[key] = moreValues[key];
            }
         }
      }

      const formData = new FormData();
      Object.keys(values).forEach((key) =>
      {
         if (values[key] !== undefined)
         {
            formData.append(key, values[key]);
         }
      });

      if (tableVariantLocalStorageKey && localStorage.getItem(tableVariantLocalStorageKey))
      {
         let tableVariant = JSON.parse(localStorage.getItem(tableVariantLocalStorageKey));
         formData.append("tableVariant", JSON.stringify(tableVariant));
      }

      if (doesStepHaveComponent(activeStep, QComponentType.BULK_EDIT_FORM))
      {
         const bulkEditEnabledFields: string[] = [];
         let fullFieldList = getFullFieldList(activeStep, processValues);
         fullFieldList.forEach((field) =>
         {
            if (!disabledBulkEditFields[field.name])
            {
               bulkEditEnabledFields.push(field.name);
            }
         });

         if (bulkEditEnabledFields.length === 0)
         {
            setFormError("You must edit at least one field to continue.");
            return;
         }
         formData.append("bulkEditEnabledFields", bulkEditEnabledFields.join(","));
      }

      clearStatesBeforeHittingBackend();

      /////////////////////////////////////////////////////////////
      // convert to regular objects so that they can be jsonized //
      /////////////////////////////////////////////////////////////
      if (childRecordData)
      {
         formData.append("frontendRecords", JSON.stringify(childRecordData.queryOutput.records));
      }

      doSubmit(formData);
   };


   /*******************************************************************************
    ** common code shared by 'back' and 'submit' (next) - to clear some state values.
    *******************************************************************************/
   const clearStatesBeforeHittingBackend = () =>
   {
      setProcessValues({});
      setRecords([]);
      setOverrideOnLastStep(null);
      setLastProcessResponse(new QJobRunning({message: "Working..."}));

      ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
      // clear out the active step now, to avoid a flash of the old one after the job completes, but before the new one is all set //
      ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
      setActiveStep(null);

      ////////////////////////////////////////////////////////////////////////////////////////////////////////////
      // setting this flag here (initially, for use in ValidationReview) will ensure that the initial render of //
      // such a component will show as "loading", rather than a flash of "no records" before going into loading //
      ////////////////////////////////////////////////////////////////////////////////////////////////////////////
      setLoadingRecords(true);

   };


   /*******************************************************************************
    **
    *******************************************************************************/
   const handleCancelClicked = (isClose: boolean) =>
   {
      //////////////////////////////////////////////////////////////////
      // unless this is a 'close', then tell backend we're cancelling //
      //////////////////////////////////////////////////////////////////
      if (!isClose)
      {
         qController.processCancel(processName, processUUID);
      }

      if (isModal && closeModalHandler)
      {
         closeModalHandler(null, "cancelClicked");
         return;
      }

      const pathParts = location.pathname.split(/\//);
      pathParts.pop();
      const path = pathParts.join("/");
      navigate(path, {replace: true});
   };


   /***************************************************************************
    **
    ***************************************************************************/
   function doRecordAnalytics(model: AnalyticsModel)
   {
      try
      {
         recordAnalytics(model);
      }
      catch (e)
      {
         console.log(`Error recording analytics: ${e}`);
      }
   }

   const formStyles: any = {};
   if (isWidget)
   {
      formStyles.display = "flex";
      formStyles.flexGrow = 1;
   }


   /***************************************************************************
    **
    ***************************************************************************/
   function makeMainCardStyles(theme: Theme)
   {
      const mainCardStyles: any = {};

      if (!isWidget && !isModal)
      {
         ////////////////////////////////////////////////////////////////
         // remove margin around card for non-widget, non-modal, small //
         ////////////////////////////////////////////////////////////////
         mainCardStyles[theme.breakpoints.down("sm")] = {
            marginLeft: "-1.5rem",
            marginRight: "-1.5rem",
            borderRadius: "0"
         };
      }

      mainCardStyles.minHeight = `calc(100vh - ${isModal ? 150 : 400}px)`;
      if (!processError && (qJobRunning || activeStep === null) && !isModal && !isWidget)
      {
         mainCardStyles.background = "var(--qqq-surface-color, #FFFFFF)";
         mainCardStyles.boxShadow = "none";
      }

      if (isWidget)
      {
         mainCardStyles.background = "none";
         mainCardStyles.boxShadow = "none";
         mainCardStyles.border = "none";
         mainCardStyles.minHeight = "";
         mainCardStyles.alignItems = "stretch";
         mainCardStyles.flexGrow = 1;
         mainCardStyles.display = "flex";
      }

      return mainCardStyles;
   }

   let nextButtonLabel = "Next";
   let nextButtonIcon = "arrow_forward";
   if (overrideOnLastStep !== null)
   {
      if (overrideOnLastStep)
      {
         nextButtonLabel = "Submit";
         nextButtonIcon = "check";
      }
   }
   else if (onLastStep)
   {
      nextButtonLabel = "Submit";
      nextButtonIcon = "check";
   }

   const form = (
      <Formik
         enableReinitialize
         initialValues={initialValues}
         validationSchema={validationScheme}
         validation={validationFunction}
         onSubmit={handleFormSubmit}
      >
         {({
            values, errors, touched, isSubmitting, setFieldValue, setTouched
         }) =>
         {
            //////////////////////////////////////////////////////////////////
            // once we're in the formik form, capture some of its functions //
            // over top of the default ones we created globally             //
            //////////////////////////////////////////////////////////////////
            formikSetFieldValueFunction = setFieldValue;
            formikSetTouched = setTouched;

            return (
               <Form style={formStyles} id={formId} autoComplete="off">
                  <Card sx={makeMainCardStyles}>
                     {
                        !isWidget && processMetaData?.stepFlow == "LINEAR" && (
                           <Box mx={2} mt={-3} sx={{"& .MuiStepper-horizontal": {minHeight: "5rem"}}}>
                              <Stepper activeStep={activeStepIndex} alternativeLabel sx={(theme: Theme) =>
                              {
                                 return {
                                    background: linearGradient(theme.palette.gradients[preferredColorNameInfoOrPrimary()].main, theme.palette.gradients[preferredColorNameInfoOrPrimary()].state)
                                 }
                              }}>
                                 {steps.map((step) => (
                                    <Step key={step.name}>
                                       <StepLabel>{step.label}</StepLabel>
                                    </Step>
                                 ))}
                              </Stepper>
                           </Box>
                        )
                     }

                     <Box p={3}>
                        <Box pb={isWidget ? 6 : "initial"}>
                           {/***************************************************************************
                            ** step content - e.g., the appropriate form or other screen for the step **
                            ***************************************************************************/}
                           {getDynamicStepContent(
                              activeStepIndex,
                              activeStep,
                              {
                                 values,
                                 touched,
                                 formFields,
                                 errors,
                              },
                              processError,
                              processValues,
                              recordConfig,
                              setFieldValue,
                           )}
                           {/********************************
                            ** back &| next/submit buttons **
                            ********************************/}
                           <Box mt={3} width="100%" display="flex" justifyContent="flex-end" position={isWidget ? "absolute" : "initial"} bottom={isWidget ? "3rem" : "initial"} right={isWidget ? "1.5rem" : "initial"}>
                              {processError || qJobRunning || !activeStep || activeStep?.format?.toLowerCase() == "scanner" ? (
                                 <Box />
                              ) : (
                                 <>
                                    {
                                       noMoreSteps && <QCancelButton
                                          onClickHandler={() => handleCancelClicked(true)}
                                          label={isModal ? "Close" : "Return"}
                                          iconName={isModal ? "cancel" : "arrow_back"}
                                          disabled={isSubmitting} />
                                    }
                                    {
                                       !noMoreSteps && (
                                          <Box component="div" py={3}>
                                             <Grid container justifyContent="flex-end" spacing={3}>
                                                {
                                                   !isWidget && (
                                                      <QCancelButton onClickHandler={() => handleCancelClicked(false)} disabled={isSubmitting} />
                                                   )
                                                }

                                                {backStepName ? (
                                                   <QAlternateButton label="Back" onClick={handleBack} disabled={isSubmitting} iconName="arrow_back" />
                                                ) : (
                                                   <Box />
                                                )}

                                                <QSubmitButton label={nextButtonLabel} iconName={nextButtonIcon} disabled={isSubmitting} />
                                             </Grid>
                                          </Box>
                                       )
                                    }
                                 </>
                              )}
                           </Box>
                        </Box>
                     </Box>
                  </Card>
               </Form>
            );
         }}
      </Formik>
   );

   const body = (
      <Box py={3} mb={20} className="processRun">
         <Grid container justifyContent="center" alignItems="center" mt={{xs: 0, md: 6}} sx={{height: "100%"}}>
            <Grid item xs={12} lg={10} xl={8}>
               {form}
               {formError && <Alert severity="error" onClose={() => setFormError(null)} sx={{position: "fixed", top: "40px", left: "10vw", width: "calc(80vw)", zIndex: "99999"}}>{formError}</Alert>}
            </Grid>
         </Grid>
      </Box>
   );

   if (isModal)
   {
      return (
         <Box sx={{position: "absolute", overflowY: "auto", maxHeight: "100%", width: "100%"}} id="modalProcessScrollContainer">
            {body}
         </Box>
      );
   }
   else if (isWidget)
   {
      return (
         <Box sx={{alignItems: "stretch", flexGrow: 1, display: "flex", marginTop: "0px", paddingTop: "0px", height: "100%"}}>
            {form}
         </Box>
      );
   }
   {
      return (
         <BaseLayout>
            {body}
         </BaseLayout>
      );
   }
}

ProcessRun.defaultProps = {
   process: null,
   defaultProcessValues: {},
   isModal: false,
   isWidget: false,
   isReport: false,
   recordIds: null,
   closeModalHandler: null,
   forceReInit: 0,
   overrideLabel: null,
};

export default ProcessRun;
