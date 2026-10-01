/*
 * QQQ - Low-code Application Framework for Engineers.
 * Copyright (C) 2021-2024.  Kingsrook, LLC
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

import {QTableMetaData} from "@qrunio/qqq-frontend-core/lib/model/metaData/QTableMetaData";
import {QTableVariant} from "@qrunio/qqq-frontend-core/lib/model/metaData/QTableVariant";
import Autocomplete from "@mui/material/Autocomplete";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";
import React, {useEffect, useState} from "react";
import {TABLE_VARIANT_LOCAL_STORAGE_KEY_ROOT} from "qqq/pages/records/query/RecordQuery";
import Client from "qqq/utils/qqq/Client";

const qController = Client.getInstance();

/*******************************************************************************
 ** Component that is the dialog for the user to select a variant on tables with variant backends //
 *******************************************************************************/
export default function TableVariantDialog(props: { isOpen: boolean; table: QTableMetaData; closeHandler: (value?: QTableVariant) => void })
{
   const [value, setValue] = useState(null);
   const [dropDownOpen, setDropDownOpen] = useState(false);
   const [variants, setVariants] = useState(null);

   const handleVariantChange = (event: React.SyntheticEvent, value: any | any[], reason: string, details?: string) =>
   {
      const tableVariantLocalStorageKey = `${TABLE_VARIANT_LOCAL_STORAGE_KEY_ROOT}.${props.table.name}`;
      if (value != null)
      {
         localStorage.setItem(tableVariantLocalStorageKey, JSON.stringify(value));
      }
      else
      {
         localStorage.removeItem(tableVariantLocalStorageKey);
      }
      props.closeHandler(value);
   };

   const keyPressed = (e: React.KeyboardEvent<HTMLDivElement>) =>
   {
      if (e.key == "Enter" && value)
      {
         props.closeHandler(value);
      }
   };

   useEffect(() =>
   {
      console.log("queryVariants");
      try
      {
         (async () =>
         {
            const variants = await qController.tableVariants(props.table.name);
            console.log(JSON.stringify(variants));
            setVariants(variants);
         })();
      }
      catch (e)
      {
         console.log(e);
      }
   }, []);


   return variants && (
      <Dialog open={props.isOpen} onKeyPress={(e) => keyPressed(e)}>
         <DialogTitle>{props.table.variantTableLabel}</DialogTitle>
         <DialogContent>
            <DialogContentText>Select the {props.table.variantTableLabel} to be used on this table:</DialogContentText>
            <Autocomplete
               id="tableVariantId"
               sx={{width: "400px", marginTop: "10px"}}
               open={dropDownOpen}
               size="small"
               onOpen={() =>
               {
                  setDropDownOpen(true);
               }}
               onClose={() =>
               {
                  setDropDownOpen(false);
               }}
               // @ts-ignore
               onChange={handleVariantChange}
               isOptionEqualToValue={(option, value) => option.id === value.id}
               options={variants}
               renderInput={(params) => <TextField {...params} label={props.table.variantTableLabel} />}
               getOptionLabel={(option) =>
               {
                  if (typeof option == "object")
                  {
                     return (option as QTableVariant).name;
                  }
                  return option;
               }}
            />
         </DialogContent>
      </Dialog>
   );
}

