const express = require("express");
const route = express.Router();
const { body, validationResult } = require("express-validator");
const Journey = require("../../db/Models/Control/Journey");
const Employee = require("../../db/Models/Control/Employee");

route.get("/", async (req, res) => {
  try {
    const journeys = await Journey.find();
    return res.status(200).json(journeys);
  } catch (error) {
    return res.status(500).json({
      name: error.name,
    });
  }
});

// Obtener jornada especifica por id
route.get("/:id", async (req, res) => {
  try {
    const journey = await Journey.findById(req.params.id);
    return res.status(200).json(journey);
  } catch (error) {
    return res.status(500).json({
      name: error.name,
    });
  }
});

route.post(
  "/",
  body("employee").notEmpty().withMessage("Empleado es requerido"),
  body("check_in").notEmpty().withMessage("Hora de entrada es requerida"),
  body("check_in").isISO8601().withMessage("Hora de entrada no es válida"),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    try {
      const { employee, check_in } = req.body;
      const journeyModel = new Journey({
        employee: employee,
        check_in: check_in,
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
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    try {
      const { check_out, description, was_worked } = req.body;
      const response = await Journey.findByIdAndUpdate(
        req.params.id,
        {
          check_out,
          description,
          was_worked,
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
