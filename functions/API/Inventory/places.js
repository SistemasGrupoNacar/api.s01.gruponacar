const express = require("express");
const route = express.Router();
const mongoose = require("mongoose");
const Place = require("../../db/Models/Inventory/Place");
const { body } = require("express-validator");
const errors = require("../../errors/index");

route.get("/", async (req, res) => {
  let places = await Place.find().sort({ _id: 1 });
  res.status(200).json(places);
});

route.post(
  "/",
  body("description")
    .notEmpty()
    .withMessage("La descripcion no debe estar vacia"),
  body("availability")
    .isBoolean()
    .withMessage("La disponibilidad debe ser booleano"),
  body("availability")
    .notEmpty()
    .withMessage("La disponibilidad no debe estar vacia"),
  async (req, res) => {
    errors.validationErrorResponse(req, res);
    const { description, availability } = req.body;
    const place = new Place({
      description,
      availability,
    });
    const response = await place.save();
    res.status(201).json(response);
  }
);

route.put("/:id/:availability", async (req, res) => {
  errors.validationErrorResponse(req, res);
  const response = await Place.findByIdAndUpdate(
    req.params.id,
    {
      availability: req.params.availability,
    },
    { new: true }
  );
  res.status(200).json(response);
});

route.put("/:id", async (req, res) => {
  errors.validationErrorResponse(req, res);
  const { description } = req.body;
  const response = await Place.findByIdAndUpdate(
    req.params.id,
    {
      description,
    },
    { new: true }
  );
  res.status(200).json(response);
});

route.delete("/:id", async (req, res) => {
  const response = await Place.findByIdAndDelete(req.params.id);
  res.status(200).json(response);
});
module.exports = route;
