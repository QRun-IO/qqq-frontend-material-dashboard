/*
 * QQQ - Low-code Application Framework for Engineers.
 * Copyright (C) 2021-2026.  Kingsrook, LLC
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

import {QTableMetaData} from "@qrunio/qqq-frontend-core/lib/model/metaData/QTableMetaData";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import Modal from "@mui/material/Modal";
import Typography from "@mui/material/Typography";
import {QCancelButton, QSaveButton} from "qqq/components/buttons/DefaultButtons";
import RecordScreenBody from "qqq/pages/records/RecordScreenBody";
import {useRecordScreen, UseRecordScreenOptions} from "qqq/pages/records/useRecordScreen";
import React, {useCallback, useEffect, useRef, useState} from "react";


interface RecordScreenModalProps
{
   open: boolean;
   onClose: (event: object, reason: string) => void;
   tableName: string;
   recordId?: string;
   defaultValues?: { [key: string]: any };
   disabledFields?: { [key: string]: boolean } | string[];
   overrideTableMetaData?: QTableMetaData;
   onSubmitCallback?: (values: any, tableName: string) => void;
   overrideHeading?: string;
   saveButtonLabel?: string;
   saveButtonIcon?: string;
}


/***************************************************************************
 ** Modal wrapper that renders RecordScreenBody inside a MUI Modal + Card.
 ** Used for child record create/edit modals.
 ***************************************************************************/
export default function RecordScreenModal({
   open,
   onClose,
   tableName,
   recordId,
   defaultValues,
   disabledFields,
   overrideTableMetaData,
   onSubmitCallback,
   overrideHeading,
   saveButtonLabel = "Save",
   saveButtonIcon = "save",
}: RecordScreenModalProps): JSX.Element
{
   const formikSubmitRef = useRef<() => void>(null);
   const scrollContainerRef = useRef<HTMLDivElement>(null);
   const sentinelRef = useRef<HTMLDivElement>(null);
   const [isSticking, setIsSticking] = useState(false);

   const options: UseRecordScreenOptions = {
      skipNavigation: true,
      defaultValues,
      disabledFields,
      overrideTableMetaData,
      onSubmitCallback,
   };

   const initialMode = recordId ? "edit" : "create";
   const screen = useRecordScreen(tableName, recordId, initialMode, false, options);

   useEffect(() =>
   {
      const sentinel = sentinelRef.current;
      const root = scrollContainerRef.current;
      if (!sentinel || !root) return;

      const observer = new IntersectionObserver(
         ([entry]) => setIsSticking(!entry.isIntersecting),
         {root, threshold: 0}
      );
      observer.observe(sentinel);
      return () => observer.disconnect();
   }, [screen.loading]);

   const heading = overrideHeading
      ?? (recordId
         ? `Editing ${screen.tableMetaData?.label ?? ""}`
         : `Creating New ${screen.tableMetaData?.label ?? ""}`);

   const handleModalClose = (event: object, reason: string) =>
   {
      if (reason === "backdropClick" || reason === "escapeKeyDown")
      {
         return;
      }
      onClose(event, reason);
   };

   const handleSubmit = async (values: any) =>
   {
      await screen.saveRecord(values);
      onClose(null, recordId ? "recordUpdated" : "recordCreated");
   };

   const handleCancel = () =>
   {
      onClose(null, "cancelled");
   };

   const renderBottomBar = (isSubmitting: boolean) => (
      <>
         <Box component="div" p={3} className={`stickyBottomButtonBar modalBottomButtonBar${isSticking ? " sticking" : ""}`}>
            <Grid container justifyContent="flex-end" spacing={3}>
               <QCancelButton onClickHandler={handleCancel} disabled={isSubmitting} />
               <QSaveButton disabled={isSubmitting} label={saveButtonLabel} iconName={saveButtonIcon} />
            </Grid>
         </Box>
         <div ref={sentinelRef} style={{height: "1px"}} />
      </>
   );

   return (
      <Modal open={open} onClose={handleModalClose}>
         <Box ref={scrollContainerRef} className="modalEditForm compactForm" sx={{position: "absolute", overflowY: "auto", maxHeight: "100%", width: "100%", "& form > .MuiGrid-container": {pb: "16px"}}}>
            <Card sx={{my: 5, mx: "auto", p: 4, pb: 0, maxWidth: "1024px"}}>
               <Box mb={2}>
                  <Typography variant="h5" fontWeight={500}>
                     {heading}
                  </Typography>
               </Box>

               {!screen.loading && (
                  <RecordScreenBody
                     screen={screen}
                     formId="record-screen-modal-form"
                     onSubmit={handleSubmit}
                     formikSubmitRef={formikSubmitRef}
                     renderBottomBar={renderBottomBar}
                     showSidebar={false}
                  />
               )}
            </Card>
         </Box>
      </Modal>
   );
}
