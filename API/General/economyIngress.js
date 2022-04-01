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
  getDataCurrentMonthIngress,
  getDataRangeIngress,
  maxAndMin,
} = require("../../scripts/statistics");
let { authenticateToken } = require("../../middleware/auth");
const ExtraMove = require("../../db/Models/General/ExtraMove");
// Se declara el valor del tipo de movimiento para ingresos
var val = mongoose.Types.ObjectId("61dc6d250dea196d5fdf0bf7");
route.get("/", authenticateToken, async (req, res) => {
  try {
    let sales;
    let extraMoves;
    const filteredQuery = req.query.startDate ? true : false;
    // Verificando si consulta rangos de fechas
    if (req.query.startDate && req.query.endDate) {
      console.log(req.query.startDate);
      // Obtener las ventas y formatearlo con el rango de fecha dado
      sales = await Sales.aggregate([
        {
          $match: {
            date: {
              $gte: new Date(req.query.startDate),
              $lte: new Date(req.query.endDate),
            },
            // Verificar que este con estado true
            status: true,
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
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
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
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
          $match: {
            // Verificar que este con estado true
            status: true,
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
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
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
            total: { $sum: "$total" },
          },
        },
        {
          $sort: { _id: 1 },
        },
      ]);
    }
    let currentMonth;
    if (!filteredQuery) {
      // Obtiene los datos del mes actual
      currentMonth = getDataCurrentMonthIngress(sales, extraMoves);
    } else {
      currentMonth = getDataRangeIngress(sales, extraMoves);
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
    const totalGeneralFormat = totalGeneral.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
    });
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
    const statisticsThreeMonths = getDataLastThreeMonths(
      sales.concat(extraMoves)
    );

    // Obtener dias de maximo y minimo
    const maxAndMinSales = maxAndMin(sales);
    const maxAndMinExtraMoves = maxAndMin(extraMoves);
    // Obtiene el porcentaje de incremento o decremento
    const percentageIncDec = verifyDataForPercentage(statisticsThreeMonths);

    const response = {
      general: {
        totalCurrentMonth: currentMonth.total,
        totalCurrentMonthFormat: currentMonth.total_format,
        extraPercentage: currentMonth.extra_percentage,
        extraPercentageFormat: currentMonth.extra_percentage_format,
        totalAll: totalGeneral,
        totalAllFormat: totalGeneralFormat,
        statisticsIngressThreeMonths: statisticsThreeMonths,
        percentageIncDec,
      },
      sales: {
        graphic: salesGraphic,
        total: totalSales,
        max: maxAndMinSales.max._id,
        min: maxAndMinSales.min._id,
        startDate: salesDates.startDate,
        endDate: salesDates.endDate,
        startDateFormat: salesDates.startDateFormat,
        endDateFormat: salesDates.endDateFormat,
        filtered: salesDates.filtered,
      },
      extraMoves: {
        graphic: extraMovesGraphic,
        total: totalExtraMoves,
        max: maxAndMinExtraMoves.max._id,
        min: maxAndMinExtraMoves.min._id,
        startDate: extraMovesDates.startDate,
        endDate: extraMovesDates.endDate,
        startDateFormat: extraMovesDates.startDateFormat,
        endDateFormat: extraMovesDates.endDateFormat,
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