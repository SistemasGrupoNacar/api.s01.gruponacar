const mongoose = require("mongoose");

const productionCost = new mongoose.Schema(
  {
    production: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Production",
      required: true,
    },
    inventory_product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InventoryProduct",
      required: true,
    },
    description: {
      type: String,
    },
    quantity: {
      type: Number,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    total: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

//eliminacion de los campos que no queremos que se muestren en la respuesta
productionCost.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.__v;
  delete obj.createdAt;
  delete obj.updatedAt;

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

module.exports = ProductionCost = mongoose.model(
  "ProductionCost",
  productionCost
);
