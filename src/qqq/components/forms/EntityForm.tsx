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

import {Alert} from "@mui/material";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import Icon from "@mui/material/Icon";
import Modal from "@mui/material/Modal";
import {Capability} from "@qrunio/qqq-frontend-core/lib/model/metaData/Capability";
import {QFieldMetaData} from "@qrunio/qqq-frontend-core/lib/model/metaData/QFieldMetaData";
import {QFieldType} from "@qrunio/qqq-frontend-core/lib/model/metaData/QFieldType";
import {QInstance} from "@qrunio/qqq-frontend-core/lib/model/metaData/QInstance";
import {QTableMetaData} from "@qrunio/qqq-frontend-core/lib/model/metaData/QTableMetaData";
import {QTableSection} from "@qrunio/qqq-frontend-core/lib/model/metaData/QTableSection";
import {QWidgetMetaData} from "@qrunio/qqq-frontend-core/lib/model/metaData/QWidgetMetaData";
import {QPossibleValue} from "@qrunio/qqq-frontend-core/lib/model/QPossibleValue";
import {QRecord} from "@qrunio/qqq-frontend-core/lib/model/QRecord";
import FormData from "form-data";
import {Form, Formik, FormikErrors, FormikTouched, FormikValues, useFormikContext} from "formik";
import QContext from "QContext";
import {QCancelButton, QSaveButton} from "qqq/components/buttons/DefaultButtons";
import QDynamicForm from "qqq/components/forms/DynamicForm";
import DynamicFormUtils, {DynamicFormFieldDefinition} from "qqq/components/forms/DynamicFormUtils";
import MDTypography from "qqq/components/legacy/MDTypography";
import HelpContent from "qqq/components/misc/HelpContent";
import QRecordSidebar from "qqq/components/misc/RecordSidebar";
import CronUIWidget from "qqq/components/widgets/misc/CronUIWidget";
import DynamicFormWidget from "qqq/components/widgets/misc/DynamicFormWidget";
import FilterAndColumnsSetupWidget from "qqq/components/widgets/misc/FilterAndColumnsSetupWidget";
import PivotTableSetupWidget from "qqq/components/widgets/misc/PivotTableSetupWidget";
import RecordGridWidget, {ChildRecordListData} from "qqq/components/widgets/misc/RecordGridWidget";
import RowBuilderWidget from "qqq/components/widgets/misc/RowBuilderWidget";
import {FieldRule, FieldRuleAction, FieldRuleTrigger} from "qqq/models/fields/FieldRules";
import HtmlUtils from "qqq/utils/HtmlUtils";
import {sanitizeId} from "qqq/utils/qqqIdUtils";
import Client from "qqq/utils/qqq/Client";
import TableUtils from "qqq/utils/qqq/TableUtils";
import ValueUtils from "qqq/utils/qqq/ValueUtils";
import React, {useContext, useEffect, useReducer, useState} from "react";
import {useLocation, useNavigate, useParams} from "react-router-dom";
import {Value} from "sass";
import * as Yup from "yup";

interface Props
{
   id?: string,
   isModal: boolean,
   table?: QTableMetaData,
   closeModalHandler?: (event: object, reason: string) => void,
   defaultValues: { [key: string]: string },
   disabledFields: { [key: string]: boolean } | string[],
   isCopy?: boolean,
   onSubmitCallback?: (values: any, tableName: string) => void,
   overrideHeading?: string,
   saveButtonLabel?: string,
   saveButtonIcon?: string,
}

EntityForm.defaultProps = {
   id: null,
   isModal: false,
   table: null,
   closeModalHandler: null,
   defaultValues: {},
   disabledFields: {},
   isCopy: false,
   onSubmitCallback: null,
   saveButtonLabel: "Save",
   saveButtonIcon: "save",
};


////////////////////////////////////////////////////////////////////////////
// define a function that we can make referenes to, which we'll overwrite //
// with formik's setFieldValue function, once we're inside formik.        //
////////////////////////////////////////////////////////////////////////////
let formikSetFieldValueFunction = (field: string, value: any, shouldValidate?: boolean): void =>
{
};

