const mongoose = require("mongoose");

const inventoryEntry = new mongoose.Schema({
  inventory_product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "InventoryProduct",
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  unit_price: {
    type: Number,
    required: true,
  },
  total: {
    type: Number,
    required: true,
  },
});

module.exports = InventoryEntry = mongoose.model(
  "InventoryEntry",
  inventoryEntry
);
