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
      return res.status(200).json(detailSale);
  } catch (error) {
    return res.status(500).json({
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
    //validacion de errores
    errors.validationErrorResponse(req, res);
    const { sale, product, quantity, sub_total, total } = req.body;
    //obtiene el stock del producto
    const productFromDatabase = await Product.findOne({ _id: product }).select(
      "stock"
    );
    //verifica si existe suficiente stock
    const enough = productFromDatabase.stock >= quantity ? true : false;
    if (!enough) {
      return res.status(400).json({
        name: "Stock insuficiente",
        message: "No hay suficiente stock para realizar la venta",
      });
    }
    //crea el detalle de la venta
    const detailSale = new DetailSale({
      sale,
      product,
      quantity,
      sub_total,
      total,
    });
    try {
      //guarda el detalle de la venta
      const response = await detailSale.save();
      await Sale.findByIdAndUpdate(sale, {
        $push: { detail_sale: response._id },
        $inc: { total: total },
      });
      //actualiza el stock del producto
      await Product.findByIdAndUpdate(product, {
        $inc: { stock: -quantity },
      });
      return res.status(201).json(response);
    } catch (error) {
      return res.status(500).json({
        name: error.name,
        message: error.message,
      });
    }
  }
);

route.put(
  "/:id/costs",
  body("quantity").notEmpty().withMessage("Cantidad es requerida"),
  body("sub_total").notEmpty().withMessage("Sub total es requerido"),
  body("total").notEmpty().withMessage("Total es requerido"),
  body("quantity").isInt().withMessage("Cantidad no es válida"),
  body("sub_total").isNumeric().withMessage("Sub total no es válido"),
  body("total").isNumeric().withMessage("Total no es válido"),
  async (req, res) => {
    //validacion de errores
    errors.validationErrorResponse(req, res);
    const { quantity, sub_total, total } = req.body;
    const { id } = req.params;
    try {
      const {product} = await DetailSale.findById(id).select("product");
      //obtiene el stock del producto
      const {stock} = await Product.findOne({
        _id: product,
      }).select("stock");
      //verifica si existe suficiente stock
    const enough = stock >= quantity ? true : false;
    if (!enough) {
      return res.status(400).json({
        name: "Stock insuficiente",
        message: "No hay suficiente stock para realizar la venta",
      });
    }
      //actualiza el detalle de la venta
      const response = await DetailSale.findByIdAndUpdate(id, {
        quantity,
        sub_total,
        total,
      });
      //actualiza el total de la venta
      await Sale.findByIdAndUpdate(response.sale, {
        $inc: { total: (total - response.total).toFixed(2) },
      });
      await Product.findByIdAndUpdate(response.product, {
        $inc: { stock: response.quantity - quantity },
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

route.delete("/:id", async (req, res) => {
  try {
    const response = await DetailSale.findByIdAndDelete(req.params.id);
    await Sale.findByIdAndUpdate(response.sale, {
      $pull: { detail_sale: response._id },
      $inc: { total: -response.total },
    });
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({
      name: error.name,
      message: error.message,
    });
  }
});

module.exports = route;
