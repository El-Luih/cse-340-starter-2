const express = require('express')
const router = express.Router()
const invController = require('../controllers/invController')
const utilities = require('../utilities')
const addValidate = require('../utilities/adding-validation')

router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId));
router.get("/detail/:vehicleId", utilities.handleErrors(invController.buildByVehicleId));


/******MANAGEMENT ROUTES******/
//
// GET ROUTES //
//Classification Management
router.get("/management/classification", utilities.handleErrors(invController.buildAddClassView))
//Inventory Management
router.get("/management/inventory", utilities.handleErrors(invController.buildAddInvView))
//Management View
router.get("/", utilities.handleErrors(invController.buildManagementView))

// DATA RETRIEVAL AND MODIFICATION //
//Get Inventory by Classification
router.get("/getInventory/:classification_id", utilities.handleErrors(invController.getInventoryJSON))
//Modify Inventory Entry
router.get("/edit/:inventory_id", utilities.handleErrors(invController.editInventoryView))
//Delete Inventory Entry
router.get("/delete/:inventory_id", utilities.handleErrors())



// POST ROUTES //
//Add Classification
router.post(
    "/management/classification",
    addValidate.classAddingRules(),
    addValidate.checkClassData,
    utilities.handleErrors(invController.addClassName)
)
//Add Vehicle
router.post(
    "/management/inventory",
    addValidate.invAddingRules(),
    addValidate.checkVehicleData,
    utilities.handleErrors(invController.addVehicleToInventory)
)

//Edit vehicle
router.post(
    "/update/",
    addValidate.invEditRules(),
    addValidate.checkUpdateData,
    utilities.handleErrors(invController.updateVehicle)
)

module.exports = router;