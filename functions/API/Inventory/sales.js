const express = require("express");
const route = express.Router();
const { body, validationResult, param } = require("express-validator");

const { errors } = require("../../middleware/errors");
const Sale = require("../../db/Models/Inventory/Sale");
const DetailSale = require("../../db/Models/Inventory/DetailSale");
const Production = require("../../db/Models/Inventory/Production");
const { log } = require("console");

route.get("/", async (req, res) => {
  try {
    // Las que tengan status true
    const sale = await Sale.find({ status: true })
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

// Obtener todas las ventas sin restricciones
route.get("/all", async (req, res) => {
  try {
    // Las que tengan status true
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

// Obtener venta especifica
route.get("/unique/:id", async (req, res) => {
  try {
    // Las que tengan status true
    const sale = await Sale.findById(req.params.id).populate({
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
      status: true,
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

// obtener las ventas entre un rango de fechas sin restricciones
route.get("/:startDate/:endDate/all", async (req, res) => {
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
  body("date").isDate().withMessage("Fecha no es valida"),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
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
    if (sale.detail_sale.length > 0) {
      for (let i = 0; i < sale.detail_sale.length; i++) {
        const detailSale = await DetailSale.findById(sale.detail_sale[i]);
        const product = await Product.findById(detailSale.product);
        await Product.findByIdAndUpdate(product._id, {
          $inc: { stock: detailSale.quantity },
        });
        await Production.findByIdAndUpdate(detailSale.production, {
          $pull: { detail_sales: detailSale._id },
        });
      }
    }
    //eliminar cada detail_sale
    /*if (sale.detail_sale.length > 0) {
      for (let i = 0; i < sale.detail_sale.length; i++) {
        await DetailSale.findByIdAndDelete(sale.detail_sale[i]);
      }
    }*/

    // Verifica si existe detalle de venta para eliminar la venta o solo ponerle status false
    if (sale.detail_sale.length > 0) {
      const response = await Sale.findByIdAndUpdate(req.params.id, {
        status: false,
      });
      return res.status(200).json(response);
    } else {
      const response = await Sale.findByIdAndDelete(req.params.id);
      return res.status(200).json(response);
    }
  } catch (error) {
    return res.status(500).json({
      name: error.name,
      message: error.message,
    });
  }
});

module.exports = route;
