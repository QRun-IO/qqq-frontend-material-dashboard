/*
 * QQQ - Low-code Application Framework for Engineers.
 * Copyright (C) 2021-2022.  Kingsrook, LLC
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
import Collapse from "@mui/material/Collapse";
import Icon from "@mui/material/Icon";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import {ReactNode} from "react";
import {collapseArrow, collapseIcon, collapseIconBox, collapseItem, collapseText,} from "qqq/components/horseshoe/sidenav/styles/SideNavCollapse";
import {useMaterialUIController} from "qqq/context";
import {generateNavItemId} from "qqq/utils/qqqIdUtils";

// Declaring props types for SideNavCollapse
interface Props {
  icon: ReactNode;
  name: string;
  children?: ReactNode;
  active?: Boolean;
  noCollapse?: Boolean;
  open?: Boolean;
  [key: string]: any;
}

function SideNavCollapse({
   icon,
   name,
   children,
   active,
   noCollapse,
   open,
   ...rest
}: Props): JSX.Element
{
   const [controller] = useMaterialUIController();
   const {miniSidenav, transparentSidenav, whiteSidenav, darkMode} = controller;

   const dataQqqId = generateNavItemId(undefined, name);

   return (
      <>
         <ListItem component="li" data-qqq-id={dataQqqId}>
            <Box
               {...rest}
               className={active ? "qqq-sidebar-active" : ""}
               sx={(theme: any) =>
                  collapseItem(theme, {active, transparentSidenav, whiteSidenav, darkMode})
               }
            >
               <ListItemIcon
                  sx={(theme) => collapseIconBox(theme, {transparentSidenav, whiteSidenav, darkMode})}
               >
                  {typeof icon === "string" ? (
                     <Icon sx={(theme) => collapseIcon(theme, {active})}>{icon}</Icon>
                  ) : (
                     icon
                  )}
               </ListItemIcon>

               <ListItemText
                  primary={name}
                  sx={(theme) =>
                     collapseText(theme, {
                        miniSidenav,
                        transparentSidenav,
                        whiteSidenav,
                        active,
                     })
                  }
               />

               <Icon
                  sx={(theme) =>
                     collapseArrow(theme, {
                        noCollapse,
                        transparentSidenav,
                        whiteSidenav,
                        miniSidenav,
                        open,
                        active,
                        darkMode,
                     })
                  }
               >
            expand_less
               </Icon>
            </Box>
         </ListItem>
         {children && (
            <Collapse in={Boolean(open)} unmountOnExit>
               {children}
            </Collapse>
         )}
      </>
   );
}

// Declaring default props for SideNavCollapse
SideNavCollapse.defaultProps = {
   active: false,
   noCollapse: false,
   children: false,
   open: false,
};

export default SideNavCollapse;
