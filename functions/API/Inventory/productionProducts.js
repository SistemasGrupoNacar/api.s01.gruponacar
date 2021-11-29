const express = require("express");
const route = express.Router();
const mongoose = require("mongoose");
const { body } = require("express-validator");
const {errors} = require("../../middleware/errors");
const ProductionProduct = require("../../db/Models/Inventory/ProductionProduct");

route.get("/", async (req, res) => {
  let productionProducts = await ProductionProduct.find().sort({ _id: 1 });
  res.status(200).json(productionProducts);
});

route.post(
  "/",
  body("name").notEmpty().withMessage("El nombre no debe estar vacio"),
  body("description").exists(),
  body("stock").notEmpty().withMessage("El stock no debe estar vacio"),
  body("stock").isInt().withMessage("El stock debe ser un numero entero"),
  body("min_stock")
    .isInt()
    .withMessage("El stock minimo debe ser un numero entero"),
  body("cost").isNumeric().withMessage("El costo debe ser un numero"),
  body("cost").notEmpty().withMessage("El costo no debe estar vacio"),
  body("availability")
    .isBoolean()
    .withMessage("La disponibilidad debe ser booleano"),
  body("availability")
    .notEmpty()
    .withMessage("La disponibilidad no debe estar vacia"),
  async (req, res) => {
    errors.validationErrorResponse(req, res);
    const { name, description, stock, min_stock, cost, availability } = req.body;
    let productionProduct = new ProductionProduct({
      name,
      description,
      stock,
      min_stock,
      cost,
      availability,
    });
    await productionProduct.save();
    res.status(201).json(productionProduct);
  }
);

module.exports = route;
