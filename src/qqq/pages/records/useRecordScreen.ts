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

import {QException} from "@qrunio/qqq-frontend-core/lib/exceptions/QException";
import {Capability} from "@qrunio/qqq-frontend-core/lib/model/metaData/Capability";
import {QFieldMetaData} from "@qrunio/qqq-frontend-core/lib/model/metaData/QFieldMetaData";
import {QFieldType} from "@qrunio/qqq-frontend-core/lib/model/metaData/QFieldType";
import {QInstance} from "@qrunio/qqq-frontend-core/lib/model/metaData/QInstance";
import {QProcessMetaData} from "@qrunio/qqq-frontend-core/lib/model/metaData/QProcessMetaData";
import {QTableMetaData} from "@qrunio/qqq-frontend-core/lib/model/metaData/QTableMetaData";
import {QTableSection} from "@qrunio/qqq-frontend-core/lib/model/metaData/QTableSection";
import {QTableVariant} from "@qrunio/qqq-frontend-core/lib/model/metaData/QTableVariant";
import {QPossibleValue} from "@qrunio/qqq-frontend-core/lib/model/QPossibleValue";
import {QRecord} from "@qrunio/qqq-frontend-core/lib/model/QRecord";
import {QueryJoin} from "@qrunio/qqq-frontend-core/lib/model/query/QueryJoin";
import FormData from "form-data";
import DynamicFormUtils, {DynamicFormFieldDefinition} from "qqq/components/forms/DynamicFormUtils";
import {ChildRecordListData} from "qqq/components/widgets/misc/RecordGridWidget";
import {FieldRule, FieldRuleAction, FieldRuleTrigger} from "qqq/models/fields/FieldRules";
import {RecordScreenMode} from "qqq/pages/records/RecordScreenContext";
import HistoryUtils from "qqq/utils/HistoryUtils";
import Client from "qqq/utils/qqq/Client";
import ProcessUtils from "qqq/utils/qqq/ProcessUtils";
import TableUtils from "qqq/utils/qqq/TableUtils";
import ValueUtils from "qqq/utils/qqq/ValueUtils";
import React, {useCallback, useContext, useEffect, useRef, useState} from "react";
import {useLocation, useNavigate} from "react-router-dom";
import * as Yup from "yup";
import QContext from "QContext";

const qController = Client.getInstance();

const TABLE_VARIANT_LOCAL_STORAGE_KEY_ROOT = "qqq.tableVariant";


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
 ** Options for modal / embedded usage of useRecordScreen.
 ***************************************************************************/
export interface UseRecordScreenOptions
{
   defaultValues?: { [key: string]: any };
   disabledFields?: { [key: string]: boolean } | string[];
   overrideTableMetaData?: QTableMetaData;
   skipNavigation?: boolean;
   onSubmitCallback?: (values: any, tableName: string) => void;
   scrollCorrectionRef?: React.MutableRefObject<{fieldName: string; yBefore: number} | null>;
}


/***************************************************************************
 **
 ***************************************************************************/
export interface UseRecordScreenResult
{
   mode: RecordScreenMode;
   setMode: (mode: RecordScreenMode) => void;

   record: QRecord;
   tableMetaData: QTableMetaData;
   metaData: QInstance;

   // sections
   tableSections: QTableSection[];
   t1Section: QTableSection;
   nonT1Sections: QTableSection[];
   sectionVisibility: { [key: string]: boolean };

   // form state
   formFields: { [key: string]: DynamicFormFieldDefinition };
   formFieldsBySection: Map<string, DynamicFormFieldDefinition[]>;
   initialValues: { [key: string]: any };
   formValidations: { [key: string]: Yup.BaseSchema };

   // field rules
   fieldRules: FieldRule[];

   // status
   loading: boolean;
   notFoundMessage: string;
   errorMessage: string;
   successMessage: string;
   warningMessage: string;
   notAllowedError: string;

   // actions
   saveRecord: (values: any) => Promise<void>;
   deleteRecord: () => Promise<void>;
   handleFieldChange: (fieldName: string, oldValue: any, newValue: any, valueChangesToMake: { [fieldName: string]: any }) => void;
   handleFieldBlur: (fieldName: string, value: any) => void;
   reloadWidget: (widgetName: string, additionalParams?: { [key: string]: any }) => void;

   // processes & actions
   allTableProcesses: QProcessMetaData[];

   // table variant
   tableVariant: QTableVariant;

   // collapsible sections
   collapsibleSectionOpenStates: Record<string, boolean>;
   toggleCollapsibleSectionOpenState: (sectionName: string) => void;
   openCollapsedSectionsWithErrorFields: (errorFieldNames: string[]) => void;

   // message setters
   setSuccessMessage: (msg: string) => void;
   setWarningMessage: (msg: string) => void;
   setErrorMessage: (msg: string) => void;

   // refs for form adjuster access
   setFieldValueRef: React.MutableRefObject<(name: string, value: any, shouldValidate?: boolean) => void>;
   formValuesRef: React.MutableRefObject<{ [key: string]: any }>;

   // widget sub-validations
   addSubValidations: (name: string, validations: { [key: string]: Yup.BaseSchema }) => void;

   // disabled fields (for modal usage)
   disabledFields: { [key: string]: boolean };

   // child record management (edit mode)
   childListWidgetData: { [name: string]: ChildRecordListData };
   showEditChildForm: any;
   setShowEditChildForm: (val: any) => void;
   openAddChildRecord: (widgetName: string, widgetData: ChildRecordListData) => void;
   openEditChildRecord: (widgetName: string, widgetData: ChildRecordListData, rowIndex: number) => void;
   deleteChildRecord: (widgetName: string, rowIndex: number) => void;
   submitEditChildForm: (values: any, tableName: string) => void;
}


/***************************************************************************
 ** Custom hook that manages all data loading and state for the RecordScreen.
 ***************************************************************************/
