const mongoose = require("mongoose");

const production_product = new mongoose.Schema(
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
    status: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "status",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = ProductionProduct = mongoose.model(
  "production_product",
  production_product
);
