const express = require("express");
const route = express.Router();
const ExtraMove = require("../../db/Models/General/ExtraMove");
const { errors } = require("../../middleware/errors");
let { authenticateToken } = require("../../middleware/auth");
const { body } = require("express-validator");

route.get("/", async (req, res) => {
  try {
    let extraMoves = await ExtraMove.find()
      //.populate("Production")
      .populate("TypeMove");
    res.status(200).json(extraMoves);
  } catch (error) {
    res.status(500).json({
      name: error.name,
      message: error.message,
    });
  }
});

route.post("/", async (req, res) => {
  errors.validationErrorResponse(req, res);
  try {
    const { description, date, type_move, production, total } = req.body;
    const extraMove = new ExtraMove({
      description,
      date,
      type_move,
      total,
    });
    await extraMove.save();
    res.status(200).json(extraMove);
  } catch (err) {
    res.status(500).json({
      name: err.name,
      message: err.message,
    });
  }
});

route.delete("/:id", async (req, res) => {
  try {
    const extraMove = await ExtraMove.findByIdAndDelete(req.params.id);
    res.status(200).json(extraMove);
  } catch (error) {
    res.status(500).json({
      name: error.name,
      message: error.message,
    });
  }
});

module.exports = route;
