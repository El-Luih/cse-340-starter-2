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

// POST ROUTES //
//Classification Management
router.post(
    "/management/classification",
    addValidate.classAddingRules(),
    addValidate.checkClassData,
    utilities.handleErrors(invController.addClassName)
)

router.post(
    "/management/inventory",
    addValidate.invAddingRules(),
    addValidate.checkVehicleData,
    utilities.handleErrors(invController.addVehicleToInventory)
)

module.exports = router;