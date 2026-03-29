/*
 * QQQ - Low-code Application Framework for Engineers.
 * Copyright (C) 2021-2024.  Kingsrook, LLC
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


import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import Icon from "@mui/material/Icon";
import Modal from "@mui/material/Modal";
import Table from "@mui/material/Table";
import Tooltip from "@mui/material/Tooltip/Tooltip";
import Typography from "@mui/material/Typography";
import {QFieldMetaData} from "@qrunio/qqq-frontend-core/lib/model/metaData/QFieldMetaData";
import {QFieldType} from "@qrunio/qqq-frontend-core/lib/model/metaData/QFieldType";
import {QWidgetMetaData} from "@qrunio/qqq-frontend-core/lib/model/metaData/QWidgetMetaData";
import {QRecord} from "@qrunio/qqq-frontend-core/lib/model/QRecord";
import {Formik, FormikValues, useFormikContext} from "formik";
import QContext from "QContext";
import colors from "qqq/assets/theme/base/colors";
import {QCancelButton, QSaveButton} from "qqq/components/buttons/DefaultButtons";
import QDynamicForm, {DynamicFormDataDefinition} from "qqq/components/forms/DynamicForm";
import DynamicFormUtils from "qqq/components/forms/DynamicFormUtils";
import {Group, Option} from "qqq/components/misc/QHierarchyAutoComplete";
import {WidgetScreenType} from "qqq/components/widgets/DashboardWidgets";
import {DragAndDropElementWrapper, DragPreviewLayer} from "qqq/components/widgets/misc/DragAndDropElementWrapper";
import Widget from "qqq/components/widgets/Widget";
import ValueUtils from "qqq/utils/qqq/ValueUtils";
import usePossibleValueLabels from "qqq/utils/usePossibleValueLabels";
import React, {Ref, useCallback, useContext, useEffect, useMemo, useState} from "react";
import {DndProvider} from "react-dnd";
import {HTML5Backend} from "react-dnd-html5-backend";
import * as Yup from "yup";


/*******************************************************************************
 ** component props
 *******************************************************************************/
interface RowBuilderWidgetProps
{
   widgetMetaData: QWidgetMetaData,
   onSaveCallback?: (values: { [name: string]: any }) => void,
   widgetData?: any,
   screen?: WidgetScreenType,
   addSubValidations?: (name: string, validationScheme: Record<string, Yup.BaseSchema>) => void,
   parentFormValues?: Record<string, any>,
}

//////////////////////////////////////////////////////////////////////////////////////////////
// main model for this component to use internally.  may evolve more if more data are added //
//////////////////////////////////////////////////////////////////////////////////////////////
interface RowBuilderModel
{
   records: QRecord[];
}


//////////////////////////////////////
// helpers for tracking row indexes //
//////////////////////////////////////
let qRowIndexValue = 0;
const ROW_INDEX_KEY = "_qRowIndex";


/*******************************************************************************
 * Widget to build (or otherwise manage - add, delete, edit, and optionally
 * reorder) a list of rows (records).
 *
 * Note this is in a beta-state.  It should be usable for processes or standalone
 * widget use cases, but, has some known issues if being used on table view/edit
 * screens:
 * - edit screen doesn't show values unless you hit reload
 * - every key press is re-rendering
 * - need to block adding rows if withDefaultValuesForNewRowsFromParentRecord
 * fields aren't set (e.g., until you select client, you can't add children)
 * - need to, idk, maybe remove all of the rows if changing any of the
 * withDefaultValuesForNewRowsFromParentRecord fields?
 *******************************************************************************/
