const pool = require('../database')

const classModel = {}

classModel.checkExistingClassName = async function (classification_name) {
    try {
        const sql = "SELECT * FROM public.classification WHERE classification_name = $1"
        const className = await pool.query(sql, [classification_name])
        return className.rowCount
    } catch (error) {
        return error.message
    }
}

classModel.submitClassName = async function (classification_name) {
    try {
        const sql = "INSERT INTO public.classification (classification_name) VALUES ($1) RETURNING *"
        return await pool.query(sql, [classification_name])
    } catch (error) {
        return error.message
    }
}

module.exports = classModel