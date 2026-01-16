/*
 * QQQ - Low-code Application Framework for Engineers.
 * Copyright (C) 2021-2025.  Kingsrook, LLC
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

import {FormControlLabel, Popover, Radio, RadioGroup, Typography} from "@mui/material";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Icon from "@mui/material/Icon";
import LinearProgress from "@mui/material/LinearProgress";
import TextField from "@mui/material/TextField";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Tooltip from "@mui/material/Tooltip";
import {QFieldMetaData} from "@qrunio/qqq-frontend-core/lib/model/metaData/QFieldMetaData";
import {QTableMetaData} from "@qrunio/qqq-frontend-core/lib/model/metaData/QTableMetaData";
import {QWidgetMetaData} from "@qrunio/qqq-frontend-core/lib/model/metaData/QWidgetMetaData";
import {QPossibleValue} from "@qrunio/qqq-frontend-core/lib/model/QPossibleValue";
import {QRecord} from "@qrunio/qqq-frontend-core/lib/model/QRecord";
import {ErrorMessage, useFormikContext} from "formik";
import QContext from "QContext";
import colors from "qqq/assets/theme/base/colors";
import {DynamicFormFieldLabel} from "qqq/components/forms/DynamicForm";
import QDynamicFormField from "qqq/components/forms/DynamicFormField";
import DynamicFormUtils, {DynamicFormFieldDefinition} from "qqq/components/forms/DynamicFormUtils";
import DynamicSelect from "qqq/components/forms/DynamicSelect";
import {WidgetScreenType} from "qqq/components/widgets/DashboardWidgets";
import Widget from "qqq/components/widgets/Widget";
import {WidgetUtils} from "qqq/components/widgets/WidgetUtils";
import {FieldPossibleValueProps} from "qqq/models/fields/FieldPossibleValueProps";
import {renderSectionOfFields} from "qqq/pages/records/view/RecordView";
import Client from "qqq/utils/qqq/Client";
import usePossibleValueLabels from "qqq/utils/usePossibleValueLabels";
import {useContext, useEffect, useRef, useState} from "react";
import * as Yup from "yup";

interface CronUIWidgetProps
{
   widgetMetaData: QWidgetMetaData,
   onSaveCallback?: (values: { [name: string]: any }) => void,
   addSubValidations?: (name: string, validationScheme: Record<string, Yup.BaseSchema>) => void,
   widgetData?: any,
   screen?: WidgetScreenType,
   recordValues: { [name: string]: any },
   recordDisplayValueMap?: Map<string, string>
}

CronUIWidget.defaultProps = {};

type Option = "every" | "selectedWeekdays" | "selectedDates" | "selectedHours" | "selectedMinutes";

const qController = Client.getInstance();

interface RebuildCronStringFromBasicValuesParams
{
   updatedValuesSlot?: string;
   newValues?: string[];
   updatedOptionSlot?: string;
   newOption?: Option;
}

/***************************************************************************
 * Widget for editing and viewing a cron schedule (and optionally timezone)
 * field in a more human-friendly way.
 *
 * Two modes for editing are presented:
 * - Basic:  lets use choose day (either 'every', or a list of weekdays or a
 * list of dates), hour (every or list), and minute (every or list)
 * - Advanced: lets user edit cron string, but with floating tooltip positioned
 * under cursor to help indicate which field it is in.
 * Both modes also load a human-readable description of the string from the
 * server on change.
 *
 * On the view screen, the cron expression field is presented raw form,
 * in "description" form, and the time zone is shown (if configured).
 ***************************************************************************/
