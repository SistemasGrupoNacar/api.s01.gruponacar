const express = require("express");
const route = express.Router();
const { errors } = require("../../middleware/errors");
const User = require("../../db/Models/General/User");
const { body } = require("express-validator");
const { createHmac } = require("../../scripts/encrypt");

route.get("/", async (req, res) => {
  const users = await User.find().sort({ _id: 1 });
  res.status(200).json(users);
});

route.post(
  "/",
  body("username").notEmpty().withMessage("Usuario requerido"),
  body("password").notEmpty().withMessage("Contraseña requerida"),
  body("firstName").notEmpty().withMessage("Nombre requerido"),
  body("lastName").notEmpty().withMessage("Apellido requerido"),
  body("phone").notEmpty().withMessage("Telefono requerido"),
  body("dui").notEmpty().withMessage("DUI requerido"),
  async (req, res) => {
    errors.validationErrorResponse(req, res);
    const { firstName, lastName, phone, dui, username, password } = req.body;
    let user = await User.findOne({ username: username });
    if (user) {
      return res.status(400).json({
        message: "El usuario ya existe",
      });
    }
    const encryptPass = createHmac(password);
    const newUser = new User({
      firstName,
      lastName,
      phone,
      dui,
      username,
      password: encryptPass,
    });
    newUser.save();
    return res.status(200).json(newUser);
  }
);

route.delete("/:id", async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(id);
  if (!user) {
    return res.status(404).json({
      message: "No se encontro el usuario",
    });
  }
  const response = await User.findByIdAndDelete(id);
  return res.status(200).json(response);
});

module.exports = route;
