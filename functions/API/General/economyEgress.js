const express = require("express");
const route = express.Router();
const InventoryEntry = require("../../db/Models/Inventory/InventoryEntry");
const Sales = require("../../db/Models/Inventory/Sale");
const { body } = require("express-validator");

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

    let graphic = graphicFunction(inventoryEntries);

    // Obtener los salarios y formatearlo

    // Obtener los gastos extras y formatearlo

    // Obtener datos informativos
    const totalEgress = infoFunction(inventoryEntries);
    // Asignar fecha de inicio y fin
    const { startDate, endDate } = checkDates(
      req.query.startDate,
      req.query.endDate,
      inventoryEntries
    );

    console.log(startDate, endDate);
    const response = {
      graphic,
      totalEgress,
      startDate,
      endDate,
    };

    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({
      name: error.name,
      message: error.message,
    });
  }
});

// Recoge y devuelve informacion
const infoFunction = (inventoryEntries) => {
  return inventoryEntries
    .reduce((acc, cur) => {
      return acc + cur.total;
    }, 0)
    .toFixed(2);
};

// Funcion que permite acomodar los datos para la grafica del frontend
const graphicFunction = (data) => {
  let graphic = [];
  data.forEach((element) => {
    graphic.push([element._id, element.total]);
  });
  return graphic;
};

// Verificar si existen fechas de filtro o no
const checkDates = (startDateI, endDateI, data) => {
  if (typeof startDateI === "undefined" || typeof endDateI === "undefined") {
    const { startDate, endDate } = getDates(data);
    return { startDate, endDate };
  } else {
    const startDate = startDateI;
    const endDate = endDateI;
    return { startDate, endDate };
  }
};

// Obtener la primer y ultima fecha
const getDates = (inventoryEntries) => {
  let startDate = inventoryEntries[0]._id;
  let endDate = inventoryEntries[inventoryEntries.length - 1]._id;
  return { startDate, endDate };
};
module.exports = route;
