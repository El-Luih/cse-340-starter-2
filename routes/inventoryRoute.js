const express = require('express');
const router = express.Router();
const invController = require('../controllers/invController');

router.get("/type/:classificationId", invController.buildByClassificationId);
router.get("/detail/:vehicleId", invController.buildByVehicleId);

module.exports = router;