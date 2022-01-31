const express = require("express");
const route = express.Router();
const ExtraMove = require("../../db/Models/General/ExtraMove");
const { errors } = require("../../middleware/errors");
let { authenticateToken } = require("../../middleware/auth");
const { body, param, validationResult } = require("express-validator");

route.get("/", async (req, res) => {
  try {
    let extraMoves = await ExtraMove.find()
      // Popular con typeMove
      .populate("type_move", { title: 1, _id: 1 });
    return res.status(200).json(extraMoves);
  } catch (error) {
    return res.status(500).json({
      name: error.name,
      message: error.message,
    });
  }
});

route.post(
  "/",
  body("description").notEmpty().withMessage("Descripción es requerida"),
  body("type_move").notEmpty().withMessage("Tipo de movimiento es requerido"),
  body("type_move").isMongoId().withMessage("Tipo de movimiento no válido"),
  body("date").isISO8601().withMessage("Fecha no válida"),
  body("total").notEmpty().withMessage("Total es requerido"),
  body("total").isNumeric().withMessage("Total debe ser un número"),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    try {
      const { description, date, type_move, total } = req.body;
      const extraMove = new ExtraMove({
        description,
        date,
        type_move,
        total,
      });
      await extraMove.save();
      return res.status(200).json(extraMove);
    } catch (err) {
      return res.status(500).json({
        name: err.name,
        message: err.message,
      });
    }
  }
);

// Cambiar el tipo de movimiento
route.put(
  "/:id/:type",
  // Validar el parametro id
  param("id").isMongoId().withMessage("Id debe ser un id valido"),
  // Validar el parametro type
  param("type").isMongoId().withMessage("Tipo debe ser un id valido"),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    try {
      const { id, type } = req.params;
      const extraMove = await ExtraMove.findById(id);
      if (!extraMove) {
        return res.status(404).json({
          name: "Movimiento extra",
          message: "No se encontró el movimiento extra",
        });
      }
      extraMove.type_move = type;
      await extraMove.save();
      return res.status(200).json(extraMove);
    } catch (error) {
      return res.status(500).json({
        name: error.name,
        message: error.message,
      });
    }
  }
);

// Cambiar el total
route.put(
  "/:id",
  body("total").notEmpty().withMessage("Total es requerido"),
  body("total").isDecimal().withMessage("Total debe ser un número"),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    try {
      const { id } = req.params;
      const { total } = req.body;
      const extraMove = await ExtraMove.findById(id);
      if (!extraMove) {
        return res.status(404).json({
          name: "Movimiento extra",
          message: "No se encontró el movimiento extra",
        });
      }
      extraMove.total = total;
      await extraMove.save();
      return res.status(200).json(extraMove);
    } catch (error) {
      return res.status(500).json({
        name: error.name,
        message: error.message,
      });
    }
  }
);

route.delete("/:id", async (req, res) => {
  try {
    const extraMove = await ExtraMove.findByIdAndDelete(req.params.id);
    res.status(200).json(extraMove);
  } catch (error) {
    res.status(500).json({
      name: error.name,
      message: error.message,
    });
  }
});

module.exports = route;
