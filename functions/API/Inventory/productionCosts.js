const express = require("express");
const route = express.Router();
const mongoose = require("mongoose");
const { body, query, param, validationResult } = require("express-validator");
const { errors } = require("../../middleware/errors");
const ProductionCost = require("../../db/Models/Inventory/ProductionCost");

let { authenticateToken } = require("../../middleware/auth");

route.get("/", authenticateToken, async (req, res) => {
  try {
    let productionCost = await ProductionCost.find()
      .sort({ _id: 1 })
      .populate("inventory_product", { name: 1 })
    return res.status(200).json(productionCost);
  } catch (err) {
    return res.status(500).json({
      name: err.name,
      message: err.message,
    });
  }
});

// endpoint get productionCost between two dates
route.get(
  "/:startDate/:endDate",
  authenticateToken,
  param("startDate").isDate().withMessage("Fecha de inicio no es valida"),
  param("endDate").isDate().withMessage("Fecha de finalizacion no es valida"),
  async (req, res) => {
    try {
      let productionCost = await ProductionCost.find({
        date: {
          $gte: req.params.startDate,
          $lte: req.params.endDate,
        },
      })
        .sort({ _id: 1 })
        .populate("inventory_product", { name: 1 })
      //count total productionCost
      let totalProductionCost = await ProductionCost.aggregate([
        {
          $match: {
            date: {
              $gte: req.params.startDate,
              $lte: req.params.endDate,
            },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$total" },
          },
        },
      ]);

      return res.status(200).json({
        data: productionCost,
        total: totalProductionCost[0].total,
        startDate: req.params.startDate,
        endDate: req.params.endDate,
      });
    } catch (err) {
      return res.status(500).json({
        name: err.name,
        error: err.message,
      });
    }
  }
);

route.post(
  "/",
  authenticateToken,
  body("inventory_product")
    .notEmpty()
    .withMessage("El producto no debe estar vacio"),
  body("description").exists(),
  body("quantity").notEmpty().withMessage("La cantidad no debe estar vacia"),
  body("quantity").isNumeric().withMessage("La cantidad debe ser un numero"),
  body("date").notEmpty().withMessage("La fecha no debe estar vacia"),
  body("date").isISO8601().withMessage("La fecha no es valida"),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    // Obtiene los datos del post
    const {  inventory_product, quantity, description, date } =
      req.body;

    try {
      // Obtiene el producto de inventario de la base de datos
      const inventoryProduct = await InventoryProduct.findById(
        inventory_product
      );
      if (!inventoryProduct) {
        return res.status(404).json({
          name: "Producto de inventario",
          message: "El producto no existe",
        });
      }
      // Verifica si hay suficiente insumo
      if (inventoryProduct.quantity < quantity) {
        return res.status(400).json({
          name: "Insuficiente insumo",
          message: "No hay suficiente insumo",
        });
      }

      // Asigna los valores de precio unitario y total dependiendo de lo que marque el producto en inventario
      const unit_price = inventoryProduct.cost;
      const total = quantity * unit_price;
      // Crea el modelo de costo de produccion
      let productionCost = new ProductionCost({
        
        inventory_product,
        description,
        quantity,
        date,
        unit_price,
        total,
      });
      let response = await productionCost.save();
      
      //actualizar stock de inventoryProduct
      await InventoryProduct.findByIdAndUpdate(inventory_product, {
        $inc: {
          stock: -quantity,
        },
      });
      return res.status(201).json(response);
    } catch (err) {
      return res.status(500).json({
        name: err.name,
        error: err.message,
      });
    }
  }
);

route.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const response = await ProductionCost.findByIdAndDelete(req.params.id);
    
    //actualizar stock de inventoryProduct
    await InventoryProduct.findByIdAndUpdate(response.inventory_product, {
      $inc: {
        stock: response.quantity,
      },
    });
    return res.status(200).json(response);
  } catch (err) {
    return res.status(500).json({
      name: err.name,
      error: err.message,
    });
  }
});

module.exports = route;
