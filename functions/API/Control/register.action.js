const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const Employee = require("../../db/Models/Control/Employee");
const Journey = require("../../db/Models/Control/Journey");
const User = require("../../db/Models/General/User");
const { comparePassword } = require("../../scripts/encrypt.js");

router.post(
  "/",
  body("action").notEmpty().withMessage("La acción no puede estar vacía"),
  body("username")
    .notEmpty()
    .withMessage("El nombre de usuario no puede estar vacío"),
  body("password").notEmpty().withMessage("El pin no puede estar vacío"),
  body("date").notEmpty().withMessage("La fecha no puede estar vacía"),
  body("date").isISO8601().withMessage("La fecha no es válida"),
  body("coordinates")
    .notEmpty()
    .withMessage("Las coordenadas no pueden estar vacías"),
  async (req, res) => {
    // Valida errores de express-validator
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    const { action, username, password, date, coordinates } = req.body;
    try {
      // Busca el usuario
      const user = await User.findOne({ username });
      // Verifica que el usuario exista
      if (!user) {
        return res.status(404).json({
          message: "El usuario no existe",
        });
      }
      // Verifica que la contrasena sea correcto
      if (!comparePassword(password, user.password)) {
        return res.status(403).json({
          message: "La contraseña es incorrecta",
        });
      }

      // Verifica si es entrada o salida
      if (action === "Entrada") {
        // Verifica si el usuario ya tiene un registro abierto
        const journey = await Journey.findOne({
          employee: user.employee,
        }).sort({ createdAt: -1 });
        if (journey != null) {
          if (journey.check_out == null) {
            return res.status(403).json({
              message: "El usuario ya tiene un registro abierto",
            });
          }
        }
        // Crea el registro de entrada
        const newJourney = new Journey({
          employee: user.employee,
          check_in: date,
          coordinatesLat: coordinates.lat,
          coordinatesLng: coordinates.lng,
        });
        const response = await newJourney.save();
        const employee = await Employee.findById(user.employee);
        // Agrega el registro de entrada al empleado
        employee.journeys.push(response._id);
        await employee.save();
        return res.status(200).json(response);
      } else if (action === "Salida") {
        // Verifica si el usuario tiene un registro abierto
        const journey = await Journey.findOne({
          employee: user.employee,
        }).sort({ createdAt: -1 });
        if (journey == null) {
          return res.status(404).json({
            message: "El usuario no tiene un registro abierto",
          });
        }
        // Verifica si el registro ya tiene una salida
        if (journey.check_out != null) {
          return res.status(404).json({
            message:
              "El registro anterior está cerrado, no puede cerrarlo nuevamente",
          });
        }
        // Crea el registro de salida
        journey.check_out = date;
        journey.was_worked = true;
        const response = await journey.save();
        return res.status(200).json(response);
      } else {
        return res.status(404).json({
          message: "La acción no es válida",
        });
      }
    } catch (error) {
      return res.status(500).json({
        name: error.name,
        message: error.message,
      });
    }
  }
);

module.exports = router;
