const errorController = {}

errorController.throw500TypeError = async function (req, res, next) {
    const err = new Error("Internal 500 Error");
    err.status = 500;
    next(err);
}

module.exports = errorController