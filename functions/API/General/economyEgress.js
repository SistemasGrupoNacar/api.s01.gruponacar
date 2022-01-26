const express = require("express");
const route = express.Router();
const InventoryEntry = require("../../db/Models/Inventory/InventoryEntry");
const Sales = require("../../db/Models/Inventory/Sale");
const { body } = require("express-validator");
const { graphic } = require("../../scripts/graphic");
const { checkDates } = require("../../scripts/dates");
const { total } = require("../../scripts/total");
const {
  getDataLastThreeMonths,
  verifyDataForPercentage,
} = require("../../scripts/statistics");
const { log } = require("console");

route.get("/", async (req, res) => {
  try {
    let inventoryEntries;

    // Verificando si consulta por rango de fechas
    if (req.query.startDate && req.query.endDate) {
      // Obtener las entradas de insumos y formatearlo con el rango de fecha dado
      inventoryEntries = await InventoryEntry.aggregate([
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
      // Obtener las entradas de insumos y formatearlo
      inventoryEntries = await InventoryEntry.aggregate([
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

    // Graficar datos
    const inventoryEntriesGraphic = graphic(inventoryEntries);

    // Obtener los salarios y formatearlo

    // Obtener los gastos extras y formatearlo

    // Obtener totales
    const totalInventoryProducts = total(inventoryEntries);
    // Redondear a dos decimales
    const totalGeneral = Math.round(totalInventoryProducts * 100) / 100;

    // Asignar fecha de inicio y fin
    const inventoryProductsDates = checkDates(
      req.query.startDate,
      req.query.endDate,
      inventoryEntries
    );
    /*const salariesDates = checkDates(
      req.query.startDate,
      req.query.endDate,
      salaries
    );*/

    // Obtener datos estadisticos
    const statisticsThreeMonths = getDataLastThreeMonths(inventoryEntries);
    // Obtiene el porcentaje de incremento o decremento
    const percentageIncDec = verifyDataForPercentage(statisticsThreeMonths);
    const response = {
      general: {
        total: totalGeneral,
        statisticsInventoryEntries: statisticsThreeMonths,
        percentageIncDec,
      },
      inventoryProducts: {
        graphic: inventoryEntriesGraphic,
        total: totalInventoryProducts,
        startDate: inventoryProductsDates.startDate,
        endDate: inventoryProductsDates.endDate,
        filtered: inventoryProductsDates.filtered,
      },
      salaries: {},
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