export default function CronUIWidget({widgetMetaData, widgetData, screen, recordValues, recordDisplayValueMap, onSaveCallback, addSubValidations}: CronUIWidgetProps): JSX.Element
{
   const cronExpressionFieldName = widgetMetaData.defaultValues.get("cronExpressionFieldName");
   const timeZoneFieldName = widgetMetaData.defaultValues.get("timeZoneFieldName");
   const tableName = widgetMetaData.defaultValues.get("tableName");

   const [cronExpressionField, setCronExpressionField] = useState(null as QFieldMetaData);
   const [timeZoneField, setTimeZoneField] = useState(null as QFieldMetaData);
   const [cronExpressionFieldIsRequiredIndicator, setCronExpressionFieldIsRequiredIndicator] = useState("");

   const [cronExpression, setCronExpression] = useState(null as string);
   const [timeZone, setTimeZone] = useState(null as string);
   const [readyForForm, setReadyForForm] = useState(false);

   const [tableMetaData, setTableMetaData] = useState(null as QTableMetaData | null);
   const [timeZonePossibleValueProps, setTimeZonePossibleValueProps] = useState(null as FieldPossibleValueProps | null);
   const [advancedFormFieldObject, setAdvancedFormFieldObject] = useState(null as DynamicFormFieldDefinition | null);

   const [basicOrAdvancedMode, setBasicOrAdvancedMode] = useState("basic" as "basic" | "advanced");
   const [reasonWhyBasicIsDisabled, setReasonWhyBasicIsDisabled] = useState(null as string | null);
   const [canBeBasic, setCanBeBasic] = useState(true);

   const [advancedCaretPosition, setAdvancedCaretPosition] = useState("");
   const [caretTipLeft, setCaretTipLeft] = useState(0);
   const [tapeMeasureContent, setTapeMeasureContent] = useState("");

   const [daysOption, setDaysOption] = useState("every" as Option);
   const [hoursOption, setHoursOption] = useState("selectedHours" as Option);
   const [minutesOption, setMinutesOption] = useState("selectedMinutes" as Option);
   const [daysDisplayValue, setDaysDisplayValue] = useState("");
   const [hoursDisplayValue, setHoursDisplayValue] = useState("");
   const [minutesDisplayValue, setMinutesDisplayValue] = useState("");
   const [daysSelectedValues, setDaysSelectedValues] = useState([] as string[]);
   const [hoursSelectedValues, setHoursSelectedValues] = useState(["0"] as string[]);
   const [minutesSelectedValues, setMinutesSelectedValues] = useState(["0"] as string[]);

   const [cronDescription, setCronDescription] = useState("");
   const [cronDescriptionError, setCronDescriptionError] = useState(null);
   const [loadingDescription, setLoadingDescription] = useState(false);
   const loadingDescriptionTimeoutRef = useRef(null);

   const {getDisplayValue} = usePossibleValueLabels({useCase: "form"});
   const formikContext = useFormikContext();
   const {helpHelpActive} = useContext(QContext);

   const debug = false;
   const doAdvancedCaratPositionTooltip = true;


   ///////////////////////////////////////////////////////////////////////////////////////////////////
   // we had trouble getting the error messages to show.  Formik wasn't considering the field to be //
   // touched upon submit.  this fixes it, by watching submit count and manually setting touched.   //
   ///////////////////////////////////////////////////////////////////////////////////////////////////
   useEffect(() =>
   {
      if (formikContext?.submitCount > 0)
      {
         if (cronExpressionField?.isRequired)
         {
            formikContext?.setFieldTouched(cronExpressionFieldName, true);
         }

         if (timeZoneField?.isRequired)
         {
            formikContext?.setFieldTouched(timeZoneFieldName, true);
         }
      }
   }, [formikContext?.submitCount]);


   /***************************************************************************
    * for a single value in a cron string (e.g., "*" or "0-5", or "3,7,10,20-30/2")
    * return a list of values, e.g., for selecting in a select box in this ui.
    ***************************************************************************/
   function parseCronFieldIntoValues(cronField: string, slot: "weekday" | "date" | "minutes" | "hours"): string[]
   {
      const rs: string[] = [];

      if (cronField)
      {
         const parts = cronField.split(/,/);
         for (let part of parts)
         {
            if (part.indexOf("-") > -1)
            {
               const [start, end] = part.split(/-/);
               if (slot == "weekday")
               {
                  const startWeekday = weekdayFromString(start);
                  const endWeekday = weekdayFromString(end);
                  for (let i = Number(startWeekday?.number ?? 0); i <= Number(endWeekday?.number ?? 7); i++)
                  {
                     let iWeekday = weekdayFromNumber(i);
                     if (iWeekday)
                     {
                        rs.push(iWeekday.short);
                     }
                  }
               }
               else
               {
                  for (let i = parseInt(start); i <= parseInt(end); i++)
                  {
                     rs.push(i.toString());
                  }
               }
            }
            else
            {
               rs.push(part);
            }
         }
      }

      return (rs);
   }


   /***************************************************************************
    * when the cron expression changes, update the UI state.
    ***************************************************************************/
   function updateStateFromCronExpression(cronExpression: string)
   {
      if (!cronExpression)
      {
         ///////////////////////////////////////////////////////
         // go to default state if there's no cron expression //
         ///////////////////////////////////////////////////////
         setReasonWhyBasicIsDisabled(null);
         setCanBeBasic(true);

         setMinutesOption("selectedMinutes");
         setMinutesDisplayValue("");
         setMinutesSelectedValues(["0"]);

         setHoursOption("selectedHours");
         setHoursDisplayValue("");
         setHoursSelectedValues(["0"]);

         setDaysOption("selectedWeekdays");
         setDaysDisplayValue("");
         setDaysSelectedValues([]);

         return;
      }

      const parts = cronExpression.trim().toUpperCase().split(/\s+/);
      if (parts.length < 6 || parts.length > 7)
      {
         console.log(`Invalid cron expression (required 6 or 7 space-delimited parts, got ${parts.length}: ` + cronExpression);
         setReasonWhyBasicIsDisabled("To use Basic mode the expression must be valid");
         setCanBeBasic(false);
         setBasicOrAdvancedMode("advanced");
         return;
      }

      const seconds = parts[0];
      const minutes = parts[1];
      const hours = parts[2];
      const dayOfMonth = parts[3];
      const month = parts[4];
      const dayOfWeek = parts[5];
      const year = parts.length === 7 ? parts[6] : "*";

      if (seconds != "0" || month != "*" || year != "*")
      {
         setReasonWhyBasicIsDisabled("To use Basic mode Seconds must be 0, Month must be *, and Year must be *");
         setCanBeBasic(false);
         setBasicOrAdvancedMode("advanced");
      }
      else
      {
         setReasonWhyBasicIsDisabled(null);
         setCanBeBasic(true);
         //////////////////////////////////////////////////////////////////////////////////////////////////
         // note, we don't just always force basic though - if user was in advanced, let them stay there //
         //////////////////////////////////////////////////////////////////////////////////////////////////
      }

      if (minutes == "*")
      {
         setMinutesOption("every");
         setMinutesDisplayValue("Every minute");
         setMinutesSelectedValues([]);
      }
      else
      {
         setMinutesOption("selectedMinutes");
         const selectedValues = parseCronFieldIntoValues(minutes, "minutes");
         setMinutesSelectedValues(selectedValues);
         setMinutesDisplayValue(selectedValues.map(v => minuteNumberToDisplayString(parseInt(v))).join(", "));
      }

      if (hours == "*")
      {
         setHoursOption("every");
         setHoursDisplayValue("Every hour");
         setHoursSelectedValues([]);
      }
      else
      {
         setHoursOption("selectedHours");
         const selectedValues = parseCronFieldIntoValues(hours, "hours");
         setHoursSelectedValues(selectedValues);
         setHoursDisplayValue(selectedValues.map(v => hourNumberToDisplayString(parseInt(v))).join(", "));
      }

      if ((dayOfMonth == "*" || dayOfMonth == "?") && (dayOfWeek == "*" || dayOfWeek == "?"))
      {
         setDaysOption("every");
         setDaysDisplayValue("Every day");
         setDaysSelectedValues([]);
      }
      else if (dayOfMonth == "*" || dayOfMonth == "?")
      {
         setDaysOption("selectedWeekdays");
         const parsedWeekdays = parseCronFieldIntoValues(dayOfWeek, "weekday");
         const weekdayValues: string[] = [];
         for (let parsedWeekday of parsedWeekdays)
         {
            weekdayValues.push(weekdayFromString(parsedWeekday)?.short);
         }
         setDaysSelectedValues(weekdayValues);
         setDaysDisplayValue(weekdayValues.join(", "));
      }
      else
      {
         setDaysOption("selectedDates");
         const selectedValues = parseCronFieldIntoValues(dayOfMonth, "date");
         setDaysSelectedValues(selectedValues);
         setDaysDisplayValue(selectedValues.map(v => dateNumberToDisplayString(parseInt(v))).join(", "));
      }
   }


   ///////////////////////////////////////////////////////////
   // effect to load table meta data and get fields from it //
   ///////////////////////////////////////////////////////////
   useEffect(() =>
   {
      (async () =>
      {
         const formValidations: Record<string, Yup.BaseSchema> = {};

         const newTableMetaData = await qController.loadTableMetaData(tableName);
         setTableMetaData(newTableMetaData);

         const cronExpressionField = newTableMetaData.fields.get(cronExpressionFieldName);
         setCronExpressionField(cronExpressionField);
         setCronExpressionFieldIsRequiredIndicator(cronExpressionField.isRequired ? " *" : "");

         const advancedFormFieldObject = DynamicFormUtils.getDynamicField(cronExpressionField);
         formValidations[cronExpressionFieldName] = DynamicFormUtils.getValidationForField(new QFieldMetaData({...cronExpressionField, label: "Schedule"}));
         setAdvancedFormFieldObject(advancedFormFieldObject);

         const cronExpression = recordValues[cronExpressionFieldName];
         setCronExpression(cronExpression);
         updateStateFromCronExpression(cronExpression);

         if (timeZoneFieldName)
         {
            const timeZoneField = newTableMetaData.fields.get(timeZoneFieldName);
            setTimeZoneField(timeZoneField);

            const timeZone = recordValues[timeZoneFieldName];
            setTimeZone(timeZone);

            const timeZoneFormFieldDefinition = DynamicFormUtils.getDynamicField(timeZoneField);
            formValidations[timeZoneFieldName] = DynamicFormUtils.getValidationForField(new QFieldMetaData({...timeZoneField, label: "Time Zone"}));
            DynamicFormUtils.addPossibleValuePropsToSingleField(timeZoneFormFieldDefinition, timeZoneField, tableName, null, recordDisplayValueMap ?? new Map());
            if (!recordDisplayValueMap)
            {
               timeZoneFormFieldDefinition.possibleValueProps.initialDisplayValue = await getDisplayValue(timeZoneFormFieldDefinition, timeZone);
            }
            setTimeZonePossibleValueProps(timeZoneFormFieldDefinition.possibleValueProps);
         }

         ///////////////////////////////////////////////////////////////////////////////////
         // notify the parent about any validations we might have (e.g., required fields) //
         ///////////////////////////////////////////////////////////////////////////////////
         addSubValidations?.(widgetMetaData.name, formValidations);

         setReadyForForm(true);
      })();
   }, [tableName]);


   ////////////////////////////////////////////////////////////////
   // effect watching changes to the cronExpression, responsible //
   // for updating the description and related states            //
   ////////////////////////////////////////////////////////////////
   useEffect(() =>
   {
      if (!cronExpression)
      {
         setCronDescription("");
         setLoadingDescription(false);
         setCronDescriptionError(null);
         return;
      }

      /////////////////////////////////////////////////////
      // Clear previous debounce timer and start new one //
      /////////////////////////////////////////////////////
      setLoadingDescription(true);
      clearTimeout(loadingDescriptionTimeoutRef.current);
      loadingDescriptionTimeoutRef.current = setTimeout(() =>
      {
         (async () =>
         {
            try
            {
               const response = await qController.widget(widgetMetaData.name, `cronExpression=${encodeURIComponent(cronExpression)}`);
               if (response.error)
               {
                  setCronDescription(null);
                  setCronDescriptionError(response.error);
               }
               else
               {
                  setCronDescription(response.cronDescription);
                  setCronDescriptionError(null);
               }
               setLoadingDescription(false);
            }
            catch (error)
            {
               console.error("Fetch failed:", error);
            }
         })();
      }, 250);

      return () => clearTimeout(loadingDescriptionTimeoutRef.current);
   }, [cronExpression]);


   /***************************************************************************
    * callback from SubForm for when option a radio option is selected.
    ***************************************************************************/
   function handleNewSelectedOption(slot: string, option: Option)
   {
      if (slot == "minutes")
      {
         setMinutesOption(option);
      }
      else if (slot == "hours")
      {
         setHoursOption(option);
      }
      if (slot == "days")
      {
         setDaysOption(option);
      }

      if (option == "every")
      {
         rebuildCronStringFromBasicValues({updatedOptionSlot: slot, newOption: option});
      }
   }


   /***************************************************************************
    * callback from SubForm for when the select box values are changed.
    ***************************************************************************/
   function handleNewSelectedValues(slot: string, newValues: string[])
   {
      //////////////////
      // sort results //
      //////////////////
      newValues.sort((a: string, b: string) =>
      {
         if (slot == "days" && daysOption == "selectedWeekdays")
         {
            const wa = weekdayFromString(a);
            const wb = weekdayFromString(b);
            return (Number(wa?.number ?? 0) - Number(wb?.number ?? 0));
         }
         else
         {
            return (parseInt(a) - parseInt(b));
         }
      });

      if (slot == "minutes")
      {
         setMinutesSelectedValues(newValues);
      }
      else if (slot == "hours")
      {
         setHoursSelectedValues(newValues);
      }
      else if (slot == "days")
      {
         setDaysSelectedValues(newValues);
      }

      rebuildCronStringFromBasicValues({updatedValuesSlot: slot, newValues: newValues});

      if (newValues.length == 0)
      {
         ////////////////////////////////////////////////////////////////////////////////////////////////////////
         // avoid clearing out a list resetting the option to every, at least while user is still in the popup //
         ////////////////////////////////////////////////////////////////////////////////////////////////////////
         if (slot == "minutes")
         {
            setMinutesOption(minutesOption);
         }
         else if (slot == "hours")
         {
            setHoursOption(hoursOption);
         }
         else if (slot == "days")
         {
            setDaysOption(daysOption);
         }
      }
   }


   /***************************************************************************
    * after a change is made in the basic UI (selection of a radio or change
    * to select box values), rebuild the cron expression string.
    ***************************************************************************/
   function rebuildCronStringFromBasicValues(props: RebuildCronStringFromBasicValuesParams)
   {
      const localSelectedMinutes = (props.updatedValuesSlot == "minutes" ? props.newValues : minutesSelectedValues) ?? [];
      const localSelectedHours = (props.updatedValuesSlot == "hours" ? props.newValues : hoursSelectedValues) ?? [];
      const localSelectedDays = (props.updatedValuesSlot == "days" ? props.newValues : daysSelectedValues) ?? [];

      const localMinutesOption = (props.updatedOptionSlot == "minutes" ? props.newOption : minutesOption) ?? "every";
      const localHoursOption = (props.updatedOptionSlot == "hours" ? props.newOption : hoursOption) ?? "every";
      const localDaysOption = (props.updatedOptionSlot == "days" ? props.newOption : daysOption) ?? "every";

      let minutes = "*";
      if (localMinutesOption == "selectedMinutes" && localSelectedMinutes.length > 0)
      {
         minutes = localSelectedMinutes.join(",");
      }

      let hours = "*";
      if (localHoursOption == "selectedHours" && localSelectedHours.length > 0)
      {
         hours = localSelectedHours.join(",");
      }

      let dayOfMonth;
      let dayOfWeek;
      if (localDaysOption == "selectedDates" && localSelectedDays.length > 0)
      {
         dayOfMonth = localSelectedDays.join(",");
         dayOfWeek = "?";
      }
      else if (localDaysOption == "selectedWeekdays" && localSelectedDays.length > 0)
      {
         dayOfWeek = localSelectedDays.join(",");
         dayOfMonth = "?";
      }
      else
      {
         dayOfMonth = "*";
         dayOfWeek = "?";
      }

      let newValue = `0 ${minutes} ${hours} ${dayOfMonth} * ${dayOfWeek}`;
      setCronExpression(newValue);
      updateStateFromCronExpression(newValue);
      onSaveCallback?.({[cronExpressionFieldName]: newValue});
   }


   /***************************************************************************
    * event handler for change to timezone value - just pass it up to parent
    ***************************************************************************/
   function timeZoneChanged(value: any)
   {
      let newValue = null;
      if (value && value.id)
      {
         newValue = value.id;
      }

      setTimeZone(newValue);
      onSaveCallback?.({[timeZoneFieldName]: newValue});
   }


   /***************************************************************************
    * event handler for a change to the 'advanced' cron expression string.
    * updates all other internal state, and passes new value to parent.
    ***************************************************************************/
   function advancedExpressionChanged(newValue: string)
   {
      setCronExpression(newValue);
      updateStateFromCronExpression(newValue);
      onSaveCallback?.({[cronExpressionFieldName]: newValue});
   }


   /***************************************************************************
    * event handler for clear button.
    * updates all other internal state and passes new value to parent.
    ***************************************************************************/
   function clearExpressionClicked()
   {
      setCronExpression("");
      updateStateFromCronExpression("");
      onSaveCallback?.({[cronExpressionFieldName]: ""});
   }


   /***************************************************************************
    * event handler for advanced/basic mode toggle button.
    ***************************************************************************/
   function modeToggleClicked(newValue: "basic" | "advanced")
   {
      if (!newValue)
      {
         ////////////////////////////////////////////////////////////////
         // somehow (?) we got an empty value once.  don't allow that! //
         ////////////////////////////////////////////////////////////////
         newValue = "advanced";
      }
      setBasicOrAdvancedMode(newValue);
   }


   /***************************************************************************
    * event handler for cursor movement events in the advanced text box.
    * used to position the "advanced tooltip" element.
    ***************************************************************************/
   function advancedTextSelect(event: React.SyntheticEvent<HTMLInputElement, Event>)
   {
      const input = event.target as HTMLInputElement;
      const value = input.value;
      const parts = ["second", "minute", "hour", "day of month", "month", "weekday", "year"];

      let inPart = false;
      let partIndex = -1;
      for (let i = 0; i < value.length; i++)
      {
         const c = value.charAt(i);
         if (c == " ")
         {
            inPart = false;
         }
         else
         {
            if (!inPart)
            {
               partIndex++;
            }
            inPart = true;
         }

         if (i == input.selectionStart)
         {
            break;
         }
      }

      if (!inPart && input.selectionStart == value.length)
      {
         partIndex++;
      }

      setAdvancedCaretPosition(parts[partIndex]);
      setTapeMeasureContent(value.substring(0, input.selectionStart));

      setTimeout(() =>
      {
         const leftOffset = -9;
         let left = leftOffset + (document.getElementById("tapeMeasure")?.clientWidth) - input.scrollLeft;
         if (left < leftOffset)
         {
            left = leftOffset;
         }
         setCaretTipLeft(left);
      });
   }


   /***************************************************************************
    * event handler for blur in the advanced text ui.
    * makes the "advanced tooltip" element hide.
    ***************************************************************************/
   function advancedTextBlur(event: React.SyntheticEvent<HTMLInputElement, Event>)
   {
      setAdvancedCaretPosition(null);
   }


   ////////////////////////////
   // output for view screen //
   ////////////////////////////
   if (screen == "recordView")
   {
      const tableMetaDataClone = new QTableMetaData({name: tableName});
      tableMetaDataClone.fields = new Map();

      const fieldNameDescription = cronExpressionFieldName + "Description";

      let cronDescriptionLabel;
      if(cronExpressionField?.label?.match(/ Expression/))
      {
         cronDescriptionLabel = cronExpressionField.label.replace(/ Expression/, " Description");
      }
      else
      {
         cronDescriptionLabel = cronExpressionField?.label + " Description";
      }
      const cloneFieldForDescription = new QFieldMetaData({name: fieldNameDescription, label: cronDescriptionLabel});
      tableMetaDataClone.fields.set(fieldNameDescription, cloneFieldForDescription);

      const values: Record<string, string> = {};
      const displayValues: Record<string, string> = {};

      const fieldNames = [fieldNameDescription];
      values[fieldNameDescription] = cronExpression;
      displayValues[fieldNameDescription] = widgetData.cronDescription;

      const fieldNameRaw = cronExpressionFieldName + "Raw";
      fieldNames.push(fieldNameRaw);
      values[fieldNameRaw] = cronExpression;
      displayValues[fieldNameRaw] = cronExpression;
      const cloneFieldForRaw = new QFieldMetaData({name: fieldNameRaw, label: cronExpressionField?.label});
      tableMetaDataClone.fields.set(fieldNameRaw, cloneFieldForRaw);

      if (timeZoneFieldName)
      {
         tableMetaDataClone.fields.set(timeZoneFieldName, timeZoneField);
         fieldNames.push(timeZoneFieldName);
         values[timeZoneFieldName] = timeZone;
         displayValues[timeZoneFieldName] = recordDisplayValueMap?.get(timeZoneFieldName);
      }

      const record = new QRecord({values: values, displayValues: displayValues});

      const {formattedHelpContent, showHelp} = WidgetUtils.getHelp(widgetMetaData, "top", ["VIEW_SCREEN", "READ_SCREENS", "ALL_SCREENS"], helpHelpActive);

      return (<Widget widgetMetaData={widgetMetaData}>
         <Box>
            {showHelp && formattedHelpContent && (<Box fontSize={"0.875rem"}>{formattedHelpContent}</Box>)}
            {tableMetaData && renderSectionOfFields(widgetMetaData.name, fieldNames, tableMetaDataClone, helpHelpActive, record, {cronExpressionFieldName: cronExpressionField})}
         </Box>
      </Widget>);
   }

   ////////////////////////////
   // output for edit screen //
   ////////////////////////////
   if (screen == "recordEdit" || screen == "processRun")
   {
      const clearButton = (<Box key="clearLink">
         <Button onClick={clearExpressionClicked}>Clear</Button>
      </Box>);

      const basicAdvancedButton = (<Box key="basicAdvancedToggle">
         <Tooltip title={reasonWhyBasicIsDisabled ?? (cronDescriptionError ? "To use Basic mode the expression must be valid" : "")}>
            <ToggleButtonGroup
               value={basicOrAdvancedMode}
               exclusive
               onChange={(event, newValue) => modeToggleClicked(newValue)}
               size="small"
               sx={{pl: 0.5, mb: "0.5rem", width: "10rem"}}
            >
               <ToggleButton value="basic" disabled={!canBeBasic || cronDescriptionError}>Basic</ToggleButton>
               <ToggleButton value="advanced" disabled={!canBeBasic || cronDescriptionError}>Advanced</ToggleButton>
            </ToggleButtonGroup>
         </Tooltip>
      </Box>);

      const basicGridItemProps = {item: true, xs: 12, sm: 6, md: timeZoneFieldName ? 3 : 4, component: "div"};
      const advancedGridItemProps = {item: true, xs: 12, sm: 6, md: timeZoneFieldName ? 9 : 12, component: "div"};

      const {formattedHelpContent, showHelp} = WidgetUtils.getHelp(widgetMetaData, "top", [recordValues.id ? "EDIT_SCREEN" : "INSERT_SCREEN", "WRITE_SCREENS", "ALL_SCREENS"], helpHelpActive);

      return (<Widget widgetMetaData={widgetMetaData} labelAdditionalElementsLeft={[clearButton]} labelAdditionalElementsRight={[basicAdvancedButton]}>
         <Box>
            {
               readyForForm && <>
                  {showHelp && formattedHelpContent && (<Box pb={"1rem"} fontSize={"0.875rem"}>{formattedHelpContent}</Box>)}
                  {
                     <Grid container spacing={2}>
                        {
                           basicOrAdvancedMode == "basic" && <>
                              <Grid {...basicGridItemProps}>
                                 <DynamicFormFieldLabel name={"days"} label={`Days${cronExpressionFieldIsRequiredIndicator}`} />
                                 <SubForm
                                    which="day"
                                    preOpen={() => updateStateFromCronExpression(cronExpression)}
                                    displayText={daysDisplayValue}
                                    option={daysOption}
                                    setOption={(o: Option) => handleNewSelectedOption("days", o)}
                                    selectedValues={daysSelectedValues}
                                    setSelectedValues={(newValues: string[]) => handleNewSelectedValues("days", newValues)}
                                 />
                                 {
                                    cronExpressionField.isRequired && <Typography component="div" className="fieldErrorMessage" variant="caption" color="error" fontWeight="regular" mt="-0.375rem">
                                       <ErrorMessage name={cronExpressionFieldName} render={msg => <span data-field-error="true">{msg}</span>} />
                                    </Typography>
                                 }
                              </Grid>
                              <Grid {...basicGridItemProps}>
                                 <DynamicFormFieldLabel name={"hours"} label={`Hours${cronExpressionFieldIsRequiredIndicator}`} />
                                 <SubForm
                                    which="hour"
                                    preOpen={() => updateStateFromCronExpression(cronExpression)}
                                    displayText={hoursDisplayValue}
                                    option={hoursOption}
                                    setOption={(o: Option) => handleNewSelectedOption("hours", o)}
                                    selectedValues={hoursSelectedValues}
                                    setSelectedValues={(newValues: string[]) => handleNewSelectedValues("hours", newValues)}
                                 />
                              </Grid>
                              <Grid {...basicGridItemProps}>
                                 <DynamicFormFieldLabel name={"minutes"} label={`Minutes${cronExpressionFieldIsRequiredIndicator}`} />
                                 <SubForm
                                    which="minute"
                                    preOpen={() => updateStateFromCronExpression(cronExpression)}
                                    displayText={minutesDisplayValue}
                                    option={minutesOption}
                                    setOption={(o: Option) => handleNewSelectedOption("minutes", o)}
                                    selectedValues={minutesSelectedValues}
                                    setSelectedValues={(newValues: string[]) => handleNewSelectedValues("minutes", newValues)}
                                 />
                              </Grid>
                           </>
                        }
                        {
                           basicOrAdvancedMode == "advanced" && <>
                              <Grid {...advancedGridItemProps} position="relative">
                                 <DynamicFormFieldLabel name={"advancedCronExpression"} label={`Cron Expression ${cronExpressionFieldIsRequiredIndicator}`} />
                                 <QDynamicFormField label={null} name={cronExpressionFieldName} displayFormat={"%s"} value={cronExpression} type={"string"} formFieldObject={advancedFormFieldObject} onChangeCallback={(newValue: any) => advancedExpressionChanged(newValue)}
                                    additionalCallbacks={{onTextSelect: advancedTextSelect, onBlur: advancedTextBlur}} />
                                 {
                                    (doAdvancedCaratPositionTooltip && advancedCaretPosition) && <Box sx={{
                                       transition: "left .1s ease", left: `${caretTipLeft}px`, position: "absolute", top: "89px", width: "66px", lineHeight: "1.2", py: "0.25rem", textAlign: "center", fontSize: "1rem", background: "lightyellow", display: "inline-block", padding: "0.125rem", border: "1px solid rosybrown", borderRadius: "0.5rem",
                                       "&::after": {content: "\"\"", position: "absolute", left: "50%", top: "-10px", transform: "translateX(-50%)", width: "0%", height: "0%", borderLeft: "7px solid transparent", borderRight: "7px solid transparent", borderBottom: "10px solid lightyellow"},
                                       "&::before": {content: "\"\"", position: "absolute", left: "50%", top: "-12px", transform: "translateX(-50%)", width: "0%", height: "0%", borderLeft: "8px solid transparent", borderRight: "8px solid transparent", borderBottom: "12px solid rosybrown"},
                                    }}>{advancedCaretPosition}</Box>
                                 }
                                 <Box id="tapeMeasure" fontSize="1rem" display="inline-block" whiteSpace="pre" visibility="hidden" position="absolute">
                                    {tapeMeasureContent}
                                 </Box>
                              </Grid>
                           </>
                        }
                        {
                           timeZonePossibleValueProps && <>
                              <Grid {...basicGridItemProps}>
                                 <DynamicFormFieldLabel name={timeZoneFieldName} label={`Time Zone${timeZoneField?.isRequired ? " *" : ""}`} />
                                 <DynamicSelect
                                    name={timeZoneFieldName}
                                    fieldLabel=""
                                    fieldPossibleValueProps={timeZonePossibleValueProps}
                                    useCase="form"
                                    inForm={true}
                                    variant="outlined"
                                    onChange={(newValue: any) => timeZoneChanged(newValue)}
                                    initialValue={timeZone}
                                 />
                              </Grid>
                           </>
                        }
                     </Grid>
                  }
                  <Box fontSize="1rem" sx={{transition: "margin-top 0.25s ease", mt: (advancedCaretPosition ? "1.75rem" : "0rem"), mb: "-1rem", display: "inline-block", overflow: "hidden"}}>
                     {cronDescription ? <Box>{cronDescription}</Box> : <Box color={colors.error.main}>{cronDescriptionError}</Box>}
                     {loadingDescription ? <LinearProgress color="info" /> : <Box height="0.375rem"></Box>}
                  </Box>
               </>
            }

            {debug && <Box mt={4} bgcolor="lightgoldenrodyellow" p="1rem">
               <h4>Debug</h4>
               <dl style={{display: "grid", gridTemplateColumns: "max-content auto", columnGap: "1rem", rowGap: "0.5rem"}}>
                  <dt>cronExpressionFieldName</dt>
                  <dd>{cronExpressionFieldName}</dd>

                  <dt>timeZoneFieldName</dt>
                  <dd>{timeZoneFieldName}</dd>

                  <dt>cronExpression</dt>
                  <dd>{cronExpression}</dd>

                  <dt>timeZone</dt>
                  <dd>{timeZone}</dd>
               </dl>
            </Box>}
         </Box>
      </Widget>);
   }
}


