const express = require("express");
const route = express.Router();
const errors = require("../../errors/index");
const User = require("../../db/Models/General/User");
const { body } = require("express-validator");
const { compareHmac } = require("../../scripts/encrypt");
const { setToken } = require("../../middleware/token");

route.post(
  "/",
  body("username").notEmpty().withMessage("Usuario requerido"),
  body("password").notEmpty().withMessage("Contraseña requerida"),
  async (req, res) => {
    errors.validationErrorResponse(req, res);
    const { username, password } = req.body;
    const user = await User.findOne({ username: username });
    if (compareHmac(password, user.password)) {
      const token = setToken({
        _id: user._id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        dui: user.dui,
        phone: user.phone,
      });
      return res.status(200).json(token);
    } else {
      return res
        .status(403)
        .json({ message: "Usuario o contraseña incorrectos" });
    }
  }
);

module.exports = route;
