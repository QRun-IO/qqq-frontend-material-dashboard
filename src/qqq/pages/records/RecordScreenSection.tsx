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

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CircularProgress from "@mui/material/CircularProgress";
import Grid from "@mui/material/Grid";
import Icon from "@mui/material/Icon";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import {QTableSection} from "@qrunio/qqq-frontend-core/lib/model/metaData/QTableSection";
import {QTableVariant} from "@qrunio/qqq-frontend-core/lib/model/metaData/QTableVariant";
import {QRecord} from "@qrunio/qqq-frontend-core/lib/model/QRecord";
import {DynamicFormFieldDefinition} from "qqq/components/forms/DynamicFormUtils";
import HelpContent from "qqq/components/misc/HelpContent";
import DashboardWidgets from "qqq/components/widgets/DashboardWidgets";
import RecordGridWidget from "qqq/components/widgets/misc/RecordGridWidget";
import RecordScreenContext, {RecordScreenMode} from "qqq/pages/records/RecordScreenContext";
import RecordScreenField from "qqq/pages/records/RecordScreenField";
import TableUtils from "qqq/utils/qqq/TableUtils";
import {useFormikContext} from "formik";
import React, {useContext, memo} from "react";


interface RecordScreenSectionProps
{
   section: QTableSection;
   mode: RecordScreenMode;
   record?: QRecord;
   formFieldsBySection?: Map<string, DynamicFormFieldDefinition[]>;
   isOpen?: boolean;
   isT1?: boolean;
   onToggleCollapse?: () => void;
   onEditIconClick?: (fieldName?: string) => void;
   tableVariant?: QTableVariant;
   widgetReloadCounter?: number;
}


/***************************************************************************
 ** Wrapper that reads Formik values and passes them to DashboardWidgets.
 ** This is NOT memoized, so it re-renders when Formik values change —
 ** which is needed for widgets like FilterAndColumnsSetup that depend on
 ** form field values (e.g., tableName).
 ***************************************************************************/
function FormikAwareDashboardWidgets({sectionName, mode, recordId, tableMetaDataName, widgetMetaDataList, record, primaryKeyField, widgetReloadCounter, setFieldValue, addSubValidations}: {
   sectionName: string;
   mode: string;
   recordId: any;
   tableMetaDataName: string;
   widgetMetaDataList: any[];
   record: QRecord;
   primaryKeyField: string;
   widgetReloadCounter: number;
   setFieldValue: (name: string, value: any) => void;
   addSubValidations?: (name: string, validations: Record<string, any>) => void;
}): JSX.Element
{
   const {values: formikValues} = useFormikContext<any>();

   return (
      <DashboardWidgets
         key={`${sectionName}-${mode}-${recordId ?? "new"}-${widgetReloadCounter}`}
         tableName={tableMetaDataName}
         widgetMetaDataList={widgetMetaDataList}
         record={record}
         entityPrimaryKey={record?.values?.get(primaryKeyField)}
         omitWrappingGridContainer={true}
         screen="recordEdit"
         values={formikValues ?? {}}
         addSubValidations={addSubValidations}
         actionCallback={(data: any) =>
         {
            if (data && typeof data === "object")
            {
               for (const [key, value] of Object.entries(data))
               {
                  setFieldValue(key, value);
               }
            }
            return true;
         }}
      />
   );
}


/***************************************************************************
 ** Renders a single section (card) on the RecordScreen.
 ** Handles both field-based and widget-based sections.
 ***************************************************************************/
