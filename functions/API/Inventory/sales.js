const express = require("express");
const route = express.Router();
const { body, param } = require("express-validator");
const { errors } = require("../../middleware/errors");
const Sale = require("../../db/Models/Inventory/Sale");

route.get("/", async (req, res) => {
  try {
    const sale = await Sale.find({})
      .sort({ _id: 1 })
      .populate("production", { _id: 1 })
      .populate({
        path: "detail_sale",
        populate: { path: "product", select: "name" },
        select: "quantity sub_total total",
      });
    res.status(200).json(sale);
    x;
  } catch (error) {
    res.status(500).json({
      name: error.name,
      message: error.message,
    });
  }
});

route.post(
  "/",
  body("production").notEmpty().withMessage("Producción es requerida"),
  body("date").notEmpty().withMessage("Fecha es requerida"),
  body("date").isISO8601().withMessage("Fecha no es válida"),
  async (req, res) => {
    errors.validationErrorResponse(req, res);
    const { production, date, description } = req.body;
    const sale = new Sale({
      production,
      description,
      date,
      status: true,
    });
    try {
      const response = await sale.save();
      res.status(201).json(response);
    } catch (error) {
      res.status(500).json({
        name: error.name,
        message: error.message,
      });
    }
  }
);

route.put(
  "/:id/:status",
  param("status").isBoolean().withMessage("Estado no es válido"),
  async (req, res) => {
    errors.validationErrorResponse(req, res);
    const { id, status } = req.params;
    try {
      const response = await Sale.findByIdAndUpdate(
        id,
        { status },
        { new: true }
      );
      res.status(200).json(response);
    } catch (error) {
      res.status(500).json({
        name: error.name,
        message: error.message,
      });
    }
  }
);

module.exports = route;
