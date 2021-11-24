const mongoose = require("mongoose");

const production_cost = new mongoose.Schema(
  {
    production: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "production",
      required: true,
    },
    production_product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "production_product",
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

module.exports = ProductionCost = mongoose.model(
  "production_cost",
  production_cost
);
