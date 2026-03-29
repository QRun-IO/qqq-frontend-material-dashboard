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

import {Popper, InputAdornment, Box} from "@mui/material";
import AppBar from "@mui/material/AppBar";
import Autocomplete from "@mui/material/Autocomplete";
import Icon from "@mui/material/Icon";
import IconButton from "@mui/material/IconButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import {Theme} from "@mui/material/styles";
import TextField from "@mui/material/TextField";
import Toolbar from "@mui/material/Toolbar";
import React, {useContext, useEffect, useRef, useState} from "react";
import {useLocation, useNavigate} from "react-router-dom";
import QContext from "QContext";
import QBreadcrumbs, {routeToLabel} from "qqq/components/horseshoe/Breadcrumbs";
import {navbar, navbarContainer, navbarRow, navbarMobileMenu, recentlyViewedMenu,} from "qqq/components/horseshoe/Styles";
import MDTypography from "qqq/components/legacy/MDTypography";
import {setTransparentNavbar, useMaterialUIController, setMiniSidenav} from "qqq/context";
import HistoryUtils from "qqq/utils/HistoryUtils";

// Declaring prop types for NavBar
interface Props
{
   absolute?: boolean;
   light?: boolean;
   isMini?: boolean;
}

interface HistoryEntry
{
   id: number;
   path: string;
   label: string;
   iconName?: string;
}

