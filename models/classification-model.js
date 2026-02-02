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

classModel.getClassNameById = async function name(classification_id) {
    try {
        const sql = "SELECT classification_name FROM public.classification WHERE classification_id = $1"
        const className = await pool.query(sql, [classification_id])
        return className.rows[0].classification_name
    } catch {
        return false
    }
}

classModel.checkExistingClassId = async function (classification_id) {
    try {
        const sql = "SELECT * FROM public.classification WHERE classification_id = $1"
        const classId = await pool.query(sql, [classification_id])
        return classId.rows.length > 0
    } catch (error) {
        return false
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