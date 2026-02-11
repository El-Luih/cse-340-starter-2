const invModel = require("../models/inventory-model")
const jwt = require("jsonwebtoken")
require("dotenv").config()

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
    req.flash("notice", "Please log in.")
    return res.redirect("/account/login")
  }
}
 

///////Check Admin and Employee///////
Util.checkAdminEmployee = (req, res, next) => {
  const userData = res.locals.accountData
  if (userData.account_type === "Admin" || userData.account_type === "Employee") {
    next()
  } else {
    req.flash("error", "Insufficient credentials.")
    return res.redirect("/account/login")
  }
 }


/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for 
 * General Error Handling
 **************************************** */
Util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

module.exports = Util