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

import {Box} from "@mui/material";
import Divider from "@mui/material/Divider";
import Icon from "@mui/material/Icon";
import ListItemIcon from "@mui/material/ListItemIcon";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import {Capability} from "@qrunio/qqq-frontend-core/lib/model/metaData/Capability";
import {QMenu} from "@qrunio/qqq-frontend-core/lib/model/metaData/QMenu";
import {QMenuItem} from "@qrunio/qqq-frontend-core/lib/model/metaData/QMenuItem";
import {QProcessMetaData} from "@qrunio/qqq-frontend-core/lib/model/metaData/QProcessMetaData";
import {QTableMetaData} from "@qrunio/qqq-frontend-core/lib/model/metaData/QTableMetaData";
import {QRecord} from "@qrunio/qqq-frontend-core/lib/model/QRecord";
import {QActionsMenuButton} from "qqq/components/buttons/DefaultButtons";
import {RecordViewMenuActions} from "qqq/pages/records/view/RecordView";
import React, {useEffect, useState} from "react";

/////////////////////////////////////////////////
// component for the multiple additional menus //
/////////////////////////////////////////////////
interface RecordViewAdditionalMenusProps
{
   tableMetaData: QTableMetaData,
   record?: QRecord,
   actions: RecordViewMenuActions,
}

export function RecordViewAdditionalMenus({tableMetaData, record, actions}: RecordViewAdditionalMenusProps): JSX.Element
{
   const [menus] = useState((tableMetaData.menus ?? []).filter(m => m.slot == "VIEW_SCREEN_ADDITIONAL"));

   if (!menus)
   {
      return <></>;
   }

   return (<Box>
      {menus.map((menu, index) => <RecordViewMenu key={index} tableMetaData={tableMetaData} menu={menu} record={record} actions={actions} />)}
   </Box>);
}


/////////////////////////////////
// component for a single menu //
/////////////////////////////////
interface RecordViewMenuProps
{
   tableMetaData: QTableMetaData,
   menu: QMenu,
   record?: QRecord,
   actions: RecordViewMenuActions,
}

export function RecordViewMenu({tableMetaData, menu, record, actions}: RecordViewMenuProps): JSX.Element
{
   const [menuElement, setMenuElement] = useState(null);
   const openMenu = (event: any) => setMenuElement(event.currentTarget);
   const closeMenu = () => setMenuElement(null);

   const itemsShown = new ItemsShownInMenu();

   return <>
      <Box display="inline-block" data-qqq-id="record-view-actions-menu-button">
         <QActionsMenuButton isOpen={menuElement} onClickHandler={openMenu} label={menu.label} qIcon={menu.icon} />
      </Box>
      <Menu
         anchorEl={menuElement}
         anchorOrigin={{vertical: "bottom", horizontal: "right",}}
         transformOrigin={{vertical: "top", horizontal: "right",}}
         open={Boolean(menuElement)}
         onClose={closeMenu}
         keepMounted
         data-qqq-id="record-view-actions-menu"
      >
         {menu.items.map((item, index) => (
            <RecordViewMenuItem key={index} tableMetaData={tableMetaData} menuItem={item} record={record} actions={actions} closeMenu={closeMenu} itemsShown={itemsShown} />
         ))}
      </Menu>
   </>;
}


//////////////////////////////////////
// component for a single menu item //
//////////////////////////////////////
interface RecordViewMenuItemProps
{
   tableMetaData: QTableMetaData,
   menuItem: QMenuItem,
   record?: QRecord,
   actions: RecordViewMenuActions,
   closeMenu?: () => void,
   itemsShown?: ItemsShownInMenu
   keyPrefix?: string
}