export default function RowBuilderWidget({widgetMetaData, onSaveCallback, widgetData, screen, addSubValidations, parentFormValues}: RowBuilderWidgetProps): JSX.Element
{
   const [modalOpen, setModalOpen] = useState(false);
   const [errorAlert, setErrorAlert] = useState(null as string);

   const [rowBuilderModel, setRowBuilderModel] = useState(null as RowBuilderModel);
   ///////////////////////////////////////////////////////////////////////////////////////////
   // this is a copy of rowBuilderModel, that we'll use in the modal editor.  Then,         //
   // on-save, we'll move it to rowBuilderModel (so hitting cancel reverts the essentially) //
   ///////////////////////////////////////////////////////////////////////////////////////////
   const [modalRowBuilderModel, setModalRowBuilderModel] = useState(null as RowBuilderModel);

   ///////////////////////////
   // structures for Formik //
   ///////////////////////////
   const [initialValues, setInitialValues] = useState({} as Record<string, any>);
   const [validations, setValidations] = useState({} as Yup.BaseSchema);
   const formikContext = useFormikContext();

   const {getDisplayValues} = usePossibleValueLabels({useCase: "filter"});

   const {pushModalOnStack, popModalOffStack} = useContext(QContext);

   ////////////////////////////////////////////////////////////////
   // read values from widgetMetaData and widgetData into locals //
   ////////////////////////////////////////////////////////////////
   const orderByFieldName = widgetMetaData.defaultValues.get("orderByFieldName");
   const mayReorderRows = `${widgetMetaData.defaultValues.get("mayReorderRows")}` == "true";
   const isForRecordViewAndEditScreen = `${widgetMetaData.defaultValues.get("isForRecordViewAndEditScreen")}` == "true";
   const isEditable = isForRecordViewAndEditScreen ? (screen === "recordEdit") : `${widgetMetaData.defaultValues.get("isEditable")}` == "true";
   const useModalEditor = `${widgetMetaData.defaultValues.get("useModalEditor")}` == "true";
   const associationName = widgetMetaData.defaultValues.get("associationName");
   const outputFieldName = associationName ?? widgetMetaData.defaultValues.get("outputFieldName") ?? "records";
   const useAddRowsButton = false;
   const defaultValuesForNewRowsFromParentRecord: Record<string, string> = widgetMetaData.defaultValues.get("defaultValuesForNewRowsFromParentRecord");
   const defaultValuesForNewRecords: Record<string, any> = widgetData?.defaultValuesForNewRecords;

   /////////////////////////////////////////////////////////////////////////
   // convert the fields from meta data to list of QFieldMetaData objects //
   /////////////////////////////////////////////////////////////////////////
   const fields = useMemo(() =>
   {
      const fields: QFieldMetaData[] = [];
      for (const field of widgetMetaData.defaultValues.get("frontendFields") ?? widgetMetaData.defaultValues.get("fields") ?? [])
      {
         fields.push(new QFieldMetaData(field));
      }
      return fields;
   }, [widgetMetaData]);


   /////////////////////////////////////////////////////////////////////
   // for the work-in-progress version of the add-many menu button... //
   /////////////////////////////////////////////////////////////////////
   /*
   const [addMenuIsOpen, setAddMenuIsOpen] = useState(false);
   const [addMenuAnchorEl, setAddMenuAnchorEl] = useState<null | HTMLElement>(null);
   const addMenuButtonRef = useRef<HTMLButtonElement | null>(null);

   const handleAddMenuOpen = (event: React.MouseEvent<HTMLElement>) =>
   {
      // setAddMenuAnchorEl(event.currentTarget);
      setAddMenuAnchorEl(addMenuButtonRef.current);
      setAddMenuIsOpen(true);
   };

   const handleAddMenuClose = () =>
   {
      console.log("@dk in an on close...");
      setAddMenuIsOpen(false);
   };
   */

   ///////////////////////////////////////////////////
   // add Edit button if modal editor is to be used //
   ///////////////////////////////////////////////////
   const labelAdditionalElementsRight: JSX.Element[] = [];
   if (isEditable && useModalEditor)
   {
      labelAdditionalElementsRight.push(
         <Button key="editButton" disabled={false} onClick={() => openEditor()} sx={{p: 0}} disableRipple>
            <Typography display="inline" textTransform="none" fontSize={"1.125rem"}>
               Edit
            </Typography>
         </Button>
      );
   }


   //////////////////
   // initial load //
   //////////////////
   useEffect(() =>
   {
      if (!rowBuilderModel)
      {
         qRowIndexValue = 0;
         let originalRowBuilderModel: RowBuilderModel = {records: []};

         let seqNo = 0;
         for (const record of widgetData?.records ?? [])
         {
            const qRecord = new QRecord(record);

            if (qRecord.values.get(ROW_INDEX_KEY) == null)
            {
               qRecord.values.set(ROW_INDEX_KEY, qRowIndexValue++);
            }
            else
            {
               ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
               // let a row index value come from the backend (in case backend is saving them, and it expects them to remain stable) //
               ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
               const thisRowIndexValue = Number(qRecord.values.get(ROW_INDEX_KEY));
               qRowIndexValue = Math.max(thisRowIndexValue, qRowIndexValue) + 1;
            }

            if (mayReorderRows)
            {
               qRecord.values.set(orderByFieldName, seqNo++);
            }
            originalRowBuilderModel.records.push(qRecord);
         }

         setRowBuilderModel(originalRowBuilderModel);
         buildInitialValues(originalRowBuilderModel.records);
      }
   });


   ////////////////////////////////
   // build Yup form validations //
   ////////////////////////////////
   useEffect(() =>
   {
      const formValidations: Record<string, Yup.BaseSchema> = {};
      let i = 0;
      for (let row of (useModalEditor ? modalRowBuilderModel : rowBuilderModel)?.records ?? [])
      {
         for (let field of fields)
         {
            const rowIndex = row.values.get(ROW_INDEX_KEY);
            const fullName = makeFullName(field.name, rowIndex);
            formValidations[fullName] = DynamicFormUtils.getValidationForField(field);
         }
      }

      setValidations(Yup.object().shape(formValidations));

      ////////////////////////////////////////////////
      // pass validations up to parent if available //
      ////////////////////////////////////////////////
      addSubValidations?.(widgetMetaData.name, formValidations);

   }, [modalRowBuilderModel, rowBuilderModel]);


   /***************************************************************************
    * for a list of records, populate the initialValues state variable
    * (as formik needs).
    ***************************************************************************/
   function buildInitialValues(records?: QRecord[])
   {
      const newInitialValues: Record<string, any> = {};

      for (const record of records ?? [])
      {
         const rowIndex = record.values.get(ROW_INDEX_KEY);
         for (let fieldName of record.values.keys())
         {
            const fullFieldName = makeFullName(fieldName, rowIndex);
            const value = record.values.get(fieldName);
            newInitialValues[fullFieldName] = value;
            formikContext?.setFieldValue(fullFieldName, value);
         }
      }

      for (const fieldName in widgetData?.hiddenValues ?? {})
      {
         const value = widgetData.hiddenValues[fieldName];
         newInitialValues[fieldName] = value;
         formikContext?.setFieldValue(fieldName, value);
      }

      setInitialValues(newInitialValues);
   }


   /***************************************************************************
    * helper to build a new empty record
    ***************************************************************************/
   function newEmptyQRecord()
   {
      return new QRecord({values: {}, displayValues: {}});
   }


   /***************************************************************************
    * make a "full name" from a field name and index.
    * so we can have the same field on the form multiple times, with unique names.
    ***************************************************************************/
   function makeFullName(fieldName: string, index: number)
   {
      return fieldName + "_" + index;
   }


   /***************************************************************************
    * reverse what makeFullName does - to get the parts out of a whole.
    ***************************************************************************/
   function splitFullName(fullName: string): { fieldName: string, index: number }
   {
      const fieldName = fullName.substring(0, fullName.lastIndexOf("_"));
      const index = Number(fullName.substring(fullName.lastIndexOf("_") + 1));
      return {fieldName, index};
   }


   /*******************************************************************************
    * add a new row to the model (either for modal model or standard one)
    *******************************************************************************/
   function addRow(forModal: boolean)
   {
      const newRecord = newEmptyQRecord();

      //////////////////////////////////////////////////////////////////////
      // put the next index value on this record - note - that's not      //
      // sequenceNo - it's to keep records "stable" as they are reordered //
      //////////////////////////////////////////////////////////////////////
      const thisRowIndexValue = qRowIndexValue++;
      newRecord.values.set(ROW_INDEX_KEY, thisRowIndexValue);

      if(mayReorderRows)
      {
         newRecord.values.set(orderByFieldName, (forModal ? modalRowBuilderModel : rowBuilderModel).records.length);
      }

      /////////////////////////////////////////////////////////////////////////
      // copy default values from the parent form/record into the new record //
      /////////////////////////////////////////////////////////////////////////
      for (let fromFieldName in (defaultValuesForNewRowsFromParentRecord ?? {}))
      {
         const toFieldName = defaultValuesForNewRowsFromParentRecord[fromFieldName];
         const value = parentFormValues?.[fromFieldName];
         newRecord.values.set(toFieldName, value);
         formikContext?.setFieldValue(makeFullName(toFieldName, thisRowIndexValue), value);
         // todo display values... ?
      }

      //////////////////////////////////////////
      // set default values in the new record //
      //////////////////////////////////////////
      for (let fieldName in (defaultValuesForNewRecords ?? {}))
      {
         const value = defaultValuesForNewRecords[fieldName];
         newRecord.values.set(fieldName, value);
         formikContext?.setFieldValue(makeFullName(fieldName, thisRowIndexValue), value);
         // todo display values... ?
      }

      ///////////////////////////////////
      // set the modal back into state //
      ///////////////////////////////////
      if (forModal)
      {
         setModalRowBuilderModel({records: [...modalRowBuilderModel.records, newRecord]});
      }
      else
      {
         setRowBuilderModel({records: [...rowBuilderModel.records, newRecord]});

         ///////////////////////////////////////////////////////////////////////////////////////
         // when not in a modal form, run this callback, to propagate data to the parent form //
         ///////////////////////////////////////////////////////////////////////////////////////
         runOnSaveCallback(rowBuilderModel.records);
      }

      ////////////////////////////////////////////////////////////////////////////
      // try to put focus in the first field of the new row after the re-render //
      ////////////////////////////////////////////////////////////////////////////
      setTimeout(() =>
      {
         try
         {
            document.getElementById(makeFullName(fields[0].name, thisRowIndexValue)).focus();
         }
         catch (e)
         {
         }
      }, 100);
   }


   /***************************************************************************
    * callback for the addRows button (that would need to translate its option
    * to some value(s) for the new row)
    ***************************************************************************/
   function handleAddRow(forModal: boolean, option: Option, group: Group)
   {
      addRow(forModal);
   }


   /*******************************************************************************
    * remove a row from the model (e.g., for user hitting 'x' button)
    *******************************************************************************/
   function removeRow(forModal: boolean, index: number)
   {
      const records = (forModal ? modalRowBuilderModel : rowBuilderModel).records;
      records.splice(index, 1);

      if(mayReorderRows)
      {
         for (let i = 0; i < records.length; i++)
         {
            records[i].values.set(orderByFieldName, i);
         }
      }

      ///////////////////////////////////
      // set the modal back into state //
      ///////////////////////////////////
      if (forModal)
      {
         setModalRowBuilderModel({records: [...records]});
      }
      else
      {
         setRowBuilderModel({records: [...records]});

         ///////////////////////////////////////////////////////////////////////////////////////
         // when not in a modal form, run this callback, to propagate data to the parent form //
         ///////////////////////////////////////////////////////////////////////////////////////
         runOnSaveCallback(records);
      }
   }


   /*******************************************************************************
    ** drag & drop callback to move one of the rows
    *******************************************************************************/
   const dndCallback = useCallback((forModal: boolean, dragIndex: number, hoverIndex: number, isDrop: boolean) =>
   {
      const records = (forModal ? modalRowBuilderModel : rowBuilderModel).records;
      const dragItem = records[dragIndex];
      records.splice(dragIndex, 1);
      records.splice(hoverIndex, 0, dragItem);

      for (let i = 0; i < records.length; i++)
      {
         records[i].values.set(orderByFieldName, i);
      }

      if (forModal)
      {
         setModalRowBuilderModel({records: [...records]});
      }
      else
      {
         setRowBuilderModel({records: [...records]});
         if(isDrop)
         {
            runOnSaveCallback(rowBuilderModel.records);
         }
      }

   }, [modalRowBuilderModel, rowBuilderModel]);


   /*******************************************************************************
    * open (modal) editor
    *******************************************************************************/
   function openEditor()
   {
      ////////////////////////////////////////////
      // re-set the index values in the records //
      ////////////////////////////////////////////
      qRowIndexValue = 0;
      for (let record of rowBuilderModel.records)
      {
         record.values.set(ROW_INDEX_KEY, qRowIndexValue++);
      }

      setModalRowBuilderModel(Object.assign({}, rowBuilderModel));
      buildInitialValues(rowBuilderModel.records);
      setModalOpen(true);
      pushModalOnStack?.(widgetMetaData.name);
   }


   /*******************************************************************************
    * close the modal editor - either after a cancel or save - but also - this is
    * the callback from the Modal component (so note we'll avoid closing for some
    * of its reasons).
    *******************************************************************************/
   function closeEditor(event?: {}, reason?: "backdropClick" | "escapeKeyDown")
   {
      if (reason == "backdropClick" || reason == "escapeKeyDown")
      {
         return;
      }

      setModalOpen(false);
      popModalOffStack?.(widgetMetaData.name);
   }


   /***************************************************************************
    * callback from QDynamicForm for when a value changes.
    ***************************************************************************/
   async function valueChangedCallback(forModal: boolean, fullName: string, value: any)
   {
      const model = forModal ? modalRowBuilderModel : rowBuilderModel;

      /////////////////////////////////////////////////////////////////////////////
      // update our internal model for the records in real-time as values change //
      // capture possible value labels and put them in our record displayValues  //
      /////////////////////////////////////////////////////////////////////////////
      const {fieldName, index} = splitFullName(fullName);
      for (let i = 0; i < fields.length; i++)
      {
         const field = fields[i];
         if (field.name == fieldName)
         {
            for (let record of model.records)
            {
               if (record.values.get(ROW_INDEX_KEY) == index)
               {
                  if (field.possibleValueSourceName)
                  {
                     record.values.set(fieldName, value ? value.id : null);
                     record.displayValues.set(fieldName, value ? value.label : "");
                  }
                  else
                  {
                     record.values.set(fieldName, value);
                  }
               }
            }
         }
      }

      /////////////////////////////////////////////////////////////////////////////////////////////////////////////
      // if we're not using the modal editor, then every value-change should be sent back to the on-save handler //
      // e.g., hot edits!                                                                                        //
      /////////////////////////////////////////////////////////////////////////////////////////////////////////////
      if (!useModalEditor)
      {
         runOnSaveCallback(model.records);
      }
   }


   /***************************************************************************
    * handle save button for modal form
    ***************************************************************************/
   async function handleSubmit(values: FormikValues)
   {
      /////////////////////////////////////////////////////////////
      // put values into the records - mapping them by row index //
      /////////////////////////////////////////////////////////////
      const pvLabelsToLoad: Record<string, any[]> = {};
      const pvFields: Record<string, QFieldMetaData> = {};
      for (let record of modalRowBuilderModel.records)
      {
         const rowIndex = record.values.get(ROW_INDEX_KEY);

         for (let field of fields)
         {
            const fullName = makeFullName(field.name, rowIndex);
            const value = values[fullName];
            record.values.set(field.name, value);

            //////////////////////////////////////////
            // track if possible value id is needed //
            //////////////////////////////////////////
            if (field.possibleValueSourceName)
            {
               if (!pvLabelsToLoad[field.name])
               {
                  pvLabelsToLoad[field.name] = [];
                  pvFields[field.name] = field;
               }
               pvLabelsToLoad[field.name].push(value);
            }
         }
      }

      //////////////////////////////////////////
      // load possible value labels as needed //
      //////////////////////////////////////////
      for (let fieldName in pvLabelsToLoad)
      {
         const field: QFieldMetaData = pvFields[fieldName];
         const dynamicFormField = DynamicFormUtils.getDynamicField(field);
         DynamicFormUtils.addPossibleValuePropsToSingleField(dynamicFormField, field, null, null, new Map());

         const displayValues = await getDisplayValues(dynamicFormField, pvLabelsToLoad[fieldName]);
         for (let record of modalRowBuilderModel.records)
         {
            record.displayValues.set(fieldName, displayValues[record.values.get(fieldName)]);
         }
      }

      ///////////////////////////////////////////////////////////////////////////////////////////////////
      // make a new model from the modal-model (e.g., for the view-version to show what the modal had) //
      ///////////////////////////////////////////////////////////////////////////////////////////////////
      const newModel = Object.assign({}, modalRowBuilderModel);
      setRowBuilderModel(newModel);

      ////////////////////////////////////////////////////
      // run the callback to get data out of the widget //
      ////////////////////////////////////////////////////
      runOnSaveCallback(newModel.records);

      closeEditor();
   }


   /***************************************************************************
    * get records out of the widget - eg, to the parent component, after a
    * modal save, or upon changes.
    ***************************************************************************/
   function runOnSaveCallback(records: QRecord[])
   {
      ////////////////////////////////////////////////////////////////////////////////////////////
      // QRecords don't serialize well, so convert them to js Records to stringify for callback //
      ////////////////////////////////////////////////////////////////////////////////////////////
      const recordsForCallback: Record<string, any>[] = [];
      for (let record of records)
      {
         const recordForCallback: Record<string, any> = {};
         recordsForCallback.push(recordForCallback);
         for (let field of fields)
         {
            recordForCallback[field.name] = record.values.get(field.name);
         }
         recordForCallback[ROW_INDEX_KEY] = record.values.get(ROW_INDEX_KEY);
      }

      const callbackArg: Record<string, string> = {};
      callbackArg[outputFieldName] = JSON.stringify(recordsForCallback);
      onSaveCallback?.(callbackArg);
   }


   /***************************************************************************
    * render a row in the form
    ***************************************************************************/
   function FormRowWrapper(
      {forModal, rowForm, index, dragRef}:
      { forModal: boolean, rowForm: JSX.Element, index: number, dragRef?: Ref<HTMLSpanElement> }
   ): JSX.Element
   {
      return (
         <Box key={index} borderBottom={`1px solid ${colors.grayLines.main}`} display="flex" alignItems="center" gap="1rem" pb="0.75rem" mb="0.5rem" pr="0.5rem">
            {
               mayReorderRows && <Box>
                  <Icon ref={dragRef} sx={{cursor: "ns-resize"}}>drag_indicator</Icon>
               </Box>
            }
            <Box className="rowBuilderRowForm" width="100%">{rowForm}</Box>
            <Box alignSelf="flex-start" pt="2.5rem">
               <Tooltip title="Remove Row" enterDelay={500}>
                  <Button sx={xIconButtonSX} onClick={() => removeRow(forModal, index)}><Icon>clear</Icon></Button>
               </Tooltip>
            </Box>
         </Box>
      );
   }


   /*******************************************************************************
    * component which is the form for editing rows
    *******************************************************************************/
   function RenderRowsForm({forModal}: { forModal: boolean }): JSX.Element
   {
      const model = forModal ? modalRowBuilderModel : rowBuilderModel;

      const formikProps = useFormikContext();
      if (!formikProps)
      {
         return (<Alert severity="error">Error: Form is not being rendered inside a FormikContext.</Alert>);
      }

      const formData: DynamicFormDataDefinition = {
         touched: formikProps.touched,
         errors: formikProps.errors,
         formFields: {},
      };

      //////////////////////////////////////////////////////
      // build a record that holds all values in the form //
      // seed it with 'hidden values' first               //
      //////////////////////////////////////////////////////
      const allFormValuesRecord = newEmptyQRecord();
      for (const fieldName in widgetData?.hiddenValues ?? {})
      {
         formData.formFields[fieldName] = DynamicFormUtils.getDynamicField(new QFieldMetaData({name: fieldName, type: QFieldType.STRING}));
         allFormValuesRecord.values.set(fieldName, widgetData.hiddenValues[fieldName]);
      }

      //////////////////////////////////////////////////////////////////////////////////////////////
      // loop over the rows, making dynamic form fields and a form with those fields for each row //
      //////////////////////////////////////////////////////////////////////////////////////////////
      let rowForms: JSX.Element[] = [];
      let i = 0;
      for (let row of model.records)
      {
         const fieldNamesForRow: string[] = [];
         for (let field of fields)
         {
            const rowIndex = row.values.get(ROW_INDEX_KEY);
            const fullName = makeFullName(field.name, rowIndex);
            fieldNamesForRow.push(fullName);
            const dynamicFormField = DynamicFormUtils.getDynamicField(field);
            DynamicFormUtils.addPossibleValuePropsToSingleField(dynamicFormField, field, null, null, row.displayValues);
            if (dynamicFormField.possibleValueProps)
            {
               // oye!
               dynamicFormField.possibleValueProps.fieldName = fullName;
            }
            formData.formFields[fullName] = dynamicFormField;

            allFormValuesRecord.values.set(fullName, row.values.get(field.name));
            allFormValuesRecord.displayValues.set(fullName, row.displayValues.get(field.name));
         }
         rowForms.push(<QDynamicForm
            key={i++}
            formData={formData}
            record={allFormValuesRecord}
            fieldNamesToInclude={fieldNamesForRow}
            helpContentKeyPrefix={`widget:${widgetMetaData.name}`}
            helpRoles={["ALL_SCREENS"]}
            valueChangedCallback={(fieldName, newValue) => valueChangedCallback(forModal, fieldName, newValue)}
         />);
      }

      //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
      // render - noting that we needed to add a slight mb on DynamicSelect's wrapper so that its error messages show //
      // note - the hard-coded 300px on dragPreviewLayer is bad... was needed for workflow editor use-case...         //
      //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
      return (<Box sx={{"& .DynamicSelectAutoCompleteWrapper": {mb: "0.75rem"}}}>
         <DragPreviewLayer itemStyles={{width: "300px"}} />
         {
            rowForms.map((rowForm, i) =>
            {
               if (mayReorderRows)
               {
                  return (<DragAndDropElementWrapper
                     key={i}
                     id={`${i}`}
                     index={i}
                     dropCallback={(dragIndex, hoverIndex) => dndCallback(forModal, dragIndex, hoverIndex, true)}
                  >
                     <FormRowWrapper forModal={forModal} rowForm={rowForm} index={i} />
                  </DragAndDropElementWrapper>);
               }
               else
               {
                  return <FormRowWrapper key={i} forModal={forModal} rowForm={rowForm} index={i} />;
               }
            })
         }
         <Box pt="0.5rem">
            <Button sx={buttonSX} onClick={() => addRow(forModal)}>+ Add new</Button>
         </Box>
      </Box>);
   }


   /*******************************************************************************
    ** component that is the view-form
    *******************************************************************************/
   function RenderRowsView({forModal}: { forModal: boolean }): JSX.Element
   {
      const model = forModal ? modalRowBuilderModel : rowBuilderModel;

      const tableStyle =
         {
            fontSize: "0.875rem",
            fontWeight: "400",
            width: "calc(100% - 1rem)",
            "& td, & th": {
               padding: "0.5rem 0.5rem",
               borderTop: "1px solid rgb(225, 225, 225)",
               borderBottom: "1px solid rgb(225, 225, 225)",
               borderCollapse: "collapse",
            },
            "& th": {
               fontSize: "0.75rem",
               fontWeight: "500",
               color: "rgb(95, 95, 95)",
               textAlign: "left",
            }
         };

      const visibleFields = fields.filter(field => !field.isHidden);

      return <>
         <Table sx={tableStyle}>
            <thead>
               {
                  visibleFields.map((field, i) => (<th key={i}>{field.label}</th>))
               }
            </thead>
            <tbody>
               {
                  model.records?.length ?
                     model.records.map((record, i) => (
                        <tr key={i}>
                           {
                              visibleFields.map((field, j) =>
                                 (
                                    <td key={`${i}.${j}`}>{ValueUtils.getValueForDisplay(fields[j], record.values?.get(fields[j].name), record.displayValues?.get(fields[j].name), "view", null, record, fields[j].name)}</td>
                                 ))
                           }
                        </tr>
                     )) :
                     <tr>
                        <td colSpan={visibleFields.length} align="center">No rows</td>
                     </tr>
               }
            </tbody>
         </Table>
      </>;
   }

   ////////////
   // render //
   ////////////
   return (<Widget widgetMetaData={widgetMetaData} labelAdditionalElementsLeft={[<h2 key="label">{widgetMetaData.defaultValues?.get("inlineHeading")}</h2>]} labelAdditionalElementsRight={labelAdditionalElementsRight}>
      {
         <React.Fragment>
            {
               (!fields || fields.length === 0) && <Alert icon={<Icon>error_outline</Icon>} color="error">Configuration error: No fields were defined for this widget</Alert>
            }
            <DndProvider backend={HTML5Backend}>
               {
                  rowBuilderModel &&
                  <>
                     {
                        /* the view-only version */
                        (!isEditable || useModalEditor) && <Grid container spacing="16">
                           <Grid item xs={12}><RenderRowsView forModal={false} /></Grid>
                        </Grid>
                     }

                     {
                        /* the inline form - which may or may not require a Formik wrapper */
                        (isEditable && !useModalEditor) &&
                        (
                           widgetMetaData.defaultValues?.get("requiresFormWrapper") ? (
                              <Formik initialValues={initialValues} validationSchema={validations} onSubmit={handleSubmit}>
                                 {({handleSubmit}) => (
                                    <Grid item xs={12}><RenderRowsForm forModal={false} /></Grid>
                                 )}
                              </Formik>
                           ) : <Grid item xs={12}><RenderRowsForm forModal={false} /></Grid>
                        )
                     }

                     {
                        /* the modal form, which includes its own Formik */
                        (isEditable && useModalEditor && modalOpen) &&
                        <Modal open={modalOpen} onClose={(event, reason) => closeEditor(event, reason)}>
                           <div>
                              <Formik initialValues={initialValues} validationSchema={validations} onSubmit={handleSubmit}>
                                 {({handleSubmit}) => (
                                    <Card sx={{position: "absolute", maxWidth: "800px", maxHeight: "800px", top: "50%", left: "50%", transform: "translate(-50%, -50%)", p: "2rem", overflowY: "auto", width: "100%", height: "calc(100vh - 4rem)"}}>
                                       <h3>{widgetData.modalTitle ?? widgetMetaData.defaultValues?.get("modalTitle") ?? "Edit Rows"}</h3>
                                       {
                                          errorAlert && <Alert icon={<Icon>error_outline</Icon>} color="error" onClose={() => setErrorAlert(null)}>{errorAlert}</Alert>
                                       }
                                       <Grid container spacing="16" overflow="auto" mt="0.5rem" mb="1rem" height="100%">
                                          <Grid item xs={12}>
                                             <RenderRowsForm forModal={true} />
                                          </Grid>
                                       </Grid>
                                       <Box>
                                          <Box display="flex" justifyContent="flex-end">

                                             {/*
                                                /////////////////////////////////////////////////////////////////
                                                // the work-in-progress version of the add-many menu button... //
                                                /////////////////////////////////////////////////////////////////
                                                useAddRowsButton &&
                                                <React.Profiler id="menu" onRender={console.log}>
                                                   <QHierarchyAutoComplete
                                                      idPrefix={"addRows"}
                                                      defaultGroup={{label: "Uh", options: [{value: 1, label: "A"}, {value: 2, label: "B"}, {value: 3, label: "C"},], value: "uh"}}
                                                      buttonProps={{id: "addRowsButton", sx: addFieldMenuButtonStyles}}
                                                      buttonChildren={<><Icon sx={{mr: "0.5rem"}}>add</Icon> Add Rows <Icon sx={{ml: "0.5rem"}}>keyboard_arrow_down</Icon></>}

                                                      menuDirection="up"
                                                      isModeSelectOne
                                                      keepOpenAfterSelectOne
                                                      handleSelectedOption={(option, group) => handleAddRow(true, option, group)}

                                                      isOpen={addMenuIsOpen}
                                                      anchorEl={addMenuAnchorEl}
                                                      handleOpen={handleAddMenuOpen}
                                                      handleClose={handleAddMenuClose}
                                                   />
                                                </React.Profiler>
                                             */}

                                             <QCancelButton disabled={false} onClickHandler={closeEditor} />
                                             <QSaveButton label="OK" iconName="check" disabled={false} onClickHandler={handleSubmit} />
                                          </Box>
                                       </Box>
                                    </Card>
                                 )}
                              </Formik>
                           </div>
                        </Modal>
                     }
                  </>
               }
            </DndProvider>
         </React.Fragment>
      }
   </Widget>);
}