/***************************************************************************
 * props for helper form
 ***************************************************************************/
interface SubFormProps
{
   which: "day" | "hour" | "minute",
   option: Option,
   setOption: (newValue: Option) => void,
   displayText: string,
   selectedValues?: string[],
   setSelectedValues?: (value: (string[])) => void,
   preOpen?: () => void
}


/***************************************************************************
 * helper form - for a single "basic" field (either day, hour, or minute).
 * Basically an input box, w/ a down-arrow adornment, and a popup when clicked
 * that has radio buttons and 1 or 2 select boxes.
 ***************************************************************************/
function SubForm({which, option, setOption, displayText, selectedValues, setSelectedValues, preOpen}: SubFormProps): JSX.Element
{
   const [popupAnchor, setPopupAnchor] = useState(null);
   const inputRef = useRef();

   const singularLabel = which == "day" ? "Day" : which == "hour" ? "Hour" : "Minute";
   const pluralLabel = which == "day" ? "Days" : which == "hour" ? "Hours" : "Minutes";


   /***************************************************************************
    * event handler for click on the text box - to open the popup
    ***************************************************************************/
   function doOpen(event: React.MouseEvent)
   {
      preOpen?.();
      setPopupAnchor(event.currentTarget);
   }


   /***************************************************************************
    * callback from the popup to close itself
    ***************************************************************************/
   function doClose()
   {
      setPopupAnchor(null);
   }


   /***************************************************************************
    * event handler for a radio option being selected.
    * pass option to parent
    ***************************************************************************/
   function handleSelectRadioOpton(event: React.ChangeEvent<{}>, newValue: string)
   {
      setOption(newValue as Option);
   }


   /***************************************************************************
    * event handler for the select boxes.
    * pass values to parent.
    ***************************************************************************/
   function handleNewSelectedValues(newValue: any)
   {
      if (!newValue)
      {
         setSelectedValues([]);
      }
      else
      {
         const newValueIds: string[] = [];
         for (let value of newValue)
         {
            newValueIds.push(String(value.id));
         }
         setSelectedValues(newValueIds);
      }
   }


   /***************************************************************************
    * build a FieldPossibleValueProps to drive the DynamicSelect components.
    ***************************************************************************/
   function makePossibleValueProps(name: string): FieldPossibleValueProps
   {
      return {
         isPossibleValue: true,
         possibleValues: [],
         initialDisplayValue: "",
         fieldName: name,
         possibleValueSourceName: name
      };
   }


   ////////////////////////////////////////////////////////////////////////////////////////////////////////
   // define the possible value properties, and their available values, for the DynamicSelect components //
   ////////////////////////////////////////////////////////////////////////////////////////////////////////
   const weekdaysPV: FieldPossibleValueProps = makePossibleValueProps("weekdays");
   weekdaysPV.possibleValues.push(new QPossibleValue({id: "Sun", label: "Sunday"}));
   weekdaysPV.possibleValues.push(new QPossibleValue({id: "Mon", label: "Monday"}));
   weekdaysPV.possibleValues.push(new QPossibleValue({id: "Tue", label: "Tuesday"}));
   weekdaysPV.possibleValues.push(new QPossibleValue({id: "Wed", label: "Wednesday"}));
   weekdaysPV.possibleValues.push(new QPossibleValue({id: "Thu", label: "Thursday"}));
   weekdaysPV.possibleValues.push(new QPossibleValue({id: "Fri", label: "Friday"}));
   weekdaysPV.possibleValues.push(new QPossibleValue({id: "Sat", label: "Saturday"}));

   const datesPV: FieldPossibleValueProps = makePossibleValueProps("dates");
   for (let i = 1; i <= 31; i++)
   {
      datesPV.possibleValues.push(new QPossibleValue({id: String(i), label: dateNumberToDisplayString(i)}));
   }

   const hoursPV: FieldPossibleValueProps = makePossibleValueProps("hours");
   for (let i = 0; i <= 23; i++)
   {
      hoursPV.possibleValues.push(new QPossibleValue({id: String(i), label: hourNumberToDisplayString(i)}));
   }

   const minutesPV: FieldPossibleValueProps = makePossibleValueProps("minutes");
   for (let i = 0; i <= 59; i++)
   {
      minutesPV.possibleValues.push(new QPossibleValue({id: String(i), label: minuteNumberToDisplayString(i)}));
   }

   let activePossibleValues: QPossibleValue[] = null;
   switch (option)
   {
      case "selectedWeekdays":
         activePossibleValues = weekdaysPV.possibleValues;
         break;
      case "selectedDates":
         activePossibleValues = datesPV.possibleValues;
         break;
      case "selectedHours":
         activePossibleValues = hoursPV.possibleValues;
         break;
      case "selectedMinutes":
         activePossibleValues = minutesPV.possibleValues;
         break;
   }

   let initialValues: QPossibleValue[] = [];
   if (activePossibleValues)
   {
      for (let value of selectedValues ?? [])
      {
         let possibleValue = activePossibleValues.find(pv => pv.id == value);
         if (possibleValue)
         {
            initialValues.push(possibleValue);
         }
      }
   }

   const textFieldSx =
      {
         "& .MuiInputBase-root": {cursor: "pointer"},
         "& .MuiOutlinedInput-root": {borderRadius: "0.75rem"},
         "& .MuiOutlinedInput-input": {cursor: "pointer", fontSize: "1rem", padding: "0.5rem"},
         "& .MuiIcon-root": {fontSize: "1.5rem !important", fontFamily: "'Material Icons'", color: "rgba(0, 0, 0, 0.54)"},
      };

   //@ts-ignore inputRef.current
   const menuWidth = inputRef.current ? (inputRef.current.offsetWidth + 40) : undefined;

   const boxSx = {
      "& .MuiAutocomplete-tag": {color: "#191919", background: "none", border: "1px solid gray"},
      "& .MuiAutocomplete-tag .MuiSvgIcon-root": {color: "gray !important"},
   };

   return (
      <Box>
         <TextField id={which} inputRef={inputRef} variant="outlined" value={displayText} fullWidth sx={textFieldSx} InputProps={{readOnly: true, endAdornment: (<Icon>{popupAnchor ? "arrow_drop_up" : "arrow_drop_down"}</Icon>)}} onClick={doOpen} style={{marginBottom: "12px"}}></TextField>
         <Popover
            anchorEl={popupAnchor}
            anchorOrigin={{vertical: "top", horizontal: "left"}}
            transformOrigin={{vertical: "top", horizontal: "left"}}
            open={Boolean(popupAnchor)}
            onClose={() => doClose()}
            PaperProps={{style: {width: menuWidth, minWidth: 240, backgroundColor: "white", border: "1px solid lightgray", borderRadius: "0.75rem"}}}
         >
            <Box sx={boxSx}>
               <RadioGroup value={option} onChange={handleSelectRadioOpton} sx={{px: 2}}>

                  {
                     (which == "hour" || which == "minute") &&
                     <>
                        <FormControlLabel value={which == "hour" ? "selectedHours" : "selectedMinutes"} control={<Radio />} label={`Selected ${pluralLabel}`} />
                        {option == (which == "hour" ? "selectedHours" : "selectedMinutes") && <DynamicSelect
                           name={which == "hour" ? "selectedHours" : "selectedMinutes"}
                           fieldLabel=""
                           fieldPossibleValueProps={which == "hour" ? hoursPV : minutesPV}
                           useCase="form"
                           inForm={true}
                           variant="outlined"
                           onChange={(newValue: any) => handleNewSelectedValues(newValue)}
                           isMultiple={true}
                           limitTags={100}
                           initialValues={initialValues}
                        />}
                     </>
                  }

                  {
                     which == "day" &&
                     <>
                        <FormControlLabel value="selectedWeekdays" control={<Radio />} label={"Selected Weekdays"} />
                        {option == "selectedWeekdays" && <DynamicSelect
                           name="selectedWeekdays"
                           fieldLabel=""
                           fieldPossibleValueProps={weekdaysPV}
                           useCase="form"
                           inForm={true}
                           variant="outlined"
                           onChange={(newValue: any) => handleNewSelectedValues(newValue)}
                           isMultiple={true}
                           limitTags={100}
                           initialValues={initialValues}
                        />}

                        <FormControlLabel value="selectedDates" control={<Radio />} label={"Selected Dates"} />
                        {option == "selectedDates" && <DynamicSelect
                           name="selectedDates"
                           fieldLabel=""
                           fieldPossibleValueProps={datesPV}
                           useCase="form"
                           inForm={true}
                           variant="outlined"
                           onChange={(newValue: any) => handleNewSelectedValues(newValue)}
                           isMultiple={true}
                           limitTags={100}
                           initialValues={initialValues}
                        />}
                     </>
                  }

                  <FormControlLabel value="every" control={<Radio />} label={`Every ${singularLabel}`} />
               </RadioGroup>
            </Box>
         </Popover>
      </Box>
   );
}


