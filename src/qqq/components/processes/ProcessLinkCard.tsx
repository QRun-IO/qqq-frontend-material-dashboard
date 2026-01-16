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

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Divider from "@mui/material/Divider";
import Icon from "@mui/material/Icon";
import {ReactNode} from "react";
import colors from "qqq/assets/theme/base/colors";
import MDTypography from "qqq/components/legacy/MDTypography";

interface Props
{
   color?: "primary" | "secondary" | "info" | "success" | "warning" | "error" | "light" | "dark";
   isReport?: boolean;
   title: string;
   percentage?: {
      color: "primary" | "secondary" | "info" | "success" | "warning" | "error" | "dark" | "white";
      amount: string | number;
      label: string;
   };
   icon: ReactNode;
   isDisabled?: boolean;

   [key: string]: any;
}

function ProcessLinkCard({
   color, isReport, title, percentage, icon, isDisabled
}: Props): JSX.Element
{
   return (
      <Card>
         <Box display="flex" justifyContent="space-between" pt={3} px={2} title={isDisabled ? `You do not have permission to access this ${isReport ? "report" : "process"}` : ""}>
            <Box
               color={color === "light" ? "#000000" : "#FFFFFF"}
               borderRadius="xl"
               display="flex"
               justifyContent="center"
               alignItems="center"
               width="4rem"
               height="4rem"
               mt={-1.5}
               sx={{borderRadius: "10px", backgroundColor: isDisabled ? colors.secondary.main : colors.info.main}}
            >
               <Icon fontSize="medium" color="inherit">
                  {icon}
               </Icon>
            </Box>
            <Box textAlign="right" lineHeight={1.25} mt={1}>
               <MDTypography variant="button" fontWeight="bold" color="text">
                  {title}
               </MDTypography>
            </Box>
         </Box>
         <Divider />
         <Box pb={2} px={2}>
            <MDTypography component="p" variant="button" color="text" display="flex">
               <MDTypography
                  component="span"
                  variant="button"
                  fontWeight="bold"
                  color={percentage.color}
               >
                  {percentage.amount}
               </MDTypography>
               {
                  isDisabled ? (
                     isReport
                        ? `You do not have permission to access the ${title} report.`
                        : `You do not have permission to run the process called ${title}.`
                  ) : (
                     isReport
                        ? `Click here to access the ${title} report.`
                        : `Click here to run the process called ${title}.`
                  )
               }
               {percentage.label}
            </MDTypography>
         </Box>
      </Card>
   );
}

ProcessLinkCard.defaultProps = {
   color: "info",
   isReport: false,
   percentage: {
      color: "success",
      text: "",
      label: "",
   },
   isDisabled: false,
};

export default ProcessLinkCard;
