const express = require('express')
const router = express.Router()
const accountController = require('../controllers/accountController')
const utilities = require('../utilities')

//GET REQUESTS
router.get("/login", utilities.handleErrors(accountController.buildLogin))
router.get("/registration", utilities.handleErrors(accountController.buildRegistration))
//POST REQUESTS
router.post("/registration", utilities.handleErrors(accountController.registerAccount))

module.exports = router;