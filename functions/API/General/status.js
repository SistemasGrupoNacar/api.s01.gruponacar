const express = require("express");
const route = express.Router();
const errors = require("../../errors/index");
const { getState } = require("../../db/db-status");
const { body } = require("express-validator");
const Status = require("../../db/Schema/General/Status");

route.get("/", async (req, res) => {
  let status = await Status.find().sort({ _id: 1 });
  res.status(200).json(status);
});

route.post(
  "/",
  body("description")
    .notEmpty()
    .withMessage("La descripcion no debe estar vacio"),
  async (req, res) => {
    errors.validationErrorResponse(req, res);
    const { description } = req.body;
    let status = {};
    status.description = description;
    let statusModel = new Status(status);
    let response = await statusModel.save();
    return res.status(200).json(response);
  }
);

route.put(
  "/:id",
  body("description")
    .notEmpty()
    .withMessage("La descripcion no debe estar vacio"),
  async (req, res) => {
    errors.validationErrorResponse(req, res);
    const { id } = req.params;
    const { description } = req.body;
    let status = await Status.findById(id);
    if (!status) {
      return res.status(404).json({
        message: "No se encontro el estado",
      });
    }
    status.description = description;
    let response = await status.save();
    return res.status(200).json(response);
  }
);

route.delete("/:id", async (req, res) => {
  const { id } = req.params;
  let status = await Status.findById(id);
  if (!status) {
    return res.status(404).json({
      message: "No se encontro el estado",
    });
  }
  let response = await status.remove();
  return res.status(200).json(response);
});

module.exports = route;