function EntityForm(props: Props): JSX.Element
{
   const qController = Client.getInstance();
   const tableNameParam = useParams().tableName;
   const tableName = props.table === null ? tableNameParam : props.table.name;
   const {accentColor, recordAnalytics} = useContext(QContext);

   const [formTitle, setFormTitle] = useState("");
   const [validations, setValidations] = useState({} as Yup.BaseSchema);
   const [baseFormValidations, setBaseFormValidations] = useState({} as Record<string, Yup.BaseSchema>);
   const [subFormValidations, setSubFormValidations] = useState({} as Record<string, Record<string, Yup.BaseSchema>>);
   const [initialValues, setInitialValues] = useState({} as { [key: string]: any });
   const [formFieldsBySection, setFormFieldsBySection] = useState(null as Map<string, DynamicFormFieldDefinition[]>);
   const [allFormFields, setAllFormFields] = useState(null as { [key: string]: DynamicFormFieldDefinition });
   const [t1section, setT1Section] = useState(null as QTableSection);
   const [t1sectionName, setT1SectionName] = useState(null as string);
   const [nonT1Sections, setNonT1Sections] = useState([] as QTableSection[]);

   const [alertContent, setAlertContent] = useState("");
   const [warningContent, setWarningContent] = useState("");

   const [asyncLoadInited, setAsyncLoadInited] = useState(false);
   const [tableMetaData, setTableMetaData] = useState(null as QTableMetaData);
   const [fieldRules, setFieldRules] = useState([] as FieldRule[]);
   const [metaData, setMetaData] = useState(null as QInstance);
   const [record, setRecord] = useState(null as QRecord);
   const [tableSections, setTableSections] = useState(null as QTableSection[]);
   const [sectionVisibility, setSectionVisibility] = useState({} as { [key: string]: boolean });
   const [renderedWidgetSections, setRenderedWidgetSections] = useState({} as { [name: string]: JSX.Element });
   const [childListWidgetData, setChildListWidgetData] = useState({} as { [name: string]: ChildRecordListData });
   const [associationsFromWidgets, setAssociationsFromWidgets] = useState({} as Record<string, QRecord[]>);
   const [, forceUpdate] = useReducer((x) => x + 1, 0);

   const [showEditChildForm, setShowEditChildForm] = useState(null as any);
   const [modalDataChangedCounter, setModalDataChangedCount] = useState(0);

   const [notAllowedError, setNotAllowedError] = useState(null as string);

   const [formValuesJSON, setFormValuesJSON] = useState("");
   const [formValues, setFormValues] = useState({} as { [name: string]: any });

   const {pageHeader, setPageHeader} = useContext(QContext);

   const navigate = useNavigate();
   const location = useLocation();

   const cardElevation = props.isModal ? 3 : 0;

   ////////////////////////////////////////////////////////////////////
   // first take defaultValues and disabledFields from props         //
   // but, also allow them to be sent in the hash, in the format of: //
   // #/defaultValues={jsonName=value}/disabledFields={jsonName=any} //
   ////////////////////////////////////////////////////////////////////
   let defaultValues = props.defaultValues;
   let disabledFields = props.disabledFields;

   const hashParts = location.hash.split("/");
   for (let i = 0; i < hashParts.length; i++)
   {
      try
      {
         const parts = hashParts[i].split("=");
         if (parts.length > 1)
         {
            const name = parts[0].replace(/^#/, "");
            const value = parts[1];
            if (name == "defaultValues")
            {
               defaultValues = JSON.parse(decodeURIComponent(value)) as { [key: string]: any };
            }

            if (name == "disabledFields")
            {
               disabledFields = JSON.parse(decodeURIComponent(value)) as { [key: string]: any };
            }
         }
      }
      catch (e)
      {
      }
   }


   /*******************************************************************************
    **
    *******************************************************************************/
   function openAddChildRecord(name: string, widgetData: any)
   {
      let defaultValues = widgetData.defaultValuesForNewChildRecords || {};

      let disabledFields = widgetData.disabledFieldsForNewChildRecords;
      if (!disabledFields)
      {
         disabledFields = widgetData.defaultValuesForNewChildRecords;
      }

      ///////////////////////////////////////////////////////////////////////////////////////
      // copy values from specified fields in the parent record down into the child record //
      ///////////////////////////////////////////////////////////////////////////////////////
      if (widgetData.defaultValuesForNewChildRecordsFromParentFields)
      {
         for (let childField in widgetData.defaultValuesForNewChildRecordsFromParentFields)
         {
            const parentField = widgetData.defaultValuesForNewChildRecordsFromParentFields[childField];
            defaultValues[childField] = formValues[parentField];
         }
      }

      doOpenEditChildForm(name, widgetData.childTableMetaData, null, defaultValues, disabledFields);
   }


   /*******************************************************************************
    **
    *******************************************************************************/
   function openEditChildRecord(name: string, widgetData: any, rowIndex: number)
   {
      let defaultValues = widgetData.queryOutput.records[rowIndex].values;

      let disabledFields = widgetData.disabledFieldsForNewChildRecords;
      if (!disabledFields)
      {
         disabledFields = widgetData.defaultValuesForNewChildRecords;
      }

      doOpenEditChildForm(name, widgetData.childTableMetaData, rowIndex, defaultValues, disabledFields);
   }


   /*******************************************************************************
    **
    *******************************************************************************/
   function deleteChildRecord(name: string, widgetData: any, rowIndex: number)
   {
      updateChildRecordList(name, "delete", rowIndex);
   }


   /*******************************************************************************
    **
    *******************************************************************************/
   function doOpenEditChildForm(widgetName: string, table: QTableMetaData, rowIndex: number, defaultValues: any, disabledFields: any)
   {
      const showEditChildForm: any = {};
      showEditChildForm.widgetName = widgetName;
      showEditChildForm.table = table;
      showEditChildForm.rowIndex = rowIndex;
      showEditChildForm.defaultValues = defaultValues;
      showEditChildForm.disabledFields = disabledFields;
      setShowEditChildForm(showEditChildForm);
   }


   /*******************************************************************************
    **
    *******************************************************************************/
   const closeEditChildForm = (event: object, reason: string) =>
   {
      if (reason === "backdropClick" || reason === "escapeKeyDown")
      {
         return;
      }

      setShowEditChildForm(null);
   };


   /*******************************************************************************
    **
    *******************************************************************************/
   function submitEditChildForm(values: any, tableName: string)
   {
      updateChildRecordList(showEditChildForm.widgetName, showEditChildForm.rowIndex == null ? "insert" : "edit", showEditChildForm.rowIndex, values, tableName);
   }


   /*******************************************************************************
    **
    *******************************************************************************/
   async function updateChildRecordList(widgetName: string, action: "insert" | "edit" | "delete", rowIndex?: number, values?: any, childTableName?: string)
   {
      const metaData = await qController.loadMetaData();
      const widgetMetaData = metaData.widgets.get(widgetName);

      const newChildListWidgetData: { [name: string]: ChildRecordListData } = Object.assign({}, childListWidgetData);
      if (!newChildListWidgetData[widgetName].queryOutput.records)
      {
         newChildListWidgetData[widgetName].queryOutput.records = [];
      }

      ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
      // build a map of display values for the new record, specifically, for any possible-values that need translated. //
      ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
      const displayValues: { [fieldName: string]: string } = {};
      if (childTableName && values)
      {
         ///////////////////////////////////////////////////////////////////////////////////////////////////////
         // this function internally memoizes, so, we could potentially avoid an await here, but, seems ok... //
         ///////////////////////////////////////////////////////////////////////////////////////////////////////
         const childTableMetaData = await qController.loadTableMetaData(childTableName);
         for (let key in values)
         {
            const value = values[key];
            const field = childTableMetaData.fields.get(key);
            if (field.possibleValueSourceName)
            {
               const possibleValues = await qController.possibleValues(childTableName, null, field.name, null, [value], null, objectToMap(values), "form");
               if (possibleValues && possibleValues.length > 0)
               {
                  displayValues[key] = possibleValues[0].label;
               }
            }
         }
      }

      switch (action)
      {
         case "insert":
            newChildListWidgetData[widgetName].queryOutput.records.push({values: values, displayValues: displayValues});
            break;
         case "edit":
            newChildListWidgetData[widgetName].queryOutput.records[rowIndex] = {values: values, displayValues: displayValues};
            break;
         case "delete":
            newChildListWidgetData[widgetName].queryOutput.records.splice(rowIndex, 1);
            break;
      }
      newChildListWidgetData[widgetName].totalRows = newChildListWidgetData[widgetName].queryOutput.records.length;
      setChildListWidgetData(newChildListWidgetData);

      const newRenderedWidgetSections = Object.assign({}, renderedWidgetSections);
      newRenderedWidgetSections[widgetName] = getWidgetSection(widgetMetaData, newChildListWidgetData[widgetName]);
      setRenderedWidgetSections(newRenderedWidgetSections);
      forceUpdate();

      setModalDataChangedCount(modalDataChangedCounter + 1);

      setShowEditChildForm(null);
   }


   /*******************************************************************************
    ** Watch the record values - if they change, re-render widgets
    *******************************************************************************/
   useEffect(() =>
   {
      const newRenderedWidgetSections: { [name: string]: JSX.Element } = {};
      for (let widgetName in renderedWidgetSections)
      {
         const widgetMetaData = metaData.widgets.get(widgetName);
         newRenderedWidgetSections[widgetName] = getWidgetSection(widgetMetaData, childListWidgetData[widgetName]);
      }
      setRenderedWidgetSections(newRenderedWidgetSections);
   }, [formValuesJSON]);


   /***************************************************************************
    *
    ***************************************************************************/
   const doSetAllFormFields = (newAllFormFields: { [fieldName: string]: DynamicFormFieldDefinition }): void =>
   {
      setAllFormFields(newAllFormFields);

      ///////////////////////////////////////////////////////////////
      // figure out, per section, if it's totally invisible or not //
      ///////////////////////////////////////////////////////////////
      figureOutSectionVisibility(newAllFormFields, formFieldsBySection);
   };


   /***************************************************************************
    *
    ***************************************************************************/
   const figureOutSectionVisibility = (allFormFields: { [fieldName: string]: DynamicFormFieldDefinition }, localFormFieldsBySection: Map<string, DynamicFormFieldDefinition[]>) =>
   {
      const newSectionVisibility: { [key: string]: boolean } = {};

      ///////////////////////////////
      // iterate over the sections //
      ///////////////////////////////
      for (let sectionName of localFormFieldsBySection.keys())
      {
         let anyVisibleFields = false;
         for (let dynamicField of localFormFieldsBySection.get(sectionName))
         {
            const field = allFormFields[dynamicField.name];

            if (field.omitFromQDynamicForm)
            {
               continue;
            }

            if (field.fieldMetaData.isHidden)
            {
               continue;
            }

            anyVisibleFields = true;
            break;
         }

         newSectionVisibility[sectionName] = anyVisibleFields;
      }

      setSectionVisibility(newSectionVisibility);
   };


   /*******************************************************************************
    ** render a section (full of fields) as a form
    *******************************************************************************/
   function getFormSection(section: QTableSection, values: any, touched: any, formFieldsForSection: DynamicFormFieldDefinition[], errors: any, omitWrapper = false): JSX.Element
   {
      const formData: any = {};
      formData.values = values;
      formData.touched = touched;
      formData.errors = errors;
      formData.formFields = allFormFields;

      ////////////////////////////////////////////////////////////////////////////////////////////////
      // build array of field names for this section, which is what we'll pass in to <QDynamicForm> //
      // also, set up the otherValues map on possible-value fields for this section                 //
      ////////////////////////////////////////////////////////////////////////////////////////////////
      const fieldNamesToIncludeForSection: string[] = [];
      for (let i = 0; i < formFieldsForSection.length; i++)
      {
         const formField = formFieldsForSection[i];
         fieldNamesToIncludeForSection.push(formField.name);

         if (formField.possibleValueProps)
         {
            formField.possibleValueProps.otherValues = formField.possibleValueProps.otherValues ?? new Map<string, any>();
            Object.keys(allFormFields).forEach((otherFieldName) =>
            {
               formField.possibleValueProps.otherValues.set(otherFieldName, values[otherFieldName]);
            });
         }
      }

      if (fieldNamesToIncludeForSection.length == 0)
      {
         return <div>Error: No form fields in section {section.name}</div>;
      }

      const helpRoles = [props.id ? "EDIT_SCREEN" : "INSERT_SCREEN", "WRITE_SCREENS", "ALL_SCREENS"];

      const form = <QDynamicForm
         formData={formData}
         record={record}
         helpRoles={helpRoles}
         helpContentKeyPrefix={`table:${tableName};`}
         fieldNamesToInclude={fieldNamesToIncludeForSection}
         setFormFields={doSetAllFormFields}
         updateSections={(updatedSections) => updateSections(tableMetaData, updatedSections, false)}
      />;

      if (omitWrapper)
      {
         return form
      }

      return <Card id={section.name} sx={{overflow: "visible", scrollMarginTop: "100px"}} elevation={cardElevation} data-qqq-id={`form-section-${sanitizeId(section.name)}`}>
         <MDTypography variant="h6" p={3} pb={1} data-qqq-id={`form-section-header-${sanitizeId(section.name)}`}>
            {section.label}
         </MDTypography>
         {getSectionHelp(section)}
         <Box pb={1} px={3}>
            <Box pb={"0.75rem"} width="100%">
               {form}
            </Box>
         </Box>
      </Card>;
   }


   /*******************************************************************************
    ** if we have a widget that wants to set form-field values, they can take this
    ** function in as a callback, and then call it with their values.
    *******************************************************************************/
   function setFormFieldValuesFromWidget(values: { [name: string]: any })
   {
      for (let key in values)
      {
         formikSetFieldValueFunction(key, values[key]);
      }
   }


   /*******************************************************************************
    ** render a section as a widget
    *******************************************************************************/
   function getWidgetSection(widgetMetaData: QWidgetMetaData, widgetData: any): JSX.Element
   {
      if (widgetMetaData.type == "childRecordList")
      {
         widgetData.viewAllLink = null;
         widgetMetaData.showExportButton = false;

         return Object.keys(childListWidgetData).length > 0 && (<RecordGridWidget
            key={`${formValues["tableName"]}-${modalDataChangedCounter}`}
            widgetMetaData={widgetMetaData}
            data={widgetData}
            disableRowClick
            allowRecordEdit
            allowRecordDelete
            addNewRecordCallback={() => openAddChildRecord(widgetMetaData.name, widgetData)}
            editRecordCallback={(rowIndex) => openEditChildRecord(widgetMetaData.name, widgetData, rowIndex)}
            deleteRecordCallback={(rowIndex) => deleteChildRecord(widgetMetaData.name, widgetData, rowIndex)}
         />);
      }

      if (widgetMetaData.type == "filterAndColumnsSetup")
      {
         /////////////////////////////////////////////////////////////////////////////////////////////////////////
         // if the widget metadata specifies a table name, set form values to that so widget knows which to use //
         // (for the case when it is not being specified by a separate field in the record)                     //
         /////////////////////////////////////////////////////////////////////////////////////////////////////////
         if (widgetData?.tableName)
         {
            formValues["tableName"] = widgetData?.tableName;
         }

         return <FilterAndColumnsSetupWidget
            key={formValues["tableName"]} // todo, is this good?  it was added so that editing values actually re-renders...
            isEditable={true}
            widgetMetaData={widgetMetaData}
            widgetData={widgetData}
            recordValues={formValues}
            label={tableMetaData?.fields.get(widgetData?.filterFieldName ?? "queryFilterJson")?.label}
            onSaveCallback={setFormFieldValuesFromWidget}
         />;
      }

      if (widgetMetaData.type == "pivotTableSetup")
      {
         return <PivotTableSetupWidget
            key={formValues["tableName"]} // todo, is this good?  it was added so that editing values actually re-renders...
            isEditable={true}
            widgetMetaData={widgetMetaData}
            recordValues={formValues}
            onSaveCallback={setFormFieldValuesFromWidget}
         />;
      }

      if (widgetMetaData.type == "dynamicForm")
      {
         return <DynamicFormWidget
            key={formValues["savedReportId"]} // todo - pull this from the metaData (could do so above too...)
            isEditable={true}
            widgetMetaData={widgetMetaData}
            widgetData={widgetData}
            recordValues={formValues}
            record={record}
            onSaveCallback={setFormFieldValuesFromWidget}
         />;
      }

      if (widgetMetaData.type == "rowBuilder")
      {
         return <RowBuilderWidget
            widgetMetaData={widgetMetaData}
            widgetData={widgetData}
            screen="recordEdit"
            parentFormValues={formValues}
            addSubValidations={addSubValidations}
            onSaveCallback={(values) =>
            {
               const associationName = widgetMetaData.defaultValues.get("associationName");
               if (associationName)
               {
                  associationsFromWidgets[associationName] = values[associationName];
                  setAssociationsFromWidgets({...associationsFromWidgets});
               }
               else
               {
                  setFormFieldValuesFromWidget(values);
               }
            }}
         />;
      }

      if (widgetMetaData.type == "cronUI")
      {
         return <CronUIWidget
            widgetMetaData={widgetMetaData}
            widgetData={widgetData}
            screen="recordEdit"
            recordValues={formValues}
            recordDisplayValueMap={record?.displayValues}
            addSubValidations={addSubValidations}
            onSaveCallback={(values: { [name: string]: any }) =>
            {
               setFormFieldValuesFromWidget(values);
            }}
         />;
      }

      /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
      // todo i like the idea of not adding each individual widget to an if above, so we tried to use <DashboardWidgets here //
      // but - that had a bug where, any value change coming out of the widget woudl case a re-render of the widget :(       //
      /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
      // return (<>
      //    {tableMetaData && record && <DashboardWidgets
      //       key={widgetMetaData.name}
      //       tableName={tableMetaData.name}
      //       widgetMetaDataList={[widgetMetaData]}
      //       record={record}
      //       entityPrimaryKey={record.values.get(tableMetaData.primaryKeyField)}
      //       omitWrappingGridContainer={true} screen="recordEdit"
      //       actionCallback={(data: any, eventValues: Record<string, any>): boolean =>
      //       {
      //          setFormFieldValuesFromWidget(data);
      //          return true;
      //       }} />}
      // </>);

      return (<Box>Unsupported widget type: {widgetMetaData.type}</Box>);
   }


   /***************************************************************************
    * let a subcomponent (e.g., widget) add to the yup validation scheme.
    ***************************************************************************/
   function addSubValidations(name: string, validationScheme: Record<string, Yup.BaseSchema>)
   {
      subFormValidations[name] = validationScheme;
      setSubFormValidations({...subFormValidations});
   }


   /*******************************************************************************
    ** render a form section
    *******************************************************************************/
   function renderSection(section: QTableSection, values: FormikValues | Value, touched: FormikTouched<FormikValues> | Value, formFieldsBySection: Map<string, DynamicFormFieldDefinition[]>, errors: FormikErrors<FormikValues> | Value)
   {
      const wrapperProps =
         {
            key: `edit-card-${section.name}`,
            pb: 3,
            ///////////////////////////////////////////////////////////////////////////////////
            // note, widget sections may not get an entry in sectionVisibility - so - assume //
            // that only a false in that map means the section should be hidden.             //
            ///////////////////////////////////////////////////////////////////////////////////
            className: `form-section-wrapper ${sectionVisibility[section.name] === false ? "is-hidden" : "is-visible"}`,
         };

      if (section.fieldNames && section.fieldNames.length > 0)
      {
         return <Box {...wrapperProps}>
            {getFormSection(section, values, touched, formFieldsBySection.get(section.name), errors)}
         </Box>;
      }
      else
      {
         return <Box {...wrapperProps}>
            {renderedWidgetSections[section.widgetName] ?? <Box>Loading {section.label}...</Box>}
         </Box>;
      }
   }


   /*******************************************************************************
    **
    *******************************************************************************/
   function setupFieldRules(tableMetaData: QTableMetaData)
   {
      const mdbMetaData = tableMetaData?.supplementalTableMetaData?.get("materialDashboard");
      if (!mdbMetaData)
      {
         return;
      }

      if (mdbMetaData.fieldRules)
      {
         const newFieldRules: FieldRule[] = [];
         for (let i = 0; i < mdbMetaData.fieldRules.length; i++)
         {
            newFieldRules.push(mdbMetaData.fieldRules[i]);
         }
         setFieldRules(newFieldRules);
      }
   }


   /***************************************************************************
    **
    ***************************************************************************/
   function objectToMap(object: { [key: string]: any }): Map<string, any>
   {
      if (object == null)
      {
         return (null);
      }

      const rs = new Map<string, any>();
      for (let key in object)
      {
         rs.set(key, object[key]);
      }
      return rs;
   }


   /***************************************************************************
    *
    ***************************************************************************/
   const runOnLoadFormAdjuster = async (table: QTableMetaData, initialValues: { [p: string]: any }, defaultDisplayValues: Map<string, string>): Promise<void> =>
   {
      console.log("Running form adjuster for table");

      ////////////////////////////////////////////////////
      // build request to backend for field adjustments //
      ////////////////////////////////////////////////////
      const postBody = new FormData();
      postBody.append("event", "onLoad");
      postBody.append("allValues", JSON.stringify(initialValues));
      const response = await qController.axiosRequest(
         {
            method: "post",
            url: `/material-dashboard-backend/form-adjuster/table:${table.name}/onLoad`,
            data: postBody,
            headers: qController.defaultMultipartFormDataHeaders()
         });

      ///////////////////////////////////////////////////
      // replace field definitions, if we have updates //
      ///////////////////////////////////////////////////
      const updatedFields: { [fieldName: string]: QFieldMetaData } = response.updatedFieldMetaData;
      if (updatedFields)
      {
         for (let updatedFieldName in updatedFields)
         {
            const updatedField = new QFieldMetaData(updatedFields[updatedFieldName]);
            table.fields.set(updatedFieldName, updatedField);
            console.log(`@dk Updating field: ${updatedFieldName}: isHidden: ${updatedField.isHidden}`);
         }
      }

      /////////////////////////
      // update field values //
      /////////////////////////
      const updatedFieldValues: { [fieldName: string]: any } = response?.updatedFieldValues ?? {};
      for (let fieldNameToUpdate in updatedFieldValues)
      {
         initialValues[fieldNameToUpdate] = updatedFieldValues[fieldNameToUpdate];
         ///////////////////////////////////////////////////////////////////////////////////////
         // todo - track if a pvs field gets a value, but not a display value, and fetch it?? //
         ///////////////////////////////////////////////////////////////////////////////////////
      }

      //////////////////////////////////////////////////
      // set display values for PVS's if we have them //
      //////////////////////////////////////////////////
      const updatedFieldDisplayValues: { [fieldName: string]: string } = response?.updatedFieldDisplayValues ?? {};
      for (let fieldNameToUpdate in updatedFieldDisplayValues)
      {
         defaultDisplayValues?.set(fieldNameToUpdate, updatedFieldDisplayValues[fieldNameToUpdate]);
      }

      ////////////////////////////////////////
      // clear field values if we have them //
      ////////////////////////////////////////
      const fieldsToClear: string[] = response?.fieldsToClear ?? [];
      for (let fieldToClear of fieldsToClear)
      {
         initialValues[fieldToClear] = null;
      }

      /////////////////////////////////////
      // update sections, if we got them //
      /////////////////////////////////////
      if(response?.updatedSectionMetaData)
      {
         updateSections(table, response.updatedSectionMetaData, true);
      }
   };


   /***************************************************************************
    *
    ***************************************************************************/
   async function updateSections(table: QTableMetaData, updatedSections: Record<string, QTableSection>, isInitialLoad: boolean)
   {
      for (let name in updatedSections)
      {
         for (let i = 0; i < (table.sections ?? []).length; i++)
         {
            const section = table.sections[i];
            if (section.name == name)
            {
               table.sections[i] = new QTableSection(updatedSections[name]);
            }
         }
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////////
      // if this is an on-change (e.g., not an on-load), then we need to update state based on the new sections //
      ////////////////////////////////////////////////////////////////////////////////////////////////////////////
      if(!isInitialLoad)
      {
         const tableSections = processTableSections(table, metaData);

         const newNonT1Sections: QTableSection[] = [];
         for (let i = 0; i < tableSections.length; i++)
         {
            const tableSection = tableSections[i];
            if(tableSection.tier == "T1")
            {
               continue;
            }

            if(tableSection.isHidden || (!tableSection.widgetName && !formFieldsBySection.get(tableSection.name)))
            {
               ///////////////////////////////////////////////////////////////////////////////////////////////////
               // todo - we should probably keep hidden sections in the list, and marking their visibility      //
               // as hidden, for the sake of CSS animation, that depends on is-hidden and is-visible classes... //
               ///////////////////////////////////////////////////////////////////////////////////////////////////
               tableSections.splice(i, 1);
               i--;
               continue;
            }

            newNonT1Sections.push(tableSection);
         }

         setTableSections(tableSections);
         setNonT1Sections(newNonT1Sections);

         //////////////////////////////////////////////////////////////////////////////////////////////////////
         // if any widgets haven't been loaded before (e.g., they were initially hidden), then load them now //
         //////////////////////////////////////////////////////////////////////////////////////////////////////
         const newRenderedWidgetSections = Object.assign({}, renderedWidgetSections);
         const newChildListWidgetData = Object.assign({}, childListWidgetData);
         let loadedAnyWidgets = false;
         for (let section of tableSections)
         {
            if(section.widgetName && !renderedWidgetSections[section.widgetName])
            {
               const widgetMetaData = metaData?.widgets.get(section.widgetName);
               const widgetData = await qController.widget(widgetMetaData.name, makeFormDataWithIdAndObject(tableMetaData, defaultValues));

               newRenderedWidgetSections[section.widgetName] = getWidgetSection(widgetMetaData, widgetData);
               newChildListWidgetData[section.widgetName] = widgetData;
               loadedAnyWidgets = true;
            }
         }

         if(loadedAnyWidgets)
         {
            setRenderedWidgetSections(newRenderedWidgetSections);
            setChildListWidgetData(newChildListWidgetData);
         }
      }
   }


   /***************************************************************************
    *
    ***************************************************************************/
   function processTableSections(tableMetaData: QTableMetaData, metaData: QInstance)
   {
      const tableSections = TableUtils.getSectionsForRecordSidebar(tableMetaData, [...tableMetaData.fields.keys()], (section: QTableSection) =>
      {
         const widget = metaData?.widgets?.get(section.widgetName);
         if (widget)
         {
            if (widget.type == "childRecordList" && widget.defaultValues?.has("manageAssociationName"))
            {
               return (true);
            }

            if (widget.type == "filterAndColumnsSetup" || widget.type == "pivotTableSetup" || widget.type == "dynamicForm")
            {
               return (true);
            }

            //////////////////////////////////////////////////////////////////////////////////////////////////////
            // rather than continue to add checks for specific types, just look for this value in the meta data //
            //////////////////////////////////////////////////////////////////////////////////////////////////////
            if (widget.defaultValues?.get("includeOnRecordEditScreen"))
            {
               return (true);
            }
         }

         return (false);
      });

      return tableSections;
   }


   //////////////////
   // initial load //
   //////////////////
   useEffect(() =>
   {
      if (!asyncLoadInited)
      {
         setAsyncLoadInited(true);
         (async () =>
         {
            ////////////////////////////////////////////////////////////////////////////////////////////
            // fetch table meta data, but work on a clone of it, in case form adjusters change things //
            ////////////////////////////////////////////////////////////////////////////////////////////
            const tableMetaData = (await qController.loadTableMetaData(tableName)).clone();
            setTableMetaData(tableMetaData);
            recordAnalytics({location: window.location, title: (props.isCopy ? "Copy" : props.id ? "Edit" : "New") + ": " + tableMetaData.label});

            setupFieldRules(tableMetaData);

            const metaData = await qController.loadMetaData();
            setMetaData(metaData);

            /////////////////////////////////////////////////////////////////////////////////////////
            // if doing an edit or copy, fetch the record and pre-populate the form values from it //
            /////////////////////////////////////////////////////////////////////////////////////////
            let record: QRecord = null;
            let defaultDisplayValues = new Map<string, string>();
            if (props.id !== null)
            {
               record = await qController.get(tableName, props.id);
               setRecord(record);
               recordAnalytics({category: "tableEvents", action: props.isCopy ? "copy" : "edit", label: tableMetaData?.label + " / " + record?.recordLabel});

               const titleVerb = props.isCopy ? "Copy" : "Edit";
               setFormTitle(`${titleVerb} ${tableMetaData?.label}: ${record?.recordLabel}`);

               if (!props.isModal)
               {
                  setPageHeader(`${titleVerb} ${tableMetaData?.label}: ${record?.recordLabel}`);
               }

               tableMetaData.fields.forEach((fieldMetaData, key) =>
               {
                  if (props.isCopy && fieldMetaData.name == tableMetaData.primaryKeyField)
                  {
                     return;
                  }
                  initialValues[key] = record.values.get(key);
               });

               /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
               // these checks are only for updating records, if copying, it is actually an insert, which is checked after this block //
               /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
               if (!props.isCopy)
               {
                  if (!tableMetaData.capabilities.has(Capability.TABLE_UPDATE))
                  {
                     setNotAllowedError("Records may not be edited in this table");
                  }
                  else if (!tableMetaData.editPermission)
                  {
                     setNotAllowedError(`You do not have permission to edit ${tableMetaData.label} records`);
                  }
               }
            }
            else
            {
               ///////////////////////////////////////////
               // else handle preparing to do an insert //
               ///////////////////////////////////////////
               setFormTitle(`Creating New ${tableMetaData?.label}`);
               recordAnalytics({category: "tableEvents", action: "new", label: tableMetaData?.label});

               if (!props.isModal)
               {
                  setPageHeader(`Creating New ${tableMetaData?.label}`);
               }

               ////////////////////////////////////////////////////////////////////////////////////////////////
               // if default values were supplied for a new record, then populate initialValues, for formik. //
               ////////////////////////////////////////////////////////////////////////////////////////////////
               for (let fieldName of tableMetaData.fields.keys())
               {
                  const fieldMetaData = tableMetaData.fields.get(fieldName);
                  const defaultValue = (defaultValues && defaultValues[fieldName]) ? defaultValues[fieldName] : fieldMetaData.defaultValue;
                  if (defaultValue)
                  {
                     initialValues[fieldName] = defaultValue;
                  }
               }

               /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
               // do a second loop, this time looking up display-values for any possible-value fields with a default value                    //
               // do it in a second loop, to pass in all the other values (from initialValues), in case there's a PVS filter that needs them. //
               /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
               for (let fieldName of tableMetaData.fields.keys())
               {
                  const fieldMetaData = tableMetaData.fields.get(fieldName);
                  const defaultValue = (defaultValues && defaultValues[fieldName]) ? defaultValues[fieldName] : fieldMetaData.defaultValue;
                  if (defaultValue && fieldMetaData.possibleValueSourceName)
                  {
                     const results: QPossibleValue[] = await qController.possibleValues(tableName, null, fieldName, null, [initialValues[fieldName]], null, objectToMap(initialValues), "form");
                     if (results && results.length > 0)
                     {
                        defaultDisplayValues.set(fieldName, results[0].label);
                     }
                  }
               }
            }

            //////////////////////////////////////////////////////
            // if there's an on-load form adjuster, then run it //
            //////////////////////////////////////////////////////
            const materialDashboardTableMetaData = tableMetaData.supplementalTableMetaData?.get("materialDashboard");
            if (materialDashboardTableMetaData?.onLoadFormAdjuster)
            {
               await runOnLoadFormAdjuster(tableMetaData, initialValues, defaultDisplayValues);
            }

            /////////////////////////////////////////////////
            // define the sections, e.g., for the left-bar //
            /////////////////////////////////////////////////
            const tableSections = processTableSections(tableMetaData, metaData);
            setTableSections(tableSections);

            //////////////////////////////////////////////////////
            // copy fields in to an array, but, not sure why :) //
            //////////////////////////////////////////////////////
            const fieldArray = [] as QFieldMetaData[];
            const sortedKeys = [...tableMetaData.fields.keys()].sort();
            sortedKeys.forEach((key) =>
            {
               const fieldMetaData = tableMetaData.fields.get(key);
               fieldArray.push(fieldMetaData);
            });

            ///////////////////////////////////////////////////
            // if an override heading was passed in, use it. //
            ///////////////////////////////////////////////////
            if (props.overrideHeading)
            {
               setFormTitle(props.overrideHeading);
               if (!props.isModal)
               {
                  setPageHeader(props.overrideHeading);
               }
            }

            //////////////////////////////////////
            // check capabilities & permissions //
            //////////////////////////////////////
            if (props.isCopy || !props.id)
            {
               if (!tableMetaData.capabilities.has(Capability.TABLE_INSERT))
               {
                  setNotAllowedError("Records may not be created in this table");
               }
               else if (!tableMetaData.insertPermission)
               {
                  setNotAllowedError(`You do not have permission to create ${tableMetaData.label} records`);
               }
            }
            else
            {
               if (!tableMetaData.capabilities.has(Capability.TABLE_UPDATE))
               {
                  setNotAllowedError("Records may not be edited in this table");
               }
               else if (!tableMetaData.editPermission)
               {
                  setNotAllowedError(`You do not have permission to edit ${tableMetaData.label} records`);
               }
            }

            /////////////////////////////////////////////////////////////////////
            // make sure all initialValues are properly formatted for the form //
            /////////////////////////////////////////////////////////////////////
            for (let i = 0; i < fieldArray.length; i++)
            {
               const fieldMetaData = fieldArray[i];
               if (fieldMetaData.type == QFieldType.DATE_TIME && initialValues[fieldMetaData.name])
               {
                  initialValues[fieldMetaData.name] = ValueUtils.formatDateTimeValueForForm(initialValues[fieldMetaData.name]);
               }
            }

            setInitialValues(initialValues);

            /////////////////////////////////////////////////////////
            // get formField and formValidation objects for Formik //
            /////////////////////////////////////////////////////////
            const {
               dynamicFormFields,
               formValidations,
            } = DynamicFormUtils.getFormData(fieldArray, disabledFields);
            DynamicFormUtils.addPossibleValueProps(dynamicFormFields, fieldArray, tableName, null, record ? record.displayValues : defaultDisplayValues);

            /////////////////////////////////////
            // group the formFields by section //
            /////////////////////////////////////
            const dynamicFormFieldsBySection = new Map<string, DynamicFormFieldDefinition[]>();
            const newAllFormFields: { [key: string]: DynamicFormFieldDefinition } = {};
            let t1sectionName;
            let t1section;
            const nonT1Sections: QTableSection[] = [];
            const newRenderedWidgetSections: { [name: string]: JSX.Element } = {};
            const newChildListWidgetData: { [name: string]: ChildRecordListData } = {};

            for (let i = 0; i < tableSections.length; i++)
            {
               const section = tableSections[i];
               const sectionDynamicFormFields: DynamicFormFieldDefinition[] = [];

               if (section.isHidden)
               {
                  continue;
               }

               const hasFields = section.fieldNames && section.fieldNames.length > 0;
               if (hasFields)
               {
                  for (let j = 0; j < section.fieldNames.length; j++)
                  {
                     const fieldName = section.fieldNames[j];
                     const field = tableMetaData.fields.get(fieldName);

                     if (!field)
                     {
                        console.log(`Omitting un-found field ${fieldName} from form`);
                        continue;
                     }

                     ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                     // if id !== null (and we're not copying) - means we're on the edit screen -- show all fields on the edit screen. //
                     // || (or) we're on the insert screen in which case, only show editable fields.                                   //
                     ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                     if ((props.id !== null && !props.isCopy) || field.isEditable)
                     {
                        sectionDynamicFormFields.push(dynamicFormFields[fieldName]);
                        newAllFormFields[fieldName] = dynamicFormFields[fieldName];
                     }
                  }

                  if (sectionDynamicFormFields.length === 0)
                  {
                     ////////////////////////////////////////////////////////////////////////////////////////////////
                     // in case there are no active fields in this section, remove it from the tableSections array //
                     ////////////////////////////////////////////////////////////////////////////////////////////////
                     tableSections.splice(i, 1);
                     i--;
                     continue;
                  }
                  else
                  {
                     dynamicFormFieldsBySection.set(section.name, sectionDynamicFormFields);
                  }
               }
               else
               {
                  const widgetMetaData = metaData?.widgets.get(section.widgetName);
                  const widgetData = await qController.widget(widgetMetaData.name, makeFormDataWithIdAndObject(tableMetaData, defaultValues));

                  newRenderedWidgetSections[section.widgetName] = getWidgetSection(widgetMetaData, widgetData);
                  newChildListWidgetData[section.widgetName] = widgetData;
               }

               //////////////////////////////////////
               // capture the tier1 section's name //
               //////////////////////////////////////
               if (section.tier === "T1")
               {
                  t1sectionName = section.name;
                  t1section = section;
               }
               else
               {
                  nonT1Sections.push(section);
               }
            }

            ////////////////////////////////////////////////////////////////////////////
            // set the sectionVisibility state based on the initial state of the form //
            ////////////////////////////////////////////////////////////////////////////
            figureOutSectionVisibility(newAllFormFields, dynamicFormFieldsBySection);

            setT1SectionName(t1sectionName);
            setT1Section(t1section);
            setNonT1Sections(nonT1Sections);
            setFormFieldsBySection(dynamicFormFieldsBySection);
            setAllFormFields(newAllFormFields);
            setBaseFormValidations(formValidations);
            setValidations(Yup.object().shape(formValidations));
            setRenderedWidgetSections(newRenderedWidgetSections);
            setChildListWidgetData(newChildListWidgetData);

            forceUpdate();
         })();
      }
   }, []);


   //////////////////////////////////////////////////////////////////
   // watch widget data - if they change, re-render those sections //
   //////////////////////////////////////////////////////////////////
   useEffect(() =>
   {
      if (childListWidgetData)
      {
         const newRenderedWidgetSections: { [name: string]: JSX.Element } = {};
         for (let name in childListWidgetData)
         {
            const widgetMetaData = metaData.widgets.get(name);
            newRenderedWidgetSections[name] = getWidgetSection(widgetMetaData, childListWidgetData[name]);
         }
         setRenderedWidgetSections(newRenderedWidgetSections);
      }
   }, [childListWidgetData]);


   const handleCancelClicked = () =>
   {
      ///////////////////////////////////////////////////////////////////////////////////////
      // todo - we might have rather just done a navigate(-1) (to keep history clean)      //
      //  but if the user used the anchors on the page, this doesn't effectively cancel... //
      //  what we have here pushed a new history entry (I think?), so could be better      //
      ///////////////////////////////////////////////////////////////////////////////////////
      if (props.id !== null && props.isCopy)
      {
         const path = `${location.pathname.replace(/\/copy$/, "")}`;
         navigate(path, {replace: true});
      }
      else if (props.id !== null)
      {
         const path = `${location.pathname.replace(/\/edit$/, "")}`;
         navigate(path, {replace: true});
      }
      else
      {
         const path = `${location.pathname.replace(/\/create$/, "")}`;
         navigate(path, {replace: true});
      }
   };


   /*******************************************************************************
    ** event handler for the (Formik) Form.
    *******************************************************************************/
   const handleSubmit = async (values: any, actions: any) =>
   {
      actions.setSubmitting(true);

      ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
      // if there's a callback (e.g., for a modal nested on another create/edit screen), then just pass our data back there and return. //
      ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
      if (props.onSubmitCallback)
      {
         props.onSubmitCallback(values, tableName);
         return;
      }

      await (async () =>
      {
         /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
         // we will be manipulating the values sent to the backend, so clone values so they remained unchanged for the form widgets //
         /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
         const valuesToPost = JSON.parse(JSON.stringify(values));

         for (let fieldName of tableMetaData.fields.keys())
         {
            const fieldMetaData = tableMetaData.fields.get(fieldName);

            //////////////////////////////////////////////////////////////////////////////////////////////////////////////
            // (1) convert date-time fields from user's time-zone into UTC                                              //
            // (2) if there's an initial value which matches the value (e.g., from the form), then remove that field    //
            // from the set of values that we'll submit to the backend.  This is to deal with the fact that our         //
            // date-times in the UI (e.g., the form field) only go to the minute - so they kinda always end up          //
            // changing from, say, 12:15:30 to just 12:15:00... this seems to get around that, for cases when the       //
            // user didn't change the value in the field (but if the user did change the value, then we will submit it) //
            //////////////////////////////////////////////////////////////////////////////////////////////////////////////
            if (fieldMetaData.type === QFieldType.DATE_TIME && valuesToPost[fieldName])
            {
               console.log(`DateTime ${fieldName}: Initial value: [${initialValues[fieldName]}] -> [${valuesToPost[fieldName]}]`);
               if (initialValues[fieldName] == valuesToPost[fieldName])
               {
                  console.log(" - Is the same, so, deleting from the post");
                  delete (valuesToPost[fieldName]);
               }
               else
               {
                  valuesToPost[fieldName] = ValueUtils.frontendLocalZoneDateTimeStringToUTCStringForBackend(valuesToPost[fieldName]);
               }
            }

            ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
            // for BLOB fields, there are 3 possible cases:                                                               //
            // 1) they are a File object - in which case, cool, send them through to the backend to have bytes stored.    //
            // 2) they are null - in which case, cool, send them through to the backend to be set to null.                //
            // 3) they are a String, which is their URL path to download them... in that case, don't submit them to       //
            // the backend at all, so they'll stay what they were.  do that by deleting them from the values object here. //
            ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
            if (fieldMetaData.type === QFieldType.BLOB)
            {
               if (typeof valuesToPost[fieldName] === "string")
               {
                  console.log(`${fieldName} value was a string, so, we're deleting it from the values array, to not submit it to the backend, to not change it.`);
                  delete (valuesToPost[fieldName]);
               }
               else
               {
                  valuesToPost[fieldName] = values[fieldName];
               }
            }
         }

         const associationsToPost: any = {};
         let haveAssociationsToPost = false;
         for (let name of Object.keys(childListWidgetData))
         {
            /////////////////////////////////////////////////////////////////////////////////////////////////////////////
            // if cannot find association name, continue loop, since cannot tell backend which association this is for //
            /////////////////////////////////////////////////////////////////////////////////////////////////////////////
            const manageAssociationName = metaData.widgets.get(name)?.defaultValues?.get("manageAssociationName");
            if (!manageAssociationName)
            {
               console.log(`Cannot send association data to backend - missing a manageAssociationName defaultValue in widget meta data for widget name ${name}`);
               continue;
            }

            ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
            // if the records array exists, add to associations to post - note: even if empty list, the backend will expect this //
            // association name to be present if it is to act on it (for the case when all associations have been deleted)       //
            ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
            if (childListWidgetData[name].queryOutput.records)
            {
               associationsToPost[manageAssociationName] = [];
               haveAssociationsToPost = true;
               for (let i = 0; i < childListWidgetData[name].queryOutput?.records?.length; i++)
               {
                  associationsToPost[manageAssociationName].push(childListWidgetData[name].queryOutput.records[i].values);
               }
            }
         }

         if (associationsFromWidgets)
         {
            for (let name in associationsFromWidgets)
            {
               let records = associationsFromWidgets[name];
               if (typeof records === "string")
               {
                  records = JSON.parse(records);
               }
               associationsToPost[name] = records;
               haveAssociationsToPost = true;
            }
         }

         if (haveAssociationsToPost)
         {
            valuesToPost["associations"] = JSON.stringify(associationsToPost);
         }

         if (props.id !== null && !props.isCopy)
         {
            recordAnalytics({category: "tableEvents", action: "saveEdit", label: tableMetaData?.label});

            ///////////////////////
            // perform an update //
            ///////////////////////
            await qController
               .update(tableName, props.id, valuesToPost)
               .then((record) =>
               {
                  if (props.isModal)
                  {
                     props.closeModalHandler(null, "recordUpdated");
                  }
                  else
                  {
                     let warningMessage = null;
                     if (record.warnings && record.warnings.length && record.warnings.length > 0)
                     {
                        warningMessage = record.warnings[0];
                     }

                     const path = location.pathname.replace(/\/edit$/, "");
                     navigate(path, {state: {updateSuccess: true, warning: warningMessage}});
                  }
               })
               .catch((error) =>
               {
                  console.log("Caught:");
                  console.log(error);

                  if (error.message.toLowerCase().startsWith("warning"))
                  {
                     const path = location.pathname.replace(/\/edit$/, "");
                     navigate(path, {state: {updateSuccess: true, warning: error.message}});
                  }
                  else
                  {
                     setAlertContent(error.message);
                     scrollToTopToShowAlert();
                  }
               });
         }
         else
         {
            recordAnalytics({category: "tableEvents", action: props.isCopy ? "saveCopy" : "saveNew", label: tableMetaData?.label});

            /////////////////////////////////
            // perform an insert           //
            // todo - audit if it's a dupe //
            /////////////////////////////////
            await qController
               .create(tableName, valuesToPost)
               .then((record) =>
               {
                  if (props.isModal)
                  {
                     props.closeModalHandler(null, "recordCreated");
                  }
                  else
                  {
                     let warningMessage = null;
                     if (record.warnings && record.warnings.length && record.warnings.length > 0)
                     {
                        warningMessage = record.warnings[0];
                     }

                     const path = props.isCopy ?
                        location.pathname.replace(new RegExp(`/${props.id}/copy$`), "/" + record.values.get(tableMetaData.primaryKeyField))
                        : location.pathname.replace(/create$/, record.values.get(tableMetaData.primaryKeyField));
                     navigate(path, {state: {createSuccess: true, warning: warningMessage}});
                  }
               })
               .catch((error) =>
               {
                  if (error.message.toLowerCase().startsWith("warning"))
                  {
                     const path = props.isCopy ?
                        location.pathname.replace(new RegExp(`/${props.id}/copy$`), "/" + record.values.get(tableMetaData.primaryKeyField))
                        : location.pathname.replace(/create$/, record.values.get(tableMetaData.primaryKeyField));
                     navigate(path, {state: {createSuccess: true, warning: error.message}});
                  }
                  else
                  {
                     setAlertContent(error.message);
                     scrollToTopToShowAlert();
                  }
               });
         }
      })();
   };


   /*******************************************************************************
    **
    *******************************************************************************/
   function scrollToTopToShowAlert()
   {
      if (props.isModal)
      {
         document.getElementById("modalTopReference")?.scrollIntoView();
      }
      else
      {
         HtmlUtils.autoScroll(0);
      }
   }


   /*******************************************************************************
    **
    *******************************************************************************/
   function makeQueryStringWithIdAndObject(tableMetaData: QTableMetaData, object: { [key: string]: any })
   {
      const queryParamsArray: string[] = [];
      if (props.id)
      {
         queryParamsArray.push(`${tableMetaData.primaryKeyField}=${encodeURIComponent(props.id)}`);
      }

      if (object)
      {
         for (let key in object)
         {
            queryParamsArray.push(`${key}=${encodeURIComponent(object[key])}`);
         }
      }

      return (queryParamsArray.join("&"));
   }


   /*******************************************************************************
    *
    *******************************************************************************/
   function makeFormDataWithIdAndObject(tableMetaData: QTableMetaData, object: { [key: string]: any })
   {
      const formData: FormData = new FormData();
      if (props.id)
      {
         formData.append(tableMetaData.primaryKeyField, props.id);
      }

      if (object)
      {
         for (let key in object)
         {
            formData.append(key, object[key]);
         }
      }

      return (formData);
   }


   /*******************************************************************************
    **
    *******************************************************************************/
   async function reloadWidget(widgetName: string, additionalQueryParamsForWidget: { [key: string]: any })
   {
      const widgetData = await qController.widget(widgetName, makeFormDataWithIdAndObject(tableMetaData, additionalQueryParamsForWidget));
      const widgetMetaData = metaData.widgets.get(widgetName);

      /////////////////////////////////////////////////////////////////////////////////////////////////////
      // todo - rename this - it holds all widget dta, not just child-lists.  also, the type is wrong... //
      /////////////////////////////////////////////////////////////////////////////////////////////////////
      const newChildListWidgetData: { [name: string]: ChildRecordListData } = Object.assign({}, childListWidgetData);
      newChildListWidgetData[widgetName] = widgetData;
      setChildListWidgetData(newChildListWidgetData);

      const newRenderedWidgetSections = Object.assign({}, renderedWidgetSections);
      newRenderedWidgetSections[widgetName] = getWidgetSection(widgetMetaData, widgetData);
      setRenderedWidgetSections(newRenderedWidgetSections);
      forceUpdate();
   }


   /*******************************************************************************
    ** process a form-field having a changed value (e.g., apply field rules).
    *******************************************************************************/
   function handleChangedFieldValue(fieldName: string, oldValue: any, newValue: any, valueChangesToMake: { [fieldName: string]: any })
   {
      for (let fieldRule of fieldRules)
      {
         if (fieldRule.trigger == FieldRuleTrigger.ON_CHANGE && fieldRule.sourceField == fieldName)
         {
            switch (fieldRule.action)
            {
               case FieldRuleAction.CLEAR_TARGET_FIELD:
                  console.log(`Clearing value from [${fieldRule.targetField}] due to change in [${fieldName}]`);
                  valueChangesToMake[fieldRule.targetField] = null;
                  break;
               case FieldRuleAction.RELOAD_WIDGET:
                  const additionalQueryParamsForWidget: { [key: string]: any } = {};
                  if (newValue != null)
                  {
                     additionalQueryParamsForWidget[fieldRule.sourceField] = newValue;
                  }
                  reloadWidget(fieldRule.targetWidget, additionalQueryParamsForWidget);
            }
         }
      }
   }

   const formId = props.id != null ? `edit-${tableMetaData?.name}-form` : `create-${tableMetaData?.name}-form`;
   const tableNameForId = tableMetaData ? sanitizeId(tableMetaData.name) : "";
   const formMode = props.isCopy ? "copy" : (props.id != null ? "edit" : "create");

   let body;

   const getSectionHelp = (section: QTableSection) =>
   {
      const helpRoles = [props.id ? "EDIT_SCREEN" : "INSERT_SCREEN", "WRITE_SCREENS", "ALL_SCREENS"];
      const formattedHelpContent = <HelpContent helpContents={section.helpContents} roles={helpRoles} helpContentKey={`table:${tableMetaData.name};section:${section.name}`} />;

      return formattedHelpContent && (
         <Box px={"1.5rem"} fontSize={"0.875rem"}>
            {formattedHelpContent}
         </Box>
      );
   };


   /***************************************************************************
    * combine the "base validations" (e.g., from the simple fields, known by
    * this component) any sub-form validations (e.g., from widgets) into the
    * final Yup object.
    ***************************************************************************/
   function makeValidationSchema()
   {
      const allValidations = {...baseFormValidations};
      for (let key in (subFormValidations ?? {}))
      {
         for (let subKey in (subFormValidations[key] ?? {}))
         {
            allValidations[subKey] = subFormValidations[key][subKey];
         }
      }
      return (Yup.object().shape(allValidations));
   }


   if (notAllowedError)
   {
      body = (
         <Box mb={3}>
            <Grid container spacing={3}>
               <Grid item xs={12}>
                  <Box mb={3}>
                     <Alert severity="error">{notAllowedError}</Alert>
                     {props.isModal &&
                        <Box mt={5}>
                           <QCancelButton onClickHandler={props.isModal ? props.closeModalHandler : handleCancelClicked} label="Close" disabled={false} />
                        </Box>
                     }
                  </Box>
               </Grid>
            </Grid>
         </Box>
      );
   }
   else
   {
      body = (
         <Box mb={3} className="entityForm" data-qqq-id={`record-${formMode}-${tableNameForId}`}>
            {
               (alertContent || warningContent) &&
               <Grid container spacing={3}>
                  <Grid item xs={12}>
                     {alertContent ? (
                        <Box mb={3}>
                           <Alert severity="error" onClose={() => setAlertContent(null)}>{alertContent}</Alert>
                        </Box>
                     ) : ("")}
                     {warningContent ? (
                        <Box mb={3}>
                           <Alert severity="warning" onClose={() => setWarningContent(null)}>{warningContent}</Alert>
                        </Box>
                     ) : ("")}
                  </Grid>
               </Grid>
            }
            <Grid container spacing={3} flexWrap={{md: "nowrap"}}>
               {
                  !props.isModal &&
                  <Grid item xs={12} lg={3} className="recordSidebar">
                     <QRecordSidebar tableSections={tableSections} sectionVisibility={sectionVisibility} />
                  </Grid>
               }
               <Grid item xs={12} lg={props.isModal ? 12 : 9} className={props.isModal ? "" : "recordWithSidebar"}>

                  <Formik
                     initialValues={initialValues}
                     validationSchema={makeValidationSchema()}
                     onSubmit={handleSubmit}
                  >
                     {({
                        values,
                        errors,
                        touched,
                        isSubmitting,
                        setFieldValue,
                        dirty
                     }) =>
                     {
                        /////////////////////////////////////////////////
                        // if we have values from formik, look at them //
                        /////////////////////////////////////////////////
                        if (values)
                        {
                           ////////////////////////////////////////////////////////////////////////
                           // use stringified values as cheap/easy way to see if any are changed //
                           ////////////////////////////////////////////////////////////////////////
                           const newFormValuesJSON = JSON.stringify(values);
                           if (formValuesJSON != newFormValuesJSON)
                           {
                              const valueChangesToMake: { [fieldName: string]: any } = {};

                              ////////////////////////////////////////////////////////////////////
                              // if the form is dirty (e.g., we're not doing the initial load), //
                              // then process rules for any changed fields                      //
                              ////////////////////////////////////////////////////////////////////
                              if (dirty)
                              {
                                 for (let fieldName in values)
                                 {
                                    if (formValues[fieldName] != values[fieldName])
                                    {
                                       handleChangedFieldValue(fieldName, formValues[fieldName], values[fieldName], valueChangesToMake);
                                    }
                                    formValues[fieldName] = values[fieldName];
                                 }
                              }
                              else
                              {
                                 /////////////////////////////////////////////////////////////////////////////////////
                                 // if the form is clean, make sure the formValues object has all form values in it //
                                 /////////////////////////////////////////////////////////////////////////////////////
                                 for (let fieldName in values)
                                 {
                                    formValues[fieldName] = values[fieldName];
                                 }
                              }

                              /////////////////////////////////////////////////////////////////////////////
                              // if there were any changes to be made from the rule evaluation,          //
                              // make those changes in the formValues map, and in formik (setFieldValue) //
                              /////////////////////////////////////////////////////////////////////////////
                              for (let fieldName in valueChangesToMake)
                              {
                                 formValues[fieldName] = valueChangesToMake[fieldName];
                                 setFieldValue(fieldName, valueChangesToMake[fieldName], false);
                              }

                              setFormValues(formValues);
                              setFormValuesJSON(JSON.stringify(values));
                           }
                        }

                        ///////////////////////////////////////////////////////////////////
                        // once we're in the formik form, use its setFieldValue function //
                        // over top of the default one we created globally               //
                        ///////////////////////////////////////////////////////////////////
                        formikSetFieldValueFunction = setFieldValue;

                        return (
                           <Form id={formId} autoComplete="off">
                              <ScrollToFirstError />

                              <Box pb={3} pt={0}>
                                 <Card id={`${t1sectionName}`} sx={{overflow: "visible", pb: 2, scrollMarginTop: "100px"}} elevation={cardElevation} data-qqq-id={`record-${formMode}-header-${tableNameForId}`}>
                                    <Box display="flex" p={3} pb={1}>
                                       <Box mr={1.5} data-qqq-id={`record-${formMode}-avatar-${tableNameForId}`}>
                                          <Avatar sx={{bgcolor: accentColor}}>
                                             <Icon>
                                                {tableMetaData?.iconName}
                                             </Icon>
                                          </Avatar>
                                       </Box>
                                       <Box display="flex" alignItems="center">
                                          <MDTypography variant="h5" data-qqq-id={`record-${formMode}-title-${tableNameForId}`}>{formTitle}</MDTypography>
                                       </Box>
                                    </Box>
                                    {t1section && getSectionHelp(t1section)}
                                    {
                                       t1sectionName && formFieldsBySection ? (
                                          <Box px={3}>
                                             <Box pb={"0.25rem"} width="100%">
                                                {getFormSection(t1section, values, touched, formFieldsBySection.get(t1sectionName), errors, true)}
                                             </Box>
                                          </Box>
                                       ) : null
                                    }
                                 </Card>
                              </Box>
                              {formFieldsBySection && nonT1Sections.length ? nonT1Sections.map((section: QTableSection) => (
                                 renderSection(section, values, touched, formFieldsBySection, errors)
                              )) : null}

                              {formFieldsBySection &&
                                 <Box component="div" p={3} className={props.isModal ? "modalBottomButtonBar" : "stickyBottomButtonBar"} data-qqq-id={`record-${formMode}-button-bar-${tableNameForId}`}>
                                    <Grid container justifyContent="flex-end" spacing={3}>
                                       <QCancelButton onClickHandler={props.isModal ? props.closeModalHandler : handleCancelClicked} disabled={isSubmitting} />
                                       <QSaveButton disabled={isSubmitting} label={props.saveButtonLabel} iconName={props.saveButtonIcon} />
                                    </Grid>
                                 </Box>
                              }

                           </Form>
                        );
                     }}
                  </Formik>

                  {
                     showEditChildForm &&
                     <Modal open={showEditChildForm as boolean} onClose={(event, reason) => closeEditChildForm(event, reason)}>
                        <div className="modalEditForm">
                           <EntityForm
                              isModal={true}
                              closeModalHandler={closeEditChildForm}
                              table={showEditChildForm.table}
                              defaultValues={showEditChildForm.defaultValues}
                              disabledFields={showEditChildForm.disabledFields}
                              onSubmitCallback={props.onSubmitCallback ? props.onSubmitCallback : submitEditChildForm}
                              overrideHeading={`${showEditChildForm.rowIndex != null ? "Editing" : "Creating New"} ${showEditChildForm.table.label}`}
                              saveButtonLabel="OK"
                              saveButtonIcon="check"
                           />
                        </div>
                     </Modal>
                  }

               </Grid>
            </Grid>
         </Box>
      );
   }

   if (props.isModal)
   {
      return (
         <Box sx={{position: "absolute", overflowY: "auto", maxHeight: "100%", width: "100%"}}>
            <Card sx={{my: 5, mx: "auto", p: 6, pb: 0, maxWidth: "1024px"}}>
               <span id="modalTopReference"></span>
               {body}
            </Card>
         </Box>
      );
   }
   else
   {
      return (body);
   }
}

function ScrollToFirstError(): JSX.Element
{
   const {submitCount, isValid} = useFormikContext();

   useEffect(() =>
   {
      /////////////////////////////////////////////////////////////////////////////
      // Wrap the code in setTimeout to make sure it runs after the DOM has been //
      // updated and has the error message elements.                             //
      /////////////////////////////////////////////////////////////////////////////
      setTimeout(() =>
      {
         ////////////////////////////////////////
         // Only run on submit or if not valid //
         ////////////////////////////////////////
         if (submitCount === 0 || isValid)
         {
            return;
         }

         //////////////////////////////////
         // Find the first error message //
         //////////////////////////////////
         const errorMessageSelector = "[data-field-error]";
         const firstErrorMessage = document.querySelector(errorMessageSelector);
         if (!firstErrorMessage)
         {
            console.warn(`Form failed validation but no error field was found with selector: ${errorMessageSelector}`);
            return;
         }
         firstErrorMessage.scrollIntoView({block: "center"});

      }, 100);
   }, [submitCount, isValid]);

   return null;
}


export default EntityForm;
