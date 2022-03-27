const express = require("express");
const route = express.Router();
const { errors } = require("../../middleware/errors");
const User = require("../../db/Models/General/User");
const { body, validationResult } = require("express-validator");
const { comparePassword } = require("../../scripts/encrypt");
const { setToken } = require("../../middleware/auth");
let { authenticateToken } = require("../../middleware/auth");
const Role = require("../../db/Models/General/Role");
const EMPLOYEE_ID = "621cef20030784943a5fbc24";

//ruta para verificar el token
route.get("/", authenticateToken, async (req, res) => {
  return res.status(200).json({
    message: "Token correcto",
  });
});

route.post(
  "/",
  body("username").notEmpty().withMessage("Usuario requerido"),
  body("password").notEmpty().withMessage("Contraseña requerida"),
  body("type").notEmpty().withMessage("Tipo requerido"),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const { username, password, type } = req.body;
    const user = await User.findOne({ username: username }).populate("role");
    if (user) {
      // Verifica si el rol tiene acceso a la solicitud)
      if (user.role.title === type) {
        if (comparePassword(password, user.password)) {
          const token = setToken({
            _id: user._id,
            username: user.username,
            avatar: user.avatar,
          });
          return res.status(200).json(token);
        } else {
          return res.status(403).json({
            name: "Error de autenticación",
            message: "Usuario o contraseña incorrectos",
          });
        }
      } else {
        return res.status(403).json({
          name: "Error de autenticación",
          message: "Su usuario no tiene acceso a esta sección",
        });
      }
    } else {
      return res.status(403).json({
        name: "Error de autenticación",
        message: "Usuario no existe",
      });
    }
  }
);

module.exports = route;
