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

import {QBrandingMetaData} from "@qrunio/qqq-frontend-core/lib/model/metaData/QBrandingMetaData";
import {Button} from "@mui/material";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Icon from "@mui/material/Icon";
import Link from "@mui/material/Link";
import List from "@mui/material/List";
import SideNavCollapse from "qqq/components/horseshoe/sidenav/SideNavCollapse";
import SideNavItem from "qqq/components/horseshoe/sidenav/SideNavItem";
import SideNavList from "qqq/components/horseshoe/sidenav/SideNavList";
import SidenavRoot from "qqq/components/horseshoe/sidenav/SideNavRoot";
import sidenavLogoLabel from "qqq/components/horseshoe/sidenav/styles/SideNav";
import MDTypography from "qqq/components/legacy/MDTypography";
import {getBannerClassName, getBannerStyles, getBanner, makeBannerContent} from "qqq/components/misc/Banners";
import {setMiniSidenav, setTransparentSidenav, setWhiteSidenav, useMaterialUIController,} from "qqq/context";
import {sanitizeId} from "qqq/utils/qqqIdUtils";
import {ReactNode, useEffect, useReducer, useState} from "react";
import {NavLink, useLocation} from "react-router-dom";


interface Props
{
   color?: "primary" | "secondary" | "info" | "success" | "warning" | "error" | "dark";
   icon?: string;
   logo?: string;
   appName?: string;
   branding?: QBrandingMetaData;
   logout: () => void;
   routes: {
      [key: string]:
         | ReactNode
         | string
         | {
         [key: string]:
            | ReactNode
            | string
            | {
            [key: string]:
               | ReactNode
               | string
               | {
               [key: string]: ReactNode | string;
            }[];
         }[];
      }[];
   }[];

   [key: string]: any;
}

