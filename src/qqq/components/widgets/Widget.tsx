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

import {CSSProperties} from "@mui/system/CSSProperties";
import {QTableMetaData} from "@qrunio/qqq-frontend-core/lib/model/metaData/QTableMetaData";
import {QWidgetMetaData} from "@qrunio/qqq-frontend-core/lib/model/metaData/QWidgetMetaData";
import {Box, InputLabel} from "@mui/material";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";
import Switch from "@mui/material/Switch";
import Tooltip from "@mui/material/Tooltip/Tooltip";
import Typography from "@mui/material/Typography";
import parse from "html-react-parser";
import QContext from "QContext";
import colors from "qqq/assets/theme/base/colors";
import HelpContent, {hasHelpContent} from "qqq/components/misc/HelpContent";
import WidgetDropdownMenu, {DropdownOption} from "qqq/components/widgets/components/WidgetDropdownMenu";
import {WidgetUtils} from "qqq/components/widgets/WidgetUtils";
import HtmlUtils from "qqq/utils/HtmlUtils";
import {resolveAssetUrl} from "qqq/utils/PathUtils";
import React, {useContext, useEffect, useState} from "react";
import {NavigateFunction, useNavigate} from "react-router-dom";

export interface WidgetData
{
   label?: string;
   dropdownLabelList?: string[];
   dropdownNameList?: string[];
   dropdownDataList?: {
      id: string,
      label: string
   }[][];
   dropdownDefaultValueList?: string[];
   dropdownNeedsSelectedText?: string;
   hasPermission?: boolean;
   errorLoading?: boolean;

   [other: string]: any;
}


interface Props
{
   labelAdditionalComponentsLeft: LabelComponent[];
   labelAdditionalElementsLeft: JSX.Element[];
   labelAdditionalComponentsRight: LabelComponent[];
   labelAdditionalElementsRight: JSX.Element[];
   labelBoxAdditionalSx?: any;
   widgetMetaData?: QWidgetMetaData;
   widgetData?: WidgetData;
   children: JSX.Element;
   reloadWidgetCallback?: (params: string) => void;
   showReloadControl: boolean;
   isChild?: boolean;
   footerHTML?: string;
   storeDropdownSelections?: boolean;
   omitPadding: boolean;
   omitLabel: boolean;
   additionalCSS: CSSProperties;
}

Widget.defaultProps = {
   isChild: false,
   showReloadControl: true,
   widgetMetaData: {},
   widgetData: {},
   labelAdditionalComponentsLeft: [],
   labelAdditionalElementsLeft: [],
   labelAdditionalComponentsRight: [],
   labelAdditionalElementsRight: [],
   labelBoxAdditionalSx: {},
   omitPadding: false,
   omitLabel: false,
   additionalCSS: {},
};


interface LabelComponentRenderArgs
{
   navigate: NavigateFunction;
   widgetProps: Props;
   dropdownData: any[];
   componentIndex: number;
   reloadFunction: () => void;
}


export class LabelComponent
{
   render = (args: LabelComponentRenderArgs): JSX.Element => 
   {
      return (<div>Unsupported component type</div>);
   };
}


/*******************************************************************************
 **
 *******************************************************************************/
export class HeaderIcon extends LabelComponent
{
   iconName: string;
   iconPath: string;
   color: string;
   coloredBG: boolean;
   role: string;

   iconColor: string;
   bgColor: string;

   constructor(iconName: string, iconPath: string, color: string, role?: string, coloredBG: boolean = true)
   {
      super();
      this.iconName = iconName;
      this.iconPath = iconPath;
      this.color = color;
      this.role = role;
      this.coloredBG = coloredBG;

      this.iconColor = this.coloredBG ? "#FFFFFF" : this.color;
      this.bgColor = this.coloredBG ? this.color : "none";
   }


   render = (args: LabelComponentRenderArgs): JSX.Element => 
   {
      const styles: any = {
         width: "1.75rem",
         height: "1.75rem",
         color: this.iconColor,
         backgroundColor: this.bgColor,
         borderRadius: "0.25rem"
      };

      if (this.role == "topLeftInsideCard")
      {
         styles["order"] = -1;
         styles["marginRight"] = "0.5rem";
      }

      if (this.iconPath)
      {
         return (<Box sx={{textAlign: "center", ...styles}}><img src={resolveAssetUrl(this.iconPath)} width="16" height="16" onError={(e: any) => 
         {
            e.target.style.display = "none";
         }} /></Box>);
      }
      else
      {
         return (<Icon sx={{padding: "0.25rem", ...styles}} fontSize="small">{this.iconName}</Icon>);
      }
   };
}


