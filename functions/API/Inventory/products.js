const express = require("express");
const route = express.Router();
const errors = require("../../errors/index");
const { getState } = require("../../db/db-status");
const { body } = require("express-validator");
const Product = require("../../db/Schema/Inventory/Product");

route.get("/", async (req, res) => {
  let products = await Product.find(/*{status:'619c6cdfaa41728e78071e8e'}*/)
    .sort({ name: 1 })
    .populate({ path: "status", model: "status" });
  res.status(200).json(products);
});

route.post(
  "/",
  body("name").notEmpty().withMessage("El nombre no debe estar vacio"),
  body("stock")
    .isNumeric()
    .isLength({ min: 0 })
    .withMessage("El stock debe ser un numero"),
  body("status").notEmpty().withMessage("El estado no debe estar vacio"),
  async (req, res) => {
    errors.validationErrorResponse(req, res);
    const { name, stock, description, status } = req.body;
    let product = {};
    product.name = name;
    product.stock = stock;
    product.description = description;
    product.status = status;
    let productModel = new Product(product);
    let response = await productModel.save();
    return res.status(200).json(response);
  }
);
module.exports = route;