function Sidenav({color, icon, logo, appName, branding, routes, logout, ...rest}: Props): JSX.Element
{
   const [openCollapse, setOpenCollapse] = useState<boolean | string>(false);
   const [openNestedCollapse, setOpenNestedCollapse] = useState<boolean | string>(false);
   const [controller, dispatch] = useMaterialUIController();
   const {miniSidenav, transparentSidenav, whiteSidenav, darkMode} = controller;
   const location = useLocation();
   const {pathname} = location;
   const collapseName = pathname.split("/").slice(1)[0];
   const items = pathname.split("/").slice(1);
   const itemParentName = items[1];
   const itemName = items[items.length - 1];
   const [, forceUpdate] = useReducer((x) => x + 1, 0);

   let textColor:
      | "primary"
      | "secondary"
      | "info"
      | "success"
      | "warning"
      | "error"
      | "dark"
      | "white"
      | "inherit"
      | "text"
      | "light" = "white";

   if (transparentSidenav || (whiteSidenav && !darkMode))
   {
      textColor = "dark";
   }
   else if (whiteSidenav && darkMode)
   {
      textColor = "inherit";
   }

   const closeSidenav = () => setMiniSidenav(dispatch, true);

   useEffect(() =>
   {
      setOpenCollapse(collapseName);
      setOpenNestedCollapse(itemParentName);
   }, []);

   useEffect(() =>
   {
      // A function that sets the mini state of the sidenav.
      function handleMiniSidenav()
      {
         setMiniSidenav(dispatch, window.innerWidth < 1200);
         setTransparentSidenav(dispatch, window.innerWidth < 1200 ? false : transparentSidenav);
         setWhiteSidenav(dispatch, window.innerWidth < 1200 ? false : whiteSidenav);
      }

      /**
       The event listener that's calling the handleMiniSidenav function when resizing the window.
       */
      window.addEventListener("resize", handleMiniSidenav);
      window.onload = () =>
      {
         forceUpdate();
      };

      // Call the handleMiniSidenav function to set the state with the initial value.
      handleMiniSidenav();

      // Remove event listener on cleanup
      return () => window.removeEventListener("resize", handleMiniSidenav);
   }, [dispatch, location]);

   // Render all the nested collapse items from the routes.js
   const renderNestedCollapse = (collapse: any) =>
   {
      const template = collapse.map(({name, route, key, href}: any) =>
         href ? (
            <Link
               key={key}
               href={href}
               target="_blank"
               rel="noreferrer"
               sx={{textDecoration: "none"}}
            >
               <SideNavItem name={name} nested />
            </Link>
         ) : (
            <NavLink to={route} key={key} style={{textDecoration: "none"}}>
               <SideNavItem name={name} active={route === pathname} nested />
            </NavLink>
         )
      );

      return template;
   };
   // Render the all the collpases from the routes.js
   const renderCollapse = (collapses: any) =>
      collapses.map(({name, collapse, route, href, key}: any) =>
      {
         let returnValue;

         if (collapse)
         {
            returnValue = (
               <SideNavItem
                  key={key}
                  color={color}
                  name={name}
                  active={key === itemParentName ? "isParent" : false}
                  open={openNestedCollapse === key}
                  onClick={({currentTarget}: any) =>
                     openNestedCollapse === key && currentTarget.classList.contains("MuiListItem-root")
                        ? setOpenNestedCollapse(false)
                        : setOpenNestedCollapse(key)
                  }
               >
                  {renderNestedCollapse(collapse)}
               </SideNavItem>
            );
         }
         else
         {
            returnValue = href ? (
               <Link
                  href={href}
                  key={key}
                  target="_blank"
                  rel="noreferrer"
                  sx={{textDecoration: "none"}}
               >
                  <SideNavItem color={color} name={name} active={key === itemName} />
               </Link>
            ) : (
               <NavLink to={route} key={key} style={{textDecoration: "none"}}>
                  <SideNavItem color={color} name={name} active={key === itemName} />
               </NavLink>
            );
         }
         return <SideNavList key={key}>{returnValue}</SideNavList>;
      });

   // Render all the routes from the routes.js (All the visible items on the Sidenav)
   const renderRoutes = routes.map(
      ({type, name, icon, title, collapse, noCollapse, key, href, route}: any) =>
      {
         let returnValue;

         if (type === "collapse")
         {
            if (href)
            {
               returnValue = (
                  <Link
                     href={href}
                     key={key}
                     target="_blank"
                     rel="noreferrer"
                     sx={{textDecoration: "none"}}
                  >
                     <SideNavCollapse
                        name={name}
                        icon={icon}
                        active={key === collapseName}
                        noCollapse={noCollapse}
                     />
                  </Link>
               );
            }
            else if (noCollapse && route)
            {
               returnValue = (
                  <NavLink to={route} key={key}>
                     <SideNavCollapse
                        name={name}
                        icon={icon}
                        noCollapse={noCollapse}
                        active={key === collapseName}
                     >
                        {collapse ? renderCollapse(collapse) : null}
                     </SideNavCollapse>
                  </NavLink>
               );
            }
            else
            {
               returnValue = (
                  <SideNavCollapse
                     key={key}
                     name={name}
                     icon={icon}
                     active={key === collapseName}
                     open={openCollapse === key}
                     noCollapse={noCollapse}
                     onClick={() => (!noCollapse ? (openCollapse === key ? setOpenCollapse(false) : setOpenCollapse(key)) : null)}
                  >
                     {collapse ? renderCollapse(collapse) : null}
                  </SideNavCollapse>
               );
            }
         }
         else if (type === "title")
         {
            returnValue = (
               <MDTypography
                  key={key}
                  color={textColor}
                  display="block"
                  variant="caption"
                  fontWeight="bold"
                  textTransform="uppercase"
                  pl={3}
                  mt={2}
                  mb={1}
                  ml={1}
               >
                  {title}
               </MDTypography>
            );
         }
         else if (type === "divider")
         {
            returnValue = (
               <Divider
                  key={key}
                  light={
                     (!darkMode && !whiteSidenav && !transparentSidenav) ||
                     (darkMode && !transparentSidenav && whiteSidenav)
                  }
               />
            );
         }

         return returnValue;
      }
   );

   /***************************************************************************
    **
    ***************************************************************************/
   function EnvironmentBanner({branding}: { branding: QBrandingMetaData }): JSX.Element | null
   {
      // deprecated!
      if (branding && branding.environmentBannerText)
      {
         return <Box mt={2} bgcolor={branding.environmentBannerColor} borderRadius={2}>
            {branding.environmentBannerText}
         </Box>;
      }

      const banner = getBanner(branding, "QFMD_SIDE_NAV_UNDER_LOGO");
      if (banner)
      {
         return <Box className={getBannerClassName(banner)} mt={2} borderRadius={2} sx={getBannerStyles(banner)}>
            {makeBannerContent(banner)}
         </Box>;
      }

      return (null);
   }

   return (
      <SidenavRoot
         {...rest}
         variant="permanent"
         ownerState={{transparentSidenav, whiteSidenav, miniSidenav, darkMode}}
         data-qqq-id="sidenav-root"
      >
         <Box pt={3} mr={1} pb={0} px={4} textAlign="center" data-qqq-id="sidenav-logo-area">
            <Box
               display={{xs: "block", xl: "none"}}
               position="absolute"
               top={0}
               right={0}
               p={1.625}
               onClick={closeSidenav}
               sx={{cursor: "pointer"}}
            >
               <MDTypography variant="h6" color="secondary">
                  <Icon sx={{fontWeight: "bold"}}>close</Icon>
               </MDTypography>
            </Box>
            <Box component={NavLink} to="/" display="flex" alignItems="center">
               {!miniSidenav && logo && <Box component="img" src={logo} alt={appName} title={appName} width="100%" onError={(e: any) =>
               {
                  e.target.style.display = "none";
               }} />}
               {miniSidenav && icon && <Box component="img" src={icon} alt={appName} title={appName} width="160%" onError={(e: any) =>
               {
                  e.target.style.display = "none";
               }} />}
               {!miniSidenav && !logo && appName && <Box width={appName && "100%"} sx={(theme: any) => sidenavLogoLabel(theme, {miniSidenav})}>
                  <MDTypography component="h6" variant="button" fontWeight="medium" color={textColor}>
                     {appName}
                  </MDTypography>
               </Box>
               }
            </Box>
            <EnvironmentBanner branding={branding} />
         </Box>
         <Divider
            light={
               (!darkMode && !whiteSidenav && !transparentSidenav) ||
               (darkMode && !transparentSidenav && whiteSidenav)
            }
         />
         <List data-qqq-id="sidenav-menu-list">{renderRoutes}</List>
         <Divider
            light={
               (!darkMode && !whiteSidenav && !transparentSidenav) ||
               (darkMode && !transparentSidenav && whiteSidenav)
            }
         />
         <Button onClick={logout} data-qqq-id="sidenav-logout-button">Log Out</Button>
      </SidenavRoot>
   );
}

// Declaring default props for Sidenav
Sidenav.defaultProps = {
   color: "info",
   icon: "",
   logo: "",
   appName: "",
};

export default Sidenav;