function NavBar({absolute, light, isMini}: Props): JSX.Element
{
   const [navbarType, setNavbarType] = useState<"fixed" | "absolute" | "relative" | "static" | "sticky">();
   const [controller, dispatch] = useMaterialUIController();
   const {miniSidenav, transparentNavbar, fixedNavbar, darkMode,} = controller;
   const [openMenu, setOpenMenu] = useState<any>(false);
   const [history, setHistory] = useState<any>([] as HistoryEntry[]);
   const [autocompleteValue, setAutocompleteValue] = useState<any>(null);
   const fullPath = useLocation().pathname;
   const route = useLocation().pathname.split("/").slice(1);
   const navigate = useNavigate();

   const {pageHeader, pageHeaderRightContent, setDotMenuOpen} = useContext(QContext);

   useEffect(() =>
   {
      // Setting the navbar type
      if (fixedNavbar)
      {
         setNavbarType("sticky");
      }
      else
      {
         setNavbarType("static");
      }

      // A function that sets the transparent state of the navbar.
      function handleTransparentNavbar()
      {
         setTransparentNavbar(dispatch, (fixedNavbar && window.scrollY === 0) || !fixedNavbar);
      }

      /**
       The event listener that's calling the handleTransparentNavbar function when
       scrolling the window.
       */
      window.addEventListener("scroll", handleTransparentNavbar);

      // Call the handleTransparentNavbar function to set the state with the initial value.
      handleTransparentNavbar();

      buildHistoryEntries();

      const history = HistoryUtils.get();
      const options = [] as any;
      history.entries.reverse().forEach((entry, index) =>
         options.push({label: `${entry.label} index`, id: index, key: index, path: entry.path, iconName: entry.iconName})
      );
      setHistory(options);

      // Remove event listener on cleanup
      return () => window.removeEventListener("scroll", handleTransparentNavbar);
   }, [dispatch, fixedNavbar]);

   const handleMiniSidenav = () => setMiniSidenav(dispatch, !miniSidenav);

   const goToHistory = (path: string) =>
   {
      navigate(path);
   };

   function buildHistoryEntries()
   {
      const history = HistoryUtils.get();
      const options = [] as any;
      history.entries.reverse().forEach((entry, index) =>
         options.push({label: entry.label, id: index, key: index, path: entry.path, iconName: entry.iconName})
      );
      setHistory(options);
   }

   function handleHistoryOnOpen()
   {
      buildHistoryEntries();
   }

   const handleOpenMenu = (event: any) => setOpenMenu(event.currentTarget);
   const handleCloseMenu = () => setOpenMenu(false);

   const handleAutocompleteOnChange = (event: any, value: any, reason: any, details: any) =>
   {
      if (value)
      {
         goToHistory(value.path);
      }
      setAutocompleteValue(null);
   };

   const CustomPopper = function (props: any)
   {
      return (<Popper
         {...props}
         style={{whiteSpace: "nowrap", width: "auto"}}
         placement="bottom-end"
      />);
   };

   const renderHistory = () =>
   {
      return (
         <Autocomplete
            disablePortal
            id="recently-viewed-combo-box"
            size="small"
            value={autocompleteValue}
            options={history}
            autoHighlight
            blurOnSelect
            style={{width: "16rem"}}
            onOpen={handleHistoryOnOpen}
            onChange={handleAutocompleteOnChange}
            PopperComponent={CustomPopper}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            sx={recentlyViewedMenu}
            renderInput={(params) => <TextField {...params} label="Recently Viewed Records" InputProps={{
               ...params.InputProps,
               endAdornment: (
                  <InputAdornment position="end">
                     <Icon sx={{position: "relative", right: "-1rem"}}>keyboard_arrow_down</Icon>
                  </InputAdornment>
               )
            }} />}
            renderOption={(props, option: HistoryEntry) => (
               <Box {...props} component="li" key={option.id} sx={{width: "auto"}}>
                  <Box sx={{width: "auto", px: "8px", whiteSpace: "overflow"}} key={option.id}>
                     <ListItemIcon sx={{minWidth: "24px !important"}}><Icon>{option.iconName}</Icon></ListItemIcon>
                     {option.label}
                  </Box>
               </Box>
            )}
         />
      );
   };

   // Styles for the navbar icons
   const iconsStyle = ({
      palette: {dark, white, text},
      functions: {rgba},
   }: {
      palette: any;
      functions: any;
   }) => ({
      color: () =>
      {
         let colorValue = light || darkMode ? white.main : dark.main;

         if (transparentNavbar && !light)
         {
            colorValue = darkMode ? rgba(text.main, 0.6) : text.main;
         }

         return colorValue;
      },
   });

   const {pathToLabelMap} = useContext(QContext);
   const fullPathToLabel = (fullPath: string, route: string): string =>
   {
      if (fullPath.endsWith("/"))
      {
         fullPath = fullPath.replace(/\/+$/, "");
      }

      if (pathToLabelMap && pathToLabelMap[fullPath])
      {
         return pathToLabelMap[fullPath];
      }

      return (routeToLabel(route));
   };

   const breadcrumbTitle = fullPathToLabel(fullPath, route[route.length - 1]);

   ///////////////////////////////////////////////////////////////////////////////////////////////
   // set the right-half of the navbar up so that below the 'md' breakpoint, it just disappears //
   ///////////////////////////////////////////////////////////////////////////////////////////////
   const navbarRowRight = (theme: Theme, {isMini}: any) =>
   {
      return {
         [theme.breakpoints.down("md")]: {
            display: "none",
         },
         ...navbarRow(theme, isMini)
      }
   };

   return (
      <AppBar
         position={absolute ? "absolute" : navbarType}
         color="inherit"
         sx={(theme) => navbar(theme, {
            transparentNavbar, absolute, light, darkMode,
         })}
      >
         <Toolbar sx={navbarContainer}>
            <Box color="inherit" mb={{xs: 1, md: 0}} sx={(theme) => navbarRow(theme, {isMini})}>
               <IconButton size="small" disableRipple color="inherit" sx={navbarMobileMenu} onClick={handleMiniSidenav}>
                  <Icon sx={iconsStyle} fontSize="large">menu</Icon>
               </IconButton>
               <QBreadcrumbs icon="home" title={breadcrumbTitle} route={route} light={light} />
            </Box>
            {isMini ? null : (
               <Box sx={(theme) => navbarRowRight(theme, {isMini})}>
                  <Box mt={"-0.25rem"} pb={"0.75rem"} pr={2} mr={-2} sx={{"& *": {cursor: "pointer !important"}}}>
                     {renderHistory()}
                  </Box>
                  <Box mt={"-1rem"}>
                     <IconButton size="small" disableRipple color="inherit" onClick={() => setDotMenuOpen(true)}>
                        <Icon sx={iconsStyle} fontSize="small">search</Icon>
                     </IconButton>
                  </Box>
               </Box>
            )}
         </Toolbar>
         {
            pageHeader &&
            <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap={{xs: "wrap", md: "nowrap"}} columnGap={2} rowGap={1}>
               <MDTypography pb="0.5rem" variant="h3" color={light ? "white" : "dark"}>
                  {pageHeader}
               </MDTypography>
               {pageHeaderRightContent && <Box display="flex">{pageHeaderRightContent}</Box>}
            </Box>
         }
      </AppBar>
   );
}

// Declaring default props for NavBar
NavBar.defaultProps = {
   absolute: false,
   light: false,
   isMini: false,
};

export default NavBar;
