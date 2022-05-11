const express = require("express");
const route = express.Router();
const { body, validationResult } = require("express-validator");
const Journey = require("../../db/Models/Control/Journey");
const Employee = require("../../db/Models/Control/Employee");
const User = require("../../db/Models/General/User");
let { authenticateToken } = require("../../middleware/auth");

route.get("/", authenticateToken, async (req, res) => {
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
route.get("/byId/:id", authenticateToken, async (req, res) => {
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
route.get("/last", authenticateToken, async (req, res) => {
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
route.get("/in-progress", authenticateToken, async (req, res) => {
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
route.get("/employee/:id", authenticateToken, async (req, res) => {
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
// Muestra una grafica de los empleados que tienen mas jornadas laborales en el mes actual
route.get("/graph", authenticateToken, async (req, res) => {
  try {
    const journeys = await Journey.aggregate([
      {
        $match: {
          check_in: {
            // Que sean solamente del mes actual
            $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            $lte: new Date(
              new Date().getFullYear(),
              new Date().getMonth() + 1,
              0
            ),
          },
          check_out: {
            $ne: null,
          },
        },
      },
      {
        // Agrupar por id de empleado
        $group: {
          _id: "$employee",
          count: { $sum: 1 },
        },
      },
    ]);
    // Obtener el nombre de cada empleado
    for (let i = 0; i < journeys.length; i++) {
      journeys[i].employee = await getEmployeeName(journeys[i]._id);
    }

    // Crea el diseño de datos que requiere el grafico
    let jorneyDataForGraph = [];
    journeys.forEach((element) => {
      /** FORMATO QUE REQUIERE EL GRAFICO
       *  [["Andrés Antonio García Monterroza",3],
          ["Herberth Antonio Mendoza Carpintero", 3],
          ["José Miguel Ayala Carrillo", 3],
          ["Carlos Eduardo Navarrete Rodríguez",3]]
       */
      jorneyDataForGraph.push([element.employee, element.count]);
    });

    // retorna el resultado
    return res.status(200).json(jorneyDataForGraph);
  } catch (error) {
    return res.status(500).json({
      name: error.name,
      message: error.message,
    });
  }
});

route.post(
  "/",
  body("username").notEmpty().withMessage("Empleado es requerido"),
  body("check_in").notEmpty().withMessage("Hora de entrada es requerida"),
  body("check_in").isISO8601().withMessage("Hora de entrada no es válida"),
  body("coordinates").notEmpty().withMessage("Coordenadas son requeridas"),
  authenticateToken,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    try {
      const { username, check_in, coordinates } = req.body;
      // Obtener el id del usuario
      const user = await User.findOne({ username });

      // Buscar el empleado por el usuario
      const employee = await Employee.findOne({ user: user._id });
      if (!employee) {
        return res.status(404).json({
          message: "Empleado no encontrado",
        });
      }
      // Verifica si el empleado esta activo
      if (!employee.is_active) {
        return res.status(400).json({
          message: "El empleado no esta activo",
        });
      }
      // Verifica si el usuario ya tiene un registro abierto
      const journey = await Journey.findOne({
        employee: employee._id,
      }).sort({ createdAt: -1 });
      if (journey != null) {
        if (journey.check_out == null) {
          return res.status(403).json({
            message: "El usuario ya tiene un registro abierto",
          });
        }
      }

      const journeyModel = new Journey({
        employee: employee,
        check_in: check_in,
        in_coordinates_lat: coordinates.lat,
        in_coordinates_lng: coordinates.lng,
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
  authenticateToken,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    try {
      const employee = await Employee.findById(req.params.id);
      if (!employee) {
        return res.status(404).json({
          message: "Empleado no encontrado",
        });
      }
      // Verifica si el empleado esta activo
      if (!employee.is_active) {
        return res.status(400).json({
          message: "El empleado no esta activo",
        });
      }
      // Verifica si el usuario ya tiene un registro abierto
      const journey = await Journey.findOne({
        employee: employee._id,
      }).sort({ createdAt: -1 });
      if (journey == null) {
        return res.status(404).json({
          message: "No se encontro el registro",
        });
      }
      if (journey.check_out != null) {
        return res.status(403).json({
          message: "El usuario ya tiene un registro cerrado",
        });
      }

      const { check_out, description, coordinates } = req.body;
      // Obtener joranda por empleado
      const journeyModel = await Journey.findOne({
        employee: employee._id,
      }).sort({ createdAt: -1 });
      journeyModel.check_out = check_out;
      journeyModel.out_coordinates_lat = coordinates.lat;
      journeyModel.out_coordinates_lng = coordinates.lng;
      journeyModel.description = description || "";
      const response = await journeyModel.save();
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
route.put("/:id/not_worked", authenticateToken, async (req, res) => {
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
route.put("/:id/worked", authenticateToken, async (req, res) => {
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
route.delete("/:id", authenticateToken, async (req, res) => {
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

// Obtener el nombre completo del empleado por el id
const getEmployeeName = async (id) => {
  const { first_name, last_name } = await Employee.findById(id);
  return `${first_name} ${last_name}`;
};

module.exports = route;