export function useRecordScreen(tableName: string, recordId?: string, initialMode?: RecordScreenMode, isCopy?: boolean, options?: UseRecordScreenOptions): UseRecordScreenResult
{
   const navigate = useNavigate();
   const location = useLocation();
   const {setPageHeader, setTableMetaData: setQContextTableMetaData, setTableProcesses, recordAnalytics, helpHelpActive} = useContext(QContext);

   const skipNavigation = options?.skipNavigation ?? false;

   const [mode, setMode] = useState<RecordScreenMode>(initialMode ?? (recordId ? "view" : "create"));
   const [loading, setLoading] = useState(true);

   // sync mode with initialMode prop when it changes (e.g., navigating between view/edit routes)
   useEffect(() =>
   {
      const newMode = initialMode ?? (recordId ? "view" : "create");
      switchMode(newMode);
   }, [initialMode, recordId]);

   // clear alerts when entering edit mode (covers Back-button navigation to /edit)
   useEffect(() =>
   {
      if (mode === "edit")
      {
         setSuccessMessage(null);
         setWarningMessage(null);
         setErrorMessage(null);
      }
   }, [mode]);
   const [record, setRecord] = useState<QRecord>(null);
   const [tableMetaData, setTableMetaData] = useState<QTableMetaData>(null);
   const [metaData, setMetaData] = useState<QInstance>(null);

   const [tableSections, setTableSections] = useState<QTableSection[]>([]);
   const [t1Section, setT1Section] = useState<QTableSection>(null);
   const [nonT1Sections, setNonT1Sections] = useState<QTableSection[]>([]);
   const [sectionVisibility, setSectionVisibility] = useState<{ [key: string]: boolean }>({});

   const [formFields, setFormFields] = useState<{ [key: string]: DynamicFormFieldDefinition }>({});
   const [formFieldsBySection, setFormFieldsBySection] = useState<Map<string, DynamicFormFieldDefinition[]>>(new Map());
   const [initialValues, setInitialValues] = useState<{ [key: string]: any }>({});
   const [formValidations, setFormValidations] = useState<{ [key: string]: Yup.BaseSchema }>({});

   // allows widgets (e.g., CronUIWidget) to register their own field validations with Formik
   const addSubValidations = useCallback((name: string, validations: { [key: string]: Yup.BaseSchema }) =>
   {
      setFormValidations(prev => ({...prev, ...validations}));
   }, []);

   const [fieldRules, setFieldRules] = useState<FieldRule[]>([]);

   const [notFoundMessage, setNotFoundMessage] = useState<string>(null);
   const [errorMessage, setErrorMessage] = useState<string>(null);
   const [successMessage, setSuccessMessage] = useState<string>(null);
   const [warningMessage, setWarningMessage] = useState<string>(null);
   const [notAllowedError, setNotAllowedError] = useState<string>(null);

   const [allTableProcesses, setAllTableProcesses] = useState<QProcessMetaData[]>([]);

   const [collapsibleSectionOpenStates, setCollapsibleSectionOpenStates] = useState<Record<string, boolean>>({});

   // refs for form adjuster access to Formik helpers
   const setFieldValueRef = useRef<(name: string, value: any, shouldValidate?: boolean) => void>(() =>
   {
   });
   const formValuesRef = useRef<{ [key: string]: any }>({});

   // normalize disabledFields option into a {fieldName: true} map
   const [disabledFields] = useState<{ [key: string]: boolean }>(() =>
   {
      if (!options?.disabledFields) return {};
      if (Array.isArray(options.disabledFields))
      {
         const map: { [key: string]: boolean } = {};
         for (const f of options.disabledFields)
         {
            map[f] = true;
         }
         return map;
      }
      // values may be FK values (e.g., {"orderId": 4}) — normalize all to true
      const map: { [key: string]: boolean } = {};
      for (const key in options.disabledFields)
      {
         map[key] = true;
      }
      return map;
   });

   // child record management (edit mode)
   const [childListWidgetData, setChildListWidgetData] = useState<{ [name: string]: ChildRecordListData }>({});
   const [showEditChildForm, setShowEditChildForm] = useState<any>(null);

   let tableVariant: QTableVariant = null;
   const tableVariantLocalStorageKey = `${TABLE_VARIANT_LOCAL_STORAGE_KEY_ROOT}.${tableName}`;
   if (localStorage.getItem(tableVariantLocalStorageKey))
   {
      tableVariant = JSON.parse(localStorage.getItem(tableVariantLocalStorageKey));
   }


   /***************************************************************************
    ** load metadata, record, processes, form fields, etc.
    ***************************************************************************/
   useEffect(() =>
   {
      (async () =>
      {
         setLoading(true);

         try
         {
            ////////////////////////////////////////////////////////////////////////////////////////////
            // fetch table meta data - clone it in case form adjusters modify it                      //
            ////////////////////////////////////////////////////////////////////////////////////////////
            let tableMetaData: QTableMetaData;
            if (options?.overrideTableMetaData)
            {
               const override = options.overrideTableMetaData;
               tableMetaData = (override instanceof QTableMetaData ? override : new QTableMetaData(override)).clone();
            }
            else
            {
               tableMetaData = (await qController.loadTableMetaData(tableName)).clone();
            }
            setTableMetaData(tableMetaData);
            if (!skipNavigation)
            {
               setQContextTableMetaData(tableMetaData);
            }

            const metaData = await qController.loadMetaData();
            setMetaData(metaData);
            ValueUtils.qInstance = metaData;

            ///////////////////////
            // setup field rules //
            ///////////////////////
            const mdbMetaData = tableMetaData?.supplementalTableMetaData?.get("materialDashboard");
            if (mdbMetaData?.fieldRules)
            {
               setFieldRules(mdbMetaData.fieldRules.map((r: any) => r as FieldRule));
            }

            ///////////////////////////
            // load processes        //
            ///////////////////////////
            if (!skipNavigation)
            {
               const processesForTable = ProcessUtils.getProcessesForTable(metaData, tableName);
               processesForTable.sort((a, b) => a.label.localeCompare(b.label));
               setTableProcesses(processesForTable);

               const allProcesses = ProcessUtils.getProcessesForTable(metaData, tableName, true);
               setAllTableProcesses(allProcesses);
            }

            //////////////////////////
            // load the record      //
            //////////////////////////
            let loadedRecord: QRecord = null;
            const newInitialValues: { [key: string]: any } = {};
            let defaultDisplayValues = new Map<string, string>();

            if (recordId)
            {
               let queryJoins: QueryJoin[] = null;
               const visibleJoinTables = TableUtils.getVisibleJoinTables(tableMetaData);
               if (visibleJoinTables.size > 0)
               {
                  queryJoins = TableUtils.getQueryJoins(tableMetaData, visibleJoinTables);
               }

               try
               {
                  loadedRecord = await qController.get(tableName, recordId, tableVariant, null, queryJoins);
                  setRecord(loadedRecord);

                  if (!skipNavigation)
                  {
                     const effectiveModeForHeader: RecordScreenMode = initialMode ?? (recordId ? "view" : "create");
                     setPageHeader(effectiveModeForHeader === "edit"
                        ? `Edit ${tableMetaData?.label}: ${loadedRecord.recordLabel}`
                        : loadedRecord.recordLabel);
                     recordAnalytics({category: "tableEvents", action: mode === "view" ? "view" : (isCopy ? "copy" : "edit"), label: tableMetaData?.label + " / " + loadedRecord?.recordLabel});

                     try
                     {
                        const viewPath = location.pathname.replace(/\/edit\/?$/, "");
                        HistoryUtils.push({label: `${tableMetaData?.label}: ${loadedRecord.recordLabel}`, path: viewPath, iconName: tableMetaData.iconName});
                     }
                     catch (e)
                     {
                        console.error("Error pushing history: " + e);
                     }
                  }

                  // populate initial values from record
                  tableMetaData.fields.forEach((fieldMetaData, key) =>
                  {
                     if (isCopy && fieldMetaData.name === tableMetaData.primaryKeyField)
                     {
                        return;
                     }
                     newInitialValues[key] = loadedRecord.values.get(key);
                  });

                  // permission checks
                  if (mode === "edit" && !isCopy)
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
               catch (e)
               {
                  if (e instanceof QException)
                  {
                     if ((e as QException).status === 404)
                     {
                        setNotFoundMessage(`${tableMetaData.label} ${recordId} could not be found.`);
                        try
                        {
                           HistoryUtils.ensurePathNotInHistory(location.pathname);
                        }
                        catch (he)
                        {
                           console.error(he);
                        }
                        setLoading(false);
                        return;
                     }
                     else if ((e as QException).status === 403)
                     {
                        setNotFoundMessage(`You do not have permission to view ${tableMetaData.label} records`);
                        try
                        {
                           HistoryUtils.ensurePathNotInHistory(location.pathname);
                        }
                        catch (he)
                        {
                           console.error(he);
                        }
                        setLoading(false);
                        return;
                     }
                  }
                  throw e;
               }
            }
            else
            {
               // create mode — clear any record from a previous view/edit
               setRecord(null);
               if (!skipNavigation)
               {
                  setPageHeader(`Creating New ${tableMetaData?.label}`);
                  recordAnalytics({category: "tableEvents", action: "new", label: tableMetaData?.label});
               }

               // populate defaults
               for (let fieldName of tableMetaData.fields.keys())
               {
                  const fieldMetaData = tableMetaData.fields.get(fieldName);
                  const defaultValue = fieldMetaData.defaultValue;
                  if (defaultValue)
                  {
                     newInitialValues[fieldName] = defaultValue;
                  }
               }

               // merge in caller-supplied default values (e.g., from parent record)
               if (options?.defaultValues)
               {
                  for (let key in options.defaultValues)
                  {
                     newInitialValues[key] = options.defaultValues[key];
                  }
               }

               // look up display values for PVS fields with defaults
               for (let fieldName of tableMetaData.fields.keys())
               {
                  const fieldMetaData = tableMetaData.fields.get(fieldName);
                  const defaultValue = newInitialValues[fieldName];
                  if (defaultValue && fieldMetaData.possibleValueSourceName)
                  {
                     const results: QPossibleValue[] = await qController.possibleValues(tableName, null, fieldName, null, [defaultValue], null, objectToMap(newInitialValues), "form");
                     if (results && results.length > 0)
                     {
                        defaultDisplayValues.set(fieldName, results[0].label);
                     }
                  }
               }

               // permission checks for create
               if (!tableMetaData.capabilities.has(Capability.TABLE_INSERT))
               {
                  setNotAllowedError("Records may not be created in this table");
               }
               else if (!tableMetaData.insertPermission)
               {
                  setNotAllowedError(`You do not have permission to create ${tableMetaData.label} records`);
               }
            }

            //////////////////////////////////////////////////////
            // run on-load form adjuster if applicable           //
            //////////////////////////////////////////////////////
            const materialDashboardTableMetaData = tableMetaData.supplementalTableMetaData?.get("materialDashboard");
            if (materialDashboardTableMetaData?.onLoadFormAdjuster)
            {
               await runOnLoadFormAdjuster(tableMetaData, newInitialValues, defaultDisplayValues);
            }

            ////////////////////////////////////////////////
            // format DATE_TIME values for form            //
            ////////////////////////////////////////////////
            for (let [, fieldMetaData] of tableMetaData.fields)
            {
               if (fieldMetaData.type === QFieldType.DATE_TIME && newInitialValues[fieldMetaData.name])
               {
                  newInitialValues[fieldMetaData.name] = ValueUtils.formatDateTimeValueForForm(newInitialValues[fieldMetaData.name]);
               }
            }

            setInitialValues(newInitialValues);

            /////////////////////////////
            // build sections          //
            /////////////////////////////
            // use effectiveMode (derived from props) instead of mode state, which may
            // be stale in this effect when both recordId and initialMode change together
            const effectiveMode: RecordScreenMode = initialMode ?? (recordId ? "view" : "create");
            const sections = buildSections(tableMetaData, metaData, effectiveMode);
            setTableSections(sections);

            const t1 = sections.find(s => s.tier === "T1");
            const nonT1 = sections.filter(s => s.tier !== "T1" && !s.isHidden);
            setT1Section(t1);
            setNonT1Sections(nonT1);

            figureOutSectionVisibility(tableMetaData);

            // collapsible states
            const initialCollapsibleStates: Record<string, boolean> = {};
            for (let section of sections)
            {
               if (section.collapsible?.isCollapsible)
               {
                  const lsValue = localStorage.getItem(makeCollapsibleSectionOpenStateLocalStorageKey(tableName, section.name));
                  initialCollapsibleStates[section.name] = lsValue != undefined ? lsValue === "true" : section.collapsible.initiallyOpen === true;
               }
               else
               {
                  initialCollapsibleStates[section.name] = true;
               }
            }
            setCollapsibleSectionOpenStates(initialCollapsibleStates);

            /////////////////////////////
            // build form field data   //
            /////////////////////////////
            const fieldArray: QFieldMetaData[] = [];
            for (let [, fieldMetaData] of tableMetaData.fields)
            {
               fieldArray.push(fieldMetaData);
            }

            const {dynamicFormFields, formValidations: fv} = DynamicFormUtils.getFormData(fieldArray, disabledFields);
            DynamicFormUtils.addPossibleValueProps(dynamicFormFields, fieldArray, tableName, null, loadedRecord ? loadedRecord.displayValues : defaultDisplayValues);

            setFormFields(dynamicFormFields);
            setFormValidations(fv);
            rebuildFormFieldsBySection(sections, dynamicFormFields);

            ///////////////////////////
            // read location state   //
            ///////////////////////////
            if (!skipNavigation && location.state)
            {
               let state: any = location.state;
               if (state["createSuccess"] || state["updateSuccess"])
               {
                  setSuccessMessage(`${tableMetaData.label} successfully ${state["createSuccess"] ? "created" : "updated"}`);
               }
               if (state["warning"])
               {
                  setWarningMessage(state["warning"]);
               }
               delete state["createSuccess"];
               delete state["updateSuccess"];
               delete state["warning"];
               window.history.replaceState(state, "");
            }
         }
         catch (e)
         {
            console.error("Error loading record screen data:", e);
            setErrorMessage(`Error loading data: ${e instanceof Error ? e.message : String(e)}`);
         }
         finally
         {
            setLoading(false);
         }
      })();
   }, [tableName, recordId]);


   /***************************************************************************
    ** Switch mode and rebuild sections synchronously in one batch, so there's
    ** no intermediate render with new mode + old sections (which would cause
    ** view-only widget-adorned fields to error in edit mode).
    ***************************************************************************/
   function switchMode(newMode: RecordScreenMode): void
   {
      setMode(newMode);
      if (tableMetaData && metaData)
      {
         const sections = buildSections(tableMetaData, metaData, newMode);
         setTableSections(sections);

         const t1 = sections.find(s => s.tier === "T1");
         const nonT1 = sections.filter(s => s.tier !== "T1" && !s.isHidden);
         setT1Section(t1);
         setNonT1Sections(nonT1);
      }
   }


   /***************************************************************************
    ** build sections for the sidebar & page layout
    ***************************************************************************/
   function buildSections(tableMetaData: QTableMetaData, metaData: QInstance, mode: RecordScreenMode): QTableSection[]
   {
      const alternativeType = mode === "view" ? "RECORD_VIEW" : undefined;

      if (mode === "view")
      {
         return TableUtils.getSectionsForRecordSidebar(tableMetaData, null, undefined, alternativeType);
      }
      else
      {
         // for edit/create, use all fields but filter widget sections to qualifying types
         return TableUtils.getSectionsForRecordSidebar(tableMetaData, [...tableMetaData.fields.keys()], (section: QTableSection) =>
         {
            const widget = metaData?.widgets?.get(section.widgetName);
            if (widget)
            {
               if (widget.type === "childRecordList" && widget.defaultValues?.has("manageAssociationName"))
               {
                  return true;
               }
               if (widget.type === "filterAndColumnsSetup" || widget.type === "pivotTableSetup" || widget.type === "dynamicForm")
               {
                  return true;
               }
               if (widget.defaultValues?.get("includeOnRecordEditScreen"))
               {
                  return true;
               }
            }
            return false;
         });
      }
   }


   /***************************************************************************
    ** rebuild the formFieldsBySection map from the given sections.
    ** If allFormFields is not provided, uses the current formFields state.
    ***************************************************************************/
   function rebuildFormFieldsBySection(sections: QTableSection[], allFormFields?: { [key: string]: DynamicFormFieldDefinition }): void
   {
      const fields = allFormFields ?? formFields;
      const newFormFieldsBySection = new Map<string, DynamicFormFieldDefinition[]>();

      for (let section of sections)
      {
         if (section.isHidden || !section.fieldNames || section.fieldNames.length === 0)
         {
            continue;
         }

         const sectionFields: DynamicFormFieldDefinition[] = [];
         for (let fieldName of section.fieldNames)
         {
            const formField = fields[fieldName];
            if (formField)
            {
               sectionFields.push(formField);
            }
         }

         if (sectionFields.length > 0)
         {
            newFormFieldsBySection.set(section.name, sectionFields);
         }
      }

      setFormFieldsBySection(newFormFieldsBySection);
   }


   /***************************************************************************
    ** When entering edit mode, load widget data for managed-association
    ** childRecordList widgets so they can be rendered inline and managed.
    ***************************************************************************/
   useEffect(() =>
   {
      if ((mode === "edit" || mode === "create") && tableMetaData && metaData)
      {
         (async () =>
         {
            const newChildListWidgetData: { [name: string]: ChildRecordListData } = {};

            for (let section of tableSections)
            {
               if (!section.widgetName) continue;

               const widget = metaData.widgets.get(section.widgetName);
               if (!widget || widget.type !== "childRecordList") continue;
               if (!widget.defaultValues?.has("manageAssociationName")) continue;

               try
               {
                  const widgetFormData = new FormData();
                  widgetFormData.append("tableName", tableMetaData.name);
                  if (recordId)
                  {
                     widgetFormData.append("id", recordId);
                  }
                  const data = await qController.widget(widget.name, widgetFormData);
                  newChildListWidgetData[widget.name] = data as ChildRecordListData;
               }
               catch (e)
               {
                  console.error(`Error loading widget ${widget.name} for ${mode} mode:`, e);
               }
            }

            setChildListWidgetData(newChildListWidgetData);
         })();
      }
      else if (mode === "view")
      {
         setChildListWidgetData({});
      }
   }, [mode, tableSections]);


   /***************************************************************************
    ** Open the add-child-record modal for a managed-association widget.
    ***************************************************************************/
   function openAddChildRecord(widgetName: string, widgetData: ChildRecordListData): void
   {
      let defaultValues = widgetData.defaultValuesForNewChildRecords || {};

      let disabledFields = widgetData.disabledFieldsForNewChildRecords;
      if (!disabledFields)
      {
         disabledFields = widgetData.defaultValuesForNewChildRecords;
      }

      if (widgetData.defaultValuesForNewChildRecordsFromParentFields)
      {
         for (let childField in widgetData.defaultValuesForNewChildRecordsFromParentFields)
         {
            const parentField = widgetData.defaultValuesForNewChildRecordsFromParentFields[childField];
            defaultValues[childField] = formValuesRef.current[parentField];
         }
      }

      setShowEditChildForm({widgetName, table: widgetData.childTableMetaData, rowIndex: null, defaultValues, disabledFields});
   }


   /***************************************************************************
    ** Open the edit-child-record modal for an existing row.
    ***************************************************************************/
   function openEditChildRecord(widgetName: string, widgetData: ChildRecordListData, rowIndex: number): void
   {
      let defaultValues = widgetData.queryOutput.records[rowIndex].values;

      let disabledFields = widgetData.disabledFieldsForNewChildRecords;
      if (!disabledFields)
      {
         disabledFields = widgetData.defaultValuesForNewChildRecords;
      }

      setShowEditChildForm({widgetName, table: widgetData.childTableMetaData, rowIndex, defaultValues, disabledFields});
   }


   /***************************************************************************
    ** Delete a child record from the in-memory list.
    ***************************************************************************/
   function deleteChildRecord(widgetName: string, rowIndex: number): void
   {
      const newData = Object.assign({}, childListWidgetData);
      if (!newData[widgetName]?.queryOutput?.records) return;

      newData[widgetName].queryOutput.records.splice(rowIndex, 1);
      newData[widgetName].totalRows = newData[widgetName].queryOutput.records.length;
      setChildListWidgetData({...newData});
   }


   /***************************************************************************
    ** Called when the modal child-record form is submitted.
    ***************************************************************************/
   async function submitEditChildForm(values: any, tableName: string): Promise<void>
   {
      const widgetName = showEditChildForm.widgetName;
      const action: "insert" | "edit" = showEditChildForm.rowIndex == null ? "insert" : "edit";
      const rowIndex = showEditChildForm.rowIndex;

      const newData: { [name: string]: ChildRecordListData } = Object.assign({}, childListWidgetData);
      if (!newData[widgetName].queryOutput.records)
      {
         newData[widgetName].queryOutput.records = [];
      }

      // build display values for PVS fields
      const displayValues: { [fieldName: string]: string } = {};
      if (tableName && values)
      {
         const childTableMetaData = await qController.loadTableMetaData(tableName);
         for (let key in values)
         {
            const field = childTableMetaData.fields.get(key);
            if (field?.possibleValueSourceName)
            {
               const possibleValues = await qController.possibleValues(tableName, null, field.name, null, [values[key]], null, objectToMap(values), "form");
               if (possibleValues?.length > 0)
               {
                  displayValues[key] = possibleValues[0].label;
               }
            }
         }
      }

      switch (action)
      {
         case "insert":
            newData[widgetName].queryOutput.records.push({values, displayValues});
            break;
         case "edit":
            newData[widgetName].queryOutput.records[rowIndex] = {values, displayValues};
            break;
      }
      newData[widgetName].totalRows = newData[widgetName].queryOutput.records.length;
      setChildListWidgetData({...newData});
   }


   /***************************************************************************
    ** run the on-load form adjuster
    ***************************************************************************/
   async function runOnLoadFormAdjuster(table: QTableMetaData, values: { [key: string]: any }, defaultDisplayValues: Map<string, string>): Promise<void>
   {
      const postBody = new FormData();
      postBody.append("event", "onLoad");
      postBody.append("allValues", JSON.stringify(values));
      const response = await qController.axiosRequest(
         {
            method: "post",
            url: `/material-dashboard-backend/form-adjuster/table:${table.name}/onLoad`,
            data: postBody,
            headers: qController.defaultMultipartFormDataHeaders()
         });

      const updatedFields: { [fieldName: string]: QFieldMetaData } = response.updatedFieldMetaData;
      if (updatedFields)
      {
         for (let updatedFieldName in updatedFields)
         {
            table.fields.set(updatedFieldName, new QFieldMetaData(updatedFields[updatedFieldName]));
         }
      }

      const updatedFieldValues: { [fieldName: string]: any } = response?.updatedFieldValues ?? {};
      for (let fieldNameToUpdate in updatedFieldValues)
      {
         values[fieldNameToUpdate] = updatedFieldValues[fieldNameToUpdate];
      }

      const updatedFieldDisplayValues: { [fieldName: string]: string } = response?.updatedFieldDisplayValues ?? {};
      for (let fieldNameToUpdate in updatedFieldDisplayValues)
      {
         defaultDisplayValues?.set(fieldNameToUpdate, updatedFieldDisplayValues[fieldNameToUpdate]);
      }

      const fieldsToClear: string[] = response?.fieldsToClear ?? [];
      for (let fieldToClear of fieldsToClear)
      {
         values[fieldToClear] = null;
      }

      applyUpdatedSectionsFromFormAdjuster(table, response);

      if (response?.isFormDisabled && (mode === "edit" || mode === "create"))
      {
         let message = response.formDisabledMessage ?? "You are not allowed to edit this record.";
         setNotAllowedError(message);
         disableAllFields(table);
      }
   }


   /***************************************************************************
    ** apply updatedSectionMetaData from a form adjuster response
    ***************************************************************************/
   function applyUpdatedSectionsFromFormAdjuster(table: QTableMetaData, response: any): void
   {
      const updatedSections: Record<string, QTableSection> = response?.updatedSectionMetaData;
      if (!updatedSections)
      {
         return;
      }

      for (let name in updatedSections)
      {
         for (let i = 0; i < (table.sections ?? []).length; i++)
         {
            if (table.sections[i].name === name)
            {
               table.sections[i] = new QTableSection(updatedSections[name]);
            }
         }
      }

      const sections = buildSections(table, metaData, mode);
      setTableSections(sections);
      setNonT1Sections(sections.filter(s => s.tier !== "T1" && !s.isHidden));
   }


   /***************************************************************************
    ** collapsible section helpers
    ***************************************************************************/
   function makeCollapsibleSectionOpenStateLocalStorageKey(tableName: string, sectionName: string): string
   {
      return `qqq.recordView.collapsibleSectionOpenStates.${tableName}.${sectionName}`;
   }

   function toggleCollapsibleSectionOpenState(sectionName: string): void
   {
      const newValue = !collapsibleSectionOpenStates[sectionName];
      setCollapsibleSectionOpenStates((prevState) => ({...prevState, [sectionName]: newValue}));
      localStorage.setItem(makeCollapsibleSectionOpenStateLocalStorageKey(tableName, sectionName), newValue.toString());
   }


   /***************************************************************************
    ** Compute per-section visibility: a field-based section is hidden if all
    ** its fields are hidden. Widget sections are always visible (unless the
    ** section itself is hidden, which is handled separately).
    ***************************************************************************/
   /////////////////////////////////////////////////////////////////////////////////////
   // disable all fields on the table — used when a form adjuster says isFormDisabled //
   /////////////////////////////////////////////////////////////////////////////////////
   function disableAllFields(table: QTableMetaData): void
   {
      table.fields?.forEach((field) => field.isEditable = false);
      for (let fn in formFields)
      {
         formFields[fn].isEditable = false;
      }
      setFormFields({...formFields});
   }


   function figureOutSectionVisibility(table: QTableMetaData): void
   {
      const newVisibility: { [key: string]: boolean } = {};
      for (const section of table.sections ?? [])
      {
         if (section.widgetName || !section.fieldNames?.length)
         {
            continue;
         }

         let anyVisible = false;
         for (const fieldName of section.fieldNames)
         {
            const field = table.fields?.get(fieldName);
            if (field && !field.isHidden)
            {
               anyVisible = true;
               break;
            }
         }

         newVisibility[section.name] = anyVisible;
      }
      setSectionVisibility(newVisibility);
   }


   /***************************************************************************
    ** Open any collapsed sections that contain fields with validation errors.
    ***************************************************************************/
   function openCollapsedSectionsWithErrorFields(errorFieldNames: string[]): void
   {
      const updates: Record<string, boolean> = {};
      for (const section of nonT1Sections)
      {
         if (section.fieldNames && collapsibleSectionOpenStates[section.name] === false)
         {
            if (section.fieldNames.some((fn: string) => errorFieldNames.includes(fn)))
            {
               updates[section.name] = true;
            }
         }
      }
      if (Object.keys(updates).length > 0)
      {
         setCollapsibleSectionOpenStates((prev) => ({...prev, ...updates}));
      }
   }


   /***************************************************************************
    ** handle field-rule evaluation for a changed field value
    ***************************************************************************/
   function handleFieldChange(fieldName: string, oldValue: any, newValue: any, valueChangesToMake: { [fieldName: string]: any }): void
   {
      for (let fieldRule of fieldRules)
      {
         if (fieldRule.trigger === FieldRuleTrigger.ON_CHANGE && fieldRule.sourceField === fieldName)
         {
            switch (fieldRule.action)
            {
               case FieldRuleAction.CLEAR_TARGET_FIELD:
                  valueChangesToMake[fieldRule.targetField] = null;
                  break;
               case FieldRuleAction.RELOAD_WIDGET:
                  const additionalParams: { [key: string]: any } = {};
                  if (newValue != null)
                  {
                     additionalParams[fieldRule.sourceField] = newValue;
                  }
                  reloadWidget(fieldRule.targetWidget, additionalParams);
                  break;
            }
         }
      }

      ///////////////////////////////////////////
      // on-change form adjuster (field-level) //
      ///////////////////////////////////////////
      const field = formFields[fieldName];
      if (field)
      {
         const materialDashboardFieldMetaData = field.fieldMetaData?.supplementalFieldMetaData?.get("materialDashboard");
         if (materialDashboardFieldMetaData?.onChangeFormAdjuster)
         {
            if (field.type === "file" || field.type === "checkbox" || field.possibleValueProps)
            {
               runOnChangeFormAdjuster(fieldName, newValue, materialDashboardFieldMetaData);
            }
         }
      }
   }


   //////////////////////////////////////////////////////////////////////////////
   // handle blur on a text field — runs on-change form adjuster if configured //
   //////////////////////////////////////////////////////////////////////////////
   function handleFieldBlur(fieldName: string, value: any): void
   {
      const field = formFields[fieldName];
      if (field)
      {
         const materialDashboardFieldMetaData = field.fieldMetaData?.supplementalFieldMetaData?.get("materialDashboard");
         if (materialDashboardFieldMetaData?.onChangeFormAdjuster)
         {
            runOnChangeFormAdjuster(fieldName, value, materialDashboardFieldMetaData);
         }
      }
   }


   /***************************************************************************
    ** run on-change form adjuster for a field (AJAX call to backend)
    ***************************************************************************/
   async function runOnChangeFormAdjuster(fieldName: string, newValue: any, materialDashboardFieldMetaData: any): Promise<void>
   {
      const field = formFields[fieldName];
      if (!field) return;

      const adjuster = materialDashboardFieldMetaData.onChangeFormAdjuster;
      if (!adjuster) return;

      // temporarily disable fields while waiting on backend
      const fieldNamesToTempDisable: string[] = materialDashboardFieldMetaData.fieldsToDisableWhileRunningAdjusters ?? [];
      const previousIsEditableValues: { [key: string]: boolean } = {};
      if (fieldNamesToTempDisable.length > 0)
      {
         for (let fn in formFields)
         {
            if (fieldNamesToTempDisable.includes(fn))
            {
               previousIsEditableValues[fn] = formFields[fn].isEditable;
               formFields[fn].isEditable = false;
            }
         }
         setFormFields({...formFields});
      }

      try
      {
         const postBody = new FormData();
         postBody.append("event", "onChange");
         postBody.append("fieldName", fieldName);
         postBody.append("newValue", newValue);
         postBody.append("allValues", JSON.stringify(formValuesRef.current));
         const response = await qController.axiosRequest(
            {
               method: "post",
               url: `/material-dashboard-backend/form-adjuster/${encodeURIComponent(materialDashboardFieldMetaData.formAdjusterIdentifier)}/onChange`,
               data: postBody,
               headers: qController.defaultMultipartFormDataHeaders()
            });

         // replace field definitions if updated
         const updatedFields: { [fn: string]: QFieldMetaData } = response.updatedFieldMetaData;
         if (updatedFields)
         {
            for (let updatedFieldName in updatedFields)
            {
               const updatedField = new QFieldMetaData(updatedFields[updatedFieldName]);
               const dynamicField = DynamicFormUtils.getDynamicField(updatedField);
               const dynamicFieldInObject: Record<string, DynamicFormFieldDefinition> = {};
               dynamicFieldInObject[updatedFieldName] = dynamicField;
               DynamicFormUtils.addPossibleValueProps(dynamicFieldInObject, [updatedFields[updatedFieldName]], tableName, null, new Map());
               formFields[updatedFieldName] = dynamicField;

               // also update table field metadata so RecordScreenSection sees isHidden etc.
               tableMetaData?.fields?.set(updatedFieldName, updatedField);
            }
            setFormFields({...formFields});
         }

         // update field values
         const updatedFieldValues: { [fn: string]: any } = response?.updatedFieldValues ?? {};
         for (let fn in updatedFieldValues)
         {
            setFieldValueRef.current?.(fn, updatedFieldValues[fn]);
         }

         // update display values for PVS fields
         const updatedFieldDisplayValues: { [fn: string]: any } = response?.updatedFieldDisplayValues ?? {};
         for (let fn in updatedFieldDisplayValues)
         {
            const fieldToUpdate = formFields[fn];
            if (fieldToUpdate?.possibleValueProps)
            {
               fieldToUpdate.possibleValueProps.initialDisplayValue = updatedFieldDisplayValues[fn];
            }
         }

         // clear fields
         const fieldsToClear: string[] = response?.fieldsToClear ?? [];
         for (let fn of fieldsToClear)
         {
            setFieldValueRef.current?.(fn, "");
         }

         // update sections (show/hide)
         applyUpdatedSectionsFromFormAdjuster(tableMetaData, response);

         // recompute section visibility after field metadata changes
         figureOutSectionVisibility(tableMetaData);

         // disable form if adjuster says so
         if (response?.isFormDisabled)
         {
            setNotAllowedError(response.formDisabledMessage ?? "You are not allowed to edit this record.");
            disableAllFields(tableMetaData);
         }
      }
      finally
      {
         // restore disabled fields
         if (fieldNamesToTempDisable.length > 0)
         {
            for (let fn in formFields)
            {
               if (fieldNamesToTempDisable.includes(fn))
               {
                  formFields[fn].isEditable = previousIsEditableValues[fn];
               }
            }
            setFormFields({...formFields});
         }
      }
   }


   /***************************************************************************
    ** reload a widget via qController.widget()
    ***************************************************************************/
   function reloadWidget(widgetName: string, additionalParams?: { [key: string]: any }): void
   {
      (async () =>
      {
         try
         {
            const widgetFormData = new FormData();
            if (tableMetaData)
            {
               widgetFormData.append("tableName", tableMetaData.name);
            }
            if (recordId)
            {
               widgetFormData.append("id", recordId);
            }
            if (additionalParams)
            {
               for (let key in additionalParams)
               {
                  widgetFormData.append(key, additionalParams[key]);
               }
            }
            await qController.widget(widgetName, widgetFormData);
         }
         catch (e)
         {
            console.error(`Error reloading widget ${widgetName}:`, e);
         }
      })();
   }


   /***************************************************************************
    ** save the record (update or create)
    ***************************************************************************/
   async function saveRecord(values: any): Promise<void>
   {
      /////////////////////////////////////////////////////////////////////////
      // if an onSubmitCallback is provided, use it instead of API calls     //
      /////////////////////////////////////////////////////////////////////////
      if (options?.onSubmitCallback)
      {
         options.onSubmitCallback(values, tableName);
         return;
      }

      const valuesToPost = JSON.parse(JSON.stringify(values));

      for (let [fieldName, fieldMetaData] of tableMetaData.fields)
      {
         // date-time handling
         if (fieldMetaData.type === QFieldType.DATE_TIME && valuesToPost[fieldName])
         {
            if (initialValues[fieldName] === valuesToPost[fieldName])
            {
               delete valuesToPost[fieldName];
            }
            else
            {
               valuesToPost[fieldName] = ValueUtils.frontendLocalZoneDateTimeStringToUTCStringForBackend(valuesToPost[fieldName]);
            }
         }

         // blob handling
         if (fieldMetaData.type === QFieldType.BLOB)
         {
            if (typeof valuesToPost[fieldName] === "string")
            {
               delete valuesToPost[fieldName];
            }
            else
            {
               valuesToPost[fieldName] = values[fieldName];
            }
         }
      }

      const pathParts = location.pathname.replace(/\/+$/, "").split("/");

      if (recordId && !isCopy)
      {
         // update
         if (!skipNavigation)
         {
            recordAnalytics({category: "tableEvents", action: "saveEdit", label: tableMetaData?.label});
         }

         // bundle managed-association child records into the update payload
         const associationsToPost: any = {};
         let haveAssociationsToPost = false;
         for (let widgetName of Object.keys(childListWidgetData))
         {
            const manageAssociationName = metaData?.widgets?.get(widgetName)?.defaultValues?.get("manageAssociationName");
            if (!manageAssociationName) continue;

            if (childListWidgetData[widgetName]?.queryOutput?.records)
            {
               associationsToPost[manageAssociationName] = [];
               haveAssociationsToPost = true;
               for (let rec of childListWidgetData[widgetName].queryOutput.records)
               {
                  associationsToPost[manageAssociationName].push(rec.values);
               }
            }
         }
         if (haveAssociationsToPost)
         {
            valuesToPost["associations"] = JSON.stringify(associationsToPost);
         }

         const updatedRecord = await qController.update(tableName, recordId, valuesToPost);

         if (skipNavigation)
         {
            // modal context — don't refetch, navigate, or change mode
            return;
         }

         // re-fetch the full record (with display values, joins, etc.)
         let queryJoins: QueryJoin[] = null;
         const visibleJoinTables = TableUtils.getVisibleJoinTables(tableMetaData);
         if (visibleJoinTables.size > 0)
         {
            queryJoins = TableUtils.getQueryJoins(tableMetaData, visibleJoinTables);
         }
         const freshRecord = await qController.get(tableName, recordId, tableVariant, null, queryJoins);
         setRecord(freshRecord);
         setPageHeader(freshRecord.recordLabel);

         // update initialValues so re-entering edit mode has fresh data
         const newInitialValues: { [key: string]: any } = {};
         tableMetaData.fields.forEach((fieldMetaData, key) =>
         {
            newInitialValues[key] = freshRecord.values.get(key);
            if (fieldMetaData.type === QFieldType.DATE_TIME && newInitialValues[key])
            {
               newInitialValues[key] = ValueUtils.formatDateTimeValueForForm(newInitialValues[key]);
            }
         });
         setInitialValues(newInitialValues);

         // show messages directly
         setSuccessMessage(`${tableMetaData.label} successfully updated`);
         if (updatedRecord.warnings?.length > 0)
         {
            setWarningMessage(updatedRecord.warnings[0]);
         }

         // capture scroll position of the first visible field section before switching modes
         if (options?.scrollCorrectionRef)
         {
            const fieldSections = Array.from(document.querySelectorAll("[data-field-name]"));
            for (const el of fieldSections)
            {
               const rect = el.getBoundingClientRect();
               if (rect.top >= 0 && rect.top < window.innerHeight)
               {
                  const fieldName = el.getAttribute("data-field-name");
                  options.scrollCorrectionRef.current = {fieldName, yBefore: rect.top};
                  break;
               }
            }
         }

         switchMode("view");
         if (initialMode === "view")
         {
            // edit was entered via pushState — push a new view entry (keeps /edit in history for Back)
            window.history.pushState(null, "", location.pathname.replace(/\/edit$/, ""));
         }
         else
         {
            // direct navigation to /edit URL — replace in place
            window.history.replaceState(null, "", location.pathname.replace(/\/edit$/, ""));
         }
         window.dispatchEvent(new Event("urlchanged"));
      }
      else
      {
         // create
         if (!skipNavigation)
         {
            recordAnalytics({category: "tableEvents", action: isCopy ? "saveCopy" : "saveNew", label: tableMetaData?.label});
         }

         const createdRecord = await qController.create(tableName, valuesToPost);

         if (skipNavigation)
         {
            // modal context — don't navigate after create
            return;
         }

         let warningMsg = null;
         if (createdRecord.warnings?.length > 0)
         {
            warningMsg = createdRecord.warnings[0];
         }

         const path = isCopy
            ? location.pathname.replace(new RegExp(`/${recordId}/copy$`), "/" + createdRecord.values.get(tableMetaData.primaryKeyField))
            : location.pathname.replace(/create$/, createdRecord.values.get(tableMetaData.primaryKeyField));
         navigate(path, {state: {createSuccess: true, warning: warningMsg}});
      }
   }


   /***************************************************************************
    ** delete the record
    ***************************************************************************/
   async function deleteRecord(): Promise<void>
   {
      recordAnalytics({category: "tableEvents", action: "delete", label: tableMetaData?.label + " / " + record?.recordLabel});

      await qController.delete(tableName, recordId);

      const pathParts = location.pathname.replace(/\/+$/, "").split("/");
      const path = pathParts.slice(0, -1).join("/");
      navigate(path, {state: {deleteSuccess: true}});
   }


   return {
      mode,
      setMode: switchMode,
      record,
      tableMetaData,
      metaData,
      tableSections,
      t1Section,
      nonT1Sections,
      formFields,
      formFieldsBySection,
      initialValues,
      formValidations,
      fieldRules,
      loading,
      notFoundMessage,
      errorMessage,
      successMessage,
      warningMessage,
      notAllowedError,
      saveRecord,
      deleteRecord,
      handleFieldChange,
      handleFieldBlur,
      reloadWidget,
      allTableProcesses,
      tableVariant,
      collapsibleSectionOpenStates,
      toggleCollapsibleSectionOpenState,
      openCollapsedSectionsWithErrorFields,
      setSuccessMessage,
      setWarningMessage,
      setErrorMessage,
      setFieldValueRef,
      formValuesRef,
      disabledFields,
      childListWidgetData,
      showEditChildForm,
      setShowEditChildForm,
      openAddChildRecord,
      openEditChildRecord,
      deleteChildRecord,
      submitEditChildForm,
      sectionVisibility,
      addSubValidations,
   };
}
