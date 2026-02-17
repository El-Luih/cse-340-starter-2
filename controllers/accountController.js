const utilities = require('../utilities');
const accountModel = require('../models/account-model')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
require('dotenv').config()

const accountController = {}

/* ****************************************
*  Deliver login view
* *************************************** */
accountController.buildLogin = async function (req, res, next) {
    let nav = await utilities.getNav()
    res.render("account/login", {
        title: "Login",
        nav,
        error: null
    })
}

/* ****************************************
*  Deliver registration view
* *************************************** */
accountController.buildRegistration = async function (req, res, next) {
    let nav = await utilities.getNav()
    res.render("account/registration", {
        title: "Registration",
        nav,
        errors: null
    })
}


////////////POST REGISTER ACCOUNT////////////
accountController.registerAccount = async function (req, res, next) {
    let nav = await utilities.getNav()
    const { account_firstname, account_lastname, account_email, account_password } = req.body
    let hashedPassword
    try {
        // regular password and cost (salt is generated automatically)
        hashedPassword = await bcrypt.hashSync(account_password, 10)
    } catch (error) {
        req.flash("error", 'Sorry, there was an error processing the registration.')
        res.status(500).render("account/register", {
        title: "Registration",
        nav,
        errors: null,
        })
    }
    const registrationResults = await accountModel.postAccount(
        account_firstname,
        account_lastname,
        account_email,
        hashedPassword
    )

    if (registrationResults) {
        req.flash(
            "notice",
            `Congratulations, you\'re registered ${account_firstname}. Please log in.`
        )
        res.status(201).render("account/login", {
            title: "Login",
            nav
        })
    } else {
        req.flash(
            "error",
            "Sorry, the registration failed."
        )
        res.status(501).render("account/register", {
            title: "Registration",
            nav,
            account_firstname,
            account_email,
            account_lastname,
            errors: null
        })
    }
}


//////////// POST Login Account////////////
accountController.accountLogin = async (req, res) => {
    let nav = await utilities.getNav()
    const { account_email, account_password } = req.body
    const accountData = await accountModel.getAccountByEmail(account_email)
    if (!accountData) {
        req.flash("error", "Please check your email and try again.")
        res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email
        })
        return
    }
    try {
        if (await bcrypt.compare(account_password, accountData.account_password)) {
            delete accountData.account_password
            const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 })
            if(process.env.NODE_ENV === 'development') {
                res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
            } else {
                res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
            }
            req.flash("notice", "You're logged in.")
            return res.redirect("/account/")
        }
        else {
            req.flash("error", "Please check your password and try again.")
            res.status(400).render("account/login", {
            title: "Login",
            nav,
            errors: null,
            account_email
        })
        }
    } catch (error) {
    throw new Error('Access Forbidden')
    }
}

////////////GET Account Management View////////////
accountController.buildAccountManagement = async (req, res, next) => {
    let nav = await utilities.getNav()
    //Now retrieves and passes the account_type from the database to fix a vulnerability.
    const userId = res.locals.accountData.account_id
    const userData = await accountModel.getAccountByID(userId)
    const accountType = userData.account_type
    res.render("account/account", {
        title: "Account Management",
        nav,
        errors: null,
        account_type: accountType
    })
}


////////////GET Account Logout////////////
accountController.accountLogout = async (req, res, next) => {
    if (res.locals.loggedin) {
        res.clearCookie("jwt")
        req.flash("notice", "You have succesfully logged out")
    } else {
        req.flash("notice", "You cannot log out if you are not logged in.")
    }
    return res.redirect("/account/login")
}

////////////GET Account Details View////////////
accountController.buildAccountDetailsView = async (req, res, next) => {
    let nav = await utilities.getNav()
    res.render("account/details", {
        title: "Account Information",
        nav,
        errors: null
    })
}

