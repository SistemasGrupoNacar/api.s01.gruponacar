const express = require("express");
const route = express.Router();
const { body, param } = require("express-validator");
const { errors } = require("../../middleware/errors");
const Sale = require("../../db/Models/Inventory/Sale");
const Production = require("../../db/Models/Inventory/Production");

route.get("/", async (req, res) => {
  try {
    const sale = await Sale.find({})
      .sort({ _id: 1 })
      .populate({
        path: "detail_sale",
        populate: { path: "product", select: "name" },
        select: "quantity sub_total total production",
      });
    return res.status(200).json(sale);
  } catch (error) {
    return res.status(500).json({
      name: error.name,
      message: error.message,
    });
  }
});

// obtener las ventas entre un rango de fechas
route.get("/:startDate/:endDate", async (req, res) => {
  try {
    const { startDate, endDate } = req.params;
    const sale = await Sale.find({
      date: {
        $gte: startDate,
        $lte: endDate,
      },
    })
      .sort({ _id: 1 })
      .populate({
        path: "detail_sale",
        populate: { path: "product", select: "name" },
        select: "quantity sub_total total production",
      });
    //count total in sales
    const total = sale.reduce((acc, cur) => {
      return acc + cur.total;
    }, 0);

    return res.status(200).json({
      data: sale,
      total,
      startDate,
      endDate,
    });
  } catch (error) {
    return res.status(500).json({
      name: error.name,
      message: error.message,
    });
  }
});

route.post(
  "/",
  body("date").notEmpty().withMessage("Fecha es requerida"),
  body("date").isISO8601().withMessage("Fecha no es válida"),
  async (req, res) => {
    errors.validationErrorResponse(req, res);
    const { date, description } = req.body;

    const sale = new Sale({
      description,
      date,
      status: true,
    });
    try {
      const response = await sale.save();

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
  "/:id/:status",
  param("status").isBoolean().withMessage("Estado no es válido"),
  async (req, res) => {
    errors.validationErrorResponse(req, res);
    const { id, status } = req.params;
    try {
      const response = await Sale.findByIdAndUpdate(
        id,
        { status },
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

route.delete("/:id", async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id);

    // eliminar cada detail_sale de production y aumentar el stock
    const detail_sale = sale.detail_sale;
    detail_sale.forEach(async (element) => {
      const production = element.production;
      // Quitar el id de detail_sale del array
      await Production.findByIdAndUpdate(
        production,
        { $pull: { detail_sale: element._id } },
        { new: true }
      );
    });

    // Aumentar el stock del producto que se vendio en cada detail_sale

    sale.detail_sale.forEach(async (element) => {
      const detailSale = await DetailSale.findById(element._id);
      const product = await Product.findById(detailSale.product);
      await Product.findByIdAndUpdate(
        product._id,
        { $inc: { stock: detailSale.quantity } },
        { new: true }
      );
    });

    //eliminar cada detail_sale
    if (sale.detail_sale.length > 0) {
      for (let i = 0; i < sale.detail_sale.length; i++) {
        await DetailSale.findByIdAndDelete(sale.detail_sale[i]);
      }
    }

    const response = await Sale.findByIdAndDelete(req.params.id);

    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({
      name: error.name,
      message: error.message,
    });
  }
});

module.exports = route;
