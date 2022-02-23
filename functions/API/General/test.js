const express = require("express");
const route = express.Router();
// importar moment.js
const moment = require("moment");
const { body, validationResult, param } = require("express-validator");
const { errors } = require("../../middleware/errors");
const User = require("../../db/Models/General/User");

route.get(
  "/",
  body("date").isISO8601().withMessage("Fecha requerida"),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { date } = req.body;
    const users = await User.find({
      createdAt: {
        $lte: new Date(date),
      },
    });
    res.status(200).json(users);
  }
);

module.exports = route;