////////////POST Update Account Details////////////
accountController.updateAccountDetails = async (req, res, next) => {
    let nav = await utilities.getNav()
    //New "old_password" field for security measures
    const { account_firstname, account_lastname, account_email, account_id, old_password } = req.body
    const currentData = await accountModel.getAccountByID(account_id)
    const currentPassword = currentData.account_password

    //Uses bcrypt to compare the "old_password" input to the current password, similar to the login process.
    //Details form is sticky.
    if (!await bcrypt.compare(old_password, currentPassword)) {
        req.flash("error", "Please, check your current password and try again.")
        return res.status(400).render("account/details", {
            title: "Account Information",
            nav,
            errors: null,
            account_firstname,
            account_lastname,
            account_email
        })
    }

    const updateResults = await accountModel.updateDetails(
        account_id,
        account_firstname,
        account_lastname,
        account_email
    )

    if (updateResults) {
        const accountData = await accountModel.getAccountByID(account_id)
        delete accountData.account_password
        res.clearCookie("jwt")
        const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 })
        if(process.env.NODE_ENV === 'development') {
            res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
        } else {
            res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
        }
        req.flash(
            "notice",
            `Your information has been updated.`
        )
        req.flash(
            "notice",
            `First Name: ${account_firstname}`
        )
        req.flash(
            "notice",
            `Last Name: ${account_lastname}`
        )
        req.flash(
            "notice",
            `Email: ${account_email}`
        )
        res.status(201).redirect("/account")
    } else {
        req.flash(
            "error",
            "Sorry, your information could not be updated."
        )
        res.status(501).render("account/details", {
            title: "Account Information",
            nav,
            errors: null,
            account_firstname,
            account_lastname,
            account_email
        })
    }
}

////////////POST Update Account Password////////////
accountController.updateAccountPassword = async (req, res, next) => {
    let nav = await utilities.getNav()
    //Retrieves the old_password input
    const { account_id, account_password, old_password } = req.body
    const accountData = await accountModel.getAccountByID(account_id);

    //Uses bcrypt to compare the old_password input to the current password, similar to the login process.
    if (!await bcrypt.compare(old_password, accountData.account_password)) {
        req.flash("error", "Please, check your current password and try again.")
        return res.status(400).render("account/details", {
            title: "Account Information",
            nav,
            errors: null
        })
    }

    let hashedPassword
    try {
        hashedPassword = await bcrypt.hashSync(account_password, 10)
    } catch (error) {
        req.flash("error", 'Sorry, there was an error while processing the update.')
        res.status(500).render("account/details", {
            title: "Account Information",
            nav,
            errors: null,
        })
    }

    const updateResults = await accountModel.updatePassword(
        account_id,
        hashedPassword
    )

    if (updateResults) {
        req.flash(
            "notice",
            `Your password has been updated.`
        )
        res.status(201).redirect("/account")
    } else {
        req.flash(
            "error",
            "Sorry, your password could not be updated."
        )
        res.status(501).render("account/details", {
            title: "Account Information",
            nav,
            errors: null
        })
    }
}


////////////ENHANCEMENT////////////
////////////GET Delete Account Confirmation////////////
//All data is retrieved from JWS decrypted data.
accountController.deleteOwnConfirmationView = async (req, res, next) => {
      let nav = await utilities.getNav();
        res.render("./account/delete-own", {
          title: "Delete Your Account",
          nav,
          errors: null
      })
}


////////////ENHANCEMENT////////////
////////////POST Delete Account////////////
accountController.deleteOwnAccount = async (req, res, next) => {
    const { account_id } = req.body

    const deleteResult = await accountModel.deleteAccountById(account_id)

    if (deleteResult) {
        req.flash("notice", "Your account was deleted")
        req.flash("notice", "Goodbye for now!")
        res.clearCookie("jwt")
        return res.redirect("/account/login")
    } else {
        req.flash("notice", "Your account couldn't be deleted")
        req.flash("notice", "Contact technical support")
        return res.redirect("/account")
    }
}

module.exports = accountController;