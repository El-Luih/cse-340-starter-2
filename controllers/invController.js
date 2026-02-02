const invModel = require("../models/inventory-model")
const classModel = require('../models/classification-model') //Most appropriate to add classification entries, since it uses the classification table and nothing else.
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  const grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav()
  const className = await classModel.getClassNameById(classification_id)
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid
  })
}

invCont.buildByVehicleId = async function (req, res, next) {
  const vehicel_id = req.params.vehicleId
  const data = await invModel.getVehicleByInvId(vehicel_id)
  const vehicleDetails = await utilities.buildVehicleDetails(data)
  let nav = await utilities.getNav()
  const vehicleName = `${data.inv_year} ${data.inv_make} ${data.inv_model}`
  res.render("./inventory/detail", {
    title: vehicleName,
    nav,
    vehicleDetails
  })
}

////////////Management GET Views////////////
invCont.buildManagementView = async function (req, res, next) {
    let nav = await utilities.getNav();
    res.render("inventory/management", {
        title: "Management Page",
        nav
    })
}

invCont.buildAddClassView = async function (req, res, next) {
    let nav = await utilities.getNav();
    res.render("inventory/add-classification", {
      title: "Add Classification",
      errors: null,
      nav
    })
}

invCont.buildAddInvView = async function (req, res, next) {
  let nav = await utilities.getNav();
  let classList = await utilities.buildClassificationList();
    res.render("inventory/add-inventory", {
      title: "Add Inventory",
      errors: null,
      classList,
      nav
    })
}

////////////Management POST Processors////////////
invCont.addClassName = async function (req, res, next) {
  const { classification_name } = req.body
  
  const addingResults = await classModel.submitClassName(classification_name)
  let nav = await utilities.getNav()

  if (addingResults.rows.length > 0) {
    req.flash(
      "notice",
      `The classification ${classification_name} has been added.`
    )
    res.status(201).render("inventory/add-classification", {
      title: "Add Classification",
      errors: null,
      nav
    })
  } else {
    req.flash(
      "error",
      "Could not add the classification."
    )
    res.status(501).render("inventory/add-classification", {
      title: "Add Classification",
      errors: null,
      nav
    })
  }
}

invCont.addVehicleToInventory = async function (req, res, next) {
  const { inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_price,
    inv_miles,
    inv_color,
    classification_id } = req.body
  
  const inv_image = "/images/vehicles/no-image.png"
  const inv_thumbnail = "/images/vehicles/no-image-tn.png"
  
  const addingResults = await invModel.submitVehicleInfo(
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
    classification_id)
  
  let nav = await utilities.getNav()
  let classList = await utilities.buildClassificationList(classification_id)

  if (addingResults.rows.length > 0) {
    req.flash(
      "notice",
      `The vehicle ${inv_make} ${inv_model} ${inv_year} has been added.`
    )
    // res.status(201).render("inventory/management", {
    //   title: "Management Page",
    //   errors: null,
    //   nav
    // })
    res.redirect("/inv/")
  } else {
    req.flash(
      "error",
      "Could not add the vehicle."
    )
    res.status(501).render("inventory/add-inventory", {
      title: "Add Inventory",
      errors: null,
      classList,
      nav,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_price,
      inv_miles,
      inv_color,
      classification_id
    })
  }
}

module.exports = invCont;