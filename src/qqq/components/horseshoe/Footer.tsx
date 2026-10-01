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
import Link from "@mui/material/Link";
import MDTypography from "qqq/components/legacy/MDTypography";
import typography from "qqq/components/legacy/typography";


// Declaring props types for Footer
interface Props
{
   company?: {
      href: string;
      name: string;
   };
   links?: {
      href: string;
      name: string;
   }[];

   [key: string]: any;
}

Footer.defaultProps = {
   company: {href: "", name: ""},
   links: [],
};

function Footer({company, links}: Props): JSX.Element
{
   const {href, name} = company;
   const {size} = typography;

   const renderLinks = () => links.map((link) => (
      <Box key={link.name} component="li" px={2} lineHeight={1}>
         <Link href={link.href} target="_blank">
            <MDTypography variant="button" fontWeight="regular" color="text">
               {link.name}
            </MDTypography>
         </Link>
      </Box>
   ));

   return (
      <Box
         width="100%"
         display="flex"
         flexDirection={{xs: "column", md: "row"}}
         justifyContent="space-between"
         alignItems="center"
         px={1.5}
         style={{
            position: "fixed", bottom: "0px", zIndex: -1, marginBottom: "10px",
         }}
         left={{xs: "0", xl: "auto"}}
      >
         {
            href && name &&
            <Box
               display="flex"
               justifyContent="center"
               alignItems="center"
               flexWrap="wrap"
               color="text"
               fontSize={size.sm}
               px={1.5}
            >
               &copy;
               {" "}
               {new Date().getFullYear()}
               ,
               <Link href={href} target="_blank">
                  <MDTypography variant="button" fontWeight="medium">
                     &nbsp;
                     {name}
                     &nbsp;
                  </MDTypography>
               </Link>
            </Box>
         }
         <Box
            component="ul"
            sx={({breakpoints}) => ({
               display: "flex",
               flexWrap: "wrap",
               alignItems: "center",
               justifyContent: "center",
               listStyle: "none",
               mt: 3,
               mb: 0,
               p: 0,

               [breakpoints.up("lg")]: {
                  mt: 0,
               },
            })}
         >
            {renderLinks()}
         </Box>
      </Box>
   );
}

export default Footer;
