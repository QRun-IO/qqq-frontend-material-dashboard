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

import {QInstance} from "@qrunio/qqq-frontend-core/lib/model/metaData/QInstance";
import Box from "@mui/material/Box";
import Footer from "qqq/components/horseshoe/Footer";
import NavBar from "qqq/components/horseshoe/NavBar";
import {getBannerClassName, getBannerStyles, getBanner, makeBannerContent} from "qqq/components/misc/Banners";
import DashboardLayout from "qqq/layouts/DashboardLayout";
import Client from "qqq/utils/qqq/Client";
import {ReactNode, useEffect, useState} from "react";

interface Props
{
   stickyNavbar?: boolean;
   children: ReactNode;
}

export const breakpoints = {
   values: {
      xs: 0,
      sm: 576,
      md: 768,
      lg: 992,
      xl: 1200,
      xxl: 1400,
   }
};

function BaseLayout({stickyNavbar, children}: Props): JSX.Element
{
   const [tabsOrientation, setTabsOrientation] = useState<"horizontal" | "vertical">("horizontal");
   const [metaData, setMetaData] = useState(null as QInstance);

   useEffect(() =>
   {
      (async () =>
      {
         const metaData = await Client.getInstance().loadMetaData();
         setMetaData(metaData);
      })();
   }, []);

   useEffect(() =>
   {
      // A function that sets the orientation state of the tabs.
      function handleTabsOrientation()
      {
         return window.innerWidth < breakpoints.values.sm
            ? setTabsOrientation("vertical")
            : setTabsOrientation("horizontal");
      }

      /**
       The event listener that's calling the handleTabsOrientation function when resizing the window.
       */
      window.addEventListener("resize", handleTabsOrientation);

      // Call the handleTabsOrientation function to set the state with the initial value.
      handleTabsOrientation();

      // Remove event listener on cleanup
      return () => window.removeEventListener("resize", handleTabsOrientation);
   }, [tabsOrientation]);


   /***************************************************************************
    **
    ***************************************************************************/
   function banner(): JSX.Element | null
   {
      const banner = getBanner(metaData?.branding, "QFMD_TOP_OF_BODY");

      if (!banner)
      {
         return (null);
      }

      return (<Box className={getBannerClassName(banner)} sx={{display: "flex", justifyContent: "center", padding: "0.5rem", margin: "-20px", marginBottom: "20px", ...getBannerStyles(banner)}}>
         {makeBannerContent(banner)}
      </Box>);
   }


   return (
      <>
         <DashboardLayout>
            {banner()}
            <NavBar />
            <Box>{children}</Box>
            <Footer company={{href: metaData?.branding?.companyUrl, name: metaData?.branding?.companyName}} />
         </DashboardLayout>
      </>
   );
}

// Declaring default props for BaseLayout
BaseLayout.defaultProps = {
   stickyNavbar: false,
};

export default BaseLayout;
