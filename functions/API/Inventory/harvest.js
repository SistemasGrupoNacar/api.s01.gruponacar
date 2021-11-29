const express = require("express");
const route = express.Router();
const { body } = require("express-validator");
const { errors } = require("../../middleware/errors");
const Harvest = require("../../db/Models/Inventory/Harvest");

route.get("/", async (req, res) => {
  try {
    const harvest = await Harvest.find({})
      .sort({ _id: 1 })
      .populate("product", { _id: 1, name: 1 })
      .populate("production", { _id: 1 });
    res.status(200).json(harvest);
  } catch (error) {
    res.status(500).json({
      name: error.name,
      message: error.message,
    });
  }
});

route.post(
  "/",
  body("product").notEmpty().withMessage("Producto es requerido"),
  body("production").notEmpty().withMessage("Producción es requerida"),
  body("quantity").notEmpty().withMessage("Cantidad es requerida"),
  body("date").notEmpty().withMessage("Fecha es requerida"),
  body("date").isISO8601().withMessage("Fecha no es válida"),
  body("quantity").isInt().withMessage("Cantidad no es válida"),
  async (req, res) => {
    errors.validationErrorResponse(req, res);
    const { product, production, description, quantity, date } = req.body;
    const harvest = new Harvest({
      product,
      production,
      description,
      quantity,
      date,
    });
    try {
      const response = await harvest.save();
      res.status(201).json(response);
    } catch (error) {
      res.status(500).json({
        name: error.name,
        message: error.message,
      });
    }
  }
);

module.exports = route;
