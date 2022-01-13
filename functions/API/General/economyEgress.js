const express = require("express");
const route = express.Router();
const InventoryEntry = require("../../db/Models/Inventory/InventoryEntry");
const Sales = require("../../db/Models/Inventory/Sale");
const { body } = require("express-validator");

route.get("/", async (req, res) => {
  try {
    // Group InventoryEntries by date
    const inventoryEntries = await InventoryEntry.aggregate([
      {
        $group: {
          _id: "$date",
          total: { $sum: "$total" },
        },
      },
    ]);
    let graphicFormat = [];
    inventoryEntries.forEach((element) => {
      graphicFormat.push([element._id, element.total]);
    });

    res.status(200).json(graphicFormat);
  } catch (error) {
    res.status(500).json({
      name: error.name,
      message: error.message,
    });
  }
});

module.exports = route;
