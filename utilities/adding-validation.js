const utilities = require('./index')
const { body, validationResult } = require("express-validator")
const invModel = require('../models/inventory-model')
const classModel = require('../models/classification-model')
/*
I'm not going to use the inventory model to add the classification data, since it modifies the "classification" table
and a different model should be used for that in my opinion.
*/
const validateAdd = {}

/////CLASSIFICATION VALIDATION/////
validateAdd.classAddingRules = function () {
    return [
        body("classification_name")
            .trim()
            .escape()
            .notEmpty()
            .matches(/^[a-zA-Z0-9\-]+$/)
            .withMessage("Provide an acceptable classification name.")
            .custom(async function (classification_name) {
                const classExist = await classModel.checkExistingClassName(classification_name)
                if (classExist) {
                    throw new Error("Classification name already exists. Enter a different name.")
                }
            })
    ]
}

validateAdd.checkClassData = async function (req, res, next) {
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav()
        res.render("inventory/add-classification", {
            errors,
            title: "Add Classification",
            nav
        })
        return
    }
    next()
}

module.exports = validateAdd