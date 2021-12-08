const express = require("express");
const route = express.Router();
const mongoose = require("mongoose");
const { body } = require("express-validator");
const { errors } = require("../../middleware/errors");
const InventoryProduct = require("../../db/Models/Inventory/InventoryProduct");

route.get("/", async (req, res) => {
  let inventoryProducts = await InventoryProduct.find().sort({ _id: 1 });
  res.status(200).json(inventoryProducts);
});

route.post(
  "/",
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
    res.status(201).json(inventoryProduct);
  }
);

//actualizar el costo de un producto
route.put(
  "/:id",
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

route.delete("/:id", async (req, res) => {
  let inventoryProduct = await InventoryProduct.findById(req.params.id);
  if (!inventoryProduct) {
    return res.status(404).json({
      message: "El producto de produccion no existe",
    });
  }
  await inventoryProduct.remove();
  res.status(200).json(inventoryProduct);
});

module.exports = route;
