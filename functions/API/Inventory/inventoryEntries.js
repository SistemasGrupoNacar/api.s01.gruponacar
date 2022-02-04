const express = require("express");
const route = express.Router();
const InventoryEntry = require("../../db/Models/Inventory/InventoryEntry");
const mongoose = require("mongoose");
const { body, validationResult } = require("express-validator");
const { errors } = require("../../middleware/errors");
const InventoryProduct = require("../../db/Models/Inventory/InventoryProduct");

route.get("/", async (req, res) => {
  // Verifica si hay un limite en el query
  let inventoryEntries;
  if (req.query.limit) {
    let limit = parseInt(req.query.limit);
    inventoryEntries = await InventoryEntry.find({})
      .limit(limit)
      .populate("inventory_product")
      .sort({
        date: -1,
      });
  } else {
    inventoryEntries = await InventoryEntry.find({})
      .populate("inventory_product")
      .sort({
        date: -1,
      });
  }

  res.status(200).json(inventoryEntries);
});

route.post(
  "/",
  body("inventory_product")
    .notEmpty()
    .withMessage("Producto de Inventario es requerido"),
  body("date")
    .notEmpty()
    .withMessage("Fecha de Entrada de Inventario es requerido"),
  body("date")
    .isISO8601()
    .withMessage("Fecha de Entrada de Inventario no es válida"),
  body("quantity")
    .notEmpty()
    .withMessage("Cantidad de Entrada de Inventario es requerido"),
  body("quantity")
    .isInt({ min: 1 })
    .withMessage(
      "Cantidad de Entrada de Inventario debe ser mayor o igual a 1"
    ),
  body("unit_price")
    .notEmpty()
    .withMessage("Precio Unitario de Producto de Inventario es requerido"),
  body("unit_price")
    .isFloat({ min: 0 })
    .withMessage(
      "Precio Unitario de Producto de Inventario debe ser mayor o igual a 0"
    ),
  body("total")
    .notEmpty()
    .withMessage("Total de Entrada de Inventario es requerido"),
  body("total")
    .isFloat({ min: 0 })
    .withMessage("Total de Entrada de Inventario debe ser mayor o igual a 0"),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    const { inventory_product, date, quantity, unit_price, total } = req.body;
    try {
      //verificando si existe el producto en inventario
      const inventoryProduct = await InventoryProduct.findById(
        inventory_product
      );

      if (!inventoryProduct) {
        return res.status(404).json({
          name: "Producto de Inventario",
          message: "Producto de Inventario no existe",
        });
      }
      // agregando el producto al inventario
      const inventoryEntry = new InventoryEntry({
        inventory_product,
        date,
        quantity,
        unit_price,
        total,
      });
      await inventoryEntry.save();
      //aumentando el stock de inventoryProduct y actualizando el precio unitario
      await InventoryProduct.findByIdAndUpdate(inventory_product, {
        $inc: {
          stock: quantity,
        },
        $set: {
          cost: unit_price,
        },
      });
      return res.status(201).json(inventoryEntry);
    } catch (error) {
      return res.status(500).json({
        name: error.name,
        message: error.message,
      });
    }
  }
);

route.delete("/:id", async (req, res) => {
  try {
    const inventoryEntry = await InventoryEntry.findById(req.params.id);
    if (!inventoryEntry) {
      return res.status(404).json({
        name: "Entrada de Inventario",
        message: "Entrada de Inventario no existe",
      });
    }
    //verificando si el stock es mayor al de la cantidad de entrada
    const inventoryProduct = await InventoryProduct.findById(
      inventoryEntry.inventory_product
    );
    if (inventoryProduct.stock < inventoryEntry.quantity) {
      return res.status(400).json({
        name: "Entrada de Inventario",
        message:
          "No se puede eliminar la entrada de inventario, ya que el stock es menor a la cantidad de entrada",
      });
    }
    await InventoryEntry.findByIdAndDelete(req.params.id);
    //disminuyendo el stock de inventoryProduct
    await InventoryProduct.findByIdAndUpdate(inventoryEntry.inventory_product, {
      $inc: {
        stock: -inventoryEntry.quantity,
      },
    });
    return res.status(200).json(inventoryEntry);
  } catch (error) {
    return res.status(500).json({
      name: error.name,
      message: error.message,
    });
  }
});

module.exports = route;