/***************************************************************************
 * define the weekdays as number, short string, and full string
 ***************************************************************************/
interface Weekday
{
   short: string;
   full: string;
   number: string;
}

const WEEKDAYS: Record<string, Weekday> =
   {
      "1": {short: "Sun", full: "Sunday", number: "1"},
      "2": {short: "Mon", full: "Monday", number: "2"},
      "3": {short: "Tue", full: "Tuesday", number: "3"},
      "4": {short: "Wed", full: "Wednesday", number: "4"},
      "5": {short: "Thu", full: "Thursday", number: "5"},
      "6": {short: "Fri", full: "Friday", number: "6"},
      "7": {short: "Sat", full: "Saturday", number: "7"}
   };


/***************************************************************************
 * convert a number (either as string or int) to Weekday object
 ***************************************************************************/
function weekdayFromNumber(n: string | number): Weekday | null
{
   return WEEKDAYS[String(n)] ?? null;
}


/***************************************************************************
 * convert a string to a weekday, matching on short name, case-insensitive
 ***************************************************************************/
function weekdayFromShortName(shortName: string): Weekday | null
{
   if (shortName)
   {
      for (let key in WEEKDAYS)
      {
         if (WEEKDAYS[key].short.toLowerCase() == shortName.toLowerCase())
         {
            return WEEKDAYS[key];
         }
      }
   }

   return (null);
}


