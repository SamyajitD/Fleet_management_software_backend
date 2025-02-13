const express= require("express");
const router= express.Router();
const catchAsync= require("../utils/catchAsync.js");
const adminController= require("../controllers/adminController.js")

// router.route('/get-driver/:vehicleNo')
//     .get(catchAsync(adminController.getDriverByVehicleNo));

router.route('/get-all-employees')
    .get(catchAsync(adminController.fetchAllEmployees));

router.route('/get-all-drivers')
    .get(catchAsync(adminController.fetchAllDrivers));
    
router.route('/get-all-warehouses')
    .get(catchAsync(adminController.fetchAllWarehouses));
    
// router.route('/get-all-parcels')
//     .get(catchAsync(adminController.fetchAllParcels));

// router.route('/get-all-items')
    // .get(catchAsync(adminController.fetchAllItems));

// router.route('/get-all-ledgers')
//     .get(catchAsync(adminController.fetchAllLedgers));
    
router.route('/manage/driver')
    .post(catchAsync(adminController.addDriver))
    .put(catchAsync(adminController.updateDriver))
    .delete(catchAsync(adminController.deleteDriver));

router.route('/manage/employee')
    // .get(catchAsync(adminController.getEmployeeDetails))
    .put(catchAsync(adminController.updateEmployee))
    .delete(catchAsync(adminController.deleteEmployee));

router.route('/manage/warehouse')
    .post(catchAsync(adminController.addWarehouse))
    .put(catchAsync(adminController.updateWarehouse))
    .delete(catchAsync(adminController.deleteWarehouse));

router.route('/manage/parcel')
    .delete(catchAsync(adminController.deleteParcel));
    // .put(catchAsync(adminController.updateParcel)) //to be updated

router.route('/manage/ledger')
    .delete(catchAsync(adminController.deleteLedger));

module.exports= router;