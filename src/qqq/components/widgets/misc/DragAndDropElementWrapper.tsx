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
import {CSSProperties} from "@mui/system/CSSProperties";
import type {Identifier, XYCoord} from "dnd-core";
import React, {cloneElement, FC, useEffect, useRef} from "react";
import {DropTargetMonitor, useDrag, useDragLayer, useDrop} from "react-dnd";
import {getEmptyImage} from "react-dnd-html5-backend";


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
   dragCallback?: (dragIndex: number, hoverIndex: number) => void;
   dropCallback?: (dragIndex: number, dropIndex: number) => void;
   containerSX?: Record<string, any>;
   children: React.ReactElement;
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
export const DragAndDropElementWrapper: FC<DragAndDropElementWrapperProps> = ({id, index, dragCallback, dropCallback, containerSX, children}) =>
{
   ////////////////////////////////////////////////////////////////////////////
   // credit: https://react-dnd.github.io/react-dnd/examples/sortable/simple //
   ////////////////////////////////////////////////////////////////////////////
   const rowRef = useRef<HTMLDivElement>(null);
   const handleRef = useRef<HTMLDivElement>(null);

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
            if(!dragCallback)
            {
               // return;
            }

            if (!rowRef.current)
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
            const hoverBoundingRect = rowRef.current?.getBoundingClientRect();

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
            dragCallback?.(dragIndex, hoverIndex);
         },
         drop(item: DragItem, monitor: DropTargetMonitor)
         {
            const dragIndex = item.index;
            const dropIndex = index;

            /////////////////////////////////////////
            // Don't replace items with themselves //
            /////////////////////////////////////////
            if (dragIndex === dropIndex)
            {
               return;
            }

            dropCallback?.(dragIndex, dropIndex);
         }
      });

   const [{isDragging}, drag, preview] = useDrag({
      type: DragItemTypes.ROW,
      item: () =>
      {
         return {id, index, renderPreview: () => <Box>{children}</Box>};
      },
      collect: (monitor: any) => ({
         isDragging: monitor.isDragging(),
      }),
   });

   useEffect(() =>
   {
      preview(getEmptyImage(), {captureDraggingState: true});
   }, [preview]);

   drop(rowRef);
   drag(handleRef);

   return (<Box ref={rowRef} sx={{...(containerSX ?? {}), backgroundColor: "white", opacity: isDragging ? 0 : 1}} data-handler-id={handlerId}>
      {cloneElement(children, {dragRef: handleRef})}
   </Box>);
};


/***************************************************************************
 *
 ***************************************************************************/
export function DragPreviewLayer(props: {itemStyles?: Record<string, any>})
{
   const {
      itemType,
      isDragging,
      item,
      initialOffset,
      currentOffset,
   } = useDragLayer((monitor) => ({
      itemType: monitor.getItemType(),
      isDragging: monitor.isDragging(),
      item: monitor.getItem(),
      initialOffset: monitor.getInitialSourceClientOffset(),
      currentOffset: monitor.getSourceClientOffset(),
   }));

   if (!isDragging)
   {
      return null;
   }

   function getItemStyles(initialOffset: XYCoord, currentOffset: XYCoord)
   {
      if (!initialOffset || !currentOffset)
      {
         return {display: "none"};
      }

      const {x, y} = currentOffset;
      const transform = `translate(${x}px, ${y}px)`;

      return {
         backgroundColor: "white",
         transform,
         WebkitTransform: transform,
         ... (props?.itemStyles ?? {})
      };
   }

   const layerStyles: CSSProperties = {
      position: "fixed",
      pointerEvents: "none",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      zIndex: 999999,   // preview above all
   };

   return (
      <div style={layerStyles}>
         <div style={getItemStyles(initialOffset, currentOffset)}>
            {item.renderPreview()}
         </div>
      </div>
   );
}