function RecordScreenSection({section, mode, record, formFieldsBySection, isOpen = true, isT1 = false, onToggleCollapse, onEditIconClick, tableVariant, widgetReloadCounter = 0}: RecordScreenSectionProps): JSX.Element
{
   const {tableMetaData, metaData, childListWidgetData, openAddChildRecord, openEditChildRecord, deleteChildRecord, setFieldValue, isFormDisabled, addSubValidations} = useContext(RecordScreenContext);

   if (!section || section.isHidden)
   {
      return null;
   }

   const isCollapsible = !isT1 && section.collapsible?.isCollapsible;
   const moreHeaderProps = isCollapsible ? {sx: {cursor: "pointer"}, onClick: onToggleCollapse} : {};

   // widget section
   if (section.widgetName && metaData)
   {
      const widgetMetaData = metaData.widgets.get(section.widgetName);
      if (!widgetMetaData)
      {
         return null;
      }

      if (section.collapsible)
      {
         widgetMetaData.collapsible = section.collapsible;
      }

      // In edit mode, managed-association childRecordList widgets render directly
      // as RecordGridWidget with in-memory CRUD callbacks (like EntityForm does).
      const isManagedChildRecordList = mode !== "view"
         && widgetMetaData.type === "childRecordList"
         && widgetMetaData.defaultValues?.has("manageAssociationName");

      if (isManagedChildRecordList)
      {
         if (!childListWidgetData[section.widgetName])
         {
            // data is loading — show a placeholder instead of DashboardWidgets
            return (
               <Box width="100%" flexGrow={1} alignItems="stretch" display="flex" justifyContent="center" p={3}>
                  <CircularProgress size={24} />
               </Box>
            );
         }

         const widgetData = childListWidgetData[section.widgetName];
         widgetData.viewAllLink = null;
         if (!isFormDisabled)
         {
            widgetData.canAddChildRecord = true;
         }
         widgetMetaData.showExportButton = false;

         return (
            <Box width="100%" flexGrow={1} alignItems="stretch" sx={{"& .widget.inCard": {padding: "24px"}}}>
               <RecordGridWidget
                  widgetMetaData={widgetMetaData}
                  data={widgetData}
                  disableRowClick
                  allowRecordEdit={!isFormDisabled}
                  allowRecordDelete={!isFormDisabled}
                  addNewRecordCallback={() => openAddChildRecord(section.widgetName, widgetData)}
                  editRecordCallback={(rowIndex) => openEditChildRecord(section.widgetName, widgetData, rowIndex)}
                  deleteRecordCallback={(rowIndex) => deleteChildRecord(section.widgetName, rowIndex)}
               />
            </Box>
         );
      }

      const isEditing = mode === "edit" || mode === "create";

      return (
         <Box width="100%" height="100%" flexGrow={1} alignItems="stretch" sx={{"& .widget.inCard": {padding: "24px"}}}>
            {isEditing ? (
               <FormikAwareDashboardWidgets
                  sectionName={section.name}
                  mode={mode}
                  recordId={record?.values?.get("id")}
                  tableMetaDataName={tableMetaData.name}
                  widgetMetaDataList={[widgetMetaData]}
                  record={record}
                  primaryKeyField={tableMetaData.primaryKeyField}
                  widgetReloadCounter={widgetReloadCounter}
                  setFieldValue={setFieldValue}
                  addSubValidations={addSubValidations}
               />
            ) : (
               <DashboardWidgets
                  key={`${section.name}-${mode}-${record?.values?.get("id") ?? "new"}-${widgetReloadCounter}`}
                  tableName={tableMetaData.name}
                  widgetMetaDataList={[widgetMetaData]}
                  record={record}
                  entityPrimaryKey={record?.values?.get(tableMetaData.primaryKeyField)}
                  omitWrappingGridContainer={true}
                  screen="recordView"
               />
            )}
         </Box>
      );
   }

   // field section
   if (!section.fieldNames || section.fieldNames.length === 0)
   {
      return null;
   }

   const helpRoles = (mode === "edit" || mode === "create")
      ? [(mode === "create" ? "INSERT_SCREEN" : "EDIT_SCREEN"), "WRITE_SCREENS", "ALL_SCREENS"]
      : ["VIEW_SCREEN", "READ_SCREENS", "ALL_SCREENS"];
   const sectionHelp = <HelpContent helpContents={section.helpContents} roles={helpRoles} helpContentKey={`table:${tableMetaData?.name};section:${section.name}`} />;

   const sectionFormFields = formFieldsBySection?.get(section.name);

   // build a lookup for form field defs by field name
   const formFieldDefMap: { [key: string]: DynamicFormFieldDefinition } = {};
   if (sectionFormFields)
   {
      for (let ff of sectionFormFields)
      {
         formFieldDefMap[ff.name] = ff;
      }
   }

   const fieldsContent = (
      <>
         {sectionHelp && (
            <Box px="1.5rem" pb="0.5rem" fontSize="0.875rem">
               {sectionHelp}
            </Box>
         )}
         <Box p={3} pt={0} flexDirection="column">
            <Grid container display="flex" spacing={0}>
               {section.fieldNames.map((fieldName: string) =>
               {
                  let [field] = tableMetaData ? TableUtils.getFieldAndTable(tableMetaData, fieldName) : [null, null];

                  if (field == null && tableMetaData?.virtualFields?.has(fieldName))
                  {
                     field = tableMetaData.virtualFields.get(fieldName);
                  }

                  if (field == null || field.isHidden)
                  {
                     return null;
                  }

                  // skip join fields in edit/create mode — they aren't editable from this table
                  if ((mode === "edit" || mode === "create") && fieldName.includes("."))
                  {
                     return null;
                  }

                  const gridColumns = (field.gridColumns && field.gridColumns > 0) ? field.gridColumns : 12;

                  return (
                     <Grid item key={fieldName} lg={gridColumns} xs={12} pt={0}>
                        <RecordScreenField
                           field={field}
                           fieldName={fieldName}
                           mode={mode}
                           record={record}
                           formFieldDef={formFieldDefMap[fieldName]}
                           tableMetaData={tableMetaData}
                           tableVariant={tableVariant}
                           onEditIconClick={onEditIconClick}
                        />
                     </Grid>
                  );
               })}
            </Grid>
         </Box>
      </>
   );

   // T1 sections render without a Card wrapper (parent already provides one)
   if (isT1)
   {
      return fieldsContent;
   }

   return (
      <Card id={section.name} className="recordScreenFieldSection" sx={{overflow: "visible", scrollMarginTop: "100px", height: isOpen ? "100%" : "auto"}}>
         <Box display="flex" justifyContent="space-between" alignItems="center" pb={isOpen ? 0 : 1.5} {...moreHeaderProps}>
            <Typography variant="h6" p={3} pb={1}>
               {section.label}
            </Typography>
            {isCollapsible && (
               <Box p="0.75rem 0.25rem 0">
                  <IconButton onClick={(e) =>
                  {
                     e.stopPropagation();
                     onToggleCollapse?.();
                  }}>
                     <Icon fontSize="large">{isOpen ? "expand_less" : "expand_more"}</Icon>
                  </IconButton>
               </Box>
            )}
         </Box>
         <Box style={{display: isOpen ? "block" : "none"}}>
            {fieldsContent}
         </Box>
      </Card>
   );
}


/***************************************************************************
 ** Memoized export — prevents widget sections from re-rendering on every
 ** Formik keystroke. Only re-renders when meaningful props change.
 ** Callback props (onToggleCollapse, onEditIconClick) are excluded from
 ** comparison since they're recreated each render but functionally stable.
 ***************************************************************************/
export default memo(RecordScreenSection, (prev, next) =>
{
   return (
      prev.section === next.section
      && prev.mode === next.mode
      && prev.record === next.record
      && prev.formFieldsBySection === next.formFieldsBySection
      && prev.isOpen === next.isOpen
      && prev.isT1 === next.isT1
      && prev.tableVariant === next.tableVariant
      && prev.widgetReloadCounter === next.widgetReloadCounter
      // Note: childListWidgetData changes are detected via context, not props
   );
});
