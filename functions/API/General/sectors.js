const express = require("express");
const route = express.Router();
const errors = require("../../errors/index");
const { body } = require("express-validator");
const Sector = require("../../db/Schema/General/Sector");

route.get("/", async (req, res) => {
  let sector = await Sector.find().sort({ _id: 1 });
  res.status(200).json(sector);
});

route.post(
  "/",
  body("title").notEmpty().withMessage("El titulo no debe estar vacio"),
  async (req, res) => {
    errors.validationErrorResponse(req, res);
    const { title } = req.body;
    let sector = {};
    sector.title = title;
    let sectorModel = new Sector(sector);
    let response = await sectorModel.save();
    return res.status(201).json(response);
  }
);

module.exports = route;
