const express = require("express");
const route = express.Router();
const mongoose = require("mongoose");
const { body, query, param } = require("express-validator");
const { errors } = require("../../middleware/errors");
const ProductionCost = require("../../db/Models/Inventory/ProductionCost");
const Production = require("../../db/Models/Inventory/Production");

route.get("/", async (req, res) => {
  try {
    let productionCost = await ProductionCost.find()
      .sort({ _id: 1 })
      .populate("production_product", { name: 1 })
      .populate("production", { _id: 1 });
    res.status(200).json(productionCost);
  } catch (err) {
    res.status(500).json({
      name: err.name,
      message: err.message,
    });
  }
});

// endpoint get productionCost between two dates
route.get(
  "/:startDate/:endDate",
  param("startDate")
    .isISO8601()
    .toDate()
    .withMessage("Fecha de inicio no es valida"),
  param("endDate")
    .isISO8601()
    .toDate()
    .withMessage("Fecha de fin no es valida"),
  async (req, res) => {
    try {
      let productionCost = await ProductionCost.find({
        date: {
          $gte: req.params.startDate,
          $lte: req.params.endDate,
        },
      })
        .sort({ _id: 1 })
        .populate("production_product", { name: 1 })
        .populate("production", { _id: 1 });
      res.status(200).json(productionCost);
    } catch (err) {
      res.status(500).json({
        name: err.name,
        error: err.message,
      });
    }
  }
);

route.post(
  "/",
  body("production")
    .notEmpty()
    .withMessage("La produccion no debe estar vacia"),
  body("production_product")
    .notEmpty()
    .withMessage("El producto no debe estar vacio"),
  body("description").exists(),
  body("quantity").notEmpty().withMessage("La cantidad no debe estar vacia"),
  body("quantity").isInt().withMessage("La cantidad debe ser un numero entero"),
  body("date").notEmpty().withMessage("La fecha no debe estar vacia"),
  body("date").isDate().withMessage("La fecha debe ser una fecha valida"),
  body("unit_price")
    .isNumeric()
    .withMessage("El precio unitario debe ser numerico"),
  body("unit_price")
    .isNumeric()
    .withMessage("El precio unitario debe ser numerico"),
  body("total").notEmpty().withMessage("El total no debe estar vacio"),
  body("total").isNumeric().withMessage("El total debe ser numerico"),
  async (req, res) => {
    errors.validationErrorResponse(req, res);
    const {
      production,
      production_product,
      quantity,
      description,
      date,
      unit_price,
      total,
    } = req.body;
    let productionCost = new ProductionCost({
      production,
      production_product,
      description,
      quantity,
      date,
      unit_price,
      total,
    });
    try {
      let response = await productionCost.save();
      await Production.findByIdAndUpdate(
        production,
        { $push: { production_costs: response._id } },
        { new: true }
      );
      res.status(201).json(response);
    } catch (err) {
      res.status(500).json({
        name: err.name,
        error: err.message,
      });
    }
  }
);

route.delete("/:id", async (req, res) => {
  try {
    const response = await ProductionCost.findByIdAndDelete(req.params.id);
    const production = await Production.findById(response.production);
    await Production.findByIdAndUpdate(
      production,
      { $pull: { production_costs: response._id } },
      { new: true }
    );
    res.status(200).json(response);
  } catch (err) {
    res.status(500).json({
      name: err.name,
      error: err.message,
    });
  }
});

module.exports = route;
