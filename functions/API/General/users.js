const express = require("express");
const route = express.Router();
const { errors } = require("../../middleware/errors");
const User = require("../../db/Models/General/User");
const Role = require("../../db/Models/General/Role");
const { body, validationResult } = require("express-validator");
let { authenticateToken } = require("../../middleware/auth");
const { comparePassword, createHash } = require("../../scripts/encrypt.js");
const Employee = require("../../db/Models/Control/Employee");

route.get("/", async (req, res) => {
  try {
    const users = await User.find()
      .sort({ _id: 1 })
      .populate("role", { title: 1, _id: 0 });
    res.status(200).json(users);
  } catch (error) {
    return res.status(500).json({
      name: error.name,
      message: error.message,
    });
  }
});

// Obtener los ultimos usuarios registrados
route.get("/last", async (req, res) => {
  try {
    const users = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("role", { title: 1, _id: 0 });
    res.status(200).json(users);
  } catch (error) {
    return res.status(500).json({
      name: error.name,
      message: error.message,
    });
  }
});

// Obtener usuario por id
route.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate("role", {
      title: 1,
      _id: 0,
    });
    // Verifica si el rol es de empleado
    if (user.role.title === "Employee") {
      const employee = await Employee.find({ user: user._id });
      user.employee = employee;
    }
    res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({
      name: error.name,
      message: error.message,
    });
  }
});

route.post(
  "/",
  body("username").notEmpty().withMessage("Usuario requerido"),
  body("password").notEmpty().withMessage("Contraseña requerida"),
  body("role").notEmpty().withMessage("Rol requerido"),
  async (req, res) => {
    errors.validationErrorResponse(req, res);
    const { username, password, role } = req.body;

    try {
      let user = await User.findOne({ username: username });
      if (user) {
        return res.status(400).json({
          name: "Usuario",
          message: "El usuario ya existe",
        });
      }
      //verificar si existe el rol
      if (!(await Role.findById(role))) {
        return res.status(400).json({
          name: "Rol",
          message: "El rol no existe",
        });
      }

      //encriptar contraseña
      const encryptPass = createHash(password);
      const createdUser = new User({
        username,
        password: encryptPass,
        role,
      });
      const response = await createdUser.save();
      return res.status(201).json(response);
    } catch (error) {
      res.status(500).json({
        name: error.name,
        message: error.message,
      });
    }
  }
);

// Cambia la contraseña de un usuario empleado recien registrado
route.put(
  "/:username/change-password",
  body("password").notEmpty().withMessage("Contraseña requerida"),
  body("newPassword").notEmpty().withMessage("Nueva contraseña requerida"),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    try {
      const { username } = req.params;
      const { password, newPassword } = req.body;
      const user = await User.findOne({ username: username });
      if (!user) {
        return res.status(404).json({
          message: "Usuario no encontrado",
        });
      }
      const compare = await comparePassword(password, user.password);
      if (!compare) {
        return res.status(400).json({
          message: "Contraseña incorrecta",
        });
      }
      const encryptPass = createHash(newPassword);
      const response = await User.findByIdAndUpdate(user._id, {
        password: encryptPass,
      });
      return res.status(200).json(response);
    } catch (error) {
      return res.status(500).json({
        name: error.name,
        message: error.message,
      });
    }
  }
);

// Cambiar la contrasenia de un usuario
route.put(
  "/change-password",
  authenticateToken,
  body("password").notEmpty().withMessage("Contraseña requerida"),
  body("newPassword").notEmpty().withMessage("Contraseña nueva es requerida"),
  body("newPassword")
    .isLength({ min: 6 })
    .withMessage("Contraseña nueva debe tener al menos 6 caracteres"),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    try {
      const { newPassword, password } = req.body;
      // Obtener el usuario
      const { _id } = req.user;
      const user = await User.findById(_id);
      // Verificar que el usuario exista
      if (!user) {
        return res.status(404).json({
          name: "Usuario",
          message: "El usuario no existe",
        });
      }
      // Verificar que la contraseña sea correcta
      if (!comparePassword(password, user.password)) {
        return res.status(401).json({
          name: "Contraseña",
          message: "La contraseña es incorrecta",
        });
      }
      // Encriptar la nueva contraseña
      const encryptPass = createHash(newPassword);
      // Actualizar el usuario
      user.password = encryptPass;
      let userN = await user.save();
      res.status(200).json(userN);
    } catch (error) {
      res.status(500).json({
        name: error.name,
        message: error.message,
      });
    }
  }
);

// Cambiar avatar de un usuario
route.put(
  "/:username/change-avatar",
  authenticateToken,
  body("avatar").notEmpty().withMessage("Avatar requerido"),
  async (req, res) => {
    try {
      const { username } = req.params;
      const { avatar } = req.body;
      const user = await User.findOne({ username: username });
      if (!user) {
        return res.status(404).json({
          name: "Usuario",
          message: "El usuario no existe",
        });
      }
      user.avatar = avatar;
      let userN = await user.save();
      res.status(200).json(userN);
    } catch (error) {
      res.status(500).json({
        name: error.name,
        message: error.message,
      });
    }
  }
);

route.delete("/:id", async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(id);
  if (!user) {
    return res.status(404).json({
      name: "Usuario",
      message: "No se encontro el usuario",
    });
  }
  const response = await User.findByIdAndDelete(id);
  return res.status(200).json(response);
});

module.exports = route;
