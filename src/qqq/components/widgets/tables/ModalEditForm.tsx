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

import {QTableMetaData} from "@qrunio/qqq-frontend-core/lib/model/metaData/QTableMetaData";
import Modal from "@mui/material/Modal";
import EntityForm from "qqq/components/forms/EntityForm";
import Client from "qqq/utils/qqq/Client";
import React, {useEffect, useReducer, useState} from "react";


////////////////////////////////
// structure of expected data //
////////////////////////////////
export interface ModalEditFormData
{
   tableName: string;
   defaultValues?: { [key: string]: string };
   disabledFields?: { [key: string]: boolean } | string[];
   overrideHeading?: string;
   onSubmitCallback?: (values: any, tableName: String) => void;
   initialShowModalValue?: boolean;
}

const qController = Client.getInstance();

function ModalEditForm({tableName, defaultValues, disabledFields, overrideHeading, onSubmitCallback, initialShowModalValue}: ModalEditFormData,): JSX.Element
{
   const [showModal, setShowModal] = useState(initialShowModalValue);
   const [table, setTable] = useState(null as QTableMetaData);
   const [, forceUpdate] = useReducer((x) => x + 1, 0);

   useEffect(() =>
   {
      if (!tableName)
      {
         return;
      }

      (async () =>
      {
         const tableMetaData = await qController.loadTableMetaData(tableName);
         setTable(tableMetaData);
         forceUpdate();
      })();
   }, [tableName]);

   /*******************************************************************************
    **
    *******************************************************************************/
   const closeEditChildForm = (event: object, reason: string) =>
   {
      if (reason === "backdropClick" || reason === "escapeKeyDown")
      {
         return;
      }

      setShowModal(null);
   };

   return (
      table && showModal &&
      <Modal open={showModal as boolean} onClose={(event, reason) => closeEditChildForm(event, reason)}>
         <div className="modalEditForm">
            <EntityForm
               isModal={true}
               closeModalHandler={closeEditChildForm}
               table={table}
               defaultValues={defaultValues}
               disabledFields={disabledFields}
               onSubmitCallback={onSubmitCallback}
               overrideHeading={overrideHeading}
            />
         </div>
      </Modal>
   );
}

export default ModalEditForm;
