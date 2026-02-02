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

/////CLASSIFICATION VALIDATION/////
validateAdd.invAddingRules = function () {
    return [
        body("inv_make")
            .trim()
            .escape()
            .notEmpty()
            .withMessage("Provide a vehicle maker."),
        
        body("inv_model")
            .trim()
            .escape()
            .notEmpty()
            .withMessage("Provide a vehicle model."),
        
        body("inv_year")
            .trim()
            .escape()
            .notEmpty()
            .withMessage("Provide a model year.")
            .isNumeric()
            .withMessage("Model year must be numeric.")
            .isLength({ min: 4, max: 4 })
            .withMessage("Year must be exactly 4 digits."),
        
        body("classification_id")
            .trim()
            .escape()
            .notEmpty()
            .isNumeric()
            .withMessage("Select a valid classification.")
            .custom(async function (classification_id) {
                const classExist = await classModel.checkExistingClassId(classification_id)
                if (classExist == false) {
                    throw new Error("Classification doesn't exist. Add it first.")
                }
            }),
        
        body("inv_price")
            .trim()
            .escape()
            .notEmpty()
            .isNumeric()
            .withMessage("Enter a valid price."),
        
        body("inv_miles")
            .trim()
            .escape()
            .notEmpty()
            .isNumeric()
            .withMessage("Enter a valid mileage."),
        
        body("inv_color")
            .trim()
            .escape()
            .notEmpty()
            .matches(/^[a-zA-Z\- ]+$/)
            .withMessage("Provide a vehicle color."),
        
        body("inv_description")
            .trim()
            .escape()
            .notEmpty()
            .withMessage("Provide a vehicle description.")     
    ]
}

validateAdd.checkVehicleData = async function (req, res, next) {
    const { inv_make, inv_model, inv_year, classification_id, inv_price, inv_miles, inv_color, inv_description } = req.body
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav()
        let classList = await utilities.buildClassificationList(classification_id)
        res.render("inventory/add-inventory", {
            errors,
            title: "Add Inventory",
            nav,
            classList,
            inv_make,
            inv_model,
            inv_year,
            inv_price,
            inv_miles,
            inv_color,
            inv_description
        })
        return
    }
    next()
}

module.exports = validateAdd