export function RecordViewMenuItem({tableMetaData: table, menuItem, record, actions, closeMenu, itemsShown, keyPrefix}: RecordViewMenuItemProps): JSX.Element
{
   function getItemsFromValues(menuItem: QMenuItem): QMenuItem[]
   {
      const itemsObject = menuItem?.values?.get("items");
      if (itemsObject && itemsObject.length)
      {
         const qMenuItems: QMenuItem[] = [];
         for (let itemsObjectElement of itemsObject)
         {
            qMenuItems.push(new QMenuItem(itemsObjectElement));
         }
         return qMenuItems;
      }

      return [];
   }

   const [fieldName] = useState(menuItem?.values?.get("fieldName") as string);
   const [fieldValue, setFieldValue] = useState(null as string);
   const [processName] = useState(menuItem?.values?.get("processName") as string);
   const [option] = useState(menuItem?.values?.get("option") as string);
   const [items] = useState(getItemsFromValues(menuItem));

   //////////////////////////////////////////////////////////////////
   // field value needs to come from the record, after it's loaded //
   //////////////////////////////////////////////////////////////////
   useEffect(() =>
   {
      setFieldValue(record?.values?.get(fieldName));
   }, [record]);

   switch (menuItem.itemType)
   {
      case "DIVIDER":
      {
         if (!itemsShown || itemsShown?.okayToShowDivider())
         {
            itemsShown?.addItem(menuItem);
            return <Divider />;
         }

         return <></>;
      }
      case "RUN_PROCESS":
      {
         itemsShown?.addItem(menuItem);
         return <MenuItem onClick={() => actions.runProcess(processName)}>{content(menuItem, "arrow_forward", processName)}</MenuItem>;
      }
      case "DOWNLOAD_FILE":
      {
         itemsShown?.addItem(menuItem);
         return <MenuItem disabled={!fieldValue} onClick={() => actions.downloadFileFromField(fieldName, closeMenu)}>{content(menuItem, "file_download", menuItem.label)}</MenuItem>;
      }
      case "SUB_LIST":
      {
         return <> {items?.map((subItem, index) =>
         {
            itemsShown?.addItem(subItem);
            return (
               <RecordViewMenuItem key={`${keyPrefix}-${index}`} keyPrefix={`${keyPrefix}-${index}`} tableMetaData={table} menuItem={subItem} record={record} actions={actions} closeMenu={closeMenu} itemsShown={itemsShown} />
            );
         })} </>;
      }
      case "SUB_MENU":
      {
         const subMenu: QMenu = new QMenu({...menuItem});
         subMenu.items = items;
         return <RecordViewSubMenu keyPrefix={`${keyPrefix}-sub`} tableMetaData={table} subMenuItem={menuItem} menu={subMenu} actions={actions} record={record} itemsShown={itemsShown} />;
      }
      case "BUILT_IN":
      {
         switch (option)
         {
            case "NEW":
            {
               return table?.capabilities.has(Capability.TABLE_INSERT) && table?.insertPermission
                  ? itemsShown.addItem(menuItem) && <MenuItem onClick={() => actions.new()} data-qqq-id="menu-item-new">{content(menuItem, "add", "New")}</MenuItem>
                  : <></>;
            }
            case "COPY":
            {
               return table?.capabilities.has(Capability.TABLE_INSERT) && table?.insertPermission
                  ? <MenuItem onClick={() => actions.copy()} data-qqq-id="menu-item-copy">{content(menuItem, "copy", "Copy")}</MenuItem>
                  : <></>;
            }
            case "EDIT":
            {
               return table?.capabilities.has(Capability.TABLE_UPDATE) && table?.editPermission
                  ? <MenuItem onClick={() => actions.edit()} data-qqq-id="menu-item-edit">{content(menuItem, "edit", "Edit")}</MenuItem>
                  : <></>;
            }
            case "DELETE":
            {
               return table?.capabilities.has(Capability.TABLE_DELETE) && table?.deletePermission
                  ? <MenuItem onClick={() => actions.delete(closeMenu)} data-qqq-id="menu-item-delete">{content(menuItem, "delete", "Delete")}</MenuItem>
                  : <></>;
            }
            case "DEVELOPER_MODE":
            {
               return <MenuItem onClick={() => actions.developerMode()}>{content(menuItem, "code", "Developer Mode")}</MenuItem>;
            }
            case "AUDIT":
            {
               return actions.getMetaData().tables.has("audit")
                  ? <MenuItem onClick={() => actions.audit(closeMenu)} data-qqq-id="menu-item-audit">{content(menuItem, "checklist", "Audit")}</MenuItem>
                  : <></>;
            }
            case "THIS_TABLE_PROCESS_LIST":
            {
               return <> {showProcessesFromList(actions, itemsShown, menuItem, actions.getTableProcesses(), keyPrefix)} </>;
            }
            case "ALL_TABLES_PROCESS_LIST":
            {
               return <> {showProcessesFromList(actions, itemsShown, menuItem, actions.getGenericProcesses(), keyPrefix)} </>;
            }
         }
      }
   }

   console.warn(`Unrecognized menu item: type:[${menuItem.itemType}], values:[${JSON.stringify(menuItem.values)}]`);
   return (<></>);
}


/////////////////////////////////
// component that is a submenu //
/////////////////////////////////
interface RecordViewSubMenuParams
{
   tableMetaData: QTableMetaData,
   record?: QRecord,
   menu: QMenu,
   subMenuItem: QMenuItem,
   actions: RecordViewMenuActions,
   itemsShown?: ItemsShownInMenu
   keyPrefix?: string
}

