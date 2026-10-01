/*
 * QQQ - Low-code Application Framework for Engineers.
 * Copyright (C) 2021-2024.  Kingsrook, LLC
 * 651 N Broad St Ste 205 # 6917 | Middletown DE 19709 | United States
 * contact@kingsrook.com
 * https://github.com/Kingsrook/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import FormControlLabel from "@mui/material/FormControlLabel";
import Icon from "@mui/material/Icon";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List/List";
import ListItem, {ListItemProps} from "@mui/material/ListItem/ListItem";
import Menu from "@mui/material/Menu";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip/Tooltip";
import React, {useState} from "react";

export type Option = { label: string, value: string | number, [key: string]: any }

export type Group = { label: string, value: string | number, options: Option[], subGroups?: Group[], [key: string]: any }

type StringOrNumber = string | number

interface QHierarchyAutoCompleteProps
{
   idPrefix: string;
   heading?: string;
   placeholder?: string;
   defaultGroup: Group;
   showGroupHeaderEvenIfNoSubGroups: boolean;
   optionValuesToHide?: StringOrNumber[];
   buttonProps: any;
   buttonChildren: JSX.Element | string;
   menuDirection: "down" | "up";

   isModeSelectOne?: boolean;
   keepOpenAfterSelectOne?: boolean;
   handleSelectedOption?: (option: Option, group: Group) => void;

   isModeToggle?: boolean;
   toggleStates?: { [optionValue: string]: boolean };
   disabledStates?: { [optionValue: string]: boolean };
   tooltips?: { [optionValue: string]: string };
   handleToggleOption?: (option: Option, group: Group, newValue: boolean) => void;

   optionEndAdornment?: JSX.Element;
   handleAdornmentClick?: (option: Option, group: Group, event: React.MouseEvent<any>) => void;
   forceRerender?: number
}

QHierarchyAutoComplete.defaultProps = {
   menuDirection: "down",
   showGroupHeaderEvenIfNoSubGroups: false,
   isModeSelectOne: false,
   keepOpenAfterSelectOne: false,
   isModeToggle: false,
};

interface GroupWithOptions
{
   group?: Group;
   options: Option[];
}


/***************************************************************************
 ** a sort of re-implementation of Autocomplete, that can display headers
 ** & children, which may be collapsable (Is that only for toggle mode?)
 ** but which also can have adornments that trigger actions, or be in a
 ** single-click-do-something mode.
 *
 ** Originally built just for fields  exposed on a table query screen, but
 ** then factored out of that for use in bulk-load (where it wasn't based on
 ** exposed joins).
 ***************************************************************************/
