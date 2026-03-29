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

import {QFieldMetaData} from "@qrunio/qqq-frontend-core/lib/model/metaData/QFieldMetaData";
import {QFieldType} from "@qrunio/qqq-frontend-core/lib/model/metaData/QFieldType";
import {QInstance} from "@qrunio/qqq-frontend-core/lib/model/metaData/QInstance";
import {QTableMetaData} from "@qrunio/qqq-frontend-core/lib/model/metaData/QTableMetaData";
import {QTableVariant} from "@qrunio/qqq-frontend-core/lib/model/metaData/QTableVariant";
import {QCriteriaOperator} from "@qrunio/qqq-frontend-core/lib/model/query/QCriteriaOperator";
import {QFilterCriteria} from "@qrunio/qqq-frontend-core/lib/model/query/QFilterCriteria";
import {QQueryFilter} from "@qrunio/qqq-frontend-core/lib/model/query/QQueryFilter";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Grid from "@mui/material/Grid";
import Icon from "@mui/material/Icon";
import TextField from "@mui/material/TextField";
import {preferredColorNameInfoOrPrimary} from "qqq/assets/theme/functions/preferInfoColorToPrimaryColor";
import {QCancelButton} from "qqq/components/buttons/DefaultButtons";
import MDButton from "qqq/components/legacy/MDButton";
import Client from "qqq/utils/qqq/Client";
import React, {useState} from "react";
import {useNavigate} from "react-router-dom";

interface Props
{
   isOpen: boolean;
   metaData: QInstance;
   tableMetaData: QTableMetaData;
   tableVariant?: QTableVariant;
   closeHandler: () => void;
   mayClose: boolean;
   subHeader?: JSX.Element;
}

GotoRecordDialog.defaultProps = {
   mayClose: true
};

const qController = Client.getInstance();

function hasGotoFieldNames(tableMetaData: QTableMetaData): boolean
{
   const mdbMetaData = tableMetaData?.supplementalTableMetaData?.get("materialDashboard");
   if (mdbMetaData && mdbMetaData.gotoFieldNames)
   {
      return (true);
   }

   return (false);
}

