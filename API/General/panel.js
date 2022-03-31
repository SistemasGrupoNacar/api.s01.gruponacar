const express = require("express");
const mongoose = require("mongoose");
const route = express.Router();
const Sales = require("../../db/Models/Inventory/Sale");
const Salaries = require("../../db/Models/Control/Salary");
const InventoryEntry = require("../../db/Models/Inventory/InventoryEntry");
const ExtraMove = require("../../db/Models/General/ExtraMove");
const TypesMove = require("../../db/Models/General/TypeMove");
const InventoryProduct = require("../../db/Models/Inventory/InventoryProduct");
const URL_SERVER = "https://us-central1-s01-gruponacar.cloudfunctions.net/api";
const totalFormat = require("../../scripts/total");
const statistics = require("../../scripts/statistics");

let { authenticateToken } = require("../../middleware/auth");

route.get("/", authenticateToken, async (req, res) => {
  let egressMonth = {};
  let ingressMonth = {};

  const responseEgress = await getEgress();
  const responseIngress = await getIngress();

  // Obtiene los datos de egresos e ingresos
  egressMonth = responseEgress;
  ingressMonth = responseIngress;
  //Obtener los productos que tienen bajo stock
  const productsWithLessStock = await getProductsWithLessStock();

  // Obtener los datos de ventas que estan pendientes
  const salesPending = await Sales.find({ pending: true }, { _id: 1, date: 1 });

  const response = {
    productsWithLessStock,
    salesPending,
    graphic: [
      {
        name: "Ingresos",
        data: ingressMonth,
      },
      {
        name: "Egresos",
        data: egressMonth,
      },
    ],
  };
  res.status(200).json(response);
});

const getProductsWithLessStock = async () => {
  // Obtener los productos que su stock sea menor o igual que el min_stock
  const products = await InventoryProduct.find({
    availability: true,
  });
  const productsWithLessStock = [];
  products.forEach((element) => {
    if (element.stock <= element.min_stock) {
      productsWithLessStock.push(element);
    }
  });
  if (productsWithLessStock.length <= 0) {
    return null;
  } else {
    return productsWithLessStock;
  }
};

const getEgress = async () => {
  // Obtener el ObjectId de egresos
  const { _id } = await TypesMove.findOne({ title: "egress" }).select({
    _id: 1,
  });
  // Obtener las entradas de insumos y formatearlo
  const inventoryEntries = await InventoryEntry.aggregate([
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
  const salaries = await Salaries.aggregate([
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

  // Obtener las entradas extras
  const extraMoves = await ExtraMove.aggregate([
    {
      $match: {
        type_move: _id,
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
  const response = await calcTotalByMonth(
    inventoryEntries.concat(salaries.concat(extraMoves))
  );
  return response;
};

const getIngress = async () => {
  // Obtener el ObjectId de ingresos
  const { _id } = await TypesMove.findOne({ title: "ingress" }).select({
    _id: 1,
  });
  // Obtener las ventas y formatearlo
  const sales = await Sales.aggregate([
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
  const extraMoves = await ExtraMove.aggregate([
    {
      $match: {
        type_move: _id,
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
  const response = await calcTotalByMonth(sales.concat(extraMoves));
  return response;
};

const calcTotalByMonth = (data) => {
  let dataYear = {};
  let todayMonth = new Date().getMonth();
  let todayYear = new Date().getFullYear();
  todayMonth = todayMonth + 1;
  todayYear = todayYear - 1;

  let counter = 12;
  while (counter > 0) {
    if (todayMonth < 0) {
      todayMonth += 12;
    }
    if (todayMonth > 11) {
      todayYear += 1;
      todayMonth -= 12;
    }
    const response = getObjectTotalMonth(data, todayMonth, todayYear);
    dataYear[response.month] = response.total;
    todayMonth++;
    counter--;
  }
  return dataYear;
};

const getObjectTotalMonth = (data, monthGet, yearGet) => {
  let total = 0;
  data.forEach((element) => {
    const month = new Date(element._id).getMonth();
    const year = new Date(element._id).getFullYear();
    if (month === monthGet && year === yearGet) {
      total += element.total;
    }
  });
  total = totalFormat.round(total);
  const monthName = statistics.getMonthName(monthGet + 1);
  return {
    month: monthName + "-" + yearGet.toString().slice(2, 4),
    total,
  };
};

module.exports = route;
