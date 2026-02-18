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


import {Capability} from "@qrunio/qqq-frontend-core/lib/model/metaData/Capability";
import {QInstance} from "@qrunio/qqq-frontend-core/lib/model/metaData/QInstance";
import {QProcessMetaData} from "@qrunio/qqq-frontend-core/lib/model/metaData/QProcessMetaData";
import {QTableMetaData} from "@qrunio/qqq-frontend-core/lib/model/metaData/QTableMetaData";
import Divider from "@mui/material/Divider";
import Icon from "@mui/material/Icon";
import ListItemIcon from "@mui/material/ListItemIcon";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import {QActionsMenuButton} from "qqq/components/buttons/DefaultButtons";
import React, {useState} from "react";
import {useNavigate} from "react-router-dom";

interface QueryScreenActionMenuProps
{
   metaData: QInstance;
   tableMetaData: QTableMetaData;
   tableProcesses: QProcessMetaData[];
   bulkLoadClicked: () => void;
   bulkEditClicked: () => void;
   bulkEditWithFileClicked: () => void;
   bulkDeleteClicked: () => void;
   processClicked: (process: QProcessMetaData) => void;
}

QueryScreenActionMenu.defaultProps = {};

export default function QueryScreenActionMenu({metaData, tableMetaData, tableProcesses, bulkLoadClicked, bulkEditClicked, bulkEditWithFileClicked, bulkDeleteClicked, processClicked}: QueryScreenActionMenuProps): JSX.Element
{
   const [anchorElement, setAnchorElement] = useState(null);

   const navigate = useNavigate();

   const openActionsMenu = (event: any) =>
   {
      setAnchorElement(event.currentTarget);
   };

   const closeActionsMenu = () =>
   {
      setAnchorElement(null);
   };

   const runSomething = (handler: () => void) =>
   {
      closeActionsMenu();
      handler();
   };

   const menuItems: JSX.Element[] = [];

   ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
   // start with bulk actions, if user has permissions.                                                                                      //
   // Over time this should probably evolve to just check for the process (which means the process is defined and you have permission to it) //
   // - as the capabilities and table-level permissions don't necessarily imply the process exists or you have permission                    //
   ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
   if (tableMetaData.capabilities.has(Capability.TABLE_INSERT) && tableMetaData.insertPermission && metaData.processes.has(`${tableMetaData.name}.bulkInsert`))
   {
      menuItems.push(<MenuItem key="bulkLoad" onClick={() => runSomething(bulkLoadClicked)}><ListItemIcon><Icon>library_add</Icon></ListItemIcon>Bulk Load</MenuItem>);
   }
   if (tableMetaData.capabilities.has(Capability.TABLE_UPDATE) && tableMetaData.editPermission && metaData.processes.has(`${tableMetaData.name}.bulkEdit`))
   {
      menuItems.push(<MenuItem key="bulkEdit" onClick={() => runSomething(bulkEditClicked)}><ListItemIcon><Icon>edit</Icon></ListItemIcon>Bulk Edit</MenuItem>);
   }
   if (tableMetaData.capabilities.has(Capability.TABLE_UPDATE) && tableMetaData.editPermission && metaData.processes.has(`${tableMetaData.name}.bulkEditWithFile`))
   {
      menuItems.push(<MenuItem key="bulkEditWithFile" onClick={() => runSomething(bulkEditWithFileClicked)}><ListItemIcon><Icon>edit_note</Icon></ListItemIcon>Bulk Edit With File</MenuItem>);
   }
   if (tableMetaData.capabilities.has(Capability.TABLE_DELETE) && tableMetaData.deletePermission && metaData.processes.has(`${tableMetaData.name}.bulkDelete`))
   {
      menuItems.push(<MenuItem key="bulkDelete" onClick={() => runSomething(bulkDeleteClicked)}><ListItemIcon><Icon>delete</Icon></ListItemIcon>Bulk Delete</MenuItem>);
   }

   menuItems.push(<Divider key="divider1" />);

   tableProcesses.sort((a, b) => a.label.localeCompare(b.label));
   tableProcesses.map((process) =>
   {
      menuItems.push(<MenuItem key={process.name} onClick={() => runSomething(() => processClicked(process))}><ListItemIcon><Icon>{process.iconName ?? "arrow_forward"}</Icon></ListItemIcon>{process.label}</MenuItem>);
   });

   menuItems.push(<Divider key="divider2" />);

   ////////////////////////////////////////////
   // add processes that apply to all tables //
   ////////////////////////////////////////////
   const materialDashboardInstanceMetaData = metaData.supplementalInstanceMetaData?.get("materialDashboard");
   if (materialDashboardInstanceMetaData)
   {
      const processNamesToAddToAllQueryAndViewScreens = materialDashboardInstanceMetaData.processNamesToAddToAllQueryAndViewScreens;
      if (processNamesToAddToAllQueryAndViewScreens)
      {
         for (let processName of processNamesToAddToAllQueryAndViewScreens)
         {
            const process = metaData?.processes.get(processName);
            if (process)
            {
               menuItems.push(<MenuItem key={process.name} onClick={() => runSomething(() => processClicked(process))}><ListItemIcon><Icon>{process.iconName ?? "arrow_forward"}</Icon></ListItemIcon>{process.label}</MenuItem>);
            }
         }
      }
   }
   else
   {
      //////////////////////////////////////
      // deprecated in favor of the above //
      //////////////////////////////////////
      const runRecordScriptProcess = metaData?.processes.get("runRecordScript");
      if (runRecordScriptProcess)
      {
         const process = runRecordScriptProcess;
         menuItems.push(<MenuItem key={process.name} onClick={() => runSomething(() => processClicked(process))}><ListItemIcon><Icon>{process.iconName ?? "arrow_forward"}</Icon></ListItemIcon>{process.label}</MenuItem>);
      }
   }

   ////////////////////////////////////////
   // todo - any conditions around this? //
   ////////////////////////////////////////
   menuItems.push(<MenuItem key="developerMode" onClick={() => navigate(`${metaData.getTablePathByName(tableMetaData.name)}/dev`)}><ListItemIcon><Icon>code</Icon></ListItemIcon>Developer Mode</MenuItem>);

   if (menuItems.length === 0)
   {
      menuItems.push(<MenuItem key="notAvaialableNow" disabled><ListItemIcon><Icon>block</Icon></ListItemIcon><i>No actions available</i></MenuItem>);
   }

   ////////////////////////////////////////////////////////////////////////////////
   // remove any duplicated dividers, and any dividers in the first or last slot //
   ////////////////////////////////////////////////////////////////////////////////
   for (let i = 0; i < menuItems.length; i++)
   {
      if (menuItems[i].type == Divider && (i == 0 || (i > 0 && menuItems[i - 1].type == Divider) || i == menuItems.length - 1))
      {
         menuItems.splice(i, 1);
         i--;
      }
   }

   return (
      <>
         <QActionsMenuButton isOpen={anchorElement} onClickHandler={openActionsMenu} />
         <Menu
            anchorEl={anchorElement}
            anchorOrigin={{vertical: "bottom", horizontal: "right",}}
            transformOrigin={{vertical: "top", horizontal: "right",}}
            open={anchorElement != null}
            onClose={closeActionsMenu}
            keepMounted
         >
            {menuItems}
         </Menu>
      </>
   );
}
