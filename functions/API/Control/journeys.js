const express = require("express");
const route = express.Router();
const { body, validationResult } = require("express-validator");
const Journey = require("../../db/Models/Control/Journey");
const Employee = require("../../db/Models/Control/Employee");

route.get("/", async (req, res) => {
  try {
    const journeys = await Journey.find()
      .populate("employee", {
        first_name: 1,
        last_name: 1,
        _id: 1,
      })
      .sort({
        createdAt: -1,
      });
    return res.status(200).json(journeys);
  } catch (error) {
    return res.status(500).json({
      name: error.name,
      message: error.message,
    });
  }
});

// Obtener jornada especifica por id
route.get("/byId/:id", async (req, res) => {
  try {
    const journey = await Journey.findById(req.params.id).sort({
      createdAt: -1,
    });
    return res.status(200).json(journey);
  } catch (error) {
    return res.status(500).json({
      name: error.name,
      message: error.message,
    });
  }
});

// Obtener las ultimas 5 jornadas
route.get("/last", async (req, res) => {
  try {
    const journeys = await Journey.find()
      .populate("employee", {
        first_name: 1,
        last_name: 1,
        _id: 1,
      })
      .sort({
        createdAt: -1,
      })
      .limit(5);
    return res.status(200).json(journeys);
  } catch (error) {
    return res.status(500).json({
      name: error.name,
      message: error.message,
    });
  }
});

// Obtener las jornadas en proceso
route.get("/in-progress", async (req, res) => {
  try {
    const journeys = await Journey.find({
      check_out: null,
    })
      .populate("employee", {
        first_name: 1,
        last_name: 1,
        _id: 1,
      })
      .sort({
        createdAt: -1,
      });
    return res.status(200).json(journeys);
  } catch (error) {
    return res.status(500).json({
      name: error.name,
      message: error.message,
    });
  }
});

// Obtener las jornadas de un empleado en especifico
route.get("/employee/:id", async (req, res) => {
  try {
    if (req.query.limit) {
      const limit = parseInt(req.query.limit);
      const journeys = await Journey.find({ employee: req.params.id })
        .sort({ createdAt: -1 })
        .limit(limit);
      return res.status(200).json(journeys);
    } else {
      const journeys = await Journey.find({ employee: req.params.id }).sort({
        createdAt: -1,
      });
      return res.status(200).json(journeys);
    }
  } catch (error) {
    return res.status(500).json({
      name: error.name,
      message: error.message,
    });
  }
});

route.post(
  "/",
  body("employee").notEmpty().withMessage("Empleado es requerido"),
  body("check_in").notEmpty().withMessage("Hora de entrada es requerida"),
  body("check_in").isISO8601().withMessage("Hora de entrada no es válida"),
  body("coordinates").notEmpty().withMessage("Coordenadas son requeridas"),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    try {
      const { employee, check_in, coordinates } = req.body;
      const journeyModel = new Journey({
        employee: employee,
        check_in: check_in,
        inCoordinatesLat: coordinates.lat,
        inCoordinatesLng: coordinates.lng,
      });
      const response = await journeyModel.save();

      //Agregar la jornada laboral al empleado
      const employeeModel = await Employee.findById(employee);
      employeeModel.journeys.push(response._id);
      await employeeModel.save();

      return res.status(200).json(response);
    } catch (error) {
      return res.status(500).json({
        name: error.name,
        message: error.message,
      });
    }
  }
);

// Agregar el checkout
route.put(
  "/:id",
  body("check_out").notEmpty().withMessage("Hora de salida es requerida"),
  body("check_out").isISO8601().withMessage("Hora de salida no es válida"),
  body("coordinates").notEmpty().withMessage("Coordenadas son requeridas"),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    try {
      const { check_out, description, was_worked, coordinates } = req.body;
      const response = await Journey.findByIdAndUpdate(
        req.params.id,
        {
          check_out,
          description,
          was_worked,
          outCoordinatesLat: coordinates.lat,
          outCoordinatesLng: coordinates.lng,
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
  }
);

// Actualizar dia como no trabajado
route.put("/:id/not_worked", async (req, res) => {
  try {
    const response = await Journey.findByIdAndUpdate(
      req.params.id,
      {
        was_worked: false,
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

// Actualizar dia como trabajado
route.put("/:id/worked", async (req, res) => {
  try {
    const response = await Journey.findByIdAndUpdate(
      req.params.id,
      {
        was_worked: true,
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

// Eliminar jornada
route.delete("/:id", async (req, res) => {
  try {
    const journey = await Journey.findById(req.params.id);
    // Eliminar del array de empleados la jornada
    const employee = await Employee.findById(journey.employee);
    employee.journeys.pull(journey._id);
    await employee.save();
    const response = await journey.remove();
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({
      name: error.name,
      message: error.message,
    });
  }
});

module.exports = route;
