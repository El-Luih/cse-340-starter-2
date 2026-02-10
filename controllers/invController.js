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
  let classList = await utilities.buildClassificationList();
    res.render("inventory/management", {
        title: "Management Page",
        nav,
        classList
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


////////////Data retrievers and modifiers////////////
//Get Inventory Table by Classification
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id)
  const invData = await invModel.getInventoryByClassificationId(classification_id)
  if (invData[0].inv_id) {
    return res.json(invData)
  } else {
    next(new Error("No data returned"))
  }
}

//Renders Edit Inventory View
invCont.editInventoryView = async (req, res, next) => {
  const inv_id = parseInt(req.params.inventory_id)
  let nav = await utilities.getNav();
  const itemData = await invModel.getVehicleByInvId(inv_id)
  let classList = await utilities.buildClassificationList(itemData.classification_id)
  const itemName = `${itemData.inv_make} ${itemData.inv_model}`
    res.render("./inventory/edit-inventory", {
      title: "Edit " + itemName,
      nav,
      classList: classList,
      errors: null,
      inv_id: itemData.inv_id,
      inv_make: itemData.inv_make,
      inv_model: itemData.inv_model,
      inv_year: itemData.inv_year,
      inv_description: itemData.inv_description,
      inv_image: itemData.inv_image,
      inv_thumbnail: itemData.inv_thumbnail,
      inv_price: itemData.inv_price,
      inv_miles: itemData.inv_miles,
      inv_color: itemData.inv_color,
      classification_id: itemData.classification_id
  })
}

//Renders Delete Inventory View
invCont.deleteInventoryEntry = async (req, res, next) => {
  
}

////////////Edit and Delete POST Processors////////////
//Updates Inventory Entry
invCont.updateVehicle = async (req, res, next) => {
  const {
    inv_id,
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
    classification_id } = req.body
  
  const updateResult = await invModel.updateInventory(
    inv_id,
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

  if (updateResult) {
    const itemName = updateResult.inv_make + " " + updateResult.inv_model
    req.flash("notice", `The ${itemName} was successfully updated.`)
    res.redirect("/inv/")
  } else {
    let classList = await utilities.buildClassificationList(classification_id)
    const itemName = updateResult.inv_make + " " + updateResult.inv_model
    req.flash("error", "Sorry, the update failed.")
    res.status(501).render("inventory/edit-inventory", {
      title: "Edit " + itemName,
      nav,
      classList: classList,
      errors: null,
      inv_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
      classification_id
    })
  }
}


////////////Adding POST Processors////////////
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
  
  let { 
    inv_image,
    inv_thumbnail,
  } = req.body
  
  let finalImage = ""
  let finalThumbnail = ""

  if (!inv_image) {
    finalImage = "/images/vehicles/no-image.png"
  } else {
    finalImage = `/images${inv_image}`
  }

  if (!inv_thumbnail) {
    finalThumbnail = "/images/vehicles/no-image-tn.png"
  } else {
    finalThumbnail = `/images${inv_thumbnail}`
  }
  
  const addingResults = await invModel.submitVehicleInfo(
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    finalImage,
    finalThumbnail,
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
      inv_image,
      inv_thumbnail,
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