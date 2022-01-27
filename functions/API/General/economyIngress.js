const express = require("express");
const mongoose = require("mongoose");
const route = express.Router();
const Sales = require("../../db/Models/Inventory/Sale");
const { graphic } = require("../../scripts/graphic");
const { checkDates } = require("../../scripts/dates");
const { total } = require("../../scripts/total");
const {
  getDataLastThreeMonths,
  verifyDataForPercentage,
} = require("../../scripts/statistics");
const ExtraMove = require("../../db/Models/General/ExtraMove");
// Se declara el valor del tipo de movimiento para ingresos
var val = mongoose.Types.ObjectId("61dc6d250dea196d5fdf0bf7");
route.get("/", async (req, res) => {
  try {
    let sales;
    let extraMoves;
    // Verificando si consulta rangos de fechas
    if (req.query.startDate && req.query.endDate) {
      // Obtener las ventas y formatearlo con el rango de fecha dado
      sales = await Sales.aggregate([
        {
          $match: {
            date: {
              $gte: new Date(req.query.startDate),
              $lte: new Date(req.query.endDate),
            },
          },
        },
        {
          $group: {
            _id: "$date",
            total: { $sum: "$total" },
          },
        },
        {
          $sort: { _id: 1 },
        },
      ]);
      extraMoves = await ExtraMove.aggregate([
        {
          $match: {
            date: {
              $gte: new Date(req.query.startDate),
              $lte: new Date(req.query.endDate),
            },
            type_move: val,
          },
        },
        {
          $group: {
            _id: "$date",
            total: { $sum: "$total" },
          },
        },
        {
          $sort: { _id: 1 },
        },
      ]);
    } else {
      // Obtener las ventas y formatearlo
      sales = await Sales.aggregate([
        {
          $group: {
            _id: "$date",
            total: { $sum: "$total" },
          },
        },
        {
          $sort: { _id: 1 },
        },
      ]);
      // Obtener extraMoves donde la fecha sea igual a la fecha de venta y sea de tipo ingreso
      extraMoves = await ExtraMove.aggregate([
        {
          $match: {
            type_move: val,
          },
        },
        {
          $group: {
            _id: "$date",
            total: { $sum: "$total" },
          },
        },
        {
          $sort: { _id: 1 },
        },
      ]);
    }
    // Graficar los datos
    const salesGraphic = graphic(sales);
    const extraMovesGraphic = graphic(extraMoves);

    // Verificar que son arrays
    if (!Array.isArray(sales)) {
      const pivot = sales;
      sales = [];
      sales.push(pivot);
    }
    if (!Array.isArray(extraMoves)) {
      const pivot = extraMoves;
      extraMoves = [];
      extraMoves.push(pivot);
    }

    // Obtener totales
    const totalSales = parseFloat(total(sales));
    const totalExtraMoves = parseFloat(total(extraMoves));

    // Obtener total general
    let totalGeneral = totalSales + totalExtraMoves;

    // Asignar fecha de inicio y fin
    const salesDates = checkDates(
      req.query.startDate,
      req.query.endDate,
      sales
    );

    const extraMovesDates = checkDates(
      req.query.startDate,
      req.query.endDate,
      extraMoves
    );

    // Obtener datos estadísticos
    const statisticsThreeMonths = getDataLastThreeMonths(sales);

    // Obtiene el porcentaje de incremento o decremento
    const percentageIncDec = verifyDataForPercentage(statisticsThreeMonths);
    const response = {
      general: {
        total: totalGeneral,
        statisticsSales: statisticsThreeMonths,
        percentageIncDec,
      },
      sales: {
        graphic: salesGraphic,
        total: totalSales,
        startDate: salesDates.startDate,
        endDate: salesDates.endDate,
        filtered: salesDates.filtered,
      },
      extraMoves: {
        graphic: extraMovesGraphic,
        total: totalExtraMoves,
        startDate: extraMovesDates.startDate,
        endDate: extraMovesDates.endDate,
        filtered: extraMovesDates.filtered,
      },
    };
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({
      name: error.name,
      message: error.message,
    });
  }
});

module.exports = route;
