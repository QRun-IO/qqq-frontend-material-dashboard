/*
 * QQQ - Low-code Application Framework for Engineers.
 * Copyright (C) 2021-2023.  Kingsrook, LLC
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
import Checkbox from "@mui/material/Checkbox/Checkbox";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import {makeStyles} from "@mui/styles";
import {useState} from "react";
import BaseLayout from "qqq/layouts/BaseLayout";


interface Props
{
   foo: string;
}

IntersectionMatrix.defaultProps = {
   foo: null,
};

const useStyles = makeStyles({
   sticky: {
      position: "sticky",
      left: 0,
      top: 0,
      background: "white",
      boxShadow: "2px 2px 2px grey",
      borderRight: "2px solid grey",
      zIndex: 1
   }
});

function IntersectionMatrix({foo}: Props): JSX.Element
{
   const permissions = ["apiLog.delete", "apiLog.edit", "apiLog.insert", "apiLog.read", "apiLogUser.delete", "apiLogUser.edit", "apiLogUser.insert", "apiLogUser.read", "audit.delete", "audit.edit", "audit.insert", "audit.read", "auditDetail.delete", "auditDetail.edit", "auditDetail.insert", "auditDetail.read", "auditTable.delete", "auditTable.edit", "auditTable.insert", "auditTable.read", "auditUser.delete", "auditUser.edit", "auditUser.insert", "auditUser.read", "availableInventoryIndex.delete", "availableInventoryIndex.edit", "availableInventoryIndex.insert", "availableInventoryIndex.read", "availablePermission.delete", "availablePermission.edit", "availablePermission.insert", "availablePermission.read", "billing.hasAccess", "billingActivity.delete", "billingActivity.edit", "billingActivity.insert", "billingActivity.read", "billingDashboard.hasAccess", "billingWorksheet.delete", "billingWorksheet.edit", "billingWorksheet.insert", "billingWorksheet.read", "billingWorksheetLine.delete", "billingWorksheetLine.edit", "billingWorksheetLine.insert", "billingWorksheetLine.read", "billingWorksheetLineDetail.hasAccess", "billingWorksheetRevenueReport.hasAccess", "billingWorksheetSummary.hasAccess", "blackboxCartonization.delete", "blackboxCartonization.edit", "blackboxCartonization.insert", "blackboxCartonization.read", "blackboxStatus.delete", "blackboxStatus.edit", "blackboxStatus.insert", "blackboxStatus.read", "cancelBillingWorksheet.hasAccess", "carrier.delete", "carrier.edit", "carrier.insert", "carrier.read", "carrierAccount.delete", "carrierAccount.edit", "carrierAccount.insert", "carrierAccount.read", "carrierInvoicing.hasAccess", "carrierPerformance.hasAccess", "carrierPerformanceDashboard.hasAccess", "carrierRevenueReport.hasAccess", "carrierService.delete", "carrierService.edit", "carrierService.insert", "carrierService.read", "carrierServiceSlaExclusionDate.delete", "carrierServiceSlaExclusionDate.edit", "carrierServiceSlaExclusionDate.insert", "carrierServiceSlaExclusionDate.read", "cartonType.delete", "cartonType.edit", "cartonType.insert", "cartonType.read", "cartonization.hasAccess", "client.delete", "client.edit", "client.insert", "client.read", "clientAlias.delete", "clientAlias.edit", "clientAlias.insert", "clientAlias.read", "clientAuth0Application.delete", "clientAuth0Application.edit", "clientAuth0Application.insert", "clientAuth0Application.read", "clientAuth0ApplicationApiKey.delete", "clientAuth0ApplicationApiKey.edit", "clientAuth0ApplicationApiKey.insert", "clientAuth0ApplicationApiKey.read", "clientBillingKey.delete", "clientBillingKey.edit", "clientBillingKey.insert", "clientBillingKey.read", "clientFeeKey.delete", "clientFeeKey.edit", "clientFeeKey.insert", "clientFeeKey.read", "clientShipStationStore.delete", "clientShipStationStore.edit", "clientShipStationStore.insert", "clientShipStationStore.read", "closeBillingWorksheet.hasAccess", "connection.delete", "connection.edit", "connection.insert", "connection.read", "createBillingWorksheet.hasAccess", "createTestOrdersProcess.hasAccess", "dashboard.hasAccess", "dashboards.hasAccess", "dataBag.delete", "dataBag.edit", "dataBag.insert", "dataBag.read", "dataBagVersion.delete", "dataBagVersion.edit", "dataBagVersion.insert", "dataBagVersion.read", "dataHealthDashboard.hasAccess", "dataIndex.delete", "dataIndex.edit", "dataIndex.insert", "dataIndex.read", "deleteSavedFilter.hasAccess", "deposcoCreateTestOrdersJob.delete", "deposcoCreateTestOrdersJob.edit", "deposcoCreateTestOrdersJob.insert", "deposcoCreateTestOrdersJob.read", "deposcoCreateTestOrdersProcess.hasAccess", "deposcoCurrentExceptionsWidget.hasAccess", "deposcoCurrentStatusWidget.hasAccess", "deposcoCustomerOrder.delete", "deposcoCustomerOrder.edit", "deposcoCustomerOrder.insert", "deposcoCustomerOrder.read", "deposcoEnterpriseInventory.delete", "deposcoEnterpriseInventory.edit", "deposcoEnterpriseInventory.insert", "deposcoEnterpriseInventory.read", "deposcoItem.delete", "deposcoItem.edit", "deposcoItem.insert", "deposcoItem.read", "deposcoOrder.delete", "deposcoOrder.edit", "deposcoOrder.insert", "deposcoOrder.read", "deposcoOrderToOrder.hasAccess", "deposcoOrdersApp.hasAccess", "deposcoOrdersByClientPieChart.hasAccess", "deposcoPollForCustomerOrders.hasAccess", "deposcoPollForOrders.hasAccess", "deposcoRecentDataParentWidget.hasAccess", "deposcoReplaceLineItemProcess.hasAccess", "deposcoSalesOrder.delete", "deposcoSalesOrder.edit", "deposcoSalesOrder.insert", "deposcoSalesOrder.read", "deposcoSalesOrderLine.delete", "deposcoSalesOrderLine.edit", "deposcoSalesOrderLine.insert", "deposcoSalesOrderLine.read", "deposcoSalesOrdersBarChart.hasAccess", "deposcoSentOrder.delete", "deposcoSentOrder.edit", "deposcoSentOrder.insert", "deposcoSentOrder.read", "deposcoShipment.delete", "deposcoShipment.edit", "deposcoShipment.insert", "deposcoShipment.read", "deposcoShipmentToSystemGeneratedTrackingNo.hasAccess", "deposcoTradingPartner.delete", "deposcoTradingPartner.edit", "deposcoTradingPartner.insert", "deposcoTradingPartner.read", "developer.hasAccess", "easypostTracker.delete", "easypostTracker.edit", "easypostTracker.insert", "easypostTracker.read", "extensivOrder.delete", "extensivOrder.edit", "extensivOrder.insert", "extensivOrder.read", "extensivOrderToOrder.hasAccess", "fedexTntCache.delete", "fedexTntCache.edit", "fedexTntCache.insert", "fedexTntCache.read", "freightStudy.delete", "freightStudy.edit", "freightStudy.insert", "freightStudy.read", "freightStudyActualShipment.delete", "freightStudyActualShipment.edit", "freightStudyActualShipment.insert", "freightStudyActualShipment.read", "freightStudyAllShipmentsReport.hasAccess", "freightStudyAllShipmentsReportProcess.hasAccess", "freightStudyApp.hasAccess", "freightStudyEstimateShipments.hasAccess", "freightStudyEstimatedShipment.delete", "freightStudyEstimatedShipment.edit", "freightStudyEstimatedShipment.insert", "freightStudyEstimatedShipment.read", "freightStudyScenario.delete", "freightStudyScenario.edit", "freightStudyScenario.insert", "freightStudyScenario.read", "fuelSurcharge.delete", "fuelSurcharge.edit", "fuelSurcharge.insert", "fuelSurcharge.read", "fulfillment.hasAccess", "generateBillingActivityFromBillingWorksheet.hasAccess", "generateBillingWorksheetDocuments.hasAccess", "generateParcelInvoiceLineFromRawAxleHire.hasAccess", "generateParcelInvoiceLineFromRawCdl.hasAccess", "generateParcelInvoiceLineFromRawFedEx.hasAccess", "generateParcelInvoiceLineFromRawLso.hasAccess", "generateParcelInvoiceLineFromRawOntrac.hasAccess", "generateParcelInvoiceLineFromRawUps.hasAccess", "graceDiscountAuditReport.hasAccess", "infoplusLOB.delete", "infoplusLOB.edit", "infoplusLOB.insert", "infoplusLOB.read", "infoplusOrder.delete", "infoplusOrder.edit", "infoplusOrder.insert", "infoplusOrder.read", "infoplusOrderToOrder.hasAccess", "infoplusShipment.delete", "infoplusShipment.edit", "infoplusShipment.insert", "infoplusShipment.read", "infoplusShipmentToSystemGeneratedTrackingNumber.hasAccess", "infoplusWarehouse.delete", "infoplusWarehouse.edit", "infoplusWarehouse.insert", "infoplusWarehouse.read", "initParcelSlaStatus.hasAccess", "integrations.hasAccess", "lineItem.delete", "lineItem.edit", "lineItem.insert", "lineItem.read", "manualUpdateInvoiceLineFromRaw.hasAccess", "markBillingActivityAsException.hasAccess", "markParcelInvoiceLineAsOrphan.hasAccess", "mergeDuplicatedParcels.hasAccess", "omsOperationsDashboard.hasAccess", "optimization.hasAccess", "optimizationCarrierServiceRulesChecker.hasAccess", "optimizationCarrierServiceStateRule.delete", "optimizationCarrierServiceStateRule.edit", "optimizationCarrierServiceStateRule.insert", "optimizationCarrierServiceStateRule.read", "optimizationCarrierServiceTNTRule.delete", "optimizationCarrierServiceTNTRule.edit", "optimizationCarrierServiceTNTRule.insert", "optimizationCarrierServiceTNTRule.read", "optimizationCarrierServiceZipCodeRule.delete", "optimizationCarrierServiceZipCodeRule.edit", "optimizationCarrierServiceZipCodeRule.insert", "optimizationCarrierServiceZipCodeRule.read", "optimizationConfig.delete", "optimizationConfig.edit", "optimizationConfig.insert", "optimizationConfig.read", "optimizationConfigApp.hasAccess", "optimizationDashboard.hasAccess", "optimizationRateChecker.hasAccess", "optimizationRulesChecker.hasAccess", "optimizationStateRule.delete", "optimizationStateRule.edit", "optimizationStateRule.insert", "optimizationStateRule.read", "optimizationTNTRule.delete", "optimizationTNTRule.edit", "optimizationTNTRule.insert", "optimizationTNTRule.read", "optimizationWarehouseRoutingStateRule.delete", "optimizationWarehouseRoutingStateRule.edit", "optimizationWarehouseRoutingStateRule.insert", "optimizationWarehouseRoutingStateRule.read", "optimizationWarehouseRoutingZipCodeRule.delete", "optimizationWarehouseRoutingZipCodeRule.edit", "optimizationWarehouseRoutingZipCodeRule.insert", "optimizationWarehouseRoutingZipCodeRule.read", "optimizationZipCodeRule.delete", "optimizationZipCodeRule.edit", "optimizationZipCodeRule.insert", "optimizationZipCodeRule.read", "order.delete", "order.edit", "order.insert", "order.read", "orderAndShipmentPerformanceDashboard.hasAccess", "orderCarton.delete", "orderCarton.edit", "orderCarton.insert", "orderCarton.read", "orderCartonization.delete", "orderCartonization.edit", "orderCartonization.insert", "orderCartonization.read", "orderExtrinsic.delete", "orderExtrinsic.edit", "orderExtrinsic.insert", "orderExtrinsic.read", "orderOptimization.hasAccess", "orders.hasAccess", "ordersAndShipmentsReport.hasAccess", "outboundApiLog.delete", "outboundApiLog.edit", "outboundApiLog.insert", "outboundApiLog.read", "outboundScannedTrackingNumber.delete", "outboundScannedTrackingNumber.edit", "outboundScannedTrackingNumber.insert", "outboundScannedTrackingNumber.read", "outboundScannedTrackingNumberToParcel.hasAccess", "overview.hasAccess", "overviewDashboard.hasAccess", "parcel.delete", "parcel.edit", "parcel.insert", "parcel.read", "parcelHealthApp.hasAccess", "parcelInvoice.delete", "parcelInvoice.edit", "parcelInvoice.insert", "parcelInvoice.read", "parcelInvoiceLine.delete", "parcelInvoiceLine.edit", "parcelInvoiceLine.insert", "parcelInvoiceLine.read", "parcelInvoiceLineChargeMappingRule.delete", "parcelInvoiceLineChargeMappingRule.edit", "parcelInvoiceLineChargeMappingRule.insert", "parcelInvoiceLineChargeMappingRule.read", "parcelInvoiceLineChargeRollupRule.read", "parcelInvoiceLineToParcel.hasAccess", "parcelInvoiceRawETLAxleHire.hasAccess", "parcelInvoiceRawETLCdl.hasAccess", "parcelInvoiceRawETLFedEx.hasAccess", "parcelInvoiceRawETLLso.hasAccess", "parcelInvoiceRawETLOntrac.hasAccess", "parcelInvoiceRawETLUps.hasAccess", "parcelInvoiceShiplabsSyncAxleHire.hasAccess", "parcelInvoiceShiplabsSyncCdl.hasAccess", "parcelInvoiceShiplabsSyncFedEx.hasAccess", "parcelInvoiceShiplabsSyncLso.hasAccess", "parcelInvoiceShiplabsSyncOntrac.hasAccess", "parcelInvoiceShiplabsSyncUps.hasAccess", "parcelSlaStatus.delete", "parcelSlaStatus.edit", "parcelSlaStatus.insert", "parcelSlaStatus.read", "parcelTrackingDetail.delete", "parcelTrackingDetail.edit", "parcelTrackingDetail.insert", "parcelTrackingDetail.read", "parcels.hasAccess", "pollExtensiveForOrders.hasAccess", "pushDeposcoSalesOrders.hasAccess", "querySavedFilter.hasAccess", "rawParcelInvoiceLineAxleHire.delete", "rawParcelInvoiceLineAxleHire.edit", "rawParcelInvoiceLineAxleHire.insert", "rawParcelInvoiceLineAxleHire.read", "rawParcelInvoiceLineCdl.delete", "rawParcelInvoiceLineCdl.edit", "rawParcelInvoiceLineCdl.insert", "rawParcelInvoiceLineCdl.read", "rawParcelInvoiceLineFedEx.delete", "rawParcelInvoiceLineFedEx.edit", "rawParcelInvoiceLineFedEx.insert", "rawParcelInvoiceLineFedEx.read", "rawParcelInvoiceLineLso.delete", "rawParcelInvoiceLineLso.edit", "rawParcelInvoiceLineLso.insert", "rawParcelInvoiceLineLso.read", "rawParcelInvoiceLineOntrac.delete", "rawParcelInvoiceLineOntrac.edit", "rawParcelInvoiceLineOntrac.insert", "rawParcelInvoiceLineOntrac.read", "rawParcelInvoiceLineUps.delete", "rawParcelInvoiceLineUps.edit", "rawParcelInvoiceLineUps.insert", "rawParcelInvoiceLineUps.read", "receiveEasypostTrackerWebhook.hasAccess", "reconcileClientsOnParcelInvoiceLine.hasAccess", "reconcileClientsOnParcelInvoiceLineFromBillingWorksheet.hasAccess", "reevaluateParcelSlaStatus.hasAccess", "registerParcelAsEasypostTracker.hasAccess", "releaseOrderToWmsProcess.hasAccess", "releaseOrdersJob.delete", "releaseOrdersJob.edit", "releaseOrdersJob.insert", "releaseOrdersJob.read", "releaseOrdersJobOrder.delete", "releaseOrdersJobOrder.edit", "releaseOrdersJobOrder.insert", "releaseOrdersJobOrder.read", "releaseOrdersToWmsProcess.hasAccess", "replaceLineItem.hasAccess", "resyncOrderFromSource.hasAccess", "resyncParcelTrackingStatus.hasAccess", "resyncSystemGeneratedTrackingNumberFromSource.hasAccess", "retrySendingReleaseOrdersJob.hasAccess", "runBillingWorksheetRevenueReport.hasAccess", "runRecordScript.hasAccess", "salesOrderAutomation.hasAccess", "savedFilter.delete", "savedFilter.edit", "savedFilter.insert", "savedFilter.read", "script.delete", "script.edit", "script.insert", "script.read", "scriptLog.delete", "scriptLog.edit", "scriptLog.insert", "scriptLog.read", "scriptLogLine.delete", "scriptLogLine.edit", "scriptLogLine.insert", "scriptLogLine.read", "scriptRevision.delete", "scriptRevision.edit", "scriptRevision.insert", "scriptRevision.read", "scriptType.delete", "scriptType.edit", "scriptType.insert", "scriptType.read", "setup.hasAccess", "shipStationOrder0.delete", "shipStationOrder0.edit", "shipStationOrder0.insert", "shipStationOrder0.read", "shipStationOrderToOrder0.hasAccess", "shipStationShipment0.delete", "shipStationShipment0.edit", "shipStationShipment0.insert", "shipStationShipment0.read", "shipStationShipmentToSystemGeneratedTrackingNumber0.hasAccess", "shipStationShipmentToSystemGeneratedTrackingNumber1.hasAccess", "shipStationShipmentToSystemGeneratedTrackingNumber2.hasAccess", "shipStationShipmentToSystemGeneratedTrackingNumber3.hasAccess", "shipStationShipmentToSystemGeneratedTrackingNumber4.hasAccess", "shipStationStore0.delete", "shipStationStore0.edit", "shipStationStore0.insert", "shipStationStore0.read", "shipStationWarehouse0.delete", "shipStationWarehouse0.edit", "shipStationWarehouse0.insert", "shipStationWarehouse0.read", "shippedOrderToExtensivOrder.hasAccess", "shipping.hasAccess", "shippingDashboard.hasAccess", "storeDataBagVersion.hasAccess", "storeSavedFilter.hasAccess", "storeScriptRevision.hasAccess", "systemGeneratedTrackingNumber.delete", "systemGeneratedTrackingNumber.edit", "systemGeneratedTrackingNumber.insert", "systemGeneratedTrackingNumber.read", "systemGeneratedTrackingNumberToParcel.hasAccess", "tableTrigger.delete", "tableTrigger.edit", "tableTrigger.insert", "tableTrigger.read", "testScript.hasAccess", "totalDeposcoOrdersImported.hasAccess", "uploadFileArchive.delete", "uploadFileArchive.edit", "uploadFileArchive.insert", "uploadFileArchive.read", "warehouse.delete", "warehouse.edit", "warehouse.insert", "warehouse.read", "warehouseClientInt.delete", "warehouseClientInt.edit", "warehouseClientInt.insert", "warehouseClientInt.read", "warehouseShipStationWarehouse.delete", "warehouseShipStationWarehouse.edit", "warehouseShipStationWarehouse.insert", "warehouseShipStationWarehouse.read", "zipZone.delete", "zipZone.edit", "zipZone.insert", "zipZone.read", "zipZoneCdl.delete", "zipZoneCdl.edit", "zipZoneCdl.insert", "zipZoneCdl.read"];
   permissions.splice(50)
   const roles = ["External - Customer - OMS API User", "External - Customer - Reports API", "External - Customer - Viewer", "External - Deposco - Cartonization API", "External - Optimization - Viewer", "Internal - Carrier Invoicing - Admin", "Internal - Carrier Invoicing - User", "Internal - Carrier Invoicing - Viewer", "Internal - Developer - Admin", "Internal - Engineering Team - Admin", "Internal - Executive Team", "Internal - Freight Study - Admin", "Internal - Freight Study - User", "Internal - Freight Study - Viewer", "Internal - Integrations - Viewer", "Internal - Optimization - Admin", "Internal - Optimization - User", "Internal - Optimization - Viewer", "Internal - Orders & Parcels - Admin", "Internal - Orders & Parcels - User"];

   const classes = useStyles();

   return (
      <BaseLayout>
         <TableContainer sx={{maxHeight: "calc(100vh - 200px)"}}>
            <Table stickyHeader>
               <TableHead sx={{display: "table-row-group", zIndex: 3}}> {/* display: fixes apparent bug in mui? */}
                  <TableRow>
                     <TableCell className={classes.sticky} sx={{zIndex: "3 !important"}}></TableCell>
                     {
                        roles.map((name) => (
                           <TableCell key={name} sx={{minWidth: "100px", verticalAlign: "bottom"}}>
                              {name}
                           </TableCell>
                        ))
                     }
                  </TableRow>
               </TableHead>
               <TableBody>
                  {
                     permissions.map((name) => (
                        <TableRow key={name} hover>
                           <TableCell className={classes.sticky} component="th" scope="row">
                              {name.split(/(?=[A-Z.])/).map((part, index) => (
                                 <span key={index}>{part}<wbr /></span>
                              ))}
                           </TableCell>
                           {
                              roles.map((role) => (
                                 <TableCell key={role} align="center">
                                    <Checkbox checked={(name.length + role.length) % 3 == 1} />
                                 </TableCell>
                              ))
                           }
                        </TableRow>
                     ))
                  }
               </TableBody>
            </Table>
         </TableContainer>
      </BaseLayout>
   );

   return (
      <BaseLayout>
         <Box>
            {
               permissions.map((name) =>
               {
                  return (
                     <Box key={name}>
                        {name}
                     </Box>
                  )
               })
            }
         </Box>
      </BaseLayout>
   );
}

export default IntersectionMatrix;
