const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const Employee = require("../../db/Models/Control/Employee");
const { comparePassword } = require("../../scripts/encrypt.js");

router.post(
  "/",
  body("action").notEmpty().withMessage("La acción no puede estar vacía"),
  body("username")
    .notEmpty()
    .withMessage("El nombre de usuario no puede estar vacío"),
  body("pin").notEmpty().withMessage("El pin no puede estar vacío"),
  async (req, res) => {
      // Valida errores de express-validator
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    const { action, username, pin } = req.body;
    try {
      const employeeUser = await Employee.findOne({
        where: {
          username: username,
        },
      });
      // Verifica si el usuario existe
      if (!employeeUser) {
        return res.status(400).json({
          message: "El usuario no existe",
        });
      }
      // Compara el pin con el hash del usuario
      if (comparePassword(pin, employeeUser.pin)) {
        return res.status(400).json({
          message: "El pin es incorrecto",
        });
      }
      return res.status(200).json({
        message: "Acceso permitido",
      })
    } catch (error) {
      return res.status(500).json({
        name: error.name,
        message: error.message,
      });
    }
  }
);

module.exports = router;