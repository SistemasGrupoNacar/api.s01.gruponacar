const express = require("express");
const route = express.Router();
const { errors } = require("../../middleware/errors");
const { getState } = require("../../db/db-status");
const { body, param, validationResult } = require("express-validator");
const Product = require("../../db/Models/Inventory/Product");
const { log } = require("console");
const Production = require("../../db/Models/Inventory/Production");

let { authenticateToken } = require("../../middleware/auth");

// con restriccion de availability
route.get("/", authenticateToken, async (req, res) => {
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
route.get("/all", authenticateToken, async (req, res) => {
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

// Obtener producto en especifico
route.get("/:id", authenticateToken, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    return res.status(200).json(product);
  } catch (error) {
    return res.status(500).json({
      name: error.name,
      message: error.message,
    });
  }
});

route.post(
  "/",
  authenticateToken,
  body("name").notEmpty().withMessage("El nombre no debe estar vacio"),
  body("unitOfMeasurement")
    .notEmpty()
    .withMessage("La unidad de medida no debe estar vacia"),
  body("availability")
    .isBoolean()
    .withMessage("La disponibilidad debe ser booleano"),
  body("availability")
    .notEmpty()
    .withMessage("La disponibilidad no debe estar vacia"),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    const { name, unitOfMeasurement, description, availability } = req.body;
    let productModel = new Product({
      name,
      stock: 0,
      unit_of_measurement: unitOfMeasurement,
      description,
      availability,
    });
    let response = await productModel.save();
    return res.status(201).json(response);
  }
);

route.put(
  "/:id/available/:availability",
  authenticateToken,
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
  authenticateToken,
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
  authenticateToken,
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

route.delete("/:id", authenticateToken, async (req, res) => {
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

    // Verifica que el producto no haya sido asignado a ninguna produccion
    const production = await Production.findOne({
      product: id,
    });
    if (production) {
      return res.status(400).json({
        name: "Producto",
        message:
          "El producto no puede ser eliminado porque esta asignado a una produccion",
      });
    }
    // Verifica si ha tenido alguna cosecha
    const harvest = await Harvest.findOne({
      product: id,
    });
    if (harvest) {
      return res.status(400).json({
        name: "Producto",
        message:
          "El producto no puede ser eliminado porque esta asignado a una cosecha",
      });
    }

    // Verifica si ha tenido alguna venta
    const detail_sale = await DetailSale.findOne({
      product: id,
    });
    if (detail_sale) {
      return res.status(400).json({
        name: "Producto",
        message:
          "El producto no puede ser eliminado porque esta asignado a una venta",
      });
    }
    const response = await Product.findByIdAndDelete(id);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({
      name: error.name,
      message: error.message,
    });
  }
});
module.exports = route;
