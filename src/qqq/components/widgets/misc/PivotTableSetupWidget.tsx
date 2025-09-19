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


import {QInstance} from "@qrunio/qqq-frontend-core/lib/model/metaData/QInstance";
import {QTableMetaData} from "@qrunio/qqq-frontend-core/lib/model/metaData/QTableMetaData";
import {QWidgetMetaData} from "@qrunio/qqq-frontend-core/lib/model/metaData/QWidgetMetaData";
import Alert from "@mui/material/Alert";
import Autocomplete from "@mui/material/Autocomplete";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import Icon from "@mui/material/Icon";
import Modal from "@mui/material/Modal";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip/Tooltip";
import Typography from "@mui/material/Typography";
import QContext from "QContext";
import colors from "qqq/assets/theme/base/colors";
import {QCancelButton, QSaveButton} from "qqq/components/buttons/DefaultButtons";
import FieldAutoComplete from "qqq/components/misc/FieldAutoComplete";
import HelpContent, {hasHelpContent} from "qqq/components/misc/HelpContent";
import {buttonSX, unborderedButtonSX, xIconButtonSX} from "qqq/components/widgets/misc/RowBuilderWidget";
import {PivotTableGroupByElement} from "qqq/components/widgets/misc/PivotTableGroupByElement";
import {PivotTableValueElement} from "qqq/components/widgets/misc/PivotTableValueElement";
import Widget, {HeaderToggleComponent} from "qqq/components/widgets/Widget";
import {PivotObjectKey, PivotTableDefinition, PivotTableFunction, pivotTableFunctionLabels, PivotTableGroupBy, PivotTableValue} from "qqq/models/misc/PivotTableDefinitionModels";
import QQueryColumns from "qqq/models/query/QQueryColumns";
import Client from "qqq/utils/qqq/Client";
import FilterUtils from "qqq/utils/qqq/FilterUtils";
import React, {useCallback, useContext, useEffect, useReducer, useState} from "react";
import {DndProvider} from "react-dnd";
import {HTML5Backend} from "react-dnd-html5-backend";

export const DragItemTypes =
   {
      ROW: "row",
      COLUMN: "column",
      VALUE: "value"
   };

export const fieldAutoCompleteTextFieldSX =
   {
      "& .MuiInputBase-input": {fontSize: "1rem", padding: "0 !important"}
   };


/*******************************************************************************
 **
 *******************************************************************************/
export function getSelectedFieldForAutoComplete(tableMetaData: QTableMetaData, fieldName: string)
{
   if (fieldName)
   {
      let [field, fieldTable] = FilterUtils.getField(tableMetaData, fieldName);
      if (field && fieldTable)
      {
         return ({field: field, table: fieldTable, fieldName: fieldName});
      }
   }

   return (null);
}


/*******************************************************************************
 ** component props
 *******************************************************************************/
interface PivotTableSetupWidgetProps
{
   isEditable: boolean;
   widgetMetaData: QWidgetMetaData;
   recordValues: { [name: string]: any };
   onSaveCallback?: (values: { [name: string]: any }) => void;
}


/*******************************************************************************
 ** default values for props
 *******************************************************************************/
PivotTableSetupWidget.defaultProps = {
   onSaveCallback: null
};


const qController = Client.getInstance();

/*******************************************************************************
 ** Component to edit the setup of a Pivot Table - rows, columns, values!
 *******************************************************************************/
