const express = require("express");
const route = express.Router();
const { body } = require("express-validator");
const { errors } = require("../../middleware/errors");
const DetailSale = require("../../db/Models/Inventory/DetailSale");
const { log } = require("console");

route.get("/", async (req, res) => {
  try {
    const detailSale = await DetailSale.find({})
      .sort({ _id: 1 })
      .populate("sale", { _id: 1, date: 1, status: 1 })
      .populate("product", { _id: 1, name: 1 });
    res.status(200).json(detailSale);
  } catch (error) {
    res.status(500).json({
      name: error.name,
      message: error.message,
    });
  }
});

route.post(
  "/",
  body("sale").notEmpty().withMessage("Venta es requerida"),
  body("product").notEmpty().withMessage("Producto es requerido"),
  body("quantity").notEmpty().withMessage("Cantidad es requerida"),
  body("sub_total").notEmpty().withMessage("Sub total es requerido"),
  body("total").notEmpty().withMessage("Total es requerido"),
  body("quantity").isInt().withMessage("Cantidad no es válida"),
  body("sub_total").isNumeric().withMessage("Sub total no es válido"),
  body("total").isNumeric().withMessage("Total no es válido"),
  async (req, res) => {
    errors.validationErrorResponse(req, res);
    const { sale, product, quantity, sub_total, total } = req.body;
    const detailSale = new DetailSale({
      sale,
      product,
      quantity,
      sub_total,
      total,
    });
    try {
      const response = await detailSale.save();
      await Sale.findByIdAndUpdate(sale, {
        $push: { detail_sale: response._id },
        $inc: { total: total },
      });

      res.status(201).json(response);
    } catch (error) {
      res.status(500).json({
        name: error.name,
        message: error.message,
      });
    }
  }
);

route.put(
  "/:id",
  body("sale").notEmpty().withMessage("Venta es requerida"),
  body("product").notEmpty().withMessage("Producto es requerido"),
  body("quantity").notEmpty().withMessage("Cantidad es requerida"),
  body("sub_total").notEmpty().withMessage("Sub total es requerido"),
  body("total").notEmpty().withMessage("Total es requerido"),
  body("quantity").isInt().withMessage("Cantidad no es válida"),
  body("sub_total").isNumeric().withMessage("Sub total no es válido"),
  body("total").isNumeric().withMessage("Total no es válido"),
  async (req, res) => {
    errors.validationErrorResponse(req, res);
    const { id } = req.params;
    const { sale, product, quantity, sub_total, total } = req.body;
    try {
      const prevTotal = await DetailSale.findById(id).select("total");
      const response = await DetailSale.findByIdAndUpdate(id, {
        sale,
        product,
        quantity,
        sub_total,
        total,
      }, { new: true });
      const newTotal = (total - prevTotal.total).toFixed(2);
      await Sale.findByIdAndUpdate(sale, {
        $inc: { total: newTotal },
      });
      res.status(200).json(response);
    } catch (error) {
      res.status(500).json({
        name: error.name,
        message: error.message,
      });
    }
  }
);

route.delete("/:id", async (req, res) => {
  try {
    const response = await DetailSale.findByIdAndDelete(req.params.id);
    await Sale.findByIdAndUpdate(response.sale, {
      $pull: { detail_sale: response._id },
      $inc: { total: -response.total },
    });
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({
      name: error.name,
      message: error.message,
    });
  }
});

module.exports = route;
