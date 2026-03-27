/*
 * QQQ - Low-code Application Framework for Engineers.
 * Copyright (C) 2021-2026.  Kingsrook, LLC
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

import {Alert} from "@mui/material";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Icon from "@mui/material/Icon";
import {QTableSection} from "@qrunio/qqq-frontend-core/lib/model/metaData/QTableSection";
import {Form, Formik, useFormikContext} from "formik";
import QRecordSidebar from "qqq/components/misc/RecordSidebar";
import RecordScreenContext from "qqq/pages/records/RecordScreenContext";
import RecordScreenSection from "qqq/pages/records/RecordScreenSection";
import {UseRecordScreenResult} from "qqq/pages/records/useRecordScreen";
import {sanitizeId} from "qqq/utils/qqqIdUtils";
import React, {useCallback, useEffect, useRef, useMemo} from "react";
import * as Yup from "yup";


interface RecordScreenBodyProps
{
   screen: UseRecordScreenResult;
   formId?: string;
   onSubmit: (values: any, actions: any) => Promise<void>;
   formikSubmitRef?: React.MutableRefObject<() => void>;
   renderT1Card?: () => JSX.Element;
   renderBottomBar?: (isSubmitting: boolean) => JSX.Element;
   showSidebar?: boolean;
   widgetReloadCounter?: number;
   enterEditMode?: (fieldName?: string) => void;
}


/***************************************************************************
 ** Shared Formik-wrapped body used by both full-page RecordScreen and
 ** RecordScreenModal.  Handles context, value tracking, sections, alerts.
 ***************************************************************************/
