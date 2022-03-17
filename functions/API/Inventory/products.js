const express = require("express");
const route = express.Router();
const { errors } = require("../../middleware/errors");
const { getState } = require("../../db/db-status");
const { body, param } = require("express-validator");
const Product = require("../../db/Models/Inventory/Product");
const { log } = require("console");

// con restriccion de availability
route.get("/", async (req, res) => {
  let products;
  // Si hay un limite en el query
  if (req.query.limit) {
    let limit = parseInt(req.query.limit);
    products = await Product.find({ availability: true }).limit(limit);
  } else {
    products = await Product.find({ availability: true }).sort({ name: 1 });
  }
  return res.status(200).json(products);
});

// sin restriccion de availability
route.get("/all", async (req, res) => {
  let products;
  // Si hay un limite en el query
  if (req.query.limit) {
    let limit = parseInt(req.query.limit);
    products = await Product.find({}).limit(limit);
  } else {
    products = await Product.find({}).sort({ name: 1 });
  }
  return res.status(200).json(products);
});

route.post(
  "/",
  body("name").notEmpty().withMessage("El nombre no debe estar vacio"),
  body("availability")
    .isBoolean()
    .withMessage("La disponibilidad debe ser booleano"),
  body("availability")
    .notEmpty()
    .withMessage("La disponibilidad no debe estar vacia"),
  async (req, res) => {
    errors.validationErrorResponse(req, res);
    const { name, description, availability } = req.body;
    let productModel = new Product({
      name,
      stock: 0,
      description,
      availability,
    });
    let response = await productModel.save();
    return res.status(201).json(response);
  }
);

route.put(
  "/:id/available/:availability",
  param("id").notEmpty().withMessage("El id no debe estar vacio"),
  param("availability")
    .notEmpty()
    .withMessage("La disponibilidad no debe estar vacia"),
  param("availability")
    .isBoolean()
    .withMessage("La disponibilidad debe ser booleano"),
  async (req, res) => {
    errors.validationErrorResponse(req, res);
    const { id, availability } = req.params;
    let product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        name: "Producto",
        message: "El producto no existe",
      });
    }
    if (product.stock > 0) {
      return res.status(400).json({
        name: "Producto",
        message: "El producto no puede ser deshabilitado porque tiene stock",
      });
    }
    product.availability = availability;
    let response = await product.save();
    return res.status(200).json(response);
    F;
  }
);

route.put(
  "/:id/stock/:stock",
  param("id").notEmpty().withMessage("El id no debe estar vacio"),
  param("stock").notEmpty().withMessage("El stock no debe estar vacio"),
  param("stock").isInt({ min: 1 }).withMessage("El stock debe ser un numero"),
  async (req, res) => {
    errors.validationErrorResponse(req, res);
    const { id, stock } = req.params;
    let product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        name: "Producto",
        message: "El producto no existe",
      });
    }
    product.stock = stock;
    let response = await product.save();
    return res.status(200).json(response);
  }
);

route.put(
  "/:id/description",
  body("description")
    .notEmpty()
    .withMessage("La descripcion no debe estar vacia"),
  async (req, res) => {
    errors.validationErrorResponse(req, res);
    const { id } = req.params;
    const { description } = req.body;
    let response = await Product.findByIdAndUpdate(
      id,
      {
        description,
      },
      { new: true }
    );

    return res.status(200).json(response);
  }
);

route.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    // Verifica si todavia tiene stock
    let product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        name: "Producto",
        message: "El producto no existe",
      });
    }
    if (product.stock > 0) {
      return res.status(400).json({
        name: "Producto",
        message: "El producto aun tiene stock",
      });
    }

    const response = await Product.findByIdAndUpdate(id, {
      availability: false,
    });
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({
      name: error.name,
      message: error.message,
    });
  }
});
module.exports = route;
