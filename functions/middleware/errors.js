const { body, validationResult, param } = require("express-validator");

const errors = {
    validationErrorResponse : function(req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }
    },
}


module.exports = {errors};