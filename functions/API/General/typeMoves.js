const express = require("express");
const route = express.Router();
const { errors } = require("../../middleware/errors");
const { body } = require("express-validator");
const TypeMove = require("../../db/Models/General/TypeMove");
let { authenticateToken } = require("../../middleware/auth");

route.get("/", authenticateToken, async (req, res) => {
  let typeMove = await TypeMove.find().sort({ _id: 1 });
  res.status(200).json(typeMove);
});

route.post(
  "/",
  body("title").notEmpty().withMessage("El titulo no debe estar vacio"),
  async (req, res) => {
    errors.validationErrorResponse(req, res);
    try {
      const { title } = req.body;
      let typeMoveModel = new TypeMove({
        title,
      });
      let response = await typeMoveModel.save();
      return res.status(201).json(response);
    } catch (error) {
      return res.status(500).json({
        name: error.name,
        message: error.message,
      });
    }
  }
);

route.put(
  "/:id",
  body("title").notEmpty().withMessage("El titulo no debe estar vacio"),
  async (req, res) => {
    errors.validationErrorResponse(req, res);
    const { id } = req.params;
    const { title } = req.body;
    try {
      let typeMove = await TypeMove.findById(id);
      if (!typeMove) {
        return res.status(404).json({
          message: "No se encontro el tipo de movimiento",
        });
      }
      typeMove.title = title;
      let response = await typeMove.save();
      return res.status(200).json(response);
    } catch (error) {
      return res.status(500).json({
        name: error.name,
        message: error.message,
      });
    }
  }
);

route.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    let typeMove = await TypeMove.findById(id);
    if (!typeMove) {
      return res.status(404).json({
        message: "No se encontro el tipo de movimiento",
      });
    }
    let response = await typeMove.remove();
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({
      name: error.name,
      message: error.message,
    });
  }
});

module.exports = route;
