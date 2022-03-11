const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const Salary = require("../../db/Models/Control/Salary");
const Production = require("../../db/Models/Inventory/Production");

router.get("/", async (req, res) => {
  try {
    const salaries = await Salary.find()
      .sort({ createdAt: -1 })
      .populate("production", {
        _id: 1,
        description: 1,
      })
      .populate("employee", {
        _id: 1,
        first_name: 1,
        last_name: 1,
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
router.get("/last", async (req, res) => {
  try {
    const salaries = await Salary.find()
      .populate("production", {
        _id: 1,
        description: 1,
      })
      .populate("employee", {
        _id: 1,
        first_name: 1,
        last_name: 1,
      })
      .sort({ createdAt: -1 })
      .limit(5);
    return res.status(200).json(salaries);
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
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    try {
      const { employee, date, amount, description, production } = req.body;
      const salaryModel = new Salary({
        employee: employee,
        date: date,
        total: amount,
        description: description || "",
        production: production || null,
      });

      const response = await salaryModel.save();
      if (production) {
        const productionModel = await Production.findById(production);
        productionModel.salaries.push(response._id);
        await productionModel.save();
      }
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
    const salary = await Salary.findById(req.params.id);
    if (!salary) {
      return res.status(404).json({
        message: "Salario no encontrado",
      });
    }
    if (salary.production != null) {
      let production = await Production.findById(salary.production);
      if (!production.in_progress) {
        return res.status(400).json({
          message:
            "No se puede eliminar un salario de una producción finalizada",
        });
      }
      production.salaries.pull(salary._id);
      await production.save();
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
