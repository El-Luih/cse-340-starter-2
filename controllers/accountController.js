const utilities = require('../utilities');
const accountModel = require('../models/account-model')
const bcrypt = require('bcryptjs')

const accountController = {}

/* ****************************************
*  Deliver login view
* *************************************** */
accountController.buildLogin = async function (req, res, next) {
    let nav = await utilities.getNav()
    req.flash("notice", "Messages would go here.")
    res.render("account/login", {
    title: "Login",
    nav,
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

accountController.registerAccount = async function (req, res, next) {
    let nav = await utilities.getNav()
    const { account_firstname, account_lastname, account_email, account_password } = req.body
    let hashedPassword
    try {
        // regular password and cost (salt is generated automatically)
        hashedPassword = await bcrypt.hashSync(account_password, 10)
    } catch (error) {
        req.flash("notice", 'Sorry, there was an error processing the registration.')
        res.status(500).render("account/register", {
        title: "Registration",
        nav,
        errors: null,
        })
    }
    const registrationResults = accountModel.postAccount(
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
            "notice",
            "Sorry, the registration failed."
        )
        res.status(501).render("account/register", {
            title: "Registration",
            nav,
            errors: null
        })
    }
}

module.exports = accountController;