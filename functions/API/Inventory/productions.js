const express = require("express");
const route = express.Router();
const mongoose = require("mongoose");
const { body } = require("express-validator");
const errors = require("../../errors/index");
const Production = require("../../db/Schema/Inventory/Production");

route.get("/", async (req, res) => {
  let productions = await Production.find()
    .sort({ _id: 1 })
    .populate("mesh_house")
    .populate("product",{name:1})
    //.populate("sales")
    .populate("production_costs", { description: 1 , date: 1, quantity: 1, total: 1, unit_price: 1 })
    .populate("status", { description: 1 });
  res.status(200).json(productions);
});

route.post(
  "/",
  body("product").notEmpty().withMessage("El producto no debe estar vacio"),
  body("status").notEmpty().withMessage("El estado no debe estar vacio"),
  body("start_date")
    .notEmpty()
    .withMessage("La fecha de inicio no debe estar vacia"),
  body("start_date")
    .isDate()
    .withMessage("La fecha de inicio debe ser una fecha valida"),
  async (req, res) => {
    errors.validationErrorResponse(req, res);
    const { product, status, start_date } = req.body;
    let production = {};
    production.product = product;
    production.status = status;
    production.start_date = start_date;
    let productionModel = new Production(production);
    let response = await productionModel.save();
    res.status(200).json(response);
  }
);

module.exports = route;
