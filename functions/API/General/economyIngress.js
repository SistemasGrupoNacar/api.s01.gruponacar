const express = require("express");
const route = express.Router();
const Sales = require("../../db/Models/Inventory/Sale");
const { graphic } = require("../../scripts/graphic");
const { checkDates } = require("../../scripts/dates");
const { total } = require("../../scripts/total");
const { getDataLastThreeMonths } = require("../../scripts/statistics");

route.get("/", async (req, res) => {
  try {
    let sales;
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
    }
    // Graficar los datos
    const salesGraphic = graphic(sales);

    // Obtener los movimientos extras y formatearlo

    // Obtener totales
    const totalSales = total(sales);

    // Redondear a dos decimales
    const totalGeneral = Math.round(totalSales * 100) / 100;

    // Asignar fecha de inicio y fin
    const salesDates = checkDates(
      req.query.startDate,
      req.query.endDate,
      sales
    );

    // Obtener datos estadísticos
    const statisticsThreeMonths = getDataLastThreeMonths(sales);

    const response = {
      general: {
        total: totalGeneral,
        statisticsSales: statisticsThreeMonths,
      },
      sales: {
        graphic: salesGraphic,
        total: totalSales,
        startDate: salesDates.startDate,
        endDate: salesDates.endDate,
        filtered: salesDates.filtered,
      },
      extraMoves: {},
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
