const mongoose = require("mongoose");

const inventoryProduct = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    stock: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
    },
    min_stock: {
      type: Number,
      required: true,
    },
    cost: {
      type: Number,
      required: true,
    },
    availability: {
      type: Boolean,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// eliminacion de los campos createdAt y updatedAt y __v
inventoryProduct.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.createdAt;
  delete obj.updatedAt;
  delete obj.__v;
  // cambiar estado true o false en availability
  obj.availability_text = obj.availability ? "Disponible" : "No disponible";

  // Convertir el total a dolar
  obj.cost_format = obj.cost.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
  return obj;
};

module.exports = InventoryProduct = mongoose.model(
  "InventoryProduct",
  inventoryProduct
);
