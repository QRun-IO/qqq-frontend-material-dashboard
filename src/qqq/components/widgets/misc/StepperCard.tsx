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

import {Check, Pending, RocketLaunch} from "@mui/icons-material";
import {Icon, Skeleton, StepConnector} from "@mui/material";
import Box from "@mui/material/Box";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import Stepper from "@mui/material/Stepper";
import {withStyles} from "@mui/styles";
import React, {useContext} from "react";
import {NavLink} from "react-router-dom";
import QContext from "QContext";


/////////////////////////////////////////////
// structure of expected stepper card data //
/////////////////////////////////////////////
export interface StepperCardData
{
   title: string;
   activeStep: number;
   steps: {
      label: string;
      linkText: string;
      linkURL: string;
      iconOverride: string;
      colorOverride: string;
   }[];
}


////////////////////////////////////
// define properties and defaults //
////////////////////////////////////
interface Props
{
   data: StepperCardData;
}


function StepperCard({data}: Props): JSX.Element
{
   const {accentColor} = useContext(QContext);
   const activeStep = data && data.activeStep ? data.activeStep : 0;

   const CustomizedConnector = withStyles({
      line: {
         color: "#344767",
         marginTop: "9px",
         marginRight: "30px",
         marginLeft: "30px",
      }
   })(StepConnector);

   // console.log(`data ${JSON.stringify(data)}`);

   return (
      <Stepper connector={<CustomizedConnector />} activeStep={activeStep} alternativeLabel sx={{paddingBottom: "0px", boxShadow: "none", background: "none"}}>
         {
            data && data.steps ? (
               data.steps.map((step, index) => (
                  <Step key={step.label}>
                     {
                        index < activeStep && (
                           <Box>
                              <StepLabel icon={step.iconOverride ? <Icon>{step.iconOverride}</Icon> : <Check />} sx={{
                                 color: step.colorOverride ?? "green",
                                 fontSize: "35px",
                                 "& .MuiStepLabel-label.Mui-completed.MuiStepLabel-alternativeLabel":
                                    {
                                       color: `${step.colorOverride ?? "green"} !important`,
                                    }
                              }}>{step.label}</StepLabel>
                           </Box>
                        )
                     }
                     {
                        index > activeStep && (
                           <Box>
                              <StepLabel icon={step.iconOverride ? <Icon>{step.iconOverride}</Icon> : <Pending />} sx={{
                                 color: step.colorOverride ?? "#ced4da",
                                 fontSize: "35px",
                                 "& .MuiStepLabel-label.MuiStepLabel-alternativeLabel":
                                    {
                                       color: `${step.colorOverride ?? "#ced4da"} !important`,
                                    }
                              }}>{step.label}</StepLabel>
                           </Box>
                        )
                     }
                     {
                        index === activeStep && (
                           <Box>
                              <StepLabel icon={step.iconOverride ? <Icon>{step.iconOverride}</Icon> : <RocketLaunch />} sx={{
                                 color: step.colorOverride ?? accentColor,
                                 fontSize: "35px",
                                 "& .MuiStepLabel-label.MuiStepLabel-alternativeLabel":
                                    {
                                       color: `${step.colorOverride ?? "#344767"} !important`,
                                    }
                              }}>{step.label}</StepLabel>
                              {
                                 step.linkURL && (
                                    <Box sx={{textAlign: "center", fontSize: "14px"}}>
                                       <NavLink to={step.linkURL}>{step.linkText}</NavLink>
                                    </Box>
                                 )
                              }
                           </Box>
                        )
                     }
                  </Step>
               ))
            ) : (

               Array(5).fill(0).map((_, i) =>
                  <Step key={`step-${i}`}>
                     <Box>
                        <StepLabel icon={<Pending />} sx={{
                           color: "#ced4da",
                           fontSize: "35px",
                           "& .MuiStepLabel-label.MuiStepLabel-alternativeLabel":
                              {
                                 color: "#ced4da !important",
                              }
                        }}><Skeleton /></StepLabel>
                     </Box>
                  </Step>
               )
            )
         }
      </Stepper>
   );
}

export default StepperCard;
