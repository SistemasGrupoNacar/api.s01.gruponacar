const express = require("express");
const route = express.Router();
const { body } = require("express-validator");
const { errors } = require("../../middleware/errors");
const Production = require("../../db/Models/Inventory/Production");

let { authenticateToken } = require("../../middleware/auth");

// En progreso
route.get("/", authenticateToken, async (req, res) => {
  let productions = await Production.find({ in_progress: true })
    .sort({ _id: 1 })
    .populate("place", { description: 1, _id: 0 })
    .populate("product", { name: 1, _id: 1 })
    .populate("harvest", { quantity: 1, date: 1, description: 1 });
  return res.status(200).json(productions);
});

// Todas
route.get("/all", authenticateToken, async (req, res) => {
  let productions = await Production.find({})
    .sort({ _id: 1 })
    .populate("place", { description: 1, _id: 0 })
    .populate("product", { name: 1, _id: 1 })
    .populate("harvest", { quantity: 1, date: 1, description: 1 });
  return res.status(200).json(productions);
});

//get production start between two dates
route.get("/start/:startDate/:endDate", authenticateToken, async (req, res) => {
  try {
    let productions = await Production.find({
      start_date: {
        $gte: req.params.startDate,
        $lte: req.params.endDate,
      },
    })
      .sort({ _id: 1 })
      .populate("place", { description: 1, _id: 0 })
      .populate("product", { name: 1, _id: 0 });

    return res.status(200).json(productions);
  } catch (error) {
    return res.status(500).json({
      name: error.name,
      message: error.message,
    });
  }
});

//get production finished between two dates
route.get("/end/:startDate/:endDate", authenticateToken, async (req, res) => {
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
      .populate("product", { name: 1, _id: 0 });

    return res.status(200).json(productions);
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
  body("product").notEmpty().withMessage("El producto no debe estar vacio"),
  body("start_date")
    .notEmpty()
    .withMessage("La fecha de inicio no debe estar vacia"),
  body("description").exists(),
  body("place").notEmpty().withMessage("El lugar no debe estar vacio"),
  body("start_date")
    .isISO8601()
    .withMessage("La fecha debe ser una fecha valida"),
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
    return res.status(201).json(response);
  }
);

// Finalizar produccion
route.put(
  "/:id/finished",
  authenticateToken,
  body("end_date")
    .notEmpty()
    .withMessage("La fecha de fin no debe estar vacia"),
  body("end_date")
    .isISO8601()
    .withMessage("La fecha debe ser una fecha valida"),
  async (req, res) => {
    // validacion de errores
    errors.validationErrorResponse(req, res);
    const { end_date } = req.body;
    //buscar la produccion
    const production = await Production.findById(req.params.id)
      .populate("product")
      .populate("place");

    //validar que exista la produccion
    if (!production) {
      return res.status(404).json({
        name: "Produccion",
        message: "La produccion no existe",
      });
    }
    //validar que la produccion no este finalizada
    if (production.in_progress === false) {
      return res.status(400).json({
        name: "Produccion",
        message: "La produccion ya esta finalizada",
      });
    }

    //validar que la fecha de fin sea mayor a la fecha de inicio
    if (production.start_date > end_date) {
      return res.status(400).json({
        name: "Produccion",
        message: "La fecha de fin debe ser mayor a la fecha de inicio",
      });
    }

    // buscar la produccion y actualizarla
    let response = await Production.findByIdAndUpdate(
      req.params.id,
      {
        end_date: end_date,
        in_progress: false,
      },
      { new: true }
    );

    return res.status(200).json(response);
  }
);

// Actualizar produccion en progreso
route.put("/:id/inProgress", authenticateToken, async (req, res) => {
  try {
    //buscar la produccion y actualizarla
    let response = await Production.findByIdAndUpdate(
      req.params.id,
      {
        in_progress: true,
        end_date: null,
      },
      { new: true }
    );
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({
      name: error.name,
      message: error.message,
    });
  }
});

route.delete("/:id", authenticateToken, async (req, res) => {
  const production = await Production.findById(req.params.id);
  if (!production) {
    return res.status(404).json({
      name: "Produccion",
      message: "La produccion no existe",
    });
  }

  if (production.harvest.length > 0) {
    return res.status(400).json({
      name: "Produccion",
      message: "La produccion no puede ser eliminada porque tiene cosechas",
    });
  }
  const response = await Production.findByIdAndDelete(req.params.id);
  return res.status(200).json(response);
});

module.exports = route;
