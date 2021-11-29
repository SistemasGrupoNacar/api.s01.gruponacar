const express = require("express");
const route = express.Router();
const {errors} = require("../../middleware/errors");
const { getState } = require("../../db/db-status");
const { body } = require("express-validator");
const Product = require("../../db/Models/Inventory/Product");

route.get("/", async (req, res) => {
  let products =
    await Product.find(/*{status:'619c6cdfaa41728e78071e8e'}*/).sort({
      name: 1,
    });
  res.status(200).json(products);
});

route.post(
  "/",
  body("name").notEmpty().withMessage("El nombre no debe estar vacio"),
  body("stock")
    .isNumeric()
    .isLength({ min: 0 })
    .withMessage("El stock debe ser un numero"),
  body("availability")
    .isBoolean()
    .withMessage("La disponibilidad debe ser booleano"),
  body("availability")
    .notEmpty()
    .withMessage("La disponibilidad no debe estar vacia"),
  async (req, res) => {
    errors.validationErrorResponse(req, res);
    const { name, stock, description, availability } = req.body;
    let productModel = new Product({
      name,
      stock,
      description,
      availability,
    });
    let response = await productModel.save();
    return res.status(201).json(response);
  }
);
module.exports = route;
