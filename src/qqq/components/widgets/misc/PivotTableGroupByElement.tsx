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


import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Icon from "@mui/material/Icon";
import {QInstance} from "@qrunio/qqq-frontend-core/lib/model/metaData/QInstance";
import {QTableMetaData} from "@qrunio/qqq-frontend-core/lib/model/metaData/QTableMetaData";
import type {Identifier, XYCoord} from "dnd-core";
import colors from "qqq/assets/theme/base/colors";
import FieldAutoComplete from "qqq/components/misc/FieldAutoComplete";
import {DragItemTypes, fieldAutoCompleteTextFieldSX, getSelectedFieldForAutoComplete} from "qqq/components/widgets/misc/PivotTableSetupWidget";
import {xIconButtonSX} from "qqq/components/widgets/misc/RowBuilderWidget";
import {PivotTableDefinition, PivotTableGroupBy} from "qqq/models/misc/PivotTableDefinitionModels";
import React, {FC, useRef} from "react";
import {useDrag, useDrop} from "react-dnd";


/*******************************************************************************
 ** component props
 *******************************************************************************/
export interface PivotTableGroupByElementProps
{
   id: string;
   index: number;
   dragCallback: (rowsOrColumns: "rows" | "columns", dragIndex: number, hoverIndex: number) => void;
   metaData: QInstance;
   tableMetaData: QTableMetaData;
   pivotTableDefinition: PivotTableDefinition;
   usedGroupByFieldNames: string[];
   availableFieldNames: string[];
   isEditable: boolean;
   groupBy: PivotTableGroupBy;
   rowsOrColumns: "rows" | "columns";
   callback: () => void;
   attemptedSubmit?: boolean;
}


/*******************************************************************************
 ** item to support react-dnd
 *******************************************************************************/
interface DragItem
{
   index: number;
   id: string;
   type: string;
}

/*******************************************************************************
 **
 *******************************************************************************/
export const PivotTableGroupByElement: FC<PivotTableGroupByElementProps> = ({id, index, dragCallback, rowsOrColumns, metaData, tableMetaData, pivotTableDefinition, groupBy, usedGroupByFieldNames, availableFieldNames, isEditable, callback, attemptedSubmit}) =>
{
   ////////////////////////////////////////////////////////////////////////////
   // credit: https://react-dnd.github.io/react-dnd/examples/sortable/simple //
   ////////////////////////////////////////////////////////////////////////////
   const ref = useRef<HTMLDivElement>(null);
   const [{handlerId}, drop] = useDrop<DragItem, void, { handlerId: Identifier | null }>(
      {
         accept: rowsOrColumns == "rows" ? DragItemTypes.ROW : DragItemTypes.COLUMN,
         collect(monitor)
         {
            return {
               handlerId: monitor.getHandlerId(),
            };
         },
         hover(item: DragItem, monitor)
         {
            if (!ref.current)
            {
               return;
            }
            const dragIndex = item.index;
            const hoverIndex = index;

            /////////////////////////////////////////
            // Don't replace items with themselves //
            /////////////////////////////////////////
            if (dragIndex === hoverIndex)
            {
               return;
            }

            ///////////////////////////////////
            // Determine rectangle on screen //
            ///////////////////////////////////
            const hoverBoundingRect = ref.current?.getBoundingClientRect();

            /////////////////////////
            // Get vertical middle //
            /////////////////////////
            const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

            //////////////////////////////
            // Determine mouse position //
            //////////////////////////////
            const clientOffset = monitor.getClientOffset();

            ///////////////////////////
            // Get pixels to the top //
            ///////////////////////////
            const hoverClientY = (clientOffset as XYCoord).y - hoverBoundingRect.top;

            ///////////////////////////////////////////////////////////////////////////////
            // Only perform the move when the mouse has crossed half of the items height //
            // When dragging downwards, only move when the cursor is below 50%           //
            // When dragging upwards, only move when the cursor is above 50%             //
            ///////////////////////////////////////////////////////////////////////////////

            ////////////////////////
            // Dragging downwards //
            ////////////////////////
            if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY)
            {
               return;
            }

            //////////////////////
            // Dragging upwards //
            //////////////////////
            if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY)
            {
               return;
            }

            /////////////////////////////////////////
            // Time to actually perform the action //
            /////////////////////////////////////////
            dragCallback(rowsOrColumns, dragIndex, hoverIndex);

            ///////////////////////////////////////////////////////////////////////////////////////////
            // Note: we're mutating the monitor item here! Generally it's better to avoid mutations, //
            // but it's good here for the sake of performance to avoid expensive index searches.     //
            ///////////////////////////////////////////////////////////////////////////////////////////
            item.index = hoverIndex;
         },
      });

   const [{isDragging}, drag, preview] = useDrag({
      type: rowsOrColumns == "rows" ? DragItemTypes.ROW : DragItemTypes.COLUMN,
      item: () =>
      {
         return {id, index};
      },
      collect: (monitor: any) => ({
         isDragging: monitor.isDragging(),
      }),
   });


   /*******************************************************************************
    **
    *******************************************************************************/
   const handleFieldChange = (event: any, newValue: any, reason: string) =>
   {
      groupBy.fieldName = newValue ? newValue.fieldName : null;
      callback();
   };


   /*******************************************************************************
    **
    *******************************************************************************/
   function removeGroupBy(index: number, rowsOrColumns: "rows" | "columns")
   {
      pivotTableDefinition[rowsOrColumns].splice(index, 1);
      callback();
   }

   if (!isEditable)
   {
      const selectedField = getSelectedFieldForAutoComplete(tableMetaData, groupBy.fieldName);
      if (selectedField)
      {
         const label = selectedField.table.name == tableMetaData.name ? selectedField.field.label : selectedField.table.label + ": " + selectedField.field.label;
         return (<Box><Box display="inline-block" mr="0.375rem" mb="0.5rem" border={`1px solid ${colors.grayLines.main}`} borderRadius="0.75rem" p="0.25rem 0.75rem">{label}</Box></Box>);
      }

      return (<React.Fragment />);
   }

   preview(drop(ref));

   const showError = attemptedSubmit && !groupBy.fieldName;

   return (<Box ref={ref} display="flex" p="0.5rem" pl="0" gap="0.5rem" alignItems="center" sx={{backgroundColor: "white", opacity: isDragging ? 0 : 1}} data-handler-id={handlerId}>
      <Box>
         <Icon ref={drag} sx={{cursor: "ns-resize"}}>drag_indicator</Icon>
      </Box>
      <Box width="100%">
         <FieldAutoComplete
            id={`${rowsOrColumns}-${index}`}
            label={null}
            variant="outlined"
            textFieldSX={fieldAutoCompleteTextFieldSX}
            metaData={metaData}
            tableMetaData={tableMetaData}
            handleFieldChange={handleFieldChange}
            hiddenFieldNames={usedGroupByFieldNames}
            availableFieldNames={availableFieldNames}
            defaultValue={getSelectedFieldForAutoComplete(tableMetaData, groupBy.fieldName)}
            hasError={showError}
            noOptionsText="There are no fields available."
         />
      </Box>
      <Box>
         <Button sx={xIconButtonSX} onClick={() => removeGroupBy(index, rowsOrColumns)}><Icon>clear</Icon></Button>
      </Box>
   </Box>);
};
