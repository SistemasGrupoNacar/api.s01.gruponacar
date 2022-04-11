const express = require("express");
const route = express.Router();
const { body, validationResult, param } = require("express-validator");

const { errors } = require("../../middleware/errors");
const Sale = require("../../db/Models/Inventory/Sale");
const DetailSale = require("../../db/Models/Inventory/DetailSale");
const Production = require("../../db/Models/Inventory/Production");
const User = require("../../db/Models/General/User");
const { log } = require("console");
let { authenticateToken } = require("../../middleware/auth");

route.get("/", authenticateToken, async (req, res) => {
  try {
    let sale;
    // Verifica si no tiene limit
    if (req.query.limit) {
      let limit = parseInt(req.query.limit);
      // Las que tengan status true
      sale = await Sale.find({ status: true })
        .sort({ date: -1 })
        .populate({
          path: "detail_sale",
          populate: { path: "product", select: "name" },
          select: "quantity sub_total total ",
        })
        .populate({
          path: "created_by",
          select: "username",
        })
        .limit(limit);
    } else {
      sale = await Sale.find({ status: true })
        .sort({ date: -1 })
        .populate({
          path: "detail_sale",
          populate: { path: "product", select: "name" },
          select: "quantity sub_total total ",
        })
        .populate({
          path: "created_by",
          select: "username",
        });
    }

    return res.status(200).json(sale);
  } catch (error) {
    return res.status(500).json({
      name: error.name,
      message: error.message,
    });
  }
});

// Obtener las ventas de hoy
route.get("/today", authenticateToken, async (req, res) => {
  try {
    const today = new Date();
    const todayNow = today.toISOString();
    const todayZeroHours = new Date(today.setHours(0, 0, 0, 0)).toISOString();
    const sales = await Sale.find({
      date: {
        $lte: todayNow,
        $gte: todayZeroHours,
      },
    })
      .populate({
        path: "detail_sale",
        populate: { path: "product", select: "name" },
        select: "quantity sub_total total ",
      })
      .populate({
        path: "created_by",
        select: "username",
      })
      .sort({ date: -1 });
    return res.status(200).json(sales);
  } catch (error) {
    return res.status(500).json({
      name: error.name,
      message: error.message,
    });
  }
});

// Obtener las ventas pendientes
route.get("/pending", authenticateToken, async (req, res) => {
  try {
    const sale = await Sale.find({ pending: true }).sort({ date: -1 });
    return res.status(200).json(sale);
  } catch (error) {
    return res.status(500).json({
      name: error.name,
      message: error.message,
    });
  }
});

// Obtener todas las ventas sin restricciones
route.get("/all", authenticateToken, async (req, res) => {
  try {
    let sale;
    // Verifica si no tiene limit
    if (req.query.limit) {
      let limit = parseInt(req.query.limit);
      // Las que tengan status true
      sale = await Sale.find({})
        .sort({ date: -1 })
        .populate({
          path: "detail_sale",
          populate: { path: "product", select: "name" },
          select: "quantity sub_total total ",
        })
        .populate({
          path: "created_by",
          select: "username",
        })
        .limit(limit);
    } else {
      // Las que tengan status true
      sale = await Sale.find({})
        .sort({ date: -1 })
        .populate({
          path: "detail_sale",
          populate: { path: "product", select: "name" },
          select: "quantity sub_total total ",
        })
        .populate({
          path: "created_by",
          select: "username",
        });
    }

    return res.status(200).json(sale);
  } catch (error) {
    return res.status(500).json({
      name: error.name,
      message: error.message,
    });
  }
});

// Obtener venta especifica
route.get("/unique/:id", authenticateToken, async (req, res) => {
  try {
    // Las que tengan status true
    const sale = await Sale.findById(req.params.id).populate({
      path: "detail_sale",
      populate: { path: "product", select: "name" },
      select: "quantity sub_total total  sub_total_format total_format",
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
route.get("/:startDate/:endDate", authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate } = req.params;
    const sale = await Sale.find({
      date: {
        $gte: startDate,
        $lte: endDate,
      },
      status: true,
    })
      .sort({ date: -1 })
      .populate({
        path: "detail_sale",
        populate: { path: "product", select: "name" },
        select: "quantity sub_total total ",
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
route.get("/:startDate/:endDate/all", authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate } = req.params;
    const sale = await Sale.find({
      date: {
        $gte: startDate,
        $lte: endDate,
      },
    })
      .sort({ date: -1 })
      .populate({
        path: "detail_sale",
        populate: { path: "product", select: "name" },
        select: "quantity sub_total total ",
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
  authenticateToken,
  body("date").notEmpty().withMessage("Fecha es requerida"),
  body("date").isISO8601().withMessage("Fecha no valida"),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    const { date, description } = req.body;
    const { _id } = req.user;
    const sale = new Sale({
      description,
      date,
      status: true,
      created_by: _id,
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

// Cambiar el estado pendiente de una venta
route.put(
  "/pending/:id/:status",
  param("status").isBoolean().withMessage("Estado no es válido"),
  authenticateToken,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json(errors);
    }
    try {
      const { id, status } = req.params;
      const response = await Sale.findByIdAndUpdate(
        id,
        { pending: status },
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

route.put(
  "/:id/:status",
  authenticateToken,
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

route.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id);

    //  aumentar el stock
    if (sale.detail_sale.length > 0) {
      for (let i = 0; i < sale.detail_sale.length; i++) {
        const detailSale = await DetailSale.findById(sale.detail_sale[i]);
        const product = await Product.findById(detailSale.product);
        await Product.findByIdAndUpdate(product._id, {
          $inc: { stock: detailSale.quantity },
        });
      }
    }
    

    // Verifica si existe detalle de venta para eliminar la venta o solo ponerle status false
    if (sale.detail_sale.length > 0) {
      const response = await Sale.findByIdAndUpdate(req.params.id, {
        status: false,
        pending: false,
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
