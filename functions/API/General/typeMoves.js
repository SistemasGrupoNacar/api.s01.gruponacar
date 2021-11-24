const express = require("express");
const route = express.Router();
const errors = require("../../errors/index");
const { body } = require("express-validator");
const TypeMove = require("../../db/Schema/General/TypeMove");

route.get("/", async (req, res) => {
  let typeMove = await TypeMove.find().sort({ _id: 1 });
  res.status(200).json(typeMove);
});

route.post(
  "/",
  body("description")
    .notEmpty()
    .withMessage("La descripcion no debe estar vacio"),
  async (req, res) => {
    errors.validationErrorResponse(req, res);
    const { description } = req.body;
    let typeMove = {};
    typeMove.description = description;
    let typeMoveModel = new TypeMove(typeMove);
    let response = await typeMoveModel.save();
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
    let typeMove = await TypeMove.findById(id);
    if (!typeMove) {
      return res.status(404).json({
        message: "No se encontro el tipo de movimiento",
      });
    }
    typeMove.description = description;
    let response = await typeMove.save();
    return res.status(200).json(response);
  }
);

route.delete("/:id", async (req, res) => {
  const { id } = req.params;
  let typeMove = await TypeMove.findById(id);
  if (!typeMove) {
    return res.status(404).json({
      message: "No se encontro el tipo de movimiento",
    });
  }
  let response = await typeMove.remove();
  return res.status(200).json(response);
});

module.exports = route;
