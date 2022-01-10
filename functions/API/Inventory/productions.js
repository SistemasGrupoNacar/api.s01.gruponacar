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
    .populate("detail_sales", { date: 1, status: 1, description: 1, total: 1 })
    .populate("production_costs", {
      description: 1,
      date: 1,
      quantity: 1,
      total: 1,
      unit_price: 1,
      status: 1,
    })
    .populate("harvest", { quantity: 1, date: 1, description: 1 });
  return res.status(200).json(productions);
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
      .populate("detail_sales", { _id: 1, quantity: 1, sub_total: 1, total: 1 })
      .populate("production_costs", {
        description: 1,
        date: 1,
        quantity: 1,
        total: 1,
        unit_price: 1,
        status: 1,
      });
    return res.status(200).json(productions);
  } catch (error) {
    return res.status(500).json({
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
      .populate("detail_sales", { _id: 1, quantity: 1, sub_total: 1, total: 1 })
      .populate("production_costs", {
        description: 1,
        date: 1,
        quantity: 1,
        total: 1,
        unit_price: 1,
        status: 1,
      });
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
    return res.status(201).json(response);
  }
);

// Finalizar produccion
route.put(
  "/:id/finished",
  body("end_date")
    .notEmpty()
    .withMessage("La fecha de fin no debe estar vacia"),
  body("end_date")
    .isDate()
    .withMessage("La fecha de fin debe ser una fecha valida"),
  body("end_date")
    .isISO8601()
    .withMessage("La fecha de fin debe ser una fecha valida"),
  async (req, res) => {
    // validacion de errores
    errors.validationErrorResponse(req, res);
    const { end_date } = req.body;
    //buscar la produccion
    const production = await Production.findById(req.params.id)
      //.populate("extra_moves")
      .populate("production_costs")
      .populate("product")
      .populate("place")
      .populate("detail_sales");
    //.populate("Salary");

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
    // calcular el total de todos los costos

    let total_costs = 0;
    production.production_costs.forEach((cost) => {
      total_costs += cost.total;
    });
    /*production.salaries.forEach((salary) => {
      total_costs += salary.total;
    });*/
    production.extra_moves.forEach((move) => {
      if (move.type === "egress") {
        total_costs += move.total;
      }
    });

    //calcular el total de ingresos
    let total_detail_sales = 0;
    production.detail_sales.forEach((detail_sale) => {
      total_detail_sales += detail_sale.total;
    });
    production.extra_moves.forEach((move) => {
      if (move.type === "ingress") {
        total_detail_sales += move.total;
      }
    });

    // buscar la produccion y actualizarla
    let response = await Production.findByIdAndUpdate(
      req.params.id,
      {
        end_date: end_date,
        in_progress: false,
        total_egress: total_costs,
        total_ingress: total_detail_sales,
      },
      { new: true }
    );

    return res.status(200).json(response);
  }
);

// Actualizar produccion en progreso
route.put("/:id/inProgress", async (req, res) => {
  try {
    //buscar la produccion y actualizarla
    let response = await Production.findByIdAndUpdate(
      req.params.id,
      {
        in_progress: true,
        end_date: null,
        total_egress: 0,
        total_ingress: 0,
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

route.delete("/:id", async (req, res) => {
  const response = await Production.findByIdAndDelete(req.params.id);
  return res.status(200).json(response);
});

module.exports = route;