/*******************************************************************************
 ** a link (actually a button) for in a widget's header
 *******************************************************************************/
interface HeaderLinkButtonComponentProps
{
   label: string;
   onClickCallback: () => void;
   disabled?: boolean;
   disabledTooltip?: string;
   className?: string;
}

HeaderLinkButtonComponent.defaultProps = {
   disabled: false,
   disabledTooltip: null
};

export function HeaderLinkButtonComponent({label, onClickCallback, disabled, disabledTooltip, className}: HeaderLinkButtonComponentProps): JSX.Element
{
   return (
      <Tooltip title={disabledTooltip} className={className}>
         <span>
            <Button disabled={disabled} onClick={() => onClickCallback()} sx={{p: 0}} disableRipple>
               <Typography display="inline" textTransform="none" fontSize={"1.125rem"}>
                  {label}
               </Typography>
            </Button>
         </span>
      </Tooltip>
   );
}


/*******************************************************************************
 **
 *******************************************************************************/
interface HeaderToggleComponentProps
{
   label: string;
   getValue: () => boolean;
   onClickCallback: () => void;
   disabled?: boolean;
   disabledTooltip?: string;
}

HeaderToggleComponent.defaultProps = {
   disabled: false,
   disabledTooltip: null
};

export function HeaderToggleComponent({label, getValue, onClickCallback, disabled, disabledTooltip}: HeaderToggleComponentProps): JSX.Element
{
   const onClick = () => 
   {
      onClickCallback();
   };

   return (
      <Box alignItems="baseline" mr="-0.75rem">
         <Tooltip title={disabledTooltip}>
            <span>
               <InputLabel sx={{fontSize: "1.125rem", px: "0 !important", cursor: disabled ? "default" : "pointer", opacity: disabled ? 0.65 : 1}} unselectable="on">
                  {label} <Switch disabled={disabled} checked={getValue()} onClick={onClick} />
               </InputLabel>
            </span>
         </Tooltip>
      </Box>
   );
}


/*******************************************************************************
 **
 *******************************************************************************/
export class AddNewRecordButton extends LabelComponent
{
   table: QTableMetaData;
   label: string;
   defaultValues: any;
   disabledFields: any;
   addNewRecordCallback?: () => void;


   constructor(table: QTableMetaData, defaultValues: any, label: string = "Add new", disabledFields: any = defaultValues, addNewRecordCallback?: () => void)
   {
      super();
      this.table = table;
      this.label = label;
      this.defaultValues = defaultValues;
      this.disabledFields = disabledFields;
      this.addNewRecordCallback = addNewRecordCallback;
   }

   openEditForm = (navigate: any, table: QTableMetaData, id: any = null, defaultValues: any, disabledFields: any) => 
   {
      navigate(`#/createChild=${table.name}/defaultValues=${JSON.stringify(defaultValues)}/disabledFields=${JSON.stringify(disabledFields)}`);
   };

   render = (args: LabelComponentRenderArgs): JSX.Element => 
   {
      return (
         <Typography variant="body2" p={2} pr={0} display="inline" position="relative" top="-0.5rem">
            <Button sx={{mt: 0.75}} onClick={() => this.addNewRecordCallback ? this.addNewRecordCallback() : this.openEditForm(args.navigate, this.table, null, this.defaultValues, this.disabledFields)}>{this.label}</Button>
         </Typography>
      );
   };
}


/*******************************************************************************
 **
 *******************************************************************************/
export class Dropdown extends LabelComponent
{
   label: string;
   dropdownMetaData: any;
   options: DropdownOption[];
   dropdownDefaultValue?: string;
   dropdownName: string;
   onChangeCallback: any;

   constructor(label: string, dropdownMetaData: any, options: DropdownOption[], dropdownDefaultValue: string, dropdownName: string, onChangeCallback: any)
   {
      super();
      this.label = label;
      this.dropdownMetaData = dropdownMetaData;
      this.options = options;
      this.dropdownDefaultValue = dropdownDefaultValue;
      this.dropdownName = dropdownName;
      this.onChangeCallback = onChangeCallback;
   }

