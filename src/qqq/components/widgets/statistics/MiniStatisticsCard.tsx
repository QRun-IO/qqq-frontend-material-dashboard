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
import Grid from "@mui/material/Grid";
import Icon from "@mui/material/Icon";
import {ReactNode} from "react";
import colors from "qqq/assets/theme/base/colors";
import MDTypography from "qqq/components/legacy/MDTypography";
import {useMaterialUIController} from "qqq/context";


// Decalaring props types for MiniStatisticsCard
interface Props {
  bgColor?: "white" | "primary" | "secondary" | "info" | "success" | "warning" | "error" | "dark";
  title?: {
    fontWeight?: "light" | "regular" | "medium" | "bold";
    text?: string;
  };
  count: string | number;
  percentage?: {
    color: "primary" | "secondary" | "info" | "success" | "warning" | "error" | "dark" | "white";
    text: string | number;
  };
  icon: {
    color: "primary" | "secondary" | "info" | "success" | "warning" | "error" | "dark";
    component: ReactNode;
  };
  direction?: "right" | "left";
  isDisabled?: boolean;
  [key: string]: any;
}

function MiniStatisticsCard({
   bgColor,
   title,
   count,
   percentage,
   icon,
   direction,
   isDisabled,
}: Props): JSX.Element
{
   const [controller] = useMaterialUIController();
   const {darkMode} = controller;

   return (
      <Card sx={{overflow: "hidden"}}>
         <Box
            sx={({palette: {background}}: { palette: any }) => ({
               background: darkMode && background.card,
               backgroundColor: bgColor
            })}
         >
            <Box p={2}>
               <Grid container alignItems="center">
                  <Grid item xs={8}>
                     <Box
                        ml={direction === "left" ? 2 : 0}
                        lineHeight={1}
                        textAlign={direction === "left" ? "right" : "left"}
                     >
                        <MDTypography
                           variant="button"
                           color={bgColor === "white" ? "text" : "white"}
                           opacity={bgColor === "white" ? 1 : 0.7}
                           textTransform="capitalize"
                           fontWeight={title.fontWeight}
                        >
                           {title.text}
                        </MDTypography>
                        <MDTypography
                           variant="h5"
                           fontWeight="bold"
                           color={bgColor === "white" ? "dark" : "white"}
                        >
                           {count}{" "}
                           <MDTypography variant="button" color={percentage.color} fontWeight="bold">
                              {percentage.text}
                           </MDTypography>
                        </MDTypography>
                     </Box>
                  </Grid>
                  <Grid item xs={4}>
                     <Box
                        width="4rem"
                        height="4rem"
                        marginLeft="auto"
                        borderRadius="md"
                        display="flex"
                        justifyContent="center"
                        alignItems="center"
                        color="#FFFFFF"
                        sx={{borderRadius: "10px", backgroundColor: isDisabled ? colors.secondary.main : colors.info.main}}
                     >
                        <Icon fontSize="medium" color="inherit">
                           {icon.component}
                        </Icon>
                     </Box>
                  </Grid>
               </Grid>
            </Box>
         </Box>
      </Card>
   );
}

// Declaring default props for MiniStatisticsCard
MiniStatisticsCard.defaultProps = {
   bgColor: "white",
   title: {
      fontWeight: "light",
      text: "",
   },
   percentage: {
      color: "success",
      text: "",
   },
   direction: "right",
   isDisabled: false,
};

export default MiniStatisticsCard;