function RecordViewSubMenu({actions, menu, tableMetaData, record, subMenuItem, itemsShown, keyPrefix}: RecordViewSubMenuParams): JSX.Element
{
   const [menuElement, setMenuElement] = useState(null);
   const openMenu = (event: any) => setMenuElement(event.currentTarget);
   const closeMenu = () => setMenuElement(null);

   itemsShown.addItem(subMenuItem);

   return (<>
      <MenuItem onClick={openMenu}>
         {content(subMenuItem, "double_arrow", menu.label)}
      </MenuItem>
      <Menu
         anchorEl={menuElement}
         anchorOrigin={{vertical: "top", horizontal: "left",}}
         transformOrigin={{vertical: "top", horizontal: "right",}}
         open={Boolean(menuElement)}
         onClose={closeMenu}
         keepMounted
         data-qqq-id="record-view-actions-sub-menu"
      >
         {menu.items.map((item, index) => (
            <RecordViewMenuItem key={`${keyPrefix}-${index}`} keyPrefix={`${keyPrefix}-${index}`} tableMetaData={tableMetaData} menuItem={item} record={record} actions={actions} closeMenu={closeMenu} itemsShown={itemsShown} />
         ))}
      </Menu>
   </>);
}


/***************************************************************************
 * output the content for a menu item - a box, an icon, a label.
 ***************************************************************************/
function content(menuItem: QMenuItem, defaultIconName: string, defaultLabel: string)
{
   return <Box display="flex" alignItems="center" sx={{"& .MuiListItemIcon-root": {minWidth: "30px"}}}>
      <ListItemIcon><Icon>{menuItem.icon?.name ?? defaultIconName}</Icon></ListItemIcon>
      {menuItem.label ?? defaultLabel}
   </Box>;
}


/***************************************************************************
 * render processes from a list, if they exist and haven't been shown before.
 ***************************************************************************/
function showProcessesFromList(actions: RecordViewMenuActions, itemsShown: ItemsShownInMenu, menuItem: QMenuItem, processes: QProcessMetaData[], keyPrefix: string = "")
{
   return processes?.map((process, index) =>
   {
      const key = `${keyPrefix}-${index}`;
      if (!process)
      {
         return <React.Fragment key={key}></React.Fragment>;
      }

      if (itemsShown && itemsShown?.hasProcessBeenShown(process.name))
      {
         return <React.Fragment key={key}></React.Fragment>;
      }

      itemsShown?.addItem(menuItem);

      return (
         <MenuItem key={key} onClick={() => actions.runProcess(process.name)} data-qqq-id={`menu-item-${sanitizeId(process.name)}`}>
            {content(new QMenuItem({label: process.label, icon: {name: process.iconName}}), "arrow_forward", process.label)}
         </MenuItem>
      );
   });
}


/***************************************************************************
 * Helper class to keep track of which items have been shown in a menu.
 * So that the built-ins that show process lists can avoid showing processes
 * that were show individually, and to help avoid back-to-back dividers.
 ***************************************************************************/
export class ItemsShownInMenu
{
   public items: QMenuItem[] = [];

   /***************************************************************************
    * Add a shown-item to this object.  Always returns true (so that it can
    * be used in a addItem() && <>showTheItem</> kind of expression.
    ***************************************************************************/
   public addItem(item: QMenuItem): true
   {
      this.items.push(item);
      return true;
   }

   /***************************************************************************
    * test if a process has previously been shown.
    *
    * meant for use by the THIS_TABLE_PROCESS_LIST built-in, to show processes
    * that weren't otherwise shown.
    *
    * Some possible improvements may be:
    * - looking into the future (e.g., will a process be rendered *after* the built-in?)
    * - should it look across menus (right now only looks at one).
    ***************************************************************************/
   public hasProcessBeenShown(processName: string): boolean
   {
      for (let shownItem of this.items)
      {
         const shownProcessName = shownItem?.values?.get("processName");
         if (processName == shownProcessName)
         {
            return true;
         }
      }

      return false;
   }

   /***************************************************************************
    * test if it's okay to show a divider now.  it's not okay to show a divider
    * if the last item was a divider, or as the first item.
    * TODO - would be nice to also not show a divider as the last item, but that
    * requires looking into the future some (as it's not just the size of the
    * menu, but also about permissions).  The approach could maybe be to put
    * an id on each shown divider, and to hide it if it's the last item?
    * then again, could we just CSS hide :first, :last, and siblings?
    ***************************************************************************/
   public okayToShowDivider(): boolean
   {
      if (this.items.length == 0)
      {
         return false;
      }

      if (this.items[this.items.length - 1].itemType == "DIVIDER")
      {
         return false;
      }

      return true;
   }

}


// todo - after theme code is merged back in, use this function from util file:
// import {sanitizeId} from "qqq/utils/qqqIdUtils";
function sanitizeId(text: string): string
{
   if (!text)
   {
      return "";
   }

   return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .substring(0, 50);
}