   render = (args: LabelComponentRenderArgs): JSX.Element => 
   {
      const label = `Select ${this.label}`;
      let defaultValue = null;
      const localStorageKey = `${WIDGET_DROPDOWN_SELECTION_LOCAL_STORAGE_KEY_ROOT}.${args.widgetProps.widgetMetaData.name}.${this.dropdownName}`;
      if (args.widgetProps.storeDropdownSelections)
      {
         ////////////////////////////////////////////////////////////////////////////////////////////
         // see if an existing value is stored in local storage, and if so set it in dropdown      //
         // originally we used the full object from localStorage - but - in case the label         //
         // changed since it was stored, we'll instead just find the option by id (or in case that //
         // option isn't available anymore, then we'll select nothing instead of a missing value   //
         ////////////////////////////////////////////////////////////////////////////////////////////
         try
         {
            const localStorageOption = JSON.parse(localStorage.getItem(localStorageKey));
            if (localStorageOption)
            {
               const id = localStorageOption.id;

               if (this.dropdownMetaData.type == "DATE_PICKER")
               {
                  defaultValue = id;
               }
               else
               {
                  for (let i = 0; i < this.options.length; i++)
                  {
                     if (this.options[i].id == id)
                     {
                        defaultValue = this.options[i];
                        args.dropdownData[args.componentIndex] = defaultValue?.id;
                     }
                  }
               }
            }
         }
         catch (e)
         {
            console.log(`Error getting default value for dropdown [${this.dropdownName}] from local storage`, e);
         }
      }

      /////////////////////////////////////////////////////////////////////////////////////////////
      // if there wasn't a value selected, but there is a default from the backend, then use it. //
      /////////////////////////////////////////////////////////////////////////////////////////////
      if (defaultValue == null && this.dropdownDefaultValue != null)
      {
         for (let i = 0; i < this.options.length; i++)
         {
            if (this.options[i].id == this.dropdownDefaultValue)
            {
               defaultValue = this.options[i];
               args.dropdownData[args.componentIndex] = defaultValue?.id;

               if (args.widgetProps.storeDropdownSelections)
               {
                  localStorage.setItem(localStorageKey, JSON.stringify(defaultValue));
               }

               this.onChangeCallback(label, defaultValue);
               break;
            }
         }
      }

      /////////////////////////////////////////////////////////////////////////////
      // if there's a 'label for null value' (and no default from the backend),  //
      // then add that as an option (and select it if nothing else was selected) //
      /////////////////////////////////////////////////////////////////////////////
      let options = this.options;
      if (this.dropdownMetaData.labelForNullValue && !this.dropdownDefaultValue)
      {
         const nullOption = {id: null as string, label: this.dropdownMetaData.labelForNullValue};
         options = [nullOption, ...this.options];

         if (!defaultValue)
         {
            defaultValue = nullOption;
         }
      }

      return (
         <Box mb={2} sx={{float: "right"}}>
            <WidgetDropdownMenu
               name={this.dropdownName}
               type={this.dropdownMetaData.type}
               defaultValue={defaultValue}
               sx={{marginLeft: "1rem"}}
               label={label}
               startIcon={this.dropdownMetaData.startIconName}
               allowBackAndForth={this.dropdownMetaData.allowBackAndForth}
               backAndForthInverted={this.dropdownMetaData.backAndForthInverted}
               disableClearable={this.dropdownMetaData.disableClearable}
               dropdownOptions={options}
               onChangeCallback={this.onChangeCallback}
               width={this.dropdownMetaData.width ?? 225}
            />
         </Box>
      );
   };
}


/*******************************************************************************
 **
 *******************************************************************************/
export class ReloadControl extends LabelComponent
{
   callback: () => void;

   constructor(callback: () => void)
   {
      super();
      this.callback = callback;
   }

   render = (args: LabelComponentRenderArgs): JSX.Element => 
   {
      return (<Typography key={1} variant="body2" py={0} px={0} display="inline" position="relative" top="-0.25rem">
         <Tooltip title="Refresh">
            <Button sx={{px: 1, py: 0, minWidth: "initial"}} onClick={() => this.callback()}>
               <Icon sx={{color: colors.gray.main, fontSize: 1.125}}>refresh</Icon>
            </Button>
         </Tooltip>
      </Typography>);
   };
}


