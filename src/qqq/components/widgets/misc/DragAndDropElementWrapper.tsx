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
import type {Identifier, XYCoord} from "dnd-core";
import React, {FC, useRef} from "react";
import {useDrag, useDrop} from "react-dnd";

export const DragItemTypes =
   {
      ROW: "row",
   }

/*******************************************************************************
 ** component props
 *******************************************************************************/
export interface DragAndDropElementWrapperProps
{
   id: string;
   index: number;
   dragCallback: (dragIndex: number, hoverIndex: number) => void;
   containerSX?: Record<string, any>;
   children: React.ReactNode;
}


/*******************************************************************************
 * item to support react-dnd.
 * TODO - if this gets working & good, replace the DND functionality in
 * PivotTableGroupByElement and PivotTableValueElement with this (as we'll be
 * at a 3 in the Rule of 3).
 *******************************************************************************/
interface DragItem
{
   index: number;
   id: string;
   type: string;
}


/*******************************************************************************
 * generic element we can put around something to make it drag and droppable...
 * early work-in-progress - not clear if 100% ready for prime time usage.
 *******************************************************************************/
export const DragAndDropElementWrapper: FC<DragAndDropElementWrapperProps> = ({id, index, dragCallback, containerSX, children}) =>
{
   ////////////////////////////////////////////////////////////////////////////
   // credit: https://react-dnd.github.io/react-dnd/examples/sortable/simple //
   ////////////////////////////////////////////////////////////////////////////
   const ref = useRef<HTMLDivElement>(null);
   const [{handlerId}, drop] = useDrop<DragItem, void, { handlerId: Identifier | null }>(
      {
         accept: DragItemTypes.ROW,
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
            dragCallback(dragIndex, hoverIndex);

            ///////////////////////////////////////////////////////////////////////////////////////////
            // Note: we're mutating the monitor item here! Generally it's better to avoid mutations, //
            // but it's good here for the sake of performance to avoid expensive index searches.     //
            ///////////////////////////////////////////////////////////////////////////////////////////
            item.index = hoverIndex;
         },
      });

   const [{isDragging}, drag] = useDrag({
      type: DragItemTypes.ROW,
      item: () =>
      {
         return {id, index};
      },
      collect: (monitor: any) => ({
         isDragging: monitor.isDragging(),
      }),
   });

   drag(drop(ref));

   return (<Box ref={ref} sx={{...(containerSX ?? {}), backgroundColor: "white", opacity: isDragging ? 0 : 1}} data-handler-id={handlerId}>
      {children}
   </Box>);

};