////////////////////////////////////////////////////////////////////////////////////////
// export the button style used in this component, so other similar ones can share it //
////////////////////////////////////////////////////////////////////////////////////////
export const buttonSX =
   {
      border: `1px solid ${colors.grayLines.main} !important`,
      borderRadius: "0.75rem",
      textTransform: "none",
      fontSize: "1rem",
      fontWeight: "400",
      paddingLeft: "1rem",
      paddingRight: "1rem",
      opacity: "1",
      color: "var(--qqq-text-primary, #212121)",
      "&:hover": {color: "var(--qqq-text-primary, #212121)"},
      "&:focus": {color: "var(--qqq-text-primary, #212121)"},
      "&:focus:not(:hover)": {color: "var(--qqq-text-primary, #212121)"},
   };

///////////////////////////////////////////////////////////////////////////////////////////////////
// export the unbordered-button style used in this component, so other similar ones can share it //
///////////////////////////////////////////////////////////////////////////////////////////////////
export const unborderedButtonSX = Object.assign({}, buttonSX);
unborderedButtonSX.border = "none !important";
unborderedButtonSX.opacity = "0.7";

////////////////////////////////////////////////////////////////////////////////////////////////////
// export the style for the 'x' button used in this component, so other similar ones can share it //
////////////////////////////////////////////////////////////////////////////////////////////////////
export const xIconButtonSX =
   {
      border: `1px solid ${colors.grayLines.main} !important`,
      borderRadius: "0.75rem",
      textTransform: "none",
      fontSize: "1rem",
      fontWeight: "400",
      width: "40px",
      minWidth: "40px",
      paddingLeft: 0,
      paddingRight: 0,
      color: colors.error.main,
      "&:hover": {color: colors.error.main},
      "&:focus": {color: colors.error.main},
      "&:focus:not(:hover)": {color: colors.error.main},
   };

//////////////////////////////////////////////////
// todo - share this with similar from BulkLoad //
//////////////////////////////////////////////////
let buttonBackground = "none";
let buttonBorder = colors.grayLines.main;
let buttonColor = colors.gray.main;
const addFieldMenuButtonStyles = {
   borderRadius: "0.75rem",
   border: `1px solid ${buttonBorder}`,
   color: buttonColor,
   textTransform: "none",
   fontWeight: 500,
   fontSize: "0.875rem",
   p: "0.5rem",
   backgroundColor: buttonBackground,
   "&:focus:not(:hover)": {
      color: buttonColor,
      backgroundColor: buttonBackground,
   },
   "&:hover": {
      color: buttonColor,
      backgroundColor: buttonBackground,
   }
};