/***************************************************************************
 * get a Weekday object from a string, which could be number ("3"), or
 * name (short or full - will substring to 3
 ***************************************************************************/
function weekdayFromString(s: string): Weekday | null
{
   if (s.length > 3)
   {
      s = s.substring(0, 3);
   }
   return weekdayFromNumber(s) ?? weekdayFromShortName(s) ?? null;
}


/***************************************************************************
 * convert an hour number to, e.g., "12am", "1pm"
 ***************************************************************************/
function hourNumberToDisplayString(hour: number): string
{
   return `${hour == 0 ? 12 : hour <= 12 ? hour : hour - 12}${hour < 12 ? "am" : "pm"}`;
}


/***************************************************************************
 * convert a minute number to, e.g., "00", "59"
 ***************************************************************************/
function minuteNumberToDisplayString(minute: number): string
{
   return `${minute < 10 ? "0" : ""}${minute}`;
}


/***************************************************************************
 * convert a date (of month) number to, e.g., 1st, 11th, 22nd
 ***************************************************************************/
function dateNumberToDisplayString(date: number): string
{
   if (date % 10 == 1 && date != 11)
   {
      return `${date}st`;
   }
   else if (date % 10 == 2 && date != 12)
   {
      return `${date}nd`;
   }
   else if (date % 10 == 3)
   {
      return `${date}rd`;
   }
   else
   {
      return `${date}th`;
   }
}