const invModel = require("../models/inventory-model")

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
    grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>'
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

/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for 
 * General Error Handling
 **************************************** */
Util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

module.exports = Util