const regValidate = require('../utilities/account-validation')
const express = require('express')
const router = express.Router()
const accountController = require('../controllers/accountController')
const utilities = require('../utilities')
const validate = require('../utilities/account-validation')

//GET REQUESTS
router.get(
  "/",
  utilities.checkLogin,
  utilities.handleErrors(accountController.buildAccountManagement))
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
// Process the login attempt
/*
account_firstname: Basic
account_lastname: Client
account_email: basic@340.edu
account_password: I@mABas1cCl!3nt
account_firstname: Happy
account_lastname: Employee
account_email: happy@340.edu
account_password: I@mAnEmpl0y33
account_firstname: Manager
account_lastname: User
account_email: manager@340.edu
account_password: I@mAnAdm!n1strat0r
account_email: lululala@gmail.com
account_password: Ab1"34567890
*/
router.post(
  "/login",
  regValidate.loginRules(),
  regValidate.checkLoginData,
  utilities.handleErrors(accountController.accountLogin))

module.exports = router;