export default function PivotTableSetupWidget({isEditable, widgetMetaData, recordValues, onSaveCallback}: PivotTableSetupWidgetProps): JSX.Element
{
   const [metaData, setMetaData] = useState(null as QInstance);
   const [tableMetaData, setTableMetaData] = useState(null as QTableMetaData);

   const [modalOpen, setModalOpen] = useState(false);
   const [enabled, setEnabled] = useState(!!recordValues["usePivotTable"]);
   const [attemptedSubmit, setAttemptedSubmit] = useState(false);
   const [errorAlert, setErrorAlert] = useState(null as string);

   const [pivotTableDefinition, setPivotTableDefinition] = useState(null as PivotTableDefinition);

   const [, forceUpdate] = useReducer((x) => x + 1, 0);

   ///////////////////////////////////////////////////////////////////////////////////
   // this is a copy of pivotTableDefinition, that we'll render in the modal.       //
   // then on-save, we'll move it to pivotTableDefinition, e.g., the actual record. //
   ///////////////////////////////////////////////////////////////////////////////////
   const [modalPivotTableDefinition, setModalPivotTableDefinition] = useState(null as PivotTableDefinition);

   const [usedGroupByFieldNames, setUsedGroupByFieldNames] = useState([] as string[]);
   const [usedValueFieldNames, setUsedValueByFieldNames] = useState([] as string[]);
   const [availableFieldNames, setAvailableFieldNames] = useState([] as string[]);

   const {helpHelpActive} = useContext(QContext);

   //////////////////
   // initial load //
   //////////////////
   useEffect(() =>
   {
      if (!pivotTableDefinition)
      {
         let originalPivotTableDefinition = recordValues["pivotTableJson"] && JSON.parse(recordValues["pivotTableJson"]) as PivotTableDefinition;
         if (originalPivotTableDefinition)
         {
            setEnabled(true);
         }
         else if (!originalPivotTableDefinition)
         {
            originalPivotTableDefinition = new PivotTableDefinition();
         }

         for (let i = 0; i < originalPivotTableDefinition?.rows?.length; i++)
         {
            if (!originalPivotTableDefinition?.rows[i].key)
            {
               originalPivotTableDefinition.rows[i].key = PivotObjectKey.next();
            }
         }

         for (let i = 0; i < originalPivotTableDefinition?.columns?.length; i++)
         {
            if (!originalPivotTableDefinition?.columns[i].key)
            {
               originalPivotTableDefinition.columns[i].key = PivotObjectKey.next();
            }
         }

         for (let i = 0; i < originalPivotTableDefinition?.values?.length; i++)
         {
            if (!originalPivotTableDefinition?.values[i].key)
            {
               originalPivotTableDefinition.values[i].key = PivotObjectKey.next();
            }
         }

         setPivotTableDefinition(originalPivotTableDefinition);
         updateUsedGroupByFieldNames(originalPivotTableDefinition);
         updateUsedValueFieldNames(modalPivotTableDefinition);
      }

      if (recordValues["columnsJson"])
      {
         updateAvailableFieldNames(JSON.parse(recordValues["columnsJson"]) as QQueryColumns);
      }

      (async () =>
      {
         setMetaData(await qController.loadMetaData());
      })();
   });

   /////////////////////////////////////////////////////////////////////
   // handle the table name changing - load current table's meta-data //
   /////////////////////////////////////////////////////////////////////
   useEffect(() =>
   {
      if (recordValues["tableName"] && (tableMetaData == null || tableMetaData.name != recordValues["tableName"]))
      {
         (async () =>
         {
            const tableMetaData = await qController.loadTableMetaData(recordValues["tableName"]);
            setTableMetaData(tableMetaData);
         })();
      }
   }, [recordValues]);


   const helpRoles = isEditable ? [recordValues["id"] ? "EDIT_SCREEN" : "INSERT_SCREEN", "WRITE_SCREENS", "ALL_SCREENS"] : ["VIEW_SCREEN", "READ_SCREENS", "ALL_SCREENS"];

   /*******************************************************************************
    **
    *******************************************************************************/
   function showHelp(slot: string)
   {
      return (helpHelpActive || hasHelpContent(widgetMetaData?.helpContent?.get(slot), helpRoles));
   }


   /*******************************************************************************
    **
    *******************************************************************************/
   function getHelpContent(slot: string)
   {
      const key = `widget:${widgetMetaData.name};slot:${slot}`;
      return <HelpContent helpContents={widgetMetaData?.helpContent?.get(slot)} roles={helpRoles} helpContentKey={key} />;
   }


   /*******************************************************************************
    **
    *******************************************************************************/
   function toggleEnabled()
   {
      const newEnabled = !!!getEnabled();
      setEnabled(newEnabled);
      onSaveCallback({usePivotTable: newEnabled});

      if (!newEnabled)
      {
         onSaveCallback({pivotTableJson: null});
      }
   }


   /*******************************************************************************
    **
    *******************************************************************************/
   function getEnabled()
   {
      return (enabled);
   }


   /*******************************************************************************
    **
    *******************************************************************************/
   function addGroupBy(rowsOrColumns: "rows" | "columns")
   {
      if (!modalPivotTableDefinition[rowsOrColumns])
      {
         modalPivotTableDefinition[rowsOrColumns] = [];
      }

      modalPivotTableDefinition[rowsOrColumns].push(new PivotTableGroupBy());
      validateForm();
      forceUpdate();
   }


   /*******************************************************************************
    **
    *******************************************************************************/
   function childElementChangedCallback()
   {
      updateUsedGroupByFieldNames(modalPivotTableDefinition);
      updateUsedValueFieldNames(modalPivotTableDefinition);
      validateForm();
      forceUpdate();
   }


   /*******************************************************************************
    **
    *******************************************************************************/
   function addValue()
   {
      if (!modalPivotTableDefinition.values)
      {
         modalPivotTableDefinition.values = [];
      }

      modalPivotTableDefinition.values.push(new PivotTableValue());
      validateForm();
      forceUpdate();
   }


   /*******************************************************************************
    **
    *******************************************************************************/
   function removeValue(index: number)
   {
      modalPivotTableDefinition.values.splice(index, 1);
      validateForm();
      forceUpdate();
   }


   /*******************************************************************************
    **
    *******************************************************************************/
   function updateUsedGroupByFieldNames(ptd: PivotTableDefinition = pivotTableDefinition)
   {
      const usedFieldNames: string[] = [];

      for (let i = 0; i < ptd?.rows?.length; i++)
      {
         usedFieldNames.push(ptd?.rows[i].fieldName);
      }

      for (let i = 0; i < ptd?.columns?.length; i++)
      {
         usedFieldNames.push(ptd?.columns[i].fieldName);
      }

      setUsedGroupByFieldNames(usedFieldNames);
   }


   /*******************************************************************************
    **
    *******************************************************************************/
   function updateUsedValueFieldNames(ptd: PivotTableDefinition = pivotTableDefinition)
   {
      const usedFieldNames: string[] = [];

      for (let i = 0; i < ptd?.values?.length; i++)
      {
         usedFieldNames.push(ptd?.values[i].fieldName);
      }

      setUsedValueByFieldNames(usedFieldNames);
   }


   /*******************************************************************************
    **
    *******************************************************************************/
   function updateAvailableFieldNames(columns: QQueryColumns)
   {
      const fieldNames: string[] = [];
      for (let i = 0; i < columns?.columns?.length; i++)
      {
         if (columns.columns[i].isVisible)
         {
            fieldNames.push(columns.columns[i].name);
         }
      }
      setAvailableFieldNames(fieldNames);
   }


   /*******************************************************************************
    **
    *******************************************************************************/
   function renderOneValue(value: PivotTableValue, index: number)
   {
      if (!isEditable)
      {
         const selectedField = getSelectedFieldForAutoComplete(tableMetaData, value.fieldName);
         if (selectedField && value.function)
         {
            const label = selectedField.table.name == tableMetaData.name ? selectedField.field.label : selectedField.table.label + ": " + selectedField.field.label;
            return (<Box mr="0.375rem" mb="0.5rem" border={`1px solid ${colors.grayLines.main}`} borderRadius="0.75rem" p="0.25rem 0.75rem">{pivotTableFunctionLabels[value.function]} of {label}</Box>);
         }

         return (<React.Fragment />);
      }

      const handleFieldChange = (event: any, newValue: any, reason: string) =>
      {
         value.fieldName = newValue ? newValue.fieldName : null;
      };

      const handleFunctionChange = (event: any, newValue: any, reason: string) =>
      {
         value.function = newValue ? newValue.id : null;
      };

      const functionOptions: any[] = [];
      let defaultFunctionValue = null;
      for (let pivotTableFunctionKey in PivotTableFunction)
      {
         // @ts-ignore any?
         const label = "" + pivotTableFunctionLabels[pivotTableFunctionKey];
         const option = {id: pivotTableFunctionKey, label: label};
         functionOptions.push(option);

         if (option.id == value.function)
         {
            defaultFunctionValue = option;
         }
      }

      // maybe cursor:grab (and then change to "grabbing")
      return (<Box display="flex" p="0.5rem" pl="0" gap="0.5rem" alignItems="center">
         <Box>
            <Icon sx={{cursor: "ns-resize"}}>drag_indicator</Icon>
         </Box>
         <Box width="100%">
            <FieldAutoComplete
               id={`values-field-${index}`}
               label={null}
               variant="outlined"
               textFieldSX={fieldAutoCompleteTextFieldSX}
               metaData={metaData}
               tableMetaData={tableMetaData}
               handleFieldChange={handleFieldChange}
               defaultValue={getSelectedFieldForAutoComplete(tableMetaData, value.fieldName)}
            />
         </Box>
         <Box width="330px">
            <Autocomplete
               id={`values-field-${index}`}
               renderInput={(params) => (<TextField {...params} label={null} variant="outlined" sx={fieldAutoCompleteTextFieldSX} autoComplete="off" type="search" InputProps={{...params.InputProps}} />)}
               // @ts-ignore
               defaultValue={defaultFunctionValue}
               options={functionOptions}
               onChange={handleFunctionChange}
               isOptionEqualToValue={(option, value) => option.id === value.id}
               getOptionLabel={(option) => option.label}
               // todo? renderOption={(props, option, state) => renderFieldOption(props, option, state)}
               autoSelect={true}
               autoHighlight={true}
               disableClearable
               // slotProps={{popper: {className: "filterCriteriaRowColumnPopper", style: {padding: 0, width: "250px"}}}}
               // {...alsoOpen}
            />
         </Box>
         <Box>
            <Button sx={xIconButtonSX} onClick={() => removeValue(index)}><Icon>clear</Icon></Button>
         </Box>
      </Box>);
   }


   /*******************************************************************************
    ** drag & drop callback to move one of the pivot-table group-bys (rows/columns)
    *******************************************************************************/
   const moveGroupBy = useCallback((rowsOrColumns: "rows" | "columns", dragIndex: number, hoverIndex: number) =>
   {
      const array = modalPivotTableDefinition[rowsOrColumns];
      const dragItem = array[dragIndex];
      array.splice(dragIndex, 1);
      array.splice(hoverIndex, 0, dragItem);

      forceUpdate();
   }, [modalPivotTableDefinition]);


   /*******************************************************************************
    ** drag & drop callback to move one of the pivot-table values
    *******************************************************************************/
   const moveValue = useCallback((dragIndex: number, hoverIndex: number) =>
   {
      const array = modalPivotTableDefinition.values;
      const dragItem = array[dragIndex];
      array.splice(dragIndex, 1);
      array.splice(hoverIndex, 0, dragItem);

      forceUpdate();
   }, [modalPivotTableDefinition]);


   const noTable = (tableMetaData == null);
   const noColumns = (!availableFieldNames || availableFieldNames.length == 0);

   const selectTableFirstTooltipTitle = noTable ? "You must select a table before you can set up your pivot table" : null;
   const selectColumnsFirstTooltipTitle = noColumns ? "You must set up your report's Columns before you can set up your Pivot Table" : null;
   const editPopupDisabled = noTable || noColumns;

   /////////////////////////////////////////////////////////////
   // add toggle component to widget header for editable mode //
   /////////////////////////////////////////////////////////////
   const labelAdditionalElementsRight: JSX.Element[] = [];
   if (isEditable)
   {
      labelAdditionalElementsRight.push(<HeaderToggleComponent key="pivotTableHeader" disabled={editPopupDisabled} disabledTooltip={selectTableFirstTooltipTitle ?? selectColumnsFirstTooltipTitle} label="Use Pivot Table?" getValue={() => enabled} onClickCallback={toggleEnabled} />);
   }


   /*******************************************************************************
    ** render a group-by (row or column)
    *******************************************************************************/
   const renderGroupBy = useCallback((groupBy: PivotTableGroupBy, rowsOrColumns: "rows" | "columns", index: number, forModal: boolean) =>
   {
      return (
         <PivotTableGroupByElement
            key={groupBy.fieldName}
            index={index}
            id={`${groupBy.key}`}
            dragCallback={moveGroupBy}
            metaData={metaData}
            tableMetaData={tableMetaData}
            pivotTableDefinition={forModal ? modalPivotTableDefinition : pivotTableDefinition}
            usedGroupByFieldNames={[...usedGroupByFieldNames, ...usedValueFieldNames]}
            availableFieldNames={availableFieldNames}
            isEditable={isEditable && forModal}
            groupBy={groupBy}
            rowsOrColumns={rowsOrColumns}
            callback={childElementChangedCallback}
            attemptedSubmit={attemptedSubmit}
         />
      );
   },
   [tableMetaData, usedGroupByFieldNames, availableFieldNames],
   );


   /*******************************************************************************
    ** render a pivot-table value (row or column)
    *******************************************************************************/
   const renderValue = useCallback((value: PivotTableValue, index: number, forModal: boolean) =>
   {
      return (
         <PivotTableValueElement
            key={value.key}
            index={index}
            id={`${value.key}`}
            dragCallback={moveValue}
            metaData={metaData}
            tableMetaData={tableMetaData}
            pivotTableDefinition={forModal ? modalPivotTableDefinition : pivotTableDefinition}
            availableFieldNames={availableFieldNames}
            usedGroupByFieldNames={usedGroupByFieldNames}
            isEditable={isEditable && forModal}
            value={value}
            callback={childElementChangedCallback}
            attemptedSubmit={attemptedSubmit}
         />
      );
   },
   [tableMetaData, usedGroupByFieldNames, availableFieldNames],
   );


   /*******************************************************************************
    **
    *******************************************************************************/
   function openEditor()
   {
      if (recordValues["tableName"])
      {
         setModalPivotTableDefinition(Object.assign({}, pivotTableDefinition));
         setModalOpen(true);
         setAttemptedSubmit(false);
      }
   }


   /*******************************************************************************
    **
    *******************************************************************************/
   function closeEditor(event?: {}, reason?: "backdropClick" | "escapeKeyDown")
   {
      if (reason == "backdropClick" || reason == "escapeKeyDown")
      {
         return;
      }

      setModalOpen(false);
   }


   /*******************************************************************************
    **
    *******************************************************************************/
   function renderGroupBys(forModal: boolean, rowsOrColumns: "rows" | "columns")
   {
      const ptd = forModal ? modalPivotTableDefinition : pivotTableDefinition;

      return <>
         <h5>{rowsOrColumns == "rows" ? "Rows" : "Columns"}</h5>
         <Box fontSize="1rem">
            {
               tableMetaData && (<div>{ptd[rowsOrColumns]?.map((groupBy, i) => renderGroupBy(groupBy, rowsOrColumns, i, forModal))}</div>)
            }
         </Box>
         {
            (forModal || (isEditable && !ptd[rowsOrColumns]?.length)) &&
            <Box mt={forModal ? "0.5rem" : "0"} mb="1rem">
               <Tooltip title={selectTableFirstTooltipTitle ?? selectColumnsFirstTooltipTitle}>
                  <span><Button disabled={editPopupDisabled} sx={forModal ? buttonSX : unborderedButtonSX} onClick={() => forModal ? addGroupBy(rowsOrColumns) : openEditor()}>+ Add new {rowsOrColumns == "rows" ? "row" : "column"}</Button></span>
               </Tooltip>
            </Box>
         }
         {
            !isEditable && !forModal && !ptd[rowsOrColumns]?.length &&
            <Box color={colors.gray.main} fontSize="1rem">Your pivot table has no {rowsOrColumns}.</Box>
         }
      </>;
   }


   /*******************************************************************************
    **
    *******************************************************************************/
   function renderValues(forModal: boolean)
   {
      const ptd = forModal ? modalPivotTableDefinition : pivotTableDefinition;

      return <>
         <h5>Values</h5>
         <Box fontSize="1rem">
            {
               tableMetaData && (<div>{ptd?.values?.map((value, i) => renderValue(value, i, forModal))}</div>)
            }
         </Box>
         {
            (forModal || (isEditable && !ptd?.values?.length)) &&
            <Box mt={forModal ? "0.5rem" : "0"} mb="1rem">
               <Tooltip title={selectTableFirstTooltipTitle ?? selectColumnsFirstTooltipTitle}>
                  <span><Button disabled={editPopupDisabled} sx={forModal ? buttonSX : unborderedButtonSX} onClick={() => forModal ? addValue() : openEditor()}>+ Add new value</Button></span>
               </Tooltip>
            </Box>
         }
         {
            !isEditable && !forModal && !ptd?.values?.length &&
            <Box color={colors.gray.main} fontSize="1rem">Your pivot table has no values.</Box>
         }
      </>;
   }


   /*******************************************************************************
    **
    *******************************************************************************/
   function validateForm(submitting: boolean = false)
   {
      ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
      // if this isn't a call from the on-submit handler, and we haven't previously attempted a submit, then return w/o setting any alerts //
      // this is like a version of considering "touched"...                                                                                //
      ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
      if (!submitting && !attemptedSubmit)
      {
         return;
      }

      let missingValues = 0;

      for (let i = 0; i < modalPivotTableDefinition?.rows?.length; i++)
      {
         if (!modalPivotTableDefinition.rows[i].fieldName)
         {
            missingValues++;
         }
      }

      for (let i = 0; i < modalPivotTableDefinition?.columns?.length; i++)
      {
         if (!modalPivotTableDefinition.columns[i].fieldName)
         {
            missingValues++;
         }
      }

      for (let i = 0; i < modalPivotTableDefinition?.values?.length; i++)
      {
         if (!modalPivotTableDefinition.values[i].fieldName)
         {
            missingValues++;
         }
         if (!modalPivotTableDefinition.values[i].function)
         {
            missingValues++;
         }
      }

      if (missingValues == 0)
      {
         setErrorAlert(null);

         ////////////////////////////////////////////////////////////////////////////////////
         // this is to catch the case of - user attempted to submit, and there were errors //
         // now they've fixed 'em - so go back to a 'clean' state - so if they add more    //
         // boxes, they won't immediately show errors, until a re-submit                   //
         ////////////////////////////////////////////////////////////////////////////////////
         if (attemptedSubmit)
         {
            setAttemptedSubmit(false);
         }
         return (false);
      }

      setErrorAlert(`Missing value in ${missingValues} field${missingValues == 1 ? "" : "s"}.`);
      return (true);
   }


   /*******************************************************************************
    **
    *******************************************************************************/
   function saveClicked()
   {
      setAttemptedSubmit(true);

      if (validateForm(true))
      {
         return;
      }

      if (!onSaveCallback)
      {
         console.log("onSaveCallback was not defined");
         return;
      }

      setPivotTableDefinition(Object.assign({}, modalPivotTableDefinition));
      updateUsedGroupByFieldNames(modalPivotTableDefinition);
      updateUsedValueFieldNames(modalPivotTableDefinition);

      onSaveCallback({pivotTableJson: JSON.stringify(modalPivotTableDefinition)});

      closeEditor();
   }


   ////////////
   // render //
   ////////////
   return (<Widget widgetMetaData={widgetMetaData} labelAdditionalElementsRight={labelAdditionalElementsRight}>
      {
         <React.Fragment>
            <DndProvider backend={HTML5Backend}>
               {
                  enabled &&
                  <Box display="flex" justifyContent="space-between">
                     <Box>
                        {
                           showHelp("sectionSubhead") &&
                           <Box color={colors.gray.main} pb={"0.5rem"} fontSize={"0.875rem"}>
                              {getHelpContent("sectionSubhead")}
                           </Box>
                        }
                     </Box>
                     {
                        isEditable &&
                        <Tooltip title={selectTableFirstTooltipTitle ?? selectColumnsFirstTooltipTitle}>
                           <span>
                              <Button disabled={editPopupDisabled} onClick={() => openEditor()} sx={{p: 0}} disableRipple>
                                 <Typography display="inline" textTransform="none" fontSize={"1.125rem"}>
                                    Edit Pivot Table
                                 </Typography>
                              </Button>
                           </span>
                        </Tooltip>
                     }
                  </Box>
               }
               {
                  (!enabled || !pivotTableDefinition) && !isEditable &&
                  <Box fontSize="1rem">Your report does not use a Pivot Table.</Box>
               }
               {
                  enabled && pivotTableDefinition &&
                  <>
                     <Grid container spacing="16">

                        <Grid item lg={4} md={6} xs={12}>{renderGroupBys(false, "rows")}</Grid>
                        <Grid item lg={4} md={6} xs={12}>{renderGroupBys(false, "columns")}</Grid>
                        <Grid item lg={4} md={6} xs={12}>{renderValues(false)}</Grid>

                     </Grid>
                     {
                        modalOpen &&
                        <Modal open={modalOpen} onClose={(event, reason) => closeEditor(event, reason)}>
                           <div>
                              <Box sx={{position: "absolute", width: "100%"}}>
                                 <Card sx={{m: "2rem", p: "2rem", overflowY: "auto", height: "calc(100vh - 4rem)"}}>
                                    <h3>Edit Pivot Table</h3>
                                    {
                                       showHelp("modalSubheader") &&
                                       <Box color={colors.gray.main}>
                                          {getHelpContent("modalSubheader")}
                                       </Box>
                                    }
                                    {
                                       errorAlert && <Alert icon={<Icon>error_outline</Icon>} color="error" onClose={() => setErrorAlert(null)}>{errorAlert}</Alert>
                                    }
                                    <Grid container spacing="16" overflow="auto" mt="0.5rem" mb="1rem" height="100%">

                                       <Grid item lg={4} md={6} xs={12}>{renderGroupBys(true, "rows")}</Grid>
                                       <Grid item lg={4} md={6} xs={12}>{renderGroupBys(true, "columns")}</Grid>
                                       <Grid item lg={4} md={6} xs={12}>{renderValues(true)}</Grid>

                                    </Grid>
                                    <Box>
                                       <Box display="flex" justifyContent="flex-end">
                                          <QCancelButton disabled={false} onClickHandler={closeEditor} />
                                          <QSaveButton label="OK" iconName="check" disabled={false} onClickHandler={saveClicked} />
                                       </Box>
                                    </Box>
                                 </Card>
                              </Box>
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

/* this was a rough-draft of what a preview of a pivot could look like...
   <Box mt={"1rem"}>
      <h5>Preview</h5>
      <table>
         <tr>
            <th style={{textAlign: "left", fontSize: "0.875rem"}}></th>
            <th style={{textAlign: "left", fontSize: "0.875rem"}}>Column Labels</th>
         </tr>
         {
            pivotTableDefinition?.columns?.map((column, i) =>
               (
                  <tr key={column.key}>
                     <th style={{textAlign: "left", fontSize: "0.875rem"}}></th>
                     <th style={{textAlign: "left", fontSize: "0.875rem"}}>{column.fieldName}</th>
                  </tr>
               ))
         }
         <tr>
            <th style={{textAlign: "left", fontSize: "0.875rem"}}>Row Labels</th>
            {
               pivotTableDefinition?.values?.map((value, i) =>
                  (
                     <th key={value.key} style={{textAlign: "left", fontSize: "0.875rem"}}>{value.function} of {value.fieldName}</th>
                  ))
            }
         </tr>
         {
            pivotTableDefinition?.rows?.map((row, i) =>
               (
                  <tr key={row.key}>
                     <th style={{textAlign: "left", fontSize: "0.875rem", paddingLeft: (i * 1) + "rem"}}>{row.fieldName}</th>
                  </tr>
               ))
         }
      </table>
   </Box>
*/
