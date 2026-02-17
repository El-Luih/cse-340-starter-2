const pool = require('../database')

const accountModel = {}

accountModel.postAccount = async function (account_firstname, account_lastname, account_email, account_password) {
    try {
        const sql = "INSERT INTO public.account (account_firstname, account_lastname, account_email, account_password, account_type) VALUES ($1, $2, $3, $4, 'Client') RETURNING *"
        return await pool.query(sql, [account_firstname, account_lastname, account_email, account_password])
    } catch (error) {
        throw new Error (error)
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
        throw new Error (error)
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
        throw new Error (error)
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
        throw new Error (error)
    }
}

//Update Account Details
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
        throw new Error ("model error: " + error)
    }
}

//Update Account Password
accountModel.updatePassword = async function(
    account_id,
    account_password
) {
    try {
        const sql =
        "UPDATE public.account SET account_password = $1 WHERE account_id = $2 RETURNING *"
        const data = await pool.query(sql, [
            account_password,
            account_id
        ])
        return data.rows[0]
    } catch (error) {
        throw new Error("model error: " + error)
    }
}

//ENHANCEMENT
//Delete account by id
accountModel.deleteAccountById = async (account_id) => {
    try {
        const sql = "DELETE FROM account WHERE account_id = $1"
        const data = await pool.query(sql, [account_id])
        return data.rowCount > 0
    } catch (error) {
        throw new Error("Model error: " + error)
    }
}


//ENHANCEMENT
//Get accounts by account type
accountModel.getAccountsByAccountType = async (account_type) => {
    try {
        const result = await pool.query(
        'SELECT * FROM account WHERE account_type = $1 ORDER BY account_id ASC',
        [account_type])
        return result.rows
    } catch (error) {
        throw new Error("No matching account found")
    }
}


//ENHANCEMENT
//Change account type
accountModel.updateAccountType = async function(
    account_id,
    account_type
) {
    try {
        const sql =
        "UPDATE public.account SET account_type = $1 WHERE account_id = $2 RETURNING *"
        const data = await pool.query(sql, [
            account_type,
            account_id
        ])
        return data.rows[0]
    } catch (error) {
        throw new Error ("model error: " + error)
    }
}


module.exports = accountModel

