const regValidate = require('../utilities/account-validation')
const express = require('express')
const router = express.Router()
const accountController = require('../controllers/accountController')
const utilities = require('../utilities')

//GET REQUESTS
router.get("/login", utilities.handleErrors(accountController.buildLogin))
router.get("/registration", utilities.handleErrors(accountController.buildRegistration))
//POST REQUESTS
// Process the registration data
router.post(
  "/registration",
  regValidate.registationRules(),
  regValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
)

module.exports = router;