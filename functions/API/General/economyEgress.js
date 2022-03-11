const express = require("express");
const mongoose = require("mongoose");
const route = express.Router();
const InventoryEntry = require("../../db/Models/Inventory/InventoryEntry");
const Sales = require("../../db/Models/Inventory/Sale");
const Salary = require("../../db/Models/Control/Salary");
const { body } = require("express-validator");
const { graphic } = require("../../scripts/graphic");
const { checkDates } = require("../../scripts/dates");
const { total } = require("../../scripts/total");
const {
  getDataLastThreeMonths,
  verifyDataForPercentage,
  getDataCurrentMonthEgress,
  getDataRangeEgress,
  maxAndMin,
} = require("../../scripts/statistics");
const val = mongoose.Types.ObjectId("61dc6d180dea196d5fdf0bf4");

route.get("/", async (req, res) => {
  try {
    let inventoryEntries, salaries;
    const filteredQuery = req.query.startDate ? true : false;
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
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
            total: { $sum: "$total" },
          },
        },
        {
          $sort: { _id: 1 },
        },
      ]);
      // Obtener salarios con el rango de fecha dado
      salaries = await Salary.aggregate([
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
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
            total: { $sum: "$total" },
          },
        },
        {
          $sort: { _id: 1 },
        },
      ]);
      // Obtener los movimientos extra
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
      // Obtener las entradas de insumos y formatearlo
      inventoryEntries = await InventoryEntry.aggregate([
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
      // Obtener los salarios
      salaries = await Salary.aggregate([
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
      currentMonth = getDataCurrentMonthEgress(
        inventoryEntries,
        salaries,
        extraMoves
      );
    } else {
      // Obtiene los datos del rango de fecha dado
      currentMonth = getDataRangeEgress(inventoryEntries, extraMoves);
    }
    // Graficar datos
    const inventoryEntriesGraphic = graphic(inventoryEntries);
    const salariesGraphic = graphic(salaries);
    const extraMovesGraphic = graphic(extraMoves);

    // Verificar que son arrays
    if (!Array.isArray(inventoryEntries)) {
      const pivot = sales;
      sales = [];
      sales.push(pivot);
    }
    if (!Array.isArray(salaries)) {
      const pivot = salaries;
      salaries = [];
      salaries.push(pivot);
    }
    if (!Array.isArray(extraMoves)) {
      const pivot = extraMoves;
      extraMoves = [];
      extraMoves.push(pivot);
    }

    // Obtener los salarios y formatearlo

    // Obtener totales
    const totalInventoryEntries = parseFloat(total(inventoryEntries));
    const totalExtraMoves = parseFloat(total(extraMoves));
    const totalSalaries = parseFloat(total(salaries));

    // Obtener total general
    let totalGeneral = totalInventoryEntries + totalSalaries + totalExtraMoves;
    const totalGeneralFormat = totalGeneral.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
    });

    // Asignar fecha de inicio y fin
    const inventoryEntriesDates = checkDates(
      req.query.startDate,
      req.query.endDate,
      inventoryEntries
    );
    const extraMovesDates = checkDates(
      req.query.startDate,
      req.query.endDate,
      extraMoves
    );
    const salariesDates = checkDates(
      req.query.startDate,
      req.query.endDate,
      salaries
    );
    // Obtener datos estadisticos
    const statisticsThreeMonths = getDataLastThreeMonths(
      inventoryEntries.concat(extraMoves.concat(salaries))
    );

    // Obtener maximos y minimos
    const maxAndMinInventoryEntries = maxAndMin(inventoryEntries);
    const maxAndMinExtraMoves = maxAndMin(extraMoves);
    const maxAndMinSalaries = maxAndMin(salaries);
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
        statisticsEgressThreeMonths: statisticsThreeMonths,
        percentageIncDec,
      },
      inventoryEntries: {
        graphic: inventoryEntriesGraphic,
        total: totalInventoryEntries,
        max: maxAndMinInventoryEntries.max._id,
        min: maxAndMinInventoryEntries.min._id,
        startDate: inventoryEntriesDates.startDate,
        endDate: inventoryEntriesDates.endDate,
        startDateFormat: inventoryEntriesDates.startDateFormat,
        endDateFormat: inventoryEntriesDates.endDateFormat,
        filtered: inventoryEntriesDates.filtered,
      },
      salaries: {
        graphic: salariesGraphic,
        total: totalSalaries,
        max: maxAndMinSalaries.max._id,
        min: maxAndMinSalaries.min._id,
        startDate: salariesDates.startDate,
        endDate: salariesDates.endDate,
        startDateFormat: salariesDates.startDateFormat,
        endDateFormat: salariesDates.endDateFormat,
        filtered: salariesDates.filtered,
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
