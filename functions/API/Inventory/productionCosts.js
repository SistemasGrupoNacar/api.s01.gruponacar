const express = require("express");
const route = express.Router();
const mongoose = require("mongoose");
const { body } = require("express-validator");
const errors = require("../../errors/index");
const ProductionCost = require("../../db/Models/Inventory/ProductionCost");
const Production = require("../../db/Models/Inventory/Production");

route.get("/", async (req, res) => {
  let productionCost = await ProductionCost.find()
    .sort({ _id: 1 })
    .populate("production_product", { name: 1 })
    .populate("production", { _id: 1 });
  res.status(200).json(productionCost);
});

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
    let response = await productionCost.save();
    await Production.findByIdAndUpdate(
      production,
      { $push: { production_costs: response._id } },
      { new: true }
    );
    res.status(201).json(response);
  }
);

route.delete("/:id", async (req, res) => {
  const response = await ProductionCost.findByIdAndDelete(req.params.id);
  const production = await Production.findById(response.production);
  await Production.findByIdAndUpdate(
    production,
    { $pull: { production_costs: response._id } },
    { new: true }
  );
  res.status(200).json(response);
});

module.exports = route;
