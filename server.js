/* ******************************************
 * This server.js file is the primary file of the 
 * application. It is used to control the project.
 *******************************************/
/* ***********************
 * Require Statements
 *************************/
//Packages
const express = require("express")
const expressLayouts = require("express-ejs-layouts")
const env = require("dotenv").config()
const app = express()
const bodyParser = require('body-parser')
const session = require("express-session")
const cookieParser = require("cookie-parser")

//App Modules
const static = require("./routes/static")
const baseController = require("./controllers/baseController")
const inventoryRoute = require("./routes/inventoryRoute")
const errorRoute = require("./routes/errorRoute")
const accountRoute = require("./routes/accountRoute")
const utilities = require("./utilities")
const pool = require("./database")

/* ***********************
 * Middleware
 *************************/
//View Engine and Templates
app.set("view engine", "ejs")
app.use(expressLayouts)
app.set("layout", "./layouts/layout")


//Session Middleware
 app.use(session({
  store: new (require('connect-pg-simple')(session))({
    createTableIfMissing: true,
    pool,
  }),
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  name: 'sessionId',
 }))

// Express Messages Middleware
app.use(require('connect-flash')())
app.use(function(req, res, next){
  res.locals.messages = require('express-messages')(req, res)
  next()
})


//Body Parser Middleware
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

//Cookies Middleware
app.use(cookieParser())

//JWT Verification Middleware
app.use(utilities.checkJWTToken)

/* ***********************
 * Routes                *
 *************************/
//Static files routes
app.use(utilities.handleErrors(static))
//Inventory routes
app.use("/inv", utilities.handleErrors(inventoryRoute))
//Account route
app.use("/account", utilities.handleErrors(accountRoute))
//Error route
app.use("/error", utilities.handleErrors(errorRoute))
//Index route
app.get("/", utilities.handleErrors(baseController.buildHome))
// File Not Found Route - must be last route in list
app.use(async (req, res, next) => {
  next({status: 404, message: 'Sorry, we appear to have lost that page.'})
})


/* ***********************
* Express Error Handler
* Place after all other middleware
*************************/
app.use(async (err, req, res, next) => {
  let nav = await utilities.getNav()
  //"console.error" is secure because this is not public or part of the view.
  //It's only logged in the server console.
  console.error(`Error at: "${req.originalUrl}": ${err.message}`)
  if(err.status == 404){ message = err.message} else {message = 'Oh no! There was a crash. Maybe try a different route?'}
  res.render("errors/error", {
    title: err.status || 'Server Error',
    message,
    errFlavor: 'Wished I knew what that means',
    nav
  })
})

/* ***********************
 * Local Server Information
 * Values from .env (environment) file
 *************************/
const port = process.env.PORT
const host = process.env.HOST

/* ***********************
 * Log statement to confirm server operation
 *************************/
app.listen(port, () => {
  console.log(`app listening on ${host}:${port}`)
})
