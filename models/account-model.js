const pool = require('../database')

const accountModel = {}

accountModel.postAccount = async function (account_firstname, account_lastname, account_email, account_password) {
    try {
        const sql = "INSERT INTO public.account (account_firstname, account_lastname, account_email, account_password, account_type) VALUES ($1, $2, $3, $4, 'Client') RETURNING *"
        return await pool.query(sql, [account_firstname, account_lastname, account_email, account_password])
    } catch (error) {
        return error.message
  }
}

/* **********************
 *   Check for existing email
 * ********************* */
accountModel.checkExistingEmail = async function (account_email) {
    try {
        const sql = "SELECT * FROM account WHERE account_email = $1"
        const email = await pool.query(sql, [account_email])
        return email.rowCount
    } catch (error) {
        console.error(error)
    }
}

/* **********************
 *   Check for existing ID
 * ********************* */
accountModel.checkExistingID = async function (account_id) {
    try {
        const sql = "SELECT * FROM account WHERE account_id = $1"
        const ID = await pool.query(sql, [account_id])
        return ID.rowCount
    } catch (error) {
        console.error(error)
        return false
    }
}

//////////Return account by email//////////
accountModel.getAccountByEmail = async (account_email) => {
    try {
        const result = await pool.query(
        'SELECT account_id, account_firstname, account_lastname, account_email, account_type, account_password FROM account WHERE account_email = $1',
        [account_email])
        return result.rows[0]
    } catch (error) {
        return new Error("No matching email found")
    }
}

/////Return account by ID
accountModel.getAccountByID = async (account_id) => {
    try {
        const result = await pool.query(
        'SELECT account_id, account_firstname, account_lastname, account_email, account_type, account_password FROM account WHERE account_id = $1',
        [account_id])
        return result.rows[0]
    } catch (error) {
        console.error(error)
    }
}

accountModel.updateDetails = async function(
    account_id,
    account_firstname,
    account_lastname,
    account_email
) {
    try {
        const sql =
        "UPDATE public.account SET account_firstname = $1, account_lastname = $2, account_email = $3 WHERE account_id = $4 RETURNING *"
        const data = await pool.query(sql, [
            account_firstname,
            account_lastname,
            account_email,
            account_id
        ])
        return data.rows[0]
    } catch (error) {
        console.error("model error: " + error)
    }
}


module.exports = accountModel

