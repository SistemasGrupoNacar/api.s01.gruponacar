const express = require("express");
const route = express.Router();
const { body, validationResult } = require("express-validator");
const Position = require("../../db/Models/Control/Position");

//Obtiene todas las posiciones
route.get("/", async (req, res) => {
  try {
    const positions = await Position.find();
    return res.status(200).json(positions);
  } catch (error) {
    return res.status(500).json({
      name: error.name,
      message: error.message,
    });
  }
});

// Crea una posicion
route.post(
  "/",
  body("description")
    .notEmpty()
    .withMessage("El campo descripcion es requerido"),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    try {
      const { description } = req.body;
      const positionModel = new Position({
        description,
      });
      const response = await positionModel.save();
      return res.status(201).json(response);
    } catch (error) {
      return res.status(500).json({
        name: error.name,
        message: error.message,
      });
    }
  }
);

// Editar la descripcion de una posicion
route.put(
  "/:id",
  body("description")
    .notEmpty()
    .withMessage("El campo descripcion es requerido"),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    try {
      const { description } = req.body;
      const { id } = req.params;
      const position = await Position.findByIdAndUpdate(
        id,
        {
          description,
        },
        { new: true }
      );
      return res.status(200).json(position);
    } catch (error) {
      return res.status(500).json({
        name: error.name,
        message: error.message,
      });
    }
  }
);

// Elimina una posicion
route.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const position = await Position.findById(id);
    if (!position) {
      return res.status(404).json({
        message: "La posicion no existe",
      });
    }
    const response = await Position.findByIdAndDelete(id);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({
      name: error.name,
      message: error.message,
    });
  }
});
module.exports = route;
