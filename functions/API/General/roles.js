const express = require("express");
const route = express.Router();
const { errors } = require("../../middleware/errors");
const Role = require("../../db/Models/General/Role");
const { body } = require("express-validator");

route.get("/", async (req, res) => {
  try {
    const roles = await Role.find({});
    return res.json(roles);
  } catch (error) {
    return res.status(500).json({
      name: error.name,
      message: error.message,
    });
  }
});

route.post(
  "/",
  body("title").notEmpty().withMessage("Titulo de rol es requerido"),
  async (req, res) => {
    try {
      const { title } = req.body;
      const role = await Role.create({ title });
      await role.save();
      return res.status(201).json(role);
    } catch (error) {
      return res.status(500).json({
        name: error.name,
        message: error.message,
      });
    }
  }
);

route.delete(
    "/:id",
    async (req, res) => {
        try {
            const role = await Role.findById(req.params.id);
            if (!role) {
            return res.status(404).json({
                message: "El rol no existe",
            });
            }
            await role.remove();
            return res.status(200).json({
            message: "El rol ha sido eliminado",
            });
        } catch (error) {
            return res.status(500).json({
            name: error.name,
            message: error.message,
            });
        }
    }
)

module.exports = route;
