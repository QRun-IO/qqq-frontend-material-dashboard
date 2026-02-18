/*
 * QQQ - Low-code Application Framework for Engineers.
 * Copyright (C) 2021-2023.  Kingsrook, LLC
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

import {ClickAwayListener, Grow, MenuList, Paper, Popper} from "@mui/material";
import Button from "@mui/material/Button/Button";
import Icon from "@mui/material/Icon";
import MenuItem from "@mui/material/MenuItem";
import React, {useEffect, useRef, useState} from "react";


interface Props
{
   label: string;
   iconName?: string
   options: string[];
   disabled?: boolean;
   callback: (selectedIndex: number) => void;
}

MenuButton.defaultProps =
{
   disabled: false
};

function MenuButton({label, iconName, options, disabled, callback}: Props)
{
   const [open, setOpen] = useState(false);
   const anchorRef = useRef<HTMLButtonElement>(null);

   const handleToggle = () => 
   {
      setOpen((prevOpen) => !prevOpen);
   };

   const handleClose = (event: Event | React.SyntheticEvent) => 
   {
      if (anchorRef.current && anchorRef.current.contains(event.target as HTMLElement))
      {
         return;
      }

      setOpen(false);
   };

   function handleListKeyDown(event: React.KeyboardEvent) 
   {
      if (event.key === "Tab") 
      {
         event.preventDefault();
         setOpen(false);
      }
      else if (event.key === "Escape") 
      {
         setOpen(false);
      }
   }

   // return focus to the button when we transitioned from !open -> open
   const prevOpen = useRef(open);
   useEffect(() =>
   {
      if (prevOpen.current === true && open === false) 
      {
         anchorRef.current!.focus();
      }

      prevOpen.current = open;
   }, [open]);


   const menuItemClicked = (e: React.MouseEvent<HTMLLIElement, MouseEvent>, newIndex: number) =>
   {
      callback(newIndex);
      handleClose(e);
   }

   const menuItems: JSX.Element[] = []
   options.map((option, index) =>
   {
      menuItems.push(<MenuItem key={index} onClick={e => menuItemClicked(e, index)}>
         {option}
      </MenuItem>);
   })

   return (
      <div>
         <Button
            ref={anchorRef}
            id="composition-button"
            aria-controls={open ? "composition-menu" : undefined}
            aria-expanded={open ? "true" : undefined}
            aria-haspopup="true"
            onClick={handleToggle}
            startIcon={iconName ? <Icon>{iconName}</Icon> : undefined}
            sx={{pl: "1.25rem"}}
            disabled={disabled}
         >
            {label}
         </Button>
         <Popper
            open={open}
            anchorEl={anchorRef.current}
            role={undefined}
            placement="bottom-start"
            transition
            disablePortal nonce={undefined} onResize={undefined} onResizeCapture={undefined}
            sx={{zIndex: 1}}
         >
            {({TransitionProps, placement}) => (
               <Grow{...TransitionProps} style={{transformOrigin: placement === "bottom-start" ? "left top" : "left bottom"}}>
                  <Paper elevation={3}>
                     <ClickAwayListener onClickAway={handleClose}>
                        <MenuList onKeyDown={handleListKeyDown}>
                           {menuItems}
                        </MenuList>
                     </ClickAwayListener>
                  </Paper>
               </Grow>
            )}
         </Popper>
      </div>
   );
}

export default MenuButton;

