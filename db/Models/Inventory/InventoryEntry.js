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

inventoryEntry.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.__v;
  delete obj.createdAt;
  delete obj.updatedAt; 
  // Convertir el total a dolar
  obj.unit_price_format = obj.unit_price.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
  // Convertir el total a dolar
  obj.total_format = obj.total.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
  // Convertir fecha a local
  obj.date_format = new Date(obj.date).toLocaleString("es-ES", {
    timeZone: "America/El_Salvador",
    hour12: true,
  });

  return obj;
};

module.exports = InventoryEntry = mongoose.model(
  "InventoryEntry",
  inventoryEntry
);
