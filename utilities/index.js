const invModel = require("../models/inventory-model")
const jwt = require("jsonwebtoken")
require("dotenv").config()
//Imported the account model to retrieve account data from the database.
const accountModel = require("../models/account-model")

const Util = {}

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
  let data = await invModel.getClassifications()
  console.log(data); //For testing.
  let list = "<ul>"
  list += '<li><a href="/" title="Home page">Home</a></li>'
  data.rows.forEach((row) => {
    list += "<li>"
    list +=
      '<a href="/inv/type/' +
      row.classification_id +
      '" title="See our inventory of ' +
      row.classification_name +
      ' vehicles">' +
      row.classification_name +
      "</a>"
    list += "</li>"
  })
  list += "</ul>"
  return list
}

/*
Creates the HTML for the body of the "classification.ejs" view.
*/

Util.buildClassificationGrid = async function (data) {
  let grid
  if(data.length > 0){
    grid = '<ul id="inv-display">'
    data.forEach(vehicle => { 
      grid += '<li>'
      grid +=  '<a href="../../inv/detail/'+ vehicle.inv_id 
      + '" title="View ' + vehicle.inv_make + ' '+ vehicle.inv_model 
      + 'details"><img src="' + vehicle.inv_thumbnail 
      +'" alt="Image of '+ vehicle.inv_make + ' ' + vehicle.inv_model 
      +' on CSE Motors" /></a>'
      grid += '<div class="namePrice">'
      grid += '<hr />'
      grid += '<h2>'
      grid += '<a href="../../inv/detail/' + vehicle.inv_id +'" title="View ' 
      + vehicle.inv_make + ' ' + vehicle.inv_model + ' details">' 
      + vehicle.inv_make + ' ' + vehicle.inv_model + '</a>'
      grid += '</h2>'
      grid += '<span>$' 
      + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span>'
      grid += '</div>'
      grid += '</li>'
    })
    grid += '</ul>'
  } else { 
    grid += '<p class="notice bold">Sorry, no matching vehicles could be found.</p>'
  }
  return grid
}

/* 
Creates the body for the "detail.ejs" view.
*/
Util.buildVehicleDetails = async function (vehicle) {
  const details = `
  <div id="inv-details-body">
    <img
      class="main vehicle-image"
      src="${vehicle.inv_image}"
      alt="Image of ${vehicle.inv_make} ${vehicle.inv_model} ${vehicle.inv_year} on CSE Motors"
    />
    <article class="vehicle-description">
      <h2>${vehicle.inv_year} ${vehicle.inv_make} ${vehicle.inv_model}</h2>
      <h3 class="price">$${new Intl.NumberFormat('en-US').format(vehicle.inv_price)}</h3>
      <div class="data">
        <p class="rows">
          <span class="bold">Class: </span>
          <span class="content">${vehicle.classification_name}</span>
        </p>
        <p class="rows">
          <span class="bold">Mileage: </span>
          <span class="content">${new Intl.NumberFormat('en-US').format(vehicle.inv_miles)}</span>
        </p>
        <p class="rows">
          <span class="bold">Color: </span>
          <span class="content">${vehicle.inv_color}</span>
        </p>
      </div>
      <p class="description-text">${vehicle.inv_description}</p>
    </article>
  </div>
  `
  return details;
}


//////////Builds the classification selection//////////
Util.buildClassificationList = async function (classification_id = null) {
    let data = await invModel.getClassifications()
    let classificationList ='<select name="classification_id" id="classification_list" required>'
    classificationList += "<option value='' disabled"
    if (classification_id == null) {
      classificationList +=" selected"
    }
  classificationList += ">Choose a Classification</option>"
    data.rows.forEach((row) => {
      classificationList += '<option value="' + row.classification_id + '"'
      if (
        classification_id != null &&
        row.classification_id == classification_id
      ) {
        classificationList += " selected "
      }
      classificationList += ">" + row.classification_name + "</option>"
    })
    classificationList += "</select>"
    return classificationList
}
  
/* ****************************************
* Middleware to check token validity
**************************************** */
Util.checkJWTToken = (req, res, next) => {
 if (req.cookies.jwt) {
  jwt.verify(
   req.cookies.jwt,
   process.env.ACCESS_TOKEN_SECRET,
   function (err, accountData) {
    if (err) {
     req.flash("Please log in")
     res.clearCookie("jwt")
     return res.redirect("/account/login")
    }
    res.locals.accountData = accountData
    res.locals.loggedin = 1
    next()
   })
 } else {
  next()
 }
}