export default function QHierarchyAutoComplete({idPrefix, heading, placeholder, defaultGroup, showGroupHeaderEvenIfNoSubGroups, optionValuesToHide, buttonProps, buttonChildren, isModeSelectOne, keepOpenAfterSelectOne, isModeToggle, handleSelectedOption, toggleStates, disabledStates, tooltips, handleToggleOption, optionEndAdornment, handleAdornmentClick, menuDirection, forceRerender}: QHierarchyAutoCompleteProps): JSX.Element
{
   const [menuAnchorElement, setMenuAnchorElement] = useState(null);
   const [searchText, setSearchText] = useState("");
   const [focusedIndex, setFocusedIndex] = useState(null as number);

   const [optionsByGroup, setOptionsByGroup] = useState([] as GroupWithOptions[]);
   const [collapsedGroups, setCollapsedGroups] = useState({} as { [groupValue: string | number]: boolean });

   const [lastMouseOverXY, setLastMouseOverXY] = useState({x: 0, y: 0});
   const [timeOfLastArrow, setTimeOfLastArrow] = useState(0);

   //////////////////
   // check usages //
   //////////////////
   if(isModeSelectOne)
   {
      if(!handleSelectedOption)
      {
         throw("In QAutoComplete, if isModeSelectOne=true, then a callback for handleSelectedOption must be provided.");
      }
   }

   if(isModeToggle)
   {
      if(!toggleStates)
      {
         throw("In QAutoComplete, if isModeToggle=true, then a model for toggleStates must be provided.");
      }
      if(!handleToggleOption)
      {
         throw("In QAutoComplete, if isModeToggle=true, then a callback for handleToggleOption must be provided.");
      }
   }

   /////////////////////
   // init some stuff //
   /////////////////////
   if (optionsByGroup.length == 0)
   {
      collapsedGroups[defaultGroup.value] = false;

      if (defaultGroup.subGroups?.length > 0)
      {
         /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
         // if we have exposed joins, put the table meta data with its fields, and then all of the join tables & fields too //
         /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
         optionsByGroup.push({group: defaultGroup, options: getGroupOptionsAsAlphabeticalArray(defaultGroup)});

         for (let i = 0; i < defaultGroup.subGroups?.length; i++)
         {
            const subGroup = defaultGroup.subGroups[i];
            optionsByGroup.push({group: subGroup, options: getGroupOptionsAsAlphabeticalArray(subGroup)});

            collapsedGroups[subGroup.value] = false;
         }
      }
      else
      {
         ///////////////////////////////////////////////////////////
         // no exposed joins - just the table (w/o its meta-data) //
         ///////////////////////////////////////////////////////////
         optionsByGroup.push({options: getGroupOptionsAsAlphabeticalArray(defaultGroup)});
      }

      setOptionsByGroup(optionsByGroup);
      setCollapsedGroups(collapsedGroups);
   }


   /*******************************************************************************
    **
    *******************************************************************************/
   function getGroupOptionsAsAlphabeticalArray(group: Group): Option[]
   {
      const options: Option[] = [];
      group.options.forEach(option =>
      {
         let fullOptionValue = option.value;
         if(group.value != defaultGroup.value)
         {
            fullOptionValue = `${defaultGroup.value}.${option.value}`;
         }

         if(optionValuesToHide && optionValuesToHide.indexOf(fullOptionValue) > -1)
         {
            return;
         }
         options.push(option)
      });
      options.sort((a, b) => a.label.localeCompare(b.label));
      return (options);
   }


   const optionsByGroupToShow: GroupWithOptions[] = [];
   let maxOptionIndex = 0;
   optionsByGroup.forEach((groupWithOptions) =>
   {
      let optionsToShowForThisGroup = groupWithOptions.options.filter(doesOptionMatchSearchText);
      if (optionsToShowForThisGroup.length > 0)
      {
         optionsByGroupToShow.push({group: groupWithOptions.group, options: optionsToShowForThisGroup});
         maxOptionIndex += optionsToShowForThisGroup.length;
      }
   });


   /*******************************************************************************
    **
    *******************************************************************************/
   function doesOptionMatchSearchText(option: Option): boolean
   {
      if (searchText == "")
      {
         return (true);
      }

      const columnLabelMinusTable = option.label.replace(/.*: /, "");
      if (columnLabelMinusTable.toLowerCase().startsWith(searchText.toLowerCase()))
      {
         return (true);
      }

      try
      {
         ////////////////////////////////////////////////////////////
         // try to match word-boundary followed by the filter text //
         // e.g., "name" would match "First Name" or "Last Name"   //
         ////////////////////////////////////////////////////////////
         const re = new RegExp("\\b" + searchText.toLowerCase());
         if (columnLabelMinusTable.toLowerCase().match(re))
         {
            return (true);
         }
      }
      catch (e)
      {
         //////////////////////////////////////////////////////////////////////////////////
         // in case text is an invalid regex... well, at least do a starts-with match... //
         //////////////////////////////////////////////////////////////////////////////////
         if (columnLabelMinusTable.toLowerCase().startsWith(searchText.toLowerCase()))
         {
            return (true);
         }
      }

      const tableLabel = option.label.replace(/:.*/, "");
      if (tableLabel)
      {
         try
         {
            ////////////////////////////////////////////////////////////
            // try to match word-boundary followed by the filter text //
            // e.g., "name" would match "First Name" or "Last Name"   //
            ////////////////////////////////////////////////////////////
            const re = new RegExp("\\b" + searchText.toLowerCase());
            if (tableLabel.toLowerCase().match(re))
            {
               return (true);
            }
         }
         catch (e)
         {
            //////////////////////////////////////////////////////////////////////////////////
            // in case text is an invalid regex... well, at least do a starts-with match... //
            //////////////////////////////////////////////////////////////////////////////////
            if (tableLabel.toLowerCase().startsWith(searchText.toLowerCase()))
            {
               return (true);
            }
         }
      }

      return (false);
   }

   /*******************************************************************************
    **
    *******************************************************************************/
   function openMenu(event: any)
   {
      setFocusedIndex(null);
      setMenuAnchorElement(event.currentTarget);
      setTimeout(() =>
      {
         document.getElementById(`field-list-dropdown-${idPrefix}-textField`).focus();
         doSetFocusedIndex(0, true);
      });
   }


   /*******************************************************************************
    **
    *******************************************************************************/
   function closeMenu()
   {
      setMenuAnchorElement(null);
   }


   /*******************************************************************************
    ** Event handler for toggling an option in toggle mode
    *******************************************************************************/
   function handleOptionToggle(event: React.ChangeEvent<HTMLInputElement>, option: Option, group: Group)
   {
      event.stopPropagation();
      handleToggleOption(option, group, event.target.checked);
   }


   /*******************************************************************************
    ** Event handler for toggling a group in toggle mode
    *******************************************************************************/
   function handleGroupToggle(event: React.ChangeEvent<HTMLInputElement>, group: Group)
   {
      event.stopPropagation();

      const optionsList = [...group.options.values()];
      for (let i = 0; i < optionsList.length; i++)
      {
         const option = optionsList[i];
         if (doesOptionMatchSearchText(option))
         {
            handleToggleOption(option, group, event.target.checked);
         }
      }
   }


   /*******************************************************************************
    **
    *******************************************************************************/
   function toggleCollapsedGroup(value: string | number)
   {
      collapsedGroups[value] = !collapsedGroups[value];
      setCollapsedGroups(Object.assign({}, collapsedGroups));
   }

   /*******************************************************************************
    **
    *******************************************************************************/
   function getShownOptionAndGroupByIndex(targetIndex: number): { option: Option, group: Group }
   {
      let index = -1;
      for (let i = 0; i < optionsByGroupToShow.length; i++)
      {
         const groupWithOption = optionsByGroupToShow[i];
         for (let j = 0; j < groupWithOption.options.length; j++)
         {
            index++;

            if (index == targetIndex)
            {
               return {option: groupWithOption.options[j], group: groupWithOption.group};
            }
         }
      }

      return (null);
   }


   /*******************************************************************************
    ** event handler for keys presses
    *******************************************************************************/
   function keyDown(event: any)
   {
      // console.log(`Event key: ${event.key}`);
      setTimeout(() => document.getElementById(`field-list-dropdown-${idPrefix}-textField`).focus());

      if (isModeSelectOne && event.key == "Enter" && focusedIndex != null)
      {
         setTimeout(() =>
         {
            event.stopPropagation();

            const {option, group} = getShownOptionAndGroupByIndex(focusedIndex);
            if (option)
            {
               const fullOptionValue = group && group.value != defaultGroup.value ? `${group.value}.${option.value}` : option.value;
               const isDisabled = disabledStates && disabledStates[fullOptionValue]
               if(isDisabled)
               {
                  return;
               }

               if(!keepOpenAfterSelectOne)
               {
                  closeMenu();
               }

               handleSelectedOption(option, group ?? defaultGroup);

            }
         });
         return;
      }

      const keyOffsetMap: { [key: string]: number } = {
         "End": 10000,
         "Home": -10000,
         "ArrowDown": 1,
         "ArrowUp": -1,
         "PageDown": 5,
         "PageUp": -5,
      };

      const offset = keyOffsetMap[event.key];
      if (offset)
      {
         event.stopPropagation();
         setTimeOfLastArrow(new Date().getTime());

         if (isModeSelectOne)
         {
            let startIndex = focusedIndex;
            if (offset > 0)
            {
               /////////////////
               // a down move //
               /////////////////
               if (startIndex == null)
               {
                  startIndex = -1;
               }

               let goalIndex = startIndex + offset;
               if (goalIndex > maxOptionIndex - 1)
               {
                  goalIndex = maxOptionIndex - 1;
               }

               doSetFocusedIndex(goalIndex, true);
            }
            else
            {
               ////////////////
               // an up move //
               ////////////////
               let goalIndex = startIndex + offset;
               if (goalIndex < 0)
               {
                  goalIndex = 0;
               }

               doSetFocusedIndex(goalIndex, true);
            }
         }
      }
   }


   /*******************************************************************************
    **
    *******************************************************************************/
   function doSetFocusedIndex(i: number, tryToScrollIntoView: boolean): void
   {
      if (isModeSelectOne)
      {
         setFocusedIndex(i);
         console.log(`Setting index to ${i}`);

         if (tryToScrollIntoView)
         {
            const element = document.getElementById(`field-list-dropdown-${idPrefix}-${i}`);
            element?.scrollIntoView({block: "center"});
         }
      }
   }


   /*******************************************************************************
    **
    *******************************************************************************/
   function setFocusedOption(option: Option, group: Group, tryToScrollIntoView: boolean)
   {
      let index = -1;
      for (let i = 0; i < optionsByGroupToShow.length; i++)
      {
         const groupWithOption = optionsByGroupToShow[i];
         for (let j = 0; j < groupWithOption.options.length; j++)
         {
            const loopOption = groupWithOption.options[j];
            index++;

            const groupMatches = (group == null || group.value == groupWithOption.group.value);
            if (groupMatches && option.value == loopOption.value)
            {
               doSetFocusedIndex(index, tryToScrollIntoView);
               return;
            }
         }
      }
   }


   /*******************************************************************************
    ** event handler for mouse-over the menu
    *******************************************************************************/
   function handleMouseOver(event: React.MouseEvent<HTMLAnchorElement> | React.MouseEvent<HTMLDivElement> | React.MouseEvent<HTMLLIElement>, option: Option, group: Group, isDisabled: boolean)
   {
      //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
      // so we're trying to fix the case where, if you put your mouse over an element, but then press up/down arrows,                                     //
      // where the mouse will become over a different element after the scroll, and the focus will follow the mouse instead of keyboard.                  //
      // the last x/y isn't really useful, because the mouse generally isn't left exactly where it was when the mouse-over happened (edge of the element) //
      // but the keyboard last-arrow time that we capture, that's what's actually being useful in here                                                    //
      //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
      if (event.clientX == lastMouseOverXY.x && event.clientY == lastMouseOverXY.y)
      {
         // console.log("mouse didn't move, so, doesn't count");
         return;
      }

      const now = new Date().getTime();
      // console.log(`Compare now [${now}] to last arrow [${timeOfLastArrow}] (diff: [${now - timeOfLastArrow}])`);
      if (now < timeOfLastArrow + 300)
      {
         // console.log("An arrow event happened less than 300 mills ago, so doesn't count.");
         return;
      }

      // console.log("yay, mouse over...");
      if(isDisabled)
      {
         setFocusedIndex(null);
      }
      else
      {
         setFocusedOption(option, group, false);
      }
      setLastMouseOverXY({x: event.clientX, y: event.clientY});
   }


   /*******************************************************************************
    ** event handler for text input changes
    *******************************************************************************/
   function updateSearch(event: React.ChangeEvent<HTMLInputElement>)
   {
      setSearchText(event?.target?.value ?? "");
      doSetFocusedIndex(0, true);
   }


   /*******************************************************************************
    **
    *******************************************************************************/
   function doHandleAdornmentClick(option: Option, group: Group, event: React.MouseEvent<any>)
   {
      console.log("In doHandleAdornmentClick");
      closeMenu();
      handleAdornmentClick(option, group, event);
   }

   /////////////////////////////////////////////////////////
   // compute the group-level toggle state & count values //
   /////////////////////////////////////////////////////////
   const groupToggleStates: { [value: string]: boolean } = {};
   const groupToggleCounts: { [value: string]: number } = {};

   if (isModeToggle)
   {
      const {allOn, count} = getGroupToggleState(defaultGroup, true);
      groupToggleStates[defaultGroup.value] = allOn;
      groupToggleCounts[defaultGroup.value] = count;

      for (let i = 0; i < defaultGroup.subGroups?.length; i++)
      {
         const subGroup = defaultGroup.subGroups[i];
         const {allOn, count} = getGroupToggleState(subGroup, false);
         groupToggleStates[subGroup.value] = allOn;
         groupToggleCounts[subGroup.value] = count;
      }
   }


   /*******************************************************************************
    **
    *******************************************************************************/
   function getGroupToggleState(group: Group, isMainGroup: boolean): {allOn: boolean, count: number}
   {
      const optionsList = [...group.options.values()];
      let allOn = true;
      let count = 0;
      for (let i = 0; i < optionsList.length; i++)
      {
         const option = optionsList[i];
         const name = isMainGroup ? option.value : `${group.value}.${option.value}`;
         if(!toggleStates[name])
         {
            allOn = false;
         }
         else
         {
            count++;
         }
      }

      return ({allOn: allOn, count: count});
   }


   let index = -1;
   const textFieldId = `field-list-dropdown-${idPrefix}-textField`;
   let listItemPadding = isModeToggle ? "0.125rem" : "0.5rem";

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////////
   // for z-indexes, we set each table header to i+1, then the fields in that table to i (so they go behind it) //
   // then we increment i by 2 for the next table (so the next header goes above the previous header)           //
   // this fixes a thing where, if one table's name wrapped to 2 lines, then when the next table below it would //
   // come up, if it was only 1 line, then the second line from the previous one would bleed through.           //
   ///////////////////////////////////////////////////////////////////////////////////////////////////////////////
   let zIndex = 1;

   return (
      <>
         <Button onClick={openMenu} {...buttonProps}>
            {buttonChildren}
         </Button>
         <Menu
            anchorEl={menuAnchorElement}
            anchorOrigin={{vertical: menuDirection == "down" ? "bottom" : "top", horizontal: "left"}}
            transformOrigin={{vertical: menuDirection == "down" ? "top" : "bottom", horizontal: "left"}}
            open={menuAnchorElement != null}
            onClose={closeMenu}
            onKeyDown={keyDown} // this is added here so arrow-key-up/down events don't make the whole menu become "focused" (blue outline).  it works.
            keepMounted
         >
            <Box width={isModeToggle ? "305px" : "265px"} borderRadius={2} className={`fieldListMenuBody fieldListMenuBody-${idPrefix}`}>
               {
                  heading &&
                  <Box px={1} py={0.5} fontWeight={"700"}>
                     {heading}
                  </Box>
               }
               <Box p={1} pt={0.5}>
                  <TextField id={textFieldId} variant="outlined" placeholder={placeholder ?? "Search Fields"} fullWidth value={searchText} onChange={updateSearch} onKeyDown={keyDown} inputProps={{sx: {pr: "2rem"}}} />
                  {
                     searchText != "" && <IconButton sx={{position: "absolute", right: "0.5rem", top: "0.5rem"}} onClick={() =>
                     {
                        updateSearch(null);
                        document.getElementById(textFieldId).focus();
                     }}><Icon fontSize="small">close</Icon></IconButton>
                  }
               </Box>
               <Box maxHeight={"445px"} minHeight={"445px"} overflow="auto" mr={"-0.5rem"} sx={{scrollbarGutter: "stable"}}>
                  <List sx={{px: "0.5rem", cursor: "default"}}>
                     {
                        optionsByGroupToShow.map((groupWithOptions) =>
                        {
                           let headerContents = null;
                           const headerGroup = groupWithOptions.group || defaultGroup;
                           if (groupWithOptions.group || showGroupHeaderEvenIfNoSubGroups)
                           {
                              headerContents = (<b>{headerGroup.label}</b>);
                           }

                           if (isModeToggle)
                           {
                              headerContents = (<FormControlLabel
                                 sx={{display: "flex", alignItems: "flex-start", "& .MuiFormControlLabel-label": {lineHeight: "1.4", fontWeight: "500 !important"}}}
                                 control={<Switch
                                    size="small"
                                    sx={{top: "1px"}}
                                    checked={toggleStates[headerGroup.value]}
                                    onChange={(event) => handleGroupToggle(event, headerGroup)}
                                 />}
                                 label={<span style={{marginTop: "0.25rem", display: "inline-block"}}><b>{headerGroup.label} Fields</b>&nbsp;<span style={{fontWeight: 400}}>({groupToggleCounts[headerGroup.value]})</span></span>} />);
                           }

                           if (isModeToggle)
                           {
                              headerContents = (
                                 <>
                                    <IconButton
                                       onClick={() => toggleCollapsedGroup(headerGroup.value)}
                                       sx={{justifyContent: "flex-start", fontSize: "0.875rem", pt: 0.5, pb: 0, mr: "0.25rem"}}
                                       disableRipple={true}
                                    >
                                       <Icon sx={{fontSize: "1.5rem !important", position: "relative", top: "2px"}}>{collapsedGroups[headerGroup.value] ? "expand_less" : "expand_more"}</Icon>
                                    </IconButton>
                                    {headerContents}
                                 </>
                              );
                           }

                           let marginLeft = "unset";
                           if (isModeToggle)
                           {
                              marginLeft = "-1rem";
                           }

                           zIndex += 2;

                           return (
                              <React.Fragment key={groupWithOptions.group?.value ?? "theGroup"}>
                                 <>
                                    {headerContents && <ListItem sx={{position: "sticky", top: -1, zIndex: zIndex + 1, padding: listItemPadding, ml: marginLeft, display: "flex", alignItems: "flex-start", backgroundImage: "linear-gradient(to bottom, rgba(255,255,255,1), rgba(255,255,255,1) 90%, rgba(255,255,255,0))"}}>{headerContents}</ListItem>}
                                    {
                                       groupWithOptions.options.map((option) =>
                                       {
                                          index++;
                                          const key = `${groupWithOptions?.group?.value}-${option.value}`;

                                          let label: JSX.Element | string = option.label;
                                          const fullOptionValue = groupWithOptions.group && groupWithOptions.group.value != defaultGroup.value ? `${groupWithOptions.group.value}.${option.value}` : option.value;
                                          const isDisabled = disabledStates && disabledStates[fullOptionValue]

                                          if (collapsedGroups[headerGroup.value])
                                          {
                                             return (<React.Fragment key={key} />);
                                          }

                                          let style = {};
                                          if (index == focusedIndex)
                                          {
                                             style = {backgroundColor: "#EFEFEF"};
                                          }

                                          const onClick: ListItemProps = {};
                                          if (isModeSelectOne)
                                          {
                                             onClick.onClick = () =>
                                             {
                                                if(isDisabled)
                                                {
                                                   return;
                                                }

                                                if(!keepOpenAfterSelectOne)
                                                {
                                                   closeMenu();
                                                }
                                                handleSelectedOption(option, groupWithOptions.group ?? defaultGroup);
                                             };
                                          }

                                          if (optionEndAdornment)
                                          {
                                             label = <Box width="100%" display="inline-flex" justifyContent="space-between">
                                                {label}
                                                <Box onClick={(event) => handleAdornmentClick(option, groupWithOptions.group, event)}>
                                                   {optionEndAdornment}
                                                </Box>
                                             </Box>;
                                          }

                                          let contents = <>{label}</>;
                                          let paddingLeft = "0.5rem";

                                          if (isModeToggle)
                                          {
                                             contents = (<FormControlLabel
                                                sx={{display: "flex", alignItems: "flex-start", "& .MuiFormControlLabel-label": {lineHeight: "1.4", color: "#606060", fontWeight: "500 !important"}}}
                                                control={<Switch
                                                   size="small"
                                                   sx={{top: "-3px"}}
                                                   checked={toggleStates[fullOptionValue]}
                                                   onChange={(event) => handleOptionToggle(event, option, groupWithOptions.group)}
                                                />}
                                                label={label} />);
                                             paddingLeft = "2.5rem";
                                          }

                                          const listItem = <ListItem
                                             key={key}
                                             id={`field-list-dropdown-${idPrefix}-${index}`}
                                             sx={{color: isDisabled ? "#C0C0C0" : "#757575", p: 1, borderRadius: ".5rem", padding: listItemPadding, pl: paddingLeft, scrollMarginTop: "3rem", zIndex: zIndex, background: "#FFFFFF", ...style}}
                                             onMouseOver={(event) => 
                                             {
                                                handleMouseOver(event, option, groupWithOptions.group, isDisabled)
                                             }}
                                             {...onClick}
                                          >{contents}</ListItem>;

                                          if(tooltips[fullOptionValue])
                                          {
                                             return <Tooltip key={key} title={tooltips[fullOptionValue]} placement="right" enterDelay={500}>{listItem}</Tooltip>
                                          }
                                          else
                                          {

                                             return listItem
                                          }
                                       })
                                    }
                                 </>
                              </React.Fragment>
                           );
                        })
                     }
                     {
                        index == -1 && <ListItem sx={{p: "0.5rem"}}><i>No options found.</i></ListItem>
                     }
                  </List>
               </Box>
            </Box>
         </Menu>
      </>
   );
}