export const WIDGET_DROPDOWN_SELECTION_LOCAL_STORAGE_KEY_ROOT = "qqq.widgets.dropdownData";


/*******************************************************************************
 **
 *******************************************************************************/
function Widget(props: React.PropsWithChildren<Props>): JSX.Element
{
   const navigate = useNavigate();
   const [dropdownData, setDropdownData] = useState([]);
   const [reloading, setReloading] = useState(false);
   const [dropdownDataJSON, setDropdownDataJSON] = useState("");
   const [labelComponentsLeft, setLabelComponentsLeft] = useState([] as LabelComponent[]);
   const [labelComponentsRight, setLabelComponentsRight] = useState([] as LabelComponent[]);

   ////////////////////////////////////////////////////////////////////////////////////////////////////////
   // support for using widget (data) label as page header, w/o it disappearing if dropdowns are changed //
   ////////////////////////////////////////////////////////////////////////////////////////////////////////
   const [lastSeenLabel, setLastSeenLabel] = useState("");
   const [usingLabelAsTitle, setUsingLabelAsTitle] = useState(false);

   const {helpHelpActive} = useContext(QContext);

   function renderComponent(component: LabelComponent, componentIndex: number)
   {
      if (component && component.render)
      {
         return component.render({navigate: navigate, widgetProps: props, dropdownData: dropdownData, componentIndex: componentIndex, reloadFunction: doReload});
      }
      else
      {
         console.log("Request to render a null component or component without a render function...");
         console.log(JSON.stringify(component));
         return (<></>);
      }
   }

   useEffect(() => 
   {
      ////////////////////////////////////////////////////////////////////////////////
      // for initial render, put left-components from props into the state variable //
      // plus others we can infer from other props                                  //
      ////////////////////////////////////////////////////////////////////////////////
      const stateLabelComponentsLeft: LabelComponent[] = [];
      if (props.reloadWidgetCallback && props.widgetData && props.showReloadControl && props.widgetMetaData.showReloadButton)
      {
         stateLabelComponentsLeft.push(new ReloadControl(doReload));
      }
      if (props.labelAdditionalComponentsLeft)
      {
         props.labelAdditionalComponentsLeft.map((component) => stateLabelComponentsLeft.push(component));
      }
      setLabelComponentsLeft(stateLabelComponentsLeft);
   }, []);

   useEffect(() => 
   {
      /////////////////////////////////////////////////////////////////////////////////
      // for initial render, put right-components from props into the state variable //
      /////////////////////////////////////////////////////////////////////////////////
      const stateLabelComponentsRight = [] as LabelComponent[];
      // console.log(`${props.widgetMetaData.name} initiating right-components`);
      if (props.labelAdditionalComponentsRight)
      {
         props.labelAdditionalComponentsRight.map((component) => stateLabelComponentsRight.push(component));
      }
      setLabelComponentsRight(stateLabelComponentsRight);
   }, []);

   //////////////////////////////////////////////////////////////////////////////////////////////////////////
   // if we have widgetData, and it has a dropdown list, capture that in a state variable, if it's changed //
   //////////////////////////////////////////////////////////////////////////////////////////////////////////
   if (props.widgetData && props.widgetData.dropdownDataList)
   {
      const currentDropdownDataJSON = JSON.stringify(props.widgetData.dropdownDataList);
      if (currentDropdownDataJSON !== dropdownDataJSON)
      {
         // console.log(`${props.widgetMetaData.name} we have (new) dropdown data!!: ${currentDropdownDataJSON}`);
         setDropdownDataJSON(currentDropdownDataJSON);
      }
   }

   useEffect(() => 
   {
      ///////////////////////////////////////////////////////////////////////////////////
      // if we've seen a change in the dropdown data, then update the right-components //
      ///////////////////////////////////////////////////////////////////////////////////
      // console.log(`${props.widgetMetaData.name} in useEffect post dropdownData change`);
      if (props.widgetData && props.widgetData.dropdownDataList)
      {
         const updatedStateLabelComponentsRight = JSON.parse(JSON.stringify(labelComponentsRight)) as LabelComponent[];
         props.widgetData.dropdownDataList?.map((dropdownData: any, index: number) => 
         {
            // console.log(`${props.widgetMetaData.name} building a Dropdown, data is: ${dropdownData}`);
            let defaultValue = null;
            if (props.widgetData.dropdownDefaultValueList && props.widgetData.dropdownDefaultValueList.length >= index)
            {
               defaultValue = props.widgetData.dropdownDefaultValueList[index];
            }
            if (props.widgetData?.dropdownLabelList && props.widgetData?.dropdownLabelList[index] && props.widgetMetaData?.dropdowns && props.widgetMetaData?.dropdowns[index] && props.widgetData?.dropdownNameList && props.widgetData?.dropdownNameList[index])
            {
               updatedStateLabelComponentsRight.push(new Dropdown(props.widgetData.dropdownLabelList[index], props.widgetMetaData.dropdowns[index], dropdownData, defaultValue, props.widgetData.dropdownNameList[index], handleDataChange));
            }
         });
         setLabelComponentsRight(updatedStateLabelComponentsRight);
      }
   }, [dropdownDataJSON]);

   const doReload = () => 
   {
      setReloading(true);
      reloadWidget(dropdownData);
   };

   useEffect(() => 
   {
      setReloading(false);
   }, [props.widgetData]);

   function handleDataChange(dropdownLabel: string, changedData: any)
   {
      if (dropdownData)
      {
         ///////////////////////////////////////////
         // find the index base on selected label //
         ///////////////////////////////////////////
         const tableName = dropdownLabel.replace("Select ", "");
         let dropdownName = "";
         let index = -1;
         for (let i = 0; i < props.widgetData.dropdownLabelList.length; i++)
         {
            if (tableName === props.widgetData.dropdownLabelList[i])
            {
               index = i;
               dropdownName = props.widgetData.dropdownNameList[i];
               break;
            }
         }

         if (index < 0)
         {
            throw (`Could not find table name for label ${tableName}`);
         }

         dropdownData[index] = (changedData) ? changedData.id : null;
         setDropdownData(dropdownData);

         /////////////////////////////////////////////////
         // if should store in local storage, do so now //
         // or remove if dropdown was cleared out       //
         /////////////////////////////////////////////////
         if (props.storeDropdownSelections)
         {
            if (changedData?.id)
            {
               localStorage.setItem(`${WIDGET_DROPDOWN_SELECTION_LOCAL_STORAGE_KEY_ROOT}.${props.widgetMetaData.name}.${dropdownName}`, JSON.stringify(changedData));
            }
            else
            {
               localStorage.removeItem(`${WIDGET_DROPDOWN_SELECTION_LOCAL_STORAGE_KEY_ROOT}.${props.widgetMetaData.name}.${dropdownName}`);
            }
         }

         reloadWidget(dropdownData);
      }
   }

   const reloadWidget = (dropdownData: any[]) => 
   {
      let params = "";
      for (let i = 0; i < dropdownData.length; i++)
      {
         if (i > 0)
         {
            params += "&";
         }
         params += `${props.widgetData.dropdownNameList[i]}=`;
         if (dropdownData[i])
         {
            params += `${dropdownData[i]}`;
         }
      }

      if (props.reloadWidgetCallback)
      {
         props.reloadWidgetCallback(params);
      }
      else
      {
         console.log(`No reload widget callback in ${props.widgetMetaData.label}`);
      }
   };

   const onExportClick = () => 
   {
      if (props.widgetData?.csvData)
      {
         const csv = WidgetUtils.widgetCsvDataToString(props.widgetData);
         const fileName = WidgetUtils.makeExportFileName(props.widgetData, props.widgetMetaData);
         HtmlUtils.download(fileName, csv);
      }
      else
      {
         alert("There is no data available to export.");
      }
   };

   ///////////////////////////////////////////////////////////////////////////////////////////////////////
   // add the export button to the label's left elements, if the meta-data says to show it              //
   // don't do this for 2 types which themselves add the button (and have custom code to do the export) //
   ///////////////////////////////////////////////////////////////////////////////////////////////////////
   let localLabelAdditionalElementsLeft = [...props.labelAdditionalElementsLeft];
   if (props.widgetMetaData?.showExportButton && props.widgetMetaData?.type !== "table" && props.widgetMetaData?.type !== "childRecordList")
   {
      if (!localLabelAdditionalElementsLeft)
      {
         localLabelAdditionalElementsLeft = [];
      }

      localLabelAdditionalElementsLeft.push(WidgetUtils.generateExportButton(onExportClick));
   }

   let localLabelAdditionalElementsRight = [...props.labelAdditionalElementsRight];

   const hasPermission = props.widgetData?.hasPermission === undefined || props.widgetData?.hasPermission === true;

   const isSet = (v: any): boolean => 
   {
      return (v !== null && v !== undefined);
   };

   /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
   // to avoid taking up the space of the Box with the label and icon and label-components (since it has a height), only output that box if we need any of the components //
   /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
   let needLabelBox = false;
   if (hasPermission)
   {
      needLabelBox ||= (labelComponentsLeft && labelComponentsLeft.length > 0);
      needLabelBox ||= (localLabelAdditionalElementsLeft && localLabelAdditionalElementsLeft.length > 0);
      needLabelBox ||= (labelComponentsRight && labelComponentsRight.length > 0);
      needLabelBox ||= (localLabelAdditionalElementsRight && localLabelAdditionalElementsRight.length > 0);
      needLabelBox ||= isSet(props.widgetData?.icon);
      needLabelBox ||= isSet(props.widgetData?.label);
      needLabelBox ||= isSet(props.widgetMetaData?.label);
   }

   //////////////////////////////////////////////////////////////////////////////////////////
   // first look for a label in the widget data, which would override that in the metadata //
   //////////////////////////////////////////////////////////////////////////////////////////
   const isParentWidget = props.widgetMetaData.type == "parentWidget"; // todo - do we need to know top-level parent, vs. a nested parent?
   let labelToUse = props.widgetData?.label ?? props.widgetMetaData?.label;

   if (!labelToUse)
   {
      /////////////////////////////////////////////////////////////////////////////////////////////
      // prevent the label from disappearing, especially when it's being used as the page header //
      /////////////////////////////////////////////////////////////////////////////////////////////
      if (lastSeenLabel && isParentWidget && usingLabelAsTitle)
      {
         labelToUse = lastSeenLabel;
      }
   }

   let labelElement = (
      <Typography sx={{cursor: "default", pl: "auto", fontWeight: 600}} variant={isParentWidget && (props.widgetData.isLabelPageTitle || usingLabelAsTitle) ? "h3" : "h6"} display="inline">
         {labelToUse}
      </Typography>
   );

   let sublabelElement = (
      <Box key="sublabel" height="20px">
         <Typography sx={{position: "relative", top: "-18px"}} variant="caption">
            {props.widgetData?.sublabel}
         </Typography>
      </Box>
   );

   if (labelToUse && labelToUse != lastSeenLabel)
   {
      setLastSeenLabel(labelToUse);
      setUsingLabelAsTitle(props.widgetData.isLabelPageTitle);
   }

   const helpRoles = ["ALL_SCREENS"];
   const slotName = "label";
   const showHelp = helpHelpActive || hasHelpContent(props.widgetMetaData?.helpContent?.get(slotName), helpRoles);

   if (showHelp)
   {
      const formattedHelpContent = <HelpContent helpContents={props.widgetMetaData?.helpContent?.get(slotName)} roles={helpRoles} helpContentKey={`widget:${props.widgetMetaData?.name};slot:${slotName}`} />;
      labelElement = <Tooltip title={formattedHelpContent} arrow={true} placement="bottom-start">{labelElement}</Tooltip>;
   }
   else if (props.widgetMetaData?.tooltip)
   {
      labelElement = <Tooltip title={props.widgetMetaData.tooltip} arrow={true} placement="bottom-start">{labelElement}</Tooltip>;
   }

   const isTable = props.widgetMetaData.type == "table";

   const errorLoading = props.widgetData?.errorLoading !== undefined && props.widgetData?.errorLoading === true;
   const widgetContent =
      <Box sx={{width: "100%", height: "100%", minHeight: props.widgetMetaData?.minHeight ? props.widgetMetaData?.minHeight : "initial"}}>
         {
            needLabelBox &&
            <Box display="flex" justifyContent="space-between" alignItems="flex-start" sx={{width: "100%", ...props.labelBoxAdditionalSx}} minHeight={"2.5rem"} className="widgetLabelBox">
               <Box display="flex" flexDirection="column">
                  <Box display="flex" alignItems="baseline">
                     {
                        hasPermission ?
                           props.widgetMetaData?.icon && (
                              <Box ml={1} mr={2} mt={-4} sx={{
                                 display: "flex",
                                 justifyContent: "center",
                                 alignItems: "center",
                                 width: "64px",
                                 height: "64px",
                                 borderRadius: "8px",
                                 background: colors.info.main,
                                 color: "#ffffff",
                                 float: "left"
                              }}
                              >
                                 <Icon fontSize="medium" color="inherit">
                                    {props.widgetMetaData.icon}
                                 </Icon>
                              </Box>
                           ) :
                           (
                              <Box ml={3} mt={-4} sx={{
                                 display: "flex",
                                 justifyContent: "center",
                                 alignItems: "center",
                                 width: "64px",
                                 height: "64px",
                                 borderRadius: "8px",
                                 background: colors.info.main,
                                 color: "#ffffff",
                                 float: "left"
                              }}
                              >
                                 <Icon fontSize="medium" color="inherit">lock</Icon>
                              </Box>
                           )
                     }
                     {
                        hasPermission && labelToUse && !props.omitLabel && (labelElement)
                     }
                     {
                        hasPermission && (
                           labelComponentsLeft.map((component, i) => 
                           {
                              return (<React.Fragment key={i}>{renderComponent(component, i)}</React.Fragment>);
                           })
                        )
                     }
                     {localLabelAdditionalElementsLeft}
                  </Box>
                  <Box key="sublabelContainer" display="flex">
                     {
                        hasPermission && props.widgetData?.sublabel && (sublabelElement)
                     }
                  </Box>
               </Box>
               <Box>
                  {
                     hasPermission && (
                        labelComponentsRight.map((component, i) => 
                        {
                           return (<span key={i}>{renderComponent(component, i)}</span>);
                        })
                     )
                  }
                  {localLabelAdditionalElementsRight}
               </Box>
            </Box>
         }
         {
            ///////////////////////////////////////////////////////////////////
            // turning this off... for now.  maybe make a property in future //
            ///////////////////////////////////////////////////////////////////
            /*
            props.widgetMetaData?.isCard && (reloading ? <LinearProgress color="info" sx={{overflow: "hidden", borderRadius: "0", mx:-2}} /> : <Box height="0.375rem" />)
            */
         }
         {
            errorLoading ? (
               <Box pb={3} sx={{display: "flex", justifyContent: "center", alignItems: "flex-start"}}>
                  <Icon color="error">error</Icon>
                  <Typography sx={{paddingLeft: "4px", textTransform: "revert"}} variant="button">An error occurred loading widget content.</Typography>
               </Box>
            ) : (
               hasPermission && props.widgetData?.dropdownNeedsSelectedText ? (
                  <Box pb={3} sx={{width: "100%", textAlign: "right"}}>
                     <Typography variant="body2">
                        {props.widgetData?.dropdownNeedsSelectedText}
                     </Typography>
                  </Box>
               ) : (
                  hasPermission ? (
                     props.children
                  ) : (
                     <Box mt={2} mb={5} sx={{display: "flex", justifyContent: "center"}}><Typography variant="body2">You do not have permission to view this data.</Typography></Box>
                  )
               )
            )
         }
         {
            !errorLoading && props?.footerHTML && (
               <Box mt={isTable ? "36px" : 1} ml={isTable ? 0 : 3} mr={isTable ? 0 : 3} mb={isTable ? "-12px" : 2} sx={{fontWeight: 300, color: "#7b809a", display: "flex", alignContent: "flex-end", fontSize: "14px"}}>{parse(props.footerHTML)}</Box>
            )
         }
      </Box>;

   const padding = props.omitPadding ? "0px" : "24px 16px";

   ///////////////////////////////////////////////////
   // try to make tables fill their entire "parent" //
   ///////////////////////////////////////////////////
   let noCardMarginBottom = "unset";
   if (isTable)
   {
      noCardMarginBottom = "-8px";
   }

   return props.widgetMetaData?.isCard
      ? <Card sx={{marginTop: props.widgetMetaData?.icon ? 2 : 0, width: "100%", p: padding}} className="widget inCard">
         {widgetContent}
      </Card>
      : <span style={{width: "100%", padding: padding, marginBottom: noCardMarginBottom, ...props.additionalCSS}} className="widget noCard">{widgetContent}</span>;
}

export default Widget;
