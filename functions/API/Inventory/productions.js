const express = require("express");
const route = express.Router();
const { body } = require("express-validator");
const { errors } = require("../../middleware/errors");
const Production = require("../../db/Models/Inventory/Production");

route.get("/", async (req, res) => {
  let productions = await Production.find()
    .sort({ _id: 1 })
    .populate("place", { description: 1, _id: 0 })
    .populate("product", { name: 1, _id: 0 })
    //.populate("sales")
    .populate("production_costs", {
      description: 1,
      date: 1,
      quantity: 1,
      total: 1,
      unit_price: 1,
      status: 1,
    });
  res.status(200).json(productions);
});

//get production start between two dates
route.get("/start/:startDate/:endDate", async (req, res) => {
  try {
    let productions = await Production.find({
      start_date: {
        $gte: req.params.startDate,
        $lte: req.params.endDate,
      },
    })
      .sort({ _id: 1 })
      .populate("place", { description: 1, _id: 0 })
      .populate("product", { name: 1, _id: 0 })
      //.populate("sales")
      .populate("production_costs", {
        description: 1,
        date: 1,
        quantity: 1,
        total: 1,
        unit_price: 1,
        status: 1,
      });
    res.status(200).json(productions);
  } catch (error) {
    res.status(500).json({
      name: error.name,
      message: error.message,
    });
  }
});

//get production finished between two dates
route.get("/end/:startDate/:endDate", async (req, res) => {
  try {
    let productions = await Production.find({
      end_date: {
        $gte: req.params.startDate,
        $lte: req.params.endDate,
        $ne: null,
      },
    })
      .sort({ _id: 1 })
      .populate("place", { description: 1, _id: 0 })
      .populate("product", { name: 1, _id: 0 })
      //.populate("sales")
      .populate("production_costs", {
        description: 1,
        date: 1,
        quantity: 1,
        total: 1,
        unit_price: 1,
        status: 1,
      });
    res.status(200).json(productions);
  } catch (error) {
    res.status(500).json({
      name: error.name,
      message: error.message,
    });
  }
});

route.post(
  "/",
  body("product").notEmpty().withMessage("El producto no debe estar vacio"),
  body("start_date")
    .notEmpty()
    .withMessage("La fecha de inicio no debe estar vacia"),
  body("description").exists(),
  body("place").notEmpty().withMessage("El lugar no debe estar vacio"),
  body("start_date")
    .isDate()
    .withMessage("La fecha de inicio debe ser una fecha valida"),
  async (req, res) => {
    errors.validationErrorResponse(req, res);
    const { product, status, start_date, description, place } = req.body;
    let productionModel = new Production({
      product: product,
      status: status,
      start_date: start_date,
      description: description,
      place: place,
      in_progress: true,
    });
    let response = await productionModel.save();
    res.status(201).json(response);
  }
);

route.delete("/:id", async (req, res) => {
  const response = await Production.findByIdAndDelete(req.params.id);
  res.status(200).json(response);
});

module.exports = route;
