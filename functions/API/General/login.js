const express = require("express");
const route = express.Router();
const { errors } = require("../../middleware/errors");
const User = require("../../db/Models/General/User");
const { body } = require("express-validator");
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
  async (req, res) => {
    errors.validationErrorResponse(req, res);
    const { username, password } = req.body;
    const user = await User.findOne({ username: username });
    if (user) {
      if (user.employee != null) {
        const role = await Role.findById(user.role);
        if (role._id == EMPLOYEE_ID) {
          return res.status(401).json({
            name: "Usuario",
            message: "No tiene permisos para acceder a este portal",
          });
        }
      }
      if (comparePassword(password, user.password)) {
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
        return res.status(403).json({
          name: "Error de autenticación",
          message: "Usuario o contraseña incorrectos",
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
