const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const Salary = require("../../db/Models/Control/Salary");
const Employee = require("../../db/Models/Control/Employee");

let { authenticateToken } = require("../../middleware/auth");

router.get("/", authenticateToken, async (req, res) => {
  try {
    const salaries = await Salary.find()
      .sort({ createdAt: -1 })
      .populate("employee", {
        _id: 1,
        first_name: 1,
        last_name: 1,
      })
      .sort({
        date: -1,
      });
    return res.status(200).json(salaries);
  } catch (error) {
    return res.status(500).json({
      name: error.name,
      message: error.message,
    });
  }
});

// Obtener ultimos salarios
router.get("/last", authenticateToken, async (req, res) => {
  try {
    const salaries = await Salary.find()
      .populate("employee", {
        _id: 1,
        first_name: 1,
        last_name: 1,
      })
      .sort({ date: -1 })
      .limit(5);
    return res.status(200).json(salaries);
  } catch (error) {
    return res.status(500).json({
      name: error.name,
      message: error.message,
    });
  }
});

// Obtener los salarios de un empleado solo de el mes actual
router.get("/total/:employee", authenticateToken, async (req, res) => {
  try {
    const { employee } = req.params;
    const employeeName = await Employee.findById(employee);
    if (!employeeName) {
      return res.status(404).json({
        message: "Empleado no encontrado",
      });
    }

    const salaries = await Salary.find({
      employee: employee,
      createdAt: {
        $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        $lte: new Date(new Date().getFullYear(), new Date().getMonth() + 1),
      },
    });
    if (salaries.length === 0) {
      return res.status(404).json({
        message: "No hay salarios para este mes",
      });
    }
    let total = 0;
    salaries.forEach((salary) => {
      total += salary.total;
    });

    // Darle formato de dolar estadounidense
    total = total.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
    });
    return res.status(200).json({
      employee: employeeName,
      total: total,
      payments: salaries.length,

    });
  } catch (error) {
    return res.status(500).json({
      name: error.name,
      message: error.message,
    });
  }
});

router.post(
  "/",
  body("employee").notEmpty().withMessage("Empleado es requerido"),
  body("date").notEmpty().withMessage("Fecha es requerida"),
  body("date").isISO8601().withMessage("Fecha no es válida"),
  body("amount").notEmpty().withMessage("Monto es requerido"),
  body("amount").isNumeric().withMessage("Monto no es válido"),
  authenticateToken,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    try {
      const { employee, date, amount, description } = req.body;
      const salaryModel = new Salary({
        employee: employee,
        date: date,
        total: amount,
        description: description || "",
      });

      const response = await salaryModel.save();

      return res.status(200).json(response);
    } catch (error) {
      return res.status(500).json({
        name: error.name,
        message: error.message,
      });
    }
  }
);

router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const salary = await Salary.findById(req.params.id);
    if (!salary) {
      return res.status(404).json({
        message: "Salario no encontrado",
      });
    }

    const response = await salary.remove();
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({
      name: error.name,
      message: error.message,
    });
  }
});

module.exports = router;
