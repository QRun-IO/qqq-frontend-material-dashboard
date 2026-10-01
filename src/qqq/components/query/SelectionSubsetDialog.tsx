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

import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";
import React, {useState} from "react";
import {QCancelButton, QSaveButton} from "qqq/components/buttons/DefaultButtons";


/*******************************************************************************
 ** Component that is the dialog for the user to enter the selection-subset
 *******************************************************************************/
export default function SelectionSubsetDialog(props: { isOpen: boolean; initialValue: number; closeHandler: (value?: number) => void })
{
   const [value, setValue] = useState(props.initialValue);

   const handleChange = (newValue: string) =>
   {
      setValue(parseInt(newValue));
   };

   const keyPressed = (e: React.KeyboardEvent<HTMLDivElement>) =>
   {
      if (e.key == "Enter" && value)
      {
         props.closeHandler(value);
      }
   };

   return (
      <Dialog open={props.isOpen} onClose={() => props.closeHandler()} onKeyPress={(e) => keyPressed(e)}>
         <DialogTitle>Subset of the Query Result</DialogTitle>
         <DialogContent>
            <DialogContentText>How many records do you want to select?</DialogContentText>
            <TextField
               autoFocus
               name="selection-subset-size"
               inputProps={{width: "100%", type: "number", min: 1}}
               onChange={(e) => handleChange(e.target.value)}
               value={value}
               sx={{width: "100%"}}
               onFocus={event => event.target.select()}
            />
         </DialogContent>
         <DialogActions>
            <QCancelButton disabled={false} onClickHandler={() => props.closeHandler()} />
            <QSaveButton label="OK" iconName="check" disabled={value == undefined || isNaN(value)} onClickHandler={() => props.closeHandler(value)} />
         </DialogActions>
      </Dialog>
   );
}

