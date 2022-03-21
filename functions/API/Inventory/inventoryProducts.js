const express = require("express");
const route = express.Router();
const mongoose = require("mongoose");
const { body, param } = require("express-validator");
const { errors } = require("../../middleware/errors");
const InventoryProduct = require("../../db/Models/Inventory/InventoryProduct");

let { authenticateToken } = require("../../middleware/auth");

// Obtiene todos los insumos habilitados
route.get("/", authenticateToken, async (req, res) => {
  let inventoryProducts;
  // Si hay un limite en el query
  if (req.query.limit) {
    let limit = parseInt(req.query.limit);
    inventoryProducts = await InventoryProduct.find({ availability: true })
      .limit(limit)
      .sort({ _id: 1 });
  } else {
    inventoryProducts = await InventoryProduct.find({
      availability: true,
    }).sort({ _id: 1 });
  }
  return res.status(200).json(inventoryProducts);
});
// Obtiene todos los insumos sin restricciones
route.get("/all", authenticateToken, async (req, res) => {
  let inventoryProducts;
  // Si hay un limite en el query
  if (req.query.limit) {
    let limit = parseInt(req.query.limit);
    inventoryProducts = await InventoryProduct.find()
      .limit(limit)
      .sort({ _id: 1 });
  } else {
    inventoryProducts = await InventoryProduct.find().sort({ _id: 1 });
  }
  return res.status(200).json(inventoryProducts);
});

// get specific inventory product
route.get("/:id", authenticateToken, async (req, res) => {
  let inventoryProduct = await InventoryProduct.findById(req.params.id);
  if (!inventoryProduct) {
    return res.status(404).json({
      name: "Producto de Inventario para Produccion",
      message: "Inventory Product not found",
    });
  }
  return res.status(200).json(inventoryProduct);
});

// obtener listado de productos con stock debajo del minimo
route.get("/list/minStock", authenticateToken, async (req, res) => {
  try {
    // obtener listado de productos
    let inventoryProducts = await InventoryProduct.find({
      availability: true,
    }).sort({ _id: 1 });
    // obtener listado de productos con stock debajo del minimo
    let minStockProducts = inventoryProducts.filter(
      (product) => product.stock < product.min_stock
    );
    return res.status(200).json(minStockProducts);
  } catch (err) {
    return res.status(500).json({
      name: err.name,
      message: err.message,
    });
  }
});

route.post(
  "/",
  authenticateToken,
  body("name").notEmpty().withMessage("El nombre no debe estar vacio"),
  body("description").exists(),
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
    const { name, description, min_stock, cost, availability } = req.body;
    let inventoryProduct = new InventoryProduct({
      name,
      description,
      stock: 0,
      min_stock,
      cost,
      availability,
    });
    await inventoryProduct.save();
    return res.status(201).json(inventoryProduct);
  }
);

// Actualizar availability de un producto
route.put(
  "/:id/available/:availability",
  authenticateToken,
  param("id").notEmpty().withMessage("El id no debe estar vacio"),
  param("availability")
    .notEmpty()
    .withMessage("El availability no debe estar vacio"),
  param("availability")
    .isBoolean()
    .withMessage("El availability debe ser booleano"),
  async (req, res) => {
    errors.validationErrorResponse(req, res);
    const { id, availability } = req.params;
    let inventoryProduct = await InventoryProduct.findById(id);
    if (!inventoryProduct) {
      return res.status(404).json({
        name: "Producto de Inventario para Produccion",
        message: "Producto de Inventario para Produccion no encontrado",
      });
    }
    inventoryProduct.availability = availability;
    await inventoryProduct.save();
    return res.status(200).json(inventoryProduct);
  }
);

//actualizar producto
route.put(
  "/:id",
  authenticateToken,
  body("name").notEmpty().withMessage("El nombre no debe estar vacio"),
  body("description").exists(),
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
    const { name, description, min_stock, cost, availability } = req.body;
    try {
      let inventoryProduct = await InventoryProduct.findById(req.params.id);
      if (!inventoryProduct) {
        return res.status(404).json({
          name: "Producto de Inventario para Produccion",
          message: "Inventory Product not found",
        });
      }
      inventoryProduct.name = name;
      inventoryProduct.description = description;
      inventoryProduct.min_stock = min_stock;
      inventoryProduct.cost = cost;
      inventoryProduct.availability = availability;
      await inventoryProduct.save();
      return res.status(200).json(inventoryProduct);
    } catch (err) {
      return res.status(500).json({
        name: err.name,
        message: err.message,
      });
    }
  }
);

//actualizar el costo de un producto
route.put(
  "/:id/cost",
  authenticateToken,
  body("cost").isNumeric().withMessage("El costo debe ser un numero"),
  body("cost").notEmpty().withMessage("El costo no debe estar vacio"),
  async (req, res) => {
    errors.validationErrorResponse(req, res);
    const { cost } = req.body;
    const { id } = req.params;
    try {
      let inventoryProduct = await InventoryProduct.findById(id);
      if (!inventoryProduct) {
        return res.status(404).json({
          name: "Producto de Inventario",
          message: "Producto no encontrado",
        });
      }
      inventoryProduct.cost = cost;
      await inventoryProduct.save();
      return res.status(200).json(inventoryProduct);
    } catch (err) {
      return res.status(500).json({
        name: err.name,
        message: err.message,
      });
    }
  }
);

route.delete("/:id", authenticateToken, async (req, res) => {
  let inventoryProduct = await InventoryProduct.findById(req.params.id);
  if (!inventoryProduct) {
    return res.status(404).json({
      message: "El producto de produccion no existe",
    });
  }
  if (inventoryProduct.stock > 0) {
    return res.status(400).json({
      message: "El producto de produccion tiene stock",
    });
  }
  // Cambiar availability a false
  inventoryProduct.availability = false;
  const response = await inventoryProduct.save();
  return res.status(200).json(response);
});

module.exports = route;
