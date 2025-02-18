const express= require("express");
const router= express.Router();
const catchAsync= require("../utils/catchAsync.js");
const adminController= require("../controllers/adminController.js")


router.route('/get-all-employees')
    .get(catchAsync(adminController.fetchAllEmployees));

router.route('/get-all-drivers')
    .get(catchAsync(adminController.fetchAllDrivers));

router.route('/get-all-warehouses')
    .get(catchAsync(adminController.fetchAllWarehouses));

router.route('/manage/driver')
    .post(catchAsync(adminController.addDriver))
    .put(catchAsync(adminController.updateDriver))
    .delete(catchAsync(adminController.deleteDriver));

router.route('/manage/employee')
    .put(catchAsync(adminController.updateEmployee))
    .delete(catchAsync(adminController.deleteEmployee));

router.route('/manage/warehouse')
    .post(catchAsync(adminController.addWarehouse))
    .put(catchAsync(adminController.updateWarehouse))
    .delete(catchAsync(adminController.deleteWarehouse));

router.route('/manage/parcel')
    .delete(catchAsync(adminController.deleteParcel));

router.route('/manage/ledger')
    .delete(catchAsync(adminController.deleteLedger));

router.route('/manage/regular-item')
    .get(catchAsync(adminController.getAllRegularItems))
    .post(catchAsync(adminController.addNewRegularItems))
    .delete(catchAsync(adminController.deleteRegularItem));

router.route('/manage/regular-client')
    .get(catchAsync(adminController.getAllRegularClients))
    .post(catchAsync(adminController.addNewRegularClient))
    .delete(catchAsync(adminController.deleteRegularClient));

module.exports= router;