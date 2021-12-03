const mongoose = require("mongoose");

const productionCost = new mongoose.Schema(
  {
    production: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Production",
      required: true,
    },
    production_product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProductionProduct",
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
    unit_price: {
      type: Number,
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
  return obj;
};

module.exports = ProductionCost = mongoose.model(
  "ProductionCost",
  productionCost
);
