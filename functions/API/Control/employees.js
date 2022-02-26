const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const Employee = require("../../db/Models/Control/Employee");

router.get("/", async (req, res) => {
  try {
    const employees = await Employee.find({ is_active: true })
      .populate("position", {
        _id: 0,
        description: 1,
      })
      .populate("journeys", {
        check_in: 1,
        check_out: 1,
      });

    return res.status(200).json(employees);
  } catch (error) {
    return res.status(500).json({
      name: error.name,
      message: error.message,
    });
  }
});

router.get("/all", async (req, res) => {
  try {
    const employees = await Employee.find()
      .populate("position", {
        _id: 0,
        description: 1,
      })
      .populate("journeys", {
        check_in: 1,
        check_out: 1,
      });
    return res.status(200).json(employees);
  } catch (error) {
    return res.status(500).json({
      name: error.name,
      message: error.message,
    });
  }
});

router.post(
  "/",
  body("firstName").notEmpty().withMessage("Nombres son requeridos"),
  body("lastName").notEmpty().withMessage("Apellidos son requeridos"),
  body("position").notEmpty().withMessage("Posición es requerida"),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    try {
      const { firstName, lastName, position } = req.body;
      const employeeModel = new Employee({
        first_name: firstName,
        last_name: lastName,
        position: position,
        is_active: true,
      });
      const response = await employeeModel.save();
      return res.status(200).json(response);
    } catch (error) {
      return res.status(500).json({
        name: error.name,
        message: error.message,
      });
    }
  }
);

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const employee = await Employee.findById(id);
    if (!employee) {
      return res.status(404).json({
        message: "Empleado no encontrado",
      });
    }
    employee.is_active = false;
    const response = await employee.save();
    await Employee.deleteOne({ _id: id });
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({
      name: error.name,
      message: error.message,
    });
  }
});
module.exports = router;