/* ****************************************
 *  Check Login
 * ************************************ */
 Util.checkLogin = (req, res, next) => {
  if (res.locals.loggedin) {
    next()
  } else {
    req.flash("notice", "Please log in to use this feature.")
    return res.redirect("/account/login")
  }
}
 

///////Check Admin and Employee///////
Util.checkAdminEmployee = async (req, res, next) => {
  //The account type verfication process now retrieves the account_type from the Database.
  //This fixes a vulnerability where a logged-in user whose credentials were changed mid-session could still have access to the admin functions by being in posession of a JWT with that accoun type.
  const userId = res.locals.accountData.account_id
  const userData = await accountModel.getAccountByID(userId)
  
  //Allows access to the new Owner account type.
  if (userData.account_type === "Admin" || userData.account_type === "Employee" || userData.account_type === "Owner") {
    next()
  } else {
    req.flash("error", "Insufficient credentials.")
    return res.redirect("/account/login")
  }
}
 
///////ENHANCEMENT///////
///////Check Non-corporate Account///////
Util.checkNonCorporate = async (req, res, next) => {
  const userId = res.locals.accountData.account_id
  const userData = await accountModel.getAccountByID(userId)
  
  //Allows access to the new Owner account type.
  if (userData.account_type === "Client") {
    next()
  } else {
    req.flash("error", "Corporate accounts must be deleted by corporate management.")
    return res.redirect("/account")
  }
}
 
///////ENHANCEMENT///////
///////Check Admin and Owner Accounts///////
Util.checkAdminOwner = async (req, res, next) => {
  const userId = res.locals.accountData.account_id
  const userData = await accountModel.getAccountByID(userId)
  //Allows access only to admins and the owner.
  if (userData.account_type === "Admin" || userData.account_type === "Owner") {
    next()
  } else {
    req.flash("error", "Insufficient credentials.")
    return res.redirect("/account")
  }
}

///////ENHANCEMENT///////
///////Build employees table///////
Util.buildPersonnelTable = async (account_type) => {
  const personnelData = await accountModel.getAccountsByAccountType(account_type)
  let tableData = `
    <thead>
      <tr>
        <th>ID</th>
        <th>${account_type} Name</th>
        <th>Email</th>
        <td>&nbsp;</td>
        <td>&nbsp;</td>
      </tr>
    </thead>
    <tbody>
  `
  personnelData.forEach((row) => {
    tableData += `
      <tr>
        <td>${row.account_id}</td>
        <td>${row.account_firstname} ${row.account_lastname}</td>
        <td>${row.account_email}</td>
        <td><a href='/account/personnel/access/${row.account_id}' title='Click to change access level'>Access</a></td>
        <td><a href='/account/personnel/delete/${row.account_id}' title='Click to delete account'>Delete</a></td>
      </tr>
    `
  })
  tableData += "</tbody>"
  return tableData
}

///////ENHANCEMENT///////
///////Check Admin and Owner Accounts for GET///////
Util.checkNecessaryAccess = async (req, res, next) => {
  const userId = res.locals.accountData.account_id
  const userData = await accountModel.getAccountByID(userId)
  const userAccess = userData.account_type
  const requestID = parseInt(req.params.account_id)
  const requestData = await accountModel.getAccountByID(requestID)
  const requestAccess = requestData.account_type
  if (requestAccess === "Admin") {
    if (userAccess === "Owner") {
      next()
    } else {
      req.flash("error", "Only the Owner can manage Admin accounts.")
      return res.redirect("/account/personnel")
    }
  } else if (requestAccess === "Owner") {
    req.flash("error", "The Owner cannot be managed.")
    return res.redirect("/account")
  } else {
    if (userAccess === "Owner" || userAccess === "Admin") {
      next()
    } else {
      req.flash("error", "Insufficient credentials.")
      return res.redirect("/account")
    }
  }
 
}

///////ENHANCEMENT///////
///////Build account type list///////
//Only used in the access-personnel.ejs view
Util.buildPersonnelAccountTypeList = async function (account_type = null, request_access) {
  let typesList = `
    <select name="account_type" id="account_type" required>
      <option value='' disabled
  `
  if (account_type == null) {
    typesList +=" selected"
  }
  typesList += `
    >Choose an Access Type</option>
  `
  let availableTypes = []
  if (request_access === "Owner") {
    availableTypes.push("Admin")
  } 
  availableTypes.push("Client", "Employee")

  availableTypes.forEach((type) => {
    typesList += `<option value="${type}"`
    if (account_type != null && type == account_type) {
      typesList += " selected "
    }
    typesList += `>${type}</option>`
  })
  typesList += "</select>"

  return typesList
}


/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for 
 * General Error Handling
 **************************************** */
Util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

module.exports = Util