function GotoRecordDialog(props: Props): JSX.Element
{
   ///////////////////////////////////////////////////////////////////////////////////////////////////////////////
   // this is an array of array of fields.                                                                      //
   // that is - each entry in the top-level array is a set of fields that can be used together to goto a record //
   // such as (pkey), (ukey-field1,ukey-field2).                                                                //
   ///////////////////////////////////////////////////////////////////////////////////////////////////////////////
   const options: QFieldMetaData[][] = [];

   let pkey = props?.tableMetaData?.fields.get(props?.tableMetaData?.primaryKeyField);
   let addedPkey = false;
   const mdbMetaData = props?.tableMetaData?.supplementalTableMetaData?.get("materialDashboard");
   if (mdbMetaData)
   {
      if (mdbMetaData.gotoFieldNames)
      {
         for (let i = 0; i < mdbMetaData.gotoFieldNames.length; i++)
         {
            const option: QFieldMetaData[] = [];
            options.push(option);
            for (let j = 0; j < mdbMetaData.gotoFieldNames[i].length; j++)
            {
               let fieldName = mdbMetaData.gotoFieldNames[i][j];
               let field = props.tableMetaData.fields.get(fieldName);
               if (field)
               {
                  option.push(field);

                  if (pkey != null && field.name == pkey.name)
                  {
                     addedPkey = true;
                  }
               }
            }
         }
      }
   }

   //////////////////////////////////////////////////////////////////////////////////////////
   // if pkey wasn't in the gotoField options meta-data, go ahead add it as an option here //
   //////////////////////////////////////////////////////////////////////////////////////////
   if (pkey && !addedPkey)
   {
      options.unshift([pkey]);
   }

   const makeInitialValues = () =>
   {
      const rs = {} as { [field: string]: string };
      options.forEach((option) => option.forEach((field) => rs[field.name] = ""));
      return (rs);
   };

   const [error, setError] = useState("");
   const [values, setValues] = useState(makeInitialValues());
   const navigate = useNavigate();

   const handleChange = (fieldName: string, newValue: string) =>
   {
      values[fieldName] = newValue;
      setValues(JSON.parse(JSON.stringify(values)));
   };

   const close = () =>
   {
      setError("");
      setValues(makeInitialValues());
      props.closeHandler();
   };

   const keyPressed = (e: React.KeyboardEvent<HTMLDivElement>) =>
   {
      // @ts-ignore
      const targetId: string = e.target?.id;

      if (e.key == "Esc")
      {
         if (props.mayClose)
         {
            close();
         }
      }
      else if (e.key == "Enter" && targetId?.startsWith("gotoInput-"))
      {
         const parts = targetId?.split(/-/);
         const index = parts[1];
         document.getElementById("gotoButton-" + index).click();
      }
   };


   /***************************************************************************
    ** event handler for close button
    ***************************************************************************/
   const closeRequested = () =>
   {
      if (props.mayClose)
      {
         close();
      }
   };


   /*******************************************************************************
    ** function to say if an option's submit button should be disabled
    *******************************************************************************/
   const isOptionSubmitButtonDisabled = (optionIndex: number) =>
   {
      let anyFieldsInThisOptionHaveAValue = false;

      options[optionIndex].forEach((field) =>
      {
         if (values[field.name])
         {
            anyFieldsInThisOptionHaveAValue = true;
         }
      });

      if (!anyFieldsInThisOptionHaveAValue)
      {
         return (true);
      }
      return (false);
   };


   /***************************************************************************
    ** event handler for clicking an 'option's go/submit button
    ***************************************************************************/
   const optionGoClicked = async (optionIndex: number) =>
   {
      setError("");

      const criteria: QFilterCriteria[] = [];
      const queryStringParts: string[] = [];
      options[optionIndex].forEach((field) =>
      {
         if (field.type == QFieldType.STRING && !values[field.name])
         {
            return;
         }
         criteria.push(new QFilterCriteria(field.name, QCriteriaOperator.EQUALS, [values[field.name]]));
         queryStringParts.push(`${field.name}=${encodeURIComponent(values[field.name])}`);
      });

      const filter = new QQueryFilter(criteria, null, null, "AND", null, 10);

      try
      {
         const queryResult = await qController.query(props.tableMetaData.name, filter, null, props.tableVariant);
         if (queryResult.length == 0)
         {
            setError("Record not found.");
            setTimeout(() => setError(""), 3000);
         }
         else if (queryResult.length == 1)
         {
            if (options[optionIndex].length == 1 && options[optionIndex][0].name == pkey?.name)
            {
               /////////////////////////////////////////////////
               // navigate by pkey, if that's how we searched //
               /////////////////////////////////////////////////
               navigate(`${props.metaData.getTablePathByName(props.tableMetaData.name)}/${encodeURIComponent(queryResult[0].values.get(props.tableMetaData.primaryKeyField))}`);
            }
            else
            {
               /////////////////////////////////
               // else navigate by unique-key //
               /////////////////////////////////
               navigate(`${props.metaData.getTablePathByName(props.tableMetaData.name)}/key/?${queryStringParts.join("&")}`);
            }

            close();
         }
         else
         {
            setError("More than 1 record was found...");
            setTimeout(() => setError(""), 3000);
         }
      }
      catch (e)
      {
         // @ts-ignore
         setError(`Error: ${(e && e.message) ? e.message : e}`);
         setTimeout(() => setError(""), 6000);
      }
   };

   if (props.tableMetaData)
   {
      if (options.length == 0 && !error)
      {
         setError("This table is not configured for this feature.");
      }
   }

   return (
      <Dialog open={props.isOpen} onClose={() => closeRequested} onKeyPress={(e) => keyPressed(e)} fullWidth maxWidth={"sm"}>
         <DialogTitle>Go To...</DialogTitle>

         <DialogContent>
            {props.subHeader}
            {
               options.map((option, optionIndex) =>
                  <Box key={optionIndex}>
                     {
                        option.map((field, index) =>
                           (
                              <Grid key={field.name} container alignItems="center" py={1}>
                                 <Grid item xs={3} textAlign="right" pr={2}>
                                    {field.label}
                                 </Grid>
                                 <Grid item xs={6}>
                                    <TextField
                                       id={`gotoInput-${optionIndex}-${index}`}
                                       autoFocus={optionIndex == 0 && index == 0}
                                       autoComplete="off"
                                       inputProps={{width: "100%"}}
                                       onChange={(e) => handleChange(field.name, e.target.value)}
                                       value={values[field.name]}
                                       sx={{width: "100%"}}
                                       onFocus={event => event.target.select()}
                                    />
                                 </Grid>
                                 <Grid item xs={1} pl={2}>
                                    {
                                       (index == option.length - 1) &&
                                       <MDButton id={`gotoButton-${optionIndex}`} type="submit" variant="gradient" color={preferredColorNameInfoOrPrimary()} size="small" onClick={() => optionGoClicked(optionIndex)} fullWidth startIcon={<Icon>double_arrow</Icon>} disabled={isOptionSubmitButtonDisabled(optionIndex)}>Go</MDButton>
                                    }
                                 </Grid>
                              </Grid>
                           ))
                     }
                  </Box>
               )
            }
            {
               error &&
               <Box color="red">
                  {error}
               </Box>
            }
         </DialogContent>
         {
            ////////////////////////////////////////////////////////////////////////////////////////
            // show the cancel button if allowed - else we need a little spacing, so an empty box //
            ////////////////////////////////////////////////////////////////////////////////////////
            props.mayClose ?
               <DialogActions>
                  <QCancelButton disabled={false} onClickHandler={close} label="Close" />
               </DialogActions>
               : <Box>&nbsp;</Box>
         }
      </Dialog>
   );
}

interface GotoRecordButtonProps
{
   metaData: QInstance;
   tableMetaData: QTableMetaData;
   tableVariant?: QTableVariant;
   autoOpen?: boolean;
   buttonVisible?: boolean;
   mayClose?: boolean;
   subHeader?: JSX.Element;
}

GotoRecordButton.defaultProps = {
   autoOpen: false,
   buttonVisible: true,
   mayClose: true
};

export function GotoRecordButton(props: GotoRecordButtonProps): JSX.Element
{
   const [gotoIsOpen, setGotoIsOpen] = useState(props.autoOpen);

   function openGoto()
   {
      setGotoIsOpen(true);
   }

   function closeGoto()
   {
      setGotoIsOpen(false);
   }


   return (
      <React.Fragment>
         {
            props.buttonVisible && hasGotoFieldNames(props.tableMetaData) && <Button onClick={openGoto} sx={{whiteSpace: "nowrap"}}>Go To...</Button>
         }
         <GotoRecordDialog metaData={props.metaData} tableMetaData={props.tableMetaData} tableVariant={props.tableVariant} isOpen={gotoIsOpen} closeHandler={closeGoto} mayClose={props.mayClose} subHeader={props.subHeader} />
      </React.Fragment>
   );
}

export default GotoRecordDialog;
