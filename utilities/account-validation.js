const utilities = require('.')
const { body, validationResult } = require("express-validator")
const accountModel = require('../models/account-model')

const validate = {}

/*  **********************************
  *  Registration Data Validation Rules
  * ********************************* */
validate.registrationRules = () => {
    return [
      // firstname is required and must be string
      body("account_firstname")
        .trim()
        .escape()
        .notEmpty()
        .isLength({ min: 1 })
        .withMessage("Please provide a first name."), // on error this message is sent.
  
      // lastname is required and must be string
      body("account_lastname")
        .trim()
        .escape()
        .notEmpty()
        .isLength({ min: 2 })
        .withMessage("Please provide a last name."), // on error this message is sent.
  
      // valid email is required and cannot already exist in the DB
      body("account_email")
      .trim()
      .escape()
      .notEmpty()
      .isEmail()
      .normalizeEmail() // refer to validator.js docs
      .withMessage("A valid email is required.")
      .custom(async (account_email) => {
        const emailExists = await accountModel.checkExistingEmail(account_email)
        if (emailExists){
          throw new Error("Email exists. Please log in or use a different email")
        }
      }),
      
  
      // password is required and must be strong password
      body("account_password")
        .trim()
        .notEmpty()
        .isStrongPassword({
          minLength: 12,
          minLowercase: 1,
          minUppercase: 1,
          minNumbers: 1,
          minSymbols: 1,
        })
        .withMessage("Password does not meet requirements."),
      
      //New validation rule to validate the confirm_password pattern and compare it to the entered password.
      body("confirm_password")
        .trim()
        .notEmpty()
        .isStrongPassword({
          minLength: 12,
          minLowercase: 1,
          minUppercase: 1,
          minNumbers: 1,
          minSymbols: 1,
        })
        .withMessage("Password confirmation does not meet requirements.")
        .custom((confirm_password, { req }) => {
            if (confirm_password !== req.body.account_password) {
              throw new Error("Your password confirmation must match your given password")
          }
          return true
          })
    ]
}
  
/* ******************************
 * Check data and return errors or continue to registration
 * ***************************** */
validate.checkRegData = async (req, res, next) => {
  const { account_firstname, account_lastname, account_email } = req.body
  let errors = []
  errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    res.render("account/registration", {
      errors,
      title: "Registration",
      nav,
      account_firstname,
      account_lastname,
      account_email,
    })
    return
  }
  next()
}


///////////LOGIN VALIDATION///////////
validate.loginRules = () => {
  return [
    body("account_email")
      .trim()
      .escape()
      .notEmpty()
      .isEmail()
      .normalizeEmail() // refer to validator.js docs
      .withMessage("A valid email is required."),
    
    body("account_password")
        .trim()
        .notEmpty()
        .isStrongPassword({
          minLength: 12,
          minLowercase: 1,
          minUppercase: 1,
          minNumbers: 1,
          minSymbols: 1,
        })
        .withMessage("Enter a valid password."),
  ]
}

validate.checkLoginData = async (req, res, next) => {
  let errors = []
  const { account_email } = req.body
  errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    res.render("account/login", {
      errors,
      title: "Login",
      nav,
      account_email
    })
    return
  }
  next()
}

///////////UPDATE DETAILS VALIDATION///////////}
validate.updateDetailsRules = () => { 
  return [
    body("account_id")
      .trim()
      .escape()
      .notEmpty()
      .isNumeric()
      .withMessage("Invalid account ID.")
      .custom(async function (account_id) {
          const IDExist = await accountModel.checkExistingID(account_id)
          if (IDExist == false) {
              throw new Error("Account ID doesnt exist.")
          }
      }),

    body("account_firstname")
        .trim()
        .escape()
        .notEmpty()
        .isLength({ min: 1 })
        .withMessage("Please provide a first name."), 
  
     
    body("account_lastname")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 2 })
      .withMessage("Please provide a last name."), 

    body("account_email")
      .trim()
      .escape()
      .notEmpty()
      .isEmail()
      .normalizeEmail() // refer to validator.js docs
      .withMessage("A valid email is required.")
      .custom(async (account_email, { req }) => {
        const emailExists = await accountModel.checkExistingEmail(account_email)
        const currentAccount = await accountModel.getAccountByID(req.body.account_id)
        const currentEmail = currentAccount.account_email
        if (emailExists && account_email != currentEmail){
          throw new Error("Email exists. Please change to a different email")
        }
      }),
    
    //New validation rule for the current password confirmation
    body("old_password")
        .trim()
        .notEmpty()
        .isStrongPassword({
          minLength: 12,
          minLowercase: 1,
          minUppercase: 1,
          minNumbers: 1,
          minSymbols: 1,
        })
        .withMessage("Enter a valid password.")
  ]
}
validate.checkDetailsData = async (req, res, next) => {
  let errors = []
  const { account_email, account_firstname, account_lastname } = req.body
  errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    res.render("account/details", {
      errors,
      title: "Account Information",
      nav,
      account_email,
      account_firstname,
      account_lastname
    })
    return
  }
  next()
}

