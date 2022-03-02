const express = require("express");
const router = express.Router();
const { body, validationResult, param } = require("express-validator");
const Employee = require("../../db/Models/Control/Employee");
const User = require("../../db/Models/General/User");
const Role = require("../../db/Models/General/Role");
const { createHash } = require("../../scripts/encrypt");
const DEFAULT_PASSWORD = process.env.DEFAULT_PASSWORD;

router.get("/", async (req, res) => {
  try {
    const employees = await Employee.find({ is_active: true })
      .populate("position", {
        _id: 0,
        description: 1,
      })
      .populate("user", {
        _id: 0,
        username: 1,
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
      .populate("user", {
        _id: 0,
        username: 1,
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

router.get("/last", async (req, res) => {
  try {
    const employee = await Employee.find({ is_active: true })
      .populate("position", {
        _id: 0,
        description: 1,
      })
      .populate("user", {
        _id: 0,
        username: 1,
      })
      .sort({
        createdAt: -1,
      })
      .limit(5);
    return res.status(200).json(employee);
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
      const { firstName, lastName, position, dui, phone, email } = req.body;

      // CREACION DEL USUARIOPARA EL SISTEMA DE REGISTROS
      //Se crea la contraseña por defecto
      const password = createHash(DEFAULT_PASSWORD);
      // declaracion de variables
      let user;
      let carry = 0;
      let nickName;
      do {
        // Crear el usuario respectivo
        nickName = getNickName(firstName, lastName, carry);
        carry = nickName.carry;
        //Se crea el usuario
        user = await User.findOne({ username: nickName.username });
      } while (user);
      // Obtiene el rol de empleado
      const EMPLOYEE_ROLE = await Role.findOne({ title: "Employee" });

      //Se crea el usuario
      const userModel = new User({
        username: nickName.username,
        password: password,
        role: EMPLOYEE_ROLE._id,
      });

      //Se guarda el usuario
      const userResponse = await userModel.save();

      // Se crea el empleado
      const employeeModel = new Employee({
        first_name: firstName,
        last_name: lastName,
        position: position,
        dui: dui != "" ? dui : null,
        phone: phone != "" ? phone : null,
        email: email != "" ? email : null,
        user: userResponse._id,
        is_active: true,
      });
      let response = await employeeModel.save();

      return res.status(200).json({
        username: nickName.username,
        _id: response._id,
      });
    } catch (error) {
      return res.status(500).json({
        name: error.name,
        message: error.message,
      });
    }
  }
);

function getNickName(firstName, lastName, carry) {
  //Separa la primera parte del nombre y la primera parte del apellido
  let fName = firstName.split(" ")[0].toLowerCase();
  let lName = lastName.split(" ")[0].toLowerCase();
  let username;
  if (carry != 0) {
    // Si ya esta ocupado el nombre sin el carry
    username = fName + "." + lName + carry;
  } else {
    // Une el nombre y el apellido
    username = fName + "." + lName;
  }
  username = removeAccents(username);
  carry++;
  return { username, carry };
}
// Eliminar acentos
const removeAccents = (str) => {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
};

// Marcar empleado como activo o inactivo
router.put(
  "/:id/status/:status",
  param("status").notEmpty().withMessage("Estado es requerido"),
  param("status").isBoolean().withMessage("Estado debe ser booleano"),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    try {
      const { id, status } = req.params;
      const employee = await Employee.findByIdAndUpdate(
        id,
        {
          is_active: status,
        },
        {
          new: true,
        }
      );
      return res.status(200).json(employee);
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

    // Verifica si el empleado tiene jornadas
    if (employee.journeys.length > 0) {
      employee.is_active = false;
      const response = await employee.save();
      return res.status(200).json(response);
    } else {
      //Elimina el usuario
      const user = await User.findById(employee.user);
      await user.remove();
      // Elimina el empleado
      const response = await Employee.deleteOne({ _id: id });
      return res.status(200).json(response);
    }
  } catch (error) {
    return res.status(500).json({
      name: error.name,
      message: error.message,
    });
  }
});
module.exports = router;
