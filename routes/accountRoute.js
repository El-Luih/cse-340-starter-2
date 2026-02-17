const regValidate = require('../utilities/account-validation')
const express = require('express')
const router = express.Router()
const accountController = require('../controllers/accountController')
const utilities = require('../utilities')

//GET REQUESTS
//Account Mangement View
//Requires a logged in user
router.get(
  "/",
  utilities.checkLogin,
  utilities.handleErrors(accountController.buildAccountManagement))
//Logout button
router.get("/logout", utilities.handleErrors(accountController.accountLogout))
//Login View
router.get("/login", utilities.handleErrors(accountController.buildLogin))
//Registration View
router.get("/registration", utilities.handleErrors(accountController.buildRegistration))
//Account Details View
//Requires a logged-in user
router.get(
  "/details",
  utilities.checkLogin,  
  utilities.handleErrors(accountController.buildAccountDetailsView)
)
//ENHANCEMENT
//Delete user account confirmation
//Requires a logged-in user
//Only non-corporate accounts can access this route.
router.get(
  "/delete",
  utilities.checkLogin,
  utilities.checkNonCorporate,
  utilities.handleErrors(accountController.deleteOwnConfirmationView)
)
//ENHANCEMENT
//Manage personnel
//Requires a logged-in user
//Only admins and the owner
router.get(
  "/personnel",
  utilities.checkLogin,
  utilities.checkAdminOwner,
  utilities.handleErrors(accountController.buildPersonnelView)
)
//ENHANCEMENT
//Delete confirm view for an account of a specified type
//Requires a logged in user
//Only admins and owner
//If the account is admin type, only the owner can access
router.get(
  "/personnel/delete/:account_id",
  utilities.checkLogin,
  utilities.checkNecessaryAccess,
  utilities.handleErrors(accountController.personnelDeleteView)
)
//ENHANCEMENT
//Change access view for an account of a specified type
//Requires a logged in user
//Only admins and owner
//If the account is admin type, only the owner can access
router.get(
  "/personnel/access/:account_id",
  utilities.checkLogin,
  utilities.checkNecessaryAccess,
  utilities.handleErrors(accountController.personnelAccessView)
)

/*
account_firstname: Basic
account_lastname: Client
account_email: basic@340.edu
account_password: I@mABas1cCl!3nt
account_firstname: Happy
account_lastname: Employee
account_email: happy@340.edu
account_password: I@mAnEmpl0y33
account_firstname: Manager
account_lastname: User
account_email: manager@340.edu
account_password: I@mAnAdm!n1strat0r
account_email: lelelolo@gmail.com
account_password:  S0goodYE$2026

//OWNER
account_email: lamarash@gmail.com
account_password: I@mth3Owner02
*/

//POST REQUESTS
// Process the registration data
router.post(
  "/registration",
  regValidate.registrationRules(),
  regValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
)

// Processes the login attempt
router.post(
  "/login",
  regValidate.loginRules(),
  regValidate.checkLoginData,
  utilities.handleErrors(accountController.accountLogin)
)
// Process the account details update
//Requires a logged in user
router.post(
  "/details/information",
  utilities.checkLogin,
  regValidate.updateDetailsRules(),
  regValidate.checkDetailsData,
  utilities.handleErrors(accountController.updateAccountDetails)
)
// Process the account password update
//Requires a logged in user
router.post(
  "/details/password",
  utilities.checkLogin,
  regValidate.updatePasswordRules(),
  regValidate.checkPasswodData,
  utilities.handleErrors(accountController.updateAccountPassword)
)
//ENHANCEMENT
//Delete the own account of the user
//Requires a logged in user
//Only non-corporate accounts can access this route.
router.post(
  "/delete",
  utilities.checkLogin,
  utilities.checkNonCorporate,
  regValidate.deleteOwnRules(),
  regValidate.checkDeleteOwnData,
  utilities.handleErrors(accountController.deleteOwnAccount)
)
//ENHANCEMENT
//Deletes an account of a specified type
//Requires a logged in user
//Only admins and owner
//If the account is admin type, only the owner can access
router.post(
  "/personnel/delete",
  utilities.checkLogin,
  utilities.checkAdminOwner,
  regValidate.deletePersonnelRules(),
  regValidate.checkDeletePersonnelData,
  utilities.handleErrors(accountController.deletePersonnelAccount)
)
//ENHANCEMENT
//Changes access for an account of a specified type
//Requires a logged in user
//Only admins and owner
//If the account is admin type, only the owner can access
router.post(
  "/personnel/access",
  utilities.checkLogin,
  utilities.checkAdminOwner,
  regValidate.changeAccessRules(),
  regValidate.checkChangeAccessData,
  utilities.handleErrors(accountController.changePersonnelAccess)
)
module.exports = router;


/* 
1. James Holloway | james.holloway@email.com | Sunflower!492 | Client
2. Maria Trevino | maria.trevino@email.com | Bluebird8!17x | Employee
3. Derek Saunders | derek.saunders@email.com | Rainstorm@653 | Client
4. Priya Nair | priya.nair@email.com | Goldfish!234k | Admin
5. Ethan Caldwell | ethan.caldwell@email.com | Thunder@9012 | Client
6. Sofia Marchetti | sofia.marchetti@email.com | Pineapple@378 | Employee
7. Marcus Webb | marcus.webb@email.com | Ironclad!567w | Client
8. Yuna Choi | yuna.choi@email.com | Snowfall@1249 | Employee
9. Aaron Fitzgerald | aaron.fitzgerald@email.com | Crimson@789x | Client
10. Layla Okafor | layla.okafor@email.com | Marble!4567j | Admin
11. Nathan Voss | nathan.voss@email.com | Eclipse@3120 | Client
12. Camille Rousseau | camille.rousseau@email.com | Harvest@645m | Employee
13. Tyler Henson | tyler.henson@email.com | Cobalt!82345 | Client
14. Amara Diallo | amara.diallo@email.com | Whisper@197n | Employee
15. Logan Petersen | logan.petersen@email.com | Volcano@5341 | Client
16. Ingrid Solberg | ingrid.solberg@email.com | Lantern!2689 | Admin
17. Carlos Mendoza | carlos.mendoza@email.com | Phantom@743p | Client
18. Zoe Whitfield | zoe.whitfield@email.com | Dagger@59123 | Employee
19. Elijah Boateng | elijah.boateng@email.com | Falcon!84723 | Employee
20. Nina Kowalski | nina.kowalski@email.com | Serpent@2067 | Employee
21. Ryan Callahan | ryan.callahan@email.com | Boulder@7134 | Employee
22. Fatima Hassan | fatima.hassan@email.com | Cinder!35203 | Admin
23. Owen Blackwood | owen.blackwood@email.com | Magnet@68913 | Admin
24. Leila Nazari | leila.nazari@email.com | Torrent@4213 | Employee
25. Isaac Drummond | isaac.drummond@email.com | Shroud!97523 | Admin
26. Vera Sokolova | vera.sokolova@email.com | Amber@1389v3 | Employee
27. Felix Brandt | felix.brandt@email.com | Glacier@8641 | Client
28. Amina Yusuf | amina.yusuf@email.com | Prism!2479a3 | Admin
29. Joel Strickland | joel.strickland@email.com | Vortex@59323 | Admin
30. Hana Fujimoto | hana.fujimoto@email.com | Ember@3162j3 | Client
*/