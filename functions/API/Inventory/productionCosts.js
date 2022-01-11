const express = require("express");
const route = express.Router();
const mongoose = require("mongoose");
const { body, query, param } = require("express-validator");
const { errors } = require("../../middleware/errors");
const ProductionCost = require("../../db/Models/Inventory/ProductionCost");
const Production = require("../../db/Models/Inventory/Production");

route.get("/", async (req, res) => {
  try {
    let productionCost = await ProductionCost.find()
      .sort({ _id: 1 })
      .populate("inventory_product", { name: 1 })
      .populate("production", { _id: 1 });
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
        .populate("production", { _id: 1 });
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
  body("production")
    .notEmpty()
    .withMessage("La produccion no debe estar vacia"),
  body("inventory_product")
    .notEmpty()
    .withMessage("El producto no debe estar vacio"),
  body("description").exists(),
  body("quantity").notEmpty().withMessage("La cantidad no debe estar vacia"),
  body("quantity").isInt().withMessage("La cantidad debe ser un numero entero"),
  body("date").notEmpty().withMessage("La fecha no debe estar vacia"),
  body("date").isDate().withMessage("Fecha no es valida"),
  body("total").notEmpty().withMessage("El total no debe estar vacio"),
  body("total").isNumeric().withMessage("El total debe ser numerico"),
  async (req, res) => {
    errors.validationErrorResponse(req, res);
    const {
      production,
      inventory_product,
      quantity,
      description,
      date,
      unit_price,
      total,
    } = req.body;
    let productionCost = new ProductionCost({
      production,
      inventory_product,
      description,
      quantity,
      date,
      unit_price,
      total,
    });
    try {
      let response = await productionCost.save();
      await Production.findByIdAndUpdate(
        production,
        { $push: { production_costs: response._id } },
        { new: true }
      );
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

route.delete("/:id", async (req, res) => {
  try {
    const response = await ProductionCost.findByIdAndDelete(req.params.id);
    const production = await Production.findById(response.production);
    await Production.findByIdAndUpdate(
      production,
      { $pull: { production_costs: response._id } },
      { new: true }
    );
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
