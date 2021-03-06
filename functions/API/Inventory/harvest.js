const express = require("express");
const route = express.Router();
const { body } = require("express-validator");
const { errors } = require("../../middleware/errors");
const Harvest = require("../../db/Models/Inventory/Harvest");
const Product = require("../../db/Models/Inventory/Product");
const Production = require("../../db/Models/Inventory/Production");

let { authenticateToken } = require("../../middleware/auth");

route.get("/", authenticateToken, async (req, res) => {
  try {
    // Verifica si hay un limite en el query
    let harvest;
    if (req.query.limit) {
      let limit = parseInt(req.query.limit);
      harvest = await Harvest.find({})
        .limit(limit)
        .sort({ date: -1 })
        .populate("product", { _id: 1, name: 1, unit_of_measurement: 1 })
        .populate("production", { _id: 1 });
    } else {
      harvest = await Harvest.find({})
        .sort({ date: -1 })
        .populate("product", { _id: 1, name: 1, unit_of_measurement: 1 })
        .populate("production", { _id: 1 });
    }

    return res.status(200).json(harvest);
  } catch (error) {
    return res.status(500).json({
      name: error.name,
      message: error.message,
    });
  }
});

// endpoint get harvest between two dates
route.get("/:startDate/:endDate", authenticateToken, async (req, res) => {
  try {
    const harvest = await Harvest.find({
      date: {
        $gte: req.params.startDate,
        $lte: req.params.endDate,
      },
    })
      .sort({ _id: 1 })
      .populate("product", { _id: 1, name: 1, unit_of_measurement: 1 })
      .populate("production", { _id: 1 });
    //couunt the number of quantity in harvest
    const count = await Harvest.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: "$quantity" },
        },
      },
    ]);
    return res.status(200).json({
      data: harvest,
      total: count[0].total,
      startDate: req.params.startDate,
      endDate: req.params.endDate,
    });
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
  body("production").notEmpty().withMessage("Producci??n es requerida"),
  body("quantity").notEmpty().withMessage("Cantidad es requerida"),
  body("date").notEmpty().withMessage("Fecha es requerida"),
  body("date").isISO8601().withMessage("Fecha no v??lida"),
  body("quantity").isInt().withMessage("Cantidad no es v??lida"),
  async (req, res) => {
    errors.validationErrorResponse(req, res);
    const { production, description, quantity, date } = req.body;

    try {
      //verificar si produccion existe
      const productionExist = await Production.findById(production);
      if (!productionExist) {
        return res.status(404).json({
          name: "Produccion",
          message: "Producci??n no existe",
        });
      }
      //obtiene el producto de la produccion
      const productByProduction = await Production.findOne({
        _id: production,
      }).select("product");
      const harvest = new Harvest({
        product: productByProduction.product,
        production,
        description,
        quantity,
        date,
      });

      const response = await harvest.save();
      await Product.findByIdAndUpdate(productByProduction.product, {
        $inc: { stock: quantity },
      });
      //agregar harvest a produccion
      await Production.findByIdAndUpdate(production, {
        $push: { harvest: response._id },
      });
      return res.status(201).json(response);
    } catch (error) {
      return res.status(500).json({
        name: error.name,
        message: error.message,
      });
    }
  }
);

route.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const harvest = await Harvest.findById(req.params.id);
    if (!harvest) {
      return res.status(404).json({
        name: "Cosecha",
        message: "No se encontr?? el registro",
      });
    }
    //verificar si el stock de producto es mayor al quantity de harvest
    const product = await Product.findById(harvest.product);
    if (product.stock < harvest.quantity) {
      return res.status(400).json({
        name: "Cosecha",
        message:
          "No se puede eliminar el registro por problemas de stock y cantidad de la cosecha",
      });
    }
    //disminuir stock de producto
    await Product.findByIdAndUpdate(harvest.product, {
      $inc: { stock: -harvest.quantity },
    });
    //eliminar harvest de produccion
    await Production.findByIdAndUpdate(harvest.production, {
      $pull: { harvest: harvest._id },
    });

    await harvest.remove();
    return res.status(200).json(harvest);
  } catch (error) {
    return res.status(500).json({
      name: error.name,
      message: error.message,
    });
  }
});

module.exports = route;
