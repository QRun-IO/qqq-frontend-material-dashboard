/* QQQ - Low-code Application Framework for Engineers.
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

import {QWidgetMetaData} from "@qrunio/qqq-frontend-core/lib/model/metaData/QWidgetMetaData";
import {Box, tooltipClasses, TooltipProps} from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import Icon from "@mui/material/Icon";
import {styled} from "@mui/material/styles";
import Table from "@mui/material/Table";
import TableContainer from "@mui/material/TableContainer";
import Tooltip from "@mui/material/Tooltip";
import parse from "html-react-parser";
import colors from "qqq/assets/theme/base/colors";
import {preferredColorNameInfoOrPrimary} from "qqq/assets/theme/functions/preferInfoColorToPrimaryColor";
import MDInput from "qqq/components/legacy/MDInput";
import MDPagination from "qqq/components/legacy/MDPagination";
import MDTypography from "qqq/components/legacy/MDTypography";
import CompositeWidget from "qqq/components/widgets/CompositeWidget";
import DataTableBodyCell from "qqq/components/widgets/tables/cells/DataTableBodyCell";
import DataTableHeadCell from "qqq/components/widgets/tables/cells/DataTableHeadCell";
import DefaultCell from "qqq/components/widgets/tables/cells/DefaultCell";
import ImageCell from "qqq/components/widgets/tables/cells/ImageCell";
import {TableDataInput} from "qqq/components/widgets/tables/TableCard";
import WidgetBlock from "qqq/components/widgets/WidgetBlock";
import React, {useEffect, useMemo, useState} from "react";
import {useAsyncDebounce, useExpanded, useGlobalFilter, usePagination, useSortBy, useTable} from "react-table";

interface Props
{
   entriesPerPage?: number;
   entriesPerPageOptions?: number[];
   canSearch?: boolean;
   showTotalEntries?: boolean;
   hidePaginationDropdown?: boolean;
   fixedStickyLastRow?: boolean;
   fixedHeight?: number;
   table: TableDataInput;
   pagination?: {
      variant: "contained" | "gradient";
      color: "primary" | "secondary" | "info" | "success" | "warning" | "error" | "dark" | "light";
   };
   isSorted?: boolean;
   noEndBorder?: boolean;
   widgetMetaData: QWidgetMetaData;
}

DataTable.defaultProps = {
   entriesPerPage: 10,
   entriesPerPageOptions: ["5", "10", "15", "20", "25"],
   canSearch: false,
   showTotalEntries: true,
   fixedStickyLastRow: false,
   fixedHeight: null,
   pagination: {variant: "gradient", color: preferredColorNameInfoOrPrimary()},
   isSorted: true,
   noEndBorder: false,
};

const NoMaxWidthTooltip = styled(({className, ...props}: TooltipProps) => (
   <Tooltip {...props} classes={{popper: className}} />
))({
   [`& .${tooltipClasses.tooltip}`]: {
      maxWidth: "none",
      textAlign: "left"
   },
});

function DataTable({
   entriesPerPage,
   entriesPerPageOptions,
   hidePaginationDropdown,
   canSearch,
   showTotalEntries,
   fixedStickyLastRow,
   fixedHeight,
   table,
   pagination,
   isSorted,
   noEndBorder,
   widgetMetaData
}: Props): JSX.Element
{
   let defaultValue: any;
   let entries: any[];

   defaultValue = (entriesPerPage) ? entriesPerPage : "10";
   entries = entriesPerPageOptions ? entriesPerPageOptions : ["10", "25", "50", "100"];

   let widths = [];
   for (let i = 0; i < table.columns.length; i++)
   {
      const column = table.columns[i];
      if (column.type !== "hidden")
      {
         widths.push(table.columns[i].width ?? "1fr");
      }
   }

   let showExpandColumn = false;
   if (table.rows)
   {
      for (let i = 0; i < table.rows.length; i++)
      {
         if (table.rows[i].subRows)
         {
            showExpandColumn = true;
            break;
         }
      }
   }

   const columnsToMemo = [...table.columns];
   if (showExpandColumn)
   {
      widths.push("60px");
      columnsToMemo.push(
         {
            ///////////////////////////////
            // Build our expander column //
            ///////////////////////////////
            id: "__expander",
            width: 60,

            ////////////////////////////////////////////////
            // use this block if we want to do expand-all //
            ////////////////////////////////////////////////
            // @ts-ignore
            // header: ({getToggleAllRowsExpandedProps, isAllRowsExpanded}) => (
            //    <span {...getToggleAllRowsExpandedProps()}>
            //       {isAllRowsExpanded ? "yes" : "no"}
            //    </span>
            // ),
            header: () => (<span />),

            // @ts-ignore
            cell: ({row}) =>
               /////////////////////////////////////////////////////////////////////////////////////////////////////////////////
               // Use the row.canExpand and row.getToggleRowExpandedProps prop getter to build the toggle for expanding a row //
               /////////////////////////////////////////////////////////////////////////////////////////////////////////////////
               row.canExpand ? (
                  <span
                     {...row.getToggleRowExpandedProps({
                        //////////////////////////////////////////////////////////////////////////////////////////
                        // We could use the row.depth property and paddingLeft to indicate the depth of the row //
                        //////////////////////////////////////////////////////////////////////////////////////////
                        // style: {paddingLeft: `${row.depth * 2}rem`,},
                     })}
                  >
                     {/* float this icon to keep it "out of the flow" - in other words, to keep it from making the row taller than it otherwise would be... */}
                     <Icon fontSize="medium" sx={{float: "left"}}>{row.isExpanded ? "expand_less" : "chevron_left"}</Icon>
                  </span>
               ) : null,
         },
      );
   }

   if (table.columnHeaderTooltips)
   {
      for (let column of columnsToMemo)
      {
         if (table.columnHeaderTooltips[column.accessor])
         {
            column.tooltip = table.columnHeaderTooltips[column.accessor];
         }
      }
   }

   const columns = useMemo<any>(() => columnsToMemo, [table]);
   const data = useMemo<any>(() => table.rows, [table]);
   const gridTemplateColumns = widths.join(" ");

   if (!columns || !data)
   {
      return null;
   }

   const tableInstance = useTable(
      {columns, data, initialState: {pageIndex: 0}},
      useGlobalFilter,
      useSortBy,
      useExpanded,
      usePagination
   );

   const {
      getTableProps,
      getTableBodyProps,
      headerGroups,
      prepareRow,
      rows,
      page,
      pageOptions,
      canPreviousPage,
      canNextPage,
      gotoPage,
      nextPage,
      previousPage,
      setPageSize,
      setGlobalFilter,
      state: {pageIndex, pageSize, globalFilter, expanded},
   }: any = tableInstance;

   // Set the default value for the entries per page when component mounts
   useEffect(() => setPageSize(defaultValue || 10), [defaultValue]);

   // Set the entries per page value based on the select value
   const setEntriesPerPage = (value: any) => setPageSize(value);

   // Render the pagination
   const renderPagination = pageOptions.map((option: any) => (
      <MDPagination
         item
         key={option}
         onClick={() => gotoPage(Number(option))}
         active={pageIndex === option}
      >
         {option + 1}
      </MDPagination>
   ));

   // Handler for the input to set the pagination index
   const handleInputPagination = ({target: {value}}: any) =>
      value > pageOptions.length || value < 0 ? gotoPage(0) : gotoPage(Number(value));

   // Customized page options starting from 1
   const customizedPageOptions = pageOptions.map((option: any) => option + 1);

   // Setting value for the pagination input
   const handleInputPaginationValue = ({target: value}: any) => gotoPage(Number(value.value - 1));

   // Search input value state
   const [search, setSearch] = useState(globalFilter);

   // Search input state handle
   const onSearchChange = useAsyncDebounce((value) =>
   {
      setGlobalFilter(value || undefined);
   }, 100);

   // A function that sets the sorted value for the table
   const setSortedValue = (column: any) =>
   {
      let sortedValue;

      if (isSorted && column.isSorted)
      {
         sortedValue = column.isSortedDesc ? "desc" : "asc";
      }
      else if (isSorted)
      {
         sortedValue = "none";
      }
      else
      {
         sortedValue = false;
      }

      return sortedValue;
   };

   // Setting the entries starting point
   const entriesStart = pageIndex === 0 ? pageIndex + 1 : pageIndex * pageSize + 1;

   // Setting the entries ending point
   let entriesEnd;

   if (pageIndex === 0)
   {
      entriesEnd = pageSize;
   }
   else if (pageIndex === pageOptions.length - 1)
   {
      entriesEnd = rows.length;
   }
   else
   {
      entriesEnd = pageSize * (pageIndex + 1);
   }

   let visibleFooterRows = 1;
   if (expanded && expanded[`${table.rows.length - 1}`])
   {
      //////////////////////////////////////////////////
      // todo - should count how many are expanded... //
      //////////////////////////////////////////////////
      visibleFooterRows = 2;
   }

   function getTable(includeHead: boolean, rows: any, isFooter: boolean)
   {
      let boxStyle = {};
      if (fixedStickyLastRow)
      {
         boxStyle = isFooter
            ? {borderTop: `0.0625rem solid ${colors.grayLines.main};`, backgroundColor: "#EEEEEE"}
            : {height: fixedHeight ? `${fixedHeight}px` : "auto", flexGrow: 1, overflowY: "scroll", scrollbarGutter: "stable", marginBottom: "-1px"};
      }

      let innerBoxStyle = {};
      if (fixedStickyLastRow && isFooter)
      {
         innerBoxStyle = {overflowY: "auto", scrollbarGutter: "stable"};
      }

      ///////////////////////////////////////////////////////////////////////////////////
      // note - at one point, we had the table's sx including: whiteSpace: "nowrap"... //
      ///////////////////////////////////////////////////////////////////////////////////
      return <Box sx={boxStyle}><Box sx={innerBoxStyle}>
         <Table {...getTableProps()} component="div" sx={{display: "grid", gridTemplateRows: "auto", gridTemplateColumns: gridTemplateColumns}}>
            {
               includeHead && (
                  headerGroups.map((headerGroup: any, i: number) => (
                     headerGroup.headers.map((column: any) => (
                        column.type !== "hidden" && (
                           <DataTableHeadCell
                              sx={{position: "sticky", top: 0, background: "white", zIndex: 10, alignItems: "flex-end"}}
                              key={i++}
                              {...column.getHeaderProps(isSorted && column.getSortByToggleProps())}
                              align={column.align ? column.align : "left"}
                              sorted={setSortedValue(column)}
                              tooltip={column.tooltip}
                           >
                              {column.render("header")}
                           </DataTableHeadCell>
                        )
                     ))
                  ))
               )
            }
            {rows.map((row: any, key: any) =>
            {
               prepareRow(row);

               let overrideNoEndBorder = false;

               //////////////////////////////////////////////////////////////////////////////////
               // don't do an end-border on nested rows - unless they're the last one in a set //
               //////////////////////////////////////////////////////////////////////////////////
               if (row.depth > 0)
               {
                  overrideNoEndBorder = true;
                  if (key + 1 < rows.length && rows[key + 1].depth == 0)
                  {
                     overrideNoEndBorder = false;
                  }
               }

               ///////////////////////////////////////
               // don't do end-border on the footer //
               ///////////////////////////////////////
               if (isFooter)
               {
                  overrideNoEndBorder = true;
               }

               let background = "initial";
               if (isFooter)
               {
                  background = "#EEEEEE";
               }
               else if (row.depth > 0 || row.isExpanded)
               {
                  background = "#FAFAFA";
               }

               return (
                  row.cells.map((cell: any) => (
                     cell.column.type !== "hidden" && (
                        <DataTableBodyCell
                           key={key}
                           sx={{verticalAlign: "top", background: background}}
                           noBorder={noEndBorder || overrideNoEndBorder || row.isExpanded}
                           depth={row.depth}
                           align={cell.column.align ? cell.column.align : "left"}
                           {...cell.getCellProps()}
                        >
                           {
                              cell.column.type === "default" && (
                                 cell.value && "number" === typeof cell.value ? (
                                    <DefaultCell isFooter={isFooter}>{cell.value.toLocaleString()}</DefaultCell>
                                 ) : (<DefaultCell isFooter={isFooter}>{cell.render("Cell")}</DefaultCell>)
                              )
                           }
                           {
                              cell.column.type === "htmlAndTooltip" && (
                                 <DefaultCell isFooter={isFooter}>
                                    <NoMaxWidthTooltip title={parse(row.values["tooltip"])}>
                                       <Box>
                                          {parse(cell.value)}
                                       </Box>
                                    </NoMaxWidthTooltip>
                                 </DefaultCell>
                              )
                           }
                           {
                              cell.column.type === "html" && (
                                 <DefaultCell isFooter={isFooter}>{parse(cell.value ?? "")}</DefaultCell>
                              )
                           }
                           {
                              cell.column.type === "composite" && (
                                 <DefaultCell isFooter={isFooter}>
                                    <CompositeWidget widgetMetaData={widgetMetaData} data={cell.value} />
                                 </DefaultCell>
                              )
                           }
                           {
                              cell.column.type === "block" && (
                                 <DefaultCell isFooter={isFooter}>
                                    <WidgetBlock widgetMetaData={widgetMetaData} block={cell.value} />
                                 </DefaultCell>
                              )
                           }
                           {
                              cell.column.type === "image" && row.values["imageTotal"] && (
                                 <ImageCell imageUrl={row.values["imageUrl"]} label={row.values["imageLabel"]} total={row.values["imageTotal"].toLocaleString()} totalType={row.values["imageTotalType"]} />
                              )
                           }
                           {
                              cell.column.type === "image" && !row.values["imageTotal"] && (
                                 <ImageCell imageUrl={row.values["imageUrl"]} label={row.values["imageLabel"]} />
                              )
                           }
                           {
                              (cell.column.id === "__expander") && cell.render("cell")
                           }
                        </DataTableBodyCell>
                     )
                  ))
               );
            })}
         </Table>
      </Box></Box>;
   }

   return (
      <TableContainer sx={{boxShadow: "none", height: (fixedHeight && !fixedStickyLastRow) ? `${fixedHeight}px` : "auto"}}>
         {entriesPerPage && ((hidePaginationDropdown !== undefined && !hidePaginationDropdown) || canSearch) ? (
            <Box display="flex" justifyContent="space-between" alignItems="center" p={3}>
               {entriesPerPage && (hidePaginationDropdown === undefined || !hidePaginationDropdown) && (
                  <Box display="flex" alignItems="center">
                     <Autocomplete
                        disableClearable
                        value={pageSize.toString()}
                        options={entries}
                        onChange={(event, newValues: any) =>
                        {
                           if (typeof newValues === "string")
                           {
                              setEntriesPerPage(parseInt(newValues, 10));
                           }
                           else
                           {
                              setEntriesPerPage(parseInt(newValues[0], 10));
                           }
                        }}
                        size="small"
                        sx={{width: "5rem"}}
                        renderInput={(params) => <MDInput {...params} />}
                     />
                     <MDTypography variant="caption" color="secondary">
                        &nbsp;&nbsp;entries per page
                     </MDTypography>
                  </Box>
               )}
               {canSearch && (
                  <Box width="12rem" ml="auto">
                     <MDInput
                        placeholder="Search..."
                        value={search}
                        size="small"
                        fullWidth
                        onChange={({currentTarget}: any) =>
                        {
                           setSearch(search);
                           onSearchChange(currentTarget.value);
                        }}
                     />
                  </Box>
               )}
            </Box>
         ) : null}

         <Box display="flex" justifyContent="space-between" flexDirection="column" height="100%">
            {
               fixedStickyLastRow ? (
                  <>
                     {getTable(true, page.slice(0, page.length - visibleFooterRows), false)}
                     {getTable(false, page.slice(page.length - visibleFooterRows), true)}
                  </>
               ) : getTable(true, page, false)
            }
         </Box>

         <Box
            display="flex"
            flexDirection={{xs: "column", sm: "row"}}
            justifyContent="space-between"
            alignItems={{xs: "flex-start", sm: "center"}}
            p={!showTotalEntries && pageOptions.length === 1 ? 0 : 3}
         >
            {showTotalEntries && (
               <Box mb={{xs: 3, sm: 0}}>
                  <MDTypography variant="button" color="secondary" fontWeight="regular">
                     Showing {entriesStart} to {entriesEnd} of {rows.length} entries
                  </MDTypography>
               </Box>
            )}
            {pageOptions.length > 1 && (
               <MDPagination
                  variant={pagination.variant ? pagination.variant : "gradient"}
                  color={pagination.color ? pagination.color : preferredColorNameInfoOrPrimary()}
               >
                  {canPreviousPage && (
                     <MDPagination item onClick={() => previousPage()}>
                        <Icon sx={{fontWeight: "bold"}}>chevron_left</Icon>
                     </MDPagination>
                  )}
                  {renderPagination.length > 6 ? (
                     <Box width="5rem" mx={1}>
                        <MDInput
                           inputProps={{type: "number", min: 1, max: customizedPageOptions.length}}
                           value={customizedPageOptions[pageIndex]}
                           onChange={(event: any) =>
                           {
                              handleInputPagination(event);
                              handleInputPaginationValue(event);
                           }}
                        />
                     </Box>
                  ) : (
                     renderPagination
                  )}
                  {canNextPage && (
                     <MDPagination item onClick={() => nextPage()}>
                        <Icon sx={{fontWeight: "bold"}}>chevron_right</Icon>
                     </MDPagination>
                  )}
               </MDPagination>
            )}
         </Box>
      </TableContainer>
   );
}

export default DataTable;