export default function RecordScreenBody({screen, formId, onSubmit, formikSubmitRef, renderT1Card, renderBottomBar, showSidebar = true, widgetReloadCounter = 0, enterEditMode}: RecordScreenBodyProps): JSX.Element
{
   const {
      mode, record, tableMetaData, metaData,
      tableSections, t1Section, nonT1Sections,
      formFieldsBySection, initialValues, formValidations,
      fieldRules,
      errorMessage, successMessage, warningMessage, notAllowedError,
      handleFieldChange, handleFieldBlur, reloadWidget,
      collapsibleSectionOpenStates, toggleCollapsibleSectionOpenState, openCollapsedSectionsWithErrorFields,
      setSuccessMessage, setWarningMessage, setErrorMessage,
      setFieldValueRef, formValuesRef,
      childListWidgetData,
      openAddChildRecord, openEditChildRecord, deleteChildRecord,
      tableVariant,
      sectionVisibility,
      addSubValidations,
   } = screen;

   const isEditing = mode === "edit" || mode === "create";
   const tableNameForId = tableMetaData ? sanitizeId(tableMetaData.name) : "";

   // formik JSON ref for change detection
   const formValuesJSONRef = useRef<string>("");

   // Stable wrapper for setFieldValue
   const stableSetFieldValue = useCallback((name: string, value: any, shouldValidate?: boolean) =>
   {
      setFieldValueRef.current?.(name, value, shouldValidate);
   }, []);

   const isFormDisabled = !!notAllowedError;

   const contextValue = useMemo(() => ({
      mode,
      tableMetaData,
      metaData,
      record,
      setFieldValue: stableSetFieldValue,
      handleFieldBlur,
      reloadWidget,
      fieldRules,
      isFormDisabled,
      addSubValidations,
      childListWidgetData,
      openAddChildRecord,
      openEditChildRecord,
      deleteChildRecord,
   }), [mode, tableMetaData, metaData, record, stableSetFieldValue, reloadWidget, fieldRules, isFormDisabled, addSubValidations, childListWidgetData]);


   //////////////////////////////////////////////
   // Formik value-change tracker component    //
   //////////////////////////////////////////////
   const FormikValueTracker = (): JSX.Element =>
   {
      const {values, dirty, setFieldValue} = useFormikContext<any>();

      setFieldValueRef.current = setFieldValue;

      if (values)
      {
         const newJSON = JSON.stringify(values);
         if (formValuesJSONRef.current !== newJSON)
         {
            const valueChangesToMake: { [fieldName: string]: any } = {};

            if (dirty)
            {
               for (let fieldName in values)
               {
                  if (formValuesRef.current[fieldName] !== values[fieldName])
                  {
                     handleFieldChange(fieldName, formValuesRef.current[fieldName], values[fieldName], valueChangesToMake);
                  }
                  formValuesRef.current[fieldName] = values[fieldName];
               }
            }
            else
            {
               for (let fieldName in values)
               {
                  formValuesRef.current[fieldName] = values[fieldName];
               }
            }

            for (let fieldName in valueChangesToMake)
            {
               formValuesRef.current[fieldName] = valueChangesToMake[fieldName];
               setFieldValue(fieldName, valueChangesToMake[fieldName], false);
            }

            formValuesJSONRef.current = JSON.stringify(values);
         }
      }

      return null;
   };


   const renderAlerts = () => (
      <>
         {successMessage && (
            <Alert color="success" sx={{mb: 3, zIndex: 99, position: "sticky", top: "12px"}} onClose={() => setSuccessMessage(null)}>
               {successMessage}
            </Alert>
         )}
         {warningMessage && (
            <Alert color="warning" sx={{mb: 3}} icon={<Icon>warning</Icon>} onClose={() => setWarningMessage(null)}>
               {warningMessage}
            </Alert>
         )}
         {errorMessage && (
            <Alert color="error" sx={{mb: 3}} onClose={() => setErrorMessage(null)}>
               {errorMessage}
            </Alert>
         )}
         {notAllowedError && isEditing && (
            <Alert severity="error" sx={{mb: 3}}>
               {notAllowedError}
            </Alert>
         )}
      </>
   );

   const renderNonT1Sections = (includeT1?: boolean) =>
   {
      const sectionsToRender = includeT1 && t1Section ? [t1Section, ...nonT1Sections] : nonT1Sections;
      return (
         <Grid container spacing={3} pb={4}>
            {sectionsToRender.map((section: QTableSection) =>
            {
               const open = collapsibleSectionOpenStates[section.name];
               const gridCols = section.widgetName
                  ? (metaData?.widgets?.get(section.widgetName)?.gridColumns ?? 12)
                  : (section.gridColumns ?? 12);

               const isSectionVisible = sectionVisibility[section.name] !== false;

               return (
                  <Grid
                     id={section.name}
                     key={section.name}
                     item
                     lg={gridCols}
                     xs={12}
                     className={`form-section-wrapper ${isSectionVisible ? "is-visible" : "is-hidden"}`}
                     sx={{display: "flex", alignItems: "stretch", scrollMarginTop: "100px"}}
                  >
                     <Box width="100%" height={open !== false ? "100%" : "auto"}>
                        <RecordScreenSection
                           section={section}
                           mode={mode}
                           record={record}
                           formFieldsBySection={formFieldsBySection}
                           isOpen={open}
                           onToggleCollapse={() => toggleCollapsibleSectionOpenState(section.name)}
                           tableVariant={tableVariant}
                           onEditIconClick={enterEditMode}
                           widgetReloadCounter={widgetReloadCounter}
                        />
                     </Box>
                  </Grid>
               );
            })}
         </Grid>
      );
   };

   const validationSchema = Yup.object().shape(formValidations);

   const effectiveFormId = formId || `record-screen-form-${tableNameForId}`;

   return (
      <>
         {renderAlerts()}

         <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={onSubmit}
            enableReinitialize
         >
            {({isSubmitting, setFieldValue, submitForm}) =>
            {
               setFieldValueRef.current = setFieldValue;
               if (formikSubmitRef)
               {
                  formikSubmitRef.current = submitForm;
               }

               const FormWrapper = isEditing ? Form : "div";

               return (
                  <RecordScreenContext.Provider value={contextValue}>
                     <FormWrapper id={effectiveFormId} autoComplete="off">
                        <FormikValueTracker />
                        {isEditing && <ScrollToFirstError openCollapsedSectionsWithErrorFields={openCollapsedSectionsWithErrorFields} />}

                        {showSidebar ? (
                           <Grid container spacing={3} flexWrap={{md: "nowrap"}}>
                              <Grid item xs={12} lg={3} className="recordSidebar">
                                 <QRecordSidebar tableSections={tableSections} sectionVisibility={sectionVisibility} />
                              </Grid>
                              <Grid item xs={12} lg={9} className="recordWithSidebar">
                                 {renderT1Card && (
                                    <Grid container spacing={3}>
                                       <Grid item xs={12} mb={3}>
                                          {renderT1Card()}
                                       </Grid>
                                    </Grid>
                                 )}

                                 {renderNonT1Sections()}

                                 {renderBottomBar?.(isSubmitting)}
                              </Grid>
                           </Grid>
                        ) : (
                           <>
                              {renderT1Card && <Box mb={3}>{renderT1Card()}</Box>}
                              {renderNonT1Sections(!renderT1Card)}
                              {renderBottomBar?.(isSubmitting)}
                           </>
                        )}
                     </FormWrapper>
                  </RecordScreenContext.Provider>
               );
            }}
         </Formik>
      </>
   );
}


/***************************************************************************
 ** Scroll to the first validation error on submit.
 ***************************************************************************/
function ScrollToFirstError({openCollapsedSectionsWithErrorFields}: {openCollapsedSectionsWithErrorFields: (errorFieldNames: string[]) => void}): JSX.Element
{
   const {submitCount, isValid, errors} = useFormikContext<any>();

   useEffect(() =>
   {
      if (submitCount === 0 || isValid) return;

      const errorFieldNames = Object.keys(errors);
      if (errorFieldNames.length > 0)
      {
         openCollapsedSectionsWithErrorFields(errorFieldNames);
      }

      setTimeout(() =>
      {
         const firstError = document.querySelector("[data-field-error]");
         if (firstError)
         {
            firstError.scrollIntoView({block: "center"});
         }
      }, 150);
   }, [submitCount, isValid]);

   return null;
}