///////////UPDATE PASSWORD VALIDATION///////////
validate.updatePasswordRules = () => { 
  return [
    body("account_id")
      .trim()
      .escape()
      .notEmpty()
      .isNumeric()
      .withMessage("Invalid account ID.")
      .custom(async function (account_id) {
          const IDExist = await accountModel.checkExistingID(account_id)
          if (IDExist == false) {
              throw new Error("Account ID doesnt exist.")
          }
      }),
    
    //New validation rule to validate the old password pattern. Va
    body("old_password")
        .trim()
        .notEmpty()
        .isStrongPassword({
          minLength: 12,
          minLowercase: 1,
          minUppercase: 1,
          minNumbers: 1,
          minSymbols: 1,
        })
      .withMessage("Enter a valid existing password."),
    
    body("account_password")
        .trim()
        .notEmpty()
        .isStrongPassword({
          minLength: 12,
          minLowercase: 1,
          minUppercase: 1,
          minNumbers: 1,
          minSymbols: 1,
        })
      .withMessage("Enter a valid new password."),
    
    //New validation rule to validate the confirm_password pattern and compare it to the entered password.
    body("confirm_password")
        .trim()
        .notEmpty()
        .isStrongPassword({
          minLength: 12,
          minLowercase: 1,
          minUppercase: 1,
          minNumbers: 1,
          minSymbols: 1,
        })
        .withMessage("Password confirmation does not meet requirements.")
        .custom((confirm_password, { req }) => {
            if (confirm_password !== req.body.account_password) {
              throw new Error("Your password confirmation must match your given password")
          }
          return true
          })
  ]
}

validate.checkPasswodData = async (req, res, next) => {
  let errors = []
  errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    res.render("account/details", {
      errors,
      title: "Account Information",
      nav
    })
    return
  }
  next()
}



///////////ENHANCEMENT///////////
///////////DELETE OWN ACCOUNT VALIDATION///////////
//Only the id is validated in case a request is sent through a diferent channel other than the appropriate page.
validate.deleteOwnRules = () => {
  return [
    body("account_id")
      .trim()
      .escape()
      .notEmpty()
      .isNumeric()
      //Not much information is given for security purposes
      .withMessage("Invalid request data. Refer to the proper channel to try again.")
      .custom(async function (account_id) {
          const IDExist = await accountModel.checkExistingID(account_id)
          if (IDExist == false) {
              throw new Error("Invalid request data. Refer to the proper channel to try again.")
          }
      })
  ]
}

//If somehow the account_id is invalid, redirect to the account management view.
validate.checkDeleteOwnData = async (req, res, next) => {
  let errors = []
  errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.redirect("/account")
  }
  next()
}

///////////ENHANCEMENT///////////
///////////DELETE PERSONNEL ACCOUNT VALIDATION///////////
//The target account id is validated, and so are the necessary credentials of the requester.
validate.deletePersonnelRules = () => {
  return [
    body("account_id")
      .trim()
      .escape()
      .notEmpty()
      .isNumeric()
      .withMessage("Invalid request data. Refer to the proper channel to try again.")
      .custom(async function (account_id) {
          const IDExist = await accountModel.checkExistingID(account_id)
          if (IDExist == false) {
              throw new Error("Invalid request data. Refer to the proper channel to try again.")
          }
      })
      .custom(async function (account_id, { req }) {
        const requestData = await accountModel.getAccountByID(account_id)
        const requestAccountType = requestData.account_type
        const userId = req.res.locals.accountData.account_id
        const userData = await accountModel.getAccountByID(userId)
        const userAccountType = userData.account_type
        if (requestAccountType == "Admin" && userAccountType != "Owner") {
          throw new Error("No credentials to manage admin users")
        }
        if (requestAccountType == "Owner") {
          throw new Error("The Owner account can't be deleted")
        }
      })
  ]
}

validate.checkDeletePersonnelData = async (req, res, next) => {
  let errors = []
  errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.redirect("/account/personnel")
  }
  next()
}


///////////ENHANCEMENT///////////
///////////CHANGE PERSONNEL ACCESS VALIDATION///////////
//The target account id is validated, and so are the necessary credentials of the requester to change the target account based on their access
//and the credentials to grant the target access level.
validate.changeAccessRules = () => {
  return [
    body("account_id")
      .trim()
      .escape()
      .notEmpty()
      .isNumeric()
      .withMessage("Invalid request data. Refer to the proper channel to try again.")
      .custom(async function (account_id) {
          const IDExist = await accountModel.checkExistingID(account_id)
          if (IDExist == false) {
              throw new Error("Invalid request data. Refer to the proper channel to try again.")
          }
      })
      .custom(async function (account_id, { req }) {
        const requestData = await accountModel.getAccountByID(account_id)
        const requestAccountType = requestData.account_type
        const userId = req.res.locals.accountData.account_id
        const userData = await accountModel.getAccountByID(userId)
        const userAccountType = userData.account_type
        if (requestAccountType == "Admin" && userAccountType != "Owner") {
          throw new Error("No credentials to manage admin users")
        }
        if (requestAccountType == "Owner") {
          throw new Error("The Owner account access can't be changed")
        }
      }),
    
    body("account_type")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Please provide an account type.")
      .custom(async (account_type, {req}) => {
        if (account_type !== "Admin" && account_type !== "Employee" && account_type !== "Client") {
          throw new Error("Invalid account type")
        }
        const userId = req.res.locals.accountData.account_id
        const userData = await accountModel.getAccountByID(userId)
        const userAccountType = userData.account_type
        if (account_type == "Admin" && userAccountType != "Owner") {
          throw new Error("No credentials to give admin access")
        }
      })
  ]
}

validate.checkChangeAccessData = async (req, res, next) => {
  let errors = []
  errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.redirect("/account/personnel")
  }
  next()
}

module.exports = validate