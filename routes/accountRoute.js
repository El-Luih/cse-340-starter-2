const regValidate = require('../utilities/account-validation')
const express = require('express')
const router = express.Router()
const accountController = require('../controllers/accountController')
const utilities = require('../utilities')
const validate = require('../utilities/account-validation')

//GET REQUESTS
//Account Mangement View
//Requires a logged in user
router.get(
  "/",
  utilities.checkLogin,
  utilities.handleErrors(accountController.buildAccountManagement))
//Logout button
router.get("/logout", utilities.handleErrors(accountController.accountLogout))
//Login View
router.get("/login", utilities.handleErrors(accountController.buildLogin))
//Registration View
router.get("/registration", utilities.handleErrors(accountController.buildRegistration))
//Account Details View
//Requires a logged in user
router.get(
  "/details",
  utilities.checkLogin,  
  utilities.handleErrors(accountController.buildAccountDetailsView)
)

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
account_email: lelelolo@gmail.com
account_password:  1!Abcdefghik
*/

//POST REQUESTS
// Process the registration data
router.post(
  "/registration",
  regValidate.registationRules(),
  regValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
)

// Processes the login attempt
router.post(
  "/login",
  regValidate.loginRules(),
  regValidate.checkLoginData,
  utilities.handleErrors(accountController.accountLogin)
)
// Process the account details update
//Requires a logged in user
router.post(
  "/details/information",
  utilities.checkLogin,
  regValidate.updateDetailsRules(),
  regValidate.checkDetailsData,
  utilities.handleErrors(accountController.updateAccountDetails)
)










// Process the account password update
//Requires a logged in user
//////////////NOT COMPLETED//////////////
router.post(
  "/details/password",
  utilities.checkLogin,
  regValidate.updatePasswordRules(),
  regValidate.checkPasswodData,
  utilities.handleErrors(accountController.updateAccountPassword)
)



module.exports = router;